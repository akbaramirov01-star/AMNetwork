# Strict dialogue check: unprompted (only "Allah." hint) word-level transcript, ratio vs expected,
# flags adjacent repeated words and low-confidence words.  usage: chk.py 13 15 ...
import sys, subprocess, json, re, difflib, os
import numpy as np
from faster_whisper import WhisperModel
os.chdir(os.path.dirname(os.path.abspath(__file__)))
E = json.load(open("expect.json")); m = WhisperModel("medium.en", compute_type="int8")
def norm(s): return re.sub(r"[^a-z ]", "", s.lower().replace("-", " ")).split()
for k in sys.argv[1:]:
    x = np.frombuffer(subprocess.run(f"ffmpeg -v error -i clips/c{k}.mp4 -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout, np.int16).astype(np.float32) / 32768
    s, _ = m.transcribe(x, beam_size=5, word_timestamps=True, initial_prompt="Allah.")
    ws = [(w.word.strip(), w.probability) for z in s for w in z.words]
    t = " ".join(w for w, _ in ws); n = norm(t)
    r = difflib.SequenceMatcher(None, n, norm(E[k])).ratio()
    rep = [n[i] for i in range(1, len(n)) if n[i] == n[i-1] and n[i] not in norm(E[k])[1:] ]
    low = [w for w, p in ws if p < 0.5]
    ok = r >= 0.97 and not rep and not low
    print(k, "%.2f" % r, "OK" if ok else "CHECK", "rep=%s low=%s" % (rep, low), "|", t, flush=True)
