---
author: baixiaoustc
comments: false
date: 2019-06-13 09:54:23+00:00
layout: post
slug: 2019-06-13-elasticsearch-why-so-quick
title: Elasticsearch为啥这么快
categories:
- 后端技术
tags:
- elasticsearch 
- 搜索
---

* content 
{:toc}


思考几个问题

- 为什么搜索是 **近实时** 的？
- 为什么文档的 CRUD (创建-读取-更新-删除) 操作是 **实时** 的?

# 复习一遍从上到下的整体结构

这里有篇[文章](http://www.zhuanzhi.ai/document/4f97036243052fd5577c0ecf188b06dd)讲解的很形象：

![](http://image99.renyit.com/image/2019-06-13-1.jpeg)
这是集群cluster。

![](http://image99.renyit.com/image/2019-06-13-2.jpeg)
这是节点node：就是个机器。

![](http://image99.renyit.com/image/2019-06-13-3.jpeg)
由一个或者多个节点，多个绿色小方块组合在一起形成一个ElasticSearch的索引。

![](http://image99.renyit.com/image/2019-06-13-4.jpeg)
在一个索引下，分布在多个节点里的绿色小方块称为分片：Shard。

![](http://image99.renyit.com/image/2019-06-13-5.jpeg)

一个分片就是一个Lucene Index。

![](http://image99.renyit.com/image/2019-06-13-6.jpeg)
在Lucene里面有很多小的Segment，即为存储的最小管理单元。

# Node节点维度

多节点的集群方案，提高了整个系统的并发处理能力。

## 路由一个文档到一个分片中

当索引一个文档的时候，文档会被存储到一个主分片中。 Elasticsearch 如何知道一个文档应该存放到哪个分片中呢？实际上，这个过程是根据下面这个公式决定的：

> shard = hash(routing) % `number_of_primary_shards`

routing 是一个可变值，默认是文档的 _id ，也可以设置成一个自定义的值。这就解释了为什么我们要在创建索引的时候就确定好主分片的数量 并且永远不会改变这个数量：因为如果数量变化了，那么所有之前路由的值都会无效，文档也再也找不到了。

## 协调节点

每个节点都可以接受客户端的请求，每个节点都知道集群中任一文档位置，所以可以直接将请求转发到需要的节点上。当接受请求后，节点变为「协调节点」。从这个角度，整个系统可以接受更高的并发请求，当然搜索的就更快了。

以更新文档为例：

![](http://image99.renyit.com/image/2019-06-16-1.png)

- 客户端向 Node 1 发送更新请求。
- 它将请求转发到主分片所在的 Node 3 。
- Node 3 从主分片检索文档，修改 `_source` 字段中的 JSON ，并且尝试重新索引主分片的文档。 如果文档已经被另一个进程修改，它会重试步骤 3 ，超过 `retry_on_conflict` 次后放弃。
- 如果 Node 3 成功地更新文档，它将新版本的文档并行转发到 Node 1 和 Node 2 上的副本分片，重新建立索引。 一旦所有副本分片都返回成功， Node 3 向协调节点也返回成功，协调节点向客户端返回成功。


## 乐观并发控制

Elasticsearch 中使用的这种方法假定冲突是不可能发生的，并且不会阻塞正在尝试的操作。因为没有阻塞，所以提升了索引的速度，同时通过`_version`字段来保证并发情况下的正确性：

	PUT /website/blog/1?version=1 
	{
	  "title": "My first blog entry",
	  "text":  "Starting to get the hang of this..."
	}

控制在我们索引中的文档只有现在的`_version`为 1 时，本次更新才能成功。

# Shard分片维度

## Segment的不变性

在底层采用了分段的存储模式，使它在读写时几乎完全避免了锁的出现，大大提升了读写性能。

- 不需要锁。如果你从来不更新索引，你就不需要担心多进程同时修改数据的问题。
- 一旦索引被读入内核的文件系统缓存，便会留在哪里，由于其不变性。只要文件系统缓存中还有足够的空间，那么大部分读请求会直接请求内存，而不会命中磁盘。这提供了很大的性能提升。
- 其它缓存(像filter缓存)，在索引的生命周期内始终有效。它们不需要在每次数据改变时被重建，因为数据不会变化。
- 写入单个大的倒排索引允许数据被压缩，减少磁盘 I/O 和 需要被缓存到内存的索引的使用量。

怎样在保留不变性的前提下实现倒排索引的更新？用上文提到的`_version`，创建更多的索引文档。

## 提升写入速度

为了提升写索引速度，并且同时保证可靠性，Elasticsearch 增加了一个 translog ，或者叫事务日志，在每一次对 Elasticsearch 进行操作时均进行了日志记录。

### 一个文档被索引之后，就会被添加到内存缓冲区，并且 追加到了 translog 
![](http://image99.renyit.com/image/2019-06-16-2.png)

### 分片每秒被刷新（refresh）一次：
![](http://image99.renyit.com/image/2019-06-16-3.png)

- 这些在内存缓冲区的文档被写入到一个新的段中，且没有进行 fsync 操作。
- 这个段被打开，使其可被搜索。
- 内存缓冲区被清空。

### 这个进程继续工作，更多的文档被添加到内存缓冲区和追加到事务日志
![](http://image99.renyit.com/image/2019-06-16-4.png)

### 每隔一段时间--例如 translog 变得越来越大--索引被刷新（flush）；一个新的 translog 被创建，并且一个全量提交被执行:
![](http://image99.renyit.com/image/2019-06-16-5.png)

- 所有在内存缓冲区的文档都被写入一个新的段。
- 缓冲区被清空。
- 一个提交点被写入硬盘。
- 文件系统缓存通过 fsync 被刷新（flush）。
- 老的 translog 被删除。


## FST(finite-state transducer)有更高的数据压缩率和查询效率，因为词典是常驻内存的，而 FST 有很好的压缩率，所以 FST 在 Lucene 的最新版本中有非常多的使用场景，也是默认的词典数据结构。常驻内存也是快的原因吗

## 对比LSM树

# Segment段维度

Lucene 从 4.0 开始支持 DocValues，极大降低了内存的占用，减少了磁盘上的尺寸并且提高了加载数据到内存计算的吞吐能力。


# 参考

https://www.elastic.co/guide/cn/elasticsearch/guide/current/dynamic-indices.html
https://www.jianshu.com/p/28fb017be7a7