# What only you can do

Everything in this list is blocked on an account, a payment, a key or a
decision that is yours — not on code. Ordered by what hurts most if it is
left undone.

---

## 1. Archive the old Apps Script deployments — today

**Why it matters:** those two `/exec` URLs were in this repo, in git history,
in plain text. An Apps Script `/exec` URL is an unauthenticated write
endpoint: anyone who has ever seen the repo can POST rows straight into the
applicant spreadsheet, with no captcha and no checks. They can also inject a
`=IMPORTXML(...)` formula that quietly exfiltrates the sheet's contents the
next time you open it.

**Do:** open each Apps Script project → **Deploy → Manage deployments** →
**Archive** the old deployment → create a new one (the hardened code is
already in `apps_script_apply.gs`). Keep the new URLs out of the repo.

---

## 2. Decide where applications actually live — this month

**Why it matters:** right now an application from a vulnerable family exists
in exactly one place — an email. One spam filter, one bounce, one Web3Forms
outage and it is gone, and the reference number we showed that person points
at nothing. Separately, that email contains income, household composition
and situation category: sensitive personal data sitting in a mailbox.

**Decide:** where this data lives (a proper database or a locked-down sheet),
in which country, and who has access. Once you have decided, the code side
is a small job.

Until then the form is at least honest: it now says where data goes, asks
for explicit consent, names the 24-month retention, and tells people how to
have it deleted.

---

## 3. Attach a Render persistent disk

**Why it matters:** two things live on disk and are wiped on every deploy or
idle spin-down — the hadith translation cache and push subscriptions. Losing
the cache means paying Anthropic again for hadiths already translated.
Losing subscriptions means people who turned on the Friday reminder silently
stop getting it.

**Do:** Render dashboard → the service → **Disks** → add one (1 GB is plenty)
mounted at `/data`, then set:

```
TRANSLATE_CACHE_DB_PATH=/data/translations.sqlite3
SECURITY_DB_PATH=/data/limits.sqlite3
PUSH_DB_PATH=/data/push.sqlite3
```

Also set a **hard spend cap** in the Anthropic console. The translation route
is the expensive one and nothing else caps total spend.

---

## 4. Turn on the Friday reminder

The code is deployed and idle until these exist.

```bash
pip install pywebpush
python -c "from py_vapid import Vapid01; v=Vapid01(); v.generate_keys(); \
import base64; \
print('PUBLIC :', base64.urlsafe_b64encode(v.public_key.public_bytes_raw()).decode().rstrip('=')); \
print('PRIVATE:', base64.urlsafe_b64encode(v.private_key.private_bytes_raw()).decode().rstrip('='))"
```

Then on Render set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT=mailto:contact@amnetwork.io`, and `PUSH_DISPATCH_TOKEN` (any
long random string).

In GitHub → **Settings → Secrets and variables → Actions**, add
`PUSH_DISPATCH_TOKEN` (same value) and `BACKEND_URL=https://amnetwork.onrender.com`.

Optional: `JUMUA_LOCAL_HOUR` (default 10) — the hour, in each subscriber's own
local time, when the Friday reminder is sent.

---

## 5. Verify the two things I could not check from here

- **Web3Forms:** confirm "mandatory hCaptcha" is ON for both forms. The
  captcha and honeypot on the page are browser-side only — a direct `curl`
  to the API with the public access key bypasses both, and your inbox is
  currently the only copy of every application.
- **YouTube API key:** confirm the HTTP-referrer restriction is actually
  saved in Google Cloud Console. Also note `/live/` spends 100 quota units
  per visitor page-load against a 10,000/day default — roughly 100 visitors
  before it stops resolving the stream.

---

## 6. Monitoring — before any launch

The backend was down for hours and we only found out because Render emailed
you. Put a free uptime monitor (UptimeRobot, Better Stack) on
`https://amnetwork.onrender.com/health` and on `https://amnetwork.io`, with
alerts to your phone.

---

## 7. Legal and Sharia, before a single real dinar

Not a website task, but the one that decides whether this can exist:

- **Legal entity and licence.** Accepting and forwarding other people's Zakat
  is regulated money transmission in most jurisdictions. ADGM or Labuan, as
  planned — but this is not a "when we get round to it" item, it gates
  taking money at all.
- **Sharia review and fatwa.** The site claims Sharia compliance with no named
  advisor. Until someone signs it, say "under review" rather than "certified".
- **Security audit of the contracts** before mainnet.

---

## 8. Store publishing

See `docs/store-release.md` — the manifest, icons, screenshots, offline page,
asset-links file and listing copy in all 10 languages are ready. You need the
$25 Play account, the Bubblewrap build, and to keep the signing key safe.
Read the App Store section before paying Apple's $99: a bare web wrapper will
probably be rejected.

---

## 9. Still open, technical, not blocked on you

Written down so it is not forgotten:

- **Academy lesson content** exists as pre-rendered bundles only for en/ru/ar.
  The other 7 languages fall back to translating live through the backend on
  every view — it works, but it is slow on a cold start and costs per view.
  Running `ai_scoring/pregenerate.py` with an API key would fix that.
- **A working demo of the actual product.** Still the biggest gap between what
  the site promises and what it shows: pick a recipient, see the score
  breakdown, send a test Zakat on Base testnet, see the transaction. One
  clickable end-to-end flow is worth more to an investor than any page here.
- **The Zakat calculator is a dead end.** Someone works out they owe $400 and
  then leaves. The next screen should invite them to reserve that Zakat
  through AM Network.
