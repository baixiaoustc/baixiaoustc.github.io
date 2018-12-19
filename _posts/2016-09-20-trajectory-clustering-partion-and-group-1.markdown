---
author: baixiaoustc
comments: true
date: 2016-09-20 01:48:15+00:00
layout: post
slug: 2016-09-20-trajectory-clustering-partion-and-group-1
title: 路线轨迹聚集：分割和汇集（1：概述）
wordpress_id: 206
categories:
- 路线聚集
tags:
- golang
- trajectory
---

《Trajectory Clustering- A Partition-and-Group Framework》学习笔记

做路线轨迹的聚集，即是寻找不同轨迹的共同方向，并模拟一条轨迹来代表整个轨迹集的趋势。如果只考虑整个轨迹的话，有可能会丢失轨迹之间的共同信息。如下图，TR1到TR5在前一半部分都有共同趋势，但是在整个轨迹上无法体现：

![](http://img.blog.csdn.net/20160329191114430)

原文提出一种聚集相似路线轨迹的方法：（1）先将路线分割为线段集（线段并不是原路线的一个片段，而是原路线其中两个点之间的线段），（2）再从线段集中寻找类似的线段组成一个个cluster，并找出每个cluster的代表性轨迹。每一条原始轨迹可能属于不同的cluster。可用下图概括：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/09/未命名-6.png)

算法名为TRACLUS (TRAjectory CLUStering)，步骤如下：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/09/未命名-5.png)
