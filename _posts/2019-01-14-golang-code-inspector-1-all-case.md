---
author: baixiaoustc
comments: true
date: 2019-01-14 09:54:23+00:00
layout: post
slug: 2019-01-14-golang-code-inspector-1-all-case
title: golang深入源代码之一：AST的遍历
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}


# 怎么分析golang源代码

我们拿到一个golang的工程后（通常是个微服务），怎么从词法、语法的角度来分析源代码呢？golang提供了一系列的工具供我们使用：

* go/scanner包提供词法分析功能，将源代码转换为一系列的token，以供go/parser使用
* go/parser包提供语法分析功能，将这些token转换为AST（Abstract Syntax Tree, 抽象语法树）

## Scanner

* 任何编译器所做的第一步都是将源代码转换成token，这就是Scanner所做的事
* token可以是关键字，字符串值，变量名以及函数名等等
* 在golang中，每个token都以它所处的位置，类型和原始字面量来表示

比如我们用如下代码扫描源代码的token：

{% highlight golang %}
func TestScanner(t *testing.T) {
	src := []byte(`package main
import "fmt"
//comment
func main() {
  fmt.Println("Hello, world!")
}
`)

	var s scanner.Scanner
	fset := token.NewFileSet()
	file := fset.AddFile("", fset.Base(), len(src))
	s.Init(file, src, nil, 0)

	for {
		pos, tok, lit := s.Scan()
		fmt.Printf("%-6s%-8s%q\n", fset.Position(pos), tok, lit)

		if tok == token.EOF {
			break
		}
	}
}
{% endhighlight %}

结果：

	1:1   package "package"
	1:9   IDENT   "main"
	1:13  ;       "\n"
	2:1   import  "import"
	2:8   STRING  "\"fmt\""
	2:13  ;       "\n"
	4:1   func    "func"
	4:6   IDENT   "main"
	4:10  (       ""
	4:11  )       ""
	4:13  {       ""
	5:3   IDENT   "fmt"
	5:6   .       ""
	5:7   IDENT   "Println"
	5:14  (       ""
	5:15  STRING  "\"Hello, world!\""
	5:30  )       ""
	5:31  ;       "\n"
	6:1   }       ""
	6:2   ;       "\n"
	6:3   EOF     ""

**注意没有扫描出注释，需要的话要将`s.Init`的最后一个参数改为`scanner.ScanComments`。**

看下go/token/token.go的源代码可知，token就是一堆定义好的枚举类型，对于每种类型的字面值都有对应的token。

{% highlight golang %}
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Package token defines constants representing the lexical tokens of the Go
// programming language and basic operations on tokens (printing, predicates).
//
package token

import "strconv"

// Token is the set of lexical tokens of the Go programming language.
type Token int

// The list of tokens.
const (
	// Special tokens
	ILLEGAL Token = iota
	EOF
	COMMENT

	literal_beg
	// Identifiers and basic type literals
	// (these tokens stand for classes of literals)
	IDENT  // main
	INT    // 12345
	FLOAT  // 123.45
	IMAG   // 123.45i
	CHAR   // 'a'
	STRING // "abc"
	literal_end
	        ...略...
)
{% endhighlight %}

## Parser

* 当源码被扫描成token之后，结果就被传递给了Parser
* 将token转换为抽象语法树（AST）
* 编译时的错误也是在这个时候报告的

什么是AST呢，这篇[文章](http://huang-jerryc.com/2016/03/15/%E4%BD%95%E4%B8%BA%E8%AF%AD%E6%B3%95%E6%A0%91/)讲的很好。简单来说，AST（Abstract Syntax Tree）是使用树状结构表示源代码的语法结构，树的每一个节点就代表源代码中的一个结构。

来看如下的例子：

{% highlight golang %}
func TestParserAST(t *testing.T) {
	src := []byte(`/*comment0*/
package main
import "fmt"
//comment1
/*comment2*/
func main() {
  fmt.Println("Hello, world!")
}
`)

	// Create the AST by parsing src.
	fset := token.NewFileSet() // positions are relative to fset
	f, err := parser.ParseFile(fset, "", src, 0)
	if err != nil {
		panic(err)
	}

	// Print the AST.
	ast.Print(fset, f)
}
{% endhighlight %}

结果很长就不贴出来了，整个AST的树形结构可以用如下图表示：

![](http://image99.renyit.com/image/2019-01-14-1.png)

**同样注意没有扫描出注释，需要的话要将`parser.ParseFile`的最后一个参数改为`parser.ParseComments`。**再对照如下ast.File的定义：

{% highlight golang %}
type File struct {
	Doc        *CommentGroup   // associated documentation; or nil
	Package    token.Pos       // position of "package" keyword
	Name       *Ident          // package name
	Decls      []Decl          // top-level declarations; or nil
	Scope      *Scope          // package scope (this file only)
	Imports    []*ImportSpec   // imports in this file
	Unresolved []*Ident        // unresolved identifiers in this file
	Comments   []*CommentGroup // list of all comments in the source file
}
{% endhighlight %}

可知上述例子中的`/*comment0*/`对照结构中的Doc，是整个go文件的描述。和`//comment1
`以及`/*comment2*/`不同，后两者是Decls中的结构。

## 遍历AST

golang提供了ast.Inspect方法供我们遍历整个AST树，比如如下例子遍历整个example/test1.go文件寻找所有return返回的地方：

{% highlight golang %}
func TestInspectAST(t *testing.T) {
	// Create the AST by parsing src.
	fset := token.NewFileSet() // positions are relative to fset
	f, err := parser.ParseFile(fset, "./example/test1.go", nil, parser.ParseComments)
	if err != nil {
		panic(err)
	}

	ast.Inspect(f, func(n ast.Node) bool {
		// Find Return Statements
		ret, ok := n.(*ast.ReturnStmt)
		if ok {
			fmt.Printf("return statement found on line %v:\n", fset.Position(ret.Pos()))
			printer.Fprint(os.Stdout, fset, ret)
			fmt.Printf("\n")
			return true
		}
		return true
	})
}
{% endhighlight %}

example/test1.go代码如下：

{% highlight golang %}
package example

import "fmt"
import "strings"

func main() {
	hello := "Hello"
	world := "World"
	words := []string{hello, world}
	SayHello(words)
}

// SayHello says Hello
func SayHello(words []string) bool {
	fmt.Println(joinStrings(words))
	return true
}

// joinStrings joins strings
func joinStrings(words []string) string {
	return strings.Join(words, ", ")
}
{% endhighlight %}

结果为：

	return statement found on line ./example/test1.go:16:2:
	return true
	return statement found on line ./example/test1.go:21:2:
	return strings.Join(words, ", ")
	
还有另一种方法遍历AST，构造一个ast.Visitor接口：

{% highlight golang %}
type Visitor int

func (v Visitor) Visit(n ast.Node) ast.Visitor {
	if n == nil {
		return nil
	}
	fmt.Printf("%s%T\n", strings.Repeat("\t", int(v)), n)
	return v + 1
}

func TestASTWalk(t *testing.T) {
	// Create the AST by parsing src.
	fset := token.NewFileSet() // positions are relative to fset
	f, err := parser.ParseFile(fset, "", "package main; var a = 3", parser.ParseComments)
	if err != nil {
		panic(err)
	}
	var v Visitor
	ast.Walk(v, f)
}
{% endhighlight %}

旨在递归地打印出所有的token节点，输出：

	*ast.File
		*ast.Ident
		*ast.GenDecl
			*ast.ValueSpec
				*ast.Ident
				*ast.BasicLit

***以上基础知识主要参考[文章](https://getstream.io/blog/how-a-go-program-compiles-down-to-machine-code/)（[译文](https://studygolang.com/articles/15648?utm_source=tuicool&utm_medium=referral)）***。下面来点干货。