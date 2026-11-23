# Burned-in word-by-word captions (TikTok/Reels style), text taken from expect.json (correct spelling),
# timing from Whisper word timestamps on the finished video, aligned with difflib.
# usage: caption.py IN.mp4 OUT.mp4 [segs.json] [y]   (segs.json: [{"k","start","dur"}], only keys in expect.json are captioned)
import json, re, difflib, subprocess, sys, os
import numpy as np
from faster_whisper import WhisperModel
D0 = os.path.dirname(os.path.abspath(__file__)); os.chdir(D0)
IN, OUT = sys.argv[1], sys.argv[2]; SEGS = sys.argv[3] if len(sys.argv) > 3 else "segs.json"; Y = int(sys.argv[4]) if len(sys.argv) > 4 else 930
E = json.load(open("expect.json")); S = json.load(open(SEGS))
def tok(w): return re.sub(r"[^a-z0-9]", "", w.lower())
m = WhisperModel("medium.en", compute_type="int8")
x = np.frombuffer(subprocess.run(f"ffmpeg -v error -i {IN} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout, np.int16).astype(np.float32) / 32768
def ts(t): h = int(t // 3600); mm = int(t % 3600 // 60); s = t % 60; return f"{h}:{mm:02d}:{s:05.2f}"
ev = []
for g in S:
    k = g["k"]
    if k not in E: continue
    a, b = g["start"], g["start"] + g["dur"]
    segs, _ = m.transcribe(x[int(a*16000):int(b*16000)], beam_size=5, word_timestamps=True, initial_prompt="Allah, sallallahu alayhi wa sallam.")
    hw = [(tok(w.word), a + w.start, a + w.end) for z in segs for w in z.words if tok(w.word)]
    ew = E[k].replace("...", "… ").split(); et = [tok(w) for w in ew]
    T = [None] * len(ew)
    sm = difflib.SequenceMatcher(None, et, [h[0] for h in hw], autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for d in range(i2 - i1): T[i1 + d] = (hw[j1 + d][1], hw[j1 + d][2])
        elif j2 > j1 and i2 > i1:  # spread replaced words over the whisper span
            s0, s1 = hw[j1][1], hw[j2 - 1][2]; n = i2 - i1
            for d in range(n): T[i1 + d] = (s0 + (s1 - s0) * d / n, s0 + (s1 - s0) * (d + 1) / n)
    for i in range(len(T)):  # fill gaps by interpolation
        if T[i] is None:
            p = next((T[j][1] for j in range(i - 1, -1, -1) if T[j]), hw[0][1] if hw else a)
            q = next((T[j][0] for j in range(i + 1, len(T)) if T[j]), p + 0.3)
            T[i] = (p, max(p + 0.05, q))
    # chunks of <=3 words, break after punctuation
    chunks, cur = [], []
    for i, w in enumerate(ew):
        cur.append(i)
        if len(cur) == 3 or re.search(r"[.,!?:;…]$", w): chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    for c in chunks:
        for j, i in enumerate(c):
            st = T[i][0]; en = T[c[j + 1]][0] if j + 1 < len(c) else T[i][1] + 0.25
            txt = " ".join(("{\\c&H3CD6FF&}" + ew[q].upper() + "{\\c&HFFFFFF&}") if q == i else ew[q].upper() for q in c)
            ev.append((st, min(en, b - 0.05), txt))
hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: C,Montserrat,50,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,5,2,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
with open("seg/cap.ass", "w") as f:
    f.write(hdr)
    for st, en, txt in ev:
        if en > st: f.write(f"Dialogue: 0,{ts(st)},{ts(en)},C,,0,0,0,,{{\\pos(360,{Y})}}{txt}\n")
r = subprocess.run(f"ffmpeg -v error -y -i {IN} -vf \"subtitles=seg/cap.ass:fontsdir=fonts\" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart {OUT}", shell=True, capture_output=True, text=True)
if r.returncode: raise SystemExit(r.stderr[-1500:])
print("CAPTIONS", len(ev), "events ->", OUT)
