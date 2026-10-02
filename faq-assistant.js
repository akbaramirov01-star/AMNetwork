/* AM Network — free, offline FAQ assistant.
 *
 * Replaced the paid /chat AI assistant (October 2026). Every answer below is
 * written ahead of time, so the widget costs nothing per question, works with
 * the backend asleep, and never improvises facts or religious rulings.
 *
 * Matching: the visitor's text is normalised and scored against each entry's
 * keywords (all languages pooled, so a question typed in any language finds
 * its answer); the best entry wins. No match → an honest fallback with links.
 *
 * Keep the facts in sync with CLAUDE.md (launch status, fees, figures).
 */
(function(){
  const LANGS = ['en','ru','tj','ar','id','tr','zh','ms','fr','de'];

  const UI = {
    en:{title:'Assistant', more:'Other questions', open:'Open'},
    ru:{title:'Помощник', more:'Другие вопросы', open:'Открыть'},
    tj:{title:'Ёрдамчӣ', more:'Саволҳои дигар', open:'Кушодан'},
  };

  const FALLBACK = {
    en:"I don't have a ready answer to that. Try one of the questions below, read the FAQ (amnetwork.io/faq), or write to contact@amnetwork.io — a person will reply. For a fiqh question about your own situation, please ask a qualified scholar.",
    ru:"На этот вопрос у меня нет готового ответа. Выберите один из вопросов ниже, загляните в FAQ (amnetwork.io/faq) или напишите на contact@amnetwork.io — ответит человек. С вопросом фикха о вашей личной ситуации, пожалуйста, обратитесь к знающему учёному.",
    tj:"Ба ин савол ҷавоби тайёр надорам. Яке аз саволҳои зеринро интихоб кунед, FAQ-ро бинед (amnetwork.io/faq) ё ба contact@amnetwork.io нависед — шахс ҷавоб медиҳад. Барои саволи фиқҳӣ дар бораи вазъияти шахсии худ, лутфан ба олими донишманд муроҷиат кунед.",
  };

  // kw: lowercase fragments in any language; longer, more specific ones score higher.
  const KB = [
    { id:'what', top:true,
      kw:['what is am network','about am network','who are you','what do you do','что такое am network','что такое ам','кто вы','чем занимаетесь','о проекте','am network чӣ','шумо кистед','дар бораи лоиҳа','am network'],
      q:{en:'What is AM Network?', ru:'Что такое AM Network?', tj:'AM Network чист?'},
      a:{
        en:"AM Network is building a Zakat and Sadaqah platform you can verify. AI assesses each recipient's need on a 0–100 scale, a trusted local verifier (a mosque imam, an AM Network volunteer or a partner charity) confirms the person in real life, and every transfer is recorded on a public blockchain. 100% of your Zakat goes to the recipient. We are pre-launch and do not accept donations yet.",
        ru:"AM Network создаёт платформу Закята и Садаки, которую можно проверить. ИИ оценивает нуждаемость каждого получателя по шкале 0–100, доверенный проверяющий на месте (имам мечети, волонтёр AM Network или партнёрский фонд) подтверждает человека вживую, а каждый перевод записывается в публичный блокчейн. Получатель получает 100% вашего Закята. Сейчас мы до запуска и пожертвования пока не принимаем.",
        tj:"AM Network платформаи Закот ва Садақаеро месозад, ки онро санҷидан мумкин аст. Зеҳни сунъӣ эҳтиёҷи ҳар гирандаро аз 0 то 100 баҳо медиҳад, тасдиқкунандаи боэътимоди маҳаллӣ (имоми масҷид, ихтиёриёни AM Network ё созмони хайрияи шарик) шахсро дар ҳаёти воқеӣ тасдиқ мекунад ва ҳар интиқол дар блокчейни ошкоро сабт мешавад. 100% Закоти шумо ба гиранда мерасад. Мо ҳоло то оғоз ҳастем ва хайрия қабул намекунем."},
      link:'/#how' },
    { id:'how', top:true,
      kw:['how does it work','how it works','how do you verify','step','как это работает','как работает','как проверяете','шаги','чӣ тавр кор мекунад','чӣ гуна кор','қадамҳо'],
      q:{en:'How does it work?', ru:'Как это работает?', tj:'Чӣ тавр кор мекунад?'},
      a:{
        en:"Five steps: 1) you calculate your Zakat and choose a recipient or the general pool; 2) the recipient's application is scored 0–100 by AI; 3) a local verifier confirms them in person; 4) the funds wait in a smart contract and are released only when two different verifiers confirm delivery; 5) you get a link to the public on-chain record. Personal data never goes on the blockchain.",
        ru:"Пять шагов: 1) вы рассчитываете Закят и выбираете получателя или общий пул; 2) заявку получателя ИИ оценивает по шкале 0–100; 3) проверяющий на месте подтверждает человека лично; 4) средства ждут в смарт-контракте и выпускаются, только когда доставку подтвердят два разных проверяющих; 5) вы получаете ссылку на публичную запись в блокчейне. Личные данные в блокчейн не попадают.",
        tj:"Панҷ қадам: 1) шумо Закотро ҳисоб карда, гиранда ё фонди умумиро интихоб мекунед; 2) аризаи гирандаро зеҳни сунъӣ аз 0 то 100 баҳо медиҳад; 3) тасдиқкунандаи маҳаллӣ ӯро шахсан тасдиқ мекунад; 4) маблағ дар қарордоди ақлонӣ интизор мешавад ва танҳо вақте ки ду тасдиқкунандаи гуногун расониданро тасдиқ кунанд, интиқол меёбад; 5) шумо истиноди сабти ошкороро дар блокчейн мегиред. Маълумоти шахсӣ ба блокчейн намеравад."},
      link:'/#how' },
    { id:'launch', top:true,
      kw:['when','launch','start','release date','beta','когда','запуск','старт','бета','кай','оғоз','кай сар мешавад'],
      q:{en:'When do you launch?', ru:'Когда запуск?', tj:'Кай оғоз мешавад?'},
      a:{
        en:"A beta on the Base test network is planned for Q4 2026 — with no real money. Real Zakat transfers start only after three things are done: an independent security audit, a formal fatwa, and legal registration. We won't promise a date before then. Join the waitlist and we'll write to you personally before launch.",
        ru:"Бета в тестовой сети Base запланирована на 4-й квартал 2026 года — без реальных денег. Настоящие переводы Закята начнутся только после трёх шагов: независимый аудит безопасности, официальная фетва и юридическая регистрация. Обещать дату раньше этого мы не будем. Запишитесь в лист ожидания — мы лично напишем вам перед запуском.",
        tj:"Версияи бета дар шабакаи санҷишии Base барои семоҳаи 4-уми соли 2026 ба нақша гирифта шудааст — бидуни пули воқеӣ. Интиқоли воқеии Закот танҳо пас аз се кор оғоз мешавад: аудити мустақили амният, фатвои расмӣ ва бақайдгирии ҳуқуқӣ. То он вақт санаро ваъда намедиҳем. Ба рӯйхати интизорӣ шомил шавед — пеш аз оғоз ба шумо шахсан менависем."},
      link:'/#waitlist' },
    { id:'donate', top:true,
      kw:['donate','give money','send money','pay zakat','can i give','пожертв','отправить деньги','заплатить закят','перевести деньги','как дать','хайрия','пул фиристодан','закот додан'],
      q:{en:'Can I donate now?', ru:'Можно пожертвовать сейчас?', tj:'Ҳозир хайрия кардан мумкин?'},
      a:{
        en:"Not yet. AM Network does not accept any donations before launch. If anyone asks you to send money in our name, it is not us — please report it to contact@amnetwork.io. Meanwhile you can calculate your Zakat with our free calculator and join the waitlist.",
        ru:"Пока нет. До запуска AM Network не принимает никаких пожертвований. Если кто-то просит перевести деньги от нашего имени — это не мы, сообщите на contact@amnetwork.io. А пока можно рассчитать Закят бесплатным калькулятором и записаться в лист ожидания.",
        tj:"Ҳоло не. То оғоз AM Network ягон хайрия қабул намекунад. Агар касе аз номи мо пул талаб кунад — ин мо нестем, ба contact@amnetwork.io хабар диҳед. Ҳоло шумо метавонед Закотро бо ҳисобкунаки ройгон ҳисоб кунед ва ба рӯйхати интизорӣ шомил шавед."},
      link:'/zakat/' },
    { id:'calc', top:true,
      kw:['calculate','calculator','how much zakat','2.5','рассчитать','калькулятор','сколько закят','сколько платить','ҳисоб','ҳисобкунак','чанд закот'],
      q:{en:'How do I calculate Zakat?', ru:'Как рассчитать Закят?', tj:'Закотро чӣ тавр ҳисоб кунам?'},
      a:{
        en:"Zakat is 2.5% of qualifying wealth (cash, savings, gold and silver, trade goods, money owed to you that you expect back, minus debts due now) once it has stayed above the nisab for one lunar year. Our free calculator covers 159 countries and shows the current nisab. For an unusual case, check with a qualified scholar.",
        ru:"Закят — это 2,5% от облагаемого имущества (наличные, сбережения, золото и серебро, товары для торговли, долги, которые вам вернут, минус долги к выплате сейчас), если оно оставалось выше нисаба один лунный год. Наш бесплатный калькулятор работает для 159 стран и показывает текущий нисаб. В необычной ситуации уточните у знающего учёного.",
        tj:"Закот 2,5% аз молу мулки закотдор аст (пули нақд, пасандоз, тилло ва нуқра, моли тиҷоратӣ, қарзҳое ки ба шумо бармегарданд, бе қарзҳои ҳозира), агар он як соли қамарӣ аз нисоб боло монда бошад. Ҳисобкунаки ройгони мо барои 159 кишвар кор мекунад ва нисоби ҷориро нишон медиҳад. Дар ҳолати ғайриоддӣ аз олими донишманд пурсед."},
      link:'/zakat/' },
    { id:'nisab',
      kw:['nisab','threshold','minimum','85','нисаб','порог','минимум','нисоб','ҳадди ақал'],
      q:{en:'What is the nisab?', ru:'Что такое нисаб?', tj:'Нисоб чист?'},
      a:{
        en:"The nisab is the minimum wealth at which Zakat becomes due: the value of 85 g of gold or 595 g of silver. Scholars differ on which one to use; the silver nisab is lower, so more people pay. The calculator shows both at today's prices.",
        ru:"Нисаб — минимальное имущество, с которого обязателен Закят: стоимость 85 г золота или 595 г серебра. Учёные расходятся, какой из них брать; нисаб по серебру ниже, поэтому платящих по нему больше. Калькулятор показывает оба по сегодняшним ценам.",
        tj:"Нисоб ҳадди ақали моле аст, ки аз он Закот воҷиб мешавад: арзиши 85 г тилло ё 595 г нуқра. Уламо дар кадомашро гирифтан ихтилоф доранд; нисоби нуқра пасттар аст, бинобар ин шумораи пардохткунандагон бештар мешавад. Ҳисобкунак ҳардуро бо нархи имрӯза нишон медиҳад."},
      link:'/zakat/' },
    { id:'help', top:true,
      kw:['i need help','need money','apply','application','receive zakat','get help','помощь','нужна помощь','подать заявку','заявк','получить закят','кӯмак','ариза','кӯмак лозим','гирифтани закот'],
      q:{en:'I need help — how do I apply?', ru:'Мне нужна помощь — как подать заявку?', tj:'Ба ман кӯмак лозим — чӣ тавр ариза диҳам?'},
      a:{
        en:"You can fill in the confidential 5-step application at amnetwork.io/apply. Please be aware: we are pre-launch and no payouts have started yet. Your application helps us prepare the verified recipient list for launch; we will contact you. If you are in urgent need now, please also reach out to your local mosque or a charity near you.",
        ru:"Можно заполнить конфиденциальную заявку из 5 шагов на amnetwork.io/apply. Важно: мы ещё до запуска, выплаты пока не начались. Ваша заявка поможет подготовить список проверенных получателей к запуску, мы с вами свяжемся. Если помощь нужна срочно, пожалуйста, обратитесь также в ближайшую мечеть или благотворительный фонд.",
        tj:"Шумо метавонед аризаи махфии 5-қадамаро дар amnetwork.io/apply пур кунед. Муҳим: мо ҳоло то оғоз ҳастем ва пардохтҳо ҳанӯз сар нашудаанд. Аризаи шумо ба тайёр кардани рӯйхати гирандагони тасдиқшуда кӯмак мекунад, мо бо шумо тамос мегирем. Агар кӯмак фавран лозим бошад, лутфан ба масҷид ё созмони хайрияи наздик низ муроҷиат кунед."},
      link:'/apply/' },
    { id:'fee',
      kw:['fee','commission','ujrah','cost','charge','percent','комисси','процент','сколько берёте','уджра','ujra','ҳаққи хизмат','комиссия','фоиз'],
      q:{en:'What fee do you charge?', ru:'Какая комиссия?', tj:'Ҳаққи хизмат чанд аст?'},
      a:{
        en:"A transparent service fee (ujrah) of 1–2.5%, depending on the amount, paid on top of your Zakat — never taken out of it. So 100% of the Zakat reaches the recipient. The 2.5% cap is written into the smart contract. No interest, no hidden fees, no selling of data.",
        ru:"Прозрачная плата за услугу (уджра) 1–2,5% в зависимости от суммы, она платится сверх Закята, а не берётся из него. Поэтому получатель получает 100% Закята. Потолок 2,5% зашит в смарт-контракт. Никаких процентов, скрытых комиссий и продажи данных.",
        tj:"Ҳаққи хизмати шаффоф (уҷра) 1–2,5% вобаста ба маблағ, ки болои Закот пардохт мешавад, на аз худи он. Бинобар ин 100% Закот ба гиранда мерасад. Ҳадди 2,5% дар қарордоди ақлонӣ навишта шудааст. Ҳеҷ фоиз, ҳаққи пинҳонӣ ва фурӯши маълумот нест."},
      link:'/#trust' },
    { id:'token',
      kw:['token','coin','crypto','buy','invest','токен','монет','крипт','купить','инвест','токен','криптовалюта','харидан'],
      q:{en:'Do you have a token or coin?', ru:'У вас есть токен или монета?', tj:'Шумо токен ё танга доред?'},
      a:{
        en:"No. AM Network has no token and will not issue a speculative one — many scholars consider such tokens impermissible (gharar and maysir). Anyone selling an \"AM Network token\" is a scammer. Transfers will settle in stable value (e.g. USDC), and our only income is the service fee.",
        ru:"Нет. У AM Network нет токена, и спекулятивный токен мы выпускать не будем — многие учёные считают такие токены недопустимыми (гарар и майсир). Кто продаёт «токен AM Network» — мошенник. Переводы будут в стабильной стоимости (например, USDC), а наш единственный доход — плата за услугу.",
        tj:"Не. AM Network токен надорад ва токени спекулятивӣ намебарорад — бисёр уламо чунин токенҳоро ҷоиз намедонанд (ғарар ва майсир). Ҳар касе «токени AM Network» мефурӯшад, фиребгар аст. Интиқолҳо бо арзиши устувор (масалан, USDC) мешаванд ва даромади ягонаи мо ҳаққи хизмат аст."},
      link:'/#trust' },
    { id:'halal',
      kw:['halal','haram','sharia','shariah','fatwa','permissible','халяль','харам','шариат','фетв','дозволено','ҳалол','ҳаром','шариат','фатво','ҷоиз'],
      q:{en:'Is it Sharia-compliant?', ru:'Это соответствует шариату?', tj:'Ин ба шариат мувофиқ аст?'},
      a:{
        en:"The model is built on wakala bil ujrah (acting as your agent for a disclosed fee): no interest, no speculative token, and the fee is charged on top of the Zakat. A formal fatwa is still pending — we are seeking a Sharia board and will not launch real transfers without it. This assistant does not give religious rulings; for your own case, please ask a qualified scholar.",
        ru:"Модель построена на вакале биль-уджра (мы действуем как ваш представитель за заранее известную плату): без процентов, без спекулятивного токена, плата берётся сверх Закята. Официальной фетвы пока нет — мы ищем Шариатский совет и без фетвы реальные переводы не запустим. Этот помощник не выносит религиозных решений; по вашему случаю, пожалуйста, обратитесь к знающему учёному.",
        tj:"Модел бар вакола бил-уҷра сохта шудааст (мо ҳамчун намояндаи шумо бо ҳаққи пешакӣ маълум амал мекунем): бе фоиз, бе токени спекулятивӣ ва ҳаққи хизмат болои Закот гирифта мешавад. Фатвои расмӣ ҳанӯз нест — мо Шӯрои шариатиро ҷустуҷӯ дорем ва бе фатво интиқоли воқеиро оғоз намекунем. Ин ёрдамчӣ ҳукми шаръӣ намедиҳад; барои ҳолати худ лутфан аз олими донишманд пурсед."},
      link:'/faq/' },
    { id:'score',
      kw:['score','scoring','ai','0-100','0–100','assessment','оценк','скоринг','балл','ии','баҳо','балл','зеҳни сунъӣ'],
      q:{en:'What is the AI score?', ru:'Что такое ИИ-оценка?', tj:'Баҳои зеҳни сунъӣ чист?'},
      a:{
        en:"The AI score (0–100) estimates how urgent a recipient's need is, from income, family, housing, health and other factors, across 15 need groups mapped to the eight Zakat categories in the Quran (9:60). The score never decides alone — a human verifier always confirms. You can try a demo at amnetwork.io/ai_scoring.",
        ru:"ИИ-оценка (0–100) показывает, насколько срочна нужда получателя, по доходу, семье, жилью, здоровью и другим факторам, в 15 группах нуждаемости, привязанных к восьми категориям Закята из Корана (9:60). Оценка никогда не решает в одиночку — человек-проверяющий всегда подтверждает. Демо можно попробовать на amnetwork.io/ai_scoring.",
        tj:"Баҳои зеҳни сунъӣ (0–100) нишон медиҳад, ки эҳтиёҷи гиранда то чӣ андоза фаврӣ аст: аз рӯи даромад, оила, манзил, саломатӣ ва омилҳои дигар, дар 15 гурӯҳи эҳтиёҷ, ки ба ҳашт категорияи Закот дар Қуръон (9:60) вобастаанд. Баҳо ҳеҷ гоҳ танҳо қарор намебарорад — ҳамеша тасдиқкунандаи инсон тасдиқ мекунад. Демоашро дар amnetwork.io/ai_scoring санҷед."},
      link:'/ai_scoring/' },
    { id:'academy',
      kw:['academy','course','learn','lesson','certificate','академи','курс','урок','обучен','сертификат','академия','дарс','омӯзиш','сертификат'],
      q:{en:'What is AM Academy?', ru:'Что такое AM Academy?', tj:'AM Academy чист?'},
      a:{
        en:"AM Academy is free, Sharia-compliant financial literacy: 5 modules, 20 lessons, every claim with a source you can open, and a downloadable certificate when you pass a module. Open it at amnetwork.io/academy.",
        ru:"AM Academy — бесплатная финансовая грамотность по шариату: 5 модулей, 20 уроков, у каждого утверждения источник, который можно открыть, и сертификат после прохождения модуля. Открыть: amnetwork.io/academy.",
        tj:"AM Academy — саводнокии молиявии ройгон мувофиқи шариат: 5 модул, 20 дарс, ҳар иддао бо манбаъе, ки кушодан мумкин аст, ва сертификат пас аз гузаштани модул. Кушодан: amnetwork.io/academy."},
      link:'/academy/' },
    { id:'tools',
      kw:['quran','hadith','prayer time','namaz','qibla','dua','tasbeeh','calendar','коран','хадис','намаз','кибла','дуа','тасбих','календар','қуръон','ҳадис','намоз','қибла','дуо','тақвим'],
      q:{en:'What free tools do you have?', ru:'Какие есть бесплатные инструменты?', tj:'Кадом абзорҳои ройгон доред?'},
      a:{
        en:"All free, in 10 languages: the Noble Quran (114 surahs, translations, reciters, Mushaf view, offline saving), Hadith (Bukhari, Muslim, Tirmidhi), Dua & Dhikr, a Tasbeeh counter, prayer times with a daily tracker, Qibla direction and an Islamic calendar. Find them under \"Tools\" in the menu.",
        ru:"Всё бесплатно, на 10 языках: Священный Коран (114 сур, переводы, чтецы, вид мусхафа, сохранение офлайн), хадисы (Бухари, Муслим, Тирмизи), дуа и зикры, счётчик тасбиха, время намаза с ежедневным трекером, направление киблы и исламский календарь. Ищите в меню «Инструменты».",
        tj:"Ҳама ройгон, бо 10 забон: Қуръони Карим (114 сура, тарҷумаҳо, қориён, намуди мусҳаф, нигоҳдории офлайн), ҳадисҳо (Бухорӣ, Муслим, Тирмизӣ), дуо ва зикр, шуморандаи тасбеҳ, вақти намоз бо пайгирии ҳаррӯза, самти қибла ва тақвими исломӣ. Дар меню «Абзорҳо»-ро бинед."},
      link:'/quran/' },
    { id:'sadaqah',
      kw:['sadaqah','sadaqa','difference','voluntary','садак','разница','отличие','добровольн','садақа','фарқ','ихтиёрӣ'],
      q:{en:'Zakat vs Sadaqah?', ru:'Закят и садака — в чём разница?', tj:'Фарқи Закот ва Садақа?'},
      a:{
        en:"Zakat is obligatory: 2.5% of qualifying wealth above the nisab, once a lunar year, and only for the eight categories named in the Quran (9:60). Sadaqah is voluntary charity — any amount, any time, for any good cause. AM Network will support both.",
        ru:"Закят обязателен: 2,5% облагаемого имущества выше нисаба раз в лунный год и только для восьми категорий, названных в Коране (9:60). Садака — добровольная милостыня: любая сумма, в любое время, на любое благое дело. AM Network будет поддерживать оба вида.",
        tj:"Закот фарз аст: 2,5% моли закотдор болотар аз нисоб, як бор дар соли қамарӣ ва танҳо барои ҳашт категорияи дар Қуръон (9:60) номбаршуда. Садақа хайрияи ихтиёрӣ аст: ҳар маблағ, ҳар вақт, барои ҳар кори нек. AM Network ҳардуро дастгирӣ мекунад."},
      link:'/zakat/' },
    { id:'privacy',
      kw:['privacy','data','personal','secure','safe','конфиденц','данные','личн','безопас','махфӣ','маълумот','амният'],
      q:{en:'Is my data safe?', ru:'Мои данные в безопасности?', tj:'Маълумоти ман бехатар аст?'},
      a:{
        en:"Personal data is never written to the blockchain — only transaction hashes, amounts, times and status. We never sell data. Analytics run only after you accept cookies. You can ask us to delete your data at any time: contact@amnetwork.io.",
        ru:"Личные данные никогда не записываются в блокчейн — только хэши транзакций, суммы, время и статус. Мы никогда не продаём данные. Аналитика включается только после согласия на cookies. Удалить свои данные можно в любой момент: contact@amnetwork.io.",
        tj:"Маълумоти шахсӣ ҳеҷ гоҳ ба блокчейн навишта намешавад — танҳо хэши амалиёт, маблағ, вақт ва ҳолат. Мо ҳеҷ гоҳ маълумот намефурӯшем. Таҳлил танҳо пас аз розигӣ ба cookies фаъол мешавад. Маълумоти худро ҳар вақт метавонед нест кунед: contact@amnetwork.io."},
      link:'/privacy/' },
    { id:'contact',
      kw:['contact','email','partner','partnership','job','team','work with','invest','контакт','почта','связаться','партнер','партнёр','работа','команд','инвестор','тамос','почта','шарик','кор','даста','сармоягузор'],
      q:{en:'How can I contact you or partner?', ru:'Как связаться или стать партнёром?', tj:'Чӣ тавр тамос гирам ё шарик шавам?'},
      a:{
        en:"General questions: contact@amnetwork.io. Mosques, charities and organisations: partners@amnetwork.io. Joining the team (we are looking for a CTO): team@amnetwork.io. Investors: amnetwork.io/investors. Social: Instagram and X @amnet_io, Telegram @amnetwork_global, YouTube @amnetwork_io, TikTok @amnetwork.io.",
        ru:"Общие вопросы: contact@amnetwork.io. Мечети, фонды и организации: partners@amnetwork.io. В команду (ищем CTO): team@amnetwork.io. Инвесторам: amnetwork.io/investors. Соцсети: Instagram и X @amnet_io, Telegram @amnetwork_global, YouTube @amnetwork_io, TikTok @amnetwork.io.",
        tj:"Саволҳои умумӣ: contact@amnetwork.io. Масҷидҳо, созмонҳои хайрия ва ташкилотҳо: partners@amnetwork.io. Ба даста (CTO меҷӯем): team@amnetwork.io. Сармоягузорон: amnetwork.io/investors. Шабакаҳо: Instagram ва X @amnet_io, Telegram @amnetwork_global, YouTube @amnetwork_io, TikTok @amnetwork.io."},
      link:'/team/' },
    { id:'founder',
      kw:['founder','who created','akbar','amirzoda','основател','кто создал','акбар','амирзода','асосгузор','кӣ сохт'],
      q:{en:'Who founded AM Network?', ru:'Кто основал AM Network?', tj:'AM Network-ро кӣ таъсис дод?'},
      a:{
        en:"AM Network was founded by Akbar Amirzoda — an economist (Plekhanov Russian University of Economics, Moscow) and diplomat. More on the Team page.",
        ru:"AM Network основал Акбар Амирзода — экономист (РЭУ им. Плеханова, Москва) и дипломат. Подробнее — на странице команды.",
        tj:"AM Network-ро Акбар Амирзода таъсис додааст — иқтисоддон (Донишгоҳи иқтисодии ба номи Плеханов, Маскав) ва дипломат. Тафсилот дар саҳифаи даста."},
      link:'/team/' },
    { id:'waitlist',
      kw:['waitlist','wait list','sign up','register','subscribe','early access','лист ожидания','записаться','регистрац','подписаться','рӯйхати интизорӣ','сабти ном','шомил'],
      q:{en:'How do I join the waitlist?', ru:'Как записаться в лист ожидания?', tj:'Чӣ тавр ба рӯйхати интизорӣ шомил шавам?'},
      a:{
        en:"Scroll to \"Join the Waitlist\" on the home page, enter your name and email, and choose who you are (donor, mosque, charity, investor). No spam — we will write personally before launch.",
        ru:"Прокрутите главную до «Лист ожидания», укажите имя, email и кто вы (донор, мечеть, фонд, инвестор). Без спама — мы лично напишем перед запуском.",
        tj:"Дар саҳифаи асосӣ то «Рӯйхати интизорӣ» поён равед, ном, email ва кӣ будани худро (донор, масҷид, созмони хайрия, сармоягузор) нависед. Бе спам — пеш аз оғоз шахсан менависем."},
      link:'/#waitlist' },
  ];

  function norm(s){
    return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}.\-–\s]/gu,' ').replace(/\s+/g,' ').trim();
  }
  function pick(map, lang){ return (map && (map[lang] || map.en)) || ''; }

  function reply(text, lang){
    const t = ' ' + norm(text) + ' ';
    let best = null, bestScore = 0;
    KB.forEach(e => {
      let sc = 0;
      e.kw.forEach(k => {
        const kn = norm(k);
        if (!kn) return;
        // short keywords (≤3 chars, e.g. "ai", "ии") must match a whole word
        const hit = kn.length <= 3 ? t.includes(' ' + kn + ' ') : t.includes(kn);
        if (hit) sc += Math.min(kn.length, 14);
      });
      if (sc > bestScore) { bestScore = sc; best = e; }
    });
    if (!best) return { text: pick(FALLBACK, lang), entry: null };
    return { text: pick(best.a, lang), entry: best };
  }

  function suggestions(lang, excludeId){
    const top = KB.filter(e => e.top && e.id !== excludeId);
    const rest = KB.filter(e => !e.top && e.id !== excludeId);
    return (excludeId ? top.slice(0,2).concat(rest.slice(0,2)) : top.slice(0,5));
  }

  // Renders tappable question chips (and an optional "open" link) into the
  // message list. onAsk(text) is the page's send function.
  function renderChips(box, lang, onAsk, entry){
    const ui = UI[lang] || UI.en;
    const wrap = document.createElement('div');
    wrap.className = 'asst-chips';
    if (entry && entry.link) {
      const a = document.createElement('a');
      a.className = 'asst-chip asst-chip-link';
      a.href = entry.link;
      a.textContent = ui.open + ' →';
      wrap.appendChild(a);
    }
    suggestions(lang, entry ? entry.id : null).forEach(e => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'asst-chip';
      b.textContent = pick(e.q, lang);
      b.addEventListener('click', () => { wrap.querySelectorAll('button').forEach(x => x.disabled = true); onAsk(pick(e.q, lang)); });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
  }

  // One-time style injection so each page needs no CSS edits.
  const css = document.createElement('style');
  css.textContent = '.asst-chips{display:flex;flex-wrap:wrap;gap:6px;align-self:stretch}' +
    '.asst-chip{font:inherit;font-size:13px;line-height:1.3;padding:7px 11px;border-radius:999px;border:1px solid rgba(201,168,76,.45);background:transparent;color:var(--text,#eee);cursor:pointer;text-align:left;text-decoration:none}' +
    '.asst-chip:hover{background:rgba(201,168,76,.12)}.asst-chip:disabled{opacity:.45;cursor:default}' +
    '.asst-chip-link{background:var(--gold,#C9A84C);color:#0A1A11;border-color:transparent;font-weight:700}';
  (document.head || document.documentElement).appendChild(css);

  window.AMN_FAQ = { KB, UI, FALLBACK, LANGS, reply, renderChips,
    title: lang => (UI[lang] || UI.en).title };
})();
