---
author: baixiaoustc
comments: true
date: 2016-08-29 12:36:29+00:00
layout: post
slug: 2016-08-29-optimization-particle-swarm
title: 优化算法之六：粒子群算法
wordpress_id: 194
categories:
- 优化算法
tags:
- golang
- optimization
---

粒子群优化算法（Particle Swarm Optimization），是模仿鸟群觅食过程的一种优化算法。设想这样一个场景：一群鸟在随机搜索食物。在这个区域里只有一块食物。所有的鸟都不知道食物在那里。但是他们知道当前的位置离食物还有多远。那么找到食物的最优策略是什么呢。最简单有效的就是搜寻目前离食物最近的鸟的周围区域。




算法从随机解出发，通过迭代寻找最优解，通过适应度来评价解的品质。每个粒子代表一只鸟。在每一次迭代中，粒子通过跟踪两个"极值"来更新自己。第一个就是粒子本身所找到的最优解，这个解叫做个体极值pBest。另一个极值是整个种群目前找到的最优解，这个极值是全局极值gBest。




粒子群算法的数学描述如下:每个粒子i包含为一个D维的位置向量xi=( xi1, xi2, „„, xiD ) 和速度向量vi = ( vi1, vi2,„„, viD ), 粒子i搜索解空间时, 保存其搜索到的最优经历位置p i = ( pi1, pi2, „„, piD)。在每次迭代开始时, 粒子根据自身惯性和经验及群体最优经历位置pg = ( pg1, pg2, „„, pgD )来调整自己的速度向量以调整自身位置。c1、c2是正常数,称之为加速因子; r1、r2为[ 0, 1]中均匀分布的随机数, d为D维中的维数;ω是惯性权重因子。其中, 每个粒子的位置和速度更新按下式




𝑣𝑖𝑑𝑡+1 =𝑤∗𝑣𝑖𝑑𝑡+𝑐1𝑟1(𝑝𝑖𝑑𝑡−𝑥𝑖𝑑𝑡)+𝑐2𝑟2(𝑝𝑔𝑑𝑡−𝑥𝑖𝑑𝑡)      (1)




𝑥𝑖𝑑𝑡+1=𝑥𝑖𝑑𝑡+𝑣𝑖𝑑𝑡+1                               (2)




![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/08/未命名-300x163.png)


{% highlight golang %} 
//parSize 粒子数
//maxIter 迭代数
//step    速度的跨度
func optimizeParticleSwarm(domainList [][2]int, costF func([]int) int64, parSize, maxIter, step int) []int {
	dim := len(domainList)
	parScheduleList := make([][]int, 0)//单个位置的列表
	parVelocityList := make([][]int, 0)//单个速度的列表
	parCostList := make([]int64, 0)//单个最优值的列表
	parBestScheduleList := make([][]int, 0)//单个最优解的列表
	var globalCost int64 = 999999//全局最优值
	globalSchedule := make([]int, 0) //全局最优解
	var w float64 = 0.5
	var c1 float64 = 2.0
	var c2 float64 = 2.0
    
	fmt.Println(domainList)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	//Build the initial
	for i := 0; i < parSize; i ++ {
		var initSchedule []int
		for _, domain := range domainList {
			choice := r.Intn(domain[1] - domain[0] + 1) + domain[0]
			initSchedule = append(initSchedule, choice)
		}
		parScheduleList = append(parScheduleList, initSchedule)
		parBestScheduleList = append(parBestScheduleList, initSchedule)
    
		var initVelocity []int
		for j := 0; j < dim; j ++ {
			choice := r.Intn(3 * step) - step
			initVelocity = append(initVelocity, choice)
		}
		parVelocityList = append(parVelocityList, initVelocity)
    
		parCostList = append(parCostList, costF(initSchedule))
    
		if globalCost > parCostList[i] {
			globalCost = parCostList[i]
			//globalSchedule = initSchedule
			globalSchedule = make([]int, 0)
			for j := 0; j < dim; j ++ {
				globalSchedule = append(globalSchedule, initSchedule[j])
			}
		}
	}
	fmt.Println("parScheduleList", parScheduleList)
	fmt.Println("parVelocityList", parVelocityList)
	fmt.Println("globalCost", globalCost)
	fmt.Println("globalSchedule", globalSchedule)
    
	//Main loop
	for x := 0; x < maxIter; x ++ {
		fmt.Println("loop", x)
		//update
		for i := 0; i < parSize; i ++ {
			fmt.Println("bird", i)
			for j := 0; j < dim; j ++ {
				parVelocityList[i][j] = int(w*float64(parVelocityList[i][j]) + c1*r.Float64()*float64(parBestScheduleList[i][j]-parScheduleList[i][j]) + c2*r.Float64()*float64(globalSchedule[j]-parScheduleList[i][j]))
				//要不要限制速度
				if parVelocityList[i][j] < -4 {
					parVelocityList[i][j] = -4
				}
				if parVelocityList[i][j] > 4 {
					parVelocityList[i][j] = 4
				}
    
				parScheduleList[i][j] = parScheduleList[i][j] + parVelocityList[i][j]
				if parScheduleList[i][j] < domainList[j][0] {
					parScheduleList[i][j] = domainList[j][0]
				}
				if parScheduleList[i][j] > domainList[j][1] {
					parScheduleList[i][j] = domainList[j][1]
				}
			}
			//fmt.Println("parVelocityList", parVelocityList[i])
			//fmt.Println("parScheduleList", parScheduleList[i])
    
			//get pBest
			if cost := costF(parScheduleList[i]); parCostList[i] > cost{
				parCostList[i] = cost
				parBestScheduleList[i] = parScheduleList[i]
				fmt.Println("parCostList", parCostList[i])
				fmt.Println("parBestScheduleList", parBestScheduleList[i])
			}
    
			//get gBest
			if globalCost > parCostList[i] {
				globalCost = parCostList[i]
				//globalSchedule = parBestScheduleList[i]
				globalSchedule = make([]int, 0)
				for j := 0; j < dim; j ++ {
					globalSchedule = append(globalSchedule, parBestScheduleList[i][j])
				}
				fmt.Println("globalCost", globalCost)
				fmt.Println("globalSchedule", globalSchedule, costF(globalSchedule))
			}
		}
	}
    
	fmt.Println("best", globalCost)
	fmt.Println("bestSchedule", globalSchedule)
	return globalSchedule
}
{% endhighlight %}



理论部分来自http://wenku.baidu.com/view/c74ea6bc1a37f111f1855b2d.html，完整golang代码在[https://github.com/baixiaoustc/optimization](https://github.com/baixiaoustc/optimization)
