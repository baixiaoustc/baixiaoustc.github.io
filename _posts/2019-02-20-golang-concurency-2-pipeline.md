---
author: baixiaoustc
comments: false
date: 2019-02-20 09:54:23+00:00
layout: post
slug: 2019-02-20-golang-concurency-2-goroutine-pool
title: golang并发三板斧系列之二：goroutine池用于并发
categories:
- 后端技术
tags:
- golang 
- 并发
---

* content 
{:toc}

这是本系列文章的第二篇，第一篇在此[golang并发三板斧系列之一：channel用于通信和同步](http://baixiaoustc.com/2019/02/17/2019-02-17-golang-concurency-1-channel/)。

前文描述了手工作坊的时代，即老师傅带着小学徒并发地做一项工作，现在我们准备进入工业时代。

# Pipeline模型

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

# 以上模型能提升并行效率吗

## CPU密集型

用浮点数的幂计算模拟CPU-BOUND，设计了如下模型用于比较：

{% highlight golang %}
//功能函数
func benchmarkList() []float64 {
	list := make([]float64, MAX)
	for n := 0; n < MAX; n++ {
		list[n] = float64(n)
	}
	return list
}

func cpubound(n float64) float64 {
	return math.Pow(3.1415926, n)
}

func genChan(nums []float64) <-chan float64 {
	out := make(chan float64)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func genChanBuffer(nums []float64) <-chan float64 {
	out := make(chan float64, BUFFERSIZE)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func cpuChan(in <-chan float64) <-chan float64 {
	out := make(chan float64)
	go func() {
		for n := range in {
			out <- cpubound(n)
		}
		close(out)
	}()
	return out
}

func cpuChanBuffer(in <-chan float64) <-chan float64 {
	out := make(chan float64, BUFFERSIZE)
	go func() {
		for n := range in {
			out <- cpubound(n)
		}
		close(out)
	}()
	return out
}

func mergeChan(cs ...<-chan float64) <-chan float64 {
	var wg sync.WaitGroup
	out := make(chan float64)

	output := func(c <-chan float64) {
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

func mergeChanBuffer(cs ...<-chan float64) <-chan float64 {
	var wg sync.WaitGroup
	out := make(chan float64, BUFFERSIZE)

	output := func(c <-chan float64) {
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

//测试函数
func BenchmarkCPUSequential(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		var sum float64
		for _, n := range list {
			sum += cpubound(n)
		}
	}
}

func BenchmarkCPUPipeline(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChan(list)
		out := cpuChan(c)

		var sum float64
		for n := range out {
			sum += n
		}
	}
}

func BenchmarkCPUPipelineBuffer(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChanBuffer(list)
		out := cpuChanBuffer(c)

		var sum float64
		for n := range out {
			sum += n
		}
	}
}

func BenchmarkCPUFan(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChan(list)
		gonum := runtime.NumCPU() / 2
		outs := make([]<-chan float64, gonum)
		for i := 0; i < gonum; i++ {
			outs[i] = cpuChan(c)
		}

		var sum float64
		for n := range mergeChan(outs...) {
			sum += n
		}
	}
}

func BenchmarkCPUFanBuffer(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChanBuffer(list)
		gonum := runtime.NumCPU() / 2
		outs := make([]<-chan float64, gonum)
		for i := 0; i < gonum; i++ {
			outs[i] = cpuChanBuffer(c)
		}

		var sum float64
		for n := range mergeChanBuffer(outs...) {
			sum += n
		}
	}
}

func BenchmarkCPUParallelize(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()
		gonum := runtime.NumCPU()

		var sum float64
		num := len(list)
		stride := num / gonum

		var wg sync.WaitGroup
		wg.Add(gonum)
		var mux sync.Mutex

		for g := 0; g < gonum; g++ {
			go func(g int) {
				start := g * stride
				end := start + stride
				if g == gonum-1 {
					end = num
				}

				var sumin float64
				for _, n := range list[start:end] {
					sumin += cpubound(n)
				}

				mux.Lock()
				sum += sumin
				mux.Unlock()

				wg.Done()
			}(g)
		}

		wg.Wait()
	}
}
{% endhighlight %}

设MAX=1000000，BUFFERSIZE=1000。结果让人大跌眼镜，无论是Pipeline模型还是Fan模型，都比不上普通的串行，只有普通的并发模型能有效提升：

	[baixiao@localhost go_concurrency]$ GOGC=off go test -cpu 1,8 -run none -bench CPU -benchtime 3s 
	goos: linux
	goarch: amd64
	BenchmarkCPUSequential                50          95148037 ns/op
	BenchmarkCPUSequential-8              30         101450384 ns/op
	BenchmarkCPUPipeline                  10         512093124 ns/op
	BenchmarkCPUPipeline-8                 5         864946495 ns/op
	BenchmarkCPUPipelineBuffer            20         219850707 ns/op
	BenchmarkCPUPipelineBuffer-8          10         370302165 ns/op
	BenchmarkCPUFan                        5         715223945 ns/op
	BenchmarkCPUFan-8                      5         913448396 ns/op
	BenchmarkCPUFanBuffer                 10         320494600 ns/op
	BenchmarkCPUFanBuffer-8               10         427863250 ns/op
	BenchmarkCPUParallelize              100          95482003 ns/op
	BenchmarkCPUParallelize-8            200          19398520 ns/op
	PASS
	ok      _/home/baixiao/go_concurrency   77.085s
	
可以得出以下结论：

* Sequential完爆Pipeline和Fan
* Pipeline和Fan在多核下均弱于单核，因为系统瓶颈根本不在并行上，而是channel造成的阻塞
* 给channel加了buffer之后，PipelineBuffer优于Pipeline、FanBuffer优于Fan，因为channel的阻塞减弱了
* 多核下的Parallelize：在座的各位都是垃圾

## IO密集型

用随机sleep模拟IO-BOUND，设计了如下模型用于比较：

{% highlight golang %}
//功能函数
func iobound(n float64) float64 {
	time.Sleep(time.Duration(rand.Intn(10)) * time.Millisecond)
	return n
}

func ioChan(in <-chan float64) <-chan float64 {
	out := make(chan float64)
	go func() {
		for n := range in {
			out <- iobound(n)
		}
		close(out)
	}()
	return out
}

func ioChanBuffer(in <-chan float64) <-chan float64 {
	out := make(chan float64, BUFFERSIZE)
	go func() {
		for n := range in {
			out <- iobound(n)
		}
		close(out)
	}()
	return out
}

//测试函数
func BenchmarkIOSequential(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		var sum float64
		for _, n := range list {
			sum += iobound(n)
		}
	}
}

func BenchmarkIOPipeline(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChan(list)
		out := ioChan(c)

		var sum float64
		for n := range out {
			sum += n
		}
	}
}

func BenchmarkIOPipelineBuffer(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChanBuffer(list)
		out := ioChanBuffer(c)

		var sum float64
		for n := range out {
			sum += n
		}
	}
}

func BenchmarkIOFan(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChan(list)
		gonum := runtime.NumCPU() / 2
		outs := make([]<-chan float64, gonum)
		for i := 0; i < gonum; i++ {
			outs[i] = ioChan(c)
		}

		var sum float64
		for n := range mergeChan(outs...) {
			sum += n
		}
	}
}

func BenchmarkIOFanBuffer(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()

		c := genChanBuffer(list)
		gonum := runtime.NumCPU() / 2
		outs := make([]<-chan float64, gonum)
		for i := 0; i < gonum; i++ {
			outs[i] = ioChanBuffer(c)
		}

		var sum float64
		for n := range mergeChanBuffer(outs...) {
			sum += n
		}
	}
}

func BenchmarkIOParallelize(b *testing.B) {
	for i := 0; i < b.N; i++ {
		list := benchmarkList()
		gonum := runtime.NumCPU()

		var sum float64
		num := len(list)
		stride := num / gonum

		var wg sync.WaitGroup
		wg.Add(gonum)
		var mux sync.Mutex

		for g := 0; g < gonum; g++ {
			go func(g int) {
				start := g * stride
				end := start + stride
				if g == gonum-1 {
					end = num
				}

				var sumin float64
				for _, n := range list[start:end] {
					sumin += iobound(n)
				}

				mux.Lock()
				sum += sumin
				mux.Unlock()

				wg.Done()
			}(g)
		}

		wg.Wait()
	}
}
{% endhighlight %}

设MAX=100，BUFFERSIZE=1000。

	[baixiao@localhost go_concurrency]$ GOGC=off go test -cpu 1,8 -run none -bench IO -benchtime 3s
	goos: linux
	goarch: amd64
	BenchmarkIOSequential                 10         441609349 ns/op
	BenchmarkIOSequential-8               10         457200927 ns/op
	BenchmarkIOPipeline                   10         454147034 ns/op
	BenchmarkIOPipeline-8                 10         467264740 ns/op
	BenchmarkIOPipelineBuffer             10         456459492 ns/op
	BenchmarkIOPipelineBuffer-8           10         452286832 ns/op
	BenchmarkIOFan                       100          36995490 ns/op
	BenchmarkIOFan-8                     100          36950275 ns/op
	BenchmarkIOFanBuffer                 100          37555702 ns/op
	BenchmarkIOFanBuffer-8               100          36851459 ns/op
	BenchmarkIOParallelize                50          88653231 ns/op
	BenchmarkIOParallelize-8              50          87061568 ns/op
	PASS
	ok      _/home/baixiao/go_concurrency   54.007s
	
可以得出以下结论：

* 在IO密集的情况下，Fan模型吊打所有
* channel带buffer没有效率提升
* 所有的模型，在多核下都没有提升

## 结论是？

1. 不带buffer的channel由于「强同步」特性，无法提高并行，甚至拖累效率
2. CPU密集型的场景，多核并行能提升效率
3. IO密集型的场景，多核并行不能提升效率
4. Pipeling模型有何用途？我没看出来
5. Waitgroup模型在CPU密集型场景有优势
6. Fan模型在IO密集型场景有优势


**坑：runtime.NumCPU()不会随着runtime.GOMAXPROCS()改变，前者代表的是系统全部的核数，后者代表的是可同时使用的核数**

# goroutine池

## pool模型

设计一个pool，需要考虑几个方面：输入是什么，做什么事情，多少worker一起执行？

现抽象出一个goroutine pool的模型代码，可以自定义输入类型，执行函数，worker数量。

{% highlight golang %}
func genPoolChanBuffer(nums []float64) <-chan interface{} {
	out := make(chan interface{}, BUFFERSIZE)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

type Handler func(*Work)
type Work struct {
	input interface{}
}

type Pool struct {
	channum   int
	workernum int
	wg        *sync.WaitGroup
	ch        chan Work
	Func      Handler
}

func (p Pool) RunWorker() {
	for i := 0; i < p.workernum; i++ {
		p.wg.Add(1)
		go func() {
			defer p.wg.Done()
			for work := range p.ch {
				p.Func(&work)
			}
		}()
	}
}

func (p Pool) FeedWorker(in <-chan interface{}) {
	go func() {
		for n := range in {
			work := Work{
				input: n,
			}
			p.ch <- work
		}
		close(p.ch)
	}()
}

func (p Pool) Wait() {
	p.wg.Wait()
}

func InitPool(channum, workernum int, f Handler) *Pool {
	return &Pool{
		channum:   channum,
		workernum: workernum,
		wg:        &sync.WaitGroup{},
		ch:        make(chan Work, channum),
		Func:      f,
	}
}
{% endhighlight %}

## 对比测试

设计了四个对比测试，观察在CPU密集型和IO密集型的情况下该pool的表现，另外还旨在探索什么情况下worker的数量会越多越好？带Min的测试中设置`gonum`为系统核数的一半，带Max的测试中设置`gonum`为系统核数的十倍，`gonum`即为worker数量。

{% highlight golang %}
//测试函数
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

func BenchmarkCPUPoolMin(b *testing.B) {
	channum := 100
	gonum := runtime.NumCPU() / 2
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

func BenchmarkCPUPoolMax(b *testing.B) {
	channum := 100
	gonum := 10 * runtime.NumCPU()
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

func BenchmarkIOPool(b *testing.B) {
	channum := 100
	gonum := runtime.NumCPU()
	for i := 0; i < b.N; i++ {
		f := func(w *Work) {
			if v, ok := w.input.(float64); ok {
				iobound(v)
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

func BenchmarkIOPoolMin(b *testing.B) {
	channum := 100
	gonum := runtime.NumCPU() / 2
	for i := 0; i < b.N; i++ {
		f := func(w *Work) {
			if v, ok := w.input.(float64); ok {
				iobound(v)
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

func BenchmarkIOPoolMax(b *testing.B) {
	channum := 100
	gonum := 10 * runtime.NumCPU()
	for i := 0; i < b.N; i++ {
		f := func(w *Work) {
			if v, ok := w.input.(float64); ok {
				iobound(v)
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

设MAX=100，BUFFERSIZE=1000。

	[baixiao@localhost go_concurrency]$ GOGC=off go test -cpu 1,8 -run none -bench Pool -benchtime 3s
	goos: linux
	goarch: amd64
	BenchmarkCPUPool                  100000             38070 ns/op
	BenchmarkCPUPool-8                 50000             77872 ns/op
	BenchmarkCPUPoolMin               100000             33286 ns/op
	BenchmarkCPUPoolMin-8              50000             71690 ns/op
	BenchmarkCPUPoolMax                30000            143250 ns/op
	BenchmarkCPUPoolMax-8              20000            281619 ns/op
	BenchmarkIOPool                      200          21382667 ns/op
	BenchmarkIOPool-8                    200          21467617 ns/op
	BenchmarkIOPoolMin                   100          37068480 ns/op
	BenchmarkIOPoolMin-8                 100          37350682 ns/op
	BenchmarkIOPoolMax                   500           9438800 ns/op
	BenchmarkIOPoolMax-8                 500           9519574 ns/op
	PASS
	ok      _/home/baixiao/go_concurrency   64.149s	
可以得出以下结论：

* CPU密集型场景中多核下均弱于单核	
* CPU密集型场景中worker数量太多只能起反作用
* IO密集型场景中多核并行不能提升效率
* IO密集型场景中worker数量在一定范围内能有效提升效率
* Pool模型由于用到了channel，多核都不能提升效率

# channel是个好东西？

在第一篇里，我们讲到channel是goroutine之间通信和同步的重要工具，也是golang中重要的关键字之一，说明golang的设计者们很看重这个特性。

但是实际上channel的性能较一般，分析源码可知，channel中的数据无论读写都会加mutex锁，造成高并发时的较大瓶颈，这个从我们的对比测试中也都可以看出来。

![](http://img.lessisbetter.site/2019-03-channel_design.png)

上图来自[文章](http://lessisbetter.site/2019/03/03/golang-channel-design-and-source/)。

另外，channel目前都还有整个社群都无法调优的问题，比如[runtime: select on a shared channel is slow with many Ps](https://github.com/golang/go/issues/20351)。


---

本篇的模型可以类比为你现在是个企业主，开工厂进行工业生产了。

---
	
所有代码都在[https://github.com/baixiaoustc/go_concurrency/blob/master/second_post_test.go](https://github.com/baixiaoustc/go_concurrency/blob/master/second_post_test.go)中能找到。