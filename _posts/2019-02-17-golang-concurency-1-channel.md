---
author: baixiaoustc
comments: false
date: 2019-02-17 09:54:23+00:00
layout: post
slug: 2019-02-17-golang-concurency-1-channel
title: golang并发三板斧系列之一：会用channel
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}

某不知名程序员曾说过：
> 我们爱golang，很大程度是因为爱它的并发。

我们来总结下golang的并发三板斧，channel、pool、context。一路看下来，套路也就那么几个。

# Concurrency is not parallelism

首先必须牢记一个重要的概念：并发不是并行。并发是描述代码架构，是指在模型上可以同时处理多件事务。并行是描述执行状态，除了代码限制外，如果没有多CPU多核心，谈何并行呢？对于单CPU单核心的硬件（当然现在基本上很少了），并发往往带来更多的进程间切换，反而会拖累效率。

本系列文章只谈golang的代码模型，因此取`并发`二字。下图很直观的区分了并发和并行：

![](http://image99.renyit.com/image/2019-02-17-1.png)

# goroutine

## 启动goroutine

关键字`go`启动一个goroutine，新手容易犯以下的错误，使得goroutine没有真正运行：

{% highlight golang %}
func testBoring(msg string) {
	for i := 0; ; i++ {
		log.Print("%s %d", msg, i)
		time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
	}
}

func TestBasicGo(t *testing.T) {
	go testBoring("boring!")
}
{% endhighlight %}

主进程在启动的goroutine并没有运行到时就退出了，因此没有效果。

## 等待goroutine执行

{% highlight golang %}
func testBoring(msg string) {
	for i := 0; ; i++ {
		log.Print("%s %d", msg, i)
		time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
	}
}

func TestGoAndWait(t *testing.T) {
	go testBoring("boring!")

	log.Printf("I'm listening.")
	time.Sleep(time.Second)
	log.Printf("I'm leaving.")
}
{% endhighlight %}

如此，手动用`time.Sleep`阻塞主进程，使得启动的goroutine能开始执行：

	2019/02/17 17:55:33 I'm listening.
	2019/02/17 17:55:33 boring! 0
	2019/02/17 17:55:34 boring! 1
	2019/02/17 17:55:34 boring! 2
	2019/02/17 17:55:34 I'm leaving.
	
	Process finished with exit code 0