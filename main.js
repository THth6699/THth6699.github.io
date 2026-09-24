/* =========================================
   次元整研社 - main.js
   v0.3.0
   ========================================= */

(() => {
  "use strict";

  /* ---------- 通用工具 ---------- */

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const safeStorage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  };

  /* ---------- 页面加载 ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavigation();
    initModals();
    initGallery();
    initReveal();
    initBackToTop();
    initProgressBar();
    initDeveloperCenter();
    initProfile();
    initPWA();
  });

  /* =========================================
     主题系统
     ========================================= */

  const THEME_KEY = "acg-theme";

  function initTheme() {
    const savedTheme = safeStorage.get(THEME_KEY, "eva");

    document.documentElement.dataset.theme = savedTheme;

    $$(".theme-option").forEach(button => {
      const theme = button.dataset.theme;

      button.classList.toggle("active", theme === savedTheme);

      button.addEventListener("click", () => {
        setTheme(theme);
      });
    });
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    safeStorage.set(THEME_KEY, theme);

    $$(".theme-option").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.theme === theme
      );
    });

    updateDeveloperStatus();
  }

  /* =========================================
     导航栏
     ========================================= */

  function initNavigation() {
    const menuButton = $("[data-menu-toggle]");
    const mobileMenu = $("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", () => {
        const opened = mobileMenu.classList.toggle("open");

        menuButton.setAttribute(
          "aria-expanded",
          opened ? "true" : "false"
        );
      });

      $$(".nav-link", mobileMenu).forEach(link => {
        link.addEventListener("click", () => {
          mobileMenu.classList.remove("open");
          menuButton.setAttribute("aria-expanded", "false");
        });
      });
    }

    // 平滑滚动
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = $(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  /* =========================================
     Modal
     ========================================= */

  function initModals() {
    $$("[data-modal-open]").forEach(button => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.modalOpen;
        const modal = document.getElementById(targetId);

        if (modal) {
          openModal(modal);
        }
      });
    });

    $$("[data-modal-close]").forEach(button => {
      button.addEventListener("click", () => {
        const modal = button.closest(".modal");

        if (modal) {
          closeModal(modal);
        }
      });
    });

    $$(".modal").forEach(modal => {
      modal.addEventListener("click", event => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;

      const openedModal = $(".modal.active");

      if (openedModal) {
        closeModal(openedModal);
      }
    });
  }

  function openModal(modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal(modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    if (!$(".modal.active")) {
      document.body.classList.remove("modal-open");
    }
  }

  /* =========================================
     Gallery
     ========================================= */

  function initGallery() {
    const lightbox = $("#lightbox");

    if (!lightbox) return;

    const image = $("#lightbox-image");
    const title = $("#lightbox-title");

    $$(".gallery-item").forEach(item => {
      item.addEventListener("click", () => {
        const src =
          item.dataset.image ||
          $("img", item)?.src;

        const text =
          item.dataset.title ||
          $("img", item)?.alt ||
          "作品预览";

        if (!src) return;

        if (image) image.src = src;
        if (title) title.textContent = text;

        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
      });

      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          item.click();
        }
      });
    });

    const closeButton = $("[data-lightbox-close]", lightbox);

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
      });
    }

    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* =========================================
     滚动出现动画
     ========================================= */

  function initReveal() {
    const elements = $$(".reveal");

    if (!elements.length) return;

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach(element => {
        element.classList.add("visible");
      });

      return;
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach(element => {
        element.classList.add("visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    elements.forEach(element => observer.observe(element));
  }

  /* =========================================
     返回顶部
     ========================================= */

  function initBackToTop() {
    const button =
      $("#back-to-top") ||
      $("[data-back-to-top]");

    if (!button) return;

    window.addEventListener(
      "scroll",
      () => {
        button.classList.toggle(
          "show",
          window.scrollY > 500
        );
      },
      { passive: true }
    );

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /* =========================================
     页面阅读进度条
     ========================================= */

  function initProgressBar() {
    const bar =
      $("#reading-progress") ||
      $(".reading-progress");

    if (!bar) return;

    const update = () => {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (documentHeight <= 0) {
        bar.style.width = "0%";
        return;
      }

      const progress =
        (window.scrollY / documentHeight) * 100;

      bar.style.width =
        `${Math.min(100, Math.max(0, progress))}%`;
    };

    window.addEventListener("scroll", update, {
      passive: true
    });

    window.addEventListener("resize", update);

    update();
  }

  /* =========================================
     本地次元名片
     ========================================= */

  function initProfile() {
    const form = $("#profile-form");

    if (!form) return;

    const nameInput = $("#profile-name");
    const hobbyInput = $("#profile-hobby");

    const saved = safeStorage.get(
      "acg-profile",
      "{}"
    );

    try {
      const profile = JSON.parse(saved);

      if (nameInput) {
        nameInput.value = profile.name || "";
      }

      if (hobbyInput) {
        hobbyInput.value = profile.hobby || "";
      }
    } catch {}

    form.addEventListener("submit", event => {
      event.preventDefault();

      const profile = {
        name: nameInput?.value.trim() || "",
        hobby: hobbyInput?.value.trim() || ""
      };

      safeStorage.set(
        "acg-profile",
        JSON.stringify(profile)
      );

      alert("次元名片已保存！");
    });
  }

  /* =========================================
     PWA
     ========================================= */

  function initPWA() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
          updateDeveloperStatus();
        })
        .catch(error => {
          console.warn(
            "Service Worker 注册失败：",
            error
          );

          updateDeveloperStatus();
        });
    });
  }

  /* =========================================
     网站开发者中心
     ========================================= */

  function initDeveloperCenter() {
    /*
      推荐在 index.html 页脚加入：

      <button
        id="developer-version"
        type="button"
        aria-label="打开网站开发者中心"
      >
        v0.3.0
      </button>

      页面中加入：

      <div id="developer-center" class="developer-center">
        ...
      </div>
    */

    const versionButton =
      $("#developer-version") ||
      $("#developer-center-trigger");

    const center =
      $("#developer-center");

    if (!center) return;

    const closeButton =
      $("#developer-center-close") ||
      $("[data-developer-close]", center);

    if (versionButton) {
      versionButton.addEventListener("click", () => {
        openDeveloperCenter();
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        closeDeveloperCenter();
      });
    }

    center.addEventListener("click", event => {
      if (event.target === center) {
        closeDeveloperCenter();
      }
    });

    /*
      开发者彩蛋：

      Ctrl + Shift + D

      可以快速打开开发者中心。
    */

    document.addEventListener("keydown", event => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "d"
      ) {
        event.preventDefault();
        openDeveloperCenter();
      }

      if (event.key === "Escape") {
        closeDeveloperCenter();
      }
    });

    const debugButton =
      $("#developer-debug") ||
      $("[data-developer-debug]");

    if (debugButton) {
      debugButton.addEventListener("click", () => {
        toggleDeveloperDebug();
      });
    }

    const githubButton =
      $("#developer-github") ||
      $("[data-developer-github]");

    if (githubButton) {
      githubButton.addEventListener("click", () => {
        window.open(
          "https://github.com/THth6699/THth6699.github.io",
          "_blank",
          "noopener,noreferrer"
        );
      });
    }

    const issueButton =
      $("#developer-feedback") ||
      $("[data-developer-feedback]");

    if (issueButton) {
      issueButton.addEventListener("click", () => {
        window.open(
          "https://github.com/THth6699/THth6699.github.io/issues/new",
          "_blank",
          "noopener,noreferrer"
        );
      });
    }

    updateDeveloperStatus();
  }

  function openDeveloperCenter() {
    const center =
      $("#developer-center");

    if (!center) return;

    center.classList.add("active");

    center.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "developer-center-open"
    );

    updateDeveloperStatus();
  }

  function closeDeveloperCenter() {
    const center =
      $("#developer-center");

    if (!center) return;

    center.classList.remove("active");

    center.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "developer-center-open"
    );
  }

  /* =========================================
     开发者状态信息
     ========================================= */

  async function updateDeveloperStatus() {
    const theme =
      document.documentElement.dataset.theme ||
      "默认";

    const themeElement =
      $("#developer-theme");

    if (themeElement) {
      themeElement.textContent = theme;
    }

    const screenElement =
      $("#developer-screen");

    if (screenElement) {
      screenElement.textContent =
        `${window.innerWidth} × ${window.innerHeight}`;
    }

    const dprElement =
      $("#developer-dpr");

    if (dprElement) {
      dprElement.textContent =
        window.devicePixelRatio || 1;
    }

    const onlineElement =
      $("#developer-online");

    if (onlineElement) {
      onlineElement.textContent =
        navigator.onLine ? "在线" : "离线";
    }

    const browserElement =
      $("#developer-browser");

    if (browserElement) {
      browserElement.textContent =
        detectBrowser();
    }

    const pwaElement =
      $("#developer-pwa");

    if (pwaElement) {
      pwaElement.textContent =
        detectPWA()
          ? "已安装 / 独立模式"
          : "浏览器模式";
    }

    const swElement =
      $("#developer-sw");

    if (swElement) {
      swElement.textContent =
        "serviceWorker" in navigator
          ? "支持"
          : "不支持";
    }

    const cacheElement =
      $("#developer-cache");

    if (cacheElement) {
      if ("caches" in window) {
        try {
          const keys =
            await caches.keys();

          cacheElement.textContent =
            keys.length
              ? `正常（${keys.length} 个缓存）`
              : "暂无缓存";
        } catch {
          cacheElement.textContent =
            "无法读取";
        }
      } else {
        cacheElement.textContent =
          "浏览器不支持";
      }
    }

    const pathElement =
      $("#developer-path");

    if (pathElement) {
      pathElement.textContent =
        window.location.pathname;
    }

    const userAgentElement =
      $("#developer-user-agent");

    if (userAgentElement) {
      userAgentElement.textContent =
        navigator.userAgent;
    }
  }

  function toggleDeveloperDebug() {
    const debugPanel =
      $("#developer-debug-panel");

    if (!debugPanel) return;

    const opened =
      debugPanel.classList.toggle("active");

    debugPanel.setAttribute(
      "aria-hidden",
      opened ? "false" : "true"
    );

    if (opened) {
      updateDeveloperStatus();
    }
  }

  /* =========================================
     浏览器识别
     ========================================= */

  function detectBrowser() {
    const ua = navigator.userAgent;

    if (/Edg\//.test(ua)) {
      return "Microsoft Edge";
    }

    if (/OPR\//.test(ua)) {
      return "Opera";
    }

    if (/Chrome\//.test(ua)) {
      return "Google Chrome";
    }

    if (/Firefox\//.test(ua)) {
      return "Mozilla Firefox";
    }

    if (/Safari\//.test(ua) &&
        !/Chrome\//.test(ua)) {
      return "Safari";
    }

    return "未知浏览器";
  }

  /* =========================================
     PWA 独立模式检测
     ========================================= */

  function detectPWA() {
    return (
      window.matchMedia &&
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches
    ) || window.navigator.standalone === true;
  }

  /* =========================================
     开发者状态实时更新
     ========================================= */

  window.addEventListener(
    "resize",
    () => {
      updateDeveloperStatus();
    },
    { passive: true }
  );

  window.addEventListener(
    "online",
    updateDeveloperStatus
  );

  window.addEventListener(
    "offline",
    updateDeveloperStatus
  );

})();
