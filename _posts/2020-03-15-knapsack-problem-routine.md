---
author: baixiaoustc
comments: true
date: 2020-03-15 12:12:46+00:00
layout: post
slug: 2020-03-15-knapsack-problem-routine
title: 背包问题套路
categories:
- 后端技术
tags:
- algorithm 
- golang 
---

* content 
{:toc}

# 背包问题

背包问题是动态规划中一个子类。

## 01背包问题

问题描述：

> 有n个物品，它们有各自的体积和价值，现有给定容量的背包，如何让背包里装入的物品具有最大的价值总和？

问题分析：

定义一些变量：Vi表示第 i 个物品的价值，Wi表示第 i 个物品的体积，背包问题抽象化（X1，X2，…，Xn，其中 Xi 取0或1，表示第 i 个物品选或不选）。**注意，每个物品只能最多拿一次。**

1. 建立模型，即求max(V1X1+V2X2+…+VnXn)；
2. 寻找约束条件，W1X1+W2X2+…+WnXn < capacity；

举个例子：

	n = 3, capacity = 4
	weight = [2, 1, 3]
	value = [4, 2, 3]
	
应该返回6，选择前两个物品。	


### 二维DP

根据之前的套路，先明确「状态」，比较浅显的一种描述是「状态」是二维的，分别对应「可选的物品」和「背包的容量」，即 dp[i][j] 表示前 i 个物品的组合在容量 j 的背包的最大价值。

再明确「选择」，很显然就是要不要第 i 个物品，根据选择情况，思考状态转移方程。对于第 i 个物品，如果不选择它，那么当前状态和前 i-1 个物品的状态一致：

	dp[i][j] = dp[i-1][j]
	
如果要选择它，那么从当前状态倒推上一个状态是 dp[i-1][j-weight[i]，它们的关系是：

	dp[i][j] = dp[i-1][j-weight[i]+value[i]
	
求最值：

	dp[i][j] = max{dp[i-1][j], dp[i-1][j-weight[i]+value[i]}

### 一维DP

怎么从二维推导到一维？仿照 https://leetcode-cn.com/problems/coin-change-2/solution/dong-tai-gui-hua-wan-quan-bei-bao-wen-ti-by-liweiw/



### 套公式给零钱兑换问题，并比较

## 完全背包问题

### 二维DP

### 一维DP

https://leetcode-cn.com/problems/coin-change-2/solution/dong-tai-gui-hua-wan-quan-bei-bao-wen-ti-by-liweiw/


## 多重背包问题

# 参考


* [【动态规划】01背包问题（通俗易懂，超基础讲解）](https://blog.csdn.net/qq_38410730/article/details/81667885)
* [xxx](https://leetcode-cn.com/problems/coin-change/solution/yong-bei-bao-wen-ti-si-xiang-lai-li-jie-ying-bi-zh/)

