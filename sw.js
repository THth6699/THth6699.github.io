const CACHE = 'acg-lab-v40';
const CORE = ['./', './index.html', './style.css', './main.js', './manifest.webmanifest', './icon.svg', './404.html'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // 音频拖动进度条会产生 Range 请求（206 Partial Content），
  // cache.put() 存 206 会直接抛 TypeError；这里跳过，避免未处理的 Promise 拒绝。
  if (event.request.headers.has('range')) return;

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    // 只缓存完整成功的响应（206 / 不透明 / 4xx-5xx 一律不存）
    if (response.ok && response.status === 200) {
      const copy = response.clone();
      caches.open(CACHE)
        .then(cache => cache.put(event.request, copy))
        .catch(() => {});
    }
    return response;
  }).catch(() => {
    // 只有页面导航才回退到首页；图片/音频失败时返回 HTML 会造成更难排查的怪现象
    if (event.request.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  })));
});
