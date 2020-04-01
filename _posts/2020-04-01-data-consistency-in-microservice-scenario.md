---
author: baixiaoustc
comments: true
date: 2020-04-01 12:12:46+00:00
layout: post
slug: 2020-04-01-data-consistency-in-microservice-scenario
title: 微服务场景下的数据一致性
categories:
- 后端技术
tags:
- 分布式 
- 微服务
---

* content 
{:toc}

前文简述了「领域内的数据一致性」，

# 微服务之间的数据同步模型

## 同步请求

## 同步请求+重试

## 同步请求+回执

## 同步请求+轮询

## 异步队列

业务场景：消息异步处理模式与接口异步调用模式类似，多应用于非核心链路上负载较高的处理环节中，井且服务的上游不关心下游的处理结果，下游也不需要向上游返回处理结果。

注意 oldest，

## 异步队列+落表

对照 mns 系统

## 同步请求+异步队列，请求重放系统

## 异步最大化

# 为什么补偿型不行？

# 参考

* [分布式事务一致性解决方案别](https://www.cnblogs.com/williamjie/p/11200885.html)
* [微服务下的数据一致性的几种实现方式之概述](https://www.jianshu.com/p/b264a196b177)