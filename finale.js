const section = document.querySelector('#contact');
const mount = section?.querySelector('[data-finale-art]');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const TAU = Math.PI * 2;

const W = 560, H = 472, CX = 280, ORBIT_Y = 205, ORBIT_RX = 214, PAD = { x: 280, y: 380 };
const NODES = [
  { id: 'email', icon: '@', label: 'EMAIL', href: 'mailto:Rajhari2305@gmail.com', aria: 'Email Rajhari2305@gmail.com' },
  { id: 'linkedin', icon: 'in', label: 'LINKEDIN', href: 'https://www.linkedin.com/in/raj-dubey-57721b205/', aria: 'LinkedIn profile', external: true },
  { id: 'github', icon: '&lt;/&gt;', label: 'GITHUB', href: 'https://github.com/Captaincool23/', aria: 'GitHub profile', external: true },
];
const TOPICS = {
  role: { subject: 'Full-Time AI / Backend Role: hello from your portfolio', body: "Hi Raj,\n\nI came across your portfolio and would like to talk about a full-time AI / backend role.\n\n" },
  architecture: { subject: 'Architecture & Cloud Discussion: hello from your portfolio', body: "Hi Raj,\n\nI saw your portfolio and would like to talk architecture and cloud.\n\n" },
  hello: { subject: 'Just saying hello from your portfolio', body: "Hi Raj,\n\nI was browsing your portfolio and wanted to say hello.\n\n" },
};
const MAIL = 'Rajhari2305@gmail.com';

const dust = Array.from({ length: 20 }, (_, index) => {
  const x = 18 + ((index * 97) % 524), y = 12 + ((index * 59) % 176);
  return `<circle class="fn-dust" cx="${x}" cy="${y}" r="${(1 + (index % 3) * 0.5).toFixed(1)}" style="--d:${(index * 0.37).toFixed(2)}s"/>`;
}).join('');
const padLights = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * TAU;
  return `<circle class="fn-padlight" cx="${(PAD.x + Math.cos(angle) * 222).toFixed(1)}" cy="${(PAD.y + Math.sin(angle) * 56).toFixed(1)}" r="3" style="--d:${(index * 0.12).toFixed(2)}s"/>`;
}).join('');
const nodeMarkup = NODES.map((node) => `<a class="fn-node" data-node="${node.id}" href="${node.href}"${node.external ? ' target="_blank" rel="noopener"' : ''} aria-label="${node.aria}"><g class="fn-node-lean"><g class="fn-node-pop"><circle class="fn-node-halo" r="35"/><circle class="fn-node-body" r="25"/><text class="fn-node-icon" y="6.5">${node.icon}</text></g><text class="fn-node-tag" y="-42">${node.label}</text></g></a>`).join('');

function artMarkup() {
  return `<svg class="fn-svg" viewBox="0 0 ${W} ${H}" focusable="false" aria-hidden="false">
  <defs>
    <linearGradient id="fnPadTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3ede8"/><stop offset="1" stop-color="#b0c4ba"/></linearGradient>
    <linearGradient id="fnHullTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb0a3"/><stop offset="1" stop-color="#58786b"/></linearGradient>
    <linearGradient id="fnHullLow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46665a"/><stop offset="1" stop-color="#27403a"/></linearGradient>
    <linearGradient id="fnGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecfdf5"/><stop offset=".5" stop-color="#34d399"/><stop offset="1" stop-color="#047857"/></linearGradient>
    <linearGradient id="fnPylonL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f7f4"/><stop offset="1" stop-color="#b3c7bd"/></linearGradient>
    <linearGradient id="fnPylonR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9bb2a7"/><stop offset="1" stop-color="#6d887c"/></linearGradient>
    <linearGradient id="fnBotBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f5247"/><stop offset="1" stop-color="#0d1d18"/></linearGradient>
    <linearGradient id="fnBotHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a5f55"/><stop offset="1" stop-color="#0f211c"/></linearGradient>
    <radialGradient id="fnGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6ee7b7" stop-opacity=".85"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="fn-dusts">${dust}</g>
  <g class="fn-pad">
    <ellipse cx="${PAD.x}" cy="${PAD.y + 13}" rx="252" ry="64" fill="#7a9387"/>
    <ellipse cx="${PAD.x}" cy="${PAD.y}" rx="252" ry="64" fill="url(#fnPadTop)" stroke="#5d776c" stroke-width="1.5"/>
    <ellipse class="fn-pad-ring a" cx="${PAD.x}" cy="${PAD.y}" rx="222" ry="56" fill="none" stroke="#10b981" stroke-width="2.6"/>
    <ellipse cx="${PAD.x}" cy="${PAD.y}" rx="190" ry="48" fill="#9fb6ab" stroke="#6b877b" stroke-width="1.2"/>
    <ellipse class="fn-pad-ring b" cx="${PAD.x}" cy="${PAD.y}" rx="150" ry="38" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3 7"/>
    <ellipse cx="${PAD.x}" cy="${PAD.y}" rx="104" ry="26" fill="#2f4d43" stroke="#1d332b" stroke-width="1.2"/>
    <ellipse class="fn-pad-ring c" cx="${PAD.x}" cy="${PAD.y}" rx="66" ry="16" fill="none" stroke="#6ee7b7" stroke-width="2.2"/>
    <ellipse class="fn-pad-glow" cx="${PAD.x}" cy="${PAD.y}" rx="70" ry="18" fill="url(#fnGlow)"/>
    <ellipse class="fn-pad-core" id="fnPadCore" cx="${PAD.x}" cy="${PAD.y}" rx="26" ry="6.5" fill="#a7f3d0"/>
    ${padLights}
  </g>
  <g class="fn-orbit-back"><path class="fn-arc back" fill="none"/></g>
  <g class="fn-monument">
    <ellipse cx="280" cy="358" rx="38" ry="10" fill="#6d887c"/>
    <ellipse cx="280" cy="354" rx="34" ry="9" fill="#b8cbc1" stroke="#5d776c"/>
    <path d="M265 354 L280 356 L280 128 L274 130 Z" fill="url(#fnPylonL)"/>
    <path d="M280 356 L295 354 L286 130 L280 128 Z" fill="url(#fnPylonR)"/>
    <path class="fn-strip" d="M280 346 V150" fill="none" stroke="#10b981" stroke-width="1.8" stroke-dasharray="6 9"/>
    <ellipse class="fn-halo" cx="280" cy="300" rx="30" ry="7" fill="none" stroke="#10b981" stroke-width="1.6"/>
    <ellipse class="fn-halo" cx="280" cy="240" rx="24" ry="6" fill="none" stroke="#10b981" stroke-width="1.6" style="--d:.4s"/>
    <ellipse class="fn-halo" cx="280" cy="186" rx="18" ry="4.5" fill="none" stroke="#10b981" stroke-width="1.6" style="--d:.8s"/>
    <line x1="280" y1="128" x2="280" y2="104" stroke="#5d776c" stroke-width="2.4" stroke-linecap="round"/>
    <circle class="fn-wave" cx="280" cy="112" r="16" fill="none" stroke="#10b981" stroke-width="1.6"/>
    <circle class="fn-wave w2" cx="280" cy="112" r="16" fill="none" stroke="#10b981" stroke-width="1.6"/>
    <circle cx="280" cy="112" r="20" fill="url(#fnGlow)"/>
    <circle class="fn-beacon" cx="280" cy="112" r="6.5" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
  </g>
  <g class="fn-ship" transform="translate(168 344) scale(.82)">
    <ellipse cx="0" cy="40" rx="120" ry="10" fill="#14231b" opacity=".22"/>
    <path d="M-4 -12 L-74 -46 L-48 -48 L22 -24 Z" fill="#a9c3b8"/>
    <path d="M-92 -12 L-112 -50 L-60 -20 Z" fill="#6f8f82"/>
    <path d="M-112 -50 L-60 -20" stroke="#34d399" stroke-width="2" fill="none"/>
    <path d="M-118 -10 L-92 -14 L-92 12 L-118 8 Z" fill="#3b5a50"/>
    <ellipse class="fn-engine-glow" cx="-126" cy="-1" rx="20" ry="15" fill="url(#fnGlow)"/>
    <ellipse class="fn-engine" cx="-119" cy="-1" rx="5" ry="9" fill="#6ee7b7"/>
    <path d="M-52 16 L-58 38 M42 12 L46 36 M-10 18 L-12 38" stroke="#3b5148" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse cx="-58" cy="39" rx="9" ry="3.2" fill="#2b4239"/><ellipse cx="46" cy="37" rx="9" ry="3.2" fill="#2b4239"/><ellipse cx="-12" cy="39" rx="8" ry="3" fill="#2b4239"/>
    <path d="M-104 2 L34 6 L114 -3 L44 16 L-76 20 Z" fill="url(#fnHullLow)"/>
    <path d="M-104 2 L-82 -20 L22 -28 L114 -3 L34 6 Z" fill="url(#fnHullTop)"/>
    <path d="M-84 -6 L24 -10 L98 -4" stroke="#34d399" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-16 4 L-92 30 L-66 34 L30 10 Z" fill="#4e7064"/>
    <path d="M-92 30 L-66 34" stroke="#34d399" stroke-width="2.2"/>
    <path d="M30 -26 Q66 -34 92 -10 L46 -6 Z" fill="url(#fnGlass)"/>
    <path d="M42 -24 Q62 -28 78 -17" stroke="#fff" stroke-opacity=".75" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle class="fn-nose" cx="112" cy="-3" r="2.8" fill="#d1fae5"/>
  </g>
  <g class="fn-bot" transform="translate(404 394) scale(.58)">
    <ellipse cx="0" cy="3" rx="28" ry="6" fill="#14231b" opacity=".24"/>
    <ellipse cx="-11" cy="-3" rx="9.5" ry="4.5" fill="#1b342d" stroke="#34d399" stroke-opacity=".6"/><ellipse cx="11" cy="-3" rx="9.5" ry="4.5" fill="#1b342d" stroke="#34d399" stroke-opacity=".6"/>
    <g class="fn-bot-bob">
      <rect x="-19" y="-46" width="38" height="40" rx="17" fill="url(#fnBotBody)" stroke="#34d399" stroke-opacity=".55" stroke-width="1.5"/>
      <circle cx="0" cy="-27" r="7" fill="#04120d" stroke="#34d399" stroke-opacity=".7"/><circle class="fn-chest" cx="0" cy="-27" r="3.2" fill="#6ee7b7"/>
      <ellipse cx="-27" cy="-26" rx="7.5" ry="9.5" fill="url(#fnBotBody)" stroke="#34d399" stroke-opacity=".6" stroke-width="1.3"/>
      <g class="fn-wave-hand"><ellipse cx="28" cy="-34" rx="7.5" ry="9.5" fill="url(#fnBotBody)" stroke="#34d399" stroke-opacity=".6" stroke-width="1.3"/></g>
      <g class="fn-bot-head">
        <line x1="0" y1="-94" x2="0" y2="-106" stroke="#6ee7b7" stroke-width="2.6" stroke-linecap="round"/>
        <circle class="fn-bot-tip" cx="0" cy="-109" r="4.4" fill="#6ee7b7"/>
        <rect x="-33" y="-95" width="66" height="50" rx="24" fill="url(#fnBotHead)" stroke="#6ee7b7" stroke-opacity=".6" stroke-width="1.6"/>
        <rect x="-26" y="-88" width="52" height="36" rx="17" fill="#06160f" stroke="#34d399" stroke-opacity=".5"/>
        <rect class="fn-eye" x="-16" y="-79" width="9" height="15" rx="4.5" fill="#6ee7b7"/><rect class="fn-eye" x="7" y="-79" width="9" height="15" rx="4.5" fill="#6ee7b7"/>
        <path d="M-6 -58 Q0 -53 6 -58" stroke="#6ee7b7" fill="none" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="-20" cy="-59" rx="4" ry="2" fill="#6ee7b7" opacity=".45"/><ellipse cx="20" cy="-59" rx="4" ry="2" fill="#6ee7b7" opacity=".45"/>
      </g>
    </g>
  </g>
  <g class="fn-orbit-front"><path class="fn-arc front" fill="none"/></g>
  <g class="fn-nodes">${nodeMarkup}</g>
</svg>`;
}

if (section && mount) initFinale();

function initFinale() {
  mount.innerHTML = artMarkup();
  const svg = mount.querySelector('.fn-svg');
  const stage = section.querySelector('#finale-stage');
  const gBack = svg.querySelector('.fn-orbit-back'), gFront = svg.querySelector('.fn-orbit-front');
  const arcBack = svg.querySelector('.fn-arc.back'), arcFront = svg.querySelector('.fn-arc.front');
  const nodeLayer = svg.querySelector('.fn-nodes');
  const orbiters = NODES.map((node, index) => {
    const el = svg.querySelector(`[data-node="${node.id}"]`);
    return { el, lean: el.querySelector('.fn-node-lean'), icon: el.querySelector('.fn-node-icon'), index, front: null };
  });
  const toast = Object.assign(document.createElement('div'), { className: 'finale-toast' });
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  const status = Object.assign(document.createElement('span'), { className: 'finale-sr' });
  status.setAttribute('role', 'status');
  document.body.append(toast, status);

  // Orbiting satellites: tilt toward the cursor and speed up while the stage is hovered.
  const pointer = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  let angle = 0.7, speed = 1, speedTarget = 1, hoverNode = false, visible = false, last = performance.now();
  function layout() {
    const rx = ORBIT_RX, ry = rx * (0.28 + 0.07 * tilt.y), phi = tilt.x * 0.26, cy = ORBIT_Y + tilt.y * 12;
    const rotate = `rotate(${((phi * 180) / Math.PI).toFixed(2)} ${CX} ${cy.toFixed(1)})`;
    arcBack.setAttribute('d', `M${CX - rx} ${cy.toFixed(1)}A${rx} ${ry.toFixed(1)} 0 0 1 ${CX + rx} ${cy.toFixed(1)}`);
    arcFront.setAttribute('d', `M${CX - rx} ${cy.toFixed(1)}A${rx} ${ry.toFixed(1)} 0 0 0 ${CX + rx} ${cy.toFixed(1)}`);
    arcBack.setAttribute('transform', rotate);
    arcFront.setAttribute('transform', rotate);
    const cos = Math.cos(phi), sin = Math.sin(phi);
    orbiters.forEach((orbiter) => {
      const theta = angle + (orbiter.index * TAU) / NODES.length;
      const ox = rx * Math.cos(theta), oy = ry * Math.sin(theta), depth = Math.sin(theta);
      const x = CX + ox * cos - oy * sin, y = cy + ox * sin + oy * cos;
      orbiter.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.86 + 0.2 * depth).toFixed(3)})`);
      orbiter.el.style.opacity = (0.78 + 0.22 * (depth * 0.5 + 0.5)).toFixed(2);
      orbiter.lean.setAttribute('transform', `rotate(${((pointer.x - (x / W) * 2 + 1) * 9).toFixed(1)})`);
      orbiter.icon.setAttribute('transform', `translate(${(pointer.x * 2.4).toFixed(1)} ${(pointer.y * 2.4).toFixed(1)})`);
      const front = depth >= 0;
      if (front !== orbiter.front && document.activeElement !== orbiter.el) {
        orbiter.front = front;
        (front ? nodeLayer : gBack).append(orbiter.el);
      }
    });
  }
  function tick(now) {
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible && !document.hidden && !reduced.matches) {
      speed += (speedTarget * (hoverNode ? 0.3 : 1) - speed) * (1 - Math.exp(-delta * 4));
      angle += delta * 0.42 * speed;
      const ease = 1 - Math.exp(-delta * 6);
      tilt.x += (pointer.x - tilt.x) * ease;
      tilt.y += (pointer.y - tilt.y) * ease;
      layout();
    }
    requestAnimationFrame(tick);
  }
  layout();
  requestAnimationFrame(tick);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; svg.classList.toggle('is-live', visible); }, { rootMargin: '80px' }).observe(stage);
  section.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const box = stage.getBoundingClientRect();
    pointer.x = clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1);
    pointer.y = clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1, 1);
    if (reduced.matches) layout();
  });
  section.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  mount.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') speedTarget = 2.8; });
  mount.addEventListener('pointerleave', () => { speedTarget = 1; });
  orbiters.forEach(({ el }) => {
    el.addEventListener('pointerenter', () => { hoverNode = true; });
    el.addEventListener('pointerleave', () => { hoverNode = false; });
  });

  function showToast(message, duration = 2600) {
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-on'), duration);
  }

  // Quick signal transmitter.
  const pills = [...section.querySelectorAll('.tx-pill')];
  const send = section.querySelector('#tx-send');
  const hint = section.querySelector('#tx-hint');
  const beacon = document.querySelector('#hz-beacon');
  const horizon = beacon?.closest('.dossier-horizon');
  let topic = null, sending = false;
  pills.forEach((pill) => pill.addEventListener('click', () => {
    topic = pill.getAttribute('aria-pressed') === 'true' ? null : pill.dataset.topic;
    pills.forEach((other) => other.setAttribute('aria-pressed', String(other.dataset.topic === topic)));
    send.setAttribute('aria-disabled', String(!topic));
    send.classList.toggle('is-armed', Boolean(topic));
    hint.classList.remove('is-warn');
    hint.textContent = topic ? 'Transmitter armed. Ready when you are.' : 'Select a topic to arm the transmitter.';
  }));

  const laser = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  laser.setAttribute('class', 'finale-laser');
  laser.setAttribute('aria-hidden', 'true');
  laser.innerHTML = '<path class="fl-glow" fill="none"/><path class="fl-core" fill="none"/><circle class="fl-head" r="6"/>';
  document.body.append(laser);
  const [laserGlow, laserCore, laserHead] = laser.children;
  const centerOf = (element) => { const box = element.getBoundingClientRect(); return { x: box.left + box.width / 2, y: box.top + box.height / 2 }; };
  function fireLaser() {
    const padCore = svg.querySelector('#fnPadCore');
    if (!padCore || !beacon) return;
    svg.classList.add('is-firing');
    setTimeout(() => svg.classList.remove('is-firing'), 1500);
    const travel = reduced.matches ? 0.01 : 0.85, fade = 0.45, begin = performance.now();
    let arrived = false;
    laser.classList.add('is-on');
    const finish = () => { laser.classList.remove('is-on'); laserGlow.removeAttribute('d'); laserCore.removeAttribute('d'); };
    function step(now) {
      const t = (now - begin) / 1000;
      const a = centerOf(padCore), b = centerOf(beacon);
      const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const bow = 0.12 * length;
      const control = { x: (a.x + b.x) / 2 + ((b.y - a.y) / length) * bow, y: (a.y + b.y) / 2 - ((b.x - a.x) / length) * bow };
      const at = (u) => ({ x: (1 - u) ** 2 * a.x + 2 * (1 - u) * u * control.x + u ** 2 * b.x, y: (1 - u) ** 2 * a.y + 2 * (1 - u) * u * control.y + u ** 2 * b.y });
      const p = clamp(t / travel);
      const headU = p ** 1.6, q = clamp((t - travel) / fade);
      const tailU = p < 1 ? Math.max(0, headU - 0.3) : 0.7 + 0.3 * q;
      const points = Array.from({ length: 16 }, (_, index) => at(tailU + ((headU - tailU) * index) / 15));
      const d = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join('');
      laserGlow.setAttribute('d', d);
      laserCore.setAttribute('d', d);
      const tip = at(headU);
      laserHead.setAttribute('cx', tip.x.toFixed(1));
      laserHead.setAttribute('cy', tip.y.toFixed(1));
      laserHead.style.opacity = String(1 - q);
      if (p >= 1 && !arrived) {
        arrived = true;
        horizon?.classList.remove('is-hit');
        void horizon?.offsetWidth;
        horizon?.classList.add('is-hit');
        setTimeout(() => horizon?.classList.remove('is-hit'), 1300);
      }
      if (q < 1) requestAnimationFrame(step); else finish();
    }
    requestAnimationFrame(step);
  }
  send.addEventListener('click', () => {
    if (!topic) {
      hint.textContent = 'Pick a topic first to arm the transmitter.';
      hint.classList.add('is-warn');
      send.classList.remove('is-shake');
      void send.offsetWidth;
      send.classList.add('is-shake');
      return;
    }
    if (sending) return;
    sending = true;
    const { subject, body } = TOPICS[topic];
    const url = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    send.classList.add('is-sending');
    send.textContent = 'Transmitting…';
    fireLaser();
    showToast('Signal Locked! Opening Comms...');
    setTimeout(() => {
      Object.assign(document.createElement('a'), { href: url }).click();
      send.classList.remove('is-sending');
      send.textContent = 'Send Transmission ↗';
      sending = false;
    }, reduced.matches ? 700 : 1500);
  });

  // One-click copy with a star burst.
  const sparkColors = ['#34d399', '#6ee7b7', '#10b981', '#a7f3d0'];
  function starBurst(element) {
    if (reduced.matches) return;
    const box = element.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    for (let index = 0; index < 14; index += 1) {
      const spark = Object.assign(document.createElement('span'), { className: 'fn-spark', textContent: index % 3 ? '✦' : '✧' });
      spark.style.cssText = `left:${cx}px;top:${cy}px;color:${sparkColors[index % sparkColors.length]};font-size:${(9 + Math.random() * 9).toFixed(0)}px`;
      document.body.append(spark);
      const direction = (index / 14) * TAU + Math.random() * 0.5, distance = 34 + Math.random() * 40;
      spark.animate([
        { transform: 'translate(-50%, -50%) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${(Math.cos(direction) * distance).toFixed(1)}px), calc(-50% + ${(Math.sin(direction) * distance).toFixed(1)}px)) scale(1) rotate(${((Math.random() - 0.5) * 180).toFixed(0)}deg)`, opacity: 0 },
      ], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => spark.remove();
    }
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back below */ }
    const field = Object.assign(document.createElement('textarea'), { value: text });
    field.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.append(field);
    field.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    field.remove();
    return ok;
  }
  section.querySelectorAll('.copy-btn').forEach((button) => button.addEventListener('click', async () => {
    const ok = await copyText(button.dataset.copy);
    clearTimeout(button.timer);
    button.textContent = ok ? '✓ Copied!' : 'Copy failed';
    button.classList.toggle('is-done', ok);
    if (ok) { starBurst(button); status.textContent = `${button.dataset.copy} copied to clipboard`; }
    button.timer = setTimeout(() => { button.textContent = button.dataset.label; button.classList.remove('is-done'); }, 1800);
  }));

  // Magnetic footer pills.
  const magnets = [...section.querySelectorAll('.mag-pill')].map((element) => ({ element, x: 0, y: 0 }));
  const footer = section.querySelector('.final-footer');
  if (magnets.length && window.matchMedia('(pointer: fine)').matches) {
    footer.addEventListener('pointermove', (event) => {
      if (reduced.matches) return;
      magnets.forEach((magnet) => {
        const box = magnet.element.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2 - magnet.x), dy = event.clientY - (box.top + box.height / 2 - magnet.y);
        const pull = clamp(1 - Math.hypot(dx, dy) / 110) * 0.4;
        magnet.x = dx * pull;
        magnet.y = dy * pull;
        magnet.element.style.transform = pull > 0 ? `translate(${magnet.x.toFixed(1)}px, ${magnet.y.toFixed(1)}px)` : '';
      });
    });
    footer.addEventListener('pointerleave', () => magnets.forEach((magnet) => { magnet.x = magnet.y = 0; magnet.element.style.transform = ''; }));
  }

  // Back to portfolio: fast eased scroll with an ascending thruster trail.
  const thrust = document.createElement('div');
  thrust.className = 'finale-thrust';
  thrust.setAttribute('aria-hidden', 'true');
  thrust.innerHTML = `<i class="thrust-comet"></i>${Array.from({ length: 12 }, (_, index) => `<i class="thrust-streak" style="left:${(6 + index * 8 + (index % 3) * 2).toFixed(0)}%;animation-delay:${(-index * 0.17).toFixed(2)}s;height:${90 + (index % 4) * 40}px"></i>`).join('')}`;
  document.body.append(thrust);
  const comet = thrust.querySelector('.thrust-comet');
  let ascent = 0;
  const stopAscent = () => {
    cancelAnimationFrame(ascent);
    ascent = 0;
    document.documentElement.classList.remove('is-ascending');
    ['wheel', 'touchstart', 'keydown'].forEach((name) => window.removeEventListener(name, stopAscent));
  };
  section.querySelector('.back-top')?.addEventListener('click', (event) => {
    const target = document.querySelector('#portfolio');
    if (!target) return;
    event.preventDefault();
    stopAscent();
    const from = window.scrollY, to = Math.max(0, target.getBoundingClientRect().top + from), distance = Math.abs(from - to);
    if (distance < 4) return;
    if (reduced.matches) { window.scrollTo({ top: to, behavior: 'instant' }); return; }
    const duration = clamp(0.9 + distance / 5200, 1.1, 2.3) * 1000;
    const origin = centerOf(event.currentTarget);
    comet.style.left = `${origin.x - 3}px`;
    document.documentElement.classList.add('is-ascending');
    ['wheel', 'touchstart', 'keydown'].forEach((name) => window.addEventListener(name, stopAscent, { passive: true }));
    const begin = performance.now();
    function step(now) {
      const t = clamp((now - begin) / duration);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      window.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
      const rise = 1 - (1 - clamp(t / 0.85)) ** 2.4;
      const tail = 80 + 360 * Math.sin(Math.PI * t);
      comet.style.height = `${tail.toFixed(0)}px`;
      comet.style.transform = `translateY(${(origin.y - (origin.y + 60) * rise).toFixed(1)}px)`;
      comet.style.opacity = String(1 - clamp((t - 0.82) / 0.18));
      if (t < 1) ascent = requestAnimationFrame(step); else setTimeout(stopAscent, 260);
    }
    ascent = requestAnimationFrame(step);
  });
}
