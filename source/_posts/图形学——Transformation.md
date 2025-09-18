---
title: 图形学——Transformation
date: 2018-10-25 15:13:46
tags: [computer graphics,transformation]
categories: 图形学
mathjax: true
---
上次博客最后一个主题矩阵，只说了句矩阵可以完成很多转换。而这次就主要来说明各种转换。
<!--more-->

所有的转换我们都是通过矩阵和向量完成的。

### 缩放（Scale） ###

$$
Scale(s_x,s_y,s_z) = 
\begin{pmatrix}
s_x&0&0\\
0&s_y&0\\
0&0&s_z
\end{pmatrix} \ Scale^{-1}(s_x,s_y,s_z) = 
\begin{pmatrix}
s_x^{-1}&0&0\\
0&s_y^{-1}&0\\
0&0&s_z^{-1}
\end{pmatrix}
$$

上述中$s_x,s_y,s_z$分别为各个坐标轴的缩放倍数。实际的转换过程如下：

$$
\begin{pmatrix}
s_x&0&0\\
0&s_y&0\\
0&0&s_z
\end{pmatrix} \begin{pmatrix}
x\\
y\\
z
\end{pmatrix} = 
\begin{pmatrix}
s_xx\\
s_yy\\
s_zz
\end{pmatrix}
$$

### 错切（Shear） ###

错切可以将一个矩形转换成平行四边形。

$$
Shear(s_x,s_y) = 
\begin{pmatrix}
s_x&a\\
0&s_y
\end{pmatrix} \ Shear^{-1}(s_x,s_y) = 
\begin{pmatrix}
s_x&-a\\
0&s_y
\end{pmatrix}
$$

上面式子主要完成的是对于y>0的点前移，y<0的点后移，而各点的y坐标不变。从而产生了错切的感觉。得到的结果：$y'=y,x'=x+ay$.

### 旋转（Rotation） ###

2维空间的旋转变换次序是没有影响的，但是对于三维空间却可能得到不一样的结果。

#### 2D rotation ####

这里说的旋转是绕着原点旋转。
$$
\begin{bmatrix}
x'\\
y'
\end{bmatrix}
 = 
\begin{bmatrix}
\cos \theta & - \sin \theta\\
\sin \theta &\cos \theta
\end{bmatrix}
\begin{bmatrix}
x\\
y
\end{bmatrix}
$$

有趣的是：$R^T R = I$

#### 3D rotation ####

3D的rotation相比于2D的要复杂很多。但是实际上我们可以这样去理解：二维的旋转，相当于绕着Z轴旋转，因为z坐标不会变。

因此可以得到绕各个坐标轴旋转的矩阵：

$$
R_z = 
\begin{pmatrix}
\cos \theta & - \sin \theta & 0\\
\sin \theta &\cos \theta & 0\\
0&0&1
\end{pmatrix}
$$

同样的道理也就可以得到绕x轴与绕y轴的旋转：

$$
R_x = 
\begin{pmatrix}
1&0&0\\
0&\cos \theta & - \sin \theta \\
0&\sin \theta &\cos \theta \\
\end{pmatrix} \ R_y = 
\begin{pmatrix}
\cos \theta & 0&- \sin \theta \\
0&1&0\\
\sin \theta &0 &\cos \theta
\end{pmatrix}
$$

同样的:$R^TR = I$.

如果我们仔细观察可以发现，3D中R的各个行（列）向量满足一个三维坐标系的要求：单位向量且正交。因此如果我们将旋转矩阵写成下面的形式：

$$
R = 
\begin{pmatrix}
x_u & y_u & z_u\\
x_v & y_v & z_v\\
x_w & y_w & z_w
\end{pmatrix}
$$

则

$$
R_p = 
\begin{pmatrix}
x_u & y_u & z_u\\
x_v & y_v & z_v\\
x_w & y_w & z_w
\end{pmatrix}
\begin{pmatrix}
x_p\\
y_p\\
z_p
\end{pmatrix}
 = 
\begin{pmatrix}
\mathbf{u} \cdot \mathbf{p} \\
\mathbf{v} \cdot \mathbf{p} \\
\mathbf{z} \cdot \mathbf{p}
\end{pmatrix}
$$

上式最后一项正是$\mathbf{p}$在uvw坐标轴下的坐标值。因此旋转的本质实际上是将它映射到另一个坐标系当中了。

对于旋转矩阵如何求逆？因为旋转矩阵是正交矩阵，所有$R^{-1} = R^T$.

3D旋转是不可交换的。

但是上面的旋转矩阵相对来说比较简单，因为是绕着坐标轴旋转的。那么有没有办法绕着任意一个向量旋转$\theta$的公式？

##### 罗德里格旋转(Rodrigues)公式 #####

接下来这个公式就是用来解决上述问题的。假设向量（点）$b$绕着单位向量$\mathbf{a}$旋转$\theta$.

$\mathbf{b}=\mathbf{b}_ {∥}+\mathbf{b}_ {⊥}$，分布表示平行与垂直于$\mathbf{a}$的分量。很容易知道，$\mathbf{b}_ {∥}$在旋转过程中是不变的。

$\mathbf{b}_ {∥} = \mathbf{a} \cdot \mathbf{b} \mathbf{a}$

$\mathbf{b}_ {⊥} = 1 -\mathbf{b}_ {∥}$

然后我们要考虑到$\mathbf{b}_ {⊥}$是如何旋转的。实际上它旋转的平面是垂直于$\mathbf{a}$与$\mathbf{b}$的，容易想到利用叉乘来构造：

$\mathbf{c} = \mathbf{a} \times \mathbf{b}$，而且由于叉乘的性质，$\mathbf{c}$的长度恰好等于$\mathbf{b}_ {⊥}$.

现在旋转角度是$\theta$，则旋转后的向量在$\mathbf{b}_ {⊥}$与$\mathbf{c}$方向上的投影分别是$\mathbf{b}_ {⊥} \cos \theta$与$\mathbf{c} \sin \theta$.

旋转后的向量边上上述向量之和，并且希望写成旋转矩阵的形式（矩阵乘以向量）：
$$
\begin{align}
b' &= \mathbf{b}_ {⊥} \cos \theta +\mathbf{c} \sin \theta + \mathbf{b}_ {∥}\\
&= (\mathbf{b} -\mathbf{a} \cdot \mathbf{b} \mathbf{a} )\cos \theta +\mathbf{a} \times \mathbf{b} \sin \theta +\mathbf{a} \cdot \mathbf{b} \mathbf{a}\\
&= \mathbf{a}\mathbf{a}^T \mathbf{b} + (I -\mathbf{a}\mathbf{a}^T)\mathbf{b} \cos \theta + A^* \sin \theta \mathbf{b} 
\end{align}
$$

所以$R(\mathbf{a},\theta) =\mathbf{a}\mathbf{a}^T+ (I -\mathbf{a}\mathbf{a}^T)\cos \theta + A^* \sin \theta$.

上式是计算机图形学中很重要的一个基础公式。

### Note ###
如果要回到原来的样子，可以对所有的转换求逆。但是要注意的是：$M = M_1M_2M_3,M^{-1} = M_3^{-1}M_2^{-1}M_1^{-1}$.

### 齐次坐标转换（Homogeneous Coordinates） ###

不知道有没有人有这么一个疑问：为什么没有平移？？平移应该是最简单的转换，但是实际起来的实现却没有那么容易。首先做个尝试：

$$
\begin{pmatrix}
x'\\
y'\\
z'
\end{pmatrix} = 
\begin{pmatrix}
?&?&?\\
?&?&?\\
?&?&?
\end{pmatrix}
\begin{pmatrix}
x\\
y\\
z
\end{pmatrix}=
\begin{pmatrix}
x+5\\
y\\
z
\end{pmatrix}
$$
中间的矩阵怎么做？有人会说将第一行第一列写为$\frac 5 z$即可，但是这就失去了转换矩阵的意义。转换矩阵中不应该包含我们要转换的坐标的信息。

计算机图形学中，解决这个问题的方法就说用齐次坐标，先看一下下面的转换：

$$
\begin{pmatrix}
x'\\
y'\\
z'\\
w'
\end{pmatrix} = 
\begin{pmatrix}
1&0&0&5\\
0&1&0&0\\
0&0&1&0\\
0&0&0&1

\end{pmatrix}
\begin{pmatrix}
x\\
y\\
z\\
1
\end{pmatrix}=
\begin{pmatrix}
x+5\\
y\\
z\\
1
\end{pmatrix}
$$

通过加入一个其次坐标w而实现了平移。而加入这个量不会对上面提到的旋转等操作产生影响，而且他有很多的好处，因此被普遍用于图形相关的软件与硬件中。
#### 平移(Translate) ####
$$
\begin{pmatrix}
x'\\
y'\\
z'\\
w'
\end{pmatrix} = 
\begin{pmatrix}
1&0&0&T_x\\
0&1&0&T_y\\
0&0&1&T_z\\
0&0&0&1

\end{pmatrix}
\begin{pmatrix}
\mathbf{p}_x\\
\mathbf{p}_y\\
\mathbf{p}_z\\
1
\end{pmatrix}=
\begin{pmatrix}
\mathbf{p}_x+T_x\\
\mathbf{p}_y+T_y\\
\mathbf{p}_z+T_z\\
1
\end{pmatrix} = 
\mathbf{p}+T
$$
主要旋转平移矩阵和平移旋转矩阵是不一样的，因为平移矩阵实际上需要的是最右侧的一个向量：

旋转平移矩阵：
$$
\begin{bmatrix}
R_ {3 \times 3}&T_ {3 \times 1}\\
0_ {1 \times 3}&1
\end{bmatrix}
$$

平移旋转矩阵:
$$
\begin{bmatrix}
R_ {3 \times 3}&R_ {3 \times 3}T_ {3 \times 1}\\
0_ {1\times 3}&1
\end{bmatrix}
$$

仔细推导就可以得到上面的结果。

### 法向转换（Normal Transformation） ###

法向的转换并不会按照平面各个点的转换进行。

假如原来的切线向量为$\mathbf{t}$,原来的法向向量为$\mathbf{n}$，转换矩阵为$M$，则切线向量是会依照原来的转换而改变的：$\mathbf{t}' = M\mathbf{t}$.

假设转换完成后的法向向量为$\mathbf{n}' = Q\mathbf{n}$.

当然不管什么时候，法向与切向都应该是垂直的：$\mathbf{n}'^T\mathbf{t'} = 0$

可以得到：
$$
\mathbf{n}^TQ^TM \mathbf{t} = 0.
$$

因此我们希望$Q^TM = I$,所以得到：$Q = (M^{-1})^T$.

当然上面的解并不是唯一解，但是计算机图形学是工程学科，我们希望的是能够解决这个问题即可。

需要注意的是：$M$为3×3矩阵。因为法向和切向是向量，所以平移不会影响法向和切向。