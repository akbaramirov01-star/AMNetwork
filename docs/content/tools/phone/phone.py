# Composite a real AM Network screen (tall screenshot) into a generic, unbranded phone over a blurred background clip.
# usage: phone.py BG.mp4 STRIP.png OUT.mp4 "bar label" [pan_px]
import sys, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
BG, STRIP, OUT, LABEL = sys.argv[1:5]; PAN = int(sys.argv[5]) if len(sys.argv) > 5 else 90
W, H = 720, 1280; PX, PY, PW, PH, R, BZ = 104, 120, 512, 1060, 64, 14
SX, SY, SW, SH = PX + BZ, PY + BZ, PW - 2 * BZ, PH - 2 * BZ; BAR = 74
F = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/sg/fonts/Montserrat-800.ttf"
dur = float(subprocess.run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {BG}", shell=True, capture_output=True, text=True).stdout)
# frame: drop shadow + black body + screen hole (transparent) + top bar drawn on the screen layer
fr = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle([PX + 10, PY + 24, PX + PW + 10, PY + PH + 24], R, fill=(0, 0, 0, 150))
fr.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18))); d = ImageDraw.Draw(fr)
d.rounded_rectangle([PX, PY, PX + PW, PY + PH], R, fill=(18, 18, 20, 255), outline=(70, 70, 76, 255), width=3)
hole = Image.new("L", (W, H), 0); ImageDraw.Draw(hole).rounded_rectangle([SX, SY, SX + SW, SY + SH], R - 12, fill=255)
fr.putalpha(Image.fromarray(__import__("numpy").minimum(__import__("numpy").array(fr.getchannel("A")), 255 - __import__("numpy").array(hole))))
d = ImageDraw.Draw(fr); d.rounded_rectangle([W // 2 - 60, SY + 14, W // 2 + 60, SY + 40], 13, fill=(0, 0, 0, 255))  # camera pill
fr.save("/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/ui/frame.png")
# screen content: top bar + strip scaled to screen width
st = Image.open(STRIP).convert("RGB"); sc = SW / st.width; st = st.resize((SW, int(st.height * sc)))
bar = Image.new("RGB", (SW, BAR), (16, 28, 24)); bd = ImageDraw.Draw(bar); f = ImageFont.truetype(F, 22)
w = bd.textlength(LABEL, font=f); bd.rounded_rectangle([(SW - w) / 2 - 18, 40, (SW + w) / 2 + 18, 70], 15, fill=(36, 52, 46)); bd.text(((SW - w) / 2, 43), LABEL, font=f, fill=(230, 200, 120))
tall = Image.new("RGB", (SW, BAR + st.height), (0, 0, 0)); tall.paste(st, (0, BAR)); tall.save("/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/ui/tall.png")
barimg = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/ui/bar.png"; bar.save(barimg)
U = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad/ui"
pan = min(PAN, st.height - (SH - BAR)); slide = 0.7
fc = (f"[0:v]scale={W}:{H},boxblur=18:2,eq=brightness=-0.12[bg];"
      f"[1:v]crop={SW}:{SH - BAR}:0:'{BAR}+min({pan},max(0,(t-1.2))*{pan}/{max(1.0, dur - 2.2)})'[scr];"
      f"[scr][2:v]vstack[scr2];"
      f"[bg][scr2]overlay=x={SX}:y='{SY}+max(0,(1-t/{slide}))*{H}'[a];"
      f"[a][3:v]overlay=x=0:y='max(0,(1-t/{slide}))*{H}',format=yuv420p[v]")
# vstack puts bar under content; build screen = bar on top instead
fc = fc.replace("[scr][2:v]vstack[scr2]", "[2:v][scr]vstack[scr2]")
cmd = (f"ffmpeg -v error -y -i {BG} -loop 1 -t {dur} -i {U}/tall.png -loop 1 -t {dur} -i {barimg} -loop 1 -t {dur} -i {U}/frame.png "
       f"-filter_complex \"{fc}\" -map '[v]' -map 0:a? -t {dur} -c:v libx264 -preset veryfast -crf 16 -c:a aac {OUT}")
r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
if r.returncode: raise SystemExit(r.stderr[-1500:])
print("PHONE", OUT, round(dur, 2))
