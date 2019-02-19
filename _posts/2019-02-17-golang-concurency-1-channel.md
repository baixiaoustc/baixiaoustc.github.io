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

这大概是golang中最吸引人的地方了。

## 启动goroutine

关键字`go`启动一个goroutine，新手容易犯以下的错误，使得goroutine没有真正运行：

{% highlight golang %}
func testBoring(msg string) {
	for i := 0; ; i++ {
		log.Printf("%s %d", msg, i)
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
		log.Printf("%s %d", msg, i)
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

搞并发编程，怎么能没有进程间（线程间/协程间）通信呢？

## goroutine需要通信

在上例`TestGoAndWait`中，我们假装主goroutine听到了子goroutine的话（**注意这里的子goroutine仅用于方便描述，并不像多进程里面有父子关系，下同**）。实则不然。要这两个goroutine通信，我们需要channel。来一个最简单的示例，当然这是一个死循环：

{% highlight golang %}
func testBoringWithChannel(msg string, c chan string) {
	for i := 0; ; i++ {
		c <- fmt.Sprintf("%s %d", msg, i)
		time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
	}
}

func TestGoWithChannel(t *testing.T) {
	ch := make(chan string)
	go testBoringWithChannel("boring!", ch)
	for c := range ch {
		log.Printf("You say: %s", c)
	}
}
{% endhighlight %}

## 关闭channel

抛开死循环，怎么在后启动的goroutine结束时告知主goroutine呢？直接退出是会造成死锁的！
> fatal error: all goroutines are asleep - deadlock!

此时需要在写端关闭channel：

{% highlight golang %}
func testBoringWithChannelClose(msg string, c chan string) {
	for i := 0; i < 5; i++ {
		c <- fmt.Sprintf("%s %d", msg, i)
		time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
	}
	close(c)
}

func TestGoWithChannelClose(t *testing.T) {
	ch := make(chan string)
	go testBoringWithChannelClose("boring!", ch)
	for c := range ch {
		log.Printf("You say: %s", c)
	}
}
{% endhighlight %}

`for range`可以自动监测到channel关闭，然后自动退出。但是需要强调的是关闭后的channel不能再写入，如下是个反例：

{% highlight golang %}
func TestGoWithChannelCloseThenWrite(t *testing.T) {
	ch := make(chan string)
	go testBoringWithChannelClose("boring!", ch)
	for c := range ch {
		log.Printf("You say: %s", c)
	}
	ch <- "after close"
}
{% endhighlight %}

	2019/02/18 23:12:31 receive boring! 0
	2019/02/18 23:12:31 receive boring! 1
	2019/02/18 23:12:32 receive boring! 2
	2019/02/18 23:12:32 receive boring! 3
	2019/02/18 23:12:32 receive boring! 4
	panic: send on closed channel [recovered]
		panic: send on closed channel
	
	goroutine 5 [running]:
	testing.tRunner.func1(0xc4200aa0f0)
		/usr/local/go/src/testing/testing.go:711 +0x2d2
	panic(0x1114e40, 0x1151930)
		/usr/local/go/src/runtime/panic.go:491 +0x283
	github.com/baixiaoustc/go_concurrency.TestGoWithChannelCloseThenWrite(0xc4200aa0f0)
		/Users/baixiao/Go/src/github.com/baixiaoustc/go_concurrency/first_post_test.go:80 +0x167
	testing.tRunner(0xc4200aa0f0, 0x1141a58)
		/usr/local/go/src/testing/testing.go:746 +0xd0
	created by testing.(*T).Run
		/usr/local/go/src/testing/testing.go:789 +0x2de
	
	Process finished with exit code 2

## 只读channel

如何简单地避免上述误操作呢？可以用只读channel，生产者和消费者严格定义好，生产者只写channel，消费者只读channel，如果消费者有写入操作的话在编译时就会报错。但是只读channel的写法有一点技巧，如下的写法就不行，直接编译失败：

{% highlight golang %}
func TestReceiveChannelWrong(t *testing.T) {
	ch := make(<-chan int)
	go func() {
		ch <- 1
	}()
	a := <-ch
	log.Println(a)
}
{% endhighlight %}

	./first_post_test.go:86:6: invalid operation: ch <- 1 (send to receive-only type <-chan int)
	
	Process finished with exit code 2
	
正确的写法如下，通过函数的返回值限定「只读属性」：

{% highlight golang %}
func TestReceiveChannelRight(t *testing.T) {
	ch := func() <-chan int {
		ch := make(chan int)
		go func() {
			ch <- 2
		}()
		return ch
	}()
	a := <-ch
	log.Println(a)
}
{% endhighlight %}

## channel with select

那么当主goroutine要启动多个子goroutine干不同的事呢？主goroutine不可能依次阻塞到不同的channel上，串行地等待子goroutine依次完工，这样太丑了：

{% highlight golang %}
func TestMultiChannelsSerial(t *testing.T) {
	ch1 := make(chan string)
	go testBoringWithChannelClose("boring!", ch1)
	ch2 := make(chan string)
	go testBoringWithChannelClose("funning!", ch2)

	for b := range ch1 {
		log.Printf("You say: %s", b)
	}
	for b := range ch2 {
		log.Printf("You say: %s", b)
	}
}
{% endhighlight %}

golang提供了select关键字，提供了多路复用的能力，同时处理多个channel。为了让主goroutine不是一直死循环等，而是在其多个子goroutine完工后继续往下走，这里用到了两个重要特性：

* 使用_,ok判断channel是否关闭
* 当通道为nil时，对应的case永远为阻塞

{% highlight golang %}
func TestMultiChannelsConcurrently(t *testing.T) {
	ch1 := make(chan string)
	go testBoringWithChannelClose("boring!", ch1)
	ch2 := make(chan string)
	go testBoringWithChannelClose("funning!", ch2)

	for {
		select {
		case c1, ok := <-ch1:
			if !ok {
				ch1 = nil
				log.Print("close ch1")
				continue
			}
			log.Printf("You say: %s", c1)
		case c2, ok := <-ch2:
			if !ok {
				ch2 = nil
				log.Print("close ch2")
				continue
			}
			log.Printf("You say: %s", c2)
		default:
			break
		}

		if ch1 == nil && ch2 == nil {
			break
		}
	}

	log.Print("go on")
}
{% endhighlight %}

## 构造定时器

channel + select 的另一个经典运用是超时管理：

{% highlight golang %}
func TestTimeOutEach(t *testing.T) {
	ch := make(chan string)
	go testBoringWithChannel("boring!", ch)
	for i := 0; i < 5; i++ {
		select {
		case c := <-ch:
			log.Printf("You say: %s", c)
		case <-time.After(500 * time.Millisecond):
			log.Println("You talk too slow.")
		}
	}
}
{% endhighlight %}

	2019/02/19 21:08:14 You say: boring! 0
	2019/02/19 21:08:14 You say: boring! 1
	2019/02/19 21:08:15 You talk too slow.
	2019/02/19 21:08:15 You say: boring! 2
	2019/02/19 21:08:15 You talk too slow.
	
	Process finished with exit code 0
	
上述是针对每次循环内部的超时，如果要对整个会话进行管理：

{% highlight golang %}
func TestTimeOutWhole(t *testing.T) {
	ch := make(chan string)
	timeout := time.After(1 * time.Second)
	go testBoringWithChannel("boring!", ch)
	for i := 0; i < 5; i++ {
		select {
		case c := <-ch:
			log.Printf("You say: %s", c)
		case <-timeout:
			log.Println("You talk too much.")
			return
		}
	}
}
{% endhighlight %}

## channel生成器

还有一个比较常用的方法在上面的只读channel也提到了，雅称channel生成器：

{% highlight golang %}
func TestChannelGenerator(t *testing.T) {
	c := testBoringWithChannelGenerate("boring!")
	for i := 0; i < 5; i++ {
		log.Printf("You say: %q\n", <-c)
	}
	log.Println("I'm leaving.")
}
{% endhighlight %}

	2019/02/19 21:20:40 You say: "boring! 0"
	2019/02/19 21:20:40 You say: "boring! 1"
	2019/02/19 21:20:41 You say: "boring! 2"
	2019/02/19 21:20:41 You say: "boring! 3"
	2019/02/19 21:20:42 You say: "boring! 4"
	
	2019/02/19 21:20:42 I'm leaving.
	
## 上面提到的channel都是没有buffer的，很大程度上起了「同步」的作用。后面会再提带buffer的channel。
	
所有代码都在[https://github.com/baixiaoustc/go_concurrency/blob/master/first_post_test.go](https://github.com/baixiaoustc/go_concurrency/blob/master/first_post_test.go)中能找到。