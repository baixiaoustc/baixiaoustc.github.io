---
author: baixiaoustc
comments: false
date: 2020-02-13 09:54:23+00:00
layout: post
slug: 2020-02-13-how-to-define-quick-in-kafka
title: 怎么定义Kafka的快？
categories:
- 后端技术
tags:
- kafka 
- IO
---

* content 
{:toc}

研读文章《[why kafka is so fast](https://medium.com/swlh/why-kafka-is-so-fast-bde0d987cd03)》（译文《[Kafka为什么这么快？](https://mp.weixin.qq.com/s/wq08nVDHVR1lOJBK4KZbyA)》），看看怎么来定义Kafka的**「快」**?

快是指延迟低？还是抖动小？还是指实时性？抑或是吞吐量大？

### 是延迟低吗

很多文章起篇就写 Kafka 是高吞吐低延迟，那么 Kafka 是低延迟吗？一个很重要的特点是，Producer 在写入操作时并没有调用 fsync，而是仅要求写入 I/0 缓冲区，然后等待操作系统决定什么时候真正写入磁盘。

从这个角度来看，并不能认为 Kafka 是延迟低，因为最终是由操作系统来决定写入时间，延迟时间不可控。

### 是抖动小吗

由 Kafka 的顺序读写特性来看，Producer 的写入速度和 Consumer 的读取速度应该是比较平稳的，即抖动小。但是值得注意的是，由于 Consumer 的 pull 模型，最终的消费速度并不是特别可控的，这就带来了可能的抖动性。

### 是实时性吗

> 注意：“实时”并不意味着“快”，它的意思是“可预测的”。具体来说，实时意味着完成一个动作具有时间限制，也就是最后期限。如果一个系统不能满足这个要求，它就不能被归类为”实时系统“。能够容忍一定范围内延迟的系统被称为“近实时”系统。从吞吐量的角度来说，实时系统通常比近实时或非实时系统要慢。

从上述定义，Kafka 只能用于近实时系统。

### 是高吞吐吗

这个应该是我们认为 Kafka 优秀的最大因素，上述对于延迟和抖动的牺牲，都是为了达成高吞吐这个🐂🍺闪闪的特点。

也可以参照我的前文《[Kafka为啥这么高吞吐](https://baixiaoustc.github.io/2019/07/10/2019-07-10-kafka-why-so-high-write-throughput/)》查看。
