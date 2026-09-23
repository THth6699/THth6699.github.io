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
- `manifest.webmanifest`：PWA 配置
- `sw.js`：离线缓存
- `404.html`：GitHub Pages 404 页面
- `robots.txt` / `sitemap.xml`：搜索引擎基础配置
- `.nojekyll`：关闭 Jekyll 处理，减少静态资源路径问题

## 上线前必须检查

- 确认 `assets/images/bg.jpg`、`gallery1.jpg`、`gallery2.jpg`、`gallery3.jpg`、`qq-group.png` 等原有图片仍存在。
- 确认 Giscus 的仓库、Discussion 分类和权限没有变化。
- 确认 B 站链接、QQ群号、学校/社团介绍等公开信息准确。
- 活动列表现在默认为空，不展示未经确认的活动信息；确认活动后再编辑 `main.js` 中的 `activities` 数组。
- 本站没有真实账号系统。名片只保存在访客自己的浏览器，不收集密码。如果以后需要跨设备账号、管理员后台或成员数据库，需要接入独立认证/后端服务。

## 更新缓存

修改静态文件后，`sw.js` 中的 `CACHE` 版本号建议递增，例如 `acg-lab-v4` → `acg-lab-v5`，这样已安装 PWA 的用户会主动更新缓存。
