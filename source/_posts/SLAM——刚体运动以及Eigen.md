---
title: SLAM——刚体运动以及Eigen
date: 2018-11-07 21:22:37
tags: [SLAM,Eigen]
categories: SLAM
mathjax: true
---
这次主要介绍一些刚体运动中需要的数学知识以及Eigen库的基本使用。
<!--more-->

什么是刚体运动？运动过程中不会发生形变。所以实际上刚体的运动也就只有两种：旋转和平移。

对于三维空间的旋转平移表示，之前的计算机图形学中介绍的比较清楚了。不过还有一些别的概念没有接触，在这里做个补充。

## 旋转向量 ##

之前的旋转使用的是旋转矩阵，旋转矩阵是单位正交矩阵（行列式为1）。实际上会有个问题：旋转操作只需要3个自由度，但是却用了9个量来表示。这说明使用旋转矩阵是有冗余的。因此这里介绍旋转向量。

我们知道任何旋转都可以使用一个旋转轴和旋转角来描述。旋转向量是一个非常聪明的做法。它的方向代表了旋转轴，而它的长度代表了旋转的角度。

那么旋转向量与旋转矩阵如何转换呢？如果旋转轴（单位向量）为$\mathbf{n}$，旋转角度为$\theta$，那么旋转向量为$\theta\mathbf{n}$，旋转矩阵可以使用Rodrigues公式来计算出来：
$$
R = \cos \theta I + (1-\cos \theta)\mathbf{nn}^T + \sin \theta \mathbf{n}^\^
$$

$\mathbf{n}^\^$为向量$\mathbf{n}$的对偶矩阵。这个公式也在之前的图形学博客中做过介绍了。

如何从旋转矩阵得到旋转向量？

首先，对于旋转角：

$$
\begin{aligned}
tr(R) &= \cos\theta tr(I) +(1 - \cos \theta) tr(\mathbf{nn}^T) + \sin \theta tr (\mathbf{n}^\^)\\
&= 3\cos \theta + (1-\cos \theta)\\
&= 1+ 2\cos\theta
\end{aligned}
$$

所以根据上式可以很简单求得：
$$
\theta = \arccos\left( \frac{tr(R)-1}{2}\right)
$$

至于$\mathbf{n}$，由于旋转轴的向量旋转后不会发生变化，因此$R\mathbf{n} = \mathbf{n}$.

所以$\mathbf{n}$为矩阵R特征值为1的对应的特征向量。

## 欧拉角 ##

旋转向量以及旋转矩阵对于人的角度来说都不够直观。因此有了欧拉角的诞生。其实欧拉角就是将一个旋转转化为3个绕坐标轴的转动。因此这个转动的顺序就不唯一了。在航空里可能经常听到“偏航-俯仰-滚转”（yam-pitch-roll），实际上就是欧拉角的一种，等价与ZYX轴的旋转。

因此欧拉角就是用一个向量$[ r,p,y ]^T$（3个角度）来表示一个旋转。但是欧拉角有个著名的万能锁问题。如果pitch转动了$\pm90°$,则最后一个转动绕的轴实际上和z轴一样，这就使得损失了一个自由度，这被称为奇异性问题（？）。因此欧拉角不适用与插值和迭代，往往用于人工交互。


## 四元数 ##

旋转矩阵用9个量描述，有冗余，而旋转向量和欧拉角却具有奇异性。实际上我们找不到不带奇异性的三维向量描述方式。
因此在这里再介绍一个四元数。它用四个量来描述旋转足够紧凑同时也没有奇异性。

一个四元数$\mathbf{q} = q_0+q_1i+q_2j+q_3k$,有一个实部，3个虚部。其中虚部满足下面的一组式子：
$$
\left\{
\begin{aligned}
i^2 = j^2 = k^2 = -1\\
ij=k,ji = -k\\
jk=i,kj = -i\\
ki=j,ik = -j
\end{aligned}
\right.
$$

有时候也使用一个标量和一个向量来表示四元数：

$\mathbf{q} = [ s,\mathbf{v} ],s = q_0 \in \mathbb{R},\mathbf{v} = [ q_1,q_2,q_3 ]^T \in \mathbb{R}^3 $.

如果实部为0,称为虚四元数，如果虚部为0称为实四元数。

我们能用单位四元数表示三维空间中的任意旋转。不过由于复数的引入，它的表示是有点反直觉的。假如旋转向量为$\mathbf{n} \theta$，则对应的四元数为：
$$
\mathbf{q} = [ \cos \frac \theta 2, n_x\sin \frac \theta 2 ,n_y \sin \frac \theta 2,n_z,\frac \theta 2]^T.
$$

因此从单位四元数中也很容易得到对应的旋转轴和旋转角度：
$$
\left \{
\begin{aligned}
\theta = 2 \arccos q_0;
[ n_x,n_y,n_z] = [ q_1, q_2,q_3]^T / \sin \frac \theta 2
\end{aligned}
\right .
$$

这个式子确实反直觉，给我们赚了一般的感觉。如果对$\theta $加上$2\pi$，相当于没有转动，但是他们对应的四元数却变成原来的相反数了。因此，互为四元数的相反数表示同一个旋转。

四元数的概念的话现在还很懵比，不知道为什么要这样来表示一个旋转。但是能发展到现在还留下来的一定是有自己的道理。因为四元数每个值都是经过处理的轴和角结合，因此它方便进行插值。听说四元数在游戏开发里应用广泛。具体这些以后再去弄明白，先看一看四元数的基本运算吧。

### 加减 ###
$\mathbf{q}_a \pm \mathbf{q}_b = [ s_a \pm s_b ,\mathbf{v}_a \pm \mathbf{v}_b] $
### 乘法 ###
乘法就是各项轮着相称，最后相加，虚部要按照虚部的规则来乘，最后得到结果：
$$
\begin{aligned}
\mathbf{q}_a \mathbf{q}_b &= s_as_b - x_ax_b - y_ay_b - z_az_b\\
&+(s_ax_b+x_as_b+y_az_b-z_ay_b)i\\
&+(s_ay_b - x_az_b + y_as_b + z_ax_b)j\\
&+(s_az_b+x_ay_b-y_ax_b+z_as_b)
\end{aligned}
$$

如果写成向量形式：
$$
\mathbf{q}_a \mathbf{q}_b  = [ s_as_b - \mathbf{v}_a^T\mathbf{v}_b, s_a\mathbf{v}_b + s_b\mathbf{v}_a + \mathbf{v}_a\times \mathbf{v}_b]
$$
由于最后一项存在，四元数的乘法通常是不可交换的。
### 共轭 ###
$\mathbf{q}_a^* = s_a - x_ai - y_aj-z_ak = [ s_a,-\mathbf{v}_a]$

$\mathbf{q^ *q} = \mathbf{qq^ *} = [s_a^2 + \mathbf{vv}^T ,0]$ 

可以看到四元数和共轭相称得到一个实数。
### 模长 ###
$$
\Vert \mathbf{q}\Vert = \sqrt{s^2 +x^2+y^2+z^2}
$$
可以验证：$\Vert \mathbf{q}_a\mathbf{q}_b \Vert = \Vert  \mathbf{q}_a\Vert \Vert  \mathbf{q}_b\Vert$.

这保证了单位四元数的乘积依然为单位四元数。

### 逆 ###
$\mathbf{q}^{-1} = \frac {\mathbf{q}^*}{\Vert \mathbf{q}\Vert^2}$

$\mathbf{q}^{-1}\mathbf{q} = \mathbf{qq}^{-1} = 1$

同时可以知道，单位四元数的逆就是单位四元数的共轭，因为$\mathbf{qq}^* = 1$.

乘积的逆和矩阵的逆有同样的性质：$(\mathbf{q_a}\mathbf{q_b})^{-1} = \mathbf{q_b}^{-1}\mathbf{q_a}^{-1}$

### 数乘和点乘 ###
$k\mathbf{q} = [ks,k\mathbf{v} ]$

$\mathbf{q_a} \cdot \mathbf{q_b} = s_as_b + x_ax_b + y_ay_b + z_az_b$


### 用四元数表示旋转 ###

对于一个三维点$p=[x,y,z ]$,绕着转轴$\mathbf{n}\theta$旋转，变为$p'$.我们知道使用矩阵的话，可以这样描述：$p' = Rp$.但是使用四元数如何描述呢？

我们把空间的点用虚四元数来描述，则$\mathbf{p} = [0,x,y,z ]$.

用$\mathbf{q}$来表示旋转: $\mathbf{q} = [\cos \frac \theta 2,\mathbf{n} \sin \theta 2]$.

则：$\mathbf{p}' = \mathbf{qpq}^{-1}$.

可以验证的是经过计算的实部为0,虚部对应的就是$q'$的坐标点。

可以看到使用四元数来旋转的话也是非常方便的。

### 四元数和旋转矩阵的转换 ###

四元数与旋转矩阵的转换，我们可以想到的是利用旋转向量来做中间的桥梁。不过其中有个arccos函数代价较大，但是实际上可以通过一定的技巧绕过。在这里直接给出四元数到旋转矩阵的转换结果（省略推导过程）：

设四元数为：$\mathbf{q} = q_0+q_1i+q_2j+q_3k$,则：
$$
R = \begin{bmatrix}
1-2q_2^2 - 2q_3^2&2q_1q_2 - 2q_0q_3& 2q_1q_3 + 2q_0q_2\\
2q_1q_2+2q_0q_3& 1-2q_1^2-2q_3^2& 2q_2q_3 - 2q_0q_1 \\
2q_1q_3-2q_0q_2&2q_2q_3+2q_0q_1&1 - 2q_1^2 - 2q_2^2
\end{bmatrix}
$$

如果知道了旋转矩阵，想要得到四元数：

$q_0 = \frac{\sqrt{tr(R) + 1} }{2},q_1 = \frac{r_ {2,3} - r_ {3,2} }{4q_0},q_2 = \frac{r_ {3,1} - r_ {1,3} }{4q_0},q_3 = \frac{r_ {1,2} - r_ {2,1} }{4q_0}$

这里面$r_ {i,j}$表示$R$的第i行j列。在计算过程中，如果$q_0$接近于0,则其他3个量就会很大，这是很需要考虑别的方式来表示旋转。
## 相似，仿射，射影变换 ##

### 相似变换 ###
相似变换比之前的欧式变换多了一个自由度：
$$
T_S = \begin{bmatrix}
sR&\mathbf{t}\\
0&1
\end{bmatrix}
$$

这个s允许我们对物体进行均匀缩放。

### 仿射变换 ###
$$
T_A = \begin{bmatrix}
A&\mathbf{t}\\
0&1
\end{bmatrix}
$$
仿射变换不要求A为正交矩阵，只要可逆即可。仿射变换又叫正交投影变换。
### 射影变换 ###
射影变换是最易般的变换。
$$
T_P = \begin{bmatrix}
sR&\mathbf{t}\\
\mathbf{a}^T&v
\end{bmatrix}
$$
左上角可逆，右上角为平移t,左下角为缩放$\mathbf{a}^T$

从真实世界到相机照片的变换可以看作为一个射影变换。如果焦距为无限远，则为仿射变换。

## Eigen ##

最后介绍一些Eigen库相关的东西。Eigen是一个C++开源线性代数库.

```cpp
#include<eigen/core>
#include<eigen/dense>
/*3*3矩阵float型*/
Eigen::Matrix<float,3,3,> matrix_33;
/*3维向量，但实际上就是Eigen::Matrix<double,3,1>*/
Eigen::Vector3d v_3d;
//输入
v_3d<<1,2,3;
//输出
cout<<v_3d<<endl;
//访问i行j列
cout<<v_3d(1,0);
//转置
matrix_33.transpose();
//各项和
matrix_33.sum();
//迹
matrix_33.trace();
//逆
matrix_33.inverse();
//行列式
matrix_33.determinant();
//特征值和特征向量，实对称矩阵确保对角化成功
Eigen::SelfAdjointEigenSolver<Eigen::Matrix3d> eigen_solver(matrix_33*matrix_33.transpose());
cout << eigen_solver.eigenvalues() << endl;
cout<< eigen_solver.eigenvectors() << endl;

```
Module|Header file |	Contents
---|---|---
Core  |	#include < Eigen/Core >  |	Matrix和Array类，基础的线性代数运算和数组操作
Geometry |	#include< Eigen/Geometry > |	旋转、平移、缩放、2维和3维的各种变换
LU |	#include< Eigen/LU > | 	求逆，行列式，LU分解
Cholesky |	#include < Eigen/Cholesky > |	LLT和LDLT Cholesky分解
Householder |	#include< Eigen/Householder > |	豪斯霍尔德变换，用于线性代数运算
SVD  |	#include< Eigen/SVD > |	SVD分解
QR 	|#include< Eigen/QR >| 	QR分解
Eigenvalues |	#include< Eigen/Eigenvalues > |	特征值，特征向量分解
Sparse |	#include< Eigen/Sparse >| 	稀疏矩阵的存储和一些基本的线性运算
稠密矩阵 |	#include< Eigen/Dense > |	包含Core/Geometry/LU/Cholesky/SVD/QR/Eigenvalues模块
矩阵  |	#include< Eigen/Eigen > |	包括Dense和Sparse(整合库)

这些东西都被整合在dense模块中。

### eigen几何模块： ###

旋转矩阵直接使用 Matrix3d 或 Matrix3f：

Eigen::Matrix3d rotationMatrix=Eigen::Matrix3d::Identity();//初始化为一个单位阵。

旋转向量使用 AngleAxis：

Eigen::AngleAxisd rotationVector(M_PI/4,Eigen::Vector3d(0,0,1)); //角+轴：沿 Z 轴旋转 45 度

欧拉角：

Eigen::Vector3d ea0(yaw,pitching,droll);


旋转向量->旋转矩阵：rotationMatrix=rotation_vector.toRotationMatrix();

旋转向量->四元数：Eigen::Quaterniond q = Eigen::Quaterniond ( rotation_vector );

旋转矩阵->四元数：Eigen::Quaterniond q = Eigen::Quaterniond ( rotation_matrix );

四元素->旋转矩阵：Eigen::Matrix3d Rx = q.toRotationMatrix();

旋转向量->欧拉角：Eigen::Vector3d eulerAngle=rotationVector.matrix().eulerAngles(0,1,2);

旋转矩阵->欧拉角：Eigen::Vector3d euler_angles = rotation_matrix.eulerAngles ( 2,1,0 ); // ZYX顺序，即roll pitch yaw顺序

## Note ##

这一讲最后说明了世界坐标和相机坐标的转换。世界坐标下的坐标为$\mathbf{p}_w$，相机坐标下的坐标为$mathbf{p}_c$，则二者转换为：
$$
\mathbf{p}_w = T_ {c2w}\mathbf{p}_c
$$

$$
\mathbf{p}_c = T_ {w2c}\mathbf{p}_w
$$

值得注意的是，它提到了一般更常用的是从世界坐标到相机坐标的转换，但是从相机坐标到世界坐标的转换却更直观。因为如果相机坐标$\mathbf{p}_c$下为0,则世界坐标$\mathbf{p}_w$就是相机在世界坐标的位置:
$$
\mathbf{p}_w = T_ {c2w} = t_ {c2w}
$$

上式中$t_ {c2w}$正是相机的位置。也是平移向量。

所以从相机坐标到世界坐标的转换可以直接看到相机位置。这也是因为从相机坐标到世界坐标的转换是先旋转后平移的特性。先旋转后平移，则平移向量是不用改变的。