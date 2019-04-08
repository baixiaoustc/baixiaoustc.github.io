---
author: baixiaoustc
comments: false
date: 2019-03-13 09:54:23+00:00
layout: post
slug: 2019-03-13-golang-concurency-3-context-cancellation
title: golang并发三板斧系列之三：context用于退出
categories:
- 后端技术
tags:
- golang 
- 并发
---

* content 
{:toc}

这是本系列文章的第三篇，第一篇在此[golang并发三板斧系列之一：channel用于通信和同步](http://baixiaoustc.com/2019/02/17/2019-02-17-golang-concurency-1-channel/)，第二篇在此[golang并发三板斧系列之二：goroutine池用于并发](http://baixiaoustc.com/2019/02/20/2019-02-20-golang-concurency-2-goroutine-pool/)。

前文描述了手工作坊的时代和工业时代，现在我们进入信息时代。

# 万恶的资本主义

前文描述的工业时代其实是资本主义，来到世间的每个毛孔都在滴血。不信你看前文的代码，`gen`之类的函数创建了一堆任务之后就扔给下游的works处理了，也不管他们要处理多久，是不是加班到深夜。

{% highlight golang %}
func BenchmarkCPUPool(b *testing.B) {
	channum := 100
	gonum := runtime.NumCPU()
	for i := 0; i < b.N; i++ {
		f := func(w *Work) {
			if v, ok := w.input.(float64); ok {
				cpubound(v)
			}
		}
		list := benchmarkList()
		c := genPoolChanBuffer(list)

		p := InitPool(channum, gonum, f)
		p.RunWorker()
		p.FeedWorker(c)
		p.Wait()
	}
}
{% endhighlight %}

# 人民当家作主

解放之后我们开始了社会主义，人民的工会爱人民，人民的工会力量大，工会可以在合适的时候给大家临时放假，让大家休息，对比到程序中就是按下了神圣的`ctrl+c`。

如下是最粗暴的模型，工会一喊放假，大家都放下手上的工作开心的玩耍了。但是有的工作做了一半就放弃了，这确实是很没有职业操守的：

{% highlight golang %}
var WorkPool chan work

type work struct {
	sth string
}

func (w work) Working() {
	log.Printf("start %s", w.sth)

	time.Sleep(2 * time.Second)

	log.Printf("end %s", w.sth)
}

func RunWorkerSimple() {
	WorkPool = make(chan work)

	workers := 2
	for i := 0; i < int(workers); i++ {
		go HandleWorkerSimple()
	}
}

func HandleWorkerSimple() {
	for {
		select {
		case work := <-WorkPool:
			work.Working()
		}
	}

	return
}

func TestWorkerSimple(t *testing.T) {
	RunWorkerSimple()

	list := benchmarkList()
	for _, l := range list {
		WorkPool <- work{fmt.Sprint(l)}
	}
}
{% endhighlight %}

	C02S259EFVH3:go_concurrency baixiao$ go test -run TestWorkerSimple
	2019/04/08 22:56:11 start 1
	2019/04/08 22:56:11 start 0
	2019/04/08 22:56:13 end 0
	2019/04/08 22:56:13 start 2
	2019/04/08 22:56:13 end 1
	2019/04/08 22:56:13 start 3
	^Csignal: interrupt
	FAIL	_/Users/baixiao/Go/src/github.com/baixiaoustc/go_concurrency	2.790s