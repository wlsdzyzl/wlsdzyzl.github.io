---
title: 数学——EVD与SVD
date: 2018-11-28 20:59:54
tags: [mathematics, algebra, SVD]
mathjax: true
categories: 数学
---
这个博客介绍特征值分解（Eigen Value Decomposition,EVD）和奇异值分解(Singular Value Decomposition),　可以当作机器学习的补充材料。
<!--more-->
SVD在线性代数中是一个非常重要的东西。Strang曾经说过：它远远没有得到它应该有的名气。在考研的线性代数中也从来没有见过SVD的身影，不过在原来在做一些图像处理相关的程序时候，经常用到OpenCV中的SVD。

##  Theory ##
SVD和对角化一个矩阵紧密连接在一起，回想一下，如果有一个实对称矩阵$A_ {n \times n}$，则有一个正交矩阵$V$和一个对角矩阵$D$，使得$A = VDV^T$。这里$V$的每一列对应$A$的特征值，形成一个$\mathbb{R}^n$空间的正交基，而$D$的对角元素是$D$的特征值。这个就是EVD，eigenvalue decomposition。

对于SVD来说，我们有一个任意的实矩阵$A_ {m \times n}$，有两个正交矩阵：$U$和$V$以及一个对角矩阵$\Sigma$，使得$A = U \Sigma V^T$。这种情况下，$U$是$m\times m$矩阵，而$V$是$n \times n$矩阵，因此$\Sigma$和$A$的形状一样，是$m\times n$，不过它只有对角元素非零。$\Sigma$的对角元素，$\Sigma_ {ii} = \sigma_i$，可以被安排成非负以及递减的顺序，其中如果$\sigma_i>0$，它是$A$的奇异值，而$U,V$的列向量分别是$A$的左右奇异向量。

我们可以把矩阵看作一个线性转换，通过这个想法来进一步发现EVD和SVD之间的相似之处。
### EVD ###
对于一个实对称矩阵$A$，这个转换把一个$\mathbb{R}^n$向量依然转换成$\mathbb{R}^n$为向量，也就是domain和codomain都是$\mathbb{R}^n$。另外提一下，假如转换后对应的元素为$T(x)$，则成$T(x)$为一个image，而所有image的集合称为$range$。$V$题提供了一个非常好的正交基，如果一个$\mathbb{R}^n$向量被这个正交基来表示，我们也可以看到，这个转换扩大了一些这个单位正交基中的成分，对应的就是较大的特征值$\sigma_i$。
我希望可以举个例子来帮助理解，假如向量$x \in \mathbb{R}^n$:
$$
\begin{aligned}
Ax &= V \Sigma V^Tx\\
&= \begin{bmatrix}
v_1 & \cdots & v^n\\
\end{bmatrix}\begin{bmatrix}
\sigma_1 &\cdots& 0\\
\vdots & \ddots & \vdots\\
0 & \cdots & \sigma_n
\end{bmatrix}\begin{bmatrix}
v_1^T\\
\vdots\\
v_n^T
\end{bmatrix}x \\
&= \begin{bmatrix}
\sigma_1v_1&\cdots&\sigma_nv_n
\end{bmatrix}
\begin{bmatrix}
v_1^Tx\\
\vdots\\
v_n^Tx
\end{bmatrix}\\
&=\sigma_1v_1v_1^Tx + ...+ \sigma_nv_nv_n^Tx
\end{aligned}
$$

观察上面的展开，实际上我们可以发现的是，$V^TX$得到的，实际上是在$V$这个正交基下，$x$的“坐标值”，而$V\Sigma$实际上是经过转换后的坐标轴，放大了对应特征值的倍数。从这里，我们就可以很清楚得看到A这个转换在做什么。
### SVD ###
现在我们来看看，SVD的解释。同样我们把任意一个实矩阵$A$看作转换,它把$\mathbb{R}^n$向量，转化为$\mathbb{R}^m$，这意味着这个转换$domain$是$\mathbb{R}^n$，而$codomain$是$\mathbb{R}^m$，而image ∈ range ∈ $\mathbb{R}^m$。因此对于domain和range都搞一个单位正交基才是比较合理的，而$U,V$恰好提供了这样的基，分别用来表示domain的向量和range的向量。那么这个转换就和上面一样，变得比较容易理解了，它同样放大了一些成分，对应的是singular value的大小，同时抛弃了一些成分，对应的是singular value为0的方向。SVD告诉我们怎样选择正交基，使得转换被表示成最简单的方式————对角的形式。

那么我们如何选择得到这些基？想要使中间矩阵的形式是对角的，很容易，只要让$Av_i = \sigma_iu_i$即可。

为了理解这个，我们假设$m \geq n$，那么如果$A v_i = \sigma_i u_i$，则：
$$
\begin{aligned}
AV &= A\begin{bmatrix}
v_1&\cdots v_n
 \end{bmatrix}\\
&= \begin{bmatrix}
Av_1 & \cdots &Av_n
\end{bmatrix}\\
&= \begin{bmatrix}
\sigma_1 u_1 & \cdots & \sigma_n u_n
\end{bmatrix}\\
&= U_ {m\times n}\Sigma_ {n\times_n} 
\end{aligned}
$$

这保证了$\Sigma$的对角化，不过我们很容易发现的是上面的系数不对，$\mu$并不满足基的定义，它没有到达$m$个，而$\Sigma$也随之不是$m\times n$形状的矩阵。

如果我们先保证$V$是单位正交基了，那么$U_ {m\times m}$中很多维度是没有什么意义的，因此将$U$扩充为基，并且将$\Sigma$矩阵也对上，对应的元素置0即可。

如果$m< n$，则是一样的道理，只不过这个维度被$m$限制住了。而且实际上这个$\Sigma$还被$A$的秩限制住，毕竟$\mathbb{R}(AB)\ge \min (\mathbb{R}(A),\mathbb{R}(B))$，而$\mathbb{R}(U)=m,\mathbb{R}(V)=n$，这意味着，r如果要求各个$\sigma_i$不同且$U$为一组基，那么$\sigma_i > 0;i = 1,...,k;k \ge \mathbb{R}(A)$.

通过上面的想法，我们很容易将A表示为对角形式。不过实际上，即使保证$V$是正交基，我们也很难保证$U$是正交的。因此使得V的正交性能在A下依然保存是非常关键的。而实际上，$A^TA$的特征矩阵正好满足这个条件。

$A^TA = VDV^T$，也就是对$A^TA$进行EVD。可以得到：
$$
Av_i \cdot Av_j = (Av_i)^T (Av_j) = v_i^TA^TA v_j = v_i^TA^T \lambda_j v_j = \lambda_j v_i v_j = 0
$$

可以看到，在这种情况下，$\{Av_1,Av_2,...,Av_n\} = \{\sigma_1u_1,...,\sigma_nu_n\}$是互相是正交的，这正是我们想要的。而这个集合中的非零向量，形成了一个$A$的range的正交基。因此，$A^TA$的特征向量和它们与A得到的image，使得$A$可以被表示成对角形式。

我们继续把上面的分解补全。注意，如果$i = j$，那么$Av_i \cdot Av_j \Vert Av_i \Vert^2= \lambda_i$. 为了让$u_i$是单位向量，我们对其进行标准化：
$$
u_i = \frac{Av_i}{\Vert Av_i\Vert} = \frac{1}{ \sqrt{\lambda_i} } Av_i\\
\sigma_i = \sqrt{\lambda_i}
$$

我们也很容易推导，$\lambda_i \ge 0$的个数是$k$个，可以由秩得到。而$D$中特征值的顺序如果是按照从大到小的顺序排列，那么$\Sigma$中也是一样的递减顺序。

如果$k< m$，那么将$U$扩展到正交基即可。这样我们就得到了想要的SVD。总结一下，V是$A^TA$的特征向量组成，被称为右侧的奇异向量，$\Sigma$由特征值组成，其中$\sigma_i = \sqrt{\lambda_i}$，而$U$是正交化$Av_i$的结果，有必要的话再进行拓展，使其成为一个正交基。

需要注意的一点是，我们在这里计算SVD是通过计算$A^TA$的特征值和特征矩阵，但是实际上还有其他的办法，在很多应用中SVD的实际用途是计算出$A^TA$的特征值和特征矩阵。

在我们的构造方法中，我们从$A^TA$的EVD来得到SVD，而实际上从SVD的角度出发，我们也很容易得到EVD，如果$A = U\Sigma V^T$：
$$
A^TA = V\Sigma^T U^T U \Sigma V^T = V \Sigma^T\Sigma V^T
$$

可以很容易看到上面正是$A^TA$的EVD，同理也很容易得到：
$$
AA^T = U\Sigma V^TV \Sigma^T U^T = U \Sigma \Sigma^T U^T
$$

这意味着实际上$U$正是由$AA^T$的特征向量组成的。值得一提的是，如果$A$是是对成矩阵，那么$A^2=A^TA=AA^T$，它们的EVD也是相同的，特征值为$\lambda^2$，其中$\lambda$为A的特征值，而且此时的SVD与EVD是等价的。

## SVD的几何意义 ##

我们可以通过对单位圆上的点利用A矩阵进行转换，来明白$A$是如何扭曲$\mathbb{R}^n$空间的。假如点x在单位圆(球)上，意味着$x = v_1x_1 + v_2x_2+...+v_nx_n$，其中$\sum_ {i=1}^nx_i^2 = 1$，则:
$$
Ax = U\Sigma Vx = x_1\sigma_1u_1 + ...+ x_k\sigma_ku_k.
$$

假设$y_i = \sigma_ix_i$，则单位球体的image也等于$\sum_ {i=1}^k y_iu_i$，其中：
$$
\sum_ {i=1}^k \frac{y_i^2}{\sigma_i^2} = \sum_ {i=1}^k x_i^2 \ge 1.
$$

如果$\mathbb{R}(A)= k = n$，那么上述不等式是相等的。其他情况下，意味着一些纬度被抛弃了。 所以$A$的转换实际上是先抛弃$n-k$个维度，将其压缩到$k$维，再通过$\Sigma$来对不同维度的权值进行放缩，最后拓展的$m$维空间。下图展示了这个过程(n=m=3,k=2)：
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/G6T%7DO%5B7%5BIW70%5DP0VF2D%5DR89.png)

我们可以很容易得到，$\Vert A \Vert_2$，算子范数，定义为$\frac{\Vert Ax \Vert}{\Vert x \Vert}$的最大值，也就是$\sigma_1$，$A$最大的奇异值。也就是：$\Vert Ax \Vert \leq \sigma\Vert x \Vert,x \in \mathbb{R}^n$，当$x$为$v_1$的整数倍时等号成立。

## SVD的分块矩阵以及外积形式 ##

实际上，SVD可以写成下面分块矩阵的形式：
$$
A = \left [\begin{array}{ccc|ccc}
u_1&\cdots&u_k&u_ {k+1}&\cdots&u_n
\end{array}\right ]
\left [\begin{array}{ccc|c}
\sigma_1&\cdots&0&0\\
\vdots&\ddots&\vdots&\vdots\\
0&\cdots&\sigma_k&0\\
\hline
0&\cdots&0&0\\
\vdots&\vdots&\vdots&\vdots
\end{array}\right]
\begin{bmatrix}
v_1^T\\
\vdots\\
v_k^T\\
\hline
v_ {k+1}^T\\
\vdots\\
v_ {n}
\end{bmatrix}
$$

这个结果可以写成：
$$
\begin{aligned}
A &= \begin{bmatrix}
u_1&\cdots&u_k
\end{bmatrix}
\begin{bmatrix}
\sigma_1&\cdots&0\\
\vdots&\ddots&\vdots\\
0&\cdots&\sigma_k
\end{bmatrix}
\begin{bmatrix}
v_1^T\\
\vdots\\
v_k^T
\end{bmatrix} + \begin{bmatrix}
u_ {k+1}&\cdots&u_n
\end{bmatrix}
\begin{bmatrix}
0&\cdots&0\\
\vdots&\ddots&\vdots\\
0&\cdots&0
\end{bmatrix}
\begin{bmatrix}
v_ {k+1}^T\\
\vdots\\
v_n^T
\end{bmatrix}\\
&=\begin{bmatrix}
u_1&\cdots&u_k
\end{bmatrix}
\begin{bmatrix}
\sigma_1&\cdots&0\\
\vdots&\ddots&\vdots\\
0&\cdots&\sigma_k
\end{bmatrix}
\begin{bmatrix}
v_1^T\\
\vdots\\
v_k^T
\end{bmatrix}
\end{aligned}
$$

上述形式是SVD的另一种表示：$A = U\Sigma V^T$，其中$U$为$m\times k,U^TU=I$，$\Sigma$为$k \times k$对角矩阵，对角元素大于0，$V$为$n \times k,V^TV = I$.

我们在这里的分块矩阵的公式和一般的矩阵乘积有点不一样，一般来说，两个矩阵相乘$XY$，我们关注的是$X$的行和$Y$的列。在这里，我们将用相反的方法表示。如果两个矩阵$X_ {m \times k},Y_ {k \times n}$,我们用$x_i$表示X中的第i列，用$y_i^T$表示Y中的第i行，那么：
$$
XY = \sum_ {i=1}^k x_iy_i^T
$$

而$x_i y_i^T$我们称为是这两个向量的外积（Outer Product），也就是矩阵中列乘上行的情况。

现在回到SVD中，令：
$$
X = \begin{bmatrix}
u_1&\cdots&u_k
\end{bmatrix}
\begin{bmatrix}
\sigma_1&\cdots&0\\
\vdots&\ddots&\vdots\\
0&\cdots&\sigma_k
\end{bmatrix} = \begin{bmatrix}
\sigma_1u_1&\cdots&\sigma_ku_k
\end{bmatrix}
$$
以及：
$$
Y = \begin{bmatrix}
v_1^T\\
\vdots\\
v_k^T
\end{bmatrix}
$$

可以得到：$$A = XY = \sum_ {i=1}^k\sigma_iu_iv_i^T.$$

这是SVD的另一种形式，它提供了A如何转换任何一个向量$x$的另一种解释。
$$
Ax = \sum_ {i=1}^k\sigma_iu_iv_i^Tx = \sum_ {i=1}^kv_i^Tx \sigma_iu_i
$$
因为$v_i^Tx$是一个标量。

这个时候$Ax$被表达为$u_i$的线性组合。所以通过outer product expansion可以看到，通过A转换将x中每个$v_i$成分转换成$u_i$成分，并且以$\sigma_i$的系数放缩。

这篇博客基本上是下面文献的部分翻译，更多内容请看：
[SVD](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_pdf/SVD-%5BDan-Kalman%5D.pdf)
