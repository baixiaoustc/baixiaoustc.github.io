---
author: baixiaoustc
comments: false
date: 2019-06-13 09:54:23+00:00
layout: post
slug: 2019-06-13-elasticsearch-why-so-quick
title: elasticsearch为啥这么快
categories:
- 后端技术
tags:
- elasticsearch 
- 搜索
---

* content 
{:toc}

# 复习一遍从上到下的整体结构

这里有篇[文章](http://www.zhuanzhi.ai/document/4f97036243052fd5577c0ecf188b06dd)讲解的很有意思：

![](http://image99.renyit.com/image/2019-06-13-1.jpeg)
这是集群cluster。

![](http://image99.renyit.com/image/2019-06-13-2.jpeg)
这是节点node：就是个机器。

![](http://image99.renyit.com/image/2019-06-13-3.jpeg)
在一个或者多个节点直接，多个绿色小方块组合在一起形成一个ElasticSearch的索引。

![](http://image99.renyit.com/image/2019-06-13-4.jpeg)
在一个索引下，分布在多个节点里的绿色小方块称为分片——Shard。

![](http://image99.renyit.com/image/2019-06-13-5.jpeg)
一个分片就是一个Lucene Index。

![](http://image99.renyit.com/image/2019-06-13-6.jpeg)
在Lucene里面有很多小的segment，即为存储的最小管理单元。