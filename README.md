# Santypes — Precision Typing Platform

A keyboard-first, multi-script precision typing trainer built in zero-framework TypeScript and Vite. Santypes runs 100% locally in the browser with sub-millisecond keystroke timing, Indic grapheme-cluster segmentation (English, Kannada & Hindi), live telemetry charts, structured touch-typing lessons, and privacy-first local storage.

---

## Core Capabilities

- **Typing Arena:** Words, Time, Quote, Paragraph, Code, Numbers, Punctuation, Mixed, Custom text, and Adaptive Weak-Keys drills.
- **Multilingual Grapheme Engine:** Supports **English**, **Kannada** (Native & Kanglish), and **Hindi** (Native Devanagari & Hinglish) using grapheme-cluster segmentation.
- **Curriculum & Custom Drills:** Progressive structured chapters with finger placement guidance, targets, unlock progression, and local custom drills.
- **Analytics Dashboard:** Local session history, KPI summaries, velocity timeline, WPM bracket distribution, and JSON backup/erasure.
- **Self-Hosted & Privacy-First:** Zero backend database or user accounts, self-hosted typography via `@fontsource/*` (zero external font CDN beacons), Global Privacy Control (`GPC`) auto-opt-out, and consent-gated optional analytics.

---

## Quick Start (< 5 Minutes)

### Prerequisites
- **Node.js** `>= 20` (tested on `v24.19.0`) and **npm** `>= 10` (`11.17.0`).

### 1. Install Dependencies
```bash
npm install
```

### 2. Optional Environment Configuration
```bash
cp .env.example .env
```
Default builds work out of the box with no secrets or API keys required.

### 3. Run Locally
```bash
npm run dev
```
Opens `http://localhost:3000/`.

### 4. Verify Code Quality, Security & Tests
```bash
npm run lint        # Strict TypeScript & security rules via oxlint (0 errors/warnings)
npm run typecheck   # tsc --noEmit strict type verification
npm test            # Vitest unit, security, and compliance test suite
npm run build       # Production bundle into dist/
npm run preview     # Strict CSP preview server at http://localhost:4173/
npm audit           # Supply-chain CVE scan
```

---

## Project Architecture

```text
index.html                  App shell, semantic landmarks, metadata, consent mount
public/                     Static compliance/error pages (/404.html, /500.html, /faq.html, /terms.html, static-pages.css, .well-known/security.txt, robots.txt, sitemap.xml)
src/
  main.ts                   Bootstrap, self-hosted @fontsource CSS, tab router, error boundary
  core/                     Pure domain logic: engine, metrics, grapheme segmentation, corpora, finger guide, gamification, legal content
  components/               Accessible UI modals & widgets (DialogHost focus trap, Privacy, Settings, Profile, FAQ, Terms, Feedback, Consent Banner, Shortcuts, Live Keyboard, Hands Visualizer)
  views/                    Typing Test Arena, Curriculum, Analytics dashboards
  stubs/                    Typed browser localStorage persistence services (settings, account, curriculum, history)
  utils/                    XSS escaping & safe numbers (html.ts), DialogHost, chart canvas renderer, Web Audio synth (sound.ts), privacy/GPC gating (privacy.ts)
  styles/                   Modular CSS design system (OLED/Dark/Serika themes, reduced motion, responsive layout)
tests/                      Vitest regression, security, compliance, engine, grapheme, metrics & settings tests
```

---

## Governance & Documentation

- [`PROJECT_PROFILE.md`](./PROJECT_PROFILE.md) — Scope, active compliance modules, and Threat Model Lite
- [`DECISIONS.md`](./DECISIONS.md) — Architecture Decision Records (ADRs) & owner sign-offs
- [`COMPLIANCE_STATUS.md`](./COMPLIANCE_STATUS.md) — Data map, India DPDP / CERT-In / IT Act & international compliance status
- [`SECURITY_REVIEW.md`](./SECURITY_REVIEW.md) — Pre-launch security & quality review matrix (`SEC-01`..`SEC-40`, `UX/SEO/A11Y`)
- [`RUNBOOK.md`](./RUNBOOK.md) — Deployment, rollback, key rotation, and 6h CERT-In / 72h DPBI incident response
- [`SECURITY.md`](./SECURITY.md) — Vulnerability disclosure policy and supported versions
