---
title: CPP——并发编程（一）thread
date: 2019-03-28 00:00:00
tags: [cpp,concurrent programming,Programming language]
categories: 程序设计语言
mathjax: true
---   

因为目前做的项目需要用到CPP的并发编程，之前虽然用CPP写过不少代码，但大多是OJ和课后题目，以及一些黑框小游戏，而没有涉及到并发编程。涉及到并发的一直都是用Java，Python的语言去做的，也用c语言做过一个服务器，利用fork，pthread等等，是操作系统层面的操作（linux，windows等）。因此这次了解一下CPP的并发。  

<!--more-->


CPP之前的并发感觉用的比较多的boost库，现在C++11也加入了对线程的支持，可以直接在语言层面编写并行代码。下面简单了解一下C++11中的线程。

std::thread，包含在thread头文件中（#include）。

thread的默认构造函数，初始化，拷贝构造函数，移动构造函数分别如下：

| 类型 | 声明 |
| --- | --- |
| default (1) | thread() noexcept; |
| initialization (2) | template explicit thread (Fn&& fn, Args&&… args); |
| copy [deleted ] (3) | thread (const thread&) = delete; |
| move (4) | thread (thread&& x) noexcept; |

可以看到的是，thread类型的初始化为参数可变参数,且不能隐式转换（explicit关键字），没有拷贝构造函数。移动构造后，原有的线程不再存在。示例代码如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br></pre></td><td class="code"><pre><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">f</span><span class="params">(<span class="keyword">int</span> &amp;n)</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">    n +=<span class="number">10</span>;</span><br><span class="line">}</span><br><span class="line"><span class="comment">//wrong </span></span><br><span class="line"><span class="built_in">std</span>::<span class="function">thread <span class="title">t</span><span class="params">(f,n)</span></span>;</span><br><span class="line"><span class="comment">//right</span></span><br><span class="line"><span class="built_in">std</span>::<span class="function">thread <span class="title">t</span><span class="params">(f,<span class="built_in">std</span>::ref(n))</span></span>;</span><br><span class="line"><span class="comment">//wrong: copy[deleted]</span></span><br><span class="line"><span class="built_in">std</span>::<span class="function">thread <span class="title">t1</span><span class="params">(t)</span></span>;</span><br><span class="line"><span class="comment">//right: move</span></span><br><span class="line"><span class="built_in">std</span>::<span class="function">thread <span class="title">t2</span><span class="params">(<span class="built_in">std</span>::move(t))</span></span>;</span><br><span class="line"><span class="comment">//wrong: t is moved, it is not joinable</span></span><br><span class="line">t.join();</span><br><span class="line"><span class="comment">//right</span></span><br><span class="line">t2.join();</span><br></pre></td></tr></tbody></table>

第一个wrong，是因为thread中f如果包含引用，那么传入引用的变量需要经过std::ref。这是因为thread的可变参数是右值引用，如果直接传入根据引用叠加规则会导致错误。具体的原理需要深究，现在只需要知道即可。

除了拷贝和移动，另一个值得关注的是**赋值函数**。赋值函数有两个重构：

| 类型 | 声明 |
| --- | --- |
| move (1) | thread& operator= (thread&& rhs) noexcept; |

copy [deleted ] (2)thread& operator= (const thread&) = delete;

可以看到的是赋值函数的两个重构对应的是拷贝构造函数和移动构造函数，也就是thread只可以被右值赋值。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//right</span></span><br><span class="line"><span class="built_in">std</span>::thread t = thread(f,<span class="built_in">std</span>::ref(n));</span><br><span class="line"><span class="comment">//wrong</span></span><br><span class="line"><span class="built_in">std</span>::thread t1 = t;</span><br><span class="line"><span class="comment">//right</span></span><br><span class="line"><span class="built_in">std</span>::thread t2=<span class="built_in">std</span>::move(t);</span><br></pre></td></tr></tbody></table>

下面介绍thread别的成员函数。

**thread::join()**

void join();

join函数阻塞线程执行完毕再执行之后的结果。如：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">std</span>::<span class="function">thread <span class="title">t</span><span class="params">(f,<span class="built_in">std</span>::ref(n))</span></span>;</span><br><span class="line">t.join();</span><br><span class="line">other_operation();</span><br></pre></td></tr></tbody></table>

则other_operation只有在t线程执行完，也就是f函数执行完毕才会执行。需要注意的是，一旦一个线程创建了，它就开始运行了。

**thread::joinable()**

bool joinable() const noexcept;

joinable返回这个线程是否可以join，也就是阻塞。当线程有下面几个特征中一点时，是不能join的：

*   默认构造函数构造的，只是一个空线程，并没有执行的函数
*   已经被move了，被move后是一个右值，它原有的内容都是未定义的
*   已经join或者detach过，detach稍后说明

**thread::get_id()**

id get_id() const noexcept;

返回线程的id。没什么好说的，创建线程的时候会给每个线程分配一个id。

**thread::detach()**

void detach();

分离线程函数。调用detach，那么该线程会和主线程分离。一般来说子线程和主线程的关系是，主线程结束，子线程不管结束还是没有结束都会被销毁，而join会让主线程等待子线程结束，detach会让子线程脱离主线程，及时主线程结束了，子线程依然可以继续运行。

**thread::swap**

void swap (thread& x) noexcept;

交换两个线程。

**thread::native_handle()**

native_handle_type native_handle();

这个函数只有库函数支持该函数时方法才有效。如果有效，它用于获取与操作系统相关的原生线程句柄。

此外，thread还有两个数据成员，id和native_handle_type，他们分布代表id和原生句柄的类型。

thread还有一个静态成员函数：**thread::hardware_concurrency**：

static unsigned hardware_concurrency() noexcept;

这个函数用于获取程序可以调动的最大线程数，在多核系统中，也就代表CPU个数，仅作参考。上面就是关于线程的内容，内容不多。