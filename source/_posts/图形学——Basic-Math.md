---
title: 图形学——Basic Math
date: 2018-10-24 17:22:19
tags: [computer graphics,mathematics]
categories: 图形学
mathjax: true
---
加入了智能成像实验室，但是我对计算机图形学了解还太浅，因此需要学习一些图形学的基础知识。本篇博客先介绍一些很简单的数学基础。
<!--more-->

### 右手坐标系 ###

首先是XYZ坐标轴，一般我们使用的坐标轴是符合右手定则的。这也是大多数数学教材使用的坐标轴的定义。右手定则即用右手从X轴方向握向Y轴方向，这时候伸出大拇指，大拇指的朝向就是Z轴的方向。实际上这是一个很基础的知识，但是我过去没多久才发现自己一直不知道这个东西。直到计算第二型曲面积分时候发现结果总是相反才发现。

### 向量点乘和叉乘 ###

#### 点乘（Dot Product） ####

$\mathbf{a} \cdot \mathbf{b} = \vert a \vert \vert b\vert \cos {\theta}$

$\theta = \cos ^{-1} \frac {\mathbf{a} \cdot \mathbf{b} }{\vert a \vert \vert b\vert}$

实际上在笛卡尔坐标系中求解两个向量的点乘是非常容易的：

$\mathbf{a} = x_a \mathbf{x} + y_a \mathbf{y},\mathbf{b} = x_b \mathbf{x} + y_b \mathbf{y}$

则：$\mathbf{a} \cdot \mathbf{b} = x_a x_b + y_a y_b$

因此点乘可以用来求两个向量的夹角。

另一个点乘的应用是求某个向量到另一个向量上的投影，如$\mathbf{a}$在$\mathbf{b}$上的投影长度实际上是$\vert \mathbf{a} \vert \cos \theta$，而$\vert \mathbf{a} \vert \cos \theta = \frac {\vert \mathbf{b}\vert\vert \mathbf{a} \vert \cos \theta}{\mathbf{b} } = \frac {\mathbf{a} \cdot \mathbf{b} }{\vert \mathbf{b}\vert}$.

同样的想要求投影之后的向量也很简单，只要用长度乘上$\mathbf{b}$方向的单位向量即可：
$\mathbf{p} =  \frac {\mathbf{a} \cdot \mathbf{b} \mathbf{b} }{\vert \mathbf{b}\vert ^2}$.

#### 叉乘（Cross Product） ####

$\vert \mathbf{a} \times \mathbf{b} \vert= \vert \mathbf{a} \vert \vert \mathbf{b}\vert \sin \theta$

上面为叉乘的长度，除此之外，叉乘得到的是一个向量，它的方向符合右手定则，也与原来两个向量垂直。

从右手定则可以很容易推导出：$\mathbf{a} \times \mathbf{b} = - \mathbf{b} \times \mathbf{a}$.

同时也有以下的一些等式：
$$
\mathbf{x} \times \mathbf{y} = \mathbf{z},\mathbf{y} \times \mathbf{x} = -\mathbf{z}
$$
$$
\mathbf{a} \times \mathbf{a} = \mathbf{0}
$$
$$
\mathbf{a} \times (\mathbf{b} + \mathbf{c}) = \mathbf{a} \times \mathbf{b}+ \mathbf{a} \times \mathbf{c}
$$
$$
\mathbf{a} \times (k\mathbf{b}) = k(\mathbf{a} \times \mathbf{b})
$$

在笛卡尔坐标系下，叉乘的计算也不算困难：

$$
\mathbf{a}\times \mathbf{b} = 
\begin{vmatrix} 
\mathbf{x}&\mathbf{y}&\mathbf{z}\\
x_a&y_a&z_a\\
x_b&y_b&z_b
\end{vmatrix} = 
\begin{pmatrix} 
y_az_b - y_bz_a,\\
z_ax_b - x_az_b,\\
x_ay_b - y_ax_b 
\end{pmatrix}  
$$
而且也可以写成下面的形式：
$$
\mathbf{a}\times \mathbf{b} = A^* \mathbf{b}
\begin{pmatrix}
0&-z_a&y_a\\
z_a&0&-x_a\\
-y_a&x_a&0
\end{pmatrix} 
\begin{pmatrix}
x_b\\
y_b\\
z_b\\
\end{pmatrix}
$$

上式中$A^*$被成为向量$\mathbf{a}$的对偶矩阵。

### 坐标系(Coordinate Frames) ###

坐标系并不是只有XYZ，XYZ只是标识而已。任何满足下面条件的三个向量，都可以作为坐标系：

* $\vert \mathbf{u} \vert = \vert \mathbf{v} \vert = \vert \mathbf{w} \vert = 1$
* $\mathbf{u} \cdot \mathbf{v} = \mathbf{v} \cdot \mathbf{w} = \mathbf{u} \cdot \mathbf{w} = 0$
* $\mathbf{w} = \mathbf{u} \times \mathbf{v}$

任何一个向量可以写成各个坐标系的投影之和：
$$
\mathbf{p}  = (\mathbf{p} \cdot \mathbf{u} ) \mathbf{u} + (\mathbf{p} \cdot \mathbf{v}) \mathbf{v} + (\mathbf{p} \cdot \mathbf{w})\mathbf{w}  
$$

如何使用两个非零非同方向的向量创造一个坐标系（在三维重建中可能会经常碰到）？
$$
 \mathbf{u} = \frac {\mathbf{a} }{ \vert \mathbf{a}\vert},\mathbf{w} = \frac {\mathbf{a} \times \mathbf{b} }{\vert \mathbf{a} \times \mathbf{b} \vert}, \mathbf{v}= \mathbf{w} \times \mathbf{v}.
$$

从上面我们可以看到叉乘对于创建一个坐标系的作用。

### 矩阵（Matrix） ###

$(AB)^{-1} = B^{-1}A^{-1}$,因为$ AB B^{-1} A^{-1} = I$.

通过矩阵可以实现空间点的各种转换。