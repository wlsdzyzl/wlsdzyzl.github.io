---
title: 数学——KKT condition
date: 2018-12-07 21:01:35
tags: [KKT, Convex optimization,mathematics]
categories: 数学
mathjax: true
---
实际上，之前的文章中已经多次提到了KKT条件，比如机器学习中[SVM](https://wlsdzyzl.top/2018/10/11/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%E2%80%94%E2%80%94Dual-Support-Vector-Machine/)，以及信息论中[信道容量](https://wlsdzyzl.top/2018/11/27/%E4%BF%A1%E6%81%AF%E8%AE%BA%E2%80%94%E2%80%94%E4%BF%A1%E9%81%93%E5%8F%8A%E5%85%B6%E5%AE%B9%E9%87%8F/).但是都是具体问题下的kkt条件。这次来概括说明下，纯数学中的kkt条件。
<!--more-->
要说KKT条件，是离不开lagrange multiplier，也就是拉格朗日乘数法。这是在求约束极值下一个非常重要的方法，可以参考：[lagrange multiplier](https://wlsdzyzl.top/2018/10/09/%E6%95%B0%E5%AD%A6%E2%80%94%E2%80%94Lagrange-Multiplier/)。

那么什么是KKT条件呢？

对于目标函数$f:\mathbb{R}^n \rightarrow \mathbb{R}$，约束函数$g_i: \mathbb{R}^n \rightarrow \mathbb{R}$,$h_j: \mathbb{R}^n \rightarrow \mathbb{R}$,如果他们在点$x^ *$都是连续可微的，那么$x^ *$是一个局部最优解,那么需要满足下面几个条件：

* stationary
    * for maximizing $f(x):\nabla f(x^\*) = \sum_ {i=1}^m\mu_i\nabla g_i(x^\*)+ \sum_ {j=1}^n\lambda_i\nabla h_j(x^\*)$
    * for minimizing $f(x):-\nabla f(x^\*) = \sum_ {i=1}^m\mu_i\nabla g_i(x^\*)+ \sum_ {j=1}^n\lambda_i\nabla h_j(x^\*)$
* primal feasibility
    * $g_i(x^ *) \leq 0$, for $i=1,...,m$
    * $h_j(x^ *) = 0$, for $j=1,...,n$
* Dual feasibility
    * $\mu_i > 0$, for $i=1,...,m$
* complementary slackness
    * $\mu_ig_i(x^*)=0$, for $i=1,...,m$.

这几个条件就是KKT条件。如果$m=0$，可以看到的就是高数中的条件极值问题，也就是约束为$h_i(x)=0$.

这几个条件是怎么得到的？什么道理？实际上之前的SVM中说明了。假如我们要minimize，那么约束条件可以转化为dual problem：
$$
\min_ {\mu_i,\mu_i \ge 0} (\max (f(x)+\sum_ {i=1}^m \mu_i g_i(x) + \sum_ {j=1}^n \lambda_j h_j(x) ))
$$

为了让上面的式子和有约束的情况下一样，我们需要保证$\mu_i \ge 0$,因为我们需要让上式满足这个约束$g_i(x) \ge 0$。加入有$x_ {\theta},g_i(x_ {\theta})>0$,那么在$\max$这一步会将它放至无限大，导致$min$的时候它一定不会被选到。所以$\mu_i \ge 0$是dual feasibility，而primal feasibility也很好理解，也就是那些约束。

至于complementary slackness, 也是很好理解的。如果解上式，$g_i(x)<0$最终会得到$u_i=0$，因此得到$\mu_ig_i(x^*)=0$.

而stationary也就是对对偶问题两侧求导并得0得到的条件。

在凸函数上，满足KKT条件是就是最优解，也就是充要条件，否则只是最优解的必要条件。