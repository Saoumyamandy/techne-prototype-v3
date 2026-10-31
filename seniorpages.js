// Senior pages: Your IDE (recording + Techne's in-IDE question), the end-of-day interview,
// hot spots, and the senior's year-end report. When Techne asks as a new grad it is synthetic, and always badged as such.
const SeniorPages = (() => {
  const $ = s => document.querySelector(s);
  const icon = n => App.icon(n);
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  let host = null, recording = true, probeState = 'hidden', qIndex = 0, momentsOpen = false;

  const builtFrom = () => `<details class="built"><summary>${icon('info')}Built from</summary><ul>${DATA.persona.builtFrom.map(b => `<li>${b}</li>`).join('')}</ul><p>${DATA.persona.note}</p></details>`;

  // Why Techne is asking: the real demand (anonymised) and the moment behind a persona question
  function whyHTML(key) {
    const L = DATA.lineage[key], m = DATA.seniorIde.moments[L.moment];
    return `<details class="why"><summary>${icon('info')}Why Techne is asking</summary>
      <div class="why-body">
        <div class="why-cl"><b>${L.cluster}</b><span>${L.count}</span></div>
        <div class="why-l">Real new grad questions, anonymised</div>
        <ul class="why-q">${L.questions.map(q => `<li>“${q}”</li>`).join('')}</ul>
        <div class="why-l">The moment it matches</div>
        <div class="why-m">${icon('star')}<span><b>${m.time} · ${m.label}</b>${m.reason}</span></div>
      </div></details>`;
  }
  const rateHTML = () => `<div class="rate"><span>Is this a good question?</span><button data-sact="rate-up">${icon('check')}Useful</button><button data-sact="rate-down">${icon('x')}Not relevant</button></div>`;

  // ── Senior IDE ──
  function hlJcl(l) {
    if (/^\/\/\*/.test(l)) return `<span class="c-cm">${l}</span>`;
    return l.replace(/^(\/\/\w*)/, '<span class="c-id">$1</span>')
      .replace(/\b(JOB|EXEC|DD|PGM|DSN|DISP|CLASS|MSGCLASS|PARM|SHR|OLD)\b/g, '<span class="c-kw">$1</span>')
      .replace(/('[^']*')/g, '<span class="c-str">$1</span>');
  }
  function ideHTML() {
    const I = DATA.seniorIde;
    return `<div class="ide sp-ide">
      <aside class="side">
        <div class="brand">Techne <em>IDE</em></div>
        <div class="label">Explorer</div>
        <ul class="tree">${[['procurement-batch', 1, 0], ['jcl', 1, 1], ['VENDSYNC.jcl', 0, 2, true], ['POBATCH.jcl', 0, 2], ['VSAMREORG.jcl', 0, 2], ['runbooks', 1, 1]].map(([n, dir, d, on]) =>
          `<li class="${dir ? 'dir' : 'file'} ${on ? 'on' : ''}" style="--d:${d}">${dir ? `<i class="chev">${icon('chev-down')}</i>` : ''}${icon(dir ? 'folder' : 'file')}<span>${n}</span></li>`).join('')}</ul>
        <div class="label">Your twin today</div>
        <ul class="twin-today"><li>${icon('video')}<span>2 sessions recorded</span></li><li><button class="km-btn ${momentsOpen ? 'on' : ''}" data-sact="moments-list">${icon('star')}<span>${I.moments.length} key moments found</span>${icon(momentsOpen ? 'chev-up' : 'chev-down')}</button></li>
          ${momentsOpen ? `<li class="km-list">${I.moments.map((m, i) => `<button data-sact="moment" data-i="${i}"><span class="tt">${m.time}</span>${m.label}</button>`).join('')}</li>` : ''}<li>${icon('sparkle')}<span>3 questions from Techne</span></li></ul>
        <div class="me"><span class="avatar">P</span><div><b>Priya R.</b><span>Senior · COBOL and procurement</span></div></div>
      </aside>
      <div class="main">
        <header class="tabbar">
          <div class="ftabs"><button class="ftab on">VENDSYNC.jcl <span>jcl</span></button><button class="ftab">Vendor sync recovery <span>runbook</span></button></div>
          <div class="bar-right">
            <span class="recpill ${recording ? 'on' : 'off'}" data-tip="Recording what you do in the IDE, within what you allowed. Never used in performance reviews.">${icon('record')}${recording ? 'Recording' : 'Paused'}</span>
            <button class="btn ghost sm" data-sact="pause">${icon(recording ? 'pause' : 'play')}${recording ? 'Pause' : 'Resume'}</button>
            <button class="btn dark sm" data-sact="interview">${icon('twin')}End-of-day interview · 3</button>
            <span class="avatar">P</span>
          </div>
        </header>
        <div class="sess-strip">
          <span class="ss-l">${icon('video')}${I.session.label}<em>${I.session.range}</em></span>
          <div class="ss-bar"><i class="ss-fill"></i>${I.moments.map((m, i) => `<button class="ss-dot ${m.main ? 'is-main' : ''}" style="left:${m.pos}%" data-sact="moment" data-i="${i}" aria-label="Key moment at ${m.time}: ${m.label}"></button>`).join('')}</div>
          <span class="ss-r">${I.moments.length} key moments</span>
        </div>
        <div class="body"><div class="work">
          <div class="editor">${I.code.map((l, i) => `<div class="ln ${i === 6 ? 'key' : ''}"><span class="n">${i + 1}</span><span class="lc">${hlJcl(l)}</span></div>`).join('')}</div>
          <div class="term"><div class="term-tabs"><span class="on">${icon('terminal')}Terminal</span><span class="term-right">zsh · procurement-batch</span></div>
            <div class="term-body">${I.term.map(([k, t], li) => {
              const mi = I.moments.findIndex(m => m.line === li);
              const star = mi >= 0 ? `<button class="mstar ${I.moments[mi].main ? 'is-main' : ''}" data-sact="moment" data-i="${mi}" aria-label="Why this is a key moment">${icon('star')}</button>` : '';
              const body = k === 'cmd' ? `<span class="pr">priya@techne</span> <span class="pd">procurement-batch</span> <span class="pc">%</span> ${t}` : t;
              return `<div class="tl ${mi >= 0 ? 'moment' : ''} ${mi >= 0 && I.moments[mi].main ? 'is-main' : ''}">${star}${body}</div>`;
            }).join('')}
            <div class="tl"><span class="pr">priya@techne</span> <span class="pd">procurement-batch</span> <span class="pc">%</span> <span class="caret"></span></div></div></div>
        </div></div>
      </div>
      ${probeHTML()}
    </div>`;
  }
  function probeHTML() {
    if (probeState === 'hidden' || !recording) return '';
    const P = DATA.seniorIde.probe;
    if (probeState === 'answered') return `<div class="probe-card glass done"><div class="pc-head"><b>Techne · asking as a new grad</b>${App.synth()}<button class="gx" data-sact="probe-close">${icon('x')}</button></div>
      <p class="pc-thanks">${icon('check')}Thanks. Your twin drafted this into <b>Your twin’s drafts</b> for you to check before anyone sees it.</p>
      <button class="link sm" data-sact="to-drafts">Open Your Home ${icon('arrow')}</button></div>`;
    return `<div class="probe-card glass">
      <div class="pc-head"><b>Techne · asking as a new grad</b>${App.synth()}<button class="gx" data-sact="probe-later" title="Save for later">${icon('x')}</button></div>
      <p class="pc-q">${P.q}</p>
      <span class="chip">${icon('terminal')}${P.at}</span>
      ${whyHTML(P.lineage)}
      ${rateHTML()}
      <textarea id="probe-a" rows="2" placeholder="A sentence is enough" data-script="probe"></textarea>
      <div class="pc-acts"><button class="btn ghost sm" data-sact="probe-later">Ask me tonight</button><button class="btn primary sm" data-sact="probe-answer">Answer</button></div>
    </div>`;
  }

  // The 4:18 question may already be answered on the card; the interview doesn't ask it twice
  function skipAnswered() { while (qIndex < DATA.interview.length && DATA.interview[qIndex].given) qIndex++; }

  // Small popover explaining why Techne flagged a moment, anchored to whatever was clicked
  function showMoment(i, anchor) {
    const m = DATA.seniorIde.moments[i];
    const ide = host.querySelector('.sp-ide');
    ide.querySelector('.mpop')?.remove();
    const pop = document.createElement('div');
    pop.className = 'mpop';
    pop.innerHTML = `<div class="mp-head">${icon('star')}<b>Key moment · ${m.time}</b><button class="gx" data-sact="moment-close">${icon('x')}</button></div>
      <div class="mp-label">${m.label}</div><p>${m.reason}</p>
      <span class="mp-src">${icon('terminal')}Captured from your terminal</span>`;
    ide.appendChild(pop);
    const a = App.rel(anchor, ide), W = ide.clientWidth;
    const left = Math.min(Math.max(12, a.x + a.w / 2 - 150), W - 312);
    // open below things near the top (timeline, sidebar), above things near the bottom (terminal)
    if (a.y < ide.clientHeight / 2) pop.style.top = `${a.y + a.h + 8}px`;
    else pop.style.bottom = `${ide.clientHeight - a.y + 8}px`;
    pop.style.left = `${left}px`;
    ide.querySelectorAll('[data-sact="moment"]').forEach(b => b.classList.toggle('active', +b.dataset.i === i));
  }

  // ── End-of-day interview ──
  function interviewHTML() {
    const Q = DATA.interview;
    const done = qIndex >= Q.length;
    const msgs = Q.slice(0, Math.min(qIndex + 1, Q.length)).map((q, i) => `
      <div class="msg ai"><div class="who">Techne ${App.synth()}</div><div class="abody"><p>${q.q}</p>${i === qIndex ? whyHTML(q.lineage) + rateHTML() : ''}</div></div>
      ${i < qIndex ? `<div class="msg me"><div class="bubble">${q.given}</div></div>` : ''}`).join('');
    return `<div class="modal-wrap iv-wrap"><div class="modal interview" role="dialog" aria-label="End-of-day interview">
      <div class="m-head"><div><span class="m-trig">${App.synth()}End-of-day interview · about 5 min</span><h2>Techne has ${Q.length} questions about today</h2></div><button class="gx" data-sact="iv-close" title="Finish later">${icon('x')}</button></div>
      <div class="iv-prog">${Q.map((_, i) => `<i class="${i < qIndex ? 'done' : i === qIndex ? 'on' : ''}"></i>`).join('')}<span>${done ? 'Done' : `Question ${qIndex + 1} of ${Q.length}`}</span></div>
      <div class="iv-thread" id="iv-thread">${msgs}
        ${done ? `<div class="msg ai"><div class="who">Techne ${App.synth()}</div><div class="abody"><p>Thanks, that’s all. Your twin drafted <b>“${DATA.interviewDraft.title}”</b> from your answers. It’s in Your twin’s drafts to check before it’s published.</p></div></div>` : ''}
      </div>
      ${done ? `<div class="m-foot"><span class="mut">${icon('shield')}Your answers stay in your twin until you approve them.</span><button class="btn primary" data-sact="iv-review">Review the draft ${icon('arrow')}</button></div>`
        : `<div class="m-foot iv-input"><textarea id="iv-a" rows="2" placeholder="Answer in a sentence or two" data-script="iv"></textarea>
          <div class="iv-row"><button class="chip" data-sact="iv-skip">Skip this one</button><button class="btn primary" data-sact="iv-send">${icon('send')}Send</button></div></div>`}
    </div></div>`;
  }

  // ── Hot spots ──
  const COVER = { covered: ['st-ok', 'shield', 'Covered'], partial: ['st-warn', 'alert', 'Partly covered'], inferred: ['st-warn', 'alert', 'Inferred, awaiting check'], gap: ['st-bad', 'alert', 'Gap'] };
  // one square per question this month, coloured by how well a twin covers it
  const segs = h => Array.from({ length: h.n }, (_, i) => {
    const c = h.cover === 'covered' ? 'ok' : h.cover === 'gap' ? 'bad' : h.cover === 'partial' ? (i < h.n / 2 ? 'ok' : 'warn') : 'warn';
    return `<i class="${c}"></i>`;
  }).join('');
  function hotHTML() {
    return `<div class="page hot">
      <div class="hello"><h1>Hot spots</h1><p>Where new grads’ questions cluster this month. Gaps shape what Techne asks seniors next.</p>
        <div class="stats">
          <div><span>Questions this month</span><b>${DATA.hotspots.reduce((a, h) => a + h.n, 0)}</b></div>
          <div><span>Covered by a twin</span><b><i class="dot" style="background:var(--green)"></i>${DATA.hotspots.filter(h => h.cover === 'covered').length} of ${DATA.hotspots.length}</b></div>
          <div><span>Gaps</span><b><i class="dot" style="background:var(--red)"></i>${DATA.hotspots.filter(h => h.cover === 'gap').length}</b></div>
        </div></div>
      <div class="hot-grid">
        <div class="card">
          <div class="cover-legend"><span><i style="background:var(--green)"></i>Covered</span><span><i style="background:#F0A23B"></i>Partly covered or inferred</span><span><i style="background:var(--red)"></i>Gap</span></div>
          <table class="htable"><thead><tr><th>Topic</th><th>Questions this month</th><th>Trend</th><th>Coverage</th><th>Next</th></tr></thead>
          <tbody>${DATA.hotspots.map(h => { const [cls, ic, lab] = COVER[h.cover]; return `<tr>
            <td><b>${h.topic}</b></td>
            <td><div class="segrow"><span class="segs">${segs(h)}</span><span class="segs-n">${h.n}</span></div></td>
            <td class="trend ${h.trend > 0 ? 'up' : h.trend < 0 ? 'down' : ''}">${h.trend === null ? 'New' : h.trend === 0 ? 'Flat' : `${h.trend > 0 ? '↑' : '↓'} ${Math.abs(h.trend)}%`}</td>
            <td><span class="stag ${cls} mini">${icon(ic)}${lab}${h.twin ? ` · ${App.twinName(h.twin)}` : ''}</span></td>
            <td class="mut">${h.cluster ? `<button class="link sm cl-link" data-sact="cluster" data-cl="${h.cluster}">${h.next} ${icon('arrow')}</button>` : h.next || '—'}</td></tr>`; }).join('')}</tbody></table>
        </div>
        <div class="card nova-card">
          <div class="chead"><span class="ctitle">Upcoming interviews</span>${App.synth()}</div>
          <p class="csub">Techne interviews seniors about gaps, 5 minutes at the end of their day.</p>
          <ul class="ivs">${DATA.interviewsPlanned.map(([who, topic, when, cl]) => `<li><button class="iv-link" data-sact="cluster" data-cl="${cl}"><span class="avatar sm light">${who[0]}</span><div><b>${topic}</b><span>with ${who} · ${when}</span></div>${icon('chev-right')}</button></li>`).join('')}</ul>
          <button class="link sm" data-sact="cluster" data-cl="">${icon('info')}How Techne’s questions are built</button>
        </div>
      </div>
    </div>`;
  }

  // ── How Techne's questions are built ──
  let focusCluster = null;
  function personaHTML() {
    const P = DATA.personaPage;
    return `<div class="page persona">
      <div class="hello"><h1>How Techne’s questions are built</h1>
        <p>When Techne interviews seniors, it asks as a synthetic new grad: the questions real new grads ask, so seniors’ twins learn the why.</p></div>
      <section class="ps-sec">
        <div class="ps-h"><h2>Built from</h2><span>Real questions, anonymised. Refreshed weekly.</span></div>
        <div class="card ps-clusters">${P.clusters.map(c => `<div class="ps-cl ${focusCluster === c.id ? 'flash' : ''}" id="cl-${c.id}">
            <div class="ps-cl-main"><b>${c.name}</b><span>“${c.ex}”</span></div>
            <span class="ps-n"><b>${c.n}</b> questions this month</span></div>`).join('')}</div>
        <div class="ps-other">${P.other.map(([n, l, sub]) => `<div class="card"><b>${n}</b><span>${l}</span><small>${sub}</small></div>`).join('')}</div>
      </section>
      <section class="ps-sec">
        <div class="ps-h"><h2>The new grad Techne asks as</h2>${App.synth()}</div>
        <div class="ps-cols">
          <div class="card"><div class="ps-col-h">${icon('check')}Knows</div><ul>${P.knows.map(k => `<li>${k}</li>`).join('')}</ul></div>
          <div class="card gaps-card"><div class="ps-col-h">${icon('alert')}Doesn’t know yet</div><ul>${P.doesnt.map(k => `<li>${k}</li>`).join('')}</ul></div>
        </div>
        <p class="ps-cap">The gaps are on purpose. They make Techne ask what a new grad would.</p>
      </section>
      <section class="ps-sec">
        <div class="ps-h"><h2>Never used</h2></div>
        <div class="card ps-never">${P.never.map(([ic, t]) => `<div>${icon(ic)}<span>${t}</span></div>`).join('')}</div>
      </section>
      <section class="ps-sec">
        <div class="ps-h"><h2>How we know it’s any good</h2></div>
        <div class="ps-quality">
          <div class="card ps-stat"><b>${P.quality.match}</b><span>${P.quality.matchText}</span></div>
          <div class="card ps-stat"><b>${P.quality.useful}</b><span>Seniors rated Techne’s questions Useful</span></div>
          <div class="card ps-stat small"><span class="ps-ver">${icon('replay')}${P.quality.version}</span><span>Every Useful or Not relevant a senior taps tunes the next version.</span></div>
        </div>
      </section>
    </div>`;
  }

  function render(scr, el) {
    host = el;
    if (scr === 'persona') {
      el.innerHTML = personaHTML();
      if (focusCluster) { const t = el.querySelector(`#cl-${focusCluster}`); t?.scrollIntoView({ block: 'center' }); focusCluster = null; }
      else el.scrollTop = 0;
      return;
    }
    if (scr === 'ide') {
      if (probeState === 'hidden') later(() => { probeState = 'asking'; if (host.querySelector('.sp-ide')) rerender('ide'); }, 1400);
      el.innerHTML = ideHTML();
    } else if (scr === 'hot') el.innerHTML = hotHTML();
    else el.innerHTML = GradPages.reportHTML('senior');
  }
  function rerender(scr) {
    const iv = host.querySelector('.iv-wrap');
    render(scr, host);
    if (iv) host.insertAdjacentHTML('beforeend', interviewHTML());
  }
  function openInterview() {
    host.querySelector('.iv-wrap')?.remove();
    host.insertAdjacentHTML('beforeend', interviewHTML());
    const th = $('#iv-thread');
    if (th) th.scrollTop = th.scrollHeight;
  }

  function onAct(act, el) {
    switch (act) {
      case 'moment': showMoment(+el.dataset.i, el); break;
      case 'cluster': focusCluster = el.dataset.cl || null; App.set({ role: 'senior', screen: 'persona' }); break;
      case 'moment-close': host.querySelector('.mpop')?.remove(); host.querySelectorAll('[data-sact="moment"].active').forEach(b => b.classList.remove('active')); break;
      case 'moments-list': momentsOpen = !momentsOpen; rerender('ide'); break;
      case 'pause':
        recording = !recording;
        App.toast(recording ? `${icon('record')}Recording again.` : `${icon('pause')}Recording paused. Nothing is captured until you resume.`);
        rerender('ide');
        break;
      case 'probe-answer':
        finishTyping($('#probe-a'));
        if (!$('#probe-a').value.trim()) { $('#probe-a').focus(); return; }
        DATA.interview.find(q => q.moment === DATA.seniorIde.probe.moment).given = $('#probe-a').value.trim();
        probeState = 'answered'; Senior.freshRestart(); rerender('ide'); break;
      case 'probe-later': probeState = 'later'; App.toast(`${icon('clock')}Saved for tonight’s interview.`); rerender('ide'); break;
      case 'probe-close': probeState = 'later'; rerender('ide'); break;
      case 'to-drafts': App.set({ screen: 'home' }); break;
      case 'interview': skipAnswered(); openInterview(); break;
      case 'rate-up': App.toast(`${icon('check')}Thanks. Techne will ask more questions like this.`); el.closest('.rate').classList.add('done'); break;
      case 'rate-down': App.toast(`${icon('x')}Got it. Techne will ask fewer questions like this.`); el.closest('.rate').classList.add('done'); break;
      case 'iv-send': case 'iv-skip': {
        if (act === 'iv-send') finishTyping($('#iv-a'));
        const a = $('#iv-a')?.value.trim();
        if (act === 'iv-send' && !a) { $('#iv-a').focus(); return; }
        DATA.interview[qIndex].given = act === 'iv-skip' ? '(Skipped. Techne will ask another day.)' : a;
        qIndex++;
        skipAnswered();
        openInterview();
        break;
      }
      case 'iv-close': host.querySelector('.iv-wrap')?.remove(); App.toast(`${icon('clock')}Interview saved. Pick it up any time today.`); break;
      case 'iv-review': host.querySelector('.iv-wrap')?.remove(); Senior.addInterviewDraft(); App.set({ screen: 'home' }); break;
    }
  }

  // Answer fields type out the scripted answer, whatever keys are pressed, so a live walkthrough never stalls on typing
  const scriptFor = el => el.dataset.script === 'probe' ? DATA.seniorIde.probe.answer : DATA.interview[qIndex]?.answer || '';
  let typing = null;
  function startTyping(el) {
    if (el.dataset.typed || typing) return;
    const text = scriptFor(el);
    el.value = '';
    let i = 0;
    const step = () => {
      el.value = text.slice(0, ++i);
      el.scrollTop = el.scrollHeight;
      if (i < text.length) typing = setTimeout(step, 18 + Math.random() * 26);
      else { typing = null; el.dataset.typed = '1'; }
    };
    step();
  }
  function finishTyping(el) {
    if (!el) return;
    if (typing || !el.dataset.typed && el.value) { clearTimeout(typing); typing = null; el.value = scriptFor(el); el.dataset.typed = '1'; }
  }
  document.addEventListener('keydown', e => {
    const el = e.target.closest?.('textarea[data-script]');
    if (!el || e.metaKey || e.ctrlKey || ['Tab', 'Shift', 'Alt', 'Meta', 'Control', 'CapsLock', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Enter' && el.dataset.typed) { host.querySelector(el.dataset.script === 'probe' ? '[data-sact="probe-answer"]' : '[data-sact="iv-send"]')?.click(); return; }
    startTyping(el);
  }, true);
  // paste, dictation and IME also produce the scripted answer
  document.addEventListener('beforeinput', e => {
    const el = e.target.closest?.('textarea[data-script]');
    if (!el) return;
    e.preventDefault();
    startTyping(el);
  }, true);

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-sact]');
    if (b && host?.contains(b)) onAct(b.dataset.sact, b);
  });

  function stop() { timers.forEach(clearTimeout); timers = []; }
  function reset() { focusCluster = null; stop(); clearTimeout(typing); typing = null; recording = true; probeState = 'hidden'; qIndex = 0; momentsOpen = false; DATA.interview.forEach(q => delete q.given); }
  return { render, stop, reset };
})();
