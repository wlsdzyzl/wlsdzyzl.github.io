---
title: Learning From Data——Info between X and Y/SVD
date: 2018-11-27 14:11:20
tags: [LFD class, machine learning, SVD, mathematics,ACE]
categories: 数据学习课程
mathjax: true
---
上一周的数据学习，没有课件，老师直接开始从头推了一些神奇的东西出来。所以我也很难给这篇的内容起一个题目，因为是从Ｘ与Ｙ之间的信息推导到SVD的，因此就这么叫吧。
<!--more-->
## info shared Between X, Y ##
假如现在有两个离散变量，Ｘ与Ｙ他们是一一对应的。在之前的机器学习问题中，我们知道Ｘ是输入数据，Ｙ是标签。现在忘掉之前的学习算法，从信息的角度来看，我们希望做的，是提取Ｘ与Ｙ之间的公共信息，而这部分才是它们有某种关系的真正原因。因此现在我们的目标变成，从Ｘ与Ｙ的联合分布提取Ｘ与Ｙ之前的公共信息，。

那么首先遇到的问题：我们是如何提取Ｘ和Ｙ的各自的信息的？我们的做法是利用一个函数，就像linear regression等学习算法一样，也就是：
$$
 X \rightarrow f(X) \rightarrow \mathbb{R}\\
 Y \rightarrow g(Y) \rightarrow \mathbb{R}\\
$$

衡量它们之间的共同信息，我们使用一个比较熟悉的名词：相关系数。我们要做的就是找到合适的$f,g$函数，让它们的共同信息最大，也就是相关系数达到最大（HGR Maximal Correlation）：
$$
\max \rho_ {XY} = \max \mathbb{E}_ {p_ {XY} } [f(x)g(y) ] 
$$

当然我们还有一些限制条件，才能让相关系数为上值。在概率论中我们知道，相关系数的求法：
$$
\begin{aligned}
\rho_ {XY} &= \frac{Cov(X,Y)}{\sqrt{Var (X) Var (Y)} }\\
&= \frac{\mathbb{E}[XY ] - \mathbb{E}[X ] \mathbb{E}[Y ]}{ \sqrt{\mathbb{E}[X^2 ] - \mathbb{E}^2[X ]} }
\end{aligned}
$$

所以可以看到的是，我们应该让
$$
\mathbb{E}[f(x) ] = \mathbb{E}[g(x) ] = 0,\\
\mathbb{E}[f^2(x) ] = \mathbb{E}[g^2(x) ] = 1
$$

这时候，$0\leq\rho_ {XY}\leq 1$.当$\rho_ {XY} = 0$时，说明二者独立（要注意，这并不意味着E(XY) = 0说明Ｘ，Ｙ独立，实际上相关系数为0才能证明二者独立，只不过我们这里加上了限制，使得$\rho_ {XY} = \mathbb{E}[f(x)g(x) ]$）。

现在，用数学语言来描述这个问题：
$$
\begin{align}
\max \mathbb{E}_ {p_ {XY} } [f(x)g(y) ]& = \sum_ {x,y}p_ {XY}(x,y)f(x)g(y)\\
s.t. &\sum_ {x}p_X(x)f(x) = \sum_y p_Y(y)g(y) = 0\\ 
& \sum_ {x}p_X(x)f^2(x) = \sum_y p_Y(y)g^2(y) = 1
\end{align}
$$

为了方便后面的计算，我们要对原式进行一些转换：
$$
\begin{aligned}
(1)&= \sum_ {x,y} \frac{p_ {XY}(x,y)}{\sqrt{p_X(x)p_Y(y)} } [\underbrace{\sqrt{p_X(x)}\cdot f(x)}_ {\phi(x)} \underbrace{\sqrt{p_Y(y)}\cdot g(y)}_ {\psi(y)}]\\
&= \sum_ {x,y}  \frac{p_ {XY}(x,y)}{\sqrt{p_X(x)p_Y(y)} } \phi(x) \psi(y) = \Psi^TB\Phi 
\end{aligned}
$$

上式中：
$$
\Phi = \begin{bmatrix}
\phi(x_1),\phi(x_2),...,\phi(x_ {|X|})
\end{bmatrix}^T_ {|X|\times 1},\\
\Psi = \begin{bmatrix}
\psi(y_1),\psi(y_2),...,\psi(y_ {|Y|})
\end{bmatrix}^T_ {|Y|\times 1},\\
B_ {y,x} =  \frac{p_ {XY}(x,y)}{\sqrt{p_X(x)p_Y(y)} },B_ {|Y| \times |X|}.
$$

经过上面的转换，我们可以得到：
$$
\begin{aligned}
(2): &\sum_ {x} \sqrt{p_X{x} } \phi(x) = 0 \rightarrow \sqrt{P_X}^T \Phi = 0;\\
&\sum_ {y} \sqrt{p_Y{y} } \psi(y) = 0 \rightarrow \sqrt{P_Y}^T \Psi = 0;
\end{aligned}
$$
$$
(3): \Vert \Phi \Vert^2 = \Vert \Psi \Vert ^2 = 1
$$

这时候我们的问题变成了：
$$
\begin{aligned}
\max \Psi^T B \Phi,s.t. &\langle\sqrt{P_X},\Phi\rangle = \langle\sqrt{P_Y},\Psi\rangle = 0;\\
&\Vert \Phi \Vert^2 = \Vert \Psi \Vert^2 = 1.
\end{aligned}
$$

而实际上，上面问题的解正是Ｂ矩阵的最大的奇异向量。
## SVD ##
接下来，想提一下，什么是奇异值分解(Singular Value Decomposition)：
$$
B = [u　][\Sigma][　v^T],
$$

其中$u,v$的列向量为Ｂ的左右奇异向量。

而实际上，$\sqrt{P_X},\sqrt{P_Y}$正是Ｂ矩阵对应的最大的奇异向量。但是显然，我们是不能让它们作为$\Phi,\Psi$的值的，因为这个不满足约束(2):
$$
\langle\sqrt{P_X},\Phi\rangle = \langle\sqrt{P_X},\sqrt{P_X}\rangle = 1 \ne 0;\\
\langle\sqrt{P_Y},\Psi\rangle = \langle\sqrt{P_Y},\sqrt{P_Y}\rangle =1 \ne 0.
$$

不过，好的消息是，实际上$\Phi,\Psi$正是第二大的奇异向量。可以看出来，不同奇异向量是互相正交的，这个和上次说的PCA非常像。实际上，PCA和SVD是有千丝万缕的关系的。

从上面的分析，我们可以直接得到：
$$
f(x) = \frac{1}{\sqrt{p_X(x)} } \phi^*(x);\\
g(y) = \frac{1}{\sqrt{p_Y(y)} } \psi^*(y)
$$

那么接下来一个问题，如何直接从data中计算出来f,g？

想要解决上面的问题，首先考虑，如何计算Ｂ的奇异向量。有人说，matlab, openCV. 这里介绍一个简单的算法：Power Iteration.

首先，我们要知道的是，实际上求奇异值分解，也就是在做PCA(求特征向量和特征值)：
$$
B^TB = v \Sigma^T u^T u \Sigma v^T = v \Sigma^2 v^T,\\
BB^T = u \Sigma v^T v \Sigma^T u^T =  u \Sigma^2 u^T
$$

这里提下特征向量分解(EVD)：$X = v D v^T $, 其中$v$为$X$的特征向量组成的矩阵，而$D$为对角矩阵，对角元素为$X$的特征值，$X$为实对称矩阵。

所以可以不难得到，Ｂ的奇异向量，也就是$B^TB$与$BB^T$的特征向量，分别对应右侧的和左侧的奇异向量。

因此我们的问题变成了，如何求eigen vector？

### Power Iteration ###

给定一个实对称矩阵Ｍ，假设$M = U \Sigma U^T$, 则假设它的特征向量为$\upsilon_1,\upsilon_2,...,\upsilon_n$，对应的特征值$\lambda_1,...,\lambda_n $.

1. 初始化得到一个向量$\mu_0$，则$\mu_0 = \alpha_1 \upsilon_1+...+\alpha_n \upsilon_n$.
2. $\mu_1 = \frac{M\mu_0}{\Vert M\mu_0 \Vert}$
3. 迭代执行３，得到$\mu_n$

最后这个算法收敛于最大的特征向量（前提是最大的特征值严格大于其他的特征值，并且初始向量在最大特征向量的方向上分量不为0，这两个条件都比较好满足）。

这个算法不难理解：
$$
\begin{aligned}
\mu_k &=\frac{M \mu_ {k-1} }{\Vert M \mu_ {k-1} \Vert} \\
&= \frac{M \frac{M\mu_ {k-2} }{\Vert M \mu_ {k-2}\Vert} }{ \Vert M \frac{M\mu_ {k-2} }{\Vert M \mu_ {k-2}\Vert}  \Vert  }\\
&= \frac{M^2 \mu_ {k-2} } {\Vert M^2 \mu_ {k-2} \Vert}\\
&= \frac{M^k \mu_0}{\Vert  M^k \mu_0\Vert}  \\
&= \frac{M^k (\alpha_1 \upsilon_1+...+\alpha_n \upsilon_n)}{\Vert  M^k \mu_0\Vert}\\
&= \frac{\alpha_1 \lambda_1^k \upsilon_1+...+\alpha_n \lambda_n^k \upsilon_n}{\Vert  M^k \mu_0\Vert}\\
&= \frac{\alpha_1 \lambda_1^k (\upsilon_1+\frac{\alpha_2}{\alpha_1}\cdot \frac{\lambda_2^k}{\lambda_1^k} \upsilon_2+...+ \frac{\alpha_n}{\alpha_1}\cdot \frac{\lambda_n^k}{\lambda_1^k} \upsilon_n  )}{\Vert  M^k \mu_0\Vert}
\end{aligned}
$$

上式中$k \rightarrow \infty ,\frac{\lambda_i^k}{\lambda_1^k} \rightarrow 0,i\ne 1$，所以可以得到：
$$
M^k \mu_0 \rightarrow \alpha_1 \lambda_1^k \upsilon_1.
$$ 
所以：
$$
\begin{aligned}
\mu_k &= \frac{M^k \mu_0}{\Vert  M^k \mu_0\Vert} \\
&\rightarrow  \frac{\alpha_1 \lambda_1^k \upsilon_1}{\Vert\alpha_1 \lambda_1^k \upsilon_1 \Vert}\\
&= \frac{ \alpha_1 \lambda_1^k \upsilon_1}{\Vert \alpha_1 \lambda_1^k \Vert} \\
&= \upsilon_1
\end{aligned}
$$

上面通过power iteration,　我们就得到了最大的特征向量。使用Gram Schmidt procedure，可以求得其他的特征向量。比较容易理解，找到一个已求向量垂直的向量进行Power Iteration，就可以求得第二大特征向量，特征向量从大到小依次被求出。

现在我们考虑，如何得到Ｂ矩阵的第二大奇异向量。

1. 选择$\Phi^{(0)}$
2. $\Psi^{(0)} = B\Phi^{(0)}$, $\Phi^{(1)} = B^T \Psi^{(0)}$
3. 迭代第二步

实际上第二步做的就是:
$$\Phi^{(1)} = B^TB \Phi^{(0)}, \Psi^{(1)} = BB^T \Psi^{(0)}$$
也就是一直在利用Power Iteration迭代求解$B^TB$与$BB^T$的特征向量.

但是这个如果对初始的值不加以限制，求得的应该是第一大特征向量。如果$\Phi^{(0)} \perp \sqrt{P_X}$，则我们得到了第二大特征向量。

那么如何直接从数据求得f,g呢？终于到了终极问题。

上面有这么一个计算:$B\Phi$，实际上拆开的话，每一行就是ｙ固定之后的$p(x,y)$与$\Phi$相乘，我们记做$B \Phi (y)$:

$$
\begin{aligned}
B \Phi(y) &= \sum_ {x} B(y,x)\phi(x)\\
&= \sum_x \frac{p_ {XY}(x,y)}{\sqrt{p_X(x)p_Y(y)} } \cdot [\sqrt{p_X(x) f(x)}]\\
&=\frac{1}{\sqrt{p_Y{y} } } \sum_x p_ {XY}(x,y)f(x)\\
&= \sqrt{p_Y(y)} \sum_x \frac{p_ {XY}(x,y)}{p_ {Y}(y)}f(x)\\
&= \sqrt{p_Y(y)} \mathbb{E}[f(x)\vert Y = y] 
\end{aligned}
$$

从上面的推导中，我们得到：$g(y) = \mathbb{E}[f(X)\vert Y=y ]$.

所以从原来的$ \Psi^{(0)} = B\Phi^{(0)} \rightarrow g^{(0)} = \mathbb{E}[f^{(1)}(x) \vert Y=y]$

## ACE算法 ##

1. 选择$$f^{(0)}(x), s.t. \mathbb{E}[f^{(0)}(X) ] = 0$$(注意，这里$$ \mathbb{E}[f^{(0)}(X) ] = P_Xf_X(X) = \sqrt{P_X} \sqrt{P_X}f_X(X) = \sqrt{P_X}\Phi  = 0$$，也就暗含了$\Phi\perp \sqrt{P_X}$)
2. * $g^{(0)}(y) = \mathbb{E}[f^{(0)}(x)\vert Y=y]$
   * $f^{(1)}(x) = \mathbb{E}[g^{(0)}(y)\vert X = x]$
3. 迭代２

最后ｆ，ｇ都会收敛到最佳的结果。

这个算法被称为ACE（Alternative Conditional Expectation）算法，当然在实际过程中，我们可以每一步都进行normalize. 而第二步中，条件的ｘ和ｙ的值，有时候是随机选择，在数据量小的时候可以对所有的ｘ和ｙ都进行计算。

还有一点，如何计算$\mathbb{E}[f^{(i)}(x) \vert Y=y]$?

其实很简单：首先从$\{(x_1,y_1),...,(x_n,y_n)\}$中提取出来$\{(x_1,y_1),...,(x_k,y_k)\}$,使得$y_1 = ... = y_k = y$,然后：
$$
\mathbb{E} = \frac{1}{k}\sum_ {i=1}^kf^{(i)}(x_k)
$$
