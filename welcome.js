const portraitUrl = new URL('./assets/welcome-portrait.png', import.meta.url);
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const sessionKey = 'portfolio-space-welcome-v7';
let activeIntro = null;
const quips = ['Compiling coffee into code...', 'It works on my machine.', 'Please keep arms and legs inside the orbit.'];
let portraitPromise = null;

function waitForSpaceWorld() {
  const shell = document.querySelector('.space-journey .page-shell');
  if (!shell || shell.dataset.ready === 'true' || shell.dataset.ready === 'fallback') return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => { clearTimeout(timeout); window.removeEventListener('space:ready', finish); resolve(); };
    const timeout = setTimeout(finish, 8000);
    window.addEventListener('space:ready', finish, { once: true });
  });
}

function hasSeenIntro() {
  try { return sessionStorage.getItem(sessionKey) === 'true'; }
  catch { return false; }
}

function markSeen() {
  try { sessionStorage.setItem(sessionKey, 'true'); }
  catch { return; }
}

async function preparePortrait() {
  const image = new Image();
  image.src = portraitUrl.href;
  await image.decode();
  image.alt = 'Developer character illustration';
  return image;
}

function transitionProgress(seconds, start, duration) {
  const progress = Math.max(0, Math.min(1, (seconds - start) / duration));
  return progress * progress * (3 - 2 * progress);
}

const clearPending = () => document.documentElement.classList.remove('welcome-pending');

async function playIntro() {
  if (activeIntro) return;
  if (motionPreference.matches) {
    markSeen();
    clearPending();
    return;
  }

  const previousFocus = document.activeElement;
  const overlay = document.createElement('section');
  overlay.className = 'welcome-screen';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'welcome-title');
  const composition = document.createElement('div');
  composition.className = 'welcome-composition';
  const copy = document.createElement('div');
  copy.className = 'welcome-copy';
  const greeting = document.createElement('h2');
  greeting.id = 'welcome-title';
  greeting.setAttribute('aria-label', 'Welcome to my world');
  ['Welcome', 'to my', 'world.'].forEach((phrase, index) => {
    const line = document.createElement('span');
    line.className = 'welcome-line';
    line.style.setProperty('--line-index', String(index));
    line.setAttribute('aria-hidden', 'true');
    const word = document.createElement('span');
    word.className = 'welcome-word';
    word.style.setProperty('--word-delay', `${0.35 + index * 0.27}s`);
    word.textContent = phrase;
    line.append(word);
    greeting.append(line);
  });
  const quip = document.createElement('p');
  quip.className = 'welcome-quip';
  quip.setAttribute('aria-hidden', 'true');
  quip.textContent = quips[0];
  copy.append(greeting, quip);
  const stage = document.createElement('div');
  stage.className = 'welcome-portrait';
  stage.setAttribute('aria-hidden', 'true');
  const floatLayer = document.createElement('div');
  floatLayer.className = 'welcome-portrait-float';
  const tiltLayer = document.createElement('div');
  tiltLayer.className = 'welcome-portrait-tilt';
  floatLayer.append(tiltLayer);
  stage.append(floatLayer);
  const skip = document.createElement('button');
  skip.className = 'welcome-skip';
  skip.type = 'button';
  skip.textContent = 'Skip intro';
  const aperture = document.createElement('div');
  aperture.className = 'welcome-aperture';
  aperture.setAttribute('aria-hidden', 'true');
  composition.append(copy, stage);
  overlay.append(composition, aperture, skip);

  const siblings = [...document.body.children];
  const priorInert = siblings.map((element) => element.inert);
  siblings.forEach((element) => { element.inert = true; });
  document.body.append(overlay);
  clearPending();
  document.documentElement.classList.add('welcome-open');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.dispatchEvent(new CustomEvent('welcome:start'));
  skip.focus({ preventScroll: true });
  let frameId = 0;
  let finished = false;
  let startedAt = null;
  let timeoutId;
  let pausedAt = null;
  let skipRequested = false;
  let portalStartedAt = null;
  const originalScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frameId);
    clearTimeout(timeoutId);
    document.removeEventListener('visibilitychange', handleVisibility);
    motionPreference.removeEventListener('change', handleMotionChange);
    overlay.remove();
    siblings.forEach((element, index) => { element.inert = priorInert[index]; });
    document.documentElement.classList.remove('welcome-open');
    document.documentElement.style.removeProperty('--welcome-reveal');
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
    window.dispatchEvent(new CustomEvent('welcome:complete'));
    markSeen();
    activeIntro = null;
    if (previousFocus instanceof HTMLElement && previousFocus !== document.body && previousFocus.isConnected) {
      previousFocus.focus({ preventScroll: true });
    } else {
      const heading = document.querySelector('#hero-title');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  activeIntro = { finish };
  skip.addEventListener('click', () => { skipRequested = true; skip.textContent = 'Entering orbit…'; });
  overlay.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || motionPreference.matches) return;
    const bounds = overlay.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.style.setProperty('--portrait-tilt-x', `${(-vertical * 7).toFixed(2)}deg`);
    stage.style.setProperty('--portrait-tilt-y', `${(horizontal * 10).toFixed(2)}deg`);
  });
  overlay.addEventListener('pointerleave', () => {
    stage.style.setProperty('--portrait-tilt-x', '0deg');
    stage.style.setProperty('--portrait-tilt-y', '0deg');
  });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finish();
    if (event.key === 'Tab') {
      event.preventDefault();
      skip.focus({ preventScroll: true });
    }
  });

  function handleMotionChange() { if (motionPreference.matches) finish(); }
  function handleVisibility() {
    if (document.hidden) {
      pausedAt = performance.now();
      cancelAnimationFrame(frameId);
    } else if (pausedAt !== null) {
      if (startedAt !== null) startedAt += performance.now() - pausedAt;
      if (portalStartedAt !== null) portalStartedAt += performance.now() - pausedAt;
      pausedAt = null;
      frameId = requestAnimationFrame(animate);
    }
  }

  function animate(timestamp) {
    if (finished || document.hidden) return;
    if (startedAt === null) startedAt = timestamp;
    const greetingHoldSeconds = 2;
    const closingStartsAt = 1.8 + greetingHoldSeconds;
    const revealStartsAt = closingStartsAt + 0.8;
    if (skipRequested && portalStartedAt === null) portalStartedAt = timestamp;
    const seconds = portalStartedAt === null ? (timestamp - startedAt) / 1000 : revealStartsAt + (timestamp - portalStartedAt) / 1000;
    const space = transitionProgress(seconds, 0.35, 2);
    const collapse = transitionProgress(seconds, closingStartsAt, 0.9);
    const reveal = transitionProgress(seconds, revealStartsAt, 2.5);
    const radius = collapse * 8 + reveal * (Math.hypot(window.innerWidth, window.innerHeight) / 2 + 48);
    const accent = transitionProgress(seconds, closingStartsAt + 0.1, 0.5) * (1 - transitionProgress(seconds, revealStartsAt + 1.7, 0.8));
    overlay.dataset.phase = seconds < closingStartsAt ? 'greeting' : (seconds < revealStartsAt ? 'closing' : 'reveal');
    overlay.dataset.space = space > 0.58 ? 'visible' : 'appearing';
    const quipIndex = Math.min(quips.length - 1, Math.floor(seconds / 1.25));
    if (quip.dataset.line !== String(quipIndex)) {
      quip.dataset.line = String(quipIndex);
      quip.textContent = quips[quipIndex];
      quip.classList.remove('is-swapping');
      void quip.offsetWidth;
      quip.classList.add('is-swapping');
    }
    overlay.style.setProperty('--space-opacity', space.toFixed(4));
    overlay.style.setProperty('--welcome-collapse', collapse.toFixed(4));
    overlay.style.setProperty('--welcome-reveal', reveal.toFixed(4));
    overlay.style.setProperty('--iris-radius', `${radius.toFixed(2)}px`);
    overlay.style.setProperty('--iris-x', `${(50 + (1 - reveal) * 8).toFixed(3)}%`);
    overlay.style.setProperty('--iris-y', `${(50 - (1 - reveal) * 4).toFixed(3)}%`);
    overlay.style.setProperty('--iris-accent', accent.toFixed(4));
    document.documentElement.style.setProperty('--welcome-reveal', reveal.toFixed(4));
    window.dispatchEvent(new CustomEvent('welcome:portal', { detail: { progress: reveal } }));
    if (seconds >= revealStartsAt + 2.65) finish();
    else frameId = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', handleVisibility);
  motionPreference.addEventListener('change', handleMotionChange);
  timeoutId = window.setTimeout(finish, 18000);
  try {
    portraitPromise ??= preparePortrait();
    const [portrait] = await Promise.all([portraitPromise, waitForSpaceWorld()]);
    if (finished) return;
    tiltLayer.append(portrait.cloneNode());
    overlay.classList.add('is-playing');
    frameId = requestAnimationFrame(animate);
  } catch (error) {
    console.warn('Welcome portrait unavailable; opening portfolio.', error);
    portraitPromise = null;
    finish();
  }
}

document.querySelector('#replay-intro')?.addEventListener('click', () => playIntro());
document.querySelector('#hud-replay-intro')?.addEventListener('click', () => playIntro());
if (!hasSeenIntro()) playIntro();
else clearPending();