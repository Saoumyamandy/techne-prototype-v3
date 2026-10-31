# Techne prototype v3

A clickable prototype of Techne, an IDE workspace where every engineer has a **twin** that grows with their career.

**Live:** https://saoumyamandy.github.io/techne-prototype-v3/

Previous rounds:
- v2: https://saoumyamandy.github.io/techne-prototype-v2/
- Round 1: https://saoumyamandy.github.io/techne-prototype/

## The idea

- **Your twin.** Every engineer has one. It learns from what you save: tasks, walkthroughs and questions. It's private until you share something.
- **Senior Techne** routes questions across seniors' twins. Every answer names the twin it came from ("answering from Priya R.'s twin"), or says plainly that no twin covers it yet.
- **Nova** is a synthetic new grad, always labelled *Synthetic*. Nova interviews seniors about key moments, so their twins learn the *why* behind their work. Nova is built from real new grads' questions and is never a real person.
- Nothing joins the team docs until a senior approves it.

## What to try

Use the dark bar at the top to switch between **New grad**, **Senior** and **Mobile**, pick a screen, and compare variants. Press H to hide the bar.

**New grad**
- **IDE**, with three scenarios:
  - *Covered*: Priya's twin has a verified answer.
  - *Not covered*: no twin covers it. Your workaround goes to the Question Queue.
  - *File copy*: a task, not an error. General steps are mixed with steps from Priya's twin, and one inferred step is sent to Priya to confirm. It ends with a git commit and the save dialog.
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
- **Your IDE:** a recording indicator and Pause, Nova's question card, and the end-of-day interview, which drafts a doc into Your twin's drafts.
- **Hot spots:** where new grads' questions cluster, and which interviews Nova has planned.
- **Your year:** the senior's own report.

**Mobile** (phone frame): senior drafts on the go, Nova's questions with quick replies and voice, a new grad asking Senior Techne in Slack, and the new grad's twin.

Short links: `#filecopy`, `#archive`, `#senior`, `#queue`, `#senior-ide`, `#hotspots`, `#mobile`.

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
| `data.js` | Twins, Nova, scenarios, drafts, queue, repository and page content |
| `grad.js` | New grad IDE, walkthrough variants, save dialog |
| `gradpages.js` | Your twin, learning path, onboarding, year report |
| `senior.js` | Your Home, Question Queue, repository, review sheets |
| `seniorpages.js` | Senior IDE, Nova's interview, hot spots |
| `mobile.js` | Mobile tab |
