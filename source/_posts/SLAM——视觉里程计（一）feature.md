---
title: SLAM——视觉里程计（一）feature
date: 2018-12-16 23:56:36
tags: [SLAM,feature,computer vision]
categories: SLAM
mathjax: true
---
从现在开始下面两篇文章来介绍SLAM中的视觉里程计（Visual Odometry）。这个是我们正式进入SLAM工程的第一步，而之前介绍的更多的是一些基础理论。视觉里程计完成的事情是视觉里程计VO的目标是根据拍摄的图像估计相机的位姿。目前主要有两个方法，我们这一篇介绍的是特征点法。
<!--more-->
首先，我们之前提到了路标。SLAM中是根据路标的位置变化来估计自身的运动的。路标是三维空间中固定不变的点，应该有这么几个特征：
* 数量充足，以实现良好的定位
* 具有较好的区分性，以实现数据关联
而图像的特征点可以比较好的满足上面的特点，可以通过特征点来作为SLAM中的路标。

## 特征点 ##
**特征点**是图像当中比较具有代表性的部分。
我们想象一下，我们识别一个物体的时候，即使旋转了，或者光照不同，尺度变化，我们还是能认出。这一点上，人眼真的是太强了。如图：

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/%E7%9C%9F%E9%A6%99.gif)

即使糊成这样，我们依然能喊出来，诶呀真香。

而一种好的特征点，希望能做到上面几点，当然那是非常困难的。它应该有下面几个特征：
* 可重复性，也就是，换个视角来看它应该还是原来的样子。
* 可区分性，可区分意味着不同的特征点看起来不一样，这样我们才能辨别不同场景。
* 高效，这个作为特征点并不是必要的，但是为了实时SLAM的运行，我们必须把它纳入，而且它是非常重要的。
特征点一般由两部分组成：**关键点**和**描述子**（descriptor）。其中关键点包含了这个点的位置，大小，方向评分等信息，但是只靠关键点不足以区分各个特征点，而描述子描述了特征点周围的像素的一些信息。

一般来说特征点的选的部分都是角点或者边缘部分，因为它们有比较大的区分性，而区块点的区分性就比较差了，这个是符合我们的直觉的。
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/orb5.png)

有一些比较有名的特征点，FAST，ORB，SIFT，SURF等等。一般来说，我们在SLAM中要兼顾特征点在各个条件下的性能（比如光照不同，旋转等情况下依然能得到基本一样的特征点，主要是靠描述子来实现），以及提取速度，这使得在SLAM中我们用的最多的是ORB特征点，我们可以在OpenCV feature2d模块中找到。下面对各个特征点做一个简单的介绍，同时会相对详细地介绍一下ORB特征点。
### Fast特征点 ###
首先介绍一下Fast特征点。Fast特征点是非常简单的一种特征点，它的提取速度也非常快。它的思路非常简单：若某像素与其周围邻域内足够多的像素点相差较大，则该像素可能是角点。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/orb4.png)

如上图，以一个像素p为中心，fast检测周围半径为3的圆上的16个像素点，在它的周围，如果有连续12个像素点与中心像素点的差都超过阈值，则它判断它是一个角点，这个方法是Fast12，其他的还有fast9等等，都只是个数不同而已。

为了提高效率，还有一个步骤，比如要超过12个像素点，那么首先检测p1,p5,p9,p13这几个像素点，如果有3个超过阈值，它才有可能是一个角点，当作候选点。相当于是一个预处理，这样可以大大提高提取的速度。

当然，通过这样的方法得到的特征点可能会在某个局部区域非常密集，因此我们需要进行极大值抑制。具体做法为：计算特征点出的FAST得分值（即score值，也即s值，定义为（16个点与中心差值的绝对值总和），判断以特征点p为中心的一个邻域（如3x3或5x5）内，若有多个特征点，则判断每个特征点的s值，若p是邻域所有特征点中响应值最大的，则保留；否则，抑制。若邻域内只有一个特征点（角点），则保留。

Fast特征点是非常直白的，它甚至没有描述子。而有意思的是它的提出（2006年）却没有SIFT等比较复杂的特征点那么早。
### ORB特征点 ###
Fast特征点虽然快，但是它并没有描述子，这样距离我们的应用还是有差距，因为它是没有办法匹配(match)的，仅仅靠关键点我们无法互相区分各个特征点。

ORB特征点是Fast特征点和BREIF特征描述子的改进，是Oriented Fast，它增加了描述子，具有局部旋转不变性。因为BREIF是二进制描述子，它的提取速度依然是非常迅速的。

除此之外，Fast特征点的数量往往很大而且不确定，我们一般希望对图像提取固定数量的特征点。假如我们需要提取N个角点，则ORB中可以对各个角点进行Harris响应值，然后选前N个具有最大响应值的角点。

下面稍微介绍一下ORB中对于Fast方向性和尺度方面的弱点的改进。

对于尺度方面，Fast由于计算的只是像素亮度的差异，有时候远处像角点的地方，离近了就不是角点了。尺度不变性由构建图像金字塔，并在金字塔的每一层上检测角点来实现。金字塔是对图像进行不同层次的降采样，以获得不同的分辨率。

对于方向性，是由灰度质心法实现的。我们知道一般来说，一个有质量的物体有个质心，那么图片呢？在图片中，我们把每个像素的灰度值当作“质量”来确定质心。

灰度质心法操作如下：
1. 在小的图像块B中，图像块的矩为：
$$
m_ {pq} = \sum_ {x,y \in B} x^py^qI(x,y)
$$
上式中，$x,y$分别为坐标值，而$I(x,y)$为$(x,y)$的灰度值。
2. 通过矩可以找到图像的质心：
$$
C = (\frac{m_ {10} }{m_ {00} },\frac{m_ {01} }{m_ {00} })
$$
3. 连接图像0点$O$和质心$C$，得到一个方向向量$OC$，则特征点的方向可以定义为：
$$
\theta = \arctan (\frac{m_ {01} }{m_ {10} })
$$

通过这个方法，Fast角点就有了尺度和旋转的描述，从而提升了它描述不同图像时候的鲁棒性。这种改进成为Oriented FAST。

此外,ORB特征点的另一个改进是对BREIF描述子的改进。

BREIF描述子是一种二进制描述子，其描述向量由许多个0和1组成，这里0和1编码了关键点附近两个像素（$p,q$）的大小关系：如果$p>q$则为1，否则为0。如果我们取了127对这样的点，就得到了128维的二进制向量。p,q的选取一般会按照某个概率分布随机选取，速度很快。

原始的BREIF不具有旋转不变性。但是由于Oriented Fast有了方向，可以利用方向信息，计算旋转之后的“steer BRIEF”特征，使得ORB的描述子具有比较好的旋转不变性。

### 特征匹配 ###

特征匹配可以说是SLAM中至关重要的一步，因为SLAM中的路标，在不同帧之间的位置，就是通过特征匹配完成的。如果特征匹配的好，可以大大减少后续姿态估计，优化等操作的负担。然而，由于图像中重复纹理等等原因，误匹配的情况一直得不到非常好的解决，仅仅利用局部特征解决误匹配是非常困难的。

不过对于一般的图像，我们还是可以通过一些办法消除一些错误的匹配。到后面我们可以知道，其实我们只需要较少的几个特征点就能得到比较好的效果，因此尽管很多消除误匹配的算法会使得很多正确的匹配也被剔除了，但是依然是够用的。

匹配的办法有多种，最简单的是暴力匹配，就是与另一幅图的特征点一个个对比，来得到相似度最高的那个特征点。一般这个相似度差了多少，我们用距离来衡量，距离越远相似度越低。距离的定义可以有多种，如果是浮点数，我们可以求欧式距离，对于ORB的二进制描述子，我们用Hamming距离来衡量，而汉明距离实际上就是二进制码中不同位数的个数。

当特征点数量很大的时候，暴力匹配的速度变得很慢。这时候，可以使用FLANN（快速近似最近邻算法库）来实现匹配。这些算法已经非常成熟，可以去翻看相关论文来了解它具体的内容。

### 实践：特征提取和特征匹配 ###
下面有一个利用OpenCV提取ORB特征值并且进行匹配的程序，来总结这么一段关于ORB的内容。
```cpp
#include<iostream>
#include<opencv2/core/core.hpp>
#include<opencv2/features2d/features2d.hpp>
#include<opencv2/highgui/highgui.hpp>

using namespace std;
using namespace cv;

int main(int argc, char ** argv)
{
    if(argc!=3)
    {
        cout<<"Usage:feature_extraction img1 img2"<<endl;
        return 1;
    }
    //Load Image
    Mat img1 = imread(argv[1]);
    Mat img2 = imread(argv[2]);
    //store keypoint
    vector<KeyPoint> kp1,kp2;
    //store descriptors
    Mat descriptors1, descriptors2;
    Ptr<ORB> orb = ORB::create(500,1.2f,8,31,0,2,ORB::HARRIS_SCORE,31,20);
    //get keypoints
    orb->detect(img1,kp1);
    orb->detect(img2,kp2);
    //compute the descriptors
    orb->compute(img1,kp1,descriptors1);
    orb->compute(img2,kp2,descriptors2);
    Mat outimg1,outimg2;
    //highlight keypoint on the image 
    drawKeypoints(img1,kp1,outimg1,Scalar::all(-1),DrawMatchesFlags::DEFAULT);
    drawKeypoints(img2,kp2,outimg2,Scalar::all(-1),DrawMatchesFlags::DEFAULT);
    imshow("img1",outimg1);
    imshow("img2",outimg2);


    //use Hamming distance to match 
    vector<DMatch> matches;
    BFMatcher matcher(NORM_HAMMING);//maybe the dist have been normalized
    matcher.match(descriptors1,descriptors2,matches);

    //filter the wrong match(the distance is larger than double min distance)
    //An empirical handling
    double mindist = 1000000;
    for(int i = 0;i!=matches.size();i++)
    {
        double dist = matches[i].distance;
        if(dist < mindist) mindist = dist;
    }

    cout<<"min dist: "<<mindist<<endl;
    if(mindist < 20) mindist = 20;
    vector<DMatch> good_matches;
    for( int i = 0;i!=matches.size();++i)
    {
        if(matches[i].distance <= 2*mindist)
            good_matches.push_back(matches[i]);
    }
    //show the match
    Mat img_match,img_good_match;
    drawMatches(img1,kp1,img2,kp2,matches,img_match);
    drawMatches(img1,kp1,img2,kp2,good_matches,img_good_match);
    imshow("All the matches",img_match);
    imshow("Good matches",img_good_match);
    waitKey(0);
    return 0;
}
```
对应的CMakeLists.txt:
```CMake
cmake_minimum_required(VERSION 3.2)
project(feature_extraction)
find_package(OpenCV REQUIRED)
include_directories(${OpenCV_INCLUDE_DIRS} )
ADD_EXECUTABLE(${PROJECT_NAME} feature_extraction.cpp)
target_link_libraries(${PROJECT_NAME} ${OpenCV_LIBS})
```
这个代码中剔除错误匹配的用的剔除掉大于2倍最小距离的特征点，这更多是一个经验上的做法。此外还有RANSAC（随机采样一致）等算法，以及二者结合等等，可能得到更好的剔除效果。我曾经写过一个SIFT提取和匹配的算法，在剔除中用到了ransac算法，是一个VS工程：[feature_match_sift](https://github.com/wlsdzyzl/feature_match_sift)。有兴趣的可以看一下，其实我也忘得差不多了。

最后的结果：
* 特征提取
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/orb1.png)
* 特征匹配
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/orb2.png)
* 过滤后的特征匹配
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/orb3.png)