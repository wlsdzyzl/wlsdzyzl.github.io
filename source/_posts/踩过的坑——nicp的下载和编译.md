---
title: 踩过的坑——nicp的下载和编译
date: 2019-05-09 00:00:00
tags: [nicp]
categories: 踩过的坑
mathjax: true
---    

这里的nicp是normal iterative closest point的缩写，也就是之前的ICP算法一个实现库。这个库的网站是：[nicp](http://jacoposerafin.com/nicp/)。  

<!--more-->

最近做的项目需要用到ICP算法，我看了感觉这个库的实现还不错。不过它的安装遇到了一些问题，所以也记录一下。

首先，这个库在作者运行的系统是ubuntu 16.04，因此使用别的版本的系统可能会出现问题。但是理论上是不应该出现问题的。出现了问题就再去查吧，不过这个库不是很有名，可能也查不到什么相同的问题。

步骤如下：

1.  安装依赖库：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt install git cmake libeigen3-dev libsuitesparse-dev qtdeclarative5-dev qt5-qmake libqglviewer-dev libflann-dev libopencv-dev freeglut3-dev</span><br></pre></td></tr></tbody></table>
    
2.  克隆NICP：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">git clone https://github.com/yorsh87/nicp.git</span><br></pre></td></tr></tbody></table>
    
3.  编译这个库：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line">cd nicp</span><br><span class="line">mkdir build</span><br><span class="line">cd build</span><br><span class="line">cmake ..</span><br><span class="line">make</span><br></pre></td></tr></tbody></table>
    

这个就是很普通的步骤，但是你最后可能会出现各种错误，比如未定义的引用，或者undefined reference to symbol哒哒哒之类的，这是因为在作者的cmakelists文件里，需要的opencv是2.4.8，使用3+的opencv编译可能会通过（之前的18.04版本无法编译通过，需要把2.4.8去掉才行，而且即使去掉了，找到的3.x的版本，依然make不成功。在这个项目的issue里也有说换了个系统成功了，所以尽量使用16.04系统吧），但是运行程序的时候可能会出错。可以下载两个opencv，分别是2.x和3.x，但是不能全部安装。不过，cmakelists中安装了之后只是把路径添加到环境变量了，我们也可以指定OpenCV的路径，这样它找到的就是我们想要让它找的版本。find_package想要找的是OpenCVModules.cmake，这个一般在OpenCV的build文件夹里，因此在CMakeLists.txt中find_package(OpenCV REQUIRED)前加一句：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">set</span>(OpenCV_DIR <span class="string">"PATH\OpenCV-2.x\build"</span>)</span><br></pre></td></tr></tbody></table>

就可以了。  
**经过我的测试，实际上OpenCV 3.x也是可以用的，但是要保证示例中和nicp库make时候用的OpenCV版本一致。**

1.  如果你想在别的工程中使用这个库，比较方便的是把他添加到环境变量里：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">gedit ~/.bashrc</span><br></pre></td></tr></tbody></table>
    

在文件末尾添加：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"># NICP</span><br><span class="line">export NICP_ROOT=/path/to/nicp</span><br><span class="line">export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${NICP_ROOT}/lib</span><br></pre></td></tr></tbody></table>

最后记住需要：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">source ~/.bashrc</span><br></pre></td></tr></tbody></table>

这样的话环境变量会立即生效，如果还不行就重启。

然后，如果想要使用NICP的几个例子，对于下载的源代码中的CMakeLists.txt文件，find_package(opencv)的这一块，也需要做相应的改动。然后就应该可以跑的通了。

可是比较坑的地方是，NICP的代码不支持C++11以上！编译选项加上-std=c++11，就会出现“对类内部的static成员初始化需要constexpr类型”的错误，还好这个比较容易改，将static去掉就好了。这个问题还是挺诡异的，因为讲道理模板元编程的话是可以这样做的。