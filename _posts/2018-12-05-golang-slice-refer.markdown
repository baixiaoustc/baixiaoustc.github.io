---
author: baixiaoustc
comments: true
date: 2018-12-05 09:54:23+00:00
layout: post
slug: 2018-12-05-golang-slice-refer
title: golang中slice的引用类型的坑
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}


先说结论：

* golang中函数传参只有值传递，没有引用传递
* golang中的slice/map/channel是引用类型

针对第一点，官方文档说的很清楚：

> In a function call, the function value and arguments are evaluated in the usual order. After they are evaluated, the parameters of the call are **passed by value** to the function and the called function begins execution. 

来看例子：

{% highlight golang %}
func main() {
	ids := make([]string, 0)
	fmt.Printf("&ids     addr:%p\n", &ids)
	ids = append(ids, "23")
	fmt.Printf("&ids[0]  addr:%p\n", &ids[0])
	
	funca := func(productId string, idsa []string) {
		fmt.Printf("&idsa    addr:%p\n", &idsa)
		fmt.Printf("&idsa[0] addr:%p\n", &idsa[0])
		idsa = append(idsa, productId)
		fmt.Printf("&idsa[0] addr:%p after append\n", &idsa[0])
		fmt.Printf("&idsa[1] addr:%p\n", &idsa[1])
	}
	
	productId := "144"
	funca(productId, ids)
	fmt.Println(ids)
	
	funcb := func(idsb []string) {
		for i := range idsb {
			idsb[i] = fmt.Sprint(i)
			fmt.Printf("&idsb[i] addr:%p\n", &idsb[i])
		}
	}
	
	funcb(ids)
	fmt.Println(ids)
}
{% endhighlight %}

看结果：

	&ids     addr:0xc42000a060
	&ids[0]  addr:0xc42000e1d0
	&idsa    addr:0xc42000a080
	&idsa[0] addr:0xc42000e1d0
	&idsa[0] addr:0xc42000a0a0 after append
	&idsa[1] addr:0xc42000a0b0
	[23]
	&idsb[i] addr:0xc42000e1d0
	[0]

先不看地址相关打印，两个函数`funca`和`funcb`的目的分别是增加slice的元素和修改slice的值。可见，`funca`是无效的而`funcb`有效。为什么呢？

疑问有两点：

1. 既然函数传参是值传递，为什么`funcb`可以修改实参ids的值？
2. 既然`funcb`有效，为什么`funca`的append操作无效？

那么从地址打印来看，`&ids`和`&idsa`的地址不同，所以证实了函数传参不是引用传递，确实是值传递。但是，`&ids[0]`和`&idsa[0]`以及`&idsb[i]`的地址都是**0xc42000e1d0**，这是一个很奇怪的现象。

这时需要看看slice的结构了：

> slice是一种数据结构，它描述的是与slice变量本身相隔离的，存储在数组里的连续部分。slice不是数组，slice描述的是一段数组。 

> 在函数传参时，slice传递了一个含有指针和长度的结构的值，而不是一个指向结构的指针。这一点非常重要。

![](http://image99.renyit.com/image/UZRnAnz.png)

因此，实参`ids`和行参`idsa`、`idsb`是指向的同一段数组。所以funcb是可以修改实参的值。第一个问题解决了。再看funca里面的append之后，`idsa[0]`的地址改变了，所以说append之后实际上`idsa`指向了另一个数组。第二个问题也解决了。

另外，一开始可能会奇怪，`&ids`的地址**0xc42000a060**和`&ids[0]`的地址**0xc42000e1d0**在地址空间中差得很远，正说明了slice和slice指向的数组是两个东西，分配的是两块内存地址。只不过slice会指向关联数组，slice的结构中保存了数组的地址。

所以我们的面试题就很简单了：

{% highlight golang %}
type T struct {
	ls []int
	v  int
}
	
func foo(t T) {
	t.ls[0] = 999
	t.v = 888
}
	
func main() {
	var t = T{ls: []int{1, 2, 3}}
	foo(t)
	fmt.Println(t)
}
{% endhighlight %}
