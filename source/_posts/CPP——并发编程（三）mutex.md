---
title: CPP——并发编程（四）condition_variable
date: 2019-03-30 00:00:00
tags: [cpp,concurrent programming,Programming language]
categories: 程序设计语言
mathjax: true
---   

并发编程中很重要的一点，是某些量是互斥的，他们不能同时允许。可以同时运行的比如多个读，而不能同时运行的，比如多个写。这篇文章介绍一下c++11中关于互斥（mutex）的内容。


<!--more-->


关于互斥量的操作都需要包含头文件。

它包含了4个互斥类：

*   mutex，最基本的互斥类
*   recursive_mutex，递归互斥类
*   timed_mutex，定时互斥类
*   recursive_timed_mutex，递归定时互斥类

2个Lock类：

*   lock_guard，它管理一个互斥对象，通过保持它被锁定的状态。
*   unique_lock，它管理一个互斥对象，该对象在两种状态（锁定状态和非锁定状态）下都拥有唯一所有权。

其他类型：

*   once_flag
*   adopt_lock_t
*   defer_lock_t
*   try_to_lock_t

此外它还包含了几个函数：

*   try_lock
*   lock
*   call_once

下面对这些内容进行较为详细的介绍。

### [](about:blank#std-mutex "std::mutex")std::mutex

mutex是最基本的互斥量，它不支持递归地被上锁。mutex只有一个默认构造函数，不支持拷贝构造和移动构造，默认构造得到的mutex是未锁定的状态。

mutex的其他成员函数如下：

*   lock，锁上互斥量，如果互斥量已经被锁，当前线程会被阻塞。注意的是，如果互斥量已经被当前的线程锁住，再次调用lock会导致死锁，因为它会被阻塞一直等待unlock。
*   try_lock，如果互斥量状态是unlocked，那么锁上互斥量，如果互斥量已经被其他线程锁住，那么当前的线程也不会被阻塞，而是返回false。注意，和lock一样，如果互斥量已经被当前线程lock，那么调用这个会导致死锁。
*   unlock，解锁互斥量
*   native_handle，获取句柄

上面的函数直接看不知道怎么用，下面是一个官方给的代码示例，我们通过分析它来明白mutex的作用。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// mutex example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;         // std::thread</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;mutex&gt;          // std::mutex</span></span></span><br><span class="line"></span><br><span class="line"><span class="built_in">std</span>::mutex mtx;           <span class="comment">// mutex for critical section</span></span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">print_block</span> <span class="params">(<span class="keyword">int</span> n, <span class="keyword">char</span> c)</span> </span>{</span><br><span class="line">  <span class="comment">// critical section (exclusive access to std::cout signaled by locking mtx):</span></span><br><span class="line">  mtx.lock();</span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">int</span> i=<span class="number">0</span>; i&lt;n; ++i) { <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; c; }</span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">'\n'</span>;</span><br><span class="line">  mtx.unlock();</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="built_in">std</span>::<span class="function">thread <span class="title">th1</span> <span class="params">(print_block,<span class="number">50</span>,<span class="string">'*'</span>)</span></span>;</span><br><span class="line">  <span class="built_in">std</span>::<span class="function">thread <span class="title">th2</span> <span class="params">(print_block,<span class="number">50</span>,<span class="string">'$'</span>)</span></span>;</span><br><span class="line"></span><br><span class="line">  th1.join();</span><br><span class="line">  th2.join();</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

上面的代码中，prink_block使用了互斥量来控制循环部分不会被打断。首先，在循环前将mtx上锁，这时候调度到下一个线程的时候，因为mtx状态是locked，因此这个线程被阻塞，直到上个线程将mtx解锁。

上述程序的输出如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">**************************************************</span><br><span class="line">$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$</span><br></pre></td></tr></tbody></table>

*和$的顺序可能会变，但是一定会整齐地输出50个。

### [](about:blank#std-recursive-mutex "std::recursive_mutex")std::recursive_mutex

上面的内容中，如果同一个线程对互斥量多次上锁，就会导致死锁，因为它不是递归的。而递归锁可以让同一个线程对其多次上锁，并且多次解锁。不过lock多少次，就必须unlock多少次，才能真正地解锁。除了这些，它和mutex的作用一致。

### [](about:blank#std-timed-mutex "std::timed_mutex")std::timed_mutex

timed_mutex比mutex多了两个成员函数：try_lock_for和try_lock_until.  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Rep</span>, <span class="title">class</span> <span class="title">Period</span>&gt;</span></span><br><span class="line"><span class="class">  <span class="title">bool</span> <span class="title">try_lock_for</span> (<span class="title">const</span> <span class="title">chrono</span>:</span>:duration&lt;Rep,Period&gt;&amp; rel_time);</span><br></pre></td></tr></tbody></table>

try_lock_for接受一个时间段，在这段时间范围内如果互斥量解锁了，就将其锁上，否则返回false。也就是和try_lock相比，它会等待更多的时间。

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Clock</span>, <span class="title">class</span> <span class="title">Duration</span>&gt;</span></span><br><span class="line"><span class="class">  <span class="title">bool</span> <span class="title">try_lock_until</span> (<span class="title">const</span> <span class="title">chrono</span>:</span>:time_point&lt;Clock,Duration&gt;&amp; abs_time);</span><br></pre></td></tr></tbody></table>

try_lock_until接受一个时间点，到时间点内互斥量依然被锁着，它就返回false，否则在时间点之前互斥量被解锁了，它就锁住互斥量。

### [](about:blank#std-recursize-timed-mutex "std::recursize_timed_mutex")std::recursize_timed_mutex

递归定时互斥量也就是recursive_mutex和timed_mutex的结合，它可以递归锁，也可以定解锁时长。这里就不多介绍了。

在介绍锁之前，先介绍几个与锁类型相关的 Tag 类，分别如下:

adopt_lock_t，一个空的标记类，定义如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">struct</span> <span class="title">adopt_lock_t</span> {</span>};</span><br></pre></td></tr></tbody></table>

该类型的常量对象adopt_lock定义如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">constexpr</span> <span class="keyword">adopt_lock_t</span> adopt_lock {};</span><br></pre></td></tr></tbody></table>

通常作为参数传入给 unique_lock 或 lock_guard 的构造函数。

defer_lock_t，一个空的标记类，定义如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">struct</span> <span class="title">defer_lock_t</span> {</span>};</span><br></pre></td></tr></tbody></table>

该类型的常量对象 defer_lock定义如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">constexpr</span> <span class="keyword">defer_lock_t</span> defer_lock {};</span><br></pre></td></tr></tbody></table>

通常作为参数传入给 unique_lock 或 lock_guard 的构造函数。

std::try_to_lock_t，一个空的标记类，定义如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">struct</span> <span class="title">try_to_lock_t</span> {</span>};</span><br></pre></td></tr></tbody></table>

该类型的常量对象 try_to_lock定义如下：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">constexpr</span> <span class="keyword">try_to_lock_t</span> try_to_lock {};</span><br></pre></td></tr></tbody></table>

通常作为参数传入给 unique_lock 或 lock_guard 的构造函数。

下面介绍lock相关的类。

### [](about:blank#std-lock-guard "std::lock_guard")std::lock_guard

lock_guard是模板类：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Mutex</span>&gt; <span class="title">class</span> <span class="title">lock_guard</span>;</span></span><br></pre></td></tr></tbody></table>

它只有两个成员函数：构造和析构。构造函数，用法很简单，构造时候接受一个互斥量，然后互斥量就被锁定了。当析构函数调用，比如退出了作用域，那么互斥量就被解锁。但是它的构造函数是有两个选择，一个是默认，直接将互斥量锁定，另一个会接受一个参数，进行adopting initialization（传入参数adopt_lock），它可以绑定一个被当前线程锁定的互斥量。而默认的构造函数如果互斥量已经被当前线程锁定了，再次调用会进入死锁（一般的mutex类型）。

下面是一个例子：

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br><span class="line">33</span><br><span class="line">34</span><br><span class="line">35</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// lock_guard example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;         // std::thread</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;mutex&gt;          // std::mutex, std::lock_guard</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;stdexcept&gt;      // std::logic_error</span></span></span><br><span class="line"></span><br><span class="line"><span class="built_in">std</span>::mutex mtx;</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">print_even</span> <span class="params">(<span class="keyword">int</span> x)</span> </span>{</span><br><span class="line">  <span class="keyword">if</span> (x%<span class="number">2</span>==<span class="number">0</span>) <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; x &lt;&lt; <span class="string">" is even\n"</span>;</span><br><span class="line">  <span class="keyword">else</span> <span class="keyword">throw</span> (<span class="built_in">std</span>::logic_error(<span class="string">"not even"</span>));</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">print_thread_id</span> <span class="params">(<span class="keyword">int</span> id)</span> </span>{</span><br><span class="line">  <span class="keyword">try</span> {</span><br><span class="line">    <span class="comment">// using a local lock_guard to lock mtx guarantees unlocking on destruction / exception:</span></span><br><span class="line">    <span class="built_in">std</span>::lock_guard&lt;<span class="built_in">std</span>::mutex&gt; lck (mtx);</span><br><span class="line">    print_even(id);</span><br><span class="line">  }</span><br><span class="line">  <span class="keyword">catch</span> (<span class="built_in">std</span>::logic_error&amp;) {</span><br><span class="line">    <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"[exception caught]\n"</span>;</span><br><span class="line">  }</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="built_in">std</span>::thread threads[<span class="number">10</span>];</span><br><span class="line">  <span class="comment">// spawn 10 threads:</span></span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">int</span> i=<span class="number">0</span>; i&lt;<span class="number">10</span>; ++i)</span><br><span class="line">    threads[i] = <span class="built_in">std</span>::thread(print_thread_id,i+<span class="number">1</span>);</span><br><span class="line"></span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">auto</span>&amp; th : threads) th.join();</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

上面的代码通过建立lock_guard，将mtx互斥量锁住。当退出作用域的时候，mtx解锁。上面的代码我有个疑惑的地方在于catch之后的作用域，lck已经析构掉了，如果这段时间互斥量没有被锁住，那么别的线程获取了互斥量的控制权，会不会导致exception和其他的输出发生冲突？也许对于异常处理有更深的一套机制我了解得还不够。

### [](about:blank#std-unique-lock "std::unique_lock")std::unique_lock

unique_lock相对于lock_gaurd会复杂很多。它其实本身更像是一个互斥量，是对互斥量的封装。

对于unique_lock的构造函数都会有多种情况：

(1) default constructor，默认构造不绑定任何对象。

(2) locking initialization，绑定一个互斥量，并且锁住它，如果互斥量本身就是锁住的，则线程被阻塞，和lock_gaurd一样。

(3) try-locking initialization(传入参数try_to_lock)，尝试绑定一个互斥量并且锁住，互斥量已经被锁，当前的unique_lock没有绑定任何对象。

(4) deferred initialization(传入参数defer_lock)，绑定一个互斥量，设定互斥量状态为解锁，这个互斥量没有被别的线程锁住。

(5) adopting initialization((传入参数adopt_lock))，绑定一个互斥量，即使该互斥量已经被当前线程锁定了，这是它和locking initialization的区别，即使被当前线程锁定了依然可以绑定，而不会继续调用lock导致死锁。如果没有锁定，就会将它锁定，

(6) locking for duration，相当于调用try_lock_for，在一段时间内互斥量都被别的线程锁定，那么它不会绑定任何互斥量。

(7) locking until time point，相当于调用try_lock_until，在一个时间点前互斥量都被别的线程锁定，那么它不会绑定任何互斥量。

(8) copy construction [deleted]

(9) move construction

它有很多其他的成员函数：

*   lock，对拥有的互斥量上锁
*   unlock，解锁
*   try_lock
*   try_lock_for,try_lock_until  
    上述成员函数都与互斥量本身的成员函数类似（目前不清楚它能否对mutex对象调用try_lock_for和try_lock_unique）。除此之外，它还有赋值函数，只不过只有move操作，没用拷贝功能。它还有其他的成员函数：
*   swap，交换互斥量以及它们的状态
*   release，释放当前拥有的互斥量
*   owns_lock，当前的锁拥有的互斥量被锁定了，返回true，否则的话，包括当前对象没有互斥量，或者互斥量状态为unlocked，都返回false
*   operate bool，它本身可以用来进行bool值的判断，依据是它是否拥有一个互斥量
*   mutex，得到当前绑定的互斥量的指针

下面是一个unique_lock的例子：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// unique_lock example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;         // std::thread</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;mutex&gt;          // std::mutex, std::unique_lock</span></span></span><br><span class="line"></span><br><span class="line"><span class="built_in">std</span>::mutex mtx;           <span class="comment">// mutex for critical section</span></span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">print_block</span> <span class="params">(<span class="keyword">int</span> n, <span class="keyword">char</span> c)</span> </span>{</span><br><span class="line">  <span class="comment">// critical section (exclusive access to std::cout signaled by lifetime of lck):</span></span><br><span class="line">  <span class="built_in">std</span>::unique_lock&lt;<span class="built_in">std</span>::mutex&gt; lck (mtx);</span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">int</span> i=<span class="number">0</span>; i&lt;n; ++i) { <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; c; }</span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">'\n'</span>;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="built_in">std</span>::<span class="function">thread <span class="title">th1</span> <span class="params">(print_block,<span class="number">50</span>,<span class="string">'*'</span>)</span></span>;</span><br><span class="line">  <span class="built_in">std</span>::<span class="function">thread <span class="title">th2</span> <span class="params">(print_block,<span class="number">50</span>,<span class="string">'$'</span>)</span></span>;</span><br><span class="line"></span><br><span class="line">  th1.join();</span><br><span class="line">  th2.join();</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

这里再列出来一个operate bool的例子，lck后面的参数决定了它会try_to_lock，也就是如果mtx已经被锁定了，则unique_lock不会绑定它。因此下面的函数会输出绑定成功的个数。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// unique_lock::operator= example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;vector&gt;         // std::vector</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;         // std::thread</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;mutex&gt;          // std::mutex, std::unique_lock, std::try_to_lock</span></span></span><br><span class="line"></span><br><span class="line"><span class="built_in">std</span>::mutex mtx;           <span class="comment">// mutex for critical section</span></span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">print_star</span> <span class="params">()</span> </span>{</span><br><span class="line">  <span class="built_in">std</span>::unique_lock&lt;<span class="built_in">std</span>::mutex&gt; lck(mtx,<span class="built_in">std</span>::try_to_lock);</span><br><span class="line">  <span class="comment">// print '*' if successfully locked, 'x' otherwise: </span></span><br><span class="line">  <span class="keyword">if</span> (lck)</span><br><span class="line">    <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">'*'</span>;</span><br><span class="line">  <span class="keyword">else</span>                    </span><br><span class="line">    <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">'x'</span>;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">vector</span>&lt;<span class="built_in">std</span>::thread&gt; threads;</span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">int</span> i=<span class="number">0</span>; i&lt;<span class="number">500</span>; ++i)</span><br><span class="line">    threads.emplace_back(print_star);</span><br><span class="line"></span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">auto</span>&amp; x: threads) x.join();</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>