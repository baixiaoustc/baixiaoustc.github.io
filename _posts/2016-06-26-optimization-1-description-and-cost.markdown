---
author: baixiaoustc
comments: true
date: 2016-06-26 09:17:32+00:00
layout: post
slug: 2016-06-26-optimization-1-description-and-cost
title: 优化算法之一：描述题解和成本函数
wordpress_id: 104
categories:
- 优化算法
tags:
- golang
- optimization
---

* content 
{:toc}


优化算法用于解决这类问题：问题存在大量的可能解，而我们无法对它们进行一一尝试的情况。


### 描述题解


是指如何对问题的解进行数学抽象。在“组团出游”的问题里，一家人从不同城市同到NewYork的LGA机场，如何选择每人的航班使得总花费最少？

从一个txt文件中获取航班信息，文件中每行分别表示两个机场、往返时间、总花费：


{% highlight golang %}  
// 从txt文件中解析航班信息
func parseShecdule(fileName string, flight *map[[2]string][][3]string) error {
	f, err := os.Open(fileName)
	if err != nil {
		return err
	}
	buf := bufio.NewReader(f)
	for {
		line, err := buf.ReadString('\n')
		line = strings.TrimSpace(line)
		//fmt.Println(line)
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}
    
		lineList := strings.Split(line, ",")
		origin, dest := lineList[0], lineList[1]
		depart, arrive, price := lineList[2], lineList[3], lineList[4]
		if v, ok := (*flight)[[2]string{origin, dest}]; ok {
			(*flight)[[2]string{origin, dest}] = append(v, [3]string{depart, arrive, price})
		} else {
			(*flight)[[2]string{origin, dest}] = [][3]string{[3]string{depart, arrive, price}}
		}
	}
	return nil
}
{% endhighlight %}


如何描述问题的解？用一个数字序列表示每人选择的航班编号：0表示当天第一次航班，1表示第二次航班。因为每个人需要往返两个航班，所有序列的长度是总人数的两倍。

按序列打印出航班信息：


{% highlight golang %}   
//打印选定日程表的航班信息
func printSchedule(schedule []int)  {
	for i := 0; i < len(schedule)/2; i++ {
		name := GPeople[i][0]
		origin := GPeople[i][1]
    
		out := GFlight[[2]string{origin, GDestination}][schedule[i]]
		ret := GFlight[[2]string{GDestination, origin}][schedule[i+1]]
    
		fmt.Printf("%10s%10s %5s-%5s $%3s %5s-%5s $%3s\n", name, origin,
			out[0], out[1], out[2], ret[0], ret[1], ret[2])
	}
}
{% endhighlight %}


### 成本函数


如何用一个值表示所选解的好坏？该值是对问题的一个加权总和，对本例来说，机票钱、飞行时间、等待时间等都被用来描述一组解的好坏：


{% highlight golang %}  
//计算选定日程表的成本
func costSchedule(schedule []int) int64 {
	var totalPrice, totalWait, latestArrive, eariestDepart int64
	eariestDepart = 24*60
    
	for i := 0; i < len(schedule)/2; i++ {
		origin := GPeople[i][1]
		out := GFlight[[2]string{origin, GDestination}][schedule[i]]
		ret := GFlight[[2]string{GDestination, origin}][schedule[i+1]]
    
		if price, err := strconv.ParseInt(out[2], 10, 64); err != nil {
			fmt.Printf("strconv.ParseInt error: %v\n", err)
		} else {
			totalPrice += price
		}
		if price, err := strconv.ParseInt(ret[2], 10, 64); err != nil {
			fmt.Printf("strconv.ParseInt error: %v\n", err)
		} else {
			totalPrice += price
		}
		//Track the latest arrival and earliest departure
		if latestArrive < getMinutes(out[1]) { 
                        latestArrive = getMinutes(out[1]) 
                } 
                if eariestDepart > getMinutes(ret[0]) {
			eariestDepart = getMinutes(ret[0])
		}
	}
    
	for i := 0; i < len(schedule)/2; i++ {
		origin := GPeople[i][1]
		out := GFlight[[2]string{origin, GDestination}][schedule[i]]
		ret := GFlight[[2]string{GDestination, origin}][schedule[i+1]]
    
		totalWait += (latestArrive - getMinutes(out[1]))
		totalWait += (getMinutes(ret[1]) - eariestDepart)
	}
    
	//租车超过一天的额外费用
	if latestArrive < eariestDepart {
		totalPrice += 50
	}
    
	return totalPrice + totalWait
}
{% endhighlight %}


![未命名](http://baixiaoustc.com/wordpress/wp-content/uploads/2016/06/未命名-4.png)

这个系列来自《集体智慧编程》的第五章，完整golang代码在[https://github.com/baixiaoustc/optimization](https://github.com/baixiaoustc/optimization)
