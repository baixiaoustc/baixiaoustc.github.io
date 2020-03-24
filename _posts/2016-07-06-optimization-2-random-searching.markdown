---
author: baixiaoustc
comments: true
date: 2016-07-06 12:24:11+00:00
layout: post
slug: 2016-07-06-optimization-2-random-searching
title: 优化算法之二：随机搜索
wordpress_id: 145
categories:
- 算法
tags:
- golang
- optimization
---

随机搜索是最基本的方法，也被用为评估其他算法的基线。

随机搜索接收两个参数，一个是二元组的列表，二元组表示每个解的最小最大值，列表长度就为题解的长度；另一个是成本函数。在“组团出游”的问题里，参数一表示所有成员往返航班的选择范围的列表：(0,9)*len_of_people*2。

{% highlight golang %}
//随机优化
func optimizeRandom(domainList [][2]int, costF func([]int) int64) []int {
	var maxCost int64 = 999999999
	var bestSchedule []int
    
        r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < 1000; i++ {
		//fmt.Println("i", i)
		schedule := make([]int, 0)
		for _, domain := range domainList {
			//fmt.Println(domain)
			choice := rand.Intn(domain[1] - domain[0]) + domain[0]
			schedule = append(schedule, choice)
		}
		//fmt.Println(schedule)
    
		cost := costF(schedule)
		if cost < maxCost {
			maxCost = cost
			bestSchedule = schedule
		}
	}
    
	return bestSchedule
}
{% endhighlight %}
    


随机搜索的结果不见得是最优解，因为代码中的1000次尝试在所有解中只占很少一部分。

![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名.png)

这个系列来自《集体智慧编程》的第五章，完整golang代码在[https://github.com/baixiaoustc/optimization](https://github.com/baixiaoustc/optimization)
