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
langs = ''.join(r(f) for f in ['c_de.js','c_ru.js','c_en.js','c_tj.js'] if os.path.exists(os.path.join(d,f)))
fill = "\n['ru','en','tj'].forEach(function(k){ if(!C[k]){ C[k]=JSON.parse(JSON.stringify(C.de)); C[k].code=k; C[k].name={ru:'Русский',en:'English',tj:'Тоҷикӣ'}[k]; } });\n"
html = ('<title>Tadschikistan · Handel & Investitionen</title>\n'
 '<meta name="description" content="Masrur Kurbonalizoda, Handelsvertreter der Republik Tadschikistan in Deutschland: Handel und Investitionen zwischen Tadschikistan und Deutschland.">\n'
 '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
 '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Commissioner:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">\n'
 '<style>\n' + r('style.css') + '\n</style>\n'
 + r('body.html')
 + MEDIA_JS + (scene_js if not FILM else '') +
 '<script>\n' + r('flags.js') + '\n' + r('ornament.js') + '\n' + r('data.js') + '\n' + langs + fill + r('legal.js') + '\n</script>\n'
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
