---
author: baixiaoustc
comments: true
date: 2016-06-24 05:11:12+00:00
layout: post
slug: 2016-06-24-golang-interface-usage
title: golang的简易interface使用
wordpress_id: 97
categories:
- 后端技术
tags:
- golang
- interface
---

背景：需要对几个类似的结构体（拥有相同的方法）做相同的操作，用interface类型可以轻松地实现。

如下例所示，RouteDaySumModel和RouteMonthSumModel拥有相同的function，当需要对其做Fix操作时，可以定义一个interface类型FixSummary来处理：

{% highlight golang %}  
package main
    
import (
	"time"
	"fmt"
)
    
//日表汇总
type RouteDaySumModel struct {
	Id          int64    
	UserId      string   
	CurDay      time.Time
	SportsType  int      
	Count       int      
	TotalLength float64  
	TotalTime   float64  
	TotalCalory float64  
}
    
func (rdsM *RouteDaySumModel) Print() {
	fmt.Println(rdsM)
}
    
func (rdsM *RouteDaySumModel) SetValue(totalTime, totalLength, totalCalory float64, count int) {
	rdsM.TotalTime = totalTime
	rdsM.TotalLength = totalLength
	rdsM.TotalCalory = totalCalory
	rdsM.Count = count
}
    
//月表汇总
type RouteMonthSumModel struct {
	Id          int64     
	UserId      string    
	CurDay      time.Time 
	SportsType  int       
	Count       int       
	TotalLength float64   
	TotalTime   float64   
	TotalCalory float64   
}
    
func (rmsM *RouteMonthSumModel) Print() {
	fmt.Println(rmsM)
}
    
func (rmsM *RouteMonthSumModel) SetValue(totalTime, totalLength, totalCalory float64, count int) {
	rmsM.TotalTime = totalTime
	rmsM.TotalLength = totalLength
	rmsM.TotalCalory = totalCalory
	rmsM.Count = count
}
    
type FixSummary interface {
	SetValue(totalTime, totalLength, totalCalory float64, count int)
	Print()
}
    
func Fix(totalTime, totalLength, totalCalory float64, count int, obj FixSummary) {
	obj.SetValue(totalTime, totalLength, totalCalory, count)
	obj.Print()
}
    
func main() {
	rdsM := RouteDaySumModel{
		UserId: "baixiao0",
	}
	rdsM.Print()
	Fix(11.11, 22.22, 33.33, 1, &rdsM)
    
	rmsM := RouteMonthSumModel{
		UserId: "baixiao1",
	}
	rmsM.Print()
	Fix(99.99, 88.88, 77.77, 2, &rmsM)
    
}
{% endhighlight %}   
    


![未命名](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/06/未命名-3.png)
