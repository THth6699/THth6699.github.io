/* Performance patch. This file is intentionally standalone and can be loaded after main.js. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;

  // Throttle scroll notifications used by this patch.
  let scrollFrame = 0;
  const scheduleScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      document.dispatchEvent(new CustomEvent('acg:scroll-frame'));
    });
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });

  // Limit the existing canvas workload when the page is busy or hidden.
  const canvas = document.getElementById('particles');
  if (canvas) {
    canvas.style.pointerEvents = 'none';
    if (mobile || reduceMotion) canvas.style.display = 'none';
  }

  // Prevent accidental duplicate service-worker registrations from causing extra work.
  const registrations = navigator.serviceWorker?.getRegistrations;
  if (registrations) {
    registrations.call(navigator.serviceWorker).then(list => {
      const seen = new Set();
      list.forEach(registration => {
        const key = registration.scope;
        if (seen.has(key)) registration.unregister();
        else seen.add(key);
      });
    }).catch(() => {});
  }

  // ===== 页面缩放控制 =====
  const STORAGE_KEY = 'acg_lab_zoom';
  const MIN_ZOOM = 80;
  const MAX_ZOOM = 120;
  const STEP = 10;

  const clampZoom = value => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));

  const readZoom = () => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      return Number.isFinite(saved) ? clampZoom(saved) : 100;
    } catch (_) {
      return 100;
    }
  };

  const applyZoom = value => {
    const zoom = clampZoom(value);
    // CSS zoom preserves normal layout flow better than transform: scale().
    document.documentElement.style.zoom = `${zoom}%`;
    const output = document.getElementById('zoomValue');
    if (output) output.textContent = `${zoom}%`;

    const decrease = document.getElementById('zoomDecrease');
    const increase = document.getElementById('zoomIncrease');
    if (decrease) decrease.disabled = zoom <= MIN_ZOOM;
    if (increase) increase.disabled = zoom >= MAX_ZOOM;

    try { localStorage.setItem(STORAGE_KEY, String(zoom)); } catch (_) {}
  };

  const createZoomControls = () => {
    if (document.getElementById('zoomControls')) return;

    const controls = document.createElement('div');
    controls.id = 'zoomControls';
    controls.className = 'zoom-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', '网站缩放控制');
    controls.innerHTML = `
      <button id="zoomDecrease" type="button" aria-label="缩小网站" title="缩小网站">−</button>
      <output id="zoomValue" aria-live="polite">100%</output>
      <button id="zoomIncrease" type="button" aria-label="放大网站" title="放大网站">＋</button>
    `;
    document.body.appendChild(controls);

    let zoom = readZoom();
    controls.querySelector('#zoomDecrease')?.addEventListener('click', () => {
      zoom = clampZoom(zoom - STEP);
      applyZoom(zoom);
    });
    controls.querySelector('#zoomIncrease')?.addEventListener('click', () => {
      zoom = clampZoom(zoom + STEP);
      applyZoom(zoom);
    });

    applyZoom(zoom);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createZoomControls, { once: true });
  } else {
    createZoomControls();
  }
})();
