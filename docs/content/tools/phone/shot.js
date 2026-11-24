// Tall strip of real AM Network Quran page (Surah 20, ayat 25-28). usage: node shot.js OUTDIR
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file:///home/user/AMNetwork/quran/index.html', { waitUntil: 'load' }); await p.waitForTimeout(4000);
  await p.locator('text=/Ta-?Ha/i').first().click(); await p.waitForTimeout(6000);
  // hide the site header (its logo path does not resolve from file://) — our phone frame draws its own bar
  await p.addStyleTag({ content: 'header, .site-header, nav{display:none!important}' });
  const y = await p.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /expand \[i\.e\., relax\] for me my breast/.test(e.textContent));
    let c = el; for (let i = 0; i < 6 && c.parentElement; i++) { c = c.parentElement; if (c.getBoundingClientRect().height > 150) break; }
    c.style.outline = '3px solid #e6b84a'; c.style.borderRadius = '14px';
    return c.getBoundingClientRect().top + window.scrollY;
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: out + '/strip.png', fullPage: true, clip: { x: 0, y: Math.max(0, y - 40), width: 390, height: 1250 } });
  console.log('top', y); await b.close();
})();
