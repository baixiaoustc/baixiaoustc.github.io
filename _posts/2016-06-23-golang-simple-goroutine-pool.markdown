---
author: baixiaoustc
comments: true
date: 2016-06-23 13:48:37+00:00
layout: post
slug: 2016-06-23-golang-simple-goroutine-pool
title: golang的简易goroutine线程池
wordpress_id: 88
categories:
- 后端技术
tags:
- golang
- goroutine
---

背景：安卓系统推送服务消费rabbitmq队列太慢，改成每消费一个报文就用一个go的话，goroutine又太多（十几万）机器扛不住。因此需要一个goroutine线程池。

用goroutine和channel能很简单地构造线程池的结构。

如下例子，SysPushWorker是具体工作的worker，我们起十个，而task是一百个。
main从msgs取数据，然后通过dataChan发送给所有的worker处理。

    
    package main
    
    import (
    	"sync"
    	"encoding/json"
    	"fmt"
    )
    
    const (
    	SYS_PUSH_WORKER_NUM = 10
    	SYS_PUSH_TASK_NUM = 100
    )
    
    func SysAndroidPush(userId, devToken, androidType, title, description, payload string) (err error) {
    	fmt.Printf("[user:%s][token:%s][title:%s][description:%s]\n", userId, devToken, title, description)
    	return nil
    }
    
    func SysPushWorker(dataChan chan map[string]interface{}, wg sync.WaitGroup, push func(userId, devToken, androidType, title, description, payload string) error) {
    	defer wg.Done()
    	fmt.Printf("start worker\n")
    	for data := range dataChan {
    		//fmt.Println(data)
    		push(data["user_id"].(string), data["dev_token"].(string), data["android_type"].(string), data["title"].(string), data["description"].(string), data["payload"].(string))
    	}
    }
    
    func main() {
    	msgs := make(chan []byte)
    	go func(msgs chan []byte) {
    		for i := 0; i < SYS_PUSH_TASK_NUM; i++ {
    			data := map[string]interface{}{
    				"user_id": "baixiao",
    				"dev_token": fmt.Sprint(i),
    				"android_type": "getui",
    				"title": "hello",
    				"description": "world",
    				"payload": "",
    			}
    			dataJson, _ := json.Marshal(data)
    			msgs <- dataJson
    		}
    	} (msgs)
    
    	dataChan := make(chan map[string]interface{})
    	var wg sync.WaitGroup
    
    	for i := 0; i < SYS_PUSH_WORKER_NUM; i++ {
    		wg.Add(1)
    		go SysPushWorker(dataChan, wg, SysAndroidPush)
    	}
    
    	for data := range msgs {
    		dataMap := make(map[string]interface{})
    		json.Unmarshal(data, &dataMap;)
    		//fmt.Println(dataMap)
    		dataChan <- dataMap
    	}
    
    	close(dataChan)
    	wg.Wait()
    }
    


从结果来看，task是正常执行完了，但是没有完满结束：
![未命名 2](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/06/未命名-2-1.png)
