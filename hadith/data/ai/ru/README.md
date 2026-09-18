# Russian Jami at-Tirmidhi translation data

`tirmidhi.json` is a hadith-number-to-text lookup used by the reader when Russian is selected.

- 3,881 entries come from the i-muslim authored corpus: https://i-muslim.com/api/v1/translations/hadith/tirmidhi/ru
- The API declares those authored rows CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/
- 9 citation numbers absent from that corpus were generated from the English fawazahmed0/hadith-api edition through the AM Network translation service.
- The reader labels this whole static lookup as AI-generated and not yet reviewed by a scholar. A verified published translation should always take priority when one becomes available.

Run `scripts/build_tirmidhi_ru.py` to refresh the CC0 seed and continue filling uncovered non-empty English records. Set `AMN_SEED_ONLY=1` to refresh the seed without making AI translation requests.