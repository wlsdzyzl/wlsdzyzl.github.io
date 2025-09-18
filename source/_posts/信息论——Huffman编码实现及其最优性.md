---
title: 信息论——Huffman编码实现及其最优性
date: 2018-11-17 21:17:08
tags: [information theory, lossless coding,code]
mathjax: true
categories: 信息论
---
香农虽然提出了香农码，但是香农码很多情况下离最优码还差得不少。比如：K=2,$p(a_1) = 0.9999,p(a_2) = 0.0001$，这种偏差非常大的情况下，香农码给$a_1,a_2$的编码长度分别为：1,14.而实际上两个值，我们可以仅用一个bit就能区分开来。在这里介绍一个大名鼎鼎的最优前缀编码：Huffman编码。

<!--more-->

霍夫曼编码就不介绍了。因为这个东西我也实现过，知道它是怎么做的。不过如何提出来这个编码是非常有意思的。

霍夫曼码提出之前，人们一直在追求最优前缀编码。霍夫曼在MIT读博士的时候，老师给了一个作业题目：找到最优的二进制编码。霍夫曼想，想要证明已有编码是否是最优的太难了，所以他就想着自己找个编码方式。然后，诞生了霍夫曼编码。

唉，这就是大佬啊。

需要注意的是k叉霍夫曼树每个结点要么有k个孩子，要么没有孩子。确定了第一个，每次编码需要减少(k-1)个叶子结点。这意味着，信源的种类个数必须满足：1+n(k-1)。因此有时候需要填充0概率的字符来保证编码过程顺利。

最优性如何证明？

留个坑吧。看书上这个证明也挺长的。有时间了看完了再来写（也可能一直没有写）。

最后发一下多年前实现的huffman二进制编码：
Node.java:
```java
package hfm_compress;
import edu.princeton.cs.algs4.*;
import java.util.ArrayList;
import java.util.PriorityQueue;
import java.util.Iterator;
/*
 * Node  
 */
 class Code
{
    boolean used;
    short code;
    int size;
    
}
public class Node implements Comparable<Node>
{
   private Node left;
    private Node right;
    private int frep;
    private char symbol;
    public Node left()
    {
        return left;
    }
    public Node right()
    {
        return right;
    }
    public Node(Node l,Node r,int f,char s)
    {
        left = l;
        right = r;
        frep = f;
        symbol = s;
    }
    public int compareTo(Node n)
    {
        return this.frep - n.frep;
    }
    public int frep()
    {
        return frep;
    }
    public char symbol()
    {
        return symbol;
    }
    public boolean hasLeft()
    {
        return !(left == null);
    }
    public boolean hasRight()
    {
        return !(right == null);
    }
    public static void main(String []args)
    {
        System.out.println("wocao");
    }
    
}
```
HuffmanCompress.java
```java
package hfm_compress;
import java.io.*;
import edu.princeton.cs.algs4.*;
import java.util.ArrayList;
import java.util.PriorityQueue;
import java.util.Iterator;

public class HuffmanCompress
{
    
    public static Node BuildTree(int []frep)
    {
        Node n = null;
        Node left = null,right = null;
        PriorityQueue<Node> pq = new PriorityQueue<Node> ();
        for(int i = 0;i!=256;++i)
        {
            if(frep[i]!=0)
            {
            n = new Node(null,null,frep[i],(char)i);
            pq.add(n);
            }
        }
        while(pq.size()>1)
        {
            left = pq.poll();
            right = pq.poll();
            n = new Node(left,right,left.frep()+right.frep(),(char)0);
            pq.add(n);
        }
        n = pq.poll();
       return n;
    }
    public static Code [] BuildTable(Node tree)
    {
        Code []table = new Code[256];
        for(int i = 0;i!=256;++i)
            table[i] = new Code();
         BuildTable(tree,table,(short)0,0);
         return table;
    }
   private static void BuildTable(Node tree,Code []table,short code,int size)
   {
      if(tree.hasLeft())
          BuildTable(tree.left(),table,(short)(code<<1),size+1);
      if(tree.hasRight())
          BuildTable(tree.right(),table,(short)((code<<1)|1),size+1);
      if(!tree.hasRight()&&!tree.hasLeft())
      {
          table[tree.symbol()].size = size;
          table[tree.symbol()].code = code;
          table[tree.symbol()].used = true;
      }
   }
   public static void compress(BinaryIn in,BinaryOut out)
   {
       int frep[] = new int [256];
       for(int i = 0;i!=256;++i)
       {
           frep[i] = 0;
       }
       int max = 255;
       ArrayList<Character> data = new ArrayList<Character>();
       while(!in.isEmpty())
       {
          char sym = in.readChar();
          ++frep[sym];
          if(frep[sym]>max)
             max = frep[sym];
          data.add(sym);
              
       }
       for(int i = 0;i!=256;++i)
       {
           int a = frep[i]/(max/255);
           if(a == 0&&frep[i]>0)
               frep[i] = 1;
           else
               frep[i] = a;
       }
       Node tree = BuildTree(frep);
     
       Code []table = BuildTable(tree);
       Iterator<Character> ii = data.iterator();
       out.write(data.size());
       for(int i = 0;i!=256;++i)
           out.write(frep[i],8);
     
       while(ii.hasNext())
       {
          char b = ii.next();
          if(table[b].used)
          out.write(table[b].code,table[b].size);
       }
       out.close();
   }
   public static void expand(BinaryIn in,BinaryOut out)
   {
       int size = in.readInt();
     //  StdOut.println(size);
       int []frep = new int[256];
       for(int i = 0;i!=256;++i)
           frep[i] =(int)in.readChar();
       Node tree = BuildTree(frep);
       Node node = tree;
       int ipos = 0;
       while(size>0)
       {
           boolean t = in.readBoolean();
          // if(node == null)
            //   throw new Exception ("The Tree is not right!");
             if(t)
             node = node.right();
             else node = node.left();
             if(node == null)
                 return;
             if(!node.hasLeft()&&!node.hasRight())
             {
                 --size;
                 out.write(node.symbol());
                 node = tree;
             }
                 
       }
     out.close();

   }
   public static void main(String []args) throws IOException
   {
       BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
       String s1 = reader.readLine();
       String s2 = reader.readLine();
       String s3 = reader.readLine();
       if(s1.equals("compress"))
       {
    	   compress(new BinaryIn(s2),new BinaryOut(s3));
    	   System.out.println("the file has been compressed ! ");
    	   File old = new File(s2);
    	   File now = new File(s3);
    	   System.out.println("Old : "+old.length()+" new : "+now.length()+"\nthe compression ratio is "+(double)now.length()/old.length());
       }
       else
       {
    	   expand(new BinaryIn(s2),new BinaryOut(s3));
    	   System.out.println("the file has been expanded ! ");
    	   File old = new File(s2);
    	   File now = new File(s3);
    	   System.out.println("Old : "+old.length()+" new : "+now.length());
       }
       
   }
    
    
}
```
这两个文件放在一个名为hfm_compress的package里。