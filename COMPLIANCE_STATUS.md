# Privacy & Legal Compliance Status (`COMPLIANCE_STATUS.md`)

**Last Updated:** 2026-11-11  
**Disclaimer (`MASTER §9`):** This document records **engineering implementation controls** only — it is **not legal advice**. All items marked `PARTIAL` or `NEEDS LEGAL` require review by qualified Indian/international privacy counsel before full commercial sign-off.

---

## 1. Verified Legal Sources & Dates

| Standard / Law | Source & Verification Date | Key Dates / Scope |
| --- | --- | --- |
| **India DPDP Act, 2023 & DPDP Rules, 2025** | Gazette Notification G.S.R. 846(E) / MeitY (`2026-11-11`) | Rules notified Nov 2025; Consent Manager provisions effective Nov 13, 2026; full Data Fiduciary obligations scheduled May 13, 2027. Implemented to full DPDP baseline now. |
| **CERT-In Directions (Apr 28, 2022, s.70B(6))** | CERT-In (`2026-11-11`) | 6-hour cyber incident reporting, 180-day ICT log retention in India, NTP sync, designated PoC (`RUNBOOK.md`). |
| **WCAG 2.2 AA** | W3C (`w3.org`, `2026-11-11`) | Official W3C Recommendation (Oct 5, 2023): visible focus, modal focus trap/restore, reduced motion, accessible target sizes. |
| **CCPA / CPRA Global Privacy Control (GPC)** | California OAG (`oag.ca.gov`, `2026-11-11`) | Binding opt-out preference signal (`navigator.globalPrivacyControl === true`) must automatically opt users out without override prompts. |

---

## 2. Actual Data Map (Verified Against Source & Runtime Network Trace)

| Data Element | Storage / Destination | Opt-In Required? | User Controls |
| --- | --- | --- | --- |
| WPM history, accuracy, weak keys, timestamps | Browser `localStorage` (`santypes_test_history`) | Core local functionality | Export JSON / Delete All Local Data |
| Streak dates (local calendar `YYYY-MM-DD`), XP, badges | Browser `localStorage` (`santypes_account_state`) | Core local functionality | Export JSON / Delete All Local Data |
| Curriculum unlocks & custom practice drills | Browser `localStorage` (`santypes_curriculum_progress`, `santypes_custom_lessons`) | Core local functionality | Edit/delete drill / Delete All |
| Theme, sound, font & accessibility preferences | Browser `localStorage` (`santypes_user_settings`) | Core local functionality | Reset Defaults / Delete All |
| Feedback rating, topic, 3D vote & local notes | Browser `localStorage` (`santypes_feedback_history_v1`) | Core local functionality | Free-text notes NEVER leave browser |
| Anonymous session/feedback telemetry (`G-3K423FWC7P`) | Google Analytics 4 (`anonymize_ip: true`, ads disabled) | **Yes — Strict Opt-In (`'unset'` default; `'denied'` on GPC)** | Banner, Cookie Preferences, Settings toggle + `_ga*` cookie wipe |
| Interface & multilingual typography (`.woff2`) | Bundled & served locally from `'self'` (`@fontsource/*`) | **Zero external requests** | Self-hosted in `dist/assets/` |

---

## 3. Compliance Matrix (India §9.1 & International §9.2)

| Item (ID) | Applies? | Status | Evidence / Location | Verified & Owner Notes |
| --- | --- | --- | --- | --- |
| **IN-01** Lawful basis & pre-collection notice | Yes | `DONE` (Eng) / `PARTIAL` (i18n) | `consent-banner.ts`, `privacy-modal.ts`, `privacy.ts` | Equal-prominence Accept/Reject, no pre-ticked boxes, notice precedes GA4 load; consider Hindi/Kannada translations of Privacy/Terms if targeting regional language readers (`NEEDS LEGAL`). |
| **IN-02** Data minimization & data map | Yes | `DONE` | `APP_STORAGE_KEYS`, `trackAnalyticsEvent()` | Typed scalars only in GA4; `0` free-text notes or keystrokes leave browser. |
| **IN-03** Easy consent withdrawal | Yes | `DONE` | Footer `Cookie Preferences`, Settings `Privacy & Data`, `PrivacyModal` | Instant toggle disable + `_ga*` cookie expiry. |
| **IN-04** Data principal rights (export, erasure, grievance) | Yes (Client) | `DONE` (Intake Linked) / `NEEDS LEGAL` | `collectAllLocalUserData()`, `eraseAllLocalUserData()`, `privacy-modal.ts` | Self-serve JSON export & full wipe verified; public support/grievance & security channels published (`github.com/suhas-hoskere/santypes/issues` & `/security`, `F-001` fixed). Dedicated custom-domain email optional if custom domain is bound later (`NEEDS LEGAL`). |
| **IN-05** Reasonable security safeguards | Yes | `DONE` (Client) | `firebase.json` CSP/HSTS, `html.ts`, `dialog-host.ts` | Strict `style-src-elem 'self'`, `font-src 'self'`, zero backend DB; hosting edge logs managed by Firebase/Google (`NEEDS LEGAL`). |
| **IN-06** Breach notification process (DPBI / users) | Yes (Ops) | `DONE` (Runbook) / `PARTIAL` (PoC) | `RUNBOOK.md §4` | SOP & 72h notification template documented; GitHub Issues/Security linked (`SECURITY.md`); owner holds emergency access internally. |
| **IN-07** Retention & erasure schedule | Yes | `DONE` | Local-only storage (`MAX_HISTORY` caps + instant erase button) | Data held strictly under user browser control. |
| **IN-08** Processors & DPAs | Yes (Google) | `NEEDS LEGAL` | Firebase Hosting CDN, optional GA4 (`G-3K423FWC7P`) | Self-hosted fonts eliminated Google Fonts as a processor; owner to accept/confirm Google Firebase & Analytics DPA terms. |
| **IN-09** Children (< 18) | Unknown / General | `NEEDS LEGAL` | General typing trainer; no account/ads/tracking by default | Confirm whether institutional school deployments require explicit parental consent copy. |
| **IN-10** Cross-border data transfer | Yes | `NEEDS LEGAL` | Local typing data never leaves user device; optional GA4 CDN | Confirm GA4 opt-in transfers comply with current DPDP country whitelist (`NEEDS LEGAL`). |
| **IN-11** Significant Data Fiduciary | `N/A` (currently) | `N/A` | Unauthenticated zero-DB client app | Revisit if designated by Central Government. |
| **IN-13** IT Act 2000 s.43A / SPDI | Yes | `DONE` | HSTS preload, zero passwords/financial/health SPDI collected | Verified in source & runtime. |
| **IN-14** CERT-In 6h reporting & PoC | Yes (Ops) | `DONE` (Runbook) / `PARTIAL` (PoC) | `RUNBOOK.md §4` | 6h escalation workflow written; hosting access logs governed by Google Firebase platform (`NEEDS LEGAL` + assign PoC). |
| **IN-15** IT Intermediary Guidelines 2021 | Unlikely (No hosted UGC) | `NEEDS LEGAL` | `terms.html`, `TermsModal` | Custom drills remain local on user's device; assign grievance contact when domain email added. |
| **IN-16..20, IN-22, IN-24** E-Commerce / RBI / Aadhaar / TRAI / GST / Regulated | **No** | `N/A` | Free educational client app | Zero payments, govt IDs, OTP/SMS, invoicing, or real-money gaming (3D arcade dormant/unshipped). |
| **IN-21 / INT-07** Accessibility (RPwD Act / WCAG 2.2 AA) | Yes | `DONE` (Core Pass 2) | `base.css`, `typing.css`, `settings.css`, `dialog-host.ts` | Focus rings (`:focus-visible`), Tab trap & focus restoration, hidden modal exclusion, `@media (prefers-reduced-motion)`, mobile `>= 44×44px` hit areas implemented & Chrome verified. |
| **IN-23** Open-source copyright & licenses | Yes | `DONE` | `package.json`, `audit/03_DEPENDENCIES.md` | Self-hosted `@fontsource` (OFL-1.1 / MIT/Apache), dev-only `lightningcss` (`MPL-2.0`), remaining dependencies MIT/ISC/Apache/BSD. |
| **INT-01 / INT-06** GDPR / UK GDPR & ePrivacy | Yes (Global web) | `DONE` (Tech) / `NEEDS LEGAL` | Self-hosted fonts (`0` pre-consent external calls), opt-in GA4, export/erasure | No tracking cookies or font CDN IP transfers before explicit consent; owner counsel review for representative/DPA (`NEEDS LEGAL`). |
| **INT-02** CCPA / CPRA & Global Privacy Control | Yes (US web) | `DONE` | `src/utils/privacy.ts` (`isGlobalPrivacyControlEnabled()`) | Auto-denies analytics & suppresses prompt when `navigator.globalPrivacyControl === true`; disclosed in `PrivacyModal` & verified by Vitest + Chrome. |
| **INT-03..05, INT-08..11** COPPA / PCI / HIPAA / AI Act / DSA / SOC 2 / Export | **No** | `N/A` | Pure local typing client | Zero payment cards, health records, server LLM inference, public UGC hosting, or enterprise tenant accounts. |
