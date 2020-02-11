---
author: baixiaoustc
comments: false
date: 2018-07-09 09:54:23+00:00
layout: post
slug: 2018-07-09-data-structure-2
title: 数据结构之链表
categories:
- 计算机
tags:
- 数据结构 
---

* content 
{:toc}

转自zwl同学。

### 链表(Linked List)

```
数据存储在节点(Node)中
动态数组、栈、队列底层依托静态数组，靠resize解决固定容量问题
优点：真正的动态数据结构，不需要处理固定容量的问题
缺点：丧失了随机访问的能力
```

```java
class Node {
    E e;
    Node next;
}
```

#### 在链表头添加元素

<img src="http://flowerman.cc/data-structure/6-1.png" width = 80% />

---

<img src="http://flowerman.cc/data-structure/6-2.png" width = 80% />

---

<img src="http://flowerman.cc/data-structure/6-3.png" width = 80% />

---

在索引为2的地方添加元素666<br>
关键点在于找到要添加节点的前一个节点

<img src="http://flowerman.cc/data-structure/6-4.png" width = 70% />

---

<img src="http://flowerman.cc/data-structure/6-5.png" width = 70% />

---

<img src="http://flowerman.cc/data-structure/6-6.png" width = 70% />

---

<img src="http://flowerman.cc/data-structure/6-7.png" width = 70% />

---

顺序很重要

<img src="http://flowerman.cc/data-structure/6-8.png" width = 70% />

---

#### 链表(虚拟头节点)

<img src="http://flowerman.cc/data-structure/7-1.png" width = 80% />

---

#### 删除索引为2位置的元素

<img src="http://flowerman.cc/data-structure/7-2.png" width = 80% />

---

链表元素删除常见的错误

<img src="http://flowerman.cc/data-structure/7-3.png" width = 80% />

---

#### 链表的时间复杂度分析

```
添加操作                 O(n)
    addLast(e)          O(n)
    addFirst            O(1)
    add(index,e)        O(n/2) = O(n)
    
删除操作                 O(n)
    removeLast(e)       O(n)
    removeFirst(e)      O(1)
    remove(index,e)     O(n/2) = O(n)
    
修改操作                 O(n)
    set(index,e)        O(n)
    
查找操作                 O(n)
    get(e)              O(n)
    contains(e)         O(n)
    find(e)             O(n) // 就算查到e，也不能拿e的索引直接访问，无需实现
```

---

什么情况下使用链表

<img src="http://flowerman.cc/data-structure/7-4.png" width = 80% />

---

使用链表实现栈

---

使用链表实现队列

<img src="http://flowerman.cc/data-structure/8-1.png" width = 80% />

---

#### 双链表

单链表删除末尾元素复杂度仍然是O(n)，可以用双链表来解决

```java
class Node {
    E e;
    Node next, prev;
}
```

---

<img src="http://flowerman.cc/data-structure/9-1.png" width = 80% />

---

#### 循环链表

循环链表的好处是进一步把操作进行了统一，比如向链表结尾添加元素，不需要用tail一直指着结尾，我们用循环链表，直接在dummyHead前添加元素就是在链表末尾添加元素

<img src="http://flowerman.cc/data-structure/11-1.png" width = 80% />

---

#### 数组链表

```
class Node {
    E e;
    int next;
}
```

---

<img src="http://flowerman.cc/data-structure/12-1.png" width = 80% />

---

### 递归

```
本质上，将原来的问题，转化为更小的同一个问题
递归调用是有代价的：函数调用 + 系统栈空间
```

---

链表有天然的递归性质

<img src="http://flowerman.cc/data-structure/10-1.png" width = 60% />

---

#### 删除链表中元素

<img src="http://flowerman.cc/data-structure/10-2.png" width = 80% />

---
