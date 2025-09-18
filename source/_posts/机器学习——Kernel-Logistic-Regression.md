---
title: 机器学习——Kernel Logistic Regression
date: 2018-11-06 13:37:08
tags: [machine learning,regression,SVM]
categories: 机器学习
mathjax: true
---
在我们的生活中，其实大部分使用的都是soft-margin SVM，很少会有人真正去使用hard-margin，因为我们无法避免噪声。现在想想，能否将soft-margin svm与我们之前的losgistic regress结合起来，会得到什么样的学习算法？
<!--more-->
之前我们试着将soft-margin SVM的数学描述写成了另外一种形式：

**min**  $\frac 1 2 W^TW + C\sum_ {n=1}^N max\{1-y_n(W^TX_n+b),0\}.$


实际上，这个形式如果你仔细观察这个形式，就会发现实际上它和losgistic regression加上L2正则化之后的形式非常的相似：

algorithm|minimize|constraint
 ---|---|---
 regularization by constraint|$E_ {in}$|$W^TW \leq C$
 hard-margin SVM|$W^TW$ |$E_ {in} = 0$[and more]
 L2 regularization |$\frac \lambda N W^TW + E_ {in}$|
 soft-margin SVM| $\frac 1 2 W^TW + CN\hat{E_ {in} }$|

只不过之前我们用$\lambda$，而现在采用的是一个常数C。我们知道，C越大，也就是对应的$\lambda$越小。在这里，我们将$ max\{1-y(W^TX_n+b),0\}$看作为一种error measurement。

如果画出这几个错误的曲线与0\1错误的对比：
$$

$$

实际上，这两个函数是非常接近的。当$y_n(W^TX_n+b)$很大的时候，logistic regression的$E_ {in}(\log_2^{1+e^{-ys} })$和 SVM的$\hat{E_ {in} }(max\{1-y(W^TX_n+b),0\})$都是趋于0的,而当$y_n(W^TX_n+b)$非常小（远小于0）的时候，它们的$E_ {in}$有都趋于$\vert y_n(W^TX_n+b) \vert$.

所以我们可以觉得，实际上SVM和logistic regression with L2 regularization几乎在做一样的事情。

现在我们希望可以将二者结合，例如我们用SVM的值来预测概率，我们也可以得到不错的结果。但是这个实际上没有用到logistic。或者我们用SVM的结果来做Logitsitc regression的初始值，但是既然logistic regression的$E_ {in}$是凸函数，因此实际上得到的最终结果区别也不大，也就是实际上就像没有用到SVM。

### Platt's Model ###

有一种这样的方法，将目标函数写为：$g(X) = \theta (A(W_ {SVM}^T \phi(X) + b_ {SVM}) +B)$

对上面的函数进行Logistic Regression。

所以这时候的Cost Function变成：
$$
min_ {A,B} \frac 1 N \sum_ {n=1}^N \log\left( 1+\exp\left( -y_n(A\cdot(W_ {SVM}^T\phi(X_n)+b_ {SVM})+B)\right)\right)
$$

这时候的cost funtion 好像看上去非常复杂，但是仔细想一想的话，实际上既然我们已经有了SVM的结果，因此实际上$W_ {SVM}^T\phi(X_n)+b_ {SVM}$就是一个值，而不再是一个向量，也就是我们只需要两个数的值：A，B。就可以融合SVM和Logistic Regression。

当然，如果SVM做的好的话，A的值应该是大于0的，B的值应该是接近于0的，因为我们得到的最终的参数分别为$AW_ {SVM}^T$与$Ab_ {SVM}+AB$，分别对应最终的W和b，如果SVM做的不错，意味着他们和$W_ {SVM},b_ {SVM}$差距太大。

上述中$\phi(X)$意味着利用了特征转换，也就是会使用kernel。可以得到比较不错的logistic regression在z空间不错的解。

但是上面这个办法，不能保证这是logistic regression在Z空间（转换之后的空间）真正最好的解。

### Kernal Logistic Regression ###

想要找到logistic regression在Z空间真正最好的解，一个办法是在Z空间做logistic regression。但是我们的转换实际上是由kernel提供的，方便计算$Z_n^TZ_m$。而logistic regression根本就不是二次规划问题，又如何用到kernel？

其实，我们一直在求的东西是$W$，$W$的维度是和$Z$的维度一样，那么$W$是不是$Z$的线性组合呢？

在SVM中，正是这样，还记得$W$怎么算吗：
$$
W = \sum_ {n=1}^N \alpha_n y_nX_n
$$

同样的，在PLA，Logistic Regression中也是这样。假如我们想想$W$的初始值为0,那么每次更新步骤不就是一个系数乘上一个$X_i$的线性组合吗？

实际上，在L2的regularization中，最好的W都是可以被Z线性组合表示出来的。

如何证明这件事情？

我们将optimal $W$ 写为$W^\*$. 
其中$W^\*$可以表示为垂直X空间的与平行X空间（线性组合即为平行）的。

$W^\* = W_ {\Vert} + W_ {\perp}$

我们可以证明的是，当$W^\*$中$W^{\perp}$为0.

如果$W_ {\perp}!=0$,则$W^{\*T}X = W_ {\Vert}^T X + 0$。

从另一方面来说：
$W^{ \* T}W^\* = W_ {\Vert} ^T W_ {\Vert} + W_ {\perp}^TW_ {\perp} >W_ {\Vert} ^T W_ {\Vert} $

这说明$W_ {\Vert}$比$W^\*$是更好的选择，与假设矛盾。

所以，$W^{\*} = \sum_ {n=1}^N\beta_nZ_n$.

因此，我们将W换成上式，那么就会出现了我们想要的$Z_nZ_m$.

L2 regularization变成下面的样子：
$$
min_ {W} \frac \lambda N \sum_ {n=1}^N\sum_ {m=1}^N \beta_n\beta_m Z_n^TZ_m + \frac 1 N \sum_ {n=1}^N \log \left(1 + \exp\left(-y_n \sum_ {m=1}^N \beta_m Z_m Z_n \right) \right)
$$

我们可以轻易将上式中的$Z_n^TZ_m$换成$k(x_n,x_m)$.从而实现在z空间上logistic regression的最优解。

从另一方面来说，$ \sum_ {n}^N\sum_ {m}^N \beta_n\beta_m k(x_n,_m) = \beta ^T K \beta$,可以将它看成一种特殊的正则化。所以实际上我们可以将KLR看成关于转换后的数据在$\beta$上的线性模型（原来是关于W的线性模型）。

一般来说$beta_n$都不为0,所以这个和SVM中的$\alpha_n$不一样。