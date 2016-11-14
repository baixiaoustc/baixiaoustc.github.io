---
author: baixiaoustc
comments: true
date: 2016-06-13 11:36:37+00:00
layout: post
link: http://baixiaoustc.com/wordpress/2016/06/13/golang%e7%9a%84http%e7%9f%ad%e8%bf%9e%e6%8e%a5%e4%bd%bf%e7%94%a8/
slug: golang%e7%9a%84http%e7%9f%ad%e8%bf%9e%e6%8e%a5%e4%bd%bf%e7%94%a8
title: golang的http短连接使用的坑
wordpress_id: 8
categories:
- 后端技术
tags:
- golang
---

![](https://static.oschina.net/uploads/img/201603/03213934_Rpjq.png)

高并发时服务访问失败，因为TCP的连接很高。

最初以为golang的http请求只释放defer response.Body.Close()就行了吗？ 实际不行，需要如下初始化：



    
    
    tr := &http.Transport;{
        DisableKeepAlives: true,
    }
    client := &http.Client;{Transport: tr}
    
    



