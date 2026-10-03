import os
d = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(d,f), encoding='utf-8').read()
import json
mp = os.path.join(d, 'media', 'manifest.json')
MEDIA = json.load(open(mp)) if os.path.exists(mp) else {}
FILM = bool(MEDIA.get('hero') or MEDIA.get('loop'))
MEDIA_JS = '\n<script>window.MEDIA = ' + json.dumps(MEDIA) + ';</script>\n'
# The procedural terrain (three.js + terrain.js) is only shipped when there is no filmed hero
scene_js = '<script>\n' + r('three.min.js') + '\n</script>\n<script>\n' + r('terrain.js') + '\n</script>\n'
langs = ''.join(r(f) for f in ['c_de.js','c_ru.js','c_en.js','c_tj.js','c_more.js'] if os.path.exists(os.path.join(d,f)))
fill = "\n['ru','en','tj'].forEach(function(k){ if(!C[k]){ C[k]=JSON.parse(JSON.stringify(C.de)); C[k].code=k; C[k].name={ru:'Русский',en:'English',tj:'Тоҷикӣ'}[k]; } });\n"
html = ('<title>Tadschikistan · Handel & Investitionen</title>\n'
 '<meta name="description" content="Masrur Kurbonalizoda, Handelsvertreter der Republik Tadschikistan in Deutschland: Handel und Investitionen zwischen Tadschikistan und Deutschland.">\n'
 '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
 '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Commissioner:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">\n'
 '<style>\n' + r('style.css') + '\n</style>\n'
 + r('body.html')
 + MEDIA_JS + (scene_js if not FILM else '') +
 '<script>\n' + r('flags.js') + '\n' + r('ornament.js') + '\n' + r('tjmap.js') + '\n' + r('data.js') + '\n' + langs + fill + r('legal.js') + '\n</script>\n'
 '<script>\n' + r('hero.js') + '\n</script>\n'
 '<script>\n' + r('app.js') + '\n</script>\n')
open(os.path.join(d,'artifact.html'),'w',encoding='utf-8').write(html)
full = ('<!DOCTYPE html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#090D15">\n'
        + html.replace('<style>','</head>\n<body>\n<style>',0) )
head, rest = html.split('<style>',1)
full = ('<!DOCTYPE html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#090D15">\n'
        + head + '<style>' + rest.split('</style>',1)[0] + '</style>\n</head>\n<body>\n' + rest.split('</style>',1)[1] + '\n</body>\n</html>\n')
open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(full)
print('built', len(html))

# One page per language for links that open in that language, each with its own preview text for
# messengers and search engines. index.html keeps the automatic choice (stored, then browser language).
SITE = "https://tajikistan-trade.netlify.app/"
META = {
 "de": ("Tadschikistan · Handel & Investitionen", "Handelsvertreter der Republik Tadschikistan in Deutschland: Investitionen, Export in die EU, Freie Wirtschaftszonen und Ihr Ansprechpartner in Berlin.", "de_DE"),
 "ru": ("Таджикистан · Торговля и инвестиции", "Торговый представитель Республики Таджикистан в Германии: инвестиции, экспорт в ЕС, свободные экономические зоны и контакт в Берлине.", "ru_RU"),
 "en": ("Tajikistan · Trade & Investment", "Trade Representative of the Republic of Tajikistan in Germany: investment, exports to the EU, free economic zones and a contact in Berlin.", "en_GB"),
 "tj": ("Тоҷикистон · Савдо ва сармоягузорӣ", "Намояндаи савдои Ҷумҳурии Тоҷикистон дар Олмон: сармоягузорӣ, содирот ба ИА, минтақаҳои озоди иқтисодӣ ва тамос дар Берлин.", "tg_TJ"),
}
PAGE = {"de": "", "ru": "ru", "en": "en", "tj": "tj"}
import html as _h
alts = "".join('<link rel="alternate" hreflang="%s" href="%s%s">\n' % ({"tj":"tg"}.get(k,k), SITE, v) for k, v in PAGE.items()) + '<link rel="alternate" hreflang="x-default" href="%s">\n' % SITE
base = open(os.path.join(d, "index.html"), encoding="utf-8").read()
title0 = base[base.index("<title>"):base.index("</title>")+8]
desc0 = base[base.index('<meta name="description"'):]
desc0 = desc0[:desc0.index(">")+1]
for k, (t, ds, loc) in META.items():
    meta = ('<title>%s</title>\n<meta name="description" content="%s">\n' % (_h.escape(t), _h.escape(ds)) +
            '<meta property="og:type" content="website">\n<meta property="og:site_name" content="%s">\n' % _h.escape(t) +
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n' % (_h.escape(t), _h.escape(ds)) +
            '<meta property="og:url" content="%s%s">\n<meta property="og:locale" content="%s">\n' % (SITE, PAGE[k], loc) +
            '<meta property="og:image" content="%sog.jpg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' % SITE +
            '<meta name="twitter:card" content="summary_large_image">\n' + alts +
            ('<script>window.FORCE_LANG="%s";</script>\n' % k if PAGE[k] else ''))
    out = base.replace(title0, meta, 1).replace(desc0 + "\n", "", 1).replace('<html lang="de">', '<html lang="%s">' % {"tj":"tg"}.get(k, k), 1)
    open(os.path.join(d, (PAGE[k] or "index") + ".html"), "w", encoding="utf-8").write(out)
print("pages: index ru en tj")
