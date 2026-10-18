// ===== 0. ⭐ 一键换肤（主题切换） =====
const themes = {
  eva: { name: 'EVA 红黑', vars: { '--primary': '#ff0033', '--primary-rgb': '255, 0, 51', '--secondary': '#7a0019', '--secondary-rgb': '122, 0, 25', '--accent': '#00e5ff', '--accent-rgb': '0, 229, 255', '--bg-color': '#0b0b14', '--bg-rgb': '11, 11, 20', '--modal-bg': '#151522', '--text-main': '#eaeaf2', '--text-muted': '#a8a8be', '--text-dim': '#8888a0', '--primary-light': '#ff8080' } },
  miku: { name: '初音未来', vars: { '--primary': '#39c5bb', '--primary-rgb': '57, 197, 187', '--secondary': '#007070', '--secondary-rgb': '0, 112, 112', '--accent': '#00ffcc', '--accent-rgb': '0, 255, 204', '--bg-color': '#071113', '--bg-rgb': '7, 17, 19', '--modal-bg': '#0e1f22', '--text-main': '#e6f5f4', '--text-muted': '#a0c4c2', '--text-dim': '#6a8a88', '--primary-light': '#7dd9d3' } },
  genshin: { name: '原神星空', vars: { '--primary': '#ffcc00', '--primary-rgb': '255, 204, 0', '--secondary': '#4a3b6b', '--secondary-rgb': '74, 59, 107', '--accent': '#ffffff', '--accent-rgb': '255, 255, 255', '--bg-color': '#121020', '--bg-rgb': '18, 16, 32', '--modal-bg': '#1d1a2e', '--text-main': '#f5f0e8', '--text-muted': '#c4b8d6', '--text-dim': '#8a7fa0', '--primary-light': '#ffdd55' } },
  sakura: { name: '樱花治愈', vars: { '--primary': '#ff9db5', '--primary-rgb': '255, 157, 181', '--secondary': '#fbc2eb', '--secondary-rgb': '251, 194, 235', '--accent': '#a6c1ee', '--accent-rgb': '166, 193, 238', '--bg-color': '#1f1822', '--bg-rgb': '31, 24, 34', '--modal-bg': '#2c2431', '--text-main': '#fdf5fa', '--text-muted': '#d4c4d0', '--text-dim': '#9a8a98', '--primary-light': '#ffc0d0' } },
  cyber: { name: '赛博朋克', vars: { '--primary': '#fcee0a', '--primary-rgb': '252, 238, 10', '--secondary': '#ff003c', '--secondary-rgb': '255, 0, 60', '--accent': '#00f0ff', '--accent-rgb': '0, 240, 255', '--bg-color': '#0a0a0a', '--bg-rgb': '10, 10, 10', '--modal-bg': '#161616', '--text-main': '#f5f5f5', '--text-muted': '#b0b0b0', '--text-dim': '#949494', '--primary-light': '#fff68f' } }
};

const THEME_COLORS = { eva: '#0b0b14', miku: '#071113', genshin: '#121020', sakura: '#1f1822', cyber: '#0a0a0a' };

function applyTheme(themeKey) {
  const theme = themes[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  // 同步 data-theme：CSS 里 html[data-theme="…"] 定义了按钮前景色与渐变端点。
  // main.js 用内联 style 设置变量（优先级更高，会正确覆盖属性选择器），
  // 这里保留属性只是为了让 CSS 侧与 JS 侧始终指向同一套主题。
  root.setAttribute('data-theme', themeKey);
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta && THEME_COLORS[themeKey]) {
    themeColorMeta.setAttribute('content', THEME_COLORS[themeKey]);
  }
  try { localStorage.setItem('acg_lab_theme', themeKey); } catch (_) {}
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });
}

const themeToggle = document.getElementById('themeToggle');
const themePanel = document.getElementById('themePanel');

if (themeToggle && themePanel) {
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = themePanel.classList.toggle('open');
    themeToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && e.target !== themeToggle) {
      themePanel.classList.remove('open');
      themeToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
    });
  });
  // localStorage 在隐私模式/禁用存储时会直接抛异常。此处位于顶层作用域，
  // 一旦抛出，其后的导航、reveal、粒子、名片、灯箱、音乐、缩放、GSAP/Lenis 全部不会绑定。
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('acg_lab_theme'); } catch (_) {}
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  } else {
    // 与 <head> 中的防闪脚本保持一致：即使没有保存值，也要让 data-theme 有明确的取值
    document.documentElement.setAttribute('data-theme', 'eva');
  }
  themeToggle.setAttribute('aria-expanded', 'false');
}

// ===== 0.4 🐞 调试日志开关 =====
// 以前有 7 处 console.log 直接留在生产代码里，控制台会比较吵。
// 需要排查时在浏览器控制台执行 __acgDebug = true 即可恢复输出。
let __acgDebug = false;
try { __acgDebug = localStorage.getItem('acg_lab_debug') === '1'; } catch (_) {}
try {
  Object.defineProperty(window, '__acgDebug', {
    get() { return __acgDebug; },
    set(v) { __acgDebug = !!v; try { localStorage.setItem('acg_lab_debug', v ? '1' : '0'); } catch (_) {} }
  });
} catch (_) {}
const dbg = (...args) => { if (__acgDebug) console.log(...args); };

// ===== 0.5 🔒 共享滚动锁（引用计数） =====
// 原先每个弹窗各自执行 document.body.style.overflow=''，5 个弹窗共用同一个字符串属性，
// 于是「关掉任意一个（哪怕它本来就没打开）」都会把别的弹窗的滚动锁一起清掉。
// 这里改为计数：只有最后一个持锁者释放时才真正解锁。
const __scrollLock = {
  count: 0,
  // ⚠️ 这里原来写成了 __scrollLock.lock() / __scrollLock.unlock()，等于自己调自己，
  // 一锁就栈溢出（RangeError），被外面的 try/catch 吞掉后「滚动锁从未生效」。
  // 正确做法：把真正的锁/解锁动作放在 apply()，lock/unlock 只改计数再调用它。
  apply() {
    const locked = this.count > 0;
    document.body.classList.toggle('scroll-locked', locked);
    document.body.style.overflow = locked ? 'hidden' : '';
  },
  lock() {
    this.count += 1;
    this.apply();
    // Lenis 用滚轮事件自行驱动滚动，光设 body.overflow 锁不住，必须显式停掉
    if (window.__lenis && typeof window.__lenis.stop === 'function') {
      try { window.__lenis.stop(); } catch (_) {}
    }
  },
  unlock() {
    this.count = Math.max(0, this.count - 1);
    this.apply();
    if (this.count === 0) {
      if (window.__lenis && typeof window.__lenis.start === 'function') {
        try { window.__lenis.start(); } catch (_) {}
      }
    }
  }
};

// ===== 1. 导航栏滚动 =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); });

// ===== 2. 移动端菜单 =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function closeDrawer() {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  if (nav) nav.classList.remove('open-drawer');
  document.body.classList.remove('drawer-open');
  try { __scrollLock.unlock(); } catch (_) {}
}

function setDrawer(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('drawer-open', open);
  // 锁住背后页面滚动，避免抽屉开着还能滚
  try { open ? __scrollLock.lock() : __scrollLock.unlock(); } catch (_) {}
}
navToggle.addEventListener('click', () => setDrawer(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => closeDrawer());
});
// 点抽屉外面关掉
document.addEventListener('click', (e) => {
  if (!navLinks.classList.contains('open')) return;
  if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
  if (e.target.closest && e.target.closest('.nav-auth')) return;
  if (e.target.closest && e.target.closest('.theme-panel')) return;   // 点主题面板不算点外面
  closeDrawer();
});
// Esc 关抽屉
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeDrawer();
});

// ===== 3. 滚动入场动画 =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== 4. 数字滚动 =====
const counters = document.querySelectorAll('.stat strong');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target; const target = +el.dataset.count;
      if (isNaN(target)) return;
      const start = performance.now(); const duration = 1500;
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * target);
        if (progress < 1) requestAnimationFrame(update); else el.textContent = target;
      };
      requestAnimationFrame(update); counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ===== 5. 粒子背景 =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H; let particles = [];
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
const memes = ['有内鬼', '用爱发电', '前方高能', '已阅', '下次一定', 'DD斩首', '咕咕咕', '整活！', '喔喔喔'];
function getParticleColors() {
  const root = getComputedStyle(document.documentElement);
  return [
    root.getPropertyValue('--primary').trim(),
    root.getPropertyValue('--accent').trim(),
    root.getPropertyValue('--primary-light').trim()
  ].filter(Boolean);
}

class Particle {
  constructor() { this.reset(); this.y = Math.random() * H; }
  reset() {
    this.x = Math.random() * W; this.y = -20; this.size = Math.random() * 8 + 4;
    this.speed = Math.random() * 1.5 + 0.5; this.opacity = Math.random() * 0.5 + 0.2;
    this.rotate = Math.random() * Math.PI * 2; this.rotateSpeed = (Math.random() - 0.5) * 0.05;
    this.isMeme = Math.random() > 0.85; this.memeText = memes[Math.floor(Math.random() * memes.length)];
    const colors = getParticleColors();
    this.color = colors[Math.floor(Math.random() * colors.length)] || '#ffffff';
  }
  update() { this.y += this.speed; this.rotate += this.rotateSpeed; if (this.y > H + 20) this.reset(); }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotate); ctx.globalAlpha = this.opacity;
    if (this.isMeme) { ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = this.color; ctx.textAlign = 'center'; ctx.fillText(this.memeText, 0, 0); }
    else {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size/2, -this.size/2, this.size, 0, 0, this.size);
      ctx.bezierCurveTo(-this.size, 0, -this.size/2, -this.size/2, 0, 0);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }
}
function initParticles() { const count = Math.min(60, Math.floor(W / 15)); particles = []; for (let i = 0; i < count; i++) particles.push(new Particle()); }
let animationFrame = 0;
function animate() {
  if (document.hidden) { animationFrame = 0; return; }
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  animationFrame = requestAnimationFrame(animate);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !animationFrame) animate();
});
initParticles();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) animate();

// ===== 6. 本地次元名片 =====
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const authForm = document.getElementById('authForm');
const authUsername = document.getElementById('authUsername');
const authDirection = document.getElementById('authDirection');
const userInfo = document.getElementById('userInfo');
const userNameDisplay = document.getElementById('userNameDisplay');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');

function readLocalProfile() {
  try {
    const raw = localStorage.getItem('acg_lab_profile');
    const profile = raw ? JSON.parse(raw) : null;
    return profile && profile.username ? profile : null;
  } catch (_) { return null; }
}
function saveLocalProfile(profile) {
  try { localStorage.setItem('acg_lab_profile', JSON.stringify(profile)); return true; }
  catch (_) { return false; }
}
function showUserInfo(profile) {
  if (!loginBtn || !userInfo) return;
  loginBtn.style.display = 'none';
  userInfo.style.display = 'flex';
  userNameDisplay.textContent = profile.username;
  const avatars = { '绘画': '🎨', 'Cos': '👗', '观影': '📺', '技术': '💻', '全能': '✨' };
  userAvatar.textContent = avatars[profile.direction] || '👤';
}
function showLoginBtn() {
  if (loginBtn) loginBtn.style.display = 'inline-block';
  if (userInfo) userInfo.style.display = 'none';
}
function openProfileModal() {
  const profile = readLocalProfile();
  modalTitle.textContent = profile ? '编辑次元名片' : '我的次元名片';
  submitAuthBtn.textContent = '保存名片';
  if (profile) {
    authUsername.value = profile.username;
    authDirection.value = profile.direction || '全能';
  }
  authModal.classList.add('active');
  __scrollLock.lock();
  setTimeout(() => authUsername.focus(), 0);
}
function closeProfileModal() {
  authModal.classList.remove('active');
  __scrollLock.unlock();
  authForm.reset();
}

if (loginBtn && authModal && authForm) {
  const existingProfile = readLocalProfile();
  if (existingProfile) showUserInfo(existingProfile); else showLoginBtn();
  loginBtn.addEventListener('click', openProfileModal);
  modalClose.addEventListener('click', closeProfileModal);
  authModal.addEventListener('click', e => { if (e.target === authModal) closeProfileModal(); });
  authForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = authUsername.value.trim().replace(/\s+/g, ' ');
    const direction = authDirection.value;
    if (!username) return;
    const profile = { username, direction, updatedAt: new Date().toISOString() };
    if (!saveLocalProfile(profile)) {
      alert('浏览器禁止了本地存储，请允许本站使用本地存储后再试。');
      return;
    }
    showUserInfo(profile);
    closeProfileModal();
  });
  logoutBtn.addEventListener('click', () => {
    try { localStorage.removeItem('acg_lab_profile'); } catch (_) {}
    showLoginBtn();
  });
}

// ===== 7. 年份 =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== 8. 图片灯箱 =====
// 监听必须绑在 .gallery-item 这个 <button> 上，而不是里面的 <img>：
// 可聚焦、带 aria-label 的是外层按钮，绑到 img 上会导致 Tab 聚焦后按 Enter 毫无反应。
const galleryItems = document.querySelectorAll('.gallery-item');
if (galleryItems.length > 0) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '图片预览');
  overlay.innerHTML = '<button class="lightbox-close" type="button" aria-label="关闭预览">✕</button><img src="" alt="">';
  document.body.appendChild(overlay);
  const overlayImg = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.lightbox-close');
  let lastFocused = null;

  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    const openLightbox = () => {
      lastFocused = document.activeElement;
      // 用 currentSrc：<picture> 场景下会取浏览器实际选中的那个源（通常是 WebP），
      // 直接读 img.src 会永远拿到 JPEG 兜底地址
      overlayImg.src = img.currentSrc || img.src;
      // 用外层按钮已有的 aria-label 作为图片替代文本，顺带修掉 alt="Preview" 这个无效描述
      overlayImg.alt = item.getAttribute('aria-label') || img.alt || '图片预览';
      overlay.classList.add('active');
      __scrollLock.lock();
      closeBtn.focus();
    };
    item.addEventListener('click', openLightbox);
  });

  const closeLightbox = () => {
    overlay.classList.remove('active');
    overlayImg.removeAttribute('src');
    __scrollLock.unlock();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  };
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
  });
}

// ===== 9. 每日二次元 =====
const dailyAcgBtn = document.getElementById('daily-acg-btn');
const dailyAcgText = document.getElementById('daily-acg-text');
const dailyAcgAuthor = document.getElementById('daily-acg-author');

if (dailyAcgBtn) {
  const acgData = [
    { text: '“不要停止奔跑，不要回顾来路，来路无可眷恋，值得期待的只有前方。”', author: '《排球少年》' },
    { text: '“只要有你在，我就无所不能。”', author: '《Fate/stay night》' },
    { text: '“我可是要成为海贼王的男人！”', author: '《海贼王》' },
    { text: '“游荡的游魂，燃烧的烈焰，以吾之名召唤汝。”', author: '《Fate》系列经典咒语' },
    { text: '“世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。”', author: '《进击的巨人》' },
    { text: '“无论你在这个世界上的什么地方，我都会再次找到你。”', author: '《你的名字。》' },
    { text: '“与其诅咒黑暗，不如点亮蜡烛。”', author: '《魔法少女小圆》' },
    { text: '“我变秃了，也变强了。”', author: '《一拳超人》' },
    { text: '"不相信自己的人，连努力的价值都没有。”', author: '《火影忍者》' },
    { text: '"没有痛苦的教训是毫无意义的，人不牺牲什么的话，就得不到收获。”', author: '《钢之炼金术师》' },
    { text: '"如果结果不如你所愿，就在尘埃落定前奋力一搏。”', author: '《夏目友人帐》' },
    { text: '"努力过的人都是战士。”', author: '《葬送的芙莉莲》' },
    { text: '"在下坂本，有何贵干？”', author: '《在下坂本，有何贵干？》' },
    { text: '"错的不是我，是这个世界。”', author: '《东京喰种》' },
    { text: '"我只不过是个路过的假面骑士，给我记好了！”', author: '《假面骑士帝骑》' },
    { text: '"青春啊！”', author: '《银魂》' }
  ];

  dailyAcgBtn.addEventListener('click', () => {
    dailyAcgBtn.textContent = '🔮 占卜中...';
    dailyAcgBtn.disabled = true;
    dailyAcgText.style.opacity = '0';
    setTimeout(() => {
      const random = acgData[Math.floor(Math.random() * acgData.length)];
      dailyAcgText.textContent = random.text;
      dailyAcgAuthor.textContent = `—— ${random.author}`;
      dailyAcgText.style.opacity = '1';
      dailyAcgBtn.textContent = '🎲 换一个';
      dailyAcgBtn.disabled = false;
    }, 500);
  });
}

// ===== 10. 部门详情弹窗 =====
const deptModal = document.getElementById('deptModal');
const deptModalClose = document.getElementById('deptModalClose');
const deptModalIcon = document.getElementById('deptModalIcon');
const deptModalTitle = document.getElementById('deptModalTitle');
const deptModalContent = document.getElementById('deptModalContent');
const deptJoinBtn = document.getElementById('deptJoinBtn');

const deptData = {
  '产粮部': { icon: '🎨', content: `<p><strong>定位：</strong>社团的产粮主力，用画笔创造世界。</p><p style="margin-top:12px;"><strong>我们平时做什么：</strong></p><ul><li>课余在教室开绘茶会，带上平板或画本互相催更。</li><li>社团海报、周边、网站配图的创作。</li><li>互相交流板绘、手绘、同人创作技巧。</li></ul><p style="margin-top:12px;"><strong>招募要求：</strong>不论你是大触还是零基础萌新，只要热爱画画，我们都欢迎！</p>` },
  '观影吐槽部': { icon: '📺', content: `<p><strong>定位：</strong>追番先锋队，负责看番和疯狂吐槽。</p><p style="margin-top:12px;"><strong>我们平时做什么：</strong></p><ul><li>每季新番同步追，在群里实况弹幕式吐槽。</li><li>社团课时间在多媒体教室集中观影，现场提供笑点支持。</li><li>老番补习班、神作安利、烂片排雷。</li></ul><p style="margin-top:12px;"><strong>招募要求：</strong>喜欢看番，自带吐槽技能，能接受「禁止打架但可以激情互喷」的观影氛围。</p>` },
  'Cos变装部': { icon: '👗', content: `<p><strong>定位：</strong>社团的颜值担当和出片主力。</p><p style="margin-top:12px;"><strong>我们平时做什么：</strong></p><ul><li>校园取景出片，教学楼、操场、绿化带都是我们的外景地。</li><li>互相当摄影师，技术支援部负责后期与成片归档。</li><li>试妆交流，男扮女装不是梦，女扮男装帅断腿。</li></ul><p style="margin-top:12px;"><strong>招募要求：</strong>男女不限，社恐可治，零基础也 OK，关键要敢于表现自己！<br><em>注：社团活动均在校内进行，不组织校外活动。</em></p>` },
  '技术支援部': { icon: '💻', content: `<p><strong>定位：</strong>社团的极客大脑，用代码给社团开挂。</p><p style="margin-top:12px;"><strong>我们平时做什么：</strong></p><ul><li>搭建与更新社团官网（这个网站就是我们的作品）。</li><li>写网页、做工具、搞自动化脚本。</li><li>整理作品与活动资料，维护社团的线上档案。</li></ul><p style="margin-top:12px;"><strong>招募要求：</strong>对编程、网页设计、网站维护有兴趣，愿意学习新技术的同学。</p>` },
  '什么都不干部': { icon: '🛋️', content: `<p><strong>定位：</strong>社团的灵魂部门！负责围观、吃瓜、当气氛组。</p><p style="margin-top:12px;"><strong>我们平时做什么：</strong></p><ul><li>在群里发表情包、点赞、喊「666」。</li><li>成为各项活动的「啦啦队」和「第一观众」。</li><li>享受纯粹的二次元聊天氛围，不承担任何硬性任务。</li></ul><p style="margin-top:12px;"><strong>招募要求：</strong>只要你热爱二次元，不想内卷，这里就是你的快乐老家！</p>` },
  '加入方式': { icon: '✨', content: `<p>在 QQ 群发言，或直接联系群主与各部部长。不限专业、不限年级，只要你热爱二次元！</p><p style="margin-top:12px;"><em>社团活动均安排在校内，不组织校外活动。</em></p>` }
};

const deptCards = document.querySelectorAll('.dept-card');
if (deptCards.length > 0 && deptModal) {
  deptCards.forEach(card => {
    card.addEventListener('click', () => {
      const deptName = card.getAttribute('data-dept');
      const data = deptData[deptName];
      if (data) {
        deptModalIcon.textContent = data.icon;
        deptModalTitle.textContent = deptName;
        deptModalContent.innerHTML = data.content;
        deptModal.classList.add('active');
        __scrollLock.lock();
      }
    });
  });
  const closeDeptModal = () => {
    deptModal.classList.remove('active');
    __scrollLock.unlock();
  };
  deptModalClose.addEventListener('click', closeDeptModal);
  deptModal.addEventListener('click', (e) => { if (e.target === deptModal) closeDeptModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deptModal.classList.contains('active')) closeDeptModal();
  });
  if (deptJoinBtn) {
    deptJoinBtn.addEventListener('click', () => { closeDeptModal(); });
  }
}

// ===== 11. 活动中心 =====
// 【改活动处】date 用 YYYY-MM 格式；status 只能取「进行中 / 计划中 / 已结束」三个值之一。
// 注意：社团活动一律安排在校内，请勿添加校外场地活动。
const activities = [
  {
    date: '2026-06', icon: '📷', tag: '校内摄影 / 出 c', status: '进行中',
    title: '校园取景出片',
    desc: '在校园里选点位拍场照与社团合影，Cos 变装部负责妆造，技术支援部负责修图与成片归档。'
  },
  {
    date: '2026-09', icon: '💻', tag: '网站搭建与更新', status: '计划中',
    title: '社团官网改版',
    desc: '技术支援部负责：改进版式与入场动画、整理作品与活动资料、持续更新社团动态。'
  },
  {
    date: '2026-03', icon: '🎨', tag: '校内绘画工作坊', status: '已结束',
    title: '教室绘茶会',
    desc: '课余把桌子拼起来就开画，板绘与手绘都欢迎，现场有纸张与公用画具，画完一起吃茶点。'
  }
];
const activityList = document.getElementById('activity-list');
if (activityList) {
  const renderActivities = (filter = 'all') => {
    const list = filter === 'all' ? activities : activities.filter(item => item.status === filter);
    const esc = s => { const d = document.createElement('i'); d.textContent = String(s == null ? '' : s); return d.innerHTML; };
    activityList.innerHTML = list.map(item => {
      const date = String(item.date || '');
      return `
      <article class="activity-item reveal show">
        <div class="activity-date"><strong>${esc(date.slice(5))}</strong><span>${esc(date.slice(0, 4))}</span></div>
        <div class="activity-dot">${esc(item.icon)}</div>
        <div class="activity-body"><div class="activity-meta"><span class="tag">${esc(item.tag)}</span><span class="status status-${esc(item.status)}">${esc(item.status)}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.desc)}</p></div>
      </article>`;
    }).join('') || '<div class="empty-state">这个分类暂时没有活动。</div>';
  };
  renderActivities();
  document.querySelectorAll('[data-activity-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-activity-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderActivities(btn.dataset.activityFilter);
  }));
}

// ===== 12. 画廊筛选 =====
// 注意：变量名不能叫 galleryItems——第 8 节灯箱已用了这个名字（同处顶层作用域会重复声明报错）
const galleryFilterItems = [...document.querySelectorAll('[data-gallery-category]')];
const galleryEmpty = document.getElementById('galleryEmpty');
document.querySelectorAll('[data-gallery-filter]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-gallery-filter]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.galleryFilter;
  let visible = 0;
  galleryFilterItems.forEach(item => {
    const show = filter === 'all' || item.dataset.galleryCategory === filter;
    item.hidden = !show; if (show) visible++;
  });
  if (galleryEmpty) galleryEmpty.hidden = visible !== 0;
}));

// ===== 13. 今日打卡 =====
const checkinBtn = document.getElementById('checkinBtn');
const checkinText = document.getElementById('checkinText');
if (checkinBtn && checkinText) {
  const localDateKey = date => { const d = new Date(date); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };
  const today = localDateKey(new Date());
  let checkin = {};
  try { checkin = JSON.parse(localStorage.getItem('acg_lab_checkin') || '{}') || {}; } catch (_) {}
  const updateCheckinUI = () => {
    if (checkin.last === today) {
      checkinText.textContent = `今天已打卡！当前连续 ${checkin.streak || 1} 天。`;
      checkinBtn.textContent = '✓ 今日已打卡'; checkinBtn.disabled = true;
    } else checkinText.textContent = `累计打卡 ${checkin.total || 0} 次。今天来留下一个“我来过”。`;
  };
  updateCheckinUI();
  checkinBtn.addEventListener('click', () => {
    const yesterday = localDateKey(Date.now() - 86400000);
    checkin = { last: today, total: (checkin.total || 0) + 1, streak: checkin.last === yesterday ? (checkin.streak || 0) + 1 : 1 };
    try { localStorage.setItem('acg_lab_checkin', JSON.stringify(checkin)); } catch (_) {}
    updateCheckinUI();
  });
}

// ===== 14. 分享本站 =====
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) shareBtn.addEventListener('click', async () => {
  const data = { title: document.title, text: '来看看次元整研社的官网！', url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(location.href); shareBtn.textContent = '✓ 链接已复制'; setTimeout(() => shareBtn.textContent = '分享本站', 1800); }
  } catch (_) {}
});

// ===== 15. PWA 安装 =====
let deferredInstallPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredInstallPrompt = e;
  if (installBtn) installBtn.hidden = false;
});
if (installBtn) installBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null; installBtn.hidden = true;
});

// ===== 16. 阅读进度 + 返回顶部 =====
const progress = document.getElementById('scrollProgress');
const backTop = document.getElementById('backTop');
const updateScrollUI = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.transform = `scaleX(${ratio})`;
  if (backTop) backTop.classList.toggle('show', window.scrollY > 500);
};
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();
if (backTop) backTop.addEventListener('click', () => {
  if (window.__lenis) { window.__lenis.scrollTo(0); }
  else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
});

// ===== 17. Service Worker =====
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  });
}

// ===== 18. 网站贡献者 =====
(() => {
  const contributorBtn = document.getElementById('developerBtn');
  const contributorModal = document.getElementById('developerModal');
  const contributorClose = document.getElementById('developerModalClose');

  const open = () => {
    if (!contributorModal) return;
    contributorModal.classList.add('active');
    contributorModal.setAttribute('aria-hidden', 'false');
    __scrollLock.lock();
  };
  const close = () => {
    if (!contributorModal) return;
    contributorModal.classList.remove('active');
    contributorModal.setAttribute('aria-hidden', 'true');
    __scrollLock.unlock();
  };

  if (contributorBtn) contributorBtn.addEventListener('click', open);
  if (contributorClose) contributorClose.addEventListener('click', close);
  if (contributorModal) contributorModal.addEventListener('click', e => { if (e.target === contributorModal) close(); });
  document.addEventListener('keydown', e => {
    // 必须判断自己的弹窗是否打开：close() 会释放共享滚动锁，
    // 无条件调用会把别的弹窗的滚动锁一起清掉
    if (e.key === 'Escape' && contributorModal && contributorModal.classList.contains('active')) close();
  });
})();

// ===== 19. 网站开发者中心 =====
(() => {
  const modal = document.getElementById('devCenterModal');
  const openBtn = document.getElementById('devCenterFooterBtn');
  const closeBtn = document.getElementById('devCenterClose');

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const browserName = () => {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Microsoft Edge';
    if (/OPR\//.test(ua)) return 'Opera';
    if (/Firefox\//.test(ua)) return 'Mozilla Firefox';
    if (/Chrome\//.test(ua)) return 'Google Chrome';
    if (/Safari\//.test(ua)) return 'Safari';
    return '未知浏览器';
  };

  const updateDebugInfo = async () => {
    // 这里也要保护：隐私模式下 localStorage 读取会抛异常，
    // 会让整个 async 函数变成 rejected Promise，状态永远停在“检测中…”
    let themeKey = 'eva';
    try { themeKey = localStorage.getItem('acg_lab_theme') || 'eva'; } catch (_) {}
    const themeNames = { eva: 'EVA 红黑', miku: '初音未来', genshin: '原神星空', sakura: '樱花治愈', cyber: '赛博朋克' };
    const sw = 'serviceWorker' in navigator;

    setText('devPwaStatus', (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ? '已安装' : '浏览器模式');
    setText('devSwStatus', sw ? '支持' : '不支持');
    setText('devThemeStatus', themeNames[themeKey] || themeKey);
    setText('devBrowserStatus', browserName());

    setText('debugTheme', themeKey);
    setText('debugViewport', `${window.innerWidth} × ${window.innerHeight}`);
    setText('debugDpr', String(window.devicePixelRatio || 1));
    setText('debugOnline', navigator.onLine ? '在线' : '离线');
    setText('debugSw', sw ? '支持' : '不支持');
    setText('debugPath', window.location.pathname);
    setText('debugUa', navigator.userAgent);

    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        setText('debugCache', keys.length ? `正常（${keys.length} 个）` : '暂无缓存');
      } catch { setText('debugCache', '无法读取'); }
    } else {
      setText('debugCache', '不支持');
    }
  };

  const open = () => {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    __scrollLock.lock();
    updateDebugInfo();
  };
  const close = () => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    __scrollLock.unlock();
  };

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) close(); });

  const devModeToggle = document.getElementById('devModeToggle');
  const devRefreshStatus = document.getElementById('devRefreshStatus');
  const devDebugOutput = document.getElementById('devDebugOutput');

  if (devModeToggle) {
    devModeToggle.addEventListener('click', () => {
      if (!devDebugOutput) return;
      const willShow = devDebugOutput.hidden;
      devDebugOutput.hidden = !willShow;
      devModeToggle.textContent = willShow ? '关闭开发者模式' : '开启开发者模式';
      updateDebugInfo();
    });
  }
  if (devRefreshStatus) devRefreshStatus.addEventListener('click', updateDebugInfo);

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      open();
    }
    // 同样要判断自身是否打开，否则 Esc 会误释放别的弹窗的滚动锁
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) close();
  });

  window.addEventListener('resize', updateDebugInfo, { passive: true });
  window.addEventListener('online', updateDebugInfo);
  window.addEventListener('offline', updateDebugInfo);
})();

// ===== 20. 🎵 音乐侧边栏（简洁稳定版） =====
(() => {
  const side = document.getElementById('musicSide');
  const tab = document.getElementById('msTab');
  const tabIcon = document.getElementById('msTabIcon');
  const drawer = document.getElementById('msDrawer');
  const closeBtn = document.getElementById('msClose');
  const audio = document.getElementById('msAudio');
  if (!side || !tab || !drawer || !audio) return;

  const el = {
    cover: document.getElementById('msCover'),
    name: document.getElementById('msName'),
    artist: document.getElementById('msArtist'),
    now: document.getElementById('msNow'),
    total: document.getElementById('msTotal'),
    seek: document.getElementById('msSeek'),
    play: document.getElementById('msPlay'),
    prev: document.getElementById('msPrev'),
    next: document.getElementById('msNext')
  };

  // 备用列表（如果 playlist.json 加载失败，就用这一首）
  const fallbackPlaylist = [
    { src: 'assets/music/bgm.mp3', title: '次元基地', artist: 'BGM 01', emoji: '🎧' }
  ];

  let playlist = [...fallbackPlaylist];
  let index = 0;

  const fmt = (s) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const load = (i) => {
    index = (i + playlist.length) % playlist.length;
    const t = playlist[index];
    audio.src = t.src;
    el.name.textContent = t.title;
    el.artist.textContent = t.artist;
    el.cover.textContent = t.emoji;
    el.seek.value = 0;
    el.now.textContent = '0:00';
    el.total.textContent = '0:00';
  };

  const play = () => {
    audio.play().then(() => {
      side.classList.add('playing');
      el.play.textContent = '⏸';
      tabIcon.textContent = '🎶';
    }).catch(() => {
      el.name.textContent = '播放失败，请检查音频文件';
    });
  };

  const pause = () => {
    audio.pause();
    side.classList.remove('playing');
    el.play.textContent = '▶';
    tabIcon.textContent = '🎵';
  };

  const toggle = () => audio.paused ? play() : pause();

  const openDrawer = () => {
    side.classList.add('open');
    tab.setAttribute('aria-expanded', 'true');
  };
  const closeDrawer = () => {
    side.classList.remove('open');
    tab.setAttribute('aria-expanded', 'false');
  };
  const toggleDrawer = () => {
    if (side.classList.contains('open')) closeDrawer();
    else openDrawer();
  };

  tab.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });
  closeBtn.addEventListener('click', closeDrawer);

  document.addEventListener('click', (e) => {
    if (!side.contains(e.target) && side.classList.contains('open')) {
      closeDrawer();
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      el.seek.value = (audio.currentTime / audio.duration) * 100;
      el.now.textContent = fmt(audio.currentTime);
    }
  });
  audio.addEventListener('loadedmetadata', () => {
    el.total.textContent = fmt(audio.duration);
  });
  audio.addEventListener('ended', () => {
    load(index + 1);
    play();
  });
  audio.addEventListener('play', () => {
    side.classList.add('playing');
    el.play.textContent = '⏸';
    tabIcon.textContent = '🎶';
  });
  audio.addEventListener('pause', () => {
    side.classList.remove('playing');
    el.play.textContent = '▶';
    tabIcon.textContent = '🎵';
  });

  el.play.addEventListener('click', toggle);
  el.prev.addEventListener('click', () => { load(index - 1); play(); });
  el.next.addEventListener('click', () => { load(index + 1); play(); });
  el.seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (el.seek.value / 100) * audio.duration;
  });

  load(0);

  // 从 playlist.json 读取完整歌单（加歌只需改这个文件）
  fetch('assets/music/playlist.json')
    .then(res => res.ok ? res.json() : Promise.reject('JSON 加载失败'))
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        playlist = data;
        index = 0;
        load(0);
      }
    })
    .catch(err => {
      console.warn('无法加载 playlist.json，使用默认列表：', err);
    });
})();

// ===== 21. 🔍 页面缩放控件 =====
(() => {
  const controls = document.getElementById('zoomControls');
  const zoomOut = document.getElementById('zoomOut');
  const zoomIn = document.getElementById('zoomIn');
  const zoomValue = document.getElementById('zoomValue');
  if (!controls || !zoomOut || !zoomIn || !zoomValue) return;

  const STORAGE_KEY = 'acg_lab_zoom';
  const MIN = 80;
  const MAX = 120;
  const STEP = 10;

  const clamp = (v) => Math.max(MIN, Math.min(MAX, v));

  const read = () => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      return Number.isFinite(saved) ? clamp(saved) : 100;
    } catch (_) {
      return 100;
    }
  };

  const apply = (value) => {
    const zoom = clamp(value);
    // 用 zoom 属性缩放宽高，会同步影响布局
    document.documentElement.style.zoom = `${zoom}%`;
    zoomValue.textContent = `${zoom}%`;
    zoomOut.disabled = zoom <= MIN;
    zoomIn.disabled = zoom >= MAX;
    try { localStorage.setItem(STORAGE_KEY, String(zoom)); } catch (_) {}
  };

  let current = read();
  apply(current);

  zoomOut.addEventListener('click', () => {
    current = clamp(current - STEP);
    apply(current);
  });
  zoomIn.addEventListener('click', () => {
    current = clamp(current + STEP);
    apply(current);
  });
})();

// ===== 22. ✨ GSAP 动画系统（滚动入场；整段删除即可完全回滚） =====
(function () {
  // 系统开了"减少动态效果"：什么都不做，全部交给原来的 reveal 系统
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var settled = false;   // 是否已有结果（动画接管 或 普通显示）
  var heroEls = [];      // 首屏元素（只用于把它们从旧观察系统里摘出来）
  var waitEls = [];      // 滚动到才出现的元素
  var heroBox = document.querySelector('.hero-inner');

  // ① 立刻把 GSAP 要管的元素从旧的 reveal 观察系统里摘出来，防止两套动画打架
  if (heroBox) {
    var hs = heroBox.querySelectorAll('.reveal');
    for (var i = 0; i !== hs.length; i++) {
      heroEls.push(hs[i]);
      try { observer.unobserve(hs[i]); } catch (e) {}
    }
  }
  var all = document.querySelectorAll('.reveal');
  for (var j = 0; j !== all.length; j++) {
    var el = all[j];
    if (heroBox && heroBox.contains(el)) continue;   // 首屏的上面已处理
    try { observer.unobserve(el); } catch (e) {}
    if (el.getBoundingClientRect().top > window.innerHeight) {
      waitEls.push(el);                              // 还在屏幕外 → 交给 GSAP
    } else {
      try { observer.observe(el); } catch (e) {}     // 已经在屏幕里 → 交回旧系统
    }
  }

  // ② 库加载失败时的兜底：滚动元素直接显示，绝不留白
  function fallbackPlain() {
    if (settled) return;
    settled = true;
    dbg('[ACG] GSAP 未加载，动画改为普通显示');
    for (var k = 0; k !== waitEls.length; k++) waitEls[k].classList.add('show');
  }

  // ③ 首屏浮现是声明式的（见 style.css 第 13 节）：
  //    元素默认隐藏，入场揭幕写入 data-acg-loaded 后由 CSS 错峰浮现。
  //    这里只把首屏元素从旧的 reveal 观察系统里摘出来，不再用 GSAP 碰它们 ——
  //    之前两条路径争同一份 opacity，结果谁都管不住，首屏动画干脆没跑起来。
  for (var a = 0; a !== heroEls.length; a++) heroEls[a].classList.remove('reveal');

  // ④ 库加载成功后：接管滚动入场
  function init() {
    if (settled || !window.gsap || !window.ScrollTrigger) return;
    settled = true;
    gsap.registerPlugin(ScrollTrigger);
    dbg('[ACG] GSAP + ScrollTrigger 已接管动画');

    // 滚动入场：进入视野后依次浮现
    if (waitEls.length) {
      for (var b = 0; b !== waitEls.length; b++) waitEls[b].classList.remove('reveal');
      gsap.set(waitEls, { opacity: 0, y: 22 });
      ScrollTrigger.batch(waitEls, {
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.1, overwrite: true });
        }
      });
    }

    // 你们的页面缩放会改变所有元素位置：变化后刷新一次触发器（这是本站特有的坑）
    var refreshTimer = 0;
    if (window.MutationObserver) {
      new MutationObserver(function () {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(function () { try { ScrollTrigger.refresh(); } catch (e) {} }, 300);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }
    window.addEventListener('load', function () { try { ScrollTrigger.refresh(); } catch (e) {} });
  }

  // ④ 从国内镜像依次加载 gsap + ScrollTrigger（一个不通自动换下一个）
  var mirrors = [
    'https://cdn.bootcdn.net/ajax/libs/gsap/3.15.0/',
    'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/',
    'https://unpkg.com/gsap@3.15.0/dist/'
  ];
  function loadFile(url, ok, fail) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = ok;
    s.onerror = fail;
    document.head.appendChild(s);
  }
  function tryLoad(i) {
    if (settled) return;
    if (i >= mirrors.length) { fallbackPlain(); return; }
    loadFile(mirrors[i] + 'gsap.min.js', function () {
      loadFile(mirrors[i] + 'ScrollTrigger.min.js', init, function () { tryLoad(i + 1); });
    }, function () { tryLoad(i + 1); });
  }

  if (window.gsap && window.ScrollTrigger) { init(); }
  else { tryLoad(0); setTimeout(fallbackPlain, 3000); }
})();

// ===== 23. 🌊 Lenis 平滑滚动（可选层：加载失败 / 减少动态效果时自动保持原生滚动） =====
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var started = false;

  function fail() {
    dbg('[ACG] Lenis 未启用，保持原生滚动');
  }

  function boot(LenisCtor) {
    if (started || !LenisCtor) return;
    started = true;
    var lenis;
    try {
      // autoRaf:false 必须显式关掉：Lenis 1.x 默认自建 rAF 循环，
      // 而下方无论走 GSAP 还是自建 rAF 都会再驱动一次，等于每帧 raf 跑两遍
      // → 阻尼叠加、滚动发飘、CPU 翻倍。这里统一由外部单一时钟驱动。
      lenis = new LenisCtor({ smoothWheel: true, autoRaf: false });  // 只平滑鼠标滚轮；手机触屏保持原生
    } catch (e) { fail(); return; }

    window.__lenis = lenis;  // 暴露给"返回顶部"按钮和第 16 节使用

    // 锚点跳转改走 Lenis（顶部预留 84px 让开固定导航栏，与原 scroll-padding-top 一致）
    document.addEventListener('click', function (e) {
      var t = e.target;
      var anchor = null;
      while (t && t !== document) {
        if (t.nodeType === 1 && t.tagName === 'A') { anchor = t; break; }
        t = t.parentNode;
      }
      if (!anchor) return;
      var href = anchor.getAttribute('href') || '';
      if (href.charAt(0) !== '#' || href.length < 2) return;
      var node = document.querySelector(href);
      if (!node) return;
      e.preventDefault();
      var y = node.getBoundingClientRect().top + window.pageYOffset - 84;
      lenis.scrollTo(y);
      try { history.pushState(null, '', href); } catch (err) {}
    });

    if (window.gsap && window.ScrollTrigger) {
      // 有 GSAP：由 GSAP 时钟统一驱动，滚动与入场动画完全同步（官方推荐做法）
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      dbg('[ACG] Lenis 平滑滚动已启用（GSAP 同步驱动）');
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      dbg('[ACG] Lenis 平滑滚动已启用');
    }
  }

  // 镜像按顺序尝试：一个不通自动换下一个
  var mirrors = [
    'https://registry.npmmirror.com/lenis/1.3.26/files/dist/lenis.min.js',
    'https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js',
    'https://unpkg.com/lenis@1.3.26/dist/lenis.min.js'
  ];
  function tryLoad(i) {
    if (started) return;
    if (i >= mirrors.length) { fail(); return; }
    var s = document.createElement('script');
    s.src = mirrors[i];
    s.onload = function () { boot(window.Lenis); };
    s.onerror = function () { tryLoad(i + 1); };
    document.head.appendChild(s);
  }

  if (window.Lenis) boot(window.Lenis);
  else tryLoad(0);
})();

// ===== 24. 🚨 暴走模式彩蛋（连点 Logo 5 次触发；整段删除即可完全回滚，不影响任何其他功能） =====
(function () {
  var logo = document.querySelector('.logo');
  if (!logo) return;

  var SOUND = true;         // 不想播放警报音就改成 false
  var CLICKS_NEEDED = 5;    // 需要连点的次数
  var WINDOW_MS = 900;      // 两次点击的最大间隔（超时重新计数）
  var COOLDOWN_MS = 8000;   // 播放结束后的冷却时间，防止连续刷屏

  var clicks = 0;
  var lastClick = 0;
  var busy = false;
  var cooldownUntil = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  logo.addEventListener('click', function () {
    var now = Date.now();
    if (busy || now < cooldownUntil) return;
    if (now - lastClick > WINDOW_MS) clicks = 0;
    lastClick = now;
    clicks += 1;
    if (clicks < CLICKS_NEEDED) return;
    clicks = 0;
    trigger();
  });

  // 两声短促警报音（实时合成，不需要音频文件；不想要就改 SOUND = false）
  function beep() {
    if (!SOUND) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ac = new AC();
      if (ac.state === 'suspended') ac.resume();
      var t = ac.currentTime;
      [0, 0.22].forEach(function (offset) {
        var o = ac.createOscillator();
        var g = ac.createGain();
        o.type = 'square';
        o.frequency.value = 740;
        g.gain.setValueAtTime(0.0001, t + offset);
        g.gain.exponentialRampToValueAtTime(0.09, t + offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.16);
        o.connect(g);
        g.connect(ac.destination);
        o.start(t + offset);
        o.stop(t + offset + 0.18);
      });
      setTimeout(function () { try { ac.close(); } catch (e) {} }, 1500);
    } catch (e) {}
  }

  function trigger() {
    if (busy) return;
    busy = true;
    dbg('[ACG] 暴走モード 発動！');
    beep();

    document.documentElement.classList.add('berserk-mode');

    var main = document.getElementById('main-content');
    var navInner = document.querySelector('.nav-inner');
    var title = document.querySelector('.hero-title');
    if (!reduce) {
      if (main) main.classList.add('berserk-shake');
      if (navInner) navInner.classList.add('berserk-shake');
      if (title) title.classList.add('berserk-title');
    }

    // 全屏警报层（纯 JS 创建，不修改 index.html）
    var fx = document.createElement('div');
    fx.id = 'berserkFx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML =
      '<div class="bzk-tint"></div>' +
      '<div class="bzk-scan"></div>' +
      '<div class="bzk-bar top"></div>' +
      '<div class="bzk-bar bottom"></div>' +
      '<div class="bzk-frame"></div>' +
      '<div class="bzk-center">' +
        '<div class="bzk-kicker">EMERGENCY · 紧急通告</div>' +
        '<div class="bzk-main">暴走モード 発動</div>' +
        '<div class="bzk-sub">检测到高浓度二次元能量 · <b>全员注意</b></div>' +
      '</div>';
    document.body.appendChild(fx);
    void fx.offsetWidth;   // 强制重排一次，保证动画从第一帧开始播
    fx.classList.add('on');

    // 1.9 秒时切换文案：从“発動”变成“解除”
    setTimeout(function () {
      var m = fx.querySelector('.bzk-main');
      var s = fx.querySelector('.bzk-sub');
      if (m) m.textContent = '暴走モード 解除';
      if (s) s.innerHTML = '能量释放完毕 · <b>系统恢复正常</b> ⚡';
    }, 1900);

    // 3.4 秒后收尾还原
    setTimeout(function () {
      fx.classList.add('out');
      setTimeout(function () { if (fx.parentNode) fx.parentNode.removeChild(fx); }, 450);

      document.documentElement.classList.remove('berserk-mode');
      if (main) main.classList.remove('berserk-shake');
      if (navInner) navInner.classList.remove('berserk-shake');
      if (title) title.classList.remove('berserk-title');

      cooldownUntil = Date.now() + COOLDOWN_MS;
      busy = false;
    }, 3400);
  }
})();

// ===== 25. ⚡ 启动序列 · 技术档案版 =====
// 黑幕标识 → 过曝洗白 → 暖白「技术档案」底板 → 五步授权 → 色散故障揭幕。
// 风格参考 Hypergryph 式开机序列（视觉语言为通用 UI 语汇，代码与文案均为本站原创）。
// 整段删除 + 删掉 style.css 里的 #acgBoot 段即可完全回滚，不影响其他功能。
(function () {
  var ONCE_PER_SESSION = true;   // true = 同一标签页会话只播一次；false = 每次刷新都播
  var SPEED = 1;                 // 整体快慢，1 = 原始速度；0.5 = 快一倍，2 = 慢一倍

  // 【可调】六幕文案。中文主字 + 英文等宽副标题
  var STEPS = [
    { zh: '需要访问许可',      en: 'ACCESS PERMISSION REQUIRED', ask: true  },
    { zh: '身份资料确认',      en: 'IDENTITY VERIFICATION',      ask: true  },
    { zh: '接收访问需求',      en: 'ACCESS REQUEST RECEIVED',    ask: false },
    { zh: '开始读取权限',      en: 'PERMISSION READ STARTED',    ask: false },
    { zh: '读取完毕 · 核验通过', en: 'READ COMPLETE · VERIFIED',  ask: false },
    { zh: '欢迎 {name} 访问',  en: 'WELCOME, {name}',            ask: false }
  ];

  var BRAND = ['次元整研社', 'ACG LABORATORY', 'XIANJU TECH'];   // 左上三行（第三行用强调色）
  var FOOT = 'POWERED BY 次元整研社';                            // 右下角
  var BOX_TEXT = 'ACG LAB · ACCESS GRANTED';                     // 揭幕后的黑底白字框

  var DEFAULT_NAME = '旅行者';

  // 没开"减少动态效果"才播（这是无障碍要求，不做例外）
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 已经播过就跳过（sessionStorage 被禁用时照样播）
  try {
    if (ONCE_PER_SESSION && sessionStorage.getItem('acg_lab_enter')) return;
    sessionStorage.setItem('acg_lab_enter', '1');
  } catch (e) {}

  // ── 取访问者昵称：优先读本地「次元名片」，读不到就用默认值 ──
  function readName() {
    try {
      var raw = localStorage.getItem('acg_lab_profile');
      if (!raw) return DEFAULT_NAME;
      var p = JSON.parse(raw);
      return (p && typeof p.username === 'string' && p.username.trim()) ? p.username.trim().slice(0, 12) : DEFAULT_NAME;
    } catch (e) { return DEFAULT_NAME; }
  }

  // ── 轻音效：全部用 Web Audio 现场合成，不引入任何音频文件 ──
  // 浏览器要求先有用户交互才允许出声，所以首次点击/按键之前是静音的。
  var Audio_ = (function () {
    var ac = null;
    function ctx() {
      if (ac) return ac;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ac = new AC();
      } catch (e) { ac = null; }
      return ac;
    }
    function tone(freq, dur, gain, type, slideTo) {
      var a = ctx(); if (!a) return;
      if (a.state === 'suspended' && a.resume) { try { a.resume(); } catch (e) {} }
      try {
        var t = a.currentTime;
        var osc = a.createOscillator(), g = a.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.05, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(a.destination);
        osc.start(t); osc.stop(t + dur + 0.02);
      } catch (e) {}
    }
    function noise(dur, gain, cutoff, attack) {
      var a = ctx(); if (!a) return;
      if (a.state === 'suspended' && a.resume) { try { a.resume(); } catch (e) {} }
      try {
        var t = a.currentTime, len = Math.max(1, Math.floor(a.sampleRate * dur));
        var buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        var src = a.createBufferSource(); src.buffer = buf;
        var f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff || 1400;
        var g = a.createGain();
        var at = attack || 0.01;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(gain || 0.05, t + at);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f); f.connect(g); g.connect(a.destination);
        src.start(t); src.stop(t + dur + 0.02);
      } catch (e) {}
    }
    return {
      tick:  function () { tone(1180, 0.035, 0.028, 'square'); },
      step:  function () { tone(430, 0.20, 0.04, 'sine', 640); },
      flash: function () { noise(0.55, 0.05, 800, 0.18); },
      glitch: function () { noise(0.38, 0.07, 2200, 0.005); tone(90, 0.20, 0.035, 'sawtooth'); }
    };
  })();

  // ── 预测量逐字渐显的每字间隔：先把文字放进 DOM 量宽度，避免量完闪烁 ──
  function typeDelay(el, count, totalMs) {
    var w0 = el.getBoundingClientRect().width;
    if (!w0 || !count) return Math.max(12, Math.min(38, totalMs / Math.max(1, count)));
    var probe = document.createElement('span');
    probe.textContent = 'X';
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
    el.appendChild(probe);
    var cw = probe.getBoundingClientRect().width;
    el.removeChild(probe);
    if (!cw) return 22;
    return Math.max(12, Math.min(38, (totalMs * cw) / w0));
  }

  // ── 逐字渐显（用透明度而非截断，居中排版不会左右抖动）──
  function typeIn(el, text, delay) {
    el.textContent = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'acgb-ch';
      s.textContent = text.charAt(i);
      s.style.animationDelay = (i * delay) + 'ms';
      frag.appendChild(s);
    }
    el.appendChild(frag);
    // 强制一次重排后再加 .on，保证动画从头播（同一帧内加会不触发）
    void el.offsetWidth;
    el.classList.add('on');
  }

  var finished = false;
  var timers = [];
  var root = document.documentElement;
  var name = readName();

  function clearAll() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms * SPEED)); }

  // ── 搭 DOM ──
  var el = document.createElement('div');
  el.id = 'acgBoot';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', '次元整研社 · 启动序列');

  var brandHtml = BRAND.map(function (line, i) {
    return '<div class="acgb-brand-line' + (i === BRAND.length - 1 ? ' accent' : '') + '">' + line + '</div>';
  }).join('');

  var barsHtml = '';
  for (var b = 0; b < 6; b++) {
    barsHtml += '<div class="acgb-gbar a" style="top:' + (14 + b * 13) + '%"></div>' +
                '<div class="acgb-gbar b" style="top:' + (19 + b * 13) + '%"></div>';
  }

  el.innerHTML =
    '<div class="acgb-scene acgb-s3">' +
      '<div class="acgb-corners"><i class="acgb-c bl"></i><i class="acgb-c br"></i></div>' +
      '<div class="acgb-brand">' + brandHtml +
        '<div class="acgb-meta">REV 0.7.0 · WEB PROFILE <span class="acgb-meta-rule"></span> <b class="acgb-clock">--:--:--</b></div>' +
      '</div>' +
      '<div class="acgb-steps">[ <b class="acgb-stepnow">00</b> / 0' + STEPS.length + ' ] BOOT</div>' +
      '<div class="acgb-foot">' + FOOT + '<span class="acgb-foot-sq"></span></div>' +
      '<div class="acgb-stage">' +
        '<div class="acgb-cross">' +
          '<div class="acgb-ring"></div>' +
          '<div class="acgb-ring acgb-ring--mid"></div>' +
          '<div class="acgb-ring acgb-ring--in"></div>' +
          '<div class="acgb-cross-plus"></div>' +
          '<div class="acgb-cross-plus v"></div>' +
          '<div class="acgb-cross-dot"></div>' +
          '<div class="acgb-copy">' +
            '<div class="acgb-sub" aria-live="polite"></div>' +
            '<div class="acgb-status"></div>' +
          '</div>' +
        '</div>' +
        '<div class="acgb-ask" hidden>' +
          '<button class="acgb-ask-btn" type="button">确认继续</button>' +
          '<div class="acgb-ask-hint">ENTER / SPACE / 点击继续</div>' +
        '</div>' +
      '</div>' +
      '<div class="acgb-progress"><i></i></div>' +
    '</div>' +
    '<div class="acgb-scene acgb-s2"></div>' +
    '<div class="acgb-scene acgb-s1">' +
      '<div class="acgb-s1-logo">' +
        '<span class="acgb-s1-mark">整</span>' +
        '<span class="acgb-s1-text">次元整研社 · ACG LAB</span>' +
      '</div>' +
    '</div>' +
    '<div class="acgb-glitch">' + barsHtml + '</div>' +
    '<div class="acgb-box">' + BOX_TEXT + '</div>' +
    '<button class="acgb-skip" type="button">跳过 SKIP</button>';

  document.body.appendChild(el);
  root.classList.add('acg-boot-lock');

  var s1 = el.querySelector('.acgb-s1');
  var s2 = el.querySelector('.acgb-s2');
  var glitch = el.querySelector('.acgb-glitch');
  var box = el.querySelector('.acgb-box');
  var subEl = el.querySelector('.acgb-sub');
  var statusEl = el.querySelector('.acgb-status');
  var askEl = el.querySelector('.acgb-ask');
  var askBtn = el.querySelector('.acgb-ask-btn');
  var stepNow = el.querySelector('.acgb-stepnow');
  var clockEl = el.querySelector('.acgb-clock');
  var barEl = el.querySelector('.acgb-progress i');
  var skipBtn = el.querySelector('.acgb-skip');

  // 实时时钟，给底板一点"正在运行"的感觉
  function tickClock() {
    var d = new Date(), p = function (n) { return n < 10 ? '0' + n : '' + n; };
    if (clockEl) clockEl.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  tickClock();
  var clockIv = setInterval(function () {
    if (finished) { clearInterval(clockIv); return; }
    tickClock();
  }, 1000);

  // ── 幕次状态机 ──
  var idx = 0, awaiting = false;
  function goto(i, force) {
    if (finished) return;
    if (i >= STEPS.length) { reveal(); return; }
    if (awaiting && !force) return;          // 等确认期间不接受自动推进
    awaiting = false;
    idx = i;
    var st = STEPS[i];
    var zh = st.zh.replace('{name}', name);
    var en = st.en.replace('{name}', name.toUpperCase());

    askEl.hidden = !st.ask;
    if (stepNow) stepNow.textContent = ('0' + (i + 1)).slice(-2);
    if (barEl) barEl.style.width = Math.round(((i + 1) / STEPS.length) * 100) + '%';

    if (i > 0) Audio_.step();

    // 中文主字与英文副标题共用一套逐字渐显
    subEl.classList.remove('on');
    statusEl.classList.remove('on');
    var d1 = typeDelay(subEl, en.length, Math.min(1200, 520 + en.length * 16));
    var d2 = typeDelay(statusEl, zh.length, 420);
    typeIn(subEl, en, d1);
    typeIn(statusEl, zh, d2);

    if (st.ask) {
      awaiting = true;
      if (askBtn) { try { askBtn.focus(); } catch (e) {} }
      return;   // 等用户确认后才推进
    }
    later(function () { goto(idx + 1); }, 1150 + Math.min(600, en.length * 10));
  }

  // ── 幕 6 之后：色散故障揭幕 ──
  function reveal() {
    if (finished) return;
    awaiting = false;
    if (stepNow) stepNow.textContent = '0' + STEPS.length;
    if (barEl) barEl.style.width = '100%';
    if (skipBtn) skipBtn.style.opacity = '0';
    Audio_.glitch();
    glitch.classList.add('on');
    box.classList.add('on');
    // 首屏浮现的起跑信号（见 style.css 第 13 节：元素默认隐藏，等这个属性出现才错峰浮现）
    root.setAttribute('data-acg-loaded', '1');
    later(function () { end(); }, 1400);
  }

  // ── 收尾 ──
  function end() {
    if (finished) return;
    finished = true;
    clearAll();
    awaiting = false;
    el.classList.add('acgb-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      root.classList.remove('acg-boot-lock');
    }, 460);
  }

  // ── 用户操作 ──
  function confirm() {
    if (finished) return;
    Audio_.tick();
    if (awaiting) goto(idx + 1, true);   // 强制推进当前确认步
  }
  if (askBtn) askBtn.addEventListener('click', function (e) { e.stopPropagation(); confirm(); });
  if (skipBtn) skipBtn.addEventListener('click', function (e) { e.stopPropagation(); end(); });
  el.addEventListener('click', function (e) {
    // 点空白处只推进"待确认"步骤，不直接跳过整段（避免误触丢失动画）
    if (!awaiting) return;
    var t = e.target;
    if (t && t.closest && t.closest('.acgb-skip, .acgb-ask-btn')) return;
    confirm();
  });
  function onKey(e) {
    if (e.key === 'Escape') { end(); return; }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      if (awaiting) { e.preventDefault(); confirm(); }
    }
  }
  document.addEventListener('keydown', onKey);

  // ── 起播 ──
  // 幕 1（黑幕标识）→ 幕 2（过曝洗白）→ 幕 3（底板 + 第一步）
  later(function () { if (s1) s1.style.display = 'none'; }, 1750);
  later(function () { if (s2) s2.classList.add('on'); Audio_.flash(); }, 1800);
  later(function () { if (s2) s2.style.display = 'none'; goto(0); }, 2900);

  // 保险：无论中途发生什么，25 秒内一定消失并解锁滚动
  setTimeout(function () { end(); }, 25000);
  window.addEventListener('pagehide', function () {
    document.removeEventListener('keydown', onKey);
  });
})();


// ===== 26. 📊 电台频谱（放歌时侧边栏出现随节奏跳动的频谱条；整段删除即可完全回滚） =====
(function () {
  var audio = document.getElementById('msAudio');
  var side = document.getElementById('musicSide');
  var drawer = document.getElementById('msDrawer');
  if (!audio || !side || !drawer) return;

  // 系统开了“减少动态效果”就不启用
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ① 频谱画布：纯 JS 创建，插在封面下方，不改 index.html
  var canvas = document.createElement('canvas');
  canvas.className = 'ms-spectrum';
  canvas.setAttribute('aria-hidden', 'true');
  var cover = drawer.querySelector('.ms-cover');
  if (cover && cover.parentNode) cover.parentNode.insertBefore(canvas, cover.nextSibling);
  else drawer.appendChild(canvas);

  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;

  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var cssW = 0, cssH = 0;
  var N = 0;
  var bars = [];

  var ac = null, srcNode = null, analyser = null, data = null;
  var failed = false;

  function sizes() {
    cssW = canvas.clientWidth || 200;
    cssH = canvas.clientHeight || 34;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    N = Math.max(12, Math.min(48, Math.floor(cssW / 6)));
    bars = [];
    for (var i = 0; i < N; i++) bars.push(2);
  }
  sizes();

  // ② 主题色（跟随换肤，换主题时自动刷新）
  var colorA = '#ff0033', colorB = '#00e5ff';
  function readColors() {
    try {
      var cs = getComputedStyle(document.documentElement);
      var a = cs.getPropertyValue('--primary').trim();
      var b = cs.getPropertyValue('--accent').trim();
      if (a) colorA = a;
      if (b) colorB = b;
    } catch (e) {}
  }
  readColors();
  if (window.MutationObserver) {
    var lastPrimary = colorA;
    new MutationObserver(function () {
      var now = '';
      try { now = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(); } catch (e) {}
      if (now && now !== lastPrimary) { lastPrimary = now; readColors(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  }

  // ③ 绘制
  function roundTopBar(x, y, w, h) {
    var r = Math.min(2, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
  }

  function paint(alpha, heights) {
    if (!cssW || !cssH) return;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.globalAlpha = alpha;
    var grad = ctx.createLinearGradient(0, 0, cssW, 0);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    var unit = cssW / N;
    var barW = Math.max(2, unit * 0.6);
    for (var i = 0; i < N; i++) {
      var h = Math.max(2, heights[i] || 2);
      var x = i * unit + (unit - barW) / 2;
      roundTopBar(x, cssH - h, barW, h);
    }
    ctx.globalAlpha = 1;
  }

  function drawIdle() {
    for (var i = 0; i < N; i++) bars[i] = 2;
    paint(0.35, bars);
  }

  function drawFrame() {
    if (!analyser || !data) return;
    analyser.getByteFrequencyData(data);
    for (var i = 0; i < N; i++) {
      var idx = Math.floor(Math.pow(i / N, 1.5) * 72) + 1;
      if (idx > data.length - 1) idx = data.length - 1;
      var v = data[idx] / 255;
      var target = 2 + v * (cssH - 8);
      bars[i] += (target - bars[i]) * 0.38;
    }
    paint(1, bars);
  }

  // ④ 音频分析：首次播放时挂载（在用户点击的时机创建，避开浏览器自动播放限制）
  function ensureAnalyser() {
    if (analyser) return true;
    if (failed) return false;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { failed = true; return false; }
      if (!ac) ac = new AC();
      if (ac.state === 'suspended' && ac.resume) { try { ac.resume(); } catch (e) {} }
      if (!srcNode) srcNode = ac.createMediaElementSource(audio);
      analyser = ac.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      srcNode.connect(analyser);
      analyser.connect(ac.destination);   // 关键：接回输出，否则会没声音
      data = new Uint8Array(analyser.frequencyBinCount);
      return true;
    } catch (e) {
      failed = true;
      analyser = null;
      dbg('[ACG] 频谱不可用，音频保持原样播放');
      try { if (srcNode && ac) srcNode.connect(ac.destination); } catch (e2) {}
      return false;
    }
  }

  // ⑤ 只在“播放中 + 侧栏打开 + 页面可见”时绘制，其余时间停机省电
  var rafId = 0;
  function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }
  function tick() {
    rafId = 0;
    if (audio.paused || document.hidden || !side.classList.contains('open') || !analyser || !data) {
      drawIdle();
      return;
    }
    drawFrame();
    rafId = requestAnimationFrame(tick);
  }
  function startLoop() {
    if (!analyser || !data) { drawIdle(); return; }
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  // ⑥ 事件接线
  audio.addEventListener('play', function () {
    if (!ensureAnalyser()) { canvas.classList.add('off'); return; }
    startLoop();
  });
  audio.addEventListener('playing', function () { if (analyser) startLoop(); });
  audio.addEventListener('pause', function () { stopLoop(); drawIdle(); });
  audio.addEventListener('ended', function () { stopLoop(); drawIdle(); });

  // 播放相关按钮被点击时先建立音频链路（在用户手势里创建，最不容易被浏览器拦截）
  var btnIds = ['msPlay', 'msPrev', 'msNext'];
  for (var b = 0; b < btnIds.length; b++) {
    (function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', function () { ensureAnalyser(); });
    })(btnIds[b]);
  }

  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (side.classList.contains('open')) {
        sizes();
        if (!audio.paused) startLoop(); else drawIdle();
      } else {
        stopLoop();
        drawIdle();
      }
    }).observe(side, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopLoop();
    else if (!audio.paused && side.classList.contains('open')) startLoop();
  });
  window.addEventListener('resize', function () {
    sizes();
    if (audio.paused || !side.classList.contains('open')) drawIdle();
  });

  drawIdle();   // 初始先画一帧“安静”状态
})();

// ===== 27. ✨ 卡片跟随指针的光晕（只改 CSS 变量，rAF 节流） =====
// 触屏没有 hover、或系统开了"减少动态效果"时不启用。
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

  var pending = null;
  var raf = 0;

  function apply() {
    raf = 0;
    if (!pending) return;
    var el = pending.el, x = pending.x, y = pending.y;
    pending = null;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    el.style.setProperty('--mx', (((x - r.left) / r.width) * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (((y - r.top) / r.height) * 100).toFixed(1) + '%');
  }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var t = e.target;
    if (!t || !t.closest) return;
    var card = t.closest('.card');
    if (!card) return;
    pending = { el: card, x: e.clientX, y: e.clientY };
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });
})();
