---
title: 压缩感知与稀疏模型——Convex Methods for Sparse Signal Recovery
date: 2019-7-09 00:00:00
tags: [machine learning,sparse model,convex optimization]
categories: 压缩感知与稀疏模型
mathjax: true
---            

第三节课的内容。这节课上课到半截困了睡着了，看着大家都很积极请教认真听讲，感觉很惭愧。周末不能熬太晚。这个博客就记录一下醒着时候听到的内容。  

<!--more-->


### [](about:blank#Motivation "Motivation")Motivation

目前的时代需要处理的数据量维度可能很高，比如1024*960分辨率的图片转化成向量维度就是100万左右。对于当代搜索引擎需要处理的数据更是如此，大数据时代已经来临。

而我们直到，对于普通的对比信息检索，时间复杂度为$O(n)$，当然，如果加上维度$D$，数据检索复杂度变成了$O(Dn)$，要知道这里的D很大，属于高纬度数据，甚至远大于数据的个数$n$，是一定不可以忽略的。

有没有一种方法，能对数据降维，使得D变小？这样可以大大降低数据检索的复杂度。但是，对数据降维不能随机降，需要保矩，也就是对各个向量的相对关系需要进行保持。

我们希望原来维度上两个向量差多少，降维之后他们每一对向量之间的距离没有变化太多。

### [](about:blank#The-Johnson-Lindenstrauss-Lemma "The Johnson-Lindenstrauss Lemma")The Johnson-Lindenstrauss Lemma

下面介绍一条定理，简称为Lemma定理。它是当代搜索引擎对高维数据Hashing的核心。首先，我们要知道对于高维如果要完全用低纬度保存所有的信息是不可能的，因此会有一定的错误率，但是我们在统计角度上可以证明当数量大的时候这个错误率趋于０即可。

**Johnson-Lindenstrauss Lemma**：假定向量$v_1,v_2,…,v_n \in \mathbb R ^D$，现在有随机矩阵$A \in \mathbb{R}^{m \times D}$，它的entries是按照高斯$N(0,\frac{1}{m})$独立的随机变量，那么对于任何$\varepsilon \in (0,1)$，至少有$1 - \frac{1}{n^2}$的概率使得下式成立：
$$
\forall i \ne j, (1 - \varepsilon)\Vert v_i - v_j \Vert_2^2 \leq \Vert Av_i - Av_j \Vert_2^2 \leq (1+\varepsilon) \Vert v_i - v_j \Vert_2^2,
$$
其中，$m > 32\frac{\log n}{\varepsilon^2}$。

可以看到的是这个结论很棒，因为矩阵是任意随机的，甚至不用优化去求得。而对于高纬度的向量，使用$A$矩阵降维到$m$维，因为$m$的限制，使得查找的复杂度从$O(Dn)$变成了$O(n\log n)$，更惊喜的是实际上这个复杂度甚至和维度$D$无关了。在这里$D \gg m$，从而实现了加速的效果。

下面对上述定理进行简单的证明。证明之前再说一下另外一个引理：

$g = (g1,…,g_m)$是一个ｍ维度的随即向量，它的entries是独立高斯分布$N(0,\frac{1}{m})$，那么对于任何$t \in [0,1]$，有下面的结论：
$$
\mathbb{P} \left[\lvert\Vert g\Vert_2^2 - 1 \rvert > t\right] \leq 2 \exp (-\frac{t^2m}{8})
$$
设$g_ {i,j} = A\frac{v_i - v_j}{\Vert v_i - v_j \Vert_2}$，对于任何的$v_i \ne v_j$，$g_ {i,j}$的entries是符合独立高斯（$N(0,\frac{1}{m})$）分布的。应用Lemma定理可以得到：
$$
\mathbb{P} \left[\lvert\Vert g_ {i,j}\Vert_2^2 - 1\rvert > t \right] \leq 2 \exp (-\frac{t^2m}{8})
$$
将所有概率简单加起来可以得到：
$$
\mathbb{P} \left[\exists(i,j): \lvert\Vert g_ {i,j}\Vert_2^2 - 1 \rvert > t \right] \leq \frac{n(n-1)}{2} \times 2 \exp (-\frac{t^2m}{8})
$$
将$t = \varepsilon, m \ge 32 \frac{\log{n} }{\varepsilon ^2}$代入上式，可以得到：
$$
\mathbb{P} \left[\exists(i,j): \lvert\Vert g_ {i,j}\Vert_2^2 - 1 \rvert > t\right] \leq n(n-1)n^{-4} \leq n^{-2}
$$
注意这里的$\lvert\Vert g_ {i,j}\Vert_2^2 - 1 \rvert \leq t$也就等价于:
$$
(1 - t)\Vert v_i - v_j \Vert_2^2 \leq \Vert Av_i - Av_j \Vert_2^2 \leq (1+t) \Vert v_i - v_j \Vert_2^2.
$$
到这里证明也就结束了。

### [](about:blank#Covering-and-Packing-problem "Covering and Packing problem")Covering and Packing problem

Covering问题：假如有每个站点有一定的影响力，求最小需要多少个站点，站点的影响力能将一个区域全部覆盖。

Packing问题：各个站点影响力不重合的情况下，一个区域最多能装下几个站点。比如一个盒子能装多少个小球就是packing问题。

### [](about:blank#%E6%9C%80%E5%B0%8F%E5%8C%96rank "最小化rank")最小化rank

现在有问题：
$$
\text{minimize } rank(A)\\ \text{subject to } A + E = D
$$
对于一般的L0范数，我们放松到L1范数，如下：
$$
\Vert E \Vert_0 \rightarrow \#\{e_i \ne 0\} \rightarrow \Vert E\Vert_1 = \sum_ {i}e_ {i}
$$
同样，我们可以发现一个最小化一个矩阵的秩实际上是特征值不为零的个数，因此可以有类似的放松：
$$
rank(A) \rightarrow \#\{\sigma_i(A) \ne 0\}\rightarrow \Vert A\Vert_ {\phi} = \sum_i \sigma_i(A)
$$
上面是第三节课所听到的内容，遗漏了很多，只是做个记录。