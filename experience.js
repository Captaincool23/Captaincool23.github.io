const bar = document.querySelector('.exp-tabs');
const stage = document.querySelector('.exp-stage');
const tabs = bar ? [...bar.querySelectorAll('.exp-tab')] : [];
const panels = new Map([...document.querySelectorAll('.exp-panel')].map((panel) => [panel.id.replace('panel-', ''), panel]));
const markerLists = [...document.querySelectorAll('.rail-markers')];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const TRANSITION_MS = 520;

if (bar && stage && tabs.length && panels.size) initTabs();

function initTabs() {
  let current = tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.tab || tabs[0].dataset.tab;
  let finish = null;

  function cascade(panel) {
    panel.querySelectorAll('h3, .role-summary, li, .project-tags span').forEach((element, index) => element.style.setProperty('--n', String(index)));
    panel.classList.remove('is-cascade');
    void panel.offsetWidth;
    panel.classList.add('is-cascade');
    setTimeout(() => panel.classList.remove('is-cascade'), 1900);
  }
  tabs.forEach((tab) => tab.addEventListener('pointermove', (event) => {
    const box = tab.getBoundingClientRect();
    tab.style.setProperty('--mx', `${event.clientX - box.left}px`);
    tab.style.setProperty('--my', `${event.clientY - box.top}px`);
  }));

  function select(name, { focus = false } = {}) {
    const next = panels.get(name);
    if (!next || name === current) return;
    finish?.();
    const prev = panels.get(current);
    const from = tabs.findIndex((tab) => tab.dataset.tab === current);
    const to = tabs.findIndex((tab) => tab.dataset.tab === name);
    current = name;

    tabs.forEach((tab, index) => {
      const on = index === to;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    bar.style.setProperty('--i', String(to));
    if (focus) tabs[to].focus();
    markerLists.forEach((list) => { list.hidden = list.dataset.company !== name; });
    next.querySelectorAll('.scroll-reveal').forEach((row) => row.classList.add('is-visible'));

    if (reduced.matches) {
      prev.classList.remove('is-active');
      next.classList.add('is-active');
    } else {
      stage.style.setProperty('--dir', from < to ? '1' : '-1');
      stage.style.height = `${stage.offsetHeight}px`;
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      next.classList.add('is-entering');
      cascade(next);
      bar.classList.remove('is-switching');
      void bar.offsetWidth;
      bar.classList.add('is-switching');
      setTimeout(() => bar.classList.remove('is-switching'), 900);
      const target = next.offsetHeight;
      void stage.offsetHeight;
      requestAnimationFrame(() => {
        stage.style.height = `${target}px`;
        prev.classList.add('is-out');
        next.classList.add('is-in');
      });
      const timer = setTimeout(() => finish?.(), TRANSITION_MS);
      finish = () => {
        clearTimeout(timer);
        prev.classList.remove('is-leaving', 'is-out');
        next.classList.remove('is-entering', 'is-in');
        next.classList.add('is-active');
        stage.style.height = '';
        finish = null;
      };
    }

    const role = next.querySelector('.experience-row')?.dataset.role;
    window.dispatchEvent(new CustomEvent('experience:tab', { detail: { tab: name, role } }));
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.tab)));
  bar.addEventListener('keydown', (event) => {
    const index = tabs.findIndex((tab) => tab.dataset.tab === current);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    let target = -1;
    if (step) target = (index + step + tabs.length) % tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    if (target < 0) return;
    event.preventDefault();
    select(tabs[target].dataset.tab, { focus: true });
  });
}
