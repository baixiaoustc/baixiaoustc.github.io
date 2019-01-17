---
author: baixiaoustc
comments: false
date: 2019-01-17 09:54:23+00:00
layout: post
slug: 2019-01-17-golang-code-inspector-2-reverse-call-graph
title: golang深入源代码之二：反向调用关系的生成
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}

这是系列博文的第二篇，第一篇在此：[golang深入源代码之一：AST的遍历](http://baixiaoustc.com/2019/01/14/2019-01-14-golang-code-inspector-1-all-case)


# 怎么形成一个项目内部的函数调用关系

在一些场景下，需要对一个项目内部的函数调用关系做分析，IDE当然是可以做到一部分。但是对于一个完整调用链，IDE就爱莫能助了。上面列举的第一篇文章讲到的golang AST遍历可以解决这个问题。分析每一个FuncDesc内部的所有调用可能，记录所有A-》B的调用关系，可以解决这个问题。不过本文没有直接使用AST，而是运用了golang提供的完备的工具链来实现。

## 一个例子

如下为测试项目的文件结构：

  --  /exmaple/test3.go

  --  /exmaple/test4.go
  
  --  /example/inner/itest1.go
 
 
 中间存在着跨文件调用和跨package调用，以及调用类的函数。
 
 /exmaple/test3.go如下：
 
{% highlight golang %}
package main

import (
	"context"
	"fmt"

	"github.com/baixiaoustc/go_code_analysis/example/inner"
)

func main() {
	fmt.Println("start")

	Test3()
	test3a()
	test3c()

	go receiveFromKafka()
	select {}
}

func Test3() {
	fmt.Println("test3")
	test3b()
}

type XYZ struct {
	Name string
}

func (xyz XYZ) print() {
	fmt.Println(xyz.Name)
	context.WithCancel(nil)
}

func test3a() {
	xyz := XYZ{"hello"}
	xyz.print()
}

func test3b() {
	test3b()
	inner.Itest1()
}

func test3c() {
	go func() {
		fmt.Println("go")
	}()
	test4a("world")
}
{% endhighlight %}
  
/exmaple/test4.go如下：

{% highlight golang %}
package main

import (
	"context"
	"fmt"
)

func test4a(a string) {
	fmt.Println(a)
	context.WithCancel(nil)
}

func test4b(a string) {
	fmt.Println(a)
	context.WithCancel(nil)
}

func receiveFromKafka() {
	test4a("kafka")
	test4b("kafka")
}
{% endhighlight %}

/example/inner/itest1.go如下：

{% highlight golang %}
package inner

import "context"

func Itest1() {
	context.WithCancel(nil)
}
{% endhighlight %}

比如我们要找到从上到下调用到`test4a`的调用链，应该怎么做呢？

# 使用golang提供的静态编译工具链

我们依赖了如下三个golang工具链：

- "golang.org/x/tools/go/loader"
- "golang.org/x/tools/go/pointer"
- "golang.org/x/tools/go/ssa"

## go/loader

> Package loader loads a complete Go program from source code, parsing and type-checking the initial packages plus their transitive closure of dependencies. The ASTs and the derived facts are retained for later use.

这个包的官方定义如上，大意是指从源代码加载整个项目，解析代码并作类型校验，分析package之间的依赖关系，返回ASTs和衍生的关系。

## go/ssa

> Package ssa defines a representation of the elements of Go programs (packages, types, functions, variables and constants) using a static single-assignment (SSA) form intermediate representation (IR) for the bodies of functions.

SSA(Static Single Assignment，静态单赋值），是源代码和机器码中间的表现形式。从AST转换到SSA之后，编译器会进行一系列的优化。这些优化被应用于代码的特定阶段使得处理器能够更简单和快速地执行。

## go/pointer

> Package pointer implements Andersen's analysis, an inclusion-based pointer analysis algorithm first described in (Andersen, 1994).

指针分析是一类特殊的数据流问题，它是其它静态程序分析的基础。算法最终建立各节点间的指向关系，具体可以参考文章[Anderson's pointer analysis](https://blog.csdn.net/dashuniuniu/article/details/78704741)。

在此没有进行理论上的研究，单单尝试使用golang提供的工具链做源代码的语义分析：

{% highlight golang %}
var Analysis *analysis

type analysis struct {
	prog   *ssa.Program
	conf   loader.Config
	pkgs   []*ssa.Package
	mains  []*ssa.Package
	result *pointer.Result
}

func doAnalysis(buildCtx *build.Context, tests bool, args []string) {
	t0 := time.Now()
	conf := loader.Config{Build: buildCtx}
	_, err := conf.FromArgs(args, tests)
	if err != nil {
		log.Printf("invalid args:", err)
		return
	}
	load, err := conf.Load()
	if err != nil {
		log.Printf("failed conf load:", err)
		return
	}
	log.Printf("loading.. %d imported (%d created) took: %v",
		len(load.Imported), len(load.Created), time.Since(t0))

	t0 = time.Now()

	prog := ssautil.CreateProgram(load, 0)
	prog.Build()
	pkgs := prog.AllPackages()

	var mains []*ssa.Package
	if tests {
		for _, pkg := range pkgs {
			if main := prog.CreateTestMainPackage(pkg); main != nil {
				mains = append(mains, main)
			}
		}
		if mains == nil {
			log.Fatalln("no tests")
		}
	} else {
		mains = append(mains, ssautil.MainPackages(pkgs)...)
		if len(mains) == 0 {
			log.Printf("no main packages")
		}
	}
	log.Printf("building.. %d packages (%d main) took: %v",
		len(pkgs), len(mains), time.Since(t0))

	t0 = time.Now()
	ptrcfg := &pointer.Config{
		Mains:          mains,
		BuildCallGraph: true,
	}
	result, err := pointer.Analyze(ptrcfg)
	if err != nil {
		log.Fatalln("analyze failed:", err)
	}
	log.Printf("analysis took: %v", time.Since(t0))

	Analysis = &analysis{
		prog:   prog,
		conf:   conf,
		pkgs:   pkgs,
		mains:  mains,
		result: result,
	}
}
{% endhighlight %}

如上的`pointer.Result`中含有的`callgraph.Graph`结构就是上述的**节点间的指向关系**，是一颗树形结构。再用`callgraph.GraphVisitEdges`深度优先遍历它得到函数之间的两两调用关系。

需要注意三个坑：
- 针对go func(){}的情况需要处理处理`$`
- 针对类的函数，用class@func来标示
- 注意处理跨package的调用情况

执行代码见: [https://github.com/baixiaoustc/go_code_analysis/blob/master/second_post_test.go](https://github.com/baixiaoustc/go_code_analysis/blob/master/second_post_test.go)中的`TestAnalysisCallGraphy`。

我们定义了如下结构表示函数之间的两两调用关系：

{% highlight golang %}
//函数定义
type FuncDesc struct {
	File    string //文件路径
	Package string //package名
	Name    string //函数名，格式为Package.Func
}

//描述一个函数调用N个函数的一对多关系
type CallerRelation struct {
	Caller  FuncDesc
	Callees []FuncDesc
}
{% endhighlight %}

如上例子的最终结果为：

	2019/01/17 22:28:27 loading.. 1 imported (0 created) took: 1.335481764s
	2019/01/17 22:28:28 building.. 24 packages (1 main) took: 250.771602ms
	2019/01/17 22:28:28 analysis took: 301.707762ms
	2019/01/17 22:28:28 0 limit prefixes: []
	2019/01/17 22:28:28 0 ignore prefixes: []
	2019/01/17 22:28:28 0 include prefixes: []
	2019/01/17 22:28:28 no std packages: true
	2019/01/17 22:28:29 call node: n11:github.com/baixiaoustc/go_code_analysis/example.receiveFromKafka -> n719:github.com/baixiaoustc/go_code_analysis/example.test4a
	2019/01/17 22:28:29 call node: n11:github.com/baixiaoustc/go_code_analysis/example.receiveFromKafka -> n720:github.com/baixiaoustc/go_code_analysis/example.test4b
	2019/01/17 22:28:30 call node: n9:github.com/baixiaoustc/go_code_analysis/example.test3a -> n81:(github.com/baixiaoustc/go_code_analysis/example.XYZ).print
	2019/01/17 22:28:31 call node: n717:github.com/baixiaoustc/go_code_analysis/example.test3b -> n717:github.com/baixiaoustc/go_code_analysis/example.test3b
	2019/01/17 22:28:31 call node: n717:github.com/baixiaoustc/go_code_analysis/example.test3b -> n797:github.com/baixiaoustc/go_code_analysis/example/inner.Itest1
	2019/01/17 22:28:31 call node: n8:github.com/baixiaoustc/go_code_analysis/example.Test3 -> n717:github.com/baixiaoustc/go_code_analysis/example.test3b
	2019/01/17 22:28:31 call node: n6:github.com/baixiaoustc/go_code_analysis/example.main -> n8:github.com/baixiaoustc/go_code_analysis/example.Test3
	2019/01/17 22:28:31 call node: n6:github.com/baixiaoustc/go_code_analysis/example.main -> n9:github.com/baixiaoustc/go_code_analysis/example.test3a
	2019/01/17 22:28:31 call node: n10:github.com/baixiaoustc/go_code_analysis/example.test3c -> n718:github.com/baixiaoustc/go_code_analysis/example.test3c$1
	2019/01/17 22:28:31 call node: n10:github.com/baixiaoustc/go_code_analysis/example.test3c -> n719:github.com/baixiaoustc/go_code_analysis/example.test4a
	2019/01/17 22:28:31 call node: n6:github.com/baixiaoustc/go_code_analysis/example.main -> n10:github.com/baixiaoustc/go_code_analysis/example.test3c
	2019/01/17 22:28:31 call node: n6:github.com/baixiaoustc/go_code_analysis/example.main -> n11:github.com/baixiaoustc/go_code_analysis/example.receiveFromKafka
	2019/01/17 22:28:31 6/1991 edges
	
	2019/01/17 22:28:31 正向调用关系:example.Test3 {Caller:{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:Test3} Callees:[{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:test3b}]}
	
	2019/01/17 22:28:31 正向调用关系:example.main {Caller:{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:main} Callees:[{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:Test3} {File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:test3a} {File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:test3c} {File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test4.go Package:main Name:receiveFromKafka}]}
	
	2019/01/17 22:28:31 正向调用关系:example.test3c {Caller:{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:test3c} Callees:[{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test4.go Package:main Name:test4a}]}
	
	2019/01/17 22:28:31 正向调用关系:example.receiveFromKafka {Caller:{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test4.go Package:main Name:receiveFromKafka} Callees:[{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test4.go Package:main Name:test4a} {File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test4.go Package:main Name:test4b}]}
	
	2019/01/17 22:28:31 正向调用关系:example.test3a {Caller:{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:test3a} Callees:[{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:XYZ@print}]}
	
	2019/01/17 22:28:31 正向调用关系:example.test3b {Caller:{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/test3.go Package:main Name:test3b} Callees:[{File:/Users/baixiao/Go/src/github.com/baixiaoustc/go_code_analysis/example/inner/itest1.go Package:inner Name:Itest1}]}

***以上内容大量参考[https://github.com/TrueFurby/go-callvis](https://github.com/TrueFurby/go-callvis)***

参考