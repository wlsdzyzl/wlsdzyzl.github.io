---
title: SLAM——相机与图像
date: 2018-11-12 16:03:20
tags: [SLAM,opencv]
mathjax: true
categories: SLAM
---
SLAM建模的过程中，相机是很重要的一个部分。因此这一讲主要探讨相机的成像模型。
<!--more-->
## 相机模型 ##

相机将三维世界中的坐标映射到二维平面上。这个过程可以用一些几何模型来描述，最简单的称为针孔模型。我们初中物理应该也都学过这个东西。

### 针孔相机模型 ###

假设相机前方为z轴，右侧为x轴，则根据右手坐标定则，y轴朝下。实际上，这个定义使得投影到相机平面后的平面坐标和像素坐标方向一致。这个坐标轴就是相机坐标。而平面坐标，也就是针孔后方的投影平面是一个二元坐标。针孔成像结果是倒立的，假如针孔模型的焦距为f，则：
$$
\frac Z f = - \frac {X}{X'} = -\frac {Y}{Y'}
$$

负号表示前后左右颠倒。

为了简化模型，我们可以将成像平面放到针孔前面，与三维空间点一侧，这时候得到的结果是正常的（实际上一般生活中我们都会将这个颠倒结果转换为正常结果，包括我们的脑子也是这么做的）。这时候：
$$
\frac Z f =  \frac {X}{X'} = \frac {Y}{Y'}
$$

整理可以得到：
$$
X' = f\frac X Z\\
Y' = f\frac Y Z
$$

在相机中，我们最终得到的是一个个像素点。假如成像平面有这么一个像素坐标轴：$o-u-v$.像素坐标轴和平面坐标轴有平移和缩放的关系，假如像素坐标原点平移了$[c_x,c_y ]$,u轴缩放大小为$\alpha$,v轴缩放大小为$\beta$,则（缩放也就是一米有多少像素点，如果一米有10个像素点，则原来的1可能要变为10）：
$$
u = X'\alpha + c_x\\
v = Y'\beta + c_y
$$

将之前的式子带入，并且将$f{\alpha}，f(\beta)$分别记为$f_x,f_y$,因为f的单位为米，而$\alpha,\beta$的单位为像素/米，因此$f_x,f_y$的单位为像素。

因此上面的式子就可以写为：
$$
\left \{
\begin{matrix}
u = f_x\frac X Z+c_x\\
v = f_y\frac Y Z+c_y
\end{matrix}
\right .
$$

如果写成矩阵形式就更明白一点：
$$
\begin{pmatrix}
u\\
v\\
1
\end{pmatrix} = \frac 1 Z \begin{pmatrix}
f_x&0&c_x\\
0&f_y&c_y\\
0&0&1
\end{pmatrix}\begin{pmatrix}
X\\
Y\\
Z 
\end{pmatrix}
\triangleq \frac 1 Z K P
$$

一般来说习惯将Z移到右侧。上式中中间量为相机内参，一般来说在出厂之后就固定了。不知道的话也可以用算法进行标定。

既然有内参，对应的也就有一个外参。我们上面的介绍都是以相机坐标为基础的，而相机坐标实际上是由世界坐标转换的。从世界坐标到相机坐标的转换，之前图形学中介绍，需要旋转R和平移t操作，而R和t就够成来相机的外参，也叫相机的位姿。假如某个点在世界坐标下为$P_w$,则：
$$
ZP_ {uv} = Z\begin{bmatrix}
u\\
v\\
1
\end{bmatrix} = K(RP_w+t) = KTP_w
$$

上式中，T为欧式转换矩阵。所以这其中包含了齐次坐标与非齐次坐标的转换。

从图形学的介绍中我们知道从世界到相机坐标的转换是先旋转后平移的，所以上市中的t是已经转换后的平移矩阵，而非相机的坐标。此外，我们还可以进行归一化处理，使得最后一维值为1，实际上只要将Z轴除进去就好.

### 畸变 ###

畸变分为径向畸变和切向畸变。

实际上，这些畸变我们在生活中都会经常遇到，由于现实中我们相机会有透镜，所以会引入径向畸变。如拍的照片发现一个直的电线杆变成弯的了，这就是径向畸变。径向畸变离光心越远越明显，有时候是桶形畸变，有时候是枕形畸变，原理类似，因为图像放大率随着与光轴之间的距离增加而变小或者增大。

切向畸变是由于成像平面与透镜不严格平行导致的。为了纠正畸变，就要用数学把畸变描述出来。

对于径向畸变，我们可以用一个多项式函数来描述畸变前后的坐标变化：
$$
x_ {distorted} = x(1+k_1r^2 + k_2r^4 +k_3r^6)\\
y_ {distorted} = y(1+k_1r^2 + k_2r^4 +k_3r^6)
$$

上式中，$[x,y ]^T$是归一化平面点的坐标，而$[x_ {distorted},y_ {distorted} ]$是畸变后的坐标。

对于切向畸变：
$$
x_ {distorted} = x+2p_1xy+p_2(r^2+2x^2)\\
y_ {distorted} = y+p_1(r^2+2y^2) + 2p_2xy
$$

结合起来：
$$
\left\{
\begin{matrix}
x_ {distorted} = x(1+k_1r^2 + k_2r^4 +k_3r^6)+2p_1xy+p_2(r^2+2x^2)\\
y_ {distorted} = y(1+k_1r^2 + k_2r^4 +k_3r^6)+p_1(r^2+2y^2) + 2p_2xy
\end{matrix}
\right.
$$
因此，通过畸变系数，和相机坐标系中的一点，我们可以得到正确的坐标点。然后再通过内参矩阵得到正确的图像坐标。

去畸变是一个中间过程，我们假设以后的处理图像已经处理过畸变。

所以单目相机成像过程就是首先通过位姿估计得到相机外参（实际上这个不是成像过程的一部分，但是对于SLAM是非常重要的一步），然后将世界坐标点转换为相机坐标，经过归一化处理，通过内参计算出来像素位置哦。

### 双目相机模型 ###

通过单目相机的成像过程，我们无法知道像素对应的点在空间点的位置。这是因为只要在光心和像素点这条线上，他们都是可以投影到一个点，想要确定它的空间位置，需要知道深度，也就需要通过双目相机或者RGB-D相机。

双目相机类似于我们的眼睛。我们可以通过眼睛来判断物体与我们之间的距离。一般双目相机都是左右分布的，但也有上下的。不过我们在这里介绍的是以左右分布的。这保证了两个相机的成像只在x坐标上有偏移。

为了说明白双目相机的成像模型，我们需要将这个模型画出来，需要注意的是，我们像之前一样将成像平面放到光心前面：
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/IMG_0516.JPG)
双目相机两个光心的距离称为基线b，也就是$O_l,O_r$之间的距离。$u_r,u_l$分别为各自成像平面上的坐标，需要注意的是$u_l$为负数。

考虑一个空间点P，它在左眼和右眼各成一个像，记做$P_l,P_r$.根据相似三角形：
$$
\frac{z-f}{z} = \frac{b-u_l+u_r}{b}
$$
即：
$$
z = \frac{fb}{u_l - u_r}
$$

这样就计算出来了距离z。上式中：$u_l - u_r=d$,我们称为视差。可以看到视差越大，则距离越远。实际中上视差最小为1,所以最远的距离就由fb限定了。所以双目相机可以测量的距离是有限的。

原理简单，但是d不好计算。因为我们需要知道左眼图像的像素出现在右眼图像的哪个位置。因此计算量和精度都会造成问题。

### RGB-D相机模型 ###

RGB-D相机也就是深度相机，它能够主动测量深度。目前深度相机主要有两个原理：
1. 红外结构光，如kinect 1代
2. 飞行时间法，如kinect 2代

它们原理都需要向目标发射光线。结构光根据返回的结构光图案来计算距离，而飞行时间法则根据光束飞行的时间来计算。RGB-D相机可以获得整个图像的像素深度，一般会输出一一对应的彩色图和深度图。

当然，RGB-D相机能够实时测量深度，但是使用条件会受限，容易收到其他光线干扰。对于透射材质的物体，因为接受不到反射光，所以无法测量这些点的位置。此外，它在成本，功耗方面都有劣势。

## OpenCV ##

接下来熟悉一下OpenCV，是一个开源视觉库。

下面这段代码简单介绍了一些OpenCV的操作：
```cpp
#include<iostream>
#include<chrono>

using namespace std;

#include<opencv2/core/core.hpp>
#include<opencv2/highgui/highgui.hpp>

int main(int argc,char **argv)
{
   cv:: Mat image =   cv::imread(argv[1]);
    if(image.data == nullptr)
    {
        cout<<"Error:the image file may not exist"<<endl;
        return 0;
    }
    //output some basic information
    cout<<"Width:"<<image.cols<<" height:"<<image.rows<<" channel number:"<<image.channels()<<endl;
      cv::imshow("image",image);
      cv::waitKey(0);
    // judge the type of the image
    if(image.type()!=CV_8UC1 && image.type()!=CV_8UC3)
    {
        cout<<"the image must be rgb image or grey-scale map"<<endl;
        return 0;
    }
    //iteration
    //use chrono to compute the time.
    chrono::steady_clock::time_point t1 = chrono::steady_clock::now();
    for(size_t y=0;y<image.cols;++y)
    {
        for (size_t x = 0;x<image.rows;++x)
        {
            //left the ptr point at the y row.
            unsigned char* row_ptr = image.ptr<unsigned char>(y);
            //get position (x,y)'s ptr,because there are image.channels()*1 char.
            unsigned char *data_ptr = &row_ptr[x*image.channels()];

            for (int c = 0;c!=image.channels();++c)
            {
                //Do someting ;
            }
        }
    }
    chrono::steady_clock::time_point t2 = chrono::steady_clock::now();
    chrono::duration<double> time_used = chrono::duration_cast<chrono::duration<double>>(t2-t1);
    cout<<"We use "<<time_used.count()<<" seconds to scan the image"<<endl;

    // copy or reference
    //this is a reference,or ptr, so if we change the image_another,the original image will be changed
      cv::Mat image_another = image;
    //let the left top corner(100,100) block to be 0
    image_another(  cv::Rect(0,0,100,100)).setTo(0);
      cv::imshow("image",image);
      cv::waitKey(0);

    //copy ,clone
      cv::Mat image_clone = image.clone();
      image_clone(cv::Rect(0,0,100,100)).setTo(255);
      cv::imshow("image",image);
      cv::imshow("imageclone",image_clone);
      cv::waitKey(0);
      cv::destroyAllWindows();
    return 0;
}
```

CMakeLists.txt:
```cmake
set(CMAKE_CXX_FLAGS "-std=c++11")

find_package(OpenCV REQUIRED)

include_directories(${OpenCV_INCLUDE_DIRS})

add_executable(imageOP imageOP.cpp)

target_link_libraries(imageOP ${OpenCV_LIBS})

```

## 总结：点云拼接 ##

现在使用之前介绍的知识，来完成一个点云拼接的任务。这个需要用到高博提供的一些图片数据。地址：[joinMap](https://github.com/gaoxiang12/SLAMbook/tree/master/ch5/joinMap).

点云的操作需要用到点云库PCL。

首先说明以下，知道像素坐标以及深度信息，如何恢复相机坐标？实际上反推非常容易：

$$
X = \frac{u - c_x}{f_x}Z\\
Y = \frac{v - c_y}{f_y}Z
$$

而我们做的也正是用上面的过程来进行点云恢复。

```cpp
#include<iostream>
#include<fstream>
using namespace std;
#include<opencv2/core/core.hpp>
#include<opencv2/highgui/highgui.hpp>
#include<Eigen/Geometry>
#include<boost/format.hpp>//format strings
#include<pcl/point_types.h>
#include<pcl/io/pcd_io.h>
#include<pcl/visualization/pcl_visualizer.h>

int main(int argc,char **argv)
{
    vector<cv::Mat> colorImgs,depthImgs;
    vector<Eigen::Isometry3d,Eigen::aligned_allocator<Eigen::Isometry3d>> poses;//poses of camera
    ifstream fin(argv[2]);
    if(!fin)
    {
        cout<<"We need information about poses"<<endl;
        return 0;
    }
    for(int i = 0;i!=5;++i)
    {
        boost::format fmt(argv[1]+string("/%s/%d.%s"));//format of image files
        colorImgs.push_back(cv::imread((fmt%"color"%(i+1)%"png").str()));
        depthImgs.push_back(cv::imread((fmt%"depth"%(i+1)%"pgm").str(),-1));

        double data[7] = {0};
        //get poses to data
        for(auto &d:data)
           fin>>d;
        Eigen::Quaterniond q(data[6],data[3],data[4],data[5]);
        Eigen::Isometry3d T(q);
        T.pretranslate(Eigen::Vector3d(data[0],data[1],data[2]));
        poses.push_back(T);
    }
double cx = 325.5;
double cy=253.5;
double fx = 518.0;
double fy = 519.0;
double depthScale = 1000.0;
cout<<"try to get pointcloud..."<<endl;
//use XYZRGB format 
typedef pcl::PointXYZRGB PointT;
typedef pcl:: PointCloud<PointT> PointCloud;

PointCloud::Ptr pointCloud(new PointCloud());
for(int i = 0;i<5;++i)
{
    cout<<"transform the images..."<<i<<endl;
    cv::Mat color = colorImgs[i];
    cv::Mat depth = depthImgs[i];
    Eigen::Isometry3d T = poses[i];
    for (int v = 0;v<color.rows;++v)
     for (int u = 0;u<color.cols;++u)
     {
         unsigned int d = depth.ptr<unsigned short>(v)[u];//get depth of the pixel
         unsigned char* cptr = color.ptr<unsigned char>(v);
         
         if(d == 0) continue;
         Eigen::Vector3d point;
         point[2] = double(d) / depthScale;
         point[0] = (u - cx)*point[2]/fx;
         point[1] = (v - cy)*point[2]/fy;
         Eigen::Vector3d pointWorld = T*point;

         PointT p;
         p.x = pointWorld[0];
         p.y = pointWorld[1];
         p.z = pointWorld[2];
         p.b = cptr[u*color.channels()];
         p.g = cptr[u*color.channels()+1];
         p.r = cptr[u*color.channels()+2];
         pointCloud->points.push_back(p);
     }
}
pointCloud->is_dense = false;
cout<<"points number:"<<pointCloud->size()<<endl;
pcl::io::savePCDFileBinary("map.pcd",*pointCloud);
return 0;
}
```

CMakeLists.txt:
```cmake
find_package(OpenCV REQUIRED)
include_directories(${OpenCV_INCLUDE_DIRS})

include_directories("usr/include/eigen3/")

find_package(PCL REQUIRED COMPONENT common io)
include_directories(${PCL_INCLUDE_DIRS})
add_definitions(${PCL_DEFINITIONS})

add_executable(joinMap joinMap.cpp)

target_link_libraries(joinMap ${OpenCV_LIBS} ${PCL_LIBRARIES})
```
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/IMG_0519.PNG)