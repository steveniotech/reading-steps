# Reading Steps — io TECH local brand adaptation

Status: User visual acceptance completed. The user reviewed and approved the local brand adaptation (logo, header, Learning Hub return link, blue/white color palette, card styling, and passage/task layout) on 2026-11-05. No commit, push or publication.

> [!IMPORTANT]
> User visual acceptance is strictly confined to the visual styling and layout sample. It is NOT an acceptance of full-course browser completion. The remaining three passages have not been stepped through manually in the browser. Physical devices and screen readers remain unverified as recorded below.

## Starting work and preservation

Before implementation, Git showed existing modifications to `README.md` and `TESTING.md`, plus untracked report and test files (`reading-report.js`, `report.html`, `test-reading-pv1.js`, `test-reading-records.js`, `test-reading-skills.js`, `test-reading-supplement.js`). These are prior work and have been strictly preserved.

The original `index.html` and `styles.css` were copied into ignored `.local/brand-review/before/`, with starting hashes stored in `.local/brand-review/baseline.json`. All curriculum, passage texts, scoring, rewards, records, practice completion scripts, and tests remain byte-identical. No student records or data were modified.

## Changes

- `index.html`: actual approved logo with full tagline, compact centered header, Learning Hub link (`../io-tech-learning-hub/`), brand stylesheet and PNG favicon references. Skip link added for keyboard accessibility. All reading controls, practice points, sound toggle, teacher settings, reading passage, and task cards are retained.
- `brand.css`: matching system sans typography, consistent blue/white palette, rounded controls and outer cards (`border-radius: 22px;`), semantic success/warning badges and clear focus indicators. The educational reading layout (sticky task card, large comfortable passage reading typography with font-size controls, clear sentence choices) is fully preserved without body-level overflow hiding.
- `assets/io-tech-center-logo.png`: exact byte copy of the accepted logo, 1383 × 742, unchanged aspect ratio and opaque white background.
- `scripts/serve-brand-review.mjs`: loopback-only review on port 8774, serving only explicit public runtime files plus the preserved pre-adaptation baseline.
- `scripts/check-brand-review.mjs`: checks routed PNG bytes, mime types, dimensions, allowlist resources, private-path denial, and HTTP responses.
- `.gitignore`: ignores `.local/` review snapshots, logs and screenshots.

## Local review

From the project root:

```sh
node scripts/serve-brand-review.mjs
```

- Preview: http://127.0.0.1:8774/reading-steps/
- Baseline (before): http://127.0.0.1:8774/before/reading-steps/

The sibling Learning Hub link resolves to `https://steveniotech.github.io/io-tech-learning-hub/` on GitHub Pages and maps locally to port 8765.

## Checks actually completed

- `node test-state.js`: passed (flow, rewards, confetti, audio state checks).
- `node validate.js`: passed (word counts, data integrity, privacy constraints, dependency closure).
- `node test-pages-practice.js`: passed (19 Pages practice groups).
- `node scripts/check-brand-review.mjs --http`: passed.
- `git diff --check`: passed (code 0).
- Calculated text contrast: primary white/blue 5.37:1, body on page 11.64:1, secondary on white 6.40:1, choice text on selection 7.2:1.

## Browser verification results (2026-11-05)

- **Learning Hub Return Navigation**:
  - The header link uses relative destination `href="../io-tech-learning-hub/"`.
  - In local review (port 8774), requests to `/io-tech-learning-hub/` issue HTTP 302 to the running local Hub preview at `http://127.0.0.1:8765/io-tech-learning-hub/` (verified 200 OK, page title "io Tech Learning Hub").
  - On production GitHub Pages (`https://steveniotech.github.io/reading-steps/`), the relative link resolves directly to `https://steveniotech.github.io/io-tech-learning-hub/`. The formal link requires no alteration.
- **Full Reading Flow (Article 1: A Sign for the Garden)**:
  - Real Chrome browser walkthrough in an isolated profile with clean local storage:
    - Step 0 (Read): Passage loaded, font-size comfortable (20px), primary "Continue" button clickable.
    - Step 1 (What): Option "b" selected, verified feedback, advanced to evidence.
    - Step 2 (What Evidence): Sentences 1, 4, 6 checked in passage, verified feedback, advanced to Why.
    - Step 3 (Why): Option "a" selected, verified feedback, advanced to evidence.
    - Step 4 (Why Evidence): Sentence 2 checked, verified feedback, advanced to How.
    - Step 5 (How): Option "c" selected, verified feedback, advanced to evidence.
    - Step 6 (How Evidence): Sentences 4, 5, 6 checked, verified feedback, advanced to Put It Together.
    - Step 7 (Retell Writing): Typed 111-character summary into textarea, submitted.
    - Step 8 (Self-Check): 4 checklist items checked, submitted.
    - Step 9 (Completion Screen): Final card unhidden, Practice Points reached 60, "Garden Care" badge displayed, unique practice ID `RS-...` generated, "Copy Summary", "Copy Practice ID", and "Practise Again" buttons visible, unobstructed, and responsive.
  - Page layout check: `scrollWidth <= clientWidth` across all 9 screens; no unexpected horizontal scrolling.
- **Scope limitation**:
  - Exactly 1 article ("A Sign for the Garden") was fully executed and verified in the real browser.
  - The remaining 3 articles ("The Wobbly Book Cart", "A Tray for Reused Paper", "Keeping Rain Away from the Door") are verified via automated unit and state tests (`test-state.js`, `test-pages-practice.js`), but have not been manually or visually stepped through in the browser.
  - No commit, push or publication. Awaiting user visual review.
