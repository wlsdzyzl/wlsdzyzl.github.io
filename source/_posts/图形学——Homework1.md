---
title: 图形学——Homework1
date: 2018-10-26 23:58:25
tags: [computer graphics,homework]
categories: 图形学
mathjax: true
---
完成第一个作业（实际上是第二个）。这个作业还是比较费劲的，一个原因是对OpenGL十分不熟悉。
<!--more-->

首先，openGL中，Z轴指向屏幕外，Y轴指向上侧，X轴指向右侧。这是一个需要注意的地方。

其次，openGL中3D的呈现，实际上是模拟一个相机再看这个物品。在作业中，可以知道的是茶壶放在世界坐标的原点，而刚开始的视点是(0,0,5).

作业要完成左右旋转，而实际上就是视点相对于视点相对于世界坐标要转动。在这里，我规定的转动方向是向左的话，看到茶壶的左侧，也就是视点向左侧转动，而不是让茶壶向左侧转动（那样的话我们能看到的实际上变成了右侧）。其他方向也是一样的道理。

为了让视点的坐标转动，首先要完成rotate函数的定义，这个函数直接使用Rodrigues公式就可以求得旋转矩阵。代码如下：
```cpp
mat3 Transform::rotate(const float degrees, const vec3& axis) {
  // YOUR CODE FOR HW1 HERE
  // You will change this return call
	vec3 _axis = glm::normalize(axis);
	float theta = degrees/360* pi;
	mat3 a_ta = mat3(_axis.x*_axis.x, _axis.x*_axis.y, _axis.x*_axis.z, _axis.y*_axis.x, _axis.y*_axis.y, _axis.y*_axis.z, _axis.z*_axis.x, _axis.z*_axis.y, _axis.z*_axis.z);
	mat3 I = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
	mat3 Astar = mat3(0, -_axis.z, _axis.y, _axis.z, 0, -_axis.x, -_axis.y, _axis.x, 0);
	return a_ta + (I - a_ta)*cos(theta) + Astar * sin(theta);
}
```
很尴尬的是我不知道OpenGL中有什么简洁的办法计算$\mathbf{a}\mathbf{a}^T$，因此用手把它敲出来了。

第二个就是定义向左的函数。OpenGL中，除了视点坐标以外还有一个up向量，表示视点坐标向上的方向，也就是我们头发所指的方向。因为我们需要用两个向量来确定视点坐标系（这个后面再说）。所以我们在移动视点的时候也要移动up向量。

左右转的时候，很容易，我们不需要改变up向量，因为我们就是绕着up向量转的。所以这个很简单就可以写出来（需要注意的是转动角度的方向和转动轴向量也是符合右手定则的，这是之前推公式的结果。向左转的话，$\theta$应该取负，然而代码中**我并没有取负，依然得到想要的结果**）。

```cpp
void Transform::left(float degrees, vec3& eye, vec3& up) {
  // YOUR CODE FOR HW1 HERE	
	mat3 r = rotate(degrees,up);
	eye = r * eye;
	
}
```

而上下转的时候就需要注意了，我们绕的轴就变了，实际上上下转的时候我们绕的轴是up向量与视点向量叉乘的结果，而up向量转动后也要作相应的转变。还记得up向量与eye始终垂直，那么可以看作是它的法向量。因此，法向转换就用到了:$(M^{-1})^T$.

```cpp
void Transform::up(float degrees, vec3& eye, vec3& up) {
  // YOUR CODE FOR HW1 HERE 
	mat3 r = rotate(degrees, -glm::cross(eye, up));
	up = glm::transpose(glm::inverse(r))*up;//up vector is not easy to compute
	eye = r * eye;
}
```

最后一个就是lookAt函数。要想写出来lookAt函数，首先要知道lookAt在做什么。lookAt函数是做的事情，是把茶壶投影到视点坐标当中。如果lookAt返回的是0向量，那么我们看到的茶壶的内部。

这就要求我们要建立一个坐标系出来了。之前讲过建坐标的方法，但是u,v,w只要符合右手定则就好，其他的不做要求。但是OpenGL中，z轴是朝着平面外的，因此我们就必须规定视点的向量就是z轴的方向，对应着w。接着用叉乘（up与eye向量）做出u轴，朝右的向量，最后求得v轴即可。这就建立了视点坐标。

建立视点坐标后又如何得到原来的点在该坐标系下的坐标呢？我们可以看出来这需要两步：旋转和平移。旋转和平移是不可逆的，因此我们首先要注意顺序。这个问题有点棘手。在lookAt函数中，我们需要做的是先平移再旋转（为毛我觉得是先旋转后平移？可能我对OpenGL又有什么误解。如果是移动坐标系的话是先平移后旋转的）。

（好吧，经过实际计算了之后我明白了。其实想象移动点的话是比较抽象的，但是点的移动实际上就是坐标系的相对运动。因此lookAt函数可以看作将世界坐标系移动到相机坐标系。而这个时候的移动比较容易理解的是先平移后旋转，因为如果先旋转了，平移时候加上相机坐标得到的并不是原相机的位置，因为坐标轴方向变了。而对应到点，一样也是先平移后旋转的。

至于为什么gluLookAt需要物体的中心坐标，我是因为物体本身也有一个自己的局部坐标系，需要用中心坐标（世界坐标），才能通过将局部坐标进行一个偏移，得到世界坐标后，继续上面的平移旋转操作，本题中中心坐标为(0,0,0)，所以没有便宜，局部坐标就是世界坐标）

如果理解了之前的旋转矩阵，我们就知道旋转矩阵实际上就是坐标系的三个单位向量，而旋转后的结果就是该点在该坐标系的坐标值，因此很容易得到：
$r = \begin{bmatrix}
\mathbf{u}\\
\mathbf{v}\\
\mathbf{w}
\end{bmatrix}$.

而平移的量实际上就是当前$eye$取负。这个也很好理解。然后得到了平移旋转矩阵：
$\begin{bmatrix}
R_ {3 \times 3}& R_ {3 \times 3}\mathbf{eye}_ {3 \times 1}\\
0_ {1\times 3}&1
\end{bmatrix}$

这就得到了最后的lookAt函数。
```cpp
mat4 Transform::lookAt(vec3 eye, vec3 up) {
  // YOUR CODE FOR HW1 HERE
	vec3 w = glm::normalize(eye);
	vec3 u = glm::normalize(glm::cross(up, eye)) ;
	vec3 v = glm::normalize(glm::cross(w, u));
	mat3 r = mat3(u,v,w );
	vec3 t = vec3(-glm::dot(u,eye), -glm::dot(v,eye), -glm::dot(w,eye));
	cout << t.x << t.y << t.z << endl;
	mat4 result = mat4(r[0][0], r[0][1], r[0][2], t.x, r[1][0], r[1][1], r[1][2], t.y, r[2][0], r[2][1], r[2][2], t.z, 0, 0, 0, 1);
	return glm::transpose(result);
  // You will change this return call
}
```

我一直不明白为什么最后要加一个transpose.

现在我知道了OpenGL（glm）中矩阵构造时候是列优先的，如m[0][1],指的是第0列第1行。所以我构造出来的所有矩阵都应该加个转置，这也解释了为什么上面代码degree没有取负依然得到了正确的结果。正确代码如下：
```cpp
mat3 Transform::rotate(const float degrees, const vec3& axis) {
  // YOUR CODE FOR HW1 HERE
  // You will change this return call
	vec3 _axis = glm::normalize(axis);
	float theta = degrees/180* pi;
	mat3 a_ta = mat3(_axis.x*_axis.x, _axis.x*_axis.y, _axis.x*_axis.z, _axis.y*_axis.x, _axis.y*_axis.y, _axis.y*_axis.z, _axis.z*_axis.x, _axis.z*_axis.y, _axis.z*_axis.z);
	mat3 I = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
	mat3 Astar = mat3(0, -_axis.z, _axis.y, _axis.z, 0, -_axis.x, -_axis.y, _axis.x, 0);
	return glm::transpose(a_ta + (I - a_ta)*cos(theta) + Astar * sin(theta));
}

// Transforms the camera left around the "crystal ball" interface
void Transform::left(float degrees, vec3& eye, vec3& up) {
  // YOUR CODE FOR HW1 HERE

	mat3 r = rotate(-degrees,up);

	eye = r * eye;
	cout << eye.x << eye.y << eye.z << endl;
	
}

// Transforms the camera up around the "crystal ball" interface
void Transform::up(float degrees, vec3& eye, vec3& up) {
  // YOUR CODE FOR HW1 HERE 
	mat3 r = rotate(-degrees, -glm::cross(eye, up));
	up = glm::transpose(glm::inverse(r))*up;//up vector is not easy to compute
	eye = r * eye;
}

// Your implementation of the glm::lookAt matrix
mat4 Transform::lookAt(vec3 eye, vec3 up) {
  // YOUR CODE FOR HW1 HERE
	vec3 w = glm::normalize(eye);
	vec3 u = glm::normalize(glm::cross(up, eye)) ;
	vec3 v = glm::normalize(glm::cross(w, u));
	mat3 r = mat3(u,v,w );
	vec3 t = vec3(-glm::dot(u,eye), -glm::dot(v,eye), -glm::dot(w,eye));//-r * eye;
	mat4 result = mat4(r[0][0], r[0][1], r[0][2], t.x, r[1][0], r[1][1], r[1][2], t.y, r[2][0], r[2][1], r[2][2], t.z, 0, 0, 0, 1);
	return glm::transpose(result);
  // You will change this return call
}
```

最后结果：
![](https://evolution-video.oss-cn-beijing.aliyuncs.com/images/IMG_0296.GIF)