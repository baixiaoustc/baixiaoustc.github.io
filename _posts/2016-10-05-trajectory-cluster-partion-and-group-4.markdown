---
author: baixiaoustc
comments: true
date: 2016-10-05 09:39:15+00:00
layout: post
slug: 2016-10-05-trajectory-cluster-partion-and-group-4
title: 路线轨迹聚集：分割和汇集（4：线段密度的定义）
wordpress_id: 229
categories:
- 路线聚集
tags:
- trajectory
---

《Trajectory Clustering- A Partition-and-Group Framework》学习笔记

分割之后，原文提出汇集线段为cluster的算法。是基于DBSCAN算法的改造，由于DBSCAN的算法属于基于密度的聚类算法，因此有必要定义线段的密度。

承接（2）中定义的线段距离函数dist(Li,Lj)=w⊥⋅d⊥(Li,Lj)+w∥⋅d∥(Li,Lj)+wθ⋅dθ(Li,Lj)，原文提出线段密度的几个概念：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/10/未命名.png)

首先定义D为所有线段的集合。


1、线段的ε邻域Nε(Li): Nε(Li)={Lj∈D|dist(Li,Lj)≤ε}
2、核心线段：线段Li(Li∈D)被称为核心线段当且仅当|Nε(Li)|≥MinLns
3、线段的直接密度可达：线段Li∈D直接密度可达线段Lj∈D当且仅当Li∈Nε(Lj)并且|Nε(Lj)|≥MinLns
4、线段的密度可达：线段Li∈D密度可达于线段Lj∈D，当且仅当存在一组线段Lj,Lj−1,...,Li+1,Li∈D并且线段 Lk直接密度可达于线段Lk+1
5、线段的密度连接：线段Li∈D密度相连于线段Lj∈D当且仅当存在一条线段Lk∈D使得线段Li与线段 Lj均密度可达于线段Lk
6、线段的密度连接集：一个非空子集C⊆D被称作密度连接集当且仅当C满足以下两个条件：
1）连接性：∀Li,Lj∈C,Li密度相连于Lj
2）最大化：∀Li,Lj∈D，如果 Li∈C并且Lj密度可达于Li，则有Lj∈C




















举个例子：![](http://img.blog.csdn.net/20160330183606288)


如上图，令MinLns=3，加粗的线段为核心线段，线段的ε邻域用一个椭圆表示，基于以上的定义，可得到如下的结论：
1） L1,L2,L3,L4,L5均为加粗线段，即为核心线段；
2）L2(或L3)直接密度可达于L1，因为L2及L3均在L1的红色椭圆里；
3） L6密度可达于L1，然而反则不是：因为L3直接密度达于L1，而L6直接密度可达于L3，因此L6密度可达于L1，但由于L6不是核心线段，因此这种密度可达关系不具有对称性；
4） L1,L4与L5均为密度相连；






















