---
title: Learning From Data——Multivariate ACE
date: 2018-12-05 14:02:15
tags: [LFD class, machine learning, ACE, PCA]
mathjax: true
categories: 数据学习课程
---
上节课除了说了softmax与HGR，还介绍了ACE算法的拓展：多变量下的ACE。
<!--more-->
之前的ACE是从两个变量$X,Y$之间的信息推导出来的，而这次要拓展到d个变量。可以看到的是，这时候我们没有把哪个变量当作标签了，因此这是非监督学习。实际上我认为之前的ACE也可以说是非监督学习。分析到信息论层面非监督学习和监督学习联系到一起了，它们之间的界限变得比较模糊了。

现在，有ｄ个离散变量：$X_1,X_2,...,X_d$.类似于之前，我们要做的是：
$$
\max \mathbb{E}[\sum_ { i \ne j} f_i(X_i) f_j(X_j)]\\
s.t. \mathbb{E}[f_i(X_i)] = 0, \mathbb{E}[f_i^2(X_i)] = 1
$$

这时候的$\mathbb{E}[f_i(X_i) f_j(X_j)] = \Psi_i^T B_ {ij} \Phi_j$.这里的$B_ {ij}$表示的是一个矩阵：

$$B_ {ij,x_i,x_j}  \frac{p_ {X_iX)j}(x_i,x_j)}{\sqrt{p_ {X_i}(x_i)p_ {X_j}(x_j)} },B_ {|X_j| \times |X_i|},B_ {ij,|X_i| \times |X_j|}.$$
而定义$B$矩阵为：
$$
B_ {|X_1|+...+|X_m| \times|X_1|+...+|X_m|  } = \begin{bmatrix}
0&B_ {12}&\cdots&B_ {1d}\\
B_ {21}&0&\cdots&B_ {2d}\\
\vdots&\vdots&\ddots&\vdots\\
B_ {d1}&B_ {d2}&\cdots&0
\end{bmatrix}
$$
$$
\Psi = \begin{bmatrix}
\Psi_1^T,\Psi_2^T,...,\Psi_d^T
\end{bmatrix}^T\\
\Phi = \begin{bmatrix}
\Phi_1^T,\Phi_2^T,...,\Phi_d^T
\end{bmatrix}^T 
$$
$\mathbb{E}[\sum_ {i \ne j} f_i(X_i)f_j(X_j)] = \Psi ^T B \Phi $
由于：
$$
\mathbb{E}[f_i(X_i) f_j(X_j)] = \Psi_i^T B_ {ij} \Phi_j= \Phi_j^T B_ {ji} \Psi_i = \mathbb{E}[f_j(X_j) f_i(X_i)] = \Psi_j^T B_ {ji} \Phi_i
$$
所以我们可以得到：$\Phi_i = \Psi_i$，也就是对于每个变量我们只需要学习一个函数$f_i(X_i)$即可。

下面是多变量ACE算法的过程：
1. 选择$f = {f_1,f_2,...,f_g}$，这些函数为normalize后的函数

2. $f_i(x_i) \leftarrow \mathbb{E}[ \sum_ {j\ne i}f_j(X_j)|X_i = x_i]$ 

3. normalize. $f_i(X_i) \leftarrow \frac{f_i(X_i)}{\mathbb{E}\left[ \sum_ {i=1}^d f_i^2(X_i)\right]}$

直到最后收敛。

现在我想说明，实际上如果限定f为线性映射，那么得到的结果实际上就是PCA算法。

[PCA](https://wlsdzyzl.top/2018/11/19/Learning-From-Data%E2%80%94%E2%80%94PCA/)想做的是：
$$
\max \frac{1}{n} \sum_ {i=1}^n(X_i^Tu)^2 
$$
而：
$$
\begin{aligned}
\frac{1}{n} \sum_ {i=1}^n(X_i^Tu)^2 &= \frac{1}{n} \sum_ {i=1}^m(\sum_ {j=1}^d x_ {ij} \mu_j)^2\\
&= \frac{1}{n} \sum_ {i=1}^n (\sum_ {j=1}^d x_ {ij}^2 \mu_j^2 + 2\sum_ {j \ne q} \underbrace{(x_ {ij}\mu_j)}_ {f_j(x_ij)}\underbrace{(x_ {iq}\mu_q)}_ {f_q(x_iq)}) 
\end{aligned}
$$

由于normalize, 我们可以使得：
$$
\frac{1}{n}\sum_ {i=1}^n \sum_ {j=1}^d x_ {ij}^2 \mu_j^2 =\sum_ {j=1}^d \frac{1}{n}\sum_ {i=1}^n  x_ {ij}^2 \mu_j^2 = \sum_ {j=1}^d \mathbb{E}[f_j^2(X_j)]= d
$$

而：
$$
\frac{1}{n} \sum_ {i=1}^n \sum_ {j \ne q} \underbrace{(x_ {ij}\mu_j)}_ {f_j(x_ij)}\underbrace{(x_ {iq}\mu_q)}_ {f_q(x_iq)}) = \mathbb{E}[\sum_ {j \ne q}f_j(X_j)f_q(X_q)]
$$

而这正是MACE在做的事情。不过PCA只能发现线性关系，因此它要求f为线性映射。

更多细节请参考：

[An Information-theoretic Approach to Unsupervised
Feature Selection for High-Dimensional Data](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_pdf/An%20information-theoretic%20approach%20to%20unsupervised%20feature%20selection%20for%20high-dimensional%20data_196602880.pdf)