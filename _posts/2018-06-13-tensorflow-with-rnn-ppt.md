---
author: baixiaoustc
comments: true
date: 2018-06-13 12:12:46+00:00
layout: post
slug: 2018-06-13-tensorflow-with-rnn-ppt
title: 循环网络实战：视频动作识别
categories:
- 机器学习
tags:
- python 
- tensorflow 
- ppt
---

最近写的《循环网络实战：视频动作识别》讲稿


![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.001.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.002.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.003.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.004.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.005.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.006.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.007.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.008.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.009.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.010.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.011.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.012.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.013.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.014.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.015.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.016.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.017.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.018.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.019.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.020.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.021.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.022.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.023.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.024.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.025.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.026.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.027.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.028.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.029.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.030.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.031.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.032.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.033.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.034.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.035.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.036.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.037.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.038.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.039.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E5%BE%AA%E7%8E%AF%E7%BD%91%E7%BB%9C%E5%AE%9E%E6%88%98%EF%BC%9A%E8%A7%86%E9%A2%91%E5%8A%A8%E4%BD%9C%E8%AF%86%E5%88%AB.040.jpeg)

---

