---
author: baixiaoustc
comments: true
date: 2016-12-06 09:54:23+00:00
layout: post
slug: 2016-12-06-golang-with-concurent-map-panic
title: golang1.6版本后遇到的并发读写map问题
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}




服务器从1.5升级到1.7之后，高并发的服务持续panic：
	
	fatal error: concurrent map read and map write
	
看代码，都是对多goroutine时对相同map读写操作导致的。
[The runtime has added lightweight, best-effort detection of concurrent misuse of maps. As always, if one goroutine is writing to a map, no other goroutine should be reading or writing the map concurrently. If the runtime detects this condition, it prints a diagnosis and crashes the program. The best way to find out more about the problem is to run the program under the race detector, which will more reliably identify the race and give more detail.](https://golang.org/doc/go1.6#runtime)

解决办法就是加锁，读时加读锁，写时加写锁，记得释放锁。

	var GLock sync.RWMutex

	GLock.RLock()
	_, mapOk := msg.Payload.(map[string]interface{})
	GLock.RUnlock()
	if mapOk {
		GLock.Lock()
		msg.Payload.(map[string]interface{})["member_type"] = v
		GLock.Unlock()
	}