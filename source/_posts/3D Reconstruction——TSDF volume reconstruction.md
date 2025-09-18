---
title: 3D Reconstruction——TSDF volume reconstruction
date: 2019-01-25 00:00:00
tags: [3D reconstruction,sdf]
categories: 三维重建
mathjax: true
---        



最近做的工作是三维重建的，需要解决的问题是submap中tsdf的re-integrate与de-ingegrate。现在先搞明白整个TSDF fusion是怎么回事。我们从一个简单的例子：从多张输入帧中重建出三维模型。  

<!--more-->

输入帧每一对由一张颜色图（RGB）与对应的深度图（depth）结合而成的。对于这个重建的过程必须要足够快，才能满足实时的要求。如下图，分别为输入的RGB与depth。  
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf1.png)  
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf2.png)

整个系统的pipeline如下：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf7.png)

首先，输入一对frame，对于深度图，我们需要经过双边滤波来降噪，并且计算法向量，以进行ICP点云配准，最后结合color进行TSDF的integration，得到TSDF field，根据TSDF进行raycasting，从而获得重建表面。

这其中必须提到的是坐标系的转换。因为多个帧的相机坐标系是不一样的，但是我们要将他们重建在一起，需要转换到全局坐标系下，或者得到各个相机坐标系之间的相互转换，也就是要求得相机的位姿。对于相机坐标（针孔相机，pinhole camera）与世界坐标的模型，我们现在应该已经很熟悉了。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf3.png)

上述的图片展示了从世界坐标转换到相机坐标最后到像素投影坐标的过程。期间有一个gridPos的转换，这个是将空间分割成了大小相等的体素，这个步骤很简单一般只是对空间坐标的缩放保留精度问题。

### [](about:blank#TSDF "TSDF")TSDF

接下来就到了TSDF的介绍了。TSDF（Truncated Signed Distance Function）是截断符号距离函数的缩写，各个体素的截断符号距离组成了TSDF field。这个TSDF是如何计算的？

首先我们需要介绍什么是SDF值。一个体素的SDF值，是它到最近的表面的距离，如果它在表面前（也就是距离相机更近），它是正值，如果在表面后，则为负值。对于这个值的计算，我们首先将在视锥内的体素投影到像素坐标，然后用该像素坐标的深度值减去这个体素的实际z值。在相机运动的过程中，空间voxel的sdf值可能会更新的。

而TSDF就是规定了一个最远距离。因为我们知道，三维重建我们关注的是重建的表面，如果一个体素距离表面太远，它对表面重建不会有什么实际贡献。因此TSDF规定一个最远距离，如果距离比这个更大，它的TSDF值就是无效的，也就是用SDF值除以$d_ {\max}$，只保留区间$[-1,1]$的值。下面这幅图形象地解释了什么是TSDF。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf5.png)

在相机运动的过程中，同一个voxel对应的color与depth值是不一样的，因此在integrate的时候对于不同的值我们需要加上权重，来表示它的可信赖程度。如下图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf4.png)

可以看到，入射角更小，则是比较好的情况，入射角越大，带来的结果也相对更不可靠，因为很明显它不应该是距离表面最近的距离。因此实际中的权重，应该给入射角小的相机位置采集到的帧率更大的权重。具体的实现，可以将voxel位置向量（相机坐标系下）与它的法向量相称，入射角小的时候，根据向量乘，我们知道它能得到更大的乘积结果。

### [](about:blank#Adaptive-Raycasting "Adaptive Raycasting")Adaptive Raycasting

Raycasting是从TSDF场中恢复出表面的过程。我们可以这样想象，从一个地方射出一条线过去，如果它经过了表面，那么这个光线经过的体素的TSDF值一定有一个从正变负，或者从负变正（如果是实时重建，那么只有从正到负）的过程。这个射出的方向，就是相机坐标系z轴的。而正负交接点0点，我们称为zero-crossing，就是表面所在的voxel。我们要做的就是找到这个地方，当然有时候可能不会有哪个的体素大小直接是0,这时候就需要进行三线性插值（trilineal interpolation），找到逼近0的哪个地方。距离操作中，我们为了加速，可能会开始已一个比较大的步长，找到了zero-crossing，换成更小的步长，直到得到要求的精度，使得选取点的TSDF值尽量接近于0。得到这个点之后，再同样根据线性插值，写入color（实际中color可能是包含在TSDF场中的，以及权重）。

上面的算法没有包含光线和阴影的部分。

接下来的就是mesh生成与法向量的提取。这个就是另外的部分了，现在我们已经简单介绍了一般的实时三维重建的步骤，这里都是非常通俗的语言，没有包含任何公式。实际中的工程遵循上面的思想，还会遇到各种各样的实际问题。总之希望能有所帮助吧。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/tsdf6.png)
