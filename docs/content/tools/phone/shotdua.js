// node shotdua.js OUT.png "category regex" "card text regex" -> real AM Network /dua/ page, card highlighted
const { chromium } = require('playwright');
(async () => {
  const [out, cat, mark] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file:///home/user/AMNetwork/dua/index.html', { waitUntil: 'load' }); await p.waitForTimeout(4000);
  await p.locator(`text=/${cat}/i`).first().click(); await p.waitForTimeout(6000);
  await p.addStyleTag({ content: 'header, .site-header, nav{display:none!important} .amn-hl{outline:3px solid #e6b84a!important;border-radius:14px;background:rgba(230,184,74,.12)!important}' });
  const top = await p.evaluate((s) => {
    const re = new RegExp(s, 'i'); const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && re.test(e.textContent.trim()));
    if (!el) return -1; let c = el; for (let i = 0; i < 6 && c.parentElement; i++) { c = c.parentElement; if (c.getBoundingClientRect().height > 200) break; }
    c.classList.add('amn-hl'); return c.getBoundingClientRect().top + window.scrollY;
  }, mark);
  if (top < 0) { console.log('NOT FOUND'); await p.screenshot({ path: out + '.debug.png' }); process.exit(1); }
  await p.waitForTimeout(400);
  await p.screenshot({ path: out, fullPage: true, clip: { x: 0, y: Math.max(0, top - 40), width: 390, height: 1250 } });
  console.log('ok', top); await b.close();
})();
