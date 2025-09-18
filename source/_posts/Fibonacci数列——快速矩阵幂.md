---
title: Fibonacci数列——快速矩阵幂
date: 2018-08-01 13:04:38
tags: [algorithm,Matrix,code]
categories: 算法
mathjax: true
---

今天想起来之前一个oj题目，是求类似与斐波那契数列一个数列的第N位。那时候接触到一个算法叫快速矩阵幂。

在这里我就用斐波那契数列的列子来简单说明一下如何用快速矩阵幂来解决这个题目。
<!--more-->

Fibonacci数列定义：$F(0) = 1, F(1) = 1, F(2) = 1, F(3) = 2, ...... F(n) = F(n-1)+F(n-2)$

首先说明一下，因为斐波那契数列增长速度非常迅速，得到的数字可能过大，因此我们将结果对10000007（$10^7+7$）取余来进行对比。

## 最天真的做法是用递归来解决：##
```cpp
long long fibNaive(long long n)
{
    if (n == 0)
    return 0;
    else if(n == 1)
    return 1;
    else return (fibNaive(n-1)%d+fibNaive(n-2)%d)%d;
}
```
不用说了，算法第一步就会介绍这个反例，来说明递归效率不一定会高(他的算法的运行时间随n的增长类似与Fibonacci数列的增长)。实际上这个做法到n = 40的时候就已经可以让人等的有点急了。

## 然后正常的做法是用简单的循环 ##
用两个数来代表之前的两个值，求出新值后继续依次更新前两个值，直到得到正确的结果：

```cpp
long long fibNormal(long long n)
{
    if (n == 0)
    return 0;
    else if(n == 1)
    return 1; 
    long long last1 = 0,last2 = 1;
    long long now;
    n--;
    while(n--)
    {
        now = (last1%d+last2%d)%d;
        last1 = last2;
        last2 = now;
    }
    return now;
}
```

这个算法时间复杂度是$O(n)$。$O(n)$已经是一个很好的复杂度了，那还有没有办法继续加快这个过程？？
## 快速矩阵幂 ##
观察斐波那契数列的生成过程，我们可以发现它们可以被写成下面的样子：
$$
F(N) = F(N-1) + F(N-2)
F(N-1) = F(N-1)+0*F(N-2)
$$
上面的式子可以写成矩阵形式：
$$
\left [
\begin{matrix}
F(N)\\
F(N-1)
\end{matrix}
\right ] =
\begin{bmatrix}
1&1\\
1&0
\end{bmatrix}
\begin{bmatrix}
F(N-1)\\
F(N-2)
\end{bmatrix}
$$
不断重复上面过程，往后继续展开，我们可以得到：
$$
\left [
\begin{matrix}
F(N)\\
F(N-1)
\end{matrix}
\right ] =
{
\begin{bmatrix}
1&1\\
1&0
\end{bmatrix}
}^{n-1}
\begin{bmatrix}
F(1)\\
F(0)
\end{bmatrix}
$$
因此我们可以把重点放到怎么来求中间这个矩阵的幂。而快速矩阵幂的思想也很简单，就类似与对于数字的幂的求法一致。比如：$X^9 = X^8 \cdot X$,而$X^8 = (X^4)^2 = ((X^2)^2)^2$，因此需要3+1次乘法就可以算出来8次幂，容易看出来快速矩阵幂的时间复杂度是$O(\log (n))$。
因此利用快速矩阵幂，可以将斐波那契数列的求法进一步加速。

至于如何实现就是细节问题了，需要注意的时候是乘法取余数的时候，两方都小于10000007,乘积依然可能会超过int的范围（10000007*10000007），导致出错，因此我在这里选择long long类型，这样可以保证结果的正确性。

实现分为几步1：定义矩阵乘法：
```c++
typedef vector<vector<long long>> Matrix;
long long d = 10000007;
Matrix m_mul(const Matrix &m,const Matrix &n)
{
    //check(m,n);
    Matrix result = vector<vector<long long>>(m.size(),vector<long long>(n[0].size()));
   
    for(long long i = 0;i!=m.size();++i)
    for(long long j = 0;j!=n[0].size();++j)
    {
         long long temp = 0;
        for(long long k = 0;k!=n.size();++k )
         temp = ((m[i][k]*n[k][j])%d + temp%d)%d;
         result[i][j] = temp;
    }
    return result;
 }
```
第二，定义help函数，专门对矩阵的幂为2的整数次幂来计算：
```c++
 Matrix help(const Matrix & m,long long n)
{
    Matrix result;
    if(n == 1)
    return m;
    else if(n == 2)
    return m_mul(m,m);
    result = help(m,n/2);
     return m_mul(result,result);
}
```
第三步，实际的quickMartrixPower函数，它实际上会将n次幂拆散为2的整数次幂之和，实际实现将n用二进制表示，如9 = (1001)$_b$。

```c++
Matrix quickMatrixPower(const Matrix &m,long long n)
{
    //check(m);
    long long np = 1;
    Matrix result = vector<vector<long long>> (m.size(),vector<long long>(m.size()));
    for(long long i = 0;i!=m.size();++i)
    result[i][i] = 1;
    while(n!=0)
    {
        if(n&1)
        result = m_mul(result,help(m,np));
        n = n >> 1;
        np = np<<1;
    }
    return result;
}
```
最后用fib函数封装起来：

```c++
long long fib(long long n)
{
    if(n == 0)
    return 0;
    if(n == 1)
    return 1;
    else
       {
           Matrix start = { {1,1},{1,0} };
           Matrix m = quickMatrixPower(start,n-1);
           return m[0][0];
       }
}
```
最后用main函数利用clock函数进行时间测试
```c++
int main()
{
    long long n,result;
    double start,end;
    while(cin>>n)
    {
    start = clock();
    result = fib(n);
    end = clock();
    cout<<result<<" "<<end-start<<endl;
    start = clock();
    result = fibNormal(n);
    end = clock();
    cout<<result<<" "<<end-start<<endl;
    start = clock();
    if(n<45)
    {
    result = fibNaive(n);
    end = clock();
    cout<<result<<" "<<end-start<<endl;
    }
    }
}
```
输出第一个为结果，第二个是运行的clock差值，结果如下：
```c
输入：40
2334085 0
2334085 0
2334085 6956
输入：1000000//此时naive的算法已经无法求出来
9640841 0
9640841 19
输入：100000000
129680 0
129680 3295
```
可以看到快速矩阵幂算法在数据量很大的时候很牛逼。
不过，斐波那契数列还有个公式：
$$F(n) = \frac{1}{\sqrt 5}{\left [ {\left ( \frac {1+\sqrt 5}{2} \right )}^n - {\left ( \frac {1-\sqrt 5}{2} \right )}^n  \right ]}
$$
所以学计算机不如学数学啊！


