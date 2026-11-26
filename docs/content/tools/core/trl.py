# strict check with whisper large-v3, NO prompt; flags repeated words
import sys, json, re, difflib, subprocess, numpy as np
from faster_whisper import WhisperModel
E=json.load(open("expect.json")); m=WhisperModel("large-v3",compute_type="int8")
def norm(s): return re.sub(r"[^a-z0-9 ]"," ",s.lower().replace("-"," ")).split()
for a in sys.argv[1:]:
    k,f=a.split("=")
    b=subprocess.run(f"ffmpeg -v error -i {f} -vn -ac 1 -ar 16000 -f s16le -",shell=True,capture_output=True).stdout
    x=np.frombuffer(b,np.int16).astype(np.float32)/32768; s,_=m.transcribe(x,beam_size=5); t=" ".join(z.text.strip() for z in s)
    w=norm(t); rep=[w[i] for i in range(1,len(w)) if w[i]==w[i-1]]
    r=difflib.SequenceMatcher(None,[x.replace("40","forty").replace("10","ten") for x in w],norm(E[k])).ratio()
    print(k,round(len(x)/16000,1),f"{r:.2f}","REPEAT:"+",".join(rep) if rep else "","OK" if r>=0.9 and not rep else "BAD","|",t,flush=True)
