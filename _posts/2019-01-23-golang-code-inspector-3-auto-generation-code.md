---
author: baixiaoustc
comments: false
date: 2019-01-23 09:54:23+00:00
layout: post
slug: 2019-01-23-golang-code-inspector-3-auto-generation-code
title: golang深入源代码系列之三：自动生成代码
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}

这是系列博文的第三篇，第一篇在此：[golang深入源代码之一：AST的遍历](http://baixiaoustc.github.io/2019/01/14/2019-01-14-golang-code-inspector-1-all-case)，第二篇在此：[golang深入源代码系列之二：反向调用关系的生成](http://baixiaoustc.github.io/2019/01/17/2019-01-17-golang-code-inspector-2-reverse-call-graph/)。



# 问题描述

第一篇讲了怎么遍历一个项目的源代码，第二篇讲了怎么构建内部某个package的某个函数`package.XYZ()`的反向调用关系（一颗多叉树）。那么问题来了，如果我们想在`package.XYZ()`里面增加一些信息，该信息只能从最外层依次传递进来，中间可能经历若干个函数。手动写这个代码很烦躁，中间的函数都可能需要增加parameter，并传递给下一级。反向查找调用关系更是繁琐。本篇就来讲怎么自动生成这个代码。

## 一个例子

依然使用第二篇文章的例子，如下为测试项目的文件结构：

  --  /exmaple/test3.go

  --  /exmaple/test4.go
  
  --  /example/inner/itest1.go
  
我们希望所有调用`context.WithCancel`的地方能把上下文串联起来，效果如下：

{% highlight golang %}
func test4a(a string) {
	fmt.Println(a)
	context.WithCancel(nil)
}  
{% endhighlight %}

能自动变成

{% highlight golang %}
func test4a(ctx context.Context, a string) {
	fmt.Println(a)
	context.WithCancel(ctx)
}  
{% endhighlight %}

并且在最外层的`main.main()`里生成原始Context：`ctx := context.Background()`。中间有调用关系的函数都传递这个ctx。当然这个例子不符合实际场景，只用来说明这个思路。

# 自动生成代码

高光时刻到了，程序员终于可以让机器自己写代码了。当然golang还另有方法从模版来自动生成代码，此处不表。

首先根据这个例子，我们把涉及到的函数分为三类：例如`test4a`这种的「关键函数」，中间的「传递函数」，`main.main()`这种的「源头函数」。类似第一篇，定义了这样的结构：

{% highlight golang %}
//主要用于将调用链里面的nil替换为ctx
//并判断填充父函数的行参context.Context
//并在源头函数生成Context的起点
type FixContext struct {
	Type       GenFuncType
	File       string
	Package    string
	LocalFunc  *ast.FuncDecl
	TargetFunc FuncDesc //希望自动修复的函数
	CalleeFunc FuncDesc //上述函数调用的下一级函数
}
{% endhighlight %}

## 「关键函数」

针对「关键函数」，要做两件事。一是把调用`context.WithCancel`的实参`nil`替换为`ctx`（实际是字符串类型）。二是在行参列表中第一处插入一个`ctx context.Context`（不要忘记逗号）。在找到「关键函数」后，用如下代码做第一件事：

{% highlight golang %}
//关键函数，函数体的调用关系处将实参nil改为ctx
func (f *FixContext) replaceNilToCtx(call *ast.CallExpr) bool {
	if len(call.Args) > 0 {
		//log.Printf("argu type:%T", call.Args[0])
		if argum, ok := call.Args[0].(*ast.Ident); ok {
			log.Printf("argu type:%T, %s, %v", argum.Name, argum.String(), argum.NamePos)
			if argum.Name == "nil" {
				location := fmt.Sprint(GFset.Position(argum.NamePos))
				log.Printf("here at %s", location)

				//把「nil」改为「ctx」
				call.Args[0].(*ast.Ident).Name = "ctx"
				log.Printf("函数[%s.%s]替换ctx成功", f.Package, f.LocalFunc.Name.Name)
				return true
			}
		}
	}

	return false
}
{% endhighlight %}

很简单，就是把AST中对应结构中的这个Args[0]的字面量替换了。如下代码做第二件事：

{% highlight golang %}
//函数行参插一个：ctx context.Context
func (f *FixContext) insertCtxInParam(fn *ast.FuncDecl) {
	if len(fn.Type.Params.List) > 0 {
		param0 := fn.Type.Params.List[0]
		log.Printf("本函数[%s.%s] param0: %+v, type:%+v", f.Package, fn.Name, param0, param0.Type)
		if param0.Names[0].Name == "ctx" {
			log.Printf("本函数[%s.%s] already have context in param", f.Package, fn.Name)
			return
		}
	}

	params := make([]*ast.Field, len(fn.Type.Params.List)+1)

	names := &ast.Ident{
		Name:    "ctx",
		Obj:     ast.NewObj(ast.Var, "ctx"),
		NamePos: fn.Body.Pos() + 1}
	types := &ast.Ident{
		Name:    "context.Context",
		NamePos: names.End() + 1}
	params[0] = &ast.Field{
		Names: []*ast.Ident{names},
		Type:  types}
	log.Printf("本函数[%s.%s] 构造param: %+v", f.Package, fn.Name, params[0])
	for i := 0; i < len(fn.Type.Params.List); i++ {
		params[i+1] = fn.Type.Params.List[i]
	}
	fn.Type.Params.List = params
}
{% endhighlight %}

其实就是把AST中的函数结构体的Type里面的Params中新插入一个`*ast.Field`结构。不用担心，最后逗号会自动补上。

## 「传递函数」

针对「传递函数」，一是在函数体的调用关系处实参插一个`ctx`，二也是在行参列表中第一处插入一个`ctx context.Context`。在找到「传递函数」后，用如下代码做第一件事：

{% highlight golang %}
//函数体的调用关系处实参插一个：ctx
func (f *FixContext) insertCtxInBody(call *ast.CallExpr) bool {
	if len(call.Args) > 0 {
		if argum, ok := call.Args[0].(*ast.Ident); ok {
			log.Printf("argu type:%T, %s, %v, %+v", argum.Name, argum.String(), argum.NamePos, argum.Obj)
			if argum.Name == "ctx" {
				log.Printf("函数[%s.%s] already have context in argument", f.Package, call.Fun)
				return false
			}
			//也有可能之前在传递过程中是nil
			if argum.Name == "nil" {
				//把「nil」改为「ctx」
				call.Args[0].(*ast.Ident).Name = "ctx"
				log.Printf("函数[%s.%s]替换ctx成功", f.Package, f.LocalFunc.Name.Name)
				return true
			}
		}
	}

	argums := make([]ast.Expr, len(call.Args)+1)

	name := ast.Ident{
		Name:    "ctx",
		Obj:     ast.NewObj(ast.Var, "ctx"),
		NamePos: call.Pos() + 1}
	argums[0] = &name
	log.Printf("函数[%s.%s] 构造argum: %+v", f.Package, f.LocalFunc.Name.Name, argums[0])

	for i := 0; i < len(call.Args); i++ {
		argums[i+1] = call.Args[i]
	}
	call.Args = argums

	return true
}
{% endhighlight %}

值得注意的是，如果源代码中以前就用`nil`来传递了Context，此处需要替换为`ctx`。

## 「源头函数」

针对「源头函数」，一也是在函数体的调用关系处实参插一个`ctx`，而是在函数体最初生成原始Context，代码如下：

{% highlight golang %}
//函数体写一行：ctx := context.Background()
func (f *FixContext) genSourceCtx(fn *ast.FuncDecl) {
	for i, stmt := range fn.Body.List {
		log.Printf("%d stmt:%+v", i, stmt)
		if assign, ok := stmt.(*ast.AssignStmt); ok {
			log.Printf("赋值语句开始:%T %s", assign, GFset.Position(assign.Pos()))

			for i, p := range assign.Lhs {
				log.Printf("赋值表达式%d:%s at line:%v", i, p, GFset.Position(p.Pos()))
				if fmt.Sprint(p) == "ctx" {
					log.Printf("本函数[%s.%s] already have context generated", f.Package, fn.Name)
					return
				}
			}
		}
	}

	bodies := make([]ast.Stmt, len(fn.Body.List)+1)

	lhs := ast.Ident{
		Name:    "ctx",
		Obj:     ast.NewObj(ast.Var, "ctx"),
		NamePos: fn.Body.Pos() + 1}

	x := ast.Ident{
		Name:    "context",
		Obj:     ast.NewObj(ast.Var, "context"),
		NamePos: fn.Body.Pos() + 1 + token.Pos(len("ctx := "))}
	sel := ast.Ident{
		Name:    "Background",
		Obj:     ast.NewObj(ast.Var, "Background"),
		NamePos: fn.Body.Pos() + 1 + token.Pos(len("ctx := context."))}
	call := ast.SelectorExpr{
		X:   &x,
		Sel: &sel}

	rhs := ast.CallExpr{
		Fun:    &call,
		Args:   []ast.Expr{},
		Lparen: fn.Body.Pos() + token.Pos(len("ctx := context.Background(")+1),
		Rparen: fn.Body.Pos() + token.Pos(len("ctx := context.Background()")+1)}

	assign := &ast.AssignStmt{
		Lhs:    []ast.Expr{&lhs},
		Rhs:    []ast.Expr{&rhs},
		TokPos: lhs.Pos() + 1,
		Tok:    token.DEFINE}

	bodies[0] = assign
	log.Printf("本函数[%s.%s] 构造stmt: %+v", f.Package, fn.Name, bodies[0])
	for i := 0; i < len(fn.Body.List); i++ {
		bodies[i+1] = fn.Body.List[i]
	}
	fn.Body.List = bodies
}
{% endhighlight %}

# 自动格式化

现在已经能自动生成相应的代码了，但是还需要自动import "context"，当package里面没有的时候。

## go fmt && goimports

当AST修改完以后，重新写回源文件并覆盖：

{% highlight golang %}
ast.Walk(fix, f)

var buf bytes.Buffer
printer.Fprint(&buf, fset, f)
genFile(file, buf)
{% endhighlight %}

用`exec`包进行命令行处理，包括go fmt格式化和goimports自动处理包管理。具体如下：

{% highlight golang %}
func genFile(file string, buf bytes.Buffer) {
	//替换原文件
	newFile, err := os.Create(file)
	defer newFile.Close()
	if err != nil {
		log.Printf("os.Create %s error:%v", file, err)
		return
	} else {
		newFile.Write(buf.Bytes())
	}

	cmd := fmt.Sprintf("go fmt %s;goimports -w %s", file, file)
	runCmd("/bin/sh", "-c", cmd)
}

func runCmd(name string, args ...string) string {
	// 执行系统命令
	// 第一个参数是命令名称
	// 后面参数可以有多个，命令参数
	cmd := exec.Command(name, args...)
	// 获取输出对象，可以从该对象中读取输出结果
	stderr, err := cmd.StderrPipe()
	if err != nil {
		log.Printf("%v", err)
		return err.Error()
	}
	// 保证关闭输出流
	defer stderr.Close()
	// 运行命令
	if err := cmd.Start(); err != nil {
		log.Printf("%v", err)
		return err.Error()
	}
	// 读取输出结果
	opBytes, err := ioutil.ReadAll(stderr)
	if err != nil {
		log.Printf("%v", err)
		return err.Error()
	}
	log.Printf("%v", string(opBytes))

	//防止进程太多导致：resource temporarily unavailable
	timer := time.AfterFunc(1*time.Second, func() {
		err := cmd.Process.Kill()
		if err != nil {
			//panic(err) // panic as can't kill a process.
			log.Printf("cmd.Process.Kill %v", err)
			return
		}
	})
	err = cmd.Wait()
	if err != nil {
		timer.Stop()
		log.Printf("cmd.Wait %v", err)
		return string(opBytes)
	}
	timer.Stop()
	return string(opBytes)
}
{% endhighlight %}

执行代码见: [https://github.com/baixiaoustc/go_code_analysis/blob/master/third_post_test.go](https://github.com/baixiaoustc/go_code_analysis/blob/master/sthird_post_test.go)中的`TestAutoGenContext`。
