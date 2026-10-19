const section = document.querySelector('#constellation');
const chart = section?.querySelector('#star-chart');

const svg = (body, attrs = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${attrs}>${body}</svg>`;
const ICONS = {
  python: svg('<defs><linearGradient id="py-b" x1="4" y1="1" x2="14" y2="14" gradientUnits="userSpaceOnUse"><stop stop-color="#5A9FD4"/><stop offset="1" stop-color="#306998"/></linearGradient><linearGradient id="py-y" x1="10" y1="10" x2="20" y2="23" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE873"/><stop offset="1" stop-color="#FFD43B"/></linearGradient></defs><path fill="url(#py-b)" d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.913 0z"/><path fill="url(#py-y)" d="M12.087 24c6.093 0 5.713-2.656 5.713-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.45s-3.24-.052-3.24 3.148v5.292S5.72 24 12.087 24z"/><circle cx="8.71" cy="2.9" r="1.05" fill="#fff"/><circle cx="15.29" cy="21.1" r="1.05" fill="#fff"/>'),
  javascript: svg('<path d="M2.6 2h18.8l-1.7 18.8L12 23l-7.7-2.2z" fill="#F7DF1E"/><path d="M12 4v17.2l6-1.7L19.4 4z" fill="#E8C80E" opacity=".55"/><text x="12" y="17.4" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-weight="800" font-size="9.6" fill="#17140a">JS</text>'),
  fastapi: svg('<defs><linearGradient id="fa-g" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#14b8a6"/><stop offset="1" stop-color="#047a6e"/></linearGradient></defs><path d="M12 1.8l8.6 3.2v6.3c0 5.2-3.5 9.2-8.6 11.2-5.1-2-8.6-6-8.6-11.2V5z" fill="url(#fa-g)" stroke="#99f6e4" stroke-opacity=".5" stroke-width=".7" stroke-linejoin="round"/><path d="M13.6 5.4L7.5 13.2h4l-1.1 5.5 6.1-7.9h-4.1z" fill="#fff"/>'),
  llms: svg('<defs><linearGradient id="sp-g" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#ecfdf5"/><stop offset=".5" stop-color="#6ee7b7"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><path d="M12 2.2c.9 5.4 4.4 9 9.8 9.8-5.4.9-8.9 4.4-9.8 9.8-.9-5.4-4.4-8.9-9.8-9.8 5.4-.8 8.9-4.4 9.8-9.8z" fill="url(#sp-g)"/><g stroke="#a7f3d0" stroke-width=".7" stroke-linecap="round" opacity=".85"><path d="M19.6 4.4l-4.2 4.2M4.4 18.9l3.6-3.6M20 19.4l-3.8-3.8M4.7 5l3.3 3.3"/></g><g fill="#ecfdf5"><circle cx="19.8" cy="4.2" r="1.25"/><circle cx="4.2" cy="19.2" r="1.1"/><circle cx="20.2" cy="19.6" r="1"/><circle cx="4.6" cy="5" r=".9"/></g>'),
  mcp: svg('<g fill="none" stroke="#d1fae5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2.8v5M15 2.8v5"/><path d="M5.8 8h12.4v3.2a6.2 6.2 0 0 1-12.4 0z"/><path d="M12 17.4v4"/></g>'),
  chromadb: svg('<g style="mix-blend-mode:screen"><circle cx="9" cy="9" r="5.6" fill="#FF6446"/><circle cx="15" cy="9" r="5.6" fill="#327EFF"/><circle cx="12" cy="14.6" r="5.6" fill="#FFDE2D"/></g>'),
  ollama: svg('<g fill="none" stroke="#f1f5f9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.6 8.6C6.9 5.6 7.4 3 8.6 2.8c1 0 1.8 1.6 2 3.6"/><path d="M16.4 8.6c.7-3 .2-5.6-1-5.8-1 0-1.8 1.6-2 3.6"/><path d="M6.8 11c0-3.2 2.4-5 5.2-5s5.2 1.8 5.2 5v4.2c0 3.4-2.3 6-5.2 6s-5.2-2.6-5.2-6z"/><ellipse cx="12" cy="15.6" rx="2.6" ry="1.9"/><path d="M12 14.4v.9"/></g><circle cx="9.3" cy="11.4" r=".6" fill="#f1f5f9"/><circle cx="14.7" cy="11.4" r=".6" fill="#f1f5f9"/>'),
  rag: svg('<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2.8h-8v15.4h5" stroke="#a7f3d0" stroke-width="1.6"/><path d="M13.5 2.8L18 7.3v4.4M13.5 2.8v4.5H18" stroke="#a7f3d0" stroke-width="1.6"/><path d="M8.5 8.5h2.8M8.5 11.5h3.5M8.5 14.5h2" stroke="#6ee7b7" stroke-width="1.5"/><circle cx="15.8" cy="16" r="3.6" stroke="#fde68a" stroke-width="1.7"/><path d="M18.5 18.7l3 3" stroke="#fde68a" stroke-width="1.9"/></g>'),
  langchain: svg('<g fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5.8" width="12" height="6.4" rx="3.2" transform="rotate(40 9 9)" stroke="#86efac"/><rect x="9" y="11.8" width="12" height="6.4" rx="3.2" transform="rotate(40 15 15)" stroke="#6ee7b7"/></g>'),
  kubernetes: svg('<path d="M12 2l7.8 3.8 2 8.4-5.5 6.8H7.7l-5.5-6.8 2-8.4z" fill="#326CE5" stroke="#326CE5" stroke-width="1.2" stroke-linejoin="round"/><g fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"><circle cx="12" cy="12" r="4.4"/><path d="M12 12V5.6M12 12l5-4M12 12l6.3 1.5M12 12l2.8 5.9M12 12l-2.8 5.9M12 12l-6.3 1.5M12 12L7 8"/></g><circle cx="12" cy="12" r="1.2" fill="#fff"/>'),
  docker: svg('<g fill="#2496ED"><rect x="4.2" y="9.2" width="2.6" height="2.3" rx=".3"/><rect x="7.2" y="9.2" width="2.6" height="2.3" rx=".3"/><rect x="10.2" y="9.2" width="2.6" height="2.3" rx=".3"/><rect x="13.2" y="9.2" width="2.6" height="2.3" rx=".3"/><rect x="7.2" y="6.5" width="2.6" height="2.3" rx=".3"/><rect x="10.2" y="6.5" width="2.6" height="2.3" rx=".3"/><rect x="13.2" y="6.5" width="2.6" height="2.3" rx=".3"/><rect x="10.2" y="3.8" width="2.6" height="2.3" rx=".3"/><path d="M1.8 12.3h18.4c1-.1 1.9-.6 2.5-1.4 1 .3 1.8-.1 2.2-.8-.7-.6-1.6-.7-2.4-.4-.4-.9-1.1-1.4-2-1.6-.1 1.1.1 1.8.6 2.4H1.8c0 4.8 3.5 8.2 9.3 8.2 5.2 0 8.5-2.4 9.7-6.6z"/></g>'),
  aws: svg('<text x="12" y="12.2" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="800" font-size="8.8" fill="#f8fafc">aws</text><g fill="none" stroke="#FF9900" stroke-linecap="round" stroke-linejoin="round"><path d="M3.8 15.4C9 19.2 15 19.2 20.2 15.4" stroke-width="1.8"/><path d="M18 14.2l2.5 1.3-.7 2.7" stroke-width="1.6"/></g>'),
  argo: svg('<path d="M12 2.6c-4.1 0-6.8 2.9-6.8 6.6 0 1.9.7 3.2 1.6 4.2-.2 1.6-1 2.7-2.4 3.7 2 .4 3.6-.3 4.4-1.2.4 1.4.2 3-.6 4.3 1.6-.3 2.8-1.5 3.4-3 .6 1.5 1.8 2.7 3.4 3-.8-1.3-1-2.9-.6-4.3.8.9 2.4 1.6 4.4 1.2-1.4-1-2.2-2.1-2.4-3.7.9-1 1.6-2.3 1.6-4.2 0-3.7-2.7-6.6-6.8-6.6z" fill="#EF7B4D"/><ellipse cx="12" cy="9.3" rx="4.1" ry="3.2" fill="#c8f0ff" opacity=".92"/><circle cx="10.4" cy="9.3" r=".75" fill="#1c3b4a"/><circle cx="13.6" cy="9.3" r=".75" fill="#1c3b4a"/>'),
  terraform: svg('<path d="M2 2.4l6.2 3.5v7L2 9.4z" fill="#7B42BC"/><path d="M9.2 6.3l6.2 3.5v7l-6.2-3.5z" fill="#844FBA"/><path d="M9.2 14.6l6.2 3.5v6.4" fill="none"/><path d="M9.2 14.6l6.2 3.5v5.6l-6.2-3.5z" fill="#7B42BC"/><path d="M16.4 2.4l6.2 3.5v7l-6.2-3.5z" fill="#5C4EE5"/>'),
  elk: svg('<rect x="3" y="4" width="18" height="4.6" rx="2.3" fill="#FEC514"/><rect x="3" y="9.7" width="18" height="4.6" rx="2.3" fill="#F04E98"/><rect x="3" y="15.4" width="18" height="4.6" rx="2.3" fill="#00BFB3"/><g font-family="DM Sans, Arial, sans-serif" font-weight="800" font-size="3.8" fill="#0b1512" text-anchor="middle"><text x="7" y="7.5">E</text><text x="7" y="13.2">L</text><text x="7" y="18.9">K</text></g>'),
  actions: svg('<rect x="2.6" y="3.4" width="18.8" height="17.2" rx="4.4" fill="none" stroke="#2088FF" stroke-width="1.7"/><path d="M9.6 8.4l6.2 3.6-6.2 3.6z" fill="#e0f0ff" stroke="#e0f0ff" stroke-width="1" stroke-linejoin="round"/>'),
  postgres: svg('<path d="M4.5 6.5v11c0 2 3.4 3.6 7.5 3.6s7.5-1.6 7.5-3.6v-11z" fill="#336791"/><ellipse cx="12" cy="6.5" rx="7.5" ry="3.6" fill="#5b9bd1"/><path d="M4.5 11.6c0 2 3.4 3.6 7.5 3.6s7.5-1.6 7.5-3.6" fill="none" stroke="#a8cdee" stroke-width=".9" opacity=".7"/>'),
  rest: svg('<g fill="none" stroke="#a7f3d0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 3.6C5.8 3.6 5.4 5 5.4 6.8s0 3.2-2.4 5.2c2.4 2 2.4 3.4 2.4 5.2s.4 3.2 2.8 3.2"/><path d="M15.8 3.6c2.4 0 2.8 1.4 2.8 3.2s0 3.2 2.4 5.2c-2.4 2-2.4 3.4-2.4 5.2s-.4 3.2-2.8 3.2"/><path d="M9.4 12h5.2M12.4 9.4L15 12l-2.6 2.6"/></g>'),
  micro: svg('<g fill="rgba(110,231,183,.16)" stroke="#6ee7b7" stroke-width="1.4" stroke-linejoin="round"><path d="M12 2.8l3.12 1.8v3.6L12 10 8.88 8.2V4.6z"/><path d="M6.8 11.8l3.12 1.8v3.6L6.8 19l-3.12-1.8v-3.6z"/><path d="M17.2 11.8l3.12 1.8v3.6L17.2 19l-3.12-1.8v-3.6z"/></g><path d="M10.4 9.5L8.2 11.9M13.6 9.5l2.2 2.4M10.3 15.4h3.4" stroke="#a7f3d0" stroke-width="1.2" stroke-linecap="round" fill="none"/>'),
  async: svg('<g fill="none" stroke="#6ee7b7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.2A8 8 0 0 0 5.2 7.4"/><path d="M5.4 3.6v4h4"/><path d="M4 12.8a8 8 0 0 0 14.8 3.8"/><path d="M18.6 20.4v-4h-4"/></g>'),
};

const GROUPS = { ai: 'AI & LLMs', backend: 'Backend & Languages', cloud: 'Cloud & MLOps' };
const SKILLS = [
  { id: 'llms', name: 'LLMs & Agentic AI', label: 'LLMs & Agentic AI', tier: 'core', groups: ['ai'], category: 'AI & LLMs', at: [18, 40], summary: 'Integrated LLMs with ELK observability pipelines and built agentic workflows for root-cause analysis at Teradata.' },
  { id: 'python', name: 'Python', label: 'Python', tier: 'core', groups: ['ai', 'backend'], category: 'Language', at: [35, 62], summary: 'My primary language: FastAPI services, RAG pipelines, Pandas and NumPy data work, and automation.' },
  { id: 'fastapi', name: 'FastAPI', label: 'FastAPI', tier: 'core', groups: ['backend'], category: 'Backend', at: [52, 38], summary: 'Typed, async BaaS endpoints with dependency injection, RBAC and authenticated upstream integrations.' },
  { id: 'javascript', name: 'JavaScript', label: 'JavaScript', tier: 'core', groups: ['backend'], category: 'Language', at: [67, 58], summary: 'Interfaces built with HTML/CSS and Vue.js, plus the Three.js scenes on this portfolio.' },
  { id: 'kubernetes', name: 'Kubernetes', label: 'Kubernetes', tier: 'core', groups: ['cloud'], category: 'Cloud & MLOps', at: [82, 50], summary: 'Minikube deployments for the RAG API and Helm/kubectl delivery on AWS EKS.' },
  { id: 'aws', name: 'AWS', label: 'AWS', tier: 'core', groups: ['cloud'], category: 'Cloud & MLOps', at: [92, 28], summary: 'EKS deployment for MicroCloudPy, with the architecture designed to carry over to GCP GKE.' },
  { id: 'docker', name: 'Docker', label: 'Docker', tier: 'core', groups: ['cloud'], category: 'Cloud & MLOps', at: [70, 82], summary: 'Containerized services for local Kubernetes and cloud delivery.' },
  { id: 'langchain', name: 'LangChain', label: 'LangChain', tier: 'orbit', groups: ['ai'], category: 'AI & LLMs', at: [8, 17], summary: 'Chaining retrieval, tools and prompts into LLM workflows.' },
  { id: 'chromadb', name: 'ChromaDB', label: 'ChromaDB', tier: 'orbit', groups: ['ai'], category: 'AI & LLMs', at: [30, 17], summary: 'Vector store behind the end-to-end RAG API, with embeddings rebuilt in CI.' },
  { id: 'rag', name: 'RAG Pipelines', label: 'RAG Pipelines', tier: 'orbit', groups: ['ai'], category: 'AI & LLMs', at: [7, 65], summary: 'Retrieval, local inference and semantic validation gates, built beyond the prototype.' },
  { id: 'ollama', name: 'Ollama', label: 'Ollama', tier: 'orbit', groups: ['ai'], category: 'AI & LLMs', at: [21, 82], summary: 'Local LLM inference that generates the answers inside the RAG API.' },
  { id: 'mcp', name: 'MCP', label: 'MCP', tier: 'orbit', groups: ['ai'], category: 'AI & LLMs', at: [41, 87], summary: 'Connected MCP servers and custom APIs for scoped, read-only Kubernetes diagnostics.' },
  { id: 'rest', name: 'REST APIs', label: 'REST APIs', tier: 'orbit', groups: ['backend'], category: 'Backend', at: [47, 14], summary: 'Versioned, cursor-paginated, rate-limited APIs with timeouts, retries and OAuth2/JWT.' },
  { id: 'async', name: 'Async IO', label: 'Async IO', tier: 'orbit', groups: ['backend'], category: 'Backend', at: [64, 15], summary: 'Asynchronous services with bounded concurrency and Redis-backed read paths.' },
  { id: 'postgres', name: 'PostgreSQL', label: 'PostgreSQL', tier: 'orbit', groups: ['backend'], category: 'Backend / Data', at: [53, 66], summary: 'Relational storage for auth services, with indexing, transactions and migrations.' },
  { id: 'micro', name: 'Microservices', label: 'Microservices', tier: 'orbit', groups: ['backend'], category: 'Backend', at: [55, 87], summary: 'Message-driven Python services connected through RabbitMQ in MicroCloudPy.' },
  { id: 'terraform', name: 'Terraform', label: 'Terraform', tier: 'orbit', groups: ['cloud'], category: 'Cloud & MLOps', at: [81, 13], summary: 'Infrastructure as code for repeatable cloud environments.' },
  { id: 'elk', name: 'ELK Stack', label: 'ELK Stack', tier: 'orbit', groups: ['cloud'], category: 'Cloud & MLOps', at: [73, 33], summary: 'Observability pipelines that feed LLM-assisted root-cause analysis.' },
  { id: 'actions', name: 'GitHub Actions', label: 'GitHub Actions', tier: 'orbit', groups: ['cloud'], category: 'Cloud & MLOps', at: [85, 86], summary: 'CI that rebuilds embeddings and runs semantic validation before delivery.' },
  { id: 'argo', name: 'Argo CD', label: 'Argo CD', tier: 'orbit', groups: ['cloud'], category: 'Cloud & MLOps', at: [93, 66], summary: 'GitOps releases and blue-green deployments to production.' },
];
const LINKS = [
  ['python', 'fastapi'], ['fastapi', 'llms'], ['llms', 'chromadb'], ['chromadb', 'ollama'], ['ollama', 'mcp'],
  ['python', 'llms'], ['llms', 'langchain'], ['llms', 'rag'], ['rag', 'ollama'],
  ['fastapi', 'rest'], ['fastapi', 'async'], ['fastapi', 'postgres'], ['rest', 'javascript'], ['async', 'javascript'], ['postgres', 'micro'], ['fastapi', 'elk'],
  ['docker', 'kubernetes'], ['kubernetes', 'argo'], ['argo', 'aws'], ['kubernetes', 'aws'], ['terraform', 'aws'], ['elk', 'kubernetes'], ['actions', 'docker'], ['actions', 'argo'], ['micro', 'docker'],
];

if (section && chart) initConstellation();

function initConstellation() {
  const canvas = chart.querySelector('#star-canvas');
  const layer = chart.querySelector('#star-layer');
  const card = chart.querySelector('#star-card');
  const meta = chart.querySelector('#chart-meta');
  const tabs = [...section.querySelectorAll('.constellation-tabs button')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2;
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const easeOut = (value) => 1 - (1 - value) ** 3;

  const stars = SKILLS.map((skill, index) => ({
    ...skill, index, node: null, lx: skill.at[0], ly: skill.at[1], x: 0, y: 0, scale: 1,
    depth: skill.tier === 'core' ? 0.95 + (index % 3) * 0.08 : 0.45 + (index % 5) * 0.09,
    phase: Math.random() * TAU, neighbors: new Set(), revealed: false, litAt: 0, lit: 0, inFilter: true,
  }));
  const byId = new Map(stars.map((star) => [star.id, star]));
  const edges = LINKS.map(([a, b]) => ({ a: byId.get(a), b: byId.get(b), f: 1, h: 0, speed: 0.08 + Math.random() * 0.08, offset: Math.random(), dir: Math.random() < 0.5 ? 1 : -1 }));
  edges.forEach(({ a, b }) => { a.neighbors.add(b.id); b.neighbors.add(a.id); });

  stars.forEach((star) => {
    const node = document.createElement('div');
    node.className = `star-node is-${star.tier}`;
    node.setAttribute('role', 'button');
    node.tabIndex = 0;
    node.setAttribute('aria-label', `${star.name}. ${star.summary}`);
    node.style.setProperty('--d', `${(-Math.random() * 5).toFixed(2)}s`);
    node.style.zIndex = String(Math.round(star.depth * 10));
    node.innerHTML = `<span class="star-spikes"></span><span class="star-glow"></span><span class="star-ring"></span><span class="star-core">${ICONS[star.id]}</span><span class="star-label">${star.label}</span>`;
    star.node = node;
    layer.append(node);
  });

  const dust = Array.from({ length: 130 }, () => ({
    bx: Math.random(), by: Math.random(), d: 0.15 + Math.random() * 0.85, size: 0.5 + Math.random() * 1.4,
    phase: Math.random() * TAU, ox: 0, oy: 0, vx: 0, vy: 0, x: 0, y: 0, near: 0, warm: Math.random() < 0.28,
  }));

  let W = 0, H = 0, dpr = 1, mobile = false;
  let visible = false, entered = false, raf = 0, last = 0;
  let filter = 'all', hovered = null, pinned = null, focusId = null, flareId = null, flareAmt = 0, flareStart = -9;
  let lastPointer = 'mouse', cardWidth = 280, cardHeight = 150, cardSpot = -1;
  const view = { x: 50, y: 50, zoom: 1, ay: 0.5 };
  const target = { x: 50, y: 50, zoom: 1, ay: 0.5 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, mx: 0, my: 0, inside: false };
  const shots = [];
  const bursts = [];

  function layout() {
    stars.forEach((star) => {
      const [x, y] = star.at;
      star.lx = mobile ? y : x;
      star.ly = mobile ? x : y;
    });
    computeTarget();
  }

  function computeTarget() {
    target.ay = 0.5;
    if (filter === 'all') { Object.assign(target, { x: 50, y: 50, zoom: 1 }); return; }
    const members = stars.filter((star) => star.groups.includes(filter));
    const xs = members.map((star) => star.lx), ys = members.map((star) => star.ly);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = (maxX - minX) / 100 * W + 190, height = (maxY - minY) / 100 * H + 170;
    target.x = (minX + maxX) / 2;
    target.y = (minY + maxY) / 2;
    target.zoom = clamp(Math.min(W / width, H / height), 1, 1.7);
    if (mobile) target.ay = 0.36;
  }

  function resize() {
    const rect = chart.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    mobile = W < 640;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    layout();
    if (reduced.matches) Object.assign(view, target);
    schedule();
  }

  function sizeCard() {
    card.style.setProperty('--cx', '0px');
    cardWidth = card.offsetWidth;
    cardHeight = card.offsetHeight;
  }

  function applyFocus() {
    focusId = pinned ?? hovered;
    chart.classList.toggle('has-focus', Boolean(focusId));
    const active = focusId ? byId.get(focusId) : null;
    stars.forEach((star) => {
      star.node.classList.toggle('is-hot', star === active);
      star.node.classList.toggle('is-linked', Boolean(active && active.neighbors.has(star.id)));
    });
    if (active) {
      card.querySelector('.star-card-badge').textContent = active.category;
      card.querySelector('.star-card-tier').textContent = `${active.tier === 'core' ? 'ALPHA STAR' : 'ORBITING STAR'} / ${active.neighbors.size} LINKS`;
      card.querySelector('.star-card-name').textContent = active.name;
      card.querySelector('.star-card-summary').textContent = active.summary;
      sizeCard();
      if (flareId !== active.id) flareStart = performance.now() / 1000;
      if (flareId !== active.id) cardSpot = -1;
      flareId = active.id;
    }
    card.classList.toggle('is-open', Boolean(active));
    card.setAttribute('aria-hidden', active ? 'false' : 'true');
    schedule();
  }

  function setFilter(next) {
    filter = next;
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.filter === next)));
    stars.forEach((star) => {
      star.inFilter = next === 'all' || star.groups.includes(next);
      star.node.classList.toggle('is-out', !star.inFilter);
    });
    const members = stars.filter((star) => star.inFilter);
    const links = edges.filter(({ a, b }) => a.inFilter && b.inFilter).length;
    meta.textContent = `${next === 'all' ? 'ALL CONSTELLATIONS' : GROUPS[next].toUpperCase()} / ${members.length} STARS / ${links} LINKS`;
    if (pinned && !byId.get(pinned).inFilter) pinned = null;
    if (hovered && !byId.get(hovered).inFilter) hovered = null;
    computeTarget();
    if (reduced.matches) Object.assign(view, target);
    applyFocus();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => setFilter(tab.dataset.filter)));
  stars.forEach((star) => {
    const { node } = star;
    node.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { hovered = star.id; applyFocus(); } });
    node.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse' && hovered === star.id) { hovered = null; applyFocus(); } });
    node.addEventListener('focus', () => { if (node.matches(':focus-visible')) { hovered = star.id; applyFocus(); } });
    node.addEventListener('blur', () => { if (hovered === star.id) { hovered = null; applyFocus(); } });
    node.addEventListener('click', () => {
      if (lastPointer === 'mouse') return;
      pinned = pinned === star.id ? null : star.id;
      applyFocus();
    });
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { pinned = null; hovered = null; node.blur(); applyFocus(); }
    });
  });
  chart.addEventListener('pointerdown', (event) => {
    lastPointer = event.pointerType;
    if (event.pointerType !== 'mouse' && !event.target.closest('.star-node') && pinned) { pinned = null; applyFocus(); }
  });
  chart.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = chart.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.tx = clamp(mouse.x / rect.width * 2 - 1, -1, 1);
    mouse.ty = clamp(mouse.y / rect.height * 2 - 1, -1, 1);
    mouse.inside = true;
    schedule();
  });
  chart.addEventListener('pointerleave', () => { mouse.inside = false; mouse.tx = mouse.ty = 0; schedule(); });

  function startEntrance(now) {
    const order = [...stars].sort((a, b) => (a.tier === 'core' ? 0 : 1) - (b.tier === 'core' ? 0 : 1) || a.index - b.index);
    let delay = 0.25;
    order.forEach((star, index) => {
      delay += star.tier === 'core' ? 0.17 : 0.1;
      shots.push({ star, t0: now + delay, duration: 0.85 + Math.random() * 0.35, fromRight: (star.lx > 50) !== (index % 4 === 3), done: false });
    });
  }
  function reveal(star, now) {
    star.revealed = true;
    star.litAt = now;
    star.node.classList.add('is-lit');
  }

  function step(dt, t) {
    const snap = reduced.matches;
    const ease = snap ? 1 : 1 - Math.exp(-dt * 4.2);
    view.x += (target.x - view.x) * ease;
    view.y += (target.y - view.y) * ease;
    view.zoom += (target.zoom - view.zoom) * ease;
    view.ay += (target.ay - view.ay) * ease;
    const follow = snap ? 1 : 1 - Math.exp(-dt * 5);
    mouse.mx += (mouse.tx - mouse.mx) * follow;
    mouse.my += (mouse.ty - mouse.my) * follow;
    const mx = snap ? 0 : mouse.mx, my = snap ? 0 : mouse.my;

    stars.forEach((star) => {
      star.x = W / 2 + (star.lx - view.x) * W / 100 * view.zoom - mx * 24 * star.depth + (snap ? 0 : Math.cos(t * 0.5 + star.phase) * 2.2);
      star.y = H * view.ay + (star.ly - view.y) * H / 100 * view.zoom - my * 15 * star.depth + (snap ? 0 : Math.sin(t * 0.7 + star.phase) * 3.2);
      star.scale = (1 + (view.zoom - 1) * 0.4) * (1 + (mouse.inside && !snap ? 0.03 * star.depth : 0));
      star.lit = star.revealed ? easeOut(clamp((t - star.litAt) / 0.7, 0, 1)) : 0;
      star.node.style.translate = `${star.x.toFixed(1)}px ${star.y.toFixed(1)}px`;
      star.node.style.scale = star.scale.toFixed(3);
    });

    edges.forEach((edge) => {
      const { a, b } = edge;
      const both = a.inFilter && b.inFilter;
      const filterTarget = filter === 'all' || both ? 1 : (a.inFilter || b.inFilter ? 0.22 : 0.06);
      const hotTarget = focusId && (a.id === focusId || b.id === focusId) ? 1 : 0;
      edge.f += (filterTarget - edge.f) * (snap ? 1 : 1 - Math.exp(-dt * 5));
      edge.h += (hotTarget - edge.h) * (snap ? 1 : 1 - Math.exp(-dt * 9));
    });

    const radius = 190, count = mobile ? 70 : dust.length;
    for (let index = 0; index < count; index += 1) {
      const p = dust[index];
      let x = p.bx * W - (view.x - 50) * W / 100 * view.zoom * p.d * 0.5 - mx * 36 * p.d + (snap ? 0 : Math.sin(t * 0.1 + p.phase) * 6);
      let y = p.by * H - (view.y - 50) * H / 100 * view.zoom * p.d * 0.5 - my * 22 * p.d + (snap ? 0 : Math.cos(t * 0.12 + p.phase) * 5);
      x = ((x % W) + W) % W;
      y = ((y % H) + H) % H;
      p.near *= 0.92;
      if (mouse.inside && !snap) {
        const dx = mouse.x - (x + p.ox), dy = mouse.y - (y + p.oy), dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const pull = (1 - dist / radius) ** 2 * 540 * (0.4 + p.d), safe = Math.max(dist, 36);
          p.vx += dx / safe * pull * dt;
          p.vy += dy / safe * pull * dt;
          p.near = Math.max(p.near, 1 - dist / radius);
        }
      }
      p.vx += -p.ox * 2.6 * dt;
      p.vy += -p.oy * 2.6 * dt;
      const damping = Math.exp(-2.4 * dt);
      p.vx *= damping;
      p.vy *= damping;
      p.ox = clamp(p.ox + p.vx * dt, -130, 130);
      p.oy = clamp(p.oy + p.vy * dt, -130, 130);
      p.x = x + p.ox;
      p.y = y + p.oy;
    }

    const flareTarget = focusId ? 1 : 0;
    flareAmt += (flareTarget - flareAmt) * (snap ? 1 : 1 - Math.exp(-dt * 8));

    const active = focusId ? byId.get(focusId) : null;
    if (active && !mobile) {
      const reach = (active.tier === 'core' ? 68 : 46) * 0.5 * active.scale + 26;
      const spots = [
        [active.x + reach, active.y - cardHeight / 2],
        [active.x - reach - cardWidth, active.y - cardHeight / 2],
        [active.x - cardWidth / 2, active.y + reach + 20],
        [active.x - cardWidth / 2, active.y - reach - cardHeight - 8],
      ].map(([x, y]) => {
        const fx = clamp(x, 12, W - cardWidth - 12), fy = clamp(y, 12, H - cardHeight - 12);
        let score = Math.hypot(fx - x, fy - y) * 0.6;
        stars.forEach((star) => {
          if (star === active || star.x < fx - 50 || star.x > fx + cardWidth + 50 || star.y + 78 < fy || star.y - 44 > fy + cardHeight) return;
          score += star.neighbors.has(active.id) ? 400 : 40;
        });
        return { x: fx, y: fy, score };
      });
      let best = 0;
      spots.forEach((spot, index) => { if (spot.score < spots[best].score) best = index; });
      if (cardSpot < 0 || spots[cardSpot].score > spots[best].score + 60) cardSpot = best;
      card.style.setProperty('--cx', `${spots[cardSpot].x.toFixed(1)}px`);
      card.style.setProperty('--cy', `${spots[cardSpot].y.toFixed(1)}px`);
    } else if (active) {
      const reach = (active.tier === 'core' ? 50 : 34) * 0.5 * active.scale + 30;
      const below = active.y + reach + 14;
      card.style.setProperty('--cy', `${(below + cardHeight > H - 10 ? active.y - reach - cardHeight - 8 : below).toFixed(1)}px`);
    } else cardSpot = -1;

    for (let index = shots.length - 1; index >= 0; index -= 1) {
      const shot = shots[index];
      if (!shot.done && (snap || t >= shot.t0 + shot.duration)) {
        shot.done = true;
        reveal(shot.star, t);
        if (!snap) bursts.push({ x: shot.star.x, y: shot.star.y, t0: t });
      }
      if (shot.done) shots.splice(index, 1);
    }
    for (let index = bursts.length - 1; index >= 0; index -= 1) if (t - bursts[index].t0 > 0.8) bursts.splice(index, 1);
  }

  function shotPoint(shot, u, out) {
    const { star } = shot;
    const ox = shot.fromRight ? W + 30 : -30, oy = -30;
    const mx = (ox + star.x) / 2, my = (oy + star.y) / 2;
    const length = Math.hypot(star.x - ox, star.y - oy) || 1;
    const bend = (shot.fromRight ? 1 : -1) * length * 0.13;
    const cx = mx + (-(star.y - oy) / length) * bend, cy = my + ((star.x - ox) / length) * bend;
    const e = easeOut(clamp(u, 0, 1)), k = 1 - e;
    out.x = k * k * ox + 2 * k * e * cx + e * e * star.x;
    out.y = k * k * oy + 2 * k * e * cy + e * e * star.y;
    return out;
  }

  const scratchA = { x: 0, y: 0 }, scratchB = { x: 0, y: 0 };
  function render(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    const count = mobile ? 70 : dust.length;
    for (let index = 0; index < count; index += 1) {
      const p = dust[index];
      const alpha = Math.min(1, (0.16 + 0.42 * p.d) * (0.72 + 0.28 * Math.sin(t * 1.3 + p.phase)) * (1 + p.near * 1.6));
      ctx.fillStyle = p.warm ? `rgba(209,250,229,${alpha.toFixed(3)})` : `rgba(110,231,183,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + p.near * 0.7), 0, TAU);
      ctx.fill();
    }

    edges.forEach((edge) => {
      const { a, b } = edge;
      const lit = Math.min(a.lit, b.lit);
      if (lit < 0.01) return;
      const dim = focusId ? (edge.h > 0.5 ? 1 : 0.2) : 1;
      const alpha = lit * edge.f * dim;
      if (alpha < 0.01) return;
      const strength = 0.3 + 0.65 * edge.h;
      ctx.save();
      ctx.lineWidth = 1 + edge.h * 1.5;
      ctx.strokeStyle = `rgba(110,231,183,${(alpha * strength).toFixed(3)})`;
      if (edge.h > 0.05) { ctx.shadowColor = 'rgba(52,211,153,.9)'; ctx.shadowBlur = 12 * edge.h; }
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
      if (reduced.matches) return;
      const packets = edge.h > 0.5 ? 3 : 1;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let slot = 0; slot < packets; slot += 1) {
        let u = (t * edge.speed * (edge.h > 0.5 ? 2.2 : 1) + edge.offset + slot / packets) % 1;
        if (edge.dir < 0) u = 1 - u;
        const px = a.x + (b.x - a.x) * u, py = a.y + (b.y - a.y) * u;
        const fade = Math.sin(Math.PI * clamp(u, 0, 1)) ** 0.6 * alpha * (0.55 + 0.45 * edge.h);
        const tail = clamp(u - 0.07 * edge.dir, 0, 1);
        const tx = a.x + (b.x - a.x) * tail, ty = a.y + (b.y - a.y) * tail;
        const gradient = ctx.createLinearGradient(tx, ty, px, py);
        gradient.addColorStop(0, 'rgba(110,231,183,0)');
        gradient.addColorStop(1, `rgba(190,255,225,${(fade * 0.9).toFixed(3)})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 7 + edge.h * 3);
        glow.addColorStop(0, `rgba(240,255,248,${fade.toFixed(3)})`);
        glow.addColorStop(0.35, `rgba(110,231,183,${(fade * 0.55).toFixed(3)})`);
        glow.addColorStop(1, 'rgba(52,211,153,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 7 + edge.h * 3, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    });

    const flareStar = flareId ? byId.get(flareId) : null;
    if (flareStar && flareAmt > 0.01) {
      const pulse = 0.88 + 0.12 * Math.sin(t * 6);
      const size = (flareStar.tier === 'core' ? 130 : 96) * pulse;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(flareStar.x, flareStar.y, 0, flareStar.x, flareStar.y, size);
      halo.addColorStop(0, `rgba(230,255,244,${(0.55 * flareAmt).toFixed(3)})`);
      halo.addColorStop(0.3, `rgba(110,231,183,${(0.28 * flareAmt).toFixed(3)})`);
      halo.addColorStop(1, 'rgba(52,211,153,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(flareStar.x, flareStar.y, size, 0, TAU);
      ctx.fill();
      [[1, 0, 1], [0, 1, 1], [0.7071, 0.7071, 0.5], [0.7071, -0.7071, 0.5]].forEach(([dx, dy, scale]) => {
        const reach = size * 1.15 * scale * flareAmt;
        const ray = ctx.createLinearGradient(flareStar.x - dx * reach, flareStar.y - dy * reach, flareStar.x + dx * reach, flareStar.y + dy * reach);
        ray.addColorStop(0, 'rgba(190,255,225,0)');
        ray.addColorStop(0.5, `rgba(240,255,248,${(0.85 * flareAmt).toFixed(3)})`);
        ray.addColorStop(1, 'rgba(190,255,225,0)');
        ctx.strokeStyle = ray;
        ctx.lineWidth = scale === 1 ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(flareStar.x - dx * reach, flareStar.y - dy * reach);
        ctx.lineTo(flareStar.x + dx * reach, flareStar.y + dy * reach);
        ctx.stroke();
      });
      const ring = clamp((t - flareStart) / 0.85, 0, 1);
      if (ring < 1 && !reduced.matches) {
        ctx.strokeStyle = `rgba(167,243,208,${(0.75 * (1 - ring) ** 1.5).toFixed(3)})`;
        ctx.lineWidth = 2 * (1 - ring) + 0.5;
        ctx.beginPath();
        ctx.arc(flareStar.x, flareStar.y, 18 + easeOut(ring) * 120, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    shots.forEach((shot) => {
      const u = (t - shot.t0) / shot.duration;
      if (u <= 0 || u >= 1) return;
      const steps = 18;
      shotPoint(shot, u, scratchA);
      const head = { x: scratchA.x, y: scratchA.y };
      for (let step = 1; step <= steps; step += 1) {
        shotPoint(shot, u - step * 0.024, scratchB);
        const along = 1 - step / steps;
        ctx.strokeStyle = step < 5 ? `rgba(255,255,255,${(0.9 * along).toFixed(3)})` : `rgba(110,231,183,${(0.75 * along ** 1.3).toFixed(3)})`;
        ctx.lineWidth = 0.6 + 3.6 * along ** 1.2;
        ctx.beginPath();
        ctx.moveTo(scratchA.x, scratchA.y);
        ctx.lineTo(scratchB.x, scratchB.y);
        ctx.stroke();
        scratchA.x = scratchB.x;
        scratchA.y = scratchB.y;
      }
      const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 18);
      glow.addColorStop(0, 'rgba(255,255,255,1)');
      glow.addColorStop(0.3, 'rgba(167,243,208,.7)');
      glow.addColorStop(1, 'rgba(52,211,153,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 18, 0, TAU);
      ctx.fill();
    });
    bursts.forEach((burst) => {
      const p = clamp((t - burst.t0) / 0.75, 0, 1);
      const fade = (1 - p) ** 1.5;
      const flash = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, 34);
      flash.addColorStop(0, `rgba(255,255,255,${(0.75 * (1 - p) ** 2).toFixed(3)})`);
      flash.addColorStop(1, 'rgba(110,231,183,0)');
      ctx.fillStyle = flash;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, 34, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(167,243,208,${(0.8 * fade).toFixed(3)})`;
      ctx.lineWidth = 2.2 * (1 - p) + 0.4;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, 8 + easeOut(p) * 62, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(240,255,248,${(0.7 * fade).toFixed(3)})`;
      ctx.lineWidth = 1;
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = ray / 8 * TAU + 0.3, inner = 10 + easeOut(p) * 28, outer = inner + 14 * (1 - p);
        ctx.beginPath();
        ctx.moveTo(burst.x + Math.cos(angle) * inner, burst.y + Math.sin(angle) * inner);
        ctx.lineTo(burst.x + Math.cos(angle) * outer, burst.y + Math.sin(angle) * outer);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  const running = () => !reduced.matches && visible && !document.hidden;
  function frame(now) {
    raf = 0;
    const t = now / 1000;
    const dt = last ? Math.min(0.05, t - last) : 0.016;
    last = t;
    step(dt, t);
    render(t);
    if (running()) schedule(); else last = 0;
  }
  function schedule() { if (!raf && W) raf = requestAnimationFrame(frame); }

  new ResizeObserver(resize).observe(chart);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }, { rootMargin: '160px' }).observe(chart);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) { Object.assign(view, target); stars.forEach((star) => { if (!star.revealed) reveal(star, 0); }); } schedule(); });
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting || entered) return;
    entered = true;
    observer.disconnect();
    if (reduced.matches) stars.forEach((star) => reveal(star, 0));
    else startEntrance(performance.now() / 1000);
    schedule();
  }, { threshold: 0.3 }).observe(chart);

  setFilter('all');
  resize();
}
