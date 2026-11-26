# AM Academy — production plan (23 Nov – ~30 Nov 2026)

Budget: **894.7 credits** (24 Nov evening) (Higgsfield MAX), reset expected ~30 Nov (date not confirmed by the API — check higgsfield.ai → Billing).
Rule: the founder says "go" → one video is produced end-to-end (script → voices → clips → QA → upload → texts → QUEUE.md).
Every source below was checked on 23 Nov 2026 against api.quran.com (Sahih International) or fawazahmed0/hadith-api (eng-bukhari),
except items marked **[verify]**. Sahih Muslim numbers in that dataset do NOT match sunnah.com — always re-check Muslim numbers.

## Schedule (updated 24 Nov, evening)

Budget now: **894.7 credits** (24 Nov). Higgsfield resets ~30 Nov and the remainder is lost — spend it on the list below.

### Done
| Date | Title | Series | Length | Credits |
|---|---|---|---|---|
| 21 Nov | What Would You Do? #1 Wallet, #2 Homework | What Would You Do? | 0:38 / 0:30 | 142 |
| 21 Nov | Prophet Dawud (pbuh) #15 | Stories of the Prophets | 1:41 | 136 |
| 23 Nov | Prophet Sulayman (pbuh) #16 | Stories of the Prophets | 1:28 | 130 |
| 23 Nov | Signs of the Last Day #1 — Tall buildings | Signs of the Last Day | 0:52 | 59 |
| 24 Nov | Zakariya & Yahya (pbut) #17 | Stories of the Prophets | 1:11 | ~90 |
| 24 Nov | Duas for Every Day #1 — Exam | Duas for Every Day | 0:32 | ~40 |
| 24 Nov | Heart Stories #1 — Five More Minutes (v2) | Heart Stories | 1:09 | 148 (incl. v2 fixes) |

### Next — in this order
| # | Shoot | Title | Series | Length | Est. credits | Status |
|---|---|---|---|---|---|---|
| 1 | 25 Nov | **Heart Stories #2 — "Eleven Missed Calls"** | Heart Stories | 0:57 | ~75 | **DONE 24 Nov — in QUEUE.md (#8, 2 Dec)** |
| 2 | 25 Nov | Prophet Isa (pbuh) #18 — "He spoke from the cradle" (series finale) | Stories of the Prophets | 1:37 | ~110 | **DONE 25 Nov — QUEUE #9** |
| 3 | 26 Nov | Signs of the Last Day #2 — "Every prophet warned about him" | Signs of the Last Day | 0:53 | ~60 | **DONE 25 Nov — QUEUE #10** (Muslim Book 6 Hadith 311 verified) |
| 4 | 26 Nov | Heart Stories #3 — "The Phone at the Table" | Heart Stories | ~1:10 | ~95 | idea (heart-stories.md #6) |
| 5 | 27 Nov | After This Life #1 — "What happens in the grave?" | After This Life | ~0:50 | ~55 | script ready |
| 6 | 27 Nov | Duas for Every Day #2 — "Leaving the house" | Duas for Every Day | ~0:35 | ~40 | to write |
| 7 | 28 Nov | True or Myth? #1 — "Bismillah before eating" | True or Myth? | ~0:35 | ~45 | script ready |
| 8 | 28 Nov | What Would You Do? #3 — "They insulted my brother" | What Would You Do? | ~0:35 | ~60 | script ready |
| 9 | 29 Nov | Heart Stories #4 — "Dad's Hands" | Heart Stories | ~1:10 | ~95 | idea |
| | | **Total** | | | **~680** | leaves ~200 for reshoots; anything left by 29 Nov → one more Heart Story |

Every new video: cloned voice per character + `voice_change` (one consistent voice), a clear turning point, real AM Network page on a
phone with the ayah/dua highlighted in sync, one-word captions for Heart Stories.

### Heart Stories #2 — "Eleven Missed Calls" (script)
Cast: Maryam, Mom Khadija, Dad Hamza. Sources: Quran 31:14 (verified 23 Nov), Sahih al-Bukhari 5971 "Your mother… your mother…
your mother…" (verified 24 Nov).
1. **0–3 s, hook "DECLINED. AGAIN."** Maryam at a bus stop at dusk, phone buzzing: "Mom again?! I'm not a little kid anymore!" — declines.
2. Phone screen (drawn in code): "Mom · 7 missed calls" + bubble "Maryam, where are you? Please answer 🤍".
3. Silent: Mom at the dark window at home, phone to her ear, worried; the clock.
4. Maryam walking: "I'll call her later. She always overreacts."
5. Silent: Maryam opens the front door; Dad in the hallway, serious.
6. **Turning point — Dad:** "She called you eleven times, Maryam. She thought something had happened to you."
7. Maryam freezes; she sees Mom in the kitchen doorway, eyes red (silent close-up of Maryam's face changing).
8. Mom (relieved tears): "Alhamdulillah… you're safe. That's all I wanted to know."
9. Maryam (crying): "I'm sorry, Mom. Next time, I'll answer the first time."
10. Phone: amnetwork.io/quran, Luqman 31:14 highlighted in sync — "His mother carried him, weakness upon weakness… Be grateful to Me
    and to your parents." (Dad's voice)
11. End card: "ONE CALL BACK. THAT'S ALL SHE NEEDED." · "Your mother, then your mother, then your mother" — Sahih al-Bukhari 5971 ·
    Heart Stories #2.

Credits estimate = clip seconds × 1 cr + voices + ~25 % reshoots (measured on 21 Nov: episode 136 cr, two shorts 142 cr).

## Format rules (all videos)
- **Burned-in word-by-word captions on every video** (`caption.py`, text from the script, timing from Whisper, current word gold). Playlists/numbering: `playlists.md`.
- First second: question or conflict on screen. New shot or new information every 2–3 s. Payoff only in the last 3 s.
- Fixed cast: Yusuf (11), Maryam (14), Mom Khadija, Dad Hamza, Grandma Amina, Uncle Idris. Lips = voice (native lip-sync only).
- Never show prophets, angels, jinn, Iblis, Dajjal; story scenes have no people. No crosses, poles, symbols. "Peace be upon him" after every prophet name.
- Sources on screen and in the description. Labels: "Retelling, not a fatwa · AI-animated" (shorts: "Not a fatwa · AI-animated").
- Arabic only as on-screen text until a CC0 recitation can be downloaded (Wikimedia blocks this container: 401/429).

## Scripts

### 1. Prophet Sulayman (pbuh) — done 23 Nov (`publish/sulayman.md`)
Location: backyard garden, afternoon. Cast: Yusuf, Maryam, Grandma Amina.
Hook "WAIT! DON'T STEP!" — Yusuf wants to step on ants → Maryam: one ant once saved her valley → Amina: the army of Sulayman, son of Dawud →
wind and language of birds (34:12, 21:81, 27:16) → soldiers of jinn, men and birds (27:17) → the ant's warning (27:18) →
he smiled and prayed (27:19, Arabic on screen) → "the first thing he did was thank Allah" → Yusuf walks around the ants, "Alhamdulillah,
even for the little things" → "That is the dua of Sulayman; let's learn it". Card: "MY LORD, MAKE ME GRATEFUL. · Next: Zakariya & Yahya".

### 2. Signs Before the Hour #1 — "Tall buildings"
Location: rooftop terrace at dusk, city lights. Cast: Yusuf, Grandma Amina.
- Yusuf: "Grandma, when will the Day of Judgement come? Tomorrow?!" (hook "WHEN WILL THE HOUR COME?")
- Amina: "Nobody knows except Allah. But the Prophet, sallallahu alayhi wa sallam, told us some of its signs." — plate Quran 31:34
- Narration (desert dusk, black camels resting, a far city of glass towers): "Shepherds of black camels will compete in building higher and higher buildings." — plate Sahih al-Bukhari 50
- Narration (towers soaring at night, camera tilts up): "Once they lived in tents. Look around today."
- Yusuf: "So the Hour is close? I'm scared."
- Amina (payoff): "Don't be scared. Be ready. Worship Allah as if you see Him — and if you don't see Him, He sees you." — plate Bukhari 50
- Card: "SIGNS BEFORE THE HOUR #1 · Next: every prophet warned about him".

### 3. Prophets Zakariya & Yahya (pbut)
Location: evening by the window, rain outside. Cast: Maryam, Hamza, Khadija.
Hook "A BABY... AT HIS AGE?!" — Maryam is sad a dua "wasn't answered" → Hamza: Zakariya was old, his hair white, his wife could not have
children (19:4) → he called his Lord in private (19:3), "My Lord, do not leave me alone" (21:89, Arabic on screen) → the good news of
Yahya, a name given to no one before (19:7) → "they hastened to good deeds and called on Us in hope and fear" (21:90) →
Maryam: "So I keep asking." Card: "NEVER STOP ASKING. · Next: Prophet Isa". Scenes: an old prayer niche lit by a lamp, rain, sunrise.

### 4. Family Dua Moments #1 — "Exam fear"
Location: school morning, kitchen. Cast: Yusuf, Khadija.
Yusuf panics before a test → Khadija: "Say the dua of Musa, peace be upon him" → Arabic 20:25–28 on screen with translation
("My Lord, expand for me my breast, and ease for me my task, and untie the knot from my tongue, that they may understand my speech")
→ Yusuf repeats calmly → stamp "SAVE THIS FOR YOUR NEXT EXAM". Source: Quran 20:25–28.

### 5. What Would You Do? #3 — "They insulted my brother"
Location: school yard / park. Cast: Maryam, Yusuf, Uncle Idris.
Boys laughed at Yusuf → Maryam angry. Freeze: A · Insult them back. B · Answer with something better.
Answer (Idris): "Repel evil with what is better — and your enemy may become a close friend." Quran 41:34. Stamp "ANSWER: B".
Make only if pilots 1–2 hold attention past the freeze (check 72 h after each post).

### 6. Prophet Isa (pbuh) — series finale
Location: winter evening, family by the fireplace. Cast: whole family.
Hook "A BABY WHO SPOKE?!" → story of Maryam (peace be upon her) told only through landscapes (palm tree, stream) — she is never shown →
the baby spoke: "Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet" (19:30–31) →
miracles by permission of Allah (3:49) → "Allah raised him to Himself" (4:158) → ending: the series of prophets is complete.
Card: "STORIES OF THE PROPHETS — COMPLETE".

### 7. After This Life #1 — "What happens in the grave?"
Location: night garden, stars. Cast: Maryam, Grandma Amina.
Maryam: "What happens when someone is buried?" → Amina: the person even hears the footsteps of those leaving; two angels come and ask
(Sahih al-Bukhari 1338) — angels never shown; only stars, light, a quiet garden → "So we prepare now: our prayer, our kindness".

### 8. True or Myth? #1 — "Bismillah before eating"
Location: family dinner. Cast: Yusuf, Hamza.
Yusuf: "Saying Bismillah before food is just a tradition, right?" → TRUE/MYTH stamp → Hamza: the Prophet ﷺ told a boy: "Mention the name
of Allah, eat with your right hand, and eat from what is nearest to you" (Sahih al-Bukhari 5376). Stamp "TRUE — IT'S SUNNAH".

### 9. Signs Before the Hour #2 — "Every prophet warned about him"
Location: rooftop terrace (same as #1). Cast: Yusuf, Amina, Hamza.
"No prophet was sent but that he warned his people about the one-eyed liar… your Lord is not one-eyed" (Sahih al-Bukhari 7131).
Protection: memorise the first ten ayat of Surah Al-Kahf **[verify: Sahih Muslim number on sunnah.com]**. Dajjal is never shown —
only fog, an empty road, a lamp. Calm ending: "Allah protects those who prepare."

## Growth notes (YouTube ~1300 subs, TikTok 72 subs / ~200 views per video — founder, 23 Nov)
- ~200 views per TikTok is roughly the first test audience; a video that holds viewers in the first 2–3 s gets shown wider {unverified, platform behaviour}.
- What we change: hook on screen in second 1 (done in all new videos), shorter shorts (30–45 s), questions that invite comments (A/B, True/Myth),
  one clear benefit per video ("save this for your next exam").
- TikTok Creator Rewards needs videos over 1 minute (growth-plan.md) — prophet episodes are 1:40+, shorts are for reach.
- Measure per video after 72 h: average % watched, % past second 3, comments. Keep what works, drop what doesn't.

## Added 24 Nov
- **Done 24 Nov:** Stories of the Prophets #17 Zakariya & Yahya (1:11) and Duas for Every Day #1 "Exam" (0:35) — 131.3 cr for both.
- **Platform plug in every video (founder, 24 Nov):** where an ayah/dua/hadith/Zakat is read, show a generic unbranded phone with the
  REAL AM Network page (Playwright screenshot of the repo page opened from file://, e.g. /quran/ for an ayah; `tools/phone/phone.py`).
  End cards name the page (amnetwork.io/quran, /dua, /hadith, /zakat). Founder will send Quranly-style examples.
- **Wording follows the 24 Nov model** (`docs/messaging-2026-11.md`): AI suggests a Zakat category, the giver verifies and decides,
  money never passes through AM Network. Never "every family checked by us".
- **New format idea from founder's reference video** (Russian, 36 s, "we accepted bad manners as culture: smacking → ASMR, bragging →
  unboxing, pranks…"): our version **"They Renamed It"** — calm voice-over, one scene per line, ends with a hadith on good character
  (source to verify, e.g. Tirmidhi on the heaviest thing on the Scale being good character). Rules: no music, no people mocked,
  no intimate scenes (the reference had a bedroom line — we drop it), family cast only. Playlist: Muslim Life Lessons.
- Next: Prophet Isa #18 (series finale) → Signs #2 → "They Renamed It" #1 → WYWD #3.
- **Phone v2 (founder, 24 Nov): highlight what is being read + a player.** `tools/phone/shot2.js` screenshots the real page once per
  ayah with that ayah outlined (same scroll window); `phone2.py` switches screens at the narration's pause times (silencedetect) and
  draws a bottom "Playing · AM Network Quran" bar with a moving progress line. Captions are skipped over the phone (`CAP_SKIP=03`).
  **Audio stays our own narration** — the site's reciters (famous qaris) trigger YouTube Content ID (Ayyub #12 was blocked twice);
  Arabic recitation only from CC0 files, which this container cannot download from Wikimedia yet.

## What the numbers say (founder screenshots, 25 Nov 13:13)
Instagram: "EVERYTHING… then lost it ALL. What did he say?" (Ayyub) **26.9k**, Episode 7 **22k** (both pinned), Lut "A whole city
UPSIDE DOWN" **1,907**, Yusuf "Thrown into a well… by his own brothers?!" **1,430**, "who left them there?" 797, the scale 450–563;
most "boy-face" covers (Musa parts, WYWD) 117–366. TikTok ~180–350 each (Yunus best, 350). YouTube Shorts 3–28 views.
Rules we take from it:
1. **The first frame is the event, not the narrator.** Winners show the miracle/disaster (a ruined valley, a city upside down, a well);
   the Yusuf-reaction covers sit at ~150. Open on the strongest image, the family comes in after.
2. **An unanswered question with a person at its centre** ("What did he say?", "by his own brothers?!"). The answer comes late.
3. **One complete story per video** beat multi-part series (Musa parts 1–5: 142–366). No more "Part N".
4. Story first, lesson last; the platform plug (phone with the ayah) sits at the payoff, not the start.
5. YouTube Shorts barely gets shown — upload anyway, but judge growth on Instagram/TikTok; reuse winners' structure, not the topic.

## Lessons 25 Nov (Isa #18, Signs #2)
- seed_audio refuses some Quran sentences (19:30, 18:1 flagged "nsfw") — record them in two halves and join locally (atrim + concat).
- voice_change can swallow a word ("peace be upon **him**" became "upon and") — always re-run Whisper after voice_change; patch the
  one word from the native take (pitch-matched, 30 ms crossfades) rather than accept a broken salawat.
- A vertical light beam crossing a cloud band reads as a cross — prompt "only round soft glows, no beams, no lines, no clouds".
- Whisper can hallucinate the initial prompt words at the end of a short clip → use cfg "cut" to keep only the real words.

## Draft — Signs of the Last Day #3 "40 Days" (founder idea 25 Nov: our version of a Towards Eternity Dajjal video)
Source (verified 25 Nov, hadith-api eng-muslim #7373 = Sahih Muslim, Book 54, Hadith 134, an-Nawwas ibn Sam'an) — every line below is
from this hadith; nothing added. The Dajjal, Isa (peace be upon him), angels and people are NEVER shown — only places, weather, light.
Cast: Yusuf, Hamza (rooftop, same set as #2 — a direct sequel). Target 1:20–1:40 (TikTok rewards > 1 min).
1. Hook (0–3 s): a desert day where the sun does not move, the shadow of a palm frozen; text "ONE DAY… AS LONG AS A YEAR."
   VO: "He will stay on earth forty days. One day like a year. One day like a month. One day like a week."
2. Yusuf: "A day like a YEAR? Then how do we pray?!" — Hamza: "The companions asked the same. He said: estimate the time, and pray."
3. "He moves like a cloud driven by the wind" — storm clouds racing over plains (timelapse).
4. Two villages: rain and green fields for those who follow him / drought for those who refuse — "that is his test".
5. "He says to the wasteland: bring out your treasures — and they follow him like swarms of bees" (gold glints swarming over sand, no people).
6. Yusuf: "How can anyone stand against that?" — Hamza: "The Prophet, peace be upon him, said: recite over him the opening ayat of
   Surah Al-Kahf." (callback to #2, phone with 18:1 on amnetwork.io/quran).
7. Payoff: dawn, a white minaret in the east of Damascus (only the minaret and sky) — "Then Allah will send Isa, son of Maryam,
   peace be upon him… and he will reach him at the gate of Ludd." (an old stone gate at dawn, empty). Calm ending.
8. Yusuf: "So the liar loses." Hamza: "Always. Hold on to the truth." Card: "HOLD ON TO THE TRUTH. · Sahih Muslim 54:134 · Next: …".
Not used (too graphic or would require showing people): the young man cut in two, Gog and Magog details.
- seedance re-voices the line itself and mispronounced "Al-Kahf" as "Al-Kahib" in 3 takes even with a correct reference audio. Fix that
  works: keep the take's picture, dub the clean seed_audio line over it, time-warped phrase by phrase to the take's word timings
  (atempo per segment), ambience kept under it. Check Arabic names with Whisper large-v3 WITHOUT an initial prompt (the prompt hides errors).

## Budget plan (25 Nov, 442.9 credits left; Higgsfield reset ~30 Nov, date unconfirmed)
| # | Video | Est. | Why now |
|---|---|---|---|
| 1 | Signs of the Last Day #3 — "Dajjal decoded" (founder approved 25 Nov) — **DONE 25 Nov, 1:42, QUEUE #11** | ~137 | founder's request; story + mystery = our best-performing pattern |
| 2 | Heart Stories #3 — "The Phone at the Table" | ~95 | emotional family story, widest audience |
| 3 | After This Life #1 — "What happens in the grave?" | ~55 | big question hook, short |
| 4 | True or Myth? #1 — "Bismillah before eating" | ~45 | comment-bait format, cheap |
| 5 | Duas for Every Day #2 — "Leaving the house" | ~40 | useful, saveable, cheap |
| | **Total** | **~345** | leaves ~95 for reshoots/fixes |
Moved after the reset: What Would You Do? #3 (WYWD #1 posted: 117–212 views, weakest format so far) and Heart Stories #4.

- Budget after Signs #3: **306 credits** (25 Nov). Next per plan: Heart #3, After This Life #1, True or Myth #1, Dua #2 (~235).
- `tools/signs3/dub.py CLEAN.wav TAKE.mp4 OUT.mp4` — automatic dub with phrase alignment (used for a slurred 'ten ayat').

## Done 25 Nov (budget plan complete) — 47.9 credits left
Heart Stories #3 (0:56), After This Life #1 (0:54), True or Myth? #1 (0:33), Duas for Every Day #2 (0:33) — QUEUE #12–15.
Lessons: voice_change can also DROP a negation ("what if I don't know" → "what if I know") — re-check meaning after every voice change,
in the final cut too; rewrite fragile lines without negations ("what if I forget"). Cemeteries from the model came with crosses —
use a single bare earth mound in an open field. Album photos: prompt "every woman wears a headscarf". phone2.py: PLAYER_SUB env for non-Quran pages.
Builder: cfg "tail" (per-clip tail after last word) and "skip"; initial_prompt must be set per video (stale prompts make Whisper hallucinate words).
Next after the Higgsfield reset: What Would You Do? #3, Heart Stories #4.

## Channel setup check (founder, 26 Nov)
- Google 2FA: on. YouTube advanced features: on. Nothing left to do there.
- Growth levers we keep (from the "faceless AI channel" video the founder sent): check every idea with YouTube search sorted by
  "this week" (0–2 videos on the topic → make it, 5+ → skip); reuse our own winning core ("[event] — what did he say?" + prophet
  story + ayah on screen) and change one variable; later test one video in another language (ru/tr/id/ur).
- Risk to keep in mind: YouTube's inauthentic-content rules (mass-produced/template AI; AI personas on sensitive topics) — our
  defence is real sources on screen, verified hadith, original scripts, "Not a fatwa · AI-animated", no daily mass uploads.
