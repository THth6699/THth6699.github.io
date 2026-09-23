// ===== 0. ⭐ 一键换肤（主题切换） =====
const themes = {
  eva: {
    name: 'EVA 红黑',
    vars: {
      '--primary': '#ff0033', '--primary-rgb': '255, 0, 51',
      '--secondary': '#1a1a1a', '--secondary-rgb': '26, 26, 26',
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
  localStorage.setItem('acg_lab_theme', themeKey);
  // 更新按钮激活状态
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });
}

const themeToggle = document.getElementById('themeToggle');
const themePanel = document.getElementById('themePanel');

if (themeToggle && themePanel) {
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themePanel.classList.toggle('open');
  });
  // 点击页面其他位置关闭面板
  document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && e.target !== themeToggle) {
      themePanel.classList.remove('open');
    }
  });
  // 绑定主题选项
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
    });
  });
  // 加载用户上次选择的主题
  const savedTheme = localStorage.getItem('acg_lab_theme');
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  }
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
const memes = ['有内鬼', '用爱发电', '前方高能', '已阅', '下次一定', 'DD斩首', '咕咕咕', '整活！'];
const colors = ['#ff0033', '#1a1a1a', '#00e5ff', '#ffcc00', '#ffffff'];

class Particle {
  constructor() { this.reset(); this.y = Math.random() * H; }
  reset() {
    this.x = Math.random() * W; this.y = -20; this.size = Math.random() * 8 + 4;
    this.speed = Math.random() * 1.5 + 0.5; this.opacity = Math.random() * 0.5 + 0.2;
    this.rotate = Math.random() * Math.PI * 2; this.rotateSpeed = (Math.random() - 0.5) * 0.05;
    this.isMeme = Math.random() > 0.85; this.memeText = memes[Math.floor(Math.random() * memes.length)];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() { this.y += this.speed; this.rotate += this.rotateSpeed; if (this.y > H + 20) this.reset(); }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotate); ctx.globalAlpha = this.opacity;
    if (this.isMeme) { ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = this.color; ctx.textAlign = 'center'; ctx.fillText(this.memeText, 0, 0); }
    else { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(this.size/2, -this.size/2, this.size, 0, 0, this.size); ctx.bezierCurveTo(-this.size, 0, -this.size/2, -this.size/2, 0, 0); ctx.fillStyle = '#ff0033'; ctx.fill(); }
    ctx.restore();
  }
}
function initParticles() { const count = Math.min(60, Math.floor(W / 15)); particles = []; for (let i = 0; i < count; i++) particles.push(new Particle()); }
function animate() { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
initParticles(); animate();

// ===== 6. 登录注册 =====
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const modalClose = document.getElementById('modalClose');
const switchAuthBtn = document.getElementById('switchAuthBtn');
const switchAuthText = document.getElementById('switchAuthText');
const modalTitle = document.getElementById('modalTitle');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const authForm = document.getElementById('authForm');
const registerExtra = document.getElementById('registerExtra');
const userInfo = document.getElementById('userInfo');
const userNameDisplay = document.getElementById('userNameDisplay');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
let isRegisterMode = false;

function checkLoginState() {
  const user = JSON.parse(localStorage.getItem('acg_lab_user'));
  if (user) showUserInfo(user); else showLoginBtn();
}
function showUserInfo(user) {
  loginBtn.style.display = 'none'; userInfo.style.display = 'flex';
  userNameDisplay.textContent = user.username;
  const avatars = { '产粮': '🎨', 'Cos': '👗', '观影': '📺', '全能': '✨' };
  userAvatar.textContent = avatars[user.direction] || '👤';
}
function showLoginBtn() { loginBtn.style.display = 'inline-block'; userInfo.style.display = 'none'; }
function openModal(mode) {
  isRegisterMode = mode === 'register';
  modalTitle.textContent = isRegisterMode ? '注册次元账号' : '登录次元账号';
  submitAuthBtn.textContent = isRegisterMode ? '注 册' : '登 录';
  switchAuthText.textContent = isRegisterMode ? '已有账号？' : '还没有账号？';
  switchAuthBtn.textContent = isRegisterMode ? '去登录' : '立即注册';
  registerExtra.style.display = isRegisterMode ? 'block' : 'none';
  authModal.classList.add('active');
}
function closeModal() { authModal.classList.remove('active'); authForm.reset(); }

loginBtn.addEventListener('click', () => openModal('login'));
modalClose.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });
switchAuthBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(isRegisterMode ? 'login' : 'register'); });

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('authUsername').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  if (!username || !password) return;

  if (isRegisterMode) {
    const direction = document.getElementById('authDirection').value;
    const user = { username, password, direction };
    localStorage.setItem('acg_lab_user', JSON.stringify(user));
    alert(`注册成功！欢迎加入次元整研社，${username} 同学！`);
    showUserInfo(user); closeModal();
  } else {
    const savedUser = JSON.parse(localStorage.getItem('acg_lab_user'));
    if (savedUser && savedUser.username === username && savedUser.password === password) {
      alert(`欢迎回来，${username}！`); showUserInfo(savedUser); closeModal();
    } else { alert('账号或密码错误！或者你还没有注册，请先点击下方"立即注册"。'); }
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('acg_lab_user'); showLoginBtn();
  alert('已安全退出次元。期待你的下次光临！');
});
checkLoginState();

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
  if (deptJoinBtn) {
    deptJoinBtn.addEventListener('click', () => { closeDeptModal(); });
  }
}
