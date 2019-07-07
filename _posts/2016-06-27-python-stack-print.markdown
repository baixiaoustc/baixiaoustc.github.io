---
author: baixiaoustc
comments: true
date: 2016-06-27 15:47:08+00:00
layout: post
slug: 2016-06-27-python-stack-print
title: python的调用栈打印
wordpress_id: 114
categories:
- 后端技术
tags:
- python
---

如何简单地打印Python的调用栈？

{% highlight python %}
__author__ = 'baixiao'
    
def detailtrace(info):
    import sys
    import os
    retStr = ""
    curindex=0
    f = sys._getframe()
    f = f.f_back    # first frame is detailtrace, ignore it
    while hasattr(f, "f_code"):
        co = f.f_code
        retStr = "%s(%s:%s)->"%(os.path.basename(co.co_filename), co.co_name, f.f_lineno) + retStr
        f = f.f_back
    print retStr+info
    
    
def func_b():
    detailtrace("baixiao")
    
    
def func_a():
    func_b()
    
    
if __name__ == "__main__":
    func_a()
{% endhighlight %}
    


![未命名](http://baixiaoustc.github.io/wordpress/wp-content/uploads/2016/06/未命名-5.png)
