---
author: baixiaoustc
comments: true
date: 2016-06-13 11:40:27+00:00
layout: post
slug: golang-bug-when-json-unmarshal-map
title: golang按照map解析json结构的坑
wordpress_id: 10
categories:
- 后端技术
tags:
- golang
- json
---

客户端的int类型数据json序列化，上传到服务器后，golang按照map解析json结构会被升级为float64。




demo：




    
    package main
    
    import (
    "encoding/json"
    "fmt"
    )
    
    func main() {
    	// golang json
    	map1 := make(map[string]interface{})
    	var x int = 0
    	var y float64 = 1.1
    	map1["x"] = x
    	map1["y"] = y
    	var map1Json []byte
    	map1Json, _ = json.Marshal(map1)
    	map2 := make(map[string]interface{})
    	_ = json.Unmarshal(map1Json, &map2)
    	fmt.Printf("%v\n", map2)
    	for k, v := range map2 {
    		switch v.(type) {
    		case int:
    			fmt.Println("int", k, v)
    		case float64:
    			fmt.Println("float64", k, v)
    		}
    	}
    }
    
