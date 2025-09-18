photo ={
    page: 1,
    offset: 20,
    init: function () {
        // alert('fuck???');
        var that = this;
        fetch('photoslist.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json(); // 将响应解析为JSON格式
        })
        .then(data => {
            // alert(data);
            that.render(that.page, data);
            //that.scroll(data);
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
        console.log("成功获取JSON数据：");
        var that = this;
        console.log("成功获取JSON数据：");
        $.getJSON("/photos/photoslist.json", function (data) {
            console.log("成功获取JSON数据：", data);
            alert('fuck???');
            that.render(that.page, data);
            //that.scroll(data);
        });
    },
    render: function (page, data) {
        var begin = (page - 1) * this.offset;
        var end = page * this.offset;
        if (begin >= data.length) return;
        var html, imgNameWithPattern, imgName, imageSize, imageX, imageY, li = "";
        for (var i = begin; i < end && i < data.length; i++) {
           imgNameWithPattern = data[i].split(' ')[1];
           imgName = imgNameWithPattern.split('.')[0]
           imageSize = data[i].split(' ')[0];
           imageX = imageSize.split('.')[0];
           imageY = imageSize.split('.')[1];
            li += 
                '<div class="TextInCard">' + imgName + '</div>' +
                '<div class="ImageInCard" style="width:100%"' +
                      '<a href="/photos/uploaded/' + imgNameWithPattern + '?raw=true" data-caption="' + imgName + '">' +
                        '<img src="/photos/uploaded/' + imgNameWithPattern + '?raw=true"/>' +
                      '</a>' +
                  '</div>'
        }
        $(".ImageGrid").append(li);
        $(".ImageGrid").lazyload();
        this.minigrid();
    },
    minigrid: function() {
        var grid = new Minigrid({
            container: '.ImageGrid',
            item: '.card',
            gutter: 12
        });
        grid.mount();
        $(window).resize(function() {
           grid.mount();
        });
    }
}

photo.init(); 
