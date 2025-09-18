---
title: 压缩感知与稀疏模型——Introduction
date: 2019-7-04 00:00:00
tags: [machine learning,sparse model,convex optimization]
categories: 压缩感知与稀疏模型
mathjax: true
---                

暑期课程开始了，这个暑假选了大名鼎鼎的马毅老师的课：压缩感知与稀疏模型。不过马老师在深圳呆的时间只有一周，因此这个课对于压缩感知理论的介绍不会面面俱到，希望能建立一个框架出来，而对日后工作学习有所启发。

<!--more-->


这篇博客不会介绍什么具体的内容，而是一个简单介绍。什么是压缩感知与稀疏模型？实际上，在之前阅读的那篇[Image Super-Resolution as Sparse Representation of Raw Image Patches](https://wlsdzyzl.top/2019/06/09/Paper%E2%80%94%E2%80%94Image-Super-Resolution-as-Sparse-Representation-of-Raw-Image-Patches/)（这篇文章也是马毅老师的文章）就是一个稀疏模型很好的应用。简单来说，就是用低纬度的数据来分析高纬数据。从高纬到低纬就是压缩，而压缩之后的数据往往是稀疏的，而我们希望能够通过对稀疏模型的分析，来恢复或者分析高纬的数据。

现如今的我们对“大数据”一点也不陌生。因为如今数据充斥着每个世界，如今每一分钟youtube就会增加300小时的视频，每天有3亿张照片被上传到Facebook。当今世界的数据的维度与大小以及增长速度都是前所未有的。对于数据与信息的研究，在早期，由于设备比较昂贵而且分析数据耗时也长，科学家往往只采集足够的信息即可。因此，经典信号处理以及数据分析遵循下面的前提：
$$
\text{Classical Premise: Data } \approx \text{ Information}
$$
而现如今，数据变得越来越庞大并且容易获取，相机分辨率越来越高。不同的数据分析任务也有着不同的新的前提。比如，对于人脸识别，对于人眼来说，一个高分辨率的人脸图像与一个低分辨率的人脸图像，就识别这个任务来说差别不大，如下图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/compression_sjl.png)

尽管左边压缩后的图像看起来不清晰，我们还是很容易认识到这就是女神斯嘉丽。但是从数据的角度来说，一个1200×1800分辨率图片维度是120×180维度的100倍。因此，在这类任务下，前提就变成了：
$$
\text{New Premise1: Data } \gg \text{ Information}
$$
下面是另一个例子，我们想从街道的照片中进行行人检测，而在这张图片中，真正是行人的只占了整张图片的一小部分，而其他的信息都是多余的，如下图：

![Come from Gigacamera](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/pedestrian_detection.jpeg)

在这类任务下，前提就变成了：
$$
\text{New Premise2: Data } = \text{ Information + Irrelevant Data}
$$
而对于其他的任务，比如电影推荐系统，这个系统的作用是希望根据用户看过的电影来向他们推荐未看过的电影。在这个任务中，没有哪个用户会看过所有的电影，也没有哪个电影是所有的用户都看过，因此我们的数据是不完整的。那么我们能根据不完整的数据库来推断完整的信息的重要原因，就是因为这些数据不是随机的，它们往往有很好的结构。有一类人，喜欢类似的电影，而有一类电影有着相似的风格。如下图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/content_based_recommender_systems.png)

因此，在这个任务中，前提则是：
$$
\text{New Premise3: Incomplete Data } \approx \text{ Complete Information}
$$
因此可以看到的是，在大数据时代，我们往往需要从redundant，irrelevant或者incomplete数据中恢复特定的信息。这样的信息往往被编码成为特定的低纬结构或者仅仅依赖于巨大的数据中的一个小的子集，这个和之前的研究是有非常大的不同的。我们希望学习新的理论，能从低维中恢复高纬的信息，同样，从大量的高维信息中高效提取低纬信息也是同样重要的。这也是压缩感知与稀疏模型所希望做到的。

### [](about:blank#Dealing-High-Dimensional-Data "Dealing High-Dimensional Data")Dealing High-Dimensional Data

高纬度数据下的低纬度模型，一般的概念以及数据压缩，采样，稀疏性。

### [](about:blank#A-Brief-History "A Brief History")A Brief History

Error correction： Boscovich and Laplace(1700’s)

Principal component analysis: Hotelings(1900’s)

Signal processing and compression: Benjamin Logan(1960’s)

Statistics: Stepwise regression of Efroymson in 1960 and Lasso of Tibishirani in 1996

Neural science: Field in 1987, Olshausen and Field in 1997

…

### [](about:blank#The-Modern-Era "The Modern Era")The Modern Era

现代稀疏模型的发展起源于2000年。Donoho, Candes, Tao… 在理论以及实际中都有很重大的影响，也涉及到各个方面的内容比如信号处理，统计学，优化，应用以及神经网络。

实际上在学习稀疏模型的时候也可以让我们对机器学习神经网络等等有更深的理解，它们中间有很大的渊源，如之前的主成分分析实际上也是属于稀疏模型算法。希望这门课能够对日后的学习工作有所启发，更重要的是学了这门课后能换一个角度去理解这个世界。