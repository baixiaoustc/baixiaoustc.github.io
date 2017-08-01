---
author: baixiaoustc
comments: true
date: 2017-07-24 12:12:46+00:00
layout: post
slug: 2017-07-24-try-tensorflow-with-golang1
title: 用golang小试tensorflow1
categories:
- 机器学习
tags:
- golang tensorflow
---



手机阅读会有问题-。=

## 先看效果吧

### 乖乖女儿

<!--<iframe height=498 width=510 src='http://player.youku.com/embed/XMjkzNzUzMjc0OA==' frameborder=0 'allowfullscreen'></iframe>-->

### 笨拙滑冰

<!--<iframe height=498 width=510 src='http://player.youku.com/embed/XMjkzNzUzNjExMg==' frameborder=0 'allowfullscreen'></iframe>-->

google的tensorflow提供golang接口了，总算是拉了自家的语言一把。周末抽空试了试，总体思想还是用python训练并Save好model（更友好），然后用golang Load该model，再进行运算。



## 结束

完整代码在[https://github.com/baixiaoustc/tensorflow_objectdetection](https://github.com/baixiaoustc/tensorflow_objectdetection)

参考：

[https://github.com/tensorflow/models/blob/master/object_detection/object_detection_tutorial.ipynb](https://github.com/tensorflow/models/blob/master/object_detection/object_detection_tutorial.ipynb)

[https://github.com/priya-dwivedi/Deep-Learning/blob/master/Object_Detection_Tensorflow_API.ipynb](https://github.com/priya-dwivedi/Deep-Learning/blob/master/Object_Detection_Tensorflow_API.ipynb)