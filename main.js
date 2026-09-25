// ===== 0. ⭐ 一键换肤（主题切换） =====
const themes = {
  eva: {
    name: 'EVA 红黑',
    vars: {
      '--primary': '#ff0033', '--primary-rgb': '255, 0, 51',
      '--secondary': '#7a0019', '--secondary-rgb': '122, 0, 25',
      '--accent': '#00e5ff', '--accent-rgb': '0, 229, 255',
      '--bg-color': '#0b0b14', '--bg-rgb': '11, 11, 20',
      '--modal-bg': '#151522',
      '--text-main': '#eaeaf2', '--text-muted': '#a8a8be', '--text-dim': '#8888a0',
      '--primary-light': '#ff8080'
    }
  },
  miku: {
    name: '初音未来',
    vars: {
      '--primary': '#39c5bb', '--primary-rgb': '57, 197, 187',
      '--secondary': '#007070', '--secondary-rgb': '0, 112, 112',
      '--accent': '#00ffcc', '--accent-rgb': '0, 255, 204',
      '--bg-color': '#071113', '--bg-rgb': '7, 17, 19',
      '--modal-bg': '#0e1f22',
      '--text-main': '#e6f5f4', '--text-muted': '#a0c4c2', '--text-dim': '#6a8a88',
      '--primary-light': '#7dd9d3'
    }
  },
  genshin: {
    name: '原神星空',
    vars: {
      '--primary': '#ffcc00', '--primary-rgb': '255, 204, 0',
      '--secondary': '#4a3b6b', '--secondary-rgb': '74, 59, 107',
      '--accent': '#ffffff', '--accent-rgb': '255, 255, 255',
      '--bg-color': '#121020', '--bg-rgb': '18, 16, 32',
      '--modal-bg': '#1d1a2e',
      '--text-main': '#f5f0e8', '--text-muted': '#c4b8d6', '--text-dim': '#8a7fa0',
      '--primary-light': '#ffdd55'
    }
  },
  sakura: {
    name: '樱花治愈',
    vars: {
      '--primary': '#ff9db5', '--primary-rgb': '255, 157, 181',
      '--secondary': '#fbc2eb', '--secondary-rgb': '251, 194, 235',
      '--accent': '#a6c1ee', '--accent-rgb': '166, 193, 238',
      '--bg-color': '#1f1822', '--bg-rgb': '31, 24, 34',
      '--modal-bg': '#2c2431',
      '--text-main': '#fdf5fa', '--text-muted': '#d4c4d0', '--text-dim': '#9a8a98',
      '--primary-light': '#ffc0d0'
    }
  },
  cyber: {
    name: '赛博朋克',
    vars: {
      '--primary': '#fcee0a', '--primary-rgb': '252, 238, 10',
      '--secondary': '#ff003c', '--secondary-rgb': '255, 0, 60',
      '--accent': '#00f0ff', '--accent-rgb': '0, 240, 255',
      '--bg-color': '#0a0a0a', '--bg-rgb': '10, 10, 10',
      '--modal-bg': '#161616',
      '--text-main': '#f5f5f5', '--text-muted': '#b0b0b0', '--text-dim': '#707070',
      '--primary-light': '#fff68f'
    }
  }
};

function applyTheme(themeKey) {
  const theme = themes[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
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
  const savedTheme = localStorage.getItem('acg_lab_theme');
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  }
  themeToggle.setAttribute('aria-expanded', 'false');
}

// ===== 1. 导航栏滚动 =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); });

// ===== 2. 移动端菜单 =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => { navLinks.classList.remove('open'); });
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
  document.body.style.overflow = 'hidden';
  setTimeout(() => authUsername.focus(), 0);
}
function closeProfileModal() {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
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
const galleryImages = document.querySelectorAll('.gallery-item img');
if (galleryImages.length > 0) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<button class="lightbox-close">✕</button><img src="" alt="Preview">';
  document.body.appendChild(overlay);
  const overlayImg = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.lightbox-close');

  galleryImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      overlayImg.src = img.src;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
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
  '产粮部': {
    icon: '🎨',
    content: `
      <p><strong>定位：</strong>社团的产粮主力，用画笔创造世界。</p>
      <p style="margin-top:12px;"><strong>我们平时做什么：</strong></p>
      <ul>
        <li>线下摸鱼绘茶会，带上平板或画本互相催更。</li>
        <li>社团海报、周边、网站配图的创作。</li>
        <li>互相交流板绘、手绘、同人创作技巧。</li>
      </ul>
      <p style="margin-top:12px;"><strong>招募要求：</strong>不论你是大触还是零基础萌新，只要热爱画画，我们都欢迎！</p>
    `
  },
  '观影吐槽部': {
    icon: '📺',
    content: `
      <p><strong>定位：</strong>追番先锋队，负责看番和疯狂吐槽。</p>
      <p style="margin-top:12px;"><strong>我们平时做什么：</strong></p>
      <ul>
        <li>每季新番同步追，在群里实况弹幕式吐槽。</li>
        <li>组织线上放映会，提供笑点支持。</li>
        <li>老番补习班、神作安利、烂片排雷。</li>
      </ul>
      <p style="margin-top:12px;"><strong>招募要求：</strong>喜欢看番，自带吐槽技能，能接受"禁止打架但可以激情互喷"的观影氛围。</p>
    `
  },
  'Cos变装部': {
    icon: '👗',
    content: `
      <p><strong>定位：</strong>社团的颜值担当和出片主力。</p>
      <p style="margin-top:12px;"><strong>我们平时做什么：</strong></p>
      <ul>
        <li>漫展组团远征，包车、帮妆、看行李一条龙服务。</li>
        <li>校园外景团建，互相当摄影师，出片率极高。</li>
        <li>试妆交流，男扮女装不是梦，女扮男装帅断腿。</li>
      </ul>
      <p style="margin-top:12px;"><strong>招募要求：</strong>男女不限，社恐可治，零基础也OK，关键要敢于表现自己！</p>
    `
  },
  '技术支援部': {
    icon: '💻',
    content: `
      <p><strong>定位：</strong>社团的极客大脑，用代码给社团开挂。</p>
      <p style="margin-top:12px;"><strong>我们平时做什么：</strong></p>
      <ul>
        <li>维护社团官网（这个网站就是我们的作品）。</li>
        <li>写网页、做工具、搞自动化脚本。</li>
        <li>探索 Git、GitHub Pages 等前沿技术。</li>
      </ul>
      <p style="margin-top:12px;"><strong>招募要求：</strong>对编程、网页设计、网站维护有兴趣，愿意学习新技术的同学。</p>
    `
  },
  '什么都不干部': {
    icon: '🛋️',
    content: `
      <p><strong>定位：</strong>社团的灵魂部门！负责围观、吃瓜、当气氛组。</p>
      <p style="margin-top:12px;"><strong>我们平时做什么：</strong></p>
      <ul>
        <li>在群里发表情包、点赞、喊"666"。</li>
        <li>成为各项活动的"啦啦队"和"第一观众"。</li>
        <li>享受纯粹的二次元聊天氛围，不承担任何硬性任务。</li>
      </ul>
      <p style="margin-top:12px;"><strong>招募要求：</strong>只要你热爱二次元，不想内卷，这里就是你的快乐老家！</p>
    `
  },
  '加入方式': {
    icon: '✨',
    content: `<p>在QQ群发言，或直接联系群主/各部部长。不限专业、不限年级，只要你热爱二次元！</p>`
  }
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
        document.body.style.overflow = 'hidden';
      }
    });
  });
  const closeDeptModal = () => {
    deptModal.classList.remove('active');
    document.body.style.overflow = '';
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

// ===== 11. 活动中心：GitHub Pages 静态数据驱动 =====
const activities = [];
const activityList = document.getElementById('activity-list');
if (activityList) {
  const renderActivities = (filter = 'all') => {
    const list = filter === 'all' ? activities : activities.filter(item => item.status === filter);
    activityList.innerHTML = list.map(item => `
      <article class="activity-item reveal show">
        <div class="activity-date"><strong>${item.date.slice(5)}</strong><span>${item.date.slice(0,4)}</span></div>
        <div class="activity-dot">${item.icon}</div>
        <div class="activity-body"><div class="activity-meta"><span class="tag">${item.tag}</span><span class="status status-${item.status}">${item.status}</span></div><h3>${item.title}</h3><p>${item.desc}</p></div>
      </article>`).join('') || '<div class="empty-state">这个分类暂时没有活动。</div>';
  };
  renderActivities();
  document.querySelectorAll('[data-activity-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-activity-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderActivities(btn.dataset.activityFilter);
  }));
}

// ===== 12. 画廊筛选 =====
const galleryItems = [...document.querySelectorAll('[data-gallery-category]')];
const galleryEmpty = document.getElementById('galleryEmpty');
document.querySelectorAll('[data-gallery-filter]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-gallery-filter]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.galleryFilter;
  let visible = 0;
  galleryItems.forEach(item => {
    const show = filter === 'all' || item.dataset.galleryCategory === filter;
    item.hidden = !show; if (show) visible++;
  });
  if (galleryEmpty) galleryEmpty.hidden = visible !== 0;
}));

// ===== 13. 今日打卡：本地存储 + 连续天数 =====
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
if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    if (!contributorModal) return;
    contributorModal.classList.remove('active');
    contributorModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  contributorBtn?.addEventListener('click', open);
  contributorClose?.addEventListener('click', close);
  contributorModal?.addEventListener('click', e => {
    if (e.target === contributorModal) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();

// ===== 19. 网站开发者中心 v0.3.0 =====
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
    const themeKey = localStorage.getItem('acg_lab_theme') || 'eva';
    const themeNames = { eva: 'EVA 红黑', miku: '初音未来', genshin: '原神星空', sakura: '樱花治愈', cyber: '赛博朋克' };
    const sw = 'serviceWorker' in navigator;

    setText('devPwaStatus', window.matchMedia?.('(display-mode: standalone)').matches ? '已安装' : '浏览器模式');
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
    document.body.style.overflow = 'hidden';
    updateDebugInfo();
  };
  const close = () => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  const devModeToggle = document.getElementById('devModeToggle');
  const devRefreshStatus = document.getElementById('devRefreshStatus');
  const devDebugOutput = document.getElementById('devDebugOutput');

  devModeToggle?.addEventListener('click', () => {
    if (!devDebugOutput) return;
    const willShow = devDebugOutput.hidden;
    devDebugOutput.hidden = !willShow;
    devModeToggle.textContent = willShow ? '关闭开发者模式' : '开启开发者模式';
    updateDebugInfo();
  });
  devRefreshStatus?.addEventListener('click', updateDebugInfo);

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape') close();
  });

  window.addEventListener('resize', updateDebugInfo, { passive: true });
  window.addEventListener('online', updateDebugInfo);
  window.addEventListener('offline', updateDebugInfo);
})();

// ===== 20. 🎵 多功能音乐播放悬浮窗 v2.0 =====
(() => {
  const orb = document.getElementById('musicOrb');
  const panel = document.getElementById('musicPanel');
  const panelClose = document.getElementById('musicPanelClose');
  const orbIcon = document.getElementById('musicOrbIcon');
  const audio = document.getElementById('bgmAudio');
  if (!orb || !panel || !audio) return;

  // ========== 音乐库配置 ==========
  const fallbackPlaylist = [
    { src: 'assets/music/bgm.mp3', title: '次元基地', artist: 'BGM 01', emoji: '🎧' }
  ];

  let playlist = [...fallbackPlaylist];
  let currentIndex = 0;
  let playMode = localStorage.getItem('acg_lab_music_mode') || 'loop';
  const modeIcons = { loop: '🔁', single: '🔂', shuffle: '🔀' };
  const modeTitles = { loop: '列表循环', single: '单曲循环', shuffle: '随机播放' };

  const el = {
    coverEmoji: document.getElementById('musicCoverEmoji'),
    title: document.getElementById('musicTitle'),
    artist: document.getElementById('musicArtist'),
    progress: document.getElementById('musicProgress'),
    currentTime: document.getElementById('musicCurrentTime'),
    duration: document.getElementById('musicDuration'),
    play: document.getElementById('musicPlay'),
    prev: document.getElementById('musicPrev'),
    next: document.getElementById('musicNext'),
    mode: document.getElementById('musicMode'),
    volume: document.getElementById('musicVolume'),
    volumeIcon: document.getElementById('musicVolumeIcon'),
    listBtn: document.getElementById('musicListBtn'),
    playlist: document.getElementById('musicPlaylist'),
    playlistUl: document.getElementById('musicPlaylistUl')
  };

  const fmtTime = (s) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const renderPlaylist = () => {
    if (!el.playlistUl) return;
    el.playlistUl.innerHTML = playlist.map((track, i) => `
      <li data-index="${i}" class="${i === currentIndex ? 'active' : ''}">
        <span class="track-name">${track.emoji} ${track.title}</span>
      </li>
    `).join('');
    el.playlistUl.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        const idx = +li.dataset.index;
        if (idx === currentIndex) { togglePlay(); }
        else { loadTrack(idx); playTrack(); }
      });
    });
  };

  const loadTrack = (index) => {
    currentIndex = (index + playlist.length) % playlist.length;
    const track = playlist[currentIndex];
    audio.src = track.src;
    el.title.textContent = track.title;
    el.artist.textContent = track.artist;
    el.coverEmoji.textContent = track.emoji;
    el.progress.value = 0;
    el.currentTime.textContent = '0:00';
    el.duration.textContent = '0:00';
    renderPlaylist();
  };

  const playTrack = () => {
    audio.play().then(() => {
      orb.classList.add('playing');
      el.play.textContent = '⏸';
      orbIcon.textContent = '🎶';
    }).catch(err => {
      console.warn('播放失败：', err);
      el.title.textContent = '播放失败，请检查音频文件';
    });
  };
  const pauseTrack = () => {
    audio.pause();
    orb.classList.remove('playing');
    el.play.textContent = '▶';
    orbIcon.textContent = '🎵';
  };
  const togglePlay = () => audio.paused ? playTrack() : pauseTrack();

  const prevTrack = () => {
    if (playMode === 'shuffle') loadTrack(Math.floor(Math.random() * playlist.length));
    else loadTrack(currentIndex - 1);
    playTrack();
  };
  const nextTrack = () => {
    if (playMode === 'shuffle') loadTrack(Math.floor(Math.random() * playlist.length));
    else loadTrack(currentIndex + 1);
    playTrack();
  };

  audio.addEventListener('loadedmetadata', () => {
    el.duration.textContent = fmtTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      el.progress.value = (audio.currentTime / audio.duration) * 100;
      el.currentTime.textContent = fmtTime(audio.currentTime);
    }
  });
  audio.addEventListener('ended', () => {
    if (playMode === 'single') { audio.currentTime = 0; playTrack(); }
    else nextTrack();
  });
  audio.addEventListener('play', () => {
    orb.classList.add('playing');
    el.play.textContent = '⏸';
    orbIcon.textContent = '🎶';
  });
  audio.addEventListener('pause', () => {
    orb.classList.remove('playing');
    el.play.textContent = '▶';
    orbIcon.textContent = '🎵';
  });

  el.progress.addEventListener('input', () => {
    if (audio.duration) {
      audio.currentTime = (el.progress.value / 100) * audio.duration;
    }
  });

  const savedVolume = parseFloat(localStorage.getItem('acg_lab_volume'));
  if (!isNaN(savedVolume)) {
    audio.volume = savedVolume;
    el.volume.value = savedVolume;
  } else {
    audio.volume = 0.7;
  }
  el.volume.addEventListener('input', () => {
    audio.volume = el.volume.value;
    localStorage.setItem('acg_lab_volume', el.volume.value);
    updateVolumeIcon();
  });
  const updateVolumeIcon = () => {
    const v = audio.volume;
    el.volumeIcon.textContent = v === 0 ? '🔇' : v < 0.4 ? '🔉' : '🔊';
  };
  updateVolumeIcon();
  el.volumeIcon.addEventListener('click', () => {
    audio.muted = !audio.muted;
    el.volumeIcon.textContent = audio.muted ? '🔇' : (audio.volume < 0.4 ? '🔉' : '🔊');
  });

  const updateModeBtn = () => {
    el.mode.textContent = modeIcons[playMode];
    el.mode.title = modeTitles[playMode];
  };
  updateModeBtn();
  el.mode.addEventListener('click', () => {
    const modes = ['loop', 'single', 'shuffle'];
    playMode = modes[(modes.indexOf(playMode) + 1) % modes.length];
    localStorage.setItem('acg_lab_music_mode', playMode);
    updateModeBtn();
  });

  el.play.addEventListener('click', togglePlay);
  el.prev.addEventListener('click', prevTrack);
  el.next.addEventListener('click', nextTrack);
  el.listBtn.addEventListener('click', () => {
    el.playlist.classList.toggle('open');
  });
  panelClose.addEventListener('click', () => {
    panel.classList.remove('open');
  });


  // ========== 稳定版拖动悬浮球 ==========
const STORAGE_KEY = 'acg_lab_orb_pos';

let isDragging = false;
let hasMoved = false;
let startX = 0;
let startY = 0;
let startLeft = 0;
let startTop = 0;
let lastTapTime = 0;

const getSavedPosition = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    if (
      saved &&
      Number.isFinite(saved.x) &&
      Number.isFinite(saved.y)
    ) {
      return saved;
    }
  } catch (_) {}

  return null;
};

const savedPosition = getSavedPosition();

if (savedPosition) {
  orb.style.left = `${savedPosition.x}px`;
  orb.style.top = `${savedPosition.y}px`;
  orb.style.right = 'auto';
  orb.style.bottom = 'auto';
}

const clampPosition = (x, y) => {
  const width = orb.offsetWidth;
  const height = orb.offsetHeight;
  const margin = 8;

  return {
    x: Math.max(margin, Math.min(window.innerWidth - width - margin, x)),
    y: Math.max(margin, Math.min(window.innerHeight - height - margin, y))
  };
};

const onPointerDown = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  event.preventDefault();

  const rect = orb.getBoundingClientRect();

  isDragging = true;
  hasMoved = false;
  startX = event.clientX;
  startY = event.clientY;
  startLeft = rect.left;
  startTop = rect.top;

  orb.style.left = `${rect.left}px`;
  orb.style.top = `${rect.top}px`;
  orb.style.right = 'auto';
  orb.style.bottom = 'auto';
  orb.style.transform = 'none';

  orb.classList.add('dragging');
  document.body.classList.add('orb-dragging');

  if (orb.setPointerCapture && event.pointerId !== undefined) {
    try {
      orb.setPointerCapture(event.pointerId);
    } catch (_) {}
  }
};

const onPointerMove = (event) => {
  if (!isDragging) return;

  event.preventDefault();

  const dx = event.clientX - startX;
  const dy = event.clientY - startY;

  if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
    hasMoved = true;
  }

  const position = clampPosition(
    startLeft + dx,
    startTop + dy
  );

  orb.style.left = `${position.x}px`;
  orb.style.top = `${position.y}px`;

  if (panel.classList.contains('open')) {
    positionPanel();
  }
};

const onPointerUp = (event) => {
  if (!isDragging) return;

  isDragging = false;

  if (
    orb.releasePointerCapture &&
    event.pointerId !== undefined &&
    orb.hasPointerCapture?.(event.pointerId)
  ) {
    try {
      orb.releasePointerCapture(event.pointerId);
    } catch (_) {}
  }

  orb.classList.remove('dragging');
  document.body.classList.remove('orb-dragging');

  const rect = orb.getBoundingClientRect();

  orb.style.left = `${rect.left}px`;
  orb.style.top = `${rect.top}px`;
  orb.style.right = 'auto';
  orb.style.bottom = 'auto';
  orb.style.transform = 'none';

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        x: rect.left,
        y: rect.top
      })
    );
  } catch (_) {}

  // 没有移动时，仍然保留点击打开面板的功能
  if (!hasMoved) {
    const now = Date.now();

    if (now - lastTapTime < 300) {
      nextTrack();
      lastTapTime = 0;
      return;
    }

    lastTapTime = now;

    setTimeout(() => {
      if (Date.now() - lastTapTime < 250) return;

      if (panel.classList.contains('open')) {
        panel.classList.remove('open');
      } else {
        positionPanel();
        panel.classList.add('open');
      }
    }, 200);
  }
};

orb.addEventListener('pointerdown', onPointerDown, {
  passive: false
});

orb.addEventListener('pointermove', onPointerMove, {
  passive: false
});

orb.addEventListener('pointerup', onPointerUp, {
  passive: false
});

orb.addEventListener('pointercancel', onPointerUp, {
  passive: false
});

  orb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePlay();
    }
  });

  // ========== 初始化 ==========
  loadTrack(0);
  renderPlaylist();

  // 尝试加载 playlist.json
  fetch('assets/music/playlist.json')
    .then(res => res.ok ? res.json() : Promise.reject('JSON 加载失败'))
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        playlist = data;
        currentIndex = 0;
        loadTrack(0);
        renderPlaylist();
      }
    })
    .catch(err => {
      console.warn('无法加载 playlist.json，使用默认列表：', err);
    });
})();
