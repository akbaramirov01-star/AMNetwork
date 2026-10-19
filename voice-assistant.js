/* AM Network — voice mode for the site assistant.
 *
 * Adds a microphone button to the assistant panel. What the visitor says is
 * turned into text by the browser's own speech recognition (Web Speech API —
 * free, no AM Network server involved), then:
 *   1. if it is a navigation command ("open the socials", "открой время
 *      намаза", "Қуръонро кушо"), we say so out loud and go there;
 *   2. otherwise it is sent as a normal question, and the reply is read
 *      aloud with the browser's speech synthesis.
 * Browsers without speech recognition (e.g. Firefox) simply get no mic button.
 */
(function(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const SPEECH_LANG = { en:'en-US', ru:'ru-RU', tj:'ru-RU', ar:'ar-SA', id:'id-ID', tr:'tr-TR', zh:'zh-CN', ms:'ms-MY', fr:'fr-FR', de:'de-DE' };
  const UI = {
    en:{mic:'Speak', listening:'Listening…', opening:'Opening', hint:'Tap the microphone and speak — for example: “Open prayer times” or ask any question.', mute:'Read answers aloud', denied:'Microphone access is blocked for this site.'},
    ru:{mic:'Сказать', listening:'Слушаю…', opening:'Открываю', hint:'Нажмите на микрофон и скажите, например: «Открой время намаза» — или задайте любой вопрос.', mute:'Озвучивать ответы', denied:'Доступ к микрофону для сайта запрещён.'},
    tj:{mic:'Гуфтан', listening:'Гӯш медиҳам…', opening:'Мекушоям', hint:'Микрофонро пахш кунед ва гӯед, масалан: «Вақти намозро кушо» — ё ягон савол диҳед.', mute:'Ҷавобҳоро бо овоз хондан', denied:'Дастрасӣ ба микрофон барои сайт манъ аст.'},
    ar:{mic:'تحدّث', listening:'أستمع…', opening:'جارٍ فتح', hint:'اضغط على الميكروفون وقل مثلاً: «افتح مواقيت الصلاة» أو اسأل أي سؤال.', mute:'قراءة الإجابات بصوت عالٍ', denied:'الوصول إلى الميكروفون محظور لهذا الموقع.'},
    id:{mic:'Bicara', listening:'Mendengarkan…', opening:'Membuka', hint:'Ketuk mikrofon dan ucapkan, misalnya: “Buka waktu sholat” — atau ajukan pertanyaan apa pun.', mute:'Bacakan jawaban', denied:'Akses mikrofon diblokir untuk situs ini.'},
    tr:{mic:'Konuş', listening:'Dinliyorum…', opening:'Açılıyor', hint:'Mikrofona dokunun ve örneğin “Namaz vakitlerini aç” deyin — ya da herhangi bir soru sorun.', mute:'Cevapları sesli oku', denied:'Bu site için mikrofon erişimi engellendi.'},
    zh:{mic:'说话', listening:'正在聆听…', opening:'正在打开', hint:'点击麦克风说话，例如：“打开礼拜时间”，或提出任何问题。', mute:'朗读回答', denied:'此网站的麦克风权限已被阻止。'},
    ms:{mic:'Cakap', listening:'Mendengar…', opening:'Membuka', hint:'Ketik mikrofon dan sebut, contohnya: “Buka waktu solat” — atau tanya apa-apa soalan.', mute:'Bacakan jawapan', denied:'Akses mikrofon disekat untuk laman ini.'},
    fr:{mic:'Parler', listening:'J’écoute…', opening:'J’ouvre', hint:'Touchez le micro et dites par exemple : « Ouvre les heures de prière » — ou posez une question.', mute:'Lire les réponses à voix haute', denied:'L’accès au micro est bloqué pour ce site.'},
    de:{mic:'Sprechen', listening:'Ich höre zu…', opening:'Ich öffne', hint:'Tippen Sie auf das Mikrofon und sagen Sie z. B. „Öffne Gebetszeiten“ — oder stellen Sie eine Frage.', mute:'Antworten vorlesen', denied:'Der Mikrofonzugriff ist für diese Seite blockiert.'},
  };

  // Words that mark a sentence as a command rather than a question.
  const VERBS = ['открой','откройте','покажи','покажите','перейди','перейти','зайди','включи','open','show','go to','take me','кушо','кушоед','нишон деҳ','бирав','افتح','اعرض','اذهب','buka','tunjukkan','aç','göster','打开','显示','去','ouvre','ouvrir','montre','öffne','zeige','geh zu'];

  // [keywords, destination, labels]. Specific entries come before general ones.
  const SOCIAL = {
    instagram:'https://www.instagram.com/amnet_io', telegram:'https://t.me/amnetwork_global',
    x:'https://x.com/amnet_io', youtube:'https://www.youtube.com/@amnetwork_io',
    tiktok:'https://www.tiktok.com/@amnetwork.io', linkedin:'https://linkedin.com/company/amnetwork-io',
  };
  const ROUTES = [
    { kw:['instagram','инстаграм','инстаграмм','инста'], url:SOCIAL.instagram, label:{en:'Instagram'} },
    { kw:['telegram','телеграм','телеграмм','тг '], url:SOCIAL.telegram, label:{en:'Telegram'} },
    { kw:['youtube','ютуб','ютьюб','يوتيوب'], url:SOCIAL.youtube, label:{en:'YouTube'} },
    { kw:['tiktok','тикток','тик ток','تيك توك'], url:SOCIAL.tiktok, label:{en:'TikTok'} },
    { kw:['linkedin','линкедин','линкдин'], url:SOCIAL.linkedin, label:{en:'LinkedIn'} },
    { kw:['твиттер','twitter',' икс '], url:SOCIAL.x, label:{en:'X'} },
    { kw:['соц сет','соцсет','социальн','social','шабакаҳои иҷтимоӣ','иҷтимоӣ','تواصل','sosial','sosyal medya','社交','réseaux','soziale'], url:'/#community', label:{en:'our social networks',ru:'наши соцсети',tj:'шабакаҳои иҷтимоии мо',ar:'حساباتنا',tr:'sosyal medya',id:'media sosial',ms:'media sosial',zh:'社交媒体',fr:'nos réseaux',de:'unsere sozialen Netzwerke'} },
    { kw:['время намаз','вакт намаз','вақти намоз','namaz vakit','prayer time','waktu sholat','waktu solat','مواقيت','礼拜时间','heures de prière','gebetszeit'], url:'/prayer-times/', label:{en:'prayer times',ru:'время намаза',tj:'вақти намоз',ar:'مواقيت الصلاة',tr:'namaz vakitleri',id:'waktu sholat',ms:'waktu solat',zh:'礼拜时间',fr:'les heures de prière',de:'die Gebetszeiten'} },
    { kw:['кибл','қибла','qibla','kıble','kiblat','قبلة','朝拜方向','qibla'], url:'/qibla/', label:{en:'the Qibla',ru:'Киблу',tj:'Қибларо',ar:'القبلة',tr:'kıbleyi',id:'kiblat',ms:'kiblat',zh:'朝拜方向',fr:'la qibla',de:'die Qibla'} },
    { kw:['коран','қуръон','quran','qur\'an','kuran','al-quran','قرآن','古兰经','coran','koran'], url:'/quran/', label:{en:'the Quran',ru:'Коран',tj:'Қуръонро',ar:'القرآن',tr:'Kur\'an\'ı',id:'Al-Quran',ms:'Al-Quran',zh:'古兰经',fr:'le Coran',de:'den Koran'} },
    { kw:['хадис','ҳадис','hadith','hadis','حديث','圣训'], url:'/hadith/', label:{en:'the hadith collection',ru:'хадисы',tj:'ҳадисҳоро',ar:'الأحاديث',tr:'hadisleri',id:'hadits',ms:'hadis',zh:'圣训',fr:'les hadiths',de:'die Hadithe'} },
    { kw:['дуа','дуо','азкар','dua','doa','zikir','dhikr','أذكار','دعاء','祈祷'], url:'/dua/', label:{en:'dua and dhikr',ru:'дуа и зикр',tj:'дуо ва зикр',ar:'الأدعية',tr:'dua ve zikir',id:'doa dan dzikir',ms:'doa dan zikir',zh:'祈祷与赞念',fr:'les invocations',de:'Dua und Dhikr'} },
    { kw:['тасбих','чётки','четки','tasbeeh','tasbih','tesbih','تسبيح','赞念计数'], url:'/tasbeeh/', label:{en:'the tasbeeh',ru:'тасбих',tj:'тасбеҳро',ar:'المسبحة',tr:'tesbihi',id:'tasbih',ms:'tasbih',zh:'赞念计数',fr:'le tasbih',de:'den Tasbih'} },
    { kw:['имена аллаха','имён аллаха','99 имен','99 имён','номи аллоҳ','номҳои аллоҳ','names of allah','99 names','esma','asmaul','أسماء الله','尊名','noms d\'allah','namen allahs'], url:'/names/', label:{en:'the 99 Names',ru:'99 имён Аллаха',tj:'99 номи Аллоҳро',ar:'أسماء الله الحسنى',tr:'Esmaül Hüsna',id:'Asmaul Husna',ms:'Asmaul Husna',zh:'99个尊名',fr:'les 99 noms',de:'die 99 Namen'} },
    { kw:['эфир','трансляц','мекк','медин','макка','мадина','live','canlı','langsung','مباشر','直播','direct'], url:'/live/', label:{en:'the live broadcast',ru:'прямой эфир',tj:'пахши мустақим',ar:'البث المباشر',tr:'canlı yayını',id:'siaran langsung',ms:'siaran langsung',zh:'直播',fr:'le direct',de:'die Live-Übertragung'} },
    { kw:['календар','тақвим','calendar','takvim','kalender','kalendar','تقويم','历'], url:'/calendar/', label:{en:'the calendar',ru:'календарь',tj:'тақвимро',ar:'التقويم',tr:'takvimi',id:'kalender',ms:'kalendar',zh:'日历',fr:'le calendrier',de:'den Kalender'} },
    { kw:['калькулятор','посчитать закят','рассчитать закят','ҳисобкунак','ҳисоби закот','calculator','calculate','hesapla','kalkulator','حاسبة','计算器','calculateur','rechner'], url:'/zakat/', label:{en:'the Zakat calculator',ru:'калькулятор закята',tj:'ҳисобкунаки закотро',ar:'حاسبة الزكاة',tr:'zekât hesaplayıcıyı',id:'kalkulator zakat',ms:'kalkulator zakat',zh:'天课计算器',fr:'le calculateur',de:'den Zakat-Rechner'} },
    { kw:['заявк','получить помощь','ариза','кӯмак гирифтан','apply','başvuru','ajukan','mohon bantuan','طلب','申请','demande','antrag'], url:'/apply/', label:{en:'the application form',ru:'заявку на помощь',tj:'аризаро',ar:'نموذج الطلب',tr:'başvuru formunu',id:'formulir',ms:'borang',zh:'申请表',fr:'la demande',de:'den Antrag'} },
    { kw:['академ','academy','курс','akademi','أكاديمية','学院','académie','akademie'], url:'/academy/', label:{en:'AM Academy',ru:'AM Academy'} },
    { kw:['лист ожидания','waitlist','список ожидания','рӯйхати интизор','bekleme','قائمة الانتظار','候补','liste d\'attente','warteliste'], url:'/#waitlist', label:{en:'the waitlist',ru:'лист ожидания',tj:'рӯйхати интизорро',ar:'قائمة الانتظار',tr:'bekleme listesini',id:'daftar tunggu',ms:'senarai menunggu',zh:'候补名单',fr:'la liste d\'attente',de:'die Warteliste'} },
    { kw:['частые вопрос','faq','саволҳои маъмул','sık sorulan','الأسئلة','常见问题'], url:'/faq/', label:{en:'the FAQ',ru:'частые вопросы'} },
    { kw:['главн','home','асосӣ','ana sayfa','beranda','الرئيسية','主页','accueil','startseite'], url:'/', label:{en:'the home page',ru:'главную',tj:'саҳифаи асосиро',ar:'الصفحة الرئيسية',tr:'ana sayfayı',id:'beranda',ms:'laman utama',zh:'主页',fr:'l\'accueil',de:'die Startseite'} },
  ];

  function siteLang(){
    const l = document.documentElement.getAttribute('data-lang') || document.documentElement.lang || 'en';
    return l === 'tg' ? 'tj' : (UI[l] ? l : 'en');
  }
  function ui(){ return UI[siteLang()] || UI.en; }
  function norm(s){ return ' ' + String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[.,!?;:«»"“”]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }

  // Returns a route if the utterance is a navigation command.
  function matchCommand(text){
    const t = norm(text);
    const hasVerb = VERBS.some(v => t.includes(' ' + v) || t.startsWith(' ' + v));
    const short = t.trim().split(' ').length <= 3;
    if (!hasVerb && !short) return null;
    return ROUTES.find(r => r.kw.some(k => t.includes(k.toLowerCase()))) || null;
  }

  /* ── speech output ── */
  let speakOn = true;
  try { speakOn = localStorage.getItem('amn_voice_speak') !== '0'; } catch (e) {}
  function voiceFor(lang){
    const want = SPEECH_LANG[lang] || 'en-US';
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    return vs.find(v => v.lang === want) || vs.find(v => v.lang && v.lang.slice(0, 2) === want.slice(0, 2)) || null;
  }
  function speak(text, then){
    if (!window.speechSynthesis || !speakOn) { if (then) then(); return; }
    speechSynthesis.cancel();
    const lang = siteLang();
    const u = new SpeechSynthesisUtterance(String(text).slice(0, 1200));
    u.lang = SPEECH_LANG[lang] || 'en-US';
    const v = voiceFor(lang); if (v) u.voice = v;
    u.rate = 1.02;
    let done = false;
    const fin = () => { if (!done) { done = true; if (then) then(); } };
    u.onend = fin; u.onerror = fin;
    if (then) setTimeout(fin, 4000);   // never get stuck waiting on a voice that never starts
    speechSynthesis.speak(u);
  }

  /* ── speech input ── */
  let rec = null, listening = false, answerAloud = false;
  function setMicState(on){
    listening = on;
    const b = document.getElementById('asstMicBtn');
    if (b) b.classList.toggle('on', on);
    const input = document.getElementById('asstInput');
    if (input) {
      if (on) { input.dataset.ph = input.placeholder; input.placeholder = ui().listening; }
      else if (input.dataset.ph !== undefined) input.placeholder = input.dataset.ph;
    }
  }
  function go(route){
    const lang = siteLang();
    const label = (route.label && (route.label[lang] || route.label.en)) || '';
    speak(ui().opening + ' ' + label, () => {
      if (/^https?:/.test(route.url)) window.location.href = route.url;
      else if (route.url.startsWith('/#') && location.pathname === '/') {
        const el = document.querySelector(route.url.slice(1));
        if (el) { el.scrollIntoView({ behavior: 'smooth' }); if (typeof toggleAssistant === 'function') toggleAssistant(); }
        else window.location.href = route.url;
      } else window.location.href = route.url;
    });
  }
  function handleHeard(text){
    const route = matchCommand(text);
    if (route) {
      if (typeof asstAddMsg === 'function') { asstAddMsg('user', text); asstAddMsg('bot', ui().opening + ' ' + ((route.label[siteLang()] || route.label.en) || '') + '…'); }
      go(route);
      return;
    }
    answerAloud = true;
    if (typeof sendAssistantMessage === 'function') sendAssistantMessage(text);
  }
  function toggleMic(){
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (listening && rec) { rec.stop(); return; }
    rec = new SR();
    rec.lang = SPEECH_LANG[siteLang()] || 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = e => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      const input = document.getElementById('asstInput');
      if (input) input.value = txt;
      if (e.results[e.results.length - 1].isFinal) finalText = txt;
    };
    rec.onerror = e => {
      setMicState(false);
      if ((e.error === 'not-allowed' || e.error === 'service-not-allowed') && typeof asstAddMsg === 'function') asstAddMsg('bot', ui().denied);
    };
    rec.onend = () => {
      setMicState(false);
      const input = document.getElementById('asstInput');
      const said = (finalText || (input && input.value) || '').trim();
      if (said) { if (input) input.value = ''; handleHeard(said); }
    };
    setMicState(true);
    try { rec.start(); } catch (e) { setMicState(false); }
  }

  // Read the next bot reply aloud when the question came by voice.
  function watchReplies(){
    const box = document.getElementById('asstMsgs');
    if (!box) return;
    new MutationObserver(muts => {
      if (!answerAloud) return;
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.nodeType === 1 && n.classList.contains('asst-msg') && n.classList.contains('bot')) {
          answerAloud = false;
          speak(n.textContent);
          return;
        }
      }
    }).observe(box, { childList: true });
  }

  function mount(){
    const row = document.querySelector('#assistantPanel .asst-input-row');
    if (!row || document.getElementById('asstMicBtn')) return;
    const css = document.createElement('style');
    css.textContent =
      '.asst-mic{width:38px;height:38px;flex-shrink:0;border-radius:9px;border:1px solid rgba(201,168,76,.5);background:transparent;color:var(--gold,#C9A84C);cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative}' +
      '.asst-mic.on{background:#c0392b;border-color:#c0392b;color:#fff}' +
      '.asst-mic.on::after{content:"";position:absolute;inset:-5px;border-radius:12px;border:2px solid rgba(192,57,43,.55);animation:asstMicPulse 1.2s ease-out infinite}' +
      '@keyframes asstMicPulse{from{opacity:1;transform:scale(.92)}to{opacity:0;transform:scale(1.18)}}' +
      '.asst-voice-bar{display:flex;align-items:center;gap:8px;padding:6px 12px 0;font-size:11.5px;color:var(--text3,#999)}' +
      '.asst-voice-bar label{display:inline-flex;align-items:center;gap:6px;cursor:pointer}.asst-voice-bar input{accent-color:var(--gold,#C9A84C)}' +
      '@media (prefers-reduced-motion:reduce){.asst-mic.on::after{animation:none}}';
    document.head.appendChild(css);
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'asstMicBtn'; b.className = 'asst-mic';
    b.setAttribute('aria-label', ui().mic);
    b.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8"/></svg>';
    b.addEventListener('click', toggleMic);
    row.insertBefore(b, row.firstChild);
    if (window.speechSynthesis) {
      const bar = document.createElement('div');
      bar.className = 'asst-voice-bar';
      bar.innerHTML = '<label><input type="checkbox" id="asstSpeakToggle"' + (speakOn ? ' checked' : '') + '> <span id="asstSpeakLbl"></span></label>';
      row.parentNode.insertBefore(bar, row);
      const lbl = () => { document.getElementById('asstSpeakLbl').textContent = ui().mute; b.setAttribute('aria-label', ui().mic); };
      lbl();
      new MutationObserver(lbl).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang'] });
      bar.querySelector('input').addEventListener('change', e => {
        speakOn = e.target.checked;
        try { localStorage.setItem('amn_voice_speak', speakOn ? '1' : '0'); } catch (err) {}
        if (!speakOn) speechSynthesis.cancel();
      });
    }
    // First time the panel opens on this device, show what voice can do.
    const panel = document.getElementById('assistantPanel');
    let hinted = false;
    try { hinted = localStorage.getItem('amn_voice_hint') === '1'; } catch (e) {}
    if (!hinted && panel) new MutationObserver((_, obs) => {
      if (panel.classList.contains('open') && typeof asstAddMsg === 'function') {
        obs.disconnect();
        setTimeout(() => asstAddMsg('bot', ui().hint), 300);
        try { localStorage.setItem('amn_voice_hint', '1'); } catch (e) {}
      }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    const close = document.getElementById('asstCloseBtn');
    if (close) close.addEventListener('click', () => { if (window.speechSynthesis) speechSynthesis.cancel(); if (rec && listening) rec.abort(); });
    watchReplies();
  }

  window.AMN_VOICE = { matchCommand };
  if (!SR) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
