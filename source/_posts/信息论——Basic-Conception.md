---
title: 信息论——Basic Conception
date: 2018-10-29 21:18:33
tags: [information theory]
categories: 信息论
mathjax: true
---
开一个栏目来记录信息论的学习。希望今年这门课不要挂掉。<!--more-->

## 信息熵(Entropy) ##

香农定义了信息熵，从而为通信时代奠定了数学基础。首先直观的说明一下什么是信息？香农说：信息是用来消除随机不确定性的东西。这个说法实在是太抽象了。

考虑两个简单的例子：1,明天太阳从东方升起；2，明天太阳要爆炸。哪句话包含了更多的信息？

直观上来讲，明显是第二句。因为第一句是句“废话”。所以我们可以这样理解，概率越小的事它的信息量越大。如果一件事发生概率为1，那它包含的信息为0.如果一件事发生概率为0，它的信息量为$\infty$.另外，如果两个事件是独立的，他们两个发生的信息量是二者之和。所以写成函数形式：
如果有两个独立事件a,b,假如f(x)表示x的信息量，则：
$$
If p(a)>p(b), f(a)< f(b);\\
f(0) = \infty, f(1) = 0;
f(a,b) = f(a)+f(b)
$$

通过上面的性质，结合概率，其实我们还是比较容易想到的是log函数。 f(x) = -log p(x),满足上面的所有条件。不过这是直观猜测，后面去证明一下log函数是唯一满足信息的定义的函数。

现在说明一下信息熵的定义：$H(X) =- \sum _ {x \in \mathcal{X} } p(x) \log p(X)$.信息熵是用来衡量一个系统的信息量，如果基于之前对事件信息的定义的话，从直观来讲这个定义是合理的。现在证明它不光是合理的，而且是唯一的。

香农给出信息熵函数满足的三个条件：
* 连续性
* 等概时的单调递增特性
* 可加性

用数学语言描述如下：
* $H(X) = H(P_x)$ is continuous on $P_x$.
* $g(N) - f(\frac 1 N,\frac 1 N,...,\frac 1 N)$. If $M > N, g(M)>g(N).$
* $f(P_1,p_2,...,P_N) = f(P_1+P_2+...+P_M,P_ {M+1},...,P_N) + (P_1+...+P_M)f(P_1'+P_2'+...+P_M'),P_i' = \frac{P_i}{\sum_ {j=1} ^M P_j}$

现在根据上面三个假设来证明我们之前猜测的信息度量函数不光是正确的而且是唯一的。

首先考虑均匀分布的情况：

$X~Unif:$
$$
\begin{align}
g(MN) &= f(\frac 1 {MN},...,\frac{1}{MN})\\
&=f(\frac 1 M,\frac 1 {MN},...,\frac 1 {MN}) + \frac 1 M (\frac 1 N,...,\frac 1 N)\\
 &= f(\frac 1 M,...,\frac 1 M) +\sum_ {i=1}^M \frac 1 M ( \frac 1 N ,...,\frac 1 N)\\
 &= g(M) + g(N)
\end{align}
$$
由以上的推论：
$$
g(S^m) = g(S) \cdot g(S^{m-1}) = mg(s) ---------------------(1)
$$

取四个正整数$s,m,t,n \in N$,使得$s^m \leq t^n < s^{m+1}$,由于单调增可以得到：
$$
g(s^m) \leq g(t^n) < g(s^{m+1}) \\
mg(s) \leq ng(t) < (m+1)g(s) \\
\frac m n \leq \frac {g(t)}{g(s)} < \frac {m+1}{n}
$$
可以得到：
$$
\left\vert \frac m n - \frac {g(t)}{g(s)} \right\vert \leq \frac 1 n ---------(2)
$$

如果讲上面的4个整数应用到log函数上，可以得到:
$$
m\log s\leq n\log t < (m+1) logs\\
\left\vert \frac m n - \frac {\log t }{\log s} \right\vert \leq \frac 1 n -------(3)
$$

利用$|a ± b| \leq |a|+ |b|$,结合不等式(2),(3)：

$$
\left \vert \frac {g(t)}{g(s)} - \frac {\log t}{\log s} \right \vert \leq \frac 2 n 
$$

当N取足够大时，$\frac {g(t)}{g(s)} -> \frac {\log t}{\log s}$

因此我们可以得到：$g(t) = C \log t = -\sum _ {i=1}^T \frac 1 t \log \frac 1 t$.

下来我们要考虑非均匀分布的情况。

假设$X~P_x(x)$,令$P(n) = \frac{m_n}{\sum_ {i=1}^N m_i} = \frac{m_n}{M}$.

实际上上面各个字母意思可以用摸球来考虑：$m_1$个红球，$m_2$个绿球，...,共M个球,N种颜色，而$P(1)$也就是摸到红球的概率。考虑：
$$
\begin{align}
g(M) &= f(\frac 1 M,...,\frac 1 M)\\
&=f(\frac {m_1} {M},\frac {m_2}{M},...,\frac{m_N}{M}) +\sum _ {i=1}^N \frac {m_i} {M}f(\frac {1}{m_i},...,\frac {1}{m_i})\\
&= f(P_1,P_2,...,P_N) + \sum_ {i=1}^N P_ig(m_i)
\end{align}
$$          

对上面等式稍加变形：
$$
\begin{align}
f(P_1,P_2,...,P_N) &= g(M) - \sum_ {i=1}^N P_ig(m_i)\\
&= C \log M (\sum_ {i=1}^N P_i)- \sum_ {i=1}^N P_ig(m_i)\\
&= C\sum _ {i=1}^N P_i(\log M - \log m_i )\\
&= -C\sum_ {i=1}^N P_i \log P_i
\end{align}
$$

这就得到了我们对熵的度量函数的形式。在不同的信息度量中常数C以及log的底数是不同的，而最常用的log底数为2，也就产生了bit。

现在X的分布是有理数，但是即使是无理数也是成立的。具体的证明就不展开了。

对于信息度量的假设条件，实际上香农的定义不是唯一的。数学家A.I.Khinchin曾经给出这样的假设：
* 连续性
* 可加性
* 极值条件
$$max f(p_1,p_2,...,p_N) = f(\frac 1 N,...,\frac 1 N)$$
* 零概率事件不影响不确定性
$$f(p_1,p_2,...,p_N) = f(p_1,p_2,...,p_N,0)$$

实际上这个条件中的3,4条件等价于香农的第二个条件。证明如下：
$$
 f(\frac 1 N,...,\frac 1 N)  =  f(\frac 1 N,...,\frac 1 N,0)< f(\frac 1 {N+1},\frac 1 {N+1},...,\frac 1 {N+1})
$$
而上式实际上就是等概时候的单调性。

### 联合熵 ###

Definition:
$H(X,Y) = -\sum _ {x \in \mathcal{X} }\sum_ {y \in \mathcal{Y} } P(x,y) \log P(x,y)$

$H(X,Y)$实际上是X与Y系统的联合包含的信息量。需要考虑的问题：$H(X,Y) ? H(X)+H(Y)$。

### 条件熵 ###
Definition:
$$
\begin{align}
H(Y|X) &= \sum_ {x \in \mathcal{X} } p(x)H(Y|X=x)\\
 &= - \sum_ {x \in \mathcal{X} }p(x) \sum_ {y \in \mathcal{Y} } p(y|x)\log p(y|x)\\
 &= - \sum_ {x \in \mathcal{X} }\sum_ {y \in \mathcal{Y} } p(x,y) \log p(y|x)
\end{align}
$$

请不要以为$H(Y|X) = -\sum_ {x \in \mathcal{X} }\sum_ {y \in \mathcal{Y} } p(y|x) \log p(y|x)$.

条件熵的实际上是知道X的信息之后，Y的剩余信息量。

值得注意的是H(Y|X=x)不是一个条件熵，条件熵是根据两个系统而言的，而在这个中，实际上只有一个加了条件的系统：$Y|X=x$.

当X,Y独立时，$H(Y|X) = H(Y),H(X|Y) = H(X)$.在直觉上这个也是非常正确的。同时我们用物理思维理解这件事，应该可以得到：$H(X,Y) = H(X) + H(Y|X)$.

现在用严格的数学证明来证明上面的式子是成立的：

首先我们希望简化一下熵的写法：$H(X) = \mathbb{E}_x \log \frac 1 {p(X)}$($\mathbb{E}$表示数学期望).

有了这个写法，证明变得就很简单：
$$
P(X,Y) = P(X)P(Y|X)\\
\log P(X,Y) = \log P(X)+ \log P(Y|X)\\
\mathbb{E}_ {X,Y}P(X,Y) = \mathbb{E}_ {X,Y} \log P(X) + \mathbb{E}_ {X,Y} \log P(Y|X)\\
H(X,Y) = H(X) + H(Y|X)
$$
上述证明没有写清负号，但是完全不影响结果。

根据上面可以推断出别的结论(如果利用画图就更好理解)：

* $H(X,Y|Z) = H(X|Z) + H(Y|X,Z)$

 推论：$H(X_1,X_2,...,H_n) =  \sum _ {i=1} ^N H(X_i|X_ {i-1},...,X_1)$

### 信息熵的性质 ###

* 对称性：
$H(P_1,P_2,...,P_N) = H(P_ {k(1)},P_ {k(2)},...,P_ {k(N)})$

* 非负性： $H(P) \geq 0$

* 可加性： $H(X,Y) = H(X) + H(Y|X)$

* 条件减少熵： $H(X|Y) \leq H(X)$
(条件熵，而非针对Y的某一特定取值，也就是不意味着$H(X|Y=y) \leq H(X)$)

* 最大离散熵定理：$H(p_1,p_2,...,p_n) \leq H(\frac 1 N ,...,\frac 1 N) = \log N = \log |X|$.

## 互信息(Mutual Information) ##

互信息描述了两个系统之间的关系。互信息的定义：$I(X;Y) = H(X) - H(X|Y)$.

也可以直接定义互信息为:$I(X;Y)= \sum_ {x \in \mathcal{X} } \sum_ {y \in \mathcal{Y} }p(x,y) \log \frac{p(x,y)}{p(x)p(y)}$.

互信息还有另一种写法：$I(X;Y) = I(p;Q) =  \sum_ {x \in \mathcal{X} } \sum_ {y \in \mathcal{Y} } p(x)q(y|x)\log \frac{q(y|x)}{\sum _ {x \in \mathcal{X} }p(x)q(y|x)}$.式子中Q为知道x后y的条件概率矩阵。

从另一方面来说：$I(X;Y) = H(X)+H(Y) - H(X,Y)$.从直观上也是很容易理解的。

很明显互信息$I(X;Y) = I(Y;X)$,具有对称性。如果X与Y独立，$I(X;Y)=0$；如果X与Y一一对应，则$I(X;Y) = H(X) = H(Y)$.

互信息和信道容量有着千丝万缕的关系。信源这边为X，信道尾部为Y，那么I(X;Y)越大的话信道容量越大。

### 多变量的互信息 ###

如果有随机变量X，Y，Z，则$I(X;Y,Z) = H(X) - H(X|Y,Z) = H(Y,Z) - H(Y,Z|X)$.

或者从数学定义上：
$$
I(X;Y,Z)= \sum_ {x \in \mathcal{X} } \sum_ {y \in \mathcal{Y} } \sum_ {z \in \mathcal{Z} }p(x,y,z) \log \frac{p(x|y,z)}{p(x)} = \sum_ {x \in \mathcal{X} } \sum_ {y \in \mathcal{Y} } \sum_ {z \in \mathcal{Z} }p(x,y,z) \log \frac{p(x,y,z)}{p(x)p(y,z)}
$$

### 条件互信息 ###

定义I(X;Y|Z)为知道Z的信息之后，X与Y之间的互信息。它的定义如下：

$I(X;Y|Z) = H(X|Z) - H(X|Y,Z)= H(Y|Z) - H(Y|X,Z)$.

也可以直接定义条件互信息为:
$$
I(X;Y|Z) = \sum_ {x \in \mathcal{X} } \sum_ {y \in \mathcal{Y} } \sum_ {z \in \mathcal{Z} } p(x,y,z) \log {p(x,y|z)}{p(x|z)p(y|z)}
$$

$$
I(X;Y|Z) = H(X|Z) - H(X,Y|Z) + H(Y|Z)
$$
$$
\begin{align}
I(X;Y|Z) = &H(X,Z) - H(Z) - H(X,Y,Z) + H(Z)+H(Y,Z) - H(Z)\\
&=H(X,Z)+H(Y,Z)-H(X,Y,Z)-H(Z)
\end{align}
$$

有条件减少熵，但是没有条件减少互信息。条件互信息非负。

* 对称性 $I(X;Y)=I(Y;X)$

* 非负性 $I(X;Y) \geq 0$

* 极值性 $I(X;Y) \leq min\{H(X),H(Y)\}$

* 可加性 $I(X_1,X_2,...,X_n;Y) = \sum_ {i=1} ^n I(X_i;Y|X_ {i-1},...,X_1)$

可加性用画图来表示的话也更清晰。

下面介绍一个用互信息来解决的题目。如果有25个小球，其中只有一个重量和其他的不一致。有一个天平，可以检测轻重，或者一样重。那么最少用几次才能一定找出不一样重量的小球?也许你能找到3次的方法，但是如何证明2次是不可以？

只有一个重量不一样，如果是均匀分布，则信息熵为$H(X) = \log_2^{25}$.假设进行了N次实验，则互信息为$I(X^N;X)$.
$$
\begin{align}
I(X^N;X) &\leq H(X^N) \leq H(X_1,X_2,...,X_N)\\
       &\leq H(X_1)+...+H(X_n)\\
       &= N\log _2^3.\\
\end{align}
$$
我们希望的是互信息和原来的熵一样大，这样才能反应它的情况。
$$
\begin{align}
H(X) = I(X^N;X) \leq N \log_2^3\\
      \log 2^{25} \leq N log_2^3\\
      N \geq 3
\end{align}
$$

所以可以得到N必须大于等于3.信息论很多时候给了我们一个上界。

## 鉴别信息(K-L divergence) ##

鉴别信息表示两个分布之间的距离，定义如下：
$$
D(p\Vert q) = \sum_ {x \in \mathcal{X} }p(x)\log \frac{p(x)}{q(x)}
$$

* 当p = q的时候，$D(p\Vert q) =0$. 
* 鉴别信息具有非负性。

但是鉴别信息不能说是严格的信息度量。它不具有对称性，也不满足三角不等式（？？）。

### 鉴别信息，熵，互信息 ###

* $H(X) = \log |X| - D(\mathbf{p}\Vert \mathbf{u})$

上式中u表示平均分布。证明如下：

$$
\begin{align}
H(X) &= -\sum _ {x \in \mathcal{X} }p(x)\log p(x) \\
&=\log N - \log N+ \sum_ {x \in \mathcal{X} }p(x) \log p(x)\\
&= \log |X| + \sum_ {x \in mathcal{X} } p(x)\log \frac 1 N + \sum_ {x \in \mathcal{X} }p(x) \log p(x)\\
&= \log |X| -  D(\mathbf{p}\Vert \mathbf{u})
\end{align}
$$

* $I(X;Y) = D(p(x,y)\Vert p(x)p(y)) $

这个证明两边根据定义展开就可以直接得到。

信息论真是抽象啊。