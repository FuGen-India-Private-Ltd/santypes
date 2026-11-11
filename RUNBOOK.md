# Operations, Deployment & Incident Response Runbook (`RUNBOOK.md`)

**Service:** Santypes Static Web SPA (`https://san-types.web.app/`)  
**Hosting:** Firebase Hosting (Static CDN, HTTPS + HSTS enforced via `firebase.json`)  
**Database / Backend:** None (100% browser `localStorage`; zero server DB/credentials)

---

## 1. Release Verification Gate (Run Before Every Deploy)
```bash
npm ci
npm audit --audit-level=moderate
npm run lint
npm run typecheck
npm test
npm run build
```
All six commands must exit `0`. Verify `npm run preview` locally on `http://localhost:4173/` before deploying.

---

## 2. Standard Deploy & Rollback (Firebase Hosting)

### Deploy (Explicit Human Approval Required per `AG-02`/`AG-04`)
```bash
npx firebase-tools hosting:channel:deploy preview-check   # Test on temporary preview channel first
npx firebase-tools deploy --only hosting               # Production deploy after channel verification
```

### Emergency Rollback (< 2 Minutes)
1. **Firebase Console:** Open *Hosting → Release History* for `san-types`, click the previous known-good release menu (`⋮`), and select **Rollback**.
2. **CLI Alternative:** Check out the last tagged good commit (`git checkout <good-tag>`), rebuild cleanly (`npm ci && npm run build`), and redeploy `--only hosting`.
3. Confirm `/` returns HTTP `200`, `404.html` renders cleanly, and security headers match `firebase.json`.

### Emergency Take-Offline / Maintenance State
To take the site offline immediately during an active compromise or severe defect, disable the active Hosting site in Firebase Console (*Hosting → Site Settings*) or deploy a minimal maintenance `index.html` / `500.html` until patched.

---

## 3. Secrets & Configuration Rotation
- Santypes ships **zero server secrets, API keys, or service-role tokens** in runtime source or bundles.
- `GA_MEASUREMENT_ID` (`G-3K423FWC7P`) is a public client measurement identifier gated strictly behind opt-in user consent. If abused or deprecated, rotate/replace the Property ID in `src/utils/privacy.ts` and redeploy.
- Ensure `.env*` never enters git commits and Firebase CLI tokens (`FIREBASE_TOKEN`) in CI (if added later) are stored strictly in encrypted repository Secrets with least-privilege Hosting-only IAM scope.

---

## 4. Incident & Breach Response (India CERT-In 6h / DPDP Board 72h / GDPR 72h)

### Immediate Triage Roles (Public Intake Linked)
- **Incident Commander & Repo Owner:** `suhas-hoskere` (`https://github.com/suhas-hoskere/santypes/security`)
- **Support / Grievance Intake Channel:** `https://github.com/suhas-hoskere/santypes/issues` (optional custom-domain mailbox if custom DNS domain attached later)

### Step-by-Step Containment Checklist
1. **Contain (0–30 min):** Identify scope (malicious commit, Firebase token compromise, compromised npm package, or XSS regression). Revoke compromised CI/Firebase tokens immediately via Google Cloud IAM / GitHub Settings. Roll back Firebase Hosting to last verified release.
2. **Preserve Evidence (30–60 min):** Save Firebase deploy logs, CI run artifacts, `git log` commit hashes, affected `package-lock.json`, and browser reproduction captures with UTC + IST (`NTP`-synced) timestamps.
3. **CERT-In Mandatory Reporting (`<= 6 Hours` of Noticing — `IN-14`):**
   - For applicable cybersecurity incidents (unauthorized access, website defacement, malicious code injection, data breach), submit initial report to CERT-In (`incident@cert-in.org.in` / official portal) within **6 hours** detailing:
     - Affected service URL (`san-types.web.app`), UTC/IST discovery timestamp, incident category, indicators of compromise (hashes/IPs/commits), and immediate mitigation steps taken.
4. **DPDP Board & Affected User Notification (`IN-06`, `GDPR Art. 33/34`):**
   - Note: Santypes does not collect server-side accounts or personal profiles; however, if an injected client script ever exposed locally typed inputs or telemetry:
     - **Users:** Notify via a prominent banner on `/` without delay explaining what happened, likely impact, and protective actions (clear site storage, revoke consent).
     - **Regulators (DPBI / EU Supervisory Authority):** Initial notice without delay + detailed report within **72 hours** covering nature of breach, estimated user count, categories of data affected, DPO/grievance contact, and remediation measures.

---

## 5. Backups & Restore Verification
- Source code, static compliance pages, and build config are backed up in Git version control + reproducible `santypes-source-no-games.zip` clean source archives.
- End-user practice history lives on the user's own device in `localStorage` and can be backed up/restored locally via the **Export All Local Data (JSON)** control in *Privacy & IT Notice*.
