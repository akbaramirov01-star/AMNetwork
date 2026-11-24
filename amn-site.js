/* AM Network — one site: shared navigation between the cabinet and every other page (24 Nov 2026).
 *  • on any page: a "Cabinet" link in the tools menu, and the cabinet button shows "My account"
 *    when the visitor is signed in (read from the saved session key only — no network call)
 *  • in the cabinet: a "All tools" sheet in the nav and a tools strip under the content
 */
(function () {
  const L = {"tj": {"quran": "Қуръони Карим", "hadith": "Маҷмӯаи ҳадисҳо", "dua": "Дуо ва Зикр", "tasbeeh": "Зикрҳои худро шуморед (тасбеҳ)", "prayertimes": "Вақти намоз", "qibla": "Самти Қибла", "calendar": "Тақвими исломӣ", "calc": "Ҳисобкунаки закот", "names": "99 номи Аллоҳ", "live": "Пахши Зинда: Макка ва Мадина", "academy": "AM Academy", "help": "Барои кӯмак аризадиҳӣ", "cabinet": "Кабинет", "home": "Асосӣ", "menu": "Ҳамаи бахшҳо", "mycab": "Кабинети ман", "faq": "Саволу ҷавоб"}, "tr": {"quran": "Kur'an-ı Kerim", "hadith": "Hadis Koleksiyonu", "dua": "Dua & Zikir", "tasbeeh": "Zikrinizi Sayın (Tesbih)", "prayertimes": "Namaz Vakitleri", "qibla": "Kıble Yönü", "calendar": "İslami Takvim", "calc": "Zekât Hesaplayıcı", "names": "Allah'ın 99 İsmi", "live": "Canlı: Mekke ve Medine", "academy": "AM Academy", "help": "Yardım Başvurusu Yapın", "cabinet": "Hesabım", "home": "Ana sayfa", "menu": "Tüm bölümler", "mycab": "Hesabım", "faq": "Sorular"}, "ms": {"quran": "Al-Quran Al-Karim", "hadith": "Koleksi Hadis", "dua": "Doa & Zikir", "tasbeeh": "Kira Zikir Anda (Tasbih)", "prayertimes": "Waktu Solat", "qibla": "Arah Kiblat", "calendar": "Kalendar Islam", "calc": "Kalkulator Zakat", "names": "99 Nama Allah", "live": "Langsung: Makkah & Madinah", "academy": "AM Academy", "help": "Mohon Bantuan", "cabinet": "Akaun", "home": "Utama", "menu": "Semua menu", "mycab": "Akaun saya", "faq": "Soalan"}, "ar": {"quran": "القرآن الكريم", "hadith": "مجموعة الأحاديث", "dua": "الدعاء والذكر", "tasbeeh": "عدّ أذكارك (التسبيح)", "prayertimes": "مواقيت الصلاة", "qibla": "اتجاه القبلة", "calendar": "التقويم الإسلامي", "calc": "حاسبة الزكاة", "names": "أسماء الله الحسنى", "live": "مباشر: مكة والمدينة", "academy": "AM Academy", "help": "تقدم بطلب للحصول على المساعدة", "cabinet": "حسابي", "home": "الرئيسية", "menu": "كل الأقسام", "mycab": "حسابي", "faq": "الأسئلة"}, "id": {"quran": "Al-Qur'an Al-Karim", "hadith": "Koleksi Hadits", "dua": "Doa & Dzikir", "tasbeeh": "Hitung Dzikir Anda (Tasbih)", "prayertimes": "Waktu Sholat", "qibla": "Arah Kiblat", "calendar": "Kalender Islam", "calc": "Kalkulator Zakat", "names": "99 Nama Allah", "live": "Langsung: Makkah & Madinah", "academy": "AM Academy", "help": "Ajukan Bantuan", "cabinet": "Akun", "home": "Beranda", "menu": "Semua menu", "mycab": "Akun saya", "faq": "Tanya jawab"}, "zh": {"quran": "尊贵的古兰经", "hadith": "圣训集", "dua": "祈祷与赞念", "tasbeeh": "记录您的赞念（Tasbih）", "prayertimes": "礼拜时间", "qibla": "朝拜方向", "calendar": "伊斯兰历法", "calc": "天课计算器", "names": "安拉的99个尊名", "live": "直播：麦加与麦地那", "academy": "AM Academy", "help": "申请援助", "cabinet": "我的账户", "home": "首页", "menu": "全部功能", "mycab": "我的账户", "faq": "常见问题"}, "ru": {"quran": "Священный Коран", "hadith": "Сборник хадисов", "dua": "Дуа и Зикр", "tasbeeh": "Считайте свои зикры (тасбих)", "prayertimes": "Время намаза", "qibla": "Направление на Киблу", "calendar": "Исламский календарь", "calc": "Калькулятор закята", "names": "99 имён Аллаха", "live": "Прямой эфир: Мекка и Медина", "academy": "AM Academy", "help": "Подать заявку на помощь", "cabinet": "Кабинет", "home": "Главная", "menu": "Все разделы", "mycab": "Мой кабинет", "faq": "Вопросы и ответы"}, "en": {"quran": "The Holy Quran", "hadith": "Hadith Collection", "dua": "Dua & Dhikr", "tasbeeh": "Count Your Dhikr (Tasbih)", "prayertimes": "Prayer Times", "qibla": "Qibla Direction", "calendar": "Islamic Calendar", "calc": "Zakat Calculator", "names": "99 Names of Allah", "live": "Live: Makkah & Madinah", "academy": "AM Academy", "help": "Apply for Assistance", "cabinet": "Account", "home": "Home", "menu": "All tools", "mycab": "My account", "faq": "Questions"}, "fr": {"quran": "Le Noble Coran", "hadith": "Recueil de Hadiths", "dua": "Dua & Dhikr", "tasbeeh": "Comptez votre dhikr (Tasbih)", "prayertimes": "Heures de prière", "qibla": "Direction de la Qibla", "calendar": "Calendrier islamique", "calc": "Calculateur de Zakat", "names": "Les 99 Noms d'Allah", "live": "Direct : La Mecque et Médine", "academy": "AM Academy", "help": "Demander une aide", "cabinet": "Mon espace", "home": "Accueil", "menu": "Toutes les rubriques", "mycab": "Mon espace", "faq": "Questions"}, "de": {"quran": "Der Edle Koran", "hadith": "Hadith-Sammlung", "dua": "Dua & Dhikr", "tasbeeh": "Zählen Sie Ihr Dhikr (Tasbih)", "prayertimes": "Gebetszeiten", "qibla": "Qibla-Richtung", "calendar": "Islamischer Kalender", "calc": "Zakat-Rechner", "names": "Die 99 Namen Allahs", "live": "Live: Mekka & Medina", "academy": "AM Academy", "help": "Unterstützung beantragen", "cabinet": "Mein Konto", "home": "Startseite", "menu": "Alle Bereiche", "mycab": "Mein Bereich", "faq": "Fragen"}};
  const lang = () => { try { const l = localStorage.getItem('amn_lang'); if (L[l]) return l; } catch (e) {} return 'ru'; };
  const t = k => (L[lang()] || L.en)[k] || L.en[k];
  const signedIn = () => { try { return !!localStorage.getItem('amn-cabinet-auth'); } catch (e) { return false; } };
  const ITEMS = [
    ['/', 'home', null], ['/cabinet/', 'cabinet', null], ['/apply/', 'help', null], ['/quran/', 'quran', 'quran'],
    ['/hadith/', 'hadith', 'hadith'], ['/dua/', 'dua', 'dua'], ['/tasbeeh/', 'tasbeeh', 'tasbeeh'],
    ['/prayer-times/', 'prayertimes', 'prayer'], ['/qibla/', 'qibla', 'qibla'], ['/calendar/', 'calendar', 'calendar'],
    ['/zakat/', 'calc', 'zakat'], ['/names/', 'names', 'names'], ['/live/', 'live', 'live'], ['/academy/', 'academy', 'academy'],
    ['/faq/', 'faq', null],
  ];
  const ICON = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    cabinet: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
    help: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5h.01"/>',
  };
  const css = `
.amn-sheet-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10000;opacity:0;transition:opacity .25s;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.amn-sheet{position:fixed;left:50%;bottom:0;transform:translate(-50%,105%);width:min(640px,100%);max-height:82vh;overflow:auto;z-index:10001;
  background:var(--bg2,#0F2117);border:1px solid rgba(201,168,76,.3);border-bottom:0;border-radius:22px 22px 0 0;padding:10px 16px 26px;
  box-shadow:0 -20px 60px rgba(0,0,0,.4);transition:transform .38s cubic-bezier(.2,.9,.25,1.05)}
.amn-sheet.open{transform:translate(-50%,0)}.amn-sheet-bg.open{opacity:1}
.amn-sheet .grab{width:44px;height:5px;border-radius:5px;background:rgba(201,168,76,.4);margin:2px auto 12px}
.amn-sheet h3{font:700 18px var(--fh,Georgia,serif);margin:0 0 12px;color:var(--text,#fff)}
.amn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}
.amn-tile{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 6px;border-radius:16px;border:1px solid var(--border,rgba(255,255,255,.1));
  background:var(--card,rgba(255,255,255,.04));color:var(--text,#fff);text-decoration:none;font:600 12px/1.25 var(--ff,system-ui);text-align:center;
  transition:transform .25s cubic-bezier(.3,1.4,.5,1),border-color .2s,background .2s;opacity:0;animation:amnTile .4s ease forwards}
.amn-tile:hover{transform:translateY(-3px);border-color:var(--gold,#C9A84C)}.amn-tile:active{transform:scale(.96)}
.amn-tile img,.amn-tile .ic{width:46px;height:46px;border-radius:13px;box-shadow:0 6px 14px rgba(0,0,0,.25)}
.amn-tile .ic{display:grid;place-items:center;border-radius:50%!important;box-shadow:0 0 0 2px #C9A84C,0 0 0 5px rgba(201,168,76,.18)!important;background:linear-gradient(135deg,#3E6B3F,#2B4F31);color:#E8C87A}
.amn-tile.here{border-color:var(--gold,#C9A84C);background:rgba(201,168,76,.12)}
@keyframes amnTile{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.amn-strip{max-width:1100px;margin:28px auto 30px;padding:0 16px}
.amn-strip h3{font:700 17px var(--fh,Georgia,serif);margin:0 0 12px;color:var(--text,#fff)}
.amn-strip .amn-grid{grid-template-columns:repeat(auto-fill,minmax(92px,1fr))}
.amn-strip .amn-tile{animation:none;opacity:1}
.nav-cab.amn-in-acc{border-color:var(--gold,#C9A84C)!important;background:rgba(201,168,76,.12)}
.nav-cab.amn-in-acc::after{content:"";width:7px;height:7px;border-radius:50%;background:#5FD39A;margin-inline-start:6px;box-shadow:0 0 0 3px rgba(95,211,154,.2)}
@media (prefers-reduced-motion:reduce){.amn-sheet,.amn-sheet-bg{transition:none}.amn-tile{animation:none;opacity:1}}
/* Logo 1: emblem in a slowly turning gold ring + wordmark with a passing shine (24 Nov 2026) */
.amn-logo{display:inline-flex;align-items:center;gap:10px;text-decoration:none}
.amn-logo .ring{position:relative;width:40px;height:40px;flex:none}
.amn-logo .ring::before{content:"";position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(#E8C87A,#C9A84C 30%,rgba(201,168,76,.06) 60%,#E8C87A);animation:amnRingSpin 6s linear infinite}
.amn-logo .ring img{position:relative;width:40px;height:40px;border-radius:50%;background:#0A1A11;padding:2px;display:block}
.amn-logo .wm{font:700 18px/1 'Cinzel','Cormorant Garamond',Georgia,serif;letter-spacing:.1em;white-space:nowrap;background:linear-gradient(100deg,#C9A84C 20%,#FFF3C4 45%,#C9A84C 70%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:amnShineTxt 5s ease-in-out infinite}
[data-theme="light"] .amn-logo .wm{background-image:linear-gradient(100deg,#8A6A12 20%,#E8C87A 45%,#8A6A12 70%)}
@keyframes amnRingSpin{to{transform:rotate(360deg)}}
@keyframes amnShineTxt{0%,60%{background-position:100% 0}100%{background-position:-120% 0}}
@media (max-width:480px){.amn-logo{gap:7px}.amn-logo .ring,.amn-logo .ring img{width:32px;height:32px}.amn-logo .wm{font-size:13px;letter-spacing:.05em}}
@media (max-width:350px){.amn-logo .wm{display:none}}
html,body{overflow-x:clip}
/* Icons 3: round medallions with a gold ring, everywhere */
.tl-ic,.page-ic,.amn-tile img,.step-icon img,.picon img{border-radius:50%!important;object-fit:cover;box-shadow:0 0 0 2px #C9A84C,0 0 0 5px rgba(201,168,76,.18),0 10px 24px rgba(0,0,0,.25)!important}
@media (prefers-reduced-motion:reduce){.amn-logo .ring::before,.amn-logo .wm{animation:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  // Cinzel for the wordmark only — a tiny subset with just these letters.
  if (!document.getElementById('amn-cinzel')) {
    const f = document.createElement('link'); f.id = 'amn-cinzel'; f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700&text=AMNETWORK%20&display=swap';
    document.head.appendChild(f);
  }

  function tiles(animate) {
    const here = location.pathname.replace(/index\.html$/, '');
    return ITEMS.map(([href, key, img], k) => {
      const icon = img ? `<img src="/icons/ui/${img}.webp?v=2" alt="" width="46" height="46" loading="lazy">`
        : `<span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[key]}</svg></span>`;
      return `<a class="amn-tile${href === here ? ' here' : ''}" href="${href}" style="animation-delay:${animate ? 40 + k * 28 : 0}ms">${icon}<span>${t(key)}</span></a>`;
    }).join('');
  }
  function openSheet() {
    let bg = document.querySelector('.amn-sheet-bg'), sh = document.querySelector('.amn-sheet');
    if (!sh) {
      bg = document.createElement('div'); bg.className = 'amn-sheet-bg';
      sh = document.createElement('div'); sh.className = 'amn-sheet'; sh.setAttribute('role', 'dialog');
      document.body.append(bg, sh);
      bg.addEventListener('click', closeSheet);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
    }
    sh.setAttribute('aria-label', t('menu'));
    sh.innerHTML = `<div class="grab"></div><h3>${t('menu')}</h3><div class="amn-grid">${tiles(true)}</div>`;
    requestAnimationFrame(() => { bg.classList.add('open'); sh.classList.add('open'); });
  }
  function closeSheet() {
    const bg = document.querySelector('.amn-sheet-bg'), sh = document.querySelector('.amn-sheet');
    if (bg) bg.classList.remove('open'); if (sh) sh.classList.remove('open');
  }

  // Swap the old flat logo image (emblem + text baked in) for the animated one, on every page.
  function logo() {
    document.querySelectorAll('img[src="/logo.webp"]').forEach(img => {
      const a = img.closest('a') || img;
      if (a.dataset.amnLogo) return;
      a.dataset.amnLogo = '1';
      const wrap = document.createElement('span');
      wrap.className = 'amn-logo';
      wrap.innerHTML = '<span class="ring"><img src="/favicon.svg" alt="" width="40" height="40"></span><span class="wm">AM NETWORK</span>';
      wrap.setAttribute('aria-label', 'AM Network');
      img.replaceWith(wrap);
    });
  }
  function setup() {
    logo();
    // Every page: a Cabinet entry in the tools dropdown.
    document.querySelectorAll('.tool-links-menu').forEach(m => {
      if (m.querySelector('a[href="/cabinet/"]')) return;
      const a = document.createElement('a'); a.href = '/cabinet/';
      a.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON.cabinet}</svg><span>${signedIn() ? t('mycab') : t('cabinet')}</span>`;
      m.insertBefore(a, m.children[1] || null);
    });
    // Signed in: the cabinet button says so.
    if (signedIn()) document.querySelectorAll('.nav-cab').forEach(b => {
      b.classList.add('amn-in-acc'); const s = b.querySelector('span'); if (s) { s.removeAttribute('data-t'); s.textContent = t('mycab'); }
    });
    // Cabinet: "All tools" sheet + a strip of tools under the content.
    document.querySelectorAll('[data-amn-menu]').forEach(b => { b.setAttribute('aria-label', t('menu')); b.addEventListener('click', openSheet); });
    const strip = document.getElementById('amnStrip');
    if (strip) {
      const paint = () => { strip.innerHTML = `<h3>${t('menu')}</h3><div class="amn-grid">${tiles(false)}</div>`; };
      paint();
      window.addEventListener('storage', paint);
      document.addEventListener('change', e => { if (e.target && e.target.id === 'langSel') setTimeout(paint, 0); });
    }
  }
  window.AMN_SITE = { openSheet, closeSheet };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
