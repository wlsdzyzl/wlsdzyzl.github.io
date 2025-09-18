---
title: SLAM——IMU预积分
mathjax: true
date: 2021-04-30 06:15:28
tags: [SLAM, imu]
categories: [SLAM]
---

IMU预积分，耳熟能详，但是一直没有仔细了解。这里详细介绍一下。
<!--more-->
## 运动模型

首先做一个简单规定，因为IMU预积分离不开IMU坐标系与世界坐标系的转换，因此我们将世界坐标下的值标记为$w$，将IMU坐标系下的值标记为$b$。而$\mathbf R^w_b$表示了从世界坐标到IMU坐标的转换。

一般来说，IMU包含了两部分——陀螺仪与加速计，因此IMU的raw data有两类：

$$
\tilde{\boldsymbol{\omega}}^{b}(t)=\boldsymbol{\omega}^{b}(t)+\mathbf{b}_ {g}(t)+\boldsymbol{\eta}_ {g}(t)\\\tilde{\mathbf{a}}^{b}(t)=\mathbf{R}_ {b(t)}^{w T}\left(\mathbf{a}^{w}(t)-\mathbf{g}^{w}\right)+\mathbf{b}_ {a}(t)+\boldsymbol{\eta}_ {a}(t)
$$

其中$\tilde {\boldsymbol\omega}^b$与$\tilde{\mathbf{a}}^b$分别是读取到的角速度与加速度，也就是观察值，属于IMU坐标系下的读数，且包含噪声$\boldsymbol \eta$与偏差$\mathbf b$（分别是加速度accelerometer与陀螺仪gyro的噪声与偏差）。同时，IMU的加速度测量的是IMU坐标下的一个力，但是由于测量原理，它测出来的加速度去除了重力，例如一个三轴加速度计放在水平面上，那么它的输出将是铅垂线反向的$9.8m/s^2$；如果一个加速度计做自由落体运动，那么它的输出会是0。而我们关注的物体真正的加速度$\mathbf a ^w(t)$是世界坐标系$\mathbf W$下，当然也包含了重力。所以真实加速度需要去除重力加速度再转换到IMU坐标系下才是IMU的加速度读数。

同时，根据运动模型，我们可以得到旋转矩阵$\mathbf R$，速度$\mathbf v$以及位置$\mathbf p$的微分模型如下：

$$
\begin{array}{l}
\dot{\mathbf{R}}_ {b}^{w}=\mathbf{R}_ {b}^{w}\left(\boldsymbol{\omega}^{b}\right)^{\wedge} \\
\dot{\mathbf{v}}^{w}=\mathbf{a}^{w} \\
\dot{\mathbf{p}}^{w}=\mathbf{v}^{w}
\end{array}
$$

有意思的一件事是，虽然旋转矩阵是一个从世界坐标到IMU坐标的转换（也就世界坐标系下姿态的逆），但是微分里的角速度是IMU坐标系的，这意味着我们可以直接使用IMU去噪后的角速度读数。使用欧拉积分(？)，可以得到下一刻的状态（离散形式）：

$$
\begin{array}{l}\mathbf{R}_ {b(t+\Delta t)}^{w}=\mathbf{R}_ {b(t)}^{w} \operatorname{Exp}\left(\boldsymbol{\omega}^{b}(t) \cdot \Delta t\right) \\\mathbf{v}^{w}(t+\Delta t)=\mathbf{v}^{w}(t)+\mathbf{a}^{w}(t) \cdot \Delta t \\\mathbf{p}^{w}(t+\Delta t)=\mathbf{p}^{w}(t)+\mathbf{v}^{w}(t) \cdot \Delta t+\frac{1}{2} \mathbf{a}^{w}(t) \cdot \Delta t^{2}\end{array}
$$

上式中速度和位置都很容易理解，对于旋转矩阵，很显然上面给出的结果也是很符合直观的，就是将角速度与间隔时间相乘后得到一个旋转向量（角速度乘上时间也就得到了绕各个轴旋转的角度，可以直接得到旋转向量，所以一个旋转向量其实可以理解成绕坐标轴旋转的角度?），再转化到$\text{SO(3)}$上进行乘积。而一个严格的解释如下：

$$
\mathbf{R}^{w}_ {b(t)} \operatorname{Exp}\left(\boldsymbol{\omega}_ {w b}^{b}(t) \cdot \Delta t\right)=\mathbf{R}_ {b(t)}^{w} \mathbf{R}_ {b(t+\Delta t)}^{b(t)}=\mathbf{R}_ {b(t+\Delta t)}^{w}
$$

为了简化符号，规定：

$$
\mathbf{R}(t) \doteq \mathbf{R}_ {b(t)}^{w} ; \quad \boldsymbol{\omega}(t) \doteq \boldsymbol{\omega}^{b}(t) ; \quad \mathbf{a}(t)=\mathbf{a}^{b}(t) ; \\\quad \mathbf{v}(t) \doteq \mathbf{v}^{w}(t) ; \quad \mathbf{p}(t) \doteq \mathbf{p}^{w}(t) ; \quad \mathbf{g} \doteq \mathbf{g}^{w}
$$

如果将测量模型带入到运动模型中，可以得到：

$$
\begin{aligned}\mathbf{R}(t+\Delta t) &=\mathbf{R}(t) \cdot \operatorname{Exp}(\boldsymbol{\omega}(t) \cdot \Delta t) \\&=\mathbf{R}(t) \cdot \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}(t)-\mathbf{b}_ {g}(t)-\boldsymbol{\eta}_ {g d}(t)\right) \cdot \Delta t\right) \\\mathbf{v}(t+\Delta t) &=\mathbf{v}(t)+\mathbf{a}^{w}(t) \cdot \Delta t \\&=\mathbf{v}(t)+\mathbf{R}(t) \cdot\left(\tilde{\mathbf{a}}(t)-\mathbf{b}_ {a}(t)-\boldsymbol{\eta}_ {a d}(t)\right) \cdot \Delta t+\mathbf{g} \cdot \Delta t \\\mathbf{p}(t+\Delta t) &=\mathbf{p}(t)+\mathbf{v}(t) \cdot \Delta t+\frac{1}{2} \mathbf{a}^{w}(t) \cdot \Delta t^{2} \\&=\mathbf{p}(t)+\mathbf{v}(t) \cdot \Delta t+\frac{1}{2}\left[\mathbf{R}(t) \cdot\left(\tilde{\mathbf{a}}(t)-\mathbf{b}_ {a}(t)-\boldsymbol{\eta}_ {a d}(t)\right)+\mathbf{g}\right] \cdot \Delta t^{2} \\&=\mathbf{p}(t)+\mathbf{v}(t) \cdot \Delta t+\frac{1}{2} \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \mathbf{R}(t) \cdot\left(\tilde{\mathbf{a}}(t)-\mathbf{b}_ {a}(t)-\boldsymbol{\eta}_ {a d}(t)\right) \cdot \Delta t^{2}\end{aligned}
$$

首先要注意的是，上面的噪声也从连续形式变成了离散形式，而二者的区别就在于他们有不同的协方差：

$$
\begin{array}{l}\operatorname{Cov}\left(\boldsymbol{\eta}_ {g d}(t)\right)=\frac{1}{\Delta t} \operatorname{Cov}\left(\boldsymbol{\eta}_ {g}(t)\right) \\\operatorname{Cov}\left(\boldsymbol{\eta}_ {a d}(t)\right)=\frac{1}{\Delta t} \operatorname{Cov}\left(\boldsymbol{\eta}_ {a}(t)\right)\end{array}
$$

如果假设采样频率一定，时间间隔为$\Delta t$，那么每个时刻可以表示为离散的$1, 2, ..., k$，因此，进一步简化可以将下一个时刻的状态写为：

$$
\begin{array}{l}\mathbf{R}_ {k+1}=\mathbf{R}_ {k} \cdot \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {k}^{g}-\boldsymbol{\eta}_ {k}^{g d}\right) \cdot \Delta t\right) \\\mathbf{v}_ {k+1}=\mathbf{v}_ {k}+\mathbf{R}_ {k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\boldsymbol{\eta}_ {k}^{a d}\right) \cdot \Delta t+\mathbf{g} \cdot \Delta t \\\mathbf{p}_ {k+1}=\mathbf{p}_ {k}+\mathbf{v}_ {k} \cdot \Delta t+\frac{1}{2} \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \mathbf{R}_ {k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\boldsymbol{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\end{array}
$$

## 预积分

根据之前的内容，如果有两个时刻$i,j$，且我们知道$i$时刻的机器人状态，以及$i,j$时刻之间的IMU状态，那么我们可以直接得到$j$时刻的机器人状态，通过对$i,j$时刻间的IMU状态进行上述的积分：

$$
\begin{aligned}\mathbf{R}_ {j} &=\mathbf{R}_ {i} \cdot \prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{g}-\mathbf{\eta}_ {k}^{g d}\right) \cdot \Delta t\right) \\\mathbf{v}_ {j} &=\mathbf{v}_ {i}+\mathbf{g} \cdot \Delta t_ {i j}+\sum_ {k=i}^{j-1} \mathbf{R}_ {k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t \\\mathbf{p}_ {j} &=\mathbf{p}_ {i}+\sum_ {k=i}^{j-1} \mathbf{v}_ {k} \cdot \Delta t+\frac{j-i}{2} \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \sum_ {k=i}^{j-1} \mathbf{R}_ {k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2} \\&=\mathbf{p}_ {i}+\sum_ {k=i}^{j-1}\left[\mathbf{v}_ {k} \cdot \Delta t+\frac{1}{2} \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \mathbf{R}_ {k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\right]\end{aligned}
$$

其中$\Delta t_ {i j}=\sum_ {k=i}^{j-1} \Delta t=(j-i) \Delta t$，也就是时刻之间的时间间隔。可以看到，上述估计中相邻两个IMU数据之间的状态用先前的IMU状态来代替。后面的速度与位置的更新，都出现了新的变量$\mathbf R_k$，也就意味着当$\mathbf R_i$有变化，所有的$\mathbf R_k$都会跟着改变，所有的量都需重新计算。为了避免这样的情况，很直接的方法就是记录着$i,j$时刻之间的变化值，而这个变化值不应该随着$\mathbf R_i$
的改变而改变。因此，需要引入预积分。预积分的目的自然是为了消除IMU积分式中的$\mathbf R_ {i}$以及与其相关的$\mathbf R_k， \mathbf v_k$，这样之后$\mathbf R_i$改变后，可以直接利用先前计算的预积分得到更新的结果。因此我们定义下面为预积分的内容：

$$
\begin{aligned}\Delta \mathbf{R}_ {i j} & \triangleq \mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \\&=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {k}^{g}-\boldsymbol{\eta}_ {k}^{g d}\right) \cdot \Delta t\right) \\\Delta \mathbf{v}_ {i j} & \triangleq \mathbf{R}_ {i}^{T}\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right) \\&=\sum_ {k=i}^{j-1} \Delta \mathbf{R}_ {i k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t \\\Delta \mathbf{p}_ {i j} & \triangleq \mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right) \\&=\sum_ {k=i}^{j-1}\left[\Delta \mathbf{v}_ {i k} \cdot \Delta t+\frac{1}{2} \Delta \mathbf{R}_ {i k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\right]\end{aligned}
$$

预积分的这三个值，第一个容易理解以及第二个是容易理解的，就是在IMU积分项中把$\mathbf R_ {i}$，$\mathbf v_i$，$\mathbf p_i$提取出。而对于位置的预积分，更复杂一点，证明如下：

令$\xi_ {k}=\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}$，有

$$
\begin{aligned}& \mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2} \\=& \sum_ {k=i}^{j-1}\left(\mathbf{v}_ {k} \cdot \Delta t+\frac{1}{2} \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \mathbf{R}_ {k} \xi_ {k} \cdot \Delta t^{2}\right)-\sum_ {k=i}^{j-1} \mathbf{v}_ {i} \cdot \Delta t-\frac{(j-i)^{2}}{2} \mathbf{g} \cdot \Delta t^{2} \\=& \sum_ {k=i}^{j-1}\left(\mathbf{v}_ {k}-\mathbf{v}_ {i}\right) \Delta t+\left[\frac{j-i}{2}-\frac{(j-i)^{2}}{2}\right] \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \sum_ {k=i}^{j-1} \mathbf{R}_ {k} \xi_ {k} \cdot \Delta t^{2} \\=& \sum_ {k=i}^{j-1}\left(\mathbf{v}_ {k}-\mathbf{v}_ {i}\right) \Delta t-\sum_ {k=i}^{j-1}(k-i) \mathbf{g} \cdot \Delta t^{2}+\frac{1}{2} \sum_ {k=i}^{j-1} \mathbf{R}_ {k} \xi_ {k} \cdot \Delta t^{2} \\=& \sum_ {k=i}^{j-1}\left\{\left[\mathbf{v}_ {k}-\mathbf{v}_ {i}-(k-i) \mathbf{g} \cdot \Delta t\right] \Delta t+\frac{1}{2} \mathbf{R}_ {k} \xi_ {k} \cdot \Delta t^{2}\right\} \\=& \sum_ {k=i}^{j-1}\left[\left(\mathbf{v}_ {k}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i k}\right) \Delta t+\frac{1}{2} \mathbf{R}_ {k} \xi_ {k} \cdot \Delta t^{2}\right] \\=& \sum_ {k=i}^{j-1}\left[\mathbf{R}_ {i} \cdot \Delta \mathbf{v}_ {i k} \cdot \Delta t+\frac{1}{2} \mathbf{R}_ {k} \xi_ {k} \cdot \Delta t^{2}\right]\\=&\mathbf R_i\sum_ {k=i}^{j-1}\left[\Delta \mathbf{v}_ {i k} \cdot \Delta t+\frac{1}{2} \Delta \mathbf{R}_ {i k} \cdot\left(\tilde{\mathbf{a}}_ {k}-\mathbf{b}_ {k}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\right]\end{aligned}
$$

有了预积分项，想要得到积分后的结果就非常容易了。预积分的意义是找出$i,j$时刻之间IMU状态贡献的部分，即使机器人状态有变化，固定时刻之间IMU状态测量值不变，这个贡献也不应该改变，因此IMU预积分是可以当作两个机器人状态之间的一个约束。

## 预积分测量值以及测量噪声

这一部分是为了分离出噪声，直接使用测量值的预积分。首先假设$i, j$时刻之间的bias是一定的，那么

（1）对于$\Delta\mathbf R_ {ij}$有：

$$
\begin{aligned}\Delta \mathbf{R}_ {i j} &=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {i}^{g}\right) \Delta t-\boldsymbol{\eta}_ {k}^{g d} \Delta t\right) \\& \approx \prod_ {k=i}^{j-1}\left\{\operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {i}^{g}\right) \Delta t\right) \cdot \operatorname{Exp}\left(-\mathbf{J}_ {r}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {i}^{g}\right) \Delta t\right) \cdot \mathbf{\eta}_ {k}^{g d} \Delta t\right)\right\}\end{aligned}
$$

这一步是把$\boldsymbol \eta_ {k}^{gd}\Delta t$看作是一个微小量，则有$\operatorname{Exp}(\vec{\phi}+\delta \vec{\phi}) \approx \operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}\left(\mathbf{J}_ {r}(\vec{\phi}) \cdot \delta \vec{\phi}\right)$。

从这一步继续往下推导会稍微复杂一点，先给出结果：

为了符号简便，令：

$$
\mathbf{J}_ {r}^{k}=\mathbf{J}_ {r}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {i}^{g}\right) \Delta t\right)\\\Delta \tilde{\mathbf{R}}_ {i j}=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {i}^{g}\right) \Delta t\right)\\\operatorname{Exp}\left(-\delta \vec{\phi}_ {i j}\right)=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {k+1,j}^{T} \cdot \mathbf{J}_ {r}^{k} \cdot \boldsymbol{\eta}_ {k}^{g d} \Delta t\right)
$$

则有：

$$
\Delta \mathbf{R}_ {i j} = \Delta \tilde{\mathbf{R}}_ {i j} \cdot \operatorname{Exp}\left(-\delta \vec{\phi}_ {i j}\right)
$$

其中$\Delta\tilde{\mathbf R}_ {ij}$就是旋转量的预积分测量值，后者为噪声。

下面我们证明。首先，我们利用$\text{SO(3)}$的伴随性质可以得到：

$$
\operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}=\mathbf{R} \cdot \operatorname{Exp}\left(\mathbf{R}^{T} \vec{\phi}\right)
$$

这里我们对上式进行一个推广：

$$
\begin{aligned}\operatorname{Exp}(\vec{\phi}_1)\operatorname{Exp}(\vec{\phi}_2) \cdot \mathbf{R}&=\operatorname{Exp}(\vec{\phi}_1)\mathbf{R} \cdot \operatorname{Exp}\left(\mathbf{R}^{T} \vec{\phi}_2\right)\\&=\mathbf R \operatorname{Exp}(\mathbf R^T\vec{\phi}_1)\operatorname{Exp}(\mathbf R^T\vec{\phi}_2)\end{aligned}
$$

也就是，伴随性质是链式传播的，从最右侧传到最左侧，中间每一个量都会受到影响。为了符号简便，我们可以令$\mathbf R_ {k,k+1}=\operatorname{Exp}\left(\tilde{\boldsymbol{\omega}}_ {k}-\mathbf{b}_ {i}^{g}\right) \Delta t$，也就是：

$$
\Delta \tilde{\mathbf{R}}_ {i j}=\prod_ {k=i}^{j-1} \mathbf R_ {k,k+1}
$$

则有：

$$
\begin{aligned}\Delta \mathbf{R}_ {i j}&=\prod_ {k=i}^{j-1} \left\{\mathbf R_ {k,k+1}\cdot\text{Exp}(-\mathbf{J}_ {r}^{k} \cdot \boldsymbol{\eta}_ {k}^{g d} \Delta t) \right\}\\&=\mathbf R_ {i, i+1}\cdot\text{Exp}(-\mathbf{J}_ {r}^{i} \cdot \boldsymbol{\eta}_ {i}^{g d} \Delta t)\cdot\mathbf R_ {i+1, i+2}\cdot\text{Exp}(-\mathbf{J}_ {r}^{i+1} \cdot \boldsymbol{\eta}_ {i+1}^{g d} \Delta t)\cdots\mathbf R_ {j-1,j}\cdot \text{Exp}(-\mathbf{J}_ {r}^{j-1} \cdot \boldsymbol{\eta}_ {j-1}^{g d} \Delta t) \\ &= \mathbf R_ {i,i+1}\cdot \mathbf R_ {i+1, i+2} \cdot\text{Exp}(-\mathbf R_ {i+1,i+2}^T\cdot\mathbf{J}_ {r}^{i} \cdot \boldsymbol{\eta}_ {i}^{g d} \Delta t)\cdot\text{Exp}(-\mathbf{J}_ {r}^{i+1} \cdot \boldsymbol{\eta}_ {i+1}^{g d} \Delta t)\mathbf R_ {i+2, i+3}\cdots\mathbf R_ {j-1,j}\cdot \text{Exp}(-\mathbf{J}_ {r}^{j-1} \cdot \boldsymbol{\eta}_ {j-1}^{g d} \Delta t)\\&= \mathbf R_ {i,i+1}\cdot \mathbf R_ {i+1, i+2} \cdot \mathbf R_ {i+2, i+3}\cdot\text{Exp}(-\mathbf R_ {i+2,i+3}^T\mathbf R_ {i+1,i+2}^T\cdot\mathbf{J}_ {r}^{i} \cdot \boldsymbol{\eta}_ {i}^{g d} \Delta t)\cdot\text{Exp}(-\mathbf R_ {i+2,i+3}^T\mathbf{J}_ {r}^{i+1} \cdot \boldsymbol{\eta}_ {i+1}^{g d} \Delta t)\cdots\mathbf R_ {j-1,j}\cdot \text{Exp}(-\mathbf{J}_ {r}^{j-1} \cdot \boldsymbol{\eta}_ {j-1}^{g d} \Delta t)\\&\cdots\\&=\prod_ {k=i}^{j-1} \mathbf R_ {k,k+1} \cdot \text{Exp}\left(-\left(\prod_ {k=i+1}^{j-1}\mathbf{R}_ {k,k+1}\right)^T\mathbf{J}_ {r}^{i} \cdot \boldsymbol{\eta}_ {i}^{g d} \Delta t \right) \cdots \text{Exp}(-\mathbf{J}_ {r}^{j-1} \cdot \boldsymbol{\eta}_ {j-1}^{g d} \Delta t)\\&=\Delta\tilde{\mathbf R}_ {ij}\cdot \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {i+1,j}^{T} \cdot \mathbf{J}_ {r}^{i} \cdot \boldsymbol{\eta}_ {i}^{g d} \Delta t\right)\cdot \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {i+2,j}^{T} \cdot \mathbf{J}_ {r}^{i+1} \cdot \boldsymbol{\eta}_ {i+1}^{g d} \Delta t\right)\cdots \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {j,j}^{T} \cdot \mathbf{J}_ {r}^{j-1} \cdot \boldsymbol{\eta}_ {j-1}^{g d} \Delta t\right)\\&=\Delta \tilde{ \mathbf R}_ {ij}\cdot\prod_ {k=i}^{j-1} \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {k+1,j}^{T} \cdot \mathbf{J}_ {r}^{k} \cdot \boldsymbol{\eta}_ {k}^{g d} \Delta t\right)\\& = \Delta \tilde{\mathbf{R}}_ {i j} \cdot \operatorname{Exp}\left(-\delta \vec{\phi}_ {i j}\right)\end{aligned}
$$

证毕，需要注意的是$\Delta\tilde{\mathbf R}_ {jj} = \mathbf I$。

（2）对于$\Delta \mathbf v_ {ij}$，将（1）中的结论带入有：

$$
\begin{aligned}\Delta \mathbf{v}_ {i j} &=\sum_ {k=i}^{j-1} \Delta \mathbf{R}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t \\& \approx \sum_ {k=i}^{j-1} \Delta \tilde{\mathbf{R}}_ {i k} \cdot \operatorname{Exp}\left(-\delta \vec{\phi}_ {i k}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t \\& \approx \sum_ {k=i}^{j-1} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\mathbf{I}-\delta \vec{\phi}_ {i k}^{\wedge}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}-\boldsymbol{\eta}_ {k}^{a d}\right) \cdot \Delta t \\& \approx \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\mathbf{I}-\delta \vec{\phi}_ {i k}^{\wedge}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \cdot \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \boldsymbol{\eta}_ {k}^{a d} \Delta t\right] \\&=\sum_ {k=i}^{a-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \cdot \Delta t+\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i k} \cdot \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t\right] \\&=\sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \cdot \Delta t\right]+\sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i k} \cdot \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t\right]\end{aligned}
$$

令：

$$
\begin{aligned}\Delta \tilde{\mathbf{v}}_ {i j} & \triangleq \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \cdot \Delta t\right] \\\delta \mathbf{v}_ {i j} & \triangleq \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i k} \cdot \Delta t\right]\end{aligned}
$$

则有：

$$
\Delta \mathbf{v}_ {i j} \triangleq \Delta \tilde{\mathbf{v}}_ {i j}-\delta \mathbf{v}_ {i j}
$$

其中前一项为测量项，而后一项为噪声值。

（3）对于$\Delta\mathbf {p}_ {ij}$，带入前面的结果，可得：

$$
\begin{aligned}\Delta \mathbf{p}_ {i j} &=\sum_ {k=i}^{j-1}\left[\Delta \mathbf{v}_ {i k} \cdot \Delta t+\frac{1}{2} \Delta \mathbf{R}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\right] \\& \approx \sum_ {k=i}^{j-1}\left[\left(\Delta \tilde{\mathbf{v}}_ {i k}-\delta \mathbf{v}_ {i k}\right) \cdot \Delta t+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot \operatorname{Exp}\left(-\delta \vec{\phi}_ {i k}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\right] \\& \approx \sum_ {k=i}^{(1)}\left[\left(\Delta \tilde{\mathbf{v}}_ {i k}-\delta \mathbf{v}_ {i k}\right) \cdot \Delta t+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\mathbf{I}-\delta \vec{\phi}_ {i k}^{\wedge}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}-\mathbf{\eta}_ {k}^{a d}\right) \cdot \Delta t^{2}\right] \\& \approx \sum_ {k=i}^{-1}\left[\left(\Delta \tilde{\mathbf{v}}_ {i k}-\delta \mathbf{v}_ {i k}\right) \cdot \Delta t+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\mathbf{I}-\delta \vec{\phi}_ {i k}^{\wedge}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \cdot \Delta t^{2}-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t^{2}\right] \\& = \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{v}}_ {i k} \Delta t+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \Delta t^{2}+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \delta \vec{\phi}_ {i k} \Delta t^{2}-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t^{2}-\delta \mathbf{v}_ {i k} \Delta t\right]\end{aligned}
$$

令：

$$
\begin{array}{l}\Delta \tilde{\mathbf{p}}_ {i j} \triangleq \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{v}}_ {i k} \Delta t+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right) \Delta t^{2}\right] \\\delta \mathbf{p}_ {i j} \triangleq \sum_ {k=i}^{j-1}\left[\delta \mathbf{v}_ {i k} \Delta t-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \delta \vec{\phi}_ {i k} \Delta t^{2}+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \mathbf{n}_ {k}^{a d} \Delta t^{2}\right]\end{array}
$$

则

$$
\Delta \mathbf{p}_ {i j} \triangleq \Delta \tilde{\mathbf{p}}_ {i j}-\delta \mathbf{p}_ {i j}
$$

前者为预积分测量值，后者为噪声值。

最终，将分离后的噪声与测量值带入理想状态的预积分形式下，可以得到：

$$
\begin{array}{l}\Delta \tilde{\mathbf{R}}_ {i j} \approx \Delta \mathbf{R}_ {i j} \operatorname{Exp}\left(\delta \vec{\phi}_ {i j}\right)=\mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \operatorname{Exp}\left(\delta \vec{\phi}_ {i j}\right) \\\Delta \tilde{\mathbf{v}}_ {i j} \approx \Delta \mathbf{v}_ {i j}+\delta \mathbf{v}_ {i j}=\mathbf{R}_ {i}^{T}\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)+\delta \mathbf{v}_ {i j} \\\Delta \tilde{\mathbf{p}}_ {i j} \approx \Delta \mathbf{p}_ {i j}+\delta \mathbf{p}_ {i j}=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)+\delta \mathbf{p}_ {i j}\end{array}
$$

类似于测量值等于理想值+噪声的形式。

在实现的时候需要注意，$\Delta \tilde{\mathbf v}_ {ij}$会用到的是$\sum_ {k=i}^{j-1}\Delta \tilde{\mathbf{R}}_ {i k} = \Delta \tilde{\mathbf{R}}_ {i i}+\cdots+\Delta \tilde{\mathbf{R}}_ {i,j-1}$，也就是不会用到$\Delta \tilde{\mathbf{R}}_ {i j}$，因此实现的时候需要注意计算顺序：$\Delta \tilde{\mathbf{p}}_ {i j}\rightarrow\Delta \tilde{\mathbf{v}}_ {i j}\rightarrow \Delta \tilde{\mathbf{R}}_ {i j}$。

## 噪声分布

令预积分的噪声为：

$$
\boldsymbol{\eta}_ {i j}^{\Delta} \triangleq\left[\begin{array}{lll}\delta \vec{\boldsymbol\phi}_ {i j}^{T} & \delta \mathbf{v}_ {i j}^{T} & \delta \mathbf{p}_ {i j}^{T}\end{array}\right]^{T}
$$

我们希望它满足高斯分布，也就是$\boldsymbol{\eta}_ {i j}^{\Delta} \sim N\left(\mathbf{0}_ {9 \times 1}, \mathbf{\Sigma}_ {i j}\right)$。这里$\boldsymbol \eta_ {ij}^\Delta$是三种噪声的线性组合，因此我们来分别分析。

（1）首先是旋转的噪声分析$\delta\boldsymbol{\vec\phi}$。由之前的推导可以知道：

$$
\operatorname{Exp}\left(-\delta \vec{\phi}_ {i j}\right)=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {k+1 j}^{T} \cdot \mathbf{J}_ {r}^{k} \cdot \boldsymbol{\eta}_ {k}^{g d} \Delta t\right)
$$

对等式两边同时取对数，可以得到：

$$
\delta \vec{\phi}_ {i j}=-\text{Log}\left(\prod_ {k=i}^{j-1} \operatorname{Exp}\left(-\Delta \tilde{\mathbf{R}}_ {k+1 j}^{T} \cdot \mathbf{J}_ {r}^{k} \cdot \boldsymbol{\eta}_ {k}^{g d} \Delta t\right)\right)
$$

令$\xi_ {k}=\Delta \tilde{\mathbf{R}}_ {k+1 j}^{T} \cdot \mathbf{J}_ {r}^{k} \cdot \mathbf{\eta}_ {k}^{g d} \Delta t$，由于$\boldsymbol{\eta}_ {k}^{g d}$是小量，因此$\xi_k$也是小量，因此有$\mathbf{J}_ {r}\left(\xi_ {k}\right) \approx \mathbf{I}$(注意这里是雅可比矩阵，而不是之前的缩写)。由于本身$\delta \vec{\phi}_ {i j}$是小量，因此任意$\text{Log} \left(\prod_ {k =p}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right), p \in \{i, i+1,...,j-1\}$是小量，因为有$\text{Log} (\operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}(\delta \vec{\phi}))=\vec{\phi}+\mathbf{J}_ {r}^{-1}(\vec{\phi}) \cdot \delta \vec{\phi}$，我们可以得到

$$
\begin{aligned}\delta \vec{\phi}_ {i j} &=-\text{Log}\left(\prod_ {k=i}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right) \\&=-\text{Log}\left(\operatorname{Exp}\left(-\xi_ {i}\right) \prod_ {k=i+1}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right) \\& \approx-\left(-\xi_ {i}+\mathbf{I} \cdot \text{Log}\left(\prod_ {k=1+1}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right)\right)=\xi_ {i}-\text{Log} \left(\prod_ {k=i+1}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right) \\&=\xi_ {i}-\text{Log}\left(\operatorname{Exp}\left(-\xi_ {i+1}\right) \prod_ {k=i+2}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right) \\& \approx \xi_ {i}+\xi_ {i+1}-\text{Log} \left(\prod_ {k=1+2}^{j-1} \operatorname{Exp}\left(-\xi_ {k}\right)\right) \\& \approx \cdots \\& \approx \sum_ {k=i}^{j-1} \xi_ {k}\end{aligned}
$$

也就是

$$
\delta \vec{\phi}_ {i j} \approx \sum_ {k=i}^{j-1} \Delta \tilde{\mathbf{R}}_ {k+1 j}^{T} \mathbf{J}_ {r}^{k} \mathbf{\eta}_ {k}^{g d} \Delta t
$$

由于上式中$\Delta \tilde{\mathbf{R}}_ {k+1 j}^{T}, \mathbf{J}_ {r}^{k},\Delta t$都是已知量，而假设$\boldsymbol \eta_k^{gd}$是零均值高斯噪声，因此$\delta\vec{\phi}_ {ij}$也是零均值高斯噪声。

（2）由于我们分析得到了$\delta\vec{\phi}_ {ij}$是零均值高斯噪声，根据$\delta\mathbf v_ {ij}$表达式：

$$
\delta \mathbf{v}_ {i j}=\sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i k} \cdot \Delta t\right]
$$

我们可以知道$\delta\mathbf v_ {ij}$也是高斯分布的。

（3）类似的，根据$\delta \mathbf{p}_ {i j}$的表达式：

$$
\delta \mathbf{p}_ {i j}=\sum_ {k=i}^{j-1}\left[\delta \mathbf{v}_ {i k} \Delta t-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \delta \vec{\phi}_ {i k} \Delta t^{2}+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t^{2}\right]
$$

可以知道$\delta \mathbf{p}_ {i j}$也是高斯分布。但是，$\delta \mathbf{v}_ {i j},\delta \mathbf{p}_ {i j}$不是零均值。

## 噪声的递推形式

下面分析一下噪声的递推形式，$\boldsymbol\eta_ {i,j-1}^\Delta\rightarrow\boldsymbol \eta_ {ij}^{\Delta}$，以及其协方差的递推形式，$\boldsymbol{\Sigma}_ {i j-1} \rightarrow \boldsymbol{\Sigma}_ {i j}$。

（1）旋转项$\delta \vec{\phi}_ {i,j-1}\rightarrow \delta \vec{\phi}_ {ij}$：

$$
\begin{aligned}\delta \vec{\phi}_ {i j} &=\sum_ {k=1}^{j-1} \Delta \tilde{\mathbf{R}}_ {k+1 j}^{T} \mathbf{J}_ {r}^{k} \mathbf{\eta}_ {k}^{g d} \Delta t \\&=\sum_ {k=i}^{j-2} \Delta \tilde{\mathbf{R}}_ {k+1,j}^{T} \mathbf{J}_ {r}^{k} \mathbf{\eta}_ {k}^{g d} \Delta t+\Delta \tilde{\mathbf{R}}_ {j j}^{T} \mathbf{J}_ {r}^{j-1} \mathbf{\eta}_ {j-1}^{g d} \Delta t \\&=\sum_ {k=1}^{j-2}\left(\Delta \tilde{\mathbf{R}}_ {k+1,j-1} \Delta \tilde{\mathbf{R}}_ {j-1,j}\right)^{T} \mathbf{J}_ {r}^{k} \mathbf{\eta}_ {k}^{g d} \Delta t+\mathbf{J}_ {r}^{j-1} \mathbf{\eta}_ {j-1}^{g d} \Delta t \\&=\Delta \tilde{\mathbf{R}}_ {j,j-1} \sum_ {k=1}^{j-2} \Delta \tilde{\mathbf{R}}_ {k+1,j-1}^{T} \mathbf{J}_ {r}^{k} \mathbf{\eta}_ {k}^{g d} \Delta t+\mathbf{J}_ {r}^{j-1} \mathbf{\eta}_ {j-1}^{g d} \Delta t \\&=\Delta \tilde{\mathbf{R}}_ {j,j-1} \delta \vec{\phi}_ {i j-1}+\mathbf{J}_ {r}^{j-1} \mathbf{\eta}_ {j-1}^{g d} \Delta t\end{aligned}
$$

（2）速度项$\delta \mathbf{v}_ {i,j-1} \rightarrow \delta \mathbf{v}_ {i j}$:

$$
\begin{aligned}\delta \mathbf{v}_ {i j}=& \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k} \boldsymbol{\eta}_ {k}^{a d} \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i k} \cdot \Delta t\right] \\=& \sum_ {k=i}^{j-2}\left[\Delta \tilde{\mathbf{R}}_ {i k} \mathbf{p}_ {k}^{a d} \Delta t-\Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i k} \cdot \Delta t\right]\\&+\Delta \tilde{\mathbf{R}}_ {i,j-1} \mathbf{\eta}_ {j-1}^{a d} \Delta t-\Delta \tilde{\mathbf{R}}_ {i,j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i,j-1} \cdot \Delta t \\=& \delta \mathbf{v}_ {i,j-1}+\Delta \tilde{\mathbf{R}}_ {i,j-1} \mathbf{\eta}_ {j-1}^{a d} \Delta t-\Delta \tilde{\mathbf{R}}_ {i,j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \cdot \delta \vec{\phi}_ {i,j-1} \cdot \Delta t\end{aligned}
$$

（3）位置项$\delta \mathbf{p}_ {i,j-1} \rightarrow \delta \mathbf{p}_ {i j}$：

$$
\begin{aligned}\delta \mathbf{p}_ {i j} &=\sum_ {k=i}^{j-1}\left[\delta \mathbf{v}_ {i k} \Delta t-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \delta \vec{\phi}_ {i k} \Delta t^{2}+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k} \mathbf{\eta}_ {k}^{a d} \Delta t^{2}\right] \\&=\delta \mathbf{p}_ {i,j-1}+\delta \mathbf{v}_ {i,j-1} \Delta t-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i,j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \delta \vec{\phi}_ {i,j-1} \Delta t^{2}+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i,j-1} \mathbf{\eta}_ {j-1}^{a d} \Delta t\end{aligned}
$$

综上所述，可以得到噪声预积分的递推形象如下（令$\mathbf{\eta}_ {k}^{d}=\left[\left(\boldsymbol{\eta}_ {k}^{g d}\right)^{T}\left(\boldsymbol{\eta}_ {k}^{\mathrm{ad}}\right)^{T}\right]^{T}$）：

$$
\begin{aligned}\boldsymbol{\eta}_ {i j}^{\Delta}&=\left[\begin{array}{ccc}\Delta \tilde{\mathbf{R}}_ {j, j-1} & \mathbf{0} & \mathbf{0} \\-\Delta \tilde{\mathbf{R}}_ {i ,j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \Delta t & \mathbf{I} & \mathbf{0} \\-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i, j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \Delta t^{2} & \Delta t \mathbf I & \mathbf{I}\end{array}\right] \boldsymbol{\eta}_ {i ,j-1}^{\Delta} \\&~+\left[\begin{array}{cc}
\mathbf{J}_ {r}^{j-1} \Delta t & \mathbf{0} \\
\mathbf{0} & \Delta \tilde{\mathbf{R}}_ {i,j-1} \Delta t \\
\mathbf{0} & \frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i, j-1} \Delta t^{2}
\end{array}\right] \boldsymbol{\eta}_ {j-1}^{d}\\&=\mathbf{A}_ {j-1} \boldsymbol{\eta}_ {i ,j-1}^{\Delta}+\mathbf{B}_ {j-1} \boldsymbol{\eta}_ {j-1}^{d}\end{aligned}
$$

其中：

$$
\begin{aligned}&\mathbf{A}_ {j-1}=\left[\begin{array}{ccc}\Delta \tilde{\mathbf{R}}_ {j,j-1} & \mathbf{0} & \mathbf{0} \\-\Delta \tilde{\mathbf{R}}_ {i,j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \Delta t & \mathbf{I} & \mathbf{0} \\-\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i,j-1} \cdot\left(\tilde{\mathbf{f}}_ {j-1}-\mathbf{b}_ {i}^{a}\right)^{\wedge} \Delta t^{2} & \Delta t \mathbf{I} & \mathbf{I}\end{array}\right]\\&\mathbf{B}_ {j-1}=\left[\begin{array}{cc}\mathbf{J}_ {r}^{j-1} \Delta t & \mathbf{0} \\\mathbf{0} & \Delta \tilde{\mathbf{R}}_ {i,j-1} \Delta t \\\mathbf{0} & \frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i,j-1} \Delta t^{2}\end{array}\right]\end{aligned}
$$

而噪声的协方差也就有了下面的递推形式：

$$
\boldsymbol{\Sigma}_ {i j}=\mathbf{A}_ {j-1} \boldsymbol{\Sigma}_ {i j-1} \mathbf{A}_ {j-1}^{T}+\mathbf{B}_ {j-1} \boldsymbol{\Sigma}_ {\mathbf{\eta}} \mathbf{B}_ {j-1}^{T}
$$

## bias更新

目前为止做的计算都是假设了$i,j$时刻之间的bias是不变化的。如果bias发生了更新，需要将预计分测量值整个重新计算（bias在这段时刻里依然是恒定的，但是bias的值可能会被优化等方式更新）。目前的做法是将这个过程线性化，来得到一阶近似结果。现在先规定一些符号，首先我们将旧的bias标记为$\overline{\mathbf{b}}_ {i}^{g} ,\overline{\mathbf{b}}_ {i}^{a}$，而新的bias$\hat{\mathbf{b}}_ {i}^{g} , \hat{\mathbf{b}}_ {i}^{a}$是由旧的bias加上更新量$\delta\mathbf{b}_ {i}^{g}, \delta\mathbf{b}_ {i}^{a}$得到的，即：

$$
\hat{\mathbf{b}}_ {i}^{g} \leftarrow \overline{\mathbf{b}}_ {i}^{g}+\delta \mathbf{b}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a} \leftarrow \overline{\mathbf{b}}_ {i}^{a}+\delta \mathbf{b}_ {i}^{a}
$$

则有一阶近似如下（类似于性质$\operatorname{Exp}(\vec{\phi}+\delta \vec{\phi}) \approx \operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}\left(\mathbf{J}_ {r}(\vec{\phi}) \cdot \delta \vec{\phi}\right)$）：

$$
\begin{array}{l}\Delta \tilde{\mathbf{R}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}\right) \approx \Delta \tilde{\mathbf{R}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}\right) \cdot \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \\\Delta \tilde{\mathbf{v}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g} \hat{\mathbf{b}}_ {i}^{a}\right) \approx \Delta \tilde{\mathbf{v}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}, \overline{\mathbf{b}}_ {i}^{a}\right)+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a} \\\Delta \tilde{\mathbf{p}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right) \approx \Delta \tilde{\mathbf{p}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}, \overline{\mathbf{b}}_ {i}^{a}\right)+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}\end{array}
$$

如果做符号简化如下：

$$
\begin{array}{l}\Delta \hat{\mathbf{R}}_ {i j} \doteq \Delta \tilde{\mathbf{R}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}\right), \Delta \overline{\mathbf{R}}_ {i j} \doteq \Delta \tilde{\mathbf{R}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}\right) \\\Delta \hat{\mathbf{v}}_ {i j} \doteq \Delta \tilde{\mathbf{v}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right), \Delta \overline{\mathbf{v}}_ {i j} \doteq \Delta \tilde{\mathbf{v}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}, \overline{\mathbf{b}}_ {i}^{a}\right) \\\Delta \hat{\mathbf{p}}_ {i j} \doteq \Delta \tilde{\mathbf{p}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right), \Delta \overline{\mathbf{p}}_ {i j} \doteq \Delta \tilde{\mathbf{p}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}, \overline{\mathbf{b}}_ {i}^{a}\right)\end{array}
$$

就可以写成：

$$
\begin{array}{l}\Delta \hat{\mathbf{R}}_ {i j} \approx \Delta \overline{\mathbf{R}}_ {i j} \cdot \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \\\Delta \hat{\mathbf{v}}_ {i j} \approx \Delta \overline{\mathbf{v}}_ {i j}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a} \\\Delta \hat{\mathbf{p}}_ {i j} \approx \Delta \overline{\mathbf{p}}_ {i j}+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}\end{array}
$$

下面我们需要推导的是式子中的各个偏导数。

（1）旋转项$\Delta \hat{\mathbf{R}}_ {i j} \approx \Delta \overline{\mathbf{R}}_ {i j} \cdot \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathrm{b}}^{y}} \delta \mathbf{b}_ {i}^{g}\right)$：

$$
\begin{aligned}\Delta \hat{\mathbf{R}}_ {i j} &=\Delta \tilde{\mathbf{R}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}\right) \\&=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\hat{\mathbf{b}}_ {i}^{g}\right) \Delta t\right) \\&=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\left(\overline{\mathbf{b}}_ {i}^{g}+\delta \mathbf{b}_ {i}^{g}\right)\right) \Delta t\right) \\&=\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\overline{\mathbf{b}}_ {i}^{g}\right) \Delta t-\delta \mathbf{b}_ {i}^{g} \Delta t\right) \\& \approx \prod_ {k=i}^{j-1}\left(\operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\overline{\mathbf{b}}_ {i}^{g}\right) \Delta t\right) \cdot \operatorname{Exp}\left(-\mathbf{J}_ {r}^{k} \delta \mathbf{b}_ {i}^{g} \Delta t\right)\right)\end{aligned}
$$

到了这一步后，使用的变形手法与之前分离测量值与噪声的时候类似，我们依然利用伴随性质来处理。先做一些符号简化，令：

$$
\mathbf{M}_ {k}=\operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\overline{\mathbf{b}}_ {i}^{g}\right) \Delta t\right)\\\operatorname{Exp}\left(\mathbf{d}_ {k}\right)=\operatorname{Exp}\left(-\mathbf{J}_ {r}^{k} \delta \mathbf{b}_ {i}^{g} \Delta t\right)
$$

则有：

$$
\Delta\hat{\mathbf R}_ {ij} = \mathbf{M}_ {i} \cdot \operatorname{Exp}\left(\mathbf{d}_ {i}\right) \cdot \mathbf{M}_ {i+1} \cdot \operatorname{Exp}\left(\mathbf{d}_ {i+1}\right) \cdots \mathbf{M}_ {j-2} \cdot \operatorname{Exp}\left(\mathbf{d}_ {j-2}\right) \cdot \mathbf{M}_ {j-1} \cdot \operatorname{Exp}\left(\mathbf{d}_ {j-1}\right)
$$

根据伴随性质，我们可以得到：

$$
\begin{array}{l}\mathbf{M}_ {i} \cdot \operatorname{Exp}\left(\mathbf{d}_ {i}\right) \cdot \mathbf{M}_ {i+1} \cdot \operatorname{Exp}\left(\mathbf{d}_ {i+1}\right) \cdots \mathbf{M}_ {j-2} \cdot \operatorname{Exp}\left(\mathbf{d}_ {j-2}\right) \cdot \mathbf{M}_ {j-1} \cdot \operatorname{Exp}\left(\mathbf{d}_ {j-1}\right) \\=\mathbf{M}_ {i} \cdot\left(\operatorname{Exp}\left(\mathbf{d}_ {i}\right) \cdot \mathbf{M}_ {i+1}\right) \cdot \operatorname{Exp}\left(\mathbf{d}_ {i+1}\right) \cdots \mathbf{M}_ {j-2} \cdot\left(\operatorname{Exp}\left(\mathbf{d}_ {j-2}\right) \cdot \mathbf{M}_ {j-1}\right) \cdot \operatorname{Exp}\left(\mathbf{d}_ {j-1}\right) \\=\mathbf{M}_ {i} \cdot\left(\mathbf{M}_ {i+1} \operatorname{Exp}\left(\mathbf{M}_ {i+1}^{T} \mathbf{d}_ {i}\right)\right) \cdot \operatorname{Exp}\left(\mathbf{d}_ {i+1}\right) \cdots \mathbf{M}_ {j-2} \cdot\left(\operatorname{Exp}\left(\mathbf{d}_ {j-2}\right) \cdot \mathbf{M}_ {j-1}\right) \cdot \operatorname{Exp}\left(\mathbf{d}_ {j-1}\right) \\=\mathbf{M}_ {i} \mathbf{M}_ {i+1} \mathbf{M}_ {i+2} \operatorname{Exp}\left(\mathbf{M}_ {i+2}^{T} \mathbf{M}_ {i+1}^{T} \mathbf{d}_ {i}\right) \operatorname{Exp}\left(\mathbf{M}_ {i+2}^{T} \mathbf{d}_ {i+1}\right) \cdots \\=\cdots \\=\left(\prod_ {k=i}^{j-1} \mathbf{M}_ {k}\right) \cdot\left(\operatorname{Exp}\left(\left(\prod_ {k=i+1}^{j-1} \mathbf{M}_ {k}\right)^{T} \mathbf{d}_ {i}\right)\right) \cdot\left(\operatorname{Exp}\left(\left(\prod_ {k=i+2}^{j-1} \mathbf{M}_ {k}\right)^{T} \mathbf{d}_ {i+1}\right)\right) \cdots\left(\operatorname{Exp}\left(\left(\prod_ {k=j-1}^{j-1} \mathbf{M}_ {k}\right)^{T} \mathbf{d}_ {j-2}\right)\right) \cdot\left(\operatorname{Exp}\left(\mathbf{d}_ {j-1}\right)\right)\end{array}
$$

由于$\prod_ {k=m}^{j-1} \mathbf{M}_ {k}=\prod_ {k=m}^{j-1} \operatorname{Exp}\left(\left(\tilde{\boldsymbol{\omega}}_ {k}-\overline{\mathbf{b}}_ {i}^{g}\right) \Delta t\right)=\Delta \overline{\mathbf{R}}_ {m j}$，则上式可以写为：

$$
\begin{array}{l}\Delta \overline{\mathbf{R}}_ {i j} \operatorname{Exp}\left(\Delta \overline{\mathbf{R}}_ {i+1 ,}^{T} \mathbf{d}_ {i}\right) \operatorname{Exp}\left(\Delta \overline{\mathbf{R}}_ {i+2,j}^{T} \mathbf{d}_ {i+1}\right) \cdots \operatorname{Exp}\left(\Delta \overline{\mathbf{R}}_ {j-1,j}^{T} \mathbf{d}_ {j-2}\right) \operatorname{Exp}\left(\Delta \overline{\mathbf{R}}_ {j j}^{T} \mathbf{d}_ {j-1}\right) \\=\Delta \overline{\mathbf{R}}_ {i j} \prod_ {k=i}^{j-1} \operatorname{Exp}\left(\Delta \overline{\mathbf{R}}_ {k+1,j}^{T} \mathbf{d}_ {k}\right)\end{array}
$$

也就是：

$$
\Delta \hat{\mathbf{R}}_ {i j}=\Delta \overline{\mathbf{R}}_ {i j} \prod_ {k=i}^{j-1} \operatorname{Exp}\left(-\Delta \overline{\mathbf{R}}_ {k+1 j}^{T} \mathbf{J}_ {r}^{k} \delta \mathbf{b}_ {i}^{g} \Delta t\right)
$$

令$\mathbf{c}_ {k}=-\Delta \overline{\mathbf{R}}_ {k+1 j}^{T} \mathbf{J}_ {r}^{k} \delta \mathbf{b}_ {i}^{g} \Delta t$，由于$\delta \mathbf b_ {i}^g$很小，所以$\mathbf {c}_k$很小，可以利用性质$\operatorname{Exp}(\vec{\phi}+\delta \vec{\phi}) \approx \operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}\left(\mathbf{J}_ {r}(\vec{\phi}) \cdot \delta \vec{\phi}\right)$以及$\mathbf J_r(\delta\vec\phi)\approx \mathbf I$，则有：

$$
\begin{aligned}\operatorname{Exp}\left(\mathbf{c}_ {k}\right) \operatorname{Exp}\left(\mathbf{c}_ {k+1}\right)&=\operatorname{Exp}\left(\mathbf{c}_ {k}\right) \operatorname{Exp}\left(\mathbf{I}\cdot\mathbf{c}_ {k+1}\right)\\&\approx \operatorname{Exp}\left(\mathbf{c}_ {k}\right) \operatorname{Exp}\left(\mathbf J_r(\mathbf c_k)\cdot\mathbf{c}_ {k+1}\right) \\ &\approx \operatorname{Exp}\left(\mathbf{c}_ {k}+\mathbf{c}_ {k+1}\right)\end{aligned}
$$

因此有：

$$
\begin{aligned}\prod_ {k=i}^{j-1} \operatorname{Exp}\left(\mathbf{c}_ {k}\right) &=\operatorname{Exp}\left(\mathbf{c}_ {i}\right) \operatorname{Exp}\left(\mathbf{c}_ {i+1}\right) \prod_ {k=i+2}^{j-1} \operatorname{Exp}\left(\mathbf{c}_ {k}\right) \\& \approx \operatorname{Exp}\left(\mathbf{c}_ {i}+\mathbf{c}_ {i+1}\right) \operatorname{Exp}\left(\mathbf{c}_ {i+2}\right) \prod_ {k=i+3}^{j-1} \operatorname{Exp}\left(\mathbf{c}_ {k}\right) \\& \approx \operatorname{Exp}\left(\mathbf{c}_ {i}+\mathbf{c}_ {i+1}+\mathbf{c}_ {i+2}\right) \operatorname{Exp}\left(\mathbf{c}_ {i+3}\right) \prod_ {k=i+4}^{j-1} \operatorname{Exp}\left(\mathbf{c}_ {k}\right) \\& \approx \cdots \approx \operatorname{Exp}\left(\mathbf{c}_ {i}+\mathbf{c}_ {i+1}+\mathbf{c}_ {i+2}+\cdots \mathbf{c}_ {j-1}\right) \\&=\operatorname{Exp}\left(\sum_ {k=i}^{j-1} \mathbf{c}_ {k}\right)\end{aligned}
$$

所以可得：

$$
\Delta \hat{\mathbf{R}}_ {i j}\approx\Delta \overline{\mathbf{R}}_ {i j} \operatorname{Exp}\left(\sum_ {k=i}^{j-1}\left(-\Delta \overline{\mathbf{R}}_ {k+1，j}^{T} \mathbf{J}_ {r}^{k} \delta \mathbf{b}_ {i}^{g} \Delta t\right)\right)
$$

即：

$$
\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}}=\sum_ {k=i}^{j-1}\left(-\Delta \overline{\mathbf{R}}_ {k+1 ,j}^{T} \mathbf{J}_ {r}^{k} \Delta t\right)
$$

在实现时，可以进一步引出递推式：

$$
\begin{aligned}\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}}&=\sum_ {k=i}^{j-1}\left(-\Delta \overline{\mathbf{R}}_ {k+1 ,j}^{T} \mathbf{J}_ {r}^{k} \Delta t\right)\\ &=\sum_ {k=i}^{j-2}\left(\left(-\Delta \overline{\mathbf{R}}_ {k+1 ,j-1}\cdot\Delta\overline{\mathbf{R}}_ {j-1, j}\right)^{T} \mathbf{J}_ {r}^{j} \Delta t\right) - \Delta \overline{\mathbf{R}}_ {j j}^T \mathbf{J}_ {r}^{j-1}\Delta t \\&= \sum_ {k=i}^{j-2}\left(-\Delta \overline{\mathbf{R}}^T_ {j-1, j}\cdot\Delta\overline{\mathbf{R}}_ {k+1 ,j-1}^T \mathbf{J}_ {r}^{k} \Delta t\right) -  \mathbf{J}_ {r}^{j-1}\Delta t\\&= \Delta\overline{\mathbf{R}}^T_ {j-1, j}\cdot\sum_ {k=i}^{j-2}\left(-\Delta \overline{\mathbf{R}}_ {k+1 ,j-1}^{T} \mathbf{J}_ {r}^{k} \Delta t\right) - \mathbf{J}_ {r}^{j-1}\Delta t \\&=\Delta\overline{\mathbf{R}}^T_ {j-1, j} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i, j-1}}{\partial \overline{\mathbf{b}}^{g}}-  \mathbf{J}_ {r}^{j-1}\Delta t\\&=\Delta\overline{\mathbf{R}}_ {j, j-1} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i, j-1}}{\partial \overline{\mathbf{b}}^{g}}-  \mathbf{J}_ {r}^{j-1}\Delta t\end{aligned}
$$

（2）速度项（$\Delta \hat{\mathbf{v}}_ {i j} \approx \Delta \overline{\mathbf{v}}_ {i j}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}$）：

$$
\begin{aligned}\Delta \hat{\mathbf{v}}_ {i j} &=\Delta \tilde{\mathbf{v}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right) \\&=\sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k}\left(\hat{\mathbf{b}}_ {i}^{g}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\hat{\mathbf{b}}_ {i}^{a}\right) \Delta t\right] \\& \approx \sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}-\delta \mathbf{b}_ {i}^{a}\right) \Delta t\right] \\& \approx \sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\mathbf{I}+\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)^{\wedge}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}-\delta \mathbf{b}_ {i}^{a}\right) \Delta t\right] \\&=\sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right) \Delta t-\Delta \overline{\mathbf{R}}_ {i k} \delta \mathbf{b}_ {i}^{a} \Delta t+\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)^{\wedge}\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right) \Delta t-\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)^{\wedge} \delta \mathbf{b}_ {i}^{a} \Delta t\right] \\& \approx \sum_ {k=i}^{j-1}\Delta \tilde{\mathbf{R}}_ {i k} (\overline{\mathbf{b}}_ {i}^g)\cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right) \Delta t+\sum_ {k=i}^{j-1}\left\{-\left[\Delta \overline{\mathbf{R}}_ {i k} \Delta t\right] \delta \mathbf{b}_ {i}^{a}-\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t\right] \delta \mathbf{b}_ {i}^{g}\right\}\\& = \Delta \overline{\mathbf{v}}_ {i j}+\sum_ {k=i}^{j-1}\left\{-\left[\Delta \overline{\mathbf{R}}_ {i k} \Delta t\right] \delta \mathbf{b}_ {i}^{a}-\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t\right] \delta \mathbf{b}_ {i}^{g}\right\}\end{aligned}
$$

上述中分别用到了一阶近似，$\text{Exp}(\delta\vec\phi) \approx(\delta\vec\phi)^\wedge$以及$\mathbf{a}^{\wedge} \cdot \mathbf{b}=-\mathbf{b}^{\wedge} \cdot \mathbf{a}$，且忽略了高阶小项$\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)^{\wedge} \delta \mathbf{b}_ {i}^{a}$。所以有：

$$
\begin{array}{l}\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}}=-\sum_ {k=i}^{j-1}\left(\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t\right) \\\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}}=-\sum_ {k=i}^{j-1}\left(\Delta \overline{\mathbf{R}}_ {i k} \Delta t\right)\end{array}
$$

（3）位置项（$\Delta \hat{\mathbf{p}}_ {i j} \approx \Delta \overline{\mathbf{p}}_ {i j}+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}$）：

$$
\begin{aligned}\Delta \hat{\mathbf{p}}_ {i j} &=\Delta \tilde{\mathbf{p}}_ {i j}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right) \\&=\sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{v}}_ {i k}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right) \Delta t+\frac{1}{2} \Delta \tilde{\mathbf{R}}_ {i k}\left(\hat{\mathbf{b}}_ {i}^{g}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\hat{\mathbf{b}}_ {i}^{a}\right) \Delta t^{2}\right] \\&=\underbrace{\sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{v}}_ {i k}\left(\hat{\mathbf{b}}_ {i}^{g}, \hat{\mathbf{b}}_ {i}^{a}\right) \Delta t\right]}_ {\langle 1\rangle}+\underbrace{\frac{1}{2} \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k}\left(\hat{\mathbf{b}}_ {i}^{g}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\hat{\mathbf{b}}_ {i}^{a}\right) \Delta t^{2}\right]}_ {\langle 2\rangle}\end{aligned}
$$

下面我们分别推导$\langle 1\rangle$和$\langle 2\rangle$部分。

$$
\begin{aligned}\langle 1\rangle &=\sum_ {k=i}^{j-1}\left[\left(\Delta \overline{\mathbf{v}}_ {i k}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}\right) \Delta t\right] \\&=\sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{v}}_ {i k} \Delta t+\left(\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t\right) \delta \mathbf{b}_ {i}^{g}+\left(\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{a}} \Delta t\right) \delta \mathbf{b}_ {i}^{a}\right]\end{aligned}
$$

$$
\begin{aligned}\langle 2 \rangle & =\frac{\Delta t^{2}}{2} \sum_ {k=i}^{j-1}\left[\Delta \tilde{\mathbf{R}}_ {i k}\left(\hat{\mathbf{b}}_ {i}^{g}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\hat{\mathbf{b}}_ {i}^{a}\right)\right] \\&=\frac{\Delta t^{2}}{2} \sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}-\delta \mathbf{b}_ {i}^{a}\right)\right] \\& \approx \frac{\Delta t^{2}}{2} \sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\mathbf{I}+\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)^{\wedge}\right) \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}-\delta \mathbf{b}_ {i}^{a}\right)\right] \\& \approx \frac{\Delta t^{2}}{2} \sum_ {k=i}^{j-1}\left[\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)-\Delta \overline{\mathbf{R}}_ {i k} \delta \mathbf{b}_ {i}^{a}-\Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right]\end{aligned}
$$

$\langle2\rangle$的推导与速度项是非常类似的，也是忽略了高阶小项。将$\langle1\rangle, \langle2\rangle$合起来，可以得到：

$$
\begin{aligned}&\langle1\rangle+\langle2\rangle\\&=\sum_ {k=i}^{j-1}\left\{\left[\Delta \overline{\mathbf{v}}_ {i k} \Delta t+\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right) \Delta t^{2}\right]+\left[\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t-\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t^{2}\right] \delta \mathbf{b}_ {i}^{g}+\left[\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{\alpha}} \Delta t-\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \Delta t^{2}\right] \delta \mathbf{b}_ {i}^{a}\right\}\\&=\Delta \overline{\mathbf{p}}_ {i j}+\left\{\sum_ {k=i}^{j-1}\left[\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t-\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t^{2}\right]\right\} \delta \mathbf{b}_ {i}^{g}+\left\{\sum_ {k=i}^{j-1}\left[\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{a}} \Delta t-\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \Delta t^{2}\right]\right\} \delta \mathbf{b}_ {i}^{a}\end{aligned}
$$

所以有：

$$
\begin{array}{l}\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}}=\sum_ {k=i}^{j-1}\left[\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t-\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \cdot\left(\tilde{\mathbf{f}}_ {k}-\overline{\mathbf{b}}_ {i}^{a}\right)^{\wedge} \frac{\partial \Delta \overline{\mathbf{R}}_ {i k}}{\partial \overline{\mathbf{b}}^{g}} \Delta t^{2}\right] \\\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}}=\sum_ {k=i}^{j-1}\left[\frac{\partial \Delta \overline{\mathbf{v}}_ {i k}}{\partial \overline{\mathbf{b}}^{a}} \Delta t-\frac{1}{2} \Delta \overline{\mathbf{R}}_ {i k} \Delta t^{2}\right]\end{array}
$$

## 残差

之所以需要残差，是因为IMU预积分的测量值实际上也是优化中的一个约束量，pose graph中的边。而一般来说，预积分的残差是由计算值和测量值决定的，这里的计算值可能是通过视觉约束等等方法得到的。我们知道IMU预积分的理想值是如下：

$$
\begin{array}{l}\Delta \mathbf{R}_ {i j}=\mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \\\Delta \mathbf{v}_ {i j}=\mathbf{R}_ {i}^{T}\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right) \\\Delta \mathbf{p}_ {i j}=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)\end{array}
$$

其三项残差定义如下：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{R}_ {i j}} & \triangleq \text{Log} \left\{\left[\Delta \tilde{\mathbf{R}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}\right) \cdot \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)\right]^{T} \cdot \mathbf{R}_ {i}^{T} \mathbf{R}_ {j}\right\} \\& \triangleq \text{Log} \left[\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T} \Delta \mathbf{R}_ {i j}\right] \\& \triangleq \Delta \mathbf{v}_ {i j}-\Delta \hat{\mathbf{v}}_ {i j} \\\mathbf{r}_ {\Delta \mathbf{v}_ {i j}} & \triangleq \mathbf{R}_ {i}^{T}\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\left[\Delta \tilde{\mathbf{v}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}, \overline{\mathbf{b}}_ {i}^{a}\right)+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}\right] \\\mathbf{r}_ {\Delta \mathbf{p}_ {ij}} & \triangleq \mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\left[\Delta \tilde{\mathbf{p}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}, \overline{\mathbf{b}}_ {i}^{a}\right)+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}+\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \overline{\mathbf{b}}^{a}} \delta \mathbf{b}_ {i}^{a}\right] \\& \triangleq \Delta \mathbf{p}_ {i j}-\Delta \hat{\mathbf{p}}_ {i j}\end{aligned}
$$

从定义上来看，残差也就是用来度量计算值与测量值的差别，这也是很合理的。从前面的推导可以知道，这个测量值是由噪声加上理想值得到的（实际上我们是从理想值中分离出了噪声）。

- 一般来说，在SLAM系统中，我们需要优化的是$\mathbf{R}_ {i}, \mathbf{p}_ {i}, \mathbf{v}_ {i}, \mathbf{R}_ {j}, \mathbf{p}_ {j}, \mathbf{v}_ {j}$，不过在带有IMU的系统中，bias的影响往往不可忽视，因此一般也会加上对bias的优化。不过从残差的定义上来看，实际上优化的是bias的变化量$\delta \mathbf{b}_ {i}^{g}, \delta \mathbf{b}_ {i}^{a}$。所以在IMU预积分中，完整的一个导航状态为：$\mathbf{R}_ {i}, \mathbf{p}_ {i}, \mathbf{v}_ {i}, \mathbf{R}_ {j}, \mathbf{p}_ {j}, \mathbf{v}_ {j}, \delta \mathbf{b}_ {i}^{g}, \delta \mathbf{b}_ {i}^{a}$。
- 对各个状态的更新操作如下：
    
    $$
    \begin{array}{l}\mathbf{R}_ {i} \leftarrow \mathbf{R}_ {i} \cdot \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right) ; \mathbf{p}_ {i} \leftarrow \mathbf{p}_ {i}+\mathbf{R}_ {i} \cdot \delta \mathbf{p}_ {i}; \mathbf{v}_ {i} \leftarrow \mathbf{v}_ {i}+\delta \mathbf{v}_ {i}; \\\mathbf{R}_ {j} \leftarrow \mathbf{R}_ {j} \cdot \operatorname{Exp}\left(\delta \vec{\phi}_ {j}\right) ; \mathbf{p}_ {j} \leftarrow \mathbf{p}_ {j}+\mathbf{R}_ {j} \cdot \delta \mathbf{p}_ {j} ; \mathbf{v}_ {j} \leftarrow \mathbf{v}_ {j}+\delta \mathbf{v}_ {j}; \\\delta \mathbf{b}_ {i}^{g} \leftarrow \delta \mathbf{b}_ {i}^{g}+\widetilde{\delta \mathbf{b}_ {i}^{g}} ; \delta \mathbf{b}_ {i}^{a} \leftarrow \delta \mathbf{b}_ {i}^{a}+\widetilde{\delta \mathbf{b}_ {i}^{a}}\end{array}
    $$
    
    需要注意的是，由于我们优化的是bias的增量${\delta \mathbf{b}_ {i}^{g}},{\delta \mathbf{b}_ {i}^{a}}$，因此这里的$\widetilde{\delta \mathbf{b}_ {i}^{g}},\widetilde{\delta \mathbf{b}_ {i}^{a}}$实际上是增量的增量，也就是通过增量的Jacobian来计算的。但是实际上增量的Jacobian与原来的Jacobian计算方法上是一样的，只不过它的初始状态是从0开始（实际上之前也运用过这样的方式进行优化过，每次优化的变量实际上是更新量）。
    
- 为何位置没有采用速度一样的方式去更新（$\mathbf{p}_ {i} \leftarrow \mathbf{p}_ {i}+\mathbf{R}_ {i} \cdot \delta \mathbf{p}_ {i}; \mathbf{v}_ {i} \leftarrow \mathbf{v}_ {i}+\delta \mathbf{v}_ {i}$）？这个问题实际上如果是在$\text{SE(3)}$上，也就是直接用transformation matrix，得到的结果是：
    
    $$
    \begin{aligned}\mathbf{T}_ {i}^{\prime} &=\mathbf{T}_ {i} \cdot \delta \mathbf{T}_ {i}=\left[\begin{array}{cc}\mathbf{R}_ {i} & \mathbf{p}_ {i} \\0 & 1\end{array}\right]\left[\begin{array}{cc}\delta \mathbf{R}_ {i} & \delta \mathbf{p}_ {i} \\0 & 1\end{array}\right] \\&=\left[\begin{array}{cc}\mathbf{R}_ {i} \cdot \delta \mathbf{R}_ {i} & \mathbf{p}_ {i}+\mathbf{R}_ {i} \cdot \delta \mathbf{p}_ {i} \\0 & 1\end{array}\right]=\left[\begin{array}{cc}\mathbf{R}_ {i}^{\prime} & \mathbf{p}_ {i}^{\prime} \\0 & 1\end{array}\right]\end{aligned}
    $$
    
    也就是上述更新的操作，从物理意义上理解，就是先进行了旋转再进行了平移的变换。不过，毕竟我们一麻溜推导下来，用的都是$\text{SO(3)}$上的操作，平移与旋转是分开操作的（平移的残差中已经包含了旋转的计算），我个人认为还是$\mathbf{p}_ {i} \leftarrow \mathbf{p}_ {i}+  \delta \mathbf{p}_ {i}$理论上更合理一些。在实际中，可能二者使用起来没什么太大的区别。
    
- 由于噪声不是的零均值正态分布，因此不同的协方差对应着不同约束项的权重（实际上权重是协方差的逆），这样给出来的结果是一个无偏估计。最终我们优化目标就是能使得加权残差的平方和最小。另外，在优化时候，实际上优化变量是由Jacobian矩阵来决定的（高斯牛顿的海森矩阵也是由Jacobian矩阵来近似的），因此我们的下一个任务就是求出Jacobian矩阵。

## Jacobian

接下来是最后一步，计算出Jacobian矩阵。我们将Jacobian矩阵分成三类：（1）”0“矩阵，也就是残差和某些变量是完全无关的；（2）线性的，也就是残差和某些变量是线性相关的，这样的Jacobian也可以由系数直接得到；（3）其他的，也就是残差和某些变量的关系较为复杂，需要进行相应的变形才能求得Jacobian矩阵。

### $\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}$的Jacobian

（1）“0”矩阵。由于$\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}$中不含$\mathbf{p}_ {i} , \mathbf{p}_ {j}, \mathbf{V}_ {i}, \mathbf{V}_ {j}, \delta \mathbf{b}_ {i}^{a}$，因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {ij}}}{\partial \mathbf{p}_ {i}}=\mathbf{0},\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {ij}}}{\partial \mathbf{p}_ {j}}=\mathbf{0},\\\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}}{\partial \mathbf{v}_ {i}}=\mathbf{0},\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}}{\partial \mathbf{v}_ {j}}=\mathbf{0},\\\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}}{\partial \delta \mathbf{b}_ {i}^{a}}=\mathbf{0}
$$

（2）线性类：无。

（3）其他类：

- 下面求关于$\vec{\phi}_ {i}$的Jacobian：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\mathbf{R}_ {i} \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right)\right) &=\text{Log} \left[\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T}\left(\mathbf{R}_ {i} \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right)\right)^{T} \mathbf{R}_ {j}\right] \\& =\text{Log} \left[\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T} \operatorname{Exp}\left(-\delta \vec{\phi}_ {i}\right) \mathbf{R}_ {i}^{T} \mathbf{R}_ {j}\right] \\&=\text{Log}\left[\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T} \mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \operatorname{Exp}\left(-\mathbf{R}_ {j}^{T} \mathbf{R}_ {i} \delta \vec{\phi}_ {i}\right)\right] \\&=\text{Log} \left\{\operatorname{Exp}\left[\text{Log}\left(\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T} \mathbf{R}_ {i}^{T} \mathbf{R}_ {j}\right)\right] \cdot \operatorname{Exp}\left(-\mathbf{R}_ {j}^{T} \mathbf{R}_ {i} \delta \vec{\phi}_ {i}\right)\right\} \\&=\text{Log}\left[\operatorname{Exp}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\mathbf{R}_ {i}\right)\right) \cdot \operatorname{Exp}\left(-\mathbf{R}_ {j}^{T} \mathbf{R}_ {i} \delta \vec{\phi}_ {i}\right)\right] \\& \approx \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\mathbf{R}_ {i}\right)-\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\mathbf{R}_ {i}\right)\right) \mathbf{R}_ {j}^{T} \mathbf{R}_ {i} \delta \vec{\phi}_ {i} \\& = \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}-\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right) \mathbf{R}_ {j}^{T} \mathbf{R}_ {i} \delta \vec{\phi}_ {i}\end{aligned}
$$

上面的推导中，用到的性质有：$(\operatorname{Exp}(\vec{\phi}))^{T}=\operatorname{Exp}(-\vec{\phi})$，伴随性质，$\text{Log} (\operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}(\delta \vec{\phi}))=\vec{\phi}+\mathbf{J}_ {r}^{-1}(\vec{\phi}) \cdot \delta \vec{\phi}$。综上所述，有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}}{\partial \vec{\phi}_ {i}}=-\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right) \mathbf{R}_ {j}^{T} \mathbf{R}_ {i}
$$

- 使用类似的方法，可以得到$\vec{\phi}_ {j}$的Jacobian：

$$
\begin{aligned}\mathbf{r}_ {\Delta R_ {i j}}\left(\mathbf{R}_ {j} \operatorname{Exp}\left(\delta \vec{\phi}_ {j}\right)\right) &=\text{Log} \left[\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T} \mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \operatorname{Exp}\left(\delta \vec{\phi}_ {j}\right)\right] \\&=\text{Log} \left\{\operatorname{Exp}\left[\text{Log} \left(\left(\Delta \hat{\mathbf{R}}_ {i j}\right)^{T} \mathbf{R}_ {i}^{T} \mathbf{R}_ {j}\right)\right] \cdot \operatorname{Exp}\left(\delta \vec{\phi}_ {j}\right)\right\} \\&=\text{Log} \left\{\operatorname{Exp}\left(\mathbf{r}_ {\Delta R_ {i j}}\left(\mathbf{R}_ {j}\right)\right) \cdot \operatorname{Exp}\left(\delta \vec{\phi}_ {j}\right)\right\} \\& \approx \mathbf{r}_ {\Delta R_ {i j}}\left(\mathbf{R}_ {j}\right)+\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta R_ {i j}}\left(\mathbf{R}_ {j}\right)\right) \delta \vec{\phi}_ {j} \\& = \mathbf{r}_ {\Delta R_ {i j}}+\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta R_ {i j}}\right) \delta \vec{\phi}_ {j}\end{aligned}
$$

因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}}{\partial \vec{\phi}_ {j}}=\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right)
$$

- 关于$\delta \mathbf{b}_ {i}^g$的Jacobian（$\mathbf R_ {i}, \mathbf R_ {j}$都是与残差项$\Delta \mathbf{R}_ {ij}$有关，而$\delta \mathbf{b}_ {i}^g$则是与残差项$\Delta \tilde{\mathbf{R}}_ {ij}$有关）：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}+\widetilde{\delta \mathbf{b}_ {i}^{g}}\right) &\approx\text{Log}\left\{\left[\Delta \tilde{\mathbf{R}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}\right) \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}}\left(\delta \mathbf{b}_ {i}^{g}+\widetilde{\delta \mathbf{b}_ {i}^{g}}\right)\right)\right]^{T} \mathbf{R}_ {i}^{T} \mathbf{R}_ {j}\right\} \\& \approx \text{Log} \left\{\left[\Delta \tilde{\mathbf{R}}_ {i j}\left(\overline{\mathbf{b}}_ {i}^{g}\right) \operatorname{Exp}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \operatorname{Exp}\left(\mathbf{J}_ {r}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{g}}\right)\right]^{T} \Delta \mathbf{R}_ {i j}\right\} \end{aligned}
$$

令$\boldsymbol{\varepsilon} \doteq \mathbf{J}_ {r}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right)$，则：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}+\widetilde{\delta \mathbf{b}_ {i}^{g}}\right) &\approx \text{Log} \left\{\left[\Delta \hat{\mathbf{R}}_ {i j} \cdot \operatorname{Exp}\left(\boldsymbol{\varepsilon} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{y}}\right)\right]^{T} \Delta \mathbf{R}_ {i j}\right\}\\&= \text{Log} \left[\operatorname{Exp}\left(-\boldsymbol{\varepsilon} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{g}}\right) \Delta \hat{\mathbf{R}}_ {i j}^{T} \Delta \mathbf{R}_ {i j}\right]\\&=\text{Log} \left[\operatorname{Exp}\left(-\boldsymbol{\varepsilon} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{g}}\right) \operatorname{Exp}\left(\text{Log} \left(\Delta \hat{\mathbf{R}}_ {i j}^{T} \Delta \mathbf{R}_ {i j}\right)\right)\right]\\&=\text{Log} \left[\operatorname{Exp}\left(-\boldsymbol{\varepsilon} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{g}}\right) \operatorname{Exp}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}\right)\right)\right]\\&=\text{Log} \left\{\operatorname{Exp}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}\right)\right) \operatorname{Exp}\left[-\operatorname{Exp}\left(-\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}\right)\right) \cdot \boldsymbol{\varepsilon} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{g}}\right]\right\}\\&\approx \mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}\right)-\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}\right)\right) \cdot \operatorname{Exp}\left(-\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\left(\delta \mathbf{b}_ {i}^{g}\right)\right) \cdot \boldsymbol{\varepsilon} \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \widetilde{\delta \mathbf{b}_ {i}^{g}}\\&=\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}-\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right) \cdot \operatorname{Exp}\left(-\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right) \cdot \mathbf{J}_ {r}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \cdot \widetilde{\delta \mathbf{b}_ {i}^{g}}\end{aligned}
$$

上面的推导中，用到的性质有：$\operatorname{Exp}(\vec{\phi}+\delta \vec{\phi}) \approx \operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}\left(\mathbf{J}_ {r}(\vec{\phi}) \cdot \delta \vec{\phi}\right)$，$(\operatorname{Exp}(\vec{\phi}))^{T}=\operatorname{Exp}(-\vec{\phi})$，伴随性质，$\text{Log} (\operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}(\delta \vec{\phi}))=\vec{\phi}+\mathbf{J}_ {r}^{-1}(\vec{\phi}) \cdot \delta \vec{\phi}$（可以看出来推导的方法是很类似的）。综上所述，可以得到：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{R}_ {ij}}}{\partial \delta \mathbf{b}_ {i}^{\mathrm{g}}}=-\mathbf{J}_ {r}^{-1}\left(\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right) \cdot \operatorname{Exp}\left(-\mathbf{r}_ {\Delta \mathbf{R}_ {i j}}\right) \cdot \mathbf{J}_ {r}\left(\frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}} \delta \mathbf{b}_ {i}^{g}\right) \cdot \frac{\partial \Delta \overline{\mathbf{R}}_ {i j}}{\partial \overline{\mathbf{b}}^{g}}
$$

这里需要注意的这儿我们是对$\delta \mathbf{b}_ {i}^{g}$求导，而$\mathbf{r}_ {\Delta \mathbf{R}_ {ij}}$也是新的bias（$\mathbf{b}_i^g+\delta \mathbf {b}_i^g$）的测量预积分值。至于为什么要这么做，也许之后会找到答案。

### $\mathbf{r}_ {\Delta \mathbf{v}_ {i j}}$的Jacobian

（1）“0”类：由于$\mathbf{r}_ {\Delta \mathbf{v}_ {i j}}$中不包含$\mathbf{R}_ {j}, \mathbf{p}_ {i}, \mathbf{p}_ {j}$，因此：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {ij}}}{\partial  \vec{\phi}_ {j}}=\mathbf{0}, \frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {ij}}}{\partial \mathbf{p}_ {i}}=\mathbf{0}, \frac{\partial \mathbf{r}_ {\Delta v_ {i j}}}{\partial \mathbf{p}_ {j}}=\mathbf{0}
$$

（2）线性类：由于$\mathbf{r}_ {\Delta \mathbf{v}_ {i j}}$与$\delta \mathbf{b}_ {i}^{g} , \delta \mathbf{b}_ {i}^{a}$是线性关系，因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {i j}}}{\partial \delta \mathbf{b}_ {i}^{\mathrm{g}}}=-\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \mathbf{b}^{g}}, \frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {j j}}}{\partial \delta \mathbf{b}_ {i}^{\mathrm{a}}}=-\frac{\partial \Delta \overline{\mathbf{v}}_ {i j}}{\partial \mathbf{b}^{a}}
$$

（3）其他类：

- 关于$\mathbf{v}_i$的Jacobian

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{v}_ {j j}}\left(\mathbf{v}_ {i}+\delta \mathbf{v}_ {i}\right) &=\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\delta \mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j} \\&=\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j}-\mathbf{R}_ {i}^{T} \delta \mathbf{v}_ {i} \\&=\mathbf{r}_ {\Delta \mathbf{v}_ {i j}}\left(\mathbf{v}_ {i}\right)-\mathbf{R}_ {i}^{T} \delta \mathbf{v}_ {i} \\ &=\mathbf{r}_ {\Delta \mathbf{v}_ {i j}}-\mathbf{R}_ {i}^{T} \delta \mathbf{v}_ {i}\end{aligned}
$$

因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {i j}}}{\partial \mathbf{v}_ {i}}=-\mathbf{R}_ {i}^{T}
$$

- 关于$\mathbf{v}_j$的Jacobian

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{v}_ {y}}\left(\mathbf{v}_ {j}+\delta \mathbf{v}_ {j}\right) &=\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}+\delta \mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j} \\&=\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j}+\mathbf{R}_ {i}^{T} \delta \mathbf{v}_ {j} \\&=\mathbf{r}_ {\Delta \mathbf{v}_ {i j}}\left(\mathbf{v}_ {j}\right)+\mathbf{R}_ {i}^{T} \delta \mathbf{v}_ {j} \\&= \mathbf{r}_ {\Delta \mathbf{v}_ {j j}}+\mathbf{R}_ {i}^{T} \delta \mathbf{v}_ {j}\end{aligned}
$$

因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {i j}}}{\partial \mathbf{v}_ {j}}=\mathbf{R}_ {i}^{T}
$$

- 关于$\vec\phi_i$的Jacobian

$$
\begin{aligned}\mathbf{r}_ {\Delta v_ {ij}}\left(\mathbf{R}_ {i} \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right)\right) &=\left(\mathbf{R}_ {i} \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right)\right)^{T}\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j} \\& = \operatorname{Exp}\left(-\delta \vec{\phi}_ {i}\right) \cdot \mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j} \\& \approx\left(\mathbf{I}-\left(\delta \vec{\phi}_ {i}\right)^{\wedge}\right) \cdot \mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j} \\&=\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)-\Delta \hat{\mathbf{v}}_ {i j}-\left(\delta \vec{\phi}_ {i}\right)^{\wedge} \cdot \mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right) \\& =\mathbf{r}_ {\Delta v_ {i j}}\left(\mathbf{R}_ {i}\right)+\left[\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)\right]^{\wedge} \cdot \delta \vec{\phi}_ {i} \\& = \mathbf{r}_ {\Delta v_ {i j}}+\left[\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)\right]^{\wedge} \cdot \delta \vec{\phi}_ {i}\end{aligned}
$$

上述推导用到的规则有：$(\operatorname{Exp}(\vec{\phi}))^{T}=\operatorname{Exp}(-\vec{\phi})$，$\operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right) \approx \mathbf{I}+(\delta\vec\phi_i)^{\wedge}$，$\mathbf{a}^{\wedge} \cdot \mathbf{b}=-\mathbf{b}^{\wedge} \cdot \mathbf{a}$。因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{v}_ {i j}}}{\partial  \vec{\phi}_ {i}}=\left[\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{v}_ {j}-\mathbf{v}_ {i}-\mathbf{g} \cdot \Delta t_ {i j}\right)\right]^{\wedge}
$$

### $\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}$的Jacobian

（1）“0”类：由于$\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}$中不包含$\mathbf R_ {j}, \mathbf{v}_j$

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {j j}}}{\partial  \vec{\phi}_ {j}}=\mathbf{0}, \frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \mathbf{v}_ {j}}=\mathbf{0}
$$

（2）线性类：由于$\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}$与$\delta \mathbf{b}_ {i}^{g} , \delta \mathbf{b}_ {i}^{a}$是线性关系，因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \delta \mathbf{b}_ {i}^{g}}=-\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \mathbf{b}^{g}}, \frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \delta \mathbf{b}_ {i}^{a}}=-\frac{\partial \Delta \overline{\mathbf{p}}_ {i j}}{\partial \mathbf{b}^{a}}
$$

（3）其他类：

- 关于$\mathbf{p}_i$的Jacobian：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}\left(\mathbf{p}_ {i}+\mathbf{R}_ {i} \cdot \delta \mathbf{p}_ {i}\right) &=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{R}_ {i} \cdot \delta \mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j} \\&=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j}-\mathbf{I} \cdot \delta \mathbf{p}_ {i} \\&=\mathbf{r}_ {\Delta \mathbf{p}_ {ij}}\left(\mathbf{p}_ {i}\right)-\mathbf{I} \cdot \delta \mathbf{p}_ {i} \\&=\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}-\mathbf{I} \cdot \delta \mathbf{p}_ {i}\end{aligned}
$$

因此可以得到：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \mathbf{p}_ {i}}=-\mathbf{I}
$$

- 关于$\mathbf{p}_j$的Jacobian：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{p}_ {ij}}\left(\mathbf{p}_ {j}+\mathbf{R}_ {j} \cdot \delta \mathbf{p}_ {j}\right) &=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}+\mathbf{R}_ {j} \cdot \delta \mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j} \\&=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j}+\mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \cdot \delta \mathbf{p}_ {j} \\&=\mathbf{r}_ {\Delta \mathbf{p}_ {ij}}\left(\mathbf{p}_ {j}\right)+\mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \cdot \delta \mathbf{p}_ {j} \\&=\mathbf{r}_ {\Delta \mathbf{p}_ {ij}}+\mathbf{R}_ {i}^{T} \mathbf{R}_ {j} \cdot \delta \mathbf{p}_ {j}\end{aligned}
$$

因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \mathbf{p}_ {j}}=\mathbf{R}_ {i}^{T} \mathbf{R}_ {j}
$$

- 关于$\mathbf{v}_j$的Jacobian：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{p}_ {ij}}\left(\mathbf{v}_ {i}+\delta \mathbf{v}_ {i}\right) &=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\delta \mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j} \\&=\mathbf{R}_ {i}^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j}-\mathbf{R}_ {i}^{T} \Delta t_ {i j} \cdot \delta \mathbf{v}_ {i} \\&=\mathbf{r}_ {\Delta \mathbf{p}_ {ij}}\left(\mathbf{v}_ {i}\right)-\mathbf{R}_ {i}^{T} \Delta t_ {i j} \cdot \delta \mathbf{v}_ {i} \\ &=\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}-\mathbf{R}_ {i}^{T} \Delta t_ {i j} \cdot \delta \mathbf{v}_ {i}\end{aligned}
$$

因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \mathbf{v}_ {i}}=-\mathbf{R}_ {i}^{T} \Delta t_ {i j}
$$

- 关于$\vec\phi_i$的Jacobian：

$$
\begin{aligned}\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}\left(\mathbf{R}_ {i} \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right)\right) &=\left(\mathbf{R}_ {i} \operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right)\right)^{T}\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j} \\& = \operatorname{Exp}\left(-\delta \vec{\phi}_ {i}\right) \cdot \mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j} \\& \approx\left(\mathbf{I}-\left(\delta \vec{\phi}_ {i}\right)^{\wedge}\right) \cdot \mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j} \\&=\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)-\Delta \hat{\mathbf{p}}_ {i j}-\left(\delta \vec{\phi}_ {i}\right)^{\wedge} \mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right) \\& = \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}\left(\mathbf{R}_ {i}\right)+\left[\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)\right]^{\wedge} \cdot \delta \vec{\phi}_ {i} \\& =\mathbf{r}_ {\Delta \mathbf{p}_ {i j}}+\left[\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)\right]^{\wedge} \cdot \delta \vec{\phi}_ {i}\end{aligned}
$$

上述推导用到的规则有：$(\operatorname{Exp}(\vec{\phi}))^{T}=\operatorname{Exp}(-\vec{\phi})$，$\operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right) \approx \mathbf{I}+(\delta\vec\phi_i)^{\wedge}$，$\mathbf{a}^{\wedge} \cdot \mathbf{b}=-\mathbf{b}^{\wedge} \cdot \mathbf{a}$。因此有：

$$
\frac{\partial \mathbf{r}_ {\Delta \mathbf{p}_ {i j}}}{\partial \ \vec{\phi}_ {i}}=\left[\mathbf{R}_ {i}^{T} \cdot\left(\mathbf{p}_ {j}-\mathbf{p}_ {i}-\mathbf{v}_ {i} \cdot \Delta t_ {i j}-\frac{1}{2} \mathbf{g} \cdot \Delta t_ {i j}^{2}\right)\right]^{\wedge}
$$

注意，由于位置的更新方式是$\mathbf{p}_ {i} \leftarrow \mathbf{p}_ {i}+\mathbf{R}_ {i} \cdot \delta \mathbf{p}_ {i}$，因此我们在推导的时候也是加上了这个来求Jacobian。如果换了$\mathbf{p}_ {i} \leftarrow \mathbf{p}_ {i}+ \delta \mathbf{p}_ {i}$的更新方式，实际上结果也一样根据上面的方法很容易求出来。

至此，全文将 Foster 的 IMU 预积分理论中的公式推导结束，感谢邱笑晨提供的PDF。

Note: 在Vins mono中，IMU的重力也会被优化。