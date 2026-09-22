// ===== 1. 导航栏滚动效果 =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== 2. 移动端菜单切换 =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.classList.toggle('active', isOpen);
});

// 点击链接后自动关闭菜单
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== 3. 滚动入场动画 =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== 4. 数字滚动动画 =====
const counters = document.querySelectorAll('.stat strong');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.count;
      const duration = 1500;
      const start = performance.now();
      
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      };
      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ===== 5. 整活粒子背景 & 樱花飘落 =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H;
let particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 整活的文字彩蛋
const memes = ['有内鬼', '用爱发电', '前方高能', '已阅', '下次一定', 'DD斩首', '咕咕咕', '整活！'];
const colors = ['#7b2ff7', '#f107a3', '#00e5ff', '#ffcc00', '#ffffff'];

class Particle {
  constructor() {
    this.reset();
    this.y = Math.random() * H;
  }
  reset() {
    this.x = Math.random() * W;
    this.y = -20;
    this.size = Math.random() * 8 + 4;
    this.speed = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.rotate = Math.random() * Math.PI * 2;
    this.rotateSpeed = (Math.random() - 0.5) * 0.05;
    this.isMeme = Math.random() > 0.85; // 15% 概率出现整活文字
    this.memeText = memes[Math.floor(Math.random() * memes.length)];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.y += this.speed;
    this.rotate += this.rotateSpeed;
    if (this.y > H + 20) this.reset();
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotate);
    ctx.globalAlpha = this.opacity;
    if (this.isMeme) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = this.color;
      ctx.textAlign = 'center';
      ctx.fillText(this.memeText, 0, 0);
    } else {
      // 绘制樱花花瓣
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size/2, -this.size/2, this.size, 0, 0, this.size);
      ctx.bezierCurveTo(-this.size, 0, -this.size/2, -this.size/2, 0, 0);
      ctx.fillStyle = '#f107a3';
      ctx.fill();
    }
    ctx.restore();
  }
}

function initParticles() {
  const count = Math.min(60, Math.floor(W / 15));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

initParticles();
animate();

// ===== 6. 年份自动更新 =====
document.getElementById('year').textContent = new Date().getFullYear();
