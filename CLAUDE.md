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

- **$600B** — annual Zakat *obligation/potential* (World Bank + IRTI/IsDB, 2016). Actually distributed formally: <$25B
- **~2B** Muslims globally (Pew Research / Carnegie 2024)
- **$6T** Islamic Finance market (LSEG/ICD Report 2025: $5.98T in 2024), +12% CAGR
- **$341B** Islamic Fintech by 2029 (GIFT Report 2025/26, Qatar Financial Centre), +11.5% CAGR

⚠️ When writing about $600B: always say "potential/obligation", never "collected". The collected amount is <$25B.

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

## What Is BUILT (as of June 2026)

### Live pages on amnetwork.io
- `/` — Main site (8 languages, dark/light mode, all sections complete)
- `/ai_scoring/` — AI Scoring quiz (6 steps, score 0–100, client-side)
- `/zakat/` — Zakat Calculator (assets, nisab, 159 countries)
- `/apply/` — Application form (5 steps, Google Sheets integration, live)
- `/investors/` — Investor pitch page (noindex)

### Integrations working
- **Waitlist → Google Sheets:** `AKfycbwuptTPU4ObtwesM86tvR2wObS5sXiIkKMvpZFZr_ReV_wD8nXIkTFdnT_C_2snrHFv/exec`
- **Apply form → Google Sheets:** `AKfycby5Fcwtu6h1nFHGr9cXG9WmYj_Cx2TDvU8P3BR7UVLGYJKZ02znbI7h8eE-lqOfYghnLw/exec`
- **Email delivery:** web3forms.com (both forms)
- **Analytics:** Google Analytics GA4 (G-G4GSRVJB5M)
- **PWA:** manifest.json + sw.js, installable on mobile
- **SEO:** og-image.jpg (1200×630), sitemap.xml, JSON-LD schema
- **Google Search Console:** verified, pages indexed ✅

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

## Website — Section IDs

- `#top` Hero · `#how` How it works · `#products` Products
- `#use-case` Real Impact · `#trust` Trust · `#market` Market
- `#roadmap` Roadmap · `#partners` Ecosystem · `#faq` FAQ
- `#team` Team · `#countdown` Countdown · `#waitlist` Waitlist
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

*Last updated: June 2026*
