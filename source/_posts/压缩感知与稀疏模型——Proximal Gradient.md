---
title: 压缩感知与稀疏模型——Proximal Gradient
date: 2019-7-11 00:00:00
tags: [machine learning,sparse model,convex optimization]
categories: 压缩感知与稀疏模型
mathjax: true
---        

实际上这节课讲的内容也比较多，对应的是convex optimization，这里主要介绍一下lasso回归以及对应使用的Proximal Gradient Decent（PGD）。

<!--more-->


### [](about:blank#Lasso-Regression "Lasso Regression")Lasso Regression

之前提到，对于$l^0$范数问题，用来求解最稀疏的解，我们可以将最小化$l^0$范数放松到最小化$l^1$范数。假如现在有下面的问题：
$$
\text{minimize }\Vert x \Vert_1\\ \text{subject to } Ax = y.
$$
这个问题是著名的BP(Basic Pursuit)问题，它的另外一个版本是考虑了高斯噪声：$y = Ax_0 + z$，将这个问题的限制用一个惩罚函数$f(x) = \frac {1}{2} \Vert y-Ax \Vert_2^2$代替，可以得到下面的解决策略：
$$
\min_x \frac{1}{2} \Vert y - Ax \Vert ^2_2 + \lambda \Vert x\Vert_1
$$
这就是著名的Lasso回归。

之前学习的优化方法大多数是对于$l^2$范数的优化，因为它处处可导。而$l^1$范数虽然也是凸函数，但是却不是平滑函数，在局部会出现不可导的情况。

除此之外，有着类似形式的问题还有低秩矩阵的恢复问题。我们希望恢复低秩矩阵$L_0$，能观察到的量为$Y = L_0 + S_0$。一个常用的方法是解决PCP（principal component pursuit）问题：
$$
\begin{array}{cl}{ {\operatorname{minimize} } }& {\|\boldsymbol{L}\|_ {*}+\lambda\|\boldsymbol{S}\|_ {1} } \\ {\text { subject to } } & {\boldsymbol{L}+\boldsymbol{S}=\boldsymbol{Y} } \end{array}
$$
如果数据中包含噪声，那么一个更稳定的版本为:
$$
\operatorname{minimize} \frac{1}{2}\|\boldsymbol{Y}-\boldsymbol{L}-\boldsymbol{S}\|_ {F}^{2}+\lambda_ {1}\|\boldsymbol{L}\|_ {*}+\lambda_ {2}\|\boldsymbol{S}\|_ {1}
$$
### [](about:blank#Proximal-Gradient-Methods "Proximal Gradient Methods")Proximal Gradient Methods

实际上，我们会遇到很多类似于lasso回归一样的优化问题，它们都有着下面的形式：
$$
F(x) = f(x) + g(x)
$$
其中$f(x)$是一个平滑的凸函数，而$g(x)$是一个凸函数但是却不是平滑的。在上面提到的Lasso问题中：
$$
f(x) = \frac{1}{2} \Vert y - Ax \Vert ^2_2, g(x) = \lambda \Vert x\Vert_1.
$$
我们希望能找到一种快速的方法来解决这样的优化问题。

首先，由于局部不可导，因此我们没法使用梯度下降，最容易想到的是使用subgradient（次梯度）。

使用次梯度下降：
$$
x_ {k+1} = x_k - \gamma_k g_k, g_k \in \partial F(x_k)
$$
实际上是可以解决Lasso问题的，但是主要缺点是收敛得太慢了。一般来说，次梯度的收敛速率对于非平滑的目标函数是：
$$
F(x_k) - F(x_*) = O(\frac{1}{\sqrt k})
$$
#### [](about:blank#convergence-rates-of-first-order-methods "convergence rates of first order methods")convergence rates of first order methods

这部分内容介绍一下一般梯度下降（使用一阶导数）的收敛速度是$O(\frac{1}{k})$。对于convex函数来说，一阶导数估计实际上提供的是一个下界。

我们知道梯度下降每次迭代规律为：
$$
x_ {k+1} = x_k - \gamma_k \nabla f(x_k)
$$
而迭代后的代入$f$真实值，实际上是大于根据梯度估计的值的：
$$
f(x') \ge f(x) + \langle\nabla f(x),x'-x\rangle
$$
梯度越大，步子就可以迈得更大一点，因为对于平滑函数来说，这意味着距离最低点还更远一点。引入新的概念：L-Lipschitz gradient，如果一个函数满足：
$$
\Vert \nabla f(x_1) - \nabla f(x_2)\Vert \leq L\Vert x_1 - x_2\Vert, \forall x_1,x_2 \in \mathbb R^n
$$
$L>0$,那么这个$L$被称为Lipschitz常量。有了这个条件，我们可以给线性下界补充一个二次上界。

**引理**：  
如果$f$是可导函数，而且$\nabla f$满足L-Lipschitz，那么对于任意$x,x’$有
$$
f(x') \leq f(x) + \langle\nabla f(x),x'-x\rangle + \frac{L}{2}\Vert x' - x \Vert _2^2
$$
证明上面的结论：
$$
\begin{aligned} f\left(\boldsymbol{x}^{\prime}\right) &=f\left.\left(\boldsymbol{x}+t\left(\boldsymbol{x}^{\prime}-\boldsymbol{x}\right)\right)\right|_ {t=1} \\ &=f(\boldsymbol{x})+\int_ {t=0}^{1} \frac{d}{d t} f\left(\boldsymbol{x}+t\left(\boldsymbol{x}^{\prime}-\boldsymbol{x}\right)\right) d t \\ &=f(\boldsymbol{x})+\int_ {t=0}^{1}\left\langle\nabla f\left(\boldsymbol{x}+t\left(\boldsymbol{x}^{\prime}-\boldsymbol{x}\right)\right), \boldsymbol{x}^{\prime}-\boldsymbol{x}\right\rangle d t \\ &=f(\boldsymbol{x})+\left\langle\nabla f(\boldsymbol{x}), \boldsymbol{x}^{\prime}-\boldsymbol{x}\right\rangle \\ & \quad+\int_ {t=0}^{1}\left\langle\nabla f\left(\boldsymbol{x}+t\left(\boldsymbol{x}^{\prime}-\boldsymbol{x}\right)\right)-\nabla f(\boldsymbol{x}), \boldsymbol{x}^{\prime}-\boldsymbol{x}\right\rangle d t \\ & \leq f(\boldsymbol{x})+\left\langle\nabla f(\boldsymbol{x}), \boldsymbol{x}^{\prime}-\boldsymbol{x}\right\rangle+\frac{L}{2}\left\|\boldsymbol{x}^{\prime}-\boldsymbol{x}\right\|_ {2}^{2} \end{aligned}
$$
所以我们可以得到：
$$
f\left(\boldsymbol{x}^{\prime}\right) \leq \hat{f}\left(\boldsymbol{x}^{\prime}, \boldsymbol{x}\right) \doteq f(\boldsymbol{x})+\left\langle\nabla f(\boldsymbol{x}), \boldsymbol{x}^{\prime}-\boldsymbol{x}\right\rangle+\frac{L}{2}\left\|\boldsymbol{x}^{\prime}-\boldsymbol{x}\right\|_ {2}^{2}
$$
如果我们想要最小化这个上界，可以得到：
$$
\arg\min _ {x'} \hat f(x',x) = x - \frac{1}{L} \nabla f(x).
$$
这就是一个很简单的梯度下降迭代。而且可以保证，这样的迭代不会增加目标函数的值，因为$\hat f(x,x) = f(x)$：
$$
f\left(\boldsymbol{x}_ {\star}^{\prime}\right) \leq \hat{f}\left(\boldsymbol{x}_ {\star}^{\prime}, \boldsymbol{x}\right) \leq \hat{f}(\boldsymbol{x}, \boldsymbol{x})=f(\boldsymbol{x})
$$
可以证明的是，使用这种迭代方法到最佳值的收敛速度是：
$$
f\left(\boldsymbol{x}_ {k}\right)-f\left(\boldsymbol{x}_ {\star}\right) \leq \frac{L\left\|\boldsymbol{x}_ {0}-\boldsymbol{x}_ {\star}\right\|_ {2}^{2} }{2 k}=O(1 / k)
$$
这个收敛速度会比次梯度要快很多。

#### [](about:blank#From-gradient-to-proximal-gradient "From gradient to proximal gradient")From gradient to proximal gradient

实际上，我们可以从上面的梯度下降算法来获得一点启发，来设计一个算法优化lasso回归这类的问题：
$$
F(x) = f(x) + g(x).
$$
因为原函数是不可导的，因此梯度下降算法不能直接使用。尽管如此，如果目标函数中平滑的那一项$f(x)$的导数$\nabla f$是Lipschitz，我们依然可以构造出一个$F$的简单上界：对平滑项$f$放大到上界，对于不可导项就什么也不做：
$$
\hat{F}\left(\boldsymbol{x}^{\prime}, \boldsymbol{x}\right)=f(\boldsymbol{x})+\left\langle\nabla f(\boldsymbol{x}), \boldsymbol{x}^{\prime}-\boldsymbol{x}\right\rangle+\frac{L}{2}\left\|\boldsymbol{x}^{\prime}-\boldsymbol{x}\right\|_ {2}^{2}+g\left(\boldsymbol{x}^{\prime}\right)
$$
不断地最小化上式，可以得到类似于之前的梯度下降算法，这样的算法比次梯度下降有更好的收敛率。因此，我们要做的就是最小化$\hat F$:
$$
\boldsymbol{x}_ {k+1}=\arg \min _ {\boldsymbol{x} } \hat{F}\left(\boldsymbol{x}, \boldsymbol{x}_ {k}\right)
$$
将$x_k$带入后补充全式，我们可以得到：
$$
\hat{F}\left(\boldsymbol{x}, \boldsymbol{x}_ {k}\right)=\frac{L}{2}\left\|\boldsymbol{x}-\left(\boldsymbol{x}_ {k}-\frac{1}{L} \nabla f\left(\boldsymbol{x}_ {k}\right)\right)\right\|_ {2}^{2}+g(\boldsymbol{x})+h\left(\boldsymbol{x}_ {k}\right)
$$
这里的$h(x_k)$只与$x_k$有关，因此每次迭代就变成了：
$$
\begin{aligned} \boldsymbol{x}_ {k+1} &=\arg \min _ {\boldsymbol{x} } \frac{L}{2}\left\|\boldsymbol{x}-\left(\boldsymbol{x}_ {k}-\frac{1}{L} \nabla f\left(\boldsymbol{x}_ {k}\right)\right)\right\|_ {2}^{2}+g(\boldsymbol{x}) \\ &=\arg \min _ {\boldsymbol{x} } g(\boldsymbol{x})+\frac{L}{2}\left\|\boldsymbol{x}-\boldsymbol{w}_ {k}\right\|_ {2}^{2} \end{aligned}
$$
这里的$\boldsymbol{w}_ {k}=\boldsymbol{x}_ {k}-(1 / L) \nabla f\left(\boldsymbol{x}_ {k}\right)$。也就是，我们希望让$g$尽量小，同时$x$又不要离$w_k$太远。由于二范数是凸函数，因此它总会有一个唯一最优解。

分析到这里，这个式子还是一个$F(x) = f(x) + g(x)$的形式，但是这里的$f(x)$是二次方（quadratic）的。这样形式在凸优化中经常会遇到，它有个特殊的名字——近端（Proximal Operator）：
$$
\operatorname{prox}_ {g}(\boldsymbol{w}) \doteq \arg \min _ {\boldsymbol{x} }\left\{g(\boldsymbol{x})+\frac{1}{2}\|\boldsymbol{x}-\boldsymbol{w}\|_ {2}^{2}\right\}
$$
因此迭代步骤可以写为：
$$
\boldsymbol{x}_ {k+1}=\operatorname{prox}_ {g / L}\left(\boldsymbol{w}_ {k}\right).
$$
比较幸运的是，一般我们遇到的凸函数，他们的近端都是有着固定的形式,或者可以很高效地被计算出来，下面将会举几个例子：

1.  $g(x) = I_D$，指示函数，也就是对于一个凸集$D$,如果$x\in D$，$I_D(x) = 0$，否则$I_D(x) = \infty$。那么: $$\operatorname{prox}_ {g}(\boldsymbol{w})=\arg \min _ {\boldsymbol{x} \in \mathcal{D} }\|\boldsymbol{x}-\boldsymbol{w}\|_ {2}^{2}=\mathcal{P}_ {\mathcal{D} }[\boldsymbol{w}]$$
2.  $g(\boldsymbol{x})=\lambda|\boldsymbol{x}|_ {1}$，$l^1$范数：
    $$
    \operatorname{prox}_ {g}\left(u_ {i}\right)=\operatorname{soft}\left(u_ {i}, \lambda\right) \doteq \operatorname{sign}\left(u_ {i}\right) \max \left(\left|u_ {i}\right|-\lambda, 0\right)$$
3.  $g(\boldsymbol{x})=\lambda|\boldsymbol{X}|_ {*}$，矩阵核范数，那么：
    $$
    \operatorname{prox}_ {g}(\boldsymbol{W})=\mathcal{S}(\boldsymbol{W}, \lambda) \doteq \boldsymbol{U} \operatorname{soft}(\boldsymbol{\Sigma}, \lambda) \boldsymbol{V}^{*}
    $$
    $(\boldsymbol{U}, \boldsymbol{\Sigma}, \boldsymbol{V})$是$\mathbf W$的SVD分解。
    

由以上这些，我们可以得到一个收敛速率为$O(\frac{1}{K})$的Proximal Gradient算法。更正式的定理如下：  
$F(x) = f(x) + g(x)$，其中$f$是一个可导凸函数，并且导数符合Lipschitz，$g$是一个凸函数，考虑下面的迭代方式：
$$
\boldsymbol{w}_ {k} \leftarrow \boldsymbol{x}_ {k}-\frac{1}{L} \nabla f\left(\boldsymbol{x}_ {k}\right), \quad \boldsymbol{x}_ {k+1} \leftarrow \operatorname{prox}_ {g / L}\left(\boldsymbol{w}_ {k}\right).
$$
假设$F(x)$在$x^*$有最小值，那么对于任何$k>1$，都有：
$$
F\left(\boldsymbol{x}_ {k}\right)-F\left(\boldsymbol{x}_ {\star}\right) \leq \frac{L\left\|\boldsymbol{x}_ {0}-\boldsymbol{x}_ {\star}\right\|_ {2}^{2} }{2 k}
$$
因此，我们得到近端梯度下降：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pg1.png)

对于不同的目标函数，因为有着不同的近端形式，它们的近端梯度算法在具体形式上也略微有所不同，因此下面介绍几种针对不同问题的具体的近端梯度下降算法。

1.  **Proximal Gradient for the Lasso**  
    Lasso的$g$是$l^1$范数形式，而它的$L$可以是矩阵$A^TA$的最大特征值，s 可以提前计算得到的。有时候对于Lasso的PGD算法又被称为ISTA(iterative soft-thresholding algorithm)，具体算法流程如下图：  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pg2.png)
2.  **Proximal Gradient for Stable PCP**  
    观察之前不同形式的近端操作，可以看到对核范数$\Vert X\Vert_*$也是有y一个简单的近端形式的。因此我们可以用PGD来解决恢复低秩矩阵的问题，比如稳定主成分追踪（stable principal  
    component pursuit,PCP）: $$\min _ {L, S}\|\boldsymbol{L}\|_ {*}+\lambda\|\boldsymbol{S}\|_ {1}+\frac{\mu}{2}\|\boldsymbol{Y}-\boldsymbol{L}-\boldsymbol{S}\|_ {F}^{2}$$
    上式中有两个不可导项：$$ \|\boldsymbol{L}\|_ {*}+\lambda\|\boldsymbol{S}\|_ {1}$$
    各自都有比较简单的近端形式。我们还需要知道下面的内容，假设$\boldsymbol{x}=\left[\boldsymbol{x}_ {1} ; \boldsymbol{x}_ {2}\right] \text {, } g(\boldsymbol{x})=g_ {1}\left(\boldsymbol{x}_ {1}\right)+g_ {2}\left(\boldsymbol{x}_ {2}\right)$，那么: $$\operatorname{prox}_ {g}(\boldsymbol{w})=\left(\operatorname{prox}_ {g_ {1} }\left(\boldsymbol{w}_ {1}\right), \operatorname{prox}_ {g_ {2} }\left(\boldsymbol{w}_ {2}\right)\right)$$
    对于该问题的具体优化算法如下图：  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pg3.png)

#### [](about:blank#Accelerate-Proximal-Gradient-APG "Accelerate Proximal Gradient(APG)")Accelerate Proximal Gradient(APG)

之前的PG算法可以让收敛速度达到$O(\frac{1}{k})$，但是如果我们需要解决的问题有更特殊的结构，可以生成更高效快速的梯度算法。在1970～1980年这段日子里，有很多俄国的优化理论学者，再思考一个问题：对于优化一个平滑函数$f$，梯度方法是不是一阶方法里最佳的优化方法（这里局限于一阶方法，二阶方法有更快的收敛速度，但是我们也知道，二阶方法需要求海森矩阵，而高维情况下对海森矩阵的求解需要很大的代价）？

为了回答这个问题，首先需要一个计算模型。他们提出一个黑盒模型：模型中，算法会产生一个迭代序列$x_0,….,x_k$。对应于每个迭代，又会有对应的值$f(x_i)$以及梯度$\nabla f(x_i)$。通过这些来产生下一个迭代值，也就是：
$$
\boldsymbol{x}_ {k+1}=\varphi_ {k}\left(\boldsymbol{x}_ {0}, \ldots, \boldsymbol{x}_ {k}, f\left(\boldsymbol{x}_ {0}\right), \ldots, f\left(\boldsymbol{x}_ {k}\right), \nabla f\left(\boldsymbol{x}_ {0}\right), \ldots, \nabla f\left(\boldsymbol{x}_ {k}\right)\right)
$$
从上述模型中，我们可以从最坏的角度来研究。首先，固定一类函数$\mathcal F$，然后观察这个算法在最差的函数下能做到什么样子（这里更像是最好的情况下，sup上界，inf为下界）：
$$
\sup _ {f \in \mathcal{F}, \boldsymbol{x}_ {0} }\left\{f\left(\boldsymbol{x}_ {k}\right)-\inf _ {\boldsymbol{x} } f(\boldsymbol{x})\right\}
$$
对于我们感兴趣的一类函数，也就是可导凸函数并且满足Lipschitz条件:
$$
\mathcal{F}_ {L, r} \doteq\left\{f : \mathfrak{B}(0, r) \rightarrow \mathbb{R} |\left\|\nabla f(\boldsymbol{x})-\nabla f\left(\boldsymbol{x}^{\prime}\right)\right\| \leq L\left\|\boldsymbol{x}-\boldsymbol{x}^{\prime}\right\| \forall \boldsymbol{x}, \boldsymbol{x}^{\prime} \in \mathfrak{B}(0, r)\right\}
$$
仅仅使用梯度下降也就是$O(\frac 1 k)$的收敛速度，我们有：
$$
\sup _ {f \in \mathcal{F}_ {L, r}, \boldsymbol{x}_ {0} }\left\{f\left(\boldsymbol{x}_ {k}\right)-\inf _ {\boldsymbol{x} } f(\boldsymbol{x})\right\} \leq \frac{C L r^{2} }{k}
$$
而对于这类函数，可以证明的最好的下界是：
$$
\sup _ {f \in \mathcal{F}_ {L, r}, x_ {0} }\left\{f\left(\boldsymbol{x}_ {k}\right)-\inf _ {\boldsymbol{x} } f(\boldsymbol{x})\right\} \geq \frac{c L r^{2} }{k^{2} }
$$
可以看到这之间还是有一个gap的。因此更快的收敛速度还是有可能做到的。

首先考虑比较简单的迭代方式，依然使用梯度下降：
$$
x_ {k+1} = x_k - \alpha \nabla f(x_k),
$$
这里的$\alpha$是学习率，对于梯度符合Lipschitz条件的函数，取$\alpha = \frac{1}{L}$是一个很好的选择，而梯度$\nabla f(x_k)$是下降速度最快的方向。但是朝着当前最快的方向走并不一定就是最优的，因为梯度是局部的，因此梯度下降实际上是贪心算法，但是贪心算法不一定是最优的，另外一种保守的做法是参考之前迭代的方向，保留之前迭代的动量（momentum），被称为重量球方法：
$$
\boldsymbol{x}_ {k+1}=\boldsymbol{x}_ {k}-\alpha \nabla f\left(\boldsymbol{x}_ {k}\right)+\beta\left(\boldsymbol{x}_ {k}-\boldsymbol{x}_ {k-1}\right)
$$
重量球方法往往会带来更平滑的迭代策略以及更快的收敛。

1983年，Yuri Nesterov提出了达到收敛速度为$O(\frac{1}{k^2})$的算法。在算法中，他也使用到了动量这个步骤。它引入了一个新的辅助点（auxiliary point）$p_ {k+1}$:
$$
\boldsymbol{p}_ {k+1} \doteq \boldsymbol{x}_ {k}+\beta_ {k}\left(\boldsymbol{x}_ {k}-\boldsymbol{x}_ {k-1}\right)
$$
而每一次迭代步骤就是：
$$
\boldsymbol{x}_ {k+1}=\boldsymbol{p}_ {k+1}-\alpha \nabla f\left(\boldsymbol{p}_ {k+1}\right)
$$
这里$\alpha =\frac{1}{L}$，而$\beta _k$的值要仔细选择，来达到最佳的收敛率：
$$
t_ {k}=\frac{1+\sqrt{1+4 t_ {k-1}^{2} } }{2}, \quad \beta_ {k}=\frac{t_ {k-1}-1}{t_ {k} }
$$
使用这种迭代策略，可以达到$O(\frac{1}{k^2})$的收敛率。

到目前位置，我们说的都是建立在平滑函数上的，而对于有非平滑函数项的目标函数，还需要做别的改进，也就是APG算法。

之前的PG算法，我们可以得到目标函数的一个上界：
$$
\begin{aligned} \hat{F}\left(\boldsymbol{x}, \boldsymbol{x}_ {k}\right) & \doteq f\left(\boldsymbol{x}_ {k}\right)+\left\langle\nabla f\left(\boldsymbol{x}_ {k}\right), \boldsymbol{x}-\boldsymbol{x}_ {k}\right\rangle+\frac{L}{2}\left\|\boldsymbol{x}-\boldsymbol{x}_ {k}\right\|_ {2}^{2}+g(\boldsymbol{x}) \\ & \doteq \frac{L}{2}\left\|\boldsymbol{x}-\boldsymbol{w}_ {k}\right\|_ {2}^{2}+g(\boldsymbol{x})+\text { terms that do not depend on } \boldsymbol{x}, \end{aligned}
$$
每一次迭代，实际上是最小化这个上界。

而对于Nesterov momentum来说，也可以按照类似的方法来得到它对应的迭代策略：
$$
\boldsymbol{x}_ {k+1}=\operatorname{prox}_ {g}\left(\boldsymbol{p}_ {k+1}-\frac{1}{L} \nabla f\left(\boldsymbol{p}_ {k+1}\right)\right).
$$
这样我们就得到了APG算法的迭代策略：  
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pg4.png)

APG算法有$O(\frac{1}{k^2})$的收敛速率，比普通的梯度方法会好很多，更正式的定理为：

序列${x_k}$是通过APG策略对凸函数$F(x) = f(x) + g(x)$进行优化的迭代步骤，而且$f$的梯度是Lipschitz的，如果$F(x)$有最小值对应的$x_*$，那么对于任意的$k>1$:
$$
F\left(\boldsymbol{x}_ {k}\right)-F\left(\boldsymbol{x}_ {\star}\right) \leq \frac{2 L\left\|\boldsymbol{x}_ {0}-\boldsymbol{x}_ {\star}\right\|_ {2}^{2} }{(k+1)^{2} }
$$
1.  APG for Basis Pursuit Denoising  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pg5.png)
    
2.  APG for Stable Principal Component Pursuit  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pg6.png)
    

对于收敛性的证明，这里都不多赘述了。