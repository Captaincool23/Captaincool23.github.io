const card = document.querySelector('.flow-card');
if (card) initFlow(card);

function initFlow(root) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const diagram = root.querySelector('.flow-diagram');
  const layer = root.querySelector('.flow-packets');
  const toggle = root.querySelector('.flow-toggle');
  const run = root.querySelector('.flow-run');
  const ORDER = ['ui', 'store', 'http', 'api'];
  const nodes = Object.fromEntries(ORDER.map((id) => [id, root.querySelector(`[data-node="${id}"]`)]));
  const metrics = Object.fromEntries(['vdom', 'state', 'api'].map((id) => [id, root.querySelector(`[data-metric="${id}"] b`)]));
  const LABELS = {
    vue: { ui: ['Vue Component', 'SFC \u00b7 props \u00b7 slots'], store: ['Vuex Store', 'actions \u00b7 mutations \u00b7 getters'] },
    react: { ui: ['React Component', 'function \u00b7 props \u00b7 hooks'], store: ['Hooks Store', 'useReducer \u00b7 useContext'] },
  };
  const DIFFS = { vue: [1.8, 1.6, 2.0, 1.7], react: [2.1, 1.9, 2.3, 2.0] };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const announce = document.createElement('span');
  announce.className = 'sr-only';
  announce.setAttribute('role', 'status');
  root.append(announce);

  let mode = 'vue', running = false, runs = 0;

  const packets = [0, 1, 2].map((index) => {
    const element = document.createElement('span');
    element.className = index ? 'flow-packet is-trail' : 'flow-packet';
    layer.append(element);
    return element;
  });

  function setMetric(key, text, tone = '') {
    const value = metrics[key];
    value.textContent = text;
    value.dataset.tone = tone;
    const box = value.parentElement;
    box.classList.remove('is-pop');
    void box.offsetWidth;
    box.classList.add('is-pop');
  }
  function resetMetrics() {
    setMetric('vdom', '-- ms');
    setMetric('state', 'Idle');
    setMetric('api', 'Standby');
  }
  function hit(id) {
    const node = nodes[id];
    node.classList.remove('is-hit');
    void node.offsetWidth;
    node.classList.add('is-hit');
  }
  function setMode(next) {
    mode = next;
    root.dataset.mode = next;
    toggle.querySelectorAll('button').forEach((button) => {
      const on = button.dataset.mode === next;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
    });
    ['ui', 'store'].forEach((id) => {
      const [title, sub] = LABELS[next][id];
      nodes[id].querySelector('b').textContent = title;
      nodes[id].querySelector('small').textContent = sub;
      nodes[id].classList.remove('is-swap');
      void nodes[id].offsetWidth;
      nodes[id].classList.add('is-swap');
    });
    resetMetrics();
  }

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
  function centers() {
    const box = diagram.getBoundingClientRect();
    return ORDER.map((id) => {
      const rect = nodes[id].getBoundingClientRect();
      return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
    });
  }
  function fly(from, to, ms, back) {
    const points = centers();
    const a = points[from], b = points[to];
    root.classList.toggle('is-return', back);
    return new Promise((resolve) => {
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - start) / ms);
        packets.forEach((element, index) => {
          const e = ease(Math.max(0, t - index * 0.07));
          element.style.transform = `translate(${a.x + (b.x - a.x) * e}px, ${a.y + (b.y - a.y) * e}px) translate(-50%, -50%)`;
          element.style.opacity = t >= 1 ? '0' : String(index === 0 ? 1 : 0.6 - index * 0.2);
        });
        if (t < 1) requestAnimationFrame(frame); else resolve();
      };
      requestAnimationFrame(frame);
    });
  }
  async function hop(from, to, back = false) {
    if (reduced.matches) await sleep(320); else await fly(from, to, 520, back);
    hit(ORDER[to]);
  }

  async function cycle() {
    if (running) return;
    running = true;
    run.setAttribute('aria-disabled', 'true');
    run.textContent = '\u26a1 Running\u2026';
    root.classList.add('is-running');
    const diff = DIFFS[mode][runs % DIFFS[mode].length];
    runs += 1;
    setMetric('vdom', '-- ms');
    setMetric('state', 'Dispatching', 'warn');
    setMetric('api', 'Waiting', 'warn');
    hit('ui');
    await hop(0, 1);
    setMetric('state', 'Pending', 'warn');
    await hop(1, 2);
    await hop(2, 3);
    setMetric('api', '200 OK', 'ok');
    await sleep(reduced.matches ? 200 : 260);
    await hop(3, 2, true);
    await hop(2, 1, true);
    setMetric('state', 'Committing', 'warn');
    await hop(1, 0, true);
    setMetric('vdom', `${diff.toFixed(1)} ms`, 'ok');
    setMetric('state', 'Synced', 'ok');
    announce.textContent = `Cycle complete. Virtual DOM diff ${diff.toFixed(1)} milliseconds, state synced, API 200 OK.`;
    root.classList.remove('is-running', 'is-return');
    run.removeAttribute('aria-disabled');
    run.textContent = '\u26a1 Simulate State & API Cycle';
    running = false;
  }

  toggle.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (button && !running && button.dataset.mode !== mode) setMode(button.dataset.mode);
  });
  run.addEventListener('click', cycle);
  toggle.hidden = false;
  run.hidden = false;
}
