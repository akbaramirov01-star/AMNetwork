# tools/core — the one shared AM Academy builder (since 26 Nov 2026)
Use these files for every new video. Old `tools/<video>/build.py` copies are kept only as a record of how each published
video was built; do not edit them.

Work folder layout: `cfg.json`, `expect.json`, `clips/cNN.mp4`, `t/rNN.wav` (narration), `fonts/` (symlink to the font set).
```
python tools/core/build.py WORKDIR            # assemble (lip-sync gate, narration, crossfades, card, −16 LUFS)
CAP_WORDS=1 python tools/core/caption.py IN OUT   # run inside WORKDIR
python tools/core/qa.py OUT "prompt"              # per-segment transcript check
python tools/core/trl.py KEY=FILE ...             # strict check: Whisper large-v3, no prompt, flags repeated words
python tools/core/dub.py CLEAN.wav TAKE.mp4 OUT   # lay a clean line over a take, phrase-aligned
```
cfg.json keys: order, dialog, estab, estab_cap, estab_dur, fadeblack_into, hook, st, plate, arabic, card, out,
cut {k:n words kept}, skip {k:n leading words dropped}, tail {k:sec after last word}, **whisper_prompt** (per video).
Regression check 26 Nov: Heart #3 and Dawud (#15, Arabic overlay) rebuilt with core → identical segment timings.
