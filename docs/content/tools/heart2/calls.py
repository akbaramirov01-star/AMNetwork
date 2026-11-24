# Lock screen with Mom's missed calls appearing one by one inside the unbranded phone. usage: calls.py BG.mp4 OUT.mp4 DUR
import sys, subprocess
from PIL import Image, ImageDraw, ImageFont
BG, OUT, DUR = sys.argv[1], sys.argv[2], float(sys.argv[3])
D = "/tmp/claude-0/-home-user-AMNetwork/5a54353c-5638-5e28-af38-5ec0d6ccca98/scratchpad"
U, H2 = D + "/ui", D + "/h2"
F8, F9 = D + "/sg/fonts/Montserrat-800.ttf", D + "/sg/fonts/Montserrat-900.ttf"
W, H = 720, 1280; SX, SY, SW, SH = 118, 134, 484, 1032
f80, f24, f22, f20 = ImageFont.truetype(F9, 96), ImageFont.truetype(F8, 24), ImageFont.truetype(F8, 22), ImageFont.truetype(F8, 19)
base = Image.new("RGB", (SW, SH)); d = ImageDraw.Draw(base)
for y in range(SH): d.line([0, y, SW, y], fill=(int(18 + 20 * y / SH), int(22 + 10 * y / SH), int(40 + 20 * y / SH)))
d.text((SW / 2, 150), "18:52", font=f80, fill=(240, 240, 245), anchor="mm"); d.text((SW / 2, 222), "Tuesday", font=f22, fill=(190, 190, 205), anchor="mm")
N = [("Mom", "7 missed calls", (230, 90, 80)), ("Mom", "Where are you? It's dark already.", (245, 245, 240)), ("Mom", "Please just answer. I'm worried.", (245, 245, 240))]
def card(i, img):
    who, txt, col = N[i]; y = 300 + i * 118; dd = ImageDraw.Draw(img)
    dd.rounded_rectangle([20, y, SW - 20, y + 104], 26, fill=(58, 62, 80))
    dd.ellipse([36, y + 26, 88, y + 78], fill=(230, 184, 74)); dd.text((62, y + 52), "M", font=f24, fill=(30, 30, 40), anchor="mm")
    dd.text((104, y + 22), who, font=f24, fill=(255, 255, 255)); dd.text((SW - 40, y + 26), "now", font=f20, fill=(170, 170, 185), anchor="ra")
    dd.text((104, y + 58), txt, font=f20, fill=col)
paths = []
for k in range(len(N) + 1):
    im = base.copy()
    for i in range(k): card(i, im)
    p = f"{H2}/lk{k}.png"; im.save(p); paths.append(p)
T = [0, 0.5, 1.4, 2.4]
ins = f"-i {BG} " + " ".join(f"-loop 1 -t {DUR} -i {p}" for p in paths) + f" -loop 1 -t {DUR} -i {U}/frame.png"
fc = f"[0:v]scale={W}:{H},boxblur=18:2,eq=brightness=-0.15,trim=0:{DUR},setpts=PTS-STARTPTS[bg];"; last = "[bg]"
for i in range(len(paths)):
    t1 = T[i + 1] if i + 1 < len(T) else DUR + 1
    fc += f"{last}[{i+1}:v]overlay=x={SX}:y={SY}:enable='between(t,{T[i]},{t1})'[s{i}];"; last = f"[s{i}]"
fc += f"{last}[{len(paths)+1}:v]overlay=0:0,format=yuv420p[v]"
r = subprocess.run(f"ffmpeg -v error -y {ins} -filter_complex \"{fc}\" -map '[v]' -map 0:a? -t {DUR} -c:v libx264 -preset veryfast -crf 16 -c:a aac {OUT}", shell=True, capture_output=True, text=True)
if r.returncode: raise SystemExit(r.stderr[-1500:])
print("CALLS", OUT)
