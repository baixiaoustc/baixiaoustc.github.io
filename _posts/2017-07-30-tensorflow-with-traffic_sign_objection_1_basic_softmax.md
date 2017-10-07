---
author: baixiaoustc
comments: true
date: 2017-09-30 12:12:46+00:00
layout: post
slug: 2017-07-30-tensorflow-with-traffic_sign_objection_1_basic_softmax
title: 用tensorflow识别交通标志1:基础和softmax
categories:
- 机器学习
tags:
- python tensorflow
---


手机阅读会有问题-。=

之前用tensorflow提供的目标识别库做了图像识别，那只是借花献佛。如何自己使用tensorflow实现图像识别（本文具体来说是识别交通标志）？如何自己用训练数据训练出神经网络模型？如何提高模型的准确性？开搞！


## 最最基础

### 机器学习到底做什么事情？

回顾之前的文章[机器学习的学习1：model和cost function](http://baixiaoustc.com/2017/03/21/2017-03-21-machine-learning-1-model-and-cost-function/)，了解最基本的输入输出模型及损失函数。简单来说机器学习处理的问题分为回归问题和分类问题。

### 有监督的图像识别做什么事情？

实际上就是个分类问题，把图像判定为某种物体或者标识。具体到识别交通标志这件事情上，就是把图像判定为某种标志。我们这个案例共有62种交通标志，就是说拿到一个图像，判断它符合哪个标志的概率最大，则将其分类到该标志下。

有监督是指什么？是指我们的样本里不仅仅有数据源，并且还已经人为打上了标签，即我们已经知道了它属于某种交通标志。相对应的，无监督是指只有数据源，而不知道它的类别。

### 最终到底要计算什么？

机器学习通过建模，将输入（图像）和输出（判定的标志）映射起来，这个映射函数包含「权重（weights）」和「偏差（bias）」，需要在不断的训练中找到最优值。

数学表达式很简单：Y = X * W + b

### 怎么判断系统的优劣？

如果系统除了训练数据以外还提供了测试数据，那么可以直接利用测试数据，通过判定的准确度来判定权重和偏差是好是坏。如果没有提供测试数据，那就想其他办法吧。。。

我们要做的，就是利用不同的模型，找到对应最优的权重和偏差，讲最终的准确度提高到最大值。


## 单层神经网络

开始了本文的重点。我们先尝试最简单的模型，即单层神经网络。一般来说，神经网络层数越多（越深层）其力量越大。但这不代表单层神经网络没有其用武之地了。

一个简化的单层神经网络如下图

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20171007-102511@2x.jpg)

### 图像预处理

为了建立模型，需要对图像统一处理，将所有图像resize为28*28像素的图像。再者图像的颜色对本案例的意义不大，故用PIL的convert('L') 做了颜色的单一化。

原图像为下图：

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20171007-103349@2x.jpg)

转为下图：

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20171007-103022@2x.jpg)

对所有图像都进行如上的处理，训练数据共4575张，测试数据为2520张。

### 输入输出模型

经过预处理之后，一张图像就被28*28=784个像素点给代表了，即输入层为784个神经元。输出层为0到61共62种类型。通过全连接起来的。

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20171007-144416@2x.jpg)

神经网络中的每个「神经元」对其所有的输入进行加权求和，并添加一个被称为「偏置（bias）」的常数，然后通过一些非线性激活函数来反馈结果。

## 结束

完整代码在[https://github.com/baixiaoustc/tensorflow_tsc](https://github.com/baixiaoustc/tensorflow_tsc)

参考：

[https://mp.weixin.qq.com/s/E6SsvWofiN94JtZWf1f-Ug](https://mp.weixin.qq.com/s/E6SsvWofiN94JtZWf1f-Ug)

