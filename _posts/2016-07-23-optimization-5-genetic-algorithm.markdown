---
author: baixiaoustc
comments: true
date: 2016-07-23 07:32:42+00:00
layout: post
slug: 2016-07-23-optimization-5-genetic-algorithm
title: 优化算法之五：遗传算法
wordpress_id: 181
categories:
- 算法
tags:
- golang
- optimization
---

遗传算法是受到生物学的启发。先随机生成一组解，称为“种群”，对此进行排序，将成本最小的一部分（精英成员）直接加入“下一代种群”，这一过程称为“精英选拔”。然后另有两种方式生成新的成员加入到“下一代种群”中。

第一种是变异（mutate），做法是对一个最优解做某个方向的单一调整，在“组团出游”的问题里，既是对解中的某一个值做递增或者递减：

![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-4.png)

第二种是交叉（crossover），做法是选择两个最优解，将它们以某种方式结合，在本题中，两个解分表提供一部分值组成一个新解：

![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-5.png)

生成新的种群后（数量通常和原种群一致），下一轮“遗传”再开始，直到指定的迭代数或者直到没有更新的解出现为止。


{% highlight golang %} 
//遗传算法
func optimizeGenetic(domainList [][2]int, costF func([]int) int64, mutProb, elite float64, popSize, maxIter, step int) []int {
	popScheduleList := make([][]int, 0)
    
	fmt.Println(domainList)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	//Build the initial population
	for i := 0; i < popSize; i ++ {
		var bestSchedule []int
		for _, domain := range domainList {
			choice := r.Intn(domain[1] - domain[0]) + domain[0]
			bestSchedule = append(bestSchedule, choice)
		}
		popScheduleList = append(popScheduleList, bestSchedule)
	}
	fmt.Println("1", popScheduleList)
    
	//How many winners from each generation?
	topElite := int(elite*float64(popSize))
    
	//Main loop
	for i := 0; i < maxIter; i ++ {
		fmt.Println("loop", i)
		geneticScoreList := make(GeneticScoreList, 0)
		for _, schedule := range popScheduleList {
			score := costF(schedule)
			geneticScoreList = append(geneticScoreList, GeneticScore{
				Score: score,
				Schedule: schedule,
			})
		}
		sort.Sort(geneticScoreList)
    
		//Start with the pure winners
		popScheduleList = make([][]int, 0)
		for j := 0; j < topElite; j ++ {
			popScheduleList = append(popScheduleList, geneticScoreList[j].Schedule)
			fmt.Println("sort", geneticScoreList[j].Score, geneticScoreList[j].Schedule)
		}
    
		//Add mutated and bred forms of the winners
		for len(popScheduleList) < popSize {
			p := r.Float64()
			if p < mutProb {
				c := r.Intn(topElite)
				schedule := mutate(domainList, geneticScoreList[c].Schedule, r, step)
				fmt.Println("mut", c, geneticScoreList[c].Schedule)
				popScheduleList = append(popScheduleList, schedule)
			} else {
				c1 := r.Intn(topElite)
				c2 := r.Intn(topElite)
				schedule := crossover(domainList, geneticScoreList[c1].Schedule, geneticScoreList[c2].Schedule, r)
				fmt.Println("cross", c1, c2, geneticScoreList[c1].Schedule, geneticScoreList[c2].Schedule, schedule)
				popScheduleList = append(popScheduleList, schedule)
			}
		}
    
	}
    
	return popScheduleList[0]
}
    
type GeneticScore struct {
	Score int64
	Schedule []int
}
type GeneticScoreList []GeneticScore
    
func (p GeneticScoreList) Len() int           { return len(p) }
func (p GeneticScoreList) Less(i, j int) bool { return p[i].Score < p[j].Score }
func (p GeneticScoreList) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
    
//Mutation Operation
func mutate(domainList [][2]int, schedule []int, r *rand.Rand, step int) []int {
	choice := r.Intn(len(domainList))
	if r.Float64() < 0.5 && schedule[choice] - step >= domainList[choice][0] {
		newSchedule := make([]int, len(schedule))
		copy(newSchedule, schedule)
		newSchedule[choice] = schedule[choice] - step
		return newSchedule
	} else if schedule[choice] + step <= domainList[choice][1] {
		newSchedule := make([]int, len(schedule))
		copy(newSchedule, schedule)
		newSchedule[choice] = schedule[choice] + step
		return newSchedule
	} else {
		return schedule
	}
}
    
//Crossover Operation
func crossover(domainList [][2]int, schedule1, schedule2 []int, r *rand.Rand) []int {
	choice := r.Intn(len(domainList))
	fmt.Println("cross choice", choice)
	newSchedule := make([]int, len(schedule1))
	copy(newSchedule, schedule1)
	fmt.Println(newSchedule)
	copy(newSchedule[choice:], schedule2[choice:])
	fmt.Println(newSchedule)
	return newSchedule
}
{% endhighlight %}


![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/07/未命名-6.png)

这个系列来自《集体智慧编程》的第五章，完整golang代码在[https://github.com/baixiaoustc/optimization](https://github.com/baixiaoustc/optimization)
