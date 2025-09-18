---
title: 踩过的坑——ROS多机通信与节点重命名
date: 2019-11-20 00:00:00
tags: [ros]
categories: 踩过的坑
mathjax: true
---    

项目需要拓展到多相机协同重建，需要借助C/S模型通信。而使用ROS是非常好的选择。最近借助之前学得ros的知识，代码部分拓展得差不多了，再拓展到多个机器的过程中，出现了通信与节点名字冲突的问题，解决方法也不难，就在这里记录一下。


<!--more-->


### [](about:blank#%E5%A4%9A%E6%9C%BA%E9%80%9A%E4%BF%A1 "多机通信")多机通信

分布式的架构是ROS的灵魂。实际上，ros把通信这里的东西封装得相当方便了。现在多机通信的情况是这样：一台主机运行Master，其他的结点运行在不同的机器上，这些结点一台是服务器，有的是客户端。但是他们有一个共同点，就是需要向Master注册。

首先，各个机器要和Master所在的机器ping通，这个是必要的。理论上互相ping通，ros就可将它们连接运行起来。在我这里，Master和一个客户端A运行在ip为10.8.5.230的机器上，而另外一个客户端和服务器运行在192.168.0.110上。需要做的是：在192.168.0.110机器终端输入：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">export ROS_MASTER_URI=http://10.8.5.230:11311</span><br></pre></td></tr></tbody></table>

这个意图很明显，就是指定MASTER的IP和运行端口。但是这时启动服务器会发现，在Master终端下出现：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">Couldn't find an AF_INET address for [XXX]</span><br></pre></td></tr></tbody></table>

这导致虽然服务器可以连接到Master，但是在客户端A发的消息却送不到服务器上。因为没有找到一个AF_INET address。这个地址有什么用我也不清楚，因为目前的我只重视问题怎么解决，而不在乎背后的原理，因此就不多了解了。后来发现，多机通信还要在各个结点的机器上指定ROS_IP:  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">hostname -I</span><br></pre></td></tr></tbody></table>

得到IP后，再通过下面的指令分别指定本机的ROS_IP：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">export ROS_IP=192.168.0.110</span><br><span class="line">export ROS_IP=10.8.5.230</span><br></pre></td></tr></tbody></table>

之后就可以成功连接并运行成功了。

### [](about:blank#%E8%8A%82%E7%82%B9%E5%90%8D%E7%A7%B0%E5%86%B2%E7%AA%81 "节点名称冲突")节点名称冲突

在运行过程中，由于客户端的程序是一样的，因此它们启动结点默认名称是一样的，而在一个命名空间下，不能有相同名称的结点。这就导致了我在运行第一个客户端时，打开了第二个客户端，然后第一个客户端就出现问题，节点名称被占用：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">[ WARN] [....]: Shutdown request received.</span><br><span class="line">[ WARN] [....]: Reason given for shutdown: [new node registered with the same name]</span><br></pre></td></tr></tbody></table>

因此在启动结点时，需要重新设置结点名称。比如现在启动的命令如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">rosrun flashfusion client</span><br></pre></td></tr></tbody></table>

将结点名称指定为fuck：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">rosrun flashfusion client __name:=fuck</span><br></pre></td></tr></tbody></table>

这样就不会产生冲突了。

也不难猜到，另外的方法，就是命名空间，并且使用roslaunch来发布更方便。不过既然问题解决了，现在就先不了解了，之后整理代码有需求再来详细研究。


  