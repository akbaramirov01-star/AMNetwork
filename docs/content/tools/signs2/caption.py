# Burned-in word-by-word captions v2 (23 Nov). Text from expect.json (correct spelling), timing from ONE Whisper pass over the
# whole finished video, aligned globally; times are forced monotonic and events never overlap.
# usage: caption.py IN.mp4 OUT.mp4 [segs.json] [y]
import json, re, difflib, subprocess, sys, os
import numpy as np
from faster_whisper import WhisperModel
os.chdir(os.path.dirname(os.path.abspath(__file__)))
IN, OUT = sys.argv[1], sys.argv[2]; SEGS = sys.argv[3] if len(sys.argv) > 3 else "segs.json"; Y = int(sys.argv[4]) if len(sys.argv) > 4 else 930
E = json.load(open("expect.json")); MAXW = int(os.environ.get("CAP_WORDS", "3")); SIZE = int(os.environ.get("CAP_SIZE", "50"))
SKIP = set(filter(None, os.environ.get("CAP_SKIP", "").split(",")))
S = [g for g in json.load(open(SEGS)) if g["k"] in E and g["k"] not in SKIP]
def tok(w): return re.sub(r"[^a-z0-9]", "", w.lower().replace("judgment", "judgement"))
x = np.frombuffer(subprocess.run(f"ffmpeg -v error -i {IN} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout, np.int16).astype(np.float32) / 32768
m = WhisperModel("medium.en", compute_type="int8")
try:
    segs, _ = m.transcribe(x, beam_size=5, word_timestamps=True, condition_on_previous_text=False, initial_prompt="Allah, sallallahu alayhi wa sallam."); segs = list(segs)
except IndexError:  # faster-whisper alignment edge case on an empty window: retry with VAD
    segs, _ = m.transcribe(x, beam_size=5, word_timestamps=True, condition_on_previous_text=False, vad_filter=True, initial_prompt="Allah, sallallahu alayhi wa sallam."); segs = list(segs)
hw = [(tok(w.word), w.start, w.end) for z in segs for w in z.words if tok(w.word)]
# expected words in order, remembering which segment each belongs to
W = []  # (display, tok, seg_index)
for si, g in enumerate(S):
    for w in E[g["k"]].replace("...", "… ").split(): W.append((w.upper(), tok(w), si))
T = [None] * len(W)
sm = difflib.SequenceMatcher(None, [w[1] for w in W], [h[0] for h in hw], autojunk=False)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
        for d in range(i2 - i1): T[i1 + d] = [hw[j1 + d][1], hw[j1 + d][2]]
    elif op == "replace":
        s0, s1 = hw[j1][1], hw[j2 - 1][2]; n = i2 - i1
        for d in range(n): T[i1 + d] = [s0 + (s1 - s0) * d / n, s0 + (s1 - s0) * (d + 1) / n]
# words still missing: interpolate inside their own segment window
for i in range(len(W)):
    if T[i] is None:
        g = S[W[i][2]]; p = next((T[j][1] for j in range(i - 1, -1, -1) if T[j] and W[j][2] == W[i][2]), g["start"] + 0.3)
        q = next((T[j][0] for j in range(i + 1, len(W)) if T[j] and W[j][2] == W[i][2]), p + 0.35)
        T[i] = [p, max(p + 0.12, q)]
# keep every word inside its segment and strictly increasing
for i in range(len(W)):
    g = S[W[i][2]]; lo, hi = g["start"], g["start"] + g["dur"]
    T[i][0] = min(max(T[i][0], lo), hi - 0.1); T[i][1] = min(max(T[i][1], T[i][0] + 0.08), hi)
    if i and T[i][0] < T[i - 1][0] + 0.06: T[i][0] = T[i - 1][0] + 0.06; T[i][1] = max(T[i][1], T[i][0] + 0.08)
# chunks of <=3 words, never across segments, break after punctuation
chunks, cur = [], []
for i, w in enumerate(W):
    if cur and W[cur[-1]][2] != w[2]: chunks.append(cur); cur = []
    cur.append(i)
    if len(cur) == MAXW or re.search(r"[.,!?:;…]$", w[0]): chunks.append(cur); cur = []
if cur: chunks.append(cur)
ev = []
for ci, c in enumerate(chunks):
    nxt = T[chunks[ci + 1][0]][0] if ci + 1 < len(chunks) else 1e9
    for j, i in enumerate(c):
        st = T[i][0]; en = T[c[j + 1]][0] if j + 1 < len(c) else min(T[i][1] + 0.3, nxt)
        txt = " ".join(("{\\c&H3CD6FF&}" + W[q][0] + "{\\c&HFFFFFF&}") if q == i else W[q][0] for q in c)
        ev.append([st, en, txt])
for a, b in zip(ev, ev[1:]): a[1] = min(a[1], b[0])  # no overlap, ever
ev = [e for e in ev if e[1] - e[0] >= 0.04]
def ts(t): return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: C,Montserrat,{SIZE},&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,5,2,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
with open("seg/cap.ass", "w") as f:
    f.write(hdr)
    for st, en, txt in ev: f.write(f"Dialogue: 0,{ts(st)},{ts(en)},C,,0,0,0,,{{\\pos(360,{Y})}}{txt}\n")
# self-check: no two events on screen at once (centisecond resolution as written)
def tt(s): h, mm, ss = s.split(":"); return int(h) * 3600 + int(mm) * 60 + float(ss)
rows = [l.split(",", 9) for l in open("seg/cap.ass") if l.startswith("Dialogue")]
bad = sum(1 for a, b in zip(rows, rows[1:]) if tt(b[1]) < tt(a[2]) - 1e-6)
if bad: raise SystemExit(f"CAPTION OVERLAP: {bad}")
r = subprocess.run(f"ffmpeg -v error -y -i {IN} -vf \"subtitles=seg/cap.ass:fontsdir=fonts\" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart {OUT}", shell=True, capture_output=True, text=True)
if r.returncode: raise SystemExit(r.stderr[-1500:])
print("CAPTIONS", len(ev), "events, 0 overlaps ->", OUT)
