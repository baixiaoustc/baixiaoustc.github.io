---
author: baixiaoustc
comments: true
date: 2016-07-10 13:17:37+00:00
layout: post
slug: 2016-07-10-optimization-3-climbing
title: 优化算法之三：登山法
wordpress_id: 150
categories:
- 算法
tags:
- golang
- optimization
---

随机搜索的方法很低效，因为没有利用已经发现的较优解，而是选择十分离散的解来尝试。一个替代方法是登山法，其主要思想是，从一个随机解开始，向着临近解中的最优项出发，一直到无法找到更优解为止。就像从山坡下山，一直沿着最陡峭的方向行走，最终来到山谷：

![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-1.png)

在“组团出游”的问题里，从一个随机的时间安排开始，找到与之相邻的所有解（让某个人的出发或者返回航班做早一班或者晚一班的调整），在其中选择最优解，然后重复这一过程一直到没有更优解为止。

{% highlight golang %}
//登山法优化
func optimizeHillClimb(domainList [][2]int, costF func([]int) int64) []int {
	var bestSchedule []int
    
	fmt.Println(domainList)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for _, domain := range domainList {
		choice := r.Intn(domain[1] - domain[0]) + domain[0]
		bestSchedule = append(bestSchedule, choice)
	}
    
	//Main loop
	for {
		//Create list of neighboring solutions
		var neighbors [][]int
		fmt.Println("start", bestSchedule)
    
                 //One away in each direction
		for i := 0; i < len(domainList); i ++ { 
                        if bestSchedule[i] > domainList[i][0] {
				newSchedule := make([]int, len(bestSchedule))
				copy(newSchedule, bestSchedule)
				newSchedule[i] = bestSchedule[i]-1
				neighbors = append(neighbors, newSchedule)
			}
			if bestSchedule[i] < domainList[i][1] {
				newSchedule := make([]int, len(bestSchedule))
				copy(newSchedule, bestSchedule)
				newSchedule[i] = bestSchedule[i]+1
				neighbors = append(neighbors, newSchedule)
			}
		}
    
		//See what the best solution amongst the neighbors is
		current := costF(bestSchedule)
		best := current
		for j := 0; j < len(neighbors); j ++ {
			cost := costF(neighbors[j])
			//fmt.Println("neighbors", neighbors[j], cost)
			if cost < best {
				best = cost
				bestSchedule = neighbors[j]
			}
		}
    
		//If there's no improvement, then we've reached the top
		if best == current {
			break
		}
		fmt.Println("best", bestSchedule)
	}
    
	return bestSchedule
}
{% endhighlight %}
    


![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-2.png)

但是登山法有个很大的缺陷是，最后的解可能只是一个局部最优解，如下图。要找到全局最优解，要用到随机重复登山法。后面会用到更多的避免陷入局部最优解的方法。

![未命名 2](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-2-1.png)

这个系列来自《集体智慧编程》的第五章，完整golang代码在[https://github.com/baixiaoustc/optimization](https://github.com/baixiaoustc/optimization)
