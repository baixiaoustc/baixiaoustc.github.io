---
author: baixiaoustc
comments: false
date: 2019-09-11 09:54:23+00:00
layout: post
slug: 2019-09-11-golang-floating-number
title: golang浮点数精度问题
categories:
- 后端技术
tags:
- golang 
---

* content 
{:toc}

记录一个最近遇到的浮点数精度问题。

# 示例
已知商品价格为1元（数据库记录为100分），有优惠条件售价降低为原价80%，求现在买一件商品优惠多少钱？

代码：

{% highlight golang %}
func math1() {
	fmt.Println("math1")
	var count int64 = 1
	var price int64 = 100
	var rate int64 = 80

	a := float64(rate) / 100.0
	fmt.Println("a:", a)
	b := 1 - a
	fmt.Println("b:", b)
	c := float64(count*price) * b
	fmt.Println("c:", c)
	discount := int64(c)
	fmt.Println("discount:", discount)
}
{% endhighlight %}

输出：

	math1
	a: 0.8
	b: 0.19999999999999996
	c: 19.999999999999996
	discount: 19
	
最后优惠19分。这么简单都要出错！

![](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1568213988573&di=83532dbe5cdb4b89c1e9e7f320cc3b2d&imgtype=0&src=http%3A%2F%2F2e.zol-img.com.cn%2Fproduct%2F87_500x2000%2F88%2FcecyeD29t4fg.png)

# 原理
重新学习了一下浮点数的原理，[文章《What Every Programmer Should Know About Floating-Point Arithmetic》](https://floating-point-gui.de)讲得不错。归纳有几点：

## why
### 计算机无法精确存储大部分浮点数
和整数一样，计算机用二进制来存储浮点数。举个例子，在代码中的`0.1`，经过编译或者解释（interpreted）之后就已经被一个接近真实值的二进制数字来代替了，也就是说还没开始运算数值就已经变得不精确了。

用python来演示也是一样：

	>>> a=80/100.0
	>>> a
	0.8
	>>> 1-a
	0.19999999999999996
	>>> b=50/100.0
	>>> b
	0.5
	>>> 1-b
	0.5

### 为何有些浮点数又能精确处理，比如0.5
0.5即1/2，只要分母是2的幂次方就能精确处理，这个后续会详解。

## what，具体是怎么造成的
### 二进制表示
大家都很清楚整数的二进制表示如下：

![](http://image99.renyit.com/image/WeWork%20Helper20190911083219.png)

相对应的小数的二进制表示如下：

![](http://image99.renyit.com/image/WeWork%20Helper20190911083258.png)

那么问题来了，对于无理数（Pi）或者是小数位很多的有理数而言，计算机不可能有足够多的或者无限多的bit位来保存它，那么不可避免的就有精度问题。相对的，如果能用有限个分母是2的幂次方的小数组成的话，就能精确表示。

### 浮点数的真正含义
实际上浮点数用科学计数法来表示，运用尾数和指数，外加符号来表示。IEEE754定义的单精度和双精度浮点数如下：

![](http://image99.renyit.com/image/WeWork%20Helper20190911090047.png)

需要注意符号位在首，且指数有127位（单精度）或者1023位（双精度）的偏移量来表示正负。举一个例子：比如十进制数123.125，其二进制表示为：1111011.001，规格化表示为：1.111011001×pow(2,6) 也就是1.111011001×pow(2,133−127)，f（尾数）= 111011001，E（指数） = 133 = 10000101，图示如下：

![](http://image99.renyit.com/image/2019-09-11-1)

## how，如何避免精度问题
### 按照自身的需求对小数点后多少位进行截断
代码：

{% highlight golang %}
func math2() {
	fmt.Println("math2")
	var count int64 = 1
	var price int64 = 100
	var rate int64 = 80

	a := Round(float64(rate)/100.0, 5)
	fmt.Println("a:", a)
	b := Round(1-a, 5)
	fmt.Println("b:", b)
	c := Round(float64(count*price)*b, 5)
	fmt.Println("c:", c)
	discount := int64(c)
	fmt.Println("discount:", discount)
}

func Round(f float64, n int) float64 {
	n10 := math.Pow10(n)
	return math.Trunc((f+0.5/n10)*n10) / n10
}
{% endhighlight %}

输出：

	math2
	a: 0.8
	b: 0.2
	c: 20
	discount: 20	

### 使用`精准类型（Exact Types）`
使用"github.com/shopspring/decimal"包，将对浮点数进行精确计算。
代码：

{% highlight golang %}
func math3() {
	fmt.Println("math3")
	var count int64 = 1
	var price int64 = 100
	var rate int64 = 80

	f1 := decimal.NewFromFloat(float64(rate))
	f2 := decimal.NewFromFloat(100)
	a := f1.Div(f2)
	fmt.Println("a:", a)
	b := decimal.NewFromFloat(1).Sub(a)
	fmt.Println("b:", b)
	f3 := decimal.NewFromFloat(float64(count))
	f4 := decimal.NewFromFloat(float64(price))
	c := f3.Mul(f4).Mul(b)
	fmt.Println("c:", c)
	discount := c.IntPart()
	fmt.Println("discount:", discount)
}
{% endhighlight %}

输出：

	math3
	a: 0.8
	b: 0.2
	c: 20
	discount: 20

这个包实际上用到了[https://golang.org/pkg/math/big/](https://golang.org/pkg/math/big/)，其作为`Arbitrary-Precision Decimal`的一种，主要原理就是加大尾数和指数的位数，但是降低了性能。
