# September 2026 security changes

## Deployment boundary

GitHub Pages publishes the static pages from `main`. Render and the two Google
Apps Script deployments are separate services. A successful Git push is not
evidence that either backend has updated.

The frontend now sends forms only to Web3Forms. The former unverified,
fire-and-forget Sheets POST has been removed. Email intake remains available;
automatic Sheets copies are paused until the protected scripts are deployed.
**The old public Apps Script URLs remain vulnerable until their deployments are
updated or disabled. Removing a URL from HTML does not secure that endpoint.**

## Google Sheets activation

1. Sign into Web3Forms and enable **mandatory hCaptcha** on both existing forms.
   The website uses Web3Forms' shared public site key. Its verification secret
   belongs to Web3Forms; do not put a secret in HTML or try to verify the same
   single-use token twice.
2. In each existing Apps Script project, replace the source with
   `apps_script_apply.gs`. Set Script Properties `FORM_KIND` to `apply` or
   `waitlist`, `WEB3FORMS_CAPTCHA_REQUIRED` to `true` after step 1, and `SHEET_ID`
   only if the script is not bound to the intended spreadsheet. Retain existing
   access settings. Review the waitlist column layout below before cutover.
3. Authorize the existing script's Sheets and external-request scopes, then use
   **Deploy → Manage deployments → Edit → New version → Deploy** for each old
   public URL. Updating the current deployment closes its unverified POST path.
   Inventory any additional old active deployments and update or disable them.
4. Verify each GET returns `version: "3.0"`, its correct `kind`, `ready: true`.
   A missing CAPTCHA POST must return `success: false` without writes/emails.
5. Switch each form to one awaited, URL-encoded POST to its verified Apps Script
   URL (`credentials: omit`), replacing Web3Forms submission. Use the contract
   below, parse the JSON response, require `success === true`, and display the
   returned `ref`. Retain a random `AM-` + UUID reference across retries of the
   same payload. Do not fall back to another delivery endpoint after a timeout:
   the first delivery may have succeeded. Reset the CAPTCHA after a rejection.
   Browser CORS and an explicitly authorized real form submission must be
   verified before calling the Sheets integration live.

Contract: strings `kind`, `consent: "true"`, `ref`, `h-captcha-response`, `name`,
`email`, `lang`. Waitlist also `role`, `country`. Application also `country`,
`city`, `members`, `children`, `income`, `expenses`, `categories`, `duration`,
`description`, `needs`, `mosque`. Monetary/count fields use unformatted numbers
(no currency symbols). A honeypot `website`/`botcheck` must be empty.

Application columns preserve the previous order: timestamp, reference, name,
email, country, city, members, children, income, expenses, categories, duration,
description, needs, mosque, language, unused legacy score column. Waitlist
columns: timestamp, reference, name, email, role, country, language. Back up and
map the current waitlist sheet before enabling this layout.

Protection: 24 KB body; bounded/validated fields; mandatory provider CAPTCHA;
30 verification attempts/minute and 300/day across all clients; three verified
submissions/email/day; a script lock; 24-hour reference/content deduplication;
literal spreadsheet cells; verified delivery retained for retry after a write
failure. A permanent column-B reference lookup prevents duplicate rows after a
crash. No success on a failed write. Web3Forms sends the team notification;
this handler does not send a separate applicant acknowledgement.

Exactly-once delivery across Google and Web3Forms cannot be guaranteed during a
network failure after the provider accepts a message but before its response
arrives. The code avoids automatic retries of that external send. It cannot
eliminate Apps Script invocation quota exhaustion at the public edge.

## AI service

`/health` version `2.2` with `ai_request_limits: true` identifies the new server.
Every POST to `/chat` and `/academy/{explain,chrome,apply}` shares these defaults:

| Variable | Default | Meaning |
| --- | ---: | --- |
| `AI_ENABLED` | `true` | Set `false` for emergency shutdown of paid routes |
| `AI_DAILY_LIMIT` | 200 | Total requests per UTC day across paid routes |
| `AI_GLOBAL_PER_MINUTE` | 30 | Total requests per fixed minute |
| `AI_CLIENT_PER_MINUTE` | 6 | Requests per client per fixed minute |
| `AI_CLIENT_PER_HOUR` | 60 | Requests per client per fixed hour |
| `AI_MAX_CONCURRENT` | 3 | In-flight paid-route requests |
| `SECURITY_DB_PATH` | temporary directory | SQLite ledger path |
| `TRUSTED_PROXY_CIDRS` | empty | Only audited proxy networks may supply client IPs |

Limits count attempts, including cache hits and provider failures. This is a
conservative **request budget, not a dollar spending cap**. SDK retries are
disabled and the timeout is 25 seconds. Existing input/output token bounds and
web-search tool maximum are retained. SQLite transactions share limits across
processes on the same filesystem; database errors fail closed. Responses carry
`Retry-After` on 429 and `Cache-Control: no-store`.

Render deployment: use the updated Dockerfile (Gunicorn, one worker, eight
threads). Confirm auto-deploy from `main` and version `2.2` after the build. Do
not scale to multiple instances without a shared distributed limiter. A new
container or an ephemeral filesystem replacement resets its SQLite budget;
for durable limits configure a persistent disk and `SECURITY_DB_PATH`, or a
shared store. An ordinary process restart on the same filesystem preserves it.

Until the actual proxy chain is verified, limits conservatively use the socket
IP, which can group visitors behind a Render proxy. Do not trust arbitrary
leftmost `X-Forwarded-For` headers. Verify the trusted CIDRs in the hosting
configuration before setting `TRUSTED_PROXY_CIDRS`. Separately verify the
Anthropic project's spending cap and alerts in the owner's account. No
hosting, disk, scaling, WAF or account spending settings have been verified by
the source changes alone.

## Browser privacy and price provenance

The public scoring quiz calls only the local JS scoring engine. Its profile
serializer and automatic `/score` fetch have been removed. Explicit chat and
Academy questions still use Render/Anthropic; the privacy page explains this.

The calculator loads XAU/XAG USD quotes from Gold API, converts troy ounces to
grams using 31.1034768, and displays each source timestamp. Missing/invalid or
over-96-hour quotes do not become fallback constants. Manual edits are marked
and not overwritten by late requests. Amounts and quiz answers are not included
in public data requests. External API responses are not service-worker cached.

## Local validation

```text
node --test tests/forms.test.cjs tests/intake.test.cjs tests/metal-prices.test.cjs
cd ai_scoring
python -m unittest test_security.py
python test_api.py
```

Security tests mock provider calls and do not send emails or make paid AI calls.
Official references: [hCaptcha token verification](https://docs.hcaptcha.com/),
[Web3Forms mandatory CAPTCHA](https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha),
[Sheets appendRow](https://developers.google.com/apps-script/reference/spreadsheet/sheet#appendrowrowcontents),
[Gold API](https://gold-api.com/docs),
[Render application limits](https://render.com/articles/how-render-handles-ddos-attacks).
