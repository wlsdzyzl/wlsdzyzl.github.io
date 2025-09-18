---
title: 图神经网络（Graph Neural Network）
mathjax: true
date: 2022-12-17 06:07:36
tags: [neural network, graph, deep learning]
categories: 深度学习
---

本篇文章记录一下图神经网络的基本内容，是看了李沐老师讲的一篇博客。博客连接如下：[https://distill.pub/2021/gnn-intro/](https://distill.pub/2021/gnn-intro/)。
<!--more-->

大家都知道图是一种比较复杂的数据结构，用神经网络来处理图数据也是最近比较火热的研究方向。在本文中，不会对图神经网络的应用等等做太多的介绍，详细可以看原博客，有很多可交互的图片。本文主要介绍什么是图神经网络，如何将神经网络应用到图这种特殊的数据结构上，以及一些比较常用的调节的参数。

### 什么是图？

图一般用来描绘不同实体之间的关系，它的数据结构包含顶点和边，有时候也会有一个全局的信息，如下图：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled.png)

一般基于图的任务可能有三种：

- 对于整张图来做预测，例如对于一个分子结构对他的属性进行预测；
    
    ![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%201.png)
    
- 对顶点做预测，例如我们有社交网络图，想要对里面成员进行分类；
    
    ![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%202.png)
    
- 对边进行预测，这样的任务不算常见，但是也有，例如文章中给的例子，对各个人之间的行为进行预测；
    
    ![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%203.png)
    
    ![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%204.png)
    

但是很明显，一般这样的数据并不适合放到神经网络中去处理，神经网络最适合处理的是矩阵和向量，这个就是用神经网络来处理图数据的挑战。

### 图的表示方式

**邻接矩阵**是最直观的表示方法，它的问题就是当图比较大的时候，邻接矩阵会非常大。如果一个图有很多顶点，但是边比较少，那么该矩阵会非常稀疏，大部分的空间被浪费掉了。第二个问题就是，多个邻接矩阵可能表示的是同一张图，但是如果将不同的矩阵放入神经网络，我们不能期望他们会得到一样的结果，虽然这些矩阵表示的可能是同一张图。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%205.png)

**邻接表**是更好的表示方式，首先在空间上会更高效，其次我们会固定一下顺序，用一个列表来表示边以及顶点的label或者属性（*如果将顺序固定了，其实邻接矩阵也是唯一的*）。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%206.png)

但是邻接表的表示方式也是无法直接放入神经网络的。一般来说，我们需要对图的顶点，边等用embedding来表示（如何生成顶点，边，以及全局信息的embedding?）：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%207.png)

### 图神经网络

图神经网络可以对图的顶点，边或者整个图进行预测，但是它不会改变图的连接性。一个最简单的图神经网络如下，实际上它没有做任何有意义的事情，但是它是一个图神经网络：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%208.png)

上图显示的就是图神经网络的第n层，每个f就是一个MLP，可以看到每层输入是一个图，输出后也是一张图，图的连接性不会改变，但是输出图有新的embedding。这里我们会有一个问题，那就是$f_ {U_n}, f_ {V_n}, f_ {E_n}$之间毫无联系，并没有用到图的连接性。例如，有时候我们可能没有什么顶点的属性，而只有边的信息，但是我们依然想对顶点做预测，那么如何用到连接的信息呢？

**Pooling （graph中的message passing）**

这里就要介绍pooling。Pooling操作也就是把一个顶点的临边信息聚合起来再利用。下图展示的是最简单的pooling操作，也就是聚合起来后相加。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%209.png)

下图就是将边的信息聚合后，对顶点预测：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2010.png)

同样的，如果我们有顶点信息相对边预测，也可以将顶点信息聚合：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2011.png)

实际上，顶点也有邻接的顶点，一层一层地用到邻接顶点的信息，有点类似于卷积的操作，最后每一个pixel都能感知到周围的信息，也是一种特殊的graph pooling操作，而它和标准的卷积是非常类似的，都是为了聚合neighbor的信息。但是标准卷积，卷积核的大小是一定的。而在图中，是由邻接点的个数决定的。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2012.png)

下面是一个用到上述操作的层：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2013.png)

实际上，message passing的方式是非常灵活的。我们也可以将顶点与边的信息，甚至是global embedding的信息聚合。下面给出几种不同的message passing的方式：

![Some of the different ways we might combine edge and node representation in a GNN layer.](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2014.png)

Some of the different ways we might combine edge and node representation in a GNN layer.

也可以利用global information，他和每个顶点每条边相连。这也就意味着，通过几层message passing，每个顶点实际上就能感知到其他的所有顶点。否则的话，在一些很大的图上，一些顶点可能很难感知到据它较远的顶点。

![Schematic of a Graph Nets architecture leveraging global representations.](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2015.png)

Schematic of a Graph Nets architecture leveraging global representations.

上述方法的一个问题是，不同属性之间的feature vector长度可能不同，但是这个困难可以轻松通过一个线性的transformation解决，或者对他们concatenate。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2016.png)

上述就是一些对于GNN的基本介绍。原博客中还给出了一个实例，并且对各个参数的影响进行了分析。可以看到message passing实际上有着非常重要的影响，可以大大提升模型的准确率，该模型具体如何pass message，我们并不知道，但是可以看到所有的message passing打开似乎有最好的效果。

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/%E5%9B%BE%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%EF%BC%88Graph%20Neural%20Network%EF%BC%89%20c3afe36d752b4d0f957c59f23c82a974/Untitled%2017.png)

目前，图神经网络就已经介绍差不多了，更多信息请阅读原博客。