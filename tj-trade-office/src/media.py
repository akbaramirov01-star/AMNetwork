"""Turns the generated source media in raw/ into web-ready files in media/
and writes media/manifest.json, which build.py inlines as window.MEDIA.

raw/hero.mp4            -> media/hero/l/f_000.webp ... (1600 px) and media/hero/s/ (960 px), media/hero/poster.jpg
raw/weave.mp4           -> media/band/weave.mp4 (silent, 1280 px, faststart) + weave.jpg poster
raw/<sector>.png        -> media/s/<sector>.webp (1400 px)

Any input that is missing is simply left out of the manifest; the site then
falls back (WebGL terrain for the hero, icons for the sectors, ornament for the band).
"""
import json, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageFilter
import imageio_ffmpeg

D = os.path.dirname(os.path.abspath(__file__))
RAW, OUT = os.path.join(D, "raw"), os.path.join(D, "media")
FF = imageio_ffmpeg.get_ffmpeg_exe()
FRAMES = 84
# AI video is soft even at 1080p: a gentle unsharp mask restores perceived detail without halos
SHARP = ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2)
SECTORS = ["energy", "mining", "agri", "textile", "tourism", "industry"]
PAGE_PICS = {"tadschikistan": "tourism", "branchen": "textile", "investieren": "industry", "export": "agri"}


def run(*a):
    subprocess.run([FF, "-loglevel", "error", "-y", *a], check=True)


def duration(path):
    out = subprocess.run([FF, "-i", path], capture_output=True, text=True).stderr
    h, m, s = out.split("Duration: ")[1].split(",")[0].split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def fit(im, w):
    im = im.convert("RGB")
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width > w else im


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    man = {}

    hero = os.path.join(RAW, "hero.mp4")
    if os.path.exists(hero):
        tmp = tempfile.mkdtemp()
        dur = duration(hero)
        # sample exactly FRAMES frames evenly across the clip, skipping the very last (often a soft frame)
        run("-i", hero, "-vf", "fps=%f" % (FRAMES / (dur - 0.05)), "-frames:v", str(FRAMES), os.path.join(tmp, "%03d.png"))
        files = sorted(os.listdir(tmp))
        os.makedirs(os.path.join(OUT, "hero", "l")); os.makedirs(os.path.join(OUT, "hero", "s"))
        for i, f in enumerate(files):
            im = Image.open(os.path.join(tmp, f)).convert("RGB").filter(SHARP)
            # desktop: the full 1920 frame
            fit(im, 1920).save(os.path.join(OUT, "hero", "l", "f_%03d.webp" % i), "WEBP", quality=80, method=6)
            # phones (portrait): a native-resolution vertical crop instead of a shrunken landscape frame
            cw = round(im.height * 0.6)
            x0 = (im.width - cw) // 2
            im.crop((x0, 0, x0 + cw, im.height)).save(os.path.join(OUT, "hero", "s", "f_%03d.webp" % i), "WEBP", quality=78, method=6)
        fit(Image.open(os.path.join(tmp, files[0])).filter(SHARP), 1920).save(os.path.join(OUT, "hero", "poster.jpg"), quality=80, optimize=True, progressive=True)
        shutil.rmtree(tmp)
        man["hero"] = {"n": len(files), "lg": "media/hero/l/f_", "sm": "media/hero/s/f_", "ext": ".webp", "poster": "media/hero/poster.jpg"}

    weave = os.path.join(RAW, "weave.mp4")
    if os.path.exists(weave):
        os.makedirs(os.path.join(OUT, "band"))
        run("-i", weave, "-an", "-vf", "scale=1920:-2:flags=lanczos,unsharp=5:5:0.7,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "25",
            "-movflags", "+faststart", os.path.join(OUT, "band", "weave.mp4"))
        run("-i", weave, "-an", "-vf", "scale=1920:-2:flags=lanczos,unsharp=5:5:0.7", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-row-mt", "1",
            os.path.join(OUT, "band", "weave.webm"))
        run("-i", weave, "-frames:v", "1", "-vf", "scale=1920:-2:flags=lanczos,unsharp=5:5:0.7", "-q:v", "3", os.path.join(OUT, "band", "weave.jpg"))
        man["band"] = {"webm": "media/band/weave.webm", "src": "media/band/weave.mp4", "poster": "media/band/weave.jpg"}

    s = {}
    for k in SECTORS:
        p = os.path.join(RAW, k + ".png")
        if os.path.exists(p):
            os.makedirs(os.path.join(OUT, "s"), exist_ok=True)
            fit(Image.open(p), 1800).filter(ImageFilter.UnsharpMask(radius=1.0, percent=40, threshold=2)).save(os.path.join(OUT, "s", k + ".webp"), "WEBP", quality=82, method=6)
            s[k] = "media/s/%s.webp" % k
    if s:
        man["s"] = s
        man["ph"] = {page: s[k] for page, k in PAGE_PICS.items() if k in s}

    json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
    print("media:", ", ".join(man) or "none", "| %.1f MB" % (total / 1e6))


if __name__ == "__main__":
    sys.exit(main())
