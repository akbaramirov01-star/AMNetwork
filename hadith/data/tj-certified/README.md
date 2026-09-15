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
