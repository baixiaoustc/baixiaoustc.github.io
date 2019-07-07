---
author: baixiaoustc
comments: false
date: 2019-05-09 09:54:23+00:00
layout: post
slug: 2019-05-09-golang-hystrix-examples
title: golang的熔断包hystrix的用例
categories:
- 后端技术
tags:
- golang 
- 熔断
---

* content 
{:toc}

服务器的熔断机制是个大话题，可以参考这篇文章一窥究竟：[熔断，限流，降级](https://www.cnblogs.com/raoshaoquan/articles/6636067.html)。

Netflix的熔断系统Hystrix很有效，并提供了golang的包：[https://github.com/afex/hystrix-go](https://github.com/afex/hystrix-go)。来看看参数如何使用，代码中的默认配置定义为：

{% highlight golang %}
var (
	// DefaultTimeout is how long to wait for command to complete, in milliseconds
	DefaultTimeout = 1000
	// DefaultMaxConcurrent is how many commands of the same type can run at the same time
	DefaultMaxConcurrent = 10
	// DefaultVolumeThreshold is the minimum number of requests needed before a circuit can be tripped due to health
	DefaultVolumeThreshold = 20
	// DefaultSleepWindow is how long, in milliseconds, to wait after a circuit opens before testing for recovery
	DefaultSleepWindow = 5000
	// DefaultErrorPercentThreshold causes circuits to open once the rolling measure of errors exceeds this percent of requests
	DefaultErrorPercentThreshold = 50
)
{% endhighlight %}

# RequestVolumeThreshold 指明某个command在多少次调用之后开始探测熔断

{% highlight golang %}
package main

import (
	"errors"
	"log"
	"math/rand"
	"third/hystrix"
	"time"
)

func init() {
	hystrix.ConfigureCommand("seckill", hystrix.CommandConfig{
		Timeout:                1, //cmd的超时时间，一旦超时则返回失败
		MaxConcurrentRequests:  1, //最大并发请求数
		RequestVolumeThreshold: 1, //熔断探测前的调用次数
		SleepWindow:            1000, //熔断发生后的等待恢复时间
		ErrorPercentThreshold:  10,//失败占比
	})
}

var Gcount, Gerror int

func testHystrix() error {

	query := func() error {
		var err error
		r := rand.Float64()
		Gcount++
		if r < 1 {
			err = errors.New("bad luck")
			Gerror++
			return err
		} else {
			time.Sleep(20 * time.Millisecond)
		}

		return nil
	}

	service := "seckill"
	var err error
	err = hystrix.Do(service, func() error {
		err = query()
		return err
	}, nil)

	return err
}

func main() {
	for i := 0; i < 10; i++ {
		err := testHystrix()
		if err != nil {
			log.Printf("testHystrix error:%v", err)
		}
	}

	log.Printf("Gcount:%d Gerror:%d", Gcount, Gerror)
}
{% endhighlight %}

如上，RequestVolumeThreshold 为1，则第二次调用开始探测，由于所有调用全部失败，则熔断立马被触发，后续调用全部不能触达`query`函数。

	2019/05/09 15:15:15 testHystrix error:bad luck
	2019/05/09 15:15:15 hystrix-go: opening circuit seckill
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 15:15:15 testHystrix error:hystrix: circuit open
	2019/05/09 16:02:56 Gcount:1 Gerror:1
	
	Process finished with exit code 0
	
最后的结果为调用了一次，失败一次。

# SleepWindow 指明在熔断发生后何时开始探测其是否恢复，单位毫秒

修改参数为：

{% highlight golang %}
	hystrix.ConfigureCommand("seckill", hystrix.CommandConfig{
		Timeout:                1, //cmd的超时时间，一旦超时则返回失败
		MaxConcurrentRequests:  1, //最大并发请求数
		RequestVolumeThreshold: 1, //熔断探测前的调用次数
		SleepWindow:            1, //熔断发生后的等待恢复时间
		ErrorPercentThreshold:  10,//失败占比
	})
{% endhighlight %}	

熔断发生后1毫秒后就开始探测是否恢复，当然结果还是继续失败：

	2019/05/09 16:36:21 testHystrix error:bad luck
	2019/05/09 16:36:21 hystrix-go: opening circuit seckill
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 testHystrix error:hystrix: circuit open
	2019/05/09 16:36:21 hystrix-go: allowing single test to possibly close circuit seckill
	2019/05/09 16:36:21 testHystrix error:hystrix: timeout
	2019/05/09 16:36:21 Gcount:2 Gerror:2
	
	Process finished with exit code 0
	
最后的结果为调用了两次，失败两次。	

# Timeout 指明command的执行超时时间，单位毫秒

参数为原始参数。修改`query`函数：

{% highlight golang %}
	query := func() error {
		var err error
		r := rand.Float64()
		Gcount++
		if r < 0 {
			err = errors.New("bad luck")
			Gerror++
			return err
		} else {
			time.Sleep(20 * time.Millisecond)
		}

		return nil
	}
{% endhighlight %}

所有调用都超时，结果为调用了一次，失败0次。

	2019/05/09 16:49:43 testHystrix error:hystrix: timeout
	2019/05/09 16:49:43 hystrix-go: opening circuit seckill
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 testHystrix error:hystrix: circuit open
	2019/05/09 16:49:43 Gcount:1 Gerror:0
	
	Process finished with exit code 0
	
# ErrorPercentThreshold 指明熔断的触发条件：失败调用占总调用次数的比例

参数为原始参数。修改`query`函数：

{% highlight golang %}
	query := func() error {
		var err error
		r := rand.Float64()
		Gcount++
		if r < 0.1 {
			err = errors.New("bad luck")
			Gerror++
			return err
		} else {
			time.Sleep(20 * time.Millisecond)
		}

		return nil
	}
{% endhighlight %}

测试100次，结果太长不贴了，核心就是失败次数占总次数的比例，触发熔断之后清空，待恢复之后重新计算。

# MaxConcurrentRequests 指明最大并发数，很好理解了
