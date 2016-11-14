---
author: baixiaoustc
comments: true
date: 2016-06-19 04:29:55+00:00
layout: post
link: http://baixiaoustc.com/wordpress/2016/06/19/golang%e7%9a%84reflect%e5%8c%85%e7%94%a8%e5%9c%a8struct%e4%b8%8a/
slug: golang%e7%9a%84reflect%e5%8c%85%e7%94%a8%e5%9c%a8struct%e4%b8%8a
title: golang使用reflect包，转化struct为map
wordpress_id: 59
categories:
- 后端技术
tags:
- golang
- reflect
---

[https://blog.golang.org/laws-of-reflection](https://blog.golang.org/laws-of-reflection)

用一个简单的例子说明如何在struct上使用reflect。定义一个struct，想通过标签取得该struct的值：

    
    
    package main
    
    import (
    	"reflect"
    	"fmt"
    )
    
    type ModelStruct struct {
    	Name string `json:"name"`
    	Id   int64  `json:"id"`
    	Age  int `json:"age"`
    }
    
    func FormatModelMap(needs []string, model ModelStruct) map[string]interface{} {
    	data := make(map[string]interface{})
    	structValue := reflect.ValueOf(&model;).Elem()
    	structType := reflect.TypeOf(model)
    	fmt.Println("routeType:", structType, structType.NumField())
    	for _, need := range needs {
    		fmt.Println("need", need)
    		for i := 0; i < structType.NumField(); i++ {
    			routeTypeField := structType.Field(i)
    			structTag := routeTypeField.Tag.Get("json")
    			if need == structTag {
    				data[need] = structValue.Field(i).Interface()
    				fmt.Println("structTag:", structTag, structValue.Field(i))
    			}
    		}
    	}
    	return data
    }
    
    func main()  {
    	model := ModelStruct{Name:"baixiao", Id:888,}
    	needs := []string{"name", "id"}
    	fmt.Println(FormatModelMap(needs, model))
    }
    
    


![未命名](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/06/未命名-1.png)
