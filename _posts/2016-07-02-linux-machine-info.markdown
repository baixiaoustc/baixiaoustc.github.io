---
author: baixiaoustc
comments: true
date: 2016-07-02 03:23:45+00:00
layout: post
slug: 2016-07-02-linux-machine-info
title: 查看Linux机器信息
wordpress_id: 128
categories:
- 计算机
---

1、查看物理CPU的个数

cat /proc/cpuinfo |grep "physical id"|sort |uniq|wc -l

2、查看逻辑CPU的个数

cat /proc/cpuinfo |grep "processor"|wc -l

3、查看CPU是几核

cat /proc/cpuinfo |grep "cores"|uniq

4、查看CPU的主频

cat /proc/cpuinfo |grep MHz|uniq

5、查看操作系统内核

uname -a

6、查看CPU型号

cat /proc/cpuinfo | grep name | cut -f2 -d: | uniq -c

7、查看CPU运行在哪个bit模式

getconf LONG_BIT
