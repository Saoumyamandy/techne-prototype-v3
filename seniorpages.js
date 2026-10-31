// Senior pages: Your IDE (recording + Techne's in-IDE question), the end-of-day interview,
// hot spots, and the senior's year-end report. When Techne asks as a new grad it is synthetic, and always badged as such.
const SeniorPages = (() => {
  const $ = s => document.querySelector(s);
  const icon = n => App.icon(n);
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  let host = null, recording = true, probeState = 'hidden', qIndex = 0;

  const builtFrom = () => `<details class="built"><summary>${icon('info')}Built from</summary><ul>${DATA.persona.builtFrom.map(b => `<li>${b}</li>`).join('')}</ul><p>${DATA.persona.note}</p></details>`;

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
        <ul class="twin-today"><li>${icon('video')}<span>2 sessions recorded</span></li><li>${icon('star')}<span>3 key moments found</span></li><li>${icon('sparkle')}<span>3 questions from Techne</span></li></ul>
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
        <div class="body"><div class="work">
          <div class="editor">${I.code.map((l, i) => `<div class="ln ${i === 6 ? 'key' : ''}"><span class="n">${i + 1}</span><span class="lc">${hlJcl(l)}</span></div>`).join('')}</div>
          <div class="term"><div class="term-tabs"><span class="on">${icon('terminal')}Terminal</span><span class="term-right">zsh · procurement-batch</span></div>
            <div class="term-body">${I.term.map(([k, t]) => k === 'cmd' ? `<div class="tl"><span class="pr">priya@techne</span> <span class="pd">procurement-batch</span> <span class="pc">%</span> ${t}</div>` : `<div class="tl">${t}</div>`).join('')}
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
      <textarea id="probe-a" rows="2" placeholder="A sentence is enough"></textarea>
      <div class="pc-acts"><button class="chip add" data-sact="probe-sample">Use a sample answer</button><button class="btn ghost sm" data-sact="probe-later">Ask me tonight</button><button class="btn primary sm" data-sact="probe-answer">Answer</button></div>
      ${builtFrom()}
    </div>`;
  }

  // ── End-of-day interview ──
  function interviewHTML() {
    const Q = DATA.interview;
    const done = qIndex >= Q.length;
    const msgs = Q.slice(0, Math.min(qIndex + 1, Q.length)).map((q, i) => `
      <div class="msg ai"><div class="who">Techne ${App.synth()}</div><div class="abody"><p>${q.q}</p></div></div>
      ${i < qIndex ? `<div class="msg me"><div class="bubble">${q.answer || q.sample}</div></div>` : ''}`).join('');
    return `<div class="modal-wrap iv-wrap"><div class="modal interview" role="dialog" aria-label="End-of-day interview">
      <div class="m-head"><div><span class="m-trig">${App.synth()}End-of-day interview · about 5 min</span><h2>Techne has ${Q.length} questions about today</h2></div><button class="gx" data-sact="iv-close" title="Finish later">${icon('x')}</button></div>
      <div class="iv-prog">${Q.map((_, i) => `<i class="${i < qIndex ? 'done' : i === qIndex ? 'on' : ''}"></i>`).join('')}<span>${done ? 'Done' : `Question ${qIndex + 1} of ${Q.length}`}</span></div>
      <div class="iv-thread" id="iv-thread">${msgs}
        ${done ? `<div class="msg ai"><div class="who">Techne ${App.synth()}</div><div class="abody"><p>Thanks, that’s all. Your twin drafted <b>“${DATA.interviewDraft.title}”</b> from your answers. It’s in Your twin’s drafts to check before it’s published.</p></div></div>` : ''}
      </div>
      ${done ? `<div class="m-foot"><span class="mut">${icon('shield')}Your answers stay in your twin until you approve them.</span><button class="btn primary" data-sact="iv-review">Review the draft ${icon('arrow')}</button></div>`
        : `<div class="m-foot iv-input"><textarea id="iv-a" rows="2" placeholder="Answer in a sentence or two"></textarea>
          <div class="iv-row"><button class="chip add" data-sact="iv-sample">Use a sample answer</button><button class="chip" data-sact="iv-skip">Skip this one</button><button class="btn primary" data-sact="iv-send">${icon('send')}Send</button></div></div>`}
      ${builtFrom()}
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
            <td class="mut">${h.next || '—'}</td></tr>`; }).join('')}</tbody></table>
        </div>
        <div class="card nova-card">
          <div class="chead"><span class="ctitle">Upcoming interviews</span>${App.synth()}</div>
          <p class="csub">Techne interviews seniors about gaps, 5 minutes at the end of their day.</p>
          <ul class="ivs">${DATA.interviewsPlanned.map(([who, topic, when]) => `<li><span class="avatar sm light">${who[0]}</span><div><b>${topic}</b><span>with ${who} · ${when}</span></div></li>`).join('')}</ul>
          ${builtFrom()}
        </div>
      </div>
    </div>`;
  }

  function render(scr, el) {
    host = el;
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

  function onAct(act) {
    switch (act) {
      case 'pause':
        recording = !recording;
        App.toast(recording ? `${icon('record')}Recording again.` : `${icon('pause')}Recording paused. Nothing is captured until you resume.`);
        rerender('ide');
        break;
      case 'probe-sample': $('#probe-a').value = DATA.seniorIde.probe.sample; break;
      case 'probe-answer':
        if (!$('#probe-a').value.trim()) { $('#probe-a').focus(); return; }
        probeState = 'answered'; Senior.addInterviewDraft(); rerender('ide'); break;
      case 'probe-later': probeState = 'later'; App.toast(`${icon('clock')}Saved for tonight’s interview.`); rerender('ide'); break;
      case 'probe-close': probeState = 'later'; rerender('ide'); break;
      case 'to-drafts': App.set({ screen: 'home' }); break;
      case 'interview': qIndex = Math.min(qIndex, DATA.interview.length); openInterview(); break;
      case 'iv-sample': $('#iv-a').value = DATA.interview[qIndex].sample; break;
      case 'iv-send': case 'iv-skip': {
        const a = $('#iv-a')?.value.trim();
        if (act === 'iv-send' && !a) { $('#iv-a').focus(); return; }
        DATA.interview[qIndex].answer = act === 'iv-skip' ? '(Skipped. Techne will ask another day.)' : a;
        qIndex++;
        openInterview();
        break;
      }
      case 'iv-close': host.querySelector('.iv-wrap')?.remove(); App.toast(`${icon('clock')}Interview saved. Pick it up any time today.`); break;
      case 'iv-review': host.querySelector('.iv-wrap')?.remove(); Senior.addInterviewDraft(); App.set({ screen: 'home' }); break;
    }
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-sact]');
    if (b && host?.contains(b)) onAct(b.dataset.sact);
  });

  function stop() { timers.forEach(clearTimeout); timers = []; }
  function reset() { stop(); recording = true; probeState = 'hidden'; qIndex = 0; DATA.interview.forEach(q => delete q.answer); }
  return { render, stop, reset };
})();
