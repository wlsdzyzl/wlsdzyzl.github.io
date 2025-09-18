---
title: 信息论——Fano不等式
date: 2018-11-01 15:42:08
tags: [information theory]
categories: 信息论
mathjax: true
---
从$X$到$Y$到$\hat{X}$，其中$\hat {X}$是对原有的$X$的估计,而Y可以看作是一个中间过程，可以想象类似于编码解码的过程。这之间有什么联系？
<!--more-->

Fano不等式如下：
$$
P_e = Pr(X \ne \hat{X})\\
H(P_e) + P_e log|X| \geq H(X|\hat{X}) \geq H(X|Y)
$$

证明如下：
$$
E =
\left \{
    \begin{array}{c}
    0,X = \hat{X}\\
    1,X \ne \hat{X}
    \end{array} 
\right.
$$
则：$H(E) = H(P_e)$.注意：当不等的时候为$1$,这个E可以看为错误。

现在考虑$H(E,X|\hat{X})$.由之前的条件熵可以知道：
$$
\begin{align}
H(E,X|\hat {X}) &= H(X|\hat{X}) + H(E|X,\hat{X}) &-----(1)\\
&=H(E|\hat{X})+H(X|E,\hat{X}) &-----(2)
\end{align}
$$

很容易知道(1)中，$H(E|X,\hat{X}) = 0$,因为E的值就是由$X,\hat{X}$确定的。

(2)中，$H(E|\hat{X}) \leq H(P_e)$.而第二项$H(X|E,\hat{X})$满足：
$$
H(X|E,\hat{X}) = P_e H(X|X \ne \hat{X},\hat{X}) + (1-P_e) H(X|X = \hat{X},\hat{x}).
$$
这步还是比较难懂的。

上式中，$P_e H(X|X \ne \hat{X},\hat{X}) \leq P_e \log |X|,H(X|X = \hat{X},\hat{x}) = 0 $.

因此组合起来： $H(X|\hat{X}) \leq  H(P_e) + \log |X|$.
这就得到了Fano不等式的第一个不等号。

接下来证明$I(X;Y)\geq I(X;\hat{X})$.
$$
\begin{align}
I(X;Y,\hat{X}) &= I(X;Y) + I(X;\hat{X}|Y)\\
&= I(X;\hat{X}) + I(X; Y|\hat{X})
\end{align}
$$

上式中， $I(X;\hat{X}|Y) = 0$.除去Y的信息，$X,\hat{X}$是统计独立的,而两个系统的互信息是大于等于0的。所以可以得到：
$$
I(X,Y) \geq I(X;\hat{X}).
$$

这告诉我们编码过程中，原有信息只会衰减，而不可能增大。

得到上式后，第二个不等式很快就可以得出：
$$
H(X) - H(X|Y) \geq H(X) - H(X|\hat {X})\\
H(X|\hat{X})\geq H(X|Y)
$$

所以整个不等式就得到了：

$H(P_e) + P_e \log|X| \geq \ H(X|\hat {X}) \geq H(X|Y)$.