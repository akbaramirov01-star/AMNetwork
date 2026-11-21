# Transcribe files and compare with expected lines. usage: tr.py <expect-key>=<file> ...
import sys, subprocess, json, re, difflib, os
import numpy as np
from faster_whisper import WhisperModel
os.chdir(os.path.dirname(os.path.abspath(__file__)))
E = json.load(open("expect.json"))
m = WhisperModel("medium.en", compute_type="int8")
def norm(s): return re.sub(r"[^a-z ]", "", s.lower().replace("-", " ")).split()
for a in sys.argv[1:]:
    k, f = a.split("=")
    b = subprocess.run(f"ffmpeg -v error -i {f} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout
    x = np.frombuffer(b, np.int16).astype(float) / 32768; fr = x[:len(x)//320*320].reshape(-1, 320)
    db = 20*np.log10(np.sqrt((fr**2).mean(1))+1e-9); on = np.where(db > -38)[0]
    s, _ = m.transcribe(x.astype(np.float32), beam_size=5, initial_prompt="Allah, Yusuf, sallallahu alayhi wa sallam.")
    t = " ".join(z.text.strip() for z in s)
    r = difflib.SequenceMatcher(None, norm(t), norm(E[k])).ratio()
    span = (on[-1]-on[0])*.02+.02 if len(on) else 0
    print(k, f, "span %.2f" % span, "%.2f" % r, "OK" if r >= 0.9 else "BAD", "|", t, flush=True)
