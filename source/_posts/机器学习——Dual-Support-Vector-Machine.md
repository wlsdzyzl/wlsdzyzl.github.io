---
title: 机器学习——Dual Support Vector Machine
date: 2018-10-11 19:33:33
tags: [machine learning,SVM]
categories: 机器学习
mathjax: true
---

之前说明了linear SVM的，但是实际上依然还有一些问题。虽然在一定程度上，linear SVM会减小特征转换带来的复杂度，但是另一方面，它依然依赖着d.<!--more-->如果d过大，即使使用很多现有的QP工具，依然很难得到结果。如何处理数据维度很大，甚至是无穷维的情况？这是我们想要解决的问题。

但是要注意的事，实际上的数学推导非常复杂，因此在这里我只会做简单的推导，来慢慢达到自己的目标。

首先我们拿出来上次讨论到最后的成型的问题：

**$\min$**  $\frac 1 2 W^TW$

$s.t.  y_n(W^TX_n+b) \ge 1,n =1,2,...,N $.

我们可以想到的是利用拉格朗日乘数，类似于之前的正则化，来构造一个函数$\zeta(W,b,\alpha)$,定义如下：
$$
\zeta(W,b,\alpha) = \frac 1 2 W^TW + \sum _ {n = 1} ^{N} \alpha_n (1 - y_n(W^TX_n+b)) 
$$

我们要做的SVM是：$\min_ {W,b}(\max_ { \alpha_i \ge 0,i=1,...,n} \zeta (W,b,\alpha) )$,很神奇的，我们需要的那些约束都融入到一个式子当中了。在这里，希望简单可以说明一下，实际上我们上面的SVM与原来的效果是一样的。

首先，如果原来的约束不满足，则：$y_n(W^TX_n+b) <1$，那么$(1-y_n(W^TX_n+b))>0$，而要最大化$\zeta(W,b,\alpha)$，$\alpha$又大于等于0，那么可以肯定的是$\sum _ {n = 0} ^{N} \alpha_n (1 - y_n(W^TX_n+b)) $最后的结果是无穷大了，它一定不会被选上；

如果原来的约束满足的话，$(1 - y_n(W^TX_n+b)) \leq 0$,因为它小于0，要最大化$\zeta(W,b,\alpha)$，只能使得$\sum _ {n = 0} ^{N} \alpha_n (1 - y_n(W^TX_n+b)) $等于0，也就是最后得到的结果是$\zeta(W,b,\alpha) = \frac 1 2 W^TW$，因此实际上最终求的的最大值，依然是满足条件的。

通过这样就很巧妙地将条件与我们想要做的优化问题融合成了一个式子。

而且我们很容易知道的事：$\min_ {W,b}(\max_ {\alpha_i \ge 0,i=1,...,n} \zeta (W,b,\alpha) ) \ge \min_ {W,b} \zeta (W,b,\alpha ')$,上式中$\alpha'$是个定值，
也就可以推断出来：$\min_ {W,b}(\max_ {\alpha_i \ge 0,i=1,...,n} \zeta (W,b,\alpha) ) \ge \max_ {\alpha_i \ge 0,i=1,...,n}( \min_ {W,b} \zeta (W,b,\alpha '))$.

更令人兴奋的是，在这些条件下：

1.convex primal

2.feasible primal（true if separable）

3.linear constraints

上式的等号是成立的。

因此我们只需要解决右边的部分就好了。这就是Lagrange Duality，拉格朗日对偶。（为何不解左边？emmm，$\alpha$ 是一个向量，N维的，一般来说N>>d+1）

嗯，但是似乎这个式子，还是很复杂，全部写出来看一下：
$$
\zeta(W,b,\alpha) = \frac 1 2 W^TW + \sum _ {n = 1} ^{N} \alpha_n (1 - y_n(W^TX_n+b)) 
$$

首先，要在把$\alpha$看作定值的情况下找到最小值，那么我们知道它一定满足的条件：
$$
\frac {\partial \zeta}{\partial b} = \sum _ {n=1}\alpha_n y_n = 0 
$$

因此，上面的式子变成了：
$$
\zeta(W,b,\alpha) = \frac 1 2 W^TW + \sum _ {n = 1} ^{N} \alpha_n (1 - y_nW^TX_n) 
$$

简化了很大一部分。然后求$W$的偏导：

$$
\frac {\partial \zeta}{\partial W} = W - \sum_ {n=1}^N \alpha_n y_nX_n = 0 
$$

我们可以得到$  \sum_ {n=1}^N \alpha_n y_nX_n = W$,因此最后式子简化为：
$$
\zeta(W,b,\alpha) =   \sum _ {n = 1} ^{N} \alpha_n - \frac 1 2 W^TW.
$$

式子又简单了很多。同时我们再继续将$W$替换:

$$
\zeta(W,b,\alpha) =   \sum _ {n = 1} ^{N} \alpha_n - \frac 1 2 ||\sum_ {n=1}^N \alpha_n y_nX_n||^2.
$$

而且不要忘了我们最之前推导的： $\alpha_n (1 - y_n(W^TX_n+b)) = 0$.

因此，现在的式子里面已经没有$W$与$b$了，我们要做的就是

$\max_ {\alpha_i \ge 0,i=1,...,n,\sum y_n \alpha_n = 0,W =\sum \alpha_n y_nX_n } - \frac 1 2 ||\sum_ {n=1}^N \alpha_n y_nX_n||^2 +  \sum _ {n = 1} ^{N} \alpha_n$.

总结一下，要解决对偶问题得到上面的结果，需要达到的条件：

1.primal feasible： $y_n(W^TX_n+b) \ge 1$

2.dual feasible: $a_n \ge 0$

3.dual-inner optimal:$\sum y_n \alpha_n = 0;W =\sum \alpha_n y_nX_n$

4.primal-inner optimal: $\alpha_n (1 - y_n(W^TX_n+b)) = 0$.

上面的这些条件，被称为KKT（Karush-Kuhn-Tucker）条件，对于优化问题是非常必要的。哇，之前听过的高大上的名词逐渐拨开云雾见青天了。

我们将上面的式子继续展开：

$$
-\frac 1 2 \sum_ {n=1}^N \sum_ {m=1}^N a_na_my_ny_mX_n^TX_m + \sum_ {n=1}^N \alpha_n.
$$

接下来我们开始尝试最大化上面的这个式子,首先依然我们把最大化问题转化成为最小化问题，用数学语言描述：

$\min_ {\alpha} \frac 1 2 \sum_ {n=1}^N \sum_ {m=1}^N a_na_my_ny_mX_n^TX_m - \sum_ {n=1}^N \alpha_n$

 **subject to** $\sum_ {n=1}^N y_n\alpha_n = 0;a_n \ge 0,n=1,...,N$

 因为式子中没有$W$,我们暂时将约束中的$W$去掉，专注这个问题，最后再尝试计算出$W$.

 而这个如果仔细观察，我们会发现它是一个QP问题。也就是通过现成的工具，可以计算出最佳的$\alpha$.

 计算出最佳的$\alpha$，可以很轻易地计算出$W$，而且通过约束也能轻易地计算出$b$.而且我们可以通过约束发现，其实相当一大部分$\alpha_n=0$，而$\alpha \ne 0$的那些点，也正是我们的支撑向量。

 最后，我们提出一个疑问：这个计算方法，真的和维度没关系了吗？恐怕不是，维度隐含在了计算$Q$矩阵当中了.这还是没有达到我们的目的。这需要下一个改进：kernel。
 
 ##p.s. QP问题的解决

 一般来说，解决QP问题的工具，需要提供下面几个参数：

optimal $\alpha$ $\leftarrow$ $QP(Q,\mathbf{p},A,\mathbf{c})$

 $\min_ {\alpha}$  $\frac 1 2 \alpha ^T Q \alpha + p^T\alpha$

subject to $a_i^T \alpha \ge C_i$, for i = 1,2,...

因此，在本例中，Q：
$q_ {n,m} = y_ny_mX^nX^m;$

$\mathbf{p} = -1_N;$

$a_1 = Y ,a_2 = -Y;a_3 = 1_N$

$c_1 = 0,c_2 = 0,c_3 = 0;$

当然，具体的参数类型还要看具体的工具包，但是所需参数都不难从已知的条件转换得到。