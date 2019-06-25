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


思考几个问题：

- 为什么搜索是 **近实时** 的？
- 为什么文档的 CRUD (创建-读取-更新-删除) 操作是 **实时** 的?


# 复习一遍从上到下的整体结构

这里有篇[文章](http://www.zhuanzhi.ai/document/4f97036243052fd5577c0ecf188b06dd)讲解的很形象：

![](http://image99.renyit.com/image/2019-06-13-1.jpeg)
这是集群cluster。

![](http://image99.renyit.com/image/2019-06-13-2.jpeg)
这是节点Node：就是个机器。

![](http://image99.renyit.com/image/2019-06-13-3.jpeg)
由一个或者多个节点，多个绿色小方块组合在一起形成一个ElasticSearch的索引。

![](http://image99.renyit.com/image/2019-06-13-4.jpeg)
在一个索引下，分布在多个节点里的绿色小方块称为分片：Shard。

![](http://image99.renyit.com/image/2019-06-13-5.jpeg)

一个分片就是一个Lucene Index。

![](http://image99.renyit.com/image/2019-06-13-6.jpeg)
在Lucene里面有很多小的Segment，即为存储的最小管理单元。

我们分别从Node维度、Shard维度、Segment维度来阐明为啥Elasticsearch这么快。

# Node节点维度

多节点的集群方案，提高了整个系统的并发处理能力。

## 多节点的集群方案

路由一个文档到一个分片中：当索引一个文档的时候，文档会被存储到一个主分片中。 Elasticsearch 如何知道一个文档应该存放到哪个分片中呢？实际上，这个过程是根据下面这个公式决定的：

> shard = hash(routing) % `number_of_primary_shards`

routing 是一个可变值，默认是文档的 _id ，也可以设置成一个自定义的值。这就解释了为什么我们要在创建索引的时候就确定好主分片的数量 并且永远不会改变这个数量：因为如果数量变化了，那么所有之前路由的值都会无效，文档也再也找不到了。

确定了在哪个分片中，可以判定其在哪个节点上。

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




## 对比LSM树

# Segment段维度

## 倒排索引

都说倒排索引提升了搜索的速度，那么具体采用了哪些架构或者数据结构来达成这一目标？

![](http://image99.renyit.com/image/2019-06-23-1.jpg)

如上是Lucene中实际的索引结构。用例子来说明上述三个概念：

![](http://image99.renyit.com/image/2019-06-23-4.png)

ID是文档id，那么建立的索引如下:

Name：

![](http://image99.renyit.com/image/2019-06-23-5.png)

Age：

![](http://image99.renyit.com/image/2019-06-23-6.png)

Sex：

![](http://image99.renyit.com/image/2019-06-23-7.png)

### Posting List
可见为每个字段都建立了一个倒排索引。Posting list就是一个int的数组，存储了所有符合某个term的文档id。实际上，除此之外还包含：文档的数量、词条在每个文档中出现的次数、出现的位置、每个文档的长度、所有文档的平均长度等，在计算相关度时使用。

### Term Dictionary
假设我们有很多个 term，比如：

> Carla,Sara,Elin,Ada,Patty,Kate,Selena

如果按照这样的顺序排列，找出某个特定的 term 一定很慢，因为 term 没有排序，需要全部过滤一遍才能找出特定的 term。排序之后就变成了：

> Ada,Carla,Elin,Kate,Patty,Sara,Selena

这样我们可以用二分查找的方式，比全遍历更快地找出目标的 term。这个就是 term dictionary。有了 term dictionary 之后，可以用 logN 次磁盘查找得到目标。

### Term Index
但是磁盘的随机读操作仍然是非常昂贵的（一次 random access 大概需要 10ms 的时间）。所以尽量少的读磁盘，有必要把一些数据缓存到内存里。但是整个 term dictionary 本身又太大了，无法完整地放到内存里。于是就有了 term index。term index 有点像一本字典的大的章节表。比如：

A 开头的 term ……………. Xxx 页

C 开头的 term ……………. Yyy 页

E 开头的 term ……………. Zzz 页

如果所有的 term 都是英文字符的话，可能这个 term index 就真的是 26 个英文字符表构成的了。但是实际的情况是，term 未必都是英文字符，term 可以是任意的 byte 数组。而且 26 个英文字符也未必是每一个字符都有均等的 term，比如 x 字符开头的 term 可能一个都没有，而 s 开头的 term 又特别多。实际的 term index 是一棵 trie 树：

![](http://image99.renyit.com/image/2019-06-23-2.png)

例子是一个包含 "A", "to", "tea", "ted", "ten", "i", "in", 和 "inn" 的 trie 树。这棵树不会包含所有的 term，它包含的是 term 的一些前缀。通过 term index 可以快速地定位到 term dictionary 的某个 offset，然后从这个位置再往后顺序查找。

现在我们可以回答“为什么 Elasticsearch/Lucene 检索可以比 mysql 快了。Mysql 只有 term dictionary 这一层，是以 b-tree 排序的方式存储在磁盘上的。检索一个 term 需要若干次的 random access 的磁盘操作。而 Lucene 在 term dictionary 的基础上添加了 term index 来加速检索，term index 以树的形式缓存在内存中。从 term index 查到对应的 term dictionary 的 block 位置之后，再去磁盘上找 term，大大减少了磁盘的 random access 次数。

## FST(finite-state transducer)

实际上，Lucene 内部的 Term Index 是用的「变种的」trie树，即 FST 。FST 比 trie树好在哪？trie树只共享了前缀，而 FST 既共享前缀也共享后缀，更加的节省空间。

一个FST是一个6元组 (Q, I, O, S, E, f):

- Q是一个有限的状态集
- I是一个有限的输入符号集
- O是一个有限的输出符号集
- S是Q中的一个状态，称为初始状态
- E是Q的一个子集，称为终止状态集
- f是转换函数, f ⊆ Q × (I∪{ε}) × (O∪{ε}) × Q，其中ε表示空字符。
即从一个状态q1开始，接收一个输入字符i，可以到达另一个状态q2，并产生输出o。

例如有下面一组映射关系：

	cat -> 5
	deep -> 10
	do -> 15
	dog -> 2
	dogs -> 8

可以用下图中的FST来表示：

![](http://image99.renyit.com/image/2019-06-25-1.png)

这篇文章讲的很好：[关于Lucene的词典FST深入剖析](https://www.shenyanchao.cn/blog/2018/12/04/lucene-fst/)

想想为啥不用HashMap？耗内存啊！牺牲了一点性能来节约内存，旨在把所有Term Index都放在内存里面，最终的效果是提升了速度。

总结一下，FST有更高的数据压缩率和查询效率，因为词典是常驻内存的，而 FST 有很好的压缩率，所以 FST 在 Lucene 的最新版本中有非常多的使用场景，也是默认的词典数据结构。

## 词典的完整结构

Lucene 的tip文件即为 Term Index 结构，tim文件即为 Term Dictionary 结构。由图可视，tip中存储的就是多个FST，
FST中存储的是<单词前缀，以该前缀开头的所有Term的压缩块在磁盘中的位置>。即为前文提到的从 term index 查到对应的 term dictionary 的 block 位置之后，再去磁盘上找 term，大大减少了磁盘的 random access 次数。

![](http://image99.renyit.com/image/2019-06-24-2.png)

## DocValues

Lucene 从 4.0 开始支持 DocValues，极大降低了内存的占用，减少了磁盘上的尺寸并且提高了加载数据到内存计算的吞吐能力。

# 总结

![](http://image99.renyit.com/image/2019-06-24-1.jpg)


# 参考

- https://www.elastic.co/guide/cn/elasticsearch/guide/current/dynamic-indices.html
- [https://www.jianshu.com/p/28fb017be7a7](https://www.jianshu.com/p/28fb017be7a7)
- [lucene的内部结构](https://www.infoq.cn/article/database-timestamp-02)
- [倒排索引的介绍](https://www.cnblogs.com/kukri/p/9996104.html)
- [介绍FST](https://www.cnblogs.com/LBSer/p/4119841.html)
- [介绍FST](https://blog.csdn.net/zx2011302580235/article/details/88594342)