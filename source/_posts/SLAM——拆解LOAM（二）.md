---
title: SLAM——拆解LOAM（二）
mathjax: true
date: 2021-03-31 06:17:13
tags: [SLAM]
categories: [SLAM]
---
本文为拆解LOAM代码的第二部分。<!--more-->

## LaserOdometry

接下来到了重头戏，也就是计算Odometry的部分，位于文件`LaserOdometry.cpp`中。这一部分是相对复杂的，有600多行代码。我们继续按照执行的顺序来分析。首先查看Odometry订阅的以及发布的消息：

```cpp
		ros::Subscriber subCornerPointsSharp = nh.subscribe<sensor_msgs::PointCloud2>("/laser_cloud_sharp", 100, laserCloudSharpHandler);

    ros::Subscriber subCornerPointsLessSharp = nh.subscribe<sensor_msgs::PointCloud2>("/laser_cloud_less_sharp", 100, laserCloudLessSharpHandler);

    ros::Subscriber subSurfPointsFlat = nh.subscribe<sensor_msgs::PointCloud2>("/laser_cloud_flat", 100, laserCloudFlatHandler);

    ros::Subscriber subSurfPointsLessFlat = nh.subscribe<sensor_msgs::PointCloud2>("/laser_cloud_less_flat", 100, laserCloudLessFlatHandler);

    ros::Subscriber subLaserCloudFullRes = nh.subscribe<sensor_msgs::PointCloud2>("/velodyne_cloud_2", 100, laserCloudFullResHandler);

    ros::Publisher pubLaserCloudCornerLast = nh.advertise<sensor_msgs::PointCloud2>("/laser_cloud_corner_last", 100);

    ros::Publisher pubLaserCloudSurfLast = nh.advertise<sensor_msgs::PointCloud2>("/laser_cloud_surf_last", 100);

    ros::Publisher pubLaserCloudFullRes = nh.advertise<sensor_msgs::PointCloud2>("/velodyne_cloud_3", 100);

    ros::Publisher pubLaserOdometry = nh.advertise<nav_msgs::Odometry>("/laser_odom_to_init", 100);

    ros::Publisher pubLaserPath = nh.advertise<nav_msgs::Path>("/laser_odom_path", 100);
```

从代码中可以看到，Odometry订阅的消息为`/laser_cloud_sharp`, `/laser_cloud_less_sharp`, `/laser_cloud_flat`, `/laser_cloud_less_flat`, `/velodyne_cloud_2`

这些消息也就是`scanRegistration.cpp`中发布出去的内容。而这些订阅函数的callback函数很简单：

```cpp
void laserCloudSharpHandler(const sensor_msgs::PointCloud2ConstPtr &cornerPointsSharp2)
{
    mBuf.lock();
    cornerSharpBuf.push(cornerPointsSharp2);
    mBuf.unlock();
}

void laserCloudLessSharpHandler(const sensor_msgs::PointCloud2ConstPtr &cornerPointsLessSharp2)
{
    mBuf.lock();
    cornerLessSharpBuf.push(cornerPointsLessSharp2);
    mBuf.unlock();
}

void laserCloudFlatHandler(const sensor_msgs::PointCloud2ConstPtr &surfPointsFlat2)
{
    mBuf.lock();
    surfFlatBuf.push(surfPointsFlat2);
    mBuf.unlock();
}

void laserCloudLessFlatHandler(const sensor_msgs::PointCloud2ConstPtr &surfPointsLessFlat2)
{
    mBuf.lock();
    surfLessFlatBuf.push(surfPointsLessFlat2);
    mBuf.unlock();
}

//receive all point cloud
void laserCloudFullResHandler(const sensor_msgs::PointCloud2ConstPtr &laserCloudFullRes2)
{
    mBuf.lock();
    fullPointsBuf.push(laserCloudFullRes2);
    mBuf.unlock();
}
```

之是把消息push到一个队列中，因此可以看到主要的逻辑并不是在callback函数中实现的，而是在main函数中实现。写成这样的好处就是提供了一个buffer，即使Odometry处理得不够及时，也能处理完所有的帧，而不是丢掉来不及处理的帧。

此外，还有两个函数需要我们注意：

```cpp
// undistort lidar point
void TransformToStart(PointType const *const pi, PointType *const po)
{
    //interpolation ratio
    double s;
    if (DISTORTION)
        s = (pi->intensity - int(pi->intensity)) / SCAN_PERIOD;
    else
        s = 1.0;
    //s = 1;
    Eigen::Quaterniond q_point_last = Eigen::Quaterniond::Identity().slerp(s, q_last_curr);
    Eigen::Vector3d t_point_last = s * t_last_curr;
    Eigen::Vector3d point(pi->x, pi->y, pi->z);
    Eigen::Vector3d un_point = q_point_last * point + t_point_last;

    po->x = un_point.x();
    po->y = un_point.y();
    po->z = un_point.z();
    po->intensity = pi->intensity;
}

// transform all lidar points to the start of the next frame

void TransformToEnd(PointType const *const pi, PointType *const po)
{
    // undistort point first
    pcl::PointXYZI un_point_tmp;
    TransformToStart(pi, &un_point_tmp);

    Eigen::Vector3d un_point(un_point_tmp.x, un_point_tmp.y, un_point_tmp.z);
    Eigen::Vector3d point_end = q_last_curr.inverse() * (un_point - t_last_curr);

    po->x = point_end.x();
    po->y = point_end.y();
    po->z = point_end.z();

    //Remove distortion time info
    po->intensity = int(pi->intensity);
}
```

这两个函数用于生成undistorted point。`TransformToStart`将当前点投到当前帧的初始时间，而`TransformToEnd`将当前点投到下一帧的初始时间。这里有一个问题就是，投影到不同的时间是假设在雷达旋转时，车辆的运动是匀速的，但是我们依然需要知道车辆的一个运动状态，那么这个初始估计的位姿是如何得到的？在函数中，我们可以看到的是使用了idendity到q_last_curr以及t_last_curr的插值，这个q_last_curr很明显是current到last的一个初始估计（q_last_curr是从current→last，那么endOri的s对应1才合理），这个值在一开始进行了一个设定，因此可以看到，初始估计就是没有运动（identity，在不知道运动的情况下，其实也算是一个比较好的估计）：

```cpp
double para_q[4] = {0, 0, 0, 1};
double para_t[3] = {0, 0, 0};
Eigen::Map<Eigen::Quaterniond> q_last_curr(para_q);
Eigen::Map<Eigen::Vector3d> t_last_curr(para_t);
```

在之后的代码可以看到，`q_last_curr`与`t_last_curr`会被更新，也就是初始的估计是由上一次的odometry的运动估计决定的。

接下来我们分析main函数中的处理逻辑。首先是拿到队列首部，并且将其弹出，这部分就不说了。我们重点看优化部分的内容，也就是下面循环中的内容（可以看到求解Odometry只迭代两次）：

```cpp
for (size_t opti_counter = 0; opti_counter < 2; ++opti_counter)
{
	/**/
}
```

---

首先，查看一些变量的设定：

```cpp
										corner_correspondence = 0;
                    plane_correspondence = 0;

                    //ceres::LossFunction *loss_function = NULL;
                    ceres::LossFunction *loss_function = new ceres::HuberLoss(0.1);
                    ceres::LocalParameterization *q_parameterization =
                        new ceres::EigenQuaternionParameterization();
                    ceres::Problem::Options problem_options;

                    ceres::Problem problem(problem_options);
                    problem.AddParameterBlock(para_q, 4, q_parameterization);
                    problem.AddParameterBlock(para_t, 3);
										// temp variables, for to store undistorted points
										pcl::PointXYZI pointSel;
										// kdtree index and dists
                    std::vector<int> pointSearchInd;
                    std::vector<float> pointSearchSqDis;
```

这里优化使用的是`ceres`库。这里的使用的HuberLoss，可以抑制错误的匹配点对最后结果的影响。接着，优化分成了两部分，分别考虑的是edge points的约束以及plane points的约束。

- Edge Points
    
    ```cpp
    for (int i = 0; i < cornerPointsSharpNum; ++i)
    {
        TransformToStart(&(cornerPointsSharp->points[i]), &pointSel);
        kdtreeCornerLast->nearestKSearch(pointSel, 1, pointSearchInd, pointSearchSqDis);
    
        int closestPointInd = -1, minPointInd2 = -1;
        if (pointSearchSqDis[0] < DISTANCE_SQ_THRESHOLD)
        {
            closestPointInd = pointSearchInd[0];
            int closestPointScanID = int(laserCloudCornerLast->points[closestPointInd].intensity);
    
            double minPointSqDis2 = DISTANCE_SQ_THRESHOLD;
            // search in the direction of increasing scan line
            for (int j = closestPointInd + 1; j < (int)laserCloudCornerLast->points.size(); ++j)
            {
                // if in the same scan line, continue
                if (int(laserCloudCornerLast->points[j].intensity) <= closestPointScanID)
                    continue;
    
                // if not in nearby scans, end the loop
                if (int(laserCloudCornerLast->points[j].intensity) > (closestPointScanID + NEARBY_SCAN))
                    break;
    
                double pointSqDis = (laserCloudCornerLast->points[j].x - pointSel.x) *
                                        (laserCloudCornerLast->points[j].x - pointSel.x) +
                                    (laserCloudCornerLast->points[j].y - pointSel.y) *
                                        (laserCloudCornerLast->points[j].y - pointSel.y) +
                                    (laserCloudCornerLast->points[j].z - pointSel.z) *
                                        (laserCloudCornerLast->points[j].z - pointSel.z);
    
                if (pointSqDis < minPointSqDis2)
                {
                    // find nearer point
                    minPointSqDis2 = pointSqDis;
                    minPointInd2 = j;
                }
            }
    
            // search in the direction of decreasing scan line
            for (int j = closestPointInd - 1; j >= 0; --j)
            {
                // if in the same scan line, continue
                if (int(laserCloudCornerLast->points[j].intensity) >= closestPointScanID)
                    continue;
    
                // if not in nearby scans, end the loop
                if (int(laserCloudCornerLast->points[j].intensity) < (closestPointScanID - NEARBY_SCAN))
                    break;
    
                double pointSqDis = (laserCloudCornerLast->points[j].x - pointSel.x) *
                                        (laserCloudCornerLast->points[j].x - pointSel.x) +
                                    (laserCloudCornerLast->points[j].y - pointSel.y) *
                                        (laserCloudCornerLast->points[j].y - pointSel.y) +
                                    (laserCloudCornerLast->points[j].z - pointSel.z) *
                                        (laserCloudCornerLast->points[j].z - pointSel.z);
    
                if (pointSqDis < minPointSqDis2)
                {
                    // find nearer point
                    minPointSqDis2 = pointSqDis;
                    minPointInd2 = j;
                }
            }
        }
        if (minPointInd2 >= 0) // both closestPointInd and minPointInd2 is valid
        {
            Eigen::Vector3d curr_point(cornerPointsSharp->points[i].x,
                                       cornerPointsSharp->points[i].y,
                                       cornerPointsSharp->points[i].z);
            Eigen::Vector3d last_point_a(laserCloudCornerLast->points[closestPointInd].x,
                                         laserCloudCornerLast->points[closestPointInd].y,
                                         laserCloudCornerLast->points[closestPointInd].z);
            Eigen::Vector3d last_point_b(laserCloudCornerLast->points[minPointInd2].x,
                                         laserCloudCornerLast->points[minPointInd2].y,
                                         laserCloudCornerLast->points[minPointInd2].z);
    
            double s;
            if (DISTORTION)
                s = (cornerPointsSharp->points[i].intensity - int(cornerPointsSharp->points[i].intensity)) / SCAN_PERIOD;
            else
                s = 1.0;
            ceres::CostFunction *cost_function = LidarEdgeFactor::Create(curr_point, last_point_a, last_point_b, s);
            problem.AddResidualBlock(cost_function, loss_function, para_q, para_t);
            corner_correspondence++;
        }
    }
    ```
    
    Edge Point的一大段代码，实际上在做的东西已经被我们分析得很清楚了：
    
    - 首先根据当前的关键点$i$，在上一帧的edge points中利用KDTree找到一个最近点$j$，那么根据假设，他们是位于同一条线上的。
    - 接着我们还需要在上一帧中找到另外一个点$l$，和$j$位于同一条直线上。从代码中可以看到，做法是遍历相邻scan的关键点，并且找到距离最近的点。在论文中也提到了，在寻找$l$的时候，要排除同一个scan中的点，这是因为一般的Edge通过每个scan只能扫到一个点，除非这个Edge与扫描平面平行，这种情况被称为degenerated edge，在系统中不会作处理。
    - 找到line correspondence之后，会利用LidarFactor中的类建立得到cost function，最后会将这一部分也放到优化块中，而这里的`para_q, para_t`就是初始位姿估计。
- Plane Points
    
    ```cpp
    			for (int i = 0; i < surfPointsFlatNum; ++i)
        {
            TransformToStart(&(surfPointsFlat->points[i]), &pointSel);
            kdtreeSurfLast->nearestKSearch(pointSel, 1, pointSearchInd, pointSearchSqDis);
    
            int closestPointInd = -1, minPointInd2 = -1, minPointInd3 = -1;
            if (pointSearchSqDis[0] < DISTANCE_SQ_THRESHOLD)
            {
                closestPointInd = pointSearchInd[0];
    
                // get closest point's scan ID
                int closestPointScanID = int(laserCloudSurfLast->points[closestPointInd].intensity);
                double minPointSqDis2 = DISTANCE_SQ_THRESHOLD, minPointSqDis3 = DISTANCE_SQ_THRESHOLD;
    
                // search in the direction of increasing scan line
                for (int j = closestPointInd + 1; j < (int)laserCloudSurfLast->points.size(); ++j)
                {
                    // if not in nearby scans, end the loop
                    if (int(laserCloudSurfLast->points[j].intensity) > (closestPointScanID + NEARBY_SCAN))
                        break;
    
                    double pointSqDis = (laserCloudSurfLast->points[j].x - pointSel.x) *
                                            (laserCloudSurfLast->points[j].x - pointSel.x) +
                                        (laserCloudSurfLast->points[j].y - pointSel.y) *
                                            (laserCloudSurfLast->points[j].y - pointSel.y) +
                                        (laserCloudSurfLast->points[j].z - pointSel.z) *
                                            (laserCloudSurfLast->points[j].z - pointSel.z);
    
                    // if in the same or lower scan line
                    if (int(laserCloudSurfLast->points[j].intensity) <= closestPointScanID && pointSqDis < minPointSqDis2)
                    {
                        minPointSqDis2 = pointSqDis;
                        minPointInd2 = j;
                    }
                    // if in the higher scan line
                    else if (int(laserCloudSurfLast->points[j].intensity) > closestPointScanID && pointSqDis < minPointSqDis3)
                    {
                        minPointSqDis3 = pointSqDis;
                        minPointInd3 = j;
                    }
                }
    
                // search in the direction of decreasing scan line
                for (int j = closestPointInd - 1; j >= 0; --j)
                {
                    // if not in nearby scans, end the loop
                    if (int(laserCloudSurfLast->points[j].intensity) < (closestPointScanID - NEARBY_SCAN))
                        break;
    
                    double pointSqDis = (laserCloudSurfLast->points[j].x - pointSel.x) *
                                            (laserCloudSurfLast->points[j].x - pointSel.x) +
                                        (laserCloudSurfLast->points[j].y - pointSel.y) *
                                            (laserCloudSurfLast->points[j].y - pointSel.y) +
                                        (laserCloudSurfLast->points[j].z - pointSel.z) *
                                            (laserCloudSurfLast->points[j].z - pointSel.z);
    
                    // if in the same or higher scan line
                    if (int(laserCloudSurfLast->points[j].intensity) >= closestPointScanID && pointSqDis < minPointSqDis2)
                    {
                        minPointSqDis2 = pointSqDis;
                        minPointInd2 = j;
                    }
                    else if (int(laserCloudSurfLast->points[j].intensity) < closestPointScanID && pointSqDis < minPointSqDis3)
                    {
                        // find nearer point
                        minPointSqDis3 = pointSqDis;
                        minPointInd3 = j;
                    }
                }
    
                if (minPointInd2 >= 0 && minPointInd3 >= 0)
                {
    
                    Eigen::Vector3d curr_point(surfPointsFlat->points[i].x,
                                                surfPointsFlat->points[i].y,
                                                surfPointsFlat->points[i].z);
                    Eigen::Vector3d last_point_a(laserCloudSurfLast->points[closestPointInd].x,
                                                    laserCloudSurfLast->points[closestPointInd].y,
                                                    laserCloudSurfLast->points[closestPointInd].z);
                    Eigen::Vector3d last_point_b(laserCloudSurfLast->points[minPointInd2].x,
                                                    laserCloudSurfLast->points[minPointInd2].y,
                                                    laserCloudSurfLast->points[minPointInd2].z);
                    Eigen::Vector3d last_point_c(laserCloudSurfLast->points[minPointInd3].x,
                                                    laserCloudSurfLast->points[minPointInd3].y,
                                                    laserCloudSurfLast->points[minPointInd3].z);
    
                    double s;
                    if (DISTORTION)
                        s = (surfPointsFlat->points[i].intensity - int(surfPointsFlat->points[i].intensity)) / SCAN_PERIOD;
                    else
                        s = 1.0;
                    ceres::CostFunction *cost_function = LidarPlaneFactor::Create(curr_point, last_point_a, last_point_b, last_point_c, s);
                      problem.AddResidualBlock(cost_function, loss_function, para_q, para_t);
                      plane_correspondence++;
                  }
              }
          }
    ```
    
    Plane Points的分析与Edge Point很类似，上述代码在做的是
    
    - 首先根据当前的关键点$i$，在上一帧的plane points中利用KDTree找到一个最近点$j$，那么根据假设，他们是位于同一个平面上的。
    - 接着我们还需要在上一帧中找到另外两个点$l, m$，和$j$位于同一个平面上。从代码中可以看到，做法是遍历相邻scan的关键点，并且找到距离最近的点。与edge不同的是，这个时候我们不排除同一个scan中的点。两个点分别选在scan id大于该点scan id的scan中，以及小于等于该点scan id的scans中，$l,m$分别对应的是`minPointInd2`与`minPointInd3`。
    - 找到plane correspondence之后，会利用LidarFactor中的类建立得到cost function，最后会将这一部分也放到优化块中，而这里的`para_q, para_t`是初始位姿估计。

之后的代码就是一些其他的处理。

求解：

```cpp
TicToc t_solver;
ceres::Solver::Options options;
options.linear_solver_type = ceres::DENSE_QR;
options.max_num_iterations = 4;
options.minimizer_progress_to_stdout = false;
ceres::Solver::Summary summary;
ceres::Solve(options, &problem, &summary);
printf("solver time %f ms \n", t_solver.toc());
```

两次迭代后，更新位姿（`para_q`以及`para_t` 发生了变化，因此对应的`q_last_curr`与`t_last_curr`也就发生了变化，而`q_w_curr`与`t_w_curr`就是一个不断根据odometry累计的位姿，算是只靠odometry得到的位姿。这里的位姿与flashfusion中定义的是相反的）：

```cpp
t_w_curr = t_w_curr + q_w_curr * t_last_curr;
q_w_curr = q_w_curr * q_last_curr;
```

发布Odometry：

```cpp
// publish odometry
nav_msgs::Odometry laserOdometry;
laserOdometry.header.frame_id = "/camera_init";
laserOdometry.child_frame_id = "/laser_odom";
laserOdometry.header.stamp = ros::Time().fromSec(timeSurfPointsLessFlat);
laserOdometry.pose.pose.orientation.x = q_w_curr.x();
laserOdometry.pose.pose.orientation.y = q_w_curr.y();
laserOdometry.pose.pose.orientation.z = q_w_curr.z();
laserOdometry.pose.pose.orientation.w = q_w_curr.w();
laserOdometry.pose.pose.position.x = t_w_curr.x();
laserOdometry.pose.pose.position.y = t_w_curr.y();
laserOdometry.pose.pose.position.z = t_w_curr.z();
pubLaserOdometry.publish(laserOdometry);

geometry_msgs::PoseStamped laserPose;
laserPose.header = laserOdometry.header;
laserPose.pose = laserOdometry.pose.pose;
laserPath.header.stamp = laserOdometry.header.stamp;
laserPath.poses.push_back(laserPose);
laserPath.header.frame_id = "/camera_init";
pubLaserPath.publish(laserPath);
```

将当前帧变成上一帧（可以看到上一帧的Edge points变成了该帧的less sharp points）：

```cpp
pcl::PointCloud<PointType>::Ptr laserCloudTemp = cornerPointsLessSharp;
            cornerPointsLessSharp = laserCloudCornerLast;
            laserCloudCornerLast = laserCloudTemp;

            laserCloudTemp = surfPointsLessFlat;
            surfPointsLessFlat = laserCloudSurfLast;
            laserCloudSurfLast = laserCloudTemp;

            laserCloudCornerLastNum = laserCloudCornerLast->points.size();
            laserCloudSurfLastNum = laserCloudSurfLast->points.size();

            // std::cout << "the size of corner last is " << laserCloudCornerLastNum << ", and the size of surf last is " << laserCloudSurfLastNum << '\n';

            kdtreeCornerLast->setInputCloud(laserCloudCornerLast);
            kdtreeSurfLast->setInputCloud(laserCloudSurfLast);
```

并且间隔一定的数目，发布当前帧作为上一帧：

```cpp
if (frameCount % skipFrameNum == 0)
{
    frameCount = 0;
    sensor_msgs::PointCloud2 laserCloudCornerLast2;
    pcl::toROSMsg(*laserCloudCornerLast, laserCloudCornerLast2);
    laserCloudCornerLast2.header.stamp = ros::Time().fromSec(timeSurfPointsLessFlat);
    laserCloudCornerLast2.header.frame_id = "/camera";
    pubLaserCloudCornerLast.publish(laserCloudCornerLast2);

    sensor_msgs::PointCloud2 laserCloudSurfLast2;
    pcl::toROSMsg(*laserCloudSurfLast, laserCloudSurfLast2);
    laserCloudSurfLast2.header.stamp = ros::Time().fromSec(timeSurfPointsLessFlat);
    laserCloudSurfLast2.header.frame_id = "/camera";
    pubLaserCloudSurfLast.publish(laserCloudSurfLast2);

    sensor_msgs::PointCloud2 laserCloudFullRes3;
    pcl::toROSMsg(*laserCloudFullRes, laserCloudFullRes3);
    laserCloudFullRes3.header.stamp = ros::Time().fromSec(timeSurfPointsLessFlat);
    laserCloudFullRes3.header.frame_id = "/camera";
    pubLaserCloudFullRes.publish(laserCloudFullRes3);
}
```