const article = document.querySelector('.work-item[data-blueprint="finder"]');
const mount = article?.querySelector('.fs-mount');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

// dlib-style 68-point layout in a 200 x 270 face space: jaw 0-16, brows 17-26, nose 27-35, eyes 36-47, lips 48-67.
const LM = [
  [22, 92], [24, 120], [29, 148], [37, 173], [50, 196], [66, 216], [82, 232], [91, 240], [100, 244], [109, 240], [118, 232], [134, 216], [150, 196], [163, 173], [171, 148], [176, 120], [178, 92],
  [42, 78], [54, 68], [68, 64], [82, 66], [92, 72], [108, 72], [118, 66], [132, 64], [146, 68], [158, 78],
  [100, 88], [100, 104], [100, 120], [100, 136],
  [84, 150], [92, 153], [100, 155], [108, 153], [116, 150],
  [56, 96], [64, 90], [74, 90], [82, 97], [74, 102], [64, 102],
  [118, 97], [126, 90], [136, 90], [144, 96], [136, 102], [126, 102],
  [74, 184], [82, 177], [92, 174], [100, 176], [108, 174], [118, 177], [126, 184], [118, 194], [108, 200], [100, 201], [92, 200], [82, 194],
  [80, 185], [92, 182], [100, 183], [108, 182], [120, 185], [108, 189], [100, 190], [92, 189],
];
const JIT = LM.map((_, index) => [Math.sin(index * 12.9898) * 1.7, Math.cos(index * 7.233) * 1.5]);
const LM_R = LM.map(([x, y], index) => [x + JIT[index][0], y + JIT[index][1]]);
const region = (index) => (index < 17 ? 'jaw' : index < 27 ? 'brow' : index < 36 ? 'nose' : index < 48 ? 'eye' : 'lip');
const S = 1.28, OXL = 232, OXR = 952, OY = 466;
const toL = ([x, y]) => [OXL + x * S, OY + y * S];
const toR = ([x, y]) => [OXR + x * S, OY + y * S];
const KEY_LINKS = [17, 21, 22, 26, 36, 39, 42, 45, 30, 31, 35, 48, 54, 57, 8];
const HEAD = `M22 92 C14 36 54 4 100 4 C146 4 186 36 178 92 ${LM.slice(0, 17).reverse().slice(1).map(([x, y]) => `L${x} ${y}`).join(' ')} Z`;
const EARS = 'M22 98 C8 98 8 124 24 128 M178 98 C192 98 192 124 176 128';
const CANDS = [
  { id: '0412', head: [100, 122, 72, 116], hair: 'short', idle: 31.6 },
  { id: '0287', head: [100, 126, 80, 120], hair: 'long', idle: 47.2 },
  { id: '0933', head: [100, 120, 68, 112], hair: 'bun', idle: 38.9 },
  { id: '0158', head: [100, 124, 78, 120], hair: 'short', idle: 71.3, match: true },
  { id: '0671', head: [100, 126, 84, 116], hair: 'cap', idle: 52.7 },
  { id: '0524', head: [100, 122, 70, 118], hair: 'bald', idle: 26.4 },
];
const MATCH = CANDS.findIndex((candidate) => candidate.match);
const HAIR = {
  short: (cx, cy, rx, ry) => `<path class="fs-hair" d="M${cx - rx + 4} ${cy - ry * 0.28} C${cx - rx - 6} ${cy - ry * 1.32} ${cx + rx + 6} ${cy - ry * 1.32} ${cx + rx - 4} ${cy - ry * 0.28} C${cx + rx - 14} ${cy - ry * 0.62} ${cx - rx + 14} ${cy - ry * 0.62} ${cx - rx + 4} ${cy - ry * 0.28}Z"/>`,
  long: (cx, cy, rx, ry) => `<path class="fs-hair" d="M${cx - rx} ${cy} C${cx - rx - 10} ${cy - ry * 1.34} ${cx + rx + 10} ${cy - ry * 1.34} ${cx + rx} ${cy} L${cx + rx + 8} ${cy + ry * 0.8} L${cx + rx - 10} ${cy + ry * 0.8} L${cx + rx - 8} ${cy - 6} C${cx + 24} ${cy - ry * 0.7} ${cx - 24} ${cy - ry * 0.7} ${cx - rx + 8} ${cy - 6} L${cx - rx + 10} ${cy + ry * 0.8} L${cx - rx - 8} ${cy + ry * 0.8}Z"/>`,
  bun: (cx, cy, rx, ry) => `${HAIR.short(cx, cy, rx, ry)}<circle class="fs-hair" cx="${cx}" cy="${cy - ry - 4}" r="18"/>`,
  cap: (cx, cy, rx, ry) => `<path class="fs-hair" d="M${cx - rx - 2} ${cy - ry * 0.4} C${cx - rx - 8} ${cy - ry * 1.4} ${cx + rx + 8} ${cy - ry * 1.4} ${cx + rx + 2} ${cy - ry * 0.4}Z"/><path class="fs-hair" d="M${cx - rx - 14} ${cy - ry * 0.4} H${cx + rx + 14}"/>`,
  bald: () => '',
};

function delaunay(points) {
  const n = points.length;
  const pts = points.map(([x, y], index) => [x + Math.sin(index * 3.17) * 0.01, y + Math.cos(index * 5.31) * 0.01]).concat([[-1000, -1000], [1500, -1000], [100, 2000]]);
  const circle = (a, b, c) => {
    const [ax, ay] = pts[a], [bx, by] = pts[b], [cx, cy] = pts[c];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return { a, b, c, ux, uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 };
  };
  let triangles = [circle(n, n + 1, n + 2)];
  for (let index = 0; index < n; index += 1) {
    const [px, py] = pts[index];
    const bad = triangles.filter((t) => (px - t.ux) ** 2 + (py - t.uy) ** 2 < t.r2);
    const edges = new Map();
    bad.forEach((t) => [[t.a, t.b], [t.b, t.c], [t.c, t.a]].forEach(([u, v]) => {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      edges.set(key, edges.has(key) ? null : [u, v]);
    }));
    triangles = triangles.filter((t) => !bad.includes(t));
    edges.forEach((edge) => { if (edge) triangles.push(circle(edge[0], edge[1], index)); });
  }
  return triangles.filter((t) => t.a < n && t.b < n && t.c < n);
}
function meshPath(points, triangles) {
  const seen = new Set();
  const parts = [];
  triangles.forEach((t) => [[t.a, t.b], [t.b, t.c], [t.c, t.a]].forEach(([u, v]) => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(`M${points[u][0]} ${points[u][1]}L${points[v][0]} ${points[v][1]}`);
  }));
  return parts.join('');
}

function markup() {
  const triangles = delaunay(LM);
  const meshL = meshPath(LM, triangles);
  const meshR = meshPath(LM_R, triangles);
  const slices = Array.from({ length: 22 }, (_, index) => `M0 ${14 + index * 11}H200`).join('');
  const dotsL = LM.map(([x, y], index) => `<circle class="fs-lm ${region(index)}" cx="${x}" cy="${y}" r="2.1" style="--i:${index}"/>`).join('');
  const dotsR = LM_R.map(([x, y], index) => `<circle class="fs-lm2 ${region(index)}" cx="${x}" cy="${y}" r="2" style="--i:${index}"/>`).join('');
  const irises = [[69, 96], [131, 96]].map(([x, y]) => `<g class="fs-iris"><circle cx="${x}" cy="${y}" r="5.2"/><circle class="pupil" cx="${x}" cy="${y}" r="1.9"/></g>`).join('');
  const cands = CANDS.map((c, index) => {
    const [cx, cy, rx, ry] = c.head;
    return `<g class="fs-cand${c.match ? ' is-match' : ''}" data-i="${index}"><path class="fs-body" d="M-10 272C10 256 50 250 100 250C150 250 190 256 210 272Z"/><rect class="fs-body" x="${cx - 17}" y="${cy + ry - 12}" width="34" height="${252 - (cy + ry - 12)}"/><ellipse class="fs-body" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>${HAIR[c.hair](cx, cy, rx, ry)}<g class="fs-feat"><circle cx="${cx - 25}" cy="${cy - 22}" r="3.4"/><circle cx="${cx + 25}" cy="${cy - 22}" r="3.4"/><path d="M${cx} ${cy - 14}V${cy + 14}M${cx - 16} ${cy + 44}Q${cx} ${cy + 54} ${cx + 16} ${cy + 44}"/></g></g>`;
  }).join('');
  const links = KEY_LINKS.map((index, order) => {
    const [x1, y1] = toL(LM[index]);
    const [x2, y2] = toR(LM_R[index]);
    return `<line class="fs-link" pathLength="1" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" style="--i:${order}"/>`;
  }).join('');
  const bars = Array.from({ length: 32 }, (_, index) => {
    const lo = 0.14 + 0.26 * Math.abs(Math.sin(index * 2.1));
    const hi = 0.5 + 0.5 * Math.abs(Math.cos(index * 1.3));
    return `<rect class="fs-bar" x="${(598 + index * 7.7).toFixed(1)}" y="540" width="5" height="110" rx="2" style="--lo:${lo.toFixed(2)};--hi:${hi.toFixed(2)};--d:${(index * 0.06).toFixed(2)}s"/>`;
  }).join('');
  const lane = (y) => `<line class="fs-laneline" x1="572" y1="${y}" x2="868" y2="${y}"/>${Array.from({ length: 5 }, (_, index) => `<circle class="fs-part" cx="572" cy="${y}" r="4" style="--d:${(index * 0.5).toFixed(1)}"/>`).join('')}`;
  const corners = (x, y, w, h) => `<path class="fs-ticks" d="M${x} ${y + 22}V${y}H${x + 22}M${x + w - 22} ${y}H${x + w}V${y + 22}M${x + w} ${y + h - 22}V${y + h}H${x + w - 22}M${x + 22} ${y + h}H${x}V${y + h - 22}"/>`;
  return `<svg class="fs-svg" viewBox="0 0 1440 1080" preserveAspectRatio="xMidYMid meet" data-phase="idle" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="fsBg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#0d2a36"/><stop offset=".65" stop-color="#091b24"/><stop offset="1" stop-color="#06111a"/></radialGradient>
    <pattern id="fsGrid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#7dd3fc" stroke-opacity=".05"/></pattern>
    <linearGradient id="fsScanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity="0"/><stop offset="1" stop-color="#38bdf8" stop-opacity=".34"/></linearGradient>
    <linearGradient id="fsHeadGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity=".18"/><stop offset="1" stop-color="#38bdf8" stop-opacity=".04"/></linearGradient>
    <linearGradient id="fsSimGrad" x1="0" x2="1"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#a5f3fc"/></linearGradient>
    <clipPath id="fsClipL"><rect x="152" y="464" width="416" height="346"/></clipPath>
    <clipPath id="fsClipR"><rect x="872" y="464" width="416" height="346"/></clipPath>
    <clipPath id="fsHeadClip"><path d="${HEAD}"/></clipPath>
  </defs>
  <rect width="1440" height="1080" fill="url(#fsBg)"/>
  <rect width="1440" height="1080" fill="url(#fsGrid)"/>

  <g class="fs-circuits">
    <path class="fs-c" data-n="client" d="M190 874V832"/>
    <path class="fs-c" data-n="api" d="M424 360V372H1000V392"/>
    <path class="fs-c" data-n="store" d="M1262 362V392"/>
    <path class="fs-c" data-n="vision embed" d="M1262 874V856H720V800"/>
    <path class="fs-c" data-n="vision detect" d="M720 856H400V832"/>
    <circle class="fs-port" cx="190" cy="832" r="5"/><circle class="fs-port" cx="1000" cy="392" r="5"/><circle class="fs-port" cx="1262" cy="392" r="5"/><circle class="fs-port" cx="720" cy="800" r="5"/><circle class="fs-port" cx="400" cy="832" r="5"/>
  </g>

  <g class="fs-labels">
    <text class="fs-lab" data-n="api" x="110" y="316">FASTAPI</text><text class="fs-sub" x="110" y="352">Real-time SSE sessions</text>
    <text class="fs-lab end" data-n="store" x="1330" y="316">POSTGRES + SUPABASE</text><text class="fs-sub end" x="1330" y="352">Uploaded image store</text>
    <text class="fs-lab" data-n="client" x="110" y="900">HTMX + OAUTH</text><text class="fs-sub" x="110" y="936">Jinja web client</text>
    <text class="fs-lab end" data-n="vision detect embed" x="1330" y="900">OPENCV + TENSORFLOW</text><text class="fs-sub end" x="1330" y="936">Face matching core</text>
  </g>

  <g class="fs-radar" data-n="api" transform="translate(424 330)">
    <circle class="fs-wave" r="12"/><circle class="fs-wave w2" r="12"/><circle class="fs-wave w3" r="12"/>
    <path class="fs-radar-arc" d="M-11 -11A16 16 0 0 1 11 -11M-18 -18A25 25 0 0 1 18 -18"/><circle class="fs-radar-dot" r="4"/>
    <text class="fs-radar-label" x="34" y="7">SSE Match Broadcast</text>
  </g>

  <g class="fs-box l">
    <rect class="fs-frame l" x="150" y="392" width="420" height="440" rx="16"/>${corners(150, 392, 420, 440)}
    <text class="fs-hdr" x="172" y="424">QUERY IMAGE // OPENCV</text><circle class="fs-dot" cx="178" cy="446" r="4.5"/><text class="fs-chip fs-chip-l" x="192" y="452">SCANNING</text>
    <g clip-path="url(#fsClipL)">
      <g class="fs-face" transform="translate(${OXL} ${OY}) scale(${S})">
        <path class="fs-head" d="${HEAD}"/><path class="fs-slice" d="${slices}" clip-path="url(#fsHeadClip)"/>
        <path class="fs-ear" d="${EARS}"/><path class="fs-ear" d="M76 234L72 262M124 234L128 262M72 262Q100 272 128 262"/>
        <path class="fs-ear" d="M44 62C60 30 140 30 156 62"/>
        <path class="fs-mesh" d="${meshL}"/>${irises}${dotsL}
        <g class="fs-bbox-wrap"><rect class="fs-bbox-rect" x="10" y="10" width="180" height="246"/><path class="fs-bbox" d="M10 40V10H40M160 10H190V40M190 226V256H160M40 256H10V226"/></g>
        <circle class="fs-ring" cx="100" cy="130" r="132"/>
      </g>
    </g>
    <g clip-path="url(#fsClipL)"><g class="fs-scan"><rect x="152" y="404" width="416" height="60" fill="url(#fsScanGrad)"/><rect class="fs-scanline" x="152" y="463" width="416" height="2.5"/></g></g>
    <text class="fs-facelabel" x="360" y="824">[ FACE DETECTED: 0.99 ]</text>
  </g>

  <g class="fs-bridge">
    <rect class="fs-panel" x="584" y="392" width="272" height="440" rx="14"/>
    <text class="fs-hdr mid" x="720" y="426">128-D EMBEDDING VECTOR</text>
    ${lane(490)}${lane(780)}
    <g class="fs-bars">${bars}</g>
    <text class="fs-sim-text" x="720" y="692">Cosine Similarity: 31.6%</text>
    <rect class="fs-sim-track" x="602" y="706" width="236" height="12" rx="6"/><rect class="fs-sim-fill" x="602" y="706" width="236" height="12" rx="6" fill="url(#fsSimGrad)" style="transform:scaleX(.316)"/>
    <text class="fs-badge" x="720" y="752">MATCH LOCKED</text>
  </g>

  <g class="fs-box r">
    <rect class="fs-frame r" x="870" y="392" width="420" height="440" rx="16"/>${corners(870, 392, 420, 440)}
    <text class="fs-hdr" x="892" y="424">POSTGRES + SUPABASE STORE</text><circle class="fs-dot" cx="898" cy="446" r="4.5"/><text class="fs-chip fs-chip-r" x="912" y="452">SCANNING</text>
    <g clip-path="url(#fsClipR)">
      <g transform="translate(${OXR} ${OY}) scale(${S})">${cands}
        <g class="fs-matchface"><path class="fs-head fs-head2" d="${HEAD}"/><path class="fs-mesh" d="${meshR}"/>${dotsR}</g>
      </g>
    </g>
    <text class="fs-cap fs-facelabel" x="1080" y="824">PROFILE ID-0412 / 31.6%</text>
  </g>

  <g class="fs-links">${links}</g>
  <text class="fs-top" x="110" y="170">FACE MATCH PIPELINE // BIOMETRIC SCAN</text>
  <circle class="fs-dot" cx="1180" cy="162" r="6"/><text class="fs-top end" x="1330" y="170">LIVE FEED</text>
  <g class="fs-steps">
    <line class="fs-steps-line" x1="170" y1="1010" x2="1270" y2="1010"/>
    ${['UPLOAD', 'DETECT', 'EMBED', 'STREAM'].map((label, index) => `<g class="fs-step" transform="translate(${(170 + index * 366.7).toFixed(1)} 1010)"><circle r="10"/><text y="-30">0${index + 1} ${label}</text></g>`).join('')}
  </g>
</svg>`;
}

if (article && mount) initScanner(article, mount);

function initScanner(root, host) {
  host.innerHTML = markup();
  const svg = host.querySelector('.fs-svg');
  const q = (selector) => svg.querySelector(selector);
  const cands = [...svg.querySelectorAll('.fs-cand')];
  const caption = q('.fs-cap');
  const simText = q('.fs-sim-text');
  const simFill = q('.fs-sim-fill');
  const chipL = q('.fs-chip-l');
  const chipR = q('.fs-chip-r');
  const timers = [];
  const steps = [...svg.querySelectorAll('.fs-step')];
  let cycle = 0, active = 0, hold = 0, tween = 0, lastStage = null, locked = false;
  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const clearTimers = () => { timers.splice(0).forEach(clearTimeout); clearTimeout(hold); cancelAnimationFrame(tween); };

  function setSim(value) {
    simText.textContent = `Cosine Similarity: ${value.toFixed(1)}%`;
    simFill.style.transform = `scaleX(${(value / 100).toFixed(3)})`;
  }
  function show(index, score) {
    active = index;
    cands.forEach((candidate, order) => candidate.classList.toggle('is-on', order === index));
    caption.textContent = `PROFILE ID-${CANDS[index].id} / ${score.toFixed(1)}%`;
    setSim(score);
  }
  function startCycle(ms, rapid) {
    clearInterval(cycle);
    if (reduced.matches) return;
    cycle = setInterval(() => {
      const next = (active + 1) % CANDS.length;
      show(next, rapid ? 18 + Math.random() * 54 : CANDS[next].idle);
    }, ms);
  }
  function tweenSim(from, to, ms) {
    if (reduced.matches) { setSim(to); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      setSim(from + (to - from) * (1 - (1 - t) ** 3));
      if (t < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  }
  function setPhase(phase, left, right) {
    svg.dataset.phase = phase;
    if (left) chipL.textContent = left;
    if (right) chipR.textContent = right;
  }
  function setStep(current) {
    steps.forEach((step, index) => {
      step.classList.toggle('is-done', index < current);
      step.classList.toggle('is-cur', index === current);
    });
  }
  function lock() {
    clearInterval(cycle);
    locked = true;
    show(MATCH, 98.4);
    svg.classList.add('is-locked');
    chipR.textContent = 'MATCH 98.4%';
  }
  function idle() {
    clearTimers();
    clearInterval(cycle);
    locked = false;
    svg.classList.remove('is-locked', 'is-broadcast');
    setPhase('idle', 'SCANNING', 'SCANNING');
    setStep(-1);
    show(0, CANDS[0].idle);
    startCycle(1500, false);
  }
  function onStage(stage) {
    clearTimers();
    setStep(stage);
    if (stage === 0) {
      locked = false;
      svg.classList.remove('is-locked', 'is-broadcast');
      setPhase('upload', 'UPLOAD RECEIVED', 'STANDBY');
      clearInterval(cycle);
      show(0, CANDS[0].idle);
      setSim(0);
    } else if (stage === 1) {
      setPhase('detect', 'LANDMARKS x68', 'STANDBY');
    } else if (stage === 2) {
      setPhase('match', 'EMBEDDING 128-D', 'COMPARING');
      startCycle(85, true);
      later(lock, 1100);
    } else if (stage === 3) {
      if (!locked) lock();
      setPhase('broadcast', null, 'MATCH SENT');
      svg.classList.add('is-broadcast');
    }
  }
  function onDone() {
    if (!locked) { idle(); return; }
    hold = setTimeout(idle, 3600);
  }
  function applyNodes(nodes) {
    const set = new Set(nodes);
    ['client', 'api', 'detect', 'embed', 'store', 'vision'].forEach((id) => svg.classList.toggle(`hot-${id}`, set.has(id)));
    svg.querySelectorAll('[data-n]').forEach((element) => {
      element.classList.toggle('is-hot', element.dataset.n.split(' ').some((id) => set.has(id)));
    });
  }

  root.addEventListener('bp:state', (event) => {
    const { nodes, stage } = event.detail;
    applyNodes(nodes);
    if (stage === lastStage) return;
    const previous = lastStage;
    lastStage = stage;
    if (stage === null) { if (previous !== null) onDone(); } else onStage(stage);
  });
  idle();
}
