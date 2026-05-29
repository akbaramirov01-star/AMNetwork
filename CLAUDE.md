# AM Network — Project Context for Claude

## What This Project Is
AM Network is a **blockchain-verified Islamic finance platform** — the first AI-powered, transparent Zakat and Sadaqah distribution system for 1.8 billion Muslims globally.

**Live site:** https://amnetwork.io  
**Repo:** akbaramirov01-star/amnetwork  
**Branch for changes:** `claude/website-review-feedback-Od5gA`

## Founder
**Akbar Amirzoda** — Founder & CEO  
LinkedIn: https://www.linkedin.com/in/akbar-amirzoda-65845840b  
Email: contact@amnetwork.io

## Core Product: AM Zakat.ai
- Donors send Zakat/Sadaqah → locked in smart contract (Base blockchain / Solana)
- Recipients submit encrypted docs → AI scores need (0–100)
- Local verifier (imam / social worker) confirms eligibility
- Smart contract auto-transfers directly to recipient wallet
- Donor receives permanent on-chain proof

## Second Product: AM Academy
- Sharia-compliant financial education
- 5 free courses + NFT certificates on-chain
- AI tutor 24/7 + halal investment screening

## Tech Stack (Website)
- **Single HTML file** — `index.html` (no build process, no framework)
- Vanilla JS + custom CSS variables
- 8 languages: EN, AR, RU, TJ, ID, TR, ZH, MS (i18n via `T` object in JS)
- Dark/Light theme (CSS variables, localStorage)
- Google Analytics: `G-G4GSRVJB5M`
- Google Forms waitlist embed
- GitHub Pages deployment (CNAME: amnetwork.io)

## Business Model
- **Ujrah model** — fee-based service (Sharia-compliant)
- **No speculative token**
- Seed round target: **$300K**

## Roadmap
- Q2 2026: Foundation (waitlist, legal, MVP design)
- Q3 2026: Build (smart contracts, AI, Academy v1)
- Q4 2026: Beta Launch (mainnet, 1,000 users, mosque partnerships)
- 2027+: Scale (AM Pay, government contracts, 50K users, Series A)

## Key Files
- `index.html` — entire website (325KB, all CSS/JS inline)
- `AM_Network_Whitepaper_v1_EN.pdf` — full whitepaper
- `sitemap.xml` — SEO sitemap
- `robots.txt` — crawler config
- `CNAME` — GitHub Pages custom domain

## Section IDs (for navigation)
- `#top` — Hero
- `#how` — How it works
- `#products` — Products
- `#use-case` — Real Impact story
- `#trust` — Trust indicators
- `#market` — Market Opportunity / Stats
- `#roadmap` — Roadmap
- `#partners` — For Partners
- `#faq` — FAQ
- `#team` — Team
- `#countdown` — Launch countdown
- `#waitlist` — Join waitlist form

## Contact
- General: contact@amnetwork.io
- Partners: partners@amnetwork.io
- Team/hiring: team@amnetwork.io

## Design System
- Primary brand: Gold `#C9A84C` / `#E8C87A`
- Dark bg: `#0A1A11` (emerald dark)
- Light bg: `#F5F0E8` (cream)
- Fonts: Cormorant Garamond (headings) + DM Sans (body)
- RTL support for Arabic
