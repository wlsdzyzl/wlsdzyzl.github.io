---
title: Learning From Data——Introduction of Deep Learning
date: 2019-01-01 17:41:32
tags: [LFD class, deep learning,machine learning]
mathjax: true
categories: 数据学习课程
---
上节课是数据学习的最后一个课程，做了一个简单的深度学习的介绍。
<!--more-->

不用我说大家也都知道，深度学习是当今最流行的机器学习算法了，甚至它成为了一门独立的学科，因为它真的非常强大。深度学习是从神经网络开始的。

神经网络：可微模型+可微损失

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl1.png)

简单的来说，在神经网络基础上go deep，就是深度学习了。

## Challenges ##
### overfitting ###
神经网络虽然能很好的拟合各个函数，但是它同样面临着挑战.那就是过拟合的问题。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl2.png)

之前的机器学习系列的博客也多次提到过拟合的问题。一个模型不是越强大就越好的，因为我们无法避免噪声的存在。如果为了迎合样本，最后产生了很奇怪的东西，那可能并不是我们想要的结果。如下图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl3.png)


![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl4.png)

### Vanishing gradient problem ###

我们知道，神经网络需要激活函数。最容易想到的是sigmod函数，但是当x很大时候，它面临着很严重的梯度消失问题，使得结果可能无法收敛。使用什么样的激活函数也是深度学习需要面临的挑战。

Activation functions：
- Sigmoid
- tanh
- Relu
- ...

### Optimization ###

另外的问题，就是选取什么样的优化。梯度下降是不显示的，因为神经网络往往有非常大的计算量。

Optimizers:
- SGD (Stochastic gradient descent)
- Adam
- Adamax
- RMSprop
- Adadelta
- Nadam
- ...

### Computation ###

计算量过大也是深度学习面临的问题。一般来说要跑神经网络，往往需要GPU，TPU等等。
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl5.png)
### Data ###

还有就是获取数据的问题。深度学习的训练往往需要大量的数据。数据获取，数据标注也是很大的问题。

## Representation ##

尽管神经网络有很大的挑战，但是它依然是一个非常强大的工具。以神经网络为基础，诞生了很多非常有名的网络模型，它们共同组成了深度学习。下面是深度学习的几个有名的代表：
### 卷积神经网络（Convolutional Neural Network） ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl6.png)
### RNN(Recurrent Neural Network) ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl7.png)
### LSTM(Long-Short Term Memory Module) ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl8.png)
### ResNet ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl9.png)
### DenseNet ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl10.png)

## Application ##
也许我们还没有注意到，但是深度学习现在已经应用到生活的各个地方了。
### NPL:word2vec ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl11.png)
### Image Caption Generator ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl12.png)
### Autoencoder ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl13.png)
### GANs (Generative Adversarial Networks) ###
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl14.png)

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl15.png)


## Opening the blackbox ##

虽然神经网络功能非常强大，但是一直到现在，我们依然无法在数学上解释它为何这么强大。因此，神经网络对于我们来说一直像是一个黑盒子。我们希望可以打开一点这个黑盒子，窥视一下它背后的机理。之前有篇博客曾经提到这方面过，也就是[derive something from Softmax](https://wlsdzyzl.top/2018/12/05/Learning-From-Data%E2%80%94%E2%80%94derive-something-from-Softmax/)。这是黄绍伦老师的相关研究成果。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl16.png)


![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/dl17.png)


从那篇文章以及这些图片，我们可以对神经网络为何这么强大有一些直观的了解，并且部分明白了其背后的道理。