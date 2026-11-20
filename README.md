# AM Network

**AM Network is a verification and transparency service for Zakat and Sadaqah: we check each family in person,
publish an open, tamper-evident report of every payout, and never hold the money — the donor gives directly to the family.**

Website: [amnetwork.io](https://amnetwork.io) · contact@amnetwork.io

## How it works

1. A family applies (or a verifier brings a family it knows).
2. A trained AM Network volunteer visits the family in person and fills a checklist. Whoever brought the family never verifies it.
3. The admin approves help only after the in-person check.
4. The donor gives the Zakat or Sadaqah to the family directly — cash, Alif, Korti Milli or bank transfer.
5. The payout is recorded in the open report (`/transparency/`): amount, date, city/district, situation category,
   number of checks — no names, phones or addresses. Each entry carries a SHA-256 fingerprint linked to the previous one,
   so any quiet change breaks the chain; anyone can check it in the browser.

Money never passes through AM Network. No fees are taken from Zakat, and there is no token.

## Status (November 2026)

- **Ready:** free Islamic tools (Quran, hadith, dua, prayer times, Qibla, calendar, 99 Names, tasbeeh, Zakat calculator),
  AM Academy, the cabinet for families, verifiers, donors and the admin (`/cabinet/`), and the open report (`/transparency/`).
- **Next (Dec 2026 – Jan 2027):** consultation with a lawyer in Tajikistan, review by a Hanafi scholar, training the first
  volunteer verifiers, a trial run with 2–3 families.
- **Pilot (Ramadan 2027, ~Feb–Mar):** 10–20 families in Dushanbe, the founder's own and relatives' Zakat only, public report.

No partners are confirmed. AM Network is not Sharia-certified; we are seeking review by a Hanafi scholar before the pilot.

## Repository

- Static multi-page site (vanilla JS + CSS), hosted on GitHub Pages; works offline as a PWA, 10 languages.
- `cabinet/`, `transparency/`, `supabase/schema.sql` — pilot platform on Supabase (row-level security, EU region).
- `ai_scoring/` — Flask backend on Render (assistant, Academy, push reminders) and its tests.
- `docs/whitepaper/` — whitepaper source; `AM_Network_Whitepaper_v1_EN.pdf` is built from it.
- `contracts/` — archived prototype from an earlier model; not used, not deployed.

Wording for any public text: `docs/messaging-2026-11.md`. Decision record: `docs/strategy-2026-11.md`.
