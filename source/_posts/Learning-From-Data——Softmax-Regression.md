---
title: Learning From Data——Softmax Regression
date: 2018-10-16 11:43:43
tags: [machine learning,LFD class,regression]
categories: 数据学习课程
mathjax: true
---
Learning From Data是研究生修的一门课，其实也就是机器学习的另一种叫法。第一门课中介绍了Linear Regression，Logistic Regression，Softmax Regression.虽然前两个都学过，但是还是有一些收获，比如另外的解释方法等等。<!--more-->

## Linear Regression ##

这次Linear Regression主要学习到的新的东西是，从概率角度来理解为什么使用Least Square.

假设目标函数是 $Y = W^Tx+ \epsilon$，其中$\epsilon$是N维向量.假设$\epsilon$是独立同分布（IID）的，而且满足高斯分布$N(0,\sigma)$,则:
$$
p(y_n|X_n,W) = \frac 1 {\sqrt{2\pi }\sigma } exp \left(-\frac{(Y_n - W^TX_n)^2}{2\sigma ^2} \right)
$$

而出现这个样本的概率如下：

$L(W) = p(Y|X,W) = \prod _ {n=1}^N p(y_n|X_n,W)$.

我们想要求得最大概率估计（Maximum Likelihood Estimation）:$W_ {MLE} = argmax_W(L{W})$.

展开之前我们应该加个log，因为我们喜欢sum而不是prod。如下：

$$
\begin{array} {l}
\log{L(W)} &= \sum _ {n=1}^N(\log{\frac 1 {\sqrt {2 \pi} \sigma} }- \frac 1 {2\sigma ^2 } (Y_n - W^TX_n)^2 \log e )\\
 &= m \log{\frac 1 {\sqrt {2 \pi }\sigma} } - \frac 1 {2\sigma ^2 }  \sum_ {n=1}^N  (Y_n - W^TX_n)^2 
\end{array} 
$$

所以，$argmax_ {W} (L(W)) = argmin_ {W} (\sum_ {n=1}^N  (Y_n - W^TX_n)^2 )$.这也正是我们的cost function的定义。

## Logistic Regression ##

Logistic Regression学习了从另一种角度思考得到另一种定义cost function的方法，当然最终效果是一致的。

之前的logsitic regression对于$P(X_i \bigcap y_i)$的估计如下：
$$
P(X_i \bigcap y_i) =\frac {(y_i+1)} 2 P(X_i) \times P(y_i = +1|X_i) +\frac {(1 - y_i)} 2 P(X_i) \times (1 - P(y_i = +1|X_i))
$$

实际上有另外一种可以达到一样的效果,不过此时我们需要的就是另外一种对$y$的定义了：$y \in {0,1}$:
$$
P(X_i \bigcap y_i) = (P(X_i) \times P(y_i = 1|X_i))^{y_i} (P(X_i) \times (1 - P(y_i = 1|X_i)))^{1-y_i}
$$

因此出现这个样本的概率为：
$$
L(W) = \prod _ {i=1}^N (P(X_i \bigcap y_i) = P(X_i) \times h_w(X_i) )^{y_i} (P(X_i) \times (1-h_W(X_i)))^{1-y_i} .
$$

我们可以略去这些$P(X_i)$,因为这是确定的而且也不是我们需要注意的。
这时候log之后，得到最后的cost funtion的形式与之前就有了一些不同：

$$
f(W) = -(\sum _ {i=1}^N y_i \log h_W{X_i} + (1 - y_i)\log{ (1 -h_W{X_i})})
$$

接下来要做的就是求这个函数的梯度，但是为了看的清楚，首先说明下各个函数的意义：

$$
h_W(X) = \frac 1 {1 - e^{-g_W(X)} }
$$

$$
g_W(X) = W^TX
$$

求梯度过程如下：

$$
\begin{array}{l}
\nabla f(W) &= -(\sum _ {i=1} ^N (y_i log(h_W(X_i)) + (1-y_i) log(1-h_W(X_i))))\\
&= -(\sum_ {i=1}^N \left[ \frac {y_i}{h_W(X_i)} - \frac {1-y_i}{1-h_W(X_i)} \right] h_W'(x))\\
&= -(\left[y_i + \frac {1-y_i}{e^{-g_W(X_i)} } \right] \frac {e^{-g_W(X_i)} }{1 - e^{-g_W(X_i)} } g_W'(X_i)) \\\ 
&= -(\left[ \frac 1 {1 - e^{-g_W(X_i)} } - y_i \frac {1 - e^{-g_W(X_i)} }{1 - e^{-g_W(X_i)} } \right] g_W'(X_i))\\
&=-(y_i - h_W(X_i))X_i  
\end{array}
$$

而且这个cost function的好处是，利用梯度下降的时候它和线性回归的步骤是非常相似的,线性回归中：

$$
\frac {\partial f(W)}{\partial w_j} = \sum _ {i=1}^N(y_i - g_ {W}(X_i))x_ {i,j}.
$$

即
$$
\nabla f(W) = \sum_ {i=1}^N (y_i - g_ {W}(X_i))X_i.
$$

最后回到两种不同的cost funtion，实际上两者本质没有太大的区别，只是negative，positive的标识数字不同。最后得到的结果可能也不一样，但是差距不会太大，都会得到比较理想的结果。

## Softmax Regression ##

Softmax Regression是一种多维分类算法。依然是站在概率的角度来讨论。

假设共有k类，即$y \in {1,...,k}$.我们先给出一个概率估计，之前得概率估计是logistic函数，现在我们给出另一种情况：

$$
h_W(X_i) = \left [
    \begin{matrix}
p(y_i = 1|X_i;W_1)\\
p(y_i=2|X_i;W_2)\\
...\\
p(y_i=k|X_i;W_k)
 \end{matrix}\right] = \frac 1 {\sum _ {j=1}^k e^{W_j^TX_i} } 
 \left[\begin{matrix} e^{W_1^TX_i}\\
 e^{W_2^TX_i}\\
 ...\\
 e^{W_k^TX_i}
 \end{matrix}\right]
  = softmax(W,X_i)
$$

同时我们定义:$softmax(z_i) = p{y = i|X,W} = \frac {e^{z_i} }{\sum _ {j=1}{k} e^{z_j} }$，此时$i \in {1,...,k}$.

当然，W参数也会发生变化：

$$
W = \left[
\begin{matrix}
-W_1^T-\\
-W_2^T-\\
...\\
-W_k^T- 
\end{matrix}
\right]
$$

因此我们确定了给定$W$和$X$的时候，$y$的概率。

而出现当前样本的概率（我们忽略$P(W,X)$,像之前一样它不会影响结果）：
$$
L(W) = \prod_ {i=1}^{N} P(y_i|X_i,W).
$$
其实我们可以想象的是这个式子展开了后会很复杂，因为对$y_i$可能的各个情况也要连乘。不如先log好了：

$$
\begin {array}{l}
 F(W) = \log{L(W)} &= \sum_ {i=1}^N \log {p(y_i|X_i,W) }\\
 &= \sum_ {i=1}^N \log{\prod_ {j=1}^k p_ {W_j}(j|X_i,W)^{\mathbf{1}\{y_i = j\} } }\\
 &= \sum_ {i=1}^N \sum_ {j=1}^k \mathbf{1}\{y_i = j\} \log { \frac {e^{W_jX_i} }{\sum _ {l=1}^k e^{W_l^TX_i} } }
\end {array}
$$

这个东西，其实我推算的时候对他的符号表示已经很头大了。但是它虽然复杂但原理不难懂，和logistic regression的道理基本上一样的。

最后，我们就是要求这个函数的梯度了。这个函数的梯度求解想必是非常复杂的，但是实际上没有想象的那么麻烦。最后的结果也非常的简单：

$$
\nabla _ {W_j} F(W) = 
\sum _ {i=1}^m \left( \mathbf{1}\{y_i = j\} \log {\frac {e^{W_j^TX_i} }{\sum _ {l=1}^k e^{W_l^TX_i} } } + \mathbf{1}\{y_i \ne j\} \log {\frac {e^{W_ {y_i}^TX_i} }{\sum _ {l=1}^k e^{W_l^TX_i} } } \right)
$$

我们仔细观察原式就可以化简上面的样子。为了简化后面的步骤，假设$g(W_l) = W_l^TX_i$.
第一种情况$ {y_i = j}$：

$$
f_1(W) = \log {\frac {e^{g(W_j)} }{\sum_ {l=1}^k e^{g(W_l)} } }
$$

$$
\begin{array}{l}
\nabla _ {W_j} f_1(W)  &= \frac {\sum_ {l=1}^k e^{g(W_l)} }{e^{g(W_j)} } \cdot \frac { -e^{2g(W_j)}+ (\sum_ {l=1}^k e^{W_l})e^{W_j} }{(\sum_ {l=1}^k e^{g(W_l)})^2} \cdot g'(W_j)\\
&= \frac{\sum_ {l=1}^k e^{g(W_l) - e^{g(W_j)} } }{\sum_ {l=1}^k e^{g(W_l)} } \cdot g'(W_j) \\\ 
&= (1 - p(y_i = l|X_i,W))X_i
\end{array}
$$

第二种情况$y_i \ne j$,假设$y_i = q \ne j$:

$$
f_2(W) = \log {\frac {e^{g(W_q)} }{\sum_ {l=1}^k e^{g(W_l)} } }
$$

$$  
\begin{array}{c}
\nabla _ {W_j} f_2(W) &=\frac {\sum_ {l=1}^k e^{g(W_l)} }{e^{g(W_q)} } \cdot \frac { -e^{g(W_j) e^{g(W_q)} } }{(\sum_ {l=1}^k e^{g(W_l)})^2} \cdot g'(W_j)\\
&= - p(y_i = l|X_i,W)X_i
\end{array}
$$

也是两种情况的差别只有前面是否加一个1。合并两种情况，可以得到：

$$
\nabla _ {W_j} F(W) = \sum _ {i=1} ^N [(\mathbf{1}\{y_i=j\} - p(y_i=l|X_i,W))X_i] 
$$

上面推出来的要注意是我们想要最大化的函数。

而cost funtion的梯度应该是： $\sum _ {i=1} ^N [(-\mathbf{1}\{y_i=j\} + p(y_i=l|X_i,W))X_i] $

对于softmax regression我们需要知道，它的参数$W_j$之间并不是独立的，因为各个概率加起来为1，有这个约束后实际上，只要知道$k-1$个参数，就可以确定这个模型。

实际上，可以很容易证明logistic regression 是 softmax regression的特殊情况。

以上就是上节课学到的所有新东西。