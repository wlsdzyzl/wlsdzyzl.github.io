---
title: 踩过的坑——ROS安装
date: 2019-05-09 00:00:00
tags: [ros]
categories: 踩过的坑
mathjax: true
---     

踩过的坑系列是一些没什么技术含量却把人折磨的要死的过程。就做个记录，可能会有很多错误，不必当真。

<!--more-->


关于ROS的安装。ROS是机器人操作系统Robot OS的缩写，ROS特别坑的地方在于对于不同的linux系统有不同的版本。

| ROS发布日期 | ROS版本 | 对应Ubutnu版本 |
| --- | --- | --- |
| 2018.5 | ROS Medolic | Ubuntu 18.04 (Bionic)/Ubuntu 17.10 (Artful)/Windows/ Mac OS X /Andriod |
| 2016.3 | ROS Kinetic Kame | Ubuntu 16.04 (Xenial) / Ubuntu 15.10 (Wily) |
| 2015.3 | ROS Jade Turtle | Ubuntu 15.04 (Wily) / Ubuntu LTS 14.04 (Trusty) |
| 2014.7 | ROS Indigo Igloo | Ubuntu 14.04 (Trusty) |
| 2013.9 | ROS Hydro Medusa | Ubuntu 12.04 LTS (Precise) |
| 2012.12 | ROS Groovy Galapagos | Ubuntu 12.04 (Precise) |
| … | … | … |

然而，我在18.04的机器上安装之后（过程很曲折，理论上不需要这样，一直会出现包依赖的问题，最后用aptitude解决），和用得代码并不对应，我需要的是kinetic版本的，因此需要把系统换成ubuntu 16.04。对于系统的安装也有坑，有时间再记录。

实际上安装ROS过程也不复杂，只要你的系统什么的都是对应的，理论上没有什么大问题：

1.  设置软件和更新，保证restricted，universe，multiverse前是打钩的。  
    ![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/ros.png)
2.  添加源：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" &gt; /etc/apt/sources.list.d/ros-latest.list'</span><br></pre></td></tr></tbody></table>
    

设置秘钥：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-key 0xB01FA116</span><br></pre></td></tr></tbody></table>

1.  更新源：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get update</span><br></pre></td></tr></tbody></table>
    
2.  安装ros-kinetic：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get install ros-kinetic-desktop-full</span><br></pre></td></tr></tbody></table>
    

保证网络要好，如果对于外网访问很差可能需要使用阿里的镜像，这个设置请去查。安装时间应该会比较久。

1.  初始化ros：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">sudo rosdep init</span><br><span class="line">rosdep update</span><br></pre></td></tr></tbody></table>
    

设置环境变量：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">echo "source /opt/ros/kinetic/setup.bash" &gt;&gt; ~/.bashrc</span><br><span class="line">source ~/.bashrc</span><br></pre></td></tr></tbody></table>

1.  测试安装成功：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">roscore</span><br></pre></td></tr></tbody></table>
    

出现了started core service表示安装成功。
