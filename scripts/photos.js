const fs = require("fs");
const sizeOf = require("image-size").default;
const path = require("path");

hexo.extend.filter.register('before_generate', function () {
  const imgDir = path.join(hexo.source_dir, 'photos/uploaded');
  const output = path.join(hexo.source_dir, 'js/photos.js');

  if (!fs.existsSync(imgDir)) {
    console.log("⚠️ 没找到图片目录");
    return;
  }

  const files = fs.readdirSync(imgDir);
  let arr = [];

  files.forEach(file => {
    const filepath = path.join(imgDir, file);
    const stat = fs.statSync(filepath);

    if (stat.isFile()) {
      try {
        const buffer = fs.readFileSync(filepath);
        const dimensions = sizeOf(buffer);
        arr.push(dimensions.width + '.' + dimensions.height + ' ' + file);
      } catch (e) {
        console.error("读取失败:", file);
      }
    }
  });

  const content = "window.PHOTOS = " + JSON.stringify(arr, null, 2);
  fs.writeFileSync(output, content);

  console.log("✅ photos.js 已自动生成");
});