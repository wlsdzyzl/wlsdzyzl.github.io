---
title: CPP——并发编程（四）condition_variable
date: 2019-03-31 00:00:00
tags: [cpp,concurrent programming,Programming language]
categories: 程序设计语言
mathjax: true
---   

到目前为止介绍的并发过程都是类似于去“争夺”控制，也就是只要有机会就去上，但是有时候我们会遇到那种等待的情况，达到某个条件了才能运行，这时候就需要用条件变量（condition_variable）。


<!--more-->


关于条件变量的内容都在头文件中。它包含了std::condition_variable，std::condition_variable_any，还有枚举类型std::cv_status，函数std::notify_all_at_thread_exit()。这篇文章会介绍上面这些类以及函数的作用。

### [](about:blank#std-condition-variable "std::condition_variable")std::condition_variable

condition_variable的设定是这样的，它调用wait函数，使用unique_lock锁住当前线程，表明条件还未满足，这时候当前线程会被阻塞，直到另外一个线程在相同的condition_variable变量上调用了notification相关的函数，说明条件满足，则开始运行。

condition_variable只有默认构造函数，拷贝构造函数被删除。下面介绍它其他的成员函数。

**wait**

condition_variable有两个wait函数的重载。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">wait</span> <span class="params">(unique_lock&lt;mutex&gt;&amp; lck)</span></span>;<span class="comment">// unconditional</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Predicate</span>&gt; //<span class="title">predicate</span></span></span><br><span class="line"><span class="class">  <span class="title">void</span> <span class="title">wait</span> (<span class="title">unique_lock</span>&lt;mutex&gt;&amp; <span class="title">lck</span>, <span class="title">Predicate</span> <span class="title">pred</span>);</span></span><br></pre></td></tr></tbody></table>

wait接受一个参数，类型是unique_lock，调用wait函数后，当前线程被阻塞（当前线程已经获得了mutex的控制权，也就是mutex已经被锁住了），直到该condition_variable变量被notify之后，才能继续运行wait之后的内容。当线程被阻塞时，wait会调用unique_lock的unlock对mutex进行解锁，使得其他的线程可以占用mutex。当被notify之后，wait会调用lock来继续锁住mutex（如果此时被占用，当前线程继续被阻塞）。

对于predicate的wait，只有当predicate条件为false时候调用wait才会阻塞当前线程，并且只有当其他的线程通知predicate为true时才会解除阻塞，相当于又多了一个条件。predicate是一个callable的对象，不接受参数，并且能返回值可以转化成bool值。相当于：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">while</span> (!pred()) wait(lck);</span><br></pre></td></tr></tbody></table>

**wait_for**

wait_for与wait一样，也有两个重载。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Rep</span>, <span class="title">class</span> <span class="title">Period</span>&gt;//<span class="title">unconditional</span></span></span><br><span class="line"><span class="class">  <span class="title">cv_status</span> <span class="title">wait_for</span> (<span class="title">unique_lock</span>&lt;mutex&gt;&amp; <span class="title">lck</span>,</span></span><br><span class="line"><span class="class">                      <span class="title">const</span> <span class="title">chrono</span>:</span>:duration&lt;Rep,Period&gt;&amp; rel_time);</span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Rep</span>, <span class="title">class</span> <span class="title">Period</span>, <span class="title">class</span> <span class="title">Predicate</span>&gt;//<span class="title">predicate</span></span></span><br><span class="line"><span class="class">       <span class="title">bool</span> <span class="title">wait_for</span> (<span class="title">unique_lock</span>&lt;mutex&gt;&amp; <span class="title">lck</span>,</span></span><br><span class="line"><span class="class">                      <span class="title">const</span> <span class="title">chrono</span>:</span>:duration&lt;Rep,Period&gt;&amp; rel_time, Predicate pred);</span><br></pre></td></tr></tbody></table>

wait_for和wait的区别在于它会接受一个时间段，在当前线程收到通知，或者在指定的时间内，它都会阻塞，当超时，或者收到了通知达到条件，wait_for返回，剩下的和wait一致。

**wait_until**

wait_until和wait_for类似，只不过时间范围被替换成了时间点。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Clock</span>, <span class="title">class</span> <span class="title">Duration</span>&gt;//<span class="title">unconditional</span></span></span><br><span class="line"><span class="class">  <span class="title">cv_status</span> <span class="title">wait_until</span> (<span class="title">unique_lock</span>&lt;mutex&gt;&amp; <span class="title">lck</span>,</span></span><br><span class="line"><span class="class">                        <span class="title">const</span> <span class="title">chrono</span>:</span>:time_point&lt;Clock,Duration&gt;&amp; abs_time);</span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Clock</span>, <span class="title">class</span> <span class="title">Duration</span>, <span class="title">class</span> <span class="title">Predicate</span>&gt;</span></span><br><span class="line"><span class="class">       <span class="title">bool</span> <span class="title">wait_until</span> (<span class="title">unique_lock</span>&lt;mutex&gt;&amp; <span class="title">lck</span>,//<span class="title">predicate</span></span></span><br><span class="line"><span class="class">                        <span class="title">const</span> <span class="title">chrono</span>:</span>:time_point&lt;Clock,Duration&gt;&amp; abs_time,</span><br><span class="line">                        Predicate pred);</span><br></pre></td></tr></tbody></table>

**notify_one**

唤醒某个等待线程，如果没有线程在等待，那么这个函数什么也不做，如果有多个线程等待，唤醒哪个线程是随机的。

**notify_all**

唤醒所有的等待线程。

### [](about:blank#std-condition-variable-any "std::condition_variable_any")std::condition_variable_any

condition_variable_any和condition_variable的区别是wait接受的锁是任意的，而condition_variable只能接受unique_lock。

### [](about:blank#std-cv-status "std::cv_status")std::cv_status

这个枚举类型仅仅枚举了两个状态，标志着wait_for或者wait_until是否是因为超时解除阻塞的。

| 值 | 描述 |
| --- | --- |
| cv_status::no_timeout | wait_for 或者 wait_until 没有超时，即在规定的时间段内线程收到了通知 |
| cv_status::timeout | wait_for 或者 wait_until 超时 |

### [](about:blank#std-notify-all-at-thread-exit "std::notify_all_at_thread_exit")std::notify_all_at_thread_exit

notify_all_at_thread_exit是一个函数，原型如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">notify_all_at_thread_exit</span> <span class="params">(condition_variable&amp; cond, unique_lock&lt;mutex&gt; lck)</span></span>;</span><br></pre></td></tr></tbody></table>

当调用该函数的线程结束时，所有在cond上等待的线程都会收到通知。

总体来说，条件变量的相关内容还是很容易理解的。现在研究一下下面的代码：

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br><span class="line">33</span><br><span class="line">34</span><br><span class="line">35</span><br><span class="line">36</span><br><span class="line">37</span><br><span class="line">38</span><br><span class="line">39</span><br></pre></td><td class="code"><pre><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;                // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;                // std::thread</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;mutex&gt;                // std::mutex, std::unique_lock</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;condition_variable&gt;    // std::condition_variable</span></span></span><br><span class="line"></span><br><span class="line"><span class="built_in">std</span>::mutex mtx; <span class="comment">// global mutex</span></span><br><span class="line"><span class="built_in">std</span>::condition_variable cv; <span class="comment">// global condition variable.</span></span><br><span class="line"><span class="keyword">bool</span> ready = <span class="literal">false</span>; <span class="comment">// global flag.</span></span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">do_print_id</span><span class="params">(<span class="keyword">int</span> id)</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">    <span class="built_in">std</span>::unique_lock &lt;<span class="built_in">std</span>::mutex&gt; lck(mtx);</span><br><span class="line">    <span class="keyword">if</span> (!ready) </span><br><span class="line">        cv.wait(lck); </span><br><span class="line">    <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"thread "</span> &lt;&lt; id &lt;&lt; <span class="string">'\n'</span>;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">go</span><span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">    <span class="built_in">std</span>::unique_lock &lt;<span class="built_in">std</span>::mutex&gt; lck(mtx);</span><br><span class="line">    ready = <span class="literal">true</span>;</span><br><span class="line">    cv.notify_all(); </span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span><span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">    <span class="built_in">std</span>::thread threads[<span class="number">10</span>];</span><br><span class="line">    <span class="comment">// spawn 10 threads:</span></span><br><span class="line">    <span class="keyword">for</span> (<span class="keyword">int</span> i = <span class="number">0</span>; i &lt; <span class="number">10</span>; ++i)</span><br><span class="line">        threads[i] = <span class="built_in">std</span>::thread(do_print_id, i);</span><br><span class="line"></span><br><span class="line">    <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"10 threads ready to race...\n"</span>;</span><br><span class="line">    go(); <span class="comment">// go!</span></span><br><span class="line"></span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">auto</span> &amp; th:threads)</span><br><span class="line">        th.join();</span><br><span class="line"></span><br><span class="line">    <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

10个线程被发出去后，都会因为ready是false而被wait阻塞，当ready为true时，唤醒了所有的线程，这时候线程之间的控制就又转成了对互斥量mutex的控制，因此输出顺序是不一致的。可能输出如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br></pre></td><td class="code"><pre><span class="line"><span class="number">10</span> threads ready to race...</span><br><span class="line">thread <span class="number">7</span></span><br><span class="line">thread <span class="number">3</span></span><br><span class="line">thread <span class="number">1</span></span><br><span class="line">thread <span class="number">9</span></span><br><span class="line">thread <span class="number">4</span></span><br><span class="line">thread <span class="number">5</span></span><br><span class="line">thread <span class="number">6</span></span><br><span class="line">thread <span class="number">8</span></span><br><span class="line">thread <span class="number">2</span></span><br><span class="line">thread <span class="number">0</span></span><br></pre></td></tr></tbody></table>