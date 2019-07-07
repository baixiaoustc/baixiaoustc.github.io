---
author: baixiaoustc
comments: true
date: 2016-06-23 01:51:53+00:00
layout: post
link: http://baixiaoustc.github.io/wordpress/2016/06/23/golang%e4%bd%bf%e7%94%a8reflect%e5%8c%85%ef%bc%8c%e8%bd%ac%e5%8c%96map%e4%b8%bastruct/
slug: golang-transfer-map-to-struct-with-reflect
title: golang使用reflect包，转化map为struct
wordpress_id: 77
categories:
- 后端技术
tags:
- golang
- reflect
---

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
    
    func SetField(obj interface{}, name string, value interface{}) error {
    	structValue := reflect.ValueOf(obj).Elem()
    	structFieldValue := structValue.FieldByName(name)
    
    	if !structFieldValue.IsValid() {
    		return fmt.Errorf("No such field: %s in obj", name)
    	}
    
    	if !structFieldValue.CanSet() {
    		return fmt.Errorf("Cannot set %s field value", name)
    	}
    
    	structFieldType := structFieldValue.Type()
    	val := reflect.ValueOf(value)
    	if structFieldType != val.Type() {
    		return fmt.Errorf("Provided value type didn't match obj field type")
    	}
    
    	structFieldValue.Set(val)
    	return nil
    }
    
    func FormatModelStruct(m map[string]interface{}) (ModelStruct, error) {
    	var s ModelStruct
    	for k, v := range m {
    		err := SetField(&s, k, v)
    		if err != nil {
    			return s, err
    		}
    	}
    	return s, nil
    }
    
    func main() {
    	myData := make(map[string]interface{})
    	myData["Name"] = "Tony"
    	myData["Age"] = 23
    
    	result, err := FormatModelStruct(myData)
    	if err != nil {
    		fmt.Println(err)
    	}
    	fmt.Println(result)
    }
    


![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/06/未命名-2.png)
