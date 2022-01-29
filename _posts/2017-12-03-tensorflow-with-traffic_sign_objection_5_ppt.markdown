---
author: baixiaoustc
comments: true
date: 2017-12-03 12:12:46+00:00
layout: post
slug: 2017-12-03-tensorflow-with-traffic_sign_objection_5-ppt
title: 深度学习实战：实现无人驾驶
categories:
- 机器学习
tags:
- python 
- tensorflow 
- ppt
---

最近写的深度学习-图像识别讲稿

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.001.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.002.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.003.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.004.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.005.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.006.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.007.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.008.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.009.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.010.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.011.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.012.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.013.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.014.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.015.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.016.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.017.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.018.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.019.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.020.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.021.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.022.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.023.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.024.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.025.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.026.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.027.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.028.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.029.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.030.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.031.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.032.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.033.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.034.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.035.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.036.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.037.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.038.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.039.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.040.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.041.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.042.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.043.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.044.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.045.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.046.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.047.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.048.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.049.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.050.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.051.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.052.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.053.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.054.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.055.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.056.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.057.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.058.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.059.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.060.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.061.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.062.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.063.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.064.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.065.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.066.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.067.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.068.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.069.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.070.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.071.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.072.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.073.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.074.jpeg)

---

![](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.075.jpeg)

---
