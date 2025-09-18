---
title: 数学——Unbiased Estimation
date: 2018-12-20 23:12:33
tags: [mathematics,probility theory]
categories: 数学
mathjax: true
---
在很久之前学习概率论的时候呢，有这么一个比较奇怪的地方，方差的无偏估计：
$$
\sigma^2 = \frac{1}{n-1}\sum_ {i=1}^n(X_i - \overline X)^2
$$

$\overline X = \frac 1 n X_i$，这里无偏估计是$\frac{1}{n-1}$总感觉有点反直觉。这篇文章就是想介绍一下无偏估计，以及这个$(n-1)$是从何而来的。
<!--more-->
无偏估计的定义是这样：如果$\hat t$是$t$的一个无偏估计，那么$E[\hat t] =t $.其实从通俗意义上来理解，就是以$\hat t$有偏差，但是这个偏差是以$t$为中心的。可以想象一个打靶的过程，你实际打的地方就是你瞄准的地方的无偏估计，前提是你可能打上打左打右打下等等。如果你瞄准的就不是靶心，那么你打的地方就不是靶心的无偏估计了。

现在来说明一些比较简单的无偏估计，它是我们推导的前提。

假如$X_1,X_2,...,X_n$是对X的独立随机采样，那么,$\mu$是X的均值，$\sigma^2$是X的方差。
$$
\begin{equation}
E[X_i] = \mu
\end{equation}
$$
$$
\begin{equation}
E[\overline X] = \mu
\end{equation}
$$
上式中$$\overline X = \frac{1}{n} \sum_ {i=1}^n X_i$$.
$$
\begin{equation}
E[\frac 1 n \sum_ {i=1}^n (X_i - \mu)^2] = \sigma^2
\end{equation}
$$

上面的式子前两个都不难理解，我们可以证明一下(3)：
$$
\begin{aligned}
E[\frac 1 n \sum_ {i=1}^n (X_i - \mu)^2] &= \frac{1}{n}\sum_ {i=1}^nE[(X_i - \mu)^2]\\
&= \frac{1}{n}\sum_ {i=1}^n E[X_i^2 - 2X_i\mu + \mu^2]\\
&= \frac{1}{n}\sum_ {i=1}^n E[X^2 - 2X\mu + \mu^2]\\ 
&=  \frac{1}{n}\sum_ {i=1}^n E[(X - \mu)^2]\\
&= E[(X - \mu)^2] =\sigma^2
\end{aligned}
$$

但是实际中，我们也往往无法得到$\mu$的值。想象一下，如果需要统计全世界人的平均身高，你要统计60亿人的身高才能得到精确的$\mu$，如果有个人死掉了，有个人出生了，$\mu$又变了。实际中根本不会这么做。我们一般会根据$\overline X$来估计$\mu$。因此对于方差的估计也是用$\overline X$来完成的。这时候就出现了诡异的式子了：
$$
\begin{equation}
E[\frac{1}{n-1} \sum_ {i=1}^n (X_i - \overline X)^2] = \sigma^2
\end{equation}
$$

也就是说，$S^2 =\frac{1}{n-1} \sum_ {i=1}^n (X_i - \overline X)^2 $才是$\sigma^2$的无偏估计。

为什么？

先给大家一个直观的理解。首先，我们知道$\sum_ {i=1}^n (X_i - y)^2$这个式子，在$y = \overline X$时候取得最大值。如果你不知道这个，很好证明，之前数据学习一篇文章中也提到过[k-means clustering](https://wlsdzyzl.top/2018/11/19/Learning-From-Data%E2%80%94%E2%80%94K-Means-Clustering/).

但是，我们得到的$\overline X $与$\mu$多少是有些偏差的，这意味着：
$$
\sum_ {i=1}^n (X_i - \overline X)^2 \leq \sum_ {i=1}^n (X_i - \mu)^2
$$
也就是，我们如果这样估计：
$$
\frac{1}{n} \sum_ {i=1}^n (X_i - \overline X)^2
$$

结果是偏小的。

但是具体要增加多少才能达到无偏估计呢？下面开始推导：
$$
\begin{aligned}
E[\sum_ {i=1}^n (X_i - \overline X)^2] &=E[\sum_ {i=1}^n(X_i - \mu -(\overline X - \mu))^2]\\
&=  E[\sum_ {i=1}^n ((X_i - \mu)^2 - 2(X_i - \mu)(\overline X - \mu) +  (\overline X - \mu)^2)]\\
&= E[\sum_ {i=1}^n (X_i - \mu)^2 - 2(\overline X - \mu)\sum_ {i=1}^n(X_i - \mu) + n(\overline X - \mu)^2 ]\\
&= E[\sum_ {i=1}^n (X_i - \mu)^2 - 2(\overline X - \mu)(n\overline X - n\mu) + n(\overline X - \mu)^2 ]\\
&= E[\sum_ {i=1}^n (X_i - \mu)^2 - n(\overline X - \mu)^2 ]\\
&= n\sigma^2 - nE[(\overline X - \mu)^2 ]
\end{aligned}
$$

现在我们想要弄明白的是：$E[(\overline X - \mu)^2 ] = ?$
$$
\begin{aligned}
E[(\overline X - \mu)^2 ] &= E[(\frac 1 n \sum_ {i=1}^n X_i - \mu)^2]\\
&= E[(\frac 1 n (\sum_ {i=1}^n X_i - n\mu))^2]\\
&=E[\frac{1} {n^2} (\sum_ {i=1}^n (X_i - \mu))^2]\\
&= \frac{1}{n^2}E[\sum_ {i=1}^n (X_i-\mu)^2 - 2\sum_ {i\ne j}(X_i - \mu)(X_j - \mu)]\\
&= \frac{1}{n^2}(E[\sum_ {i=1}^n (X_i-\mu)^2] - 2\sum_ {i\ne j}E[(X_i - \mu)(X_j - \mu)])\\
&=  \frac{1}{n^2}(E[\sum_ {i=1}^n (X_i-\mu)^2] - 2\sum_ {i\ne j}E[(X_i - \mu)]E[(X_j - \mu)])\\
&= \frac{1}{n^2}(E[\sum_ {i=1}^n (X_i-\mu)^2])\\
&= \frac 1 n \sigma^2
\end{aligned}
$$

上式中倒数第一步由(3)式得到，倒数第三步是因为我们采样是独立的。

所以我们得到：
$$
E[\sum_ {i=1}^n (X_i - \overline X)^2]  = (n-1)\sigma^2
$$

这也就证明了，对于方差的无偏估计是$S^2$，其中：
$$
S^2 = \frac{1}{n-1} \sum_ {i=1}^n (X_i - \overline X)^2 
$$

下面我们将这个拓展到多维度变量的协方差矩阵。多维度变量$X \in \mathbb{R}^n$协方差矩阵的定义为：
$$
Cov(X) \triangleq E[(X-\mu)(X-\mu)^T]
$$

现在假设有m个采样，而这些采样的平均值为$\hat \mu$.

现在我们证明$\hat C$为$\Sigma = Cov(X)$的无偏估计。其中：
$$
\hat C = \frac{1}{m-1}E[\sum_ {i=1}^m(X_i - \hat \mu)(X_i - \hat \mu)^T].
$$
实际上证明是大同小异的，幸运的是矩阵的多数运算都和标量非常相似。
$$
\begin{aligned}
E[\hat C]&= \frac{1}{m-1}E[\sum_ {i=1}^m(X_i - \hat \mu)(X_i - \hat \mu)^T]\\
&=\frac{1}{m-1}\sum_ {i=1}^mE[(X_i - \hat \mu)(X_i - \hat \mu)^T]\\
&=\frac{1}{m-1}\sum_ {i=1}^mE[(X_i - \mu + \mu - \hat \mu)(X_i - \mu + \mu - \hat \mu)^T]\\
&= \frac{1}{m-1}\sum_ {i=1}^m E[(X_i - \mu)(X_i - \mu)^T + 2 (X_i - \mu)(\mu - \hat \mu)^T + (\mu - \hat \mu)(\mu - \hat \mu)^T]\\
&= \frac{1}{m-1}\left(\sum_ {i=1}^m E[(X_i - \mu)(X_i - \mu)^T] + \sum_ {i=1}^m E[2 (X_i - \mu)(\mu - \hat \mu)^T + (\mu - \hat \mu)(\mu - \hat \mu)^T]\right)\\
&= \frac{1}{m-1} (m\Sigma + E[\sum_ {i=1}^m 2(X_i - \mu)(\mu - \hat \mu)^T + m(\mu - \hat \mu)(\mu - \hat \mu)^T])\\
&= \frac{1}{m-1} (m\Sigma + E[2m(\hat\mu - \mu)(\mu - \hat \mu)^T + m(\mu - \hat \mu)(\mu - \hat \mu)^T])\\
&= \frac{1}{m-1}(m \Sigma - mE[(\hat \mu - \mu)(\hat \mu - \mu)^T])\\
\end{aligned}
$$

而其中：
$$
\begin{aligned}
E[(\hat \mu - \mu)(\hat \mu - \mu)^T] &= E[(\frac{1}{m}\sum_ {i=1}^m X_i - \mu)(\frac{1}{m}\sum_ {i=1}^mX_i - \mu)^T]\\
&= \frac{1}{m^2}E[(\sum_ {i=1}^m(X_i - \mu))(\sum_ {i=1}^m(X_i - \mu))^T]\\
&=\frac{1}{m^2} E[\sum_ {i=1}^m (X_i - \mu)(X_i - \mu)^T + 2\sum_ {i\ne j}(X_i - \mu)(X_j - \mu )]\\
&=\frac{1}{m^2}(m\Sigma + 2\sum_ {i\ne j} E[X_i - \mu] E[X_j-\mu])\\
&=\frac{1}{m^2}(m\Sigma + 0)\\
&= \frac{1}{m}\Sigma
\end{aligned}
$$

所以我们得到：
$$E[\hat C] = \frac{1}{m-1}(m-1)\Sigma = \Sigma.$$