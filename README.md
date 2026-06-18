# Governing an AI Workforce

**Cornell Johnson &middot; BANA6020 Managerial Reporting &middot; Unit 7 Individual Project**
By Kayvon Jafarzadeh.

An interactive, governed artifact that applies the *Holding Bots Accountable* deliberation guide (Module 6.2) and the core ideas of managerial reporting to a real enterprise: The Tech Plate, an AI-native media company, and its workforce of eight production AI agents.

The Tech Plate is the **setting under analysis**, not a product this site promotes. The artifact is a Cornell academic project.

## What is here

- An orientation card that governs every claim downstream.
- A step-by-step trace of the Module 6.2 deliberation guide applied to the real agents.
- An interactive Bot Register and a Bot Accountability Auditor.
- A balanced scorecard, a gaming-and-tilting analysis, a social-accounting section, and an internal supply-chain diagram.
- Five personal reflections on the course.

## Tech

Static site, no build step. Plain HTML, CSS, and JavaScript. Chart.js is loaded from a CDN. Hosted on GitHub Pages, which serves it read only: only the repository owner can change the live page.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

- `index.html` all content and section anchors
- `styles.css` design tokens and components
- `data/agents.js` the eight agents, single source of truth
- `app.js` navigation, register, auditor, reveals
- `charts.js` scorecard radar and gaming curve
