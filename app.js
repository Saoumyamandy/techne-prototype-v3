// Shell: icons, prototype bar, state kept in the URL hash, theme and toasts.
const App = (() => {
  const ICONS = {
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-right': '<path d="m9 18 6-6-6-6"/>',
    'chev-left': '<path d="m15 18-6-6 6-6"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    terminal: '<path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2"/>',
    buoy: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
    sparkle: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    play: '<path d="M6 4.5v15a.5.5 0 0 0 .77.42l11.5-7.5a.5.5 0 0 0 0-.84L6.77 4.08A.5.5 0 0 0 6 4.5z"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    replay: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    lock: '<rect width="16" height="11" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect width="16" height="11" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.9-1"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9"/><path d="M14.5 9.5c-.4-.9-1.3-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.6-1.6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    video: '<path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
    branch: '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M11.53 2.3a.53.53 0 0 1 .94 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.79a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    git: '<circle cx="12" cy="12" r="3"/><path d="M3 12h6"/><path d="M15 12h6"/>',
    report: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    graph: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="8" r="3"/><circle cx="10" cy="18" r="3"/><path d="m8.9 6.4 6.2 1.2"/><path d="m7 9 2 6"/><path d="m16.4 10.4-4.6 5.4"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    'chev-up': '<path d="m18 15-6-6-6 6"/>',
    twin: '<circle cx="9" cy="8" r="3.2"/><circle cx="15" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 9-5.2A6 6 0 0 1 21 20"/>',
    record: '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
  };
  const icon = (name, cls = '') =>
    `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  function hydrate(root = document) {
    root.querySelectorAll('i[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });
    root.querySelectorAll('[data-ticks]').forEach(el => {
      const n = +el.dataset.ticks, f = +el.dataset.filled;
      el.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < f ? 'f' : ''}"></i>`).join('');
    });
  }

  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // Box of an element relative to another (no scaling any more, so plain rect math)
  function rel(el, root) {
    const r = el.getBoundingClientRect(), s = root.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }

  function toast(html) {
    const t = document.getElementById('toast');
    t.innerHTML = html;
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('in'), 3400);
  }

  // ── state, kept in the hash so a reload or shared link lands on the same view ──
  const SCREENS = {
    grad: [['ide', 'IDE'], ['save', 'Describe-task save'], ['archive', 'Your twin (archive)'], ['learn', 'Learning path'], ['onboard', 'Onboarding + permissions'], ['report', 'Year-end report']],
    senior: [['home', 'Your Home'], ['queue', 'Question Queue'], ['repo', 'Company repository'], ['ide', 'Your IDE'], ['hot', 'Hot spots'], ['persona', 'How Techne’s questions are built'], ['report', 'Year-end report']],
    mobile: [['approvals', 'Senior · your twin’s drafts'], ['probes', 'Senior · Techne’s questions'], ['slack', 'New grad · Slack'], ['archive', 'New grad · your twin']],
  };
  const state = { role: 'grad', screen: 'ide', wt: 'split', help: 'terminal', sc: 'checked', seen: '0', theme: 'light' };
  const modules = {};
  let started = null;

  // Short links for sharing (#queue, #repository…); the long key=value form is for local use
  const TOKENS = {
    ide: { role: 'grad', screen: 'ide' }, grad: { role: 'grad', screen: 'ide' },
    senior: { role: 'senior', screen: 'home' }, home: { role: 'senior', screen: 'home' },
    repository: { role: 'senior', screen: 'repo' }, queue: { role: 'senior', screen: 'queue' },
    'senior-ide': { role: 'senior', screen: 'ide' }, hotspots: { role: 'senior', screen: 'hot' },
    archive: { role: 'grad', screen: 'archive' }, learning: { role: 'grad', screen: 'learn' },
    onboarding: { role: 'grad', screen: 'onboard' }, save: { role: 'grad', screen: 'save' },
    filecopy: { role: 'grad', screen: 'ide', sc: 'filecopy' }, restart: { role: 'grad', screen: 'ide', sc: 'restart' },
    seen: { role: 'grad', screen: 'ide', sc: 'checked', seen: '1' },
    persona: { role: 'senior', screen: 'persona' }, mobile: { role: 'mobile', screen: 'approvals' },
  };
  function hostTheme() {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark' || t === 'light') return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function readHash() {
    const h = location.hash.slice(1);
    if (TOKENS[h]) Object.assign(state, TOKENS[h]);
    else {
      const p = new URLSearchParams(h);
      for (const k in state) if (p.has(k)) state[k] = p.get(k);
    }
    if (!SCREENS[state.role]) state.role = 'grad';
    if (!SCREENS[state.role].some(([id, , r]) => id === state.screen && !r)) state.screen = SCREENS[state.role][0][0];
  }
  function writeHash() {
    try { history.replaceState(null, '', '#' + new URLSearchParams(state)); } catch { /* sandboxed frames may refuse */ }
  }

  function set(patch) {
    const prev = { ...state };
    Object.assign(state, patch);
    if (patch.role && patch.role !== prev.role && !patch.screen) state.screen = SCREENS[state.role][0][0];
    writeHash();
    apply(prev);
  }

  function apply(prev = {}) {
    if (document.documentElement.dataset.theme !== state.theme) document.documentElement.dataset.theme = state.theme;
    document.body.dataset.role = state.role;
    renderBar();
    document.getElementById('grad').hidden = state.role !== 'grad';
    document.getElementById('senior').hidden = state.role !== 'senior';
    document.getElementById('mobile').hidden = state.role !== 'mobile';
    const mod = modules[state.role];
    if (started !== state.role) {
      if (started) modules[started].stop();
      started = state.role;
      mod.start(state);
      return;
    }
    const restartKeys = state.role === 'grad' ? ['wt', 'help', 'sc', 'seen'] : [];
    if (restartKeys.some(k => prev[k] !== state[k])) mod.restart(state);
    else if (prev.screen !== state.screen) mod.show?.(state.screen);
    else if (prev.theme !== state.theme) mod.relayout?.();
  }

  // ── prototype bar ──
  const seg = (key, opts) => `<div class="seg" data-key="${key}">${opts.map(([v, l, ic]) =>
    `<button class="${state[key] === v ? 'on' : ''}" data-val="${v}">${ic ? icon(ic) : ''}${l}</button>`).join('')}</div>`;

  function renderBar() {
    const bar = document.getElementById('pbar');
    const screens = SCREENS[state.role].map(([id, label, round]) =>
      `<option value="${id}" ${id === state.screen ? 'selected' : ''} ${round ? 'disabled' : ''}>${label}${round ? ' · round 2' : ''}</option>`).join('');
    bar.innerHTML = `
      <span class="pb-name"><i class="pb-dot"></i>Prototype</span>
      ${seg('role', [['grad', 'New grad'], ['senior', 'Senior'], ['mobile', 'Mobile', 'phone']])}
      <span class="pb-sep"></span>
      <label class="pb-field">Screen<select id="pb-screen">${screens}</select></label>
      ${state.role === 'grad' && (state.screen === 'ide' || state.screen === 'save') ? `
        <span class="pb-sep"></span>
        <span class="pb-label">Scenario</span>${seg('sc', [['checked', 'Covered'], ['unchecked', 'Not covered'], ['filecopy', 'File copy'], ['restart', 'Restart after failure']])}
        ${state.sc === 'checked' ? `<span class="pb-label">Seen before</span>${seg('seen', [['0', 'Off'], ['1', 'On']])}` : ''}
        <span class="pb-label">Walkthrough</span>${seg('wt', [['split', 'Split'], ['glass', 'Glass'], ['both', 'Both']])}
        <span class="pb-label">Help</span>${seg('help', [['terminal', 'Terminal'], ['corner', 'Corner']])}` : ''}
      <span class="pb-right">
        ${seg('theme', [['light', '', 'sun'], ['dark', '', 'moon']])}
        <button class="pb-btn" id="pb-replay" data-tip="Replay this screen. Press H to hide this bar.">${icon('replay')}Replay</button>
      </span>`;
    bar.querySelectorAll('.seg').forEach(s => s.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b && state[s.dataset.key] !== b.dataset.val) set({ [s.dataset.key]: b.dataset.val });
    }));
    bar.querySelector('#pb-screen').onchange = e => set({ screen: e.target.value });
    bar.querySelector('#pb-replay').onclick = replay;
  }

  // Replay puts every module back to how a fresh load finds it
  function replay() {
    try { localStorage.removeItem('techne-sent-priya'); } catch { /* blocked */ }
    Grad.reset(); GradPages.reset(); Senior.hardReset(); SeniorPages.reset();
    modules[state.role].restart(state);
  }

  function start() {
    hydrate();
    modules.grad = Grad;
    modules.senior = Senior;
    modules.mobile = Mobile;
    Grad.init();
    Senior.init();
    Mobile.init();
    state.theme = hostTheme();
    // Opening the start of a run-through clears anything sent to Priya in an earlier one, in every open tab
    if (['filecopy', 'senior-ide'].includes(location.hash.slice(1))) { try { localStorage.removeItem('techne-sent-priya'); } catch { /* blocked */ } }
    readHash();
    writeHash();
    apply();
    // follow the viewer's own theme switch
    new MutationObserver(() => {
      const t = document.documentElement.dataset.theme;
      if ((t === 'dark' || t === 'light') && t !== state.theme) { state.theme = t; writeHash(); renderBar(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    addEventListener('keydown', e => {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey) return;
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
      document.body.classList.toggle('bar-hidden');
      modules[state.role].relayout?.();
    });
    addEventListener('resize', () => modules[state.role].relayout?.());
    // a short link typed into an open tab works like a fresh visit to it
    addEventListener('hashchange', () => {
      const h = location.hash.slice(1);
      if (TOKENS[h]) set({ seen: '0', sc: 'checked', ...TOKENS[h] });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.synth')) return;
      e.preventDefault(); e.stopPropagation();
      set({ role: 'senior', screen: 'persona' });
    }, true);
  }

  // Small shared pieces used by several screens
  const twinName = id => id ? DATA.twins[id].name : null;
  const synth = () => `<span class="synth" role="link" tabindex="0" data-tip="Asks as a synthetic new grad. Click to see how it’s built.">${icon('sparkle')}Synthetic</span>`;
  const STATUS = {
    verified: ['Verified', 'shield', 'st-ok'],
    inferred: ['Inferred', 'alert', 'st-warn'],
    unknown: ['No twin covers this', 'alert', 'st-bad'],
    general: ['General knowledge', 'book', 'st-gen'],
  };
  // "Priya R.'s twin · Verified" style tag for a step
  function stepTag(s) {
    const [label, ic, cls] = STATUS[s.status];
    const who = s.twin ? `${twinName(s.twin)}’s twin` : 'Senior Techne';
    return `<span class="stag ${cls}">${icon(ic)}${s.status === 'general' || s.status === 'unknown' ? label : `${who} · ${label}`}</span>`;
  }

  // Toast with an Undo button; calls undo() if pressed within ~5 s
  function undoToast(html, undo) {
    const t = document.getElementById('toast');
    t.innerHTML = `${html}<button class="toast-undo">Undo</button>`;
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in', 'has-btn');
    t.querySelector('.toast-undo').onclick = () => { undo(); t.classList.remove('in'); };
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('in', 'has-btn'), 5200);
  }

  return { icon, hydrate, rng, rel, toast, undoToast, set, start, state, twinName, synth, stepTag, STATUS };
})();
