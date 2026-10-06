/* Investor questions, the site assistant and the trade representative's profile, in all four languages.
   Every answer carries the sources in FAQ_META; the assistant only answers from this site. */
var FAQ_META = [
 {id:"visa", s:[41]},
 {id:"protect", s:[42,43], go:"investieren"},
 {id:"transfer", s:[42,43]},
 {id:"dta", s:[5]},
 {id:"land", s:[43]},
 {id:"reg", s:[43], go:"investieren"},
 {id:"disputes", s:[42,43]},
 {id:"taxes", s:[8,26], go:"investieren"},
 {id:"fez", s:[9], go:"investieren", anchor:"fezmap"},
 {id:"trip", s:[44], go:"termine"},
 {id:"help", s:[], go:"service"},
 {id:"eu", s:[38], go:"tadschikistan"},
 {id:"gsp", s:[39,14], go:"export", anchor:"a2m"},
 {id:"exporters", s:[32,36], go:"export", anchor:"exporters"}
];
/* questions offered as one-tap suggestions in the assistant */
var ASK_POP = ["visa","protect","transfer","land","taxes","trip"];

(function(){
var M = {
de:{
 faq:{k:"Fragen von Investoren", t:"Kurze Antworten, mit Quelle", l:"Die häufigsten Fragen deutscher Unternehmen zu Einreise, Rechtsschutz, Steuern und Grund und Boden.", items:{
  visa:{q:"Brauchen deutsche Staatsangehörige ein Visum für Tadschikistan?", a:"Für Aufenthalte bis zu 30 Tagen nicht – deutsche Staatsangehörige reisen visumfrei ein. Für bis zu 60 Tage gibt es ein elektronisches Visum (e-Visa), für längere Aufenthalte ein Visum vorab. Der Reisepass muss bei der Einreise noch mindestens sechs Monate gültig sein. Wer visumfrei einreist, muss sich binnen zehn Arbeitstagen bei den Innenbehörden (OVIR) registrieren.", k:"visum visa einreise e-visa reisepass registrierung ovir reise reisen"},
  protect:{q:"Wie sind Investitionen deutscher Unternehmen geschützt?", a:"Deutschland und Tadschikistan haben einen Vertrag über die Förderung und den gegenseitigen Schutz von Kapitalanlagen geschlossen (unterzeichnet am 27. März 2003 in Berlin). Enteignungen sind nur zum allgemeinen Wohl und gegen Entschädigung zulässig (Art. 4). Zusätzlich schließt das tadschikische Investitionsgesetz (Art. 24) eine Verstaatlichung des Investorvermögens aus.", k:"schutz investitionsschutz enteignung verstaatlichung garantie garantien sicherheit risiko vertrag kapitalanlage"},
  transfer:{q:"Können Gewinne nach Deutschland überwiesen werden?", a:"Ja. Der Investitionsschutzvertrag garantiert den freien Transfer aller Zahlungen im Zusammenhang mit einer Kapitalanlage – Kapital, Erträge, Darlehensrückzahlungen und Erlöse aus einem Verkauf (Art. 5). Das tadschikische Recht setzt Überweisungen keine gesetzlichen Grenzen; Devisengeschäfte laufen über Geschäftsbanken.", k:"gewinn gewinne transfer überweisung überweisen dividende rückführung währung somoni devisen bank"},
  dta:{q:"Gibt es ein Doppelbesteuerungsabkommen?", a:"Ja. Das Abkommen zwischen Deutschland und Tadschikistan zur Vermeidung der Doppelbesteuerung auf dem Gebiet der Steuern vom Einkommen und vom Vermögen wurde am 27. März 2003 unterzeichnet und ist seit dem 21. September 2004 in Kraft.", k:"doppelbesteuerung doppelbesteuerungsabkommen dba abkommen"},
  land:{q:"Kann ein ausländisches Unternehmen Land kaufen?", a:"Nein: Grund und Boden ist in Tadschikistan ausschließlich Eigentum des Staates, ein Verkauf ist gesetzlich nicht vorgesehen. Ausländische Investoren erhalten Landnutzungsrechte für bis zu 50 Jahre oder pachten Land von tadschikischen Nutzungsberechtigten für bis zu 20 Jahre. Gebäude auf dem Grundstück können Privateigentum sein.", k:"land grundstück grund boden eigentum kaufen pacht immobilie standort fläche"},
  reg:{q:"Wie gründet man ein Unternehmen?", a:"Die staatliche Registrierung läuft seit 2019 über ein „Single Window“ beim Steuerkomitee. Danach meldet sich das Unternehmen bei der Agentur für Sozialversicherung und Renten und bei den Statistikbehörden an. Das Investorenportal der Regierung ist investcom.tj. Der Handelsvertreter nennt Ansprechpartner und Berater.", k:"gründung gründen registrierung registrieren unternehmen firma gesellschaft tochter single window steuerkomitee"},
  disputes:{q:"Wie werden Streitigkeiten beigelegt?", a:"Nach dem Investitionsschutzvertrag wird eine Streitigkeit zwischen Investor und Staat, die nicht binnen sechs Monaten gütlich beigelegt ist, auf Verlangen des Investors einem Schiedsverfahren unterworfen (Art. 11). Seit dem 14. August 2012 ist Tadschikistan Vertragsstaat des New Yorker Übereinkommens über die Anerkennung und Vollstreckung ausländischer Schiedssprüche.", k:"streit streitigkeit schiedsverfahren schiedsgericht schiedsspruch gericht new yorker übereinkommen"},
  taxes:{q:"Welche Steuern zahlt ein Unternehmen?", a:"Gewinnsteuer: 13 % für die Warenproduktion, 18 % für andere Tätigkeiten. Mehrwertsteuer: 14 % in den Jahren 2024–2026 und 13 % ab 1. Januar 2027; für einzelne Branchen gelten ermäßigte Sätze. Die vollständige Tabelle steht unter „Investieren“.", k:"steuer steuern mehrwertsteuer mwst ust gewinnsteuer körperschaftsteuer steuersatz"},
  fez:{q:"Was bieten die Freien Wirtschaftszonen?", a:"Tadschikistan hat fünf Freie Wirtschaftszonen – Sughd, Pandsch, Dangara, Ischkaschim und Kulob – mit eigenem Steuer- und Zollregime. Karte und Beschreibung jeder Zone finden Sie unter „Investieren“.", k:"fwz freie wirtschaftszone wirtschaftszonen sonderwirtschaftszone vergünstigung sughd pandsch dangara ischkaschim kulob"},
  trip:{q:"Wie kann ich mit einer Delegation nach Tadschikistan reisen?", a:"Die nächste Gelegenheit ist die Geschäftsdelegationsreise der AHK Zentralasien nach Duschanbe vom 3. bis 6. November 2026 – mit Gesprächen in Ministerien, bei Unternehmen und Projekten. Anmeldung bis 9. Oktober 2026. Der Handelsvertreter unterstützt auch bei individuellen Reisen.", k:"reise delegation delegationsreise duschanbe besuch ahk markterkundung"},
  help:{q:"Wobei hilft der Handelsvertreter?", a:"Erstes Gespräch in Berlin oder per Video, Kontakte zum Staatlichen Komitee für Investitionen und Verwaltung des Staatsvermögens und zu den Fachbehörden, Vorbereitung der Reise und Begleitung nach dem Projektstart.", k:"hilfe handelsvertreter treffen kontakt unterstützung termin gespräch beratung"},
  eu:{q:"Was liefert Tadschikistan in die EU?", a:"2025 importierte die EU Waren aus Tadschikistan im Wert von 579 Mio. Euro (+90,4 %). 92 % davon sind unedle Metalle, danach folgen mineralische Erzeugnisse, Textilien und pflanzliche Erzeugnisse.", k:"export import handel eu waren metalle aluminium statistik handelsvolumen"},
  gsp:{q:"Welche EU-Zölle gelten für tadschikische Waren?", a:"Tadschikistan nutzt das Allgemeine Präferenzsystem der EU (APS/GSP): Nicht empfindliche Waren sind zollfrei, für empfindliche wird der Zoll um 3,5 Prozentpunkte gesenkt. Den genauen Satz je Warencode zeigt die Access2Markets-Suche unter „Export“.", k:"zoll zölle gsp aps präferenz präferenzen tarif einfuhr zollsatz"},
  exporters:{q:"Wo finde ich tadschikische Lieferanten für Trockenfrüchte?", a:"Unter „Export“ stellen wir geprüfte Hersteller aus Isfara vor – mit Produkten, Zertifikaten und Kontakten, zum Beispiel Barakat Isfara.", k:"kaufen einkaufen bezugsquelle lieferant lieferanten trockenfrüchte aprikosen isfara exporteur hersteller barakat"}
 }},
 ask:{btn:"Fragen", t:"Fragen zum Standort", sub:"Antworten aus den Inhalten dieser Website, mit Quelle", hello:"Guten Tag! Stellen Sie eine Frage zu Handel und Investitionen – zum Beispiel zu Visum, Steuern oder Freien Wirtschaftszonen.", ph:"Ihre Frage …", send:"Senden", pop:"Häufige Fragen", open:"Öffnen", src:"Quellen", also:"Auch passend", none:"Darauf gibt es auf dieser Website keine genaue Antwort. Fragen Sie den Handelsvertreter direkt – er antwortet persönlich.", write:"Frage an den Handelsvertreter", close:"Schließen", privacy:"Der Assistent sucht nur in den Inhalten dieser Website. Ihre Frage wird nicht gespeichert und nicht übertragen.", page:"Seite", zone:"Freie Wirtschaftszone", exp:"Exporteur", evt:"Termin", sector:"Branche", tax:"Steuern"},
 rep:{k:"Ihr Ansprechpartner", role:"Handelsvertreter der Republik Tadschikistan in Deutschland", city:"Berlin", bio:["Ökonom mit Schwerpunkt Banken und Finanzen.","Studium an der Ritsumeikan Asia Pacific University, Japan (2019–2021).","Autor wissenschaftlicher Beiträge zu Bankenaufsicht und finanzieller Stabilität von Banken."], li:"Profil auf LinkedIn", meet:"Termin vereinbaren"},
 ahk:{n:"Delegationsreise der AHK Zentralasien nach Duschanbe", p:"Gespräche mit Ministerien und staatlichen Institutionen, Treffen mit tadschikischen Unternehmen und Projekten vor Ort. Anmeldung bis 9. Oktober 2026."},
 checked:"Geprüft: Oktober 2026"
},
ru:{
 faq:{k:"Вопросы инвесторов", t:"Коротко и со ссылкой на источник", l:"Самые частые вопросы немецких компаний — о въезде, правовой защите, налогах и земле.", items:{
  visa:{q:"Нужна ли гражданам Германии виза в Таджикистан?", a:"Для поездок до 30 дней — нет: граждане Германии въезжают без визы. На срок до 60 дней оформляется электронная виза (e-Visa), на более долгий срок — виза заранее. Паспорт должен быть действителен ещё минимум шесть месяцев на момент въезда. При безвизовом въезде нужно в течение десяти рабочих дней зарегистрироваться в органах внутренних дел (ОВИР).", k:"виза визу визы въезд e-visa паспорт регистрация овир поездка поехать"},
  protect:{q:"Как защищены инвестиции немецких компаний?", a:"Германия и Таджикистан заключили договор о поощрении и взаимной защите капиталовложений (подписан в Берлине 27 марта 2003 года). Экспроприация допускается только в интересах общества и с компенсацией (ст. 4). Кроме того, Закон Таджикистана «Об инвестициях» (ст. 24) исключает национализацию имущества инвестора.", k:"защита защищены гарантии национализация экспроприация риск риски безопасность договор капиталовложения"},
  transfer:{q:"Можно ли переводить прибыль в Германию?", a:"Да. Договор о защите капиталовложений гарантирует свободный перевод всех платежей, связанных с инвестицией, — капитала, доходов, погашения займов и выручки от продажи (ст. 5). Законодательство Таджикистана не устанавливает лимитов на переводы; валютные операции проводятся через коммерческие банки.", k:"прибыль перевод переводить дивиденды репатриация валюта сомони вывод банк"},
  dta:{q:"Есть ли соглашение об избежании двойного налогообложения?", a:"Да. Соглашение между Германией и Таджикистаном об избежании двойного налогообложения в отношении налогов на доходы и имущество подписано 27 марта 2003 года и действует с 21 сентября 2004 года.", k:"двойное двойного налогообложение налогообложения соглашение"},
  land:{q:"Может ли иностранная компания купить землю?", a:"Нет: земля в Таджикистане — исключительная собственность государства, её продажа законом не предусмотрена. Иностранные инвесторы получают право пользования землёй на срок до 50 лет или арендуют её у таджикских землепользователей на срок до 20 лет. Здания на земле могут находиться в частной собственности.", k:"земля землю участок собственность купить аренда недвижимость площадка"},
  reg:{q:"Как зарегистрировать компанию?", a:"С 2019 года государственная регистрация проходит по принципу «единого окна» в Налоговом комитете. После этого компания встаёт на учёт в Агентстве социального страхования и пенсий и в органах статистики. Портал правительства для инвесторов — investcom.tj. Торговый представитель подскажет контакты и консультантов.", k:"регистрация зарегистрировать компанию компания фирма ооо юрлицо единое окно налоговый комитет открыть"},
  disputes:{q:"Как решаются споры?", a:"По договору о защите капиталовложений спор инвестора с государством, не урегулированный мирно за шесть месяцев, по требованию инвестора передаётся в арбитраж (ст. 11). С 14 августа 2012 года Таджикистан — участник Нью-Йоркской конвенции о признании и приведении в исполнение иностранных арбитражных решений.", k:"спор споры арбитраж суд конвенция нью-йоркская"},
  taxes:{q:"Какие налоги платит компания?", a:"Налог на прибыль — 13 % для производства товаров и 18 % для прочих видов деятельности. НДС — 14 % в 2024–2026 годах и 13 % с 1 января 2027 года; для отдельных отраслей действуют пониженные ставки. Полная таблица — в разделе «Инвестиции».", k:"налог налоги ндс прибыль ставка ставки налогообложение"},
  fez:{q:"Что дают свободные экономические зоны?", a:"В Таджикистане пять свободных экономических зон — «Согд», «Пяндж», «Дангара», «Ишкашим» и «Куляб» — с собственным налоговым и таможенным режимом. Карта и описание каждой зоны — в разделе «Инвестиции».", k:"сэз свободная свободные экономическая зона зоны льготы согд пяндж дангара ишкашим куляб"},
  trip:{q:"Как поехать в Таджикистан с деловой миссией?", a:"Ближайшая возможность — деловая делегационная поездка AHK Центральная Азия в Душанбе с 3 по 6 ноября 2026 года: встречи в министерствах, с компаниями и проектами. Регистрация до 9 октября 2026 года. Торговый представитель помогает и с индивидуальными поездками.", k:"поездка поехать делегация делегационная миссия душанбе визит ahk"},
  help:{q:"Чем поможет торговый представитель?", a:"Первая встреча в Берлине или по видеосвязи, контакты с Государственным комитетом по инвестициям и управлению государственным имуществом и отраслевыми ведомствами, подготовка поездки и сопровождение после старта проекта.", k:"помощь помочь торговый представитель встреча контакт поддержка консультация"},
  eu:{q:"Что Таджикистан продаёт в ЕС?", a:"В 2025 году ЕС импортировал из Таджикистана товаров на 579 млн евро (+90,4 %). 92 % из них — недрагоценные металлы, далее минеральные продукты, текстиль и растительная продукция.", k:"экспорт импорт торговля ес товары металлы алюминий статистика товарооборот"},
  gsp:{q:"Какие пошлины ЕС действуют на таджикские товары?", a:"Таджикистан пользуется Общей системой преференций ЕС (GSP): «нечувствительные» товары ввозятся без пошлины, на «чувствительные» пошлина снижена на 3,5 процентного пункта. Точную ставку по коду товара покажет поиск Access2Markets в разделе «Экспорт».", k:"пошлина пошлины таможня gsp преференции тариф ввоз"},
  exporters:{q:"Где найти таджикских поставщиков сухофруктов?", a:"В разделе «Экспорт» — проверенные производители из Исфары с продукцией, сертификатами и контактами, например Barakat Isfara.", k:"купить закупить закупка поставщик поставщики сухофрукты курага абрикос исфара экспортёр производитель barakat"}
 }},
 ask:{btn:"Спросить", t:"Вопросы о стране", sub:"Ответы из материалов сайта — со ссылкой на источник", hello:"Здравствуйте! Задайте вопрос о торговле и инвестициях — например, о визе, налогах или свободных зонах.", ph:"Ваш вопрос…", send:"Отправить", pop:"Частые вопросы", open:"Открыть", src:"Источники", also:"Ещё по теме", none:"Точного ответа на сайте нет. Задайте вопрос торговому представителю — он ответит лично.", write:"Написать торговому представителю", close:"Закрыть", privacy:"Помощник ищет только по материалам этого сайта. Ваш вопрос не сохраняется и никуда не передаётся.", page:"Раздел", zone:"Свободная экономическая зона", exp:"Экспортёр", evt:"Событие", sector:"Отрасль", tax:"Налоги"},
 rep:{k:"Ваш контакт", role:"Торговый представитель Республики Таджикистан в Германии", city:"Берлин", bio:["Экономист, специализация — банки и финансы.","Учился в Ritsumeikan Asia Pacific University, Япония (2019–2021).","Автор научных статей о банковском надзоре и финансовой устойчивости банков."], li:"Профиль в LinkedIn", meet:"Записаться на встречу"},
 ahk:{n:"Деловая миссия AHK Центральная Азия в Душанбе", p:"Встречи с министерствами и государственными учреждениями, таджикскими компаниями и проектами на месте. Регистрация до 9 октября 2026 года."},
 checked:"Проверено: октябрь 2026"
},
en:{
 faq:{k:"Investor questions", t:"Short answers, with sources", l:"The questions German companies ask most often – about entry, legal protection, taxes and land.", items:{
  visa:{q:"Do German citizens need a visa for Tajikistan?", a:"Not for stays of up to 30 days – German citizens enter visa-free. For up to 60 days there is an electronic visa (e-Visa); longer stays need a visa in advance. The passport must be valid for at least six more months on entry. Visitors who enter visa-free must register with the internal affairs authorities (OVIR) within ten working days.", k:"visa entry e-visa passport registration ovir travel trip"},
  protect:{q:"How are German investments protected?", a:"Germany and Tajikistan have a treaty on the promotion and reciprocal protection of investments (signed in Berlin on 27 March 2003). Expropriation is allowed only for the public good and against compensation (Art. 4). In addition, Tajikistan’s Law on Investments (Art. 24) rules out nationalisation of an investor’s property.", k:"protection protected guarantee guarantees expropriation nationalisation nationalization risk security treaty bit"},
  transfer:{q:"Can profits be transferred to Germany?", a:"Yes. The investment treaty guarantees the free transfer of all payments connected with an investment – capital, returns, loan repayments and proceeds from a sale (Art. 5). Tajik law sets no legal limits on transfers; foreign-exchange transactions go through commercial banks.", k:"profit profits transfer repatriation dividends currency somoni exchange bank"},
  dta:{q:"Is there a double taxation agreement?", a:"Yes. The agreement between Germany and Tajikistan for the avoidance of double taxation with respect to taxes on income and capital was signed on 27 March 2003 and has been in force since 21 September 2004.", k:"double taxation agreement treaty dta"},
  land:{q:"Can a foreign company buy land?", a:"No: land in Tajikistan is exclusively state property, and the law does not provide for its sale. Foreign investors receive land-use rights for up to 50 years or lease land from Tajik right-holders for up to 20 years. Buildings on the land can be privately owned.", k:"land plot property ownership buy lease real estate site"},
  reg:{q:"How do I register a company?", a:"Since 2019, state registration has run through a single window at the Tax Committee. The company then registers with the Social Insurance and Pensions Agency and the statistics authorities. The government’s investor portal is investcom.tj. The trade representative can name contacts and advisers.", k:"register registration company subsidiary incorporate llc single window tax committee set up"},
  disputes:{q:"How are disputes settled?", a:"Under the investment treaty, a dispute between an investor and the state that is not settled amicably within six months is submitted to arbitration at the investor’s request (Art. 11). Since 14 August 2012, Tajikistan has been a party to the New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards.", k:"dispute disputes arbitration court award new york convention"},
  taxes:{q:"Which taxes does a company pay?", a:"Profit tax: 13 % for the production of goods, 18 % for other activities. VAT: 14 % in 2024–2026 and 13 % from 1 January 2027; reduced rates apply to some sectors. The full table is under “Invest”.", k:"tax taxes vat profit corporate rate rates"},
  fez:{q:"What do the free economic zones offer?", a:"Tajikistan has five free economic zones – Sughd, Panj, Dangara, Ishkashim and Kulob – each with its own tax and customs regime. A map and a description of each zone are under “Invest”.", k:"fez free economic zone zones incentives sughd panj dangara ishkashim kulob"},
  trip:{q:"How can I travel to Tajikistan with a delegation?", a:"The next opportunity is the business delegation trip of AHK Central Asia to Dushanbe from 3 to 6 November 2026, with meetings at ministries, companies and projects. Registration closes on 9 October 2026. The trade representative also helps with individual trips.", k:"trip travel delegation mission dushanbe visit ahk"},
  help:{q:"What does the trade representative help with?", a:"A first meeting in Berlin or by video, contacts with the State Committee on Investment and State Property Management and the sector authorities, preparing a trip, and support after the project starts.", k:"help support trade representative meeting contact advice"},
  eu:{q:"What does Tajikistan sell to the EU?", a:"In 2025 the EU imported goods worth €579 million from Tajikistan (+90.4 %). 92 % of them were base metals, followed by mineral products, textiles and vegetable products.", k:"export exports import trade eu goods metals aluminium statistics"},
  gsp:{q:"Which EU duties apply to Tajik goods?", a:"Tajikistan benefits from the EU’s Generalised Scheme of Preferences (GSP): non-sensitive goods enter duty-free, and the duty on sensitive goods is cut by 3.5 percentage points. The exact rate per product code is shown by the Access2Markets search under “Export”.", k:"duty duties customs gsp preferences tariff import"},
  exporters:{q:"Where can I find Tajik suppliers of dried fruit?", a:"Under “Export” we present verified producers from Isfara with their products, certificates and contacts – for example Barakat Isfara.", k:"buy source sourcing supplier suppliers dried fruit apricots isfara exporter producer barakat"}
 }},
 ask:{btn:"Ask", t:"Questions about Tajikistan", sub:"Answers from this website’s content, with sources", hello:"Hello! Ask a question about trade and investment – for example about visas, taxes or free economic zones.", ph:"Your question…", send:"Send", pop:"Common questions", open:"Open", src:"Sources", also:"Related", none:"This website has no exact answer to that. Ask the trade representative directly – he will reply in person.", write:"Write to the trade representative", close:"Close", privacy:"The assistant only searches this website’s content. Your question is not stored or sent anywhere.", page:"Page", zone:"Free economic zone", exp:"Exporter", evt:"Event", sector:"Sector", tax:"Taxes"},
 rep:{k:"Your contact", role:"Trade Representative of the Republic of Tajikistan in Germany", city:"Berlin", bio:["Economist specialising in banking and finance.","Studied at Ritsumeikan Asia Pacific University, Japan (2019–2021).","Author of academic papers on banking supervision and the financial stability of banks."], li:"Profile on LinkedIn", meet:"Book a meeting"},
 ahk:{n:"AHK Central Asia business delegation to Dushanbe", p:"Meetings with ministries and state institutions, Tajik companies and projects on site. Registration closes on 9 October 2026."},
 checked:"Checked: October 2026"
},
tj:{
 faq:{k:"Саволҳои сармоягузорон", t:"Мухтасар ва бо манбаъ", l:"Саволҳои маъмултарини ширкатҳои олмонӣ — дар бораи воридшавӣ, ҳифзи ҳуқуқӣ, андозҳо ва замин.", items:{
  visa:{q:"Оё шаҳрвандони Олмон ба Тоҷикистон раводид лозим доранд?", a:"Барои сафарҳои то 30 рӯз — не: шаҳрвандони Олмон бе раводид ворид мешаванд. Барои то 60 рӯз раводиди электронӣ (e-Visa) гирифта мешавад, барои мӯҳлати дарозтар — раводид пешакӣ. Шиноснома бояд ҳангоми воридшавӣ ақаллан шаш моҳи дигар эътибор дошта бошад. Ҳангоми воридшавии бе раводид дар давоми даҳ рӯзи корӣ бояд дар мақомоти корҳои дохилӣ (ОВИР) ба қайд гирифта шуд.", k:"раводид виза воридшавӣ шиноснома сабти ном бақайдгирӣ овир сафар"},
  protect:{q:"Сармоягузории ширкатҳои олмонӣ чӣ гуна ҳифз мешавад?", a:"Олмон ва Тоҷикистон Шартнома дар бораи ҳавасмандгардонӣ ва ҳифзи мутақобилаи сармоягузориҳоро бастаанд (27 марти соли 2003 дар Берлин имзо шудааст). Мусодира танҳо барои манфиати ҷомеа ва бо ҷуброн иҷозат дода мешавад (моддаи 4). Илова бар ин, Қонуни Ҷумҳурии Тоҷикистон «Дар бораи сармоягузорӣ» (моддаи 24) милликунонии амволи сармоягузорро истисно мекунад.", k:"ҳифз кафолат кафолатҳо милликунонӣ мусодира хатар бехатарӣ шартнома"},
  transfer:{q:"Оё фоидаро ба Олмон интиқол додан мумкин аст?", a:"Бале. Шартнома интиқоли озоди ҳамаи пардохтҳои марбут ба сармоягузориро кафолат медиҳад — сармоя, даромад, бозпардохти қарз ва маблағ аз фурӯш (моддаи 5). Қонунгузории Тоҷикистон интиқолҳоро маҳдуд намекунад; амалиёти асъорӣ тавассути бонкҳои тиҷоратӣ анҷом дода мешавад.", k:"фоида интиқол дивиденд асъор сомонӣ бонк"},
  dta:{q:"Оё созишнома оид ба пешгирии андозбандии дукарата вуҷуд дорад?", a:"Бале. Созишномаи байни Олмон ва Тоҷикистон оид ба пешгирии андозбандии дукаратаи даромад ва молу мулк 27 марти соли 2003 имзо шуда, аз 21 сентябри соли 2004 эътибор дорад.", k:"андозбандии дукарата дукарата созишнома"},
  land:{q:"Оё ширкати хориҷӣ замин харида метавонад?", a:"Не: замин дар Тоҷикистон моликияти истисноии давлат аст ва фурӯши он тибқи қонун пешбинӣ нашудааст. Сармоягузорони хориҷӣ ҳуқуқи истифодаи заминро то 50 сол мегиранд ё заминро аз истифодабарандагони тоҷик то 20 сол иҷора мегиранд. Биноҳо дар замин метавонанд моликияти хусусӣ бошанд.", k:"замин қитъа моликият харидан иҷора амволи ғайриманқул"},
  reg:{q:"Ширкатро чӣ гуна ба қайд гирифтан мумкин аст?", a:"Аз соли 2019 бақайдгирии давлатӣ бо принсипи «равзанаи ягона» дар Кумитаи андоз сурат мегирад. Баъд аз он ширкат дар Агентии суғуртаи иҷтимоӣ ва нафақа ва мақомоти омор ба қайд гирифта мешавад. Портали ҳукумат барои сармоягузорон — investcom.tj. Намояндаи тиҷоратӣ тамосҳо ва мушовиронро пешниҳод мекунад.", k:"бақайдгирӣ ширкат таъсис равзанаи ягона кумитаи андоз"},
  disputes:{q:"Баҳсҳо чӣ гуна ҳал мешаванд?", a:"Тибқи Шартнома баҳси байни сармоягузор ва давлат, ки дар давоми шаш моҳ бо роҳи осоишта ҳал нашудааст, бо талаби сармоягузор ба арбитраж супурда мешавад (моддаи 11). Аз 14 августи соли 2012 Тоҷикистон узви Конвенсияи Ню-Йорк дар бораи эътироф ва иҷрои қарорҳои арбитражии хориҷӣ мебошад.", k:"баҳс баҳсҳо арбитраж суд конвенсия"},
  taxes:{q:"Ширкат кадом андозҳоро месупорад?", a:"Андоз аз фоида — 13 % барои истеҳсоли мол ва 18 % барои дигар намудҳои фаъолият. Андоз аз арзиши иловашуда — 14 % дар солҳои 2024–2026 ва 13 % аз 1 январи соли 2027; барои баъзе соҳаҳо меъёрҳои пасткардашуда амал мекунанд. Ҷадвали пурра — дар бахши «Сармоягузорӣ».", k:"андоз андозҳо ааи фоида меъёр"},
  fez:{q:"Минтақаҳои озоди иқтисодӣ чӣ медиҳанд?", a:"Дар Тоҷикистон панҷ минтақаи озоди иқтисодӣ ҳаст — «Суғд», «Панҷ», «Данғара», «Ишкошим» ва «Кӯлоб» — бо низоми хоси андоз ва гумрук. Харита ва тавсифи ҳар минтақа — дар бахши «Сармоягузорӣ».", k:"мои минтақа минтақаҳои озоди иқтисодӣ имтиёз суғд панҷ данғара ишкошим кӯлоб"},
  trip:{q:"Чӣ гуна бо ҳайати тиҷоратӣ ба Тоҷикистон сафар кардан мумкин аст?", a:"Наздиктарин имконият — сафари ҳайати тиҷоратии AHK Осиёи Марказӣ ба Душанбе аз 3 то 6 ноябри соли 2026: вохӯриҳо дар вазоратҳо, бо ширкатҳо ва лоиҳаҳо. Бақайдгирӣ то 9 октябри соли 2026. Намояндаи тиҷоратӣ дар сафарҳои инфиродӣ низ кӯмак мекунад.", k:"сафар ҳайат делегатсия миссия душанбе ташриф ahk"},
  help:{q:"Намояндаи тиҷоратӣ чӣ кӯмак мекунад?", a:"Вохӯрии аввал дар Берлин ё тавассути видео, тамос бо Кумитаи давлатии сармоягузорӣ ва идораи амволи давлатӣ ва идораҳои соҳавӣ, омодасозии сафар ва ҳамроҳӣ пас аз оғози лоиҳа.", k:"кӯмак намояндаи тиҷоратӣ вохӯрӣ тамос дастгирӣ машварат"},
  eu:{q:"Тоҷикистон ба ИА чӣ мефурӯшад?", a:"Дар соли 2025 ИА аз Тоҷикистон ба маблағи 579 млн евро мол ворид кардааст (+90,4 %). 92 %-и он металлҳои ғайриқиматбаҳо буда, баъд маҳсулоти минералӣ, нассоҷӣ ва маҳсулоти растанигӣ меоянд.", k:"содирот воридот савдо иа мол металл алюминий омор"},
  gsp:{q:"Барои молҳои тоҷикӣ кадом боҷҳои ИА амал мекунанд?", a:"Тоҷикистон аз Низоми умумии афзалиятҳои ИА (GSP) истифода мебарад: молҳои «ғайриҳассос» бе боҷ ворид мешаванд, барои молҳои «ҳассос» боҷ 3,5 банди фоизӣ кам карда шудааст. Меъёри дақиқро аз рӯи рамзи мол ҷустуҷӯи Access2Markets дар бахши «Содирот» нишон медиҳад.", k:"боҷ гумрук gsp афзалият тариф воридот"},
  exporters:{q:"Таъминкунандагони тоҷикии меваи хушкро аз куҷо ёфтан мумкин аст?", a:"Дар бахши «Содирот» истеҳсолкунандагони санҷидашудаи Исфара бо маҳсулот, сертификатҳо ва тамосҳо оварда шудаанд, масалан Barakat Isfara.", k:"харидан хариди таъминкунанда меваи хушк зардолу исфара содиркунанда истеҳсолкунанда barakat"}
 }},
 ask:{btn:"Пурсидан", t:"Саволҳо дар бораи кишвар", sub:"Ҷавобҳо аз маводи сомона — бо манбаъ", hello:"Салом! Дар бораи савдо ва сармоягузорӣ савол диҳед — масалан, дар бораи раводид, андозҳо ё минтақаҳои озод.", ph:"Саволи шумо…", send:"Фиристодан", pop:"Саволҳои маъмул", open:"Кушодан", src:"Манбаъҳо", also:"Боз дар ин мавзӯъ", none:"Дар сомона ҷавоби дақиқ нест. Саволро ба намояндаи тиҷоратӣ диҳед — ӯ шахсан ҷавоб медиҳад.", write:"Навиштан ба намояндаи тиҷоратӣ", close:"Пӯшидан", privacy:"Ёрдамчӣ танҳо дар маводи ҳамин сомона ҷустуҷӯ мекунад. Саволи шумо нигоҳ дошта ва ба ҷое фиристода намешавад.", page:"Бахш", zone:"Минтақаи озоди иқтисодӣ", exp:"Содиркунанда", evt:"Чорабинӣ", sector:"Соҳа", tax:"Андозҳо"},
 rep:{k:"Шахси тамос", role:"Намояндаи тиҷоратии Ҷумҳурии Тоҷикистон дар Олмон", city:"Берлин", bio:["Иқтисодчӣ, тахассус — бонкҳо ва молия.","Дар Ritsumeikan Asia Pacific University, Ҷопон (2019–2021) таҳсил кардааст.","Муаллифи мақолаҳои илмӣ дар бораи назорати бонкӣ ва устувории молиявии бонкҳо."], li:"Профил дар LinkedIn", meet:"Вохӯрӣ таъин кардан"},
 ahk:{n:"Ҳайати тиҷоратии AHK Осиёи Марказӣ ба Душанбе", p:"Вохӯриҳо бо вазоратҳо ва муассисаҳои давлатӣ, ширкатҳо ва лоиҳаҳои тоҷикӣ дар ҷой. Бақайдгирӣ то 9 октябри соли 2026."},
 checked:"Санҷида шуд: октябри 2026"
}};
Object.keys(M).forEach(function(l){
 var c = C[l]; if(!c) return; var m = M[l];
 c.faq = m.faq; c.ask = m.ask; c.rep = m.rep; c.ui.checked = m.checked;
 c.events.list.ahk = m.ahk;
});
})();

/* October 2026, second round: what Germany buys from Tajikistan, exporter media, the team block,
   the assistant's greeting bubble. */
FAQ_META.unshift({id:"de", s:[45], go:"export", anchor:"deimp"});
ASK_POP.unshift("de"); ASK_POP.pop();
(function(){
var M = {
de:{
 faq:{q:"Was liefert Tadschikistan nach Deutschland?", a:"2025 führte Deutschland Waren tadschikischen Ursprungs im Wert von 5,3 Mio. Euro ein, 2,4-mal so viel wie 2024. Vor allem Fruchtkerne (1.385 t), getrocknete Äpfel (512 t) und getrocknete Aprikosen (117 t) – zusammen 92 % der Einfuhren.", k:"deutschland liefert lieferung einfuhr einfuhren import waren produkte fruchtkerne kerne äpfel aprikosen trockenfrüchte"},
 deimp:{k:"Aus Tadschikistan nach Deutschland", t:"Was Deutschland bereits aus Tadschikistan kauft", l:"2025 führte Deutschland Waren tadschikischen Ursprungs im Wert von 5,3 Mio. Euro ein – 2,4-mal so viel wie 2024. 92 % davon sind Fruchtkerne und Trockenfrüchte.",
  n:{kernels:"Fruchtkerne", apple:"Getrocknete Äpfel", apricot:"Getrocknete Aprikosen"},
  d:{kernels:"Wichtigste Position: fast 70 % aller deutschen Einfuhren aus Tadschikistan im Jahr 2025.", apple:"Fast fünfmal so viel wie zwei Jahre zuvor.", apricot:"2025 erstmals in nennenswerter Menge: 117 t."},
  u:"t", yl:"Einfuhrmenge in Tonnen", total:"Deutsche Einfuhren aus Tadschikistan", m:"Mio. €", cn:"KN",
  other:"Außerdem in der Statistik: pharmazeutische Erzeugnisse (2025), Jeanshosen, Teppiche und Reis (2023).",
  photo:"Produktfotos: Barakat Isfara",
  note:"Eurostat (Comext): deutsche Einfuhren nach Ursprungsland Tadschikistan, KN-Codes. Waren, die zuerst in einem anderen EU-Land in den freien Verkehr gelangen, erscheinen hier nicht.",
  cta1:"Lieferanten dieser Waren", cta2:"Zoll prüfen"},
 co:{canned:"Gemüsekonserven", ME:"Naher Osten", ig:"Instagram", yt:"Video aus der Produktion", illus:"Illustration", credit:"Fotos und Logos: Material der Unternehmen (Website, Gulfood 2026)", gf:"Gulfood 2026, Dubai"},
 team:{k:"Team", role:"Handelsvertreter der Republik Tadschikistan in Deutschland", li:"Profil auf LinkedIn"},
 ask:{t:"Website-Assistent", nudge:"Ich bin der Website-Assistent. Kann ich Ihnen helfen?", nudgeX:"Hinweis schließen"}
},
ru:{
 faq:{q:"Что Таджикистан поставляет в Германию?", a:"В 2025 году Германия ввезла товаров таджикского происхождения на 5,3 млн евро — в 2,4 раза больше, чем в 2024-м. Прежде всего это ядра фруктовых косточек (1 385 т), сушёные яблоки (512 т) и курага (117 т): вместе 92 % ввоза.", k:"германия германию поставки поставляет продаёт продает импорт ввоз товары продукция ядра косточки яблоки курага сухофрукты"},
 deimp:{k:"Из Таджикистана — в Германию", t:"Что Германия уже покупает у Таджикистана", l:"В 2025 году Германия ввезла товаров таджикского происхождения на 5,3 млн евро — в 2,4 раза больше, чем в 2024-м. 92 % из них — ядра фруктовых косточек и сухофрукты.",
  n:{kernels:"Ядра фруктовых косточек", apple:"Сушёные яблоки", apricot:"Курага"},
  d:{kernels:"Главная позиция: почти 70 % всего ввоза Германии из Таджикистана в 2025 году.", apple:"Почти в пять раз больше, чем двумя годами раньше.", apricot:"Впервые в заметном объёме — 117 т в 2025 году."},
  u:"т", yl:"Объём ввоза, тонн", total:"Импорт Германии из Таджикистана", m:"млн €", cn:"CN",
  other:"Также в статистике: фармацевтическая продукция (2025), джинсовые брюки, ковры и рис (2023).",
  photo:"Фото продукции: Barakat Isfara",
  note:"Eurostat (Comext): импорт Германии по стране происхождения «Таджикистан», коды CN. Товары, впервые выпущенные в свободное обращение в другой стране ЕС, здесь не учтены.",
  cta1:"Поставщики этих товаров", cta2:"Проверить пошлину"},
 co:{canned:"овощные консервы", ME:"Ближний Восток", ig:"Instagram", yt:"Видео с производства", illus:"иллюстрация", credit:"Фото и логотипы: материалы компаний (сайт, Gulfood 2026)", gf:"Gulfood 2026, Дубай"},
 team:{k:"Команда", role:"Торговый представитель Республики Таджикистан в Германии", li:"Профиль в LinkedIn"},
 ask:{t:"Помощник по сайту", nudge:"Я помощник по сайту. Помочь вам чем-нибудь?", nudgeX:"Закрыть подсказку"}
},
en:{
 faq:{q:"What does Tajikistan supply to Germany?", a:"In 2025 Germany imported goods of Tajik origin worth €5.3 million, 2.4 times as much as in 2024 – mainly fruit kernels (1,385 t), dried apples (512 t) and dried apricots (117 t), together 92 % of the total.", k:"germany supply supplies imports imported goods products kernels apples apricots dried fruit"},
 deimp:{k:"From Tajikistan to Germany", t:"What Germany already buys from Tajikistan", l:"In 2025 Germany imported goods of Tajik origin worth €5.3 million – 2.4 times as much as in 2024. 92 % of it was fruit kernels and dried fruit.",
  n:{kernels:"Fruit kernels", apple:"Dried apples", apricot:"Dried apricots"},
  d:{kernels:"The leading item: almost 70 % of all German imports from Tajikistan in 2025.", apple:"Almost five times the volume of two years earlier.", apricot:"First significant volume in 2025: 117 t."},
  u:"t", yl:"Import volume, tonnes", total:"German imports from Tajikistan", m:"€ m", cn:"CN",
  other:"Also in the statistics: pharmaceutical products (2025), denim trousers, carpets and rice (2023).",
  photo:"Product photos: Barakat Isfara",
  note:"Eurostat (Comext): German imports by country of origin Tajikistan, CN codes. Goods first released for free circulation in another EU country do not appear here.",
  cta1:"Suppliers of these goods", cta2:"Check the duty"},
 co:{canned:"canned vegetables", ME:"Middle East", ig:"Instagram", yt:"Production video", illus:"illustration", credit:"Photos and logos: company material (website, Gulfood 2026)", gf:"Gulfood 2026, Dubai"},
 team:{k:"Team", role:"Trade Representative of the Republic of Tajikistan in Germany", li:"Profile on LinkedIn"},
 ask:{t:"Site assistant", nudge:"I’m the site assistant. Can I help you with anything?", nudgeX:"Dismiss"}
},
tj:{
 faq:{q:"Тоҷикистон ба Олмон чӣ мефиристад?", a:"Дар соли 2025 Олмон ба маблағи 5,3 млн евро моли истеҳсоли Тоҷикистон ворид кард — 2,4 баробар зиёдтар аз соли 2024. Пеш аз ҳама мағзи донаки мева (1 385 т), себи хушк (512 т) ва курага (117 т) — якҷоя 92 %-и воридот.", k:"олмон содирот воридот мол маҳсулот мағз донак себ курага меваи хушк"},
 deimp:{k:"Аз Тоҷикистон — ба Олмон", t:"Олмон аллакай аз Тоҷикистон чӣ мехарад", l:"Дар соли 2025 Олмон ба маблағи 5,3 млн евро моли истеҳсоли Тоҷикистон ворид кард — 2,4 баробар зиёдтар аз соли 2024. 92 %-и он мағзи донаки мева ва меваи хушк аст.",
  n:{kernels:"Мағзи донаки мева", apple:"Себи хушк", apricot:"Курага"},
  d:{kernels:"Мавқеи асосӣ: қариб 70 %-и тамоми воридоти Олмон аз Тоҷикистон дар соли 2025.", apple:"Нисбат ба ду сол пеш қариб панҷ баробар зиёд.", apricot:"Бори аввал ба ҳаҷми назаррас — 117 т дар соли 2025."},
  u:"т", yl:"Ҳаҷми воридот, тонна", total:"Воридоти Олмон аз Тоҷикистон", m:"млн €", cn:"CN",
  other:"Инчунин дар омор: маҳсулоти дорусозӣ (2025), шими ҷинсӣ, қолин ва биринҷ (2023).",
  photo:"Акси маҳсулот: Barakat Isfara",
  note:"Eurostat (Comext): воридоти Олмон аз рӯи кишвари пайдоиш — Тоҷикистон, рамзҳои CN. Молҳое, ки аввал дар дигар кишвари ИА ба муомилоти озод бароварда шудаанд, дар ин ҷо ба ҳисоб гирифта нашудаанд.",
  cta1:"Таъминкунандагони ин молҳо", cta2:"Санҷиши боҷ"},
 co:{canned:"консерваҳои сабзавотӣ", ME:"Шарқи Наздик", ig:"Instagram", yt:"Видео аз истеҳсолот", illus:"тасвир", credit:"Акс ва логотипҳо: маводи ширкатҳо (сомона, Gulfood 2026)", gf:"Gulfood 2026, Дубай"},
 team:{k:"Гурӯҳ", role:"Намояндаи тиҷоратии Ҷумҳурии Тоҷикистон дар Олмон", li:"Профил дар LinkedIn"},
 ask:{t:"Ёрдамчии сомона", nudge:"Ман ёрдамчии сомона ҳастам. Ба шумо кӯмак лозим аст?", nudgeX:"Пӯшидан"}
}};
Object.keys(M).forEach(function(l){
 var c = C[l]; if(!c) return; var m = M[l], co = c.exp.co;
 c.faq.items.de = m.faq; c.deimp = m.deimp; c.team = m.team;
 c.ask.t = m.ask.t; c.ask.nudge = m.ask.nudge; c.ask.nudgeX = m.ask.nudgeX;
 co.prn.canned = m.co.canned; co.mkn.ME = m.co.ME;
 co.lab.ig = m.co.ig; co.lab.yt = m.co.yt; co.lab.illus = m.co.illus; co.lab.credit = m.co.credit; co.lab.gf = m.co.gf;
});
})();
