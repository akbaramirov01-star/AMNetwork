# Whole-file QA: per-segment transcript vs expected, loudness, freezes.  usage: qa.py OUT.mp4 "initial prompt"
import json, re, difflib, subprocess, sys, os
import numpy as np
from faster_whisper import WhisperModel
os.chdir(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; IP = sys.argv[2] if len(sys.argv) > 2 else "Allah."
E = json.load(open("expect.json")); S = json.load(open("segs.json"))
def norm(s): return re.sub(r"\bdu a\b", "dua", re.sub(r"[^a-z ]", "", re.sub(r"sall?all?ahu\W*ala[iy]hi\W*wa\W*sall?am", "saw", s.lower()).replace("-", " ").replace("'", ""))).split()
m = WhisperModel("medium.en", compute_type="int8")
x = np.frombuffer(subprocess.run(f"ffmpeg -v error -i {OUT} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout, np.int16).astype(np.float32) / 32768
bad = 0
for g in S:
    k = g["k"]
    if k not in E: continue
    a, b = g["start"], g["start"] + g["dur"]
    s, _ = m.transcribe(x[int(a*16000):int(b*16000)], beam_size=5, initial_prompt=IP); t = " ".join(z.text.strip() for z in s)
    r = difflib.SequenceMatcher(None, norm(t), norm(E[k])).ratio(); bad += r < 0.9
    print(k, "%.1f" % a, "%.2f" % r, "OK" if r >= 0.9 else "CHECK", "|", t, flush=True)
o = subprocess.run(f"ffmpeg -nostats -i {OUT} -af ebur128 -f null - 2>&1 | grep -E '^\\s+I:' | tail -1; ffmpeg -nostats -i {OUT} -vf freezedetect=n=0.003:d=0.8 -an -f null - 2>&1 | grep -o 'freeze_start: [0-9.]*'", shell=True, capture_output=True, text=True).stdout
print(o.strip()); print("QA", "PASS" if not bad else f"{bad} CHECK")
