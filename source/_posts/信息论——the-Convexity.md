---
title: 信息论——the Convexity
date: 2018-10-31 18:03:07
tags: [information theory]
mathjax: true
categories: 信息论
---
这篇博客来介绍熵，互信息，鉴别信息的凸性，与优化有着重要的关系。<!--more-->

## 凸集(Convex Set) ##

凸集：在欧氏空间中，凸集是对于集合内的每一对点，连接该对点的直线段上的每个点也在该集合内的集合。

凸集有：实数，概率矢量集合等。整数，有理数等不是凸集。

想要研究凸函数，首先凸函数一定要定义在凸集上。而概率矢量集合为凸集，是一个好消息。

凸函数有个坑。就是中国教材总是叫凸函数和凹函数，但是实际上中国的凸函数，是有最大值的函数，而非国外的convex function（最小值）。另外一种比较好的叫法是上凸和下凸，这个就容易区分了，上凸函数有最小值，下图函数有最大值。

严格的数学定义：
* 定义在凸集D上的函数f(x)如果满足$f(\lambda \alpha + (1-\lambda)\beta) \leq \lambda f(\alpha) + (1-\lambda) f(\beta)$,则为下凸函数。

![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/ConvexFunction.svg/768px-ConvexFunction.svg.png)

* 定义在凸集D上的函数f(x)如果满足$f(\lambda \alpha + (1-\lambda)\beta) \geq \lambda f(\alpha) + (1-\lambda) f(\beta)$,则为上凸函数。

## Jenson不等式 ##

如果f是下凸函数，且X是离散随机变量，则$Ef(X)\geq f(EX)$,并且如果f是严格下凸函数，则上式中等号说明X为常数，及X与EX以概率1相等。（其中E为平均取值）。

由Jenson不等式可以推出**对数求和不等式**：
对于非负实数$a_1,a_2,...,a_n;b_1,b_2,...,b_n$有
$$
\sum _ {i=1}^n a_i \log \frac{a_i}{b_i} \geq \left(\sum_ {i=1}^na_i \right) \log \frac{\sum _ {i=1}^n a_i}{\sum _ {i=1}^n b_i}
$$

这个式子的证明如下：

首先，当$t>0$时，$t \log t$为一个严格下凸函数.可自行用导数证明。
由Jenson不等式可以得到：
$$
 Et \log Et \leq \ E(t \log t)\\
i.e. \sum \alpha_i f(t_i) \geq  f(\sum \alpha _i t_i)\\
$$
令$\alpha _i = \frac {b_i}{B},t_i=\frac {a_i}{b_i}, B = \sum_ {b_i}$，代入上式可以得到：
$$
 \sum \frac{b_i}{B}\frac{a_i}{b_i} \log (\frac{a_i}{b_i}) \geq(\sum \frac{b_i}{B}\frac{a_i}{b_i}) \log(\sum \frac{b_i}{B}\frac{a_i}{b_i})\\
 \sum \frac{a_i}{B} \log (\frac{a_i}{b_i}) \geq (\sum \frac{a_i}{B}) \log{\sum \frac {a_i}{B} }\\
 \sum a_i \log {\frac {a_i}{b_i} } \geq (\sum a_i) \log {\frac {\sum a_i}{\sum b_i} }
$$

在这里要学会如何构造去证明这个不等式。

## 凸性 ##
### 鉴别信息的凸性 ###

$D(p\Vert q)$是$(p,q)$的下凸函数。即若存在$(p_1,q_1)$和$(p_2,q_2)$,则$\lambda D(p_1\Vert q_1) + (1 - \lambda) D(p_2\Vert q_2) \geq D(\lambda p_1 + (1-\lambda)p_2 \Vert \lambda q_1+(1 - \lambda)q_2)$对所有的$0\leq \lambda \1$成立。

证明如下：
$$
\begin{align}
D(\lambda p_1 + (1-\lambda)p_2 \Vert \lambda q_1+(1 - \lambda)q_2)&=\sum_ {x \in \mathcal{X} } \left [ \lambda p_1(x)+ \overline {\lambda} p_2(x) \right] \log \frac{\lambda p_1(x)+ \overline {\lambda} p_2(x)}{\lambda q_1(x)+ \overline {\lambda} q_2(x)}\\
& \leq \sum_ {x \in \mathcal{X} } \lambda p_1(x) \log {\frac{p_1(x)}{q_1(x)} } +  \overline {\lambda} p_2(x) \log \frac{p_2}{q_2}\\
&= \sum_ {x \in \mathcal{X} } \lambda D(p_1 \Vert q_1) + \overline {\lambda} D(p_2 \Vert q_2)
\end{align}
$$

可以看到上式的证明利用到了之前的对数求和不等式。

### 熵的凸性 ###

知道了鉴别信息的下凸性质，证明熵的凸性就非常容易。

$H(X) = \log |X| - D(p\Vert u)$

上式中，u不变，是均匀分布的情况，这时候D是一个下凸函数，而很明显$\log |X|$不变，因此$H(X)$是一个上凸函数。其实大家也很容易理解。因为均匀分布式的熵最大，也就是有最大值。

### 互信息的凸性 ###

下面来证明互信息的凸性。

互信息定义为下：
$$
I(X;Y) = I(p;Q) =  \sum_ {x \in \mathcal{X} } \sum_ {y \in \mathcal{Y} } p(x)q(y|x)\log \frac{q(y|x)}{\sum _ {x \in \mathcal{X} }p(x)q(y|x)}
$$

这样的写法，对于信道传输的模型更有帮助。

首先如果给定Q，这意味着给定了信道：

Fix Q =[g(y|x)]
$$
\begin{align}
I(X;Y) &= H(Y) - H(Y|X)\\
&= H(Y) - \sum_ {x \in \mathcal{X} } p(x)H(Y|X=x)\\
&= H(Y) - \sum_ {x \in \mathcal{X} } p(x) \sum_ {y in \mathcal{Y} } q(y|x) \log \frac{q(y|x)}
\end{align}
$$

上式中既然Q已经给定，因此H(Y|X)也就是p(x)线性组合。因此整个函数为上凸减去线性，依然为上凸函数。

如果给定p：

Fix p(x):

$$
\begin{align}
I(X;Y) = D(p(x,y)\Vert p(x)(y))\\
p(x,y) = p(x)q(y|x)\\
p(y) = \sum_ {x \in \mathcal{X} } p(x)q(y|x)
\end{align}
$$
因此p(x,y),p(y),p(x)p(y)都是q(y|x)的线性组合。而D本身是下凸函数。所以互信息固定p(x)时候为下凸函数。可用于有失真编码。