// ===== countdown =====
(function () {
  const target = new Date('2026-07-23T00:00:00+08:00').getTime();
  const el = document.getElementById('cdNum');
  if (!el) return;
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = '0'; return; }
    el.textContent = Math.floor(diff / 86400000).toString();
  }
  tick();
  setInterval(tick, 60_000);
})();

// ===== page switcher =====
(function () {
  const pages = Array.from(document.querySelectorAll('.page'));
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const stage = document.getElementById('stage');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');

  function show(name, push = true) {
    const target = pages.find(p => p.dataset.page === name) || pages[0];
    pages.forEach(p => p.classList.toggle('on', p === target));
    links.forEach(a => a.classList.toggle('on', a.dataset.page === target.dataset.page));
    if (stage) stage.scrollTop = 0;
    if (push) {
      const hash = '#' + target.dataset.page;
      if (location.hash !== hash) history.pushState(null, '', hash);
    }
    // close mobile menu after navigation
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (toggle) toggle.classList.remove('open');
    }
  }

  // hook nav clicks
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const name = a.getAttribute('href').slice(1);
    if (!name) return;
    if (pages.some(p => p.dataset.page === name)) {
      e.preventDefault();
      show(name);
    }
  });

  // back/forward
  window.addEventListener('popstate', () => {
    const name = location.hash.slice(1) || 'cover';
    show(name, false);
  });

  // initial
  const initial = location.hash.slice(1) || 'cover';
  show(initial, false);

  // mobile menu
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      toggle.classList.toggle('open', open);
    });
  }
})();

// ===== graceful image fallback =====
// hide hero photo if the underlying image fails to load — gradient tint still shows
(function () {
  const heroes = document.querySelectorAll('.hero-photo');
  heroes.forEach(h => {
    const style = getComputedStyle(h);
    const bg = h.style.getPropertyValue('--ph');
    if (!bg) return;
    const url = bg.match(/url\(['"]?([^'")]+)['"]?\)/);
    if (!url) return;
    const img = new Image();
    img.onerror = () => {
      h.style.setProperty('--ph', 'none');
      h.style.backgroundColor = 'var(--bg-warm)';
    };
    img.src = url[1];
  });
})();
