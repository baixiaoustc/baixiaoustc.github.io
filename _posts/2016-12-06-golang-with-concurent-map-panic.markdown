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


## 更新

在读写结构体里的map时，原以为将结构体重新赋值到新变量就能避免内部map的读写并发问题，实则不然：

	package main
	
	import (
		"fmt"
		"sync"
		"time"
	)
	
	var M = map[string]int{"a": 1}
	var lock = sync.RWMutex{}
	
	func main() {
		go Read(M)
		time.Sleep(1 * time.Second)
		go Write(M)
		time.Sleep(1 * time.Minute)
	}
	
	func Read(M map[string]int) {
		fmt.Println("read")
		for {
			m := M
			read(m)
		}
	}
	
	func Write(M map[string]int) {
		fmt.Println("write")
		for {
			m := M
			// m := make(map[string]int)
			// for k, v := range M {
			// 	m[k] = v
			// }
			write(m)
		}
	}
	
	func read(m map[string]int) {
		lock.RLock()
		defer lock.RUnlock()
		_ = m["a"]
	}
	
	func write(m map[string]int) {
		// lock.Lock()
		// defer lock.Unlock()
		m["b"] = 2
	}
	
在Write函数中申请新变量m，并不能解决问题：

![image](http://oiz85bhef.bkt.clouddn.com/image/Jietu20170411-085651.jpg)

可以通过拷贝map的做法来规避，将Write函数修改为：

	func Write(M map[string]int) {
		fmt.Println("write")
		for {
			// m := M
			m := make(map[string]int)
			for k, v := range M {
				m[k] = v
			}
			write(m)
		}
	}


## 原文



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