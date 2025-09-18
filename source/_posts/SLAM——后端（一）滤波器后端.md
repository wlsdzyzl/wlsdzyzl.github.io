---
title: SLAM——后端（一）滤波器后端
date: 2019-01-23 00:00:00
tags: [SLAM]
categories: SLAM
mathjax: true
---        

虽然这篇文章的名字很简单：后端，但是它实际上是SLAM中非常重要的部分。因为在帧与帧的定位在局部来说还是比较准确，但是每次都会有一定的漂移（drift），而放到全局就会造成严重的全局不一致（inconsistence），可以说没有一个好的后端就无法实现好的定位与重建。


<!--more-->


在SLAM中，对于后端的实现一般有两种，基于滤波（filter）的后端与基于全局优化（global opitimization）的后端。本次主要介绍基于滤波的后端。后端的需要解决的问题主要是从带噪声的数据估计内在状态。

最简单的，我们在实际中面对的问题有两种，一种是实时的数据，另外一种是已经采集好的数据，可以离线进行建图。最简单的办法，前一种一帧一帧处理，后一中可以做批量处理，分布称为渐进式和批量式。而滤波就是用来处理渐进式的方法。

1.  保持当前状态的估计，在加入新信息时，更新已有的估计
2.  线性系统+高斯噪声=卡尔曼滤波
3.  非线性系统+高斯噪声+线性近似=扩展卡尔曼滤波
4.  非线性系统+非高斯噪声+非参数化=粒子滤波器
5.  滑动窗口滤波以及多状态卡尔曼（MSCKF）

我们知道SLAM的过程是用运动方程与观测方程描述的：
$$
\left\{ \begin{matrix} x_k = f(x_ {k-1},u_k) + w_k\\ z_ {k,j} = h(y_j,x_k)+v_ {k,j} \end{matrix} \right. k=1,...,N,j=1,...,M
$$
我们知道每个方程都受噪声影响，所以要把这里的位姿$x$和路标$y$看成服从某种概率分布的随机变量。因此我们的问题就变成了拥有运动数据$u$和观测数据$z$的时候，如何确定$x,y$的分布，以及得到新的数据的时候，他们的状态又该如何改变。一般来说，我们会假设状态量和噪声项都服从高斯分布——这意味着程序中只需要存储它们的均值和协方差矩阵。均值为最优估计，而协方差定义了它的不确定性。

我们假设$x_k$为$k$时刻的所有待估计变量的和，这意味着它包含了路标位置和位姿：
$$
x_k \triangleq \{x_k,y_1,...,y_m\}.
$$
同时我们把k时刻的所有观测数据记为$z_k$，这时候新的方程就变成了：
$$
\left\{ \begin{matrix} x_k = f(x_ {k-1},u_k)+w_k\\ z_k = h(x_k)+v_k \end{matrix} \right. k = 1,...,N.
$$
现在考虑第k时刻的情况，我们希望用过去0到k-1时刻的状态来估计现在的状态分布：
$$
P(x_k\vert x_0,u_ {1:k},z_ {1:k})
$$
下标$1:k$表示：从1到$k$时刻的所有数据。

按照贝叶斯法则，将$z_k$与$x_k$的位置交换，得到：
$$
P(x_k\vert x_0,u_ {1:k},z_ {1:k}) \propto P(z_k\vert x_k)P(x_k\vert x_0,u_ {1:k},z_ {1:k-1}).
$$
右式中第一项为似然，第二项为先验。似然有观测方程给定（比如知道位置和位姿求空间点的投影像素位置），先验部分$x_k$是基于过去所有的状态估计得来的，至少它会收到$k-1$时刻的状态影响：
$$
P(x_k\vert x_0,u_ {1:k},z_ {1:k-1}) = \int \underbrace{P(x_k\vert x_ {k-1},x_0,u_ {1:k},z_ {1:k-1})}_ {\alpha} \underbrace {P(x_ {k-1}\vert x_0,u_ {1:k},z_ {1:k-1})}_ {\beta}dx_ {k-1}
$$
如果考虑之前更久的状态，就要对上面的式子继续展开。到这一步，处理就产生了两种办法，一是马尔可夫性质的假设，认为$k$时刻至于$k-1$时刻有关，这样我们就会得到扩展卡尔曼滤波（EKF）的处理方法;另外就是依然考虑$k$时刻的状态与之前所有时刻的状态都是相关的，这时候就得到非线性优化的优化框架。这一篇主要介绍卡尔曼滤波与EKF。

### [](about:blank#%E7%BA%BF%E6%80%A7%E7%B3%BB%E7%BB%9F%E4%B8%8EKF "线性系统与KF")线性系统与KF

如果我们假设了马尔可夫性，由于当前时刻只和上一个时刻有关，则$\alpha$简化为：
$$
\alpha = P(x_k\vert x_ {k-1},x_0,u_ {1:k},z_ {1:k-1}) = P(x_k\vert x_ {k-1}, u_k)
$$
$beta$可以写为：
$$
\beta = P(x_ {k-1}\vert x_0,u_ {1:k},z_ {1:k-1}) = P(x_ {k-1}\vert x_0,u_ {1:k-1},z_ {1:k-1})$$

这是因为$u_k$，是$k-1$时刻之后的输入，它不会对过去的状态产生影响。我们可以看到，$\beta$实际上是$k-1$时刻的状态分布。因此我们在做的是如何把$k-1$时刻的状态分布推导到$k$时刻，因此整个程序实现中，我们需要维护的只有一个状态分布而已，并不断用它结合输入来得到下一个时刻的状态分布。如果我们假设噪声服从高斯分布，我们需要维护的只有均值和协方差即可。

现在首先假设我们的系统为线性高斯系统，也就是运动方程和观测方程可以由线性方程来描述：
$$
\left\{ \begin{matrix} x_k = A_kx_ {k-1} + u_k + w_k\\ z_k = C_kx_k + v_k \end{matrix} \right . k = 1,...,N
$$
并且假设所有的状态和噪声均满足高斯分布。假如这里的噪声满足零均值高斯分布，则：
$$
w_k \sim N(0,R), v_k \sim N(0,Q)
$$
假设我们知道了$k-1$时刻的后验状态估计$\hat x_ {k-1}$以及协方差$\hat P_ {k-1}$，现在要根据$k$时刻的输入和观测数据，确定$x_k$的后验分布。为了区分先验和后验，我们在记号上规定有$\hat{}$的为后验，有$\overline{}$的为先验。

卡尔曼滤波器的第一步，通过运动方程确定$x_k$的先验分布。根据高斯分布的性质可以得到：
$$
P(x_k\vert x_0,u_ {1:k},z_ {1:k}) = N(A_k\hat x_ {k-1} + u_k,A_k\hat P_ {k-1}A_k^T + R)
$$
这一步称为预测，它显示了如何从上一个时刻的状态根据输入信息推断当前时刻的状态分布。这个分布也就是先验，记：
$$
\overline x_k = A_k \hat x_ {k-1} + u_k,\overline P_k = A_k \hat P_ {k-1} A_k^T + R
$$
而由观测方程，我们可以计算在某个状态下产生怎样的观测数据：
$$
P(z_k\vert x_k) = N(C_kx_k,Q).
$$
为了得到后验概率，需要计算他们的乘积。假如结果为：$x_k \sim N(\hat x_k, \hat P_k)$，那么：
$$
N(\hat x_k, \hat P_k) = N(C_kx_k,Q)\cdot N(\overline x_k,\overline P_k)
$$
由于都是高斯分布，我们可以先只关注指数部分：
$$
(x_k - \hat x_k)^T\hat P_k ^{-1} (x_k - \hat x_k) = (z_k - C_k x_k)^TQ^{-1}(z_k - C_kx_k) + (x_k - \overline x_k)^T\overline{P}_k^{-1} (x_k - \overline x_k)
$$
为了求得左侧的$\hat x_k$与$\hat P_k$，我们先将两边展开,比较$x_k$的二次和一次系数。

*   对于二次可以得到：
    $$
    \hat P_k^{-1} = C_k^TQ^{-1}C_k + \overline P_k^{-1}
    $$
    该式给出了协方差的计算过程。对上式左右各乘$\hat P_k$，我们可以得到：
    $$
    I = \hat P_k C_k^T Q^{-1}C_k + \hat P_k \overline P_k ^{-1}
    $$
    定义:$K = \hat P_k C_k^T Q^{-1}$，则得到：
    $$
    I = KC_k + \hat P_k \overline P_k^{-1}.
    $$
    即：
    $$
    \hat P_k = (I - KC_k)\overline P_k.$$
*   比较一次项系数，有：
    $$
    -2\hat x_k^T \hat P_k^{-1}x_k = -2z_k^TQ^{-1}C_kx_k - 2\overline x_k^T \overline P_k^{-1}x_k.
    $$
    取系数并转置后，可以得到：
    $$
    \hat P_k^{-1}\hat x_k = C_k^T Q^{-1}z_k + \overline P_k^{-1}\overline x_k.
    $$
    对上式两侧乘以$\hat P_k$带入$K$的定义，可以得到：
    $$
    \begin{aligned} \hat x_k &= \hat P_k C_k^TQ^{-1}z_k + \hat P_k \overline P_k^{-1}\overline x_k\\ &=Kz_k + (I-KC_k)\overline x _k \\ &= \overline x_k + K(z_k - C_k\overline x_k) \end{aligned}$$

因此我们得到了后验均值的表达。上面两个步骤可以称为**预测**与**更新**:

1.  预测： $$\overline x_k = A_k\hat x_ {k-1} + u_k, \overline P_k = A_k\hat P_ {k-1} A_k^T +R$$
2.  更新：先计算$K$，又被称为卡尔曼增益： $$K = \overline P_k C_k^T (C_k\overline P_k C_k^T + Q_k)^{-1}.计算后验概率的分布： \hat x_k = \overline x_k + K(z_k - C_k\overline x_k),\hat P_k = (I - KC_k)\overline P_k.$$

于是到这里，我们就推到了卡尔曼滤波器的整个过程。实际上它有若干种推导方式，我们使用的是从概率角度出发的最大后验概率估计的形式。可以看到，在线性高斯系统中，卡尔曼滤波器构成了该系统中的最大后验概率估计，由于高斯分布经过线性变换后仍然为高斯分布，整个过程我们并没有进行任何的近似，因此可以说卡尔曼滤波器是线性系统的最优无偏估计。

### [](about:blank#%E9%9D%9E%E7%BA%BF%E6%80%A7%E7%B3%BB%E7%BB%9F%E5%92%8CEKF "非线性系统和EKF")非线性系统和EKF

我们前面推导的是线性系统下的卡尔曼滤波器，而SLAM中运动方程与观测方程都散非线性函数。而一个高斯分布再进行非线性变换之后，就不一定是高斯分布了，因此在非线性系统中，我们需要取一定的近似，将一个非高斯分布近似乘为高斯分布。

如果我们希望把卡尔曼滤波器的结果拓展到非线性系统中，称为扩展卡尔曼滤波器（Extended Kalman Filter，EKF）。可以想到的做法是对观测方程与运动方程进行线性近似，也就是进行泰勒展开，保留一阶项,然后按照上面的线性系统来计算，也就是：
$$
x_k \approx f(\hat x_ {k-1},u_k) + \frac{\partial f}{\partial x_ {k-1} }\vert_ {\hat x_ {k-1} }(x_ {k-1} - \hat x_ {k-1}) + w_k.
$$
记这里的偏导数为：
$$
\mathbf{F} = \frac{\partial f}{\partial x_ {k-1} }\vert_ {\hat x_ {k-1} }.
$$
同样的，对于观测方程：
$$
z_k \approx h(\overline x_k) + \frac{\partial h}{\partial x_k}\vert_ {\overline x_k}(x_k - \overline x_k) + n_k.
$$
记这里的偏导数：
$$
\mathbf{H} = \frac{\partial h}{\partial x_k}\vert_ {\overline x_k}.
$$
那么在预测步骤中，根据运动方程有：
$$
P(x_k\vert x_0,u_ {1:k},z_ {0:k-1}) = N(f(\hat x_ {k-1},u_k),\mathbf F\hat P_ {k-1}\mathbf F^T + R_k).
$$
记先验和协方差均值为：
$$
\overline x_k = f(\hat x_ {k-1},u_k), \overline P_k = \mathbf F\hat P_ {k-1}\mathbf F^T + R_k.
$$
考虑在观测中我们有：
$$
P(z_k \vert x_k) = N(h(\overline x_k) +\mathbf{H}(x_k - \overline x_k),Q_k).
$$
根据最开始的贝叶斯展开式，这些接下来的推导与卡尔曼滤波器的内容都是非常相似的，因此就不在这里介绍中间步骤了，而直接介绍结果。我们同样会定义一个卡尔曼增益$K_k$:
$$
K_k = \overline P_k \mathbf H^T (\mathbf H\overline P_k \mathbf H^T + Q_k)^{-1}.
$$
在卡尔曼增益的基础上，后验概率形式为：
$$
\hat x_k = \overline x_k + K_k(z_k - h(\overline x_k)), \hat P_k = (I - K_k \mathbf{H})\overline P_k.
$$
因此，在SLAM这种非线性系统下，EKF给出了单次线性近似下的最大后验估计。

滤波器方法在较早的时候非常流行，而在现在的实际应用中，往往是渐进式与批量式集合的方法。如获取新的一帧后，不只是根据上一帧来优化，而是可以根据之前的所有帧来做这个处理。当然，实际中计算机算力有限，我们往往基于关键帧的策略来做这个事情。这就要用到下一次我们要说明的方法Bundle Adjustment。