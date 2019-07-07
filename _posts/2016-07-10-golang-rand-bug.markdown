---
author: baixiaoustc
comments: true
date: 2016-07-10 13:43:52+00:00
layout: post
slug: 2016-07-10-golang-rand-bug
title: golang的rand包的坑
wordpress_id: 164
categories:
- 后端技术
tags:
- golang
- rand
---

1、rand.IntN无法随机！

    
    	
    	result := make([]int, 0)
    	for i := 1; i <= 10; i ++ {
    		result = append(result, rand.Intn(10))
    	}
    	fmt.Println(result)
    	result = make([]int, 0)
    	r := rand.New(rand.NewSource(time.Now().UnixNano()))
    	for i := 1; i <= 10; i ++ {
    		result = append(result, r.Intn(10))
    	}
    	fmt.Println(result)
    


执行两次，前一个循环的值是相同的！后一个以time为key，可以做到随机。

第一次：

![未命名 2](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-2-3-1024x148.png)

第二次：

![未命名 2](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-2-4-1024x153.png)
