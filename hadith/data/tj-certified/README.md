Certified (human-translated, not AI) Tajik hadith text, matched by
hadithnumber to the site's existing English source (fawazahmed0/hadith-api,
eng-<book>.json).

Source: "Мухтасари Саҳеҳи Бухорӣ" (Imam Zaynuddin Ahmad az-Zubaydi's
abridgment of Sahih al-Bukhari), Tajik translation by Abdulhalim Orifi,
Dushanbe, "ЭР-граф", 2011, ISBN 978-99947-41-86-1 — officially reviewed by
Tajikistan's Committee on Religious Affairs.

Each file is named <book>.json (e.g. bukhari.json) and maps a hadithnumber
(string key, matching the "hadithnumber" field in the site's own eng-<book>
dataset) to the certified Tajik text for that hadith.

Every entry here has been individually verified against the English source
text before being added — content correspondence confirmed by narrator and
substance, NOT just guessed by number, since this abridgment uses its own
internal numbering that doesn't match the site's. A wrong match here would
be worse than the current AI-translated fallback, so coverage grows slowly
and only as entries are actually confirmed — this is intentional, not a
placeholder waiting to be filled in bulk.

## Progress log
- 14 hadiths verified and added (hadithnumbers 484-492, 494, 496, 500-502),
  all in book 8 (Prayers/Salat) — cross-checked narrator + content against
  the site's own eng-bukhari.json before being added, not matched by
  number alone (this book's own numbering doesn't correspond to the site's).
- Notable: hadithnumbers 484-492 are marked "not translated" in the site's
  own English source (a known gap in the classic Muhsin Khan translation
  this dataset republishes) — so for these 9, the certified Tajik text
  isn't just better than an AI guess, it's the only real translated
  content available at all, in any language, on this site.
- Continuing through the remaining ~600 pages of the source book
  incrementally; see ../../../../tmp-equivalent scratchpad log
  (mukhtasar_tj/hadiths.jsonl) for the working transcription queue.
- +27 more verified (Sep 15 session): hadithnumbers 505, 507-510, 512, 516,
  520, 525-528, 537, 539, 540, 543, 547-548, 550, 552-557, 559 — book 8
  tail (Sutra/prayer-obstruction hadiths) and book 9 (Times of Prayer)
  head. Total certified so far: 41 hadiths.
- Deliberately skipped as not-yet-confident (need closer re-verification
  before adding): Tajik hadiths #328 (may be a continuation of #327/526
  rather than its own English hadithnumber), #331 (Tajik text appears to
  merge two distinct English hadiths, 531 and 532, into one), #347
  (two plausible English candidates, 560 vs 565, differ on narration
  chain directness — picking wrong one would misattribute the hadith).
- +6 more verified (continuing Sep 15 session): 566, 567 (Isha delay/Abu
  Musa boat, book 9), 660, 662, 616, 835 (Book 10: seven-shaded hadith,
  mosque-visits reward, muddy-day pray-at-home, tashahhud). Total: 47.
- Confirmed Book 10 in the site's dataset spans hadithnumbers 603-875 and
  covers BOTH "Call to Prayers (Adhaan)" and the full description of how
  to pray (raising hands, recitation, bowing, tashahhud, etc.) — this
  book's own two separately-titled "Kitobi Азон" and "Kitobi Абвоби
  Сифати Намоз" both map into this single English book.
- +4 more (Sep 15 session cont'd): 876, 886, 918, 1000 — Book 11 (Friday
  Prayer) opening hadith, Umar's silk-cloak question, Jabir's date-palm
  stem/pulpit hadith, and Ibn Umar praying Witr on a mount (Book 14).
  Total: 54. Confirmed Books 11, 13, 14, 15, 16 in this source keep the
  SAME book numbers as the site's English dataset (876-941, 948-989,
  990-1004, ... respectively) — book-level alignment holds from Book 11
  onward, simplifying matching for everything after.
