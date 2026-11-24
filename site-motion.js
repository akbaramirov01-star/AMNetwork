/* AM Network — gentle motion for the homepage (24 Nov 2026).
 * Content is never hidden by default (an earlier .reveal hid sections on phones and left empty
 * areas). Elements below the fold get a one-time entrance animation when they scroll into view;
 * if anything fails they simply stay visible. Off under prefers-reduced-motion.
 */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const css = `
@keyframes amnRise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes amnPop{0%{opacity:0;transform:scale(.6) rotate(-8deg)}70%{opacity:1;transform:scale(1.08) rotate(2deg)}100%{transform:none}}
@keyframes amnDraw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes amnShine{0%{transform:translateX(-120%) skewX(-20deg)}60%,100%{transform:translateX(260%) skewX(-20deg)}}
@keyframes amnScan{0%{top:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}}
@keyframes amnFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.amn-in{animation:amnRise .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0ms)}
.amn-in .tl-ic,.amn-in .step-icon img,.amn-in .picon img{animation:amnPop .7s cubic-bezier(.3,1.4,.5,1) both;animation-delay:calc(var(--d,0ms) + 120ms)}
.sec-title{position:relative}
.sec-title.amn-line::after{content:"";position:absolute;left:0;bottom:-10px;width:64px;height:3px;border-radius:3px;
  background:linear-gradient(90deg,var(--gold),transparent);transform-origin:left;animation:amnDraw .9s .15s cubic-bezier(.2,.8,.2,1) both}
[dir="rtl"] .sec-title.amn-line::after{left:auto;right:0;transform-origin:right;background:linear-gradient(270deg,var(--gold),transparent)}
.hbtn-gold{position:relative;overflow:hidden}
.hbtn-gold::after{content:"";position:absolute;top:0;bottom:0;left:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);
  animation:amnShine 4.5s 1.2s ease-in-out infinite;pointer-events:none}
.tl-grid a{transition:background .25s,transform .25s cubic-bezier(.3,1.4,.5,1),box-shadow .25s}
.tl-grid a:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(0,0,0,.18)}
.tl-grid a:active{transform:scale(.97)}
.tl-grid a:hover .tl-ic{animation:amnFloat 1.6s ease-in-out infinite}
.step{transition:transform .3s cubic-bezier(.3,1.4,.5,1),box-shadow .3s,border-color .3s}
.step:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(0,0,0,.18);border-color:rgba(201,168,76,.45)}
.ex-card{position:relative;overflow:hidden}
.ex-card.amn-in::before{content:"";position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold2),transparent);
  box-shadow:0 0 18px var(--gold);animation:amnScan 1.6s .5s ease-in-out both;pointer-events:none}
.ex-card.amn-in .ex-unv,.ex-card.amn-in .ex-ai{animation:amnRise .6s both;animation-delay:1.9s}
.hero-trust li{animation:amnRise .6s both}
.hero-trust li:nth-child(1){animation-delay:.55s}.hero-trust li:nth-child(2){animation-delay:.65s}
.hero-trust li:nth-child(3){animation-delay:.75s}.hero-trust li:nth-child(4){animation-delay:.85s}
`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Only what starts below the fold animates — nothing the visitor already sees ever blinks.
  const groups = [
    ['.tl-grid li', 45], ['.steps .step', 110], ['.products .pcard', 120], ['.st-cols .st-col', 110],
    ['.fq-list details', 60], ['.pb-chart .pb-row', 120], ['.ex-card', 0], ['.how-note', 0], ['.how-cta', 0],
  ];
  const fold = window.innerHeight * 0.92;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.classList.contains('sec-title') ? 'amn-line' : 'amn-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

  function arm() {
    groups.forEach(([sel, step]) => {
      document.querySelectorAll(sel).forEach((el, k) => {
        if (el.getBoundingClientRect().top < fold) return;
        el.style.setProperty('--d', (k % 8) * step + 'ms');
        io.observe(el);
      });
    });
    document.querySelectorAll('.sec-title').forEach(el => io.observe(el));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
  else arm();
})();
