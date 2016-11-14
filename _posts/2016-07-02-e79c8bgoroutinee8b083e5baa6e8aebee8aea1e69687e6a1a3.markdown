---
author: baixiaoustc
comments: true
date: 2016-07-02 03:36:10+00:00
layout: post
link: http://baixiaoustc.com/wordpress/2016/07/02/%e7%9c%8bgoroutine%e8%b0%83%e5%ba%a6%e8%ae%be%e8%ae%a1%e6%96%87%e6%a1%a3/
slug: '%e7%9c%8bgoroutine%e8%b0%83%e5%ba%a6%e8%ae%be%e8%ae%a1%e6%96%87%e6%a1%a3'
title: golang调度器设计
wordpress_id: 130
categories:
- 后端技术
tags:
- goroutine
- schedule
---

## [设计文档](https://docs.google.com/document/d/1TTj4T2JO42uD5ID9e89oa0sLKhJYD0Y_kqxDv3I3XMw/edit#)


P (Processors)的设计：

    
    struct P
    {
    Lock;
    G *gfree; // freelist, moved from sched
    G *ghead; // runnable, moved from sched
    G *gtail;
    MCache *mcache; // moved from M
    FixAlloc *stackalloc; // moved from M
    uint64 ncgocall;
    GCStats gcstats;
    // etc
    ...
    };
    
    P *allp; // [GOMAXPROCS]
    P *idlep; // lock-free list
    


P可以抽象为手推车。每个M（gopher）都需要一个P（手推车）来执行G（搬砖）。When an M is willing to start executing Go code, it must pop a P form the list. When an M ends executing Go code, it pushes the P to the list.


### 调度


新建的G，或者刚变为可执行的G，都进入P的可执行ghead队列。（要搬的砖放入到手推车里面）。当一个P里的G执行完后，M会去另一个P的队列里偷一半的G过来。（从别人的手推车里面偷一半的砖过来）。


### 全局G队列


当M几次试图偷别的P的G都失败后，会检查全局G队列是否有空闲的G。（gopher没有偷到砖，去厂区的公共场地看看有没有砖）。


## [更详细的解释](http://morsmachine.dk/go-scheduler)




### 为啥需要golang的调度器？


1、因为操作系统的内核态线程太笨重，消耗很多资源是golang不需要用到的，这样的话当很多goroutine并发时系统资源消耗巨大。2、因为golang自身模型结构需要，比如gc stw的时候，就需要所有线程停止并且内存达到一致性，这个要求在操作系统的内核态线程调度上很难满足。


### golang的用户态线程模型


三种常见模型：

1、N:1，n个用户态线程对应一个内核态线程，缺点是无法利用多核优势。

2、1:1，一对一的模型可以用到多核，但是在每个核上上下文切换时由于会陷入内核（[TRAP](https://en.wikipedia.org/wiki/Trap_(computing))）而带来性能损耗。

3、M:N，兼顾上面两种情况，golang调度器采用。

![](http://morsmachine.dk/our-cast.jpg)

调度器抽象了三种实体：M（machine）代表内核态线程；G（goroutine）代表用户态线程，包含了goroutine需要的各种栈、指令指针等重要信息。P（processer）代表调度中的上下文切换。P的个数是由GOMAXPROCS环境变量或者GOMAXPROCS（）函数指定的，在程序中一般不会改变，不然代价很大，会stw。


![](http://morsmachine.dk/in-motion.jpg)




如上是三种实体执行程序的模型。每个M需要搭配一个P来执行一个G，且P挂有一队待执行的G队列（runqueue）。用go语句新生成的G会加入到runqueue中，当调度点到来时，P会pop一个runqueue中的G，设置好栈、指令指针等，开始执行。




最初的设计是只有一个全局的runqueue，但是发现P会经常阻塞在等待runqueue的互斥过程中，所以现在每个P都有自己的runqueue。




只要P的runqueue中G不为空，这样的调度会持续下去。但是有几种情况会打破这种平衡态。




### syscall


如最早那篇文章在讨论的，为啥要引入P的概念，直接用M不久行了吗？还真不行，P的存在意义是当M阻塞的时候，可以把P关联到其他M上去。

![](http://morsmachine.dk/syscall.jpg)

比如，当M0阻塞在syscall的时候，其关联的P和P的runqueue会被转移给M1，M0会继续持有G0。M1可以是专为此次转移而创建的，也可能是来自线程缓冲池。当syscall返回后，M0需要关联一个P来完成G0的执行，通常的办法是去别的M处偷一个P，如果不行的话，就把G0放到全局runqueue中，然后M0自己去线程缓冲池休眠。

每当有P执行完自己的runqueue后，都会到全局runqueue来获取G。P也会周期性地检查全局runqueue的情况，不然全局runqueue可能会一直得不到执行。

上述对syscall的描述也说明了为啥golang的程序执行需要多线程，尽管GOMAXPROCS可能为1。


### 偷取工作


另一种情况是当M执行完自己的P的runqueue，也会打破上述的调度平衡态。当P的runqueue的量相比而言不平均时就会发生这种情况，导致一个P耗尽了自己的runqueue，但是系统还有很多工作要做。这种情况发生时，M会先去全局runqueue处取G，如果没有的话，就需要去偷别的M的G了，如下图所示。

![](http://morsmachine.dk/steal.jpg)



中文翻译见[https://www.douban.com/note/300631999/](https://www.douban.com/note/300631999/)
