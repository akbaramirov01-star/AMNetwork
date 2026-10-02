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
 {t:"Regulation (EU) No 978/2012 applying a scheme of generalised tariff preferences (GSP), Art. 7", u:"https://eur-lex.europa.eu/eli/reg/2012/978/oj"}
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
var EXPORTERS = [
 {n:"Barakat Isfara", f:"LLC", city:"isfara", feat:true, pr:["apricot","prunes","raisins","compote","chopped","snacks","sweets","apple","rosehip","mulberry","walnuts","kernels","almonds"],
  mk:["RU","CZ","TR","CA","MY"], std:"HACCP", staff:"140+", fair:true,
  web:"https://barakat-isfara.com", mail:"info@barakat-isfara.com", tel:"+992 98 770 0565", src:[36,37,34]},
 {n:"Isfara Food", f:"LLC", city:"isfara", y:2010, pr:["apricot","apple","pear","compote"], mk:["RU","KZ","EU"], cert:"FSSC 22000", cy:2026, src:[32]},
 {n:"Oro Isfara", f:"LLC", city:"isfara", cap:">2000", pr:["fruit","nuts"], mk:["CIS","EU"], cert:"FSSC 22000", cy:2026, src:[32]},
 {n:"Vodii Mevaho", f:"LLC", alias:"Fruits Valley · Dolina Fruktov", city:"isfara", y:2017, cap:"≤1500", pr:["fruit","nuts","rosehip","kernels"], mk:["DE","PL","TR","US","CIS"], cert:"FSSC 22000", cy:2026, fair:true, src:[32,34]},
 {n:"Ali Apricot", city:"isfara", pr:["apricot","raisins","prunes"], fair:true, src:[34]},
 {n:"Zardolui Isfara", city:"sughd", pr:["fruit"], cert:"FSSC 22000", cy:2025, src:[33]},
 {n:"Mevai Kand", city:"sughd", pr:["fruit"], cert:"FSSC 22000", cy:2025, src:[33]},
 {n:"Kand K", city:"sughd", pr:["fruit"], cert:"FSSC 22000", cy:2025, src:[33]}
];

/* EU imports from Tajikistan by HS section, 2025, million EUR (DG Trade factsheet, src 38); total 579 */
var EUIMP = {total:579, growth:90.4, rows:[["metals",533,92.0],["mineral",19,3.2],["textile",14,2.4],["veg",10,1.8],["hides",1,0.2]]};
