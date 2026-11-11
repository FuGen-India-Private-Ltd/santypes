# Architecture & Governance Decisions (`DECISIONS.md`)

---

## ADR-001: Client-First Pure TypeScript + Vite SPA Stack (Zero Backend Database)
- **Date:** 2026-11-11 · **Status:** Approved
- **Context:** Santypes needs sub-millisecond keystroke precision, instant Indic grapheme scoring, and lightweight zero-cost static hosting without managing sensitive user accounts, passwords, or server databases.
- **Options Considered:**
  1. Client-first TypeScript + Vite SPA on Firebase Hosting + `localStorage`
  2. Next.js SSR + managed PostgreSQL + user authentication
  3. Plain unbundled JS modules
- **Decision & Why:** Option 1 (`TypeScript 5.9` strict mode + `Vite 8` + `Vitest 5` deployed statically to Firebase Hosting). Eliminates password storage, database attack surface, server latency during keystrokes, and recurring backend costs.
- **Security / Privacy / Compliance Impact:** Eliminates `M1 Auth`, `M2 Payments`, `SEC-01` SQL/RLS exposure, and server SPDI retention; requires clear `localStorage` JSON export & erasure (`PrivacyModal`) and honest disclosure that cross-device cloud sync does not exist.
- **Cost / Lock-In / Exit Path:** Near-zero hosting cost (Firebase free tier); pure static `dist/` bundle deploys cleanly to any static host (Cloudflare Pages, Netlify, GitHub Pages, S3/CloudFront).
- **Risks Accepted:** Data clears if user wipes browser site storage (mitigated via one-click JSON export in Privacy settings).

---

## ADR-002: Consent-Gated Analytics, Global Privacy Control (GPC) & Self-Hosted Typography
- **Date:** 2026-11-11 · **Status:** Approved (Updated in Audit Pass 2)
- **Context:** Audit Pass 1 (`F-003`, `F-005`) showed `navigator.globalPrivacyControl = true` was ignored and external `fonts.googleapis.com` / `fonts.gstatic.com` requests fired unconditionally on page load alongside `'unsafe-inline'` in `style-src`.
- **Options Considered:**
  1. Keep external Google Fonts CDN and add inline `<script>` GPC workaround
  2. Self-host all typography via `@fontsource/*`, move static page CSS into `public/static-pages.css`, tighten CSP (`font-src 'self'; style-src-elem 'self'`), and auto-honor `GPC` inside `privacy.ts`
- **Decision & Why:** Option 2. Eliminates every pre-consent third-party network call (`0` external requests on load), enables strict `style-src-elem 'self'` CSP against injected `<style>` tags, guarantees offline/fast font rendering, and complies automatically with CCPA/CPRA GPC + GDPR/DPDP opt-in consent.
- **Security / Privacy / Compliance Impact:** Resolves `F-003` and `F-005`; removes external font provider IP/User-Agent exposure prior to user consent.
- **Cost / Lock-In / Exit Path:** Minor bundle asset increase from `.woff2` font chunks cached immutably (`max-age=31536000`).

---

## ADR-003: Strict `oxlint` CI Quality Gate with Zero Vulnerable Dependencies
- **Date:** 2026-11-11 · **Status:** Approved
- **Context:** `F-002` and `F-011` required a strict TypeScript/security linter (`npm run lint`) and CI gate. Installing `eslint@10` + `typescript-eslint` during Pass 2 introduced 10 moderate `minimatch` ReDoS advisories via transitive plugins.
- **Options Considered:**
  1. Keep `eslint` with 10 moderate transitive advisories via `overrides`
  2. Use `oxlint@1.93.0` (`no-explicit-any`, `no-eval`, `no-implied-eval`, `no-script-url`, `no-unused-vars`, `no-alert`, `no-console`) with `0` npm vulnerabilities
- **Decision & Why:** Option 2 (`oxlint`). Maintains zero known vulnerabilities (`found 0 vulnerabilities` in `npm audit`) while enforcing strict no-`any` and security rules across all active `src/` and `tests/` in ~25ms.
- **Security / Privacy / Compliance Impact:** Satisfies `SEC-15`, `SEC-36`, and `Q-03` without introducing vulnerable parser trees.
- **Cost / Lock-In / Exit Path:** Standard `.oxlintrc.json` config; trivially swappable later once `eslint` resolves transitive advisories.

---

## ADR-004: Public Support & Vulnerability Disclosure via GitHub Issues & Security Advisories (`F-001`)
- **Date:** 2026-11-11 · **Status:** Approved & Implemented (`2026-11-11`)
- **Context:** Firebase `.web.app` default subdomains (`san-types.web.app`) do not host inbound email MX mailboxes, and publishing a maintainer's personal email creates spam/doxxing risk (explicitly scrubbed in earlier fixes). Inventing a fake `@san-types.web.app` email would fail deliverability.
- **Options Considered:**
  1. Fabricate an unrouted `@san-types.web.app` address (rejected — broken/dishonest)
  2. Link directly to non-email repository disclosure channels on `https://github.com/suhas-hoskere/santypes` (**GitHub Security** `/security` and **GitHub Issues** `/issues`), optionally adding a custom-domain mailbox later when a custom domain is attached
- **Decision & Why:** Option 2, confirmed by owner (`2026-11-11`). Publishes verified, active HTTP `200` contact URLs across `public/.well-known/security.txt`, `SECURITY.md`, `PrivacyModal`, `legal-content.ts`, `public/faq.html`, and `public/terms.html` without exposing personal email PII.
- **Risks Accepted:** For strict formal Indian DPDP grievance correspondence by email later, add a custom-domain role mailbox (`privacy@<domain>`) once DNS MX is configured, and ensure GitHub **Private vulnerability reporting** is toggled enabled under repo *Settings → Code security and analysis*.

---

## ADR-005: Retention of Archived 3D Arcade Sources Outside Production Bundle & Clean Public `main` Upgrade (`F-009`, `F-010`)
- **Date:** 2026-11-11 · **Status:** Approved by Owner (`2026-11-11`)
- **Context:** `three@^0.185.1` was previously declared in runtime `dependencies` despite arcade 3D routes being disabled; local `master` history contains pre-remediation author/email metadata. Under Master Directive `AG-02`, deleting source directories or publishing private git commits requires explicit human approval.
- **Decision & Why:** Move `three` out of runtime `dependencies` into `devDependencies` (keeping `dist/` completely clean of Three.js), keep archived `src/views/arcade*` / `src/engine/` / `src/data/` files untouched in the V2 codebase (confirmed by owner `2026-11-11`), ignore `*.zip` & `audit/` in `.gitignore`, and upgrade public `origin/main` cleanly with a single squashed V2 release commit (removing legacy V1 static HTML/screenshot files from `main` while leaving V1 preserved in `origin/main` git history, with zero local `master` intermediate email commits exposed).
