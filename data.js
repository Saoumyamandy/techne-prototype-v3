// All made-up content: twins, the synthetic persona, three IDE scenarios, the senior's drafts and queue,
// the company repository, and the content of every other screen.
const DATA = (() => {
  // ── people and their twins. Senior Techne routes questions across these. ──
  const twins = {
    priya: { name: 'Priya R.', initial: 'P', role: 'Senior engineer · COBOL and procurement, 9 yrs' },
    dev: { name: 'Dev K.', initial: 'D', role: 'Senior engineer · JCL and batch, 12 yrs' },
    maya: { name: 'Maya Chen', initial: 'M', role: 'New grad · Procurement, week 2' },
  };

  // The synthetic new grad who interviews seniors. Always shown with a Synthetic badge.
  const persona = {
    name: 'Techne',
    label: 'Synthetic new grad',
    builtFrom: ['214 questions real new grads asked, Jan–Oct 2026', '38 onboarding tickets', '#proc-help Slack, last 12 months'],
    note: 'When Techne interviews seniors, it asks as a synthetic new grad: the questions real new grads ask, so seniors’ twins learn the why.',
  };

  // Priya's three steps on restarting VENDSYNC. Her draft and Maya's walkthrough share them word for word.
  const restartSteps = [
    ['Restart from step 3, not from the top', 'Run <code>restart VENDSYNC --from=STEP03</code>, so the job picks up at the step that failed.'],
    ['Why: steps 1 and 2 already committed', 'Steps 1 and 2 already committed to VENDMAST. Rerunning them inserts duplicate vendor rows.'],
    ['Check the record count matches before closing out', 'The count should be within 1% of yesterday’s. More than that means a partial load, so hold the PO batch.'],
  ];

  // The capture trail behind Priya's steps: session → answer → approval → use
  const restartTrail = [
    ['Oct 30, 4:18 PM', 'video', 'Priya restarted VENDSYNC from step 3', 'Her recorded session'],
    ['Oct 30, 5:02 PM', 'twin', 'Priya answered Techne: “Steps 1 and 2 already committed…”', 'Techne asked as a new grad'],
    ['Oct 31', 'check', 'Priya reviewed and approved', 'Now in her twin and the team docs'],
    ['', 'users', 'Used 3 times since · 3 of 3 said it helped', ''],
  ];

  const tree = [
    { name: 'procurement-core', dir: true, depth: 0 },
    { name: 'src', dir: true, depth: 1 },
    { name: 'PROCVEND.cbl', depth: 2 },
    { name: 'PROCPO.cbl', depth: 2 },
    { name: 'copybooks', dir: true, depth: 1 },
    { name: 'VENDREC.cpy', depth: 2 },
    { name: 'testdata', dir: true, depth: 1 },
    { name: 'po_small.dat', depth: 2 },
    { name: 'scripts', dir: true, depth: 1 },
    { name: 'vendor_copy.sh', depth: 2 },
    { name: 'jcl', dir: true, depth: 1 },
    { name: 'VENDSYNC.jcl', depth: 2 },
    { name: 'build.sh', depth: 1 },
    { name: 'run.sh', depth: 1 },
  ];
  const fid = name => 'f-' + name.replace(/[^a-z0-9]/gi, '-');

  // ── Scenario 1: covered by Priya's twin, checked ──
  const checked = {
    key: 'checked', lang: 'cobol', error: true, file: 'PROCVEND.cbl',
    tabs: [['PROCVEND.cbl', 'src'], ['VENDREC.cpy', 'copybooks'], ['build.sh', 'scripts']],
    code: [
      '       IDENTIFICATION DIVISION.',
      '       PROGRAM-ID. PROCVEND.',
      '      * Vendor master update for the nightly procurement batch',
      '       ENVIRONMENT DIVISION.',
      '       INPUT-OUTPUT SECTION.',
      '       FILE-CONTROL.',
      '           SELECT VENDOR-FILE ASSIGN TO "VENDMAST"',
      '               ORGANIZATION IS INDEXED',
      '               RECORD KEY IS VEND-ID.',
      '',
      '       DATA DIVISION.',
      '       FILE SECTION.',
      '       FD  VENDOR-FILE.',
      '           COPY VENDREC.',
      '',
      '       WORKING-STORAGE SECTION.',
      '       01  WS-STATUS          PIC XX.',
      '       01  WS-PO-TOTAL        PIC 9(9)V99 VALUE ZERO.',
      '       01  WS-EOF             PIC X VALUE "N".',
      '',
      '       PROCEDURE DIVISION.',
      '       MAIN-PARA.',
      '           OPEN I-O VENDOR-FILE',
      '           PERFORM READ-VENDOR UNTIL WS-EOF = "Y"',
      '           CLOSE VENDOR-FILE',
      '           STOP RUN.',
    ],
    marks: { 't-err': 'COPY VENDREC.' },
    run: './build.sh PROCVEND',
    fail: n => [
      ['mut', '→ cobc -x -o bin/PROCVEND src/PROCVEND.cbl'],
      ['', `src/PROCVEND.cbl:${n}: <span class="err-t">error:</span> VENDREC: copybook not found`],
      ['', `<span class="mut">${String(n).padStart(5)} |</span>            COPY VENDREC.`],
      ['', `<span class="mut">      |</span>${' '.repeat(17)}<span class="err-t">^~~~~~~</span>`],
      ['', '<span class="err-t">✗ build failed</span> <span class="mut">· 1 error</span>'],
    ],
    short: 'VENDREC: copybook not found',
    answer: {
      title: 'Copybook not found', twin: 'priya', verified: true, minutes: 2,
      note: 'Helped 12 new grads get past this error',
      sources: ['Priya R.’s answer to Sam · Aug 2026', 'Runbook: Local COBOL builds', '2 more answers from Priya R.’s twin'],
    },
    steps: [
      {
        target: '#t-err', spot: ['#t-err'], place: 'editor', twin: 'priya', status: 'verified', knownByYou: 'Saved to your twin · Oct 12',
        source: 'Priya R.’s answer to Sam, Aug 2026. Checked by Priya 3 days ago.',
        title: 'This line pulls in a shared file',
        body: '<code>COPY VENDREC.</code> pastes in the vendor record layout from a <b>copybook</b>, a file that many programs share. The build stopped here because the compiler couldn’t find that file.',
      },
      {
        target: `#${fid('VENDREC.cpy')} span`, spot: [`#${fid('copybooks')}`, `#${fid('VENDREC.cpy')}`], place: 'side', twin: 'priya', status: 'verified', knownByYou: 'Saved to your twin · Oct 12',
        source: 'Runbook “Local COBOL builds”, written from Priya R.’s recorded session in Mar 2024.',
        title: 'The file is right here',
        body: '<code>VENDREC.cpy</code> lives in <code>copybooks/</code>. The compiler only looks in folders listed in <code>COBCPY</code>, and your shell doesn’t set it yet.',
        note: 'Every procurement repo keeps its copybooks this way.',
      },
      {
        target: '#t-prompt .pwrap', spot: ['#t-prompt .pwrap'], place: 'term', twin: 'priya', status: 'verified', knownByYou: 'Saved to your twin · Oct 12',
        source: 'Same runbook. Used 12 times; nobody has reported it wrong.',
        title: 'Point the compiler at it, then rebuild',
        body: 'Tell this shell where the copybooks are, then run the build again.',
        code: 'export COBCPY=./copybooks\n./build.sh PROCVEND',
        note: 'Add the export line to <code>~/.zshrc</code> so new terminals get it too.',
      },
    ],
    fix: {
      kind: 'shell', label: 'Run in terminal',
      cmds: ['export COBCPY=./copybooks', './build.sh PROCVEND'],
      out: [['mut', '→ cobc -x -o bin/PROCVEND src/PROCVEND.cbl'], ['', '<span class="ok">✓ PROCVEND compiled</span> <span class="mut">· 0 errors · 1.4s</span>']],
    },
    done: { title: 'Build passed', sub: 'PROCVEND compiled with 0 errors.', kind: 'helped' },
    // When Maya's own twin already holds this fix, help shrinks to one line
    known: { line: 'You’ve fixed this before: set COBCPY, then rebuild', code: 'export COBCPY=./copybooks\n./build.sh PROCVEND', when: 'Saved to your twin · Oct 12' },
    reply: { twin: 'priya', status: 'verified', text: 'build.sh doesn’t set COBCPY because each team keeps copybooks somewhere different. Add the export to ~/.zshrc once and it works in every procurement repo.' },
  };

  // ── Scenario 2: no twin covers it. A general answer, one inferred step from Dev's twin. ──
  const unchecked = {
    key: 'unchecked', lang: 'cobol', error: true, file: 'PROCPO.cbl',
    tabs: [['PROCPO.cbl', 'src'], ['po_small.dat', 'testdata'], ['run.sh', 'scripts']],
    code: [
      '       IDENTIFICATION DIVISION.',
      '       PROGRAM-ID. PROCPO.',
      '      * Totals open purchase orders for the nightly batch',
      '       ENVIRONMENT DIVISION.',
      '       INPUT-OUTPUT SECTION.',
      '       FILE-CONTROL.',
      '           SELECT PO-FILE ASSIGN TO "PODATA"',
      '               ORGANIZATION IS LINE SEQUENTIAL.',
      '',
      '       DATA DIVISION.',
      '       FILE SECTION.',
      '       FD  PO-FILE.',
      '       01  PO-REC.',
      '           05  PO-ID          PIC X(8).',
      '           05  PO-VEND-ID     PIC X(6).',
      '           05  PO-AMT         PIC 9(7)V99.',
      '       WORKING-STORAGE SECTION.',
      '       01  WS-TOTAL           PIC 9(9)V99 VALUE ZERO.',
      '       01  WS-SKIPPED         PIC 9(4) VALUE ZERO.',
      '       01  WS-EOF             PIC X VALUE "N".',
      '',
      '       PROCEDURE DIVISION.',
      '       MAIN-PARA.',
      '           OPEN INPUT PO-FILE',
      '           PERFORM UNTIL WS-EOF = "Y"',
      '               READ PO-FILE',
      '                   AT END MOVE "Y" TO WS-EOF',
      '                   NOT AT END ADD PO-AMT TO WS-TOTAL',
      '               END-READ',
      '           END-PERFORM',
      '           DISPLAY "OPEN PO TOTAL: " WS-TOTAL',
      '           CLOSE PO-FILE',
      '           STOP RUN.',
    ],
    marks: { 't-err': 'ADD PO-AMT TO WS-TOTAL' },
    run: './run.sh PROCPO testdata/po_small.dat',
    fail: n => [
      ['mut', '→ cobc -x -o bin/PROCPO src/PROCPO.cbl'],
      ['mut', '→ bin/PROCPO &lt; testdata/po_small.dat'],
      ['', `libcob: src/PROCPO.cbl:${n}: <span class="err-t">error:</span> invalid numeric data in PO-AMT`],
      ['', '<span class="mut">    record 14:</span> "PO004417V00381<span class="err-bg">         </span>"'],
      ['', '<span class="err-t">✗ run failed</span> <span class="mut">· exit 1</span>'],
    ],
    short: 'invalid numeric data in PO-AMT',
    answer: {
      title: 'Invalid numeric data in PO-AMT', twin: null, verified: false, minutes: 3,
      note: 'No senior’s twin covers this yet. One step comes from Dev K.’s twin, the rest is general knowledge.',
      sources: ['2 similar errors in #proc-eng · unresolved', 'Dev K.’s twin: S0C7 abends', 'COBOL guide: NUMERIC class test'],
    },
    steps: [
      {
        target: '#t-err', spot: ['#t-err'], place: 'editor', twin: null, status: 'general',
        source: 'General COBOL knowledge: ADD fails on a field that holds spaces.',
        title: 'This line can’t add a blank amount',
        body: '<code>ADD PO-AMT TO WS-TOTAL</code> expects digits. Record 14 has spaces where the amount should be, and COBOL can’t add spaces, so the run stops.',
      },
      {
        target: `#${fid('po_small.dat')} span`, spot: [`#${fid('testdata')}`, `#${fid('po_small.dat')}`], place: 'side', twin: 'dev', status: 'inferred',
        source: 'Dev K.’s session on S0C7 abends, Feb 2026. Dev fixed blank amounts in production data, not test files, so this is inferred.',
        title: 'The bad record is in your test file',
        body: 'Line 14 of <code>po_small.dat</code> is a purchase order with no amount. Test files here are edited by hand, so gaps like this happen.',
      },
      {
        target: '#t-err', spot: ['#t-err'], place: 'editor', twin: null, status: 'unknown',
        source: 'No twin covers how to handle this. This workaround is a general pattern, and it goes to the Question Queue for a senior to check.',
        title: 'Skip blank amounts and count them',
        body: 'A safe workaround for test runs: only add amounts that are numeric, and count the rest so nothing disappears silently.',
        code: 'IF PO-AMT IS NUMERIC\n    ADD PO-AMT TO WS-TOTAL\nELSE\n    ADD 1 TO WS-SKIPPED\nEND-IF',
      },
    ],
    fix: {
      kind: 'patch', label: 'Apply and rerun', at: 'errLine', replace: 1,
      lines: [
        '                   NOT AT END',
        '                       IF PO-AMT IS NUMERIC',
        '                           ADD PO-AMT TO WS-TOTAL',
        '                       ELSE',
        '                           ADD 1 TO WS-SKIPPED',
        '                       END-IF',
      ],
      cmds: ['./run.sh PROCPO testdata/po_small.dat'],
      out: [
        ['mut', '→ cobc -x -o bin/PROCPO src/PROCPO.cbl'],
        ['mut', '→ bin/PROCPO &lt; testdata/po_small.dat'],
        ['', 'OPEN PO TOTAL: 00048211507'],
        ['mut', '1 record skipped (PO-AMT not numeric)'],
        ['', '<span class="ok">✓ run finished</span> <span class="mut">· exit 0</span>'],
      ],
    },
    done: { title: 'Run finished', sub: '1 record skipped, total calculated.', kind: 'queued' },
    reply: { twin: null, status: 'unknown', text: 'No twin covers this, so I can’t say for sure. My best guess: production files are validated upstream, so skipping only matters for test data. I’ve added your question to the Question Queue.' },
  };

  // ── Scenario 3: a task, not an error. Generic AI plus Priya's twin, with one inferred step sent to Priya. ──
  const filecopy = {
    key: 'filecopy', lang: 'sh', error: false, file: 'vendor_copy.sh', ticket: 'PROC-512',
    tabs: [['vendor_copy.sh', 'scripts'], ['PROC-512', 'ticket'], ['README.md', 'docs']],
    code: [
      '#!/bin/sh',
      '# Nightly copy of vendor files to the procurement share.',
      '# Runs at 1:30 AM, before the 2 AM PO batch.',
      'set -e',
      'SRC=/data/vendor/inbound',
      'DST=/mnt/procshare/vendor',
      '',
      '# 1. vendor master first',
      'cp "$SRC"/VENDMAST*.csv "$DST"/master/',
      '',
      '# 2. then invoice lines',
      'cp "$SRC"/INV*.txt "$DST"/invoices/',
      '',
      '# 3. tell the PO batch the copy is done',
      'touch "$DST"/.copy_done',
    ],
    marks: {
      'm-master': 'cp "$SRC"/VENDMAST*.csv "$DST"/master/',
      'm-order': '# 1. vendor master first',
      'm-inv': 'cp "$SRC"/INV*.txt "$DST"/invoices/',
      'm-done': 'touch "$DST"/.copy_done',
    },
    intro: [
      ['cmd', 'git checkout -b proc-512-pdf-invoices'],
      ['', 'Switched to a new branch \'proc-512-pdf-invoices\''],
      ['cmd', 'open https://jira.internal/PROC-512'],
      ['mut', 'PROC-512 · Include PDF invoices in the nightly vendor file copy'],
    ],
    short: 'PROC-512: add PDF invoices to the vendor file copy',
    nudge: 'You’re on PROC-512. Priya R.’s twin has run this job for 6 years.',
    answer: {
      title: 'Add PDF invoices to the vendor file copy', twin: 'priya', verified: true, mixed: true, minutes: 4,
      note: '2 steps are general, 2 come from Priya R.’s twin, and 1 is inferred and sent to Priya to confirm.',
      sources: ['Priya R.’s sessions on VENDCOPY · 2025', 'Runbook: Nightly vendor files', 'Reading vendor_copy.sh'],
    },
    steps: [
      {
        target: '#m-master', spot: ['#m-master', '#m-inv', '#m-done'], place: 'editor', twin: null, status: 'general',
        source: 'Read from vendor_copy.sh itself. Any engineer could tell you this part.',
        title: 'What this job does',
        body: 'Three things, in order: copy the vendor master files, copy the invoice lines, then create <code>.copy_done</code> to say it finished.',
      },
      {
        target: '#m-order', spot: ['#m-order'], place: 'editor', twin: 'priya', status: 'verified',
        source: 'Priya R.’s recorded session, Mar 12 2025: “Restarting VENDCOPY after a partial copy”. Checked by Priya.',
        title: 'Why the vendor master goes first',
        body: 'The PO batch matches every invoice to a vendor. If an invoice for a brand-new vendor lands before the master file, that invoice is rejected and nobody is told.',
      },
      {
        target: '#m-done', spot: ['#m-done'], place: 'editor', twin: 'priya', status: 'verified',
        source: 'Priya R.’s twin, from the 2025 incident review “POs missing after copy”. Checked by Priya.',
        title: 'What breaks: the done marker',
        body: 'The 2 AM PO batch starts the moment <code>.copy_done</code> appears. Anything copied after that line is missed until the next night, so PDFs must copy before it.',
      },
      {
        target: '#m-inv', spot: ['#m-inv'], place: 'editor', twin: 'priya', status: 'inferred', sentTo: 'priya',
        source: 'Inferred from one of Priya R.’s sessions where a reporting job read every file in invoices/. Priya hasn’t confirmed it, so it’s sent to her.',
        title: 'PDFs probably need their own folder',
        body: 'The invoice reporting job reads every file in <code>invoices/</code> as text. A PDF there would likely break it, so copy PDFs to <code>invoices_pdf/</code> instead.',
      },
      {
        target: '#m-done', spot: ['#m-done'], place: 'editor', twin: null, status: 'general',
        source: 'Written by Senior Techne from steps 1 to 4.',
        title: 'Write the change',
        body: 'Add the PDF copy just above the done marker, into its own folder.',
        code: '# 3. invoice PDFs, own folder (see PROC-512)\nmkdir -p "$DST"/invoices_pdf\ncp "$SRC"/INV*.pdf "$DST"/invoices_pdf/',
      },
    ],
    fix: {
      kind: 'patch', label: 'Apply and dry run', at: 'm-done', replace: 0,
      lines: [
        '# 3. invoice PDFs, own folder (see PROC-512)',
        'mkdir -p "$DST"/invoices_pdf',
        'cp "$SRC"/INV*.pdf "$DST"/invoices_pdf/',
        '',
      ],
      cmds: ['./scripts/vendor_copy.sh --dry-run'],
      out: [
        ['mut', 'would copy 3 VENDMAST files   → master/'],
        ['mut', 'would copy 41 INV*.txt files  → invoices/'],
        ['mut', 'would copy 12 INV*.pdf files  → invoices_pdf/'],
        ['mut', 'would touch .copy_done'],
        ['', '<span class="ok">✓ dry run ok</span> <span class="mut">· PDFs copy before the done marker</span>'],
      ],
    },
    done: { title: 'Dry run passed', sub: 'PDFs copy before the done marker.', kind: 'save' },
    commit: 'git commit -am "PROC-512: copy PDF invoices before the done marker"',
    reply: { twin: null, status: 'unknown', text: 'No twin knows whether PDFs need a virus scan before they reach the share. I’ve sent that to the Question Queue for any senior to answer.' },
  };


  // ── Scenario 4: the failure Priya fixed, a week later. 3 steps from her twin with a trail back to her session. ──
  const restart = {
    key: 'restart', lang: 'jcl', error: true, file: 'VENDSYNC.jcl',
    tabs: [['VENDSYNC.jcl', 'jcl'], ['Vendor sync recovery', 'runbook'], ['run.sh', 'scripts']],
    code: [
      '//VENDSYNC JOB (PROC),\'VENDOR SYNC\',CLASS=A,MSGCLASS=X',
      '//*  Nightly vendor sync. 5 steps. Steps 1-2 commit to VENDMAST.',
      '//STEP01   EXEC PGM=VSLOAD',
      '//VENDIN   DD DSN=PROD.VENDOR.INBOUND,DISP=SHR',
      '//STEP02   EXEC PGM=VSMERGE',
      '//VENDMAST DD DSN=PROD.VENDMAST,DISP=OLD',
      '//STEP03   EXEC PGM=VSINDEX',
      '//STEP04   EXEC PGM=VSVERIFY',
      '//STEP05   EXEC PGM=VSNOTIFY,PARM=\'#proc-ops\'',
    ],
    marks: { 't-err': '//STEP03   EXEC PGM=VSINDEX', 'm-commit': 'Steps 1-2 commit to VENDMAST.' },
    run: 'submit VENDSYNC',
    fail: () => [
      ['mut', '→ VENDSYNC submitted · JOB04417'],
      ['', 'STEP01 VSLOAD    <span class="ok">RC=0</span>'],
      ['', 'STEP02 VSMERGE   <span class="ok">RC=0</span>'],
      ['', 'STEP03 VSINDEX   <span class="err-t">SQLCODE -911</span> · lock timeout'],
      ['', '<span class="err-t">✗ VENDSYNC failed at STEP03</span> <span class="mut">· steps 1–2 committed</span>'],
    ],
    short: 'VENDSYNC failed at STEP03 · SQLCODE -911',
    ask: 'VENDSYNC failed at step 3 with <code>SQLCODE -911</code>. What do I do?',
    answer: {
      title: 'VENDSYNC failed at step 3 (SQLCODE -911)', twin: 'priya', verified: true, mixed: true, minutes: 2,
      note: 'Three steps come from Priya R.’s twin, verified by her. One is general knowledge.',
      sources: ['Priya R.’s session · Oct 30', 'Priya R.’s answer to Techne · Oct 30', 'Runbook: Vendor sync recovery'],
    },
    steps: [
      {
        target: '#t-err', spot: ['#t-err'], place: 'editor', twin: null, status: 'general',
        source: 'General DB2 knowledge. Any coding assistant could tell you this part.',
        title: 'What -911 means here',
        body: 'SQLCODE -911 is a lock timeout: another job held VENDMAST too long. Here that’s usually the 4 PM reporting job.',
      },
      { target: '#t-err', spot: ['#t-err'], place: 'editor', twin: 'priya', status: 'verified', title: restartSteps[0][0], body: restartSteps[0][1], trail: restartTrail },
      { target: '#m-commit', spot: ['#m-commit'], place: 'editor', twin: 'priya', status: 'verified', title: restartSteps[1][0], body: restartSteps[1][1], trail: restartTrail },
      {
        target: '#t-prompt .pwrap', spot: ['#t-prompt .pwrap'], place: 'term', twin: 'priya', status: 'verified', title: restartSteps[2][0], body: restartSteps[2][1], trail: restartTrail,
        code: 'restart VENDSYNC --from=STEP03\nverify VENDMAST --count --against=yesterday',
      },
    ],
    fix: {
      kind: 'shell', label: 'Run in terminal',
      cmds: ['restart VENDSYNC --from=STEP03', 'verify VENDMAST --count --against=yesterday'],
      out: [
        ['', 'STEP03 VSINDEX   <span class="ok">RC=0</span>'],
        ['', 'STEP04 VSVERIFY  <span class="ok">RC=0</span>'],
        ['', 'STEP05 VSNOTIFY  <span class="ok">RC=0</span> · #proc-ops notified'],
        ['', '18,402 records · yesterday 18,377 · <span class="ok">within 1%</span>'],
      ],
    },
    done: { title: 'VENDSYNC finished', sub: 'Restarted from step 3. The count is within 1% of yesterday’s.', kind: 'helped' },
    reply: { twin: 'priya', status: 'verified', text: 'If step 3 times out again, it’s almost always the 4 PM reporting job. Ask #proc-ops to hold it, then restart from step 3.' },
  };

  for (const s of [checked, unchecked, filecopy, restart]) {
    s.lineOf = id => s.code.findIndex(l => l.includes(s.marks[id])) + 1;
    s.errLine = s.marks['t-err'] ? s.lineOf('t-err') : 0;
  }

  // ── Senior side ──
  const shots = {
    poamt: {
      file: 'PROCPO.cbl', tree: ['src', 'PROCPO.cbl', 'testdata', 'po_small.dat'], treeOn: 1,
      code: [[26, '               READ PO-FILE'], [27, '                   AT END MOVE "Y" TO WS-EOF'], [28, '                   NOT AT END ADD PO-AMT TO WS-TOTAL'], [29, '               END-READ']], hl: 28,
      term: ['% ./run.sh PROCPO testdata/po_small.dat', 'libcob: src/PROCPO.cbl:28: <r>error:</r> invalid numeric data in PO-AMT', '    record 14: "PO004417V00381         "'],
    },
    s0c7: {
      file: 'POBATCH.jcl', tree: ['jcl', 'POBATCH.jcl', 'VENDSYNC.jcl'], treeOn: 1,
      code: [[18, '//STEP03   EXEC PGM=PROCPO'], [19, '//PODATA   DD DSN=PROD.PO.DAILY,DISP=SHR'], [20, '//SYSOUT   DD SYSOUT=*']], hl: 18,
      term: ['% jobstat POBATCH', 'STEP03 PROCPO   <r>ABEND S0C7</r>', 'offset +0004A2 in PROCPO'],
    },
    vsam: {
      file: 'vendor_report.py', tree: ['reports', 'vendor_report.py', 'po_aging.py'], treeOn: 1,
      code: [[8, 'import pandas as pd'], [9, ''], [10, 'df = pd.read_csv("/mnt/vsam/VENDMAST")'], [11, 'df = df[df.status == "A"]']], hl: 10,
      term: ['% python reports/vendor_report.py', '<r>UnicodeDecodeError:</r> \'utf-8\' codec can\'t decode byte 0xc1', '<r>✗ exit 1</r>'],
    },
    sortcopy: {
      file: 'VENDSORT.jcl', tree: ['jcl', 'VENDSORT.jcl', 'POBATCH.jcl'], treeOn: 1,
      code: [[6, '//SORT01   EXEC PGM=SORT'], [7, '//SYSIN    DD *'], [8, '  SORT FIELDS=COPY'], [9, '/*']], hl: 8,
      term: ['% submit VENDSORT', 'SORT01 completed · RC=0', 'VENDSYNC step 2 · <r>sequence error</r>'],
    },
    filecopy: {
      file: 'vendor_copy.sh', tree: ['scripts', 'vendor_copy.sh', 'jcl'], treeOn: 1,
      code: [[11, '# 2. then invoice lines'], [12, 'cp "$SRC"/INV*.txt "$DST"/invoices/'], [13, ''], [14, '# 3. invoice PDFs, own folder'], [15, 'cp "$SRC"/INV*.pdf "$DST"/invoices_pdf/']], hl: 15,
      term: ['% ./scripts/vendor_copy.sh --dry-run', 'would copy 12 INV*.pdf files → invoices_pdf/', '✓ dry run ok'],
    },
  };

  // Your twin's drafts: Priya's own. Delegated to her, never locked.
  const drafts = [
    {
      id: 'd-restart', kind: 'sessans', title: 'Restart VENDSYNC from the failed step', ago: 'today', topic: 'Procurement',
      moment: 1,
      steps: restartSteps,
      from: ['Your session · today, 4:18 PM', 'Your answer to Techne · today'],
    },
    {
      id: 'd-sent2', kind: 'sent', title: 'How do I read the vendor VSAM file for a report?', ago: '3h ago', topic: 'Procurement', askedBy: 'Sam Okafor',
      shot: shots.vsam,
      steps: [['VSAM files aren’t text', 'VENDMAST is a mainframe VSAM file in EBCDIC with packed fields, so pandas can’t read it as CSV.'], ['Read the nightly export instead', 'Reports read <code>/data/exports/vendmast.csv</code>, refreshed at 2 AM. Run <code>procutil export vendmast</code> for fresher data.']],
      from: ['Your answers to 2 similar questions', 'Runbook: Reporting data sources'],
    },
    {
      id: 'd-sess2', kind: 'session', title: 'Why the VENDMAST reorg runs before the PO batch', ago: '2 days ago', topic: 'JCL',
      session: {
        when: 'Oct 28 · 10:02 to 10:20 AM · 18 min',
        moments: [
          ['10:02', 'doc', 'Opened scheduler view for the nightly chain'],
          ['10:06', 'terminal', '<code>reorg VENDMAST --dry-run</code>'],
          ['10:11', 'terminal', 'Moved POBATCH after VSAMREORG in the schedule', true],
        ],
      },
      steps: [['Reorg first', 'A fragmented VENDMAST makes PROCPO’s keyed reads slow enough to miss the 2 AM window.'], ['Keep the order', 'If the reorg is late, delay POBATCH instead of skipping the reorg.']],
      from: ['Your session · Oct 28'],
    },
  ];
  // Lands first in Priya's drafts when Maya presses "Send to Priya" on the inferred file-copy step
  const sentDraft =
  {
      id: 'd-sent1', kind: 'sent', title: 'Confirm: PDF invoices need their own folder', ago: 'just now', topic: 'Procurement', askedBy: 'Maya Chen', fromScenario: 'filecopy',
      shot: shots.filecopy,
      inferred: 'Your twin inferred this from your Mar 2025 session, where the invoice reporting job read every file in invoices/. Maya used it in PROC-512.',
      steps: [['PDFs go to invoices_pdf/', 'The invoice reporting job reads every file in <code>invoices/</code> as text, so a PDF there would break it.'], ['Copy before the done marker', 'Same rule as every other file in the job.']],
      from: ['Maya’s walkthrough of PROC-512', 'Your session · Mar 12 2025'],
    };
  // Added to drafts when Priya finishes the end-of-day interview
  const interviewDraft = {
    id: 'd-int1', kind: 'interview', title: 'Finding and checking a failed VENDSYNC run', ago: 'just now', topic: 'Procurement',
    steps: [['Check which step failed first', 'The alert only says VENDSYNC failed. jobstat shows the step and the SQL code.'], ['Don’t stop at RC=0', 'Compare the record count with yesterday’s. More than 1% off means a partial load: hold the PO batch.']],
    from: ['Your interview with Techne · today', 'Your session · yesterday'],
  };

  // Question Queue: shared by every senior. Only here do claims and locks exist.
  const queue = [
    {
      id: 'q1', kind: 'workaround', title: 'Invalid numeric data in PO-AMT', who: 'Maya Chen', role: 'New grad · Procurement', ago: 'just now', topic: 'COBOL', asked: 1,
      shot: shots.poamt,
      ai: [['Blank amount in record 14', 'COBOL can’t add spaces, so the run stops.'], ['Skip and count', 'Only add numeric amounts, and count the skipped records.']],
      did: { file: 'src/PROCPO.cbl', removed: ['NOT AT END ADD PO-AMT TO WS-TOTAL'], added: ['NOT AT END', '    IF PO-AMT IS NUMERIC', '        ADD PO-AMT TO WS-TOTAL', '    ELSE', '        ADD 1 TO WS-SKIPPED', '    END-IF'], result: 'Run finished · 1 record skipped' },
    },
    {
      id: 'q2', kind: 'uncovered', title: 'Is it safe to rerun PROCINV twice in one night?', who: 'Ana Park', role: 'New grad · Procurement', ago: '2h ago', topic: 'Procurement', asked: 3,
      context: 'PROCINV failed at 1:40 AM and the on-call reran it. Ana wants to know whether invoices could post twice.',
      aiSays: 'No twin covers this. Nothing in the team docs mentions rerunning PROCINV, and the 2 Slack threads about it end without an answer.',
    },
    {
      id: 'q3', kind: 'answer', title: 'What does ABEND S0C7 mean in the PO batch?', who: 'Jordan Lee', role: 'New grad · Batch ops', ago: '1h ago', topic: 'JCL', asked: 2, claimedBy: 'Dev K.',
      shot: shots.s0c7,
      ai: [['S0C7 is a data exception', 'A numeric field held something that isn’t a number.'], ['Find the record', 'The dump offset points to the ADD in PROCPO.']],
    },
    {
      id: 'q4', kind: 'workaround', title: 'Used SORT FIELDS=COPY to skip the vendor sort', who: 'Jordan Lee', role: 'New grad · Batch ops', ago: 'yesterday', topic: 'JCL', asked: 1,
      shot: shots.sortcopy,
      ai: [['Sort step was slow', 'SORT01 took 40 min on the full vendor file.'], ['Copy instead of sort', 'SORT FIELDS=COPY passes records through unsorted.']],
      did: { file: 'jcl/VENDSORT.jcl', removed: ['  SORT FIELDS=(1,6,CH,A)'], added: ['  SORT FIELDS=COPY'], result: 'VENDSYNC step 2 failed with a sequence error' },
    },
    {
      id: 'q5', kind: 'published', title: 'Setting up COBCPY once for every procurement repo', who: 'Maya Chen', role: 'New grad · Procurement', ago: '20m ago', topic: 'COBOL', asked: 0,
      note: 'I kept hitting “copybook not found” in every repo. Setting COBCPY once in ~/.zshrc fixed it everywhere, including the shared copybooks.',
      ran: ['echo \'export COBCPY=./copybooks:$HOME/shared/copybooks\' >> ~/.zshrc', 'source ~/.zshrc', './build.sh PROCVEND   # ✓ 0 errors'],
      steps: [['Add COBCPY to your shell profile', '<code>export COBCPY=./copybooks:$HOME/shared/copybooks</code> in <code>~/.zshrc</code>.'], ['Reload your shell', 'Run <code>source ~/.zshrc</code> or open a new terminal.']],
    },
    {
      id: 'q6', kind: 'uncovered', title: 'Do PDF invoices need a virus scan before the share?', who: 'Maya Chen', role: 'New grad · Procurement', ago: '15m ago', topic: 'Procurement', asked: 1,
      context: 'Asked during PROC-512, while adding PDF invoices to the nightly vendor file copy.',
      aiSays: 'No twin covers this. Priya R.’s twin knows the copy job but has never seen a security rule for PDFs.',
    },
  ];

  const docs = [
    { id: 'k1', title: 'Copybook not found when building locally', topic: 'COBOL', by: 'Priya R.', from: 'answer', used: 12, checked: '3 days ago', versions: 2, summary: 'Set COBCPY so the compiler can find shared copybooks.' },
    { id: 'k2', title: 'Rerunning the nightly vendor sync after a partial failure', topic: 'Procurement', by: 'Priya R.', from: 'session', used: 31, checked: '2 weeks ago', versions: 3, summary: 'Restart from the failed step, never the top. Steps 1 and 2 commit.' },
    { id: 'k3', title: 'What ABEND S0C7 means and how to find the bad record', topic: 'JCL', by: 'Dev K.', from: 'session', used: 58, checked: '1 month ago', versions: 4, summary: 'Data exception: a numeric field holds spaces or letters.' },
    { id: 'k4', title: 'Reading VENDMAST for reports', topic: 'Procurement', by: 'Priya R.', from: 'answer', used: 22, checked: '5 days ago', versions: 1, summary: 'Use the nightly CSV export, not the VSAM file.' },
    { id: 'k5', title: 'Where vendor tax codes come from', topic: 'Procurement', by: 'Lena M.', from: 'answer', used: 19, checked: '3 weeks ago', versions: 2, summary: 'SET-TAX-CODE looks up TAXTBL. Finance owns the table.' },
    { id: 'k6', title: 'Restarting a failed JCL step without rerunning the job', topic: 'JCL', by: 'Dev K.', from: 'interview', used: 44, checked: '2 months ago', versions: 3, summary: 'Use RESTART= on the job card and check what already committed.' },
    { id: 'k7', title: 'Reading a COBOL compile listing', topic: 'COBOL', by: 'Priya R.', from: 'published', author: 'Maya Chen', used: 27, checked: '1 week ago', versions: 2, summary: 'Where the errors, cross-reference and offsets live in the listing.' },
    { id: 'k8', title: 'PO aging report: how the buckets are calculated', topic: 'Procurement', by: 'Lena M.', from: 'session', used: 9, checked: '4 months ago', versions: 1, summary: '0–30, 31–60, 61–90 and 90+ days, counted from the approval date.', stale: true },
    { id: 'k9', title: 'Who owns what in procurement systems', topic: 'Onboarding', by: 'Team', from: 'published', author: 'Ana Park', used: 63, checked: '1 week ago', versions: 5, summary: 'Owners and Slack channels for every procurement program.' },
    { id: 'k10', title: 'The nightly vendor file copy, step by step', topic: 'Procurement', by: 'Priya R.', from: 'interview', used: 16, checked: '2 weeks ago', versions: 2, summary: 'Master before invoices, everything before the done marker.' },
  ];

  // What Priya's twin knows, for "What your twin knows" and "Test your twin"
  const twinKnows = {
    topics: [['Local COBOL builds', 24, 'verified'], ['Vendor sync and restarts', 18, 'verified'], ['Nightly vendor file copy', 11, 'verified'], ['VSAM and reporting exports', 9, 'verified'], ['PDF invoices', 1, 'inferred']],
    gaps: [['Rerunning PROCINV twice in a night', '3 new grads asked'], ['Who signs off on TAXTBL changes', '2 new grads asked']],
    test: {
      q: 'How do I rerun VENDSYNC after a lock timeout?',
      a: 'Restart from the failed step, never the top: steps 1 and 2 already committed, so rerunning them duplicates vendor rows. Then check the count is within 1% of yesterday’s.',
      src: 'Your session · yesterday · checked by you',
      gapQ: 'Can PROCINV run twice in one night?',
      gapA: 'I don’t know yet. You haven’t covered this in a session or interview. Techne can ask you about it on Friday.',
    },
  };

  // ── Senior IDE and interview ──
  const seniorIde = {
    file: 'VENDSYNC.jcl',
    code: [
      '//VENDSYNC JOB (PROC),\'VENDOR SYNC\',CLASS=A,MSGCLASS=X',
      '//*  Nightly vendor sync. 5 steps. Steps 1-2 commit to VENDMAST.',
      '//STEP01   EXEC PGM=VSLOAD',
      '//VENDIN   DD DSN=PROD.VENDOR.INBOUND,DISP=SHR',
      '//STEP02   EXEC PGM=VSMERGE',
      '//VENDMAST DD DSN=PROD.VENDMAST,DISP=OLD',
      '//STEP03   EXEC PGM=VSINDEX',
      '//*        -911 here usually means the 4 PM report holds a lock',
      '//STEP04   EXEC PGM=VSVERIFY',
      '//STEP05   EXEC PGM=VSNOTIFY,PARM=\'#proc-ops\'',
    ],
    term: [
      ['cmd', 'jobstat VENDSYNC'],
      ['', 'STEP03 VSINDEX   <span class="err-t">SQLCODE -911</span> · lock timeout'],
      ['cmd', 'restart VENDSYNC --from=STEP03'],
      ['', 'STEP03 VSINDEX   <span class="ok">RC=0</span>'],
      ['', 'STEP04 VSVERIFY  <span class="ok">RC=0</span> · 18,402 records'],
      ['cmd', 'verify VENDMAST --count --against=yesterday'],
      ['', '18,402 records · yesterday 18,377 · <span class="ok">within 1%</span>'],
    ],
    // Today's session, and the moments Techne flagged in it. pos is where the dot sits on the session bar (0-100).
    session: { label: 'Today’s session', range: '4:02 – 4:51 PM' },
    moments: [
      { time: '4:12 PM', line: 0, pos: 20, label: 'Went straight to jobstat', reason: 'You checked which step failed before anything else. New grads usually search Slack first.' },
      { time: '4:18 PM', line: 2, pos: 33, label: 'Restarted mid-job', reason: 'You skipped steps 1 and 2. New grads usually rerun from the top.', main: true },
      { time: '4:31 PM', line: 5, pos: 59, label: 'Checked the record count', reason: 'You compared the count with yesterday’s before telling #proc-ops. New grads usually stop at RC=0.' },
    ],
    probe: {
      moment: 1,
      q: 'You restarted VENDSYNC from step 3, not from the top. Why?',
      at: '4:18 PM · restart VENDSYNC --from=STEP03',
      answer: 'Steps 1 and 2 already committed to VENDMAST. Rerunning them inserts duplicate vendor rows, so restart from the step that failed.',
      lineage: 'rerun',
    },
  };
  // Why Techne asks each question: the cluster of real new grad questions behind it (anonymised)
  const lineage = {
    rerun: { cluster: 'Rerunning a batch job after a failure', count: '9 questions this month', moment: 1,
      questions: ['Can I just rerun the whole job after it fails?', 'VENDSYNC failed at step 3. Do I start it again from the beginning?', 'Is it safe to restart a batch job halfway through?'] },
    findfail: { cluster: 'Finding why a batch job failed', count: '7 questions this month', moment: 0,
      questions: ['Where do I see which step of a job failed?', 'The alert just says VENDSYNC failed. Where do I look?', 'How do I find the error code for a failed job?'] },
    checkdone: { cluster: 'Checking a batch job finished correctly', count: '6 questions this month', moment: 2,
      questions: ['RC=0 means it worked, right?', 'How do I know the vendor sync loaded everything?', 'What should the record count be after VENDSYNC?'] },
  };
  // End-of-day interview: one question per key moment, in the order they happened.
  // answer is what the field types out when the presenter types anything.
  const interview = [
    { moment: 0, lineage: 'findfail', q: 'At 4:12 you went straight to jobstat. What does it tell you that the alert doesn’t?',
      answer: 'The alert only says VENDSYNC failed. jobstat shows which step and the SQL code, and that decides where you restart.' },
    { moment: 1, lineage: 'rerun', q: 'At 4:18 you restarted VENDSYNC from step 3. Why not from the top?',
      answer: 'Steps 1 and 2 already committed to VENDMAST. Rerunning them inserts duplicate vendor rows, so restart from the step that failed.' },
    { moment: 2, lineage: 'checkdone', q: 'At 4:31 you checked the record count before telling #proc-ops. What number would have worried you?',
      answer: 'RC=0 only means the step ran. If the count is more than 1% off yesterday’s, it was a partial load, so hold the PO batch.' },
  ];

  const hotspots = [
    { topic: 'Copybooks and COBCPY', n: 18, trend: -30, cover: 'covered', twin: 'priya', next: null },
    { topic: 'Blank or bad numeric data (S0C7)', n: 14, trend: 55, cover: 'partial', twin: 'dev', next: 'Techne interviews Dev K. · Thu', cluster: 'findfail' },
    { topic: 'VSAM files for reporting', n: 11, trend: 0, cover: 'covered', twin: 'priya', next: null },
    { topic: 'Rerunning PROCINV', n: 9, trend: null, cover: 'gap', twin: null, next: 'Techne interviews Priya R. · Fri', cluster: 'rerun' },
    { topic: 'PDF invoices in the file copy', n: 6, trend: null, cover: 'inferred', twin: 'priya', next: 'Waiting on Priya R. to confirm' },
    { topic: 'TAXTBL ownership', n: 5, trend: 25, cover: 'gap', twin: null, next: 'Open in Question Queue' },
  ];
  const interviewsPlanned = [
    ['Dev K.', 'Blank or bad numeric data in batch input', 'Thu · 5 min', 'findfail'],
    ['Priya R.', 'Rerunning PROCINV safely', 'Fri · 5 min', 'rerun'],
    ['Lena M.', 'Checking the PO aging batch finished correctly', 'Mon · 5 min', 'checkdone'],
  ];
  // How the new grad persona Techne asks as is built, for "How Techne's questions are built"
  const personaPage = {
    clusters: [
      { id: 'rerun', name: 'Rerunning a batch job after a failure', n: 9, ex: 'Can I just rerun the whole job after it fails?' },
      { id: 'findfail', name: 'Finding why a batch job failed', n: 7, ex: 'The alert just says VENDSYNC failed. Where do I look?' },
      { id: 'checkdone', name: 'Checking a batch job finished correctly', n: 6, ex: 'RC=0 means it worked, right?' },
      { id: 'copybooks', name: 'Copybooks and local builds', n: 18, ex: 'Why can’t the compiler find my copybook?' },
    ],
    other: [['38', 'onboarding tickets', 'What new grads got stuck on in weeks 1 to 6'], ['1,240', '#proc-help messages', 'Last 12 months, names removed']],
    knows: ['CS degree', 'Python and Java', 'Git', 'Week 2 on the team'],
    doesnt: ['COBOL', 'JCL restarts', 'Copybooks', 'Procurement business rules'],
    never: [['user', 'Names of who asked'], ['lock', 'Anyone’s private twin'], ['edit', 'Private notes'], ['video', 'New grads’ recordings']],
    quality: { match: '8 in 10', matchText: 'of Techne’s questions matched questions real new grads asked later', useful: '74%', version: 'Version 3 · updated weekly from new questions' },
  };

  // ── New grad: Your Techne archive, learning path, report ──
  const archive = [
    { id: 'z1', date: 'Oct 12', type: 'saved', title: 'Copybook not found: set COBCPY, then rebuild', with: 'Saved fix · with Priya R.’s twin', topics: ['COBOL', 'Copybooks'], vis: 'private' },
    { id: 'z2', date: 'Oct 26', type: 'question', title: 'Invalid numeric data in PO-AMT', with: 'In the Question Queue', topics: ['COBOL', 'Test data'], vis: 'shared' },
    { id: 'z3', date: 'Oct 22', type: 'saved', title: 'Setting up COBCPY once for every repo', with: 'Published · +15 credits', topics: ['COBOL', 'Copybooks'], vis: 'published' },
    { id: 'z4', date: 'Oct 20', type: 'walk', title: 'Reading a compile listing', with: 'Priya R.’s twin', topics: ['COBOL'], vis: 'private' },
    { id: 'z5', date: 'Oct 16', type: 'question', title: 'What is a VSAM file?', with: 'Answered by Priya R.’s twin', topics: ['VSAM'], vis: 'private' },
    { id: 'z6', date: 'Oct 14', type: 'saved', title: 'First PO aging report run', with: 'Shared with the team', topics: ['Procurement'], vis: 'shared' },
    { id: 'z7', date: 'Oct 12', type: 'note', title: 'Who owns what in procurement', with: 'Your notes', topics: ['Procurement'], vis: 'private' },
  ];
  const graph = {
    nodes: [
      { id: 'COBOL', x: 210, y: 150, r: 34 }, { id: 'Copybooks', x: 90, y: 90, r: 22 }, { id: 'Test data', x: 110, y: 230, r: 16 },
      { id: 'VSAM', x: 330, y: 70, r: 16 }, { id: 'Procurement', x: 360, y: 210, r: 28 }, { id: 'Vendor files', x: 470, y: 120, r: 20 },
      { id: 'PDF invoices', x: 480, y: 280, r: 14 }, { id: 'JCL', x: 260, y: 310, r: 12 },
    ],
    links: [['COBOL', 'Copybooks'], ['COBOL', 'Test data'], ['COBOL', 'VSAM'], ['COBOL', 'Procurement'], ['Procurement', 'Vendor files'], ['Vendor files', 'PDF invoices'], ['Procurement', 'JCL'], ['VSAM', 'Vendor files']],
  };
  const learning = {
    role: 'Procurement engineer',
    compare: [['COBOL builds and listings', 62, 95], ['Vendor files and the nightly copy', 40, 92], ['Batch and JCL restarts', 15, 70], ['VSAM and reporting data', 18, 85], ['Procurement domain', 35, 96]],
    weeks: [
      { w: 1, title: 'Set up and first build', items: [['Clone procurement-core', 'done'], ['Build PROCVEND locally', 'done'], ['Meet Priya R. and Dev K.', 'done']] },
      { w: 2, title: 'Read the nightly chain', items: [['Fix a copybook error with Priya’s twin', 'done'], ['PROC-512: PDF invoices in the file copy', 'now'], ['Run the PO batch in test', 'next']] },
      { w: 3, title: 'Batch restarts', items: [['Shadow Dev K.’s twin on a JCL restart', 'next'], ['Read “Restarting a failed JCL step”', 'next']] },
      { w: 4, title: 'Reporting data', items: [['VSAM vs the nightly export', 'later'], ['Write your first report query', 'later']] },
    ],
    basis: 'Built from how you work: you finish walkthroughs in the IDE more often than you read docs (8 of your last 10).',
  };
  const report = {
    grad: {
      who: 'Maya Chen', title: 'Your twin this year', period: 'Sep–Oct 2026 · your first 2 months',
      stats: [['24', 'tasks saved to your twin'], ['31', 'walkthroughs finished'], ['3', 'docs you published'], ['45', 'credits earned']],
      growth: [['COBOL builds', 10, 62], ['Vendor files', 0, 40], ['Procurement domain', 5, 35], ['JCL', 0, 15]],
      highlights: ['Your COBCPY setup note is now a team doc, used 4 times.', 'Your PO-AMT workaround started a team-wide fix for test data.', 'You finished week 2 of 6 on your learning path, on schedule.'],
    },
    senior: {
      who: 'Priya R.', title: 'Your twin this year', period: 'Jan–Oct 2026',
      stats: [['612', 'questions your twin answered'], ['41', 'new grads helped'], ['128', 'docs you approved'], ['12', 'interviews with Techne']],
      growth: [['COBOL builds', 70, 95], ['Vendor sync', 40, 92], ['Nightly file copy', 20, 88], ['VSAM exports', 30, 85]],
      highlights: ['Your twin answered 9 in 10 COBOL build questions without anyone waiting.', 'Interviews with Techne filled 6 gaps new grads kept hitting.', 'Copybook questions dropped 30% since your runbook was published.'],
    },
  };

  return { twins, persona, tree, fid, scenarios: { checked, unchecked, filecopy, restart }, drafts, sentDraft, interviewDraft, queue, docs, twinKnows, seniorIde, interview, lineage, restartSteps, hotspots, interviewsPlanned, personaPage, archive, graph, learning, report };
})();
