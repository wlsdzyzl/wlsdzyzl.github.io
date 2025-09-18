---
title: Paper——Generative Adversarial Nets（GAN）
mathjax: true
date: 2021-12-17 06:13:22
tags: [neural networks, deep learning, generative model]
categories: 论文
---
GAN现在已经开创了一个新的领域了，但是惭愧的是我一直没有去读它。今天看了一下李沐老师的解读，简单介绍一下它的思想。Paper链接：[https://arxiv.org/pdf/1406.2661.pdf](https://arxiv.org/pdf/1406.2661.pdf)。

<!--more-->

首先看一下名字，第一个是Generative。一般Generative model，也就是生成模型，就是要学习到一个分布$P(x|y)$， 也许没有$y$，但是重点是我们需要学习到$x$的分布。根据这个分布，就可以生成得到新的samples（对应的，discriminative model，判别模型，就是希望得到$P(y|x)$）。第二个是Adversarial，也就是对抗的意思。既然有对抗，那就说明有两个模型在博弈了。

一般看到GAN最多的地方，也就是生成虚拟的图片。生成部分就是用generative model来实现。假如我们想要生成虚拟的人物照片，这个照片的大小可以是1920*1080，有大约200w个pixel，可以拉成一维的200w维的向量。在统计学的视角来说，任何样本都是基于分布生成的。所以也有那么一个分布，而这些人物的照片，都是来自这个分布的样本。

一个直接的想法，就是使用普通的generative model，也就是学习到$P(x)$，但是这个计算量巨大（200万的维度）。而且比较naive的那种做法，将每个维度分开学习，不合理，考虑到pixel之间的关系，又会变得很复杂。总之是非常难以实现的。而在GAN中，他的想法很简单。我不需要知道$P(x)$，而是学习一个映射。虽然人物照片的维度是200w维，但是因为它们有共性，基于一个分布出来的，自由度是远远小于200w的。在这里，我们假设我们只需要100个维度（假设为$x'$）就能建立起来映射。所以，这里就会学习一个$x'\rightarrow x$的映射。对于$x'$，可以是用任意的噪声得到，但是它就会对应到人物照片空间的一个样本。这个就是GAN中Generative部分的思路。这些映射通过一个MLP来学习。

直接这样得到的结果当然也不会太好。也许是因为，我们的样本个数相对于维度比起来太渺小了（欠拟合）。在GAN中，同时训练了一个Discriminative model，相当于警察。给定一个样本，我们使用Discriminative model来判断这个模型是虚拟生成的，还是真实的人物图片。神经网络来做这个事情那是相当擅长的，就是一个简单的二分类问题，也可以用一个MLP来做。所以，原始的GAN中的两个模型，就是简单的两个MLP模型。想法必然是，让警察的能力越来越强，造假的没办法，只能提升自己的造假能力，不断不断的互相迭代，最后造假的工艺已经可以和真的媲美了，也就是得到了最终的Generative model。

那这里的loss如何设计呢？我们使用$G, D$来分别表示Generative model以及Discriminative model，

这两个模型，实际上就对应了博弈论中两个玩家在进行minimax game（game theory），对应的会有一个Value function，而game theory是想寻找到一个鞍点，也就是纳什均衡（是不是鞍点还需要看max min与min max是不是一致）：

$$
\min _ {G} \max _ {D} V(D, G)=\mathbb{E}_ {\boldsymbol{x} \sim p_ {\text {data }}(\boldsymbol{x})}[\log D(\boldsymbol{x})]+\mathbb{E}_ {\boldsymbol{z} \sim p_ {\boldsymbol{z}}(\boldsymbol{z})}[\log (1-D(G(\boldsymbol{z})))]
$$

这个函数的主题，是很像Logistic loss的，只不过在logistic正负样本都在$X$中，而这里我们实际上是将他们区分开了。第一步，先让警察变得更强，那就是让来自真实的尽量大，而来自虚拟的尽量小，分别对应了第一项和第二项，总之这一步是一个maximization的问题，区分得越好，value越大。

接着就是让造假能力更强，也就是让警察越来越无法区分，所以又变成了一个最小化问题。下面的这张图，就给出了训练的过程，可以看到，黑色的点是映射后的结果，它最终会越来越趋向于真实的分布。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/GAN%20(Generative%20Adversarial%20Nets)%2069c0a25f9fce4110b22495c57c386172/Untitled.png)

算法的步骤如下：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/GAN%20(Generative%20Adversarial%20Nets)%2069c0a25f9fce4110b22495c57c386172/Untitled%201.png)

第一步是Gradient ascent，到了第二步变成了gradient decent，也就对应了最大化以及最小化。由于第一项不会变，在训练generative model的时候就将它忽略了。

论文中还有一些理论的证明，这里也简单看一下。第一个，证明了最优的Discriminator：

$$
D_ {G}^{*}(\boldsymbol{x})=\frac{p_ {\text {data }}(\boldsymbol{x})}{p_ {\text {data }}(\boldsymbol{x})+p_ {g}(\boldsymbol{x})}
$$

这个也是很符合只觉得，如果给一个样本，它可能来自于两个分布，discriminator就是判断它到底来自于第一个分布的概率，显然，如果两个分布产生这个样本的概率是一样的，那么它来自于两个分布的概率就是等可能的，其他情况下，如果第一个分布产生这个样本的概率更大，那么Discriminator输出的概率也应该更大。具体的证明如下：

我们有

$$
\begin{aligned}V(G, D) &=\int_ {\boldsymbol{x}} p_ {\text {data }}(\boldsymbol{x}) \log (D(\boldsymbol{x})) d x+\int_ {\boldsymbol{z}} p_ {\boldsymbol{z}}(\boldsymbol{z}) \log (1-D(g(\boldsymbol{z}))) d z \\&=\int_ {\boldsymbol{x}} p_ {\text {data }}(\boldsymbol{x}) \log (D(\boldsymbol{x}))+p_ {g}(\boldsymbol{x}) \log (1-D(\boldsymbol{x})) d x\end{aligned}
$$

上式中，进行了简单替换：令$\boldsymbol x = g(\boldsymbol z)$。在对两个积分相加时候，如果他们的积分域一样，我们可以不用在乎具体的符号。例如这里替换之后，本来是100维度，映射之后变成200w维度，它们积分域就可以看作是一样的了。因为$z$和$g(z)$是有映射关系的，所以这两个是等价的。而对于这里的$V(G,D)$求最大化，在我们这种情况下，等价于对每一个$\boldsymbol x$，最大化：

$$
p_ {\text {data }}(\boldsymbol{x}) \log (D(\boldsymbol{x}))+p_ {g}(\boldsymbol{x}) \log (1-D(\boldsymbol{x}))
$$

求导后，就可以得到：

$$
\frac{\partial L}{\partial D(\boldsymbol x)} = \frac{p_ {\text{data}}(\boldsymbol x)}{D(\boldsymbol x)} - \frac{p_g(\boldsymbol x)}{1 - D(\boldsymbol x)} 
$$

从而得到最佳的$D(\boldsymbol x)$.

同时文章利用KL散度证明了，最优解是在$p_\text{data}(\boldsymbol x) = p_g(\boldsymbol x)$时候取得，也就是算法收敛的理论保证（现实却不见得会那么好，由于GAN中的Value function有最大最小，这使得它如何判断收敛很难。这是原始GAN中的一个问题），具体就不多说了。