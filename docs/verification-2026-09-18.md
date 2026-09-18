# Submission safety and SEO verification — 18 September 2026

Scope: bounded local tests, local browser interaction, production configuration inspection. No destructive scans, live load attack, or synthetic production submissions.

| Check | Result | Evidence |
|---|---|---|
| Gmail delivery | BLOCKED | Production MAIL_SEND_ENABLED=false; no RESEND_API_KEY or MAIL_FROM; live submissions table empty. No email was sent or inbox receipt confirmed. |
| First three questions / fourth denied | PASS | Local route tests and four local browser submissions; fourth returns 429 and retains typed question. |
| Rolling 24 hours | PASS | Controlled clock: midnight still blocked; 24h minus 1ms blocked; at 24h accepted. No actual 24-hour wait. |
| Concurrent submissions | PASS | 12 concurrent route calls against local SQLite: 3 inserted, 9 rejected. |
| Email/network quota | PASS | Case-normalized email remains limited after IP change; same IP remains limited after email change. Shared networks share quota. |
| Required fields and invalid input | PASS | Missing name/email, invalid email/role/ID, short questions, malformed JSON, oversized body rejected. |
| Basic spam controls | PASS | Honeypot, missing/cross-site Origin and cross-site fetch metadata rejected; missing trusted network header fails closed. These checks cannot identify all bots. |
| SQL input and safe display | PASS | Injection-shaped input remains a bound text value; question/reply display uses textContent. |
| Retry/privacy | PASS | Repeated receipt ID does not insert or notify twice; successful GET excludes contacts and sends noindex/no-store. |
| Turnstile | PREPARED, NOT ACTIVE | Server verification checks hostname/action and fails closed when configured; mocked-provider tests pass. Production keys absent. |
| DDoS/distributed bots | NOT TESTED | No edge WAF configuration or volumetric test. Rotating both email and network can bypass this unauthenticated quota. Verified accounts would strengthen per-person limits. |
| Search/filter regression | PASS | Five roles, multiple topics, title-only prefix search, ESC 11 across roles/3 PM, reset and URL state. |
| SEO implementation | PASS | Five role guides, full HTML questions, unique title/description/H1, canonical links, public navigation, six-URL sitemap and robots file; PM guide opened in local browser. |
| Ranking/indexing | NOT VERIFIED | Google indexing, Search Console ownership and ranking are not configured or guaranteed. |
| Build | PASS | Sites production build succeeds. |
| Physical mobile / broad penetration test | NOT TESTED | This is a bounded sanity/security check, not a complete security audit. |

## Setup remaining
- Email: connect an authorized sending service and run an end-to-end delivery test. Current implementation is a disabled Resend helper; the user's Make/Gmail scenario is not connected to this application.
- Human verification: configure a Cloudflare Turnstile widget for the public hostname and store TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY in Sites runtime settings, then deploy and test a real token. Never use test keys in production.
- Search monitoring: verify the site in Google Search Console and submit /sitemap.xml. Keep public crawlers allowed; no ranking promises.

Run `node tests/security.cjs` and `python tests/seo.py` after relevant changes. Mocked provider results are not evidence of real email delivery or human-verification service availability.
