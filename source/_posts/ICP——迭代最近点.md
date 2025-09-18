---
title: ICP——迭代最近点
date: 2019-01-17 00:00:00
tags: [SLAM,icp,algorithm]
categories: SLAM
mathjax: true
---        

ICP（iterative closest point）最广泛的应用应该就是点云的配准了。它的提出也是为了解决这个问题。

<!--more-->



假设我们有两个点云，它们应该是一一配对的（或者说在SLAM中两个场景有较大的overlap），但是我们并不知道点的配对关系。现在我们希望根据这两个点云的位置求到相机的位姿变化，也就是旋转矩阵$R$与平移$t$。

假设这两个点云分别为$p,p’$，那么我们知道$p = Rp’ + t $。想要求得$R,t$，首先要做的是配对关系。而ICP非常简单，它选取距离最近（一般来说为欧几里得距离）的点作为配对的点。因此，现在我们有了两组配对点：
$$
P = \{p_1,p_2,...,p_n\}, P' = \{p'_1,p'_2,...,p'_n\}
$$
我们希望做的是最小化下面这个代价：
$$
J = \sum_ {i=1}^n\Vert p'_i - (Rp_i+t)\Vert^2
$$
如何解这其中的$R$和$t$？比较容易想到的就是最小二乘法，下面我们推导介绍一下利用SVD来解决这个最小二乘问题。

首先定义点云的质心为：
$$
p = \frac 1 n \sum_ {i=1}^np_i, p' = \frac{1}{n} \sum_ {i=1}^np'_i
$$
则:
$$
\begin{aligned} \sum_ {i=1}^n\Vert p'_i - (Rp_i + t) \Vert^2 &= \sum_ {i=1}^n\Vert p'_i- Rp_i - t - p' + Rp + p' - Rp \Vert^2\\ &=\sum_ {i=1}^n\Vert (p'_i-p'-R(p_i-p)) + (p'-Rp - t) \Vert^2\\ &= \sum_ {i=1}^n(\Vert p'_i-p'-R(p_i-p)\Vert^2 + \Vert p'-Rp - t \Vert^2 + 2(p'_i-p'-R(p_i-p))^T(p'-Rp - t)) \end{aligned}
$$
值得注意的是：$p’_i-p’-R(p_i-p)$在求和之后为0，这是由质心的定义决定的。

因此原来的问题就简化为：
$$
\min_ {R,t} J = \sum_ {i=1}^n(\Vert p'_i-p'-R(p_i-p)\Vert^2 + \Vert p'-Rp - t \Vert^2
$$
观察之后，我们发现第一个式子只和旋转有关，第二个式子和旋转平移都有关，不过另一方面它只和质心相关。如果我们求得了$R$，简单的令第二个式子为0就可以求得对应的$t$。所以现在ICP的算法表述如下：

令$q_i,q’_i$为原来点的去质心坐标：
$$
q_i = p_i - p,q'_i = p'_i - p'
$$
计算最佳的$R$:
$$
R^* = \arg\min_R \sum_ {i=1}^n\Vert q'_i - Rq_i\Vert^2
$$
最后，根据$R^*$计算$t$:
$$
t^* = p' - R^{*}p
$$
因此求得$R$之后，$t$是非常容易得到的。
$$
\sum_ {i=1}^n\Vert q'_i-Rq_i\Vert^2 = \sum_ {i=1}^n( {q'}_i^Tq'_i + q_i^TR^TRq_i - 2{q'}_i^TRq_i)
$$
第一项与$R$无关，而$R^TR=I$，因此第二项也无所谓。我们重点要做的是$\min_R \sum_ {i=1}^n -{q’}_i^TRq_i$。
$$
\sum_ {i=1}^n -{q'}_i^TRq_i = \sum_ {i=1}^n -\text{tr}(Rq_i{q'}_ i^T) = -\text{tr}\left(R\sum_ {i=1}^nq_i{q'}_i^T\right)
$$
计算这个$R$可以使用SVD来解决。

定义$W = \sum_ {i=1}^n q’_iq_i^T$，根据SVD得到：

W = U\Sigma V^T

则$R^* = UV^T$。如果$\text{rank}(W)=3$，则$R$是唯一最优解。具体的证明比较复杂。这就求得了从$p$到$p’$的旋转，有了旋转矩阵，平移就非常容易得到了。

至于迭代的过程，就是我们根据求得的$R,t$进行转换后，重复上述的步骤。

最早的关于ICP的论文为[A Method for Registration of 3-D Shapes](http://www-evasion.inrialpes.fr/people/Franck.Hetroy/Teaching/ProjetsImage/2007/Bib/besl_mckay-pami1992.pdf)。



  