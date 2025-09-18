---
title: Learning From Data——Covariance Matrix Derivation
date: 2018-11-06 15:35:34
tags: [LFD class,machine learning,mathematics,homework]
categories: 数据学习课程
mathjax: true
---
上周的数据学习课程布置了一个作业，主要做的是对多维高斯分布下求得协方差矩阵的取值。这个和之前将的Generative Learning Algorithm很相关，但是当时是直接给出了协方差矩阵的取值。结果是异常简单的，但是其中的证明可能要费点功夫。
<!--more-->

题目描述如下：

Linear Discriminant Analysis (LDA) is a special case of Gaussian Discriminant Analysis (GDA) which assumes that the classes have a common covariance matrix $\Sigma_j = \Sigma, \forall j$. Now suppose all the $\Sigma_j$’s are not equal, and we will get the Quadratic Discriminant Analysis (QDA). The estimations for QDA are similar to those for LDA, except that separate covariance matrices must be estimated for each class. Give the maximum likelihood estimate of Σ j ’s for the case K = 2.

题目中说，之前博客中介绍的各个分类的$\Sigma$都是一样的，那叫做LDA，如果每个类别都有自己的$\Sigma_j$，则是QDA。让我们推导QDA的协方差矩阵应该是什么样子。

实际上，对于QDA还是LDA，协方差矩阵的推导是大致一样的，而QDA的最后结果也是非常简单。至于$\phi_j,\mu_j$等相比之下更简单，结果也和之前一样，就不在这里进行证明了。

这篇博客实际上就是把之前的写的作业发出来，因为我们作业要求为英文，因此下面的证明将为英文。

Firstly,  we need to know the log Maximum Likelihood Estimate:
$$
\begin{equation*}
\begin{aligned}
&\log L(\mu_1,...,\mu_k,\Sigma_1,...,\Sigma_k,\phi_1,...,\phi_k)\\
 &= \log \prod_ {i=1}^m p(x_i,y_i;\mu_1,...,\mu_k,\Sigma_1,...,\Sigma_k,\phi_1,...,\phi_k)\\
 &=\log \prod_ {i=1}^m p(x_i|y_i;\mu_ {y_i},\Sigma_ {y_i})p(y_i;\phi_ {y_i})\\
 &=\log \prod_ {i=1}^m \prod_ {j=1}^k \mathbf{1}\{y_i=j\} \frac{1}{(2\pi)^{\frac n 2}\vert \Sigma_j\vert ^{\frac 1 2} } e^{-\frac 1 2(x_i-u_j)^T\Sigma^{-1}(x_i-u_j)}p(y_i=k;\phi_ {k}) \\
 &= \sum_ {i=1}^m  \sum_ {j=1}^k \mathbf{1}\{y_i=j\}( - \frac 1 2(x_i-u_j)^T\Sigma^{-1}(x_i-u_j) -\frac n 2 \log (2\pi) + \frac 1 2 \log\vert \Sigma_j\vert+\log p(y_i;\phi_ {y_i}))\\
\end{aligned}
\end{equation*}
$$

If we want to find the Maximum, we need to get the derivative of Sigma. If we cut the useless parts,the function will be look like this:

$$
l = \frac 1 2\sum_ {i=1}^m  \sum_ {j=1}^k \mathbf{1}\{y_i=j\}(\log\vert \Sigma_j\vert - (x_i-u_j)^T\Sigma^{-1}(x_i-u_j))
$$

I need to tell some basic rules about derivative of matrix:

$$
\begin{align}
\frac { \partial \vert A\vert}{\partial A} = |A|(A^{-1})^T\\
\frac {\partial A^{-1} }{\partial x} = A^{-1}\frac{\partial A}{\partial x} A^{-1}     
\end{align}
$$

We could use the (1) to get the $\log |\Sigma_k|$ 's derivative. Because of the SPD, we could get:
$$
\begin{align}
\frac {\partial \log \vert \Sigma_j \vert}{\partial \Sigma_j} = (\Sigma_j^{-1})^T = \Sigma_j^{-1}
\end{align}
$$

Then, use the rule (2). Because the x is a scalar, so we need to separate the process.First let's try to find the derivative of $\Sigma_ {k,(i,j)}$:

$$
\begin{equation*}
\begin{aligned}
\frac{\partial \Sigma_k^{-1} }{\partial \Sigma_ {k,(i,j)} } &= \Sigma_k^{-1} \frac{\partial \Sigma_k}{ \Sigma_ {k,(i,j)} }\Sigma_k^{-1}\\
(x_i-u_j)^T\frac{\partial \Sigma_k^{-1} }{\partial \Sigma_ {k,(i,j)} }(x_i-u_j)&=  (x_i-u_j)^T\Sigma_k^{-1} \frac{\partial \Sigma_k}{ \Sigma_ {k,(i,j)} }\Sigma_k^{-1}(x_i-u_j)
\end{aligned}
\end{equation*}
$$

We noticed that $(x_i-u_j)^T\Sigma_k^{-1} = (\Sigma_k^{-1}(x_i-u_j))^T $.

And the matrix $\frac{\partial \Sigma_k^{-1} }{\partial \Sigma_ {k,(i,j)} }$ will be like a n $\times$ n matrix with the exception that the value of the position(i,j) will be 1.

So we could get:
$$
\begin{equation*}
\begin{aligned}
(x_i-u_j)^T\frac{\partial \Sigma_k^{-1} }{\partial \Sigma_ {k,(i,j)} }(x_i-u_j)&=  (x_i-u_j)^T\Sigma_k^{-1} \frac{\partial \Sigma_k}{ \Sigma_ {k,(i,j)} }\Sigma_k^{-1}(x_i-u_j)\\
&= [(\Sigma_k^{-1}(x_i-u_j)) (\Sigma_k^{-1}(x_i-u_j))^T]_ {(i,j)}
\end{aligned}
\end{equation*}
$$

So:

$$
\begin{align}
(x_i-u_j)^T\frac{\partial \Sigma_k^{-1} }{\partial \Sigma_ {k,(i,j)} }(x_i-u_j) = (\Sigma_k^{-1}(x_i-u_j)) (\Sigma_k^{-1}(x_i-u_j))^T
\end{align}
$$
Now use (3) and (4),we could get: 
$$
\begin{equation*}
\begin{aligned}
\frac{\partial l}{\partial \Sigma_j} &=\frac 1 2\sum_ {i=1}^m \mathbf{1}\{y_i=j\} (\Sigma_j ^{-1}-   (\Sigma_k^{-1}(x_i-u_j)) (\Sigma_k^{-1}(x_i-u_j))^T)\\
 &=\frac 1 2\sum_ {i=1}^m \mathbf{1}\{y_i=j\} (\Sigma_j ^{-1}-   \Sigma_j^{-1}(x_i-u_j)(x_i-u_j)^T\Sigma_j^{-1})
\end{aligned}
\end{equation*}
$$

Because we want to let $\frac{\partial l}{\partial \Sigma_j} = \mathbf{0}$:

$$
\begin{equation*}
\begin{aligned}
\frac 1 2\sum_ {i=1}^m  \mathbf{1}\{y_i=j\} (\Sigma_j ^{-1}-   \Sigma_j^{-1}(x_i-u_j)(x_i-u_j)^T\Sigma_j^{-1}) = \mathbf{0}\\
\sum_ {i=1}^m\mathbf{1}\{y_i=j\} (I - \Sigma_j^{-1}(x_i-u_j)(x_i-u_j)^T) = \mathbf{0}\\
\sum_ {i=1}^m\mathbf{1}\{y_i=j\} I = \Sigma_j^{-1}\sum_ {i=1}^m \mathbf{1}\{y_i=j\}(x_i-u_j)(x_i-u_j)^T
\end{aligned}
\end{equation*}
$$

So,for QDA,the $\Sigma_j$ will be like this:

$$
\begin{equation*}
\begin{aligned}
\Sigma_j = \frac{\sum_ {i=1}^m \mathbf{1}\{y_i=j\}(x_i - \mu_ {j}) (x_i - \mu_ {j})^T}{\sum_ {i=1}^m \mathbf{1}\{y_i=j\} }
\end{aligned}
\end{equation*}
$$
where $j=1,2$.
