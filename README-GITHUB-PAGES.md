# 次元整研社 · GitHub Pages 正式上线包

## 部署

1. 将本目录文件上传到 GitHub Pages 仓库根目录。
2. 保留原项目的 `assets/` 目录，尤其是 `assets/images/` 下的背景、画廊和 QQ 群二维码图片。
3. GitHub → Settings → Pages → Deploy from a branch → 选择默认分支和 `/ (root)`。
4. 等待 Pages 部署完成后，用 HTTPS 地址访问。

## 文件

- `index.html`：网站首页
- `style.css`：主题与响应式样式
- `main.js`：交互逻辑
- `manifest.webmanifest`：PWA 配置（**必须由 `index.html` 里的 `<link rel="manifest">` 引用，缺了就无法安装**）
- `sw.js`：离线缓存
- `404.html`：GitHub Pages 404 页面
- `robots.txt` / `sitemap.xml`：搜索引擎基础配置
- `.nojekyll`：关闭 Jekyll 处理，减少静态资源路径问题
- `CNAME`：自定义域名 `acg-lab.xyz`（改域名时这里、`robots.txt`、`sitemap.xml`、`index.html` 的 canonical / og:url / og:image 要一起改）

## 图片资源

`assets/images/` 下同一张图有两个版本，**都要保留**：

- `.webp`：现代浏览器实际加载的版本（体积小很多）
- `.jpg` / `.png`：老浏览器与社交平台抓取用的兜底版本

画廊用 `<picture>` 做 WebP 优先 + JPEG 兜底；背景图用 CSS `image-set()`；
分享卡片（`og:image`）刻意仍指向 `.jpg`，因为部分社交平台不认 WebP。

图标文件（由 `icon.svg` 生成，改了图标要一起重新导出）：
`icon-192.png`、`icon-512.png`、`icon-maskable-192.png`、`icon-maskable-512.png`、`apple-touch-icon.png`

## 上线前必须检查

- 确认 `assets/images/` 下背景、画廊、QQ 群二维码的 `.webp` 与 `.jpg` 成对存在。
- 确认 Giscus 的仓库、Discussion 分类和权限没有变化。
- 确认 B 站链接、QQ群号、学校/社团介绍等公开信息准确。
- 活动列表现在默认为空，不展示未经确认的活动信息；确认活动后再编辑 `main.js` 中的 `activities` 数组。
- 本站没有真实账号系统。名片只保存在访客自己的浏览器，不收集密码。如果以后需要跨设备账号、管理员后台或成员数据库，需要接入独立认证/后端服务。

## 更新缓存

`sw.js` 是 cache-first 策略，**改了任何 `index.html` / `style.css` / `main.js` 之后，
必须把 `CACHE` 版本号递增**（例如 `acg-lab-v40` → `acg-lab-v41`），
否则已访问过的用户会一直吃缓存里的旧文件，看不到你的改动。

## 调试开关

浏览器控制台执行 `__acgDebug = true` 可打开详细日志（会记住该设置），
执行 `__acgDebug = false` 关闭。默认关闭。
