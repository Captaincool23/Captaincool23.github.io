const section = document.querySelector('#dossier');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (section) initDossier(section);

function initDossier(root) {
  const candidates = (root.dataset.pdf || '').split(/\s+/).filter(Boolean);
  const transmit = root.querySelector('.dossier-transmit');
  const label = transmit.querySelector('.dt-label');
  const bar = transmit.querySelector('.dt-bar i');
  const burst = transmit.querySelector('.dt-burst');
  const magnet = root.querySelector('.dossier-magnet');
  const inspect = root.querySelector('.dossier-inspect');
  const cli = root.querySelector('.dossier-cli');
  const stage = root.querySelector('.dossier-stage');
  const card = root.querySelector('.dossier-card');
  const modal = root.querySelector('#dossier-modal');
  const frame = modal.querySelector('.dm-frame');
  const missing = modal.querySelector('.dm-missing');
  const modalDownload = modal.querySelector('.dm-download');
  const IDLE = label.textContent;
  let resume = null;
  let busy = false;

  async function probe() {
    for (const url of candidates) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const type = response.headers.get('content-type') || '';
        const gone = response.status === 404 || response.status === 410 || (response.ok && /text\/html/i.test(type));
        if (!gone) { resume = url; break; }
      } catch { resume = url; break; }
    }
    if (resume) {
      transmit.setAttribute('href', resume);
      modalDownload.setAttribute('href', resume);
    }
    root.dataset.resume = resume ? 'ready' : 'missing';
    modalDownload.toggleAttribute('hidden', !resume);
  }
  const probing = probe();

  // 3D tilt
  const tilt = { x: 0, y: 0, tx: 0, ty: 0, lift: 0, tl: 0, css: '', visible: false };
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || reduced.matches) return;
    const box = stage.getBoundingClientRect();
    tilt.tx = clamp((event.clientX - box.left) / box.width, 0, 1) * 2 - 1;
    tilt.ty = clamp((event.clientY - box.top) / box.height, 0, 1) * 2 - 1;
    tilt.tl = 1;
  });
  stage.addEventListener('pointerleave', () => { tilt.tx = 0; tilt.ty = 0; tilt.tl = 0; });
  new IntersectionObserver(([entry]) => { tilt.visible = entry.isIntersecting; }, { rootMargin: '100px' }).observe(stage);
  let last = performance.now();
  function frameLoop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (tilt.visible && !document.hidden && !reduced.matches) {
      const k = 1 - Math.exp(-dt * 9);
      tilt.x += (tilt.tx - tilt.x) * k;
      tilt.y += (tilt.ty - tilt.y) * k;
      tilt.lift += (tilt.tl - tilt.lift) * k;
      const css = Math.abs(tilt.x) + Math.abs(tilt.y) + tilt.lift < 0.004 ? '' : `rotateX(${(-tilt.y * 11).toFixed(2)}deg) rotateY(${(tilt.x * 14).toFixed(2)}deg) translateZ(${(tilt.lift * 18).toFixed(1)}px)`;
      if (css !== tilt.css) { card.style.transform = css; tilt.css = css; }
    }
    requestAnimationFrame(frameLoop);
  }
  requestAnimationFrame(frameLoop);

  // Magnetic CTA
  magnet.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || reduced.matches || busy) return;
    const box = transmit.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2), dy = event.clientY - (box.top + box.height / 2);
    transmit.style.setProperty('--tx', `${clamp(dx * 0.22, -10, 10).toFixed(1)}px`);
    transmit.style.setProperty('--ty', `${clamp(dy * 0.3, -7, 7).toFixed(1)}px`);
  });
  magnet.addEventListener('pointerleave', () => { transmit.style.setProperty('--tx', '0px'); transmit.style.setProperty('--ty', '0px'); });

  // Transmission
  function spawnBurst() {
    if (reduced.matches) return;
    for (let index = 0; index < 22; index += 1) {
      const dot = document.createElement('i');
      const angle = (index / 22) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 50 + Math.random() * 70;
      dot.style.setProperty('--dx', `${(Math.cos(angle) * distance).toFixed(1)}px`);
      dot.style.setProperty('--dy', `${(Math.sin(angle) * distance * 0.8).toFixed(1)}px`);
      dot.style.setProperty('--s', `${(3 + Math.random() * 4).toFixed(1)}px`);
      burst.append(dot);
      setTimeout(() => dot.remove(), 950);
    }
  }
  function progress(from, to, ms, text) {
    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = reduced.matches ? 1 : Math.min(1, (now - start) / ms);
        const value = Math.round(from + (to - from) * t);
        bar.style.width = `${value}%`;
        label.textContent = `${text} ${value}%`;
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
  }
  function download() {
    const link = document.createElement('a');
    link.href = resume;
    link.download = resume.split('/').pop();
    document.body.append(link);
    link.click();
    link.remove();
  }
  async function runTransmit(event) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    await probing;
    transmit.dataset.state = 'run';
    transmit.setAttribute('aria-disabled', 'true');
    transmit.style.setProperty('--tx', '0px');
    transmit.style.setProperty('--ty', '0px');
    await progress(0, 45, 450, 'Packaging Dossier...');
    await progress(45, 100, 450, 'Transmitting Telemetry...');
    if (resume) {
      label.textContent = '\u2713 Dossier Downloaded';
      transmit.dataset.state = 'done';
      spawnBurst();
      download();
    } else {
      label.textContent = '\u26a0 PDF not uploaded yet';
      transmit.dataset.state = 'missing';
    }
    await sleep(2200);
    label.textContent = IDLE;
    bar.style.width = '0%';
    transmit.dataset.state = 'idle';
    transmit.removeAttribute('aria-disabled');
    busy = false;
  }
  transmit.addEventListener('click', runTransmit);

  // CLI copy
  cli.hidden = false;
  const hint = cli.querySelector('.cli-hint');
  cli.addEventListener('click', async () => {
    const command = cli.dataset.cmd;
    try { await navigator.clipboard.writeText(command); } catch {
      const field = document.createElement('textarea');
      field.value = command;
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    hint.textContent = 'copied \u2713';
    setTimeout(() => { hint.textContent = 'click to copy'; }, 1800);
  });

  // Inspect modal
  inspect.hidden = false;
  async function openModal() {
    if (typeof modal.showModal !== 'function') { window.open(resume || candidates[0], '_blank', 'noopener'); return; }
    await probing;
    if (resume && !frame.getAttribute('src')) { frame.src = `${resume}#view=FitH&navpanes=0`; }
    frame.hidden = !resume;
    missing.hidden = Boolean(resume);
    modal.showModal();
    document.documentElement.classList.add('dossier-open');
    inspect.setAttribute('aria-expanded', 'true');
  }
  function closeModal() { if (modal.open) modal.close(); }
  inspect.addEventListener('click', openModal);
  modal.querySelector('.dm-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  modal.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); closeModal(); } });
  modal.addEventListener('close', () => {
    document.documentElement.classList.remove('dossier-open');
    inspect.removeAttribute('aria-expanded');
    inspect.focus({ preventScroll: true });
  });
}
