---
title: SLAM——基本介绍
date: 2018-11-06 21:04:23
tags: [SLAM,3D reconstruction,CMake]
categories: SLAM
mathjax: true
---
不出意外的话，以后我的方向应该就是三维重建方向了，而SLAM是一个逃不开的东西。<!--more-->

<!--more-->


SLAM（simultaneous localization and mapping），即时定位与地图构建。它是个什么东西？就是将一个机器人放到一个陌生的环境，它能够自我定位并构建出当前环境的三维地图。我们实验室的有一个项目：[FlashFusion](http://luvision.net/FlashFusion/)，和SLAM也有这千丝万缕的关系。

SLAM已经诞生了30多年了，也取得了很长足的进步吸引了很多学术界的关注，但是一直达不到业界使用的要求。

SLAM学习的门槛比较高，因为对知识储备以及工程能力都有较高的要求。

我的这个SLAM打算利用高翔的《SLAM十四讲》来完成。首先第一章是一些大概的介绍以及一些编程的环境的搭建。实际上我对linux还不够熟悉，对于CMake也使用较少。所以这篇博客也会介绍一些这方面的东西。

## 传感器介绍 ##

首先，SLAM需要的一些传感器，有激光，也有相机。实际上我们的重点在于相机，因为相机便宜，而激光很贵。相机分为单目相机，双目相机（Stereo）以及深度相机（RGBD），事件相机（Event）。一般来说使用较多的Stereo和RGBD，单目没有深度，只能同过移动相机来想办法产生深度，Stereo相机通过两个镜头来获得深度，而RGBD相机通过一定的物理手段来获取深度（如红外线，结构光等）。而到后面我们会知道，深度对于SLAM是非常重要的一个信息。

当我们拍摄一张照片的时候，从3D到2D，会损失了很多信息。所以我们需要深度才能构建三维模型。单目相机，只能通过运动来推算距离（远的运动慢，近的运动快），但是计算比较复杂，也经常出问题，不能避免很多不确定性。

## 视觉SLAM框架 ##

* 前端（Visual Odometry）
* 后端（Optimization）
* 回环检测（Loop Closure Detection）
* 建图（Mapping）

这些模块每个都需要很多的知识和精力来学习，所以这里只列出来框架。以后学习完毕之后，在给它们加上超链接。

## 数学描述 ##

我们假设地图是由路标描述的，路标有N个，则路标分别为：$\mathbf{y}_1,...,\mathbf{y}_N$. 而各个时刻的机器人的位置表示为$\mathbf{x}_1,...,\mathbf{x}_k$.其中k为时刻。

则我们可以用下面两个式子来描述SLAM:
$$
\left \{
\begin{aligned}
\mathbf{x}_k = f(\mathbf{x}_ {k-1},\mu_k,\mathbf{w}_k)\\
z_ {k,j} = h(\mathbf{y}_j,\mathbf{x}_k,\mathbf{v}_ {k,j})
\end{aligned}
\right.
$$

上式中，$\mu_k$为传感器读数,$\mathbf{w}_k$为噪声。第一个式子为运动方程，也就是我们通过之前的位置和运动传感器的输入得到了目前时刻的位置。

第二个式子为观测方程，z为观测数据，$\mathbf{v}_ {k,j}$为观测噪声。观测方程中$z$是我们直接观测到的。

如果我们可以得到$\mathbf{x}_k$与$\mathbf{y}_k$的值，不就实现了定位与建图吗？

## CMake ##

在SLAM中C++语言是占有绝对优势的。任何程序都可以使用g++编译，但是对于过于复杂的工程，g++的命令会太长不好操作，因此我们需要使用CMake工具。

CMake是一种跨平台编译工具，比make更为高级，使用起来要方便得多。CMake主要是编写CMakeLists.txt文件，然后用cmake命令将CMakeLists.txt文件转化为make所需要的makefile文件，最后用make命令编译源码生成可执行程序或静态库(.a)或者共享库（.so(shared object)）。

实际上，CMake的使用主要在于CMakeList.txt的编写。


```Cmake
#1.cmake verson，指定cmake版本 
cmake_minimum_required(VERSION 3.2)

#2.project name，指定项目的名称，一般和项目的文件夹名称对应
PROJECT(test_sqrt)

#3.head file path，头文件目录
INCLUDE_DIRECTORIES(
include
)

#4.source directory，源文件目录
AUX_SOURCE_DIRECTORY(src DIR_SRCS)

#5.set environment variable，设置环境变量，编译用到的源文件全部都要放到这里，否则编译能够通过，但是执行的时候会出现各种问题，比如"symbol lookup error xxxxx , undefined symbol"
SET(TEST_MATH
${DIR_SRCS}
)

#6.add executable file，添加要编译的可执行文件
ADD_EXECUTABLE(${PROJECT_NAME} ${TEST_MATH})

#7.add link library，添加可执行文件所需要的库，比如我们用到了libm.so（命名规则：lib+name+.so），就添加该库的名称
TARGET_LINK_LIBRARIES(${PROJECT_NAME} m)
```
aux_source_directory(< dir > < variable >)

搜集所有在指定路径下的源文件的文件名，将输出结果列表储存在指定的变量中。
如果想要生成库文件：
```CMake
#静态库
add_library( name libname.cpp)
#共享库
add_library(name_shared SHARED libname.cpp)
```

当然，Cmake工具还有更多使用的技巧，需要平时做项目的时候去积累。