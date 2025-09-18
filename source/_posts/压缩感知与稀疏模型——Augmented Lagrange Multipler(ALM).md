---
title: 压缩感知与稀疏模型——Augmented Lagrange Multipler(ALM)
date: 2019-7-21 00:00:00
tags: [machine learning,sparse model,convex optimization]
categories: 压缩感知与稀疏模型
mathjax: true
---            

这个博客将介绍ALM，介绍一个用来解决一个等式限制的问题的框架。  

<!--more-->


考虑下面的问题：
$$
\begin{array}{ll}{\text { minimize } } & {g(\boldsymbol{x})} \\ {\text { subject to } } & {A x=y}\end{array}
$$
这里的$g:\mathbb R^n \rightarrow \mathbb R$是一个凸函数，$A \in \mathbb R^{m\times n},y \in \text{range}(A)$。在之前的Lasso问题中，我们加入了噪声，然后用惩罚函数代替约束来解决。实际上用同样的方法是可以解决类似的问题：
$$
\text{minimize }g(\boldsymbol{x})+\frac{\mu}{2}\|\boldsymbol{y}-\boldsymbol{A} \boldsymbol{x}\|_ {2}^{2}
$$
只要$\mu$足够大，意味着有更大的权重放在对于cost函数的优化上，这样就可以得到足够好的结果来满足约束。但是这个算法的问题在于，之前我们优化这类函数的算法，PG还是APG，他们收敛率很大程度上是受梯度$\nabla(\mu f)=\mu A^{*}(A x-y)$在点与点之间能变化速率影响的，这个速率由Lipschitz常数来衡量：
$$
L_ {\nabla \mu f}=\mu\|\boldsymbol{A}\|_ {2}^{2}
$$
因此就带来一个问题：$\mu$越大，那么上述问题就越难解决。但是想要解决等式限制问题，又必须要$\mu$足够大。这就意味着使用二次惩罚函数代替等式限制的方法是不够完美的。

Lagrange对偶可以将一个约束问题转化成无约束问题，而原目标函数的拉格朗日函数如下：
$$
\mathcal{L}(\boldsymbol{x}, \boldsymbol{\lambda}) \doteq g(\boldsymbol{x})+\langle\boldsymbol{\lambda}, \boldsymbol{A} \boldsymbol{x}-\boldsymbol{y}\rangle
$$
而原问题的最优解，是拉格朗日函数的鞍点（saddle point）：
$$
\sup _ {\boldsymbol{\lambda} } \inf _ {\boldsymbol{x} } \mathcal{L}(\boldsymbol{x}, \boldsymbol{\lambda})=\text{sup inf}_ {\boldsymbol{\lambda} } g(\boldsymbol{x})+\langle\boldsymbol{\lambda}, \boldsymbol{A} \boldsymbol{x}-\boldsymbol{y}\rangle
$$
如果我们定义对偶函数如下：
$$
d(\boldsymbol{\lambda}) \doteq \inf _ {\boldsymbol{x} } g(\boldsymbol{x})+\langle\boldsymbol{\lambda}, \boldsymbol{A} \boldsymbol{x}-\boldsymbol{y}\rangle
$$
那么找到最优解可以通过下面的式子：
$$
\begin{aligned} \boldsymbol{x}_ {k+1} &=\arg \min _ {\boldsymbol{x} } \mathcal{L}\left(\boldsymbol{x}, \boldsymbol{\lambda}_ {k}\right) \\ \boldsymbol{\lambda}_ {k+1} &=\boldsymbol{\lambda}_ {k}+t_ {k+1}\left(\boldsymbol{A} \boldsymbol{x}_ {k+1}-\boldsymbol{y}\right) \end{aligned}
$$
$\boldsymbol{A} \boldsymbol{x}_ {k+1}-\boldsymbol{y}$是对偶问题$d(\lambda)$的一个次梯度，这个算法就是实际上是在最大化对偶问题，因此也叫dual ascent。这个算法的缺点在于，在一些问题上，它会失败。下面是一个例子：
$$
\inf _ {\boldsymbol{x} }\|\boldsymbol{x}\|_ {1}+\langle\boldsymbol{\lambda}, \boldsymbol{A} \boldsymbol{x}-\boldsymbol{y}\rangle=\left\{\begin{array}{ll}{-\infty} & {\left\|\boldsymbol{A}^{*} \boldsymbol{\lambda}\right\|_ {\infty}>1} \\ {-\langle\boldsymbol{\lambda}, \boldsymbol{y}\rangle} & {\left\|\boldsymbol{A}^{*} \boldsymbol{\lambda}\right\|_ {\infty} \leq 1}\end{array}\right.
$$
可以看到的是传统的Lagrangian对于约束的惩罚是不够的，因此提出了Augmented Lagrangian：
$$
\mathcal{L}_ {\mu}(\boldsymbol{x}, \boldsymbol{\lambda}) \doteq g(\boldsymbol{x})+\langle\boldsymbol{\lambda}, \boldsymbol{A} \boldsymbol{x}-\boldsymbol{y}\rangle+\frac{\mu}{2}\|\boldsymbol{A} \boldsymbol{x}-\boldsymbol{y}\|_ {2}^{2}
$$
上面的函数可以看做是下面约束问题的Lagrangian：
$$
\begin{array}{ll}{\text { minimize } } & {g(\boldsymbol{x})+\frac{\mu}{2}\|\boldsymbol{y}-\boldsymbol{A} \boldsymbol{x}\|_ {2}^{2} } \\ {\text { subject to } } & {\boldsymbol{A} \boldsymbol{x}=\boldsymbol{y} }\end{array}.
$$
由于惩罚项$|\boldsymbol{y}-\boldsymbol{A} \boldsymbol{x}|_ {2}^{2}$对于可用集合中的$x$来说都为0，因此这个问题的最佳值与原问题的最佳值是一样的。而且通过Augmented Lagrangian，让对偶问题仅仅需要对$g$的一些弱假设就可以被证明是一定收敛的。为了实现它，我们对步长大小进行一个特殊的选择：$t_k = \mu$，得到下面的迭代策略：
$$
\begin{aligned} \boldsymbol{x}_ {k+1} & \in \arg \min _ {\boldsymbol{x} } \mathcal{L}_ {\mu}\left(\boldsymbol{x}, \boldsymbol{\lambda}_ {k}\right) \\ \boldsymbol{\lambda}_ {k+1} &=\boldsymbol{\lambda}_ {k}+\boldsymbol{\mu}\left(\boldsymbol{A} \boldsymbol{x}_ {k+1}-\boldsymbol{y}\right) \end{aligned}
$$
对于步骤$\boldsymbol{x}_ {k+1}\in \arg \min _ {\boldsymbol{x} }\mathcal{L}_ {\mu}\left(\boldsymbol{x}, \boldsymbol{\lambda}_ {k}\right)$，本身就是一个凸优化问题，可以使用PG算法来解决。注意，$t_ {k+1}=\mu$是非常重要的，它避免了出现失败的情况。因此对于ALM算法，可以总结如下：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/alm1.png)

1.  ALM for Basis Pursuit  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/alm2.png)
2.  ALM for Principal Component Pursuit  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/alm3.png)
