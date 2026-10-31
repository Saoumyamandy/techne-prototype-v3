# Techne prototype v3

A clickable prototype of Techne, an IDE workspace where every engineer has a **twin** that grows with their career.

**Live:** https://saoumyamandy.github.io/techne-prototype-v3/

Previous rounds:
- v2: https://saoumyamandy.github.io/techne-prototype-v2/
- Round 1: https://saoumyamandy.github.io/techne-prototype/

## The idea

- **Your twin.** Every engineer has one. It learns from what you save: tasks, walkthroughs and questions. It's private until you share something.
- **Senior Techne** routes questions across seniors' twins. Every answer names the twin it came from ("answering from Priya R.'s twin"), or says plainly that no twin covers it yet.
- **Techne asks as a new grad.** When Techne interviews seniors about key moments, it asks as a synthetic new grad, always labelled *Synthetic*: the questions real new grads ask, so seniors' twins learn the *why*. It's never a real person.
- Nothing joins the team docs until a senior approves it.

## What to try

Use the dark bar at the top to switch between **New grad**, **Senior** and **Mobile**, pick a screen, and compare variants. Press H to hide the bar.

**New grad**
- **IDE**, with four scenarios:
  - *Covered*: Priya's twin has a verified answer.
  - *Not covered*: no twin covers it. Your workaround goes to the Question Queue.
  - *Restart after failure*: Maya's VENDSYNC fails at step 3 (SQLCODE -911). Senior Techne answers from Priya's twin (3 verified · 1 general), and "Where this comes from" traces each step back to Priya's session, her answer to Techne and her approval.
  - *File copy*: a task, not an error. General steps are mixed with steps from Priya's twin, and one inferred step is sent to Priya to confirm. It ends with a git commit and the save dialog.
- **Seen before** (`#seen`): Maya's twin already holds the copybook fix, so help is one line with the command and Run in terminal.
- **Walkthrough styles:** Split (the default), Glass or Both. **Help placement:** terminal button or corner button. The **Senior Techne** toggle sets whether help pops up on its own.
- **Your twin:** a knowledge graph and timeline. Items are private by default, and you can share them for credits.
- **Learning path**, **What Techne records** (onboarding and permissions, never used in performance reviews), and **Your year** (a report you own).

**Senior**
- **Your Home:**
  - *Your twin's drafts* come first. They're only yours, never locked, with To do and Done tabs. Every item opens for review, and approving can be undone.
  - *What your twin knows* shows topics, gaps and Test your twin.
  - *Your impact* is collapsed by default.
- **Question Queue:** shared by every senior. You claim an item before answering it, and claimed items are locked for everyone else.
- **Company repository:** every approved doc and its history.
- **Your IDE:** a recording indicator and Pause, a session timeline with the key moments Techne flagged (star a terminal line to see why), Techne's question card with "Why Techne is asking", and the end-of-day interview. Answering drafts a doc into Your twin's drafts.
- **How Techne's questions are built** (`#persona`): what the new grad persona is built from, what it deliberately doesn't know, what's never used, and how its quality is measured. Every Synthetic badge links here.
- **Hot spots:** where new grads' questions cluster, and which interviews Techne has planned.
- **Your year:** the senior's own report.

**Mobile** (phone frame): senior drafts on the go, Techne's questions with quick replies and voice, a new grad asking Senior Techne in Slack, and the new grad's twin.

Short links: `#senior-ide`, `#senior`, `#restart`, `#seen`, `#filecopy`, `#persona`, `#onboarding`, `#archive`, `#queue`, `#hotspots`, `#mobile`.

Answer fields on Techne's questions type out a prepared answer whatever keys you press. Replay resets every screen.

All names, code and data are made up.

## Run locally

```
python3 -m http.server 5196
```

Then open http://localhost:5196. It's plain HTML, CSS and JavaScript with no build step.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page structure |
| `styles.css`, `v2.css` | Round 1 styles, plus v2 additions |
| `app.js` | Prototype bar, state, icons, and shared tags and toasts |
| `data.js` | Twins, the new grad persona, scenarios, drafts, queue, repository and page content |
| `grad.js` | New grad IDE, walkthrough variants, save dialog |
| `gradpages.js` | Your twin, learning path, onboarding, year report |
| `senior.js` | Your Home, Question Queue, repository, review sheets |
| `seniorpages.js` | Senior IDE, Techne's interview, hot spots |
| `mobile.js` | Mobile tab |
