const section = document.querySelector('#skills');
const grid = section?.querySelector('.skills-grid');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const SOURCES = {
  td: 'PRODUCTION \u00b7 TERADATA',
  rag: 'OSS \u00b7 RAG API',
  micro: 'OSS \u00b7 MICROCLOUDPY',
  site: 'THIS PORTFOLIO',
  core: 'CORE TOOLKIT',
};
const SKILLS = {
  python: { src: ['td', 'rag', 'micro'], text: 'Primary language across the production FastAPI services and both open-source builds.' },
  pandas: { src: ['core'], text: 'Tabular data work in Python, alongside NumPy.' },
  numpy: { src: ['core'], text: 'Numerical work in Python, alongside Pandas.' },
  sql: { src: ['td'], text: 'Database design, indexing, transactions and migrations on the Teradata backend.' },
  shell: { src: ['td'], text: 'Shell scripting for automation in the Teradata environment.' },
  javascript: { src: ['site'], text: 'Interfaces, plus the Three.js scenes and interactions on this portfolio.' },
  html: { src: ['site'], text: 'Hand-built layouts and styling, including every section of this portfolio.' },
  vue: { src: ['core'], text: 'Component-based interfaces with Vue.js.' },
  fastapi: { src: ['td', 'rag', 'micro'], text: 'Typed, async BaaS endpoints at Teradata, plus the RAG API and MicroCloudPy services.' },
  async: { src: ['td'], text: 'Async programming with bounded concurrency, pacing and latency-aware backoff.' },
  rest: { src: ['td'], text: 'Versioned, cursor-paginated, rate-limited APIs with timeouts and retries.' },
  integrations: { src: ['td'], text: 'Authenticated upstream integrations behind the BaaS endpoints.' },
  redis: { src: ['td'], text: 'Precomputed reads refreshed in the background, with locks against overlapping refreshes.' },
  validation: { src: ['td'], text: 'Typed request validation and response normalization on FastAPI endpoints.' },
  pagination: { src: ['td'], text: 'Cursor pagination on list endpoints.' },
  rbac: { src: ['td'], text: 'Role-based access control across the BaaS endpoints.' },
  oauth: { src: ['core'], text: 'OAuth2/JWT token flows with proper secret management.' },
  tenant: { src: ['core'], text: 'Keeping tenant data and access boundaries isolated.' },
  rag: { src: ['rag'], text: 'End-to-end retrieval, local inference and semantic validation gates.' },
  chromadb: { src: ['rag'], text: 'Vector store behind the RAG API, with embeddings rebuilt in CI.' },
  ollama: { src: ['rag'], text: 'Local LLM inference that generates the answers inside the RAG API.' },
  semantic: { src: ['rag'], text: 'Semantic validation gates run in GitHub Actions before delivery.' },
  mcp: { src: ['td'], text: 'Scoped, read-only MCP tools that let LLMs inspect Kubernetes safely.' },
  agentic: { src: ['td'], text: 'Agents that monitor health, analyze infrastructure logs and surface cloud optimization ideas.' },
  aws: { src: ['micro'], text: 'MicroCloudPy is delivered on AWS EKS.' },
  gcp: { src: ['micro'], text: 'MicroCloudPy is architected to carry over to GKE.' },
  docker: { src: ['rag', 'micro'], text: 'Containerized services for Kubernetes and cloud delivery.' },
  kubernetes: { src: ['td', 'rag', 'micro'], text: 'Read-only diagnostics at Teradata, Minikube for the RAG API, EKS for MicroCloudPy.' },
  helm: { src: ['micro'], text: 'Helm and kubectl delivery on AWS EKS.' },
  'github-actions': { src: ['rag'], text: 'Rebuilds embeddings and runs semantic validation before delivery.' },
  argocd: { src: ['td'], text: 'GitOps releases and blue-green deployments in production.' },
  gitops: { src: ['td'], text: 'Declarative releases driven through Argo CD.' },
};
const LINKS = {
  python: ['fastapi', 'pandas', 'numpy', 'async', 'rag', 'shell'],
  pandas: ['numpy', 'sql'],
  sql: ['pagination'],
  shell: ['github-actions'],
  javascript: ['html', 'vue'],
  html: ['vue'],
  fastapi: ['async', 'rest', 'redis', 'validation', 'rbac', 'rag', 'kubernetes'],
  async: ['redis'],
  rest: ['pagination', 'validation', 'integrations'],
  integrations: ['oauth'],
  rbac: ['oauth', 'tenant'],
  oauth: ['tenant'],
  rag: ['chromadb', 'ollama', 'semantic', 'github-actions'],
  chromadb: ['ollama'],
  semantic: ['github-actions', 'ollama'],
  mcp: ['agentic', 'kubernetes'],
  aws: ['kubernetes', 'helm', 'gcp'],
  docker: ['kubernetes', 'github-actions'],
  kubernetes: ['helm', 'argocd'],
  'github-actions': ['argocd'],
  argocd: ['gitops', 'kubernetes'],
  gitops: ['kubernetes'],
};

function initBadges() {
  const badges = new Map();
  grid.querySelectorAll('.skill-badge').forEach((element) => {
    badges.set(element.dataset.skill, { element, label: element.textContent.trim(), card: element.closest('.skill-card') });
  });
  const adjacent = new Map([...badges.keys()].map((id) => [id, new Set()]));
  Object.entries(LINKS).forEach(([from, list]) => list.forEach((to) => {
    if (adjacent.has(from) && adjacent.has(to)) { adjacent.get(from).add(to); adjacent.get(to).add(from); }
  }));
  const cards = [...grid.querySelectorAll('.skill-card')].map((element) => ({ element, status: element.querySelector('.skill-status') }));

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'skill-links');
  svg.setAttribute('aria-hidden', 'true');
  const tip = document.createElement('div');
  tip.className = 'skill-tip';
  tip.id = 'skill-tip';
  tip.setAttribute('role', 'tooltip');
  grid.append(svg, tip);

  const state = { hover: null, pinned: null, shown: null };
  const node = (tag, className, parent, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    parent?.append(element);
    return element;
  };

  function fillTip(id) {
    const info = SKILLS[id] || { src: ['core'], text: '' };
    const links = [...adjacent.get(id)].map((key) => badges.get(key).label);
    tip.replaceChildren();
    const head = node('div', 'skill-tip-head', tip);
    node('i', 'skill-led', head);
    node('b', '', head, badges.get(id).label);
    node('em', '', head, 'TELEMETRY');
    const sources = node('div', 'skill-tip-src', tip);
    info.src.forEach((key) => node('span', key === 'td' ? 'is-prod' : '', sources, SOURCES[key]));
    node('p', '', tip, info.text);
    const row = node('p', 'skill-tip-links', tip);
    row.append('LINKS ');
    node('b', '', row, String(links.length));
    if (links.length) row.append(` \u00b7 ${links.slice(0, 3).join(' \u00b7 ')}${links.length > 3 ? ` +${links.length - 3}` : ''}`);
  }
  function placeTip(id) {
    const g = grid.getBoundingClientRect();
    const b = badges.get(id).element.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const above = b.top - g.top - h - 12;
    tip.style.left = `${clamp(b.left - g.left + b.width / 2 - w / 2, 0, Math.max(0, g.width - w))}px`;
    tip.style.top = `${above < -40 ? b.bottom - g.top + 12 : above}px`;
  }

  const rectOf = (element, g) => {
    const r = element.getBoundingClientRect();
    return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height, cx: r.left - g.left + r.width / 2, cy: r.top - g.top + r.height / 2 };
  };
  const edgeToward = (rect, point) => {
    const dx = point.x - rect.cx, dy = point.y - rect.cy;
    const k = 1 / Math.max(Math.abs(dx) / (rect.w / 2), Math.abs(dy) / (rect.h / 2), 0.001);
    return { x: rect.cx + dx * k, y: rect.cy + dy * k };
  };
  function drawLinks(id) {
    svg.replaceChildren();
    if (!id) return;
    const g = grid.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`);
    const source = badges.get(id);
    const compact = window.matchMedia('(max-width: 760px)').matches;
    const a = rectOf(source.element, g);
    let index = 0;
    adjacent.get(id).forEach((key) => {
      const target = badges.get(key);
      if (compact && target.card !== source.card) return;
      const b = rectOf(target.element, g);
      const dx = b.cx - a.cx, dy = b.cy - a.cy, dist = Math.hypot(dx, dy) || 1;
      const bend = Math.min(60, dist * 0.18);
      const control = { x: (a.cx + b.cx) / 2 - (dy / dist) * bend, y: (a.cy + b.cy) / 2 + (dx / dist) * bend };
      const p0 = edgeToward(a, control), p1 = edgeToward(b, control);
      const d = `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      ['glow', 'wire'].forEach((className) => {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('class', className);
        path.setAttribute('d', d);
        svg.append(path);
      });
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('r', '2.6');
      if (reduced.matches) {
        dot.setAttribute('cx', p1.x.toFixed(1));
        dot.setAttribute('cy', p1.y.toFixed(1));
      } else {
        const motion = document.createElementNS(svgNS, 'animateMotion');
        motion.setAttribute('dur', '1.4s');
        motion.setAttribute('begin', `${(index * 0.17).toFixed(2)}s`);
        motion.setAttribute('repeatCount', 'indefinite');
        motion.setAttribute('path', d);
        dot.append(motion);
      }
      svg.append(dot);
      index += 1;
    });
  }

  function render() {
    const id = state.hover ?? state.pinned;
    const related = id ? adjacent.get(id) : null;
    grid.classList.toggle('has-focus', Boolean(id));
    badges.forEach(({ element }, key) => {
      element.classList.toggle('is-active', key === id);
      element.classList.toggle('is-related', Boolean(related?.has(key)));
      element.setAttribute('aria-pressed', String(key === state.pinned));
      if (key === id) element.setAttribute('aria-describedby', 'skill-tip'); else element.removeAttribute('aria-describedby');
    });
    cards.forEach(({ element, status }) => {
      const tracking = Boolean(id) && badges.get(id).card === element;
      const linked = !tracking && Boolean(related) && [...related].some((key) => badges.get(key).card === element);
      element.classList.toggle('is-tracking', tracking || linked);
      if (status) status.textContent = tracking ? '[TRACKING]' : linked ? '[LINKED]' : `[${status.dataset.status}]`;
    });
    if (id) {
      if (state.shown !== id) fillTip(id);
      tip.classList.add('is-open');
      placeTip(id);
    } else {
      tip.classList.remove('is-open');
    }
    state.shown = id;
    drawLinks(id);
    grid.dataset.skillActive = id || '';
  }

  badges.forEach(({ element }, id) => {
    element.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') { state.hover = id; render(); } });
    element.addEventListener('pointerleave', () => { if (state.hover === id) { state.hover = null; render(); } });
    element.addEventListener('focus', () => { state.hover = id; render(); });
    element.addEventListener('blur', () => { if (state.hover === id) { state.hover = null; render(); } });
    element.addEventListener('click', () => { state.pinned = state.pinned === id ? null : id; render(); });
  });
  document.addEventListener('pointerdown', (event) => {
    if (state.pinned && !event.target.closest('.skill-badge')) { state.pinned = null; render(); }
  });
  grid.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { state.pinned = null; state.hover = null; render(); }
  });
  let queued = false;
  new ResizeObserver(() => {
    if (queued || !(state.hover ?? state.pinned)) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; render(); });
  }).observe(grid);
}

function initDust() {
  const canvas = document.createElement('canvas');
  canvas.className = 'toolkit-dust';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sctx = sprite.getContext('2d');
  const glow = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.25, 'rgba(255,255,255,.45)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  sctx.fillStyle = glow;
  sctx.fillRect(0, 0, 32, 32);

  const TINTS = ['167,243,208', '52,211,153', '110,231,183', '253,236,200'];
  let width = 0, height = 0, dpr = 1, dust = [];
  let visible = false, last = 0, shift = 0;

  function build() {
    const count = clamp(Math.round((width * height) / 11000), 36, 130);
    dust = Array.from({ length: count }, () => {
      const z = 0.2 + Math.random() * 0.8;
      return {
        x: Math.random() * width, y: Math.random() * height, z,
        r: 0.5 + z * 1.5, alpha: 0.22 + z * 0.5,
        vx: (Math.random() - 0.5) * 7 * z, vy: -(1.5 + Math.random() * 5) * z,
        tint: TINTS[Math.random() < 0.12 ? 3 : Math.floor(Math.random() * 3)],
        phase: Math.random() * 6.28, rate: 0.6 + Math.random() * 1.6,
      };
    });
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    build();
    draw(performance.now() / 1000);
  }
  function draw(time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    dust.forEach((p) => {
      const y = (((p.y + shift * (0.35 - p.z * 0.45)) % height) + height) % height;
      const tw = 0.65 + 0.35 * Math.sin(time * p.rate + p.phase);
      ctx.globalAlpha = p.alpha * tw;
      if (p.z > 0.72) {
        const size = p.r * 9;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgb(${p.tint})`;
        ctx.drawImage(sprite, p.x - size / 2, y - size / 2, size, size);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = `rgb(${p.tint})`;
      ctx.beginPath();
      ctx.arc(p.x, y, p.r, 0, 6.2832);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible && !document.hidden) {
      const box = section.getBoundingClientRect();
      shift = window.innerHeight / 2 - (box.top + box.height / 2);
      section.style.setProperty('--tk-shift', (shift * 0.14).toFixed(1));
      dust.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -4) p.x = width + 4; else if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y += height + 8; else if (p.y > height + 4) p.y -= height + 8;
      });
      draw(now / 1000);
    }
    requestAnimationFrame(frame);
  }

  new ResizeObserver(resize).observe(section);
  resize();
  if (reduced.matches) return;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '200px' }).observe(section);
  requestAnimationFrame((now) => { last = now; frame(now); });
}

if (section && grid) {
  initDust();
  initBadges();
}
