---
title: 机器学习——Soft-Margin Support Vector Machine
date: 2018-10-14 00:38:54
tags: [machine learning,SVM]
categories: 机器学习
mathjax: true
---
之前提到的之前的SVM会overfitting除了模型过于复杂，另一个问题就是它要将样本分类在训练集上做到完全正确。这时候一些噪声就会很大程度上影响结果。为了适应这些噪声，不得不做出很复杂的模型。<!--more-->

因此有时候我们希望可以容忍一些样本被错误分类。因此原有的数学条件就需要改变一下了。

现在我们回到最开始描述的问题：

**min**  $\frac 1 2 W^TW$

$s.t.  y_n(W^TX_n+b) \ge 1,n =1,2,...,N $.

现在我们不要求所有的$ y_n(W^TX_n+b) \ge 1$,可以容忍一些错误。当然这个错误不能无限大。假设现在被分错的样本犯的错误是$\xi _n$,那么问题可以被描述为下：

**min**  $\frac 1 2 W^TW + C\sum_ {n=1}^N\xi_n$

$s.t.  y_n(W^TX_n+b) \ge 1 - \xi_n,n =1,2,...,N $.
        
$\xi_n \ge 0,n=1,2,...,N$

仔细看上面的描述我们可以发现，如果一个样本没有犯错，那么它对应的$\xi_n = 0$.如果一个样本犯错了，那么它对应的$\xi_n = 1 - y_n(W^TX_n+b)$.

因此实际上上面的问题也可以被描述成下面的形式：

**min**  $\frac 1 2 W^TW + C\sum_ {n=1}^N \ell(y_i,W^TX_i+b)$

where  $\ell(\cdot,\cdot)$ is the hinge loss defined by $\ell(x,y) \triangleq max\{1-yz,0\}$.

常数$C$的作用在于我们可以接受的犯错程度大小。可以想象的是如果$C$比较大，整个目标既然在最小化上面的式子，那么$\xi_n$的值就会变得非常小，也就是我们可以对划分错误的容忍度是比较小的，如果$C$比较大，那么容忍度则较大，因此这里也有一个权衡。

我们从上面的描述出发继续推导这个问题的Lagrange Dual Problem：

$$\frac 1 2||W||^2 + C\sum_ {n=1}^N \xi_n + \sum_ {n=1}^N \alpha_n(1 - \xi_n - y_n(W_TX_n+b)) + \sum_ {n=1}^N(-\beta \xi_n)$$

这个时候，实际上所有的关于$W,b$的偏导数与之前都是一致的。在这里就不详细推导了，只是最后我们需要对$\xi_n$求偏导：

$$
\frac {\partial \ell} {\partial \xi_n} = 0 = C - \alpha_n - \beta _n
$$

由上式可以得到：$\beta _n = C - \alpha_n$因为我们有参数限制，$\alpha_n \ge 0,\beta_n \ge 0,n=1,...,N$,因此实际上我们可以得到的约束是：$ 0 \leq \alpha_n \leq C$.

同时由上面的结论，再结合原来的式子，还可以消掉的是$\xi$.

因此最后得到的那些KKT条件与原来HardMagin唯一的不同就在于$\alpha_n$的限制变了。从这里可以看出来$C$的作用:$C$很大的时候，说明这个限制相对原来较小，也就是要求犯错较少（因为原来的情况我们是不允许犯错误的）。

通过二次规划，我们可以一样得到$\alpha_n $的值，从而得到$W$，与$b$.但是需要注意的是$b$与之前的算法不一样了。

之前我们通过$a_n(1 - y_n(W^TX_n+b)) = 0$，通过找到是支持向量的点（$a_n \ne 0$）,从而通过该点计算出来$b = y_n - W^TX_n$.

而此时，我们想要计算的$b = y_n - y_n \xi_n - W^TX_n$.

有个问题，我们不知道$\ell_n$的值啊（其实我们是知道的$\xi_n = max(1 - y_n(W^TX_n+b),0)$，不过这是要等$b$求出来之后）。但是我们知道另一个信息$\beta_n \xi_n = (C - \alpha_n) \xi_n = 0$，这意味着如果$\alpha_n \ne C$的点，$\xi = 0$.所有实际上我们需要的是$0<\alpha_n < C$的点，这时候$\xi= 0$,可以计算出$b = y_n - W^TX_n$，这样的点叫free Support Vector.个别时候我们无法找到$free Support Vector$，那么这个$b$的值只能用kkt条件来限制了。

这里，我们希望可以仔细思考一下$\alpha_n$背后是否有什么指示。

如果$\alpha_n = 0$，那么$1 - \xi_n - y_n(W^TX_n +b) \leq 0$，可以得到的是这些点一般是完全没有错误的，这点和之前是一样的。

否则，$C>\alpha_n > 0$，则我们通过上面的推导也知道$\xi_n = 0$.这意味着，它们对应的$y_n(W^TX_n+b) = 1$.所以这些点是Support Vector，它们定义了最宽的分界线。

还有一种情况，$\alpha_n = C$.这种点就是被分错的点了，$\xi \ne 0$，但是$ 1 - \xi - y_n(W^TX_n+b) = 0$.要注意的是这里的分错并不一定是分类结果错误，还有可能是在分到margin中间去了。

上面的内容就是Soft Margin SVM，但是值得注意的是，我们需要调一个参数：C，如果C过大，仍然可能会overfitting。

Soft Margin SVM可以与Kernel结合，在实际中使用比Hard Margin SVM更加频繁。