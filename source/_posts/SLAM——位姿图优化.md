---
title: SLAM——位姿图优化
date: 2019-02-16 00:00:00
tags: [SLAM]
categories: SLAM
mathjax: true
---    
    

SLAM中另外一个用到的最多的后端优化方法叫做位姿图（Pose Graph）优化。想象一下，对于路标的优化，可能进行几次之后就已经收敛了，这时候每次插入一个帧都再次进行一次BA仿佛有点用力过猛。而且实际中，路标的数量远远大于位姿数量，因此BA在大规模建图时，它的计算量可能会越来越大，使得实时计算变得困难。这里我们介绍的位姿图优化，就是省去了对路标的优化，仅仅调整位姿的一种做法。  

<!--more-->



我们将pose graph的优化转换成图的问题，那么图的节点就是一个个位姿，用$\xi_1,…,\xi_n$来表示，而边则是两个位姿之间相对运动的估计，这个估计可能来自与特征点法或者是直接法。比如$\xi_i,\xi_j$之间一个相对运动$\Delta \xi_ {ij}$，则：
$$
\Delta \xi_ {ij} = \xi_i^{-1}\circ \xi_j = \ln(\exp((-\xi_i)^{\hat{} }) \exp (\xi_j^{\hat{} }))^{\hat{} }
$$
或者按照李群的写法：
$$
T_ {ij} = T_ {i}^{-1} T_j.
$$
我们知道，实际中上式不会精确成立，因此我们需要设立最小二乘误差，然后讨论关于优化变量的导数。这里我们将上式的$T_ {ij}$移到右侧，为了让其满足误差最小为0的设定，加上一个$\ln$:
$$
e_ {ij} = \ln(T_ {ij}^{-1}T_i^{-1}T_j)^{\hat{} } = \ln(\exp((-\xi_ {ij})^{\hat{} })\exp((-\xi_ {i})^{\hat{} })\exp(\xi_j^{\hat{} }))^{\hat {} }
$$
值得注意的是这里的优化变量有两个：$\xi_i,\xi_j$，因此我们需要求$e_ {ij}$关于这两个变量的导数。按照李代数的求导方式，给$\xi_i,\xi_j$各一个左扰动$\delta \xi_i,\delta \xi_j$，于是误差变为：
$$
\hat e_ {ij} = \ln(T_ {ij}^{-1}T_i^{-1}\exp((-\delta \xi_i)^{\hat{} })\exp(\delta\xi_j)^{\hat{} }T_j)^{\hat{} }
$$
我们希望将扰动项移到左侧或者右侧，需要利用到一个伴随性质：
$$
\exp((Ad(T)\xi)^{\hat{} }) = T\exp(\xi^{\hat{} })T^{-1}.
$$
稍加改变，得到：
$$
\exp(\xi^{\hat{} })T = T\exp((Ad(T^{-1})\xi)^{\hat{} }).
$$
这说明通过引入一个伴随项，我们能够交换扰动项左右侧的$T$，利用它可以将扰动项移到最右，导出右乘形式的雅科比矩阵：
$$
\begin{aligned} \hat e_ {ij} &=\ln\left (T_ {ij}^{-1}T_i^{-1}\exp((-\delta\xi_i)^{\hat{} })\exp(\delta\xi_j^{\hat{} })T_j\right)^{\hat{} }\\ &=\ln\left(T_ {ij}^{-1}T_i^{-1}T_j \exp\left((-Ad(A_j^{-1})\delta\xi_i)^{\hat{} }\right)\exp\left((Ad(T_j^{-1})\delta \xi_j)^{\hat{} }\right)\right)\\ &\approx \ln(T_ {ij}^{-1}T_i^{-1}T_j[I - (Ad(T_j^{-1})\delta \xi_i)^{\hat{} } + (Ad(T_j^{-1})\delta\xi_j)^{\hat{} }])^{\hat{} }\\ &\approx e_ {ij}+\frac{\partial e_ {ij} }{\partial \delta \xi_i}\delta \xi_i + \frac{\partial e_ {ij} }{\partial \delta \xi_j}\delta \xi_j \end{aligned}
$$
因此，按照李代数上的求导规则，我们求出了误差关于两个位姿的雅科比矩阵。关于$T_i$的：
$$
\frac{\partial e_ {ij} }{\partial \delta \xi_i} = -\mathcal{J}_r^{-1}(e_ {ij})Ad(T_j^{-1}).
$$
关于$T_j$的：
$$
\frac{\partial e_ {ij} }{\partial \delta \xi_i} = \mathcal{J}_r^{-1}(e_ {ij})Ad(T_j^{-1}).
$$
这部分的理解有点困难，可以回顾之前的[李群李代数](https://wlsdzyzl.top/2018/11/09/SLAM%E2%80%94%E2%80%94%E6%9D%8E%E7%BE%A4%E5%92%8C%E6%9D%8E%E4%BB%A3%E6%95%B0/)。之前也说过，由于李群（se(3)）上的雅科比矩阵形式过于复杂，我们通常取近似。如果误差接近于0，可以取近似：
$$
\mathcal{J}_r^{-1}(e_ {ij}) \approx I + \frac 1 2 \begin{bmatrix} \phi _e ^{\hat{} } & \rho _e^{\hat{} }\\ 0 & \phi _e ^{\hat{} } \end{bmatrix}.
$$
了解了雅科比计算之后，其余的部分就是普通的图优化了。记$\varepsilon$为所有边的集合，总体的目标函数为：
$$
\min_\xi \frac{1}{2} \sum_ {i,j \in \varepsilon} e_ {ij}^T\Sigma_ {ij}^{-1}e_ {ij}.
$$
我们依然可以利用列文伯格或者高斯牛顿法来解决这个问题。

### [](about:blank#Note "Note")Note

伴随性质：

*   $$SO(3) R \exp(p^{\hat{} })R^T = \exp((Rp)^{\hat{} }).$$
*   $$SE(3) T\exp(\xi^{\hat{} })T^{-1} = \exp((Ad(T)\xi)^{\hat{} }).$$
    其中： $$Ad(T) = \begin{bmatrix} R & t^{\hat{} }R\\ 0 & R \end{bmatrix}.$$
