// Generic: real AM Network Quran page, open a surah, one screenshot per marked ayah (highlighted), same scroll window.
// usage: node shot3.js OUTDIR "surah-name-regex" "prefix" "ayah text regex 1" ["regex 2" ...]   -> OUTDIR/<prefix>0.png ...
const { chromium } = require('playwright');
(async () => {
  const [out, surah, prefix, ...marks] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file:///home/user/AMNetwork/quran/index.html', { waitUntil: 'load' }); await p.waitForTimeout(4000);
  await p.locator(`text=/${surah}/i`).first().click(); await p.waitForTimeout(7000);
  await p.addStyleTag({ content: 'header, .site-header, nav{display:none!important} .amn-hl{outline:3px solid #e6b84a!important;border-radius:14px;background:rgba(230,184,74,.12)!important}' });
  const top = await p.evaluate((srcs) => {
    const cards = srcs.map(s => {
      const re = new RegExp(s); const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && re.test(e.textContent.trim()));
      let c = el; for (let i = 0; i < 6 && c.parentElement; i++) { c = c.parentElement; if (c.getBoundingClientRect().height > 150) break; }
      return c;
    });
    window.__cards = cards; return cards[0].getBoundingClientRect().top + window.scrollY;
  }, marks);
  for (let i = 0; i < marks.length; i++) {
    await p.evaluate((i) => { window.__cards.forEach(c => c.classList.remove('amn-hl')); window.__cards[i].classList.add('amn-hl'); }, i);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${prefix}${i}.png`, fullPage: true, clip: { x: 0, y: Math.max(0, top - 40), width: 390, height: 1250 } });
  }
  console.log('ok', top); await b.close();
})();
