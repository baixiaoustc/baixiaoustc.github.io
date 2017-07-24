---
author: baixiaoustc
comments: true
date: 2017-07-24 12:12:46+00:00
layout: post
slug: 2016-07-24-try-tensorflow-with-golang
title: 用golang小试tensorflow
categories:
- 机器学习
tags:
- golang tensorflow
---


（手机阅读会有问题-。=）
google的tensorflow提供golang接口了，总算是拉了自家的语言一把。周末抽空试了试，总体思想还是用python训练并Save好model（更友好），然后用golang Load该model，再进行运算。

## 安装

### 安装tensorflow环境

直接看[官方文档](https://www.tensorflow.org/install/install_mac)。我是用的“Installing with virtualenv”，装好之后遇到了点问题，import numpy时报错：RuntimeError: module compiled against API version 0xa but this version of numpy is 0x9。应该是numpy的版本兼容问题，用pip升级numpy也没有解决，后直接在创建virtualenv时用“--no-site-packages”解决了。

### 安装golang binding

直接看[官方文档](https://www.tensorflow.org/install/install_go)。装好后运行panic，后升级golang到1.8.3解决了。

## 训练模型

### 用python训练模型

感谢[没有博士学位，照样玩转TensorFlow深度学习](https://mp.weixin.qq.com/s/E6SsvWofiN94JtZWf1f-Ug)，我们可以比较简单地理解tensorflow的工作原理，并开始训练用于识别手写数字的模型。

多的不说，为了后续golang能够用上该模型，需要给模型的tensors和operations打上标签。

先给作为input的tensors打标签：

    # flatten the images into a single line of pixels
    # -1 in the shape definition means "the only possible dimension that will preserve the number of elements"
    XX = tf.reshape(X, [-1, 784], name="input")


再给operations打标签：

    # this is the 'output'
    infer = tf.argmax(Y, 1, name="infer")
    
最后导出model，tag为名：

    # Create a builder to export the model
    builder = tf.saved_model.builder.SavedModelBuilder(str(flags.model_dir))
    # Tag the model in order to be capable of restoring it specifying the tag set
    builder.add_meta_graph_and_variables(sess, ["tag"])
    builder.save()
    
导出model的形式如下图：

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170724-094807@2x.jpg)


## 使用模型

### golang上场

两部分关键代码。

首先是导入model：

	saveModel, err := tf.LoadSavedModel("/Users/baixiao/tensorflow/mnist/export/", []string{"tag"}, nil)
	if err != nil {
		log.Fatal(err)
	}

	graph := saveModel.Graph
	session := saveModel.Session
	defer session.Close()
	
恢复session和graph之后，使用该模型进行运算，识别手写数字的图像：

	tensor, err := mnistTensor(int(index))
	if err != nil {
		log.Fatal(err)
	}
	output, err := session.Run(
		map[tf.Output]*tf.Tensor{
			graph.Operation("input").Output(0): tensor,
		},
		[]tf.Output{
			graph.Operation("infer").Output(0),
		},
		nil)
	if err != nil {
		log.Fatal(err)
	}
	
	
结果如下图，可以看到识别数字8是成功了：

![](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170724-095333.jpg)


## 结束

完整代码在[https://github.com/baixiaoustc/tensorflow_mnist](https://github.com/baixiaoustc/tensorflow_mnist)

参考：
[https://nilsmagnus.github.io/post/go-tensorflow/](https://nilsmagnus.github.io/post/go-tensorflow/)
[https://pgaleone.eu/tensorflow/go/2017/05/29/understanding-tensorflow-using-go/?utm_source=golangweekly&utm_medium=email](https://pgaleone.eu/tensorflow/go/2017/05/29/understanding-tensorflow-using-go/?utm_source=golangweekly&utm_medium=email)