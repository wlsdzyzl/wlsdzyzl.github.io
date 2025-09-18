---
title: Paper——Image Super-Resolution as Sparse Representation of Raw Image Patches
date: 2019-06-09 00:00:00
tags: [super resolution,computer vision,digital image processing]
categories: 论文
mathjax: true
---             

这次阅读一篇关于超分辨的论文。这篇文章的作者里有马毅老师，他是伯克利的老师，也是TBSI的老师，是非常有威望的一名学者。这篇文章在超分辨领域是比较经典的文章了。  

<!--more-->


超分辨（super resolution，简称SR）的问题，是从比较低的分辨率的图片中，得到高分辨率的图片。这个问题在本篇文章之前也有比较多的解决方法，它们大多数有着自己的缺陷，比如需要多张低分辨图，对于基于学习的方法，一般需要非常大的数据库来进行学习，也有一些学者提出了利用高分辨与低分辨在流形空间上的相似度来解决，但是容易因为overfitting或者underfitting会带来模糊。本篇文章主要解决的是从一张单一的低分辨图得到高分辨图，仅需要少量的训练数据来达到这样的效果，而且训练数据中也不需要在高分辨率的图片上进行学习，而是直接在低分辨率训练patch上工作。这篇文章主要是收到了稀疏信号代表的启发，关于稀疏信号代表的研究保证了高分辨与低分辨之间的线性关系，使得高分辨率的信号可以准确的从它们的低纬度投影恢复出来。

这里简单介绍一下稀疏代表（sparse representation）以及字典的含义。实际上，字典是一个矩阵$\boldsymbol{D} \in \mathbb{R}^{n \times K}$，它由$K$个原型信号原子(prototype signal-atoms)组成，每个原子实际上是一个$n$维向量，一个完备（complete）的字典意思是任何一个信号$x \in \mathbb R ^n$可以由这些原子线性组合得到，过完备也就意味着，这样的组合可能不止一个。其实放到线性代数中，我觉得可以这样理解，一个字典就是n维向量空间的一组基。因此，每个信号向量$x$都可以写为：
$$
\boldsymbol{x}=\boldsymbol{D} \boldsymbol{\alpha}_ {0}
$$
其中，$\boldsymbol{\alpha}_ {0} \in \mathbb{R}^{K}$是一个稀疏的系数向量，只有少量的元素（$\ll K$）非0，因为这个字典是过完备的。在实际中，我们可能只观察到$x$的一个小集合测量值$y$:
$$
\boldsymbol{y} \doteq L \boldsymbol{x}=L \boldsymbol{D} \boldsymbol{\alpha}_ {0}
$$
上式中$L \in \mathbb{R}^{k \times n}$，$k < n$。在超分辨问题中，高分辨率的图像就是$x$，而低分辨率图像则是$y$。如果这个字典$\mathbf D$是过完备的，那么等式$\boldsymbol{x}=\boldsymbol{D} \boldsymbol{\alpha}$是一个欠定方程，有无数多组$\boldsymbol{\alpha}$的解，对于等式$\boldsymbol{y}=L \boldsymbol{D} \boldsymbol{\alpha}$也是一样。尽管如此，在弱假设（[mild condition](https://math.stackexchange.com/questions/1656203/what-do-mathematicians-mean-by-mild-condition)）下，对于这个等式最稀疏的解$\boldsymbol{\alpha_0}$也是唯一的。此外，如果$\boldsymbol{D}$满足一个合适的near-isometry条件，那么对一个高分辨率图像$\boldsymbol{x}$的任何足够稀疏的线性代表都可以完美的从低分辨率图像中恢复出来。下面的图是一个超分辨的例子：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/sr_sparse5.png)

实际上稀疏代表已经应用到图像处理的各个方向，比如图像压缩，图像去噪以及图像恢复。在这篇论文中，作者没有直接计算高分辨率patch的字典，而是建立了两个字典，$D_ {\hbar}$对应于高分辨率patch，而$\boldsymbol{D}_ {\ell}=L \boldsymbol{D}_ {\hbar}$则对应于低分辨率patch。$\boldsymbol{D}_ {\ell}$被用来直接从对应的$D_ {\hbar}$恢复高分辨率patch，因为各个patch之间的overlap，可以得到一个局部一致的解，接着利用全局优化，来得到全局一致的解。注意，这里高分辨率patch的字典只用来进行高分辨率path的恢复，而且算法会自动选择最相关的patch，因此相对于其他的算法，这个算法有更好的表现。

下面介绍下算法的推导。

[](about:blank#Super-resolution-from-Sparsity "Super-resolution from Sparsity")Super-resolution from Sparsity
-------------------------------------------------------------------------------------------------------------

这部分简单介绍一下从系数得到超分辨的模型。现在有一个低分辨图$\mathbf Y$，超分辨问题就是用这张图恢复相同场景下的高分辨图$\mathbf X$。$\mathbf X$与$\mathbf Y$之间最基本的约束是需要保持consistent。观察的$\mathbf Y$是原先的高分辨率图的一个模糊加下采样的结果：
$$
\boldsymbol{Y}=D H \boldsymbol{X}
$$
在这里,$H$是一个模糊滤波器，$D$表示下采样操作。对于低分辨率$Y$，实际上可以有无数的高分辨率图像在模糊与下采样之后得到$Y$，因此作者通过对$X$上的小区域（patch）$\boldsymbol x$的先验来重新整理这个问题：稀疏代表先验。解释如下：  
对于高分辨率图片$X$的patch$\boldsymbol x$可以表示成字典$D_ {\hbar}$中向量的稀疏线性组合，字典$D_ {\hbar}$是通过对训练集中的高分辨patch采样得到的：
$$
\boldsymbol{x} \approx \boldsymbol{D}_ {\hbar} \boldsymbol{\alpha} \quad \text { for some } \boldsymbol{\alpha} \in \mathbb{R}^{K} \text { with }\|\boldsymbol{\alpha}\|_ {0} \ll K
$$
为了使用稀疏代表的先验来解决超分辨问题，作者将问题分成了两个步骤来解决：

1.  使用稀疏先验，找到每个局部patch的稀疏代表，并且要考虑到相邻patch的关系。
2.  根据上面的到的稀疏代表，来利用重建约束来对整个图片进行改进。

### [](about:blank#Local-Model-from-Sparse-Representation "Local Model from Sparse Representation")Local Model from Sparse Representation

这一部分讲得到局部稀疏代表的过程。首先，我们要建立字典，前面提到的字典有两种：高分辨率的字典以及对应的低分辨率的字典。假设我们已经得到了低分辨率字典。$\boldsymbol{D}_ {\ell}$，那么关于低分辨率patch的最稀疏的代表定义如下：
$$
\min \|\boldsymbol{\alpha}\|_ {0} \text { s.t. }\left\|F \boldsymbol{D}_ {\ell} \boldsymbol{\alpha}-F \boldsymbol{y}\right\|_ {2}^{2} \leq \epsilon
$$
这里的$F$表示特征提取，它的作用会在之后说明。尽管上述问题的解决是NP-hard，是对0范数的求解。但是最近的结果显示了只要$\alpha$是足够稀疏的，那么它们可以通过解决1范数来近似，因此优化问题变成了下面的形式：
$$
\min \|\boldsymbol{\alpha}\|_ {1} \quad \text { s.t. } \quad\left\|F \boldsymbol{D}_ {\ell} \boldsymbol{\alpha}-F \boldsymbol{y}\right\|_ {2}^{2} \leq \epsilon
$$
使用拉格朗日乘数方法可以构造一个等价的式子：
$$
\min \lambda\|\boldsymbol{\alpha}\|_ {1}+\frac{1}{2}\left\|F \boldsymbol{D}_ {\ell \boldsymbol{\alpha} }-F \boldsymbol{y}\right\|_ {2}^{2}
$$
但是对每个patch单独解决上述的式子得到的结果不能保证相邻patch之间的兼容性，因此我们还需要别的约束，加上之后这个优化问题变成了：
$$
\begin{aligned} \min \|\boldsymbol{\alpha}\|_ {1} \quad \text { s.t. } &\left\|F \boldsymbol{D}_ {\ell} \boldsymbol{\alpha}-F \boldsymbol{y}\right\|_ {2}^{2} \leq \epsilon_ {1} \\\left\|P \boldsymbol{D}_ {\hbar} \boldsymbol{\alpha}-\boldsymbol{w}\right\|_ {2}^{2} \leq \epsilon_ {2} \end{aligned}
$$
这里的$P$提取了当前目标patch与之前重建的高分辨率图像之间的重接区域，而$\boldsymbol{w}$包含了之前重建的高分辨率图片中重叠区域的值。这个优化问题可以被简化写成成下面的形式：
$$
\min \lambda\|\boldsymbol{\alpha}\|_ {1}+\frac{1}{2}\|\tilde{\boldsymbol{D} } \boldsymbol{\alpha}-\tilde{\boldsymbol{y} }\|_ {2}^{2}
$$
上式中：
$$
\tilde{D}=\left[\begin{array}{c}{F \boldsymbol{D}_ {\ell} } \\ {\beta P \boldsymbol{D}_ {h} }\end{array}\right] \text { and } \tilde{\boldsymbol{y} }=\left[\begin{array}{c}{F \boldsymbol{y} } \\ {\beta \boldsymbol{w} }\end{array}\right]
$$
这里$\beta$是一个参数，用来调整兼容性与对应之间的tradeoff，可以简单设为1。利用上式求得$\boldsymbol \alpha^{*}$，那么高分辨率patch可以通过下式得到：
$$
\boldsymbol{x}=\boldsymbol{D}_ {\hbar} \boldsymbol{\alpha}^{*}.
$$
### [](about:blank#Enforcing-Global-Reconstruction-Constraint "Enforcing Global Reconstruction Constraint")Enforcing Global Reconstruction Constraint

需要注意的是，在上面的推导中，我们不要求$\left|F \boldsymbol{D}_ {\ell} \boldsymbol{\alpha}-F \boldsymbol{y}\right|_ {2} = 0$，再加上noise的存在，使得最后得到的结果不一定会满足全局的约束，也就是从得到的高分辨率图片$X_0$经过模糊下采样之后，不一定能得到$Y$。为了使得结果满足全局一致，我们投影$X_0$到$D H \boldsymbol{X}=\boldsymbol{Y}$的解空间，计算：
$$
\boldsymbol{X}^{*}=\arg \min _ {\boldsymbol{X} }\left\|\boldsymbol{X}-\boldsymbol{X}_ {0}\right\| \quad \text { s.t. } \quad D H \boldsymbol{X}=\boldsymbol{Y}
$$
可以通过back-projection方法迭代来解决上面的问题，更新等式如下：
$$
\boldsymbol{X}_ {t+1}=\boldsymbol{X}_ {t}+\left(\left(\boldsymbol{Y}-D H \boldsymbol{X}_ {t}\right) \uparrow s\right) * p
$$
这里的$p$是一个back-projection滤波器，而$\uparrow s$表示因子$s$下的上采样。

到目前为止，整个算法流程如下：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/sr_sparse4.png)

我们将$\boldsymbol X^*$作为最后对高分辨率图像的估计。这个估计在满足全局约束的条件下尽可能接近最开始估计的$\boldsymbol X_0$。

### [](about:blank#Global-Optimization-Interpretation "Global Optimization Interpretation")Global Optimization Interpretation

上述中，对于patch各个计算是分开进行的，实际上给定足够多的计算资源，对于所有patch的相关联系是可以同时计算的。此外，整个高分辨率图像本身可以作为一个变量，因此与其要求$X$通过稀疏代表系数$\alpha$被完美地恢复，我们可以将高分辨率图像与这些系数的差异作为一个惩罚项。通过这些细数得到的高分辨率图像，允许这个解不是完全稀疏的，但是会更好的满足重建约束。这样的策略下，对于高分辨率问题的求解成了一个很大的优化问题：
$$
\begin{aligned} \boldsymbol{X}^{*}=& \underset{\mathbf{X},\left\{\boldsymbol{\alpha}_ {i j}\right\} }{\arg \min }\left\{\|D H \boldsymbol{X}-\boldsymbol{Y}\|_ {2}^{2}+\eta \sum_ {i, j}\left\|\boldsymbol{\alpha}_ {i j}\right\|_ {0}+\gamma \sum_ {i, j}\|\boldsymbol{D}_ {\hbar} \boldsymbol{\alpha}_ {i j}-P_ {i j} \boldsymbol{X}\|_ {2}^{2}+\tau \rho(\boldsymbol{X}) \right\} \end{aligned}
$$
上式中$\boldsymbol{\alpha}_ {i j}$表示$X$在位置$(i,j)$的patch的代表系数，$P_ {i,j}$是一个投影矩阵用来选择$X$的第$(i,j)$个patch，而$\rho(\boldsymbol{X})$是一个惩罚函数，编码了关于高分辨率的一些先验信息，对于不同种类的图片应该对应不同的$\rho$。实际上，我们之前提出的稀疏代表算法，正是对这个算法的一个计算效率比较高的估计。仔细观察，原来版本的优化问题是在最小化上式的第二项和第三项，将第二项的0范数放宽成了1范数，同时用低分辨率的字典下的稀疏代表来估计高分辨率的版本。同时，当代表系数固定时，实际上：
$$
\sum_ {i, j}\left\|\boldsymbol{D}_ {\hbar} \boldsymbol{\alpha}_ {i j}-P_ {i j} \boldsymbol{X}\right\|_ {2}^{2} \approx \left\|\boldsymbol{X}_ {0}-\boldsymbol{X}\right\|_ {2}^{2}
$$
因此，对于比较小的$\gamma$，之前算法的back-projection步骤正是在最小化全局优化问题中的第一项和第三项。但是我们之前的算法并没有解决第4项，但实际上稀疏代表假设已经是一个足够强的先验信息，让算法能取得比较好的结果。

[](about:blank#Dictionary-Preparation "Dictionary Preparation")Dictionary Preparation
-------------------------------------------------------------------------------------

分析到现在，可以看到字典在算法中的关键作用。这一部分将说明如何构造出字典。

### [](about:blank#Random-Raw-Patches-from-Training-Images "Random Raw Patches from Training Images")Random Raw Patches from Training Images

想要学习一个最佳的过完备字典是非常困难的。在这篇文章中，作者没有试着去学习这样一个字典或者使用一个通用的基向量，而是通过对原始训练集（相似的统计数据）中的patch简单进行随机采样。实验中我们发现这样简单的策略，就足够生成高质量的重建结果了。

下图是展示了几张训练用的图片以及从它们中采样得到的patch，在作者给出的实验中，准备了两个字典：一个是对各类型花朵的采样，生成的字典用来恢复相似场景的超分辨率图像，另一个是对动物图片的采样，用来恢复带有毛的纹理表现更好。对于每张高分辨率图像$\mathbf X$，我们通过模糊以及下采样来得到对应的低分辨率图像$\mathbf Y$。对于某种类型的图片，我们仅仅对30多张训练图片进行随机采样得到100000左右的patch来生成字典。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/sr_sparse3.png)

### [](about:blank#Derivative-Features "Derivative Features")Derivative Features

在之前Local Model from Sparse Representation中，我们在公式中有一个特征提取的操作$F$，来确保计算得到的系数能够匹配上低分辨率信号中最相关的部分。典型地来说，$F$是一些高通滤波器，在感知角度来说这个是合理的，因为人们对图片中的高频内容更敏感。同样的，低分辨率中的高频信息在恢复高分辨率中被丢掉的高频内容的过程中也是最重要的。在本篇文章中，选取的高频滤波是一阶二阶导数，来作为低分辨率patch的特征。尽管这个滤波器很简单，但是却非常有效。更准确的说，4个用来提取导数的1-D滤波器为：
$$
\begin{array}{ll}{f_ {1}=[-1,0,1],} & {f_ {2}=f_ {1}^{T} } \\ {f_ {3}=[1,0,-2,0,1],} & {f_ {4}=f_ {3}^{T} }\end{array}
$$
通过应用这些滤波器，对于每个patch我们得到4个描述特征，它们被组织成一个向量，来作为最终低分辨率patch的代表。

到目前为止，整个算法过程就说完了。这个算法的流程如下：

1.  生成patch，通过3×3或者5×5大小的patch，运用一阶二阶导数滤波器，得到一个向量来作为该patch的代表。
2.  对训练集中的高分辨率图，通过模糊以及下采样得到低分辨率图，根据低分辨率图来生成低分辨率的字典，根据高分辨率图来生成高分辨率的字典。生成字典的方式是随机采样得到patch代表，对于每个种类的图片，生成字典大概仅仅需要30张图片以及100000个patch。
3.  根据低分辨率的字典以及低分辨率的输入图像，求解得到每个patch的稀疏代表（一个优化问题，最稀疏），同时根据高分辨率字典来恢复高分辨率的patch，接着，根据全局约束，来不断迭代得到的高分辨率图，直到满足全局约束，最后得到的就是恢复的超分辨图像。

下面是一些实验结果：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/sr_sparse2.png)

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/sr_sparse1.png)

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/sr_sparse0.png)

可以看到的是，实际上这个算法对于字典的依赖很大，因此如果训练集的图片与输入图片不相关，那么最后得到的超分辨图像也是崩掉的。