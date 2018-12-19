---
author: baixiaoustc
comments: true
date: 2018-12-18 09:54:23+00:00
layout: post
slug: 2018-12-18-finally-highlighter-with-rouge
title: 总算搞定了代码高亮
categories:
- 网站
tags:
- jekyll
---

* content 
{:toc}


为了代码高亮这个事情，搞了两天晚上，真是头昏脑胀。

换过电脑之后，先把jekyll的依赖环境ruby/gem/bundle啥的都装上，具体google完成。装上之后可以用命令`bundle exec jekyll serve`进行调试了。

项目根目录下面的_config.yml里面有对应的配置，目前是：`highlighter: rouge`，rouge的项目地址是：[https://github.com/jneen/rouge](https://github.com/jneen/rouge)。

用命令`rougify help style`看rouge支持哪些高亮配色，最终选了个普通的github配色，生成css文件：`rougify style github > rouge.css`。将该css文件放入项目路径`assets/rouge/rouge.css`里去，然后在`_includes/head.html`里面添加引用：`<link rel="stylesheet" href="{{ '/assets/rouge/rouge.css' }}" />`。

然后就可以在文章里面使用啦，使用格式如下（注意「」替换为{}）：

「% highlight golang %」

code

「% endhighlight %」

效果如下：

{% highlight golang linenos %}
func GetDb(userId string) (db *gorm.DB, err error) {
	//if GDoubleWrite == 0 {
	//	db = GGPSDb
	//	return
	//} else {
	//判断到哪个分库
	if len(userId) == 0 {
		err = fmt.Errorf("zero len userid")
		return
	}

	var db_index int64
	db_index, err = strconv.ParseInt(userId[0:1], 16, 64)
	if err != nil {
		clog.Warnf("[user:%s] db_index error: %v", userId, err)
		return
	}

	db = g_dbGPSArr[db_index]
	clog.Debugf("%d dbGPSx %v", db_index, db)
	return
	//}
}
{% endhighlight %}
