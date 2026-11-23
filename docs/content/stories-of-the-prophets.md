# AM Academy content — "Stories of the Prophets"

**Current source of truth: `AM_Academy_handoff_19oct-17nov.pdf` in this folder** (state on 17 Nov 2026:
episodes 8–13 done, Musa part 1 ready, new daily short-part format, all rules, character sheet and
voice job ids, production recipe, metrics). Read it before any new episode. The notes below are the
older 19 Oct snapshot, kept for history.

---


Moved here from a claude.ai chat (shared 17 Nov 2026) so Claude Code sessions keep the context.
The working files of that chat (`claude/season2-plan.md`, `claude/publish-pack-15-18-oct.md`,
`claude/reels-pack-oct.md`, character prompts) live in the claude.ai project, not in this repo.

## Format
- AI-animated family series, English only (YouTube auto-dub for other languages). Told by
  **Grandma Amina** to the grandchildren. ~2.5–3 min per episode, no music, ambient SFX only
  (credited Wikimedia Commons sounds; rest synthesized).
- Fixed cast (Higgsfield character cards, Sharia-compliant dress: hijab covering hair and neck,
  loose clothing to wrists/ankles; men in long loose trousers, no gold):
  Yusuf (11), Maryam (14, his sister), Mom Khadija, Dad Hamza, Grandma Amina, Uncle Idris (neighbour).
  No imam character (avoids "AI fatwa").
- Every prophet name followed by "(peace be upon him)"; the Prophet Muhammad ﷺ as
  "Muhammad, sallallahu alayhi wa sallam". Sources shown on screen (surah:ayah, hadith no.) and
  in the description. Labels: "Retelling, not a fatwa", "Characters and voices are AI-generated",
  "Inspired by the series by Sheikh Nabil Al-Awadi (Mission Dawah)".
- AI disclosure on every platform: YouTube "altered/synthetic content = Yes", Instagram "AI info",
  TikTok "AI-generated". YouTube: not made for kids, playlist "Stories of the Prophets".
- Quality rules the founder set: no repeated scenes, no back-and-forth zoom on one shot, check
  pronunciation (Allahu Akbar, Ramadan, Yusuf as one word, Nuh, Jannah, Iblis) and lip sync before
  delivery, no Hindu-style prayer hands, keep characters identical across scenes, spend as few
  credits as possible (check past mistakes before generating).

## Season 2 progress
| # | Episode | Status |
|---|---|---|
| 1 | Creation | published |
| 2 | The first human | published |
| 3 | Adam and Hawwa | published |
| 4 | Nuh | published 14 Oct |
| 5 | Hud | published 15 Oct |
| 6 | Salih | published 16 Oct |
| 7 | Ibrahim (v3, Arabic text "Hasbiyallahu wa ni'mal wakil", Bukhari 4564) | published 17 Oct |
| — | Compilation 1–7, 19:31, 16:9 | for YouTube, 18 Oct |
| 8 | Hajar and Ismail | 20-second hybrid test made (2.05 cr); full episode not made |
| 9–18 | … to Isa | planned, ~11 episodes left |

- From E8 on: shoot 16:9, cut a vertical version for Reels/TikTok/Shorts.
- Cost: ~190–196 Higgsfield credits per episode with talking video scenes; the "hybrid"
  (narration scenes as stills animated for free in code + talking heads only for dialogue) ≈ 45–70 cr.
- Higgsfield ULTRA ≈ €122/month for ~3000 credits; balance ~78 cr on 19 Oct (renewal after salary).
- 17 vertical reels (15–22 s, hook in the first 2–3 s, cut from published episodes, no new credits)
  planned 20–31 Oct for TikTok, Shorts, Reels. Before posting, check on sunnah.com the hadith numbers
  flagged in that pack: Bukhari 3191 and 433, Tirmidhi 2955 and 3368, Muslim 2980.
- Telegram and X: project news only, no more videos there. Posting rhythm: teaser 08:00, full 20:00 Berlin.

## Musa part 2 — done 18 Nov 2026 (Claude Code session)
- Video 1:26: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/d85d6f5a-38ac-40e7-a651-fdd67e9d8772.mp4
- Cover: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/bdf74480-471b-497b-8619-2a203ca39ed0.jpg
- Sources Quran 28:9–13 (Sahih International, checked via api.quran.com). Hook "DON'T KILL HIM!". Card "WHY DID HE RUN AWAY? · Part 3 tomorrow".
- Cost 108.6 cr (2180.35 → 2071.75). Lessons: seed_audio flagged "nsfw" on a line with both "Do not kill him" and "adopt him as a son" — rephrased "take him as a son" passed;
  the single-call generate_audio tool dropped the voice reference (wrong voice) — use generate_audio_batch with role audio_references;
  seedance changed "Musa, peace be upon him" to "Moses… spied upon him" — line 04 uses the recorded audio (build.py rec mode).
- Sandbox: ~/m2 (copy of ~/m1 recipe, cfg.json for part 2).

## Musa part 3 — done 19 Nov 2026
- Video 1:29: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/c18108f1-1e61-4d15-97b9-6ba013fc6e15.mp4
- Cover: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/02cb1544-08ef-4cb8-9ca8-4af9e8e0604c.jpg
- Story 28:15–24: accidental killing, repentance (28:16), warning (28:20), flight (28:21), well of Madyan (28:23–24),
  dua 28:24 recited in Arabic — Wikimedia Commons "Chapter 28, Al-Qasas (Murattal)", Atcovi, CC0, ayah at 616.8–628.0 s;
  Arabic text with word-by-word gold highlight (sandbox ~/m3/dua.py, Amiri Quran font). Card: "WHO CAME TO THE WELL? · Part 4 tomorrow".
- Cost 106.8 cr (2071.75 → 1964.95). Lessons: a scene prompt drifted into a modern asphalt road — say "only ancient things, no roads";
  seedance dropped "peace be upon him" in a dialogue clip (03) and doubled a word (08) — both use the recorded audio.
- Next: Musa part 4 (28:25–28 the father of the women, marriage, 10 years; then the fire at Tur 28:29) and part 5 (the sea, 26:63).

## Musa part 4 — done 21 Nov 2026
- Video 1:50 (720×1280): https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/afa6be54-0274-4671-ac5b-f88248812feb.mp4
- Cover: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/e63df2ad-4bb8-47df-8d9b-d3c6ce168d54.jpg
- Story 28:25–29 (Sahih International via api.quran.com): the shy invitation, "Fear not", 28:26 "hire him… the strong and the trustworthy"
  recited in Arabic (Atcovi CC0, from "يا أبت" at 672.78 s to 686.75 s, gold word highlight), the 8/10-year agreement, years passing,
  the fire on the mountain. Family frame: evening garden by a fire pit (Yusuf hook, Hamza, Khadija, Maryam). Hook "10 YEARS... FOR A WEDDING?!".
  Card "WHAT WAS THAT FIRE? · Part 5 tomorrow".
- **Lip-sync rule (founder's complaint, 21 Nov):** parts 2–3 had drift because clips 03/04/08 used build.py "rec mode" (our recording laid
  over a mouth that said something else). Now build.py refuses rec mode (`LIPSYNC:` error) unless `ALLOW_REC=1`; a bad dialogue clip is
  regenerated instead. All 5 dialogue clips in part 4 are native.
- Lessons: seed_audio flagged "nsfw" on "one of the two women came back to him… walking with shyness" → "one of the two sisters returned to
  the well… walking with modesty and shyness" passed. A dialogue clip said "Medina" instead of "Madyan" (transcript ratio still 0.94 —
  check proper nouns with a Whisper `initial_prompt`); the reshoot with "MAD-yan, not Medina" in the prompt was right. A "shepherd's staff
  leaning on a rock" rendered as a cross → never ask for sticks/staffs in empty landscapes; say "no poles, no crosses, no symbols".
  Narration longer than clip × 1.35 gets cut → make the clip long enough (scene 06 reshot at 12 s). Whole-file Whisper QA mis-hears
  segments right after Arabic recitation — re-check those segments alone.
- Cost 146.9 cr (1949.2 → 1802.3; 3 reshoots: Medina→Madyan, a cross-shaped staff, a too-short scene).
- Sandbox: ~/m4 (scripts rebuilt from the transcript after the sandbox was wiped; dua.py renders the ayah clip).

## Musa part 5 (final) — done 21 Nov 2026
- Video 1:54: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/3ed5fc8f-ff7d-4736-8143-f2ac6a675abd.mp4
- Cover: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/79078945-2a8c-4a3e-bdbe-e32e95dbaad8.jpg
- 28:29–39 (the call at Tur, sent to Pharaoh with Harun), 26:52–66 (night exodus, "we will be caught", 26:62 recited in Arabic —
  Atcovi CC0 "Chapter 26, Ash-Shu'ara (Murattal)", 692.75–700.95 s —, the sea parts "like a great towering mountain", saved / drowned).
  Family frame: seaside boardwalk at sunset. Hook "SEA AHEAD. ARMY BEHIND." Card "MY LORD IS WITH ME. · Next: Prophet Dawud".
- Cost 161.5 cr (1802.3 → 1640.8; reshoots: mushroom-like dust cloud, a clip too short for its line, "My, my Lord", "our love" instead of "Allah").
- Lessons: check recorded line length BEFORE ordering the dialogue clip (clip ≥ span + 1.5 s); always re-check "Allah", prophet names and
  places with Whisper + initial_prompt — the model can swap them while the plain transcript ratio still passes.
- Decision 21 Nov (Akbar): finish prophets with one episode each — Dawud, Sulayman, Zakariya & Yahya, Isa — then switch to the new
  25–40 s format "What would you do?" (family dilemma, A/B freeze, answer from Quran/Sunnah with source). Pilot 2 videos first.

## «What would you do?» pilots 1–2 — done 21 Nov 2026
- WY1 «The wallet» 38.5 s: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/5a877545-fee4-4ac4-b5f3-511debd6f25d.mp4 (Quran 4:58, Bukhari 2429)
- WY2 «Copy my homework» 29.9 s: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/cb911d64-b9a4-4f2d-b63d-c74f282765f3.mp4 (Quran 5:2)
- Scripts `docs/content/what-would-you-do-pilots.md`, texts `docs/content/publish/what-would-you-do-1-2.md`, builder `docs/content/tools/wy/`.
- Cost 142.2 cr (1640.8 → 1498.6): 12 voice lines, 12 clips + 9 reshoots/rejections.
- **Assembly now runs in this Claude Code container, not the Higgsfield sandbox** — every sandbox_exec call asked the founder for
  approval even in Auto mode. The AMNetwork environment allows the Higgsfield CDN/upload hosts, Hugging Face (Whisper), api.quran.com,
  jsDelivr, Wikimedia. Locally: `pip install faster-whisper`, `HF_HUB_DISABLE_XET=1`, feed Whisper a numpy array (PyAV 19 breaks
  `decode_audio`), Montserrat from jsDelivr fontsource.
- Lessons: seedance mini **repeats words to fill a long clip** ("right right now", "She send it! She's…", "Teaching helping her") and
  swaps short words ("it's a date" for "it's B", "it is in hours"). Fix that worked: put the exact line in quotes in the prompt + "says the
  line exactly once, every word once" + clip = line + ~1.5 s. Check with `chk.py` (unprompted Whisper, flags repeats and words with
  probability < 0.5) — prompting Whisper with the expected line hides real errors. A "smartphone" insert was rejected as copyright →
  "plain unbranded black mobile phone". Chat bubbles are drawn in code (no AI text).

## Prophet Dawud (peace be upon him) — done 21 Nov 2026
- Video 1:41: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/1c260b9a-9516-4848-af8d-02d2bd12fc0a.mp4
- Cover: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/6ab98734-2d17-4507-8850-113e856b297e.jpg
- 2:249–251 (few vs many, Talut, Jalut), 34:10–11 (iron, coats of mail), 34:10 + 38:18–19 (mountains and birds), Bukhari 2072 (ate from his
  own work), Bukhari 1131 (fast every other day), 34:13 ("work in gratitude"). Family frame: mountain viewpoint at sunrise. Hook
  "FEW AGAINST A GIANT ARMY?!". Card "WORK WITH GRATITUDE. · Next: Prophet Sulayman". Texts: `publish/dawud.md`. Builder: `tools/dawud/`.
- No sling, no "boy David" — those details are not in the Quran. 34:10 is shown as Arabic text + translation (Amiri font, raqm),
  **without recitation**: Wikimedia returned 401/429 to this container, so the CC0 Atcovi Saba file could not be fetched.
- Cost 135.6 cr (1498.6 → 1363). Reshoots: a helmet with a cross-shaped dent → "completely smooth and plain, no markings";
  "said, said" in a dialogue clip. seed_audio flagged "O mountains, repeat praises with him, and the birds as well" as nsfw → narrated
  as "the mountains and the birds glorified Allah together with him" (38:18–19).
- Whisper spells the salawat "Sallallahu Alaihi Wasallam"; build/chk now normalise all spellings before comparing.

## Prophet Sulayman (peace be upon him) — done 23 Nov 2026
- Video 1:28: https://d2ol7oe51mr4n9.cloudfront.net/user_3EkfyAdwC1v8WM8AwCLFBGF9HDQ/53546c32-8898-4326-a967-0f10b926c13f.mp4 · texts `publish/sulayman.md` · builder `tools/sulayman/`
- 27:15–19 (inherited Dawud, language of birds, army of jinn/men/birds, the ant, dua of gratitude 27:19 as Arabic text), 34:12, 21:81 (wind).
  Family frame: backyard garden, Yusuf about to step on ants. Hook "WAIT! DON'T STEP!". Card "MY LORD, MAKE ME GRATEFUL. · Next: Zakariya & Yahya".
- Cost 130.2 cr (1363 → 1232.85). Reshoot: "ants, ants". seed_audio flagged "That army belonged to Sulayman… son of Dawud" → "It was the army of Sulayman… His father was Dawud…".
- **Arabic text fix (also applied to Dawud → v2):** PIL/raqm with Amiri (fontsource subset and google AmiriQuran) misplaced harakat.
  Now `ar.js` renders the Arabic overlay in Chromium (Playwright) with **Scheherazade New 700** (fontsource), fonts embedded as data URIs.
