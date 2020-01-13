---
author: baixiaoustc
comments: false
date: 2020-01-13 09:54:23+00:00
layout: post
slug: 2020-01-13-data-structure-3
title: 数据结构之二叉树
categories:
- 计算机
tags:
- 数据结构 
---

* content 
{:toc}

转自zwl同学。

### 二叉树

```
和链表一样，动态数据结构
二叉树具有唯一根节点
二叉树每个节点最多有两个孩子
二叉树每个节点最多有一个父亲
二叉树具有天然的递归结构
每个节点的左子树也是二叉树
每个节点的右子树也是二叉树
二叉树不一定是满的
一个节点也是二叉树
null也是二叉树
```

```java
class Node {
    E e;
    Node left;
    Node right;
}
```

---

![](http://flowerman.cc/data-structure/13-1.png)

---

#### 二分搜索树
Binary Search Tree

```
二分搜索树是二叉树
二分搜索树的每个节点的值：
    大于其左子树的所有节点的值
    小于其右子树的所有节点的值
每一棵子树也是二分搜索树
储存的元素必须有可比较性    
```

---

![](http://flowerman.cc/data-structure/14-1.png)

---

#### 二分搜索树添加元素
![](http://flowerman.cc/data-structure/14-2.png)

---

```
我们的二分搜索树不包含重复元素
如果想包含重复元素的话，只需要定义：
	左子树小于等于节点；或者右子树大于等于节点
注意：我们之前讲的数组和链表，可以有重复元素	
```

#### 二分搜索树的遍历
![](http://flowerman.cc/data-structure/14-3.png)

---

```
前序遍历 // 28，16，13，22，30，29，42
中序遍历，结果是顺序的 // 13，16，22，28，29，30，42
后序遍历 // 13，22，16，29，42，30，28
```

二分搜索树前序遍历的非递归实现
![](http://flowerman.cc/data-structure/15-1.png)

---

```
28入栈
28出栈
30，16入栈
16出栈
22，13入栈
13出栈
```

#### 二分搜索树的层序遍历
![](http://flowerman.cc/data-structure/16-1.png)

---

![](http://flowerman.cc/data-structure/16-2.png)

---

```
28入队
28出队
16，30入队
16出队
13，22入队
```

#### 深度优先和广度优先

---

二分搜索树的最小值和最大值

![](http://flowerman.cc/data-structure/17-1.png)

---

#### 二分搜索树删除节点
```
对于带删除的节点，左子树或右子树为空，好处理，较难的是删除一个左右子树都不为空的节点
1962年，Hibbard提出 - Hibbard Deletion
```

```
删除左右都有孩子的节点d
找到 s = min(d -> right)
s 是 d 的后继
s -> rigth = delMin(d -> right)
s -> left = d -> left
删除d，s是新的子树的根
```

---

![](http://flowerman.cc/data-structure/18-1.png)

---

![](http://flowerman.cc/data-structure/18-2.png)

---

或者找s的前驱

![](http://flowerman.cc/data-structure/18-3.png)

---

#### floor & ceil
```
二分搜索树的floor和ceil
floor // 比45小的最大的元素
ceil // 比45大的最小的元素
与前驱和后继不同的是floor和ceil可以不在二分搜索树中
```

---

![](http://flowerman.cc/data-structure/19-1.png)

#### rank & select
```
rank // 58是排名第几的元素？
select // 排名第10的元素是谁？
```

#### 维护size的二分搜索树
![](http://flowerman.cc/data-structure/20-1.png)

---

#### 维护depth的二分搜索树
![](http://flowerman.cc/data-structure/21-1.png)

---

#### 支持重复元素的二分搜索树
![](http://flowerman.cc/data-structure/22-1.png)

---

### 前驱 & 后继
```
前驱（successor）
后继（predecessor）
如果一个二叉树中序遍历顺序为1，2，3，4，5
3的前驱是2，3的后继是4
```

### 集合
set

```java
class Node {
    E e;
    Node left;
    Node right;
}

class Node {
    E e;
    Node next;
}
```

```java
Set<E>
void add(E)
void remove(E)
boolean contains(E)
int getSize()
boolean isEmpty()
```

h代表树的高度

```
                LinkedListSet       BSTSet  平均     最差
增add           O(n)                 O(h)   O(logn)  O(n)
查contains      O(n)                 O(h)   O(logn)  O(n)
删remove        O(n)                 O(h)   O(logn)  O(n)
```

#### 二分搜索树的复杂度分析
![](http://flowerman.cc/data-structure/23-1.png)

---

![](http://flowerman.cc/data-structure/23-2.png)

---

![](http://flowerman.cc/data-structure/23-3.png)

---

![](http://flowerman.cc/data-structure/23-4.png)

---

logn和n的差距
![](http://flowerman.cc/data-structure/24-5.png)

```
有序集合中的元素具有顺序性 // 基于搜索树的实现
无序集合中的元素没有顺序性 // 基于哈希表的实现
```
