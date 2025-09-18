---
title: SLAM——拆解LOAM
mathjax: true
date: 2021-03-31 06:16:58
tags: [SLAM]
categories: [SLAM]
---

严格来说，这里记录的是A-LOAM：[https://github.com/HKUST-Aerial-Robotics/A-LOAM](https://github.com/HKUST-Aerial-Robotics/A-LOAM)。但是A-LOAM与LOAM（[https://ri.cmu.edu/pub_files/2014/7/Ji_LidarMapping_RSS2014_v8.pdf](https://ri.cmu.edu/pub_files/2014/7/Ji_LidarMapping_RSS2014_v8.pdf)）只有一些微小的不同，是一个很好的入门学习框架（秦通写的）。

**我感觉这篇文章写得一般，但是A-LOAM写得还是很通俗易懂的，所以本篇分析顺着代码来走，用论文作为参考**。具体分析请看下面的三篇文章。
<!--more-->

[LOAM (1)](/2021/03/31/SLAM——拆解LOAM（一）/)

[LOAM (2)](/2021/03/31/SLAM——拆解LOAM（二）/)

[LOAM (3)](/2021/03/31/SLAM——拆解LOAM（三）/)
