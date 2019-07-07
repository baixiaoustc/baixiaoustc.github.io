---
author: baixiaoustc
comments: false
date: 2019-07-07 09:54:23+00:00
layout: post
slug: 2019-07-07-two-ways-to-add-call-chain-in-golang-microservice
title: 两种golang微服务中的调用链新增方式
categories:
- 后端技术
tags:
- golang 
- 微服务
---

* content 
{:toc}

# why
为啥要做微服务的调用链？后端架构演进到现在，微服务已成为行业主流。微服务低耦合的实现方式，带来的高效开发和动态扩容部署等优势自不必说，同时也带来了维护上的成本。为了分析慢请求，不能像以前「巨服务」时代一样直接在请求进程中各个阶段加日志（反正都是函数调用），而是需要通过一个完整的链路把请求经过的所有微服务节点都串起来，分析在每个微服务中的阶段耗时是否合理。

# what
具体的前后端搭建在前同事liudanking的博文中[微服务troubleshooting利器——调用链](https://liudanking.com/arch/micro-service-troubleshooting-tool-distributed-tracing/)有较详细的说明，基本流程为：

1. 流量入口申请`trace_id`注入到请求header中
2. 在微服务内部调用的每一跳中，生成一个`span_id_n`，形成上下游关联关系
3. 每次内部调用完成都在日志上进行呈现
4. 不仅限于http api调用，亦可手动添加对redis/mysql等组件的调用关系

# how
本文主要讲述如何快速地在业务服务中将上述串联信息（`trace_id`和`span_id`）一级一级的往下传递。具体来讲，就是微服务接收到请求时，网络框架生成的 goroutine 会 extract 出上游的串联信息，标记本地节点，在发起向下游的请求时再将串联信息注入到http的header中。

那么在代码实现上，就有如下的几种方案：

## 0，程序员手动传递串联信息
what the fxxk，在业务复杂的场景下，一个请求在一个微服务中都会经过漫长的函数调用，由程序员在每个途径函数都显式地传递入参是一个巨大的体力活，这不是本文要讨论的。

## 1，利用golang的AST来自动生成代码
参考前文系列：[golang深入源代码系列之三：自动生成代码
](https://baixiaoustc.github.io/2019/01/23/2019-01-23-golang-code-inspector-3-auto-generation-code/)，我们可以在模式比较固定的情况下，针对我们微服务代码的组织形式，有效地利用golang的AST功能来自动生成传递串联信息的代码。

具体来讲，是将串联信息（`trace_id`和`span_id`）封装在context中，函数在上下游调用时通过context进行传递。我们开发了一个自动生成代码的工具，会自动寻找发起内部调用的出口，并由此往上溯源，自动添加沿途的context信息，最终将串联信息首尾连接起来。

这个方案的缺点是需要业务代码保持固定的形式，否则工具可能无法识别。

## 2，利用golang的gls本地存储
golang官方没有 gls 的实现方式，目前可见的有几种方式：

1. https://github.com/huandu/go-tls
	- Package tls provides TLS for any goroutine by hijacking runtime.goexit on stack. 
	- 作者不推荐生产环境
	- 不是真正的goroutineid
	- 很多汇编代码不是很好维护

2. https://github.com/jtolds/gls
	- Goroutine local storage on current goroutine's stack.
	- 需要替换`go`关键字为项目的`Go`
	- 项目在goroutine的stack上存储信息
	- 很多汇编代码不是很好维护

我们最终没有采取上述方案，而是自己写了一个轻量的gls本地存储。实现上也很简单，不到200行代码即可完成。总体思路是：

- 用简易的环形队列来存储 M 个`sync.Map`实现的 local storage（大于等于3个）
- 假设g为当前时刻 local storage 的索引
- 如果 local storage[g] 没有查找到当前goid的数据，则尝试 local storage[g-1]，甚至继续往前
- 定时重置并删除 local storage[g-M+1]

如此，不需要在业务代码的每个上下游函数中显示地增加context入参，而只需要要请求的入口和出口处，存储和获取该请求（对应的goroutine）的串联信息，并传递至下一次请求中即可，对业务代码的侵入性几乎为零。唯一需要注意的是自己维护的环形队列下接的`sync.Map`的内存耗用和给系统带来的性能损耗，在我们的业务模拟中，这些损耗都可以接受。

# show
最终通过`trace_id`可以看出一次请求的内部调用方式和用时：
![](http://image99.renyit.com/image/2019-07-07-1.png)