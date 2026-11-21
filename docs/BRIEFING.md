# AM Network — briefing for any new Claude session (media / video / socials)

Read this first. Everything here is current as of **21 November 2026**. Talk to the founder in **Russian**, short answers, conclusion first.
Public copies: `https://raw.githubusercontent.com/akbaramirov01-star/AMNetwork/main/<path>` (repo is public).

## 1. Who and what
- **Founder:** Akbar Amirzoda (Akbar / «Расул»), economist and diplomat, now in Berlin for ~3 years, then back to Tajikistan.
- **AM Network** (amnetwork.io): a **verification and transparency service for Zakat and Sadaqah**. We check each family in person,
  publish an open, tamper-evident report of every payout, and **never hold the money** — the donor gives directly to the family.
- **AM Academy:** Sharia-compliant financial literacy (5 courses, 4 audiences, certificate) **and** the YouTube/TikTok/Instagram
  animated series «Stories of the Prophets» — the media arm of the project and its only real audience traction so far.
- Founder's intention: «Я хочу создать что-то полезное и служащее Умме… Да поможет нам Всевышний Аллах в этом благом деле.»

## 2. The model decision (20 Nov 2026) — must shape every word
Full text: `docs/strategy-2026-11.md`, wording rules: `docs/messaging-2026-11.md`.
- Verification & transparency service; **money never passes through AM Network**.
- **No blockchain, no token, no NFT, no DAO, no smart contracts, no fees taken from Zakat.** (The old 2025–Oct 2026 posts said
  all of that — they are wrong now.)
- Transparency = open report with a **SHA-256 hash chain** (`amnetwork.io/transparency/`, hidden until the pilot).
- Need assessment = a transparent checklist; **a person decides** after an in-person visit. Never "AI-verified recipients".
- **Pilot:** Dushanbe, 10–20 families, **Ramadan 2027 (~Feb–Mar)**, founder's own and relatives' Zakat only, no public fundraising.
- Before the pilot: Tajik lawyer + review by a Hanafi scholar. **Not Sharia-certified** — never claim it.
- No income in year one. Not raising investment. **No partners confirmed** — never name any organisation as a partner.
- Never call AM Network **"the first"**. Zakat potential = "**$50B–$600B a year**" (World Bank + IRTI/IsDB 2016), under $25B formal.

## 3. Where we are going (goals, insha'Allah)
1. Platform 100% ready (done: cabinet for families/verifiers/donors/admin, open report, site rewritten). Next: email (Resend),
   privacy/consent done, trial with 2–3 families, lawyer + scholar.
2. Ramadan 2027 pilot in Dushanbe with a public report; after it — a registered partner charity (first candidate Saliheen).
3. Media: grow the channel to YouTube Partner Program level-1 (500 subs + 3M Shorts views / 90 days) through daily short videos;
   side income: Ramadan workbook (Jan–Feb 2027), commissioned animations for Islamic schools/brands, donations link.
   Honest growth plan: `docs/content/growth-plan.md`. Tajikistan is not in the YPP country list — see that file before relying on it.

## 4. Media plan right now (decision 21 Nov 2026)
- «Stories of the Prophets»: Musa parts 1–5 and **Dawud done** (21 Nov). Next, one episode per prophet: Sulayman →
  Zakariya & Yahya → Isa (peace be upon them). Then the prophets series ends.
- New main format: **«What would you do?»** — 25–40 s, a family dilemma (found a wallet, a friend asks to copy homework, a brother
  is insulted…), freeze-frame with options A/B, "write A or B in the comments", the answer from Quran/Sunnah with the exact source,
  the ending loops back to the start. **2 pilots done 21 Nov** (wallet, homework — `docs/content/publish/what-would-you-do-1-2.md`); judge by retention and comments before making more.
- Retention rules for everything new: a question or conflict in the first second; a new shot or new information every 2–3 s;
  payoff only in the last 3 s; no slow intros.

## 5. Series rules (founder's, all still in force)
- Never show prophets, angels, jinn, Iblis; story scenes have **no people**, no hands/feet; no domes/minarets symbolism issues,
  no crosses or idols (a "shepherd's staff" once rendered as a cross — never ask for sticks/staffs in empty landscapes).
- "peace be upon him" after **every** prophet name (dialogue and narration); use "he" in between.
- English only (YouTube auto-dub). No music. Period ambience in story scenes. Sources on screen (surah:ayah) and in captions.
- Quran/dua in Arabic only from **CC0 recordings (Wikimedia Commons, user Atcovi, "Chapter N, … (Murattal)")** — famous reciters
  trigger Content ID. Arabic text on screen with word-by-word gold highlight + translation (Sahih International via api.quran.com).
- Labels everywhere: "Retelling, not a fatwa · AI-animated". AI disclosure on: YouTube "Altered/synthetic — Yes",
  Instagram "AI info", TikTok "AI-generated content".
- Fixed family cast, same outfits all series: Yusuf (11), Maryam (14), Mom Khadija, Dad Hamza, Grandma Amina, Uncle Idris.
  Vary locations (garden fire pit, seaside, park, market…), establishing shot before dialogue.
- **Lips = voice, every second.** Build only with the model's own lip-synced audio. If a dialogue clip says a word wrong,
  **regenerate it** — never lay our recording over a mouth that said something else (that caused the drift in Musa 2–3).
- Always check "Allah", prophet names and places with Whisper + `initial_prompt` (the model said "Medina" for "Madyan",
  "our love" for "Allah"). Lines ≥ 2.5 s. Order a dialogue clip only after measuring its recorded line (clip ≥ line + 1.5 s).
- Name the cost before generating; the founder approved daily production and wants work done without asking each time.

## 6. Production recipe (Higgsfield)
- Video: `seedance_2_0_mini`, 9:16, 720p, `bitrate_mode: high`, `generate_audio: true`,
  `declined_preset_id: 24bae836-2c4a-48e0-89b6-49fcc0b21612`, ≈1 credit/s. Max ~8 jobs at once (else 429).
- Dialogue clip: medias `image_references` = character sheet, `audio_references` = the recorded line's audio job id; prompt with
  "lip-syncing exactly to the reference audio word for word", "studio portrait key light", "eye-level head-and-shoulders",
  "Only the X in the frame, hands out of frame".
- Voices: `seed_audio`, `format: wav`, `sample_rate: 24000`, `speech_rate` 0 (narration −5), via **generate_audio_batch**
  with role `audio_references` (single-call generate_audio dropped the voice).
- Character sheets (image job ids): Hamza `a02db903-9916-4bb8-847a-ca0b67f04181`, Khadija `23e6d7c4-0dd5-4c88-9c39-8d3a681ba86e`,
  Yusuf `af48e4e5-3c16-4337-9be4-ec5a82fb2880`, Maryam `6e7b3bfa-429b-4f11-85a7-efa51099c8a9`,
  Amina `7f3cd418-983d-4cce-bdc2-697bc839f9aa`, Idris `f1fb870c-4b7f-4165-af9b-dac42099c9a6`.
- Voice references: Hamza `e6571c0b-969b-4183-b47c-8af358bdd990`, Maryam `6fdab1ee-fe8c-4c89-a489-10f8fb0b930b`,
  Yusuf `e204c8d7-1317-42a7-9e90-240cccd2a06c`, Khadija `4dfaabd4-079a-4a30-8929-413f95f2ac98`,
  Amina `6d7eeed4-f3f3-4bea-9f6b-87ca029bf577`, Idris `b521d339-2e75-4748-9a8d-f5250d8894d8`.
- **Build in this Claude Code container, not the Higgsfield sandbox** (sandbox_exec asks the founder every time, even in Auto). Builders:
  `docs/content/tools/wy/` (shorts), `docs/content/tools/dawud/` (episodes). Environment network already allows Higgsfield CDN/upload,
  Hugging Face, api.quran.com, jsDelivr. Wikimedia blocks this container (401/429) — CC0 recitation needs another route.
- Old Higgsfield sandbox: `~/m5` (and `~/m4`) hold `build.py` (assembles segments, hook/plate overlays, end card, crossfades, −16 LUFS;
  **refuses recorded-audio overlay on talking faces** unless `ALLOW_REC=1`), `prep.py`, `tr.py`, `dchk.py`, `qa.py`, `dua.py`
  (Arabic ayah with gold word highlight). Files live 24 h after last use — if gone, the scripts' logic is described in
  `docs/content/stories-of-the-prophets.md`; rebuild them.
- Upload: `media_upload` → `curl PUT` with `If-None-Match: *` in the same sandbox command → `media_confirm`.
- Credits: MAX plan, 1363 left on 21 Nov evening; reset ~30 Nov. A prophet episode ≈ 150 cr; a short ≈ 40–60 cr.

## 7. Publishing (rules checked Nov 2026)
- Instagram: **max 5 hashtags** (since Dec 2025). TikTok: 3–5 hashtags, caption 100–300 characters, AI label on.
  YouTube: first 3 hashtags show above the title; title ≤ 100 chars; tags ≤ 500 chars; publish as Private first, check "Checks".
- Templates: `docs/content/publish/musa-part4.md`, `musa-part5.md`. Always give the founder full texts for YouTube
  (title, description, tags, settings, pinned comment), Instagram and TikTok. Teaser 08:00, full 20:00 Berlin.
- Socials: Instagram **@amnetwork.io**, Telegram @amnetwork_global, X @amnet_io, YouTube @amnetwork_io, TikTok @amnetwork.io,
  LinkedIn company/amnetwork-io. Telegram and X: project news only.
- Old posts to delete/fix (founder does it): Telegram posts 20.06.2025, 04.07.2025, 11.05.2026, 23.07.2026; X post 23 July.

## 8. Files to read for depth
- `CLAUDE.md` (whole project), `docs/strategy-2026-11.md`, `docs/messaging-2026-11.md`
- `docs/content/stories-of-the-prophets.md` (every episode, costs, lessons), `docs/content/AM_Academy_handoff_19oct-17nov.pdf`
- `docs/content/growth-plan.md`, `docs/content/publish/*.md`

## 9. Privacy and safety
- Never put the founder's personal email or other private details into external requests or public files.
- Never commit secrets. The Supabase publishable key is public by design; the secret key never leaves the founder.
