# Publishing AM Network to Google Play and the App Store

Everything in the repo is ready. What is left is the part only the account
holder can do: paying the fees, generating keys, and pressing submit.

The site is a PWA, so neither store gets a hand-written app. Google Play
takes the site wrapped in a Trusted Web Activity (TWA); the App Store does
not accept a bare web wrapper, so iOS needs a thin native shell — see the
iOS section, and read the warning in it before spending money.

---

## What is already done (no action needed)

- `manifest.json`: app id, name, description, categories, `display_override`,
  portrait lock, shortcuts to Quran / Prayer / Qibla / Zakat.
- Maskable icons at `/icons/maskable-192.png` and `/icons/maskable-512.png`
  — the normal icons have the logo running to the edge, which Android's
  circular mask would shave; these keep it inside the safe zone.
- Store screenshots in `/screenshots/` — four phone (1080×1920) and one
  desktop (1920×1080), captured from the real site.
- Service worker registered on every page (not just the homepage), plus an
  offline fallback page at `/offline.html` in all 10 languages.
- iOS standalone meta tags on every page.
- `/.well-known/assetlinks.json` — present, with a placeholder fingerprint
  that you must replace (step 4 below).

---

## Google Play — step by step

**1. Developer account.** play.google.com/console — one-time $25. Register
as an organisation if the legal entity exists by then; switching from a
personal account to a company account later means re-publishing from
scratch, so decide this before you submit.

**2. Build the TWA.** Easiest route, no Android Studio needed:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://amnetwork.io/manifest.json
# accept the defaults; when it asks for the application id use: io.amnetwork.twa
bubblewrap build
```

This produces `app-release-bundle.aab` (what you upload) and a signing key.

**3. Back up the signing key.** `android.keystore` plus its passwords. If
you lose it you can never update the app again under the same listing —
only publish a new one and lose your installs and reviews. Put it in a
password manager, not only on the laptop.

**4. Publish the fingerprint.** Get the SHA-256 of your signing key:

```bash
keytool -list -v -keystore android.keystore -alias android
```

Put that value into `/.well-known/assetlinks.json`, replacing
`REPLACE_WITH_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE`, and push. Without this
the app opens with a browser address bar across the top and looks like a
website in a box, which is the single most common reason these submissions
look cheap. If you enable Play App Signing (recommended), take the
fingerprint Play shows you in **Setup → App integrity**, not the local one.

**5. Store listing.** Copy is below. You also need:
- Feature graphic 1024×500 (not in the repo — needs designing).
- App icon 512×512 → use `/icons/icon-512.png`.
- Screenshots → `/screenshots/*.png`.
- Privacy policy URL → `https://amnetwork.io/privacy/`.

**6. Data safety form.** Declare honestly, or the listing gets pulled later:
- *Location*: collected, not stored — prayer times and qibla only. Sent to
  AlAdhan and BigDataCloud to resolve times/city.
- *Personal info (name, email)*: collected via the application form, for
  assessing an aid application; delivered through Web3Forms; user can
  request deletion.
- *Sensitive*: the application form asks about income, household and
  situation category. Declare it. Do not describe it as anonymous.
- *No ads, no analytics identifiers sold, no third-party marketing.*

**7. Content rating.** IARC questionnaire. Nothing in the app is age-gated;
answer "no" throughout and expect "Everyone".

---

## App Store — read this first

Apple rejects apps that are only a website in a wrapper (guideline 4.2,
"minimum functionality"). A TWA-equivalent alone will very likely be
refused. Realistic options:

1. **Wait.** Publish on Play first, and submit to Apple once the Zakat flow
   itself exists in-app — at that point there is a native reason to exist.
2. **Ship a thin native shell** that adds something the web cannot do on
   iOS: local prayer-time notifications (iOS Safari still has no usable Web
   Push outside an installed PWA), a home-screen widget, offline Quran
   audio. That is real native work — a contractor, a few weeks.

Either way the $99/year Apple Developer Program fee is only worth paying
once you have picked one of those. Do not pay it to find out.

Note for whoever builds the shell: Apple will also ask about the donation
flow. Charitable donations may not go through in-app purchase, so they must
be a web view or an external link — that is allowed, but get it right or it
is an automatic rejection.

---

## Store listing copy

Play limits: title 30 chars, short description 80, full description 4000.

### English
**Title:** AM Network: Quran & Zakat
**Short:** Quran with word-by-word audio, prayer times, qibla, dua and a Zakat calculator.
**Full:**
Free Islamic tools in 10 languages, with nothing invented and every source named.

• The Holy Quran — 114 surahs, certified translations, official reciters, word-by-word highlighting as you listen, and a real Madinah-layout Mushaf view
• Hadith — Sahih al-Bukhari, Sahih Muslim and Jami' at-Tirmidhi by chapter
• Dua & Dhikr — morning and evening adhkar, dhikr after prayer, daily duas, each with its hadith citation
• Prayer times — five calculation methods, with a daily prayer tracker
• Qibla — compass and manual coordinates
• Tasbeeh — a counter that works completely offline
• Islamic calendar — Hijri date and converter
• 99 Names of Allah
• Live from Makkah and Madinah
• Zakat calculator — gold and silver nisab, 159 countries
• AM Academy — Islamic finance explained plainly

We never write, edit or paraphrase religious text ourselves. The Quran comes from Tanzil, translations from certified scholars, recitations from licensed reciters, hadith from an open published dataset — each shown exactly as published, with its source. Where a translation was produced by AI because no certified one exists, it says so on the page.

AM Network is also building blockchain-verified Zakat distribution with AI-assisted, human-verified recipients. That part is pre-launch: no payments are being taken, and the app says so plainly wherever it comes up.

No ads. No tracking for advertising. No account required.

### Русский
**Title:** AM Network: Коран и Закят
**Short:** Коран с чтением по словам, время намаза, кибла, дуа и калькулятор закята.
**Full:**
Бесплатные исламские инструменты на 10 языках. Ничего не придумано, у каждого текста указан источник.

• Священный Коран — 114 сур, проверенные переводы, официальные чтецы, подсветка по словам во время чтения и вид Мусхафа в мединской вёрстке
• Хадисы — Сахих аль-Бухари, Сахих Муслим и Джами ат-Тирмизи по главам
• Дуа и зикр — утренние и вечерние азкары, зикр после намаза, ежедневные дуа, каждое со ссылкой на хадис
• Время намаза — пять методов расчёта и трекер намазов
• Кибла — компас и ручной ввод координат
• Тасбих — счётчик, работающий полностью офлайн
• Исламский календарь — дата по хиджре и конвертер
• 99 имён Аллаха
• Прямой эфир из Мекки и Медины
• Калькулятор закята — нисаб по золоту и серебру, 159 стран
• AM Academy — исламские финансы понятным языком

Мы никогда сами не пишем, не редактируем и не пересказываем религиозные тексты. Коран — из проекта Tanzil, переводы — от сертифицированных учёных, чтения — от лицензированных чтецов, хадисы — из открытого опубликованного датасета. Всё показано ровно так, как опубликовано, с указанием источника. Если перевод сделан ИИ, потому что сертифицированного не существует, на странице об этом прямо написано.

AM Network также строит распределение закята с проверкой на блокчейне и получателями, которых оценивает ИИ, а подтверждает человек. Эта часть ещё не запущена: платежи не принимаются, и приложение честно об этом сообщает.

Без рекламы. Без слежки в рекламных целях. Без регистрации.

### العربية
**Title:** AM Network: القرآن والزكاة
**Short:** القرآن بتلاوة كلمة بكلمة، مواقيت الصلاة، القبلة، الأدعية وحاسبة الزكاة.
**Full:**
أدوات إسلامية مجانية بعشر لغات، دون أي محتوى من تأليفنا، ومع ذكر المصدر دائماً.

• القرآن الكريم — ١١٤ سورة، ترجمات معتمدة، قرّاء رسميون، إبراز الكلمات أثناء الاستماع، وعرض المصحف بتخطيط المدينة
• الحديث — صحيح البخاري وصحيح مسلم وجامع الترمذي حسب الأبواب
• الدعاء والذكر — أذكار الصباح والمساء، أذكار بعد الصلاة، أدعية يومية، كل منها مع تخريجه
• مواقيت الصلاة — خمس طرق حساب مع متابعة الصلوات اليومية
• القبلة — بوصلة وإدخال يدوي للإحداثيات
• التسبيح — عدّاد يعمل دون اتصال تماماً
• التقويم الهجري ومحوّل التواريخ
• أسماء الله الحسنى
• بث مباشر من مكة والمدينة
• حاسبة الزكاة — نصاب الذهب والفضة، ١٥٩ دولة
• AM Academy — التمويل الإسلامي بلغة واضحة

نحن لا نكتب ولا نحرّر ولا نعيد صياغة النصوص الشرعية أبداً. القرآن من مشروع تنزيل، والترجمات من علماء معتمدين، والتلاوات من قرّاء مرخّصين، والأحاديث من مجموعة بيانات منشورة ومفتوحة — كل ذلك كما نُشر تماماً مع مصدره. وحين تكون الترجمة بالذكاء الاصطناعي لعدم وجود ترجمة معتمدة، فذلك مذكور بوضوح في الصفحة.

تعمل AM Network أيضاً على توزيع الزكاة موثقاً بالبلوك تشين، بترشيح من الذكاء الاصطناعي وتحقق بشري. هذا الجزء لم يُطلق بعد: لا تُقبل أي مدفوعات، والتطبيق يوضح ذلك صراحة.

بدون إعلانات. بدون تتبع إعلاني. بدون تسجيل.

### Тоҷикӣ
**Title:** AM Network: Қуръон ва закот
**Short:** Қуръон бо тиловати калима ба калима, вақти намоз, қибла, дуо ва ҳисобкунаки закот.
**Full:**
Абзорҳои исломии ройгон бо 10 забон. Ҳеҷ чиз аз худамон навишта нашудааст, манбаи ҳар матн нишон дода шудааст.

• Қуръони Карим — 114 сура, тарҷумаҳои тасдиқшуда, қориёни расмӣ, равшан кардани калимаҳо ҳангоми шунидан ва намоиши Мусҳаф бо тарҳи Мадина
• Ҳадис — Саҳеҳи Бухорӣ, Саҳеҳи Муслим ва Ҷомеъи Тирмизӣ аз рӯи бобҳо
• Дуо ва зикр — азкори субҳу шом, зикри баъди намоз, дуоҳои ҳаррӯза бо иқтибоси ҳадис
• Вақти намоз — панҷ усули ҳисоб ва пайгирии намозҳо
• Қибла — компас ва воридкунии дастии координатаҳо
• Тасбеҳ — ҳисобкунаке, ки пурра офлайн кор мекунад
• Тақвими исломӣ — санаи ҳиҷрӣ ва табдилдиҳанда
• 99 номи Аллоҳ
• Пахши зинда аз Макка ва Мадина
• Ҳисобкунаки закот — нисоби тилло ва нуқра, 159 кишвар
• AM Academy — молияи исломӣ бо забони фаҳмо

Мо ҳеҷ гоҳ матнҳои диниро худамон наменависем, таҳрир намекунем ва аз нав нақл намекунем. Қуръон аз лоиҳаи Tanzil, тарҷумаҳо аз олимони тасдиқшуда, тиловатҳо аз қориёни иҷозатдор, ҳадисҳо аз маҷмӯаи кушоди нашршуда — ҳама маҳз ҳамон тавре ки нашр шудаанд, бо манбаъ. Агар тарҷума бо зеҳни сунъӣ таҳия шуда бошад, зеро тарҷумаи тасдиқшуда вуҷуд надорад, дар саҳифа ин ошкоро навишта шудааст.

AM Network инчунин тақсимоти закотро бо тасдиқи блокчейн месозад, ки дар он гирандагонро зеҳни сунъӣ баҳо медиҳад ва инсон тасдиқ мекунад. Ин қисм ҳанӯз оғоз нашудааст: пардохтҳо қабул намешаванд ва барнома инро ошкоро мегӯяд.

Бе реклама. Бе пайгирии таблиғотӣ. Бе бақайдгирӣ.

### Bahasa Indonesia
**Title:** AM Network: Quran & Zakat
**Short:** Al-Quran dengan audio per kata, waktu sholat, kiblat, doa, dan kalkulator zakat.
**Full:**
Perangkat Islami gratis dalam 10 bahasa. Tidak ada yang kami karang, dan setiap sumber disebutkan.

• Al-Quran — 114 surah, terjemahan resmi, qari berlisensi, sorotan per kata saat mendengarkan, serta tampilan Mushaf tata letak Madinah
• Hadits — Sahih al-Bukhari, Sahih Muslim, dan Jami' at-Tirmidzi per bab
• Doa & Dzikir — dzikir pagi dan petang, dzikir setelah sholat, doa harian, masing-masing dengan rujukan haditsnya
• Waktu sholat — lima metode perhitungan dan pelacak sholat harian
• Kiblat — kompas dan koordinat manual
• Tasbih — penghitung yang bekerja sepenuhnya offline
• Kalender Hijriah dan konverter tanggal
• 99 Nama Allah
• Siaran langsung dari Makkah dan Madinah
• Kalkulator zakat — nisab emas dan perak, 159 negara
• AM Academy — keuangan syariah dengan bahasa sederhana

Kami tidak pernah menulis, menyunting, atau memparafrasakan teks agama sendiri. Al-Quran dari proyek Tanzil, terjemahan dari ulama bersertifikat, bacaan dari qari berlisensi, hadits dari kumpulan data terbuka yang diterbitkan — semuanya ditampilkan persis sebagaimana diterbitkan, beserta sumbernya. Bila sebuah terjemahan dihasilkan AI karena belum ada terjemahan resmi, hal itu dinyatakan jelas di halamannya.

AM Network juga membangun penyaluran zakat terverifikasi blockchain dengan penerima yang dinilai AI dan diverifikasi manusia. Bagian itu belum diluncurkan: tidak ada pembayaran yang diterima, dan aplikasi menyatakannya secara terbuka.

Tanpa iklan. Tanpa pelacakan iklan. Tanpa registrasi.

### Türkçe
**Title:** AM Network: Kur'an ve Zekât
**Short:** Kelime kelime sesli Kur'an, namaz vakitleri, kıble, dua ve zekât hesaplayıcı.
**Full:**
10 dilde ücretsiz İslami araçlar. Hiçbir şey tarafımızca uydurulmadı, her kaynak belirtildi.

• Kur'an-ı Kerim — 114 sure, onaylı mealler, resmî hafızlar, dinlerken kelime kelime vurgulama ve Medine dizgili Mushaf görünümü
• Hadis — Sahih-i Buhârî, Sahih-i Müslim ve Câmiu't-Tirmizî, bablara göre
• Dua ve Zikir — sabah akşam zikirleri, namaz sonrası zikir, günlük dualar, her biri hadis kaynağıyla
• Namaz vakitleri — beş hesaplama yöntemi ve günlük namaz takibi
• Kıble — pusula ve elle koordinat girişi
• Tesbih — tamamen çevrimdışı çalışan sayaç
• Hicri takvim ve tarih çevirici
• Allah'ın 99 ismi
• Mekke ve Medine'den canlı yayın
• Zekât hesaplayıcı — altın ve gümüş nisabı, 159 ülke
• AM Academy — İslami finans sade bir dille

Dinî metinleri asla kendimiz yazmaz, düzenlemez veya yeniden ifade etmeyiz. Kur'an Tanzil projesinden, mealler onaylı âlimlerden, tilavetler lisanslı hafızlardan, hadisler açık ve yayımlanmış bir veri kümesinden gelir — hepsi yayımlandığı şekliyle, kaynağıyla birlikte gösterilir. Onaylı bir çeviri bulunmadığı için yapay zekâ çevirisi kullanıldığında, sayfada bu açıkça belirtilir.

AM Network ayrıca blokzincirle doğrulanan zekât dağıtımı geliştiriyor; alıcıları yapay zekâ sıralar, insan doğrular. Bu kısım henüz yayında değil: hiçbir ödeme alınmıyor ve uygulama bunu açıkça söylüyor.

Reklam yok. Reklam amaçlı takip yok. Kayıt gerekmez.

### 中文（简体）
**Title:** AM Network：古兰经与天课
**Short:** 逐词诵读的古兰经、礼拜时间、朝向、祈祷词与天课计算器。
**Full:**
十种语言的免费伊斯兰工具。内容绝非我们自撰，每一处都标明出处。

• 尊贵的古兰经——114 章，经认证的译文，官方诵读者，聆听时逐词高亮，以及麦地那版式的穆斯哈夫页面
• 圣训——《布哈里圣训实录》《穆斯林圣训实录》《提尔密济圣训集》，按篇章浏览
• 祈祷与赞念——早晚记主词、拜后记主、日常祈祷词，每条均附圣训出处
• 礼拜时间——五种计算方法，并含每日礼拜记录
• 朝向——指南针与手动输入坐标
• 赞念计数——完全离线可用
• 伊斯兰历与日期转换
• 安拉的99个尊名
• 麦加与麦地那实况直播
• 天课计算器——金银标准，覆盖159个国家
• AM Academy——用通俗语言讲解伊斯兰金融

我们从不自行撰写、编辑或转述宗教经文。古兰经文本来自 Tanzil 项目，译文出自经认证的学者，诵读来自持证诵读者，圣训取自公开发布的开放数据集——全部按原样呈现并注明来源。若因尚无认证译文而采用人工智能翻译，页面会明确说明。

AM Network 也在构建以区块链核验的天课分配，受助人由人工智能排序、由人工核实。该部分尚未上线：不接受任何支付，应用中也已如实说明。

无广告。无广告追踪。无需注册。

### Bahasa Melayu
**Title:** AM Network: Quran & Zakat
**Short:** Al-Quran dengan audio setiap kata, waktu solat, kiblat, doa dan kalkulator zakat.
**Full:**
Alat Islamik percuma dalam 10 bahasa. Tiada apa yang kami reka, dan setiap sumber dinyatakan.

• Al-Quran — 114 surah, terjemahan disahkan, qari rasmi, sorotan setiap kata semasa mendengar, serta paparan Mushaf susun atur Madinah
• Hadis — Sahih al-Bukhari, Sahih Muslim dan Jami' at-Tirmizi mengikut bab
• Doa & Zikir — zikir pagi dan petang, zikir selepas solat, doa harian, setiap satu dengan rujukan hadisnya
• Waktu solat — lima kaedah pengiraan serta penjejak solat harian
• Kiblat — kompas dan koordinat manual
• Tasbih — pengira yang berfungsi sepenuhnya di luar talian
• Kalendar Hijrah dan penukar tarikh
• 99 Nama Allah
• Siaran langsung dari Makkah dan Madinah
• Kalkulator zakat — nisab emas dan perak, 159 negara
• AM Academy — kewangan Islam dalam bahasa mudah

Kami tidak pernah menulis, menyunting atau memparafrasa teks agama sendiri. Al-Quran daripada projek Tanzil, terjemahan daripada ulama bertauliah, bacaan daripada qari berlesen, hadis daripada set data terbuka yang diterbitkan — semuanya dipaparkan tepat seperti diterbitkan, bersama sumbernya. Jika sesuatu terjemahan dihasilkan AI kerana tiada terjemahan disahkan, ia dinyatakan dengan jelas pada halaman berkenaan.

AM Network turut membina pengagihan zakat yang disahkan blockchain, dengan penerima dinilai AI dan disahkan manusia. Bahagian itu belum dilancarkan: tiada pembayaran diterima, dan aplikasi menyatakannya secara terbuka.

Tiada iklan. Tiada penjejakan iklan. Tiada pendaftaran.

### Français
**Title:** AM Network : Coran et Zakat
**Short:** Coran avec audio mot à mot, heures de prière, qibla, douas et calculateur de zakat.
**Full:**
Des outils islamiques gratuits en 10 langues. Rien n'est inventé par nous, et chaque source est citée.

• Le Noble Coran — 114 sourates, traductions certifiées, récitateurs officiels, surlignage mot à mot pendant l'écoute et vue Mushaf en mise en page de Médine
• Hadith — Sahih al-Bukhari, Sahih Muslim et Jami' at-Tirmidhi, par chapitre
• Dua et Dhikr — invocations du matin et du soir, dhikr après la prière, douas quotidiennes, chacune avec sa référence de hadith
• Heures de prière — cinq méthodes de calcul et un suivi quotidien
• Qibla — boussole et coordonnées manuelles
• Tasbih — un compteur entièrement utilisable hors ligne
• Calendrier hégirien et convertisseur de dates
• Les 99 noms d'Allah
• Direct depuis La Mecque et Médine
• Calculateur de zakat — nisab or et argent, 159 pays
• AM Academy — la finance islamique en mots simples

Nous n'écrivons, ne modifions ni ne reformulons jamais nous-mêmes les textes religieux. Le Coran vient du projet Tanzil, les traductions d'érudits certifiés, les récitations de récitateurs agréés, les hadiths d'un jeu de données ouvert publié — le tout affiché exactement tel que publié, avec sa source. Lorsqu'une traduction est produite par IA faute de traduction certifiée, la page le dit clairement.

AM Network développe aussi une distribution de la zakat vérifiée par blockchain, où l'IA classe les bénéficiaires et un humain les vérifie. Cette partie n'est pas lancée : aucun paiement n'est accepté, et l'application le dit franchement.

Sans publicité. Sans pistage publicitaire. Sans inscription.

### Deutsch
**Title:** AM Network: Koran & Zakat
**Short:** Koran mit Wort-für-Wort-Audio, Gebetszeiten, Qibla, Bittgebete, Zakat-Rechner.
**Full:**
Kostenlose islamische Werkzeuge in 10 Sprachen. Nichts davon stammt aus unserer Feder, und jede Quelle wird genannt.

• Der Edle Koran — 114 Suren, geprüfte Übersetzungen, offizielle Rezitatoren, Wort-für-Wort-Hervorhebung beim Hören und eine Mushaf-Ansicht im Medina-Layout
• Hadith — Sahih al-Buchari, Sahih Muslim und Dschami' at-Tirmidhi, nach Kapiteln
• Dua & Dhikr — Morgen- und Abendadhkar, Dhikr nach dem Gebet, tägliche Bittgebete, jeweils mit Hadith-Beleg
• Gebetszeiten — fünf Berechnungsmethoden und ein täglicher Gebets-Tracker
• Qibla — Kompass und manuelle Koordinaten
• Tasbih — ein Zähler, der vollständig offline funktioniert
• Islamischer Kalender und Datumsumrechner
• Die 99 Namen Allahs
• Live aus Mekka und Medina
• Zakat-Rechner — Gold- und Silber-Nisab, 159 Länder
• AM Academy — islamische Finanzen verständlich erklärt

Wir schreiben, bearbeiten oder paraphrasieren religiöse Texte niemals selbst. Der Koran stammt aus dem Tanzil-Projekt, Übersetzungen von zertifizierten Gelehrten, Rezitationen von lizenzierten Rezitatoren, Hadithe aus einem offenen, veröffentlichten Datensatz — alles genau so dargestellt, wie es veröffentlicht wurde, mit Quellenangabe. Wo eine Übersetzung von einer KI erstellt wurde, weil keine geprüfte existiert, steht das deutlich auf der Seite.

AM Network baut außerdem eine per Blockchain verifizierte Zakat-Verteilung auf, bei der eine KI Empfänger einordnet und ein Mensch sie prüft. Dieser Teil ist noch nicht gestartet: Es werden keine Zahlungen angenommen, und die App sagt das offen.

Keine Werbung. Kein Werbetracking. Keine Registrierung.
