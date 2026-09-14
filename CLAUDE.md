# AM Network — Project Context for Claude

> Read this file at the start of every session to restore full project context.

## What We Are Building

**AM Network** — the first blockchain-verified Zakat and Sadaqah platform for ~2 billion Muslims.

- **Website:** amnetwork.io (live, GitHub Pages)
- **Founder:** Akbar Amirzoda — economist, diplomat (Plekhanov University Moscow)
- **Stage:** Pre-launch. Beta target Q4 2026
- **Email:** contact@amnetwork.io
- **LinkedIn:** linkedin.com/company/amnetwork-io

## Core Products

1. **AM Zakat.ai** — AI-verified recipients (score 0–100), smart contracts on Base blockchain, local oracle network (mosque imams + AM Network volunteers + partner NGOs), Sharia-certified (ujrah model)
2. **AM Academy** — Sharia-compliant financial literacy, NFT certificates, AI tutor 24/7

## Tech Stack

- **Blockchain:** Base (primary), Solana (backup), LayerZero cross-chain
- **Revenue:** 1–2.5% ujrah on transactions — NO speculative token
- **AI:** Recipient scoring model 0–100
- **Website:** Multi-page (vanilla JS + CSS, no framework), GitHub Pages

## Key Numbers (verified sources)

- **$50B–$600B** — annual Zakat *obligation/potential*, global (World Bank + IRTI/IsDB, "Global Report on Islamic Finance," 2016). The primary source states this as a range, not a single figure — secondary sources vary ($50B–$600B in most citations, occasionally misquoted as $550B–$600B). Cross-checked independently against OIC countries' combined GDP (~$9.2T in 2024) and published Zakat-to-GDP estimation ratios (~1%–7.5% depending on country/method): 1–7.5% of $9.2T ≈ $92B–$690B, consistent with the $50B–$600B range. Actually distributed formally: <$25B
- **~2B** Muslims globally (Pew Research / Carnegie 2024)
- **$6T** Islamic Finance market (LSEG/ICD Report 2025: $5.98T in 2024), +12% CAGR
- **$341B** Islamic Fintech by 2029 (GIFT Report 2025/26, Qatar Financial Centre), +11.5% CAGR

⚠️ When writing about Zakat potential: always cite it as the "$50B–$600B" range (or "up to $600B"), always say "potential/obligation", never "collected" and never a flat "$600B" as if it were a precise point estimate. The collected amount is <$25B. Do NOT cite UNDP (2018) for this figure — that blog post's $200B–$1T range is a different secondary citation; World Bank/IRTI-IsDB 2016 is the source we've verified and standardized on.

## Socials

- Instagram: @amnet_io
- Telegram: @amnetwork_global
- Twitter/X: @amnet_io
- LinkedIn: linkedin.com/company/amnetwork-io

## Sharia Compliance

- **Model:** Ujrah only (service fee) — NO riba, NO speculative token
- **Why no token:** Gharar/maysir risk — scholars divided on speculative tokens
- **Advisory:** Seeking formal Sharia board + fatwa before mainnet

## Recipient Categories (AI Scoring)

1. Widows and single mothers with dependents
2. Orphans under 18 with no guardian income
3. Elderly forced to work for survival
4. Disabled individuals unable to work
5. Families below poverty threshold
6. Students from low-income backgrounds
7. People trapped in riba-based debt
8. Refugees and displaced persons
9. Chronically ill without healthcare access
10. Large families with single breadwinner
11. Those invisible to traditional charitable systems *(list will expand)*

## Local Oracle Network

Verified local representatives who confirm recipient physical presence:
- Mosque imams
- AM Network volunteers
- Representatives of partner charitable organizations

## Outreach — Completed (awaiting responses)

- ✅ Mufti Faraz Adam — amanahadvisors.com form sent
- ✅ IsDB — innovation@isdb.org email sent
- ✅ Flat6Labs — info@flat6labs.com email sent
- ✅ Hub71+ Digital Assets — application submitted (deadline Aug 2, 2026)
- ✅ LinkedIn CTO post published

⚠️ None of the above have confirmed partnership yet. Do NOT show them as partners on the site.

## Seed Funding

- **Target:** $150,000–$500,000 (ideal $300K)
- **Use of funds:**
  - Technical development (CTO equity + smart contracts): $120,000
  - Sharia certification: $30,000
  - Legal registration (UAE ADGM or Malaysia Labuan): $20,000
  - Security audit: $40,000
  - Marketing: $50,000
  - Operations 12 months: $40,000

## What Is BUILT (as of September 2026)

### Live pages on amnetwork.io
- `/` — Main site (10 languages incl. French, dark/light mode, all sections complete). The "Ayah of the Day" widget that used to sit near the top was removed per founder's request (September 2026).
- `/ai_scoring/` — AI Scoring quiz (6 steps, score 0–100, client-side)
- `/zakat/` — Zakat Calculator (assets, nisab, 159 countries)
- `/apply/` — Application form (5 steps, Google Sheets integration, live)
- `/investors/` — Investor pitch page (noindex)
- `/quran/` — The Noble Quran: 114 surahs, live from the Quran.com API (Quran Foundation) — Tanzil Uthmani Arabic text, certified translations, official reciter audio, word-by-word tap-to-translate, per-ayah/whole-surah repeat modes, Khatm (continuous) mode, and a Mushaf view (authentic Madinah-layout page images via the self-hosted quran-qcf4 dataset — real QCF4 Hafs font/glyphs, not our own rendering). We never store, edit or translate this content ourselves; it is always fetched live and shown exactly as published. UI chrome in 10 languages.
- `/hadith/` — Hadith Collection: Sahih al-Bukhari, Sahih Muslim, Jami' at-Tirmidhi by chapter, live from the open fawazahmed0/hadith-api dataset. Arabic + certified translation where available (en/ar/ru/id/tr, fr for Bukhari & Muslim only). Everywhere else (zh/ms/de always, tj always, ru/fr for Tirmidhi specifically), the chapter opens with the English text first, then upgrades in place to an on-demand AI translation from the backend's `/hadith/translate` endpoint (see Backend section) — cached forever server-side so each hadith is only ever paid for once per language, with a clear "AI-translated, unverified" disclosure. Falls back to plain English + the old honest note if that call fails. Chapter/book titles (metadata.sections, English-only in every edition the dataset publishes, Arabic one included) get the same on-demand translation treatment for every non-English language — this covers the chapter grid AND the breadcrumb title shown once a chapter is open, both sharing the backend's cache.
- `/dua/` — Dua & Dhikr: morning/evening dhikr, dhikr after prayer, daily duas, selected duas — Arabic, transliteration, translation, repeat count and virtue (fawaid/benefits — both fields now render; a bug previously dropped "benefits" text entirely), each with its hadith citation, from the open fitrahive/dua-dhikr dataset. en/id are natively translated by the dataset; every other language (ar/ru/tj/tr/zh/ms/fr/de) is covered by our own AI-generated translation (self-hosted under `/dua/data/ai/<lang>/<category>.json`), shown with a clear "AI-translated, unverified, will be replaced once certified" disclosure — no language falls back to English anymore.
- `/tasbeeh/` — Dhikr counter (tap counter with haptic-style tap animation), plus the two most-repeated dhikr with full Arabic text and translated hadith citation, in all 10 languages.
- `/qibla/` — Qibla direction: geolocation + device compass, with manual lat/lng fallback.
- `/prayer-times/` — Prayer times via AlAdhan.com (5 calculation methods, Asr school choice), plus a simple daily 5-prayer tracker checklist (resets automatically each calendar day, independent of the location lookup).
- `/calendar/` — Islamic Calendar: today's Hijri date, upcoming named observances (explicitly excluding Mawlid an-Nabi per founder's instruction), and a two-way Hijri↔Gregorian converter, via AlAdhan.com's confirmed conversion endpoints.
- `/faq/`, `/team/`, `/roadmap/` — extracted from homepage sections into standalone pages, with short teasers + "Read more" links left in place on the homepage at their original anchors.

All of the above (`/quran/`, `/hadith/`, `/dua/`, `/tasbeeh/`, `/qibla/`, `/prayer-times/`, `/calendar/`, `/names/`, `/live/`), plus `/zakat/`, `/apply/`, and `/academy/` (the last three only got this in September 2026 — they previously had just a single "back to main site" link, a real gap the founder caught with "go through the tabs so there are buttons between them"), cross-link to every other page via a shared "other tools" nav dropdown, and are wired into `sw.js`'s offline precache list.

**Push notifications:** real Web Push now exists — a Friday (Jumu'ah) reminder that fires with the site closed. Opt-in toggle on `/prayer-times/`. It needs three env vars on Render before it does anything: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_DISPATCH_TOKEN` (see docs/founder-checklist.md); until those are set, `/push/public-key` returns 503 and the toggle fails gracefully. Render's free tier has no scheduler, so the clock is external: `.github/workflows/push-reminders.yml` calls `/push/dispatch` hourly and the backend decides who is due — by the subscriber's *local* Friday, never sending twice in 12 hours.

⚠️ The notification text deliberately does NOT claim a particular minute is the hour in which du'a is answered — two scholarly opinions exist, and it is not ours to settle in a push. Keep it that way.

**AI assistant placement:** homepage, Academy, `/apply/` and `/zakat/` only. It was removed from the nine utility pages in September 2026 — it cost a `/health` ping per page load and shared the tight AI budget, for pages where nobody asks it anything. Don't re-add it site-wide.

### Integrations working
- **Waitlist / Apply → Google Apps Script:** deployment URLs are NOT kept in this repo. An Apps Script `/exec` URL is an unauthenticated write endpoint — anyone holding it can push rows into the spreadsheet — so treat it as a secret and read it from the Apps Script console when needed. ⚠️ The two URLs that used to be listed here were public in git history: archive those deployments and issue new ones (see docs/security-deployment.md).
- **Email delivery:** web3forms.com (both forms)
- **Analytics:** Google Analytics GA4 (G-G4GSRVJB5M)
- **PWA:** manifest.json + sw.js, installable on mobile
- **SEO:** og-image.jpg (1200×630), sitemap.xml, JSON-LD schema
- **Google Search Console:** verified, pages indexed ✅

### Backend (ai_scoring/, deployed on Render at amnetwork.onrender.com)
- Flask API behind a shared rate-limit budget (security.py — 6/min, 60/hour per client, 3 concurrent, 200/day global; SQLite-backed, fails closed). `/chat` (homepage assistant), `/academy/explain`, `/academy/chrome`, `/academy/apply` all share this budget.
- `/hadith/translate` (added September 2026): on-demand hadith translation for languages the dataset doesn't cover. Deliberately NOT gated by the shared budget on a cache hit — only a genuine cache miss (a hadith+language never translated before) consumes a budget slot, so heavy browsing of already-cached content never competes with a live /chat user. Cache is `translate_cache.py`, a separate persistent SQLite file (`TRANSLATE_CACHE_DB_PATH`, defaults elsewhere in tmp) keyed by (lang, sha256(source text)) — survives worker restarts, unlike the in-memory `_explain_cache`/`_chrome_cache` dicts used by the Academy routes.
- `/score` (rule-based, no AI, unlimited) and `/quran/reciters`, `/quran/audio/*` (no AI) are not part of that budget.
- `/push/subscribe`, `/push/unsubscribe`, `/push/public-key`, `/push/dispatch` — the Friday reminder (`push_store.py`, `push_send.py`). `/push/dispatch` is guarded by `PUSH_DISPATCH_TOKEN` compared in constant time and is the one POST route exempt from the global JSON-body validator, since the cron sends a header and no body.
- **`Dockerfile` copies source files by name.** Add a module without adding it there and the container dies on startup with `ModuleNotFoundError` and the Render deploy fails — this has now happened twice. `python test_dockerfile.py` checks it; run it before pushing backend changes.
- **`TRUSTED_PROXY_HOPS=1` is set in the Dockerfile**, not in code. Behind Render's proxy every visitor otherwise shares one rate-limit bucket, because `remote_addr` is the same edge address for everyone. Must stay 0 anywhere the app is exposed directly.

### Tests (ai_scoring/)
`test_security.py` (rate limits, proxy identity, concurrency), `test_push.py` (who is due for a reminder, local-Friday logic, dispatch auth), `test_dockerfile.py` (image completeness), `test_api.py` (live HTTP). All runnable with plain `python <file>`.

### Code prototypes (not deployed)
- `/contracts/` — Solidity smart contracts (AMZakatPool.sol), audit-ready, NOT on mainnet
- `/ai_scoring/scorer.py` + `ml_model.py` — Python scoring engine, full ML model, NOT exposed as API

### Assets
- All PWA icons (144/152/180/192/512px) — beige background, clean circular edges ✅
- Favicons (16/32px + .ico + apple-touch-icon) — coin logo only ✅
- og-image.jpg ✅

## Next Priority Tasks

- [ ] **Founder photo** — replace SVG placeholder in Team section (photo coming ~2 weeks, after wedding photoshoot)
- [ ] **Email notifications for Apply form** — auto-email applicant with reference number (Apps Script code ready, needs deployment)
- [ ] **Technical Co-Founder / CTO** — Solidity + Web3 + AI/ML, equity-based
- [ ] **Sharia Advisory Board** — formal fatwa process
- [ ] **Legal Registration** — UAE ADGM or Malaysia Labuan (~$1,500–5,000)
- [ ] **Academy course content in the other 7 languages** — chrome UI + full lesson curriculum currently only exist in en/ru/ar; needs extending to tj/id/tr/zh/ms/fr/de alongside the rest of the site
- [ ] **Real background push notifications** — a backend scheduler + Web Push (VAPID), needed for: a Friday "hour of accepted du'a" reminder (two scholarly opinions exist — from the imam mounting the minbar to the end of prayer, or the last hour before Maghrib; cite the hadith source properly, same accuracy bar as the Quran section, don't state it from our own authority) and when Sadaqah is most valuable on Friday — both are date/location-relative, not a fixed clock time; and a Ramadan-specific campaign (similar to what was run informally in a past Ramadan). The Ayah of the Day reminder that used to motivate this is gone (section removed), but the Friday/Ramadan use case still stands on its own.
- [x] **Hadith Collection translation for languages it doesn't cover** — founder chose on-demand backend translation + cache (over bulk pre-translating ~19,000 hadiths). Built and deployed: `/hadith/translate` backend endpoint (see Backend section) + frontend progressive upgrade in `/hadith/`. Each hadith is translated (and billed) once per language, ever, then served from cache to everyone after.
- [x] Dua & Dhikr AI translation for all 8 non-dataset languages (ar/ru/tj/tr/zh/ms/fr/de) — done, live under `/dua/data/ai/`, honestly labeled
- [x] Prayer tracker, Hadith Collection, and Dua & Dhikr collection — built earlier this project; Ayah of the Day was built earlier too and then removed per founder's request (September 2026)

## Website — Section IDs

- `#top` Hero · `#how` How it works · `#products` Products
- `#use-case` Real Impact · `#trust` Trust · `#market` Market
- `#roadmap` Roadmap teaser (full page: `/roadmap/`) · `#partners` Ecosystem
- `#faq` FAQ teaser (full page: `/faq/`) · `#team` Team teaser (full page: `/team/`)
- `#countdown` Countdown · `#waitlist` Waitlist
- `#community` Join Community (social cards)

## GitHub

- **Repo:** akbaramirov01-star/AMNetwork
- **Main branch:** main (live site)
- **Working branch:** main — работаем напрямую, без PR
- **GA ID:** G-G4GSRVJB5M

## Founder Quote

> "Я хочу создать что-то полезное и служащее Умме. Продукт или систему, которая станет причиной того, что Всевышний Аллах вознаградит нас и смилуется над нами. Да поможет нам Всевышний Аллах в этом благом деле. Амин!"

## How to Continue in Claude Code

```
Read CLAUDE.md — I am Akbar, founder of AM Network.
Continue where we left off. Next task: [describe current task]
```

*Last updated: September 2026 (mid-session: Mushaf word-highlight fix, Zakat/Apply/Academy nav dropdowns added, Ayah of the Day removed, Dua & Dhikr AI translations complete for all 8 missing languages, on-demand cached AI translation live for the Hadith Collection)*
