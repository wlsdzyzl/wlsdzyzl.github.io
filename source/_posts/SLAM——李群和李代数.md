---
title: SLAM——李群和李代数
date: 2018-11-09 13:06:47
tags: [SLAM,mathematics,sophus]
categories: SLAM
mathjax: true
---
在SLAM中，我们需要对姿态进行估计和优化。但是旋转矩阵自身是有约束的，增加优化难度。因此我们需要引入李群和李代数，可以将位姿估计转换为无约束的优化问题。
<!--more-->

## 群(Group) ##

群是一种集合加上一种运算的代数结构。如果记集合为$A$，运算为$\cdot$,如果满足以下性质，则称$(A,\cdot)$为群：
1. 封闭性： $\forall a_1,a_2\in A,a_1 \cdot a_2 \in A$.
2. 结合律：$\forall a_1,a_2,a_3 \in A (a_1 \cdot a_2) \cdot a_3 = a_1 \cdot (a_2 \cdot a_3)$.
3. 幺元：$\exists a_0 \in A, s.t. \forall a \in A,a_0\cdot a = a \cdot a_0 = a$.
4. 逆：$\forall a\in A,\exists a^{-1} \in A, a\cdot a^{-1} = a_0$.

可以验证旋转矩阵和转换矩阵与矩阵乘法运算都可以构成群。其中旋转矩阵与乘法构成的群为$SO(3)$,特殊正交群，欧式转换矩阵与乘法构成特殊欧氏群$SE(3)$.
### 李群（Lie Group） ###

具有连续（光滑）性质的群。李群既是群也是流形。SO(3),SE(3)都是李群，但是只有定义良好的乘法，没有加法，所以难以进行极限求导（$+\Delta x$）等操作。

## 引出李代数 ##
一种李群，对应一个李代数。李代数用小写表示，如$so(3),se(3)$.

任意旋转矩阵，则$RR^T = I$.

考虑R随时间变化，有$R(t)R(t)^T = I$.

两侧对t求导：$R'(t)R(t)^T + R(t)R'(t)^T = 0$.

则：$R'(t)R(t)^T = -(R'(t)^T R(t)^T)^T$.

所以我们可以知道：$R'(t)R(t)^T$是一个反对称矩阵。反对称矩阵都会有一个对应的向量，假设$R'(t)R(t)^T$对应的向量为$\phi(t)$,则：

$R'(t)R(t)^T = \phi(t)$

两侧同时右乘$R(t)$，得到：

$R'(t) = \phi(t)^{\hat{} } R(t)$

所以我们可以看到对R求导之海，多出来一个$\phi(t)$.

假如$t_0=0,R(t_0) = I$，对于$R(t)$进行泰勒展开：
$$
R(t) \approx R(t_0) + R'(t_0)(t - t_0) = I+\phi(0)t.
$$

在很短的时间($t=t_0+\Delta t$)里，假设$\phi(t_0)$不会变化。

$R'(t) = \phi(t_0)^{\hat{} }R(t) = \phi_0^{\hat{} }R(t)$

如果解上述微分方程（$R(0) = I$），可以得到：$R(t) = exp(\phi_0^{\hat{} } t)$

所以我们就得到了一个在$t_0$附近的近似估计。

实际上$phi$就是$SO(3)$对应的李代数。

## 李代数 ##
李代数由一个集合$\mathbb{V}$，一个数域$\mathbb{F}$,一个二元运算$[ ,]$组成。这个运算某一定程度上反映了两个数的差异。李代数满足下面几个性质：
1. 封闭性：$\forall X,Y \in \mathbb{V},[X,Y ] \in \mathbb{V}$
2. 双线性：$\forall X,Y,Z \in \mathbb{V},a,b \in \mathbb{F}$,有：
$$
[aX+bY,Z ]= a[X,Z ] + b[Y,Z ],[Z,aX+bY ] = a[Z,X ]+b[Z,Y ].
$$
3. 自反性：$\forall X \in \mathbb{V},[X, X] = 0$
4. 雅科比等价：$\forall X,Y,Z \in \mathbb{V},[X, [Y,Z ]] + [Z, [X,Y ]]+ [Y, [Z,X ]] = 0$

其中二元运算被称为李括号。

### 李代数$so(3)$ ###：

$so(3) = \{\phi \in \mathbb{R}^3 ,\Phi = \phi ^{\hat{} } \in \mathbb{R}^{3 \times 3} \}$.

李括号：$[\phi_1,\phi_2 ]= (\Phi_1\Phi_2 - \Phi_2 \Phi_1)^{\hat{} }$.

Note: $\Phi = \phi^{\hat{} },\phi = \Phi^{\hat{} }$.

### 李代数$se(3)$ ###

$se(3) = \left\{
    \xi = \begin{bmatrix}
    \rho\\
    \phi
    \end{bmatrix} \in \mathbb{R}^6,\rho \in \mathbb{R}^3,\phi \in so(3),\xi ^{\hat{} } = \begin{bmatrix}
    \phi^{\hat{} }&\rho\\
    0&0
    \end{bmatrix}
    \right\}$

## 指数与对数映射 ##

之前引出李代数中推导的$R(t) = exp(\phi_0t)$,R是李群SO(3)，而$\phi$是李代数so(3).他们之间是有一一对应的关系的。恩，从上面的推导中并不能保证R就是$\phi$的exp映射，但是实际上就是这样做的。

但是如何对一个$\phi$进行指数映射？映射还需转换为$\Phi$.对于一个矩阵，我们是没法进行exp运算的。因此我们使用泰勒展开：
$$
exp(A) = \sum_ {n=0}^\infty \frac{1}{n!}A^n
$$

同样上述展开也没那么容易进行，好在还有一些别的方法。

任何一个向量，我们都可以分解成方向和长度，也就是$\theta \mathbf{a}$.其中$\mathbf{a}$为单位向量。

然后，我们可以验证的是：

$\mathbf{a}^{\hat{} }\mathbf{a}^{\hat{} } = \mathbf{aa}^T -I$

$\mathbf{a}^{\hat{} }\mathbf{a}^{\hat{} }\mathbf{a}^{\hat{} } = -\mathbf{a}^{\hat{} }$

因为我们$\Phi = \phi^{\hat{} }$,所以上式提供了很好的办法来解决exp问题。经过推导，我们可以得到：

$$
\begin{aligned}
exp(\phi^{\hat{} }) &= exp(\theta \mathbf{a}^T) = \sum_ {n=0}^\infty \frac {1} {n!} (\theta \mathbf{a}^{\hat{} })^n\\
&=\cos \theta I + (1 - \cos \theta)\mathbf{aa}^T + \sin \theta \mathbf{a}^{\hat{} }
\end{aligned} 
$$

很神奇的事情，上面竟然就是罗德里克斯公式（推导过程实际上不复杂，省略掉了）。

对应的还有一个对数映射：

$\phi$ = \ln(R)^{\hat{} } = \left (\sum_ {n=0}^\infty \frac{(-1)^n}{n+1}(R-I)^{n+1} \right)$

当然，既然我们已经知道罗德里克斯公式了，就不用上式这么复杂的式子去求对数映射了。

旋转角，和旋转矩阵不是一一对应的，因为旋转矩阵唯一的情况下，旋转角可能有多个（角度多了$2\pi$）。这意味着指数映射是满射的。如果角度限制到$[-\pi,\pi ]$，那么李群和李代数元素就是一一对映的了。

同样，我们也可以得到$SE(3)$与$se(3)$的指数映射和对数映射:
$$
\begin{aligned}
exp(\xi^{\hat{} }) &= \begin{bmatrix}
\sum_ {n=0}^\infty \frac{1}{n!}(\phi ^{\hat{} })^n& \sum_ {n=0}^\infty \frac{1}{(n+1)!}(\phi^{\hat{} })^n \rho\\
0&1
\end{bmatrix}
& \triangleq \begin{bmatrix}
R&J\rho\\
0&1
\end{bmatrix} = T
\end{aligned}
$$

上式中$J = \frac{\sin \theta}{\theta}I + \left(1 - \frac {\sin\theta}{\theta}\right)\mathbf{aa}^T + \frac{1 - \cos \theta}{\theta} \mathbf{a}^{\hat{} }$

它的对数映射，右上角与之前一样，而这里的$t = J\rho$,通过$\phi$可以计算出来J，从而解线性方程得到$\rho$.

J为雅克比矩阵。

## 李代数的求导与扰动模型 ##

之所以要学习李群和李代数，是因为我们的SO(3)和SE(3)都是没有定义加法的。所以无法求导，对于优化非常难办。因此我们想做的是能否将李群和李代数上对应关系运用到求导中，把对李群的求导，转化为对李代数的求导。

所以我们希望的是：$exp(\Phi_1 +\Phi_2) = exp(\Phi_1)exp(\Phi_2)$.

很遗憾的是，上面的式子不成立。（告辞）

### BCH公式 ###

有一个BCH公式，它是对于矩阵来说的以及李群李代数相关的指数相乘展开：

$
\ln(exp(A)exp(B)) \approx A+B+\frac 1 2 [A,B ]+\frac 1 {12} [A, [A ,B]]+...
$

可以看到，在数学上，它会有这么多的余项存在的。不过我们做近似的估计。如果$\phi_1$或者$\phi_2$有一个量是小量，我们可以忽略其二次项。直接考虑到李代数的转换：

$
\ln(exp(\phi_1^{\hat{} })exp(\phi_2^{\hat{} }))^{\hat{} } \approx 
\left \{\begin{matrix}
J_l(\phi_2)^{-1}\phi_1 +\phi_2&\phi_1为小量\\
J_r(\phi_1)^{-1}\phi_2 +\phi_1&\phi_2为小量\\
\end{matrix}
\right .
$

既然导数模型左或者右加上一个小量，上式中，第一个对应的是$\phi_2$为R对应的李代数，而$\phi_1$为小量，对应到李群，就是R左乘一个小量，第二个式子对应的就是右乘一个小量了。我们后面规定使用为左乘，实际上右乘的J和左乘也相差不多。

$$
J_l = J = \frac {\sin\theta}{\theta} I + (1 - \frac {\sin \theta}{\theta})\mathbf{aa}^T + \frac{1 - \cos \theta}{\theta} \mathbf{a}^{\hat{} }
$$

$$
J_l^{-1} = \frac{\theta}{2} \cot \frac{\theta}{2}I + (1 - \frac{\theta}{2}\cot\frac{\theta}{2})\mathbf{aa}^T - \frac{\theta}{2}\mathbf{a}^{\hat{} }
$$

右乘的雅科比矩阵：$J_r (\phi) = J_l(-\phi)$.

也就是：$\exp(\Delta \phi ^{\hat{} })\exp(\phi^{\hat{} }) \approx \exp ((\phi + J_l^{-1}(\phi)\Delta \phi)^{\hat{} })$.

同理，如果我们在李代数上进行加法：
$$
\exp((\phi+\Delta \phi)^{\hat{} }) = \exp((J\Delta \phi)^{\hat{} })\exp(\phi^{\hat{} })
$$
上述都是左乘模型。

同样的，对于SE(3)也有类似的BCH近似公式：
$$
\exp(\Delta \xi ^{\hat{} }) \exp(\xi^{\hat{} }) \approx \exp((\mathcal{J}_l^{-1}\Delta \xi + \xi)^{\hat{} }),\\
\exp(\xi^{\hat{} })\exp(\Delta \xi ^{\hat{} })  \approx \exp((\mathcal{J}_r^{-1}\Delta \xi + \xi)^{\hat{} }).
$$

$\mathcal{J}_l$的形式比较复杂，我们也用不上，就不提了。

### so(3)求导 ###

我们想要实现对旋转矩阵的求导，由于旋转矩阵是乘法定义的，所以直接在SO(3)上无法定义出来导数。因此要转换到对应的李代数上来求得导数。

为了得到so(3)上的导数，有两种办法。第一种，是通过so(3)来实现，另一种是给SO(3)左乘一个矩阵来实现。

#### 导数模型 ####

根据导数的定义：
$$
\begin{aligned}
\frac{\partial (\exp(\phi^{\hat{} })p)} {\partial \phi}&= \lim_ {\delta \phi \rightarrow 0} \frac{\exp((\phi + \delta \phi)^{\hat{} })p - exp(\phi^{\hat{} })p} {\delta \phi}\\
&= \lim_ {\delta \phi \rightarrow 0} \frac{exp((J_l\delta \phi)^{\hat{} })exp(\phi^{\hat{} })p - \exp(\phi^{\hat{} })p}{\delta \phi}\\
&\approx \lim_ {\delta \phi \rightarrow 0} \frac{(I+(J_l\delta \phi)^{\hat{} })exp(\phi^{\hat{} })p - \exp(\phi^{\hat{} })p}{\delta \phi}\\
&= \lim_ {\delta \phi \rightarrow 0} \frac{(J_l\delta\phi)^{\hat{} }\exp(\phi^{\hat{} })p}{\delta \phi}\\
&= \lim_ {\delta \phi \rightarrow 0} \frac{-(\exp(\phi^{\hat{} })p)^{\hat{} }J_l\delta\phi}{\delta \phi}\\
&= -(Rp)^{\hat{} } J_l
\end{aligned}
$$
上面的过程用到了BCH展开，泰勒近似，以及$\hat{}$的性质：$a^{\hat{} }b = -b^{\hat{} }a $.
这里有形式比较复杂的$J_l$,我们不想计算它。所以看看扰动模型。

#### 扰动模型 ####

扰动模型是在李群上左乘一个很小的矩阵$\Delta R$,假设它对应的李代数为$\theta$。通过扰动模型得到的导数为$-(Rp)^{\hat{} }$.
\begin{aligned}
\frac{\partial (Rp)} {\partial \phi}&= \lim_ {\theta \rightarrow 0} \frac{\exp(\theta^{\hat{} })\exp(\phi)^{\hat{} })p - exp(\phi^{\hat{} })p} {\theta}\\
&=-(Rp)^{\hat{} }
\end{aligned}
扰动模型求导和上面导数模型可以使用同样的套路，而且更简单。因此就不详细写出来了。

可以看到扰动模型的比导数模型得到的结果更加简便一些。因此扰动模型相对于导数模型来说更加的实用。

### se(3)求导 ###

对于se(3)的求导，我们直接给出扰动模型：
$$
\begin{aligned}
\frac{\partial (Tp)}{\partial \delta \xi} &= \lim_ {\delta \xi \rightarrow 0} \frac{\begin{bmatrix}
\delta \phi^{\hat{} }(Rp+t) + \delta p\\
0
\end{bmatrix} }{\delta \xi}\\
&= \begin{bmatrix}
I&-(Rp+t)^{\hat{} }\\
0&0
\end{bmatrix}\\
&\triangleq (Tp)^{\bigodot}
\end{aligned}
$$

如果没有李群和李代数的提出，求导就没有理论依据了。而因为有了李群和李代数这种映射关系，我们可以通过将李群用李代数来表示，而李代数是可以进行求导的。从而实现对旋转矩阵的求导。

## Sophus库 ##

李群李代数听得人头大。不过，我们不用自己去完成这些东西。对于李群李代数支持比较好的库是sophus，我们就使用这个库来实现SLAM中李群李代数需要的应用。

sophus是eigen的一个扩展，它在eigen的基础上实现了一些李群李代数的操作，没有任何别的依赖项。

```cpp
#include <iostream>
#include <cmath>
using namespace std; 

#include <Eigen/Core>
#include <Eigen/Geometry>

// 李群李代数 库 
#include "sophus/so3.h"
#include "sophus/se3.h"
int main( int argc, char** argv )
{
 /*******************************************/
　
    Eigen::Matrix3d R = Eigen::AngleAxisd(M_PI/2, Eigen::Vector3d(0,0,1)).toRotationMatrix();
    cout<<"RotationMatrix R: \n"<<R<<endl;
    
    /***李群*****/
    Sophus::SO3 SO3_R(R);               // Sophus::SO(3)可以直接从旋转矩阵构造
    Sophus::SO3 SO3_v( 0, 0, M_PI/2 );  // 亦可从旋转向量构造  这里注意，不是旋转向量的三个坐标值，有点像欧拉角构造。
    Eigen::Quaterniond q(R);            // 或者四元数(从旋转矩阵构造)
    Sophus::SO3 SO3_q( q );
    // 上述表达方式都是等价的
    // 输出SO(3)时，以so(3)形式输出
    //从输出的形式可以看出，虽然SO3是李群，是旋转矩阵，但是输出形式还是向量（被转化成李代数输出）。
    // 重载了 << 运算符  out_str << so3.log().transpose() << std::endl;  
    cout<<"SO(3) from matrix: "<<SO3_R<<endl;  //SO(3) from matrix:      0      0 1.5708  
    cout<<"SO(3) from vector: "<<SO3_v<<endl;
    cout<<"SO(3) from quaternion :"<<SO3_q<<endl;
    
    /****李代数*****/
    // 使用对数映射获得它的李代数
    // 所以，李代数 so3的本质就是个三维向量，直接Eigen::Vector3d定义。
    Eigen::Vector3d so3 = SO3_R.log();
    cout<<"so3 = "<<so3.transpose()<<endl;
    // hat 为向量 到反对称矩阵  相当于　^　运算。
    cout<<"so3 hat=\n"<<Sophus::SO3::hat(so3)<<endl;
    // 相对的，vee为 反对称矩阵 到 向量  相当于下尖尖运算 
    cout<<"so3 hat vee= "<<Sophus::SO3::vee( Sophus::SO3::hat(so3) ).transpose()<<endl; // transpose纯粹是为了输出美观一些
    
    /****李代数求导　更新*****/
    // 增量扰动模型的更新
    Eigen::Vector3d update_so3(1e-4, 0, 0); //假设更新量为这么多
    Sophus::SO3 SO3_updated = Sophus::SO3::exp(update_so3)*SO3_R;// 增量指数映射×原李代数
    cout<<"SO3 updated = "<<SO3_updated<<endl;
    
    
    /********************萌萌的分割线*****************************/
    /************特殊欧式群　变换矩阵群　有旋转有平移*********************/
    cout<<"************我是分割线*************"<<endl;
    // 李群 对SE(3)操作大同小异
    Eigen::Vector3d t(1,0,0);           // 沿X轴平移1
    Sophus::SE3 SE3_Rt(R, t);           // 从R,t构造SE(3)
    Sophus::SE3 SE3_qt(q,t);            // 从q,t构造SE(3)
    cout<<"SE3 from R,t= "<<endl<<SE3_Rt<<endl;
    cout<<"SE3 from q,t= "<<endl<<SE3_qt<<endl;
    // 李代数se(3) 是一个六维向量，方便起见先typedef一下
    typedef Eigen::Matrix<double,6,1> Vector6d;// Vector6d指代　Eigen::Matrix<double,6,1>
    Vector6d se3 = SE3_Rt.log();
    cout<<"se3 = "<<se3.transpose()<<endl;
    // 观察输出，会发现在Sophus中，se(3)的平移在前，旋转在后.
    // 同样的，有hat和vee两个算符
    cout<<"se3 hat = "<<endl<<Sophus::SE3::hat(se3)<<endl;
    cout<<"se3 hat vee = "<<Sophus::SE3::vee( Sophus::SE3::hat(se3) ).transpose()<<endl;
    
    // 最后，演示一下更新
    Vector6d update_se3; //更新量
    update_se3.setZero();
    update_se3(0,0) = 1e-4d;
    Sophus::SE3 SE3_updated = Sophus::SE3::exp(update_se3)*SE3_Rt;
    cout<<"SE3 updated = "<<endl<<SE3_updated.matrix()<<endl;
    
    return 0;
}
```