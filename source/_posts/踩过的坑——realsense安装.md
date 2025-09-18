---
title: 踩过的坑——realsense安装
date: 2019-05-09 00:00:00
tags: [realsense]
categories: 踩过的坑
mathjax: true
---     
    
我做的项目中需要安装realsense driver，实际上realsense驱动的安装也很简单，但是有一些需要注意的地方。


<!--more-->


Intel realsense驱动，是使用intel realsense的必要驱动。安装Intel Realsense Driver可以参考[https://github.com/IntelRealSense/librealsense。](https://github.com/IntelRealSense/librealsense%E3%80%82)

1.  注册公钥
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-key adv --keyserver keys.gnupg.net --recv-key C8B3A55A6F3EFCDE || sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-key C8B3A55A6F3EFCDE</span><br></pre></td></tr></tbody></table>
    
2.  添加服务到repositories
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo add-apt-repository "deb http://realsense-hw-public.s3.amazonaws.com/Debian/apt-repo xenial main" -u</span><br></pre></td></tr></tbody></table>
    
3.  更新repositories
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get update</span><br></pre></td></tr></tbody></table>
    
4.  为了运行realsense的demo：
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get install librealsense2-dkms</span><br><span class="line">sudo apt-get install librealsense2-utils</span><br></pre></td></tr></tbody></table>
    
5.  安装
    
    <table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get install librealsense2-dev</span><br><span class="line"></span><br><span class="line">sudo apt-get install librealsense2-dbg</span><br></pre></td></tr></tbody></table>
    

上面安装之后发现找不到包，很正常，因为很重要一点是要把源改成主服务器，这个也是在软件和更新里设置。之后应该就可以安装成功了。

![](https://evolution-video.oss-cn-beijing.aliyuncs.com/wlsdzyzl_hexo/main_server.png)
