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
- python tensorflow ppt
---

最近写的深度学习-图像识别讲稿

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.001.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.002.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.003.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.004.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.005.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.006.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.007.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.008.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.009.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.010.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.011.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.012.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.013.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.014.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.015.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.016.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.017.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.018.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.019.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.020.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.021.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.022.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.023.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.024.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.025.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.026.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.027.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.028.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.029.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.030.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.031.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.032.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.033.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.034.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.035.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.036.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.037.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.038.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.039.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.040.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.041.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.042.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.043.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.044.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.045.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.046.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.047.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.048.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.049.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.050.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.051.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.052.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.053.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.054.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.055.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.056.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.057.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.058.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.059.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.060.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.061.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.062.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.063.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.064.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.065.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.066.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.067.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.068.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.069.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.070.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.071.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.072.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.073.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.074.jpeg)

---

![](http://image99.renyit.com/image/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%AE%9E%E6%88%98%EF%BC%9A%E5%AE%9E%E7%8E%B0%E6%97%A0%E4%BA%BA%E9%A9%BE%E9%A9%B6.075.jpeg)

---