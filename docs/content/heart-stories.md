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
| 2 | **Eleven Missed Calls** v2 (24 Nov, 1:19, ~150 cr incl. v1, `publish/heart-2.md`) | Maryam at a cafe with friends declines Mom ("I don't need anyone controlling me"); Mom leaves a voice message; Grandma: "Let us make dua for her"; Uncle Idris finds her: "That's not control. That's what love sounds like when it's scared"; she plays Mom's voice message; apology; Grandma: "One day you will wish that phone was still ringing" | Quran 31:14 (verified); Bukhari 5971 (verified) |
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

## Lessons from #2 (24 Nov)
- **Higgsfield allows only 3 cloned voices** and has no delete tool here. Clones: Yusuf `b2d57a9e-d801-4b58-9e7c-5ede83d8533f`,
  Khadija `b1db31e6-1a51-4b7e-9467-6ef9c50a2ff4`, Hamza `b85e6fca-cab6-481c-b3da-21255d613a93`. Maryam has no clone: her clips are
  `voice_change`d to the preset voice **Zoe** (`d0374db1-44b9-4f05-939e-0a9ae9dbbe6a`) and then pitched +2 semitones locally
  (`asetrate=48000*1.12246,aresample=48000,atempo=0.8909`), so all her lines sound like one teenage girl. Do the same for her in every video.
  To clone another character, the founder has to delete a voice in the Higgsfield web app first.
- Seedance repeated a word again ("little, little kid") — a reshoot of the 4 s clip fixed it. tr.py flags it only via ratio; read the transcript.
- Order the turning point as: someone tells her the cost (Dad) → her face changes → we see what she sees (Mom praying with the phone beside her).
- Builder for this one: `docs/content/tools/heart2/` (build.py now takes per-clip `estab_dur`; calls.py draws the missed-calls lock screen).

## Founder feedback on #2 v1 (24 Nov) → v2
- v1 felt pointless: no reason why she ignores Mom, too few characters. **Every story needs a believable motive** (here: she is with
  friends and does not want to be controlled) **and the wider family** (Grandma Amina, Uncle Idris), each with a line that adds meaning.
- v1 opening repeated her words: the lock-screen clip reused the first clip's sound track. **Never take a phone-screen clip's audio
  from a dialogue clip** — `calls2.py` now makes its own sound (buzz + room tone).
- Mom must speak where she appears with a phone (voice message), not stand silent.
- Grandma has no clone: preset voice **Mabel** (`fa64fba4-ad02-405e-99d0-1f085d87c706`) via voice_change, then −2 semitones locally.
  Idris's native voice was consistent (111–123 Hz), so no change.
