---
title: CPP——记录（一）
date: 2019-7-29 00:00:00
tags: [cpp,code]
categories: 程序设计语言
mathjax: true
---              

我自己用过不少语言，cpp，java，python，html，ccs，javascript都接触过，系统学过java，cpp，也用过cpp，python和java编写过一些项目。但是呢，语言学过了都会忘记，但是过去写的代码不是毫无帮助，再次上手会非常容易。记录，就是记录一下最近用到的，之前学过但是忘记了的东西。


<!--more-->



### [](about:blank#%E7%B1%BB%E5%86%85%E9%9D%99%E6%80%81%E5%8F%98%E9%87%8F%E5%88%9D%E5%A7%8B%E5%8C%96 "类内静态变量初始化")类内静态变量初始化

类内静态变量是不能在声明时候初始化的，如果是常量则可以。如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">class</span> <span class="title">C</span></span></span><br><span class="line"><span class="class">{</span></span><br><span class="line">    <span class="keyword">static</span> <span class="keyword">int</span> a;</span><br><span class="line">    <span class="keyword">const</span> <span class="keyword">static</span> <span class="keyword">int</span> b = <span class="number">10</span>;</span><br><span class="line">    <span class="comment">//static int b = 10;error</span></span><br><span class="line">};</span><br><span class="line"><span class="keyword">int</span> C::a = <span class="number">10</span>;</span><br></pre></td></tr></tbody></table>

类内静态变量声明时候是没有分配内存的，只有在外部初始化以后，才会进行内存的分配。

### [](about:blank#%E4%BD%BF%E7%94%A8%E7%B1%BB%E5%86%85%E5%87%BD%E6%95%B0%E5%BB%BA%E7%AB%8B%E7%BA%BF%E7%A8%8B "使用类内函数建立线程")使用类内函数建立线程

想要使用类的成员函数进行多线程，直接绑定是绑定不上的。下面的做法是错误的：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">class</span> <span class="title">C</span></span></span><br><span class="line"><span class="class">{</span></span><br><span class="line">    <span class="function"><span class="keyword">void</span> <span class="title">func</span><span class="params">()</span></span></span><br><span class="line"><span class="function">    </span>{</span><br><span class="line">        <span class="comment">//other code</span></span><br><span class="line">    }</span><br><span class="line">    <span class="function"><span class="keyword">void</span> <span class="title">useFunc</span><span class="params">()</span></span></span><br><span class="line"><span class="function">    </span>{</span><br><span class="line">        <span class="built_in">std</span>::thread t = <span class="built_in">std</span>::thread(C::func,<span class="keyword">this</span>);</span><br><span class="line">    }</span><br><span class="line">};</span><br><span class="line">C obj;</span><br><span class="line"><span class="built_in">std</span>::thread t = <span class="built_in">std</span>::thread(C::func,obj);</span><br></pre></td></tr></tbody></table>

实际上是很容易理解的，因为成员函数就算是没有参数，实际上也是有一个参数的，就是变量本身。因此可以想想在建立thread的时候要像参数一样将变量传进去。但是用上面的方法仙人是不行的，因为我们不能像`func(this)`一样调用成员函数。如何将成员函数伪装成一个普通的函数？我们可以使用C++11中的bind：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">class</span> <span class="title">C</span></span></span><br><span class="line"><span class="class">{</span></span><br><span class="line">    <span class="function"><span class="keyword">void</span> <span class="title">func</span><span class="params">()</span></span></span><br><span class="line"><span class="function">    </span>{</span><br><span class="line">        <span class="comment">//other code</span></span><br><span class="line">    }</span><br><span class="line">    <span class="function"><span class="keyword">void</span> <span class="title">useFunc</span><span class="params">()</span></span></span><br><span class="line"><span class="function">    </span>{</span><br><span class="line">        <span class="built_in">std</span>::thread t = <span class="built_in">std</span>::thread( <span class="built_in">std</span>::bind(&amp;C::func,<span class="keyword">this</span>));</span><br><span class="line">    }</span><br><span class="line">};</span><br><span class="line">C obj;</span><br><span class="line"><span class="keyword">auto</span> func = <span class="built_in">std</span>::bind(&amp;C::func,&amp;obj);</span><br><span class="line">func();<span class="comment">// = obj.func()</span></span><br><span class="line"><span class="built_in">std</span>::thread t = <span class="built_in">std</span>::thread(func);</span><br></pre></td></tr></tbody></table>

可以看到，`std::bind`可以将成员函数包装成普通函数，也就可以传入到thread中了。而且，即使是在类内其他成员函数，也是一样可以这样调用的。

### [](about:blank#vector%E7%9A%84%E5%9D%91 "vector的坑")vector的坑

实际上，`std::vector`会动态分配内存，不是一个秘密，应该初学stl的都会明白。最近遇到了一个bug，内存泄露，一直找不到原因，后来发现是`std::vector`动态分配内存的原因。

首先，`std::vector`中内存是连续的，这意味着，在动态分配内存过程中，`std::vector`会把旧的内容拷贝到新的内存中去。这时候原先的引用，指针，就会失效。比如下面的例子：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">std</span>::<span class="built_in">vector</span>&lt;<span class="keyword">int</span>&gt; <span class="built_in">array</span>(<span class="number">1</span>);</span><br><span class="line"><span class="keyword">int</span> &amp;d = <span class="built_in">array</span>[<span class="number">0</span>];</span><br><span class="line">d = <span class="number">100</span>;</span><br><span class="line"><span class="keyword">for</span>(<span class="keyword">int</span> i = <span class="number">0</span>;i!=<span class="number">10</span>;++i)</span><br><span class="line"><span class="built_in">array</span>.push_back(i);</span><br><span class="line"><span class="built_in">std</span>::<span class="built_in">cout</span>&lt;&lt;<span class="string">"d = "</span> &lt;&lt;d &lt;&lt; <span class="built_in">std</span>::<span class="built_in">endl</span>;</span><br></pre></td></tr></tbody></table>

你觉得会输出什么？实际上输出什么是未定义的。当push_back调用时候，array会更换新的地址。这时候原来的引用就失效了。因此引用`std::vector`的内容要格外小心，如果有最大容量的话最好reserve一下。