---
author: baixiaoustc
comments: true
date: 2016-10-05 15:43:04+00:00
layout: post
slug: 2016-10-05-trajectory-cluster-partion-and-group-5
title: 路线轨迹聚集：分割和汇集（5：聚类算法）
wordpress_id: 240
categories:
- 路线聚集
tags:
- trajectory
---

《Trajectory Clustering- A Partition-and-Group Framework》学习笔记

原文提出聚类算法，输入是所有线段的集合D，输出是簇cluster的集合O，需要ε和MinLns两个参数。上一篇已经讲到，此算法和DBSCAN很类似，但不同之处在于，不是所有的密度连接集都可以成为cluster，因为需要考虑到cluster中线段来自于轨迹的数量。如果一个cluster的所有线段都来自于同一条轨迹，那么它不能代表轨迹的共同方向。为了避免此种情况，原文提出一个概念为cluster的轨迹基数：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/10/未命名-1.png)

算法流程：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/10/未命名-2.png)

根据此算法，我模拟的结果如下：

1、原始轨迹为黑线

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/10/未命名-6.png)

2、特征点为红色，分割线段为绿色

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/10/未命名-7.png)



3、蓝色为聚类算法后同一个cluster的线段

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/10/未命名-8.png)
