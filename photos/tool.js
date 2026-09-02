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
