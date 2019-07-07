---
author: baixiaoustc
comments: true
date: 2016-07-11 14:41:49+00:00
layout: post
slug: 2016-07-11-optimization-4-annealing
title: 优化算法之四：退火法
wordpress_id: 175
categories:
- 优化算法
tags:
- golang
- optimization
---

模拟退火算法来源于物理学，是指将合金加热后再慢慢冷却的过程，大量原子受热后跃迁，最后降温到达低能阶的稳定态。

退火法从一个随机解开始迭代，每次迭代会选择解中的一项向某个方向变化，如果变化后的成本更低，则新解代替原始解。算法关键点在于，有一个变量表示温度，最初很高，逐渐变低，通过它会计算一个概率，用于指示是否在新解成本没有变低的情况下依然替换原始解（这就避免了登山法中获得局部最优解的缺点）。当温度高时，概率高，算法更能接受表现差的解，随着温度降低而概率变低，算法随之更加不接受差的解。概率的表达式为exp(-ΔC/T)，ΔC表示成本差值，T表示温度。

{% highlight golang %}
//退火法优化
func optimizeAnealing(domainList [][2]int, costF func([]int) int64, t, cool float64, step int) []int {
	var bestSchedule []int
    
	fmt.Println(domainList)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for _, domain := range domainList {
		choice := r.Intn(domain[1] - domain[0]) + domain[0]
		bestSchedule = append(bestSchedule, choice)
	}
    
	//Main loop
	for (t > 0.1) {
		//Choose one of the indices
		i := r.Intn(len(domainList))
    
		//Choose a direction to change it
		dir := r.Intn(2*step) - step
    
		//Create a new list with one of the values changed
		newSchedule := make([]int, len(bestSchedule))
		copy(newSchedule, bestSchedule)
		newSchedule[i] += dir
		if newSchedule[i] < domainList[i][0] {newSchedule[i] = domainList[i][0]}
		if newSchedule[i] > domainList[i][1] {newSchedule[i] = domainList[i][1]}
    
		//Calculate the current cost and the new cost
		best := costF(bestSchedule)
		cost := costF(newSchedule)
		p := math.Exp(float64(-(cost-best))/t)
		if cost < best || r.Float64() < p {
			bestSchedule = newSchedule
		}
    
		t = t*cool
	}
    
	return bestSchedule
}
{% endhighlight %}


![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-3.png)

这个系列来自《集体智慧编程》的第五章，完整golang代码在[https://github.com/baixiaoustc/optimization](https://github.com/baixiaoustc/optimization)
