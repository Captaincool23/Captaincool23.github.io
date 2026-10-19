const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 1440, H = 1080;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pretty = (text) => text.replaceAll(' / ', ' \u00b7 ').replaceAll(' > ', ' \u2192 ');
const pts = (list) => list.map(([x, y]) => `${x},${y}`).join(' ');
// Maps (s, t) on the artwork's isometric slab to image pixels: s runs down-right, t runs up-right.
const iso = (s, t) => [Math.round(305 + 463 * s + 349 * t), Math.round(565 + 230 * s - 175 * t)];

function svgNode(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (parent) parent.append(node);
  return node;
}
function htmlNode(tag, className, parent, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (parent) parent.append(node);
  return node;
}

const SLAB = [[300, 566], [768, 802], [1122, 620], [654, 386]];
const TOWER = [[588, 300], [662, 272], [738, 306], [738, 462], [664, 484], [588, 448]];
const LEFT_TOWER = [[395, 402], [468, 370], [542, 404], [542, 562], [470, 592], [395, 555]];
const CHIP = [[610, 507], [712, 460], [812, 508], [812, 582], [712, 622], [610, 584]];
const DOCS = [[354, 552], [480, 484], [562, 520], [562, 548], [440, 614], [354, 570]];
const CYL_B = [[921, 487], [973, 465], [1024, 487], [1024, 606], [973, 630], [921, 606]];
const CYL_A = [[736, 592], [787, 570], [838, 592], [838, 712], [787, 734], [736, 712]];
const API_TOWER = [[596, 290], [672, 252], [742, 288], [742, 462], [668, 500], [596, 464]];
const FACE_CHIP = [[590, 552], [695, 500], [830, 568], [830, 598], [727, 655], [590, 584]];
const WEB_PANEL = [[392, 556], [546, 634], [562, 626], [562, 531], [408, 454], [392, 462]];
const STORE_B = [[764, 597], [820, 570], [876, 597], [876, 684], [820, 712], [764, 684]];

const BLUEPRINTS = {
  rag: {
    slug: 'rag/ask',
    route: [iso(0.22, 0.17), iso(0.13, 0.17), iso(0.13, 0.9), iso(0.17, 0.9), iso(0.81, 0.9), iso(0.81, 0.84), iso(0.81, 0.4), iso(0.5, 0.4)],
    chain: { docs: 0, fastapi: 3, chroma: 5, ollama: 7 },
    nodes: [
      { id: 'docs', name: 'Source Documents', at: [470, 505], shapes: [DOCS], role: 'Embedding pipeline', status: 'INDEXED', rows: [['Stage', 'Ingest + embed'], ['Rebuilt by', 'GitHub Actions'], ['Checked by', 'Semantic gates']] },
      { id: 'fastapi', name: 'FastAPI', at: [662, 298], shapes: [TOWER], role: 'Async API layer', status: 'ONLINE', rows: [['Role', 'Pipeline orchestrator'], ['Style', 'Async, typed endpoints'], ['Runs on', 'Kubernetes']] },
      { id: 'chroma', name: 'ChromaDB', at: [973, 484], shapes: [CYL_B, CYL_A], role: 'Vector retrieval', status: 'ONLINE', rows: [['Input', 'Query embedding'], ['Returns', 'Top-k context chunks'], ['Index', 'Rebuilt in CI']] },
      { id: 'ollama', name: 'Ollama', at: [712, 492], shapes: [CHIP], role: 'Local reasoning', status: 'ONLINE', rows: [['Input', 'Retrieved context'], ['Output', 'Streamed answer'], ['Runs', 'Local inference']] },
    ],
    stages: [
      { svc: 'FastAPI', op: 'POST /ask', ms: 14, badge: '200 OK', tone: 'ok', meta: 'schema valid / query embedded / 384-d', nodes: ['fastapi'], from: 'docs', to: 'fastapi' },
      { svc: 'ChromaDB', op: 'similarity_search k=4', ms: 38, badge: '4 HITS', tone: 'ok', meta: '12,480 vectors / top distance 0.21 / cosine', nodes: ['chroma'], from: 'fastapi', to: 'chroma' },
      { svc: 'Source Documents', op: 'chunk.fetch', ms: 9, badge: 'CITED', tone: 'info', meta: '4 chunks / 2 sources / 1,842 context tokens', nodes: ['docs'], from: 'fastapi', to: 'docs' },
      { svc: 'Ollama', op: 'generate (stream)', ms: 1284, badge: 'STREAMED', tone: 'ok', meta: '212 tokens / 38 tok/s / semantic gate 0.91', nodes: ['ollama'], from: 'chroma', to: 'ollama' },
    ],
    done: 'answer returned with 2 citations',
  },
  micro: {
    slug: 'micro/event-flow',
    route: [iso(0.25, 0.185), iso(0.487, 0.197), iso(0.487, 0.4), iso(0.81, 0.4), iso(0.81, 0.84)],
    chain: { auth: 0, rabbit: 2, mongo: 3, pg: 4 },
    nodes: [
      { id: 'auth', name: 'Auth / Converter', at: [468, 392], shapes: [LEFT_TOWER, TOWER], role: 'Independent services', status: 'ONLINE', rows: [['Runtime', 'Python + FastAPI'], ['Pattern', 'Container services'], ['Talks via', 'RabbitMQ']] },
      { id: 'rabbit', name: 'RabbitMQ', at: [712, 492], shapes: [CHIP], role: 'Message broker', status: 'ONLINE', rows: [['Pattern', 'Message-driven'], ['Decouples', 'Auth from converter'], ['Delivery', 'Queued jobs']] },
      { id: 'mongo', name: 'MongoDB', at: [787, 588], shapes: [CYL_A], role: 'Document persistence', status: 'ONLINE', rows: [['Holds', 'Converted files'], ['Written by', 'Converter service'], ['Pairs with', 'PostgreSQL']] },
      { id: 'pg', name: 'PostgreSQL', at: [973, 484], shapes: [CYL_B], role: 'Relational persistence', status: 'ONLINE', rows: [['Backs', 'Auth service'], ['Pairs with', 'MongoDB'], ['Delivered by', 'Helm on AWS EKS']] },
    ],
    stages: [
      { svc: 'Auth / Converter', op: 'POST /upload', ms: 18, badge: '202 ACCEPTED', tone: 'ok', meta: 'token verified / mp4 24.1 MB / job a41f queued', nodes: ['auth'], from: 'auth', to: 'rabbit' },
      { svc: 'RabbitMQ', op: 'publish > video', ms: 4, badge: 'ACK', tone: 'ok', meta: 'queue depth 1 > 3 / 2 consumers / 0 unacked', nodes: ['rabbit'], from: 'rabbit', to: 'mongo' },
      { svc: 'MongoDB + PostgreSQL', short: 'Mongo + PG', op: 'persist job', ms: 41, badge: 'COMMIT', tone: 'info', meta: 'GridFS 3.2 MB mp3 / job row updated / 0 retries', nodes: ['mongo', 'pg'], from: 'mongo', to: 'pg' },
      { svc: 'AWS EKS', op: 'pod/converter rollout', ms: 86, badge: '3/3 READY', tone: 'ok', meta: 'HPA 2 > 3 pods / cpu 71% / helm rev 12', nodes: ['platform'], label: 'AWS EKS cluster', from: 'pg', to: 'auth' },
    ],
    done: 'event settled, consumers acked',
  },
  finder: {
    slug: 'finder/match',
    custom: true,
    stageLen: 1.9,
    countLen: 1.5,
    route: [iso(0.22, 0.2), iso(0.13, 0.2), iso(0.13, 0.9), iso(0.17, 0.9), iso(0.5, 0.9), iso(0.5, 0.5), iso(0.81, 0.5), iso(0.81, 0.84)],
    chain: { client: 0, api: 3, vision: 5, store: 7 },
    nodes: [
      { id: 'client', name: 'Web client', at: [190, 852], shapes: [WEB_PANEL], role: 'HTMX + Jinja + Google OAuth', status: 'ONLINE', rows: [['Frontend', 'HTMX, Jinja templates'], ['Sign-in', 'Google OAuth'], ['Input', 'Uploaded photo']] },
      { id: 'api', name: 'FastAPI', at: [424, 332], shapes: [API_TOWER], role: 'Real-time SSE service', status: 'ONLINE', rows: [['Streaming', 'Server-sent events'], ['Sessions', 'Multi-user devices'], ['Style', 'Cloud microservice']] },
      { id: 'vision', name: 'OpenCV + TensorFlow', also: ['detect', 'embed'], at: [1262, 852], shapes: [FACE_CHIP], role: 'Face matching', status: 'ONLINE', rows: [['Detects', 'Faces in uploads'], ['Extracts', 'Facial features'], ['Compares', 'Similarity matching']] },
      { id: 'store', name: 'PostgreSQL / Supabase', at: [1262, 392], shapes: [CYL_B, STORE_B], role: 'Image storage', status: 'ONLINE', rows: [['Holds', 'Uploaded images'], ['Stack', 'PostgreSQL, Supabase'], ['Used for', 'Candidate lookup']] },
    ],
    stages: [
      { svc: 'HTMX + OAuth', short: 'Upload', op: 'POST /upload', ms: 22, badge: 'AUTH OK', tone: 'ok', meta: 'Authenticated image upload received', nodes: ['client'], from: 'client', to: 'api' },
      { svc: 'OpenCV + C++', short: 'Detect', op: 'detect + landmarks', ms: 41, badge: '68 POINTS', tone: 'ok', meta: 'Face bounding box locked / 68 facial landmarks extracted', nodes: ['vision', 'detect'], from: 'api', to: 'vision' },
      { svc: 'TensorFlow + face_recognition', short: 'Match', op: '128-D embedding match', ms: 184, badge: '98.4%', tone: 'ok', meta: '128-D embedding matched against PostgreSQL/Supabase / 98.4% confidence', nodes: ['embed', 'store'], from: 'vision', to: 'store' },
      { svc: 'FastAPI SSE', short: 'SSE', op: 'event: match', ms: 6, badge: 'STREAMED', tone: 'info', meta: 'Real-time match notification streamed to active user sessions', nodes: ['api'], from: 'store', to: 'api' },
    ],
    done: 'match streamed to every device session',
  },
};

const LEAD = 0.45, STAGE = 1.1, COUNT = 0.85;
const cards = [];

function initBlueprint(article) {
  const key = article.dataset.blueprint;
  const cfg = BLUEPRINTS[key];
  const visual = article.querySelector('.blueprint');
  const card = visual?.querySelector('.bp-card');
  const plate = visual?.querySelector('.bp-plate');
  const art = visual?.querySelector('.bp-art');
  const img = art?.querySelector('img');
  if (!cfg || !card || !plate || !art || (!img && !cfg.custom)) return;
  article.classList.add('bp-ready');

  const tags = [...article.querySelectorAll('.project-tags button')].map((element) => ({ element, nodes: element.dataset.nodes.split(' '), label: element.dataset.label || '' }));
  [...article.querySelectorAll('.work-points li'), ...tags.map((tag) => tag.element), article.querySelector('.work-actions')].filter(Boolean).forEach((element, index) => {
    element.classList.add('bp-rise');
    element.style.setProperty('--i', String(index));
  });

  const overlayHost = cfg.custom ? document.createElement('div') : art;
  const svg = svgNode('svg', { class: 'bp-layer', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true', focusable: 'false' }, overlayHost);
  const defs = svgNode('defs', {}, svg);
  const gradient = svgNode('radialGradient', { id: `bp-glow-${key}` }, defs);
  [['0', 1], ['0.35', 0.45], ['1', 0]].forEach(([offset, opacity]) => svgNode('stop', { offset, class: 'bp-stop', 'stop-opacity': opacity }, gradient));

  const platform = svgNode('g', { class: 'bp-spotg bp-plat' }, svg);
  svgNode('polygon', { class: 'bp-shape', points: pts(SLAB) }, platform);
  const platformLabel = svgNode('text', { class: 'bp-plat-label', x: 768, y: 842, 'text-anchor': 'middle' }, platform);

  const groups = {};
  cfg.nodes.forEach((node) => {
    groups[node.id] = node.shapes.map((shape, index) => {
      const clipId = `bp-clip-${key}-${node.id}-${index}`;
      svgNode('polygon', { points: pts(shape) }, svgNode('clipPath', { id: clipId }, defs));
      const group = svgNode('g', { class: 'bp-spotg' }, svg);
      const lit = svgNode('g', { class: 'bp-lit', 'clip-path': `url(#${clipId})` }, group);
      svgNode('image', { href: img?.src ?? '', width: W, height: H, preserveAspectRatio: 'none' }, lit);
      svgNode('polygon', { class: 'bp-shape', points: pts(shape) }, group);
      return group;
    });
  });

  const route = cfg.route;
  const cumulative = [0];
  for (let index = 1; index < route.length; index += 1) cumulative.push(cumulative[index - 1] + Math.hypot(route[index][0] - route[index - 1][0], route[index][1] - route[index - 1][1]));
  const total = cumulative[cumulative.length - 1];
  const nodeAt = Object.fromEntries(Object.entries(cfg.chain).map(([id, index]) => [id, cumulative[index]]));
  const pointAt = (distance) => {
    const d = clamp(distance, 0, total);
    let index = 1;
    while (index < cumulative.length - 1 && cumulative[index] < d) index += 1;
    const f = (d - cumulative[index - 1]) / (cumulative[index] - cumulative[index - 1] || 1);
    const a = route[index - 1], b = route[index];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
  const slice = (from, to) => {
    const low = Math.min(from, to), high = Math.max(from, to);
    const list = [pointAt(low)];
    cumulative.forEach((distance, index) => { if (distance > low && distance < high) list.push(route[index]); });
    list.push(pointAt(high));
    return pts(list.map(([x, y]) => [x.toFixed(1), y.toFixed(1)]));
  };

  svgNode('polyline', { class: 'bp-route-glow', points: pts(route) }, svg);
  svgNode('polyline', { class: 'bp-route', points: pts(route) }, svg);
  const runLine = svgNode('polyline', { class: 'bp-run', points: '' }, svg);
  const pads = {};
  Object.entries(cfg.chain).forEach(([id, index]) => {
    const group = svgNode('g', { class: 'bp-pad', transform: `translate(${route[index][0]} ${route[index][1]})` }, svg);
    svgNode('ellipse', { class: 'bp-pad-ring', rx: 28, ry: 14 }, group);
    svgNode('ellipse', { class: 'bp-pad-core', rx: 9, ry: 4.5 }, group);
    pads[id] = { group, glow: 0 };
  });

  const packetLayer = svgNode('g', { class: 'bp-packets' }, svg);
  const makePacket = (burst) => {
    const group = svgNode('g', { class: burst ? 'bp-packet is-burst' : 'bp-packet' }, packetLayer);
    const halo = svgNode('circle', { class: 'bp-halo', r: burst ? 20 : 15, fill: `url(#bp-glow-${key})` }, group);
    const trail = [0, 1, 2].map((index) => svgNode('circle', { class: 'bp-trail', r: (3.6 - index * 0.8).toFixed(1) }, group));
    const core = svgNode('circle', { class: 'bp-core', r: burst ? 4.4 : 3.4 }, group);
    return { group, halo, trail, core };
  };
  const ambient = Array.from({ length: 6 }, (_, index) => ({ ...makePacket(false), d: (total * index) / 6 }));
  const pool = Array.from({ length: 12 }, () => {
    const packet = { ...makePacket(true), active: false, shown: false, d: 0, to: 0, dir: 1, delay: 0 };
    packet.group.setAttribute('visibility', 'hidden');
    return packet;
  });
  const place = (packet, distance, dir, alpha) => {
    const [x, y] = pointAt(distance);
    packet.halo.setAttribute('cx', x.toFixed(1));
    packet.halo.setAttribute('cy', y.toFixed(1));
    packet.core.setAttribute('cx', x.toFixed(1));
    packet.core.setAttribute('cy', y.toFixed(1));
    packet.trail.forEach((dot, index) => {
      const [tx, ty] = pointAt(distance - dir * (index + 1) * 13);
      dot.setAttribute('cx', tx.toFixed(1));
      dot.setAttribute('cy', ty.toFixed(1));
    });
    packet.group.setAttribute('opacity', alpha.toFixed(2));
  };
  const pulse = (id) => { if (pads[id]) pads[id].glow = 1; };
  const spawn = (from, to) => {
    const start = nodeAt[from], end = nodeAt[to], dir = Math.sign(end - start) || 1;
    for (let index = 0; index < 5; index += 1) {
      const packet = pool.find((candidate) => !candidate.active);
      if (!packet) break;
      Object.assign(packet, { active: true, shown: false, d: start, to: end, dir, delay: index * 0.1 });
    }
  };

  const hot = htmlNode('div', 'bp-hot', card);
  const spots = cfg.nodes.map((node, index) => {
    const button = htmlNode('button', 'bp-spot', hot);
    button.type = 'button';
    button.style.left = `${(node.at[0] / W) * 100}%`;
    button.style.top = `${(node.at[1] / H) * 100}%`;
    button.style.setProperty('--d', `${index * 0.45}s`);
    button.setAttribute('aria-label', `${node.name}: ${node.role}`);
    button.setAttribute('aria-describedby', `tip-${key}-${node.id}`);
    htmlNode('span', 'bp-beacon', button);
    const tip = htmlNode('div', 'bp-tip', hot);
    tip.id = `tip-${key}-${node.id}`;
    tip.setAttribute('role', 'tooltip');
    const title = htmlNode('div', 'bp-tip-head', tip);
    htmlNode('i', 'bp-led', title);
    htmlNode('b', '', title, node.name);
    htmlNode('em', '', title, node.status);
    htmlNode('p', '', tip, node.role);
    const list = htmlNode('dl', '', tip);
    node.rows.forEach(([label, value]) => {
      const row = htmlNode('div', '', list);
      htmlNode('dt', '', row, label);
      htmlNode('dd', '', row, value);
    });
    return { node, button, tip };
  });
  htmlNode('span', 'bp-scan', plate);
  htmlNode('span', 'bp-glare', plate);

  const state = { hover: null, pinned: null, sim: null, tip: null, tipPinned: null };
  const setPlatformLabel = (text) => { platformLabel.textContent = text; };
  function applyActive() {
    const source = state.hover || state.sim || state.pinned;
    const nodes = source ? source.nodes : [];
    visual.classList.toggle('is-spot', nodes.length > 0);
    visual.classList.toggle('is-sim', Boolean(state.sim));
    cfg.nodes.forEach((node) => {
      const order = nodes.indexOf(node.id);
      groups[node.id].forEach((group) => {
        group.classList.toggle('is-on', order >= 0);
        group.style.setProperty('--k', String(Math.max(0, order)));
      });
    });
    platform.classList.toggle('is-on', nodes.includes('platform'));
    setPlatformLabel(source?.label || '');
    spots.forEach(({ node, button }) => button.classList.toggle('is-on', nodes.includes(node.id)));
    tags.forEach((tag) => {
      const linked = source?.tag === tag || (tag.nodes.length === 1 && nodes.includes(tag.nodes[0]) && (tag.nodes[0] !== 'platform' || tag.label === source?.label));
      tag.element.classList.toggle('is-linked', Boolean(linked));
      tag.element.setAttribute('aria-pressed', String(state.pinned?.tag === tag));
    });
    article.dataset.bpSpot = nodes.join(' ');
    article.dispatchEvent(new CustomEvent('bp:state', { detail: { nodes, stage: state.sim?.stage ?? null } }));
  }
  function placeTip(entry) {
    const width = plate.clientWidth, height = plate.clientHeight;
    const x = (entry.node.at[0] / W) * width, y = (entry.node.at[1] / H) * height;
    const tw = entry.tip.offsetWidth, th = entry.tip.offsetHeight;
    let top = y + 24;
    if (top + th > height - 8) top = y - th - 24;
    entry.tip.style.left = `${clamp(x - tw / 2, 8, Math.max(8, width - tw - 8))}px`;
    entry.tip.style.top = `${clamp(top, 8, Math.max(8, height - th - 8))}px`;
  }
  function showTip(id) {
    state.tip = id;
    spots.forEach((entry) => {
      const open = entry.node.id === id;
      if (open) placeTip(entry);
      entry.tip.classList.toggle('is-open', open);
    });
  }
  const hideTip = () => showTip(null);

  spots.forEach((entry) => {
    const { node, button } = entry;
    const enter = () => { state.hover = { nodes: [node.id, ...(node.also ?? [])], from: 'spot' }; showTip(node.id); applyActive(); };
    const leave = () => {
      if (state.hover?.from === 'spot') state.hover = null;
      if (state.tipPinned !== node.id) hideTip();
      applyActive();
    };
    button.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') enter(); });
    button.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') leave(); });
    button.addEventListener('focus', enter);
    button.addEventListener('blur', leave);
    button.addEventListener('click', () => {
      state.tipPinned = state.tipPinned === node.id ? null : node.id;
      if (state.tipPinned) enter(); else leave();
    });
  });
  tags.forEach((tag) => {
    const source = { nodes: tag.nodes, label: tag.label, from: 'tag', tag };
    const enter = () => { state.hover = source; applyActive(); };
    const leave = () => { if (state.hover === source) { state.hover = null; applyActive(); } };
    tag.element.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') enter(); });
    tag.element.addEventListener('pointerleave', leave);
    tag.element.addEventListener('focus', enter);
    tag.element.addEventListener('blur', leave);
    tag.element.addEventListener('click', () => {
      state.pinned = state.pinned?.tag === tag ? null : source;
      if (state.pinned) state.hover = source;
      applyActive();
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.bp-spot')) return;
    if (state.tipPinned) { state.tipPinned = null; hideTip(); }
  });
  article.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    state.tipPinned = null;
    state.pinned = null;
    state.hover = null;
    hideTip();
    applyActive();
  });

  const tilt = { x: 0, y: 0, lift: 0, tx: 0, ty: 0, tl: 0, css: '' };
  visual.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || reduced.matches) return;
    const box = visual.getBoundingClientRect();
    const px = clamp((event.clientX - box.left) / box.width, 0, 1), py = clamp((event.clientY - box.top) / box.height, 0, 1);
    tilt.tx = (px - 0.5) * 2;
    tilt.ty = (py - 0.5) * 2;
    tilt.tl = 1;
    plate.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    plate.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
  });
  visual.addEventListener('pointerleave', () => { tilt.tx = 0; tilt.ty = 0; tilt.tl = 0; });

  const button = article.querySelector('.bp-sim');
  const trace = article.querySelector('.bp-trace');
  const traceInner = trace?.querySelector('.bp-trace-inner');
  let sim = null;
  let boost = 1;
  let ui = null;
  if (button && trace && traceInner) {
    const term = htmlNode('div', 'bp-term', traceInner);
    const head = htmlNode('div', 'bp-term-head', term);
    const dots = htmlNode('span', 'bp-dots', head);
    dots.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 3; index += 1) htmlNode('i', '', dots);
    htmlNode('span', 'bp-title', head, `trace://${cfg.slug}`);
    htmlNode('span', 'bp-note', head, 'simulated, sample metrics');
    const chip = htmlNode('span', 'bp-state', head, 'IDLE');
    chip.setAttribute('role', 'status');
    const close = htmlNode('button', 'bp-close', head, '\u00d7');
    close.type = 'button';
    close.setAttribute('aria-label', 'Collapse trace');
    const log = htmlNode('ol', 'bp-log', term);
    const foot = htmlNode('div', 'bp-foot', term);
    const bar = htmlNode('div', 'bp-steps', foot);
    const segments = cfg.stages.map(() => htmlNode('i', '', bar));
    const summary = htmlNode('span', 'bp-sum', foot, '');
    ui = { chip, log, segments, summary, close };
    trace.inert = true;
    button.hidden = false;
    button.dataset.label = button.textContent;
  }

  const fmt = (value) => value.toLocaleString('en-US');
  function setOpen(open) {
    trace.classList.toggle('is-open', open);
    trace.inert = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) {
      setTimeout(() => {
        const box = trace.getBoundingClientRect();
        if (box.bottom > window.innerHeight - 16) trace.scrollIntoView({ block: 'end', behavior: reduced.matches ? 'auto' : 'smooth' });
      }, 420);
    }
  }
  function finishStage(index) {
    const row = ui.log.children[index];
    if (!row) return;
    const stage = cfg.stages[index];
    row.querySelector('.bp-ms b').textContent = fmt(stage.ms);
    const badge = row.querySelector('.bp-badge');
    badge.textContent = stage.badge;
    badge.className = `bp-badge is-${stage.tone}`;
    row.classList.add('is-done');
    ui.segments[index].classList.remove('is-run');
    ui.segments[index].classList.add('is-done');
    ui.chip.textContent = `${index + 1}/${cfg.stages.length} ${stage.short || stage.svc} \u00b7 ${stage.badge}`;
  }
  function startStage(index) {
    const stage = cfg.stages[index];
    const row = htmlNode('li', '', ui.log);
    htmlNode('span', 'bp-idx', row, String(index + 1).padStart(2, '0'));
    const name = htmlNode('span', 'bp-svc', row);
    htmlNode('b', '', name, stage.svc);
    htmlNode('code', '', name, pretty(stage.op));
    const ms = htmlNode('span', 'bp-ms', row);
    ms.setAttribute('aria-hidden', 'true');
    htmlNode('b', '', ms, '0');
    ms.append(' ms');
    htmlNode('span', 'bp-badge is-run', row, 'RUN');
    htmlNode('span', 'bp-meta', row, pretty(stage.meta));
    ui.segments[index].classList.add('is-run');
    state.sim = { nodes: stage.nodes, label: stage.label || '', stage: index };
    runLine.setAttribute('points', slice(nodeAt[stage.from], nodeAt[stage.to]));
    spawn(stage.from, stage.to);
    article.dataset.bpSim = String(index + 1);
    applyActive();
  }
  function endSim() {
    const stage = cfg.stages;
    const sum = stage.reduce((acc, item) => acc + item.ms, 0);
    ui.chip.textContent = 'COMPLETE';
    ui.chip.classList.remove('is-run');
    ui.chip.classList.add('is-done');
    ui.summary.textContent = pretty(`total ${fmt(sum)} ms / ${stage.length} stages / 0 errors / ${cfg.done}`);
    button.textContent = '\u21bb Replay trace';
    button.classList.remove('is-running');
    button.removeAttribute('aria-disabled');
    runLine.setAttribute('points', '');
    state.sim = null;
    sim = null;
    article.dataset.bpSim = 'done';
    applyActive();
  }
  function runSim() {
    if (sim) return;
    ui.log.replaceChildren();
    ui.segments.forEach((segment) => segment.classList.remove('is-run', 'is-done'));
    ui.summary.textContent = '';
    ui.chip.textContent = 'CONNECTING';
    ui.chip.classList.remove('is-done');
    ui.chip.classList.add('is-run');
    button.textContent = '\u25cf Tracing\u2026';
    button.classList.add('is-running');
    button.setAttribute('aria-disabled', 'true');
    sim = { t: 0, stage: -1 };
    article.dataset.bpSim = '0';
    setOpen(true);
  }
  function advanceSim(dt) {
    sim.t += dt;
    const local = sim.t - LEAD;
    const stageLen = cfg.stageLen ?? STAGE;
    const countLen = cfg.countLen ?? COUNT;
    const target = Math.min(cfg.stages.length - 1, Math.floor(local / stageLen));
    while (sim.stage < target) {
      if (sim.stage >= 0) finishStage(sim.stage);
      sim.stage += 1;
      startStage(sim.stage);
    }
    if (sim.stage >= 0) {
      const progress = clamp((local - sim.stage * stageLen) / countLen, 0, 1);
      const value = Math.round(cfg.stages[sim.stage].ms * (1 - (1 - progress) ** 3));
      const row = ui.log.children[sim.stage];
      if (row && !row.classList.contains('is-done')) row.querySelector('.bp-ms b').textContent = fmt(value);
      if (progress < 1) ui.chip.textContent = `${sim.stage + 1}/${cfg.stages.length} ${cfg.stages[sim.stage].short || cfg.stages[sim.stage].svc}`;
    }
    if (local >= cfg.stages.length * stageLen + 0.2) {
      finishStage(cfg.stages.length - 1);
      endSim();
    }
  }
  if (ui) {
    button.addEventListener('click', () => { if (!sim) runSim(); });
    ui.close.addEventListener('click', () => {
      if (sim) { sim = null; state.sim = null; runLine.setAttribute('points', ''); button.textContent = button.dataset.label; button.classList.remove('is-running'); button.removeAttribute('aria-disabled'); applyActive(); }
      setOpen(false);
      button.focus();
    });
  }

  const entry = { visible: false };
  entry.tick = (dt) => {
    if (!reduced.matches) {
      const k = 1 - Math.exp(-dt * 9);
      tilt.x += (tilt.tx - tilt.x) * k;
      tilt.y += (tilt.ty - tilt.y) * k;
      tilt.lift += (tilt.tl - tilt.lift) * k;
      const css = Math.abs(tilt.x) + Math.abs(tilt.y) + tilt.lift < 0.004 ? '' : `rotateX(${(-tilt.y * 6).toFixed(2)}deg) rotateY(${(tilt.x * 8).toFixed(2)}deg) translateZ(${(tilt.lift * 14).toFixed(1)}px)`;
      if (css !== tilt.css) { card.style.transform = css; tilt.css = css; }
    }
    if (sim) advanceSim(dt);
    if (reduced.matches || cfg.custom) return;
    boost += ((sim ? 4.4 : 1) - boost) * (1 - Math.exp(-dt * 4));
    const speed = (total / 9) * boost;
    ambient.forEach((packet) => {
      const before = packet.d;
      packet.d = (packet.d + speed * dt) % total;
      if (packet.d >= before) Object.entries(nodeAt).forEach(([id, at]) => { if (before < at && packet.d >= at) pulse(id); });
      place(packet, packet.d, 1, Math.min(1, packet.d / 40, (total - packet.d) / 40));
    });
    pool.forEach((packet) => {
      if (!packet.active) return;
      if (!packet.shown) {
        packet.delay -= dt;
        if (packet.delay > 0) return;
        packet.shown = true;
        packet.group.setAttribute('visibility', 'visible');
      }
      const before = packet.d;
      packet.d += packet.dir * 580 * dt;
      Object.entries(nodeAt).forEach(([id, at]) => { if ((before - at) * (packet.d - at) <= 0 && before !== at) pulse(id); });
      if (packet.dir > 0 ? packet.d >= packet.to : packet.d <= packet.to) {
        packet.active = false;
        packet.group.setAttribute('visibility', 'hidden');
        return;
      }
      place(packet, packet.d, packet.dir, 1);
    });
    Object.values(pads).forEach((pad) => {
      if (pad.glow <= 0.004) { if (pad.glow > 0) { pad.glow = 0; pad.group.style.setProperty('--p', '0'); } return; }
      pad.glow *= Math.exp(-dt * 2.6);
      pad.group.style.setProperty('--p', pad.glow.toFixed(3));
    });
    article.dataset.bpPackets = String(ambient.length + pool.filter((packet) => packet.active).length);
  };
  cards.push(entry);

  new IntersectionObserver(([change]) => { entry.visible = change.isIntersecting; }, { rootMargin: '120px' }).observe(visual);
  const reveal = new IntersectionObserver(async ([change]) => {
    if (!change.isIntersecting) return;
    reveal.disconnect();
    if (!reduced.matches && img) await Promise.race([img.decode().catch(() => {}), wait(1800)]);
    article.classList.add('bp-live');
  }, { threshold: 0.3 });
  reveal.observe(article);
  applyActive();
}

document.querySelectorAll('.work-item[data-blueprint]').forEach(initBlueprint);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!document.hidden) cards.forEach((entry) => { if (entry.visible) entry.tick(dt); });
  requestAnimationFrame(frame);
}
if (cards.length) requestAnimationFrame(frame);
