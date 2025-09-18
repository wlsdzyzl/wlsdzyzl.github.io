---
title: ROS——通信构架
date: 2019-10-06 00:00:00
tags: [ros]
categories: ROS
mathjax: true
---            

Node之间的通信，是ROS的最重要的部分。这一篇文章介绍一下ROS的通信相关内容。  

<!--more-->


首先，之前提到了，Node的registration是通信的前提。因此一般来说运行ROS程序，都要先运行一行命令：`roscore`。它会启动master，同时会启动一个结点rosout，用来打印日志，还会启动参数服务器，parameter server，这个之后会介绍。

除此之外，在介绍一些关于结点的命令：

| command | 作用 |
| --- | --- |
| rosrun [pkg_name] [node_name] | 启动结点 |
| rosnode [list] | 列出结点 |
| rosnode [info] [node_name] | 打印结点信息 |
| rosnode [kill] [nodename] | 结束结点 |

当一个package内有多个结点，我们想要打包一起启动，可以在*.launch文件中配置，然后使用命令：`roslaunch [pkg_name] [filename.launch]`来打包启动。对于launch文件的格式，可以参考[roslaunch](http://wiki.ros.org/roslaunch/)。

[](about:blank#%E9%80%9A%E4%BF%A1%E6%96%B9%E5%BC%8F "通信方式")通信方式
---------------------------------------------------------------

接下来是重头，关于ros通信方式的介绍。ros中有4种通信方式，分别是Topic，Service，Action，Parameter Server，下面对这些通信方式分别进行介绍。

### [](about:blank#Topic "Topic")Topic

Topic是一种异步通信方式，Node通过publish/subscribe机制来传递信息。这个过程是这样的，一个Node作为publisher，它发布topic，而另一个Node作为subscriber在不断地接收topic中的内容。这是最常用的通信方式，比如相机捕获图片信息之后将图片内容publish，它需要发布颜色信息和深度信息，可以分为两个topic：/rgb与/depth，而另一个node需要获取颜色内容，它就订阅/rgb这个topic。

这种通信方式下，发布者可以随时发布信息，而接收者一察觉到有信息发不出来就去接收。对于Topic发布的内容，在ros中称为Message，每个topic传输的内容格式是固定的，它具体的数据结构定义在*.msg中。基本的msg类型类似于cpp语言中的数据类型，有bool，int8，int16,int32,int64,float32等等，除此之外还有可变长数组与定长数组。而且我们也可以用这些基本的数据类型定义自己需要的Message数据结构，ros中已经为我们定义了一批，如sensor_msgs/Image，用来获取传感器中的图像内容。

对于Topic通信方式与Message消息，有下面几个常用的命令：

| command | 作用 |
| --- | --- |
| rostopic [list] | 列出topic |
| rostopic [info] [topic_name] | [topic_name]的详细信息 |
| rostopic [echo] [topic_name] | 查看[topic_name]的内容 |
| rostopic [pub] [topic_name] … | 将信息发布到[topic_name] |
| rosmsg [list] | 列出所有的Message名称 |
| rosmsg [show] [msg_name] | 查看[msg_name]的结构 |

### [](about:blank#Service "Service")Service

Topic对于需要频繁发布的信息很有用，但是偶尔一次的通信就不太合适了。首先，偶尔一次的通信一般需要较大的计算量，而频繁的发布无人接收无疑是对计算资源的浪费。而Service类似于服务器客户端之间的同步通信机制。Service通信是一个server对多个client，client需要信息则向server发出请求，而server响应client的请求，完成通信。

与Topic类似，Service也有自己的通信格式，我们称为srv，格式为*.srv。srv文件一般包含两部分：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">request</span><br><span class="line">---</span><br><span class="line">reply</span><br></pre></td></tr></tbody></table>

上部分为request的数据类型，下部分为reply的数据类型，一般来说request数据类型很简单，而reply比较复杂，可以是msg中定义的类型。

一般来说，service适合于偶尔调用的功能，而topic适用于高频连续发布的内容。对于Service也有类似的命令：

| command | 作用 |
| --- | --- |
| rosservice [list] | 列出service |
| rosservice [info] [service_name] | [service_name]的详细信息 |
| rosservice [call] [topic_name] | 调用[service_name]的内容 |
| rossrv [list] | 列出所有srv的名称 |
| rossrv [show] [srv_name] | 查看[srv_name]的结构 |

### [](about:blank#Action "Action")Action

Action类似于Service，是带有状态反馈的通信方式。它适用于长时间，可抢占的任务。在Action通信中，客户端向服务端发送目标，或者取消指令，可以中止任务的执行，而服务端可以给客户端发送状态，反馈信息和结果。

Action的数据格式为*.action，一般包含三部分：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line">goal</span><br><span class="line">---</span><br><span class="line">result</span><br><span class="line">---</span><br><span class="line">feedback</span><br></pre></td></tr></tbody></table>

分布代表了目标信息数据结构，结果信息数据结构以及反馈信息的数据结构。

### [](about:blank#Parameter-server "Parameter server")Parameter server

参数服务器，用来存储各种参数的字典，可以用命令行，launch，node进行修改。这个就不多介绍了。

上面就是ROS通信架构的基本内容，对于如何编写ros代码，会在之后的文章中说明。
