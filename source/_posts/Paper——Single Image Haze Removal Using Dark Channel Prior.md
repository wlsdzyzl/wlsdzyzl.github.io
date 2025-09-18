---
title: Paper——Single Image Haze Removal Using Dark Channel Prior
date: 2019-05-26 00:00:00
tags: [computer vision,digital image processing]
categories: 论文
mathjax: true
---     
    
学习数字图像处理的时候阅读了这一篇关于去雾的文章：[Single Image Haze Removal Using Dark Channel Prior](http://kaiminghe.com/publications/cvpr09.pdf)。这篇文章是大名鼎鼎的何凯明的第一篇文章，而且还获得了CVPR best paper award，非常令人佩服了。

<!--more-->


这篇文章有一个好的论文的所有优点：思路新颖，算法简单易于理解，而且效果显著。下面来分析一下何凯明大神是如何去雾的。

### [](about:blank#Basic-Idea "Basic Idea")Basic Idea

基于观察以及统计数据发现，对于一张室外的照片，除非是天空这种地方，一般来说在一个区域内至少会有一个像素点的某个颜色通道值非常低。这种情况出现的原因有3点，阴影，彩色物体或者表面，以及深色物体与表面。这里我们在数学上定义一下暗通道：
$$
J^{\operatorname{dark} }(\mathbf{x})=\min _ {c \in\{r, g, b\} }\left(\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(J^{c}(\mathbf{y})\right)\right).
$$
$J^c$是一个室外图像$\mathbf J$的颜色通道（我们已经知道RGB图像有3个通道）, $\Omega (\mathbf{x})$是以$\mathbf x$为中心的一个图像区域。基于统计数据可以得到:
$$
J^{\mathrm{dark} } \rightarrow 0.
$$
也就是，暗通道的值一般趋于0。

我们通过暗通道的计算可以得到一张图片的暗通道图。一般来说，无雾的室外场景图片的暗通道图都有大片的区域是黑色的，整个暗通道图偏黑色，作者在5000多张图片上进行了实验，发现基本满足这个规律。下面是一些统计结果：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/dehaze1.png)

从暗通道图的直方图以及累计分布可以看到，大部分像素的灰度值都是在50以下的。这个数据给了这个先验假设很强的支持。而相比之下，一副有雾的图片，它的暗通道图会更明亮。下面是一些无雾图与有雾图各自暗通道图的对比：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/dehaze0.png)

有了这个先验知识，下面就是算法部分了。首先我们需要知道，下面这个成雾模型在计算机图形与计算机视觉领域被广泛应用：
$$
\mathbf{I}(\mathbf{x})=\mathbf{J}(\mathbf{x}) t(\mathbf{x})+\mathbf{A}(1-t(\mathbf{x}))
$$
上式中，$\mathbf I$是已知信息，也就是我们观察到的带有雾气的图片，而$\mathbf J$是无雾状态下的场景图片。$\mathbf A$是大气光强，$\mathbf t$是大气啊等等这些媒介的透射率。整个成雾的模型非常简单：如果透射率是百分之百，那么就是一张没有雾气的图，而没有透射过来的光强决定了雾的产生，因为媒介产生了反射，反射的光是白色的。这个模型就是原场景图加上未透射过来而被反射的光强。我们已知的信息只有$\mathbf I$，但是实际上这里的$A$可以通过计算图片最亮的像素点得到。对上式进行最小滤波，由于$t(\mathbf x)$以及$\mathbf{A}$是不会影响最小化操作的，我们可以轻易得到：
$$
\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(I^{c}(\mathbf{y})\right)=\tilde{t}(\mathbf{x}) \min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(J^{c}(\mathbf{y})\right)+(1-\tilde{t}(\mathbf{x})) A^{c}
$$
这里我们使用$\tilde {t}$，表示这里的透射率是待估计的量，而上标${}^{c}$表示颜色通道，对上式稍加变形就可以得到：
$$
\begin{array}{r}{\min _ {c} \min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(\frac{I^{c}(\mathbf{y})}{A^{c} }\right) )=\tilde{t}(\mathbf{x}) \min _ {c}\left(\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(\frac{J^{c}(\mathbf{y})}{A^{c} }\right)\right)} {+(1-\tilde{t}(\mathbf{x}))}\end{array}
$$
由于暗通道先验信息，我们知道无雾场景的暗通道$J^{\text{dark} }$是趋于0的:
$$
J^{d a r k}(\mathbf{x})=\min _ {c}\left(\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(J^{c}(\mathbf{y})\right)\right)=0
$$
将这个式子带入上式，可以很容易得到：
$$
\tilde{t}(\mathbf{x})=1-\min _ {c}\left(\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(\frac{I^{c}(\mathbf{y})}{A^{c} }\right)\right).
$$
实际上，  
$\min _ {c}\left(\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(\frac{I^{c}(\mathbf{y})}{A^{c} }\right)\right)$正是经过normalize的雾气图$\frac{I^{c}(\mathbf{y})}{A^{c} }$的暗通道图，因此我们可以直接得到对于透射率的估计。在这里我们可以加另外一个参数$\omega$，因为透射率是1的情况很少，会使得照片显得不自然而且损失一些信息，因此我们可以通过调整$\omega$来使得结果更加自然，最终得到的透射率估计为:
$$
\tilde{t}(\mathbf{x})=1-\omega \min _ {c}\left(\min _ {\mathbf{y} \in \Omega(\mathbf{x})}\left(\frac{I^{c}(\mathbf{y})}{A^{c} }\right)\right)
$$
### [](about:blank#Soft-Matting "Soft Matting")Soft Matting

原始得到的$\tilde t$是比较粗糙的。因此作者提出了需要用一个soft matting来进一步改进。这部分原理我看的不是很明白，具体做法如下：

我们想得到的最佳的投射矩阵为$\mathbf t$，之前简单得到的投射矩阵为$\tilde{\mathbf t}$，我们要做的是优化下面这个cost funtion：
$$
E(\mathbf{t})=\mathbf{t}^{T} \mathbf{L} \mathbf{t}+\lambda(\mathbf{t}-\tilde{\mathbf{t} })^{T}(\mathbf{t}-\tilde{\mathbf{t} }).
$$
这里$\mathbf L$是Matting Laplacian矩阵，而$\lambda$是一个正则参数。位于$\mathbf L$的元素$(i,j)$定义为：
$$
\sum_ {k |(i, j) \in w_ {k} }\left(\delta_ {i j}-\frac{1}{\left|w_ {k}\right|}\left(1+\left(\mathbf{I}_ {i}-\mu_ {k}\right)^{T}\left(\Sigma_ {k}+\frac{\varepsilon}{\left|w_ {k}\right|} \mathrm{U}_ {3}\right)^{-1}\left(\mathbf{I}_ {j}-\mu_ {k}\right)\right)\right).
$$
这里的$\mathbf I_i, \mathbf I_j$是输入图像$\mathbf I$的颜色，而$\delta_ {i,j}$是克罗内克函数，也是之前提到过的冲激函数。 $\mu_ {k},\Sigma_ {k}$是在窗口$w_ {k}$中像素的颜色均值以及协方差矩阵，$U_ {3}$是3*3单位矩阵，而$\varepsilon$是正则参数， $\left|w_ {k}\right|$则是窗口$w_k$内像素的个数。

最佳的$\mathbf t$可以通过解下面的稀疏线性方程得到：
$$
(L+\lambda U)\mathbf t = \lambda \tilde{\mathbf t}.
$$
经过soft matting处理的透射图如下图：  
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/dehaze2.png)

可以看到，经过处理的图更加的精细，能得到更细致的结果。

### [](about:blank#%E6%81%A2%E5%A4%8D%E5%8E%9F%E5%9B%BE "恢复原图")恢复原图

根据投射矩阵如何恢复原图？根据成雾模型，我们可以很容易得到：
$$
\mathbf{J}(x) = \frac{\mathbf{I}(x) - \mathbf{A}(1 - t(x))}{t(x)}.
$$
但是有时候如果求得的$t$过小，会使得颜色过曝,放大噪声，我们可以设定一个最小阈值$t_0$，进行下面的处理：
$$
\mathbf{J}(\mathbf{x})=\frac{\mathbf{I}(\mathbf{x})-\mathbf{A} }{\max \left(t(\mathbf{x}), t_ {0}\right)}+\mathbf{A}
$$
### [](about:blank#A%E7%9A%84%E4%BC%B0%E8%AE%A1 "A的估计")A的估计

到目前为止，我们都假定总光强$\mathbf A$是已知的。实际上这个$A$是可以根据图片估计的，先前的算法会通过计算最亮的pixel来得到$\mathbf A$，但是实际上这个最亮的像素可能是来自于一个白色的汽车或者建筑，而不是天空反射的结果。在这里作者提出的方法是：首先根据暗通道图，选择最明亮的$0.1%$像素，这可以保证我们选到的区域是大片的亮色区域，比如天空，而不会选中一辆白色的小车等等。接下来在选中的这些位置里挑原图像素最亮的点作为$\mathbf A$的值。

下面是一些去雾算法的效果图。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/dehaze3.png)

这个算法的缺点是速度慢，难以满足实时的要求。

这个文章的idea可以说是金点子了，想法新颖，容易理解，效果显著，能想出这样的idea真是太牛逼了，可遇不可求。
