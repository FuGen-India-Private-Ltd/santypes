# Security Policy (`SECURITY.md`)

## Supported Versions

| Version | Supported for Security Fixes |
| --- | --- |
| `2.0.x` (`main`) | Yes (Active) |
| `< 2.0.0` (legacy unbundled JS) | No |

---

## Security Architecture Summary
Santypes operates as a client-only static web application with:
- Strict Content Security Policy (`script-src-attr 'none'`, `style-src-elem 'self'`, `font-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`).
- Output escaping (`escapeHTML()`), prototype-pollution guards (`Object.create(null)`, `Object.hasOwn()`, `isSafeRecordKey()`), bounded numeric sanitization (`finiteNumber()`), and zero `eval` / `Function` sinks.
- Consent-gated analytics only (`G-3K423FWC7P` disabled by default + automatic `Global Privacy Control` honor) and zero external typography CDN calls.

---

## Reporting a Vulnerability
Please submit vulnerability reports safely through our repository security channel or review our RFC 9116 policy:
- **Security Advisories:** `https://github.com/suhas-hoskere/santypes/security`
- **Public Support / Bug Tracking:** `https://github.com/suhas-hoskere/santypes/issues`
- **RFC 9116 Disclosure File:** `https://san-types.web.app/.well-known/security.txt`

> Enable **Private vulnerability reporting** under repository *Settings → Code security and analysis* on GitHub so external researchers can open confidential draft advisories directly.

When submitting a vulnerability report, please include:
1. Affected file, component, or URL path.
2. Minimal reproduction steps or proof-of-concept payload (do not target third-party visitors).
3. Impact assessment and suggested remediation if known.

Please do not publicly disclose unpatched vulnerabilities until a fix has been released and verified.
