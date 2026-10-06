/* ===== shared, language-independent data: sources, figures, zones, events ===== */
var SRC = [
 null,
 {t:"World Bank — Tajikistan Economic Update, July 2025", u:"https://www.worldbank.org/en/country/tajikistan/publication/economic-update-2025"},
 {t:"World Bank — Macro Poverty Outlook: Tajikistan, April 2026", u:"https://thedocs.worldbank.org/en/doc/d5f32ef28464d01f195827b7e020a3e8-0500022021/related/mpo-tjk.pdf"},
 {t:"Agency on Statistics under the President of the RT, via Xinhua, 21.02.2026", u:"https://english.news.cn/20260221/04e8de86ca9142b892c287c8abdb2cc1/c.html"},
 {t:"Auswärtiges Amt — Deutschland und Tadschikistan: bilaterale Beziehungen", u:"https://www.auswaertiges-amt.de/de/service/laender/tadschikistan-node/bilaterale-beziehungen-206762"},
 {t:"Bundesministerium der Finanzen — DBA Deutschland–Tadschikistan", u:"https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/Laender_A_Z/Tadschikistan/2004-07-27-Tadschikistan-Abkommen-DBA.html"},
 {t:"MFA of the Republic of Tajikistan — Bilateral relations with Germany", u:"https://mfa.tj/en/main/view/180/bilateral-relations-of-tajikistan-with-germany"},
 {t:"EEAS — EU and Tajikistan initial the Enhanced Partnership and Cooperation Agreement", u:"https://www.eeas.europa.eu/delegations/tajikistan/european-union-and-tajikistan-initial-enhanced-partnership-and-cooperation-agreement_en"},
 {t:"Tax Code of the Republic of Tajikistan (as amended 14.05.2025), Tax Committee", u:"https://andoz.tj/docs/kodex/Kodex_14_05_2025_Nav_ENG_en.pdf"},
 {t:"Embassy of the RT in Germany — Free Economic Zones", u:"https://mfa.tj/en/berlin/relations/free-economic-zones"},
 {t:"FEZ “Kulob” — official site", u:"https://en.fezkulob.tj/kulob.html"},
 {t:"World Free Zones Organization — Tajikistan free zones (index card)", u:"https://www.worldfzo.org/Portals/0/OpenContent/Files/487/Tajikistan_FreeZones.pdf"},
 {t:"Eurostat — International trade in critical raw materials", u:"https://ec.europa.eu/eurostat/statistics-explained/index.php?title=International_trade_in_critical_raw_materials"},
 {t:"CAREC — Tajikistan’s Investment Opportunities in Hydropower (2023)", u:"https://energy.carecprogram.org/wp-content/uploads/2023/11/Tajikistans-Investment-Opportunities-in-Hydropower.pdf"},
 {t:"EU GSP Hub — Tajikistan", u:"https://gsphub.eu/country-info/Tajikistan"},
 {t:"European Commission — Access2Markets", u:"https://trade.ec.europa.eu/access-to-markets/en/home"},
 {t:"Messe Berlin — Grüne Woche 2027", u:"https://www.messe-berlin.de/de/veranstaltungen/veranstaltungskalender/messen/grune-woche-2027-2027"},
 {t:"Auswärtiges Amt — Vertretungen Tadschikistans in Deutschland", u:"https://www.auswaertiges-amt.de/de/service/laender/tadschikistan-node/vertretungentadschikistan-206764"},
 {t:"Germany Trade & Invest — Wirtschaft Tadschikistan", u:"https://www.gtai.de/de/trade/tadschikistan-wirtschaft"},
 {t:"Ost-Ausschuss der Deutschen Wirtschaft — Tadschikistan", u:"https://www.ost-ausschuss.de/de/tadschikistan"},
 {t:"EEAS — EU–Tajikistan relations", u:"https://www.eeas.europa.eu/eeas/eu-tajikistan-relations_en"},
 null,
 {t:"EUR-Lex — Regulation (EC) No 852/2004 on the hygiene of foodstuffs", u:"https://eur-lex.europa.eu/eli/reg/2004/852/oj"},
 {t:"EUR-Lex — Regulation (EU) No 1169/2011 on food information to consumers", u:"https://eur-lex.europa.eu/eli/reg/2011/1169/oj"},
 {t:"EUR-Lex — Regulation (EU) 2023/915 on maximum levels for contaminants", u:"https://eur-lex.europa.eu/eli/reg/2023/915/oj"},
 {t:"EUR-Lex — Regulation (EU) 2018/848 on organic production", u:"https://eur-lex.europa.eu/eli/reg/2018/848/oj"},
 {t:"Grant Thornton — Indirect tax guide: Tajikistan", u:"https://www.grantthornton.global/en/insights/indirect-tax-guide/indirect-tax---Tajikistan/"},
 {t:"BIOFACH — Nürnberg", u:"https://www.biofach.de"},
 {t:"ITB Berlin", u:"https://www.itb.com"},
 {t:"Anuga — Köln", u:"https://www.anuga.de"},
 {t:"Generalzolldirektion — EORI-Nummer", u:"https://www.zoll.de/DE/Fachthemen/Zoelle/EORI-Nummer/eori-nummer_node.html"},
 {t:"UNESCO World Heritage Centre — Tajikistan", u:"https://whc.unesco.org/en/statesparties/tj"},
 {t:"Asia-Plus — Three dried fruit producers from Isfara receive FSSC 22000 certificates, 18.09.2026", u:"https://asiaplus.news/en/2026/09/18/three-dried-fruit-producers-from-isfara-received-fssc-22000-certificates/"},
 {t:"Asia-Plus — Tajik dried fruit producers achieve key international certification, 31.10.2025", u:"https://asiaplus.news/en/2025/10/31/tajik-dried-fruit-producers-achieve-key-international-certification-boosting-export-potential/"},
 {t:"FreshPlaza — Tajikistan’s dried fruit processors pitch for new buyers at Food Ingredients Europe 2025", u:"https://www.freshplaza.com/europe/article/9791442/tajikistan-s-dried-fruit-processors-pitch-for-new-buyers-at-food-ingredients-europe-2025/"},
 {t:"European Commission — Access2Markets: My Trade Assistant", u:"https://trade.ec.europa.eu/access-to-markets/en/my-trade-assistant"},
 {t:"Barakat Isfara LLC — company website: products, quality, contacts", u:"https://barakat-isfara.com/about_company/"},
 {t:"Barakat Isfara LLC — “Barakat-Isfara products exported to Malaysia”, 29.03.2022", u:"https://barakat-isfara.com/2022/03/29/export_barakat/"},
 {t:"European Commission, DG Trade — European Union, trade in goods with Tajikistan (factsheet, 20.05.2026)", u:"https://webgate.ec.europa.eu/isdb_results/factsheets/country/details_tadjikistan_en.pdf"},
 {t:"Regulation (EU) No 978/2012 applying a scheme of generalised tariff preferences (GSP), Art. 7", u:"https://eur-lex.europa.eu/eli/reg/2012/978/oj"},
 {t:"Ministry of Economic Development and Trade of the RT — Tajikistan Trade Portal (UNCTAD eRegulations)", u:"https://tajtrade.tj/"},
 {t:"Auswärtiges Amt — Tadschikistan: Reise- und Sicherheitshinweise, Einreise und Zoll (Stand 03.10.2026)", u:"https://www.auswaertiges-amt.de/de/service/laender/tadschikistan-node/tadschikistansicherheit-206756"},
 {t:"Vertrag zwischen der Bundesrepublik Deutschland und der Republik Tadschikistan über die Förderung und den gegenseitigen Schutz von Kapitalanlagen, 27.03.2003 — BGBl. 2005 II S. 538", u:"https://edit.wti.org/wti-filesystem/20220210/aa204993-6df2-4424-81dc-6ca6a4cbf977/Germany%20-%20Tajikistan.pdf"},
 {t:"U.S. Department of State — 2024 Investment Climate Statements: Tajikistan", u:"https://www.state.gov/reports/2024-investment-climate-statements/tajikistan/"},
 {t:"AHK Zentralasien — Delegationsreise nach Duschanbe, 03.–06.11.2026", u:"https://zentralasien.ahk.de/de/veranstaltungen/events-2026/delegationsreise-nach-duschanbe"},
 {t:"Eurostat — Comext DS-045409, EU trade by HS2-4-6 and CN8: imports of Germany from Tajikistan (country of origin), 2023–2025, data as of 15.09.2026", u:"https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=A&reporter=DE&partner=TJ&flow=1&indicators=VALUE_IN_EUROS&product=TOTAL&time=2023&time=2024&time=2025"},
 {t:"Gulfood 2026, Dubai — exhibitor brand profile: Barakat Isfara", u:"https://www.gulfood.com/gulfood-2026-brands/barakat-isfara"},
 {t:"Gulfood 2026, Dubai — exhibitor profile: Isfarafood LLC", u:"https://www.gulfood.com/exhibitors/isfarafood-llc"},
 {t:"Gulfood 2026, Dubai — exhibitor profile and press release: Oro Isfara LLC", u:"https://www.gulfood.com/exhibitors/oro-isfara-llc"},
 {t:"Gulfood 2026, Dubai — exhibitor profile: Zardolui Isfara LLC (Zardolu)", u:"https://www.gulfood.com/exhibitors/zardolui-isfara-llc"},
 {t:"Gulfood 2026, Dubai — exhibitor profile: Visol Isfara LLC (brand Vodii Zarrin)", u:"https://www.gulfood.com/exhibitors/visol-isfara-llc"}
];
function sref(n){ return '<a class="src" href="#quellen" data-src="'+n+'" title="'+(SRC[n]?SRC[n].t.replace(/"/g,"&quot;"):"")+'">['+n+']</a>'; }

/* Free economic zones — positions are real coordinates of the host towns */
var ZONES = [
 {id:"sughd", lat:40.28, lon:69.62, ha:"320", year:"2009", src:9},
 {id:"panj", lat:37.24, lon:69.10, ha:"401.6", year:"", src:9},
 {id:"dangara", lat:38.10, lon:69.33, ha:"521", year:"", src:9},
 {id:"ishkashim", lat:36.73, lon:71.61, ha:"200", year:"", src:11},
 {id:"kulob", lat:37.91, lon:69.78, ha:"309.32", year:"2019", src:10}
];
var CITIES = [{n:"Dushanbe", lat:38.56, lon:68.78}, {n:"Khujand", lat:40.28, lon:69.62}];

var EVENTS = [
 {d1:"2026-11-03", d2:"2026-11-06", id:"ahk", city:"Duschanbe", cityL:{de:"Duschanbe",ru:"Душанбе",en:"Dushanbe",tj:"Душанбе"}, src:44, url:"https://zentralasien.ahk.de/de/veranstaltungen/events-2026/delegationsreise-nach-duschanbe", urlRu:"https://zentralasien.ahk.de/ru/meropriyatiya/events-2026/delegacionnaya-poezdka-v-dushanbe"},
 {d1:"2027-01-15", d2:"2027-01-24", id:"igw", city:"Berlin", src:16, url:"https://www.gruenewoche.de"},
 {d1:"2027-02-16", d2:"2027-02-19", id:"biofach", city:"Nürnberg", src:27, url:"https://www.biofach.de"},
 {d1:"2027-03-16", d2:"2027-03-18", id:"itb", city:"Berlin", src:28, url:"https://www.itb.com"},
 {d1:"2027-10-09", d2:"2027-10-13", id:"anuga", city:"Köln", src:29, url:"https://www.anuga.de"}
];

var NEWS = [
 {d:"2026-06-19", cat:"eu", src:20, id:"cc12"},
 {d:"2026-04-15", cat:"econ", src:2, id:"mpo"},
 {d:"2026-02-21", cat:"econ", src:3, id:"pop"},
 {d:"2025-07-30", cat:"econ", src:1, id:"weu"},
 {d:"2025-07-18", cat:"eu", src:7, id:"epca"}
];

/* the trade representative: this is his own website */
var REP = {li:"https://www.linkedin.com/in/masrur-kurbonalizoda-034483270",
 n:{de:"Masrur Kurbonalizoda", en:"Masrur Kurbonalizoda", ru:"Масрур Курбонализода", tj:"Масрур Қурбонализода"},
 ini:{de:"MK", en:"MK", ru:"МК", tj:"МК"}};

/* Access2Markets lookup: the result opens on the EU portal with Tajikistan as origin */
var A2M = {
 base:"https://trade.ec.europa.eu/access-to-markets/",
 eu:["DE","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"],
 /* HS codes of goods Tajikistan exports or could export to the EU */
 hs:["081310","080620","081320","080232","080212","040900","071320","121190","520100","760110","261710","811010"]
};

/* Dried-fruit exporters from Sughd, only as reported by the cited sources (src).
   Vodii Mevaho is Tajik for "Valley of Fruits" — the same company that appeared at FiE 2025 as Dolina Fruktov (Russian name). */
/* What Germany imported from Tajikistan (country of origin), Eurostat Comext DS-045409, CN8 lines.
   Tonnes from QUANTITY_IN_100KG / 10, euros from VALUE_IN_EUROS. */
var DEIMP = {src:45, years:[2023,2024,2025], total:[2803511,2184084,5283454],
 items:[
  {k:"kernels", cn:"1212 99 95", t:[889.0,741.3,1385.2], v:[2528292,1692446,3671120], img:"p_kernels"},
  {k:"apple",   cn:"0813 30 00", t:[107.5,322.5,511.6],  v:[139816,419250,715569],  img:"p_apple"},
  {k:"apricot", cn:"0813 10 00", t:[0,0.3,116.6],        v:[0,255,479149],          img:"p_apricot"}
 ],
 /* other lines worth naming, euros */
 other:[{k:"pharma", y:2025, v:256070},{k:"carpets", y:2023, v:16400},{k:"denim", y:2023, v:28088},{k:"rice", y:2023, v:19030}]
};

var EXPORTERS = [
 {n:"Barakat Isfara", gf:true, f:"LLC", city:"isfara", y:2008, feat:true, logo:"l_barakat",
  pics:["p_apricot","p_kernels","p_apple","p_walnut","p_rosehip","p_mulberry"], shots:["bk_factory","bk_line"],
  pr:["apricot","prunes","raisins","compote","chopped","snacks","sweets","apple","rosehip","mulberry","walnuts","kernels","almonds"],
  mk:["RU","CZ","TR","CA","MY"], std:"HACCP", staff:"140+", fair:true,
  web:"https://barakat-isfara.com", mail:"info@barakat-isfara.com", tel:"+992 98 770 0565",
  ig:"https://www.instagram.com/barakatisfara/", yt:"https://www.youtube.com/watch?v=LVxMKZkdVLg", src:[36,37,34,46]},
 {n:"Isfarafood", gf:true, f:"LLC", city:"isfara", y:2010, logo:"l_isfarafood", pr:["apricot","apple","pear","compote","chopped"], mk:["RU","KZ","EU"], cert:"FSSC 22000", cy:2026, src:[32,47]},
 {n:"Oro Isfara", gf:true, f:"LLC", city:"isfara", logo:"l_oro", pic:"oro_photo", cap:">2000", pr:["apricot","raisins","prunes","nuts"], mk:["CIS","EU"], cert:"FSSC 22000", cy:2026, src:[32,48]},
 {n:"Zardolu", gf:true, f:"LLC «Zardolui Isfara»", city:"isfara", logo:"l_zardolu", pr:["apricot"], mk:["RU","EU","US","ME"], cert:"FSSC 22000", cy:2025, std:"ISO 22000:2018", src:[33,49]},
 {n:"Vodii Zarrin", gf:true, f:"LLC «Visol Isfara»", city:"isfara", logo:"l_vodiizarrin", pr:["apricot","prunes","mulberry","canned"], mk:["CIS"], src:[50]},
 {n:"Vodii Mevaho", f:"LLC", alias:"Fruits Valley · Dolina Fruktov", city:"isfara", y:2017, cap:"≤1500", pr:["fruit","nuts","rosehip","kernels"], mk:["DE","PL","TR","US","CIS"], cert:"FSSC 22000", cy:2026, fair:true, src:[32,34]},
 {n:"Ali Apricot", city:"isfara", pr:["apricot","raisins","prunes"], fair:true, src:[34]},
 {n:"Mevai Kand", city:"sughd", pr:["fruit"], cert:"FSSC 22000", cy:2025, src:[33]},
 {n:"Kand K", city:"sughd", pr:["fruit"], cert:"FSSC 22000", cy:2025, src:[33]}
];

/* EU imports from Tajikistan by HS section, 2025, million EUR (DG Trade factsheet, src 38); total 579 */
var EUIMP = {total:579, growth:90.4, rows:[["metals",533,92.0],["mineral",19,3.2],["textile",14,2.4],["veg",10,1.8],["hides",1,0.2]]};

/* Tajikistan Trade Portal (MEDT, eRegulations): step-by-step export procedures on the Tajik side.
   HS code -> procedure id, only where the portal has a procedure for that product (src 40) */
var TJTRADE = {base:"https://tajtrade.tj/", rex:"menu/47", all:"objective/20", producers:"menu/40",
 proc:{"081310":7,"080620":7,"081320":7,"040900":27,"520100":6,"760110":638},
 name:{7:{ru:"Экспорт сушёных фруктов автотранспортом",en:"Export of dried fruit by road"},27:{ru:"Экспорт мёда автотранспортом",en:"Export of honey by road"},6:{ru:"Экспорт хлопка железнодорожным транспортом",en:"Export of cotton by railway"},638:{ru:"Экспорт алюминиевых изделий железнодорожным транспортом",en:"Export of aluminium products by railway"}}};
