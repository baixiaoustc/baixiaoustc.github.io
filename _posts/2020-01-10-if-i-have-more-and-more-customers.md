---
author: baixiaoustc
comments: true
date: 2020-01-10 12:12:46+00:00
layout: post
slug: 2020-01-10-if-i-have-more-and-more-customers
title: 假如给我百倍流量
categories:
- 后端技术
tags:
- python 
- golang 
- 并发 
- ppt
---

最近写的《假如给我百倍流量》讲稿

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.001.jpeg)

从三到万。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.002.jpeg)

这是一次务虚的分享，主要想介绍大型后端系统的架构演进方案，以及后续的思考。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.003.jpeg)

世间普适的法则。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.004.jpeg)

这个思想很重要，从CPU芯片到硬件到内核到协议到应用，几乎涵盖了所有计算机领域。本图是缓存领域的多个层级。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.005.jpeg)

Linux 内核的层级。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.006.jpeg)

OSI 协议的层级。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.007.jpeg)

我们的项目经过天使轮，开工了。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.008.jpeg)

用 Python 开撸，大学生的水平。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.009.jpeg)

项目干得不错，融了 A 轮。用户量增加后服务器 QPS 压力增大。除了平摊 IO 压力，另外一个考虑是为了平滑上线。不能每次上线期间服务都不可用是吧。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.010.jpeg)

一般使用 Nginx。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.011.jpeg)

负载均衡的基本概念。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.012.jpeg)

继续融资 B1 轮，用户量继续增长。缓存也是很基础的优化方案。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.013.jpeg)

一般使用 Redis。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.014.jpeg)

缓存的一般意义。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.015.jpeg)

继续融资 B2 轮，业务增加了 LBS 的功能，需要用到 PostgreSQL + PostGIS 的能力。但是基于地理信息的数据不适合使用缓存，为了平摊压力，引入读写分离。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.016.jpeg)

左半边服务器的 pg 连接没有画。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.017.jpeg)

读写分离的基本概念。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.018.jpeg)

项目长足发展，融了 C1 轮的钱，用户量也继续上涨。产品设计了很多提交性的功能，为了减轻数据库的写压力，引入了消息队列，削峰填谷。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.019.jpeg)

右边服务器的 MQ 连接没画。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.020.jpeg)

一般使用 Kafka，谈谈 Kafak 高吞吐的实现方式。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.021.jpeg)

继续融资 C2 轮，用户量继续上涨，数据库单机不论是存储量还是吞吐量都已经是瓶颈。现在开始发大招：数据库分库分表。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.022.jpeg)

分库分表后的架构。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.023.jpeg)

分库分表后的的概念，记住不要轻易使用，特别是在项目前期不要过度设计。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.024.jpeg)

继续融资 C3 轮，用户量继续上涨。现有架构已经 hold 不住了。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.025.jpeg)

首先是数据库连接数吃紧。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.026.jpeg)

无法做资源隔离，作为一个开发，可能自己的功能没有问题，但是数据库被别人拖挂，服务本身也可能被别人拖挂。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.027.jpeg)

业务越多，整体架构越复杂，微服务带来的收益越大。
过早引入反而是增加开发和运维的工作。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.028.jpeg)

数据库连接数减少。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.029.jpeg)

整个身心都清爽了。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.030.jpeg)

如果一个人负责太多微服务，还不如他写到一个服务里面。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.031.jpeg)

胜利在前方，但是感觉架构又拖了后腿。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.032.jpeg)

Google 爸爸已经帮你准备好了。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.033.jpeg)

不管什么语言什么框架写的应用（Go, Python, Node.js），Kubernetes 都可以在任何环境中安全的启动它，物理服务器、虚拟机、云环境。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.034.jpeg)

Kubernetes 如果发现有节点工作不饱和，便会重新分配 pod，帮助我们节省开销，高效的利用内存、处理器等资源。

如果一个节点宕机了，Kubernetes 会自动重新创建之前运行在此节点上的 pod，在其他节点上运行。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.035.jpeg)

网络、负载均衡、复制等特性，对于 Kubernetes 都是开箱即用的。

pod 是无状态运行的，任何时候有 pod 宕了，立马会有其他 pod 接替它的工作，用户完全感觉不到。

如果用户量突然暴增，现有的 pod 规模不足了，那么会自动创建出一批新的 pod，以适应当前的需求。

反之亦然，当负载降下来的时候，Kubernetes 也会自动缩减 pod 的数量。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.036.jpeg)

利用镜像，从开发到调试到上线一条龙，酸爽。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.037.jpeg)

Kubernetes 如此流行的一个重要原因是：应用会一直顺利运行，不会被 pod 或 节点的故障所中断。

如果出现故障，Kubernetes 会创建必要数量的应用镜像，并分配到健康的 pod 或节点中，直到系统恢复。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.038.jpeg)

完善后的架构。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.040.jpeg)

如果继续发展呢？

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.041.jpeg)

上面一排是指导思想，下面一排是具体方案。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.042.jpeg)

计算机领域很重要的思想。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.043.jpeg)

也是很重要的思想。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.044.jpeg)

如果仅用一句话来形容高并发、高可用？副本足以。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.045.jpeg)

IO 复用是节约进程这个资源，让单个进程可以监听多个 fd。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.046.jpeg)

也就是说不要无端提高系统复杂度。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.047.jpeg)

展开分析。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.048.jpeg)

单元化的实现。针对流水型数据，在本单元就消化完成了。
把分流的动作提前到网关处。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.049.jpeg)

针对共享型数据，则涉及到跨地区的访问。比如三地五中心这种经典架构。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.050.jpeg)

异地灾备的基础是，其他地区的数据也要进行冗余存储。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.051.jpeg)

服务治理的进化方向，此处无法展开。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.052.jpeg)

除了 MySQL 和 PostgreqSQL 我们还有啥。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.053.jpeg)

跨领域的结合。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.054.jpeg)

期待量子计算机。

---

![](http://image99.renyit.com/image/%E5%81%87%E5%A6%82%E7%BB%99%E6%88%91%E7%99%BE%E5%80%8D%E6%B5%81%E9%87%8F.055.jpeg)

---