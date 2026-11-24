# Heart Stories — emotional family shorts (format, founder 24 Nov 2026)

Reference: a Quranly-app short (85 s, English, ~24 cuts ≈ one new shot every 3.5 s): daughter shouts at her poor father → he asks
Allah for help, works all night → she finds out, cries "I'm sorry, daddy" → reconciliation. Big one-word captions, faces in close-up,
tears, no lecture until the very end. Their reach comes partly from a collaboration with Mufti Menk (founder) — we compete on story.

## Formula (60–85 s)
1. **0–3 s:** a sharp line of conflict in a close-up ("Five more minutes!", "Why did you even have me…"). Hook text on screen.
2. **Escalation (3–25 s):** 3–4 short exchanges, a new shot every 3–4 s; the wrong choice is shown, not explained.
3. **Silent turn (25–45 s):** no words — the cost of the choice (someone waiting, a covered plate, an empty chair). Ambience only.
4. **Realisation + tears (45–65 s):** the character understands; a short apology.
5. **Mercy (65–75 s):** the other side forgives in one warm sentence.
6. **Source (last 8 s):** the ayah/hadith on a phone showing the real AM Network page, highlighted in sync with the voice; end card
   with one line ("They won't always be calling.") and the page address.

## Rules (Sharia + channel)
- Fixed cast only; modest dress; no music (ambience only); no mocking, no violence on screens, no brand names (no "GTA 6" — a generic
  "game" with screen glow only), no romance, no bedroom scenes, nobody dies on screen.
- The lesson comes from Quran/authentic hadith with the exact source, checked before recording. "Not a fatwa · AI-animated".
- Captions: one big word at a time for this series.

## Story list (sources to verify before each shoot)
| # | Title | Conflict → turn | Source |
|---|---|---|---|
| 1 | **Five More Minutes** (done 24 Nov, 0:58, 84.3 cr, `publish/heart-1.md`) | Yusuf games, ignores Grandma's calls; finds the covered plate and her note | Quran 17:23–24 (verified); Sahih Muslim book 45 hadith 10 (verified) |
| 2 | Mom's Phone Call | Maryam rolls her eyes and hangs up on Mom; later sees what Mom was calling about | Quran 31:14 (verified) |
| 3 | The Friend Who Left | Yusuf mocks a poorer classmate's old shoes; next day he learns why | hadith on not belittling a Muslim brother [verify] |
| 4 | Dad's Hands | Teen embarrassed by Dad's work clothes at school | Bukhari 2072 (eating from your own work, verified) |
| 5 | Last in Line | Maryam pushes ahead at the bakery, an old man stays behind | mercy to elders hadith [verify] |
| 6 | The Phone at the Table | Whole family on phones; Grandma talks to nobody | Quran 17:23 + hadith on keeping ties [verify] |
| 7 | Uncle Idris and the Lie | A small lie to get out of helping Idris snowballs | Quran 9:119 (verified) |
| 8 | The Sadaqah Jar | Yusuf takes coins from the family Sadaqah jar for a game | Quran 2:261 [verify] + AM Network /zakat page plug |

Next after #1: #2 and #6 (strongest for teens), each ~80–100 cr.

## Lessons from #1 (founder feedback, 24 Nov)
- **A clear turning point is mandatory:** the hero must *hear or see something* that makes him change (v2: Grandma's whispered dua
  "O Allah, protect my Yusuf, make him a comfort to my eyes…" heard through the door → he takes off the headphones → "She's praying
  for me… and I was rude to her." → he goes to her). Without it the story has no meaning.
- **One voice per character:** seedance changes the timbre clip to clip (Yusuf measured 127–314 Hz median F0 across clips).
  Fix: a cloned voice element per character (`create_voice_from_confirmed_audio` from his recorded lines; Yusuf =
  `b2d57a9e-d801-4b58-9e7c-5ede83d8533f`) and `voice_change` on every dialogue clip — keeps timing, so lips stay in sync.
  Do this for every character in every new video.
- Watch for brand logos (an Apple logo appeared on a laptop lid → blurred only while visible).
