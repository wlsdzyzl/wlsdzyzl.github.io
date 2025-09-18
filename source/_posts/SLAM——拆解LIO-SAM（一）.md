---
title: SLAM——拆解LIO-SAM（一）
mathjax: true
date: 2021-04-20 06:21:28
tags: [SLAM]
categories: [SLAM]
---
本文为拆解LIO-SAM代码的第一部分。<!--more-->

## Image Projection

LIO-SAM的lidar odometry部分与LeGO-LOAM是类似的。在LeGO-LOAM中，会把点云投影到range image上，进行ground提取，我们先来看一下这部分的内容。

range image的行数取决于雷达的线数，而列数取决于雷达的水平分辨率，在lio-sam中为1800。Image Projection是一个预处理的过程。下面是点云投影的代码：

```cpp
void projectPointCloud()
    {
        int cloudSize = laserCloudIn->points.size();
        // range image projection
        for (int i = 0; i < cloudSize; ++i)
        {
            PointType thisPoint;
            thisPoint.x = laserCloudIn->points[i].x;
            thisPoint.y = laserCloudIn->points[i].y;
            thisPoint.z = laserCloudIn->points[i].z;
            thisPoint.intensity = laserCloudIn->points[i].intensity;

            float range = pointDistance(thisPoint);
            if (range < lidarMinRange || range > lidarMaxRange)
                continue;

            int rowIdn = laserCloudIn->points[i].ring;
            // out of range
            if (rowIdn < 0 || rowIdn >= N_SCAN)
                continue;
            if (rowIdn % downsampleRate != 0)
                continue;
            //( -180,  180]
            float horizonAngle = atan2(thisPoint.x, thisPoint.y) * 180 / M_PI;

            static float ang_res_x = 360.0/float(Horizon_SCAN);
            // compute the column id
						// i don't understand here. (90, 360] (0, 90)
            int columnIdn = -round((horizonAngle-90.0)/ang_res_x) + Horizon_SCAN/2;
            if (columnIdn >= Horizon_SCAN)
                columnIdn -= Horizon_SCAN;
						
            if (columnIdn < 0 || columnIdn >= Horizon_SCAN)
                continue;
            // multiple points are projected on the same pixel
            if (rangeMat.at<float>(rowIdn, columnIdn) != FLT_MAX)
                continue;
            // undistorted points
            thisPoint = deskewPoint(&thisPoint, laserCloudIn->points[i].time);

            rangeMat.at<float>(rowIdn, columnIdn) = range;

            int index = columnIdn + rowIdn * Horizon_SCAN;
            fullCloud->points[index] = thisPoint;
        }
    }
```

可以看到，在投影过程中可能会出现多个点投影到一个pixel上的情况，这时候我们直接忽略后来的点。在投影过程中，还会对点云进行去扰动，也就是下面要说的内容。

### Get Undistorted Points

在之前的介绍中了解到了，由于雷达的测距原理，当雷达运动时，雷达的点是会有扰动的。在A-LOAM中，去除distortion使用的是球面线性差值（旋转）以及（平移）线性差值，假设在扫描一圈过程中雷达的运动是匀速的。但是实际上往往并非如此，有了IMU数据，我们可以使用IMU的状态来直接估计各个时刻的相机的transforamtion，从而直接进行去扰动(在计算机中)。

```cpp
PointType deskewPoint(PointType *point, double relTime)
    {
        if (deskewFlag == -1 || cloudInfo.imuAvailable == false)
            return *point;

        double pointTime = timeScanCur + relTime;

        float rotXCur, rotYCur, rotZCur;
        findRotation(pointTime, &rotXCur, &rotYCur, &rotZCur);
				// position is ignored acturally
        float posXCur, posYCur, posZCur;
        findPosition(relTime, &posXCur, &posYCur, &posZCur);

        if (firstPointFlag == true)
        {
            transStartInverse = (pcl::getTransformation(posXCur, posYCur, posZCur, rotXCur, rotYCur, rotZCur)).inverse();
            firstPointFlag = false;
        }

        // transform points to start
        Eigen::Affine3f transFinal = pcl::getTransformation(posXCur, posYCur, posZCur, rotXCur, rotYCur, rotZCur);
        Eigen::Affine3f transBt = transStartInverse * transFinal;

        PointType newPoint;
        newPoint.x = transBt(0,0) * point->x + transBt(0,1) * point->y + transBt(0,2) * point->z + transBt(0,3);
        newPoint.y = transBt(1,0) * point->x + transBt(1,1) * point->y + transBt(1,2) * point->z + transBt(1,3);
        newPoint.z = transBt(2,0) * point->x + transBt(2,1) * point->y + transBt(2,2) * point->z + transBt(2,3);
        newPoint.intensity = point->intensity;

        return newPoint;
    }
```

具体的做法是，点云中的每个点，记录的是捕获到该点的时间到捕获第一个点的时间间隔，因此根据该点的时间戳来找到IMU的状态。由于IMU的时间戳与点的时间戳不会严格一样，因此我们可能遇到两种情况：

1. 点的时间戳在两个IMU状态之间，则用这两个IMU的状态进行插值；
2. 点的时间戳是大于最新的IMU状态的时间戳，则直接用离得最近的IMU状态。

具体实现如下：

```cpp
void findRotation(double pointTime, float *rotXCur, float *rotYCur, float *rotZCur)
    {
        *rotXCur = 0; *rotYCur = 0; *rotZCur = 0;

        int imuPointerFront = 0;
        while (imuPointerFront < imuPointerCur)
        {
            if (pointTime < imuTime[imuPointerFront])
                break;
            ++imuPointerFront;
        }

        if (pointTime > imuTime[imuPointerFront] || imuPointerFront == 0)
        {
            *rotXCur = imuRotX[imuPointerFront];
            *rotYCur = imuRotY[imuPointerFront];
            *rotZCur = imuRotZ[imuPointerFront];
        } else {
            int imuPointerBack = imuPointerFront - 1;
            double ratioFront = (pointTime - imuTime[imuPointerBack]) / (imuTime[imuPointerFront] - imuTime[imuPointerBack]);
            double ratioBack = (imuTime[imuPointerFront] - pointTime) / (imuTime[imuPointerFront] - imuTime[imuPointerBack]);
            *rotXCur = imuRotX[imuPointerFront] * ratioFront + imuRotX[imuPointerBack] * ratioBack;
            *rotYCur = imuRotY[imuPointerFront] * ratioFront + imuRotY[imuPointerBack] * ratioBack;
            *rotZCur = imuRotZ[imuPointerFront] * ratioFront + imuRotZ[imuPointerBack] * ratioBack;
        }
    }
```

---

### 点云提取

接下来的操作是提取出可用的点，存储range image，并且根据所属的SCAN来进行划分。可以看到这里的startRingIndex与endRingIndex与A-LOAM中一致，都忽略了两端的部分点：

```cpp
void cloudExtraction()
    {
        int count = 0;
        // extract segmented cloud for lidar odometry
        for (int i = 0; i < N_SCAN; ++i)
        {
            cloudInfo.startRingIndex[i] = count - 1 + 5;

            for (int j = 0; j < Horizon_SCAN; ++j)
            {
                if (rangeMat.at<float>(i,j) != FLT_MAX)
                {
                    // mark the points' column index for marking occlusion later
                    cloudInfo.pointColInd[count] = j;
                    // save range info
                    cloudInfo.pointRange[count] = rangeMat.at<float>(i,j);
                    // save extracted cloud
                    extractedCloud->push_back(fullCloud->points[j + i*Horizon_SCAN]);
                    // size of extracted cloud
                    ++count;
                }
            }
            cloudInfo.endRingIndex[i] = count -1 - 5;
        }
    }
```

最后就是将整理后的点（论文中称为segmented points）发布出去了。