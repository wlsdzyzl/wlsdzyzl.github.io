---
title: SLAM——视觉里程计（三）PnP
date: 2019-01-18 00:00:00
tags: [SLAM,pnp]
categories: SLAM
mathjax: true
---        


上篇文章的内容是关于对极几何约束的，它主要是用来解决2d-2d的情况，也就是我们只有两张不同角度的投影求空间点。现在假如我们已经知道了空间点的位置，接下来要的问题是3d-2d，这个时候我们可以用的方法是PnP来估计位姿。


<!--more-->


因为PnP需要有3D点的位置，因此对于双目相机或者是RGB-D相机，我们可以一开始就使用PnP来求得位姿，而对于单目相机，必须需要使用对极约束得到第一组对点的空间估计，才能在后面使用PnP。这个叫做单目相机的初始化。

PnP问题有很多解法，如直接线性变换，只需要3对点的P3P等等，还可以使用Bundle Adjustment。

### [](about:blank#%E7%9B%B4%E6%8E%A5%E7%BA%BF%E6%80%A7%E5%8F%98%E6%8D%A2 "直接线性变换")直接线性变换

现在假设一个空间点$P$，它的齐次坐标为$P=(X,Y,Z,1)^T$。而在图像中，它被投影到特征点$x = (u,v,1)^T$，这时候相机的位姿$R,t$都是未知的，是我们需要估计的量。我们定义增广矩阵$T = [R|t]$为一个$3\times 4$的矩阵，它包含了旋转与平移的信息，则：
$$
s\begin{pmatrix} u\\ v\\ 1 \end{pmatrix} = K \left(\begin{array}{c|c} R&t \end{array}\right) P = \left(\begin{array}{ccc|c} t_1&t_2&t_3&t_4\\ t_5&t_6&t_7&t_8\\ t_9&t_ {10}&t_ {11}&t_ {12} \end{array}\right) \begin{pmatrix} X\\ Y\\ Z\\ 1 \end{pmatrix}
$$
在这里，$s$为相机坐标下的Z值，也就是$s=t_9X+t_ {10}Y+t_ {11}Z+t_ {12}$。由于$K$是个常数，我们为了简化问题将它忽略掉了。展开上面的式子，消去s，我们可以得到：
$$
u = \frac{t_1X+t_2Y+t_3Z+t_4}{t_9X+t_ {10}Y+t_ {11}Z+t_ {12} }, v = \frac{t_5X+t_9Y+t_7Z+t_8}{t_9X+t_ {10}Y+t_ {11}Z+t_ {12} }
$$
我们定义$T$的行向量分别为$\mathbf{t}_1,\mathbf{t}_2,\mathbf{t}_3$，则：
$$
\mathbf{t}_1 P = u \mathbf{t}_3P, \mathbf{t}_2 P = v \mathbf{t}_3P
$$
因此我们可以看到的是每对点提供了两个线性约束。假设一共有N个点，则我们可以列出下面的线性方程组：
$$
\begin{pmatrix} P_1^T &0& -u_1P_1^T\\ 0&P_1^T&-v_1P_1^T\\ \vdots&\vdots&\vdots\\ P_N^T &0& -u_NP_N^T\\ 0&P_N^T&-v_NP_N^T \end{pmatrix} \begin{pmatrix} \mathbf{t}_1^T & \mathbf{t}_2^T & \mathbf{t}_3^T \end{pmatrix} = 0
$$
由于$\mathbf{t}$维度为12维，因此最少通过6对匹配点就可以解得这个方程。这种方法称为直接线性变换。当然，如果匹配点数过多，可以使用最小二乘，SVD等解超定方程。

在这个求解中，我们直接将T矩阵看成12个未知数，而忽略他们的联系。因此求出的解不一定满足旋转矩阵的约束。因此对于求得的旋转矩阵R，我们需要对他进行一个最好的近似，可以用QR分解完成。

### [](about:blank#P3P "P3P")P3P

我们上面说$\mathbf{t}$的维度为12，但是我们知道实际上旋转和平移各只有3个自由度，总共也就只有6个自由度。因此实际上使用的点对应该更少。而P3P就只需要3对点来估计位姿。不过值得注意的是P3P并不会直接得到位姿，而是得到了各个点在相机坐标系下的坐标。然后通过下一次要说的3D-3D来求位姿。为什么要这样？因为3D-3D下对位姿的估计是非常简单的。

现在假设我们输入了3个3d点的世界坐标以及图像上的2d投影坐标，希望求的是它们在当前相机位姿下的相机坐标，从而求得位姿变换。如图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/pnp.png)

另外一种做法是输入了点的在上一个相机位置的相机坐标，以及当前图像上的2D投影坐标，这时候求得的就是当前相机位姿相对于上一个相机位姿的位姿变换。二者本质是一样的。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/pnp2.png)

P3P求解是从余弦定理开始的。观察最开始的图，我们可以得到：
$$
OA^2 + OB^2 - 2\cdot OA \cdot OB \cdot\cos\langle a,b\rangle = AB^2\\ OA^2 + OC^2 - 2\cdot OA \cdot OC \cdot \cos \langle a,c \rangle = AC^2\\ OB^2 + OC^2 - 2\cdot OB \cdot OC \cdot \cos \langle b,c \rangle = BC^2
$$
对上述式子两侧同时除以$OC^2$，并且令：
$$
y = \frac{OB}{OC},x = \frac{OA}{OC}
$$
则我们得到：
$$
x^2 + y^2 - 2xy\cos\langle a,b \rangle = \frac{AB^2}{OC^2}\\ x^2 + 1 - 2x\cos \langle a,c \rangle = \frac{AC^2}{OC^2}\\ y^2 + 1 - 2y \cos \langle b,c\rangle = \frac{BC^2}{OC^2}
$$
令：
$$
u = \frac{AB^2}{OC^2},v = frac{BC^2}{AB^2}, w = \frac{AC^2}{AB^2}
$$
则我们可以得到：
$$
x^2 + y^2 - 2xy\cos\langle a,b \rangle = u\\ x^2 + 1 - 2x\cos \langle a,c \rangle = vu\\ y^2 + 1 - 2y \cos \langle b,c\rangle = wu
$$
将第一个式子带入后面两个，得到：
$$
(1 - w)x^2 - w y^2 - 2x\cos \langle a,c\rangle + 2wxy\cos\langle a,b\rangle + 1 = 0\\ (1 - v)y^2 - v x^2-2y\cos\langle b,c \rangle + 2vxy\cos\langle a,b \rangle+1 = 0
$$
上面的式子中，我们知道的：
$$
w,v,\cos \langle a,c\rangle,\cos \langle b,c\rangle,\cos\langle a,b\rangle,
$$
因为剩余的未知量只剩两个，因此我们可以求得$x,y$。不过这个方程为二元二次方程，求解较为复杂，需要使用吴消元法。最后求出来的有四组解。为了得到正确的解，我们还需要一个额外的点来检验，选取重投影误差最小的点。

现在知道了$x,y$的值，我们可以进一步解方程，求得$OA,OB,OC$的值。为了求得坐标，我们只需要将$a$的坐标$(u,v,1)$归一化后得到向量，乘以$OA$的长度即可。这个利用了经过原点的一条直线上的点在各个坐标轴的投影三角形相似的原理。

### [](about:blank#Bundle-Adjustment "Bundle Adjustment")Bundle Adjustment

PnP问题同样也能使用万金油式的Bundle Adjustment（BA）来解决。为了使用Bundle Adjustment，我们需要把PnP问题构建成一个定义于李代数上得非线性最小二乘问题。之前说的方法，我们都是先求相机位姿再求得空间点，或者先求空间点，从而得到相机位姿。而在BA问题中，我们可以将它们都看成优化变量，放在一起优化。这是非常通用得求解方式，实际上BA在后端做全局优化的时候使用得更多。不过目前我们就讨论Bundle Adjustment如何被用来解决PnP问题。

在PnP问题中，BA主要是一个最小化重投影误差（reprojection errpr）的过程。考虑n各三维空间点$P$以及其投影$p$，我们希望计算的是相机的位姿$R,t$，它们的李代数表达为$\xi$。假设某空间点坐标为$P_i = [X_i,Y_i,Z_i]^T$，其像素坐标为$p_i = [u_i,v_i]^T$。我们知道像素位置与空间点位置的关系如下：
$$
s_i\begin{bmatrix} u_i\\ v_i\\ 1 \end{bmatrix} = K \exp(\xi ^{\hat{} }) \begin{bmatrix} X_i\\ Y_i\\ Z_i\\ 1 \end{bmatrix}
$$
即:
$$
s_ip_i = K\exp(\xi ^{\hat{} })P_i
$$
当然，上述过程中包含了齐次坐标到非齐次坐标的转换。现实世界中，我们采集到的数据往往存在着噪声，因此我们要把误差求和，并使其最小化，也就是最理想的位姿为：
$$
\xi ^* = \arg\min_ {\xi} \frac{1}{2}\sum_ {i=1}^n \left\Vert p_i - \frac 1 {s_i}K\exp(\xi^{\hat{} })P_i \right\Vert^2
$$
如果我们观察上式，$ \frac 1 {s_i}K\exp(\xi^{\hat{} })P_i$可以说是$P_i$的重投影，所以这个误差被称为重投影误差。如下图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/pnp3.png)

因为这个重投影误差要考虑很多的点，因此最后到每个相机的重投影误差可能都不会精确为0。使用齐次坐标的话，误差的维度是3维，但是最后一维我们设定为1，因此不应该考虑它的误差项。因此我们一般在优化时候使用非齐次坐标，因此误差项维二维。最小二乘法的优化问题我们之前讨论过了，可以使用高斯牛顿法。列文伯格——马夸尔特法等进行求解。不过，我们首先要求的是每个误差项关于优化变量的导数，求导数的过程其实也是线性化的过程：
$$
e(x + \Delta x) \approx e(x) + J\Delta X
$$
假如$e$为误差项，它的维度为2维，而$x$为相机位姿（李代数）为6维，这时候的雅可比矩阵$J$为$2\times 6$的矩阵。现在我们来推导$J$的形式。下面的推导需要用到之前关于[李群李代数](https://wlsdzyzl.top/2018/11/09/SLAM%E2%80%94%E2%80%94%E6%9D%8E%E7%BE%A4%E5%92%8C%E6%9D%8E%E4%BB%A3%E6%95%B0/)的讲解。

假如，我们假设相机坐标系下的坐标为$P’$，则：
$$
P' = (\exp(\xi^{\hat{} })P) = [X',Y',Z']^T
$$
则它的投影为：
$$
su' = KP'
$$
展开得到：
$$
\begin{bmatrix} su'\\ sv'\\ s \end{bmatrix} = \begin{bmatrix} f_x & 0 & c_x\\ 0 & f_y & c_y\\ 0&0&1 \end{bmatrix}\begin{bmatrix} X'\\ Y'\\ Z'\\ \end{bmatrix}
$$
消去$s = Z’$，我们可以得到：
$$
u' = f_x \frac{X'}{Z'} + c_x, v' = f_y \frac{Y'}{Z'} + c_y, p' = [u',v']^T
$$
实际上上面的内容就是对于针孔相机模型的回顾。而这个$u’,v’$正是重投影得到的，误差就是它和实际像素坐标的值，即$e(x) = (p - p’)$。接下来，我们来求$J$。这里我们使用左乘扰动模型。根据求导的链式法则：
$$
\frac{\partial e}{\partial \xi} = \lim_ {\delta\xi \rightarrow 0} \frac{e(\delta \xi \oplus \xi) - e(\xi)}{\delta \xi} = \frac{\partial e}{\partial P'}\frac{\partial P'}{\partial \xi}
$$
在这里$\oplus$指的是对$\xi$左乘扰动模型的操作。因为左乘扰动模型是在李群上进行的，在李代数上的形式会比单纯的相加更复杂一点。

我们很容易得到的是$\frac{\partial e}{\partial P’}$：
$$
\begin{equation} \frac{\partial e}{\partial P'} = - \begin{bmatrix} \frac{\partial u'}{X'_i} & \frac{\partial u'}{Y'_i} & \frac{\partial u'}{Z'_i}\\ \frac{\partial v'}{X'_i} & \frac{\partial v'}{Y'_i} & \frac{\partial v'}{Z'_i} \end{bmatrix} \end{equation}
$$
而在之前的推导中，我们知道：
$$
\begin{aligned} \frac{\partial (TP)}{\partial \xi} &= \lim_ {\delta \xi \rightarrow 0} \frac{\begin{bmatrix} \delta \phi^{\hat{} }(RP+t) + \delta P\\ 0 \end{bmatrix} }{\delta \xi}\\ &= \begin{bmatrix} I&-(RP+t)^{\hat{} }\\ 0&0 \end{bmatrix}\\ &\triangleq (TP)^{\bigodot}\\ &=\begin{bmatrix} I&-(P')^{\hat{} }\\ 0&0 \end{bmatrix} \end{aligned}
$$
而$P’ = TP$，如果只取前3维，从而我们可以得到：
$$
\begin{equation} \frac{\partial P'}{\partial \xi} = [I,-{P'}^{\hat{} }] \end{equation}
$$
将$(1),(2)$相乘可以得到：
$$
\frac{\partial e}{\partial \xi} = - \begin{bmatrix} \frac{f_x}{Z'} & 0 & -\frac{f_xX'}{Z'^2} & -\frac{f_xX'Y'}{Z'^2} & f_x + \frac{f_xX^2}{Z'^2} & -\frac{f_xY'}{Z'}\\ 0 & \frac{f_y}{Z'} & -\frac{f_yY'}{Z'^2} &-f_y - \frac{f_yY'}{Z'^2} & \frac{f_yX'Y'}{Z'^2} & \frac{f_yX'}{Z'} \end{bmatrix}
$$
这个之前有负号，是因为我们对$e$的定义是观测值减去预测值，而观测值是常数。如果对于se(3)的定义是旋转在前，平移在后，只要将前3列与后3列对调即可。由此我们得到了一阶雅可比矩阵。

此外，除了对相机位姿的优化，就像我们最开始说的，我们可以对空间点的位置也进行优化。所以需要求的是误差关于$P$的导数。这个导数相对来说会简单很多：
$$
\frac{\partial e}{\partial P} = \frac{\partial e}{\partial P'}\frac{\partial P'}{\partial P}
$$
第一项已经知道了。至于第二项，按照定义：$P’ = RP+t$，因此这个导数为$R$。因此：
$$
\frac{\partial e}{\partial P} =-\begin{bmatrix} \frac{f_x}{Z'} & 0 & -\frac{f_xX'}{Z'^2}\\ 0 & \frac{f_y}{Z'} & -\frac{f_yY'}{Z'^2} \end{bmatrix}R
$$
这两个雅可比矩阵（分别是误差关于位姿的和关于空间点位置的）非常重要，是Bundle Adjustment的关键。

我在思考的问题是，为什么一定要建出来一个中间变量$P’$，如果直接对$P,\xi$求导，则得到的结果是用$\xi,P,K$表示的导数，理论上也能带我们走向极小值。
