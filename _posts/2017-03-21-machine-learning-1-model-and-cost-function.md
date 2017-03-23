---
author: baixiaoustc
comments: true
date: 2017-03-21 16:54:23+00:00
layout: post
slug: 2017-03-21-machine-learning-1-model-and-cost-function
title: 机器学习的学习1：model和cost function
categories:
- 机器学习
tags:
- machine learning
---



学习自[Andrew Ng的coursera讲义](https://www.coursera.org/learn/machine-learning/home/welcome)。


## model


### 机器学习怎么定义？


>Tom Mitchell (1998) Well-posed Learning
Problem: A computer program is said to learn
from experience E with respect to some task T
and some performance measure P, if its
performance on T, as measured by P, improves
with experience E. 

就是说，机器学习针对一个任务，在能测量的情况下，能随着经验不断进步。这里的经验，就是指训练集。


### 机器学习怎么分类？


1. Supervised learning（可监督学习），具体又分为回归问题（Regression: Predict continuous valued output）和分类问题（Classification Discrete valued output）
2. Unsupervised learning（无监督学习），待补充



### 模型


预测房价的问题，已掌握数据集里房价对房屋面积的对应关系，需要预测其他房屋的房价。

![如图](http://oiz85bhef.bkt.clouddn.com/image/L2-1.png)

怎么建立模型？最重要的是求得Hypothesis函数，该函数描述了输入（房屋面积）到输出（评估的房价）的对应关系。

![](http://oiz85bhef.bkt.clouddn.com/image/L2-2.png)

在线性回归问题中，Hypothesis函数可以简化为线性函数。 

## cost function


那么如何判定所选的Hypothesis函数好不好？或者说如何选择最好的Hypothesis函数？需要用到cost function的概念。cost function（称为J）描述，Hypothesis函数的计算值和真实值的差异。

![](http://oiz85bhef.bkt.clouddn.com/image/L2-3.png)

容易看出，在简化的线性回归中（仅一个参数theta1），J(theta)是关于theta1的二次函数。而theta0/theta1都存在时，J(theta)是如下的函数。

![](http://oiz85bhef.bkt.clouddn.com/image/L2-4.png)


线性回归的目标是找到合适的theta，使得cost function最小。