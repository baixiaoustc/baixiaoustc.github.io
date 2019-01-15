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

## scanner的使用

* 任何编译器所做的第一步都是将源代码转换成token，这就是scanner所做的事
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
{% endhighlight %}