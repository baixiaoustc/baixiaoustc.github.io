---
author: baixiaoustc
comments: true
date: 2016-09-20 15:46:53+00:00
layout: post
slug: 2016-09-20-trajectory-clustering-partion-and-group-2
title: 路线轨迹聚集：分割和汇集（2：线段距离的定义）
wordpress_id: 212
categories:
- 路线聚集
tags:
- trajectory
---

《Trajectory Clustering- A Partition-and-Group Framework》学习笔记

为了线段的汇集，需要分辨线段之间的距离，故引入线段的距离函数。含三部分：(i) the perpendicular distance (垂直距离)， (ii) the parallel distance (平行距离)，and (iii) the angle distance (角度距离)。下图表示清楚：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/09/未命名.png)

通过向量运算可计算上图Ps／Pe的值，以及θ：

![%e6%9c%aa%e5%91%bd%e5%90%8d](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/09/未命名-1.png)

最终，dist(Li,Lj)=w⊥⋅d⊥(Li,Lj)+w∥⋅d∥(Li,Lj)+wθ⋅dθ(Li,Lj)dist(L_i, L_j)，一般权重都取1。

PS，https://github.com/proxypoke/vector用于向量计算。
