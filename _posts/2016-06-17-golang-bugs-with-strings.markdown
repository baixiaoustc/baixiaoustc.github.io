---
author: baixiaoustc
comments: true
date: 2016-06-17 04:59:26+00:00
layout: post
slug: 2016-06-17-golang-bugs-with-strings
title: golang的strings包的坑
wordpress_id: 54
categories:
- 后端技术
tags:
- golang
- string
---

### strings的分割

如下strings.Split无法判断字符串中是否有某个字段，要用strings.Contains：

{% highlight golang %}    
func strings_split() {
	a := ""
	needs := strings.Split(a, ",")
	fmt.Println("needs", needs, len(needs))
	for _, need := range needs {
		fmt.Println("need", need)
	}

	fmt.Println(strings.Contains(a, ","))
}
{% endhighlight %}
    

结果如下，无法通过needs的长度来判断是否包含了某个字段：

	needs [] 1
	need 
	false

### strings的剪切

如下strings.TrimLeft无法切断某一个字符串，要用strings.TrimPrefix：

{% highlight golang %}    
func strings_TrimLeft() {
	a := "not enough arguments in call to route.MergeGpsRouteSummary"
	fmt.Println(strings.TrimLeft(a, "not enough arguments in call to "))
}
{% endhighlight %}

结果如下：

	.MergeGpsRouteSummary
