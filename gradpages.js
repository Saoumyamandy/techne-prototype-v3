// New grad pages beside the code: Your twin (archive), learning path, onboarding and permissions.
// The year-end report renderer is shared with the senior side.
const GradPages = (() => {
  const $ = s => document.querySelector(s);
  const icon = n => App.icon(n);
  let items = DATA.archive.map(a => ({ ...a }));
  let topic = null, onbStep = 2, onbRole = 'grad';

  const TYPE = { walk: ['twin', 'Walkthrough'], question: ['message', 'Question'], saved: ['archive', 'Saved work'], note: ['edit', 'Note'] };
  const VIS = { private: ['lock', 'Only you'], shared: ['users', 'Shared with team'], published: ['coin', 'Published'] };

  // Older items not shown on the timeline, so the sidebar count and the page agree
  const OLDER = 17;
  const total = () => OLDER + items.length;
  function add(item) {
    items = items.filter(i => i.title !== item.title);
    items.unshift({ id: 'z' + Date.now(), date: 'Oct 30', fresh: true, ...item });
  }
  function addSaved(shared) {
    items = items.filter(i => i.id !== 'z0');
    items.unshift({ id: 'z0', date: 'Oct 30', type: 'saved', title: 'Added PDF invoices to the vendor file copy', with: 'With Priya R.’s twin · commit 3f2a91c', topics: ['Vendor files', 'PDF invoices'], vis: shared ? 'shared' : 'private', fresh: true });
  }

  // ── Your twin: knowledge graph + timeline ──
  function archiveHTML() {
    const shared = items.filter(i => i.vis !== 'private').length;
    const g = DATA.graph;
    const pos = Object.fromEntries(g.nodes.map(n => [n.id, n]));
    const counts = t => items.filter(i => i.topics.includes(t)).length;
    const svg = `<svg viewBox="0 0 560 360" class="kgraph" role="img" aria-label="Topics in your twin">
      ${g.links.map(([a, b]) => `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" class="kl ${topic && (a === topic || b === topic) ? 'on' : ''}"/>`).join('')}
      ${g.nodes.map(n => `<g class="kn ${topic === n.id ? 'on' : ''} ${counts(n.id) ? '' : 'empty'}" data-topic="${n.id}" tabindex="0">
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}"/>
        <text x="${n.x}" y="${n.y + n.r + 14}" text-anchor="middle">${n.id}</text>
        ${counts(n.id) ? `<text x="${n.x}" y="${n.y + 4}" text-anchor="middle" class="kc">${counts(n.id)}</text>` : ''}</g>`).join('')}
    </svg>`;
    const list = items.filter(i => !topic || i.topics.includes(topic));
    return `<div class="gp archive">
      <div class="gp-head">
        <div><h1>Your twin</h1><p>Everything you’ve done and learned, built up as you work. Private by default: only you see it until you share something.</p></div>
        <div class="gp-stats"><span><b>${total()}</b> items</span><span><b>${shared}</b> shared</span><span><b>45</b> credits</span></div>
      </div>
      <div class="arch-grid">
        <div class="card graph-card">
          <div class="chead"><span class="ctitle">What your twin knows</span>${topic ? `<button class="link sm" data-gact="clear">${icon('x')}Show all</button>` : '<span class="csub inline">Click a topic to filter</span>'}</div>
          ${svg}
        </div>
        <div class="card tl-card">
          <div class="chead"><span class="ctitle">Timeline${topic ? ` · ${topic}` : ''}</span><span class="csub inline">${topic ? `${list.length} items` : `Latest ${list.length} of ${total()}`}</span></div>
          <ol class="atl">${list.map(i => {
            const [ti, tl] = TYPE[i.type], [vi, vl] = VIS[i.vis];
            return `<li class="${i.fresh ? 'fresh' : ''}"><span class="atl-date">${i.date}</span><span class="kicon k-${i.type}">${icon(ti)}</span>
              <div class="atl-main"><b>${i.title}</b><span>${tl} · ${i.with}</span><div class="atl-tags">${i.topics.map(t => `<span class="topic">${t}</span>`).join('')}</div></div>
              <div class="atl-vis"><span class="vis-chip v-${i.vis}">${icon(vi)}${vl}</span>${i.vis === 'private' ? `<button class="btn ghost sm" data-gact="share" data-id="${i.id}">Share for credits</button>` : ''}</div></li>`;
          }).join('')}</ol>
        </div>
      </div>
    </div>`;
  }

  // ── Learning path: your twin next to a senior's twin ──
  function learnHTML() {
    const L = DATA.learning;
    return `<div class="gp learn">
      <div class="gp-head"><div><h1>Learning path</h1><p>Where you are against Priya R.’s twin, and what to learn next for your target role.</p></div>
        <label class="pb-like">Target role <select id="target-role"><option>${L.role}</option><option>Batch operations engineer</option><option>Reporting engineer</option></select></label></div>
      <div class="learn-grid">
        <div class="card">
          <div class="chead"><span class="ctitle">Your twin vs Priya R.’s twin</span><span class="legend2"><i class="me"></i>You <i class="sr"></i>Priya</span></div>
          <ul class="cmp">${L.compare.map(([t, me, sr]) => `<li><span>${t}</span><div class="bars"><i class="sr" style="width:${sr}%"></i><i class="me" style="width:${me}%"></i></div><b>${me}%</b></li>`).join('')}</ul>
          <p class="basis">${icon('info')}${L.basis}</p>
        </div>
        <div class="card">
          <div class="ctitle">Your next 4 weeks</div>
          <ol class="weeks">${L.weeks.map(w => `<li class="${w.items.some(i => i[1] === 'now') ? 'cur' : w.items.every(i => i[1] === 'done') ? 'done' : ''}">
            <span class="wk">Week ${w.w}</span><div><b>${w.title}</b><ul>${w.items.map(([t, s]) => `<li class="s-${s}">${icon(s === 'done' ? 'check' : s === 'now' ? 'play' : 'chev-right')}${t}${s === 'now' ? '<em>In progress</em>' : ''}</li>`).join('')}</ul></div></li>`).join('')}</ol>
          <button class="btn primary" data-gact="quiz">${icon('twin')}Ask Priya’s twin to quiz you</button>
        </div>
      </div>
    </div>`;
  }

  // ── Onboarding and what Techne records ──
  const STEPS = ['Who you are', 'Your twin', 'What Techne records', 'Done'];
  function onboardHTML() {
    const body = [
      `<h2>Who are you?</h2><p>This sets what your twin learns first.</p>
        <div class="role-cards">
          <label><input type="radio" name="orole" value="grad" ${onbRole === 'grad' ? 'checked' : ''}><div>${icon('user')}<b>New grad</b><span>Get unblocked, build a record of good work</span></div></label>
          <label><input type="radio" name="orole" value="senior" ${onbRole === 'senior' ? 'checked' : ''}><div>${icon('twin')}<b>Senior engineer</b><span>Teach your twin, approve what the team learns</span></div></label>
        </div>
        <label class="m-label" for="orole-sel">${onbRole === 'grad' ? 'Target role' : 'Your expertise'}</label>
        <select id="orole-sel" class="sel">${(onbRole === 'grad' ? ['Procurement engineer', 'Batch operations engineer', 'Reporting engineer'] : ['COBOL and procurement', 'JCL and batch', 'Reporting data']).map(o => `<option>${o}</option>`).join('')}</select>`,
      `<h2>Meet your twin</h2><p>Every engineer at the company has a twin that grows with their career.</p>
        <div class="explain">
          <div>${icon('twin')}<b>Your twin</b><span>Learns from what you save: tasks, walkthroughs, questions. Private until you share.</span></div>
          <div>${icon('sparkle')}<b>Senior Techne</b><span>Routes your questions to the senior whose twin knows the answer, and always tells you whose it is.</span></div>
          <div>${App.synth()}<b>Techne, as a new grad</b><span>When Techne interviews seniors, it asks the questions real new grads ask, so their twins learn the why. Never a real person.</span></div>
        </div>`,
      `<h2>What Techne records</h2><p>You choose. You can change this any time from the sidebar.</p>
        <div class="perm">
          ${[['In the IDE', [['Commands and errors', true], ['Files you change', true], ['Code you write', true]]],
             ['In the browser', [['Docs, runbooks and tickets', true], ['Every other site', false, 'Never recorded']]],
             ['Elsewhere', [['Screen video', false, 'Off by default, opt in per task'], ['#proc Slack channels', true], ['Slack DMs', false]]]].map(([g, rows]) =>
            `<div class="perm-g"><b>${g}</b>${rows.map(([l, on, hint]) => `<label class="switch-row"><input type="checkbox" ${on ? 'checked' : ''} ${hint === 'Never recorded' ? 'disabled' : ''}><span class="sw"><i></i></span>${l}${hint ? `<small>${hint}</small>` : ''}</label>`).join('')}</div>`).join('')}
          <div class="perm-g"><b>Never record</b><div class="never">${['Personal email', 'HR portal', 'Banking', 'Health sites'].map(n => `<span class="chip">${n}${icon('x')}</span>`).join('')}<button class="chip add">${icon('plus')}Add</button></div></div>
        </div>
        <ol class="promises">
          <li>${icon('lock')}<div><b>Private until you share.</b><span>Your twin is yours. Nobody sees anything in it until you choose to share it.</span></div></li>
          <li>${icon('pause')}<div><b>Pause any time.</b><span>One click stops recording. Nothing is captured until you resume.</span></div></li>
          <li>${icon('shield')}<div><b>Never used in performance reviews.</b><span>You can see, edit and delete anything in your twin. Your manager only sees what you choose to share.</span></div></li>
        </ol>`,
      `<h2>You’re set</h2><p>Your twin starts learning from your next task. Senior Techne is on, so it’ll offer help when something breaks.</p>
        <ul class="summary"><li>${icon('check')}${onbRole === 'grad' ? 'Target role: Procurement engineer' : 'Expertise: COBOL and procurement'}</li><li>${icon('check')}Recording: IDE, docs and #proc channels</li><li>${icon('check')}Screen video: off</li><li>${icon('check')}Never recorded: 4 kinds of site</li></ul>
        <button class="btn primary" data-gact="to-ide">${icon('code')}Open the IDE</button>`,
    ][onbStep];
    return `<div class="gp onboard"><div class="onb-card card">
      <ol class="stepper">${STEPS.map((s, i) => `<li class="${i === onbStep ? 'on' : i < onbStep ? 'done' : ''}"><span class="sn">${i < onbStep ? icon('check') : i + 1}</span>${s}</li>`).join('')}</ol>
      <div class="onb-body">${body}</div>
      <div class="onb-foot">${onbStep > 0 ? '<button class="btn ghost" data-gact="onb-back">Back</button>' : '<span></span>'}${onbStep < 3 ? `<button class="btn dark" data-gact="onb-next">Next ${icon('arrow')}</button>` : ''}</div>
    </div></div>`;
  }

  // ── Year-end report, owned by the person (both roles) ──
  function reportHTML(role) {
    const R = DATA.report[role];
    return `<div class="gp report">
      <div class="gp-head"><div><span class="own">${icon('lock')}Owned by you · only you see this</span><h1>${R.title}</h1><p>${R.who} · ${R.period}</p></div>
        <div class="rep-acts"><button class="btn ghost" data-gact="rep-share">${icon('send')}Share with my manager</button><button class="btn primary" data-gact="rep-download">${icon('arrow')}Download for yourself</button></div></div>
      <div class="rep-stats">${R.stats.map(([n, l]) => `<div class="card"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
      <div class="learn-grid">
        <div class="card"><div class="ctitle">How your twin grew</div>
          <ul class="cmp">${R.growth.map(([t, a, b]) => `<li><span>${t}</span><div class="bars"><i class="sr" style="width:${b}%"></i><i class="me was" style="width:${a}%"></i></div><b>${a}→${b}%</b></li>`).join('')}</ul>
          <span class="legend2"><i class="was"></i>Start of year <i class="sr"></i>Now</span></div>
        <div class="card"><div class="ctitle">Highlights</div><ul class="hl-list">${R.highlights.map(h => `<li>${icon('star')}${h}</li>`).join('')}</ul></div>
      </div>
      <p class="rep-note">${icon('shield')}Built from what you saved and shared. Recordings are never used in performance reviews, and your manager sees this report only if you share it.</p>
    </div>`;
  }

  let host = null, current = null;
  function render(scr, el) {
    host = el; current = scr;
    el.innerHTML = scr === 'archive' ? archiveHTML() : scr === 'learn' ? learnHTML() : scr === 'onboard' ? onboardHTML() : reportHTML('grad');
    if (scr === 'onboard') el.querySelectorAll('input[name="orole"]').forEach(r => r.onchange = () => { onbRole = r.value; render('onboard', el); });
  }

  function onAct(act, el) {
    switch (act) {
      case 'share': {
        const it = items.find(i => i.id === el.dataset.id);
        it.vis = 'shared';
        App.toast(`${icon('users')}Shared. A senior reviews it in the Question Queue before it joins team docs. +10 credits if approved.`);
        break;
      }
      case 'clear': topic = null; break;
      case 'quiz': App.toast(`${icon('twin')}Priya’s twin will quiz you on vendor files at the end of the day. 5 questions.`); return;
      case 'onb-next': onbStep = Math.min(3, onbStep + 1); break;
      case 'onb-back': onbStep = Math.max(0, onbStep - 1); break;
      case 'to-ide': onbStep = 2; App.set({ screen: 'ide' }); return;
      case 'rep-download': App.toast(`${icon('check')}Downloaded your-year-2026.pdf. It’s yours to keep.`); return;
      case 'rep-share': {
        const where = el.closest('.gp');
        where.querySelector('.rep-modal')?.remove();
        where.insertAdjacentHTML('beforeend', `<div class="modal-wrap rep-modal"><div class="modal rep-preview" role="dialog" aria-label="Share with your manager">
          <div class="m-head"><div><span class="m-trig">${icon('lock')}Nothing is sent until you press Share</span><h2>Choose what your manager sees</h2></div><button class="gx" data-gact="rep-close">${icon('x')}</button></div>
          <div class="m-body"><div class="share-list">${[['Your numbers', 'Tasks saved, walkthroughs, docs published, credits'], ['How your twin grew', 'Topics at the start of the year and now'], ['Highlights', '3 things you did that helped the team']].map(([t, d], i) =>
            `<label class="share-row"><input type="checkbox" ${i < 2 ? 'checked' : ''}><div><b>${t}</b><span>${d}</span></div></label>`).join('')}</div>
            <p class="share-note">${icon('shield')}Recordings and your private twin are never included.</p></div>
          <div class="m-foot"><span class="mut">You can take it back any time.</span><button class="btn ghost" data-gact="rep-close">Cancel</button><button class="btn primary" data-gact="rep-send">${icon('send')}Share</button></div></div></div>`);
        return;
      }
      case 'rep-close': el.closest('.rep-modal').remove(); return;
      case 'rep-send': { const n = el.closest('.modal').querySelectorAll('input:checked').length; el.closest('.rep-modal').remove(); App.toast(`${icon('send')}Shared ${n} section${n === 1 ? '' : 's'} with your manager. You can take it back any time.`); return; }
    }
    render(current, host);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-gact]');
    if (b) { onAct(b.dataset.gact, b); return; }
    const n = e.target.closest('.kn');
    if (n && host?.contains(n)) { topic = topic === n.dataset.topic ? null : n.dataset.topic; render('archive', host); }
  });

  function reset() { items = DATA.archive.map(a => ({ ...a })); topic = null; onbStep = 2; onbRole = 'grad'; }
  return { render, reportHTML, add, addSaved, total, reset, items: () => items };
})();
