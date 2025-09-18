---
title: SLAM——Geometry
mathjax: true
date: 2021-04-21 06:14:55
tags: [SLAM, geometry, mathematics]
categories: SLAM
---
回顾一下SLAM中的几何基础。<!--more-->
## 李群李代数（$\text{SO(3) } \& ~\mathfrak{so}(3)$）：

- 李群李代数对应的都是三维矩阵，在SLAM中，李群$\text{SO(3) }$ 对应旋转矩阵（方向余弦阵,3×3 正交阵），而李代数$\mathfrak{so}(3)$对应的为三维向量的反对称矩阵，只不过任何一个反对称矩阵都和一个三维向量是一一对应的，因此有时候也会直接用三维向量来指代$\mathfrak {so}(3)$的元素。
- 一般来说反对称矩阵与向量之间的转换用$\wedge$与$\vee$运算符表示。有三维向量$\mathbf w$，则它与其对应的反对称矩阵$\mathbf W$转化关系为：

$$
\mathbf w^{\wedge}=\left[\begin{array}{l}w_ {1} \\w_ {2} \\w_ {3}\end{array}\right]^{^{\wedge}}=\left[\begin{array}{ccc}0 & -w_ {3} & w_ {2} \\w_ {3} & 0 & -w_ {1} \\-w_ {2} & w_ {1} & 0\end{array}\right]=\mathbf{W}\\\mathbf{W}^{\vee}=\mathbf w
$$

关于反对称矩阵的一个性质：

$$
\mathbf{a}^{\wedge} \cdot \mathbf{b}=-\mathbf{b}^{\wedge} \cdot \mathbf{a}, \quad \forall \mathbf{a}, \mathbf{b} \in \mathbb R^{3}
$$

- 指数映射$\exp(\cdot)$将$\mathfrak{so}(3)$映射到$\text{SO(3)}$：

$$
\exp \left(\vec{\phi}^{\wedge}\right)=\mathbf{I}+\frac{\sin (\|\vec{\phi}\|)}{\|\vec{\phi}\|} \vec{\phi}^{\wedge}+\frac{1-\cos (\|\vec{\phi}\|)}{\|\vec{\phi}\|^{2}}\left(\vec{\phi}^{\wedge}\right)^{2}
$$

特别，当$\phi$很小的时，有一阶近似：

$$
\exp \left(\vec{\phi}^{\wedge}\right) \approx \mathbf{I}+\vec{\phi}^{\wedge}
$$

- 对数映射$\log(\cdot)$将$\text{SO}(3)$映射到$\mathfrak{so}(3)$：

$$
\log (\mathbf{R})=\frac{\varphi \cdot\left(\mathbf{R}-\mathbf{R}^{T}\right)}{2 \sin (\varphi)}
$$

其中：$\varphi=\cos ^{-1}\left(\frac{\operatorname{tr}(R)-1}{2}\right)$。有$\log (\mathbf{R})^{\vee}=\varphi \cdot \mathbf{a}$，其中$\varphi$是旋转角，而$\mathbf a$为旋转轴的单位向量，且$\mathbf{a}=\left(\frac{\mathbf{R}-\mathbf{R}^{T}}{2 \sin (\varphi)}\right)^{\vee}$。因此，每一个旋转矩阵对应一个旋转向量。很奇妙的事情是一个旋转向量对应的旋转矩阵，也就是罗德里格斯公式求得的旋转矩阵（从几何关系上推导出来并不难），正是该旋转向量的反对称矩阵$\left(\mathfrak{so}(3)\right)$在$\text{SO(3)}$上的映射。

*有意思的事情，任何一个三维向量实际上都可以看作是一个旋转向量（方向为旋转轴，而大小为旋转角度），因此任何一个三维向量都可以对应到一个旋转矩阵。但是不是所有的三维矩阵都是旋转矩阵，因此尽管三维向量与三维矩阵都是无穷多个，但是三维矩阵的个数就是比三维向量“多”，这个也是非常直观的，因为三维矩阵有9个变量，同时，旋转矩阵所在的这个空间实际上就“摊”满了三维向量的空间。*

- 当$\left\Vert \vec{\phi}\right\Vert<\pi$时（或者$\left\Vert\vec{\phi} \right\Vert$被限制在一个连续的$2\pi$范围内），指数映射与对数映射是双射，而$\left\Vert\vec{\phi} \right\Vert$也就是旋转角度$\varphi$。
- 从上面的内容可以得知，实际上任何一个旋转矩阵都和一个三维向量是对应的，因此为了方便，我们规定$\text{Exp}(\cdot)$把$\mathbb R^3$映射到$\text{SO(3)}$，而$\text{Log}(\cdot)$把$\text{SO(3)}$映射到$\mathbb R^3$，也就是：

$$
\text{Exp}(\vec\phi) =  \exp(\vec\phi^{\wedge}) , ~\text{Log}(\mathbf R) = \log^\vee(\mathbf R)
$$

- 对于$\vec\phi$以及一个微小量$\delta\vec\phi$，有：

$$
\begin{array}{l}\operatorname{Exp}(\vec{\phi}+\delta \vec{\phi}) \approx \operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}\left(\mathbf{J}_ {r}(\vec{\phi}) \cdot \delta \vec{\phi}\right) \\\text{Log} (\operatorname{Exp}(\vec{\phi}) \cdot \operatorname{Exp}(\delta \vec{\phi}))=\vec{\phi}+\mathbf{J}_ {r}^{-1}(\vec{\phi}) \cdot \delta \vec{\phi}\end{array}
$$

也就是三维向量上加一个微小量，对应了$\text{SO(3)}$上乘一个$\operatorname{Exp}\left(\mathbf{J}_ {r}(\vec{\phi}) \cdot \delta \vec{\phi}\right)$，而在$\text{SO(3)}$上乘一个$\operatorname{Exp}(\delta \vec{\phi})$也就对应了在$\mathbb R^3$上加一个$\mathbf{J}_ {r}^{-1}(\vec{\phi}) \cdot \delta \vec{\phi}$。其中，$\mathbf{J}_ {r}(\vec{\phi})$ 是属于$\text{SO(3)}$空间的右Jacobian，有：

$$
\begin{array}{l}\mathbf{J}_ {r}(\vec{\phi})=\mathbf{I}-\frac{1-\cos (\|\vec{\phi}\|)}{\|\vec{\phi}\|^{2}} \vec{\phi}^{\wedge}+\frac{\|\vec{\phi}\|-\sin (\|\vec{\phi}\|)}{\|\vec{\phi}\|^{3}}\left(\vec{\phi}^{\wedge}\right)^{2} \\\mathbf{J}_ {r}^{-1}(\vec{\phi})=\mathbf{I}+\frac{1}{2} \vec{\phi}^{\wedge}+\left(\frac{1}{\|\vec{\phi}\|^{2}}-\frac{1+\cos (\|\vec{\phi}\|)}{2 \cdot\|\vec{\phi}\| \cdot \sin (\|\vec{\phi}\|)}\right)\left(\vec{\phi}^{\wedge}\right)^{2}\end{array}
$$

当$\delta\vec\phi$很小时，有

$$
\mathbf{J}_ {r}(\delta\vec{\phi}) \approx\mathbf{J}^{-1}_ {r}(\delta\vec{\phi})\approx \mathbf I\\\operatorname{Exp}\left(\delta \vec{\phi}_ {i}\right) \approx \mathbf{I}+(\delta\vec\phi_i)^{\wedge}
$$

- 指数映射的伴随（Adjoint）性质：

$$
\begin{array}{l}\mathbf{R} \cdot \operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}^{T}=\exp \left(\mathbf{R} \vec{\phi}^{\wedge} \mathbf{R}^{T}\right)=\operatorname{Exp}(\mathbf{R} \vec{\phi}) \\\Leftrightarrow \operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}=\mathbf{R} \cdot \operatorname{Exp}\left(\mathbf{R}^{T} \vec{\phi}\right)\end{array}
$$

为了证明伴随性质，我们首先要知道一个前提：$(\mathbf{R} \vec{\phi})^{\wedge}=\mathbf{R} \vec{\phi}^{\wedge} \mathbf{R}^{T}$。令$\vec \phi = \theta \mathbf a$，根据罗德里格斯公式，可得：

$$
\begin{array}{l}\operatorname{Exp}(\vec{\phi})=\exp \left(\vec{\phi}^{\wedge}\right)=\exp \left(\theta \mathbf{a}^{\wedge}\right) \\=\cos \theta \cdot \mathbf{I}+(1-\cos \theta) \mathbf{a} \mathbf{a}^{T}+\sin \theta \cdot \mathbf{a}^{\wedge}\end{array}
$$

那么有（伴随性质第一行的证明）：

$$
\begin{array}{l}\mathbf{R} \cdot \operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}^{T} \\=\mathbf{R} \cdot\left[\cos \theta \cdot \mathbf{I}+(1-\cos \theta) \mathbf{a} \mathbf{a}^{T}+\sin \theta \cdot \mathbf{a}^{\wedge}\right] \cdot \mathbf{R}^{T} \\=\cos \theta \cdot \mathbf{R} \mathbf{R}^{T}+(1-\cos \theta) \cdot \mathbf{R a a}^{T} \mathbf{R}^{T}+\sin \theta \cdot \mathbf{R} \mathbf{a}^{\wedge} \mathbf{R}^{T} \\=\cos \theta \cdot \mathbf{I}+(1-\cos \theta) \cdot(\mathbf{R a}) \cdot(\mathbf{R} \mathbf{a})^{T}+\sin \theta \cdot(\mathbf{R} \mathbf{a})^{\wedge} \\=\exp \left(\theta(\mathbf{R} \mathbf{a})^{\wedge}\right)=\exp \left((\mathbf{R} \vec{\phi})^{\wedge}\right)\\=\exp \left(\mathbf{R} \vec{\phi}^{\wedge} \mathbf{R}^{T}\right)\\ = \text{Exp}(\mathbf{R\vec\phi})\end{array}
$$

对于第二行：

$$
\begin{aligned}&\mathbf{R} \cdot \operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}^{T}=\operatorname{Exp}(\mathbf{R} \vec{\phi})\\\Leftrightarrow&\mathbf{R}^T \cdot \operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}=\operatorname{Exp}(\mathbf{R}^T \vec{\phi})\\\Leftrightarrow&\operatorname{Exp}(\vec{\phi}) \cdot \mathbf{R}=\mathbf R\operatorname{Exp}(\mathbf{R}^T \vec{\phi})\end{aligned}
$$