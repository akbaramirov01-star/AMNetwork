# "What would you do?" short builder.  usage: build.py cfg1.json
# Segment kinds: "vo" (insert clip + recorded voice-over), "dlg" (native lip-synced dialogue clip, refuses
# recorded-audio overlay), "freeze" (last frame of the previous segment + A/B card, built in code).
import os, sys, json, re, subprocess, difflib
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D0 = os.path.dirname(os.path.abspath(__file__)); os.chdir(D0)
W, H, FPS, SR = 720, 1280, 30, 48000
FB = "fonts/Montserrat-900.ttf"; FM = "fonts/Montserrat-800.ttf"
CFG = json.load(open(sys.argv[1])); E = json.load(open("expect.json")); TAG = CFG["tag"]
os.makedirs(f"seg/{TAG}", exist_ok=True); S = f"seg/{TAG}"
def sh(c):
    r = subprocess.run(c, shell=True, capture_output=True, text=True)
    if r.returncode: raise SystemExit(c[:300] + "\n" + r.stderr[-1500:])
    return r.stdout
def dur(f): return float(sh(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {f}"))
def norm(s): return re.sub(r"[^a-z ]", "", s.lower().replace("-", " ")).split()
def lufs(f, a=None, d=None):
    t = (f"-ss {a} " if a is not None else "") + (f"-t {d} " if d else "")
    o = subprocess.run(f"ffmpeg -nostats {t}-i {f} -vn -af ebur128 -f null -", shell=True, capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", o); v = float(m[-1]) if m else -70.0
    return v if v > -69 else -40.0
def gain(f, a=None, d=None, target=-18.0): return max(-30, min(30, target - lufs(f, a, d)))
def pcm(f):
    b = subprocess.run(f"ffmpeg -v error -i {f} -vn -ac 1 -ar 16000 -f s16le -", shell=True, capture_output=True).stdout
    return np.frombuffer(b, np.int16).astype(np.float32) / 32768
WM = None
def words(f):
    global WM
    if WM is None:
        from faster_whisper import WhisperModel
        WM = WhisperModel("medium.en", compute_type="int8")
    s, _ = WM.transcribe(pcm(f), beam_size=5, word_timestamps=True, initial_prompt="Allah, Yusuf, sallallahu alayhi wa sallam.")
    return [(w.word.strip(), float(w.start), float(w.end)) for z in s for w in z.words]
def font(p, s): return ImageFont.truetype(p, s)
def centered(d, y, txt, f, fill, box=None, pad=16):
    w = d.textlength(txt, font=f); x = (W - w) / 2
    if box: d.rounded_rectangle([x - pad, y - 10, x + w + pad, y + f.size + 16], 16, fill=box)
    d.text((x, y), txt, font=f, fill=fill); return w
def fit(d, lines, path, start, minimum=34, margin=80):
    sz = start
    while sz > minimum and max(d.textlength(l, font=font(path, sz)) for l in lines) > W - margin: sz -= 2
    return font(path, sz)
def ov_hook(p, text):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); lines = text.split("\n"); f = fit(d, lines, FB, 76); y = 160
    for ln in lines: centered(d, y, ln, f, (255, 214, 60, 255), (0, 0, 0, 215), 18); y += f.size + 30
    im.save(p)
def ov_plate(p, text):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); centered(d, 1130, text, font(FM, 28), (236, 200, 110, 255), (0, 0, 0, 180)); im.save(p)
def ov_stamp(p, text, sub):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    centered(d, 170, text, font(FB, 84), (255, 214, 60, 255), (0, 0, 0, 220), 26)
    if sub: centered(d, 300, sub, fit(d, [sub], FM, 30, 20), (245, 245, 238, 255), (0, 0, 0, 190))
    centered(d, 1210, "Not a fatwa · AI-animated", font(FM, 20), (200, 200, 195, 255)); im.save(p)
def ov_chat(p, who, text):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = font(FM, 30); fn = font(FB, 26)
    lines, cur = [], ""
    for wd in text.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) > 470: lines.append(cur); cur = wd
        else: cur = t
    lines.append(cur); bh = 64 + len(lines) * 40; x0, y0 = 90, 560
    d.rounded_rectangle([x0, y0, x0 + 540, y0 + bh], 28, fill=(255, 255, 255, 245), outline=(210, 210, 210, 255), width=2)
    d.text((x0 + 30, y0 + 18), who, font=fn, fill=(40, 120, 220, 255))
    for i, ln in enumerate(lines): d.text((x0 + 30, y0 + 54 + i * 40), ln, font=f, fill=(25, 25, 25, 255))
    im.save(p)
def freeze_png(src_frame, p, fz):
    bg = Image.open(src_frame).convert("RGB").resize((W, H)).filter(ImageFilter.GaussianBlur(6))
    bg = Image.blend(bg, Image.new("RGB", (W, H), (0, 0, 0)), 0.55); d = ImageDraw.Draw(bg)
    centered(d, 250, "WHAT WOULD", font(FB, 70), (255, 214, 60)); centered(d, 335, "YOU DO?", font(FB, 70), (255, 214, 60))
    y = 520
    for lab, txt, col in (("A", fz["a"], (220, 90, 80)), ("B", fz["b"], (70, 160, 110))):
        f = fit(d, [txt], FM, 36, 24, 230)
        d.rounded_rectangle([60, y, W - 60, y + 130], 24, fill=(250, 248, 240))
        d.ellipse([85, y + 25, 165, y + 105], fill=col); centered_x = 125 - d.textlength(lab, font=font(FB, 48)) / 2
        d.text((centered_x, y + 34), lab, font=font(FB, 48), fill=(255, 255, 255)); d.text((190, y + 65 - f.size // 2 - 4), txt, font=f, fill=(25, 25, 25))
        y += 160
    centered(d, 880, "Write A or B in the comments", font(FM, 32), (245, 245, 238))
    centered(d, 1210, "Not a fatwa · AI-animated", font(FM, 20), (200, 200, 195)); bg.save(p)
log = []; segs = []; prev_v = None
for i, sg in enumerate(CFG["segs"]):
    k = sg["k"]; kind = sg["kind"]; pre = 0.0; slow = 1.0; vstart = 0.0; ovs = []
    if kind == "freeze":
        sh(f"ffmpeg -v error -y -sseof -0.1 -i {prev_v} -frames:v 1 -update 1 {S}/last.png"); freeze_png(f"{S}/last.png", f"{S}/fz.png", sg)
        segdur = sg["dur"]; n = round(segdur * FPS)
        sh(f"ffmpeg -v error -y -loop 1 -i {S}/fz.png -frames:v {n} -vf fps={FPS},format=yuv420p -c:v libx264 -preset veryfast -crf 15 {S}/v{k}.mp4")
        sh(f"ffmpeg -v error -y -f lavfi -i \"sine=f=880:d=0.12\" -af volume=-22dB,apad -t {segdur} -ar {SR} -ac 2 {S}/a{k}.wav")
        segs.append(dict(k=k, dur=segdur)); prev_v = f"{S}/v{k}.mp4"; print(k, segdur, flush=True); continue
    c = f"clips/c{k}.mp4"; Dc = dur(c)
    if kind == "dlg":
        nw = words(c)
        if "cut" in sg: nw = nw[:sg["cut"]]
        na, nb = nw[0][1], nw[-1][2]
        ratio = difflib.SequenceMatcher(None, norm(" ".join(w[0] for w in nw)), norm(E[k])).ratio()
        if ratio < 0.9: raise SystemExit(f"LIPSYNC: clip {k} ratio {ratio:.2f} -> regenerate | {' '.join(w[0] for w in nw)}")
        head = max(0.0, na - 0.3); tail = min(Dc, nb + sg.get("tail", 0.45)); vstart = head
        segdur = round((tail - head) * FPS) / FPS
        sh(f"ffmpeg -v error -y -ss {head} -t {tail-head} -i {c} -vn -af aresample={SR},volume={gain(c, na, nb-na):.2f}dB,apad -t {segdur} -ac 2 {S}/a{k}.wav")
        log.append((k, round(ratio, 2)))
    else:  # vo
        rec = f"t/r{k}.wav"; L = dur(rec); st = sg.get("st", 0.3)
        need = max(st + L + 0.4, sg.get("min", 3.0))
        if need > Dc: slow = min(1.35, need / Dc)
        segdur = round(min(Dc * slow, need) * FPS) / FPS
        amb = f"[1:a]aresample={SR},volume={gain(c, 0, min(Dc, segdur), -26):.2f}dB" + (f",atempo={1/slow:.4f}" if slow > 1 else "") + "[b]"
        sh(f"ffmpeg -v error -y -i {rec} -i {c} -filter_complex \"[0:a]aresample={SR},volume={gain(rec):.2f}dB,adelay={int(st*1000)}:all=1,apad[v];{amb};[v][b]amix=inputs=2:normalize=0:duration=first,atrim=0:{segdur}[o]\" -map '[o]' -ac 2 {S}/a{k}.wav")
    n = round(segdur * FPS)
    vf = (f"setpts={slow:.4f}*PTS," if slow > 1 else "") + f"scale={W}:{H}:flags=lanczos,fps={FPS}"
    if "hook" in sg: ov_hook(f"{S}/o{k}h.png", sg["hook"][2]); ovs.append((f"{S}/o{k}h.png", sg["hook"][0], sg["hook"][1]))
    if "chat" in sg: ov_chat(f"{S}/o{k}c.png", sg["chat"][2], sg["chat"][3]); ovs.append((f"{S}/o{k}c.png", sg["chat"][0], sg["chat"][1]))
    if "plate" in sg: ov_plate(f"{S}/o{k}p.png", sg["plate"]); ovs.append((f"{S}/o{k}p.png", 0.2, segdur))
    if "stamp" in sg: ov_stamp(f"{S}/o{k}s.png", sg["stamp"][1], sg["stamp"][2]); ovs.append((f"{S}/o{k}s.png", max(0, segdur - sg["stamp"][0]), segdur))
    ins = "".join(f" -loop 1 -t {segdur} -i {p}" for p, _, _ in ovs); fc = f"[0:v]{vf}[b0]"; last = "[b0]"
    for j, (p, a, b) in enumerate(ovs, 1):
        fc += f";{last}[{j}:v]overlay=0:0:enable='between(t,{a},{b})'[b{j}]"; last = f"[b{j}]"
    fc += f";{last}format=yuv420p[v]"
    sh(f"ffmpeg -v error -y -ss {vstart} -i {c}{ins} -filter_complex \"{fc}\" -map '[v]' -frames:v {n} -an -c:v libx264 -preset veryfast -crf 15 {S}/v{k}.mp4")
    segs.append(dict(k=k, dur=segdur, slow=round(slow, 3))); prev_v = f"{S}/v{k}.mp4"; print(k, segdur, flush=True)
# hard cuts (fast pace, clean loop); concat
with open(f"{S}/list.txt", "w") as fl:
    for g in segs: fl.write(f"file 'v{g['k']}.mp4'\n")
acc = 0.0
for g in segs: g["start"] = round(acc, 3); acc += g["dur"]
ain = " ".join(f"-i {S}/a{g['k']}.wav" for g in segs)
sh(f"ffmpeg -v error -y -f concat -safe 0 -i {S}/list.txt -c copy {S}/v.mp4")
sh(f"ffmpeg -v error -y {ain} -filter_complex \"concat=n={len(segs)}:v=0:a=1[a]\" -map '[a]' -c:a pcm_s16le {S}/a.wav")
sh(f"ffmpeg -v error -y -i {S}/v.mp4 -i {S}/a.wav -c:v copy -c:a pcm_s16le -shortest {S}/raw.mov")
g = -16.0 - lufs(f"{S}/raw.mov")
sp = CFG.get("speed", 1.0)
sh(f"ffmpeg -v error -y -i {S}/raw.mov -vf setpts=PTS/{sp},fps={FPS} -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -af atempo={sp},volume={g:.2f}dB,alimiter=limit=0.95 -c:a aac -b:a 192k -movflags +faststart {CFG['out']}")
for g2 in segs: g2["start"] = round(g2["start"] / sp, 3); g2["dur"] = round(g2["dur"] / sp, 3)
json.dump(segs, open(f"{S}/segs.json", "w")); print("OK", round(dur(CFG['out']), 1), log)
