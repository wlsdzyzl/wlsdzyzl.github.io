---
title: Dear friends & Journey & Painting & Things I Like
date: 2023-10-21 00:00:00
type: "photos"
---
人生来去匆匆，与一些朋友关系已经从热烈变得平淡，另外一些可能之后会变得平淡，但是：
![](/photos/%E6%B7%B7%E6%B2%8C%E6%AD%A6%E5%A3%AB1.png)
![](/photos/%E6%B7%B7%E6%B2%8C%E6%AD%A6%E5%A3%AB2.png)

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


<!-- 先加载数据 -->
<script src="/js/photos.js"></script>

<!-- 再加载你的逻辑 -->
<script>
var photo = {
    page: 1,
    offset: 20,

    init: function () {
        if (!window.PHOTOS) {
            console.error("PHOTOS 数据未加载");
            return;
        }
        this.render(this.page, window.PHOTOS);
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
                        '<a href="/photos/uploaded/' + imgNameWithPattern + '?raw=true">' +
                          '<img class="lazy" data-original="/photos/uploaded/' + imgNameWithPattern + '?raw=true" />' +
                        '</a>' +
                      '</div>' +
                  '</div>';
        }

        $(".ImageGrid").append(li);
        $(".lazy").lazyload({ effect: "fadeIn" });
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
};

photo.init();
</script>