// Mobile tab: one phone frame, four flows. Seniors review their twin's drafts and answer Nova on the go;
// new grads ask Senior Techne in Slack and look through their own twin.
const Mobile = (() => {
  const $ = s => document.querySelector(s);
  const icon = n => App.icon(n);
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  let root, screen = 'approvals';
  let drafts, open = null, sendBack = false, probe = 'asking', slack = [], archive;

  const INFO = {
    approvals: ['Senior', 'Your twin’s drafts', 'Review what your twin drafted from your work, between meetings. Nothing is approved without opening it, and every approval can be undone.'],
    probes: ['Senior', 'Nova’s questions', 'Nova, a synthetic new grad, asks about key moments from your day. Tap a reply or record a voice note.'],
    slack: ['New grad', 'Slack with Senior Techne', 'Ask like you’d message a colleague. Every answer says whose twin it came from.'],
    archive: ['New grad', 'Your twin', 'What you’ve saved and learned. Private until you share it.'],
  };

  function reset() {
    drafts = DATA.drafts.slice(0, 3).map(d => ({ ...d, status: 'todo' }));
    open = null; sendBack = false; probe = 'asking';
    slack = [
      { me: true, t: 'how do I add PDF invoices to the vendor file copy? PROC-512' },
      { bot: true, twin: 'priya', steps: DATA.scenarios.filecopy.steps.slice(1, 4) },
    ];
    archive = GradPages.items().map(i => ({ ...i }));
  }

  const status = () => `<div class="ph-status"><span>9:41</span><span class="ph-icons"><i></i><i></i><i></i></span></div>`;

  function approvalsHTML() {
    if (open) {
      const d = drafts.find(x => x.id === open);
      return `<div class="m-app">
        <div class="m-nav"><button data-mact="back">${icon('chev-left')}Drafts</button><span class="m-own">${icon('twin')}Your twin</span></div>
        <div class="m-scroll">
          <span class="topic">${d.topic}</span>
          <h3>${d.title}</h3>
          <p class="m-sub">${d.kind === 'session' ? 'From your session' : `Sent to you · ${d.askedBy} asked`} · ${d.ago}</p>
          ${d.inferred ? `<div class="infer-box">${icon('alert')}<div><b>Your twin inferred this</b><span>${d.inferred}</span></div></div>` : ''}
          <ol class="steps">${d.steps.map(([t, b], i) => `<li><span class="sn">${i + 1}</span><div><b>${t}</b><p>${b}</p></div></li>`).join('')}</ol>
        </div>
        ${sendBack ? `<div class="m-sheet"><b>What happens when you send it back</b><ul><li>Your comment goes to Senior Techne, which drafted this.</li><li>It’s redrafted and comes back to your To do.</li><li>Nothing is recorded against anyone.</li></ul>
            <textarea rows="2" placeholder="What should change?"></textarea><div class="m-btns"><button class="btn ghost" data-mact="sb-cancel">Cancel</button><button class="btn dark" data-mact="sb-send">Send back</button></div></div>`
          : `<div class="m-btns fixed"><button class="btn ghost" data-mact="sendback">Send back</button><button class="btn primary" data-mact="approve">${icon('check')}Approve and publish</button></div>`}
      </div>`;
    }
    const todo = drafts.filter(d => d.status === 'todo');
    return `<div class="m-app">
      <div class="m-title"><h2>Your twin’s drafts</h2><span class="m-count ${todo.length ? 'hot' : ''}">${todo.length} to do</span></div>
      <p class="m-sub">Techne drafted these from your work. Approving teaches your twin and publishes to the team.</p>
      <div class="m-scroll m-list">${todo.length ? todo.map(d => `<button class="m-card pending" data-mact="open" data-id="${d.id}">
        <span class="kicon k-${d.kind}">${icon(d.kind === 'session' ? 'video' : 'send')}</span>
        <div><b>${d.title}</b><span>${d.kind === 'session' ? 'From your session' : `${d.askedBy} asked`} · ${d.ago}</span></div><span class="m-review">Review</span></button>`).join('')
        : `<div class="empty-row">${icon('check')}All caught up</div>`}
        ${drafts.filter(d => d.status === 'done').map(d => `<div class="m-card done"><span class="kicon">${icon('check')}</span><div><b>${d.title}</b><span>Approved · published</span></div></div>`).join('')}
      </div>
    </div>`;
  }

  function probesHTML() {
    const P = DATA.seniorIde.probe;
    if (probe === 'done') return `<div class="m-app center"><span class="okic">${icon('check')}</span><h3>Thanks, Priya</h3><p class="m-sub">Your twin drafted this into your drafts for you to check before anyone sees it.</p><button class="btn ghost" data-mact="probe-reset">Show the question again</button></div>`;
    return `<div class="m-app">
      <div class="m-title"><h2>Nova asks</h2>${App.synth()}</div>
      <p class="m-sub">About a key moment from today · 1 of 3</p>
      <div class="m-q">${P.q}<span class="chip">${icon('terminal')}${P.at}</span></div>
      <div class="m-label">Quick replies</div>
      <div class="m-replies">
        <button data-mact="reply">${P.sample}</button>
        <button data-mact="reply">Steps 1–2 commit to VENDMAST. Never rerun them.</button>
        <button data-mact="reply">It depends. Let’s talk about it tonight.</button>
      </div>
      <button class="m-voice ${probe === 'rec' ? 'rec' : ''}" data-mact="voice">${icon('mic')}<span>${probe === 'rec' ? 'Recording… tap to send' : 'Tap to record a voice answer'}</span></button>
      <p class="m-foot-note">${icon('info')}${DATA.persona.note}</p>
    </div>`;
  }

  function slackHTML() {
    const msg = m => m.me
      ? `<div class="sl-msg"><span class="sl-av me">M</span><div><b>Maya Chen</b><span class="sl-t">9:44</span><p>${m.t}</p></div></div>`
      : m.typing ? `<div class="sl-msg"><span class="sl-av bot">${icon('sparkle')}</span><div><b>Senior Techne <em>APP</em></b><p><span class="typing"><i></i><i></i><i></i></span></p></div></div>`
      : `<div class="sl-msg"><span class="sl-av bot">${icon('sparkle')}</span><div><b>Senior Techne <em>APP</em></b><span class="sl-t">9:44</span>
          <p class="sl-from">${m.twin ? `Answering from ${App.twinName(m.twin)}’s twin` : 'No twin covers this yet'}</p>
          ${m.steps ? `<ol class="sl-steps">${m.steps.map(s => `<li><b>${s.title}</b>${App.stepTag(s).replace('stag', 'stag mini')}</li>`).join('')}</ol><button class="sl-btn" data-mact="open-ide">${icon('code')}Open the walkthrough in Techne IDE</button>` : `<p>${m.t}</p>${m.queued ? `<span class="queued">${icon('users')}Sent to the Question Queue</span>` : ''}`}</div></div>`;
    return `<div class="m-app slack">
      <div class="sl-head">${icon('chev-left')}<span class="sl-av bot sm">${icon('sparkle')}</span><b>Senior Techne</b>${icon('chev-down')}</div>
      <div class="m-scroll sl-thread" id="sl-thread">${slack.map(msg).join('')}</div>
      <form class="sl-input" id="sl-form"><input id="sl-q" placeholder="Message Senior Techne" value="do PDFs need a virus scan first?"><button type="submit" aria-label="Send">${icon('send')}</button></form>
    </div>`;
  }

  function archiveHTML() {
    const VIS = { private: ['lock', 'Only you'], shared: ['users', 'Shared'], published: ['coin', 'Published'] };
    return `<div class="m-app">
      <div class="m-title"><h2>Your twin</h2><span class="vis-chip v-private">${icon('lock')}Private</span></div>
      <p class="m-sub">${archive.length} items · only you see these until you share one</p>
      <div class="m-scroll m-list">${archive.map(i => `<div class="m-card"><span class="kicon k-${i.type}">${icon(i.type === 'walk' ? 'twin' : i.type === 'question' ? 'message' : i.type === 'saved' ? 'archive' : 'edit')}</span>
        <div><b>${i.title}</b><span>${i.date} · ${i.with}</span></div>
        ${i.vis === 'private' ? `<button class="m-share" data-mact="share" data-id="${i.id}">Share</button>` : `<span class="vis-chip v-${i.vis}">${icon(VIS[i.vis][0])}${VIS[i.vis][1]}</span>`}</div>`).join('')}</div>
    </div>`;
  }

  function render() {
    const [who, title, desc] = INFO[screen];
    const body = screen === 'approvals' ? approvalsHTML() : screen === 'probes' ? probesHTML() : screen === 'slack' ? slackHTML() : archiveHTML();
    root.innerHTML = `<div class="mob">
      <div class="mob-info">
        <span class="mob-who">${who}</span><h1>${title}</h1><p>${desc}</p>
        <div class="mob-tabs">${Object.entries(INFO).map(([k, [w, t]]) => `<button class="${k === screen ? 'on' : ''}" data-mscreen="${k}"><span>${w}</span>${t}</button>`).join('')}</div>
      </div>
      <div class="phone"><div class="phone-screen"><div class="island"></div>${status()}${body}<div class="m-snack" id="m-snack"></div><div class="ph-home"></div></div></div>
    </div>`;
    const th = $('#sl-thread');
    if (th) th.scrollTop = th.scrollHeight;
    $('#sl-form')?.addEventListener('submit', e => { e.preventDefault(); askSlack(); });
  }

  function snack(text, undo) {
    const s = $('#m-snack');
    s.innerHTML = `<span>${text}</span>${undo ? '<button>Undo</button>' : ''}`;
    s.classList.add('in');
    if (undo) s.querySelector('button').onclick = () => { undo(); s.classList.remove('in'); };
    later(() => s.classList.remove('in'), 5000);
  }

  function askSlack() {
    const q = $('#sl-q').value.trim();
    if (!q) return;
    slack.push({ me: true, t: q.replace(/</g, '&lt;') }, { bot: true, typing: true });
    render();
    later(() => {
      slack.pop();
      slack.push({ bot: true, twin: null, t: 'No twin knows whether PDFs need a virus scan before they reach the share. I’ve asked the seniors and will message you when one answers.', queued: true });
      render();
    }, 1100);
  }

  function onAct(act, el) {
    switch (act) {
      case 'open': open = el.dataset.id; sendBack = false; break;
      case 'back': open = null; break;
      case 'approve': {
        const d = drafts.find(x => x.id === open);
        d.status = 'done'; open = null; render();
        snack('Approved and published', () => { d.status = 'todo'; render(); });
        return;
      }
      case 'sendback': sendBack = true; break;
      case 'sb-cancel': sendBack = false; break;
      case 'sb-send': { const d = drafts.find(x => x.id === open); d.status = 'sent'; open = null; sendBack = false; render(); snack('Sent back. It returns once redrafted.'); return; }
      case 'reply': probe = 'done'; break;
      case 'voice':
        if (probe === 'rec') { probe = 'done'; render(); snack('Voice note sent · 0:14'); return; }
        probe = 'rec'; break;
      case 'probe-reset': probe = 'asking'; break;
      case 'open-ide': App.set({ role: 'grad', screen: 'ide', sc: 'filecopy' }); return;
      case 'share': { const i = archive.find(x => x.id === el.dataset.id); i.vis = 'shared'; render(); snack('Shared. A senior reviews it first.'); return; }
    }
    render();
  }

  function init() {
    root = $('#mobile');
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-mscreen]');
      if (t) { App.set({ screen: t.dataset.mscreen }); return; }
      const b = e.target.closest('[data-mact]');
      if (b) onAct(b.dataset.mact, b);
    });
  }
  function show(scr) { screen = scr; open = null; sendBack = false; render(); }
  function start(st) { reset(); show(st.screen); }
  function stop() { timers.forEach(clearTimeout); timers = []; }

  return { init, start, restart: start, stop, show };
})();
