---
title: Paper——Real-Time Visual Odometry from Dense RGB-D Images
date: 2019-12-10 00:00:00
tags: [paper,mathematics]
categories: 论文
mathjax: true
---    

这次带来的一篇文章是一个视觉里程计，针对RGBD的dense Visual Odometry：[Real-Time Visual Odometry from Dense RGB-D Images](https://vision.in.tum.de/_media/spezial/bib/steinbruecker_sturm_cremers_iccv11.pdf)，是一个非常经典的算法，现在依然被广泛使用着。


<!--more-->


之前SLAM的文章中介绍了视觉里程计的作用，它用来估计两帧之间的位姿，来给后面的优化提供很好的初始值，这样才能使得优化结果走向最优。对于不同的相机类型有不同的方法，今天看的适用于RGBD-SLAM。

[](about:blank#Problem "Problem")Problem
----------------------------------------

先定义一下文章中使用的符号，也是对一些基本知识的复习：
$$
\begin{aligned} &I_ {RGB} : \Omega \times \mathbb R_+ \rightarrow [0,1]^3 , (x,t) \mapsto I _ {RGB}(x,t)\\ &h: \Omega \times \mathbb R_+ \rightarrow \mathbb R_+, (x,t) \mapsto h(x,t)\\ \end{aligned}
$$
上面的式子可以大概明白作者的意思：$\Omega$是二维平面，也就是相机的成像平面，$t$是时刻属于正实数$\mathbb R_+$，$I_ {RGB}$指的是RGB颜色的信息，也就是$t$时刻捕获的色彩图（$[0,1]^3$指的是一个三维向量，向量的元素范围为0-1，这也是常用的表示颜色的方法，通过乘上scale就可以得到对应的RGB值），$h$指的是捕获的深度图，$x$很明显指的是像素坐标了，是一个二维的点。

通过针孔相机模型，可以得到表面，也就是空间点：
$$
\begin{array}{l}{S: \Omega \rightarrow \mathbb{R}^{3}, \quad x \mapsto S(x)} \\ {S(x)=\left(\frac{\left(x+o_ {x}\right) \cdot h(x)}{f_ {x} } \quad, \quad \frac{\left(y+o_ {y}\right) \cdot h(x)}{f_ {y} } \quad, \quad h(x)\right)^{\top} }\end{array}
$$
这里的$o_x, o_y$对应的就是相机参数中的$-c_x,-c_y$。

接下来介绍的是刚体运动到李群李代数，之前的文章也有详细的说明，这里简单提一下：  
一个刚体运动$g$（$4\times 4矩阵$）属于李群SE(3)，也就对应到一个李代数se(3)的6维向量$\xi=\left(\omega_ {1} \omega_ {2} \omega_ {3} v_ {1} v_ {2} v_ {3}\right)^{\top} \in \mathbb{R}^{6}$，它对应一个反对称矩阵：
$$
\widehat{\xi}=\left(\begin{array}{cccc}{0} & {-\omega_ {3} } & {\omega_ {2} } & {v_ {1} } \\ {\omega_ {3} } & {0} & {-\omega_ {1} } & {v_ {2} } \\ {-\omega_ {2} } & {\omega_ {1} } & {0} & {v_ {3} } \\ {0} & {0} & {0} & {0}\end{array}\right)
$$
李群李代数的意义在于求Rotation以及Transformation的导数，之前我们通过对于矩阵对$t$求导来引出李群李代数，从而得到微分方程：
$$
\frac{\mathrm{d} g(t)}{\mathrm{d} t}=\widehat{\xi}(t) g(t)
$$
根据求解微分方程有，并且假设在很短的时间间隔内，$\xi(t)$不会改变，写成$\xi$：
$$
g\left(t_ {1}\right)=\exp \left(\left(t_ {1}-t_ {0}\right) \widehat{\xi}\right) g\left(t_ {0}\right)
$$
下面定义符号$G$，表示的是空间点的运动，根据运动矩阵与空间点坐标，有：
$$
G: S E(3) \times \mathbb{R}^{3} \rightarrow \mathbb{R}^{3}, \quad G(g, P)=R P+T
$$
通过上面的符号我们得到转换后的空间点，再定义一个重投影的过程：
$$
\pi(G)=\left(\frac{G_ {1} f_ {x} }{G_ {3} }-o_ {x} \quad, \quad \frac{G_ {2} f_ {y} }{G_ {3} }-o_ {y}\right)^{\top}
$$
也就是，我们根据相机内参相机位姿，将空间点重新投影到成像平面。也就是下式，我们成这个过程为warping：
$$
\begin{aligned} w_ {\xi} &: \Omega \times \mathbb{R}_ {+} \rightarrow \Omega, \quad(x, t) \mapsto w_ {\xi}(x, t) \\ w_ {\xi}(x, t) &=\pi\left(G\left(\exp \left(\left(t-t_ {0}\right) \widehat{\xi}\right) g\left(t_ {0}\right), S(x)\right)\right) \end{aligned}
$$
可以看到，它是将一个二维的点映射到另外一个二维点，也就是在第二个相机位姿下相同空间点的投影坐标。通过这样，我们可以根据相机位姿的变化，来计算得到一张理论值，通过与实际拍摄的图片对比，就有了residual，也就有了需要优化的cost function。色彩图以及深度图都考虑进来，这样做有个假设，就是表面的颜色不会变化。实际中，静态重建的环境颜色变化也不会很大，我们称保持颜色一致为Photoconsistency。

[](about:blank#Solution "Solution")Solution
-------------------------------------------

### [](about:blank#Maximize-Photoconsistency "Maximize Photoconsistency")Maximize Photoconsistency

下面要做的就是如何最大化Photoconsistency。现在有两个时刻得到的帧率，很直接的想法就是最小化他们重投影颜色差异：
$$
E(\xi)=\int_ {\Omega}\left[I\left(w_ {\xi}\left(x, t_ {1}\right), t_ {1}\right)-I\left(w_ {\xi}\left(x, t_ {0}\right), t_ {0}\right)\right]^{2} \mathrm{d} x
$$
假设第一帧的位姿为identity，那么可以简化上式：
$$
I\left(w_ {\xi}\left(x, t_ {0}\right), t_ {0}\right)=I\left(x, t_ {0}\right)
$$
### [](about:blank#Linearization-of-Energy "Linearization of Energy")Linearization of Energy

上述的cost function不是凸函数，实际上对这些函数的形式我们根本不清楚，因此我们需要做Linearization。通过对$t_1$时刻的图像以及对应的warp进行一阶泰勒估计：
$$
I\left(w_ {\xi}\left(x, t_ {1}\right), t_ {1}\right) \approx I\left(x, t_ {1}\right)+\left(w_ {\xi}\left(x, t_ {1}\right)-x\right) \cdot \nabla I\left(x, t_ {1}\right) w_ {\xi}\left(x, t_ {1}\right) \approx x+\left.\left(t_ {1}-t_ {0}\right) \cdot \underbrace{\frac{\mathrm{d}(\pi \circ G \circ g)}{\mathrm{d} t} }_ {=\frac{d w}{d t} }\right|_ {\left(x, t_ {0}\right)}
$$
由此，可以将能量函数写为：
$$
\begin{aligned} E_ {l}(\xi)=\int_ {\Omega}\left(I\left(x, t_ {1}\right)-I\left(x, t_ {0}\right)\right.&+\left.\nabla I\left(x, t_ {1}\right) \cdot\left(t_ {1}-t_ {0}\right) \cdot \frac{\mathrm{d} w}{\mathrm{d} t}\left(x, t_ {0}\right)\right)^{2} \mathrm{d} x \end{aligned}
$$
由于$t_1 - t_0$只是一个放缩指数，我们可以简单得将其设为1,并且假设在这段时间内$I$的导数数不变，那么可以得到：
$$
E_ {l}(\xi)=\int_ {\Omega}\left(\frac{\partial I}{\partial t}+\nabla I\left(x, t_ {1}\right) \cdot \frac{\mathrm{d} w}{\mathrm{d} t}\left(x, t_ {0}\right)\right)^{2} \mathrm{d} x
$$
接下来，根据链式求导法则，可以得到：
$$
\frac{\mathrm{d} w}{\mathrm{d} t}=\left.\left.\left.\frac{\mathrm{d} \pi}{\mathrm{d} G}\right|_ {\pi\left(G\left(g\left(t_ {0}\right)\right), S(x)\right)} \cdot \frac{\mathrm{d} G}{\mathrm{d} g}\right|_ {\left.G\left(g\left(t_ {0}\right)\right), S(x)\right)} \cdot \frac{\mathrm{d} g}{\mathrm{d} t}\right|_ {t_ {0} }
$$
由此可以得到：
$$
E_ {l}(\xi)=\int_ {\Omega}\left(\frac{\partial I}{\partial t}+\nabla I \cdot \frac{\mathrm{d} \pi}{\mathrm{d} G} \cdot \frac{\mathrm{d} G}{\mathrm{d} g} \cdot \frac{\mathrm{d} g}{\mathrm{d} t}\right)^{2} \mathrm{d} x
$$
这里的$\frac{\mathrm{d} g}{\mathrm{d} t}$正是之前的微分方程，可以得到：
$$
E_ {l}(\xi)=\int_ {\Omega}\left(\frac{\partial I}{\partial t}+\nabla I \cdot \frac{\mathrm{d} \pi}{\mathrm{d} G} \cdot \frac{\mathrm{d} G}{\mathrm{d} g} \cdot \widehat{\xi} \cdot g(t)\right)^{2} \mathrm{d} x
$$
在这里，$\widehat{\xi} \cdot g(t)$是一个$4\times 4$矩阵，因此$\frac{\mathrm{d} G}{\mathrm{d} g}$是一个$3\times 4 \times 4$的张量，为了简化标记，作者将$\widehat{\xi} \cdot g(t)$stack在12维向量中，这是因为一个变换矩阵真正有效的信息就是$R$与$t$，自由度为12，stack操作定义为：
$$
\operatorname{stack}(\widehat{\xi} \cdot g(t))=M_ {g} \cdot \xi
$$
通过将$g$写成stacked的版本，我们可以得到最终的cost function的形式：
$$
E_ {l}(\xi)=\int_ {\Omega}\left(\frac{\partial I}{\partial t}+\left.\underbrace{\left(\nabla I \cdot \frac{\mathrm{d} \pi}{\mathrm{d} G} \cdot \frac{\mathrm{d} G}{\mathrm{d} g} \cdot M_ {g}\right)}_ {=: C\left(x, t_ {0}\right)}\right|_ {\left(x, t_ {0}\right)} \xi\right)^{2} \mathrm{d} x
$$
对于每个pixel，都有一个6维的约束$C(x,t_ {0})$，也就是求解$6 \times 6$的正规方程。到了这里，原来的问题已经转换成一个最小二乘问题了，也就很容易求解得到了。

实际上，我们最终希望得到的是关于$\xi$，很巧妙的方法是通过对时间求导而推出来的。

[](about:blank#%E7%9F%A9%E9%98%B5%E6%B1%82%E5%AF%BC "矩阵求导")矩阵求导
---------------------------------------------------------------

这篇文章看起来很简单，但是实际上如果你要真正一步步自己推导，还是有点难度的。首先，对于上式中的$\nabla I$，因为它是对像素点位置的泰勒展开，因此实际上是一个二元函数的展开：
$$
\begin{aligned} f(x+\Delta x,y + \Delta y) &= f(x,y) + \Delta x \frac{\partial f(x,y)}{\partial x} + \Delta y \frac{\partial f(x,y)}{\partial y}\\ & = f(x,y) + [\Delta x, \Delta y] \cdot \left[\frac{\partial f(x,y)}{\partial y},\frac{\partial f(x,y)}{\partial y}\right]^{\top} \end{aligned}
$$
因此，
$$
\nabla I = [I_ {dx},I_ {dy}]
$$
也就是图片的导数，可以使用sobel滤波器得到。

第二点，就是后面的导数：  
$\frac{d\pi}{dG}$导数结果是$2\times 3$的矩阵：
$$
\begin{bmatrix} \pi^\top \\ 1 \end{bmatrix} = \frac{1}{G_2} \begin{bmatrix} f_x&0&c_x\\ 0&f_y&c_y\\ 0&0&1 \end{bmatrix} \cdot \begin{bmatrix} G_0\\ G_1\\ G_2\\ \end{bmatrix}
$$
因此得到：
$$
\frac{d\pi}{dG} = \begin{bmatrix} \frac{f_x}{G_2}&0&-\frac{f_x G_0}{G^2_2}\\ 0&\frac{f_y}{G_2}&-\frac{f_y G_1}{G^2_2} \end{bmatrix}
$$
第三个，是$\frac{dG}{dg}$，由于$g$是$4 \times 4$矩阵，因此这个求出来很吓人，是$3\times 4 \times 4$的张量。但是$g$的自由度实际上是12，也就有了后面简化为12维度的说话，因为$\hat \xi g$也是只有12个有效的元素。最后$\xi$的大小是$6\times 1$，因此，$M_g$的维度为$12 \times 6$,最后$\hat xi$之前矩阵维度为$(1 \times 2)\cdot (2 \times 3) \cdot (3\times 12) \cdot (12 \times 6) = (1 \times 6)$。

这里给出最后的$C(x,t_ {0})$:  
定义$c_0,c_1,c_2$
$$
c_0 = \frac{I_ {dx} f_x}{G_2}\\ c_1 = \frac{I_ {dy} f_y}{G_2}\\ c_2 = -(c_0 G_0 + c_1 G_1 )\frac{1}{G_2}
$$
则：
$$
\begin{aligned} &C(x,t_ {0})(0) = -G_2c_1 + G_1c_2\\ &C(x,t_ {0})(1) = G_2c_0 - G_0c_2\\ &C(x,t_ {0})(2) = -G_1 c_0 + G_0 c_1\\ &C(x,t_ {0})(3) = c_0\\ &C(x,t_ {0})(4) = c_1\\ &C(x,t_ {0})(5) = c_2\\ \end{aligned}
$$

  