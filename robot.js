const dock = document.querySelector('#orbit-dock');

const MOODS = ['happy', 'excited', 'scanning', 'thinking'];
const EYES = { idle: 'led', happy: 'happy', excited: 'star', scanning: 'scan', thinking: 'think' };
const ROLE_COPY = {
  ai: {
    first: "Right now at Teradata in Pune, Raj connects LLM reasoning with ELK observability pipelines, builds agentic diagnostics, runs scoped MCP servers for read-only Kubernetes checks, and ships through Argo CD blue-green deployments!",
    again: "Back at the present: Raj connects LLM reasoning with ELK observability pipelines, agentic diagnostics, scoped MCP servers for Kubernetes, and Argo CD blue-green deployments at Teradata in Pune.",
    tab: "Teradata tab! Raj is a full-time AI and backend engineer here: LLM-powered root-cause analysis on ELK, agentic diagnostics, scoped MCP tools for read-only Kubernetes checks, and Argo CD blue-green releases.",
  },
  backend: {
    first: "Before that, Raj built dependable asynchronous FastAPI services with RBAC, Redis-backed precomputed reads guarded by concurrency locks, rate-limited and retry-safe APIs, and OpenTelemetry tracing.",
    again: "Earlier on, Raj built async FastAPI services with RBAC, Redis-backed precomputed reads with concurrency locks, rate-limited reliable APIs, and OpenTelemetry tracing.",
  },
  intern: {
    first: "Before Teradata, Raj was a Software Engineer Intern at Aligned Automation: component-driven Vue.js and React.js frontends, Vuex and hooks for state, Axios calls into Flask and FastAPI, and Swagger/OpenAPI contracts plus Python data-quality automation.",
    again: "Rewinding to the Aligned Automation internship: Vue.js and React.js components, Vuex and hooks state, Axios-powered Flask and FastAPI integrations, and data-quality automation.",
    tab: "Aligned Automation tab! Raj started here as a Software Engineer Intern: Vue.js and React.js components, Vuex and React hooks for state, Axios calls into Flask and FastAPI, and Swagger/OpenAPI contracts. Hover a skill tag and I'll explain it!",
  },
};
const EXPLAIN = {
  'ai system advisor': "The AI system advisor links LLMs to ELK observability data so engineers get root-cause hints faster, which cuts resolution time.",
  'agentic diagnostics': "Agentic workflows watch system health, read infrastructure logs and surface cloud optimization ideas on their own, then hand the findings to engineers.",
  'bounded tool use': "MCP servers and custom APIs give the model read-only Kubernetes diagnostics, with scoped access controls so the AI can look but never touch.",
  'production delivery': "Releases flow through GitOps with Argo CD, and blue-green deployments let a new version go live and roll back without downtime.",
  'fastapi services': "Raj built and maintained async FastAPI REST endpoints for BaaS jobs, job details, execution history and scheduled runs, integrating with authenticated upstream APIs.",
  'access control': "FastAPI dependency injection hands each endpoint its services and runs the RBAC checks, with typed path and query parameters, input constraints and pagination.",
  'redis-backed reads': "To keep reads blazingly fast, a background worker refreshes site-job data in Redis so common API reads never wait on the upstream service!",
  'refresh reliability': "Bounded concurrency, request pacing, latency-aware backoff and a Redis lock keep refreshes from overlapping, backed by upstream timeouts, retries and normalized responses.",
  'database design': "Solid data design means normalization, indexing, transactions, isolation levels and safe schema migrations.",
  'api reliability': "API versioning, cursor pagination, request-level rate limiting, structured logging, metrics, distributed tracing and OpenTelemetry keep every request traceable.",
  'system design': "Beyond the endpoints: OAuth2/JWT, secret management, OWASP API risks, tenant isolation, load testing, profiling, cache invalidation and capacity planning all shape the design.",
  'scoped access': "Access controls and read-only tool boundaries keep diagnostic actions scoped, so the AI cannot make unintended changes.",
  'aligned:components': "Components are small reusable UI building blocks: Vue Single-File Components and React function components, wired together with props, custom events, slots and composition patterns.",
  'aligned:state': "Centralized state means every view reads one source of truth: Vuex stores with actions, mutations and getters, and React hooks like useState, useEffect, useContext and useReducer.",
  'aligned:render': "Vue computed properties, watchers and lifecycle methods, plus React's useMemo and useCallback, stop components from re-rendering when nothing they show has changed.",
  'aligned:axios': "Axios interceptors and custom fetch hooks connect the UI to Flask and FastAPI endpoints, while loading states and error boundaries keep the screen honest.",
  'aligned:forms': "Vue v-model and React controlled inputs keep form fields and state in sync for live validation, and client-side routing with protected views gates what users can open.",
  'aligned:contracts': "Swagger/OpenAPI documents the request and response models, and Python checks plus SQL demand-profiling stored procedures keep the data clean.",
  'aligned:vue': "Vue.js: Single-File Components, computed properties, watchers, lifecycle hooks and v-model two-way binding.",
  'aligned:react': "React.js: functional components with hooks, memoization and controlled inputs.",
  'aligned:vuex': "Vuex is Vue's centralized store: getters read state, mutations change it synchronously and actions handle async work, so data flows one predictable way.",
  'aligned:hooks': "React hooks manage state and side effects in function components: useState and useEffect for local logic, useContext for shared data, useReducer for complex updates.",
  'aligned:vdom': "The virtual DOM is an in-memory copy of the UI. The framework diffs it against the last version and patches only what changed, which keeps rendering fast.",
  'aligned:axios-tag': "Axios is the HTTP client: interceptors attach headers and handle errors in one place, and each request drives loading and error states.",
  'aligned:fastapi': "FastAPI served typed, async REST endpoints with automatic OpenAPI docs that the frontends consumed.",
  'aligned:flask': "Flask provided lightweight Python REST endpoints for the frontends to call.",
  'aligned:openapi': "Swagger/OpenAPI describes every request and response model, so frontend and backend share one contract.",
  'aligned:python': "Python powered the backend APIs and the automated data-quality checks.",
  'aligned:sql': "SQL stored procedures handled demand profiling close to the data.",
  llms: "LLMs reason over observability signals here: they read ELK data and help turn noisy logs into a root-cause hypothesis.",
  mcp: "Model Context Protocol servers are the safe doorway: they expose a small set of read-only Kubernetes tools to the model.",
  elk: "Elasticsearch, Logstash and Kibana supply the logs and metrics that the AI system advisor reasons over.",
  kubernetes: "Kubernetes is the system being diagnosed, through scoped, read-only access that never changes cluster state.",
  'argo cd': "Argo CD keeps deployments in sync with Git, which enables GitOps releases and blue-green rollouts.",
  fastapi: "FastAPI powers the async BaaS services with typed validation, dependency injection and authenticated upstream calls.",
  redis: "Redis holds precomputed job data so reads stay fast, with locks preventing overlapping refreshes.",
  sql: "SQL work covers schema design, indexing, transactions and migrations behind the services.",
  rbac: "Role-based access control decides who can see or run what, enforced at the API layer.",
  opentelemetry: "OpenTelemetry tracing follows a request across services so slow or failing steps are easy to spot.",
};
const QUIPS = [
  "Beep boop! Hover a bullet or a skill chip and I'll scan it for you.",
  "Hee hee, that tickles! Try one of the quick questions below.",
  "Systems nominal and sparkling. Pick a question below and I'll answer!",
  "Thrusters warm, antenna happy. What would you like to know?",
];
const FALLBACK_KB = {
  meta: { threshold: 0.18, fallback: { mood: 'thinking', answer: "My knowledge file isn't reachable right now, so I can't look that up. Please refresh the page or email Rajhari2305@gmail.com." } },
  intents: [],
};
const STOPWORDS = new Set('a an the is are was were be been am to of in on at for with and or but about what whats who how does do did his her he she him me tell can could would please give any some it its this that these those s'.split(' '));

const stem = (token) => {
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
};
const tokenize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((token) => token.length > 1 && !STOPWORDS.has(token)).map(stem);

function buildIndex(knowledge) {
  const docs = knowledge.intents.map((intent) => {
    const counts = new Map();
    const add = (tokens, weight) => tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + weight));
    intent.questions.forEach((question) => add(tokenize(question), 2));
    intent.keywords.forEach((keyword) => add(tokenize(keyword), 3));
    add(tokenize(intent.title), 2);
    add(tokenize(intent.answer), 1);
    return {
      intent,
      counts,
      keywordTokens: new Set(intent.keywords.flatMap(tokenize)),
      phrases: intent.keywords.map((keyword) => tokenize(keyword).join(' ')).filter((phrase) => phrase.includes(' ')),
      questionSets: intent.questions.map((question) => new Set(tokenize(question))),
    };
  });
  const frequency = new Map();
  docs.forEach(({ counts }) => counts.forEach((_, token) => frequency.set(token, (frequency.get(token) || 0) + 1)));
  const idf = (token) => Math.log((docs.length + 1) / ((frequency.get(token) || 0) + 1)) + 1;
  docs.forEach((doc) => {
    doc.vector = new Map();
    let norm = 0;
    doc.counts.forEach((count, token) => {
      const weight = (1 + Math.log(count)) * idf(token);
      doc.vector.set(token, weight);
      norm += weight * weight;
    });
    doc.norm = Math.sqrt(norm) || 1;
  });
  return { docs, idf, knowledge, threshold: knowledge.meta.threshold ?? 0.18 };
}

function matchLocal(question, index) {
  const { fallback, suggestions = [] } = index.knowledge.meta;
  const miss = { answer: fallback.answer, mood: fallback.mood, intent: null, confidence: 0, suggestions };
  const tokens = tokenize(question);
  if (!tokens.length) return miss;
  const counts = new Map();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  const vector = new Map();
  let norm = 0;
  counts.forEach((count, token) => {
    const weight = (1 + Math.log(count)) * index.idf(token);
    vector.set(token, weight);
    norm += weight * weight;
  });
  norm = Math.sqrt(norm) || 1;
  const padded = ` ${tokens.join(' ')} `;
  const querySet = new Set(tokens);
  let best = null;
  index.docs.forEach((doc) => {
    let dot = 0;
    vector.forEach((weight, token) => { dot += weight * (doc.vector.get(token) || 0); });
    const cosine = dot / (norm * doc.norm);
    let hits = 0;
    querySet.forEach((token) => { if (doc.keywordTokens.has(token)) hits += 1; });
    const phraseHits = doc.phrases.filter((phrase) => padded.includes(` ${phrase} `)).length;
    const route = Math.min(0.6, 0.2 * hits + 0.35 * phraseHits);
    let overlap = 0;
    doc.questionSets.forEach((set) => {
      let shared = 0;
      querySet.forEach((token) => { if (set.has(token)) shared += 1; });
      const union = querySet.size + set.size - shared;
      overlap = Math.max(overlap, union ? shared / union : 0);
    });
    const score = 0.5 * cosine + route + (overlap >= 0.75 ? 0.6 : 0);
    if (!best || score > best.score) best = { doc, score };
  });
  if (!best || best.score < index.threshold) return miss;
  const { intent } = best.doc;
  return { answer: intent.answer, mood: intent.mood, intent: intent.id, confidence: Math.min(1, best.score), suggestions: [] };
}

function linkify(text) {
  const fragment = document.createDocumentFragment();
  const pattern = /(https:\/\/[^\s)]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const value = match[0].replace(/[.,;]+$/, '');
    if (match.index > last) fragment.append(text.slice(last, match.index));
    const link = document.createElement('a');
    link.textContent = value;
    link.href = value.includes('@') ? `mailto:${value}` : value;
    link.rel = 'noopener noreferrer';
    if (!value.includes('@')) link.target = '_blank';
    fragment.append(link);
    last = match.index + value.length;
  }
  fragment.append(text.slice(last));
  return fragment;
}

if (dock) initRobot();

function initRobot() {
  const bot = dock.querySelector('.orbit-bot');
  const stage = dock.querySelector('.orbit-stage');
  const beam = dock.querySelector('.orbit-beam');
  const headEl = dock.querySelector('.ob-head-g');
  const eyeEl = dock.querySelector('.ob-eye-r');
  const textEl = dock.querySelector('.orbit-text');
  const liveEl = dock.querySelector('#orbit-live');
  const brainEl = dock.querySelector('#orbit-brain');
  const toggle = dock.querySelector('.orbit-toggle');
  const markers = [...dock.querySelectorAll('.rail-markers li')];
  const rows = [...document.querySelectorAll('.timeline .experience-row')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const apiUrl = dock.dataset.api || '/api/ask-robot';
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

  const state = {
    mood: 'idle', base: { text: textEl.textContent.trim() }, scanEl: null, aimEl: null, scanTimer: 0, busy: false, role: null,
    spoken: new Set(), greeted: false, inView: false, visible: false, pointer: null, lastMove: 0, typeToken: 0, askToken: 0,
    moodTimer: 0, tempTimer: 0, api: 'unknown', index: null, blinkAt: 0, wander: { x: 0, y: 0, until: 0 }, eye: { x: 0, y: 0 }, raf: 0,
  };

  dock.classList.add('is-armed');

  function setMood(mood) {
    state.mood = mood;
    bot.dataset.eyes = EYES[mood] || 'led';
  }
  function settle(ms) {
    clearTimeout(state.moodTimer);
    state.moodTimer = setTimeout(() => { if (!state.scanEl && !state.busy) setMood('idle'); }, ms);
  }
  function flashAntenna() {
    bot.classList.remove('is-flash');
    void bot.getBoundingClientRect();
    bot.classList.add('is-flash');
    setTimeout(() => bot.classList.remove('is-flash'), 900);
  }
  function showText(text) {
    state.typeToken += 1;
    textEl.classList.remove('is-typing');
    bot.classList.remove('is-speaking');
    textEl.replaceChildren(linkify(text));
  }
  function showThinking() {
    state.typeToken += 1;
    textEl.classList.remove('is-typing');
    const dots = document.createElement('span');
    dots.className = 'orbit-dots';
    dots.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
    textEl.replaceChildren(dots);
  }
  function typeText(text, { speed = 1, announce = true, onDone } = {}) {
    const token = ++state.typeToken;
    const finish = () => {
      textEl.classList.remove('is-typing');
      bot.classList.remove('is-speaking');
      textEl.replaceChildren(linkify(text));
      if (announce) liveEl.textContent = text;
      onDone?.();
    };
    if (reduced.matches) { finish(); return; }
    textEl.textContent = '';
    textEl.classList.add('is-typing');
    bot.classList.add('is-speaking');
    const perFrame = Math.max(1, Math.ceil(text.length / (150 / speed)));
    let shown = 0;
    const step = () => {
      if (token !== state.typeToken) return;
      shown = Math.min(text.length, shown + perFrame);
      textEl.textContent = text.slice(0, shown);
      textEl.scrollTop = textEl.scrollHeight;
      if (shown < text.length) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
  }
  function say(text, mood, { remember = true, settleMs = 1800 } = {}) {
    clearTimeout(state.tempTimer);
    if (remember) state.base = { text };
    setMood(mood);
    typeText(text, { onDone: () => settle(settleMs) });
  }

  function narrate(role, fromTab = false) {
    const copy = ROLE_COPY[role];
    if (!copy) return;
    const repeat = state.spoken.has(role);
    state.spoken.add(role);
    let text = fromTab && copy.tab ? copy.tab : repeat ? copy.again : copy.first;
    if (!state.greeted) { text = `Hi! I'm ORBIT-Bot. ${text}`; state.greeted = true; wave(); }
    say(text, 'happy');
  }
  function wave() {
    if (reduced.matches) return;
    bot.classList.remove('is-waving');
    void bot.getBoundingClientRect();
    bot.classList.add('is-waving');
    setTimeout(() => bot.classList.remove('is-waving'), 2100);
  }
  function setRole(role, fromTab = false) {
    if (state.role === role) return;
    state.role = role;
    markers.forEach((marker) => marker.classList.toggle('is-active', marker.dataset.role === role));
    if (!state.busy && !state.scanEl) narrate(role, fromTab);
  }
  const chipBox = dock.querySelector('.orbit-chips');
  const CHIP_SETS = {
    teradata: [...chipBox.querySelectorAll('.orbit-chip')].map((chip) => chip.textContent),
    aligned: ['How did Raj use Vue.js & React.js?', 'How did he manage state with Vuex & Hooks?', 'Tell me about his FastAPI, Flask & data automation'],
  };
  chipBox.dataset.set = 'teradata';
  function setChips(tab) {
    const labels = CHIP_SETS[tab];
    if (!labels || chipBox.dataset.set === tab) return;
    chipBox.dataset.set = tab;
    chipBox.classList.add('is-swapped');
    chipBox.replaceChildren(...labels.map((label, index) => {
      const chip = document.createElement('button');
      chip.className = 'orbit-chip';
      chip.type = 'button';
      chip.textContent = label;
      chip.style.setProperty('--n', String(index));
      return chip;
    }));
  }
  window.addEventListener('experience:tab', (event) => {
    const { tab, role } = event.detail;
    stopScan(false);
    setChips(tab);
    if (role) setRole(role, true);
  });
  function currentRole() {
    const probe = window.innerHeight * 0.46;
    let role = state.role || rows[0]?.dataset.role || 'ai';
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) role = row.dataset.role;
    });
    return role;
  }
  let syncQueued = false;
  function syncRole() {
    if (syncQueued || !state.inView || !dock.classList.contains('is-in')) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      const role = currentRole();
      if (role !== state.role) setRole(role);
    });
  }
  window.addEventListener('scroll', () => {
    syncRole();
    if (state.scanEl && reduced.matches) updateBeam();
  }, { passive: true });

  function updateBeam() {
    const target = (state.aimEl || state.scanEl)?.getBoundingClientRect();
    if (!target) return;
    const origin = stage.getBoundingClientRect();
    const eye = eyeEl.getBoundingClientRect();
    const sx = eye.left + eye.width / 2 - origin.left, sy = eye.top + eye.height / 2 - origin.top;
    const tx = target.left - 8 - origin.left, ty = target.top + Math.min(target.height / 2, 14) - origin.top;
    beam.style.left = `${sx.toFixed(1)}px`;
    beam.style.top = `${sy.toFixed(1)}px`;
    beam.style.width = `${Math.max(24, Math.hypot(tx - sx, ty - sy)).toFixed(1)}px`;
    beam.style.transform = `rotate(${Math.atan2(ty - sy, tx - sx).toFixed(4)}rad)`;
  }
  function syncBullets(element, on) {
    const picks = (element.dataset.bullets || '').split(' ').filter(Boolean);
    const items = element.closest('.experience-row')?.querySelectorAll('li') || [];
    picks.forEach((index) => items[Number(index)]?.classList.toggle('is-synced', on));
  }
  function startScan(element, aim, key) {
    if (state.busy || !EXPLAIN[key]) return;
    stopScan(false);
    clearTimeout(state.tempTimer);
    clearTimeout(state.moodTimer);
    state.scanEl = element;
    state.aimEl = aim;
    element.classList.add('is-scanned');
    syncBullets(element, true);
    setMood('scanning');
    beam.classList.add('is-on');
    updateBeam();
    typeText(EXPLAIN[key], { speed: 2, announce: false });
  }
  function stopScan(restore = true) {
    clearTimeout(state.scanTimer);
    if (!state.scanEl) return;
    state.scanEl.classList.remove('is-scanned');
    syncBullets(state.scanEl, false);
    state.scanEl = null;
    state.aimEl = null;
    beam.classList.remove('is-on');
    if (!restore) return;
    setMood('idle');
    showText(state.base.text);
  }
  rows.forEach((row) => {
    row.querySelectorAll('li, .project-tags span').forEach((element) => {
      const lead = element.tagName === 'LI' ? element.querySelector('strong') : null;
      const key = element.dataset.explain || (lead ? lead.textContent : element.textContent).trim().toLowerCase().replace(/\.$/, '');
      if (!EXPLAIN[key]) return;
      const aim = lead || element;
      element.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') startScan(element, aim, key); });
      element.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse' && state.scanEl === element) stopScan(); });
      element.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') return;
        startScan(element, aim, key);
        clearTimeout(state.scanTimer);
        state.scanTimer = setTimeout(() => stopScan(), 6000);
      });
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' && state.scanEl && !state.scanEl.contains(event.target)) stopScan();
  });

  async function loadIndex() {
    if (state.index) return state.index;
    state.index = fetch('assets/robot-knowledge.json')
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
      .catch(() => FALLBACK_KB)
      .then(buildIndex);
    return state.index;
  }
  async function askApi(question) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }), signal: controller.signal });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      if (typeof data.answer !== 'string' || !MOODS.includes(data.mood)) throw new Error('bad payload');
      return data;
    } finally { clearTimeout(timer); }
  }
  async function answer(question) {
    if (state.api !== 'down') {
      try {
        const data = await askApi(question);
        state.api = 'up';
        return { ...data, source: 'api' };
      } catch {
        state.api = 'down';
        setTimeout(() => { state.api = 'unknown'; }, 60000);
      }
    }
    return { ...matchLocal(question, await loadIndex()), source: 'local' };
  }
  async function ask(question) {
    const text = question.trim().slice(0, 200);
    if (!text) return;
    stopScan(false);
    clearTimeout(state.moodTimer);
    clearTimeout(state.tempTimer);
    const run = ++state.askToken;
    state.busy = true;
    setMood('thinking');
    flashAntenna();
    showThinking();
    const started = performance.now();
    const result = await answer(text);
    if (run !== state.askToken) return;
    if (!reduced.matches) await sleep(Math.max(0, 700 - (performance.now() - started)));
    if (run !== state.askToken) return;
    brainEl.textContent = result.source === 'api' ? 'FASTAPI BRAIN' : 'LOCAL BRAIN';
    dock.dataset.source = result.source;
    dock.dataset.intent = result.intent || '';
    const mood = MOODS.includes(result.mood) ? result.mood : 'happy';
    setMood(mood);
    flashAntenna();
    state.base = { text: result.answer };
    typeText(result.answer, { onDone: () => { state.busy = false; settle(2200); } });
  }

  chipBox.addEventListener('click', (event) => {
    const chip = event.target.closest('.orbit-chip');
    if (chip) ask(chip.textContent);
  });
  toggle.addEventListener('click', () => {
    const open = dock.classList.toggle('is-drawer-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  stage.addEventListener('click', () => {
    if (state.busy || state.scanEl) return;
    clearTimeout(state.moodTimer);
    clearTimeout(state.tempTimer);
    setMood('happy');
    bot.classList.remove('is-hop');
    void bot.getBoundingClientRect();
    bot.classList.add('is-hop');
    setTimeout(() => bot.classList.remove('is-hop'), 700);
    typeText(QUIPS[Math.floor(Math.random() * QUIPS.length)], { announce: false });
    state.tempTimer = setTimeout(() => { if (!state.busy && !state.scanEl) { setMood('idle'); showText(state.base.text); } }, 4200);
  });

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    state.pointer = { x: event.clientX, y: event.clientY };
    state.lastMove = performance.now();
  }, { passive: true });

  function frame(now) {
    state.raf = 0;
    if (!state.visible || document.hidden) return;
    const head = headEl.getBoundingClientRect();
    const cx = head.left + head.width / 2, cy = head.top + head.height * 0.5;
    let ax = cx, ay = cy, reach = 280, limit = 6.5;
    if (state.mood === 'thinking') { ax = cx - 40; ay = cy - 90; reach = 90; }
    else if (state.scanEl) {
      const rect = (state.aimEl || state.scanEl).getBoundingClientRect();
      ax = rect.left;
      ay = rect.top + Math.min(rect.height / 2, 14);
      reach = 160;
    } else if (state.pointer && now - state.lastMove < 4500) { ax = state.pointer.x; ay = state.pointer.y; }
    else {
      if (now > state.wander.until) {
        const calm = Math.random() < 0.4;
        state.wander = { x: calm ? 0 : (Math.random() - 0.5) * 11, y: calm ? 0 : (Math.random() - 0.5) * 6, until: now + 1800 + Math.random() * 2200 };
      }
      ax = cx + state.wander.x * 20;
      ay = cy + state.wander.y * 20;
      reach = 80;
    }
    const dx = ax - cx, dy = ay - cy, dist = Math.hypot(dx, dy) || 1;
    const strength = Math.min(1, dist / reach);
    const tx = (dx / dist) * limit * strength, ty = (dy / dist) * (limit * 0.6) * strength;
    state.eye.x += (tx - state.eye.x) * 0.16;
    state.eye.y += (ty - state.eye.y) * 0.16;
    bot.style.setProperty('--ex', state.eye.x.toFixed(2));
    bot.style.setProperty('--ey', state.eye.y.toFixed(2));
    bot.style.setProperty('--hx', (state.eye.x * 0.55).toFixed(2));
    bot.style.setProperty('--hr', (state.eye.x * 0.45).toFixed(2));
    if (state.scanEl) updateBeam();
    if (now > state.blinkAt) {
      state.blinkAt = now + 2800 + Math.random() * 3400;
      bot.classList.add('is-blink');
      setTimeout(() => bot.classList.remove('is-blink'), 150);
    }
    state.raf = requestAnimationFrame(frame);
  }
  function wake() { if (!state.raf && !reduced.matches) state.raf = requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', wake);

  new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; if (state.visible) wake(); }, { rootMargin: '120px' }).observe(dock);
  new IntersectionObserver(([entry]) => {
    state.inView = entry.isIntersecting;
    if (state.inView && dock.classList.contains('is-in')) syncRole();
  }).observe(dock.closest('.timeline') || dock);
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    dock.classList.add('is-in');
    setTimeout(() => setRole(currentRole()), 650);
  }, { threshold: 0.3 }).observe(dock);

  setMood('idle');
}
