---
title: 踩过的坑——vnc+SSH tunnel远程控制内网机器
date: 2018-11-10 00:00:00
tags: [ssh,vnc,remote control]
categories: 机器学习
mathjax: true
---    


最近出了个幺蛾子：teamviewer疑似被黑客攻击（已经证明是谣言了）。因此直到现在实验室的teamviewer端口依然被封禁。所以就需要使用新的方法，好在宿舍能够学习。

<!--more-->



实验室的同学说了，vnc很好用，加上SSH tunnel，速度飞快。所以我就查了查怎么搞。实验室的电脑是没有独立IP的，但是我们可以通过服务器访问内网。现在的情况，就是SSH访问服务器，再让服务器转发到自己的电脑，就是这样一个思路。

[](about:blank#vnc "vnc")vnc
----------------------------

首先是VNC的安装。要知道，被连接的电脑是作为一个服务器的，因此在ubuntu下安装VNC server：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get install vnc4server</span><br></pre></td></tr></tbody></table>

直接就安装成功了，简单吧。输入`vncserver`启动，不过第一次使用要设定密码。之后，会生成一个配置文件`/root/.vnc/xstartup`，需要对该文件进行修改，将文件改成下面的内容：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br></pre></td><td class="code"><pre><span class="line">#!/bin/sh</span><br><span class="line"></span><br><span class="line">export XKL_XMODMAP_DISABLE=1  </span><br><span class="line"></span><br><span class="line">unset SESSION_MANAGER  </span><br><span class="line"></span><br><span class="line">unset DBUS_SESSION_BUS_ADDRESS  </span><br><span class="line"></span><br><span class="line">gnome-panel &amp;  </span><br><span class="line"></span><br><span class="line">gnome-settings-daemon &amp;  </span><br><span class="line"></span><br><span class="line">metacity &amp;  </span><br><span class="line"></span><br><span class="line">nautilus &amp;  </span><br><span class="line"></span><br><span class="line">gnome-terminal &amp;</span><br></pre></td></tr></tbody></table>

为了运行图形化的界面，需要安装gnome：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo apt-get install gnome-panel gnome-settings-daemon metacity nautilus gnome-terminal</span><br></pre></td></tr></tbody></table>

每次输入vncserver，就会监听一个新的端口，也就是创建了一个新的应用，这个号从1开始叠加。我们可以指定这个端口：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">vncserver :5</span><br></pre></td></tr></tbody></table>

上述就会用编号（官方描述为display）5开始新的服务，对应的端口号是默认端口（5900）+编号，也就是5905。这时候在vnc client上连接ip:5905（不行就试试ip:5）就可以了。

也可以使用下面的命令杀掉某个服务：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">vncserver -kill :5</span><br></pre></td></tr></tbody></table>

现在已经建立好了服务器，就差让宿舍的电脑连接到这个内网了。这时候需要ssh tunnel了。

[](about:blank#ssh-tunnel "ssh tunnel")ssh tunnel
-------------------------------------------------

### [](about:blank#L "-L")\-L

现在情况是，我可以ssh到服务器，服务器可以访问我的主机，需要的是在我的电脑上选择端口8888，然后通过服务器让它与实验室电脑的5901相连。这样我访问本地的8888端口，就可以转发到vnc服务了。

这个需求是正向连接，也叫本地转发。也就是通过本地的端口映射到别的机子上的端口。命令：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">ssh -L local_port:client_ip:client_port username@sshserver_ip</span><br></pre></td></tr></tbody></table>

上述中，本地电脑称为local，需要连接的电脑为client，ssh中转的服务器被称为sshserver。我们需要能ssh到sshserver上。

### [](about:blank#R "-R")\-R

另一种情况是反向连接，也叫远程转发。适用于不同的情况，例如，现在机子B是服务器，可以SSH到A，（A不能SSH到B），B可以访问C，想要A访问C，就需要在B上进行配置。命令如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">ssh -R A_ip:A_port:C_ip:C_port username@A_ip</span><br></pre></td></tr></tbody></table>

这样就让A的消息通过B转发到C了。

SSH tunnel还有很多其他用法，等需要的时候再去查怎么做吧。
