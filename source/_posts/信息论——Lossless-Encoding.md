---
title: 信息论——Lossless Encoding
date: 2018-11-02 14:11:05
tags: [information theory,lossless encoding]
categories: 信息论
mathjax: true
---
信息论算是应用数学，因此我们希望用熵，互信息这些东西来解决一些实际的问题。首先介绍下无失真编码定理，它早已经被广泛用在我们生活当中了。
<!--more-->

首先，说到无失真编码，我们首先想到的是无损压缩了。无损压缩实际上是一个最大熵的问题。这样的情况下，能包含最多的信息，如果信息量一定，也就是最大熵的情况下需要平均较小的比特数（比如一个均匀分布随机变量X的熵为3,另一个非均匀分布随机变量熵Y也为3，那么|Y|>|X|,如果普通编码的话，Y的编码更长，但是它们包含的信息量却是一样的）。我们都知道的是，在均匀分布的时候熵是最大的。但是我们不能选择信源的分布，因为信源就在那里已经确定了。我们能否通过一个映射，一一对应的映射，使得一个非等概分布逐渐走向等概呢？答案是，可以，但是这太反直觉了。是啊虽然反直觉，但是它不反数学，所以它就是对的。

## 渐进等同分割性质（Asymptotic Equipartition Property） ##

### 大数定律（Law of Large Number） ###

这里先伯奴利大数定律(属于弱大数定律)。实际上所有的大数定律都在说一件事：当实验次数非常大的时候，频率趋向于概率（经验分布逼近于统计分布）。

$$
\frac{S_n}{n} \underrightarrow{p} p
$$

更精确一点的说法：

$$
\forall N, \exists \epsilon >0,\sigma>0, \text{where }n > N,p(\vert \frac{s_n}{n} - p\vert \geq \epsilon) <\sigma.
$$
另外一个大数定理（辛钦大数定律）：
$$
\begin{align}
\frac 1 n \sum_ {i=1}^n X_i\underrightarrow{p} EX
\end{align}
$$
渐进等同分割性质定义如下：

如果$X_1,X_2,...$是独立同分布的离散随机变量，分布服从$p(x)$,则

$-\frac 1 n \log p(X_1,X_2,...,X_n) \underrightarrow{p} H(X)$

使用上面的更准确的写法如下：

$$
\forall N, \exists \epsilon>0, \sigma >0, \text{where }n > N,p(\vert - \frac 1 n \log p(X_1,X_2,...,X_n) - H(X)\vert \geq \epsilon) <\sigma.
$$

即$p(X_1,X_2,...,X_n)\approx 2^{-nH(X)}$.

这个定理可以使用弱大数定理地证明：

$$
\begin{aligned}
&-\frac 1 n \log p(X_1,X_2,...,X_n)\\
& = -\frac 1 n \log p(X_1)p(X_2)...p(X_n)\\
&=-\frac 1 n \sum_ {i=1}^n \log p(X_i)
\end{aligned}
$$

因为我们知道，$X_1,X_2,...,X_n$是互相独立的，因此，$\log X_1,\log X_2,...,\log X_n$也是互相独立同分布的。利用(1)：
$$
\begin{aligned}
-\frac 1 n \sum_ {i=1}^n \log p(X_i) &= -E(\log p(X))\\ 
&= \sum_ {x \in \mathcal{X} } (-p(x)\log p(x)) \\
&= H(X)
\end{aligned}
$$

这意味着，当n很大的时候，一个序列出现的概率是几乎相等的，这个概率为$2^{-nH(X)}$.

## （弱）典型序列（Typical Sequence） ##

典型序列定义如下：
相对于分布$p(x)$和序列$(x_1,x_2,...,x_n) \in X_n$,典型序列集合$A_\epsilon ^ {(n)}$定义为满足下列不等式约束的所有序列$\mathbf{x}$的集合：
$$
2^{-n(H(X)+\epsilon) \leq p(\mathbf{x}) = p(x_1,x_2,...,x_n) \leq 2^{-n(H(X)-\epsilon)} }
$$

所以典型序列具有以下性质：
1. 若$\mathbf{x} \in A_\epsilon ^ {(n)}$,则$H(X)-\epsilon \leq -\frac 1 n \log p(\mathbf{x}) \leq H(X) + \epsilon$.
2. 若$n$足够大，$Pr(A_\epsilon ^{(n)}) \geq 1 - \epsilon $
3. $\vert A_\epsilon ^{(n)}\vert \leq 2^{n(H(X)+\epsilon)}$
4. $\vert A_\epsilon ^{(n)}\vert \geq (1-\epsilon)2^{n(H(X)-\epsilon)}$

性质1,2可以用定义得到。因此这里证明3和4.

3.
$$
\begin{aligned}
1 &= \sum_ {x^n \in \mathcal{X} }P(x^n)\\
&\geq \sum_ {x^n \in A_\epsilon ^{(n)} } p(x^n)\\
&\geq \sum_ {x^n \in A_\epsilon ^{(n)} } 2^{-n(H(x)+\epsilon)}\\
&= 2^{-n(H(x)+\epsilon)}\vert A_\epsilon ^{(n)} \vert
\end{aligned}
$$


4的证明首先要使用性质2。
$$
\begin{aligned}
1 - \epsilon &\leq Pr\{A_\epsilon ^{(n)} \}\\
&\leq \sum_ {x^n \in A_\epsilon ^{(n)} } 2 ^{-n(H(X) - \epsilon)}\\
&= 2 ^{-n(H(X) - \epsilon)} \vert A_\epsilon ^{(n)}\vert 
\end{aligned}
$$

所有可能出现的序列一共有$|X|^n$种，大多数情况下，$ 2^{m(H(X)+\epsilon)} << |X|^n$.所以典型序列集合只是所有可能集合的一个很小（尤其是原来分布远离均匀分布的时候）的子集。但是它几乎一定会出现，而且每个典型序列出现的概率几乎一样。这是很好的消息，为我们刚开始提出来的映射提供了很好的思路。

## 定长编码定理(香农第一定理) ##

假设$X^n$是由独立同分布离散随机变量$X\tilde{}p(X)$构成的序列。对于任意正数$\epsilon$，总有足够大的n，可以找到一个一一映射，将$X^n$映射到二进制序列，且满足:
$$
E\left[\frac 1 n l(X^n) \right] \leq H(X)+\epsilon
$$

上式中，$l(X^n)$表示的是编码需要的bit数。

接下来提供证明：

$$
\begin{aligned}
E(l(X^n)) &= \sum_ {x \in \mathcal{X} } p(x) l(x)\\
&= \sum_ {x \in A_\epsilon ^{(n)} } p(x) l(x) + \sum_ {x \in \overline{A_\epsilon ^{(n)} } } p(x) l(x)\\
& \leq \sum_ {x \in A_\epsilon ^{(n)} } p(x) [ n(H(X)+\epsilon)+1+1 ] + \sum_ {x \in \overline{A_\epsilon ^{(n)} } } p(x) [ n\log \vert X\vert +2 ]\\
&=[ n(H(X)+\epsilon)+1+1 ] Pr\{ A_\epsilon ^{(n)} \} +  [ n\log \vert X\vert +2] Pr\{\overline{A_\epsilon ^{(n)} } \} \\
&\leq n(H(X)+\epsilon)+2 +  n\epsilon \log\vert X\vert+2\epsilon
= n(H(X) + \epsilon ')
\end{aligned}
$$
其中 $\epsilon' = \epsilon + \epsilon \log \vert X \vert +\frac 2 n + \frac {2\epsilon}{n}$,可以看到的是$n \rightarrow \infty,\epsilon' \rightarrow 0$.

上面证明过程中值得注意的事情是，为什么要加2？第一个加一是为了处理log后为非整数的情况，第二个+1是留一个比特位置来区分典型序列与非典型序列的编码。

但是，定长编码定理是无法应用到工业界的。因为它需要对序列长度为n来进行编码，由于精确度的要求，这个n往往很大（上亿），这在现实中是无法实现的。

顺便我们证明一下，平均每个字符编码所需要的bit数一定是大于等于$H(X)$.

假设$X^n \rightarrow M \in C = \underbrace{ \{1,2,3,...,2^{nR} \} }_ {need ~nR~ bits} \rightarrow \hat{X}^n$.

意思就是，M为X^n编码后的结果，它一定是属于后面的某个数字。

如果我们想要$P_e = 0$,也就是无失真编码，那么根据Fano不等式：
$$
H(X^n|M) = 0
$$

因此：
$$
\begin{aligned}
nH(X) &= H(X^n)...(Why?)\\
&=H(X^n) - H(X^n|M)\\
&=I(X^n,M)\\
&=H(M) - H(M|X^n)\\
&\leq H(M) \leq nR
\end{aligned}
$$

所以可以得到：$R\ge H(X)$.

可见，熵是平均码长的下界。

## 码的类型 ##

### 非奇异码 ###

若一个码C可以将不同的x映射为不同的$D^*$中 的序列，即：
$$
x \ne x' \rightarrow C(x) \ne C(x')
$$
则该码为非奇异码。

但是仅仅是非奇异码的序列可能会有歧义（很好笑）。$x_1 \rightarrow 0,x_2 \rightarrow 1,x_3 \rightarrow 01$，那么我收到$01$就不知道该如何介绍它了。

### 唯一可译码 ###

唯一可译码是非奇异码的子集。称码$C^*$为码$C$的扩展，当$C^*$是有限长X的序列到有限长D序列的映射，且满足：
$$
C(x_1,x_2,...,x_n) = C(x_1)C(x_2)...C(x_n)
$$
则该码为唯一可译码。

从另一方面来说，如果码的扩展为非奇异码，则该码为唯一可译码。

换句话说，没有码字是码字的组合。

这样的也是有缺点的，因为解码器复杂度要求较高。如$x_1 = 01,x_2 = 10,x_3 = 0111$,当收到0110的时候，在前三个的时候解码器预测可能是个$x_3$,但是最后一个不满足，因此就需要回退。

### 即时码（前缀码） ###

前缀码大家就比较熟悉了。前缀码是唯一可译码的子集。如常用的霍夫曼编码。它的意思是没有什么码字是另一个码字的前缀。所以解码器只要发现有认识的，立马就可以解码了，所以叫即时码。

莫尔斯电码是非奇异码，但不是唯一可译码。汉语也不是唯一可译码，因为断句不对就会引起歧义。