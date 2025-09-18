---
title: Learning From Data——Hypothesis Testing
date: 2018-12-11 20:01:16
tags: [LFD class, statistical learning, hypothesis testing, information theory]
mathjax: true
categories: 数据学习课程
---
上周讲的内容，和之前一样，从无到有推出来一堆东西。老师在白板上写Statistical Learning, Hypothesis Testing，当然是有关系的，但是这届课讲得内容应该只是上述二者的一小部分。比较神奇的是，最后竟然推到了VC Divergence。Amazing!
<!--more-->
## Binary Hypothesis Testing ##

假设$Y = \{0,1\}$，数据是以$P(X|Y=0)$或者$P(X|Y=1)$生成（iid）出来。

定义下面的表示：
$$P_X(X) = P(X|Y=0),Q_X(X) = P(X|Y=1)$$

我们观察的是一个数据序列$X=\{x_1,x_2,...,x_n\} \in X^n$，长度为n的序列，判断它是以哪个hypothesis生成的($H_0$或者$H_1$).其中：
$$
H_0: X~iid,P_X(X) = P(X|Y=0),P_0 = P(Y=0);\\
H_1: X~iid,Q_X(X) = P(X|Y=1),P_1 = P(Y=1).
$$
上式中，$P_０,P_1$为先验分布([Prior Distribution](https://en.wikipedia.org/wiki/Prior_probability))。

要做到这件事，我们需要做的就是最小化做出错误决定（decision error probability）的概率。

如何做出决定其实不难理解，由下面的式子：
$$
P[H_0|(x_1,...,x_n)]  > P[H_1|(x_1,...,x_n)] \rightarrow H_0;\\
P[H_0|(x_1,...,x_n)]  < P[H_1|(x_1,...,x_n)] \rightarrow H_1.\\
$$
不过这个想要从数据中计算出这个值并不容易，而想要计算出$P[(x_1,...,x_n)|H_0]$是很容易的。还好我们有贝叶斯公式（Bayes's Rule）:
$$
P[H_0|(x_1,...,x_n)] = \frac{P_X(x_1)...P_X(x_n)P_0}{P(x_1,...,x_n)}
$$
同理我们可以得到：
$$
P[H_1|(x_1,...,x_n)] = \frac{Q_X(x_1)...Q_X(x_n)P_1}{P(x_1,...,x_n)}
$$

根据这个来决定哪个Hypothesis，称为MAP Decision Rule。最后我们整理一下得到：
$$
\frac{P_X(x_1)}{Q_X(x_1)}...\frac{P_X(x_n)}{Q_X(x_n)} > \frac{P_1}{P_0} \rightarrow H_0;\\
\frac{P_X(x_1)}{Q_X(x_1)}...\frac{P_X(x_n)}{Q_X(x_n)} < \frac{P_1}{P_0} \rightarrow H_1.
$$
为了简化，我把上面两行写成一行，大于或者小于写成$?$.

学习机器学习到现在，对于上面的式子第一个反应当然是加$\log$，得到log-likelihood function：
$$
\sum_ {i=1}^n \log \frac{P_X(x_i)}{Q_X(x_i)} ? \log \frac{P_1}{P_0}
$$

这时候我们得到一个minimal [sufficient statistic](https://en.wikipedia.org/wiki/Sufficient_statistic).

所以在已知$P_X(X),Q_X(X),P_0,P_1$的情况下，这个问题是很好解决的。

## M-Hypothesis Testing ##
我们将上面的２元情况拓展到$M$元，实际上这个结果并没有什么改变。

现在假设$Y = \{1,...,M\}$，我们有下面的Hypothesis:

Hypothesis|x|$P_ {X\vert Y}(X\vert Y=?)$|$P(Y=?)$
:--:|:--:|:--:|:--:
$H_1$ | $x\tilde{} iid$|  $P_1(X)$|$ P_1$
$\vdots$|$\vdots$|$\vdots$|$\vdots$
$H_M$ | $x\tilde{} iid$|  $P_M(X)$|$ P_M$

计算$P[H_i|(x_1,...,x_n)]$，而实际上：
$$
P[H_i|(x_1,...,x_n)] = \frac{P_i(x_i)...P_i(x_n)P(Y=i)}{P(x_1...x_n)}
$$

接下来的步骤和之前一样，注意在做决定的时候选择的策略一样有OVA,OVO两种。上面介绍的这种算是OVA。

## Error Probability Of Optimal Decision ##
就二元的情况来说，发生的错误可能有两种：
* Type 1: $H_0$是对的，选择了$H_1$
* Type 2: $H_1$是对的，选择了$H_0$

这两种不同类型的错误在不同的场景下有不同的名字。

为什么会选错？实际上选错是因为，它是由$H_0$生成的，但是它却更像$H_1$生成的，也就是经验分布是$Q_x(X)$，而实际分布是$P_X(X)$。因此出现错误Type 1的概率为：
$$
P(\text{empirical distribution of }(x_1,...,x_n)\text{ is }Q_x|{x_1,...,x_n}\tilde~P_x)
$$

如何计算上面的概率？我们考虑的是当$n$非常大的时候比较理想的情况。这时候，如果Hypothesis 1是正确的，假如$X$有ｋ个取值分布为1到k，定义$q_i = Q_X(i)$，则序列中出现i的个数的期望值为$nq_i$，而Hypothesis 2滋生出这样序列的概率为：
$$
P = \prod_ {i=1}^kP_x^{nq_i}(i) = e^{\sum_ {i=1}^k nq_i \log P_x(i)} 
$$

一共又有多少种这样可能的序列？答案是：
$$
\begin{align}
C_n^{nq_1}C_ {n-nq_1}^{nq_2}...C_ {n-nq_1-...-nq_ {k-1} }^{nq_k}
&= \frac{n!}{(nq_1)!...(nq_k)!}\\
&\approx \underbrace{\frac{\sqrt{2\pi n} }{\prod_ {i=1}^k \sqrt{2\pi n q_i} } }_ {\alpha}\cdot \underbrace{\frac{n^n}{(nq_1)^{nq_1}...(nq_k)^{nq_k} } }_ {\beta}
\end{align}
$$

从(1)到(2)，是使用了[Stirling's Formula](https://en.wikipedia.org/wiki/Stirling%27s_approximation):
$$
n! \approx \sqrt{2\pi n} (\frac{n}{e})^n.
$$

在(2)中，由于$\alpha$与$\beta$相比之下几乎是可以忽略的，因此我们专注于后者：
$$
\begin{aligned}
\beta &= \frac{n^n}{(nq_1)^{nq_1}...(nq_k)^{nq_k} }\\
&= \frac{1}{q_1^{nq_1}...q_k^{nq_k} }\\
&= \exp(-\sum_ {i=1}^k nq_i\log q_i)\\
&= e^{nH(Q)}
\end{aligned}
$$

非常神奇，一个熵出现了。

因此我们可以得到：
$$
\begin{aligned}
&P(\text{empirical distribution of }(x_1,...,x_n)\text{ is }Q_x|{x_1,...,x_n}\tilde~P_x)\\
&= \beta \times P\\
&= \exp(-\sum_ {i=1}^k nq_i\log q_i) \cdot \exp(\sum_ {i=1}^k nq_i \log P_x(i))\\
&= \exp(-n\sum_ {i=1}^k q_i\log q_i + n\sum_ {i=1}^k q_i \log P_x(i))\\
&= \exp(-n\sum_ {i=1}^k q_i\log \frac{q_i}{P_x(i)})\\
&= \exp(-n D(Q_x\Vert P_x))
\end{aligned}
$$

KL-Divergence出现了！这个就是Chernoff Stein Lemma:
给定错误2$\leq \alpha$，则错误1~$ \exp(-n D(Q_x\Vert P_x))$. 实际的数学推导是非常复杂的，这里只是大概给个直观的解释。详细请参考：
[Chernoff-Stein Lemma](https://www.icg.isy.liu.se/courses/infotheory/lect7-3.pdf)

这更像是一节信息论的课。