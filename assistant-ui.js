/* AM Network — assistant look & motion (24 Nov 2026).
 *
 * A visual layer over the chat widget that four pages share (homepage, Academy, /apply/, /zakat/).
 * It changes no behaviour and keeps the same element ids, so faq-assistant.js and
 * voice-assistant.js work as before. It adds:
 *   • a glass panel that grows out of the launcher, an animated avatar ring and a live status line
 *   • messages that slide in, bot answers that appear word by word, links and bullet lines
 *   • a breathing launcher with a sparkle icon, staggered question chips, a gold typing indicator
 *   • a /health ping when the panel opens, so the free-tier backend is awake for the first question
 * Everything respects prefers-reduced-motion.
 */
(function () {
  const API = 'https://amnetwork.onrender.com';
  const STATUS = {
    en: 'AI · usually answers in seconds', ru: 'ИИ · отвечает за несколько секунд',
    tj: 'Зеҳни сунъӣ · дар чанд сония ҷавоб медиҳад', ar: 'ذكاء اصطناعي · يجيب خلال ثوانٍ',
    id: 'AI · biasanya menjawab dalam hitungan detik', tr: 'Yapay zekâ · genellikle saniyeler içinde yanıtlar',
    zh: '人工智能 · 通常几秒内回复', ms: 'AI · biasanya menjawab dalam beberapa saat',
    fr: 'IA · répond en quelques secondes', de: 'KI · antwortet meist in Sekunden',
  };
  const lang = () => {
    try { const l = localStorage.getItem('amn_lang'); if (STATUS[l]) return l; } catch (e) {}
    const h = (document.documentElement.lang || 'en').slice(0, 2);
    return STATUS[h] ? h : (h === 'tg' ? 'tj' : 'en');
  };

  const css = `
#assistantPanel{border-radius:22px!important;border:1px solid rgba(201,168,76,.32)!important;
  background:linear-gradient(180deg,color-mix(in srgb,var(--bg2) 92%,transparent),color-mix(in srgb,var(--bg1) 96%,transparent))!important;
  -webkit-backdrop-filter:blur(18px) saturate(140%);backdrop-filter:blur(18px) saturate(140%);
  box-shadow:0 30px 80px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.03) inset!important;overflow:hidden;
  transform-origin:calc(100% - 25px) calc(100% + 40px)}
#assistantPanel.open{animation:amnPanelIn .42s cubic-bezier(.2,.9,.25,1.12) both}
@keyframes amnPanelIn{from{opacity:0;transform:translateY(18px) scale(.86);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
#assistantPanel .asst-head{position:relative;background:linear-gradient(120deg,rgba(28,69,50,.95),rgba(15,33,23,.95) 55%,rgba(201,168,76,.22))!important;
  border-bottom:1px solid rgba(201,168,76,.25)!important;padding:14px 16px!important}
[data-theme="light"] #assistantPanel .asst-head{background:linear-gradient(120deg,#1C4532,#24563F 60%,#8a6d22)!important}
#assistantPanel .asst-head::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,#E8C87A,transparent);animation:amnSheen 3.2s linear infinite;background-size:200% 100%}
@keyframes amnSheen{from{background-position:200% 0}to{background-position:-200% 0}}
#assistantPanel .asst-head-title{color:#fff!important;align-items:center}
#assistantPanel .asst-head-logo{position:relative;width:36px!important;height:36px!important;overflow:visible!important}
#assistantPanel .asst-head-logo img{width:100%!important;height:100%!important;border-radius:50%;position:relative;z-index:1;background:#0A1A11}
#assistantPanel .asst-head-logo::before{content:"";position:absolute;inset:-3px;border-radius:50%;
  background:conic-gradient(from 0deg,#E8C87A,#C9A84C,rgba(201,168,76,.1),#E8C87A);animation:amnSpin 4s linear infinite}
@keyframes amnSpin{to{transform:rotate(360deg)}}
.amn-asst-names{display:flex;flex-direction:column;line-height:1.2}
.amn-asst-status{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:500;color:rgba(255,255,255,.72)}
.amn-asst-status i{width:7px;height:7px;border-radius:50%;background:#5FD39A;box-shadow:0 0 0 0 rgba(95,211,154,.6);animation:amnPing 2s infinite}
.amn-asst-status.wake i{background:#E8C87A;box-shadow:0 0 0 0 rgba(232,200,122,.6)}
@keyframes amnPing{0%{box-shadow:0 0 0 0 rgba(95,211,154,.55)}80%,100%{box-shadow:0 0 0 7px rgba(95,211,154,0)}}
#assistantPanel .asst-close{color:rgba(255,255,255,.8)!important;width:32px;height:32px;border-radius:50%;transition:background .2s,transform .25s}
#assistantPanel .asst-close:hover{background:rgba(255,255,255,.12);transform:rotate(90deg)}
#assistantPanel .asst-msgs{padding:16px!important;gap:12px!important;scroll-behavior:smooth;
  background:radial-gradient(120% 60% at 100% 0%,rgba(201,168,76,.07),transparent 60%)}
#assistantPanel .asst-msg{animation:amnMsgIn .38s cubic-bezier(.2,.8,.2,1) both;border-radius:18px!important;font-size:14.5px!important;line-height:1.6!important}
#assistantPanel .asst-msg.user{background:linear-gradient(135deg,#E8C87A,#C9A84C)!important;color:#1a1405!important;border-bottom-right-radius:6px!important;
  box-shadow:0 6px 18px rgba(201,168,76,.25);transform-origin:100% 100%}
#assistantPanel .asst-msg.bot{background:color-mix(in srgb,var(--bg3) 70%,transparent)!important;border:1px solid rgba(201,168,76,.18);
  border-bottom-left-radius:6px!important;transform-origin:0 100%}
@keyframes amnMsgIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
.amn-w{opacity:0;animation:amnWord .42s ease forwards}
@keyframes amnWord{from{opacity:0;filter:blur(3px)}to{opacity:1;filter:none}}
#assistantPanel .asst-msg.bot a{color:var(--gold2,#E8C87A);text-decoration:underline;text-underline-offset:2px;word-break:break-word}
[data-theme="light"] #assistantPanel .asst-msg.bot a{color:#8a6d22}
.amn-li{display:block;padding-inline-start:16px;position:relative}
.amn-li::before{content:"";position:absolute;inset-inline-start:2px;top:.62em;width:6px;height:6px;border-radius:50%;background:var(--gold,#C9A84C)}
#assistantPanel .asst-typing{background:color-mix(in srgb,var(--bg3) 70%,transparent);border:1px solid rgba(201,168,76,.18);border-radius:18px;border-bottom-left-radius:6px;padding:12px 15px!important;animation:amnMsgIn .3s ease both}
#assistantPanel .asst-typing span{background:var(--gold,#C9A84C)!important;width:7px!important;height:7px!important}
#assistantPanel .asst-chips .asst-chip{opacity:0;animation:amnMsgIn .35s ease forwards;transition:background .2s,transform .2s,border-color .2s}
#assistantPanel .asst-chips .asst-chip:hover:not(:disabled){transform:translateY(-2px);border-color:var(--gold,#C9A84C)}
#assistantPanel .asst-input-row{padding:12px!important;gap:8px!important;border-top:1px solid rgba(201,168,76,.18)!important}
#assistantPanel .asst-input-row input{border-radius:999px!important;padding:11px 16px!important;transition:border-color .2s,box-shadow .2s}
#assistantPanel .asst-input-row input:focus{border-color:var(--gold,#C9A84C)!important;box-shadow:0 0 0 4px rgba(201,168,76,.16)}
#assistantPanel .asst-send{border-radius:50%!important;width:42px!important;height:42px!important;background:linear-gradient(135deg,#E8C87A,#C9A84C)!important;
  transition:transform .25s cubic-bezier(.3,1.6,.5,1),box-shadow .2s!important}
#assistantPanel .asst-send:hover:not(:disabled){transform:translateY(-1px) rotate(-12deg) scale(1.06);box-shadow:0 6px 16px rgba(201,168,76,.4)}
#assistantPanel .asst-mic{border-radius:50%!important;width:42px!important;height:42px!important}
#bttBtn{background:linear-gradient(135deg,#E8C87A,#C9A84C 55%,#9C7C2C)!important;box-shadow:0 10px 30px rgba(201,168,76,.45)!important;
  width:58px!important;height:58px!important;transition:transform .3s cubic-bezier(.3,1.5,.5,1)!important;overflow:visible!important}
#bttBtn:hover{transform:translateY(-3px) scale(1.05)}
#bttBtn::before{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(201,168,76,.55);animation:amnBreathe 2.8s ease-out infinite;pointer-events:none}
@keyframes amnBreathe{0%{opacity:.9;transform:scale(.9)}70%,100%{opacity:0;transform:scale(1.25)}}
#bttBtn .amn-spark{animation:amnTwinkle 3.5s ease-in-out infinite;transform-origin:center}
@keyframes amnTwinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.12) rotate(8deg)}}
body.amn-asst-open #bttBtn::before{animation:none;opacity:0}
@media (max-width:480px){#assistantPanel{right:10px!important;left:10px!important;width:auto!important;bottom:86px!important;max-height:calc(100vh - 120px)!important}}
@media (prefers-reduced-motion: reduce){
  #assistantPanel.open,#assistantPanel .asst-msg,.amn-w,#assistantPanel .asst-chips .asst-chip,#assistantPanel .asst-typing{animation:none!important;opacity:1!important}
  #bttBtn::before,#bttBtn .amn-spark,#assistantPanel .asst-head-logo::before,#assistantPanel .asst-head::after,.amn-asst-status i{animation:none!important}}
`;
  const st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const URL_RE = /((?:https?:\/\/)?(?:www\.)?amnetwork\.io(?:\/[^\s)]*)?|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

  // Rebuild a bot message as lines → (bullets) → words, links as <a>. The visible text stays the
  // same apart from a "- " bullet marker, so the voice reader still reads the full answer.
  function decorate(el) {
    if (el.dataset.amn) return;
    el.dataset.amn = '1';
    const text = el.textContent;
    if (!text) return;
    const frag = document.createDocumentFragment();
    let i = 0;
    const total = text.split(/\s+/).length;
    const step = reduce() ? 0 : Math.max(8, Math.min(38, 1600 / Math.max(1, total)));
    const word = (w, parent) => {
      const s = document.createElement('span');
      s.className = 'amn-w';
      s.style.animationDelay = (i++ * step) + 'ms';
      s.textContent = w;
      parent.appendChild(s);
    };
    text.split('\n').forEach((line, li, all) => {
      const bullet = /^\s*[-*•]\s+/.test(line);
      const box = bullet ? document.createElement('span') : frag;
      if (bullet) { box.className = 'amn-li'; line = line.replace(/^\s*[-*•]\s+/, ''); }
      line.split(URL_RE).forEach((part, k) => {
        if (!part) return;
        if (k % 2 === 1) {
          const a = document.createElement('a');
          const mail = part.includes('@') && !part.includes('/');
          a.href = mail ? 'mailto:' + part : (/^https?:/.test(part) ? part : 'https://' + part.replace(/^www\./, ''));
          if (!mail && !/amnetwork\.io/.test(part)) { a.target = '_blank'; a.rel = 'noopener'; }
          word(part, a);
          box.appendChild(a);
        } else {
          part.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) box.appendChild(document.createTextNode(w)); else word(w, box); });
        }
      });
      if (bullet) frag.appendChild(box);
      if (li < all.length - 1 && !bullet) frag.appendChild(document.createTextNode('\n'));
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  function chips(node) {
    node.querySelectorAll('.asst-chip').forEach((c, k) => { c.style.animationDelay = (reduce() ? 0 : 120 + k * 70) + 'ms'; });
  }

  let woke = false;
  function wake(status) {
    if (woke) return;
    woke = true;
    if (status) status.classList.add('wake');
    const done = () => status && status.classList.remove('wake');
    try { fetch(API + '/health', { mode: 'cors' }).then(done, done); } catch (e) { done(); }
  }

  function setup() {
    const panel = document.getElementById('assistantPanel');
    const box = document.getElementById('asstMsgs');
    if (!panel || !box) return;

    // Header: name + live status line.
    const name = document.getElementById('asstTitle');
    let status = null;
    if (name && !panel.querySelector('.amn-asst-status')) {
      const wrap = document.createElement('span');
      wrap.className = 'amn-asst-names';
      name.parentNode.insertBefore(wrap, name);
      wrap.appendChild(name);
      status = document.createElement('span');
      status.className = 'amn-asst-status';
      status.innerHTML = '<i></i><span></span>';
      wrap.appendChild(status);
    }
    const paintStatus = () => { if (status) status.lastChild.textContent = STATUS[lang()] || STATUS.en; };
    paintStatus();

    // Launcher: sparkle icon.
    const btn = document.getElementById('bttBtn');
    if (btn) btn.innerHTML = '<svg class="amn-spark" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 2.5l1.9 5.3a3 3 0 0 0 1.8 1.8L21 11.5l-5.3 1.9a3 3 0 0 0-1.8 1.8L12 20.5l-1.9-5.3a3 3 0 0 0-1.8-1.8L3 11.5l5.3-1.9a3 3 0 0 0 1.8-1.8L12 2.5z" fill="#0A1A11"/>' +
      '<path d="M19 2.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z" fill="#0A1A11" opacity=".75"/></svg>';

    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList.contains('asst-msg') && n.classList.contains('bot')) decorate(n);
        if (n.classList.contains('asst-chips')) chips(n);
      }));
      box.scrollTop = box.scrollHeight;
    }).observe(box, { childList: true });

    new MutationObserver(() => {
      const open = panel.classList.contains('open');
      document.body.classList.toggle('amn-asst-open', open);
      if (open) { paintStatus(); wake(status); }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
