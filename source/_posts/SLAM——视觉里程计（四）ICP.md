---
title: SLAM——视觉里程计（四）ICP
date: 2019-01-20 00:00:00
tags: [SLAM,icp]
categories: SLAM
mathjax: true
---        
    
3D到3D之间的位姿匹配，我们要用到的方法就是ICP算法了。  

<!--more-->


ICP算法在之前的博客有过介绍，如果你还不了解什么是ICP算法，请点击[ICP——迭代最近点](https://wlsdzyzl.top/2019/01/17/ICP%E2%80%94%E2%80%94%E8%BF%AD%E4%BB%A3%E6%9C%80%E8%BF%91%E7%82%B9/)。

最纯粹的ICP算法，是在不知道匹配点的情况下，怎么将两个点云配准，并且求出旋转矩阵。不过在SLAM中，如之前说的3D到2D，我们由于PnP已经能够求得3D点的坐标，或者根据特征点匹配，得到匹配点的坐标，同时又通过RGB-D得到了两个相机坐标下的点云。这时候，我们对点的匹配情况一般是已知的。

因此SLAM下的ICP算法非常简单，它也无需迭代，只需要构建最小二乘问题，最后用SVD分解得到$R$与$t$即可。

而另外，我们可以使用非线性解法来解ICP问题，同样也就是利用优化器来解决。为了使用优化器，我们需要用到李群李代数，才能求得梯度，从而不断迭代求解。因此，在非线性条件下，我们的问题描述变成了：
$$
\xi^*=\underset{\xi}{\arg\min}\frac{1}{2}\sum_ {i=1}^{n}||P_i-K\exp(\xi^{\hat{} })P_i^{'}||_2^2
$$
为了使用非线性优化，与之前的BA问题一样，我们需要找到误差对优化变量的雅科比矩阵。在这个题目中，这个问题变得很简单，我们已经知道：
$$
\begin{aligned} \frac{\partial (TP)}{\partial \xi} &= \lim_ {\delta \xi \rightarrow 0} \frac{\begin{bmatrix} \delta \phi^{\hat{} }(RP+t) + \delta P\\ 0 \end{bmatrix} }{\delta \xi}\\ &= \begin{bmatrix} I&-(RP+t)^{\hat{} }\\ 0&0 \end{bmatrix}\\ &\triangleq (TP)^{\odot} \end{aligned}
$$
因此可以得到：
$$
\frac{\partial e}{\partial \delta \xi} = -(\exp(\xi^{\hat{} })P_i^{'})^{\odot}
$$
根据上面的雅科比矩阵我们可以找到梯度，从而走向极小值。如果ICP已知匹配点，如果能找到极小值，那么它一定是全局最优值。因此对于ICP无需初始化，这是ICP算法的一个优点。

知道上面的问题，我们将其放入ceres或者g2o等库中优化即可。

在这个ICP问题中，我们已经知道了点的配对情况，因此没有必要迭代求解，而ICP算法的研究者更重视的是在匹配情况位置的情况下的配准。在实际的操作中，我们可能会结合多种方法一起使用以求得最佳的位姿。


