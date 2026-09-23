// ===== 1. 导航栏滚动效果 =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); });

// ===== 2. 移动端菜单切换 =====
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

// ===== 4. 数字滚动动画 =====
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

// ===== 5. 整活粒子背景 & 樱花飘落 =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H; let particles = [];
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
const memes = ['有内鬼', '用爱发电', '前方高能', '已阅', '下次一定', 'DD斩首', '咕咕咕', '整活！'];
const colors = ['#7b2ff7', '#f107a3', '#00e5ff', '#ffcc00', '#ffffff'];

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
    else { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(this.size/2, -this.size/2, this.size, 0, 0, this.size); ctx.bezierCurveTo(-this.size, 0, -this.size/2, -this.size/2, 0, 0); ctx.fillStyle = '#f107a3'; ctx.fill(); }
    ctx.restore();
  }
}
function initParticles() { const count = Math.min(60, Math.floor(W / 15)); particles = []; for (let i = 0; i < count; i++) particles.push(new Particle()); }
function animate() { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
initParticles(); animate();

// ===== 6. 模拟注册/登录逻辑 =====
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
  const avatars = { '绘画': '🎨', 'Cos': '👗', '观影': '📺', '全能': '✨' };
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
    } else { alert('账号或密码错误！或者你还没有注册，请先点击下方“立即注册”。'); }
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('acg_lab_user'); showLoginBtn();
  alert('已安全退出次元。期待你的下次光临！');
});
checkLoginState();

// ===== 7. 年份自动更新 =====
document.getElementById('year').textContent = new Date().getFullYear();
// ===== 8. 图片灯箱功能 =====
const galleryImages = document.querySelectorAll('.gallery-item img');
if (galleryImages.length > 0) {
  // 动态创建灯箱
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
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
  });

  const closeLightbox = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
}
// ===== 9. 每日二次元抽卡 =====
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
    { text: '“我变秃了，也变强了。”', author: '《一拳超人》' }
  ];

  dailyAcgBtn.addEventListener('click', () => {
    // 添加一点随机延迟效果
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
