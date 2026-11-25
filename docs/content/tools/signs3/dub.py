# dub.py CLEAN.wav TAKE.mp4 OUT.mp4 : lay a clean line over a take, time-warped phrase by phrase to the take's word timings
import sys, json, subprocess, difflib, re, numpy as np
from faster_whisper import WhisperModel
A, V, OUT = sys.argv[1:4]; m = WhisperModel("large-v3", compute_type="int8")
def words(f):
    b = subprocess.run(f"ffmpeg -v error -i {f} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout
    x = np.frombuffer(b, np.int16).astype(np.float32) / 32768; s, _ = m.transcribe(x, beam_size=5, word_timestamps=True)
    return [(re.sub(r"[^a-z0-9]", "", w.word.lower()), float(w.start), float(w.end)) for z in list(s) for w in z.words]
wa, wv = words(A), words(V)
sm = difflib.SequenceMatcher(None, [w[0] for w in wa], [w[0] for w in wv])
pairs = [(wa[b.a + i][1], wv[b.b + i][1]) for b in sm.get_matching_blocks() for i in range(b.size)]
pa, pv = [pairs[0][0]], [pairs[0][1]]
for a, v in pairs[1:]:
    if a - pa[-1] > 0.6 and v - pv[-1] > 0.6: pa.append(a); pv.append(v)
pa.append(wa[-1][2]); pv.append(wv[-1][2])
fc = []
for k in range(len(pa) - 1):
    r = max(0.6, min(1.7, (pa[k+1] - pa[k]) / (pv[k+1] - pv[k])))
    fc.append(f"[0:a]atrim={pa[k]}:{pa[k+1]},asetpts=PTS-STARTPTS,atempo={r:.4f}[p{k}]")
n = len(fc); fc = ";".join(fc) + f";[0:a]atrim={pa[-1]},asetpts=PTS-STARTPTS[pt];" + "".join(f"[p{k}]" for k in range(n)) + f"[pt]concat=n={n+1}:v=0:a=1,adelay={int(max(0,pv[0]-pa[0])*1000)}:all=1[d]"
subprocess.run(f"ffmpeg -v error -y -i {A} -filter_complex \"{fc}\" -map '[d]' -ar 48000 -ac 1 _dub.wav", shell=True, check=True)
subprocess.run(f"ffmpeg -v error -y -i {V} -i _dub.wav -filter_complex \"[0:a]aresample=48000,lowpass=f=180,volume=0.5[amb];[1:a]aresample=48000[v];[v][amb]amix=inputs=2:normalize=0:duration=longest[a]\" -map 0:v -map '[a]' -c:v copy -c:a aac -b:a 192k -shortest {OUT}", shell=True, check=True)
print("DUB", OUT, len(pa) - 1, "segments")
