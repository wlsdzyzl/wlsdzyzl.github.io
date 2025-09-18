---
title: 机器学习——PLA
date: 2018-07-28 22:45:17
tags: [machine learning,classification]
categories: 机器学习
mathjax: true
---

对研究生要跟的导师还不确定，暑假打算学习点专业课与英语，也迟迟没有做好。我想不管哪个实验室应该都不会离开机器学习吧。因此开始看这方面的东西。

<!--more-->
今天接触了一个算法叫**PLA**（Percetron Learning Algorithm）,用来做线性分类的算法。它应用的前提是样本集是线性可分的。用二维特征值的样本来举例子：

![linear separable](https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=793659404,4189322929&fm=27&gp=0.jpg)


我们要的就是通过算法来找到这条线。对于二维的样本（特征分别为$x_1$,$x_2$）,则分类结果为-1，+1，分别表示为negative，positive（这与另一种常用的分类算法不一致）。思想就是每个特征对应一个参数，乘积之后如果大于某个阈值，则设定为分类结果为+1，小于则为-1。若为特征添加一个特征$ x_0 $恒等于一，则用向量化可以将分类过程写成如下形式：
$$ result(X) = sign(W{X^T}) $$
其中W为特征的参数向量，我们使用$y$来表示样本真实类别。


整个算法的思想其实很简单，刚开始画出一条线，如果分错了，则往正确的方向旋转这条线。但是如何旋转这条线，旋转多少角度，还是很有意思的。一般的想法都是从图直观上来看，利用代价函数（cost function）来解决，不过对于这个简单的线性分类，用代价函数进行梯度下降还是相对来说计算量还是比较大的。这个算法让我觉得厉害的地方在于它向量化不光是为了提高计算效率，而是从向量的角度来考虑一步步向结果逼近的：遇到的分类错误有两种情况，如果$y$应该是正，但是$W{X^T}$得到的是负的，从向量角度来说，$W$与$X$的夹角太大，因此内积为负，我们要减小两个向量的角度，可以令$W=W+X$,相反，$y$应该是负，结果却为正，那么$W$与$X$的夹角太小，可以令$W=W-X$，这样就增大了夹角，从下图可以很直观的看出来这个道理：

![向量加减](https://gss3.bdstatic.com/7Po3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike72%2C5%2C5%2C72%2C24/sign=71339aceab773912d02b8d339970ed7d/b3b7d0a20cf431ad4cdf9f4a4936acaf2edd98b0.jpg)


合并两种情况，则每次遇到被错误分类的样本$X_n$，我们对参数向量$W_t$进行如下更新（其中$t$表示修正的次数）：$$ W_ {t+1} = W_t + y_nX_n $$
下面主要来证明一下，对于线性可分的样本来说，这个算法一定会停止，找到那条符合的参数向量$W_f$。我们可以知道：

$$ 
y_n{W_f}^TX_n >= _ {min}[ y_nX_nW_f^T]>0
$$

而

$$
W_ {t+1}W_f^T = W_tW_f^t + y_nX_nW_f^T >= W_tW_f^T + _ {min}[ y_nX_nW_f^T] 
$$

因此我们可以得到：

$$
W_ {t+1}W_f^T >= W_tW_f^T >= W_0W_f^T +(t+1) *_ {min}[ y_nX_nW_f^T]
$$

因为我们每次找到一个出错点才进行修正，出错点为（$X\_n,y\_n$），可以知道$ y\_nW_tX\_n^T<0 $，则：

$$
\Vert W_ {t+1} \Vert ^2 = \Vert W_t \Vert ^2 + \Vert y_nX_n \Vert ^2+2y_nW_tX_n^T>= \Vert W_t \Vert ^2+_ {max}[ \Vert X_n \Vert ^2]
$$
因此我们可以得到：

$$
 \Vert W_ {t+1} \Vert ^2 = \Vert W_t \Vert ^2 +  \Vert y_nX_n \Vert ^2+2 \times y_nW_tX_n^T>= \Vert W_0 \Vert ^2+ (t+1) \times _ {max}[ \Vert X_n \Vert ^2]
$$

最后，假设最开始$W_0=0$，通过正规化，我们可以算出$W_t$与$W_f$之间的角度是不断逼近的（角度重合时候也就得到了正确的参数，实际上角度相同后我们不在乎向量的模的大小，因为它不会影响$W_t^TX_n$的符号）：

$$
\frac{W_tW_f^T}{ \Vert W_t \Vert  \Vert W_f \Vert } >= \frac{t \times _ {min}[y_nW_fX_n]}{\sqrt{t} \times _ {max} \Vert X_n \Vert  \Vert W_f \Vert } = \sqrt{t} \frac q R
$$

其中：$q = _ {min}[y_nW_fX_n],R^2 = ( _ {max} \Vert X_n \Vert  )^2$，而正规化后内积是小于等于1的（此时方向一致），可以得到$ t<=\frac {R^2} {q^2} $，可以得到，最多经过$\frac {R^2} {q^2} $次修正即可得到正确结果。

到这里就证明结束了,以后会上传相关的代码。

可以看到虽然算法实现很简单，但其中的推理还是不容易的。




