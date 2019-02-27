---
author: baixiaoustc
comments: false
date: 2019-02-20 09:54:23+00:00
layout: post
slug: 2019-02-20-golang-concurency-2-pipeline
title: golang并发三板斧系列之二：会用pipeline
categories:
- 后端技术
tags:
- golang 并发
---

* content 
{:toc}

这是本系列文章的第二篇，第一篇在此[golang并发三板斧系列之一：channel用于通信和同步](http://baixiaoustc.com/2019/02/17/2019-02-17-golang-concurency-1-channel/)。

前文描述了手工作坊的时代，即老师傅带着小学徒并发地做一项工作，现在我们准备进入工业时代。

# Pipeline

Pipeline即流水线模型，这在现代工业是很常见的。模型分为数个阶段，每个阶段干不同的事情，但可以并行地去做。以造拖拉机为例来解释流水线的工作方式，假设装配一辆汽车需要四个步骤：

* 第一步冲压：制作车身外壳和底盘等部件。
* 第二步焊接：将冲压成形后的各部件焊接成车身。
* 第三步涂装：将车身等主要部件清洗、化学处理、打磨、喷漆和烘干。
* 第四步总装：将各部件（包括发动机和向外采购的零部件）组装成车。

![](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1550850454584&di=5b91c7d40e26df085c3cf5f218774d32&imgtype=0&src=http%3A%2F%2Fwww.xinhuanet.com%2Fmrdx%2F2018-07%2F22%2F137340578_15322219632651n.jpg)

比如要造一百辆拖拉机，如果每个阶段都等前一阶段的一百辆完成才开工，是对生产线的极大浪费。现代工业的流水线做法是每个阶段同时开工，在时间上并行起来。流水线的概念在计算机世界中也很普遍，拥有流水线的CPU可以在一个时钟周期内完成一条指令，而不是等待取指令、译码、取操作数、执行四个阶段才能完成一条指令：

![](https://gss3.bdstatic.com/7Po3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike150%2C5%2C5%2C150%2C50/sign=72d63958ab51f3ded7bfb136f5879b7a/4034970a304e251f7a0a156aa386c9177e3e53a7.jpg)

golang的设计者们吸收了这一经典概念，使用channel把前后数个阶段串联起来，形成一个流水线：

{% highlight golang %}
func gen(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func sq(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * n
		}
		close(out)
	}()
	return out
}

func TestPipeline(t *testing.T) {
	c := gen(2, 3, 4)
	out := sq(c)

	for n := range out {
		log.Print(n)
	}
}
{% endhighlight %}

由于`sq`函数的入参和出参一样，故可以增加无数个阶段写为：

{% highlight golang %}
func TestPipelines(t *testing.T) {
	for n := range sq(sq(sq(gen(1, 2, 3, 4)))) {
		log.Print(n)
	}
}
{% endhighlight %}


# FAN模型

可以说FAN模型是流水线的一种改进。可以观察到上述的流水线模型，每个阶段只起了一个goroutine，但是现实造拖拉机的时候，在组装轮子的时候可以4个工人一起上，这又是提高了并发。golang吸取了这种模型，在任务分发阶段，多个goroutine从同一个channel读取数据，直到关闭，称为FAN-OUT模型；在结果收集阶段，单个goroutine从多个channel读取数据，直到关闭，称为FAN-IN模型：

![](https://talks.golang.org/2012/concurrency/images/gophermegaphones.jpg)

{% highlight golang %}
func merge(cs ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	out := make(chan int)

	output := func(c <-chan int) {
		for n := range c {
			out <- n
		}
		wg.Done()
	}
	wg.Add(len(cs))
	for _, c := range cs {
		go output(c)
	}

	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}

func TestFan(t *testing.T) {
	c := gen(2, 3, 4)
	out1 := sq(c)
	out2 := sq(c)

	for n := range merge(out1, out2) {
		log.Print(n)
	}
}
{% endhighlight %}

并行起来之后，最终结果的顺序是不可控的：

	2019/02/22 21:39:27 9
	2019/02/22 21:39:27 16
	2019/02/22 21:39:27 4
	
	Process finished with exit code 0

# merge好吗，要用串行来比

## CPU密集型

## IO密集型

# 池子