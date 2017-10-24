---
author: baixiaoustc
comments: true
date: 2017-10-23 12:12:46+00:00
layout: post
slug: 2017-10-23-tensorflow-with-traffic_sign_objection_3_deep_neural_networks
title: 用Tensorflow识别交通标志3:深层神经网络
categories:
- 机器学习
tags:
- python tensorflow
---


手机阅读会有问题-。=

本文在[前文](http://baixiaoustc.com/2017/10/21/2017-10-21-tensorflow-with-traffic_sign_objection_2_optimizer_selection/)的基础上，引入深层神经网络来继续提升图像识别的准确度。

## 神经元的激活

### 神经元结构

先复习一下单层神经网络的基础知识。

我们知道计算机神经网络是模拟人脑的结构，人脑的基本计算单元叫做神经元。下图粗略地描绘了一下人体神经元与我们简化过后的数学模型。在基本生物模型中，每个神经元都从多个树突接受信号，同时顺着轴突传递信号，轴突上有很多轴突末梢和其他的神经元树突连接。树突传导信号到神经元细胞，然后这些信号被加和在一块儿了，如果加和的结果被神经元感知超过了某种阈值，那么神经元就被激活，同时沿着轴突向下一个神经元传导信号。在我们简化的数学计算模型中，我们假定有一个『激活函数』来控制加和的结果对神经元的刺激程度，从而控制着是否激活神经元和向后传导信号。

![](http://cs231n.github.io/assets/nn1/neuron.png)

而我们可以看到下边简化的神经元计算模型中，信号也是顺着树突(比如x0)传递，然后在轴突处受到激励(w0倍)然后变成w0x0。我们可以这么理解这个模型：在信号的传导过程中，突触可以控制传导到下一个神经元的信号强弱(数学模型中的权重w)，而这种强弱是可以学习到的。

![](http://cs231n.github.io/assets/nn1/neuron_model.jpeg)

事实上，神经网络的本质就是通过参数与激活函数来拟合特征与目标之间的真实函数关系。因此，选择激活函数（activation function）成为了问题的一个难点。

### 激活函数

#### Sigmoid

Sigmoid函数曾被广泛地应用，但由于其自身的一些缺陷，现在很少被使用了。Sigmoid函数总会输出一个0-1之间的值，我们可以认为这个值表明信号的强度、或者神经元被激活的概率。Sigmoid函数被定义为：
![](https://gss3.bdstatic.com/-Po3dSag_xI4khGkpoWK1HF6hhy/baike/s%3D99/sign=a46bd6f1dd33c895a27e9472d01340df/0df3d7ca7bcb0a4659502a5f6f63f6246b60af62.jpg)

函数对应的图像是：

![](http://cs231n.github.io/assets/nn1/sigmoid.jpeg)

其对x的导数可以用自身表示:![](https://gss1.bdstatic.com/-vo3dSag_xI4khGkpoWK1HF6hhy/baike/s%3D236/sign=375012cedfca7bcb797bc02c88086b3f/64380cd7912397dde41ab3095182b2b7d0a2875f.jpg)


比如说，我们在逻辑回归中用到的sigmoid函数就是一种激励函数，因为对于求和的结果输入，

优点：

* Sigmoid函数的输出映射在(0,1)(0,1)之间，单调连续，输出范围有限，优化稳定，可以用作输出层。
* 求导容易。

缺点：

* 由于其软饱和性，容易产生梯度消失，导致训练出现问题。
* 其输出并不是以0为中心的。

## 深层网络

### 层级连接结构

之前用到的是单层神经网络，现在说说普遍的结构。神经网络的结构是一种单向的层级连接结构，每一层可能有多个神经元。再形象一点说，就是每一层的输出将会作为下一层的输入数据。一般情况下，单层内的这些神经元之间是没有连接的。最常见的一种神经网络结构就是全连接层级神经网络，也就是相邻两层之间，每个神经元和每个神经元都是相连的，单层内的神经元之间是没有关联的。一般从前往后分为输入层／隐藏层／输出层。只有输入层和输出层的时候就为单层网络。注意命名习俗里面，通常是不把输入层计算在层数内的。

2层神经网络：

 ![](http://cs231n.github.io/assets/nn1/neural_net.jpeg)
 
3层神经网络：

 ![](http://cs231n.github.io/assets/nn1/neural_net2.jpeg)
 
我们想想为什么需要多层网络？因为单层网络不管再怎么说，Y = X * W + b，这都是一个线性函数，无法完美地拟合真实情况。而多层网络加上激活函数引入的非线性特征，才是解决问题的关键。


[http://blog.csdn.net/han_xiaoyang/article/details/50447834](http://blog.csdn.net/han_xiaoyang/article/details/50447834)