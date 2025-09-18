---
title: SLAM——拆解LOAM（三）
mathjax: true
date: 2021-03-31 06:17:16
tags: [SLAM]
categories: [SLAM]
---
本文为LOAM的代码拆解第三部分。<!--more-->

## LaserMapping

`LaserMapping.cpp`是最长的一个文件，有接近1000行代码，分析起来也是一个大头。为了分析后端，我们先了解一下基本的想法。后端的作用是用odometry得到的位置作为初始值，然后将该帧点云映射到全局的map上去。为了提高效率，作者使用了box以及voxel的思想。在匹配时候，使用当前传入的上一帧的点，来匹配全局地图的点。取所有的地图来匹配是比较耗时的，所以作者维护了一个box，只将当前帧与box中的某些cube进行匹配。对于box中的地图，同样是利用edge points与planar points，只不过这时候对应的点较多（也意味着更精确），因此使用多个点拟合而成的直线/平面来求残差。

---

我们可以从一开始的定义看到一些cube的信息：

```cpp
int laserCloudCenWidth = 10;
int laserCloudCenHeight = 10;
int laserCloudCenDepth = 5;
const int laserCloudWidth = 21;
const int laserCloudHeight = 21;
const int laserCloudDepth = 11;

// 一共最多4851个cube被我们保存
const int laserCloudNum = laserCloudWidth * laserCloudHeight * laserCloudDepth; //4851
```

上述代码中，后三行定义一个21*21*11的box，而这些box对应了4851个cube，之后我们会知道，每个cube的边长是50米。

前三行实际上是当前帧的坐标求得对应的cube id之后的一个偏移，可以看到一开始的偏移直接会把cube id放到大的box的中心位置。之后这个偏移会随着帧的位置变化，也是尽量让当前处理位于box的中间。这样的作用是，动态维护局部的box就可以，而无需存放所有的map。要注意，box中所有cube的cube id三个分量始终是大于0的，可以通过一维数组直接存储。

在接下来的代码中，我们可以看到一些需要使用的变量的定义。

```cpp
// input: from odom 上一帧的edge points 与 plane points
pcl::PointCloud<PointType>::Ptr laserCloudCornerLast(new pcl::PointCloud<PointType>());
pcl::PointCloud<PointType>::Ptr laserCloudSurfLast(new pcl::PointCloud<PointType>());

// ouput: all visualble cube points 我们从box中选取的周围点
pcl::PointCloud<PointType>::Ptr laserCloudSurround(new pcl::PointCloud<PointType>());

// surround points in map to build tree box中选取的周围edge点与plane点
pcl::PointCloud<PointType>::Ptr laserCloudCornerFromMap(new pcl::PointCloud<PointType>());
pcl::PointCloud<PointType>::Ptr laserCloudSurfFromMap(new pcl::PointCloud<PointType>());

//input & output: points in one frame. local --> global 
pcl::PointCloud<PointType>::Ptr laserCloudFullRes(new pcl::PointCloud<PointType>());

// points in every cube 真实存放box的cube的数组，可以看到这个数组长度为box的容量
// Ptr array[]也就是指针的数组。
pcl::PointCloud<PointType>::Ptr laserCloudCornerArray[laserCloudNum];
pcl::PointCloud<PointType>::Ptr laserCloudSurfArray[laserCloudNum];

// kd-tree
pcl::KdTreeFLANN<PointType>::Ptr kdtreeCornerFromMap(new pcl::KdTreeFLANN<PointType>());
pcl::KdTreeFLANN<PointType>::Ptr kdtreeSurfFromMap(new pcl::KdTreeFLANN<PointType>());
```

---

还是一如既往，我们先来从订阅的消息来分析。

```cpp
ros::Subscriber subLaserCloudCornerLast = nh.subscribe<sensor_msgs::PointCloud2>("/laser_cloud_corner_last", 100, laserCloudCornerLastHandler);

	ros::Subscriber subLaserCloudSurfLast = nh.subscribe<sensor_msgs::PointCloud2>("/laser_cloud_surf_last", 100, laserCloudSurfLastHandler);

	ros::Subscriber subLaserOdometry = nh.subscribe<nav_msgs::Odometry>("/laser_odom_to_init", 100, laserOdometryHandler);

	ros::Subscriber subLaserCloudFullRes = nh.subscribe<sensor_msgs::PointCloud2>("/velodyne_cloud_3", 100, laserCloudFullResHandler);
```

可以看到的是，LaserMapping接受的消息为：`/laser_cloud_corner_last`， `/laser_cloud_surf_last`，`/laser_odom_to_init`， `/velodyne_cloud_3`，这些消息都是LaserOdometry发布出来的。我们应当注意，之前Odometry是间隔5帧发送一次last的相关消息，因此Mapping的频率是要比Odometry更低的。Mapping中，这些subscriber的回调函数依然是很简单的：

```cpp
void laserCloudCornerLastHandler(const sensor_msgs::PointCloud2ConstPtr &laserCloudCornerLast2)
{
	mBuf.lock();
	cornerLastBuf.push(laserCloudCornerLast2);
	mBuf.unlock();
}

void laserCloudSurfLastHandler(const sensor_msgs::PointCloud2ConstPtr &laserCloudSurfLast2)
{
	mBuf.lock();
	surfLastBuf.push(laserCloudSurfLast2);
	mBuf.unlock();
}

void laserCloudFullResHandler(const sensor_msgs::PointCloud2ConstPtr &laserCloudFullRes2)
{
	mBuf.lock();
	fullResBuf.push(laserCloudFullRes2);
	mBuf.unlock();
}

//receive odomtry
void laserOdometryHandler(const nav_msgs::Odometry::ConstPtr &laserOdometry)
{
	mBuf.lock();
	odometryBuf.push(laserOdometry);
	mBuf.unlock();

	// high frequence publish
	Eigen::Quaterniond q_wodom_curr;
	Eigen::Vector3d t_wodom_curr;
	q_wodom_curr.x() = laserOdometry->pose.pose.orientation.x;
	q_wodom_curr.y() = laserOdometry->pose.pose.orientation.y;
	q_wodom_curr.z() = laserOdometry->pose.pose.orientation.z;
	q_wodom_curr.w() = laserOdometry->pose.pose.orientation.w;
	t_wodom_curr.x() = laserOdometry->pose.pose.position.x;
	t_wodom_curr.y() = laserOdometry->pose.pose.position.y;
	t_wodom_curr.z() = laserOdometry->pose.pose.position.z;

	Eigen::Quaterniond q_w_curr = q_wmap_wodom * q_wodom_curr;
	Eigen::Vector3d t_w_curr = q_wmap_wodom * t_wodom_curr + t_wmap_wodom; 

	nav_msgs::Odometry odomAftMapped;
	odomAftMapped.header.frame_id = "/camera_init";
	odomAftMapped.child_frame_id = "/aft_mapped";
	odomAftMapped.header.stamp = laserOdometry->header.stamp;
	odomAftMapped.pose.pose.orientation.x = q_w_curr.x();
	odomAftMapped.pose.pose.orientation.y = q_w_curr.y();
	odomAftMapped.pose.pose.orientation.z = q_w_curr.z();
	odomAftMapped.pose.pose.orientation.w = q_w_curr.w();
	odomAftMapped.pose.pose.position.x = t_w_curr.x();
	odomAftMapped.pose.pose.position.y = t_w_curr.y();
	odomAftMapped.pose.pose.position.z = t_w_curr.z();
	pubOdomAftMappedHighFrec.publish(odomAftMapped);
}
```

因此实际上主要的逻辑还是集中在一个名为`process`的函数中。在分析该函数之前，我们先关注一些辅助函数，之后会用到：

```cpp
// set initial guess
void transformAssociateToMap()
{
	q_w_curr = q_wmap_wodom * q_wodom_curr;
	t_w_curr = q_wmap_wodom * t_wodom_curr + t_wmap_wodom;
}
void transformUpdate()
{
	q_wmap_wodom = q_w_curr * q_wodom_curr.inverse();
	t_wmap_wodom = t_w_curr - q_wmap_wodom * t_wodom_curr;
}
void pointAssociateToMap(PointType const *const pi, PointType *const po)
{
	Eigen::Vector3d point_curr(pi->x, pi->y, pi->z);
	Eigen::Vector3d point_w = q_w_curr * point_curr + t_w_curr;
	po->x = point_w.x();
	po->y = point_w.y();
	po->z = point_w.z();
	po->intensity = pi->intensity;
	//po->intensity = 1.0;
}
void pointAssociateTobeMapped(PointType const *const pi, PointType *const po)
{
	Eigen::Vector3d point_w(pi->x, pi->y, pi->z);
	Eigen::Vector3d point_curr = q_w_curr.inverse() * (point_w - t_w_curr);
	po->x = point_curr.x();
	po->y = point_curr.y();
	po->z = point_curr.z();
	po->intensity = pi->intensity;
}
```

上述函数中，`q_wodom_curr`与`t_wodom_curr`是该帧的odometry的位姿，而很明显`q_wmap_wodom`与`t_wmap_wodom`是map与odometry的一个转换（在最开始的时候也是idendity），`q_w_curr`与`t_w_curr`是计算得到的当前帧在世界坐标下的位置。紧跟着的`transformUpdate`函数就是为了更新odometry到map映射的相对位姿，也就是使用当前估计的位姿，来作为下一次更新的初始值（合理）。而`pointAssociateToMap`就是将点转化到世界坐标系下，而`pointAssociateTobeMapped`则是一个逆过程。

---

process中最开始的代码如下：

```cpp
		while (!odometryBuf.empty() && odometryBuf.front()->header.stamp.toSec() < cornerLastBuf.front()->header.stamp.toSec())
				odometryBuf.pop();
			if (odometryBuf.empty())
			{
				mBuf.unlock();
				break;
			}

			while (!surfLastBuf.empty() && surfLastBuf.front()->header.stamp.toSec() < cornerLastBuf.front()->header.stamp.toSec())
				surfLastBuf.pop();
			if (surfLastBuf.empty())
			{
				mBuf.unlock();
				break;
			}

			while (!fullResBuf.empty() && fullResBuf.front()->header.stamp.toSec() < cornerLastBuf.front()->header.stamp.toSec())
				fullResBuf.pop();
			if (fullResBuf.empty())
			{
				mBuf.unlock();
				break;
			}
```

这一部分的代码主要是做一个时间戳的同步（odometry是一直在发布，而last Edge 以及last Plane是间隔几帧才发布一次）。

在获取到上一帧的信息后（并不严格是上一帧，因为mapping频率较低，会丢弃较多帧），代码中使用了`transformAssociateToMap`来设定初始的直接坐标系下frame的位姿。之后一大段有点难以理解，是进行cube相关的操作，代码如下：

```cpp
// 这三行是计算当前帧在世界坐标系下的cube id，这个id是三维的
// 而每个格子的长宽高为50m，这里加上25再除以50，是为了保证小于25的映射到0，而将大于25的映射到1。
// 这类似于我们在要保证四舍五入时，由于int是直接截断，对于大于0的相当于是直接向下取整，小于0的相当于向上取整。
// 当(a >= 0)时候， (int)( a + 0.5 )就可以保证得到的值是四舍五入的。
// 但是当a<0时，应该为写为(int)(a - 0.5)。
// 四舍五入函数c++中已经实现，因此这里的代码似乎可以改写为：std::round(t_w_curr.x() / 50.0)，
// laserCloudCenWidth则是一个偏移量，目前看来是为了让Cube id大于等于0
int centerCubeI = int((t_w_curr.x() + 25.0) / 50.0) + laserCloudCenWidth;
int centerCubeJ = int((t_w_curr.y() + 25.0) / 50.0) + laserCloudCenHeight;
int centerCubeK = int((t_w_curr.z() + 25.0) / 50.0) + laserCloudCenDepth;
// 但是当a<0时，应该为写为(int)(a - 0.5)，所以需要一个额外的处理
if (t_w_curr.x() + 25.0 < 0)
	centerCubeI--;
if (t_w_curr.y() + 25.0 < 0)
	centerCubeJ--;
if (t_w_curr.z() + 25.0 < 0)
	centerCubeK--;

while (centerCubeI < 3)
{
	for (int j = 0; j < laserCloudHeight; j++)
	{
		for (int k = 0; k < laserCloudDepth; k++)
		{ 
			int i = laserCloudWidth - 1;
			// 很显然，要处理的cube是存放在一个数组中的，而这个数组的大小也就是cube的容量：4851
			pcl::PointCloud<PointType>::Ptr laserCloudCubeCornerPointer =
				laserCloudCornerArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k]; 
			pcl::PointCloud<PointType>::Ptr laserCloudCubeSurfPointer =
				laserCloudSurfArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
			for (; i >= 1; i--)
			{
				laserCloudCornerArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
					laserCloudCornerArray[i - 1 + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
				laserCloudSurfArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
					laserCloudSurfArray[i - 1 + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
			}
			laserCloudCornerArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
				laserCloudCubeCornerPointer;
			laserCloudSurfArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
				laserCloudCubeSurfPointer;
			laserCloudCubeCornerPointer->clear();
			laserCloudCubeSurfPointer->clear();
		}
	}

	centerCubeI++;
	laserCloudCenWidth++;
}

while (centerCubeI >= laserCloudWidth - 3)
{ 
	for (int j = 0; j < laserCloudHeight; j++)
	{
		for (int k = 0; k < laserCloudDepth; k++)
		{
			int i = 0;
			pcl::PointCloud<PointType>::Ptr laserCloudCubeCornerPointer =
				laserCloudCornerArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
			pcl::PointCloud<PointType>::Ptr laserCloudCubeSurfPointer =
				laserCloudSurfArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
			for (; i < laserCloudWidth - 1; i++)
			{
				laserCloudCornerArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
					laserCloudCornerArray[i + 1 + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
				laserCloudSurfArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
					laserCloudSurfArray[i + 1 + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k];
			}
			laserCloudCornerArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
				laserCloudCubeCornerPointer;
			laserCloudSurfArray[i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k] =
				laserCloudCubeSurfPointer;
			laserCloudCubeCornerPointer->clear();
			laserCloudCubeSurfPointer->clear();
		}
	}

	centerCubeI--;
	laserCloudCenWidth--;
}
while (centerCubeJ < 3)
{/*...*/}
while (centerCubeJ >= laserCloudHeight - 3)
{ /*...*/}
while (centerCubeK < 3)
{/*...*/}
while (centerCubeK >= laserCloudDepth - 3)
{ /*...*/}
```

最开始的部分是为了求得当前帧在世界坐标系下的cube id，正如注释中分析的一样，每个cube的大小为$50 \times 50 \times 50$，每个点所在的cube就是它距离中心最近的那个cube，这也是为什么求cube id时候需要四舍五入（这个与FlashFusion中对Cube的划分也不相同）。在求得cube id之后，如果cube id的x维小于3，就会将整个cube朝着x维的方向移动，直到将当前cube移动到大于等于3的位置。同样，如果x维度距离另一端小于3，就会将Cube朝着x轴反方向移动。

这一部分的代码，就是为了将当前帧所在的cube移动到比较靠中间的位置（所有的其他点云也会跟着移动），同理，对于y轴以及z轴也会做一样的操作。需要注意的是这时候laserCloudCenWidth也在跟着改变。

接下来的代码主要是融合了了一下当前frame所在周围的cube融合得到的点云，并且准备了一下上一帧的点云（edge points与plane points依然是分开的）。

```cpp
int laserCloudValidNum = 0;
int laserCloudSurroundNum = 0;

for (int i = centerCubeI - 2; i <= centerCubeI + 2; i++)
{
	for (int j = centerCubeJ - 2; j <= centerCubeJ + 2; j++)
	{
		for (int k = centerCubeK - 1; k <= centerCubeK + 1; k++)
		{
			if (i >= 0 && i < laserCloudWidth &&
				j >= 0 && j < laserCloudHeight &&
				k >= 0 && k < laserCloudDepth)
			{ 
				// 这里为何要记录两个
				laserCloudValidInd[laserCloudValidNum] = i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k;
				laserCloudValidNum++;
				laserCloudSurroundInd[laserCloudSurroundNum] = i + laserCloudWidth * j + laserCloudWidth * laserCloudHeight * k;
				laserCloudSurroundNum++;
			}
		}
	}
}

laserCloudCornerFromMap->clear();
laserCloudSurfFromMap->clear();
for (int i = 0; i < laserCloudValidNum; i++)
{
	*laserCloudCornerFromMap += *laserCloudCornerArray[laserCloudValidInd[i]];
	*laserCloudSurfFromMap += *laserCloudSurfArray[laserCloudValidInd[i]];
}
int laserCloudCornerFromMapNum = laserCloudCornerFromMap->points.size();
int laserCloudSurfFromMapNum = laserCloudSurfFromMap->points.size();
// 对上一帧的点云进行采样
pcl::PointCloud<PointType>::Ptr laserCloudCornerStack(new pcl::PointCloud<PointType>());
downSizeFilterCorner.setInputCloud(laserCloudCornerLast);
downSizeFilterCorner.filter(*laserCloudCornerStack);
int laserCloudCornerStackNum = laserCloudCornerStack->points.size();

pcl::PointCloud<PointType>::Ptr laserCloudSurfStack(new pcl::PointCloud<PointType>());
downSizeFilterSurf.setInputCloud(laserCloudSurfLast);
downSizeFilterSurf.filter(*laserCloudSurfStack);
int laserCloudSurfStackNum = laserCloudSurfStack->points.size();
```

---

只有当融合得到的edge_points以及plane_points的数量超过一定值才可以进行全局的mapping，需要注意的是这里数量要比odometry中用到的关键点数量大很多。得到周围地图的特征点之后，之后的操作就是构造约束，并且进行优化了。优化的部分较长，我们拆解开来看。

首先是ceres的准备，这部分是优化前的基本操作：

```cpp
ceres::LossFunction *loss_function = new ceres::HuberLoss(0.1);
ceres::LocalParameterization *q_parameterization =
	new ceres::EigenQuaternionParameterization();
ceres::Problem::Options problem_options;

ceres::Problem problem(problem_options);
problem.AddParameterBlock(parameters, 4, q_parameterization);
problem.AddParameterBlock(parameters + 4, 3);
```

接着是对于edge points的优化，这里求直线方向向量使用了对协方差矩阵的特征值分解。如果一堆三维点是采样自一条直线，那么它最大的特征向量就是对这条直线方向的最小二乘拟合，且最大特征值会远远大于其他两个特征值。同理，如果是平面，那么最大的两个特征向量会远远大于第三个特征向量。可以通过下面的动态图看出来这个规律：

![Untitled](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/LOAM%20(3)%2035c569841d2743798e1130c229adedbb/ezgif-2-e8efb8659349.gif)

```cpp
int corner_num = 0;

for (int i = 0; i < laserCloudCornerStackNum; i++)
{
pointOri = laserCloudCornerStack->points[i];
//double sqrtDis = pointOri.x * pointOri.x + pointOri.y * pointOri.y + pointOri.z * pointOri.z;
pointAssociateToMap(&pointOri, &pointSel);
// 寻找5个最近点
kdtreeCornerFromMap->nearestKSearch(pointSel, 5, pointSearchInd, pointSearchSqDis); 

if (pointSearchSqDis[4] < 1.0)
{ 
	std::vector<Eigen::Vector3d> nearCorners;
	Eigen::Vector3d center(0, 0, 0);
	// 求得这些点的中心
	for (int j = 0; j < 5; j++)
	{
		Eigen::Vector3d tmp(laserCloudCornerFromMap->points[pointSearchInd[j]].x,
							laserCloudCornerFromMap->points[pointSearchInd[j]].y,
							laserCloudCornerFromMap->points[pointSearchInd[j]].z);
		center = center + tmp;
		nearCorners.push_back(tmp);
	}
	center = center / 5.0;
	// 求得协方差矩阵
	Eigen::Matrix3d covMat = Eigen::Matrix3d::Zero();
	for (int j = 0; j < 5; j++)
	{
		Eigen::Matrix<double, 3, 1> tmpZeroMean = nearCorners[j] - center;
		covMat = covMat + tmpZeroMean * tmpZeroMean.transpose();
	}

	Eigen::SelfAdjointEigenSolver<Eigen::Matrix3d> saes(covMat);
	// 对协方差矩阵进行特征分解 （EVD）
	// 特征值是升序排列
	// 协方差矩阵特征值最大的特征向量就代表了直线的方向
	// if is indeed line feature
	// note Eigen library sort eigenvalues in increasing order
	Eigen::Vector3d unit_direction = saes.eigenvectors().col(2);
	Eigen::Vector3d curr_point(pointOri.x, pointOri.y, pointOri.z);
	if (saes.eigenvalues()[2] > 3 * saes.eigenvalues()[1])
	{ 
		// 在该直线上构造两个点
		Eigen::Vector3d point_on_line = center;
		Eigen::Vector3d point_a, point_b;
		point_a = 0.1 * unit_direction + point_on_line;
		point_b = -0.1 * unit_direction + point_on_line;

		ceres::CostFunction *cost_function = LidarEdgeFactor::Create(curr_point, point_a, point_b, 1.0);
		problem.AddResidualBlock(cost_function, loss_function, parameters, parameters + 4);
		corner_num++;	
	}							
}
```

---

下一步是对plane point的优化：

```cpp
int surf_num = 0;
for (int i = 0; i < laserCloudSurfStackNum; i++)
{
	pointOri = laserCloudSurfStack->points[i];
	//double sqrtDis = pointOri.x * pointOri.x + pointOri.y * pointOri.y + pointOri.z * pointOri.z;
	pointAssociateToMap(&pointOri, &pointSel);
	// 寻找5个平面点
	kdtreeSurfFromMap->nearestKSearch(pointSel, 5, pointSearchInd, pointSearchSqDis);

	Eigen::Matrix<double, 5, 3> matA0;
	Eigen::Matrix<double, 5, 1> matB0 = -1 * Eigen::Matrix<double, 5, 1>::Ones();
	if (pointSearchSqDis[4] < 1.0)
	{
		
		for (int j = 0; j < 5; j++)
		{
			matA0(j, 0) = laserCloudSurfFromMap->points[pointSearchInd[j]].x;
			matA0(j, 1) = laserCloudSurfFromMap->points[pointSearchInd[j]].y;
			matA0(j, 2) = laserCloudSurfFromMap->points[pointSearchInd[j]].z;
			//printf(" pts %f %f %f ", matA0(j, 0), matA0(j, 1), matA0(j, 2));
		}
		// find the norm of plane
		// 求解平面方程 Ax + By + Cz = -1, 并对法向量进行归一化
		// 得到一般形式的平面方程：nx + d = 0
		Eigen::Vector3d norm = matA0.colPivHouseholderQr().solve(matB0);
		double negative_OA_dot_norm = 1 / norm.norm();
		norm.normalize();
		
		// Here n(pa, pb, pc) is unit norm of plane
		bool planeValid = true;
		for (int j = 0; j < 5; j++)
		{
			// if OX * n > 0.2, then plane is not fit well
			// 如果点到直线距离大于0.2， 就认为平面拟合得不够好
			if (fabs(norm(0) * laserCloudSurfFromMap->points[pointSearchInd[j]].x +
					 norm(1) * laserCloudSurfFromMap->points[pointSearchInd[j]].y +
					 norm(2) * laserCloudSurfFromMap->points[pointSearchInd[j]].z + negative_OA_dot_norm) > 0.2)
			{
				planeValid = false;
				break;
			}
		}
		Eigen::Vector3d curr_point(pointOri.x, pointOri.y, pointOri.z);
		if (planeValid)
		{
			ceres::CostFunction *cost_function = LidarPlaneNormFactor::Create(curr_point, norm, negative_OA_dot_norm);
			problem.AddResidualBlock(cost_function, loss_function, parameters, parameters + 4);
			surf_num++;
		}
	}
}
```

---

优化结束后（进行两次迭代），可以得到更新后的frame的global pose（也就是对应的`q_w_curr`以及`t_w_curr`），因此也就可以更新一下从odometry到global map的相对位姿（`transformUpdate()`），来作为下一个的初始估计。

下面这段代码，会将上一帧的点移动到box中对应的cube的点云中。

```cpp

for (int i = 0; i < laserCloudCornerStackNum; i++)
{
	pointAssociateToMap(&laserCloudCornerStack->points[i], &pointSel);

	int cubeI = int((pointSel.x + 25.0) / 50.0) + laserCloudCenWidth;
	int cubeJ = int((pointSel.y + 25.0) / 50.0) + laserCloudCenHeight;
	int cubeK = int((pointSel.z + 25.0) / 50.0) + laserCloudCenDepth;

	if (pointSel.x + 25.0 < 0)
		cubeI--;
	if (pointSel.y + 25.0 < 0)
		cubeJ--;
	if (pointSel.z + 25.0 < 0)
		cubeK--;

	if (cubeI >= 0 && cubeI < laserCloudWidth &&
		cubeJ >= 0 && cubeJ < laserCloudHeight &&
		cubeK >= 0 && cubeK < laserCloudDepth)
	{
		int cubeInd = cubeI + laserCloudWidth * cubeJ + laserCloudWidth * laserCloudHeight * cubeK;
		laserCloudCornerArray[cubeInd]->push_back(pointSel);
	}
}
for (int i = 0; i < laserCloudSurfStackNum; i++)
{
	pointAssociateToMap(&laserCloudSurfStack->points[i], &pointSel);

	int cubeI = int((pointSel.x + 25.0) / 50.0) + laserCloudCenWidth;
	int cubeJ = int((pointSel.y + 25.0) / 50.0) + laserCloudCenHeight;
	int cubeK = int((pointSel.z + 25.0) / 50.0) + laserCloudCenDepth;

	if (pointSel.x + 25.0 < 0)
		cubeI--;
	if (pointSel.y + 25.0 < 0)
		cubeJ--;
	if (pointSel.z + 25.0 < 0)
		cubeK--;

	if (cubeI >= 0 && cubeI < laserCloudWidth &&
		cubeJ >= 0 && cubeJ < laserCloudHeight &&
		cubeK >= 0 && cubeK < laserCloudDepth)
	{
		int cubeInd = cubeI + laserCloudWidth * cubeJ + laserCloudWidth * laserCloudHeight * cubeK;
		laserCloudSurfArray[cubeInd]->push_back(pointSel);
	}
}
printf("add points time %f ms\n", t_add.toc());
```

而下面这段代码会对加入这一片的点云进行重新的采样：

```cpp
for (int i = 0; i < laserCloudValidNum; i++)
{
	int ind = laserCloudValidInd[i];

	pcl::PointCloud<PointType>::Ptr tmpCorner(new pcl::PointCloud<PointType>());
	downSizeFilterCorner.setInputCloud(laserCloudCornerArray[ind]);
	downSizeFilterCorner.filter(*tmpCorner);
	laserCloudCornerArray[ind] = tmpCorner;

	pcl::PointCloud<PointType>::Ptr tmpSurf(new pcl::PointCloud<PointType>());
	downSizeFilterSurf.setInputCloud(laserCloudSurfArray[ind]);
	downSizeFilterSurf.filter(*tmpSurf);
	laserCloudSurfArray[ind] = tmpSurf;
}
```

之后的事情就是发布了一些得到的结果：

```cpp
if (frameCount % 5 == 0)
{
	laserCloudSurround->clear();
	for (int i = 0; i < laserCloudSurroundNum; i++)
	{
		int ind = laserCloudSurroundInd[i];
		*laserCloudSurround += *laserCloudCornerArray[ind];
		*laserCloudSurround += *laserCloudSurfArray[ind];
	}

	sensor_msgs::PointCloud2 laserCloudSurround3;
	pcl::toROSMsg(*laserCloudSurround, laserCloudSurround3);
	laserCloudSurround3.header.stamp = ros::Time().fromSec(timeLaserOdometry);
	laserCloudSurround3.header.frame_id = "/camera_init";
	pubLaserCloudSurround.publish(laserCloudSurround3);
}

if (frameCount % 20 == 0)
{
	pcl::PointCloud<PointType> laserCloudMap;
	for (int i = 0; i < 4851; i++)
	{
		laserCloudMap += *laserCloudCornerArray[i];
		laserCloudMap += *laserCloudSurfArray[i];
	}
	sensor_msgs::PointCloud2 laserCloudMsg;
	pcl::toROSMsg(laserCloudMap, laserCloudMsg);
	laserCloudMsg.header.stamp = ros::Time().fromSec(timeLaserOdometry);
	laserCloudMsg.header.frame_id = "/camera_init";
	pubLaserCloudMap.publish(laserCloudMsg);
}

int laserCloudFullResNum = laserCloudFullRes->points.size();
for (int i = 0; i < laserCloudFullResNum; i++)
{
	pointAssociateToMap(&laserCloudFullRes->points[i], &laserCloudFullRes->points[i]);
}

sensor_msgs::PointCloud2 laserCloudFullRes3;
pcl::toROSMsg(*laserCloudFullRes, laserCloudFullRes3);
laserCloudFullRes3.header.stamp = ros::Time().fromSec(timeLaserOdometry);
laserCloudFullRes3.header.frame_id = "/camera_init";
pubLaserCloudFullRes.publish(laserCloudFullRes3);

printf("mapping pub time %f ms \n", t_pub.toc());

printf("whole mapping time %f ms +++++\n", t_whole.toc());

nav_msgs::Odometry odomAftMapped;
odomAftMapped.header.frame_id = "/camera_init";
odomAftMapped.child_frame_id = "/aft_mapped";
odomAftMapped.header.stamp = ros::Time().fromSec(timeLaserOdometry);
odomAftMapped.pose.pose.orientation.x = q_w_curr.x();
odomAftMapped.pose.pose.orientation.y = q_w_curr.y();
odomAftMapped.pose.pose.orientation.z = q_w_curr.z();
odomAftMapped.pose.pose.orientation.w = q_w_curr.w();
odomAftMapped.pose.pose.position.x = t_w_curr.x();
odomAftMapped.pose.pose.position.y = t_w_curr.y();
odomAftMapped.pose.pose.position.z = t_w_curr.z();
pubOdomAftMapped.publish(odomAftMapped);

geometry_msgs::PoseStamped laserAfterMappedPose;
laserAfterMappedPose.header = odomAftMapped.header;
laserAfterMappedPose.pose = odomAftMapped.pose.pose;
laserAfterMappedPath.header.stamp = odomAftMapped.header.stamp;
laserAfterMappedPath.header.frame_id = "/camera_init";
laserAfterMappedPath.poses.push_back(laserAfterMappedPose);
pubLaserAfterMappedPath.publish(laserAfterMappedPath);

static tf::TransformBroadcaster br;
tf::Transform transform;
tf::Quaternion q;
transform.setOrigin(tf::Vector3(t_w_curr(0),
								t_w_curr(1),
								t_w_curr(2)));
q.setW(q_w_curr.w());
q.setX(q_w_curr.x());
q.setY(q_w_curr.y());
q.setZ(q_w_curr.z());
transform.setRotation(q);
br.sendTransform(tf::StampedTransform(transform, odomAftMapped.header.stamp, "/camera_init", "/aft_mapped"));
```

到这里，A-LOAM的后端也就介绍完了。这里后端部分比较让人难以理解的就是放入box的操作。实际上来说，首先根据估计的odometry，计算所在的cube id，这里的cube id是世界坐标系下的。接着额，对cube id进行一个偏移，也就转化到了box的视角下。box是21 * 21 * 11的，只有正值，很明显不是任何一个cube都能存放在box中，因此随着雷达位置的变化，box的位置也会被慢慢移动，来保证雷达的位置能大概保持在box的中间区域。

这里需要注意的是，box如果移出了某个位置，这个位置的点就会被释放掉，这意味着雷达赚了一圈回来，如果之前的点被释放了，那么它是不会匹配这里之前的点的，也就是说，没有闭环检测。