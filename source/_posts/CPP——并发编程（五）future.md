---
title: CPP——并发编程（五）future
date: 2019-03-31 00:00:00
tags: [cpp,concurrent programming,Programming language]
categories: 程序设计语言
mathjax: true
---   


对于multi thread的内容，我们还有一个没有介绍。future这个名字很奇怪，为什么叫future？future可以异步访问被不同线程中特定的provider设定的值，可以用来同步不同的线程。看到这里很迷糊，还是看它到底怎么用吧。

<!--more-->


future包含了两个provider类：std::promise，std::package_task，两个future类：std::future,std::shared_future，一个provider函数：async，初次之外，它还有其他的函数和类型：

std::future_category（function），std::future_error，std::future_errc，std::future_status以及std::launch。

从这里可以大致看出来，主要操作的对象是future和provider两个类型（并不是具体的cpp类）。他们之间的关系简单来说，就是每个provider都拥有一个共享状态的访问权限，该共享状态可以联系到一个future对象。provider将共享状态设置为ready，与future对象访问共享状态是同步的。

### [](about:blank#std-promise "std::promise")std::promise

promise是一个模板类，而且有两个特殊化模板：引用和void。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">T</span>&gt;  <span class="title">promise</span>;</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">R</span>&amp;&gt; <span class="title">promise</span>&lt;R&amp;&gt;;</span>     <span class="comment">// specialization : T is a reference type (R&amp;)</span></span><br><span class="line"><span class="keyword">template</span> &lt;&gt;         promise&lt;<span class="keyword">void</span>&gt;;   <span class="comment">// specialization : T is void</span></span><br></pre></td></tr></tbody></table>

一个promise对象，可以存储一个T类型的值，该值可以被一个future对象从另外的线程取到，从而使得线程之间同步。在构造promise时，它和一个新的共享状态联系到一起，该共享状态可以存储一个T类的值，或者是一个异常来自std::exception。

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//default (1)	</span></span><br><span class="line">promise();</span><br><span class="line"><span class="comment">//with allocator (2)	</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Alloc</span>&gt; <span class="title">promise</span> (<span class="title">allocator_arg_t</span> <span class="title">aa</span>, <span class="title">const</span> <span class="title">Alloc</span>&amp; <span class="title">alloc</span>);</span></span><br><span class="line"><span class="comment">//copy [deleted] (3)	</span></span><br><span class="line">promise (<span class="keyword">const</span> promise&amp;) = <span class="keyword">delete</span>;</span><br><span class="line"><span class="comment">//move (4)	</span></span><br><span class="line">promise (promise&amp;&amp; x) <span class="keyword">noexcept</span>;</span><br></pre></td></tr></tbody></table>

可以看到的是，promise有默认构造函数，也可以指定别的分配器，但是它的拷贝构造被删除了，保留了移动构造函数，对于赋值函数也是一样的，保存了移动赋值，删除了拷贝。  
下面是promise的其他成员函数：

| 函数 | 值 |
| --- | --- |
| operator= | Move-assign promise (public member function ) |
| get_future | Get future (public member function ) |
| set_value | Set value (public member function ) |
| set_exception | Set exception (public member function ) |
| set_value_at_thread_exit | Set value at thread exit (public member function ) |
| set_exception_at_thread_exit | Set exception at thread exit (public member function ) |
| swap | Swap shared states (public member function ) |

上述成员函数的功能都显而易见，set系列运行后，共享状态变成ready。值得注意的是，在set_value_at_thread_exit和set_exception_at_thread_exit结束之前，别的线程尝试set共享状态的value会抛出错误。

这里重点说明一下get_future，它可以使得当前promise对象的共享状态与一个future对象联系起来。当get_future被调用的时，promise对象和future对象共享同样的共享状态：promise对象是状态异步提供者，可以在某个时间点设置状态值，而future是异步返回对象，它可以获取共享状态值，在有必要的情况下等待它的状态变为ready。下面是使用promise的一个例子。

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// promise example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;functional&gt;     // std::ref</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;         // std::thread</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;future&gt;         // std::promise, std::future</span></span></span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">void</span> <span class="title">print_int</span> <span class="params">(<span class="built_in">std</span>::future&lt;<span class="keyword">int</span>&gt;&amp; fut)</span> </span>{</span><br><span class="line">  <span class="keyword">int</span> x = fut.get();</span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"value: "</span> &lt;&lt; x &lt;&lt; <span class="string">'\n'</span>;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="built_in">std</span>::promise&lt;<span class="keyword">int</span>&gt; prom;                      <span class="comment">// create promise</span></span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::future&lt;<span class="keyword">int</span>&gt; fut = prom.get_future();    <span class="comment">// engagement with future</span></span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::<span class="function">thread <span class="title">th1</span> <span class="params">(print_int, <span class="built_in">std</span>::ref(fut))</span></span>;  <span class="comment">// send future to new thread</span></span><br><span class="line"></span><br><span class="line">  prom.set_value (<span class="number">10</span>);                         <span class="comment">// fulfill promise</span></span><br><span class="line">                                               <span class="comment">// (synchronizes with getting the future)</span></span><br><span class="line">  th1.join();</span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

主线程中prom还没设置值之前，共享状态标志还不是ready，这时候在子线程th1中，fut调用get使得线程阻塞，等待共享状态的标志变为ready，而当主线程中prom调用set_value之后，子线程接触阻塞，并得到设定的值，输出：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">value <span class="number">10</span></span><br></pre></td></tr></tbody></table>

### [](about:blank#std-package-task "std::package_task")std::package_task

一个package_task对象是一个callable对象的封装，并且允许它的结果被异步读取。它和std::function类似，只不过有共享状态来存储它的返回值。一般来说，package_task包含两个元素：

*   stored task，也就是对应的callable对象，接受一个对应的参数，返回一个Ret类型的值
*   shared_state，共享状态，用来存储返回值，并且可以被future对象访问

共享状态直到不和任何的provider或者future联系了才会被销毁。

package_task的构造函数如下：

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//default (1)	</span></span><br><span class="line">packaged_task() <span class="keyword">noexcept</span>;</span><br><span class="line"><span class="comment">//initialization (2)	</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Fn</span>&gt;</span></span><br><span class="line"><span class="class">  <span class="title">explicit</span> <span class="title">packaged_task</span> (<span class="title">Fn</span>&amp;&amp; <span class="title">fn</span>);</span></span><br><span class="line"><span class="comment">//with allocator (3)	</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Fn</span>, <span class="title">class</span> <span class="title">Alloc</span>&gt;</span></span><br><span class="line"><span class="class">  <span class="title">explicit</span> <span class="title">packaged_task</span> (<span class="title">allocator_arg_t</span> <span class="title">aa</span>, <span class="title">const</span> <span class="title">Alloc</span>&amp; <span class="title">alloc</span>, <span class="title">Fn</span>&amp;&amp; <span class="title">fn</span>);</span></span><br><span class="line"><span class="comment">//copy [deleted] (4)	</span></span><br><span class="line">packaged_task (packaged_task&amp;) = <span class="keyword">delete</span>;</span><br><span class="line"><span class="comment">//move (5)	</span></span><br><span class="line">packaged_task (packaged_task&amp;&amp; x) <span class="keyword">noexcept</span>;</span><br></pre></td></tr></tbody></table>

它的构造函数与promise实际上各个类型差不多。

下面是package_task的其他成员函数。

| 函数 | 描述 |
| --- | --- |
| operator= | Move-assign packaged_task (public member function ) |
| valid | Check for valid shared state (public member function ) |
| get_future | Get future (public member function ) |
| operator() | Call stored task (public member function ) |
| make_ready_at_thread_exit | Call stored task and make ready at thread exit (public member function ) |
| reset | Reset task (public member function ) |
| swap | Swap packaged_task (public member function ) |

在上述函数中，valid()检查共享状态的有效性。对于默认构造函数，没有与任何函数绑定，该函数返回false。这是因为package_task对象需要绑定任务，因此有效值是必要的，而promise并不需要这样一个函数，它创建之后就一定是有效的。reset()会重置共享状态，但是会保留之前包装的任务。

package_task一个例子如下：

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// packaged_task construction / assignment</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;     // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;utility&gt;      // std::move</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;future&gt;       // std::packaged_task, std::future</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;thread&gt;       // std::thread</span></span></span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="built_in">std</span>::packaged_task&lt;<span class="keyword">int</span>(<span class="keyword">int</span>)&gt; foo;                          <span class="comment">// default-constructed, foo.valid() will reture a false</span></span><br><span class="line">  <span class="built_in">std</span>::packaged_task&lt;<span class="keyword">int</span>(<span class="keyword">int</span>)&gt; bar ([](<span class="keyword">int</span> x){<span class="keyword">return</span> x*<span class="number">2</span>;}); <span class="comment">// initialized</span></span><br><span class="line"></span><br><span class="line">  foo = <span class="built_in">std</span>::move(bar);                                      <span class="comment">// move-assignment</span></span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::future&lt;<span class="keyword">int</span>&gt; ret = foo.get_future();  <span class="comment">// get future</span></span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::thread(<span class="built_in">std</span>::move(foo),<span class="number">10</span>).detach();  <span class="comment">// spawn thread and call task</span></span><br><span class="line"></span><br><span class="line">  <span class="comment">// ...</span></span><br><span class="line"></span><br><span class="line">  <span class="keyword">int</span> value = ret.get();                    <span class="comment">// wait for the task to finish and get result</span></span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"The double of 10 is "</span> &lt;&lt; value &lt;&lt; <span class="string">".\n"</span>;</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

上面代码中，首先是让foo绑定了一个任务，接着创建线程，因为foo本身是一个callable对象，因此包装的任务就开始执行，这时候ret.get()会被阻塞，直到任务结束，共享状态变为ready，得到了value的值，输出结果为：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">The double of 10 is 20.</span><br></pre></td></tr></tbody></table>

### [](about:blank#std-future "std::future")std::future

正如上面所说的，provider和future总是密切相关的。这里我们开始介绍类std::future。

一个std::future对象一般是由provider产生的，比如promise，package_task或者async函数。它可以读取共享状态的值，在之前的例子中它利用get，来阻塞当前线程，直到共享状态的标准变为ready才会返回得到共享状态的值。

std::future有默认构造函数和移动构造函数，一般利用的都是它的移动构造函数，通过provider的get_future得到。std::future还有其他的几个构造函数：

**share**

得到std::shared_future对象，调用之后它不在和任何共享状态相关联了。

**get**

get之前的例子多次用到了，在相关联的共享状态标志为ready之前它会阻塞当前的线程，直到provider设定了值或者得到异常，它将接触阻塞并返回对应的值或者异常。

**valid**

很简单，检查future关联的共享状态是否有效，默认构造的std::future以及调用share之后的std::future对象返回false。

**wait**

wait和get一样，但是不会读取共享状态的值，只会阻塞线程。

**wait_for**

等待一段时间，在该段时间内共享状态的标志不是ready则阻塞线程，超时会解除阻塞。

**wait_until**  
等待到某个时间点之前，在时间点前共享状态的标志不是ready则阻塞线程，超时会解除阻塞。

上述两个函数返回值有下面几个可能：

| 值 | 描述 |
| --- | --- |
| future_status::ready | 共享状态的标志已经变为 ready，即 Provider 在共享状态上设置了值或者异常。 |
| future_status::timeout | 超时，即在规定的时间内共享状态的标志没有变为 ready。 |
| future_status::deferred | 共享状态包含一个 deferred 函数。 |

### [](about:blank#shared-future "shared_future")shared_future

std::shared_future与 std::future类似，但是 td::shared_future可以拷贝，多个std::shared_future可以共享某个共享状态。shared_future可以通过某个std::future对象隐式转换，或者通过 std::future::share()得到，无论哪种转换，被转换的那个std::future对象都会变为invalid。

它的构造函数如下：

| 类型 | 函数形式 |
| --- | --- |
| default (1) | shared_future() noexcept; |
| copy (2) | shared_future (const shared_future& x); |
| move (3) | shared_future (shared_future&& x) noexcept; |
| move from future (4) | shared_future (future&& x) noexcept; |

其他的和shared_future一样，就不多介绍了。

### [](about:blank#future-error "future_error")future_error

future_error继承logic_error，是future可能出现的异常。  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="class"><span class="keyword">class</span> <span class="title">future_error</span> :</span> <span class="keyword">public</span> logic_error;</span><br></pre></td></tr></tbody></table>

### [](about:blank#async "async")async

还有一个provider函数没介绍，就是async。async是模板函数，有两个重载：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//unspecified policy (1) 	</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Fn</span>, <span class="title">class</span>... <span class="title">Args</span>&gt;</span></span><br><span class="line"><span class="class">  <span class="title">future</span>&lt;typename result_of&lt;Fn(Args...)&gt;::type&gt;</span></span><br><span class="line"><span class="class">    <span class="title">async</span>(<span class="title">Fn</span>&amp;&amp; <span class="title">fn</span>, <span class="title">Args</span>&amp;&amp;... <span class="title">args</span>);</span></span><br><span class="line"><span class="comment">//specific policy (2) 	</span></span><br><span class="line"><span class="keyword">template</span> &lt;<span class="class"><span class="keyword">class</span> <span class="title">Fn</span>, <span class="title">class</span>... <span class="title">Args</span>&gt;</span></span><br><span class="line"><span class="class">  <span class="title">future</span>&lt;typename result_of&lt;Fn(Args...)&gt;::type&gt;</span></span><br><span class="line"><span class="class">    <span class="title">async</span>(<span class="title">launch</span> <span class="title">policy</span>, <span class="title">Fn</span>&amp;&amp; <span class="title">fn</span>, <span class="title">Args</span>&amp;&amp;... <span class="title">args</span>);</span></span><br></pre></td></tr></tbody></table>

这两个重载的区别是有没有指定launch，也就是启动策略。启动策略有三种：

| 启动策略 | 描述 |
| --- | --- |
| launch::async | 启动一个新的线程来调用fn |
| launch::deferred | 延迟启动，直到future调用了get或者wait |
| launch::async or launch::deferred | 自动选择，取决于操作系统 |

下面是async的例子：

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// async example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;future&gt;         // std::async, std::future</span></span></span><br><span class="line"></span><br><span class="line"><span class="comment">// a non-optimized way of checking for prime numbers:</span></span><br><span class="line"><span class="function"><span class="keyword">bool</span> <span class="title">is_prime</span> <span class="params">(<span class="keyword">int</span> x)</span> </span>{</span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"Calculating. Please, wait...\n"</span>;</span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">int</span> i=<span class="number">2</span>; i&lt;x; ++i) <span class="keyword">if</span> (x%i==<span class="number">0</span>) <span class="keyword">return</span> <span class="literal">false</span>;</span><br><span class="line">  <span class="keyword">return</span> <span class="literal">true</span>;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="comment">// call is_prime(313222313) asynchronously:</span></span><br><span class="line">  <span class="built_in">std</span>::future&lt;<span class="keyword">bool</span>&gt; fut = <span class="built_in">std</span>::async (is_prime,<span class="number">313222313</span>);</span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"Checking whether 313222313 is prime.\n"</span>;</span><br><span class="line">  <span class="comment">// ...</span></span><br><span class="line"></span><br><span class="line">  <span class="keyword">bool</span> ret = fut.get();      <span class="comment">// waits for is_prime to return</span></span><br><span class="line"></span><br><span class="line">  <span class="keyword">if</span> (ret) <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"It is prime!\n"</span>;</span><br><span class="line">  <span class="keyword">else</span> <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"It is not prime.\n"</span>;</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

上面的代码先利用async返回了future，同时也启动了任务，而fut通过调用get被阻塞，直到任务执行完毕得到返回值。因此，在使用async之后，实际上任务就启动了，只不过启动策略有延迟和不延迟的区别。

输出(前两行可能会错乱)：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">Checking whether <span class="number">313222313</span> is prime.</span><br><span class="line">Calculating. Please, wait...</span><br><span class="line">It is prime!</span><br></pre></td></tr></tbody></table>

### [](about:blank#%E5%85%B6%E4%BB%96%E6%9E%9A%E4%B8%BE%E7%B1%BB%E5%9E%8B "其他枚举类型")其他枚举类型

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">enum</span> <span class="class"><span class="keyword">class</span> <span class="title">future_errc</span>;</span></span><br><span class="line"><span class="keyword">enum</span> <span class="class"><span class="keyword">class</span> <span class="title">future_status</span>;</span></span><br><span class="line"><span class="keyword">enum</span> <span class="class"><span class="keyword">class</span> <span class="title">launch</span>;</span></span><br></pre></td></tr></tbody></table>

### [](about:blank#std-future-errc "std::future_errc")std::future_errc

| 枚举值 | 描述 |
| --- | --- |
| broken_promise | 与该future共享状态相关联的promise对象在设置值或者异常之前一被销毁 |
| future_already_retrieved | 与该std::future对象相关联的共享状态的值已经被当前provider获取了，即调用了std::future::get函数 |
| promise_already_satisfied | std::promise对象已经对共享状态设置了某一值或者异常 |
| no_state | 无共享状态。 |

### [](about:blank#std-future-status "std::future_status")std::future_status

用于wait_for和wait_until的返回值

| 枚举值 | 描述 |
| --- | --- |
| future_status::ready | wait_for(或wait_until)因为共享状态的标志变为ready而返回 |
| future_status::timeout | wait_for(或wait_until)因为超时而返回 |
| future_status::deferred | 共享状态包含了deferred函数。 |

### [](about:blank#std-launch "std::launch")std::launch

用于指示启动策略，就像之前的async中使用的一样。

| 枚举值 | 描述 |
| --- | --- |
| launch::async | 启动一个新的线程来调用fn |
| launch::deferred | 延迟启动，直到future调用了get或者wait |

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// async example</span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;       // std::cout</span></span></span><br><span class="line"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;future&gt;         // std::async, std::future</span></span></span><br><span class="line"></span><br><span class="line"><span class="comment">// a non-optimized way of checking for prime numbers:</span></span><br><span class="line"><span class="function"><span class="keyword">bool</span> <span class="title">is_prime</span> <span class="params">(<span class="keyword">int</span> x)</span> </span>{</span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"Calculating. Please, wait...\n"</span>;</span><br><span class="line">  <span class="keyword">for</span> (<span class="keyword">int</span> i=<span class="number">2</span>; i&lt;x; ++i) <span class="keyword">if</span> (x%i==<span class="number">0</span>) <span class="keyword">return</span> <span class="literal">false</span>;</span><br><span class="line">  <span class="keyword">return</span> <span class="literal">true</span>;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">()</span></span></span><br><span class="line"><span class="function"></span>{</span><br><span class="line">  <span class="comment">// call is_prime(313222313) asynchronously:</span></span><br><span class="line">  <span class="built_in">std</span>::future&lt;<span class="keyword">bool</span>&gt; fut = <span class="built_in">std</span>::async (<span class="built_in">std</span>::launch::deferred,is_prime,<span class="number">313222313</span>);</span><br><span class="line"></span><br><span class="line">  <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"Checking whether 313222313 is prime.\n"</span>;</span><br><span class="line">  <span class="comment">// ...</span></span><br><span class="line"></span><br><span class="line">  <span class="keyword">bool</span> ret = fut.get();      <span class="comment">// waits for is_prime to return</span></span><br><span class="line"></span><br><span class="line">  <span class="keyword">if</span> (ret) <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"It is prime!\n"</span>;</span><br><span class="line">  <span class="keyword">else</span> <span class="built_in">std</span>::<span class="built_in">cout</span> &lt;&lt; <span class="string">"It is not prime.\n"</span>;</span><br><span class="line"></span><br><span class="line">  <span class="keyword">return</span> <span class="number">0</span>;</span><br><span class="line">}</span><br></pre></td></tr></tbody></table>

这段代码和之前的示例只有一个不同，就是使用了延迟启动策略，但是这个保证了他的输出一定是：  

<table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">Checking whether <span class="number">313222313</span> is prime.</span><br><span class="line">Calculating. Please, wait...</span><br><span class="line">It is prime!</span><br></pre></td></tr></tbody></table>

而不会出现错乱。

到现在，我们就对c++11多线程有了大致的了解了，如何熟练使用还需要在日后的工作中多加练习。很多时候一件事情可以用多个方法实现，看自己的策略。

