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

首先必须牢记一个重要的概念：**并发不是并行**。

并发是描述代码架构，是指在模型上可以同时处理多件事务。并行是描述执行状态，除了代码限制外，如果没有多CPU多核心，谈何并行呢？对于单CPU单核心的硬件（当然现在基本上很少了），并发往往带来更多的进程间切换，反而会拖累效率。

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

主进程在启动的goroutine并没有运行到就退出了，因此没有效果，不会有打印。

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
	
## goroutine执行时机

那么`go`出去的goroutine到底什么时候能执行到呢？golang的调度器是非抢占式的，在`GPM`的架构里，`Waiting`态的goroutine（在LRQ或者GRQ中等待执行）必须要等`Executing`态的goroutine主动退出执行，才能绑定到`M`上执行。主动退出的方式有很多，比如`time.Sleep()`，比如`runtime.Gosched()`。*GPM架构可以参考很多资料比如[这篇](https://segmentfault.com/a/1190000016611742)。*

因此单核心或者多核心在调度goroutine的时候可能会有很大差异，如下示例：

{% highlight golang %}
func TestGoFuncParam(t *testing.T) {
	for i := 0; i < 10; i++ {
		go func() {
			log.Println(i)
		}()
	}
	time.Sleep(100 * time.Millisecond)
	log.Print("xxxxxxxxxxxxxx")

	for i := 0; i < 10; i++ {
		go func(n *int) {
			log.Println(*n)
		}(&i)
	}
	time.Sleep(100 * time.Millisecond)
}
{% endhighlight %}

代码在单核心运行时（注意`-cpu 1`），结果是确定的，所有启动的goroutine都是等主进程sleep的时候才能切换执行：

	C02S259EFVH3:go_concurrency baixiao$ go test -cpu 1 -run TestGoFuncParam
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 xxxxxxxxxxxxxx
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	2019/02/17 18:20:10 10
	PASS
	ok  	_/Users/baixiao/Go/src/github.com/baixiaoustc/go_concurrency	0.214s

在多核心时则不同，for循环里的第一个goroutine可能在主进程走完for代码之前就执行到（每次运行可能结果不同）：

	C02S259EFVH3:go_concurrency baixiao$ go test -cpu 8 -run TestGoFuncParam
	2019/02/17 18:20:24 7
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:24 10
	2019/02/17 18:20:25 xxxxxxxxxxxxxx
	2019/02/17 18:20:25 1
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	2019/02/17 18:20:25 10
	PASS
	ok  	_/Users/baixiao/Go/src/github.com/baixiaoustc/go_concurrency	0.219s
	
# channel：goroutine间的通信

## 需要通信

## 只读channel

## 关闭channel

## 构造定时器

## channel生成器