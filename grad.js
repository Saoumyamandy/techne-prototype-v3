// New grad view: the Techne IDE, three scenarios, and three ways Senior Techne walks you through them.
// Every answer names the twin it came from, or says that no twin covers it.
const Grad = (() => {
  const $ = s => document.querySelector(s);
  const icon = n => App.icon(n);
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  let root, ide, editor, termBody, layer, svg, sp, divider, side, gpage, modal;
  let S, opts;
  let step = -1, ready = false, seniorOn = true, patched = false, screen = 'ide', sentToPriya = false;
  const knownMode = () => opts.seen === '1' && S.known;
  let placed = null;
  let anchored = [];
  let panelW = 460;

  const KW = new Set(('IDENTIFICATION DIVISION PROGRAM-ID ENVIRONMENT INPUT-OUTPUT SECTION FILE-CONTROL SELECT ASSIGN TO ORGANIZATION IS INDEXED ' +
    'RECORD KEY DATA FILE FD COPY WORKING-STORAGE PIC VALUE ZERO PROCEDURE OPEN I-O INPUT PERFORM UNTIL CLOSE STOP RUN READ AT END MOVE NOT ADD ' +
    'END-READ END-PERFORM DISPLAY LINE SEQUENTIAL IF ELSE END-IF NUMERIC').split(' '));

  function hlCobol(text) {
    if (/^ {6}\*/.test(text)) return `<span class="c-cm">${text}</span>`;
    return text.replace(/("[^"]*")|(\b\d[\dV()]*)|([A-Z][A-Z0-9-]*)/g, (m, str, num, word) => {
      if (str) return `<span class="c-str">${str}</span>`;
      if (num) return `<span class="c-num">${num}</span>`;
      if (KW.has(word)) return `<span class="c-kw">${word}</span>`;
      if (word.includes('-') || word.length > 3) return `<span class="c-id">${word}</span>`;
      return word;
    });
  }
  function hlSh(text) {
    if (/^\s*#/.test(text)) return `<span class="c-cm">${text}</span>`;
    return text.replace(/("[^"]*")|(\$\w+)|\b(cp|touch|set|mkdir)\b|(--?[\w-]+)/g, (m, str, v, kw, flag) => {
      if (str) return `<span class="c-str">${str}</span>`;
      if (v) return `<span class="c-id">${v}</span>`;
      if (kw) return `<span class="c-kw">${kw}</span>`;
      return `<span class="c-num">${flag}</span>`;
    });
  }
  function hlJcl(l) {
    if (/^\/\/\*/.test(l)) return `<span class="c-cm">${l}</span>`;
    return l.replace(/^(\/\/\w*)/, '<span class="c-id">$1</span>')
      .replace(/\b(JOB|EXEC|DD|PGM|DSN|DISP|CLASS|MSGCLASS|PARM|SHR|OLD)\b/g, '<span class="c-kw">$1</span>')
      .replace(/('[^']*')/g, '<span class="c-str">$1</span>');
  }
  const hl = t => S.lang === 'sh' ? hlSh(t) : S.lang === 'jcl' ? hlJcl(t) : hlCobol(t);

  // ── IDE chrome ──
  function renderTree() {
    $('#tree').innerHTML = DATA.tree.map(f => {
      const chev = f.dir ? `<i class="chev">${icon(f.closed ? 'chev-right' : 'chev-down')}</i>` : '';
      return `<li id="${DATA.fid(f.name)}" class="${f.dir ? 'dir' : 'file'} ${f.name === S.file ? 'on' : ''}" style="--d:${f.depth}">${chev}${icon(f.dir ? 'folder' : 'file')}<span>${f.name}</span></li>`;
    }).join('');
  }
  function renderTabs() {
    $('#ftabs').innerHTML = S.tabs.map(([f, d], i) => `<button class="ftab ${i ? '' : 'on'}">${f} <span>${d}</span></button>`).join('');
  }

  // Where the fix goes: a line number, or the line holding one of the scenario's marks
  const fixAt = () => S.fix.at === 'errLine' ? S.errLine : S.lineOf(S.fix.at);
  function codeLines() {
    if (!patched) return S.code;
    const at = fixAt();
    return [...S.code.slice(0, at - 1), ...S.fix.lines, ...S.code.slice(at - 1 + S.fix.replace)];
  }
  function renderEditor() {
    const at = patched ? fixAt() : 0;
    const added = patched ? [at, at + S.fix.lines.length - 1] : null;
    editor.innerHTML = codeLines().map((l, i) => {
      const n = i + 1;
      let src = hl(l);
      // wrap each mark's text in a span the walkthrough can point at
      for (const [id, text] of Object.entries(S.marks)) {
        const pos = l.indexOf(text);
        if (pos < 0 || (patched && id === 't-err')) continue;
        src = hl(l.slice(0, pos)) + `<span id="${id}">${hl(text)}</span>` + hl(l.slice(pos + text.length));
        break;
      }
      const isAdded = added && n >= added[0] && n <= added[1];
      return `<div class="ln ${isAdded ? 'added' : ''}" data-n="${n}"><span class="n">${n}</span><span class="lc">${src || ' '}</span></div>`;
    }).join('');
  }
  function scrollToLine(n) {
    const el = editor.querySelector(`.ln[data-n="${n}"]`);
    if (el) editor.scrollTop = Math.max(0, el.offsetTop - editor.clientHeight / 3);
  }

  // ── terminal ──
  function line(html, cls = '') {
    const d = document.createElement('div');
    d.className = 'tl ' + cls;
    d.innerHTML = html;
    termBody.appendChild(d);
    termBody.scrollTop = termBody.scrollHeight;
    return d;
  }
  const PROMPT = '<span class="pr">maya@techne</span> <span class="pd">procurement-core</span> <span class="pc">%</span> ';
  function newPrompt() {
    termBody.querySelectorAll('.caret').forEach(c => c.remove());
    return line(`<span class="pwrap">${PROMPT}<span class="cmd"></span><span class="caret"></span></span>`, 'prompt');
  }
  function type(promptEl, text, done) {
    const cmd = promptEl.querySelector('.cmd');
    let i = 0;
    const tick = () => {
      cmd.textContent = text.slice(0, ++i);
      if (i < text.length) later(tick, 18 + Math.random() * 24);
      else later(() => { promptEl.querySelector('.caret')?.remove(); done && done(); }, 220);
    };
    later(tick, 120);
  }
  function typeAll(cmds, firstPrompt, done) {
    const next = (i, p) => {
      if (i >= cmds.length) return done();
      type(p, cmds[i], () => next(i + 1, i + 1 < cmds.length ? newPrompt() : null));
    };
    next(0, firstPrompt);
  }
  function chain(lines, done) {
    let t = 0;
    lines.forEach(([cls, html], i) => { t += i ? 170 : 260; later(() => line(cls ? `<span class="${cls}">${html}</span>` : html), t); });
    later(done, t + 120);
  }

  const helpBtn = () => opts.help === 'corner' ? $('#help-corner') : $('#help-term');
  function setError(on) {
    if (S.error) editor.querySelector(`.ln[data-n="${S.errLine}"]`)?.classList.toggle('err', on);
    $('#problems').hidden = !on;
    if (on) scrollToLine(S.errLine);
  }

  // Opening state: a failing run, or (file copy) a fresh branch for a ticket
  function runStart() {
    line('<span class="mut">Last login: Fri Oct 30 09:31:04 on ttys002</span>');
    const after = () => {
      newPrompt().id = 't-prompt';
      ready = true;
      if (S.error) setError(true);
      later(() => {
        helpBtn().classList.add('ready');
        if (seniorOn) showNudge();
      }, 900);
    };
    if (S.error) {
      const p = newPrompt();
      later(() => type(p, S.run, () => chain(S.fail(S.errLine), after)), 700);
      return;
    }
    let t = 600;
    S.intro.forEach(([kind, text]) => {
      if (kind === 'cmd') {
        later(() => { const p = newPrompt(); p.querySelector('.cmd').textContent = text; p.querySelector('.caret').remove(); }, t);
        t += 450;
      } else { later(() => line(kind ? `<span class="${kind}">${text}</span>` : text), t); t += 200; }
    });
    later(after, t + 200);
  }

  // ── cards anchored to the help button ──
  function makeCard(cls, html, parent = layer) {
    const c = document.createElement('div');
    c.className = cls;
    c.innerHTML = html;
    parent.appendChild(c);
    return c;
  }
  function anchor(card) {
    const b = App.rel(helpBtn(), root);
    card.style.left = `${Math.max(12, b.x + b.w - card.offsetWidth)}px`;
    card.style.bottom = `${root.clientHeight - b.y + 10}px`;
    if (!anchored.includes(card)) anchored.push(card);
  }
  function dropAnchored() { anchored.forEach(c => c.remove()); anchored = []; }

  // Who the answer comes from. Never an unnamed "Senior Techne" answer.
  const fromLine = a => a.twin ? `answering from ${App.twinName(a.twin)}’s twin` : 'no twin covers this yet';
  function verifRow(a) {
    if (!a.twin) return `<div class="verif warn"><span class="wic">${icon('alert')}</span><div class="vtext"><b>No senior’s twin covers this yet</b><span>A best guess. Your fix goes to seniors to check.</span></div></div>`;
    const t = DATA.twins[a.twin];
    const counts = S.steps.reduce((m, s) => (m[s.status] = (m[s.status] || 0) + 1, m), {});
    const badge = a.mixed
      ? `<span class="vbadge ${counts.inferred ? 'mixed' : ''}">${['verified', 'inferred', 'general'].filter(k => counts[k]).map(k => `${counts[k]} ${k}`).join(' · ')}</span>`
      : `<span class="vbadge">${icon('shield')}Verified</span>`;
    return `<div class="verif"><span class="avatar sm">${t.initial}</span><div class="vtext"><b>From ${t.name}’s twin</b><span>${t.role}</span></div>${badge}</div>`;
  }
  const headBadge = a => a.twin
    ? `<span class="vbadge ${a.mixed ? 'mixed' : ''}">${icon('twin')}${App.twinName(a.twin)}’s twin</span>`
    : `<span class="vbadge warn">${icon('alert')}No twin covers this</span>`;

  // Help fades with what you know: one line and one click when your twin already holds the fix
  function showKnown() {
    dropAnchored();
    helpBtn().classList.remove('nudge');
    const K = S.known;
    const c = makeCard('acard glass seen-card', `
      <div class="ahead">${icon('twin')}<b>Your twin</b><span>has this one</span><button class="gx" data-act="dismiss">${icon('x')}</button></div>
      <div class="seen-line">${K.line}</div>
      <div class="codeblk">${K.code}<div class="acts"><button class="pill run-pill" data-act="run">${icon('play')}Run in terminal</button></div></div>
      <div class="seen-foot"><span class="stag st-ok mini">${icon('archive')}${K.when}</span><button class="link sm" data-act="all-steps">Show all steps ${icon('chev-down')}</button></div>`);
    anchor(c);
  }

  function showNudge() {
    if (step >= 0 || !sp.hidden || anchored.length || screen !== 'ide') return;
    if (knownMode()) { showKnown(); return; }
    helpBtn().classList.add('nudge');
    const a = S.answer;
    const c = makeCard('acard glass nudge-card', `
      <div class="ahead">${icon('sparkle')}<b>Senior Techne</b><span>${S.error ? 'noticed this error' : 'noticed your ticket'}</span><button class="gx" data-act="dismiss">${icon('x')}</button></div>
      <div class="ftitle">${a.title}</div>
      <div class="fmeta">${S.nudge || `Walkthrough · ${S.steps.length} steps · about ${a.minutes} min`}</div>
      ${verifRow(a)}
      <div class="facts"><button class="btn primary" data-act="walk">Walk me through it ${icon('arrow')}</button><button class="btn ghost" data-act="dismiss">Not now</button></div>`);
    anchor(c);
  }

  function searchHTML() {
    return `
      <div class="srow done">${icon('check')}<span>${S.error ? 'Read your terminal' : 'Read your ticket'}</span><code>${S.short}</code></div>
      <div class="srow" data-search><i class="spin"></i><span>Asking the twins who know this</span></div>
      <div class="srcs" data-srcs></div>`;
  }
  function runSearch(box, done) {
    S.answer.sources.forEach((t, i) => later(() => {
      const s = document.createElement('span');
      s.className = 'src';
      s.innerHTML = icon('link') + t;
      box.querySelector('[data-srcs]').appendChild(s);
    }, 340 + i * 320));
    later(() => {
      const r = box.querySelector('[data-search]');
      const a = S.answer;
      r.classList.add('done');
      if (!a.twin) r.classList.add('warn');
      r.innerHTML = `${icon(a.twin ? 'check' : 'alert')}<span>${a.twin ? `${App.twinName(a.twin)}’s twin knows this` : 'No twin covers this. Drafted a best guess'}</span>`;
      done();
    }, 1400);
  }
  const foundHTML = (a, withActs) => `
    <div class="ftitle">${a.title}</div>
    <div class="fmeta">Walkthrough · ${S.steps.length} steps · about ${a.minutes} min</div>
    ${verifRow(a)}
    <div class="fnote">${a.note}</div>
    ${withActs ? `<div class="facts"><button class="btn primary" data-act="walk">Walk me through it ${icon('arrow')}</button><button class="btn ghost" data-act="ask">Ask a senior instead</button></div>` : ''}`;

  // All three entry points (terminal button, corner button, "Ask Senior Techne") open this one card
  function openHelp() {
    if (screen !== 'ide') App.set({ screen: 'ide' });
    if (!ready) { App.toast(`${icon('info')}Senior Techne is still reading your workspace. Try again in a second.`); return; }
    dropAnchored();
    helpBtn().classList.remove('nudge');
    if (knownMode()) { showKnown(); return; }
    if (!['glass', 'inline'].includes(opts.wt)) { openPanel(true); return; }
    clearGuide();
    const c = makeCard('acard glass', `
      <div class="ahead">${icon('sparkle')}<b>Senior Techne</b><span>is looking into it</span><button class="gx" data-act="dismiss">${icon('x')}</button></div>
      ${searchHTML()}<div class="found" data-found hidden></div>`);
    anchor(c);
    runSearch(c, () => {
      const f = c.querySelector('[data-found]');
      f.innerHTML = foundHTML(S.answer, true);
      f.hidden = false;
    });
  }

  // ── step focus ──
  function focusOn(s) {
    clearFocus();
    s.spot.forEach(sel => {
      const el = $(sel);
      if (!el) return;
      el.classList.add('spot');
      el.closest('.ln, .tl, li')?.classList.add('target');
    });
    const first = $(s.spot[0]);
    const kind = first?.closest('.ln') ? 'code' : first?.closest('li') ? 'tree' : 'term';
    // Split keeps the code readable: highlight only, no dimming
    if (opts.wt !== 'split') ide.dataset.focus = kind;
    if (kind === 'code') { const ln = first.closest('.ln'); if (ln) scrollToLine(+ln.dataset.n); }
  }
  function clearFocus() {
    document.querySelectorAll('#grad .spot').forEach(e => e.classList.remove('spot'));
    document.querySelectorAll('#grad .target').forEach(e => e.classList.remove('target'));
    delete ide.dataset.focus;
  }
  function clearGuide() {
    layer.querySelectorAll('.gcard').forEach(c => c.remove());
    svg.innerHTML = '';
    placed = null;
    clearFocus();
  }

  // Lead with one short line; anything after the first sentence goes behind "More"
  function brief(html) {
    const m = html.match(/^(.+?[.!?])\s+(?=[A-Z<])(.+)$/s);
    if (!m) return `<p>${html}</p>`;
    return `<p>${m[1]}</p><details class="more"><summary>More</summary><p>${m[2]}</p></details>`;
  }
  const codeBlock = s => s.code ? `<div class="codeblk">${s.code.replace(/</g, '&lt;')}<div class="acts">
      <button class="pill ghost-pill" data-act="copy">${icon('copy')}<span>Copy</span></button>
      <button class="pill run-pill" data-act="run">${icon('play')}${S.fix.label}</button></div></div>` : '';
  const noteHTML = s => s.note ? `<div class="gnote">${icon('info')}<span>${s.note}</span></div>` : '';
  const sentHTML = s => !s.sentTo ? ''
    : sentToPriya ? `<div class="sent-to done">${icon('check')}Sent to ${App.twinName(s.sentTo)} · it’s in her drafts to confirm</div>`
    : `<div class="sent-to">${icon('alert')}<span>Inferred: nobody has verified this yet.</span><button class="btn primary sm" data-act="send-priya">${icon('send')}Send to Priya</button></div>`;
  // The inferred step lands first in Priya's drafts, in this tab and in any other open tab
  function sendToPriya() {
    sentToPriya = true;
    try { localStorage.setItem('techne-sent-priya', String(Date.now())); } catch { /* storage blocked: same-tab only */ }
    Senior.receiveSent();
    App.toast(`${icon('send')}Sent to Priya R. It’s first in her drafts.`);
    if (opts.wt === 'split') showPanelStep(step); else showGlassStep(step);
  }
  // A step with a trail shows where the knowledge came from, end to end; others keep a one-line source
  const whereHTML = s => s.trail
    ? `<details class="where"><summary>${icon('info')}Where this comes from</summary><ol class="trail">${s.trail.map(([when, ic, what, sub]) =>
        `<li><span class="tr-dot">${icon(ic)}</span><div>${when ? `<span class="tr-when">${when}</span>` : ''}<b>${what}</b>${sub ? `<span class="tr-sub">${sub}</span>` : ''}</div></li>`).join('')}</ol></details>`
    : `<details class="where"><summary>${icon('info')}Where this comes from</summary><p>${s.source}</p></details>`;

  // Glass and Both: the step floats as a glass card pinned to the code
  function showGlassStep(i) {
    clearGuide();
    step = i;
    const s = S.steps[i];
    helpBtn().classList.add('away');
    focusOn(s);
    const dots = S.steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
    const inline = opts.wt === 'inline';
    const c = makeCard(`gcard glass ${inline ? 'inline' : ''}`, `
      ${inline ? '<i class="notch"></i>' : `<span class="badge">${i + 1}</span>`}
      <div class="ghead"><span>Step ${i + 1} of ${S.steps.length}</span><button class="gx" data-act="end" title="End walkthrough">${icon('x')}</button></div>
      ${App.stepTag(s)}
      <h4>${s.title}</h4>
      ${brief(s.body)}
      ${sentHTML(s)}${codeBlock(s)}${noteHTML(s)}${whereHTML(s)}
      <div class="gfoot">
        <span class="dots">${dots}</span>
        <div class="gbtns">
          ${i > 0 ? '<button class="btn ghost" data-act="back">Back</button>' : ''}
          ${i < S.steps.length - 1 ? `<button class="btn dark" data-act="next">Next ${icon('arrow')}</button>` : ''}
        </div>
      </div>`);
    placed = { card: c, s };
    place();
    if (opts.wt === 'both') renderProgress();
  }

  function place() {
    if (!placed) return;
    const { card, s } = placed;
    const T = App.rel($(s.target), root);
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let x, y;
    if (opts.wt === 'inline') {
      const W = root.clientWidth, H = root.clientHeight;
      x = Math.min(Math.max(T.x - 18, 12), W - cw - 12);
      y = T.y + T.h + 14;
      const above = y + ch > H - 12;
      if (above) y = Math.max(12, T.y - ch - 14);
      card.classList.toggle('above', above);
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.setProperty('--notch', `${Math.min(Math.max(T.x + Math.min(T.w / 2, 36) - x, 18), cw - 26)}px`);
      svg.innerHTML = '';
      return;
    }
    if (s.place === 'editor') {
      const E = App.rel(editor, root);
      x = E.x + E.w - cw - 32;
      y = T.y - 52;
      if (x < T.x + T.w + 60) { x = Math.max(E.x + 24, T.x + 20); y = T.y + T.h + 30; }
      y = Math.min(Math.max(y, E.y + 12), root.clientHeight - ch - 12);
    } else if (s.place === 'side') {
      const Sd = App.rel(side, root);
      x = Sd.x + Sd.w + 28;
      y = Math.min(T.y - 30, root.clientHeight - ch - 12);
    } else {
      const R = App.rel($('#term'), root);
      x = R.x + R.w - cw - 24;
      y = Math.max(12, R.y + R.h - ch - 20);
    }
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    const x1 = x - 15, y1 = y + 33, x2 = T.x + T.w + 10, y2 = T.y + T.h / 2;
    const dx = Math.max(50, Math.abs(x1 - x2) * .45);
    svg.innerHTML = `<path class="cpath" d="M${x1} ${y1} C ${x1 - dx} ${y1}, ${x2 + dx} ${y2}, ${x2} ${y2}"/>
      <circle class="chalo" cx="${x2}" cy="${y2}" r="11"/><circle class="cdot" cx="${x2}" cy="${y2}" r="4"/>`;
  }

  // ── Split and Both: the Senior Techne side panel ──
  function openPanel(withSearch) {
    clearGuide();
    dropAnchored();
    sp.hidden = false;
    divider.hidden = false;
    sp.style.width = `${panelW}px`;
    helpBtn().classList.remove('nudge');
    helpBtn().classList.add('away');
    const ctx = S.error ? `${S.file}:${S.errLine}` : S.ticket;
    sp.innerHTML = `
      <div class="sp-head">${icon('sparkle')}<div class="sp-title"><b>Senior Techne</b><span class="sp-from"></span></div><button class="gx" data-act="close-panel" title="Close">${icon('x')}</button></div>
      <div class="sp-ctx" id="sp-ctx">
        <span class="ctx-label">Context</span>
        <span class="chip">${icon(S.error ? 'terminal' : 'link')}${S.error ? 'Terminal output' : S.ticket}</span>
        <span class="chip">${icon('file')}${S.error ? ctx : S.file}</span>
        <button class="chip add" data-act="add-ctx">${icon('plus')}Add context</button>
      </div>
      <div class="sp-thread" id="sp-thread">
        <div class="msg me"><div class="bubble">${S.ask ? S.ask : S.error ? `My <code>${S.run.split(' ')[0]}</code> failed with <code>${S.short}</code>. What’s going on?` : `I’m on ${S.ticket}: include PDF invoices in the nightly vendor file copy. Where do I start?`}</div></div>
        <div class="msg ai" id="sp-answer"><div class="who">${icon('sparkle')}Senior Techne</div><div class="abody"></div></div>
      </div>
      <div class="sp-sugg">${(S.error ? ['Why does this happen?', 'What if it fails again?', 'Who else hit this?'] : ['What could break?', 'Who owns this job?', 'How do I test it?']).map(q => `<button type="button" data-act="sugg">${q}</button>`).join('')}</div>
      <form class="sp-input" id="sp-input">
        <textarea id="sp-q" rows="2" placeholder="Ask a follow-up, or paste a log or link"></textarea>
        <div class="sp-row"><button type="button" class="gx" data-act="add-ctx" title="Add context">${icon('clip')}</button><span class="mut">Enter to send</span><button type="submit" class="send">Send ${icon('arrow-up')}</button></div>
      </form>`;
    const body = sp.querySelector('#sp-answer .abody');
    const reveal = () => {
      sp.querySelector('.sp-from').innerHTML = `· ${fromLine(S.answer)}`;
      sp.querySelector('.sp-head').insertAdjacentHTML('beforeend', '');
      body.insertAdjacentHTML('beforeend', `<div class="found">${foundHTML(S.answer, false)}</div>`);
      startPanelSteps(body);
    };
    if (withSearch) { body.innerHTML = searchHTML(); runSearch(body, reveal); }
    else reveal();
    sp.querySelector('#sp-input').onsubmit = e => { e.preventDefault(); followUp(); };
    sp.querySelector('textarea').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); followUp(); } };
    later(relayout, 30);
  }
  function closePanel() {
    sp.hidden = true;
    divider.hidden = true;
    sp.innerHTML = '';
    clearGuide();
    step = -1;
    helpBtn().classList.remove('away');
  }

  function startPanelSteps(body) {
    if (opts.wt === 'split') {
      body.insertAdjacentHTML('beforeend', `<ol class="psteps" id="psteps"></ol>`);
      showPanelStep(0);
    } else {
      body.insertAdjacentHTML('beforeend', `<p class="pnote">I’ve pinned the steps onto your code. Follow them there, or jump to one here.</p><ol class="pprog" id="pprog"></ol>`);
      showGlassStep(0);
    }
    body.insertAdjacentHTML('beforeend', `<button class="link sm" data-act="ask">${icon('users')}Ask a senior instead</button>`);
  }

  // Split: steps live in the panel, the code is highlighted (not dimmed)
  function showPanelStep(i) {
    step = i;
    focusOn(S.steps[i]);
    $('#psteps').innerHTML = S.steps.map((s, k) => `
      <li class="pstep ${k === i ? 'on' : k < i ? 'done' : ''}" data-act="goto" data-i="${k}">
        <div class="ps-head"><span class="sn">${k < i ? icon('check') : k + 1}</span><b>${s.title}</b>${k === i ? '' : App.stepTag(s).replace('stag', 'stag mini')}</div>
        ${k === i ? `<div class="ps-body">${App.stepTag(s)}${brief(s.body)}${sentHTML(s)}${codeBlock(s)}${noteHTML(s)}${whereHTML(s)}
          <div class="gbtns">${k > 0 ? '<button class="btn ghost" data-act="back">Back</button>' : ''}
          ${k < S.steps.length - 1 ? `<button class="btn dark" data-act="next">Next ${icon('arrow')}</button>` : ''}</div></div>` : ''}
      </li>`).join('');
    $('#psteps .pstep.on')?.scrollIntoView({ block: 'nearest' });
  }
  function renderProgress() {
    const el = $('#pprog');
    if (!el) return;
    el.innerHTML = S.steps.map((s, k) => `<li class="${k === step ? 'on' : k < step ? 'done' : ''}" data-act="goto" data-i="${k}"><span class="sn">${k < step ? icon('check') : k + 1}</span><span class="pp-t">${s.title}</span>${App.stepTag(s).replace('stag', 'stag mini')}</li>`).join('');
  }
  function goStep(i) { if (opts.wt === 'split') showPanelStep(i); else showGlassStep(i); }
  function startWalk() {
    dropAnchored();
    helpBtn().classList.remove('nudge');
    if (['glass', 'inline'].includes(opts.wt)) showGlassStep(0);
    else openPanel(false);
  }

  function followUp() {
    const ta = $('#sp-q');
    const q = ta.value.trim();
    if (!q) return;
    ta.value = '';
    const th = $('#sp-thread');
    th.insertAdjacentHTML('beforeend', `<div class="msg me"><div class="bubble"></div></div>`);
    th.lastElementChild.querySelector('.bubble').textContent = q;
    th.insertAdjacentHTML('beforeend', `<div class="msg ai"><div class="who">${icon('sparkle')}Senior Techne</div><div class="abody"><span class="typing"><i></i><i></i><i></i></span></div></div>`);
    th.scrollTop = th.scrollHeight;
    later(() => {
      const r = S.reply;
      th.lastElementChild.querySelector('.abody').innerHTML = `${App.stepTag(r)}${brief(r.text)}${r.twin ? '' : `<div class="queued">${icon('users')}Added to the Question Queue for any senior</div>`}`;
      th.scrollTop = th.scrollHeight;
    }, 1000);
  }

  const ADD_CTX = [['file', 'README.md'], ['eye', 'Screenshot'], ['link', 'Ticket PROC-482'], ['terminal', 'run.log']];
  let ctxIdx = 0;
  function addContext() {
    const [ic, label] = ADD_CTX[ctxIdx++ % ADD_CTX.length];
    const chip = document.createElement('span');
    chip.className = 'chip new';
    chip.innerHTML = icon(ic) + label;
    $('#sp-ctx').insertBefore(chip, $('#sp-ctx .add'));
  }

  // ── applying the fix ──
  function runFix() {
    clearGuide();
    step = -1;
    const p = $('#t-prompt');
    p.removeAttribute('id');
    const finish = () => chain(S.fix.out, () => {
      newPrompt().id = 't-prompt';
      setError(false);
      later(showDone, 450);
    });
    if (S.fix.kind === 'patch') {
      patched = true;
      renderEditor();
      scrollToLine(fixAt());
      later(() => typeAll(S.fix.cmds, p, finish), 500);
    } else typeAll(S.fix.cmds, p, finish);
  }

  function doneHTML() {
    const d = S.done;
    const head = `<div class="dhead"><span class="okic">${icon('check')}</span><div><b>${d.title}</b><span>${d.sub}</span></div></div>`;
    if (knownMode()) return `${head}<div class="thanks">${icon('twin')}<span>Fixed without the walkthrough. Your twin will keep this help short next time.</span></div>`;
    if (d.kind === 'queued') return `${head}
      <div class="queued-box">
        <b>${icon('users')}Sent to the Question Queue</b>
        <p>No twin covers this, so your workaround went to the Question Queue. Any senior can claim it. Once one approves it, it joins the team docs and Senior Techne learns it.</p>
        <span class="mut">${icon('twin')}Saved privately to your twin</span>
      </div>
      <button class="link" data-act="to-senior">See it in the Question Queue ${icon('arrow')}</button>`;
    if (d.kind === 'save') return `${head}
      ${sentToPriya ? `<div class="sent-to">${icon('send')}Step 4 went to Priya R. to confirm. Her answer updates this walkthrough.</div>` : ''}
      <p class="q">Commit, and save how you did this to your twin?</p>
      <div class="facts" data-fb><button class="btn primary" data-act="commit">${icon('git')}Commit and save to your twin</button><button class="btn ghost" data-act="dismiss-done">Not now</button></div>`;
    return `${head}<p class="q">Did this walkthrough help?</p>
      <div class="facts" data-fb><button class="btn primary" data-act="yes">Yes, it helped</button><button class="btn ghost" data-act="no">Not really</button></div>`;
  }
  function showDone() {
    if (S.done.kind === 'queued') { GradPages.add({ type: 'question', title: S.answer.title, with: 'In the Question Queue', topics: ['COBOL', 'Test data'], vis: 'shared' }); bumpArchive(); }
    if (['glass', 'inline'].includes(opts.wt)) {
      helpBtn().classList.remove('away', 'ready');
      const c = makeCard('acard glass done', `<button class="gx corner-x" data-act="dismiss">${icon('x')}</button>${doneHTML()}`);
      anchor(c);
    } else {
      clearFocus();
      document.querySelectorAll('#psteps .pstep, #pprog li').forEach(li => {
        li.className = li.classList.contains('pstep') ? 'pstep done' : 'done';
        li.querySelector('.ps-body')?.remove();
        li.querySelector('.sn').innerHTML = icon('check');
      });
      sp.querySelector('.abody > [data-act="ask"]')?.remove();
      const th = $('#sp-thread');
      th.insertAdjacentHTML('beforeend', `<div class="msg ai done"><div class="who">${icon('sparkle')}Senior Techne</div><div class="abody">${doneHTML()}</div></div>`);
      th.scrollTop = th.scrollHeight;
    }
  }
  function bumpArchive() {
    const n = $('#arch-count');
    n.textContent = GradPages.total();
    n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
  }

  // git commit → Techne opens the describe-task dialog
  function commitAndSave() {
    const p = $('#t-prompt');
    if (!p) { openSave('commit'); return; }
    p.removeAttribute('id');
    typeAll([S.commit || 'git commit -am "Fix"'], p, () => chain([
      ['', '[proc-512-pdf-invoices 3f2a91c] PROC-512: copy PDF invoices before the done marker'],
      ['mut', ' 1 file changed, 4 insertions(+)'],
    ], () => { newPrompt().id = 't-prompt'; later(() => openSave('commit'), 400); }));
  }

  // ── Describe-task save dialog ──
  const TIMELINE = [
    ['09:41', 'link', 'Opened PROC-512', true],
    ['09:42', 'file', 'Opened scripts/vendor_copy.sh', true],
    ['09:44', 'twin', 'Walkthrough with Priya R.’s twin · 5 steps', true],
    ['09:47', 'message', 'Slack DM with Ana Park', false, 'Private messages start unticked'],
    ['09:49', 'code', 'Edited vendor_copy.sh · 4 lines added', true],
    ['09:50', 'terminal', './scripts/vendor_copy.sh --dry-run ✓', true],
    ['09:52', 'git', 'git commit · 3f2a91c', true],
  ];
  function openSave(trigger) {
    modal.hidden = false;
    const t = trigger === 'commit'
      ? `${icon('git')}Techne noticed your commit on <code>proc-512-pdf-invoices</code>`
      : `${icon('sparkle')}Techne spotted a finished task`;
    modal.innerHTML = `<div class="modal save" role="dialog" aria-label="Save to your twin">
      <div class="m-head"><div><span class="m-trig">${t}</span><h2>Save this to your twin?</h2></div><button class="gx" data-act="close-save">${icon('x')}</button></div>
      <div class="m-body">
        <label class="m-label" for="task-desc">Describe the task, in your words</label>
        <textarea id="task-desc" rows="3">Added PDF invoices to the nightly vendor file copy. PDFs go to their own folder and copy before the done marker, so the 2 AM PO batch sees them.</textarea>
        <div class="m-split">
          <div>
            <div class="m-label">Screen video</div>
            <div class="video off" id="video"><span>${icon('video')}Screen video is off</span><small>Off by default. Turn it on to replay what you did.</small></div>
            <label class="switch-row"><input type="checkbox" id="video-on"><span class="sw"><i></i></span>Include screen video</label>
          </div>
          <div>
            <div class="m-label">What happened <span class="mut">· untick anything to leave it out</span></div>
            <ol class="rec">${TIMELINE.map(([tm, ic, txt, on, hint], i) => `<li><label><input type="checkbox" ${on ? 'checked' : ''} data-i="${i}"><span class="tt">${tm}</span>${icon(ic)}<span>${txt}${hint ? `<small>${hint}</small>` : ''}</span></label></li>`).join('')}</ol>
          </div>
        </div>
        <div class="m-label">Who can see it</div>
        <div class="vis">
          <label><input type="radio" name="vis" value="private" checked><div><b>Only me</b><span>Stays in your twin. Nobody else sees it.</span></div></label>
          <label><input type="radio" name="vis" value="team"><div><b>Share with the team</b><span>A senior reviews it before it joins team docs. +10 credits if approved.</span></div></label>
        </div>
      </div>
      <div class="m-foot"><span class="mut">${icon('shield')}You own this. It’s never used in performance reviews.</span><button class="btn ghost" data-act="close-save">Not now</button><button class="btn primary" data-act="save-twin">Save to my twin</button></div>
    </div>`;
    $('#video-on').onchange = e => {
      const v = $('#video');
      v.className = `video ${e.target.checked ? 'on' : 'off'}`;
      v.innerHTML = e.target.checked
        ? `<span>${icon('play')}09:41 – 09:52 · 11 min</span><small>Click a step to jump there</small><i class="scrub"><b style="width:0%"></b></i>`
        : `<span>${icon('video')}Screen video is off</span><small>Off by default. Turn it on to replay what you did.</small>`;
    };
    modal.querySelectorAll('.rec li').forEach((li, i) => li.addEventListener('click', e => {
      const bar = modal.querySelector('.scrub b');
      if (bar && e.target.tagName !== 'INPUT') bar.style.width = `${(i / (TIMELINE.length - 1)) * 100}%`;
    }));
  }
  function saveToTwin() {
    const shared = modal.querySelector('input[name="vis"]:checked').value === 'team';
    modal.hidden = true;
    GradPages.addSaved(shared);
    bumpArchive();
    App.toast(shared
      ? `${icon('check')}Saved to your twin and shared. A senior reviews it before it joins team docs.`
      : `${icon('check')}Saved to your twin. Only you can see it.`);
  }

  function onAct(act, el) {
    const card = el.closest('.acard, .gcard');
    switch (act) {
      case 'dismiss':
        card?.remove();
        anchored = anchored.filter(c => c !== card);
        helpBtn().classList.remove('nudge');
        break;
      case 'walk': startWalk(); break;
      case 'all-steps': startWalk(); break;
      case 'send-priya': sendToPriya(); break;
      case 'next': goStep(step + 1); break;
      case 'back': goStep(step - 1); break;
      case 'goto': if (+el.dataset.i !== step) goStep(+el.dataset.i); break;
      case 'end': clearGuide(); step = -1; helpBtn().classList.remove('away'); if (!sp.hidden) renderProgress(); break;
      case 'close-panel': closePanel(); break;
      case 'copy': {
        const label = el.querySelector('span');
        navigator.clipboard?.writeText(S.steps.find(s => s.code).code)
          .then(() => { label.textContent = 'Copied'; })
          .catch(() => { label.textContent = 'Select to copy'; });
        break;
      }
      case 'run': runFix(); break;
      case 'add-ctx': addContext(); break;
      case 'sugg': $('#sp-q').value = el.textContent; followUp(); break;
      case 'ask': {
        const html = `<div class="sent">
          <div class="ftitle">Sent to the Question Queue</div>
          <p>Your ${S.error ? `error, line ${S.errLine}` : 'ticket'} and your last 3 commands go with it. Any senior can claim it, usually within 20 minutes, and the answer arrives here as a walkthrough.</p>
          <button class="link" data-act="to-senior">See the Question Queue ${icon('arrow')}</button></div>`;
        if (card) card.querySelector('[data-found]').outerHTML = html;
        else el.outerHTML = html;
        break;
      }
      case 'to-senior': Senior.flag('q1'); App.set({ role: 'senior', screen: 'queue' }); break;
      case 'yes':
        el.closest('[data-fb]').outerHTML = `<div class="thanks">${icon('twin')}<span>Saved to your twin. Priya R. earns credits when her twin helps.</span></div>`;
        GradPages.add({ type: 'walk', title: S.answer.title, with: `${App.twinName(S.answer.twin)}’s twin`, topics: ['COBOL', 'Copybooks'], vis: 'private' });
        bumpArchive();
        break;
      case 'no':
        el.closest('[data-fb]').outerHTML = `<div class="thanks">${icon('message')}<span>Thanks. Priya R. will see this and can improve her twin’s answer.</span></div>`;
        break;
      case 'commit': el.closest('[data-fb]').outerHTML = `<div class="thanks">${icon('git')}<span>Committing…</span></div>`; commitAndSave(); break;
      case 'dismiss-done': el.closest('[data-fb]').remove(); break;
      case 'close-save': modal.hidden = true; break;
      case 'save-twin': saveToTwin(); break;
    }
  }

  function toggleSenior() {
    seniorOn = !seniorOn;
    const t = $('#st-toggle');
    t.classList.toggle('on', seniorOn);
    t.setAttribute('aria-checked', seniorOn);
    App.toast(seniorOn
      ? `${icon('sparkle')}Senior Techne is on. It’ll offer help when something breaks or you start a ticket.`
      : `${icon('sparkle')}Senior Techne is off. It waits until you ask.`);
    if (!seniorOn) {
      anchored.filter(c => c.classList.contains('nudge-card')).forEach(c => c.remove());
      anchored = anchored.filter(c => !c.classList.contains('nudge-card'));
      helpBtn().classList.remove('nudge');
    } else if (ready && step < 0 && sp.hidden) later(showNudge, 300);
  }

  function wireDivider() {
    divider.addEventListener('pointerdown', e => {
      divider.setPointerCapture(e.pointerId);
      ide.classList.add('dragging');
      const x0 = e.clientX, w0 = panelW, max = $('#body').clientWidth * .6;
      const move = ev => {
        panelW = Math.min(max, Math.max(340, w0 - (ev.clientX - x0)));
        sp.style.width = `${panelW}px`;
        relayout();
      };
      const up = () => {
        ide.classList.remove('dragging');
        divider.removeEventListener('pointermove', move);
        divider.removeEventListener('pointerup', up);
      };
      divider.addEventListener('pointermove', move);
      divider.addEventListener('pointerup', up);
    });
  }

  function relayout() { place(); anchored.forEach(anchor); }

  // Switch the main area between code and the other new grad screens
  function show(scr) {
    screen = scr;
    document.querySelectorAll('#gnav li').forEach(li => li.classList.toggle('on', li.dataset.screen === (scr === 'save' ? 'ide' : scr)));
    const code = scr === 'ide' || scr === 'save';
    $('#body').hidden = !code;
    $('#ftabs').hidden = !code;
    gpage.hidden = code;
    layer.hidden = !code;
    if (!code) { modal.hidden = true; GradPages.render(scr, gpage); return; }
    if (scr === 'save') openSave('suggest');
    relayout();
  }

  function init() {
    root = $('#grad'); ide = $('#ide'); editor = $('#editor'); termBody = $('#term-body');
    layer = $('#guide-layer'); svg = $('#connector'); sp = $('#sp'); divider = $('#divider'); side = $('#side');
    gpage = $('#gpage'); modal = $('#grad-modal');
    $('#help-term').onclick = openHelp;
    $('#help-corner').onclick = openHelp;
    $('#nav-ask').onclick = openHelp;
    $('#st-toggle').onclick = toggleSenior;
    $('#gnav').addEventListener('click', e => { const li = e.target.closest('li'); if (li) App.set({ screen: li.dataset.screen }); });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (b && root.contains(b) && !gpage.contains(b)) onAct(b.dataset.act, b);
    });
    modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
    // an opened "Where this comes from" scrolls fully into view, so the trail is never below the fold
    root.addEventListener('toggle', e => { if (e.target.matches?.('details.where') && e.target.open) e.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, true);
    wireDivider();
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    clearGuide();
    dropAnchored();
  }

  function restart(st) {
    stop();
    opts = { wt: st.wt, help: st.help, sc: st.sc, seen: st.seen };
    S = DATA.scenarios[opts.sc] || DATA.scenarios.checked;
    step = -1; ready = false; patched = false; sentToPriya = false;
    ide.dataset.help = opts.help;
    ide.dataset.wt = opts.wt;
    sp.hidden = true; divider.hidden = true; sp.innerHTML = '';
    modal.hidden = true;
    ['#help-term', '#help-corner'].forEach(s => $(s).className = $(s).className.replace(/\b(nudge|ready|away)\b/g, '').trim());
    $('#term-right').textContent = S.key === 'filecopy' ? 'zsh · proc-512-pdf-invoices' : 'zsh · procurement-core';
    renderTree(); renderTabs(); renderEditor();
    termBody.innerHTML = '';
    $('#problems').hidden = true;
    editor.scrollTop = 0;
    show(st.screen);
    runStart();
  }

  // Back to a fresh visit: Senior Techne on, archive count as loaded
  function reset() {
    seniorOn = true;
    const t = $('#st-toggle'); t.classList.add('on'); t.setAttribute('aria-checked', 'true');
    setTimeout(() => { $('#arch-count').textContent = GradPages.total(); });
  }
  return { init, start: restart, restart, stop, show, relayout, reset };
})();
