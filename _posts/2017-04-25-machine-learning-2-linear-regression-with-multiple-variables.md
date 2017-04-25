---
author: baixiaoustc
comments: true
date: 2017-04-25 16:54:23+00:00
layout: post
slug: 2017-04-25-machine-learning-2-linear-regression-with-multiple-variables
title: 机器学习的学习2：多变量的线性回归
categories:
- 机器学习
tags:
- machine learning
---



学习自[Andrew Ng的coursera讲义](https://www.coursera.org/learn/machine-learning/home/welcome)。

## 多变量

### 多变量的定义

预测房价的例子，一个变量不足以描述对房价的影响时，需要多个变量共同决定决定房屋的价值，如面积／房间数／年限等。

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170425-091624@2x.jpg)

对应的Hypothesis函数也就强化为所有变量的函数。将上一章的函数扩展，并将x0默认为1，可以得到Hypothesis函数的矩阵数学表示，即theta向量的逆和X向量的乘。

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170425-092131@2x.jpg)

## 多变量的梯度下降法

由单变量扩展来，多变量的梯度下降法在每次迭代的时候需要同步更新所有变量对应的theta（0／1/。。。／n），数学公式跟之前没有大的差别。

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170425-092635@2x.jpg)

### Feature Scaling

多变量带来一个问题，就是不同变量的取值范围可能差异很大。为了将所有变量缩放到一个统一的范围，以加速迭代收敛，引入了Mean normalization（均值归一化）。用训练集中每个变量的均值和范围来重新归一化每个变量。

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170425-094355@2x.jpg)