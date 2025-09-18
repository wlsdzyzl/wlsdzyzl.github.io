---
title: ChangeLog——从头到尾部属hexo
date: 2023-10-21 06:03:52
tags:
---
文艺复兴，突发奇想想要重新把自己的博客搭起来。仔细研究一下，发现其实变化不大，但还是遇到了一些问题，所以在这里记录一下。
<!--more-->
## 安装node.js
我们知道hexo实际上是基于node.js的，因此我们需要安装node.js。
## 部属hexo
### 安装hexo
有了node.js，hexo的安装是非常简单的，只需要通过下面的命令即可：
### hexo server
### 在github page上发布我们的blog
比较理想的情况是，我们既可以用github保存或者说备份我们的源文件（主要是md文件），也可以用它来发布页面，这样我们就不需要一个额外的服务器了。具体的做法是我们可以创建一个库命名为xxx.github.io，然后用其主分支（main）来备份源文件，再创建一个额外的分支，用来存储hexo生成的页面，并且发布出去。幸运的是，这些功能其实已经部分集成在现有版本的hexo中了。
### 支持latex显示
一般来说下载hexo-math后就可以支持latex显示了，如果用了主题，需要在theme的_config.yml下指定：
```yaml
math:
  # Default (false) will load mathjax / katex script on demand.
  # That is it only render those page which has `mathjax: true` in front-matter.
  # If you set it to true, it will load mathjax / katex script EVERY PAGE.
  every_page: true

  mathjax:
    enable: true
    # Available values: none | ams | all
    tags: none
```
但是有可能会有一些显示问题，例如多行无法显示。这个问题不知道有没有很好的solution，但是一个做法是避免转移冲突，在代码块前后分别添加`{% raw %}`以及`{% endraw %}`，例如：
```markdown
{% raw %}
$$
\begin{aligned}
\log p_{\theta}(x) &= \log p_\theta(x) \cdot \int_z q(z|x)dz \\
                  &= \int_z \log p_\theta(x) \cdot q(z|x)dz \\ 
                  &= \int_z q(z|x) \log \frac{p(x, z)} {p(z|x)} dz \\ 
                  &= \int_z q(z|x)\log\frac{q(z|x)p(x,z)} {p(z|x)q(z|x)}dz \\ 
                  &=\int_z q(z|x)\log\frac{q(z|x)} {p(z|x)}dz + \int_z q(z|x)\log \frac{p(x,z)} {q(z|x)}dz \\ 
                  &= D_{\text{KL}}\left(q(z|x) \| p(z|x)\right) + \int_z q(z|x)\log \frac{p(x,z)} {q(z|x)}dz \\ 
                  &\geq \int_z q(z|x)\log \frac{p(x,z)} {q(z|x)}dz \\
                  &= \int_z q(z|x)\log \frac{p(z) p(x|z)} {q(z|x)}dz \\ 
                  &= \int_z q(z|x)\log \frac{p(z)} {q(z|x)}dz + \int_z q(z|x)\log p(x|z)dz\\ 
                  &= - D_{\text{KL}}\left(q(z|x)\| p(z)\right) + \mathbb{E}_{q(z|x)}\left[\log p(x|z)\right]
\end{aligned}
$$
{% endraw %}
```
### 设置相册
首先，使用`hexo new page photos`命令简历photo页面。接着我会在photo目录下创建一个uploaded文件夹用来上传照片，并且下属脚本来获取照片的信息：
```javascript
"use strict";
const fs = require("fs");
const sizeOf = require('image-size').default;
const path = "uploaded";
const output = "photoslist.json";

fs.readdir(path, function (err, files) {
    if (err) {
        console.error(err);
        return;
    }
    
    let arr = [];
    (function iterator(index) {
        if (index === files.length) {
            // console.log("最终数组:", arr); // 打印数组
            fs.writeFile(output, JSON.stringify(arr, null, "\t"), (err) => {
                if (err) {
                    console.error('写入文件时发生错误：', err);
                } else {
                    console.log('文件写入成功。');
                }
            });
            return;
        }

        const filepath = path + "/" + files[index];
        fs.stat(filepath, function (err, stats) {
            if (err) {
                console.error(err);
                iterator(index + 1);
                return;
            }
            if (stats.isFile()) {
                
                try {
                    
                    const buffer = fs.readFileSync(filepath); // 读取成 Buffer
                    const dimensions = sizeOf(buffer);  
                    console.log(`文件: ${files[index]}, 尺寸: ${dimensions.width}x${dimensions.height}`);
                    arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[index]);
                } catch (e) {
                    console.error(`无法读取图片 ${files[index]}:`, e.message);
                }
            }
            iterator(index + 1);
        });

    })(0);
});
```
运行这个脚本会将照片信息保存到目录的`photolist.json`下。最后我会在`photos/index.md`添加下面一段代码，它使用js读取photo列表，并且列出相册：
```html
<style>
    .ImageGrid {width: 100%;max-width: 1040px;margin: 0 auto; text-align: center;}
    /* .ImageInCard {border-radius: 8px;} */
    .TextInCard {font-size: 24px;}
</style>
<!-- 图片容器 -->
<div class="ImageGrid"></div>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Minigrid -->
<script src="https://cdn.jsdelivr.net/npm/minigrid@3.2.2/dist/minigrid.min.js"></script>

<!-- jQuery LazyLoad（可选，如果你想懒加载图片） -->
<script src="https://cdn.jsdelivr.net/npm/jquery-lazyload/jquery.lazyload.min.js"></script>

<script>
var photo = {
    page: 1,
    offset: 20,
    init: function () {
        var that = this;
        fetch('/photos/photoslist.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            that.render(that.page, data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    },
    render: function (page, data) {
        var begin = (page - 1) * this.offset;
        var end = page * this.offset;
        if (begin >= data.length) return;

        var li = "";
        for (var i = begin; i < end && i < data.length; i++) {
            var parts = data[i].split(' ');
            var imgNameWithPattern = parts[1];
            var imgName = imgNameWithPattern.split('.')[0];
            li += '<div class="card">' +
                      '<div class="TextInCard">' + imgName + '</div>' +
                      '<div class="ImageInCard" style="width:100%">' +
                        '<a href="/photos/uploaded/' + imgNameWithPattern + '?raw=true" data-caption="' + imgName + '">' +
                          '<img class="lazy" data-original="/photos/uploaded/' + imgNameWithPattern + '?raw=true" />' +
                        '</a>' +
                      '</div>' +
                  '</div>';
        }
        $(".ImageGrid").append(li);

        // 初始化 LazyLoad
        $(".lazy").lazyload({ effect: "fadeIn" });

        // 初始化 Minigrid
        this.minigrid();
    },
    minigrid: function() {
        var grid = new Minigrid({
            container: '.ImageGrid',
            item: '.card',
            gutter: 12
        });
        grid.mount();
        window.addEventListener('resize', function() {
            grid.mount();
        });
    }
}
// 执行初始化
photo.init();
</script>
```
## 结束
可以开始愉快地记录了。希望这个重启的博客能让生活变得更好一些。