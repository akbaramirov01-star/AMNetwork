# Unbranded phone lock screen, notification cards appear one by one; audio = phone buzzes only (no speech from BG).
# usage: calls2.py BG.mp4 OUT.mp4 DUR "HH:MM" cards.json   cards.json = [[t, who, text, "red"|"white"|"play"], ...]
import sys, subprocess, json
from PIL import Image, ImageDraw, ImageFont
BG, OUT, DUR, CLOCK, CJ = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4], sys.argv[5]
D = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad"; U = D + "/ui"
F8, F9 = D + "/sg/fonts/Montserrat-800.ttf", D + "/sg/fonts/Montserrat-900.ttf"
W, H = 720, 1280; SX, SY, SW, SH = 118, 134, 484, 1032
f80, f24, f20 = ImageFont.truetype(F9, 96), ImageFont.truetype(F8, 24), ImageFont.truetype(F8, 19)
C = json.load(open(CJ))
base = Image.new("RGB", (SW, SH)); d = ImageDraw.Draw(base)
for y in range(SH): d.line([0, y, SW, y], fill=(int(18 + 20 * y / SH), int(22 + 10 * y / SH), int(40 + 20 * y / SH)))
d.text((SW / 2, 150), CLOCK, font=f80, fill=(240, 240, 245), anchor="mm")
def card(i, img):
    _, who, txt, kind = C[i]; y = 290 + i * 118; dd = ImageDraw.Draw(img)
    dd.rounded_rectangle([20, y, SW - 20, y + 104], 26, fill=(58, 62, 80))
    dd.ellipse([36, y + 26, 88, y + 78], fill=(230, 184, 74)); dd.text((62, y + 52), who[0], font=f24, fill=(30, 30, 40), anchor="mm")
    dd.text((104, y + 22), who, font=f24, fill=(255, 255, 255)); dd.text((SW - 40, y + 26), "now", font=f20, fill=(170, 170, 185), anchor="ra")
    col = {"red": (235, 95, 85), "white": (245, 245, 240), "play": (230, 200, 120)}[kind]
    x0 = 104
    if kind == "play": dd.polygon([(104, y + 60), (104, y + 78), (120, y + 69)], fill=col); x0 = 130
    dd.text((x0, y + 58), txt, font=f20, fill=col)
paths = []
for k in range(len(C) + 1):
    im = base.copy()
    for i in range(k): card(i, im)
    p = OUT + f".lk{k}.png"; im.save(p); paths.append(p)
T = [0] + [c[0] for c in C]
ins = f"-i {BG} " + " ".join(f"-loop 1 -t {DUR} -i {p}" for p in paths) + f" -loop 1 -t {DUR} -i {U}/frame.png"
fc = f"[0:v]scale={W}:{H},boxblur=18:2,eq=brightness=-0.15,trim=0:{DUR},setpts=PTS-STARTPTS[bg];"; last = "[bg]"
for i in range(len(paths)):
    t1 = T[i + 1] if i + 1 < len(T) else DUR + 1
    fc += f"{last}[{i+1}:v]overlay=x={SX}:y={SY}:enable='between(t,{T[i]},{t1})'[s{i}];"; last = f"[s{i}]"
fc += f"{last}[{len(paths)+1}:v]overlay=0:0,format=yuv420p[v]"
# buzz: 160 Hz pulses at each card time
bz = "+".join(f"between(t,{c[0]},{c[0]+0.35})" for c in C)
fc += f";anoisesrc=d={DUR}:c=pink:r=48000:a=0.004[n];aevalsrc='0.25*sin(2*PI*160*t)*({bz})':d={DUR}:s=48000[b];[n][b]amix=inputs=2:normalize=0[a]"
r = subprocess.run(f"ffmpeg -v error -y {ins} -filter_complex \"{fc}\" -map '[v]' -map '[a]' -t {DUR} -c:v libx264 -preset veryfast -crf 16 -c:a aac {OUT}", shell=True, capture_output=True, text=True)
if r.returncode: raise SystemExit(r.stderr[-1500:])
print("CALLS2", OUT)
