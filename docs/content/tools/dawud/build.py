# Prophet-episode builder (port of the Musa 5 build.py to the Claude Code container).
# Kinds: dialog (native lip-sync only; refuses recorded overlay), estab (ambient), narration (scene + recorded VO).
# Extra: "arabic" overlay {k: [arabic, translation]} drawn with Amiri + raqm (static, no recitation audio).
import os, sys, json, re, subprocess, difflib
import numpy as np
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS, SR = 720, 1280, 30, 48000
F = "fonts/Montserrat-800.ttf"; FA = "fonts/Amiri-700.ttf"
CFG = json.load(open(os.environ.get("CFG","cfg.json")))
ORDER = CFG["order"]; DIALOG = set(CFG["dialog"]); ESTAB = set(CFG["estab"])
FB = set(CFG["fadeblack_into"]); PLATE = CFG["plate"]; HOOK = CFG["hook"]; ST = CFG.get("st", {}); AR = CFG.get("arabic", {})
CUT = CFG.get("cut", {})
E = json.load(open("expect.json"))
def sh(c):
    r = subprocess.run(c, shell=True, capture_output=True, text=True)
    if r.returncode: raise SystemExit(c[:300] + "\n" + r.stderr[-1500:])
    return r.stdout
def dur(f): return float(sh(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {f}"))
def norm(s): return re.sub(r"[^a-z ]", "", re.sub(r"sall?all?ahu\W*ala[iy]hi\W*wa\W*sall?am", "saw", s.lower()).replace("-", " ")).split()
def lufs(f, a=None, d=None):
    t = (f"-ss {a} " if a is not None else "") + (f"-t {d} " if d else "")
    o = subprocess.run(f"ffmpeg -nostats {t}-i {f} -vn -af ebur128 -f null -", shell=True, capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", o); v = float(m[-1]) if m else -70.0
    return v if v > -69 else -40.0
def gain(f, a=None, d=None, target=-18.0): return max(-30, min(30, target - lufs(f, a, d)))
def pcm(f):
    b = subprocess.run(f"ffmpeg -v error -i {f} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout
    return np.frombuffer(b, np.int16).astype(np.float32) / 32768
def energy(f):
    x = pcm(f); fr = x[:len(x)//320*320].reshape(-1, 320)
    on = np.where(20*np.log10(np.sqrt((fr**2).mean(1))+1e-9) > -38)[0]
    return (on[0]*0.02, on[-1]*0.02+0.02) if len(on) else None
W_ = None
def words(f):
    global W_
    if W_ is None:
        from faster_whisper import WhisperModel
        W_ = WhisperModel("medium.en", compute_type="int8")
    s, _ = W_.transcribe(pcm(f), beam_size=5, word_timestamps=True, initial_prompt="Allah, Dawud, Talut, Jalut.")
    return [(w.word.strip(), float(w.start), float(w.end)) for z in s for w in z.words]
def overlay_png(path, kind, text):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if kind == "hook":
        lines = text.split("\n"); sz = 74
        while sz > 40 and max(d.textlength(l, font=ImageFont.truetype(F, sz)) for l in lines) > W - 80: sz -= 2
        f = ImageFont.truetype(F, sz); y = 170
        for ln in lines:
            w = d.textlength(ln, font=f); x = (W - w) / 2
            d.rectangle([x - 18, y - 8, x + w + 18, y + sz + 16], fill=(0, 0, 0, 215)); d.text((x, y), ln, font=f, fill=(255, 214, 60, 255)); y += sz + 26
    elif kind == "arabic":
        ar, tr = text; fa = ImageFont.truetype(FA, 64, layout_engine=ImageFont.Layout.RAQM)
        w = d.textlength(ar, font=fa, direction="rtl", language="ar"); x = (W - w) / 2; y = 300
        d.rounded_rectangle([40, y - 30, W - 40, y + 250], 24, fill=(0, 0, 0, 175))
        d.text((x, y), ar, font=fa, fill=(240, 200, 100, 255), direction="rtl", language="ar")
        ft = ImageFont.truetype(F, 28); lines, cur = [], ""
        for wd in tr.split():
            t = (cur + " " + wd).strip()
            if d.textlength(t, font=ft) > W - 140: lines.append(cur); cur = wd
            else: cur = t
        lines.append(cur); y += 120
        for ln in lines:
            w = d.textlength(ln, font=ft); d.text(((W - w) / 2, y), ln, font=ft, fill=(245, 245, 238, 255)); y += 40
    else:
        f = ImageFont.truetype(F, 26); w = d.textlength(text, font=f); x = (W - w) / 2; y = 1140
        d.rounded_rectangle([x - 16, y - 10, x + w + 16, y + 40], 14, fill=(0, 0, 0, 170)); d.text((x, y), text, font=f, fill=(236, 200, 110, 255))
    im.save(path)
def xin(k): return 0.6 if k in FB else 0.35
os.makedirs("seg", exist_ok=True); log = []; segs = []
for i, k in enumerate(ORDER):
    c = f"clips/c{k}.mp4"; D = dur(c); fi = xin(k) if i else 0.0
    pre = 0.0; slow = 1.0; vstart = 0.0
    if k in DIALOG:
        nw = words(c)
        if k in CUT: nw = nw[:CUT[k]]
        na, nb = nw[0][1], nw[-1][2]; sp = energy(c)
        if sp and na < 0.12: na = sp[0]
        ratio = difflib.SequenceMatcher(None, norm(" ".join(w[0] for w in nw)), norm(E[k])).ratio()
        head = max(0.0, na - 0.4); tail = min(D, nb + 0.65); vstart = head
        pre = round(max(0.0, fi + 0.15 - (na - head)) * FPS) / FPS
        segdur = round((tail - head + pre) * FPS) / FPS
        if ratio < 0.9: raise SystemExit(f"LIPSYNC: clip {k} transcript ratio {ratio:.2f} < 0.9 -> regenerate the clip")
        sh(f"ffmpeg -v error -y -ss {head} -t {tail-head} -i {c} -vn -af aresample={SR},volume={gain(c, na, nb-na):.2f}dB,adelay={int(pre*1000)}:all=1,apad -t {segdur} -ac 2 seg/a{k}.wav")
        log.append((k, round(ratio, 2)))
    elif k in ESTAB:
        segdur = round(min(D, CFG.get("estab_cap", 4.0)) * FPS) / FPS
        sh(f"ffmpeg -v error -y -i {c} -vn -af aresample={SR},volume={gain(c, 0, segdur, -24):.2f}dB,afade=t=in:d=0.3,apad -t {segdur} -ac 2 seg/a{k}.wav")
    else:
        rec = f"t/r{k}.wav"; L = dur(rec); st = ST.get(k, 0.6)
        need = max(st + L + 0.7, 3.5)
        if k in HOOK: need = max(need, HOOK[k][1] + 0.6)
        if need > D: slow = min(1.35, need / D)
        if need > D * 1.35: raise SystemExit(f"TOO SHORT: clip {k} {D:.1f}s for narration needing {need:.1f}s")
        segdur = round(min(D * slow, need) * FPS) / FPS
        amb = f"[1:a]aresample={SR},volume={gain(c, 0, min(D, segdur), -28):.2f}dB" + (f",atempo={1/slow:.4f}" if slow > 1 else "") + "[b]"
        sh(f"ffmpeg -v error -y -i {rec} -i {c} -filter_complex \"[0:a]aresample={SR},volume={gain(rec):.2f}dB,adelay={int(st*1000)}:all=1,apad[v];{amb};[v][b]amix=inputs=2:normalize=0:duration=first,atrim=0:{segdur}[o]\" -map '[o]' -ac 2 seg/a{k}.wav")
    n = round(segdur * FPS)
    vf = (f"tpad=start_duration={pre}:start_mode=clone," if pre > 0 else "") + (f"setpts={slow:.4f}*PTS," if slow > 1 else "") + f"scale={W}:{H}:flags=lanczos,fps={FPS}"
    ovs = []
    if k in HOOK: overlay_png(f"seg/o{k}h.png", "hook", HOOK[k][2]); ovs.append((f"seg/o{k}h.png", HOOK[k][0], HOOK[k][1]))
    if k in PLATE: overlay_png(f"seg/o{k}p.png", "plate", PLATE[k]); ovs.append((f"seg/o{k}p.png", 0.3, segdur - 0.2))
    if k in AR: overlay_png(f"seg/o{k}a.png", "arabic", AR[k]); ovs.append((f"seg/o{k}a.png", 0.5, segdur - 0.2))
    ins = "".join(f" -loop 1 -t {segdur} -i {p}" for p, _, _ in ovs); fc = f"[0:v]{vf}[b0]"; last = "[b0]"
    for j, (p, a, b) in enumerate(ovs, 1):
        fc += f";{last}[{j}:v]overlay=0:0:enable='between(t,{a},{b})'[b{j}]"; last = f"[b{j}]"
    fc += f";{last}format=yuv420p[v]"
    sh(f"ffmpeg -v error -y -ss {vstart} -i {c}{ins} -filter_complex \"{fc}\" -map '[v]' -frames:v {n} -an -c:v libx264 -preset veryfast -crf 15 seg/v{k}.mp4")
    segs.append(dict(k=k, dur=segdur, pre=pre, slow=round(slow, 3))); print(k, segdur, flush=True)
cd = CFG["card"]; im = Image.new("RGB", (W, H), (8, 22, 40)); d = ImageDraw.Draw(im); y = 300
for txt, sz, col, gap in cd["lines"]:
    f = ImageFont.truetype(F, sz)
    for ln in txt.split("\n"):
        w = d.textlength(ln, font=f); d.text(((W - w) / 2, y), ln, font=f, fill=tuple(col)); y += int(sz * 1.3)
    y += gap
im.save("seg/card.png"); CD = cd["dur"]
sh(f"ffmpeg -v error -y -loop 1 -i seg/card.png -frames:v {round(CD*FPS)} -vf fps={FPS},format=yuv420p -c:v libx264 -preset veryfast -crf 16 seg/vcard.mp4")
sh(f"ffmpeg -v error -y -f lavfi -i anullsrc=r={SR}:cl=stereo -t {CD} seg/acard.wav")
segs.append(dict(k="card", dur=CD)); keys = ORDER + ["card"]
ins = " ".join(f"-i seg/v{k}.mp4" for k in keys) + " " + " ".join(f"-i seg/a{k}.wav" for k in keys)
N = len(keys); fv = []; fa = []; acc = segs[0]["dur"]; lv = "[0:v]"; la = f"[{N}:a]"; segs[0]["start"] = 0.0
for i in range(1, N):
    k = keys[i]; x = 0.5 if k == "card" else xin(k); off = acc - x; tr = "fadeblack" if (k in FB or k == "card") else "fade"
    fv.append(f"{lv}[{i}:v]xfade=transition={tr}:duration={x}:offset={off:.4f}[v{i}]"); fa.append(f"{la}[{N+i}:a]acrossfade=d={x}:c1=tri:c2=tri[a{i}]")
    lv = f"[v{i}]"; la = f"[a{i}]"; segs[i]["start"] = round(off, 3); acc = off + segs[i]["dur"]
sh(f"ffmpeg -v error -y {ins} -filter_complex \"{';'.join(fv + fa)}\" -map '{lv}' -map '{la}' -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a pcm_s16le raw.mov")
g = -16.0 - lufs("raw.mov")
sh(f"ffmpeg -v error -y -i raw.mov -c:v copy -af volume={g:.2f}dB,alimiter=limit=0.95 -c:a aac -b:a 192k -movflags +faststart {CFG['out']}")
json.dump(segs, open("segs.json", "w")); print("OK", round(dur(CFG['out']), 1), log)
