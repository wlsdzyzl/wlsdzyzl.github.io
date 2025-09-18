---
title: ROS——基本介绍
date: 2019-10-06 00:00:00
tags: [ros]
categories: ROS
mathjax: true
---            

ROS是Robot os，也就是机器人操作系统。目前我们看到的很多机器人，比如波士顿动力，还有很多SLAM中，都用到了ros。早在大四的时候我在电脑上试图跑CHISEL的时候就看到了ros，当时觉得真是复杂。后来到了现在发现还是得啃。复杂只是因为不了解，任何好用的工具，都是尝试再把事情变得简单。


<!--more-->



对于ROS的安装这里就不多提了，可以参考：[踩过的坑——ROS安装](https://wlsdzyzl.top/2019/05/09/%E8%B8%A9%E8%BF%87%E7%9A%84%E5%9D%91%E2%80%94%E2%80%94ROS%E5%AE%89%E8%A3%85/)。

ROS虽然是一个操作系统，但是它并不是像linux，windows这样的运行各种程序，而一般来说，它用来连接电脑和PC，让我们更方便的使用电脑来操作机器人。这其中最重要的就是它的构架形式。操作一个机器人是非常复杂的，首先眼睛是摄像头或者激光雷达，来获取信息，接着转向，机械臂的控制等等，这些繁琐的工作如果要在一个进程中完成是非常臃肿的。ros将各个进程封装成了Node（结点），同时有一个master（管理者）管理所有Node，任何一个Node必须经过master注册之后才能加入并且与其他Node进行通信。通过这样的构架使得对机器人的开发变得非常明确，在实际编程中分工也更加清晰。

### [](about:blank#catkin "catkin")catkin

上面说的Node是运行级的，现在在这里我们简单说一下一个ros程序的代码结构一般是什么样子。首先我们要知道一个ros程序经常使用的特殊的编译器，catkin。它是基于cmake的，用来编译ros程序。在安装ros的过程中，一般catkin也就顺带安装了。首先，我们需要一个workspace，也就是包含了整个程序的目录。我们可以使用命令`catkin_init_workspace $workspace_name`来初始化一个workspace目录，需要注意的是workspace目录中应当包含src目录。当进行初始化结束后，一个workspace里子目录如下：devel，build，src。这其中，build就是编译的输出结果，而devel包含了一些启动啊环境的脚本，而我们需要关注的是src文件夹，它是源代码所在的位置。

### [](about:blank#package "package")package

在ROS中，我们将代码组织成package，因此package一般放在src中。一个package是一个目录，我们可以使用`catkin_create_pkg $pkg_name`来创建一个包，注意的是一个包可能包含了多个Node，因此一个package可能就是一个小的项目，实现了某个或者多个功能。一个package至少包含一个CMakeLists.txt和一个package.xml。当我们使用了上述命令创建一个包之后，点开就会发现只有这两个文件，也就是这个包是一个空包，只有package的构架。CMakeLists.txt就不多说了，主要是用来生成make文件好进一步编译，而package.xml完整地描述了这个package，包括名称，版本，license，依赖等等。除此之外，一般一个package还包含src目录，用来存放源代码，如cpp文件，py文件；scripts目录，存放需要的脚本；include目录，用来存放头文件，以及msg目录，srv目录，action目录等等，这些是后面与ros通信相关的内容；launch目录，还有config配置目录。

创建，编译一个catkin工作空间的流程如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br></pre></td><td class="code"><pre><span class="line">mkdir catkin_ws</span><br><span class="line"></span><br><span class="line"><span class="built_in">cd</span> catkin_ws</span><br><span class="line"></span><br><span class="line">mkdir src</span><br><span class="line"></span><br><span class="line"><span class="built_in">cd</span> src </span><br><span class="line"></span><br><span class="line">catkin_init_workspace</span><br></pre></td></tr></tbody></table>

在src文件里编写package，或者拷贝别的package进来。编译时，在src的父目录，也就是catkin_ws中编译：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">catkin_make</span><br></pre></td></tr></tbody></table>

想要在命令行里运行自己的程序，需要将package放到ros的环境变量中去。否则的话，你用rospackage list是找不到自己写的package的。而编译好的devel中setup.bash就是这个作用：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">source</span> devel/setup.bash</span><br></pre></td></tr></tbody></table>

但是这样每次打开新的终端都会重新要求输入上面的指令，可以将上述指令添加到.bashrc中，这样每次打开终端都会执行：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">echo</span> <span class="string">"source path/catkin_ws/devel/setup.bash"</span> &gt;&gt; ~/.bashrc</span><br><span class="line"></span><br><span class="line"><span class="built_in">source</span> ~/.bashrc</span><br></pre></td></tr></tbody></table>

### [](about:blank#metapackage "metapackage")metapackage

metapackage是一组相关包的集合，一般来说除了非常专业的人，我们很少编写这样的包，只需要了解即可。在ros官方提供了很多这样的集合包，比如navigation，turtlebut等等，下载的时候也可以一键打包下载。

这就是关于ros一些基本的介绍，注意，这一系列文章是记录了一些学习过程，类似于整理笔记，而不是一个教程。参考资料可以查看[ros_wiki](http://wiki.ros.org/action/fullsearch/ROS?action=fullsearch&context=180&value=linkto%3A%22cn%2FROS%22)。
