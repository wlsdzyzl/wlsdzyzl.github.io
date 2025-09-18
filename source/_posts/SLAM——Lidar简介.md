---
title: SLAM——Lidar简介
mathjax: true
date: 2021-03-30 06:16:21
tags: [SLAM]
categories: [SLAM]
---

理解传感器的原理对于更好地理解激光SLAM在做什么有很大的帮助。例如在LOAM中，会提到直接得到的点云是distorted，这就和雷达的原理有关系，雷达扫描一圈是需要时间的，而我们会把扫描一圈的结果当作一个Frame，很明显如果雷达是运动状态，那么这个点云是有扰动的。
<!--more-->
### Lidar测距原理

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/Sensor%20ee0f8b837a684ef58574f6ffe5894322/Untitled.png)

Laser是发射器，而Imager是接收器，通过几何关系可以得到：$d=\frac{s f}{x \sin \beta}$. 通过旋转360度，就可以得到一周的障碍物的距离了（使用这样的方法测量距离有范围，如果Imager收不到返回的信号就无法得到距离信息）。

### 多线雷达数据的采集

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/Sensor%20ee0f8b837a684ef58574f6ffe5894322/Untitled%201.png)

由于需要旋转一周来采集，因此采集的点之间需要进行去扰动，如何去扰动？将一圈的扫描投影到同一个时间戳上来得到点云。