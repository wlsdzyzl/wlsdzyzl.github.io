---
title: Learning From Data——Generalized Linear Model
date: 2018-10-22 20:26:26
tags: [machine learning,LFD class,exponential family,mathematics]
categories: 数据学习课程
mathjax: true
---
这次数据学习课上，讲的是Generalized Linear Model。我心里想着是要概况线性模型，我应该都清楚吧。上课了之后才发现，这实际上是广义线性模型，有很多新东西。然而我还是睡着了。
<!--more-->

首先引入一个概念，叫做**指数族分布**。

### Exponential Family ###

如果一个分布可以被写成下面的形式：

$$
p(y;\eta) = b(y)e^{\eta ^T T(y) - a(\eta)}
$$

那么这个分布属于Exponential Family。其中：

$\eta$: natural/canonical parameter(自然参数) 

$T(y)$: suﬃcient statistic of the distribution(充分统计量) 

$a(η)$: log partition function(对数划分函数)

其中$a(\eta)$是一个归一化常数的对数。也就是：

$p(y;\eta) = b(y)e^{\eta ^T T(y) - a(\eta)} = \frac {b(y)e^{\eta^T T(y)} } {e^{a(\eta)} }$

$\sum_ {y} p(y;\eta) = 1(or \int _y p(y;\eta) dy = 1) $

我们可以得到：
$a(\eta) = \log {\left(\sum _y b(y)e^{\eta ^T T(y)} \right)}$

指数分布族有很多成员，实际上我们熟悉的很多分布都是指数分布族的。下面举几个例子：

#### Bernoulli Distribution ####

伯努利分布应该是最简单的分布之一了。$y \in {1,0}$，而且$p(y=1) = φ,p(y=0) = 1 - φ$，因此它的分布可以写成下面的样子：

$p(y;φ) = φ^y(1-φ)^{1-y}$

如何将它转化为指数族的形式？

* $\eta = \log {\frac {\phi } {1-\phi} }$

* $T(y) = y$

* $a(\eta) = \log {(1 + e^{\eta})}$ 

* $b(y) = 1$

#### Gaussian Distribution(unit variance)####

高斯分布也是很常见的分布，这里我们先说明一下unit variance的情况，也就是$\sigma = 1$。它的概率密度如下：
$$
p(y;\mu) = \frac 1 {\sqrt{2 \pi} } exp\left(- \frac {(y - \mu)^2}{2} \right)
$$

* $\eta = \mu$

* $ T(y) = y$

* $a(\eta) = \frac {\eta ^2} {2}$

* $b(y) = \frac 1 {\sqrt{2 \pi} } e^{-\frac {y^2}{2} } $

#### Gaussian Distribution ####

现在将目标放到普通的高斯分布上。
$$
p(y;\mu) = \frac 1 {\sqrt{2 \pi \sigma ^ 2} } exp\left(- \frac {(y - \mu)^2}{2\sigma ^ 2} \right)
$$

* $$
\eta = \left[\begin{matrix} 
\frac {\mu}{\sigma^2} \\ 
-\frac {1}{2\sigma^2} 
\end{matrix}\right]$$

* $$
    T(y) = \left[ \begin{matrix} y \\
 y^2 
 \end{matrix}
 \right]
 $$

* $a(\eta) = \frac {\mu^2}{2\sigma^2} + \log {\sigma}$

* $b(y) = \frac 1 {\sqrt {2 \pi} }$

这里情况变得就稍微复杂了点。

#### Poisson Distribution:Poisson($\lambda$) ####

泊松分布平时我们接触不如前两项多。泊松分布一般可以用在估计一个固定的时间段内某个事情发生的次数，假设各个事件之间互相独立，它们发生有一个固定的比率$\lambda$.

泊松分布的概率密度函数如下：
$$
p(y;\lambda) = \frac {\lambda ^y e ^{- \lambda} }{y!}
$$

* $\eta = \log {\lambda}$

* $T(y) = y$

* $a(\eta) = e^{\eta}$

* $b(y) = \frac {1}{y!}$

### Generalized Linear Models ###

所以什么是广义线性模型？GLM是从来自于指数族分布$y|X;\theta$一种构造线性模型的方法。

广义线性模型的设计动机为：
* 相应变量y可以是任意分布
* 允许y的任意函数（链接函数）可以随输入值x线性变化

广义线性模型形式化定义有下面几个假设：

1. $y|x;\theta$ ~ Exponential Family(\eta),如高斯分布，伯努利分布，泊松分布等
2. 假设目标函数是$h(x) = \mathbb{E}[T(y)|x]$
3. 自然常数$\eta$和输入$X$是线性相关的：$\eta = \theta^TX$ or $\eta_i = \theta_i^T X (\eta = \Theta^T X)$ 

将自然参数与分布平均值连接得到：$\mathbb{E}[T(y);\eta]$.

权威响应函数（Canonical response function）g给出了分布平均值：$g(\eta) = \mathbb{E}[T(y);\eta]$.

则 $\eta = g^{-1}(\mathbb{E}[T(y);\eta])$,被称为权威链接函数（canonical link function）。

写成广义线性模型，可以得到：$\mathbb{E}(y;\eta)=\frac{d}{d\eta}a({\eta})$（证明较为复杂）。因此，可以很轻易得求出假设函数。

### Example ###
#### Ordinary Least Square ####

应用GLM到下面的假设：

1. $y|X;\theta ~ N(\mu,1)$,则$\eta = \mu,T(y) = y$.

2. Derive Hypothesis function $h_\theta(X) = \mathbb{E}[y|X;\theta] = \mu = \eta$.

3. Adopt linear model $\eta = \theta ^TX $: $h_\theta (X) = \eta = \theta ^T X$.

Canonical response function:$g(\eta) = \mu = \eta$

Canonical link function:$\eta = g^{-1}(\mathbb{E}[T(y);\eta] = g'(\mu) = mu$

#### Logistic Regression ####

1. $y|X;\theta ~ Bernoulli(\phi)$，则$\eta = \log {\left(\frac {\phi}{1 - \phi}\right)},T(y) = y$

2. Derive hypothesis function $h_\theta(X) = \mathbb{E}[y|X;\theta] = \phi = $,则$\phi = \frac {1}{1 + e^{-\eta} }$

3. Adopt linear model $\eta = \theta ^T X$: $h_\theta(X) = \phi = \frac {1}{1 + e^{-\theta^TX} }$

Canonical response function:$ φ = g(η) = sigmoid(η)$ 

Canonical link function : $η = g^{−1}(φ) = logit(φ)$

#### Possion Regression ####

1. $y|X;\theta ~ P(\lambda)$,则$\eta = \log{\lambda},T(y) = y$

2. Derive hypothesis function $h_\theta(X) = \mathbb{E}[y|X;\theta] = \lambda = e^{\eta}$

3. Adopt linear model $\eta = \theta^TX$: $h_\theta (X) = \lambda = e^{\theta^TX}$

Canonical response function:$\lambda = g(\eta) = e^{\eta}$

Canonical link function:$\eta = g^{-1}(\lambda) = log(\lambda)$

#### Softmax Regression ####

最后我们来推断下Softmax Regression，因为softmax是多维的分布，所以还是有点难度的。

首先我们应该写出它的分布函数如下：
$$
p(y;\theta) = \prod_ {i=1}^k \phi_i^{\mathbf{1}\{y = i\} }
$$

然后需要做的是把它写成Exponential Family的形式.

如果照着平时的思路下来，我们会发现，$a(\eta) = 0$,这是不允许发生的（Why？）。因此我们需要想办法，如果把$\phi_k$移到最后，又如何保证前面没有$y$的影响？

仔细观察上式，我们发现可以将上式写为：$\prod _ {i=1}^k \left(\frac{\phi_i}{\phi_k} \right)^{\mathbf{1}\{y=i\} } \phi_k$. (!!!Genius!).

* $\eta = \left [ \begin{matrix}
\log{\frac {\phi_1}{\phi_k} }\\
\log{\frac {\phi_2}{\phi_k} }\\
...\\
\log{\frac{\phi_ {k-1} }{\phi_k} }
\end{matrix} \right ]$

* $T(y) = \left[
    \begin{matrix}
    \mathbf{1}\{y=1\}\\
    \mathbf{2}\{y=2\}\\
    ...\\
    \mathbf{k-1}\{y=k-1\}
    \end{matrix}
    \right]$

* $b(y) = 1$

* $a(\eta) = -\log{(\phi_k)}$

有了上面的格式，如何运用线性模型就比较顺理成章了。

1. $y|X;\theta ~ P(\Phi)$,则$\eta ,T(y)$如上。

2. Derive hypothesis function :
$$
h_\theta(X) = \mathbb{E}[y|X;\theta] = \Phi = 
$$
$$
\begin{bmatrix} 
\frac {e^{\eta_1} }{\sum _ {i=1}^k e^{\eta_i} }\\
\frac {e^{\eta_2} }{\sum _ {i=2}^k e^{\eta_i} }\\
...\\
1 - \frac {e^{\eta_k} }{\sum _ {i=1}^k e^{\eta_i} }
\end{bmatrix}
$$
(注意，在这里为了方便我们定义$\eta_k = \log { {\eta_k}{\eta_k} } = 0$)

3. Adopt linear model $eta = \Theta^TX$:

 $ h_\Theta (X)  =\begin{bmatrix} 
\frac {e^{\theta_1^TX} }{\sum _ {i=1}^k e^{\theta_i^TX} }\\
\frac {e^{\theta_2^TX} }{\sum _ {i=1}^k e^{\theta_i^TX} }\\
...\\
1 - \frac {e^{\theta_k ^TX} }{\sum _ {i=1}^k e^{\eta_i^TX} }
\end{bmatrix} $

Canonical response function:$\phi_i = g(\eta) =\frac  {e^{\eta_i} }{\sum _ {i=2}^k e^{\eta_i} }$

Canonical link function:$\eta_i = g^{-1}(\phi) = \log {\frac {\phi_i}{\phi_k} }$.



因此，根据广义线性模型，我们可以推出需要的hypothesis funtion的形式，从而进行进一步的学习。