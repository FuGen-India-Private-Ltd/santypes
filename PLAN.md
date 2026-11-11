# Release & Quality Execution Plan (`PLAN.md`)

## Objective
Bring Santypes v2.0.0 to release readiness against `MASTER PROJECT PROMPT (v1.0)` and `FINAL AUDIT PROMPT (v1.0)` by resolving all applicable Pass 1 findings (`F-001`–`F-013`) while preserving **0 CVEs**, **0 TypeScript errors**, **0 lint errors/warnings**, and **0 runtime crashes**.

## Milestones

| Phase | Scope | Status |
| --- | --- | --- |
| **Phase 1 — Pass 1 Adversarial Audit** | Scope, endpoint/storage map, authz matrix, supply-chain scan, Chrome CDP chaos & XSS probing, legal compliance audit (`audit/REPORT.md`) | **Completed** (`NO-GO` baseline) |
| **Phase 2 — Security & Privacy Fixes** | Honor browser `Global Privacy Control (GPC)` (`F-003`), local calendar date keys for IST/timezone streak rollover (`F-004`), bundle self-hosted `@fontsource/*` fonts (`0` external font requests), extract static CSS + enforce strict CSP `style-src-elem 'self'` & dev CSP (`F-005`), remove raw badge `<svg` interpolation branch (`F-012`) | **Completed** (pending final re-verify) |
| **Phase 3 — Accessibility, SEO & UX Fixes** | Shared accessible modal focus trap & focus restoration + non-blocking `confirmActionDialog()` (`DialogHost`), `:focus-visible` outlines, hidden `#shortcuts-modal` visibility isolation, CSS `prefers-reduced-motion` (`F-006`), mobile `>= 44×44px` tap targets (`F-007`), landing `<h1>` + `<h2>` hierarchy, `<link rel="canonical">`, `404.html` `noindex`, `/500.html` recovery page (`F-008`) | **Completed** (pending final re-verify) |
| **Phase 4 — Hygiene, Type Safety & Governance Docs** | Move `three` out of runtime `dependencies`, pin manifest versions, `0` console logs, `.gitignore` `.zip` & `audit/` (`F-009`, `F-010`), eliminate all `any` casts under `oxlint` CI gate (`F-011`), publish `README.md`, `PROJECT_PROFILE.md`, `DECISIONS.md`, `RUNBOOK.md`, `SECURITY.md`, `COMPLIANCE_STATUS.md`, `SECURITY_REVIEW.md`, `.env.example`, `.github/workflows/ci.yml` (`F-002`) | **Completed** (final `SECURITY_REVIEW.md` & `audit/REPORT.md` after re-run) |
| **Phase 5 — Pass 2 Verification, Release & GitHub `main`** | Re-run `npm audit`, `oxlint`, `tsc --noEmit`, `vitest`, `vite build`, Chrome CDP QA/Chaos/XSS/CSP/A11y/Fonts probes, clean `santypes-source-no-games.zip`, live `san-types.web.app` verification, wire GitHub Security/Issues disclosure (`F-001`), push clean V2 upgrade commit to `origin/main`, update `SECURITY_REVIEW.md` & `audit/REPORT.md` | **Completed** |

## Remaining Owner Actions (Non-Code)
- Enable GitHub *Private vulnerability reporting* in repository *Settings → Code security and analysis* (`F-001` private advisory channel).
- Obtain optional legal review (`NEEDS LEGAL` under `MASTER §9.3`) if scaling commercially or attaching a custom domain.
