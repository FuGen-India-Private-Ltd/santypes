# Project Profile & Threat Model (`PROJECT_PROFILE.md`)

## 1. Project Profile (§1.4)

- **Summary:** Santypes is a client-side, multi-script (English, Kannada, Hindi) precision typing platform featuring real-time WPM/accuracy/consistency analytics, interactive finger guidance, structured lessons, local custom drills, and optional consent-gated telemetry.
- **Stage / Platforms:** Production candidate web SPA (`dist/`) hosted statically on Firebase Hosting (`https://san-types.web.app/`), responsive across mobile (`320px–375px`), tablet (`768px`), and desktop (`1024px–1440px`).
- **Users & Regions:** General public learners & developers — India-first (`en`, `kn`, `hi`) plus global visitors (EU/UK/US). No user accounts or role tiers.
- **Data Collected & Classification:**
  - *Typing history, custom drills, XP/streaks/badges, theme/audio settings, feedback drafts* — **Low / Local Personal Preference Data**: stored strictly inside browser `localStorage` (`santypes_*` keys); zero server transmission.
  - *Optional Usage Analytics (`G-3K423FWC7P`)* — **Anonymous Behavioral Telemetry**: strictly disabled by default and gated behind explicit opt-in (`PRIVACY_CONSENT_KEY`), honoring `Global Privacy Control (GPC)` (`navigator.globalPrivacyControl === true`); IP anonymization enabled, ad personalization disabled, free-text notes excluded.
  - *Sensitive / Regulated Data (passwords, Aadhaar/PAN, payments, health, biometrics):* **None collected.**
- **Features:** Multi-mode typing arena, Curriculum lessons + local custom drills, Analytics canvas charts, JSON export & one-click full erasure, FAQ/Terms/Privacy interactive modals + static pages (`/faq.html`, `/terms.html`, `/404.html`, `/500.html`), Procedural Web Audio keystroke synthesis.
- **Third Parties:**
  - *Firebase Hosting (Google)* — Static CDN serving HTML/CSS/JS bundles over HTTPS.
  - *Google Analytics 4 (`G-3K423FWC7P`)* — Dynamically loaded **only** after explicit user opt-in consent (zero pre-consent requests; self-hosted `@fontsource/*` fonts remove external Google Fonts CDN calls completely).
- **Active Modules (§1.3 Matrix):**
  - Core Always-On: `§4 Agent Conduct`, `§5 Security Baseline`, `§6 Quality`, `§7 Frontend/UX/SEO/A11Y`, `§8 Delivery Gates`, `§9.1 India`, `§9.2 International`
  - Conditional Module Active: **`M13 Tracking & Consent`**
  - Dormant / N/A Modules: `M1 Auth` (no accounts), `M2 Payments` (free app), `M3 Files` (no server upload), `M4 AI Features` (local heuristic drill generator only, no LLM API), `M5 Mobile`, `M6 Multi-tenancy`, `M7 Public API/Webhooks`, `M8 Messaging` (no automated email/SMS), `M9 Children` (general audience utility — flag `NEEDS LEGAL` if marketed to minors), `M10 Sensitive Data`, `M11 E-Commerce`, `M12 Public UGC` (custom drills stay strictly local).
- **Applicable Laws & Standards (§9):**
  - *India:* DPDP Act 2023 & DPDP Rules 2025 (`IN-01..IN-12`), IT Act 2000 s.43A (`IN-13`), CERT-In Directions Apr 2022 (`IN-14`), RPwD Act 2016 / WCAG 2.2 AA (`IN-21`), Open-source licensing (`IN-23`).
  - *International:* GDPR / UK GDPR & ePrivacy (`INT-01`, `INT-06`), CCPA / CPRA & Global Privacy Control (`INT-02`), WCAG 2.2 AA (`INT-07`).
- **Agent Permissions:** Local source inspection, lint/typecheck/test/build/Chrome CDP verification, and documentation generation authorized; production Firebase deploy / remote git force-push / destructive source deletions strictly gated on explicit human confirmation (`AG-02`, `AG-04`).
- **ASSUMED Items (Human Owner to Confirm):**
  1. Hosted origin remains `https://san-types.web.app/` unless migrated to a custom domain.
  2. Archived 3D arcade code (`src/views/arcade*`, `three` in `devDependencies`) remains inactive/unlinked unless explicitly re-enabled or removed by owner (`AG-02`).
  3. Dedicated custom-domain grievance / security mailbox (`NEEDS-OWNER-MAILBOX`) will be provisioned once a custom domain with inbound email is attached.

---

## 2. Threat Model Lite (§2)

### Assets
- User's local typing history, custom text drills, preferences, and feedback drafts in browser `localStorage`
- Browser DOM integrity & application origin trust (`san-types.web.app`)
- Privacy consent integrity (zero unconsented GA4 tracking; honoring GPC signals)
- Brand integrity & supply chain (`package-lock.json` & CI pipeline)

### Threat Actors
- Malicious third-party content pasted/imported into custom drills or forged `localStorage` payloads (self-XSS / DOM injection)
- Compromised npm dependency / build plugin (supply-chain attack)
- Unintentional tracking leak (loading third-party CDNs or analytics before consent / ignoring GPC)
- Automated copy-paste cheating in typing test results
- Prompt-injected / faulty agent change introducing unsafe sinks or credentials

### Top Entry Points & Mapped Controls

| # | Abuse Case | Entry Point | Mapped Control | Implementation |
|---|---|---|---|---|
| 1 | Stored/DOM XSS via malicious Custom Lesson title, feedback note, or tampered `localStorage` | Curriculum custom form, Feedback modal, Analytics history table | `SEC-05`, `SEC-24` | `escapeHTML()`, safe text assignments (`textContent`), typed SVG enums (`getBadgeCategorySvg`), CSP (`script-src-attr 'none'`, `object-src 'none'`, `style-src-elem 'self'`) |
| 2 | Prototype pollution via crafted lesson/weak-key identifiers (`__proto__`, `constructor`) | `localStorage` JSON parse & record indexing | `SEC-05` | `Object.create(null)` maps, `Object.hasOwn()`, `isSafeRecordKey()` guards |
| 3 | Unconsented analytics tracking or ignoring browser opt-out (`GPC`) | Page load / `initPrivacyAndConsent()` | `M13`, `INT-01`, `INT-02`, `IN-01` | Strict opt-in before injecting GA4, `isGlobalPrivacyControlEnabled()` auto-deny, immediate `_ga*` cookie expiry, zero external font CDN calls |
| 4 | Free-text PII accidentally forwarded inside analytics telemetry | Feedback form submission (`trackAnalyticsEvent`) | `IN-02`, `SEC-29`, `SEC-39` | Strict scalar enum/boolean schema (`rating`, `games_vote`, `topic`, `has_notes`), zero free-text notes transmitted |
| 5 | Crash / NaN / infinite loop via malformed numbers, negative bounds, or unmounted async timers | Engine metrics, `localStorage`, countdown/view transitions | `Q-04`, `Q-15` | `finiteNumber()`, bounded array limits, `isDestroyed` / `container.isConnected` checks, global runtime error boundary |
| 6 | Copy-paste / drag-drop score inflation in typing arena | `#typing-native-input` `paste` / `drop` events | `SEC-35` | `preventDefault()` on `paste` & `drop` inside test input + user notification |
| 7 | Supply-chain compromise or vulnerable package shipped in production | `package.json` / build toolchain | `SEC-15`, `SEC-36` | Pinned dependency versions + committed `package-lock.json` + `0` CVE `npm audit` + CI `oxlint` gate |
| 8 | Clickjacking, MIME sniffing, referrer leak | HTTP response headers | `SEC-08`, `SEC-18` | HSTS preload, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| 9 | Unreachable operator for security reports or DPDP grievances | `/.well-known/security.txt`, Privacy/Terms disclosures | `IN-04`, `SEC-17`, `LEG-UI-01` | Valid RFC 9116 metadata + transparent `NEEDS-OWNER-MAILBOX` flag tracked in `DECISIONS.md` / `COMPLIANCE_STATUS.md` (`OPEN` owner action) |
| 10 | Missing operator runbook / unverified recovery after accidental breakage | Production hosting deployment | `SEC-40`, `IN-06` | `RUNBOOK.md` Firebase rollback & incident notification templates + `/500.html` & runtime recovery UI |
