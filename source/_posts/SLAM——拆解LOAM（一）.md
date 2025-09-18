---
title: SLAM——拆解LOAM（一）
mathjax: true
date: 2021-03-31 06:17:22
tags: [SLAM]
categories: [SLAM]
---
本文为拆解LOMA代码的第一部分。<!--more-->

## scanRegistration

这部分的代码是来自于`scanRegistration.h`以及`scanRegistration.cpp`，主要是包含了特征提取的部分。

首先，从`Subscriber`入手：

```cpp
ros::Subscriber subLaserCloud = nh.subscribe<sensor_msgs::PointCloud2>("/velodyne_points", 100, laserCloudHandler);
```

可以看到，订阅的topic为velodyne_points，这里velodyne是一种雷达。而收到message后的callback函数为：`laserCloudHandler`，因此我们直接进入`laserCloudHander`来分析。

---

在该函数中，最开始是一些去处NaN以及删除一些距离雷达太近的点。之后，有一段代码如下：

```cpp
float startOri = -atan2(laserCloudIn.points[0].y, laserCloudIn.points[0].x);
    float endOri = -atan2(laserCloudIn.points[cloudSize - 1].y,
                          laserCloudIn.points[cloudSize - 1].x) +
                   2 * M_PI;
    if (endOri - startOri > 3 * M_PI)
    {
        endOri -= 2 * M_PI;
    }
    else if (endOri - startOri < M_PI)
    {
        endOri += 2 * M_PI;
    }
```

这段代码很明显是在记录当前帧的起始与终点对应的旋转角度。在雷达得到的点中，x,y为水平的坐标，而z是垂直的坐标。一般的雷达，是绕着z轴平行的方向来旋转的，但是多线雷达在z轴的方向上也会有不同角度的发射与接收。这段代码首先根据点的x,y坐标计算得到旋转的角度。可以看到经过这样的处理，每个雷达开始的方向与结束的方向差在$[\pi, 3\pi]$的范围内。这样的处理是因为每一帧雷达旋转的不是严格的一圈，但应该是近似一圈的，所以把角度投到上述范围是最合适的。根据实际测试，一般来说方向都是$2\pi$左右：

```cpp
6.253  6.33232 6.24922 6.25029 //方向差
```

---

之后的代码有点长，我对中间的一些部分进行了省略：

```cpp
std::vector<pcl::PointCloud<PointType>> laserCloudScans(N_SCANS);
    for (int i = 0; i < cloudSize; i++)
    {
        point.x = laserCloudIn.points[i].x;
        point.y = laserCloudIn.points[i].y;
        point.z = laserCloudIn.points[i].z;

        float angle = atan(point.z / sqrt(point.x * point.x + point.y * point.y)) * 180 / M_PI;
        int scanID = 0;

        if (N_SCANS == 16)
        {
            scanID = int((angle + 15) / 2 + 0.5);
            if (scanID > (N_SCANS - 1) || scanID < 0)
            {
                count--;
                continue;
            }
        }
        else if (N_SCANS == 32){/*...*/}
        else if (N_SCANS == 64){/*...*/}
        else
        {
            printf("wrong scan number\n");
            ROS_BREAK();
        }
        //printf("angle %f scanID %d \n", angle, scanID);
        // compute current orientation
        float ori = -atan2(point.y, point.x);
        if (!halfPassed)
        { 
            if (ori < startOri - M_PI / 2)
            {
                ori += 2 * M_PI;
            }
            else if (ori > startOri + M_PI * 3 / 2)
            {
                ori -= 2 * M_PI;
            }

            if (ori - startOri > M_PI)
            {
                halfPassed = true;
            }
        }
        else
        {
            ori += 2 * M_PI;
            if (ori < endOri - M_PI * 3 / 2)
            {
                ori += 2 * M_PI;
            }
            else if (ori > endOri + M_PI / 2)
            {
                ori -= 2 * M_PI;
            }
        }
        // the intensity here is not the intensity you thought. 
        // it records something about distortion
        float relTime = (ori - startOri) / (endOri - startOri);
        point.intensity = scanID + scanPeriod * relTime;
        laserCloudScans[scanID].push_back(point); 
    }
```

可以看到这部分的代码主要是把输入的点云分成了不同的scan，具体来说，目前的雷达大多数是多线的，而这部分的代码是将点云分配到自己对应的"线"上。从雷达的原理来说，我们可以想象多线雷达为垂直方向上不同的sensor，而雷达每水平旋转一个角度，这些传感器就会同时打点出去并接受，因此在接收顺序上是不确定的，所以我们需要根据z方向的偏角来计算属于哪一个线的点。但是，从原理上来说，不同水平方向上的点一定是按照顺序来的（比如从0度的点一定比从10度的要早），这也是代码中`haflPassed`可以工作的原因。最后这些点被记录到不同的scans中。同时注意以下这里点的`intensity`，实际上是记录了该点被采集的一个相对时间（雷达的旋转是匀速的，而采集点的频率被控制到10Hz，所以每一帧花费的时间是100ms，也就算`relTime`的值，而根据目前点水平旋转方向，可以计算出记录该点时候的一个相对时间），这个相对时间是很有用的，因为在采集的过程中雷达可能也在运动，所以一定会有distortion，利用这个时间可以进行去扰动。

```cpp
pcl::PointCloud<PointType>::Ptr laserCloud(new pcl::PointCloud<PointType>());
    // start and end index, and there is a margin between each scans. Later we will compute curvatures for these points.
    for (int i = 0; i < N_SCANS; i++)
    { 
        scanStartInd[i] = laserCloud->size() + 5;
        *laserCloud += laserCloudScans[i];
        scanEndInd[i] = laserCloud->size() - 6;
    }

    printf("prepare time %f \n", t_prepare.toc());

    for (int i = 5; i < cloudSize - 5; i++)
    { 
        // should notices that here some points' curvatures are invalid.
        float diffX = laserCloud->points[i - 5].x + laserCloud->points[i - 4].x + laserCloud->points[i - 3].x + laserCloud->points[i - 2].x + laserCloud->points[i - 1].x - 10 * laserCloud->points[i].x + laserCloud->points[i + 1].x + laserCloud->points[i + 2].x + laserCloud->points[i + 3].x + laserCloud->points[i + 4].x + laserCloud->points[i + 5].x;
        float diffY = laserCloud->points[i - 5].y + laserCloud->points[i - 4].y + laserCloud->points[i - 3].y + laserCloud->points[i - 2].y + laserCloud->points[i - 1].y - 10 * laserCloud->points[i].y + laserCloud->points[i + 1].y + laserCloud->points[i + 2].y + laserCloud->points[i + 3].y + laserCloud->points[i + 4].y + laserCloud->points[i + 5].y;
        float diffZ = laserCloud->points[i - 5].z + laserCloud->points[i - 4].z + laserCloud->points[i - 3].z + laserCloud->points[i - 2].z + laserCloud->points[i - 1].z - 10 * laserCloud->points[i].z + laserCloud->points[i + 1].z + laserCloud->points[i + 2].z + laserCloud->points[i + 3].z + laserCloud->points[i + 4].z + laserCloud->points[i + 5].z;

        cloudCurvature[i] = diffX * diffX + diffY * diffY + diffZ * diffZ;
        cloudSortInd[i] = i;
        cloudNeighborPicked[i] = 0;
        cloudLabel[i] = 0;
    }
```

---

上述代码其实很简单，它会对每个点进行一个曲率的计算（当然这个曲率相对于计算几何中的曲率来说定义简化了不少）。根据这个曲率，可以来判断点是处于平面点（Planar point）还是边上的点（Edge point）。这里可以看到，代码中对每个scan记录了一个start index以及end index，并且派出了最开始的5个点与之后的5个点，这是因为这些点计算的曲率是不正确的（他们的邻近点与包含到了别的scan的内容）。

---

```cpp
pcl::PointCloud<PointType> cornerPointsSharp;
    pcl::PointCloud<PointType> cornerPointsLessSharp;
    pcl::PointCloud<PointType> surfPointsFlat;
    pcl::PointCloud<PointType> surfPointsLessFlat;

    float t_q_sort = 0;
    for (int i = 0; i < N_SCANS; i++)
    {
        if( scanEndInd[i] - scanStartInd[i] < 6)
            continue;
        pcl::PointCloud<PointType>::Ptr surfPointsLessFlatScan(new pcl::PointCloud<PointType>);
        // seperate each scan into 6 parts
        for (int j = 0; j < 6; j++)
        {
            int sp = scanStartInd[i] + (scanEndInd[i] - scanStartInd[i]) * j / 6; 
            int ep = scanStartInd[i] + (scanEndInd[i] - scanStartInd[i]) * (j + 1) / 6 - 1;

            TicToc t_tmp;
            std::sort (cloudSortInd + sp, cloudSortInd + ep + 1, comp);
            t_q_sort += t_tmp.toc();

            int largestPickedNum = 0;
            for (int k = ep; k >= sp; k--)
            {
                int ind = cloudSortInd[k]; 

                if (cloudNeighborPicked[ind] == 0 &&
                    cloudCurvature[ind] > 0.1)
                {

                    largestPickedNum++;
                    if (largestPickedNum <= 2)
                    {                        
                        cloudLabel[ind] = 2;
                        cornerPointsSharp.push_back(laserCloud->points[ind]);
                        cornerPointsLessSharp.push_back(laserCloud->points[ind]);
                    }
                    else if (largestPickedNum <= 20)
                    {                        
                        // two sharp edge points, and 20 less sharp edge points
                        cloudLabel[ind] = 1; 
                        cornerPointsLessSharp.push_back(laserCloud->points[ind]);
                    }
                    else
                    {
                        break;
                    }

                    cloudNeighborPicked[ind] = 1; 

                    for (int l = 1; l <= 5; l++)
                    {
                        float diffX = laserCloud->points[ind + l].x - laserCloud->points[ind + l - 1].x;
                        float diffY = laserCloud->points[ind + l].y - laserCloud->points[ind + l - 1].y;
                        float diffZ = laserCloud->points[ind + l].z - laserCloud->points[ind + l - 1].z;
                        if (diffX * diffX + diffY * diffY + diffZ * diffZ > 0.05)
                        {
                            break;
                        }

                        cloudNeighborPicked[ind + l] = 1;
                    }
                    for (int l = -1; l >= -5; l--)
                    {
                        float diffX = laserCloud->points[ind + l].x - laserCloud->points[ind + l + 1].x;
                        float diffY = laserCloud->points[ind + l].y - laserCloud->points[ind + l + 1].y;
                        float diffZ = laserCloud->points[ind + l].z - laserCloud->points[ind + l + 1].z;
                        //if distance is larger than a threshold, we do not consider this point as a neighbor anymore.
                        if (diffX * diffX + diffY * diffY + diffZ * diffZ > 0.05)
                        {
                            break;
                        }

                        cloudNeighborPicked[ind + l] = 1;
                    }
                }
            }

            int smallestPickedNum = 0;
            for (int k = sp; k <= ep; k++)
            {
                int ind = cloudSortInd[k];

                if (cloudNeighborPicked[ind] == 0 &&
                    cloudCurvature[ind] < 0.1)
                {

                    cloudLabel[ind] = -1; 
                    surfPointsFlat.push_back(laserCloud->points[ind]);

                    smallestPickedNum++;
                    if (smallestPickedNum >= 4)
                    { 
                        break;
                    }

                    cloudNeighborPicked[ind] = 1;
                    for (int l = 1; l <= 5; l++)
                    { 
                        float diffX = laserCloud->points[ind + l].x - laserCloud->points[ind + l - 1].x;
                        float diffY = laserCloud->points[ind + l].y - laserCloud->points[ind + l - 1].y;
                        float diffZ = laserCloud->points[ind + l].z - laserCloud->points[ind + l - 1].z;
                        if (diffX * diffX + diffY * diffY + diffZ * diffZ > 0.05)
                        {
                            break;
                        }

                        cloudNeighborPicked[ind + l] = 1;
                    }
                    for (int l = -1; l >= -5; l--)
                    {
                        float diffX = laserCloud->points[ind + l].x - laserCloud->points[ind + l + 1].x;
                        float diffY = laserCloud->points[ind + l].y - laserCloud->points[ind + l + 1].y;
                        float diffZ = laserCloud->points[ind + l].z - laserCloud->points[ind + l + 1].z;
                        if (diffX * diffX + diffY * diffY + diffZ * diffZ > 0.05)
                        {
                            break;
                        }

                        cloudNeighborPicked[ind + l] = 1;
                    }
                }
            }

            for (int k = sp; k <= ep; k++)
            {
                if (cloudLabel[k] <= 0)
                {
                    surfPointsLessFlatScan->push_back(laserCloud->points[k]);
                }
            }
        }
        // less flat surf points will contains flat points and non-sharp points. 
        pcl::PointCloud<PointType> surfPointsLessFlatScanDS;
        pcl::VoxelGrid<PointType> downSizeFilter;
        downSizeFilter.setInputCloud(surfPointsLessFlatScan);
        downSizeFilter.setLeafSize(0.2, 0.2, 0.2);
        downSizeFilter.filter(surfPointsLessFlatScanDS);

        surfPointsLessFlat += surfPointsLessFlatScanDS;
    }
```

这一段代码非常长，但是任务很简单，就是提取edge point与planar point，在A-LOAM中被称为`cornerPointsSharp`以及`surfPointsFlat`。如果参考论文可以知道，选取点的一些原则：

- 曲率最大的点是边点，曲率最小的点是平面点
- 当一个点被选中后，它周围的点不应该再被选到
- 将scan分组，每个组的关键点数量有限制
- 避免可能被遮挡的点，避免与光线平行的点

上述代码中，前三点都有所体现，但是对于第四点似乎没有作特别的处理。

![LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled.png](LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled.png)

提取的特征点如下图：

![LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled%201.png](LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled%201.png)

除此之外，A-LOAM与LOAM论文中不一样的地方是他还保留了lessSharp以及lessFlat，其中lessSharp是曲率最大的20个点中曲率大于0.1的点，而lessFlat则是除了lessSharp以及Sharp之外的所有点。最后，在这部分代码中会将这些处理后的点云以message的形式发布出去：

```cpp
	  pubLaserCloud = nh.advertise<sensor_msgs::PointCloud2>("/velodyne_cloud_2", 100);

    pubCornerPointsSharp = nh.advertise<sensor_msgs::PointCloud2>("/laser_cloud_sharp", 100);

    pubCornerPointsLessSharp = nh.advertise<sensor_msgs::PointCloud2>("/laser_cloud_less_sharp", 100);

    pubSurfPointsFlat = nh.advertise<sensor_msgs::PointCloud2>("/laser_cloud_flat", 100);

    pubSurfPointsLessFlat = nh.advertise<sensor_msgs::PointCloud2>("/laser_cloud_less_flat", 100);

    pubRemovePoints = nh.advertise<sensor_msgs::PointCloud2>("/laser_remove_points", 100);
```

对于第一部分的代码就分析完毕了。

## lidarFactor

这部分分析一下`lidarFactor.hpp`的内容。这一部分的内容不多，主要是计算边点以及平面点的匹配以及错误度量，但是想要了解透彻，需要进行一些数学上的分析，所以我们先不看代码。

**EdgeFactor**

Edge Points是位于Edge上的点。在相邻的帧$F_t$，$F_ {t+1}$上，假设我们找到了对应的Edge Point分别为$j,i$，其中$j \in F_t, i \in F_ {t+1}$，这两个点不一定对应真实世界中的同一个点，但是他们来自于同一个直线上，因此错误度量就是直线到点的距离。仅仅靠两个点无法具体求得知县道殿的距离，因此我们在$F_ {t}$上再找到同一条直线上的点$l$。这样的话，我们找到了一个edge correspondence：$(j, l)$与$i$，如下图：

![LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled%202.png](LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled%202.png)

而$i$到直线$j,l$的距离可以根据构建的几何关系轻易求出来：

$$
d_ {\mathcal{E}}=\frac{\left|\left(\mathbf X_i-\mathbf X_j\right) \times\left(\mathbf X_i-\mathbf X_l\right)\right|}{\left|\mathbf X_j-\mathbf X_l\right|}
$$

这也就是EdgeFactor的误差。

**PlaneFactor**

Planar points是位于平面上的点，自然而然平面的correspondence错误度量就是点到平面的距离了。符号的定义与EdgeFactor类似，只是确定平面需要至少三个点，因此我们在$F_ {t}$上选择三个点${j, l, m}$，那么可以得到位置关系如下图：

![LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled%203.png](LOAM%20(1)%2093d144c12831469488b26c5c0585a58a/Untitled%203.png)

根据几何关系可以求得点到平面的距离为：

$$
d_ {\mathcal{H}}=\frac{\left|\begin{array}{c}\left(\mathbf X_i-\mathbf X_j\right) \left(\left(\mathbf X_j-\mathbf X_l\right) \times\left(\mathbf X_j-\mathbf X_m\right)\right)\end{array}\right|}{\left|\left(\mathbf X_j-\mathbf X_l\right) \times\left(\mathbf X_j-\mathbf X_m\right)\right|}
$$

简单的理解就是，分子在求体积，分母在求面积，整个分数就是高。因此，我们也就知道了PlaneFactor的误差。

接下来查看代码就十分清晰了。在`LidarEdgeFactor`中，current_point, last_point_a, last_point_b对应的实际上是我们推导中的$i, j, l$，而这里有一个s值，用到s值的地方是slerp函数，也就是一个球面线性差值函数，实际上就是用来计算扰动的。

在operator()函数中，前两个参数是input参数，分别是四元数（表旋转）以及一个相连，表示平移，也就是$F_ {t+1}$对应的相对位姿，最后计算得到的残差放到residual中（也就是最后一个输出参数）。

```cpp
struct LidarEdgeFactor
{
	LidarEdgeFactor(Eigen::Vector3d curr_point_, Eigen::Vector3d last_point_a_,
					Eigen::Vector3d last_point_b_, double s_)
		: curr_point(curr_point_), last_point_a(last_point_a_), last_point_b(last_point_b_), s(s_) {}

	template <typename T>
	bool operator()(const T *q, const T *t, T *residual) const
	{

		Eigen::Matrix<T, 3, 1> cp{T(curr_point.x()), T(curr_point.y()), T(curr_point.z())};
		Eigen::Matrix<T, 3, 1> lpa{T(last_point_a.x()), T(last_point_a.y()), T(last_point_a.z())};
		Eigen::Matrix<T, 3, 1> lpb{T(last_point_b.x()), T(last_point_b.y()), T(last_point_b.z())};

		//Eigen::Quaternion<T> q_last_curr{q[3], T(s) * q[0], T(s) * q[1], T(s) * q[2]};
		Eigen::Quaternion<T> q_last_curr{q[3], q[0], q[1], q[2]};
		Eigen::Quaternion<T> q_identity{T(1), T(0), T(0), T(0)};
		q_last_curr = q_identity.slerp(T(s), q_last_curr);
		Eigen::Matrix<T, 3, 1> t_last_curr{T(s) * t[0], T(s) * t[1], T(s) * t[2]};

		Eigen::Matrix<T, 3, 1> lp;
		lp = q_last_curr * cp + t_last_curr;

		Eigen::Matrix<T, 3, 1> nu = (lp - lpa).cross(lp - lpb);
		Eigen::Matrix<T, 3, 1> de = lpa - lpb;

		residual[0] = nu.x() / de.norm();
		residual[1] = nu.y() / de.norm();
		residual[2] = nu.z() / de.norm();

		return true;
	}

	static ceres::CostFunction *Create(const Eigen::Vector3d curr_point_, const Eigen::Vector3d last_point_a_,
									   const Eigen::Vector3d last_point_b_, const double s_)
	{
		return (new ceres::AutoDiffCostFunction<
				LidarEdgeFactor, 3, 4, 3>(
			new LidarEdgeFactor(curr_point_, last_point_a_, last_point_b_, s_)));
	}

	Eigen::Vector3d curr_point, last_point_a, last_point_b;
	double s;
};
```

---

了解了EdgeFactor，对于PlaneFactor也是一样的道理。

```cpp
struct LidarPlaneFactor
{
	LidarPlaneFactor(Eigen::Vector3d curr_point_, Eigen::Vector3d last_point_j_,
					 Eigen::Vector3d last_point_l_, Eigen::Vector3d last_point_m_, double s_)
		: curr_point(curr_point_), last_point_j(last_point_j_), last_point_l(last_point_l_),
		  last_point_m(last_point_m_), s(s_)
	{
		ljm_norm = (last_point_j - last_point_l).cross(last_point_j - last_point_m);
		ljm_norm.normalize();
	}

	template <typename T>
	bool operator()(const T *q, const T *t, T *residual) const
	{

		Eigen::Matrix<T, 3, 1> cp{T(curr_point.x()), T(curr_point.y()), T(curr_point.z())};
		Eigen::Matrix<T, 3, 1> lpj{T(last_point_j.x()), T(last_point_j.y()), T(last_point_j.z())};
		//Eigen::Matrix<T, 3, 1> lpl{T(last_point_l.x()), T(last_point_l.y()), T(last_point_l.z())};
		//Eigen::Matrix<T, 3, 1> lpm{T(last_point_m.x()), T(last_point_m.y()), T(last_point_m.z())};
		Eigen::Matrix<T, 3, 1> ljm{T(ljm_norm.x()), T(ljm_norm.y()), T(ljm_norm.z())};

		//Eigen::Quaternion<T> q_last_curr{q[3], T(s) * q[0], T(s) * q[1], T(s) * q[2]};
		Eigen::Quaternion<T> q_last_curr{q[3], q[0], q[1], q[2]};
		Eigen::Quaternion<T> q_identity{T(1), T(0), T(0), T(0)};
		q_last_curr = q_identity.slerp(T(s), q_last_curr);
		Eigen::Matrix<T, 3, 1> t_last_curr{T(s) * t[0], T(s) * t[1], T(s) * t[2]};

		Eigen::Matrix<T, 3, 1> lp;
		lp = q_last_curr * cp + t_last_curr;

		residual[0] = (lp - lpj).dot(ljm);

		return true;
	}

	static ceres::CostFunction *Create(const Eigen::Vector3d curr_point_, const Eigen::Vector3d last_point_j_,
									   const Eigen::Vector3d last_point_l_, const Eigen::Vector3d last_point_m_,
									   const double s_)
	{
		return (new ceres::AutoDiffCostFunction<
				LidarPlaneFactor, 1, 4, 3>(
			new LidarPlaneFactor(curr_point_, last_point_j_, last_point_l_, last_point_m_, s_)));
	}

	Eigen::Vector3d curr_point, last_point_j, last_point_l, last_point_m;
	Eigen::Vector3d ljm_norm;
	double s;
};
```

---

除了上述的Factors外，A-LOAM还包含了其他两种Factor，这些Factor中不再包含去除扰动的s值。第一个是点到点的残差：

```cpp
struct LidarDistanceFactor
{

	LidarDistanceFactor(Eigen::Vector3d curr_point_, Eigen::Vector3d closed_point_) 
						: curr_point(curr_point_), closed_point(closed_point_){}

	template <typename T>
	bool operator()(const T *q, const T *t, T *residual) const
	{
		Eigen::Quaternion<T> q_w_curr{q[3], q[0], q[1], q[2]};
		Eigen::Matrix<T, 3, 1> t_w_curr{t[0], t[1], t[2]};
		Eigen::Matrix<T, 3, 1> cp{T(curr_point.x()), T(curr_point.y()), T(curr_point.z())};
		Eigen::Matrix<T, 3, 1> point_w;
		point_w = q_w_curr * cp + t_w_curr;

		residual[0] = point_w.x() - T(closed_point.x());
		residual[1] = point_w.y() - T(closed_point.y());
		residual[2] = point_w.z() - T(closed_point.z());
		return true;
	}

	static ceres::CostFunction *Create(const Eigen::Vector3d curr_point_, const Eigen::Vector3d closed_point_)
	{
		return (new ceres::AutoDiffCostFunction<
				LidarDistanceFactor, 3, 4, 3>(
			new LidarDistanceFactor(curr_point_, closed_point_)));
	}

	Eigen::Vector3d curr_point;
	Eigen::Vector3d closed_point;
};
```

---

另外依然是点到平面，只不过这时候平面是一般的方程形式：$nx +d = 0$：

```cpp
struct LidarPlaneNormFactor
{

	LidarPlaneNormFactor(Eigen::Vector3d curr_point_, Eigen::Vector3d plane_unit_norm_,
						 double negative_OA_dot_norm_) : curr_point(curr_point_), plane_unit_norm(plane_unit_norm_),
														 negative_OA_dot_norm(negative_OA_dot_norm_) {}

	template <typename T>
	bool operator()(const T *q, const T *t, T *residual) const
	{
		Eigen::Quaternion<T> q_w_curr{q[3], q[0], q[1], q[2]};
		Eigen::Matrix<T, 3, 1> t_w_curr{t[0], t[1], t[2]};
		Eigen::Matrix<T, 3, 1> cp{T(curr_point.x()), T(curr_point.y()), T(curr_point.z())};
		Eigen::Matrix<T, 3, 1> point_w;
		point_w = q_w_curr * cp + t_w_curr;

		Eigen::Matrix<T, 3, 1> norm(T(plane_unit_norm.x()), T(plane_unit_norm.y()), T(plane_unit_norm.z()));
		residual[0] = norm.dot(point_w) + T(negative_OA_dot_norm);
		return true;
	}

	static ceres::CostFunction *Create(const Eigen::Vector3d curr_point_, const Eigen::Vector3d plane_unit_norm_,
									   const double negative_OA_dot_norm_)
	{
		return (new ceres::AutoDiffCostFunction<
				LidarPlaneNormFactor, 1, 4, 3>(
			new LidarPlaneNormFactor(curr_point_, plane_unit_norm_, negative_OA_dot_norm_)));
	}

	Eigen::Vector3d curr_point;
	Eigen::Vector3d plane_unit_norm;
	double negative_OA_dot_norm;
};
```