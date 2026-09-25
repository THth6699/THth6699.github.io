/* Performance patch. This file is intentionally standalone and can be loaded after main.js. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;

  // Throttle scroll handlers added by the page without changing their behavior.
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

  // Prevent accidental duplicate service-worker registration from causing extra work.
  const registrations = navigator.serviceWorker?.getRegistrations;
  if (registrations) {
    registrations.call(navigator.serviceWorker).then(list => {
      const seen = new Set();
      list.forEach(reg => {
        const key = reg.scope;
        if (seen.has(key)) reg.unregister();
        else seen.add(key);
      });
    }).catch(() => {});
  }
})();
