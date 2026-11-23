// usage: node ar.js out.png "arabic line1|line2" "translation"
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const durl = f => 'data:font/ttf;base64,' + fs.readFileSync(path.resolve(__dirname, f)).toString('base64');
(async () => {
  const [out, ar, tr] = process.argv.slice(2);
  const font = 'file://' + path.resolve(__dirname, 'fonts/Scheherazade-700.ttf');
  const lines = ar.split('|').map(l => `<div class="a">${l}</div>`).join('');
  const html = `<html><head><style>@font-face{font-family:AQ;src:url('${durl('fonts/Scheherazade-700.ttf')}')}
  @font-face{font-family:MS;src:url('${durl('fonts/Montserrat-800.ttf')}')}
  html,body{margin:0;background:transparent;width:720px;height:1280px}
  .box{position:absolute;left:40px;right:40px;top:270px;background:rgba(0,0,0,.69);border-radius:24px;padding:26px 30px 30px}
  .a{font-family:AQ;direction:rtl;text-align:center;color:#f0c864;font-size:46px;line-height:1.9}
  .t{font-family:MS;text-align:center;color:#f5f5ee;font-size:27px;line-height:1.4;margin-top:10px}</style></head>
  <body><div class="box">${lines}<div class="t">${tr}</div></div></body></html>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  await p.setContent(html); await p.evaluate(async () => { await document.fonts.load("46px AQ"); await document.fonts.load("27px MS"); await document.fonts.ready; });
  await p.screenshot({ path: out, omitBackground: true }); await b.close();
})();
