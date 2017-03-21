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



学习自[Andrew Ng的coursera讲义](https://www.coursera.org/learn/machine-learning/home/welcome)

##model
###机器学习怎么定义？

>Tom Mitchell (1998) Well-posed Learning
Problem: A computer program is said to learn
from experience E with respect to some task T
and some performance measure P, if its
performance on T, as measured by P, improves
with experience E. 

就是说，机器学习针对一个任务，在能测量的情况下，能随着经验不断进步。这里的经验，就是指训练集。

###机器学习怎么分类？

1. Supervised learning
2. Unsupervised learning

Supervised learning（可监督学习），具体又分为回归问题（Regression: Predict continuous valued output）和分类问题（Classification Discrete valued output）

Unsupervised learning（无监督学习），待补充

###模型

预测房价的问题，已有房价对房屋面积的对应关系，需要预测其他房屋的房价。

![如图](http://oiz85bhef.bkt.clouddn.com/image/L2-1L2-1.png)


##cost function
