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

// ===== flight map =====
window._flightMap = null;
function initFlightMap() {
  if (!window.L) return;
  const el = document.getElementById('flightMap');
  if (!el) return;
  if (window._flightMap) {
    window._flightMap.invalidateSize();
    return;
  }

  const cities = {
    tfu: { name: '成都',   latlng: [30.31, 104.44], pos: 'left' },
    sin: { name: '新加坡', latlng: [1.36,  103.99], pos: 'top' },
    bwn: { name: '文莱',   latlng: [4.94,  114.93], pos: 'left' },
    bki: { name: '亚庇',   latlng: [5.94,  116.05], pos: 'top' },
    sdk: { name: '山打根', latlng: [5.90,  118.06], pos: 'right' },
  };

  const legs = [
    ['tfu','sin'], ['sin','bwn'], ['bwn','bki'], ['bki','sdk'],
    ['sdk','bki'], ['bki','bwn'], ['bwn','sin'], ['sin','tfu'],
  ];

  const map = L.map('flightMap', {
    center: [7, 112],
    zoom: 5,
    minZoom: 4,
    maxZoom: 8,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    attributionControl: true,
  });
  window._flightMap = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '© OpenStreetMap · © CARTO'
  }).addTo(map);

  // city markers
  Object.values(cities).forEach(c => {
    const icon = L.divIcon({
      className: 'flight-marker',
      html: `<span class="fm-dot"></span><span class="fm-name ${c.pos}">${c.name}</span>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
    L.marker(c.latlng, { icon, interactive: false }).addTo(map);
  });

  // bezier curve — dir: +1 always arc north of straight line, -1 always arc south
  function curve(a, b, dir) {
    const [y1, x1] = a, [y2, x2] = b;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    // perpendicular, force to point north (positive lat)
    let perpX = -dy, perpY = dx;
    if (perpY < 0) { perpX = -perpX; perpY = -perpY; }
    const len = Math.sqrt(perpX*perpX + perpY*perpY) || 1;
    perpX /= len; perpY /= len;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const offset = dist * 0.22 * dir;
    const cx = mx + perpX * offset;
    const cy = my + perpY * offset;
    const pts = [];
    for (let t = 0; t <= 1.001; t += 0.02) {
      const u = 1 - t;
      const px = u*u*x1 + 2*u*t*cx + t*t*x2;
      const py = u*u*y1 + 2*u*t*cy + t*t*y2;
      pts.push([py, px]);
    }
    return pts;
  }

  // forward legs arc north, return legs arc south
  legs.forEach(([from, to], i) => {
    const isReturn = i >= 4;
    L.polyline(curve(cities[from].latlng, cities[to].latlng, isReturn ? -1 : 1), {
      color: isReturn ? '#9b3f15' : '#c75a1f',
      weight: 1.8,
      opacity: isReturn ? 0.7 : 0.9,
      dashArray: '6 5',
      interactive: false,
    }).addTo(map);
  });

  // fit to the trip region — let 成都 line fade off-screen at the top
  const bounds = [cities.sin.latlng, cities.bwn.latlng, cities.bki.latlng, cities.sdk.latlng];
  map.fitBounds(bounds, { padding: [70, 70], maxZoom: 7 });
}

// hook map init to page switching
(function () {
  const stage = document.getElementById('stage');
  if (!stage) return;
  // observe class change on intro page
  const intro = document.querySelector('[data-page="intro"]');
  if (!intro) return;
  const obs = new MutationObserver(() => {
    if (intro.classList.contains('on')) {
      setTimeout(initFlightMap, 60);
    }
  });
  obs.observe(intro, { attributes: true, attributeFilter: ['class'] });
  if (intro.classList.contains('on')) setTimeout(initFlightMap, 60);
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
