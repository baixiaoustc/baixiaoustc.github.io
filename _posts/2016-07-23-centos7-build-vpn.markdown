---
author: baixiaoustc
comments: true
date: 2016-07-23 09:07:05+00:00
layout: post
slug: 2016-07-23-centos7-build-vpn
title: centos7上自建VPN
wordpress_id: 189
categories:
- 网站
tags:
- vpn
---

首先参照[这篇文章](http://blog.csdn.net/johnnycode/article/details/45543157)，由于centos7默认是firewall的防火墙，不是iptables，需要参照[这篇文章](http://blog.csdn.net/slovyz/article/details/50789015)。

然后看了[这篇文章](http://www.123haitao.com/t/67945)，配置了iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -j SNAT --to-source 你的服务器的公网IP。
