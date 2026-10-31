// Senior view. Two lists with two ownership models:
// - Your twin's drafts (Home): delegated to you only, never locked.
// - Question Queue: shared by every senior, first come first served, with claims.
// Nothing is approved in one click: every item opens for review first, and approvals can be undone.
const Senior = (() => {
  const $ = s => document.querySelector(s);
  const icon = n => App.icon(n);
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  let body, sheetWrap;
  let screen = 'home', credits = 1240, flagged = null, interviewDone = false;
  let drafts, queue, docs;
  let draftTab = 'todo', queueTab = 'todo', queueFilter = 'all', testOpen = false;
  let repoTopic = 'All', repoQuery = '', repoSort = 'used', repoSel = null;

  const DRAFT_KIND = {
    session: ['video', () => 'From your session'],
    sent: ['send', d => `Sent to you · ${d.askedBy} asked`],
    sessans: ['video', () => 'From your session + your answer'],
    interview: ['twin', () => 'From your interview with Techne'],
  };
  const QUEUE_KIND = {
    workaround: ['flag', 'Workaround to check'],
    uncovered: ['alert', 'Uncovered question'],
    answer: ['message', 'Drafted answer to check'],
    published: ['user', 'Published by a new grad'],
  };

  function reset() {
    drafts = DATA.drafts.map(d => ({ ...d, status: 'todo' }));
    if (restartFresh) Object.assign(drafts.find(x => x.id === 'd-restart'), { fresh: true, ago: 'just now' });
    if (interviewDone) drafts.unshift({ ...DATA.interviewDraft, status: 'todo', fresh: true });
    queue = DATA.queue.map(q => ({ ...q, status: 'todo' }));
    docs = DATA.docs.map(d => ({ ...d }));
    credits = 1240;
    $('#credits').textContent = '1,240';
    draftTab = 'todo'; queueTab = 'todo'; queueFilter = 'all'; testOpen = false;
    repoTopic = 'All'; repoQuery = ''; repoSel = null;
    SeniorPages.reset();
  }
  const todoDrafts = () => drafts.filter(d => d.status === 'todo');
  const openQs = () => queue.filter(q => q.status === 'todo' && q.claimedBy !== 'Dev K.');

  function updateCounts() {
    $('#home-count').textContent = todoDrafts().length;
    $('#queue-count').textContent = openQs().length;
  }

  // ── shared bits ──
  function pieSVG(parts, size = 150) {
    const c = size / 2, R = c - 4;
    let a = -Math.PI / 2, paths = '';
    parts.forEach(p => {
      const b = a + p.v / 100 * Math.PI * 2;
      const [x1, y1, x2, y2] = [c + R * Math.cos(a), c + R * Math.sin(a), c + R * Math.cos(b), c + R * Math.sin(b)];
      paths += `<path d="M${c} ${c} L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${b - a > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z" fill="${p.fill}" stroke="var(--surface)" stroke-width="2.5" stroke-linejoin="round"/>`;
      a = b;
    });
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="var(--green-soft)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--green)" stroke-width="2.4"/></pattern></defs>${paths}</svg>`;
  }
  const legend = parts => parts.map(p => `<li><i class="sw ${p.sw || ''}" style="${p.sw ? '' : `background:${p.fill}`}"></i><span>${p.label}</span><b>${p.v}%</b></li>`).join('');
  function shot(r) {
    const tree = r.tree.map((t, i) => `<div class="mt ${i === r.treeOn ? 'on' : ''} ${/\./.test(t) ? 'f' : 'd'}">${t}</div>`).join('');
    const code = r.code.map(([n, l]) => `<div class="mc ${n === r.hl ? 'hl' : ''}"><span>${n}</span>${l || ' '}</div>`).join('');
    const term = r.term.map(l => `<div>${l.replace(/<r>/g, '<em>').replace(/<\/r>/g, '</em>')}</div>`).join('');
    return `<div class="shot-frame"><div class="shot-bar"><span class="sd"><i></i><i></i><i></i></span><span>${r.file}</span><span class="mut">Techne IDE</span></div>
      <div class="shot-body"><div class="mtree"><div class="mbrand">Techne</div>${tree}</div><div class="mright"><div class="mcode">${code}</div><div class="mterm">${term}</div></div></div></div>`;
  }
  function addCredits(n) {
    const from = credits, to = credits + n, t0 = performance.now();
    credits = to;
    const pill = $('#credits-pill');
    pill.classList.remove('gain'); void pill.offsetWidth; pill.classList.add('gain');
    $('#credits-plus').textContent = `${n > 0 ? '+' : ''}${n}`;
    const tick = now => {
      const k = Math.min(1, (now - t0) / 700);
      $('#credits').textContent = Math.round(from + (to - from) * k).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const tabs = (name, cur, todo, done) => `<div class="ltabs" data-ltabs="${name}">
    <button class="${cur === 'todo' ? 'on' : ''}" data-val="todo">To do <b class="${todo ? 'hot' : ''}">${todo}</b></button>
    <button class="${cur === 'done' ? 'on' : ''}" data-val="done">Done <b>${done}</b></button></div>`;
  const RESULT = { approved: ['check', 'Approved · published'], sentback: ['send', 'Sent back to redraft'], answered: ['message', 'Answered'], noted: ['check', 'Approved with a note'] };
  const resultChip = r => `<span class="res res-${r}">${icon(RESULT[r][0])}${RESULT[r][1]}</span>`;

  // ═════════ YOUR HOME ═════════
  const EXPERTISE = [
    { label: 'COBOL', v: 46, fill: 'var(--ink)' }, { label: 'Procurement', v: 28, fill: 'url(#hatch)', sw: 'hatch' },
    { label: 'JCL & batch', v: 16, fill: 'var(--pie-3)' }, { label: 'Other', v: 10, fill: 'var(--pie-4)' },
  ];
  function homeHTML() {
    const nd = todoDrafts().length, nq = openQs().length;
    const K = DATA.twinKnows;
    return `<div class="page home2">
      <div class="hello">
        <h1>Your Home</h1>
        <p class="needs">${nd || nq ? `Needs you first: ${nd ? `<button class="needs-l" data-act="to-drafts"><b>${nd} draft${nd > 1 ? 's' : ''} from your work</b></button>` : ''}${nd && nq ? ' and ' : ''}${nq ? `<button class="needs-l" data-act="to-queue"><b>${nq} open question${nq > 1 ? 's' : ''}</b> in the Question Queue</button>` : ''}` : 'You’re all caught up.'}</p>
        <div class="stats">
          <div><span>Drafts to review</span><b><i class="dot"></i>${nd}</b></div>
          <div><span>Open questions</span><b><i class="dot warn"></i>${nq}</b></div>
          <div><span>Answers from your twin</span><b>63 <small>this month</small></b></div>
          <div><span>New grads helped</span><b>41</b></div>
        </div>
      </div>
      <div class="home-grid">
        <div class="card drafts" id="drafts-card">
          <div class="chead"><div><div class="ctitle">Your twin’s drafts</div><div class="csub">Techne drafted these from your work. Approving teaches your twin and publishes to the team.</div></div>
            ${tabs('drafts', draftTab, nd, drafts.length - nd)}</div>
          <div class="dlist" id="dlist"></div>
        </div>
        <div class="card knows">
          <div class="chead"><div class="ctitle">What your twin knows</div><span class="csub inline">612 answers this year</span></div>
          <ul class="kt">${K.topics.map(([t, n, st]) => `<li><span>${t}</span><span class="mut">${n} docs</span>${st === 'inferred' ? `<span class="stag st-warn mini">${icon('alert')}Inferred · check it</span>` : `<span class="stag st-ok mini">${icon('shield')}Verified</span>`}</li>`).join('')}</ul>
          <div class="slabel">Gaps new grads keep hitting</div>
          <ul class="gaps">${K.gaps.map(([g, n]) => `<li>${icon('alert')}<span>${g}</span><span class="mut">${n}</span></li>`).join('')}</ul>
          ${testOpen ? testHTML() : `<button class="btn ghost" data-act="test">${icon('twin')}Test your twin</button>`}
        </div>
      </div>
      <details class="impact card">
        <summary><span class="ctitle">Your impact</span><span class="csub inline">Contributions and expertise this year</span>${icon('chev-down')}</summary>
        <div class="impact-body">
          <div class="hm-block">
            <div class="peak" id="peak"></div>
            <div class="hm-wrap"><div class="hm-days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>
              <div><div class="hm-months" id="hm-months"></div><div class="hm" id="hm"></div></div></div>
          </div>
          <div class="impact-pie"><div class="pie-svg">${pieSVG(EXPERTISE, 120)}</div><ul class="pie-legend">${legend(EXPERTISE)}</ul></div>
          <div class="cstats"><div><b>128</b><span>docs you approved</span></div><div><b>41</b><span>new grads helped</span></div><div><b>12</b><span>interviews with Techne</span></div><div><b id="hm-total"></b><span>contributions</span></div></div>
        </div>
      </details>
    </div>`;
  }
  function testHTML() {
    const T = DATA.twinKnows.test;
    return `<div class="testbox">
      <div class="slabel">Test your twin</div>
      <div class="tq">${icon('user')}${T.q}</div>
      <div class="ta">${App.stepTag({ twin: 'priya', status: 'verified' })}<p>${T.a}</p><small>${T.src}</small></div>
      <div class="tq">${icon('user')}${T.gapQ}</div>
      <div class="ta gap">${App.stepTag({ twin: null, status: 'unknown' })}<p>${T.gapA}</p></div>
      <button class="link sm" data-act="test">${icon('chev-up')}Close</button>
    </div>`;
  }
  function heatmap() {
    const r = App.rng(42);
    const start = new Date(2026, 0, 5), today = new Date(2026, 9, 30);
    const weeks = Math.floor((today - start) / 864e5 / 7) + 1;
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let cells = '', months = '', peak = { v: 0 }, total = 0, last = -1;
    for (let w = 0; w < weeks; w++) {
      const monday = new Date(start.getTime() + w * 7 * 864e5);
      if (monday.getMonth() !== last) { last = monday.getMonth(); months += `<span style="grid-column:${w + 1}">${MON[last]}</span>`; }
      for (let d = 0; d < 7; d++) {
        const day = new Date(monday.getTime() + d * 864e5);
        if (day > today) { cells += '<i class="fut"></i>'; continue; }
        const v = r() < (d >= 5 ? .1 : .58) ? Math.ceil(r() * r() * 14) : 0;
        total += v;
        if (v > peak.v) peak = { v, day };
        cells += `<i class="l${v === 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 9 ? 3 : 4}" title="${v} on ${MON[day.getMonth()]} ${day.getDate()}"></i>`;
      }
    }
    $('#hm').innerHTML = cells;
    $('#hm-months').innerHTML = months;
    $('#peak').innerHTML = `Peak: <code>${peak.v} reviews</code> <span class="mut">(${MON[peak.day.getMonth()]} ${peak.day.getDate()})</span>`;
    $('#hm-total').textContent = total;
  }
  function renderDrafts() {
    const list = drafts.filter(d => d.status === draftTab);
    $('#dlist').innerHTML = list.length ? list.map(d => {
      const [ic, lab] = DRAFT_KIND[d.kind];
      const inferred = d.inferred ? `<span class="stag st-warn mini">${icon('alert')}Inferred by your twin</span>` : '';
      return `<div class="drow ${d.status === 'todo' ? 'pending' : ''} ${d.fresh ? 'fresh' : ''}" data-id="${d.id}">
        <span class="kicon k-${d.kind}">${icon(ic)}</span>
        <div class="amain" data-act="open-draft"><div class="aq">${d.fresh ? '<span class="newpill">New</span>' : ''}${d.title}</div>
          <div class="ameta"><span>${lab(d)}</span><span class="d">·</span><span>${d.ago}</span><span class="topic">${d.topic}</span>${inferred}</div></div>
        ${d.status === 'todo' ? `<button class="btn primary" data-act="open-draft">Review ${icon('arrow')}</button>` : resultChip(d.result)}
      </div>`;
    }).join('') : `<div class="empty-row">${icon('check')}${draftTab === 'todo' ? 'Nothing to review. Your twin is up to date.' : 'Nothing done yet today.'}</div>`;
    updateCounts();
  }

  // ═════════ QUESTION QUEUE ═════════
  function queueHTML() {
    const todo = queue.filter(q => q.status === 'todo');
    const n = k => todo.filter(q => k === 'all' || q.kind === k).length;
    return `<div class="page queue">
      <div class="hello"><h1>Question Queue</h1><p>Questions real new grads asked that no twin could answer yet. Anyone can claim one.</p></div>
      <div class="qtools">${tabs('queue', queueTab, todo.length, queue.length - todo.length)}
        ${queueTab === 'todo' ? `<div class="filters" data-filter="queue">${[['all', 'All'], ['uncovered', 'Uncovered'], ['workaround', 'Workarounds'], ['published', 'From new grads'], ['answer', 'Drafted answers']].map(([v, l]) =>
          `<button class="fchip ${queueFilter === v ? 'on' : ''}" data-val="${v}">${l}<b>${n(v)}</b></button>`).join('')}</div>` : ''}</div>
      <div class="qlist" id="qlist"></div>
    </div>`;
  }
  function renderQueue() {
    let list = queue.filter(q => q.status === queueTab && (queueTab === 'done' || queueFilter === 'all' || q.kind === queueFilter));
    list = list.sort((a, b) => (b.id === flagged) - (a.id === flagged));
    $('#qlist').innerHTML = list.length ? list.map(q => {
      const [ic, lab] = QUEUE_KIND[q.kind];
      const theirs = q.claimedBy && q.claimedBy !== 'you';
      const sub = q.kind === 'workaround' ? `<span class="qai">${icon('sparkle')}Best guess, no twin: ${q.ai.map(s => s[0]).join(' → ')}</span><span class="qdid">${icon('user')}${q.who.split(' ')[0]} applied it · ${q.did.result}</span>`
        : q.kind === 'uncovered' ? `<span class="qai">${icon('sparkle')}${q.aiSays}</span>`
        : q.kind === 'published' ? `<span class="qai">${icon('archive')}From ${q.who.split(' ')[0]}’s twin, shared for credits</span>`
        : `<span class="qai">${icon('sparkle')}Drafted by Senior Techne · ${q.ai.length} steps</span>`;
      const claim = q.status === 'done' ? resultChip(q.result)
        : theirs ? `<span class="claim theirs" data-tip="${q.claimedBy} claimed this. It’s theirs to answer.">${icon('lock')}Claimed by ${q.claimedBy}</span><button class="btn primary" disabled data-tip="${q.claimedBy} claimed this. It’s theirs to answer.">Review</button>`
        : q.claimedBy === 'you' ? `<span class="claim mine">${icon('lock')}Claimed by you</span><button class="btn primary" data-act="open-q">Review ${icon('arrow')}</button>`
        : `<button class="btn ghost" data-act="claim">${icon('lock')}Claim</button><button class="btn primary" data-act="open-q">Review ${icon('arrow')}</button>`;
      return `<div class="qrow ${q.status === 'todo' && !theirs ? 'pending' : ''} ${theirs ? 'theirs' : ''} ${q.id === flagged && q.status === 'todo' ? 'fresh' : ''}" data-id="${q.id}">
        <span class="kicon k-${q.kind}">${icon(ic)}</span>
        <div class="amain" ${theirs ? '' : 'data-act="open-q"'}><div class="aq">${q.id === flagged && q.status === 'todo' ? '<span class="newpill">New</span>' : ''}${q.title}</div>
          <div class="ameta"><span>${lab}</span><span class="d">·</span><span>${q.who}</span><span class="d">·</span><span>${q.ago}</span><span class="topic">${q.topic}</span>${q.asked > 1 ? `<span class="asked">${icon('users')}${q.asked} new grads asked this</span>` : ''}</div>
          <div class="qsub">${sub}</div></div>
        <div class="qacts">${claim}</div>
      </div>`;
    }).join('') : `<div class="empty-row">${icon('check')}${queueTab === 'todo' ? 'Queue is clear.' : 'Nothing done yet.'}</div>`;
    updateCounts();
  }

  // ═════════ COMPANY REPOSITORY ═════════
  const TOPICS = [
    { label: 'COBOL', v: 34, fill: 'var(--ink)' }, { label: 'Procurement', v: 31, fill: 'url(#hatch)', sw: 'hatch' },
    { label: 'JCL & batch', v: 22, fill: 'var(--pie-3)' }, { label: 'Onboarding', v: 13, fill: 'var(--pie-4)' },
  ];
  const FROM = { answer: ['message', 'Drafted answer'], session: ['video', 'From a session'], published: ['user', 'Published by a new grad'], interview: ['twin', 'From an interview with Techne'] };
  function repoHTML() {
    return `<div class="page repo ${repoSel ? 'has-sel' : ''}">
      <aside class="repo-side">
        <div class="card"><div class="ctitle">Topics</div><div class="csub">Across every senior’s twin</div><div class="pie-svg">${pieSVG(TOPICS, 140)}</div><ul class="pie-legend">${legend(TOPICS)}</ul></div>
        <div class="card glance"><div><b>412</b><span>docs</span></div><div><b>87%</b><span>checked in the last 90 days</span></div><div><b>23</b><span>twins contributing</span></div><div><b>1.9k</b><span>uses this month</span></div></div>
        <div class="card people"><div class="ctitle">Twins answering most</div>
          ${[['P', 'Priya R.', 'COBOL · 612 answers'], ['D', 'Dev K.', 'JCL · 488 answers'], ['L', 'Lena M.', 'Procurement · 201'], ['M', 'Maya Chen', 'New grad · 6 published']].map(([i, n, m]) => `<div class="person"><span class="avatar sm light">${i}</span><div><b>${n}’s twin</b><span>${m}</span></div></div>`).join('')}
        </div>
      </aside>
      <section class="repo-main">
        <div class="hello"><h1>Company repository</h1><p>Everything a senior has approved, from sessions, interviews, answers and new grads’ published work.</p></div>
        <div class="repo-tools">
          <label class="search">${icon('search')}<input id="repo-q" placeholder="Search docs" value="${repoQuery}"></label>
          <div class="filters" data-filter="topic">${['All', 'COBOL', 'Procurement', 'JCL', 'Onboarding'].map(t => `<button class="fchip ${repoTopic === t ? 'on' : ''}" data-val="${t}">${t}</button>`).join('')}</div>
          <select id="repo-sort"><option value="used" ${repoSort === 'used' ? 'selected' : ''}>Most used</option><option value="recent" ${repoSort === 'recent' ? 'selected' : ''}>Recently checked</option></select>
        </div>
        <div class="doclist" id="doclist"></div>
      </section>
      <aside class="repo-preview" id="repo-preview"></aside>
    </div>`;
  }
  const AGE = s => s === 'just now' ? 0 : parseFloat(s) * (/day/.test(s) ? 1 : /week/.test(s) ? 7 : /month/.test(s) ? 30 : 1);
  function renderDocs() {
    let list = docs.filter(d => (repoTopic === 'All' || d.topic === repoTopic) && (!repoQuery || (d.title + d.summary).toLowerCase().includes(repoQuery.toLowerCase())));
    list = list.sort((a, b) => a.fresh ? -1 : b.fresh ? 1 : repoSort === 'used' ? b.used - a.used : AGE(a.checked) - AGE(b.checked));
    $('#doclist').innerHTML = list.length ? list.map(d => {
      const [fi, fl] = FROM[d.from];
      return `<button class="doc ${d.versions > 1 ? 'stacked' : ''} ${repoSel === d.id ? 'sel' : ''} ${d.fresh ? 'fresh' : ''}" data-act="doc" data-id="${d.id}">
        <div class="doc-top"><span class="topic">${d.topic}</span><span class="src-tag">${icon(fi)}${d.author ? `Published by ${d.author.split(' ')[0]}` : fl}</span>${d.stale ? `<span class="stale">${icon('clock')}Needs a recheck</span>` : ''}${d.fresh ? '<span class="newpill">New</span>' : ''}</div>
        <b class="doc-title">${d.title}</b><p>${d.summary}</p>
        <div class="doc-meta"><span>${icon('twin')}${d.by === 'Team' ? 'Team' : `${d.by}’s twin`} · checked ${d.checked}</span><span>${icon('eye')}Used ${d.used} times</span><span>${icon('layers')}v${d.versions}</span></div>
      </button>`;
    }).join('') : `<div class="empty-row">${icon('search')}No docs match. Try another topic or search.</div>`;
    renderPreview();
  }
  function renderPreview() {
    const el = $('#repo-preview');
    const d = docs.find(x => x.id === repoSel);
    if (!d) { el.innerHTML = ''; return; }
    const [fi, fl] = FROM[d.from];
    const hist = [[`v${d.versions}`, `Checked by ${d.by}`, d.checked], ...(d.versions > 1 ? [[`v${d.versions - 1}`, 'Edited after 3 new grads asked a follow-up', '2 months ago']] : []),
      ['v1', d.author ? `Published from ${d.author}’s twin` : d.from === 'interview' ? `Drafted from ${d.by}’s interview with Techne` : d.from === 'session' ? `Drafted from ${d.by}’s recorded session` : 'Drafted by Senior Techne from a new grad’s question', 'first version']];
    el.innerHTML = `<div class="pv-top"><span class="topic">${d.topic}</span><button class="gx" data-act="doc-close">${icon('x')}</button></div>
      <h2>${d.title}</h2><div class="pv-meta"><span>${icon(fi)}${fl}</span><span>${icon('eye')}Used ${d.used} times</span></div>
      <p class="pv-sum">${d.summary}</p>
      ${d.stale ? `<div class="pv-stale">${icon('clock')}<span>Not checked in 4 months. Techne will ask ${d.by} about it on Monday.</span></div>` : ''}
      <div class="slabel">History</div><ol class="hist">${hist.map(([v, t, w]) => `<li><span class="hv">${v}</span><div><b>${t}</b><span>${w}</span></div></li>`).join('')}</ol>
      <div class="pv-acts"><button class="btn dark">${icon('edit')}Suggest an edit</button><button class="btn ghost">${icon('flag')}Mark outdated</button></div>`;
  }

  // ═════════ REVIEW SHEETS ═════════
  const stepsEd = list => `<ol class="steps">${list.map(([t, b], i) => `<li><span class="sn">${i + 1}</span><div><b contenteditable="true" spellcheck="false">${t}</b><p contenteditable="true" spellcheck="false">${b}</p></div></li>`).join('')}</ol>`;
  const chips = list => `<div class="from">${list.map(f => `<span class="src">${icon('link')}${f}</span>`).join('')}</div>`;
  const asker = (who, role, ago) => `<div class="asker"><span class="avatar sm light">${who[0]}</span><div><b>${who}</b><span>${role}</span></div><span class="mut">${ago}</span></div>`;
  function openSheet(html, id, type) {
    sheetWrap.hidden = false;
    sheetWrap.dataset.id = id;
    sheetWrap.dataset.type = type;
    sheetWrap.innerHTML = `<div class="sheet">${html}</div>`;
  }
  function closeSheet() { sheetWrap.hidden = true; sheetWrap.innerHTML = ''; }
  const sheetTop = (back, label, topic, chip) => `<div class="sheet-top">
    <button class="back" data-act="close">${icon('chev-left')}${back}</button><span class="kind-tag">${label}</span><span class="topic">${topic}</span>${chip}
    <button class="gx" data-act="close">${icon('x')}</button></div>`;

  // Your twin's drafts: yours, so no claim or lock chip
  function openDraft(id) {
    const d = drafts.find(x => x.id === id);
    d.fresh = false;
    let left;
    if (d.kind === 'session') {
      left = `<div class="slabel">Your recorded session</div><div class="sess-when">${icon('video')}${d.session.when}</div>
        <ol class="timeline">${d.session.moments.map(([t, k, txt, key]) => `<li class="${key ? 'key' : ''}"><span class="tt">${t}</span><span class="tk">${icon(k === 'doc' ? 'book' : k === 'message' ? 'message' : 'terminal')}</span><div>${txt}${key ? `<span class="keytag">${icon('star')}Key moment</span>` : ''}</div></li>`).join('')}</ol>`;
    } else if (d.kind === 'sessans') {
      const m = DATA.seniorIde.moments[d.moment];
      const ans = DATA.interview.find(q => q.moment === d.moment)?.given || DATA.seniorIde.probe.answer;
      left = `<div class="slabel">The moment in your session</div>
        <div class="moment-card">${icon('star')}<div><b>${m.time} · ${m.label}</b><code>restart VENDSYNC --from=STEP03</code><span>${m.reason}</span></div></div>
        <div class="slabel">Your answer to Techne ${App.synth()}</div>
        <blockquote class="quote">“${ans}”</blockquote>
        <div class="cap">${icon('info')}Techne asked as a new grad, because 9 new grads asked about rerunning a failed job this month.</div>`;
    } else if (d.kind === 'sent') {
      left = `<div class="slabel">What ${d.askedBy.split(' ')[0]} was doing</div>${shot(d.shot)}
        ${d.inferred ? `<div class="infer-box">${icon('alert')}<div><b>Your twin inferred this</b><span>${d.inferred}</span></div></div>` : `<div class="cap">${icon('send')}Senior Techne sent this to you because your twin drafted the answer.</div>`}`;
    } else {
      left = `<div class="slabel">Your interview with Techne ${App.synth()}</div>
        <ol class="qa">${DATA.interview.map(i => `<li><span class="q">${icon('sparkle')}${i.q}</span><span class="a">${i.given || i.answer}</span></li>`).join('')}</ol>
        <div class="cap">${icon('info')}${DATA.persona.note}</div>`;
    }
    const right = `${d.kind === 'sent' ? asker(d.askedBy, 'Asked Senior Techne · routed to your twin', d.ago) : ''}
      <div class="slabel">Goes into your twin and the team docs as</div>
      <h3 class="doc-h" contenteditable="true" spellcheck="false">${d.title.replace(/^Confirm: /, '')}</h3>
      <div class="slabel row">${d.steps.length} steps <span class="mut">${icon('edit')}Click any step to edit</span></div>
      ${stepsEd(d.steps)}
      <div class="slabel">Drafted from</div>${chips(d.from)}`;
    openSheet(`${sheetTop('Your Home', DRAFT_KIND[d.kind][1](d), d.topic, `<span class="ownchip">${icon('twin')}Your twin · only you review this</span>`)}
      <div class="sheet-grid"><div class="sheet-left">${left}</div><div class="sheet-right">${right}</div></div>
      <div class="sheet-foot" id="sheet-foot"><span class="mut">Approving teaches your twin and publishes this to the company repository.</span>
        <button class="abtn" data-act="sendback">Send back</button><button class="btn primary" data-act="approve">${icon('check')}Approve and publish</button></div>`, id, 'draft');
  }

  function openQueueItem(id) {
    const q = queue.find(x => x.id === id);
    if (q.claimedBy && q.claimedBy !== 'you') { App.toast(`${icon('lock')}${q.claimedBy} claimed this. It’s theirs to answer.`); return; }
    q.claimedBy = 'you';
    renderQueue();
    let left, right, foot;
    if (q.kind === 'workaround') {
      left = `<div class="slabel">What ${q.who.split(' ')[0]} hit</div>${shot(q.shot)}
        <div class="slabel">What Senior Techne suggested <span class="stag st-bad mini">${icon('alert')}No twin covers this</span></div>${stepsEd(q.ai)}`;
      right = `${asker(q.who, q.role, q.ago)}
        <div class="slabel">What ${q.who.split(' ')[0]} did</div>
        <div class="diff"><div class="diff-file">${icon('file')}${q.did.file}</div>${q.did.removed.map(l => `<div class="dl rm"><span>−</span>${l}</div>`).join('')}${q.did.added.map(l => `<div class="dl add"><span>+</span>${l}</div>`).join('')}<div class="diff-res">${icon('terminal')}${q.did.result}</div></div>
        <div class="slabel">Your call</div>
        <div class="choices" id="choices">
          <label><input type="radio" name="call" value="good"><div><b>Good fix</b><span>Publish it as checked by you. Your twin learns it.</span></div></label>
          <label><input type="radio" name="call" value="note"><div><b>OK for test data only</b><span>Publish it with a note about when not to use it</span></div></label>
          <label><input type="radio" name="call" value="wrong"><div><b>Not the right fix</b><span>Write the correct answer instead</span></div></label>
        </div><textarea id="call-text" rows="3" placeholder="Your note or the correct answer" hidden></textarea>`;
      foot = `<span class="mut">${q.who.split(' ')[0]} sees your call in their IDE, and your twin learns the answer.</span>
        <button class="btn primary" data-act="send-call" id="send-call" disabled>${icon('send')}Send</button>`;
    } else if (q.kind === 'uncovered') {
      left = `<div class="slabel">Question</div><div class="qtext">“${q.title}”</div><div class="slabel">Context</div><p class="ctx-p">${q.context}</p>
        <div class="slabel">Senior Techne says</div><blockquote class="quote ai">${icon('sparkle')}${q.aiSays}</blockquote>
        <div class="asked-row">${icon('users')}${q.asked} new grad${q.asked > 1 ? 's' : ''} asked this in the last 30 days</div>`;
      right = `${asker(q.who, q.role, q.ago)}<div class="slabel">Your answer</div>
        <textarea id="answer-text" rows="7" placeholder="Answer in your own words. Your twin turns it into steps for you to check."></textarea>
        <button class="rec-btn" data-act="voice">${icon('mic')}Or record a quick voice answer</button>`;
      foot = `<span class="mut">Your answer goes into your twin as a draft for you to check, then all ${q.asked} new grad${q.asked > 1 ? 's get' : ' gets'} it.</span>
        <button class="btn primary" data-act="send-answer">${icon('send')}Send to my twin</button>`;
    } else {
      left = `<div class="slabel">From ${q.who.split(' ')[0]}’s twin</div><blockquote class="quote">“${q.note}”</blockquote>
        <div class="slabel">What ${q.who.split(' ')[0]} ran</div><div class="codeblk plain">${q.ran.join('\n')}</div>
        <div class="cap">${icon('coin')}${q.who.split(' ')[0]} earns credits if you approve this.</div>`;
      right = `${asker(q.who, q.role, q.ago)}<div class="slabel">Goes into the team docs as</div>
        <h3 class="doc-h" contenteditable="true" spellcheck="false">${q.title}</h3>${stepsEd(q.steps)}`;
      foot = `<span class="mut">Approving publishes this to the company repository, credited to ${q.who.split(' ')[0]}.</span>
        <button class="abtn" data-act="sendback">Send back</button><button class="btn primary" data-act="approve">${icon('check')}Approve and publish</button>`;
    }
    openSheet(`${sheetTop('Question Queue', QUEUE_KIND[q.kind][1], q.topic, `<span class="lockchip">${icon('lock')}Claimed by you · other seniors see it’s yours</span>`)}
      <div class="sheet-grid"><div class="sheet-left">${left}</div><div class="sheet-right">${right}</div></div>
      <div class="sheet-foot" id="sheet-foot">${foot}</div>`, id, 'queue');
    $('#choices')?.addEventListener('change', e => {
      $('#send-call').disabled = false;
      const t = $('#call-text');
      t.hidden = e.target.value === 'good';
      t.placeholder = e.target.value === 'note' ? 'When shouldn’t someone use this fix?' : 'What’s the right fix?';
    });
  }

  // Send back explains exactly what happens, naming who gets the comment
  function sendBackForm() {
    const type = sheetWrap.dataset.type, id = sheetWrap.dataset.id;
    const item = type === 'draft' ? drafts.find(x => x.id === id) : queue.find(x => x.id === id);
    const drafter = type === 'draft' ? 'Senior Techne, which drafted this from your work' : `${item.who}, who wrote it`;
    $('#sheet-foot').outerHTML = `<div class="sheet-foot reject" id="sheet-foot">
      <div class="sb-explain">${icon('info')}<div><b>What happens when you send it back</b>
        <ul><li>Your comment goes to ${drafter}.</li><li>The draft goes back to be redrafted.</li><li>Nothing is recorded against anyone.</li><li>It comes back to your To do once it’s redrafted.</li></ul></div></div>
      <textarea id="comment" placeholder="What should change?"></textarea>
      <div class="rbtns"><button class="abtn" data-act="cancel-sendback">Cancel</button><button class="btn dark" data-act="confirm-sendback">${icon('send')}Send back</button></div></div>`;
    later(() => $('#comment').focus(), 50);
  }

  function finish(type, id, result, msg, gain, doc) {
    const item = type === 'draft' ? drafts.find(x => x.id === id) : queue.find(x => x.id === id);
    closeSheet();
    item.status = 'done';
    item.result = result;
    if (flagged === id) flagged = null;
    let added = null;
    if (doc) { added = { id: 'n' + Date.now(), by: 'Priya R.', used: 0, checked: 'just now', versions: 1, fresh: true, ...doc }; docs.unshift(added); }
    if (gain) addCredits(gain);
    rerender();
    App.undoToast(`${icon('check')}${msg}`, () => {
      item.status = 'todo';
      delete item.result;
      if (added) docs = docs.filter(x => x !== added);
      if (gain) addCredits(-gain);
      rerender();
    });
  }
  function rerender() { if (screen === 'home') renderDrafts(); else if (screen === 'queue') { body.innerHTML = queueHTML(); renderQueue(); } updateCounts(); }

  function onAct(act, el) {
    const row = el.closest('.drow, .qrow');
    const id = row?.dataset.id || sheetWrap.dataset.id;
    const type = sheetWrap.dataset.type;
    switch (act) {
      case 'open-draft': openDraft(id); break;
      case 'open-q': openQueueItem(id); break;
      case 'claim': { const q = queue.find(x => x.id === id); q.claimedBy = 'you'; renderQueue(); App.toast(`${icon('lock')}Claimed. Other seniors see it’s yours.`); break; }
      case 'close': closeSheet(); if (screen === 'home') renderDrafts(); break;
      case 'approve': {
        const it = type === 'draft' ? drafts.find(x => x.id === id) : queue.find(x => x.id === id);
        const title = document.querySelector('.doc-h')?.textContent.trim() || it.title;
        finish(type, id, 'approved', type === 'draft' ? 'Approved and published. Your twin learned it.' : `Approved and published, credited to ${it.who.split(' ')[0]}.`, 15,
          { title, topic: it.topic, from: type === 'draft' ? (it.kind === 'interview' ? 'interview' : it.kind === 'session' || it.kind === 'sessans' ? 'session' : 'answer') : 'published', author: type === 'queue' ? it.who : undefined, summary: it.steps[0][1].replace(/<[^>]+>/g, '') });
        break;
      }
      case 'sendback': sendBackForm(); break;
      case 'cancel-sendback': type === 'draft' ? openDraft(id) : openQueueItem(id); break;
      case 'confirm-sendback': finish(type, id, 'sentback', 'Sent back. It returns to your To do once it’s redrafted.', 0); break;
      case 'send-call': {
        const v = document.querySelector('#choices input:checked')?.value;
        const q = queue.find(x => x.id === id);
        finish('queue', id, v === 'wrong' ? 'answered' : v === 'note' ? 'noted' : 'approved',
          v === 'wrong' ? `Sent. ${q.who.split(' ')[0]} gets your answer as a walkthrough.` : `Published as checked by you. ${q.who.split(' ')[0]}’s fix is in the team docs.`,
          v === 'wrong' ? 20 : 15, v === 'wrong' ? null : { title: q.title, topic: q.topic, from: 'answer', summary: q.ai[1][1] });
        break;
      }
      case 'send-answer': {
        const q = queue.find(x => x.id === id);
        finish('queue', id, 'answered', `Sent to your twin. Check its draft in Your Home, then all ${q.asked} new grad${q.asked > 1 ? 's get' : ' gets'} it.`, 20);
        break;
      }
      case 'voice': App.toast(`${icon('mic')}Voice answers work on mobile. Try the Mobile tab.`); break;
      case 'test': testOpen = !testOpen; show('home'); break;
      case 'to-drafts': draftTab = 'todo'; $('#drafts-card').scrollIntoView({ behavior: 'smooth' }); break;
      case 'to-queue': App.set({ screen: 'queue' }); break;
      case 'doc': repoSel = repoSel === el.dataset.id ? null : el.dataset.id; $('.repo').classList.toggle('has-sel', !!repoSel); renderDocs(); break;
      case 'doc-close': repoSel = null; $('.repo').classList.remove('has-sel'); renderDocs(); break;
    }
  }

  function show(scr) {
    screen = scr;
    closeSheet();
    $('#senior').dataset.screen = scr;
    document.querySelectorAll('.dtab').forEach(t => t.classList.toggle('on', t.dataset.screen === scr));
    body.classList.toggle('full', scr === 'ide');
    if (scr === 'home') { body.innerHTML = homeHTML(); heatmap(); renderDrafts(); }
    else if (scr === 'queue') { body.innerHTML = queueHTML(); renderQueue(); }
    else if (scr === 'repo') {
      body.innerHTML = repoHTML(); renderDocs();
      $('#repo-q').oninput = e => { repoQuery = e.target.value; renderDocs(); };
      $('#repo-sort').onchange = e => { repoSort = e.target.value; renderDocs(); };
    } else SeniorPages.render(scr, body);
    updateCounts();
  }

  function init() {
    body = $('#dash-body');
    sheetWrap = $('#sheet-wrap');
    $('#dtabs').addEventListener('click', e => { const t = e.target.closest('.dtab'); if (t) App.set({ screen: t.dataset.screen }); });
    $('#senior').addEventListener('click', e => {
      const lt = e.target.closest('[data-ltabs] button');
      if (lt) {
        if (lt.parentElement.dataset.ltabs === 'drafts') { draftTab = lt.dataset.val; lt.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === lt)); renderDrafts(); }
        else { queueTab = lt.dataset.val; show('queue'); }
        return;
      }
      const f = e.target.closest('.filters .fchip');
      if (f) {
        const kind = f.parentElement.dataset.filter;
        if (kind === 'queue') { queueFilter = f.dataset.val; show('queue'); }
        if (kind === 'topic') { repoTopic = f.dataset.val; f.parentElement.querySelectorAll('.fchip').forEach(b => b.classList.toggle('on', b === f)); renderDocs(); }
        return;
      }
      const b = e.target.closest('[data-act]');
      if (b && !b.disabled && !b.closest('.sp-ide')) onAct(b.dataset.act, b);
    });
    sheetWrap.addEventListener('click', e => { if (e.target === sheetWrap) closeSheet(); });
  }

  function start(st) { reset(); show(st.screen); }
  function stop() { timers.forEach(clearTimeout); timers = []; closeSheet(); SeniorPages.stop(); }
  function flag(id) { flagged = id; }
  // Called when Priya answers the question card: the restart draft is freshly drafted from it
  let restartFresh = false;
  function freshRestart() {
    restartFresh = true;
    const d = drafts.find(x => x.id === 'd-restart');
    if (d && d.status === 'todo') { d.fresh = true; d.ago = 'just now'; }
  }
  // Called when Priya finishes the end-of-day interview with Techne
  function addInterviewDraft() {
    interviewDone = true;
    if (!drafts.some(d => d.id === DATA.interviewDraft.id)) drafts.unshift({ ...DATA.interviewDraft, status: 'todo', fresh: true });
    updateCounts();
  }

  return { init, start, restart: start, stop, show, flag, addInterviewDraft, freshRestart };
})();
