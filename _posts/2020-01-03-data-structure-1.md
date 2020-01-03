---
author: baixiaoustc
comments: false
date: 2020-01-03 09:54:23+00:00
layout: post
slug: 2020-01-03-data-structure-1
title: golang浮点数精度问题
categories:
- 计算机
tags:
- 数据结构 
---

* content 
{:toc}

转自zwl同学。

### 数组
把数据码成一排存放
<img src="http://flowerman.cc/data-structure/1-1.png" width = 80% height = 80% />
---
```
数组最大的优点：快速查询，scores[2]
数组最好应用于“索引有语意”的情况，但并非所有有语意的情况都适用于数组，如身份证号，原因，太大
```

#### 向指定位置添加元素
<img src="http://flowerman.cc/data-structure/1-2.png" width = 80% />
---
元素后移
<img src="http://flowerman.cc/data-structure/1-3.png" width = 80% />
---

#### 删除指定位置元素
<img src="http://flowerman.cc/data-structure/1-4.png" width = 80% />
---
这里的第二个100可以置空，可以不置空，不置空也是安全的，因为它无法被访问到
<img src="http://flowerman.cc/data-structure/1-5.png" width = 80% />
---

#### 动态扩容
<img src="http://flowerman.cc/data-structure/1-6.png" width = 80% />
---
<img src="http://flowerman.cc/data-structure/1-7.png" width = 80% />
---

#### 数组简单的复杂度分析
添加操作

```
addLast(e)     O(1)
addFirst(e)    O(n)
add(index,e)   O(n/2) = O(n)
resize         O(n)
整体来讲添加操作复杂度 O(n)
```

删除操作

```
removeLast(e)	  O(1)
removeFirst(e)	  O(n)
remove(index,e)   O(n/2) = O(n)
resize            O(n)
整体来讲添删除操作复杂度 O(n)
```

修改操作

```
set(index, e)     O(1)  // 已知索引
```

查询操作

```
get(index)      O(1)
contains(e)     O(n)
find(e)         O(n)
```

均摊复杂度

```
假设当前capacity = 8，并且每一次添加操作都使用addLast，9次addLast操作，触发resize，总共进行了17次基本操作。
假设capacity = n, n+1次addLast，触发resize，总共进行2n+1次基本操作。
平均，每次addLast操作，进行2次基本操作，这样均摊计算，时间复杂度是O(1)的。
```

复杂度震荡

```
resize         O(n)
removeLast时resize过于着急（Eager）
解决方案：Lazy
当size == capacity / 4 时，才将capacity减半

```

### 栈 Stack
```
栈也是一种线性结构
相比数组，栈对应的操作是数组的子集
只能从一端添加元素，也只能从一端取出元素
这一端称为栈顶
```
<img src="http://flowerman.cc/data-structure/2-1.png" width = 20% height = 20% />

```
栈是一种后进先出的数据结构
Last In First Out（LIFO）
```

#### 常见应用
<img src="http://flowerman.cc/data-structure/2-2.png" width = 80% />
---

<img src="http://flowerman.cc/data-structure/2-3.png" width = 80% />
---

<img src="http://flowerman.cc/data-structure/2-4.png" width = 80% />
---

<img src="http://flowerman.cc/data-structure/2-5.png" width = 80% />
---
#### 栈的复杂度分析
```
ArrayStack<E>       
void push(E)        O(1) 均摊
E pop()             O(1) 均摊
E peek()            O(1)
int getSize()       O(1)
boolean isEmpty()   O(1)
```

###  队列 Queue
```
队列也是一种线性结构
相比数组，队列对应的操作是数组的子集
只能从一端（队尾）添加元素，只能从另一端（队首）取出元素
队列是一种先进先出的数据结构（先到先得），First In First Out（FIFO）
```
<img src="http://flowerman.cc/data-structure/3-1.png" width = 20% width = 20% />
---

删除队首元素（a）
<img src="http://flowerman.cc/data-structure/4-1.png" width = 80% />
---

删除后
<img src="http://flowerman.cc/data-structure/4-2.png" width = 80% />
---

#### 数组队列的复杂度分析
```
ArrayQueue<E>       
void enqueue(E)     O(1) 均摊
E dequeue()         O(n) // 出队
E front()           O(1)
int getSize()       O(1)
boolean isEmpty()   O(1)
```

### 循环队列

front == tail 队列为空
<img src="http://flowerman.cc/data-structure/5-1.png" width = 80%  />
---

<img src="http://flowerman.cc/data-structure/5-2.png" width = 80%  />
---

<img src="http://flowerman.cc/data-structure/5-3.png" width = 80%  />
---

(tail + 1) % c == front 队列满
capacity中，浪费了一个空间
<img src="http://flowerman.cc/data-structure/5-4.png" width = 80%  />
---
#### 循环队列的复杂度分析
```
LoopQueue<E>        
void enqueue(E)     O(1) 均摊 
E dequeue()         O(1) 均摊 
E getFront()        O(1) 
int getSize()       O(1) 
boolean isEmpty()   O(1)
```
