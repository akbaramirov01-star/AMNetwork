# Unbranded phone showing REAL AM Network screens that switch in sync with narration (highlighted ayah), plus a bottom
# "now playing" bar with a moving progress line. usage: phone2.py BG.mp4 OUT.mp4 DUR "bar label" "player title" t0:img0 t1:img1 ...
import sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
BG, OUT, DUR, LABEL, TITLE = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4], sys.argv[5]
SCR = [(float(a.split(":", 1)[0]), a.split(":", 1)[1]) for a in sys.argv[6:]]
U = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/ui"
F = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/sg/fonts/Montserrat-800.ttf"
W, H = 720, 1280; PX, PY, PW, PH, R, BZ = 104, 120, 512, 1060, 64, 14
SX, SY, SW, SH = PX + BZ, PY + BZ, PW - 2 * BZ, PH - 2 * BZ; BAR, PL = 74, 132
# phone body with transparent screen hole
fr = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle([PX + 10, PY + 24, PX + PW + 10, PY + PH + 24], R, fill=(0, 0, 0, 150))
fr.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18))); d = ImageDraw.Draw(fr)
d.rounded_rectangle([PX, PY, PX + PW, PY + PH], R, fill=(18, 18, 20, 255), outline=(70, 70, 76, 255), width=3)
hole = Image.new("L", (W, H), 0); ImageDraw.Draw(hole).rounded_rectangle([SX, SY, SX + SW, SY + SH], R - 12, fill=255)
fr.putalpha(Image.fromarray(np.minimum(np.array(fr.getchannel("A")), 255 - np.array(hole))))
ImageDraw.Draw(fr).rounded_rectangle([W // 2 - 60, SY + 14, W // 2 + 60, SY + 40], 13, fill=(0, 0, 0, 255))
fr.save(f"{U}/frame.png")
# each screen = top bar + page screenshot (scaled to screen width) + player panel at the bottom
f22, f20, f26 = ImageFont.truetype(F, 22), ImageFont.truetype(F, 20), ImageFont.truetype(F, 26)
def screen(img, path):
    off = 0
    if "@" in img: img, off = img.split("@"); off = int(off)
    st = Image.open(img).convert("RGB"); st = st.resize((SW, int(st.height * SW / st.width)))
    s = Image.new("RGB", (SW, SH), (12, 22, 19)); s.paste(st.crop((0, off, SW, off + SH - BAR)), (0, BAR)); d = ImageDraw.Draw(s)
    d.rectangle([0, 0, SW, BAR], fill=(16, 28, 24)); w = d.textlength(LABEL, font=f22)
    d.rounded_rectangle([(SW - w) / 2 - 18, 40, (SW + w) / 2 + 18, 70], 15, fill=(36, 52, 46)); d.text(((SW - w) / 2, 43), LABEL, font=f22, fill=(230, 200, 120))
    y0 = SH - PL; d.rectangle([0, y0, SW, SH], fill=(20, 34, 29)); d.line([0, y0, SW, y0], fill=(60, 80, 70), width=2)
    d.ellipse([24, y0 + 22, 80, y0 + 78], fill=(230, 184, 74)); d.rectangle([43, y0 + 38, 49, y0 + 62], fill=(20, 34, 29)); d.rectangle([55, y0 + 38, 61, y0 + 62], fill=(20, 34, 29))  # pause icon = playing
    d.text((100, y0 + 26), TITLE, font=f26, fill=(245, 245, 238)); d.text((100, y0 + 60), "Playing · AM Network Quran", font=f20, fill=(170, 190, 180))
    s.save(path)
names = []
for i, (t, img) in enumerate(SCR): screen(img, f"{U}/scr{i}.png"); names.append((t, f"{U}/scr{i}.png"))
# progress line inside the player panel: crop window slides over a [gold | grey] image
L = SW - 48; pb = Image.new("RGB", (2 * L, 6), (80, 100, 90)); ImageDraw.Draw(pb).rectangle([0, 0, L, 6], fill=(230, 184, 74)); pb.save(f"{U}/pb.png")
ins = f"-i {BG} " + " ".join(f"-loop 1 -t {DUR} -i {p}" for _, p in names) + f" -loop 1 -t {DUR} -i {U}/pb.png -loop 1 -t {DUR} -i {U}/frame.png"
n = len(names); slide = 0.7; yexp = f"max(0\\,(1-t/{slide}))*{H}"
fc = f"[0:v]scale={W}:{H},boxblur=18:2,eq=brightness=-0.12,trim=0:{DUR},setpts=PTS-STARTPTS[bg];"
last = "[bg]"
for i, (t, _) in enumerate(names):
    t1 = names[i + 1][0] if i + 1 < n else DUR + 1
    fc += f"{last}[{i+1}:v]overlay=x={SX}:y='{SY}+{yexp}':enable='between(t,{t},{t1})'[s{i}];"; last = f"[s{i}]"
fc += f"[{n+1}:v]crop={L}:6:'{L}-{L}*min(1\\,t/{DUR})':0[pbc];{last}[pbc]overlay=x={SX+24}:y='{SY+SH-PL+100}+{yexp}'[p];"
fc += f"[p][{n+2}:v]overlay=x=0:y='{yexp}',format=yuv420p[v]"
r = subprocess.run(f"ffmpeg -v error -y {ins} -filter_complex \"{fc}\" -map '[v]' -map 0:a? -t {DUR} -c:v libx264 -preset veryfast -crf 16 -c:a aac {OUT}", shell=True, capture_output=True, text=True)
if r.returncode: raise SystemExit(r.stderr[-1500:])
print("PHONE2", OUT, DUR)
