(function(){
"use strict";
document.documentElement.classList.add("js");
var ROUTES = ["home","tadschikistan","branchen","investieren","export","termine","aktuelles","service","dokumente","quellen","kontakt","impressum","datenschutz"];
var NAVMAIN = ["tadschikistan","branchen","investieren","export","termine","aktuelles","kontakt"];
var LANGS = ["tj","de","ru","en"];
var LK = "tjtrade_lang", TK = "tjtrade_theme";
var lang = (function(){ try{ var s = localStorage.getItem(LK); if(s && C[s]) return s; }catch(e){} var n=(navigator.language||"de").slice(0,2); return C[n]?n:"de"; })();
var L = C[lang];
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return [].slice.call((r||document).querySelectorAll(s)); };
var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var ext = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17 17 7M9 7h8v8"/></svg>';
function refs(a){ return (a||[]).filter(Boolean).map(sref).join(""); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
function fmtDate(iso, opt){ var d = new Date(iso+"T12:00:00"); var loc = {de:"de-DE",ru:"ru-RU",en:"en-GB",tj:"tg-TJ"}[lang]; try{ return d.toLocaleDateString(loc, opt||{day:"2-digit",month:"2-digit",year:"numeric"}); }catch(e){ return iso; } }
function dm(iso){ var d=iso.split("-"); return d[2]+"."+d[1]+"."; }

var ICON = {
 energy:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 38c6-4 10-4 16 0s10 4 16 0"/><path d="M6 30c6-4 10-4 16 0s10 4 16 0"/><path d="M26 6 18 22h8l-2 12 10-18h-8z"/></svg>',
 mining:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 40 18 14l8 12 6-8 12 22z"/><path d="M18 14l3 8-5 4M32 18l2 6"/></svg>',
 agri:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="24" cy="26" r="12"/><path d="M24 14c0-5 3-8 8-8-1 5-4 8-8 8zM24 14v-3"/><path d="M18 26c2 3 5 4 8 3"/></svg>',
 textile:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 12h36M6 20h36M6 28h36M6 36h36"/><path d="M12 6v36M24 6v36M36 6v36" opacity=".45"/></svg>',
 tourism:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 40 17 18l7 10 6-9 15 21z"/><path d="m14 23 3-5 3 4M27 24l3-5 2 3"/><circle cx="38" cy="10" r="3"/></svg>',
 industry:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 42V22l10 6v-6l10 6v-6l10 6V8h8v34z"/><path d="M10 36h4M20 36h4M30 36h4"/></svg>'
};

/* ------------------------------------------------------------ chrome */
function renderChrome(){
 document.documentElement.lang = {tj:"tg",de:"de",ru:"ru",en:"en"}[lang];
 $("#brandB").textContent = L.brand; $("#brandS").textContent = L.brandSub;
 $("#fBrandB").textContent = L.brand; $("#fBrandP").textContent = L.foot.tag;
 $("#nav").innerHTML = NAVMAIN.map(function(r){ return '<a href="#'+r+'" data-go="'+r+'">'+L.nav[r]+'</a>'; }).join("");
 $("#dnav").innerHTML = ["home"].concat(NAVMAIN,["service","dokumente"]).map(function(r,i){ return '<a href="#'+r+'" data-go="'+r+'">'+L.nav[r]+'<small>'+("0"+(i)).slice(-2)+'</small></a>'; }).join("");
 $$(".cta-partner").forEach(function(a){ a.innerHTML = L.nav.service + arrow; });
 $("#langBtn span").textContent = lang.toUpperCase();
 $("#langList").innerHTML = LANGS.map(function(c){ return '<li><button data-lang="'+c+'" class="'+(c===lang?"on":"")+'">'+C[c].name+'<small>'+c.toUpperCase()+'</small></button></li>'; }).join("");
 $("#dlangs").innerHTML = LANGS.map(function(c){ return '<button class="chip" data-lang="'+c+'">'+c.toUpperCase()+'</button>'; }).join("") + '<button class="chip" data-theme-toggle>'+L.ui.theme+'</button>';
 $("#menuLbl").textContent = L.ui.menu; $("#closeLbl").textContent = L.ui.close;
 $$(".theme").forEach(function(b){ b.setAttribute("aria-label", L.ui.theme); });
 $("#fcols").innerHTML =
  '<div class="fbrand"><b>'+L.brand+'</b><p>'+L.foot.tag+'</p></div>'+
  '<div><h4>'+L.foot.c1+'</h4><ul>'+["tadschikistan","branchen","investieren","export"].map(li).join("")+'</ul></div>'+
  '<div><h4>'+L.foot.c2+'</h4><ul>'+["service","termine","aktuelles","dokumente","quellen"].map(li).join("")+'</ul></div>'+
  '<div><h4>'+L.foot.c3+'</h4><ul>'+li("kontakt")+'<li><a href="#impressum" data-go="impressum">'+L.foot.imp+'</a></li><li><a href="#datenschutz" data-go="datenschutz">'+L.foot.dat+'</a></li></ul></div>';
 $("#fbot").innerHTML = '<span>'+L.foot.rights+'</span><span>'+L.foot.demo+'</span>';
 function li(r){ return '<li><a href="#'+r+'" data-go="'+r+'">'+L.nav[r]+'</a></li>'; }
}

/* ------------------------------------------------------------ hero */
function renderHero(){
 var H = L.hero;
 $("#c1").innerHTML = '<div class="in"><div class="kick">'+H.k1+'</div><h1>'+H.t1+'</h1><p class="sub">'+H.s1+'</p><div class="acts"><a class="cta" href="#investieren" data-go="investieren">'+H.b1+arrow+'</a><a class="cta ghost" href="#export" data-go="export">'+H.b2+'</a></div></div>';
 var srcs=[13,2,3,12];
 $("#c2").innerHTML = '<div class="in"><div class="kick">'+H.k2+'</div><h2>'+H.t2+sref(13)+'</h2><div class="figs-strip">'+H.fv.map(function(v,i){ return '<div><b>'+v+'</b><span>'+H.f[i]+' '+sref(srcs[i])+'</span></div>'; }).join("")+'</div></div>';
 $("#c3").innerHTML = '<div class="in"><div class="box"><div class="kick">'+H.k3+'</div><h2>'+H.t3+'</h2><p class="sub">'+H.s3+'</p><div class="acts"><a class="cta" href="#service" data-go="service">'+H.b3+arrow+'</a><a class="cta ghost" href="#kontakt" data-go="kontakt">'+H.b4+'</a></div></div></div>';
 $("#meterLbl").textContent = L.ui.scroll;
 $("#altLbl").textContent = L.ui.alt;
}

/* ------------------------------------------------------------ pages */
function sectorCards(limit){
 return L.sectors.slice(0,limit||6).map(function(s){
  return '<button class="sector rv" data-sector="'+s.id+'"><span class="ico">'+ICON[s.id]+'</span><h3>'+s.n+'</h3><p>'+s.s+'</p><span class="tag">'+s.tag+'<i>→</i></span></button>';
 }).join("");
}
function eventRows(){
 return EVENTS.map(function(e){
  var t = L.events.list[e.id];
  var y = e.d1.slice(0,4);
  return '<div class="evt rv"><div class="date">'+dm(e.d1)+'–'+dm(e.d2)+'<small>'+y+'</small></div><div><h3><a href="'+e.url+'" target="_blank" rel="noopener" style="text-decoration:none">'+t.n+'</a></h3><p>'+t.p+'</p></div><div class="where">'+e.city+' '+sref(e.src)+'</div><a class="arr" href="'+e.url+'" target="_blank" rel="noopener" aria-label="'+esc(t.n)+'">'+ext+'</a></div>';
 }).join("");
}
function newsRows(filter, limit){
 return NEWS.filter(function(n){ return !filter || filter==="all" || n.cat===filter; }).slice(0,limit||99).map(function(n){
  var t = L.news.items[n.id];
  return '<article class="item rv"><div class="when"><small>'+L.news.tabs[n.cat]+'</small>'+fmtDate(n.d)+'</div><div><h3>'+t.t+'</h3><p>'+t.p+'</p></div><a class="s" href="'+SRC[n.src].u+'" target="_blank" rel="noopener">'+L.news.src+' ['+n.src+']</a></article>';
 }).join("");
}
function phead(key, h1, lead, seed){
 return '<header class="phead"><canvas class="contours" data-seed="'+seed+'"></canvas><div class="wrap"><div class="crumb"><a href="#home" data-go="home">'+L.nav.home+'</a> / '+(L.nav[key]||h1)+'</div><h1 class="rv">'+h1+'</h1><p class="lead rv">'+lead+'</p></div></header>';
}

function pageHome(){
 var H = L.home;
 var door = function(k, cls, go){ var d=H[k]; return '<a class="door '+cls+' rv" href="#'+go+'" data-go="'+go+'"><span class="flagline"></span><span class="lab">'+d.lab+'</span><h3>'+d.t+'</h3><p>'+d.p+'</p><ul>'+d.li.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul><span class="go"><i>'+arrow+'</i>'+d.go+'</span></a>'; };
 return ''+
 '<section class="sec flush"><div class="wrap"><div class="head"><div class="kicker">'+H.dk+'</div><h2 class="h2 rv">'+H.dt+'</h2></div><div class="doors">'+door("de","de","investieren")+door("tj","tj","export")+'</div></div></section>'+
 '<section class="sec tint"><div class="wrap"><div class="head split"><div><div class="kicker">'+H.fk+'</div><h2 class="h2 rv">'+H.ft+'</h2></div><p class="lead rv">'+H.fl+'</p></div><div class="board">'+
   H.figs.map(function(f){ return '<div class="fig rv"><div class="v"><span class="count" data-to="'+f.v+'">'+f.v+'</span><small>'+f.u+'</small></div><div class="l">'+f.l+' '+sref(f.s)+'</div><div class="d">'+f.d+'</div></div>'; }).join("")+
 '</div></div></section>'+
 '<section class="sec"><div class="wrap"><div class="head"><div class="kicker">'+H.wk+'</div><h2 class="h2 rv">'+H.wt+'</h2></div><div class="rows">'+
   H.why.map(function(w,i){ return '<div class="row rv"><span class="n">0'+(i+1)+'</span><h3>'+w.t+'</h3><p>'+w.p+' '+refs(w.s)+'</p></div>'; }).join("")+
 '</div></div></section>'+
 '<section class="sec tint"><div class="wrap"><div class="head split"><div><div class="kicker">'+H.sk+'</div><h2 class="h2 rv">'+H.st+'</h2></div><p class="lead rv">'+L.sx.hint+'</p></div><div class="sectors" id="homeSectors">'+sectorCards()+'</div></div></section>'+
 '<section class="sec"><div class="wrap"><div class="head split"><div><div class="kicker">'+H.ek+'</div><h2 class="h2 rv">'+H.et+'</h2></div><p class="lead rv"><a class="cta ghost" href="#termine" data-go="termine">'+L.ui.more+arrow+'</a></p></div><div class="evts">'+eventRows()+'</div></div></section>'+
 '<section class="sec tint"><div class="wrap"><div class="head split"><div><div class="kicker">'+H.nk+'</div><h2 class="h2 rv">'+H.nt+'</h2></div><p class="lead rv"><a class="cta ghost" href="#aktuelles" data-go="aktuelles">'+L.ui.more+arrow+'</a></p></div><div class="feed">'+newsRows("all",3)+'</div></div></section>'+
 band();
}
function band(){
 var b = L.home.band;
 return '<section class="band"><canvas class="contours" data-seed="7"></canvas><div class="tri" style="position:absolute;top:0;left:0;right:0"><i></i><i></i><i></i></div><div class="wrap"><h2 class="rv">'+b.t+'</h2><p class="rv">'+b.p+'</p><div class="acts"><a class="cta" href="#service" data-go="service">'+b.b1+arrow+'</a><a class="cta ghost" href="#kontakt" data-go="kontakt">'+b.b2+'</a></div></div></section>';
}

function pageLand(){
 var D = L.land;
 return phead("tadschikistan", D.h1, D.lead, 2)+
 '<section class="sec flush"><div class="wrap split2"><div><div class="kicker">'+D.ek+'</div><h2 class="h2 rv">'+D.et+'</h2><p class="note rv">'+D.kvn+'</p></div><table class="kv rv"><tbody>'+
   D.kv.map(function(r){ return '<tr><td>'+r[0]+' '+sref(r[2])+'</td><td>'+r[1]+'</td></tr>'; }).join("")+
 '</tbody></table></div></section>'+
 '<section class="sec tint"><div class="wrap split2"><div><div class="kicker">'+D.tk+'</div><h2 class="h2 rv">'+D.tt+'</h2><p class="lead rv">'+D.tl+' '+sref(4)+'</p><p class="quote rv">'+D.q+'</p></div><div class="rv" style="padding-top:12px"><div class="bars">'+
   '<div class="barrow de"><div class="bl"><span>'+D.bde+'</span><b>'+D.vde+'</b></div><div class="bt"><i data-w="100"></i></div></div>'+
   '<div class="barrow tj"><div class="bl"><span>'+D.btj+'</span><b>'+D.vtj+'</b></div><div class="bt"><i data-w="6"></i></div></div>'+
 '</div><p class="note">'+D.tn+' '+sref(4)+'</p></div></div></section>'+
 '<section class="sec"><div class="wrap"><div class="head"><div class="kicker">'+D.ak+'</div><h2 class="h2 rv">'+D.at+'</h2></div><div class="tl">'+
   D.treaties.map(function(t){ return '<div class="t rv"><div class="dt">'+t.d+'</div><div><h3>'+t.t+' '+sref(t.s)+'</h3><p>'+t.p+'</p></div></div>'; }).join("")+
 '</div></div></section>'+
 '<section class="sec tint"><div class="wrap split2"><div><div class="kicker">'+D.gk+'</div><h2 class="h2 rv">'+D.gt+'</h2></div><div><p class="lead rv" style="margin-top:0">'+D.gp+' '+refs(D.gs)+'</p><p style="margin-top:26px"><a class="cta ghost" href="'+SRC[15].u+'" target="_blank" rel="noopener">Access2Markets '+ext+'</a></p></div></div></section>'+
 band();
}

function pageSectors(){
 return phead("branchen", L.sx.h1, L.sx.lead, 3)+
 '<section class="sec flush"><div class="wrap"><div class="sectors" id="secGrid">'+sectorCards()+'</div></div></section>'+band();
}
function dossier(s){
 return '<div class="dossier on" id="dossier"><div><p class="big">'+s.big+' '+(s.bs?sref(s.bs):"")+'</p></div><div style="display:grid;gap:26px"><div><h4>'+L.sx.need+'</h4><ul>'+s.need.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div><div><h4>'+L.sx.de+'</h4><ul>'+s.de.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div></div></div>';
}

function pageInvest(){
 var I = L.invest;
 return phead("investieren", I.h1, I.lead, 4)+
 '<section class="sec flush"><div class="wrap split2"><div><div class="kicker">'+I.xk+'</div><h2 class="h2 rv">'+I.xt+'</h2><p class="note rv">'+I.xn+'</p></div><div><table class="kv rv"><tbody>'+
   I.tax.map(function(r){ return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>'; }).join("")+
 '</tbody></table><p class="note">'+refs(I.xs)+'</p></div></div></section>'+
 '<section class="sec tint"><div class="wrap"><div class="head split"><div><div class="kicker">'+I.zk+'</div><h2 class="h2 rv">'+I.zt+'</h2></div><p class="lead rv">'+I.zl+' '+refs([9,10,11])+'</p></div>'+
   '<div class="fezwrap rv"><div class="fezmap" id="fezmap"></div><div class="fezcard" id="fezcard"></div></div></div></section>'+
 '<section class="sec"><div class="wrap"><div class="head"><div class="kicker">'+I.sk+'</div><h2 class="h2 rv">'+I.stt+'</h2></div><div class="steps" style="--n:'+I.steps.length+'">'+
   I.steps.map(function(s,i){ return '<div class="step rv"><div class="sn">'+(i+1)+'</div><h3>'+s.t+'</h3><p>'+s.p+'</p><div class="who">'+s.w+'</div></div>'; }).join("")+
 '</div></div></section>'+
 '<section class="sec tint"><div class="wrap split2"><div><div class="kicker">'+I.pk+'</div><h2 class="h2 rv">'+I.pt+'</h2></div><div><p class="lead rv" style="margin-top:0">'+I.pp+'</p><p style="margin-top:28px"><a class="cta" href="#service" data-go="service" data-form="partner">'+I.pb+arrow+'</a></p></div></div></section>'+
 band();
}

function fezMap(){
 var host = $("#fezmap"); if(!host) return;
 var W=640, H=480, minLon=67.6, maxLon=72.6, minLat=36.3, maxLat=40.9;
 function X(lon){ return 40 + (lon-minLon)/(maxLon-minLon)*(W-80); }
 function Y(lat){ return 50 + (maxLat-lat)/(maxLat-minLat)*(H-90); }
 var g = '';
 for(var lo=68; lo<=72; lo++) g += '<line x1="'+X(lo)+'" y1="20" x2="'+X(lo)+'" y2="'+(H-30)+'" stroke="currentColor" stroke-opacity=".08"/><text x="'+X(lo)+'" y="'+(H-14)+'" font-size="9" text-anchor="middle" fill="currentColor" opacity=".35" font-family="IBM Plex Mono,monospace">'+lo+'°E</text>';
 for(var la=37; la<=41; la++) g += '<line x1="30" y1="'+Y(la)+'" x2="'+(W-20)+'" y2="'+Y(la)+'" stroke="currentColor" stroke-opacity=".08"/><text x="8" y="'+(Y(la)+3)+'" font-size="9" fill="currentColor" opacity=".35" font-family="IBM Plex Mono,monospace">'+la+'°N</text>';
 CITIES.forEach(function(c){ if(c.n==="Khujand") return; g += '<g><rect x="'+(X(c.lon)-4)+'" y="'+(Y(c.lat)-4)+'" width="8" height="8" fill="none" stroke="currentColor" stroke-opacity=".7"/><text x="'+(X(c.lon)-10)+'" y="'+(Y(c.lat)+4)+'" text-anchor="end" font-size="11" fill="currentColor" opacity=".75" font-family="IBM Plex Mono,monospace">'+c.n+'</text></g>'; });
 ZONES.forEach(function(z){
  var nm = L.invest.zones[z.id].n.replace(/^(FWZ|СЭЗ|FEZ|МОИ)\s*/,"");
  g += '<g class="pin" data-zone="'+z.id+'" tabindex="0" role="button" aria-label="'+esc(L.invest.zones[z.id].n)+'"><circle class="halo" cx="'+X(z.lon)+'" cy="'+Y(z.lat)+'" r="14"><animate attributeName="r" values="7;18;7" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="3.2s" repeatCount="indefinite"/></circle><circle class="core" cx="'+X(z.lon)+'" cy="'+Y(z.lat)+'" r="6"/><text x="'+(X(z.lon)+12)+'" y="'+(Y(z.lat)+4)+'">'+nm+'</text></g>';
 });
 host.innerHTML = '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" style="color:var(--ink)">'+g+'</svg><div class="cap">'+L.invest.zcap+'</div>';
 $$(".pin", host).forEach(function(p){
  p.addEventListener("click", function(){ fezSelect(p.getAttribute("data-zone")); });
  p.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); fezSelect(p.getAttribute("data-zone")); } });
 });
 fezSelect("sughd");
}
function fezSelect(id){
 var z = ZONES.filter(function(x){return x.id===id;})[0], t = L.invest.zones[id], I = L.invest;
 $$("#fezmap .pin").forEach(function(p){ p.classList.toggle("on", p.getAttribute("data-zone")===id); });
 var ha = lang==="en" ? z.ha : z.ha.replace(".",",");
 $("#fezcard").innerHTML = '<div class="kicker" style="margin:0">'+t.f+'</div><div class="z">'+t.n+'</div><div class="meta"><span>'+I.ha+': <b>'+ha+' ha</b></span><span>'+I.yr+': <b>'+(z.year||I.none)+'</b></span><span>'+sref(z.src)+'</span></div><p>'+t.p+'</p><div class="fezlist">'+ZONES.map(function(o){ return '<button data-zone="'+o.id+'" class="'+(o.id===id?"on":"")+'">'+L.invest.zones[o.id].n+'</button>'; }).join("")+'</div>';
 $$("#fezcard .fezlist button").forEach(function(b){ b.addEventListener("click", function(){ fezSelect(b.getAttribute("data-zone")); }); });
}

function pageExport(){
 var E = L.exp;
 return phead("export", E.h1, E.lead, 5)+
 '<section class="sec flush"><div class="wrap"><div class="head"><div class="kicker">'+E.sk+'</div><h2 class="h2 rv">'+E.stt+'</h2></div><div class="steps" style="--n:'+E.steps.length+'">'+
   E.steps.map(function(s,i){ return '<div class="step rv"><div class="sn">'+(i+1)+'</div><h3>'+s.t+'</h3><p>'+s.p+'</p><div class="who">'+s.w+'</div></div>'; }).join("")+
 '</div></div></section>'+
 '<section class="sec tint"><div class="wrap"><div class="head"><div class="kicker">'+E.rk+'</div><h2 class="h2 rv">'+E.rt+'</h2></div><div class="regs">'+
   E.regs.map(function(r){ return '<div class="reg rv"><div class="code">'+r.c+'</div><h3>'+r.t+'</h3><p>'+r.p+'</p><a href="'+SRC[r.s].u+'" target="_blank" rel="noopener">'+SRC[r.s].t.split(" — ")[0]+' ↗</a></div>'; }).join("")+
 '</div></div></section>'+
 '<section class="sec"><div class="wrap split2"><div><div class="kicker">'+E.ak+'</div><h2 class="h2 rv">'+E.at+'</h2></div><div><p class="lead rv" style="margin-top:0">'+E.ap+' '+sref(15)+'</p><p style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap"><a class="cta" href="'+SRC[15].u+'" target="_blank" rel="noopener">'+E.ab+' '+ext+'</a><a class="cta ghost" href="#service" data-go="service" data-form="exporter">'+L.service.forms.exporter.t+'</a></p></div></div></section>'+
 '<section class="sec tint"><div class="wrap"><div class="head"><div class="kicker">'+E.mk+'</div><h2 class="h2 rv">'+E.mt+'</h2></div><div class="evts">'+eventRows()+'</div></div></section>'+
 band();
}

function pageEvents(){
 var V = L.events;
 return phead("termine", V.h1, V.lead, 6)+'<section class="sec flush"><div class="wrap"><div class="evts">'+eventRows()+'</div><p class="note rv" style="margin-top:28px">'+V.note+'</p></div></section>'+band();
}
function pageNews(){
 var N = L.news;
 return phead("aktuelles", N.h1, N.lead, 8)+'<section class="sec flush"><div class="wrap"><div class="tabs" id="newsTabs">'+
  ["all","eu","econ","emb"].map(function(k,i){ return '<button data-cat="'+k+'" class="'+(i===0?"on":"")+'">'+N.tabs[k]+'</button>'; }).join("")+
  '</div><div class="feed" id="newsFeed">'+newsRows("all")+'</div></div></section>'+band();
}

function pageService(){
 var S = L.service, F = S.f;
 function fld(id,lab,type,full){ return '<div class="fld"'+(full?' style="grid-column:1/-1"':'')+'><label for="'+id+'">'+lab+'</label>'+(type==="ta"?'<textarea id="'+id+'" required></textarea>':type==="sel"?'<select id="'+id+'">'+F.sectors.map(function(o){return '<option>'+o+'</option>';}).join("")+'</select>':'<input id="'+id+'" type="'+(type||"text")+'" required>')+'</div>'; }
 var common = function(p){ return '<div class="fr">'+fld(p+"c",F.company)+fld(p+"n",F.name)+fld(p+"e",F.email,"email")+fld(p+"p",F.phone,"tel")+'</div>'; };
 var forms = {
  partner: common("a")+'<div class="fr">'+fld("asec",F.sector,"sel")+fld("actry",F.country)+'</div>'+fld("aneed",F.need,"ta"),
  exporter: common("b")+'<div class="fr">'+fld("bsec",F.sector,"sel")+fld("bvol",F.volume)+'</div>'+fld("bprod",F.product,"ta")+fld("bcert",F.certs),
  meeting: common("m")+'<div class="fr">'+fld("mdate",F.date,"date")+'<div class="fld"><label for="mfmt">'+F.format+'</label><select id="mfmt"><option>'+F.f1+'</option><option>'+F.f2+'</option></select></div></div>'+fld("mtop",F.topic,"ta")
 };
 return phead("service", S.h1, S.lead, 9)+'<section class="sec flush"><div class="wrap formgrid"><div class="ftabs" id="ftabs">'+
  Object.keys(S.forms).map(function(k,i){ var f=S.forms[k]; return '<button data-f="'+k+'" class="'+(i===0?"on":"")+'"><span><b>'+f.t+'</b>'+f.p+'</span><i>'+f.s+'</i></button>'; }).join("")+
  '</div><div>'+Object.keys(forms).map(function(k,i){ var f=S.forms[k]; return '<form class="f '+(i===0?"on":"")+'" data-f="'+k+'" novalidate><h3>'+f.t+'</h3><p class="fl">'+f.p+'</p>'+forms[k]+'<button class="cta" type="submit">'+F.send+arrow+'</button><div class="ok">'+F.ok+'</div><p class="fine">'+F.fine+'</p></form>'; }).join("")+'</div></div></section>';
}

function pageDocs(){
 var D = L.docs;
 return phead("dokumente", D.h1, D.lead, 10)+'<section class="sec flush"><div class="wrap">'+
  D.groups.map(function(g){ return '<div class="docgroup"><h3 class="gh">'+g.h+'</h3><div class="docs">'+g.items.map(function(n){ var s=SRC[n]; var host=s.u.split("/")[2].replace("www.",""); var parts=s.t.split(" — "); return '<a class="doc rv" href="'+s.u+'" target="_blank" rel="noopener"><span class="ty">'+(D.ty[n]||"")+'</span><h3>'+(parts[1]||parts[0])+'</h3><p>'+parts[0]+'</p><span class="host"><span>'+host+'</span><span>['+n+'] ↗</span></span></a>'; }).join("")+'</div></div>'; }).join("")+
 '</div></section>';
}
function pageSources(){
 var S = L.sources;
 return phead("quellen", S.h1, S.lead, 11)+'<section class="sec flush"><div class="wrap"><ol class="srcs">'+
  SRC.map(function(s,i){ return s?'<li id="src-'+i+'"><b>['+i+']</b><a href="'+s.u+'" target="_blank" rel="noopener">'+s.t+'</a></li>':""; }).join("")+'</ol></div></section>';
}
function pageContact(){
 var K = L.contact;
 return phead("kontakt", K.h1, K.lead, 12)+'<section class="sec flush"><div class="wrap"><div class="cgrid"><div class="rv"><h3>'+K.emb+'</h3><p>'+K.embT+' '+sref(17)+'</p></div><div class="rv"><h3>'+K.off+'</h3><p>'+K.offT+'</p></div><div class="rv"><h3>'+K.hrs+'</h3><p>'+K.hrsT+'</p></div></div><p class="note rv">'+K.note+'</p></div></section>';
}
function pageLegal(which){
 var t = LEGAL[which];
 return phead(which, t.h1, t.lead, 13)+'<section class="sec flush"><div class="wrap legal">'+(lang!=="de"?'<p class="warn">'+LEGALNOTE[lang]+'</p>':'')+t.body+'</div></section>';
}

var PAGES = {home:pageHome, tadschikistan:pageLand, branchen:pageSectors, investieren:pageInvest, export:pageExport, termine:pageEvents, aktuelles:pageNews, service:pageService, dokumente:pageDocs, quellen:pageSources, kontakt:pageContact, impressum:function(){return pageLegal("impressum");}, datenschutz:function(){return pageLegal("datenschutz");}};

/* ------------------------------------------------------------ routing */
var current = null;
function route(){
 var h = (location.hash||"").replace("#","");
 var target = null;
 if(h.indexOf("src-")===0){ go("quellen", h); return; }
 if(ROUTES.indexOf(h)===-1) h = "home";
 show(h);
}
function go(r, anchor){
 if(location.hash !== "#"+r) history.pushState(null, "", "#"+r);
 show(r, anchor);
}
function show(r, anchor){
 current = r;
 var isHome = r==="home";
 $("#hero").hidden = !isHome;
 var host = $("#page");
 host.innerHTML = PAGES[r]();
 wire(host);
 $$("#nav a, #dnav a").forEach(function(a){ a.classList.toggle("on", a.getAttribute("data-go")===r); });
 document.title = (isHome ? L.brand : (L.nav[r]||(LEGAL[r]&&LEGAL[r].h1)||"")+" · "+L.brand);
 closeDrawer();
 if(anchor){ var el = document.getElementById(anchor); if(el){ el.scrollIntoView({block:"center"}); el.style.color="var(--gold)"; return; } }
 window.scrollTo(0, 0);
 onScroll();
}
window.addEventListener("popstate", route);

/* ------------------------------------------------------------ wiring */
var revealer = ("IntersectionObserver" in window) ? new IntersectionObserver(function(es){
 es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); revealer.unobserve(e.target); } });
},{rootMargin:"0px 0px -6% 0px", threshold:0.06}) : null;

function wire(root){
 $$(".rv", root).forEach(function(el, i){
  if(!revealer){ el.classList.add("in"); return; }
  var r = el.getBoundingClientRect();
  if(r.top < window.innerHeight*0.98){ setTimeout(function(){ el.classList.add("in"); }, 60 + (i%6)*70); }
  else revealer.observe(el);
 });
 $$("canvas.contours", root).forEach(function(c){ requestAnimationFrame(function(){ window.drawContours && window.drawContours(c, +c.getAttribute("data-seed")); }); });
 $$(".barrow .bt i", root).forEach(function(b){ setTimeout(function(){ b.style.width = b.getAttribute("data-w")+"%"; }, 300); });
 $$("[data-sector]", root).forEach(function(b){
  b.addEventListener("click", function(){
   var id = b.getAttribute("data-sector");
   if(current==="home"){ go("branchen"); setTimeout(function(){ openSector(id); }, 30); return; }
   openSector(id);
  });
 });
 if($("#fezmap", root)) fezMap();
 $$("#newsTabs button", root).forEach(function(b){
  b.addEventListener("click", function(){
   $$("#newsTabs button").forEach(function(x){ x.classList.toggle("on", x===b); });
   $("#newsFeed").innerHTML = newsRows(b.getAttribute("data-cat")); wire($("#newsFeed"));
  });
 });
 $$("#ftabs button", root).forEach(function(b){ b.addEventListener("click", function(){ selectForm(b.getAttribute("data-f")); }); });
 $$("form.f", root).forEach(function(f){
  f.addEventListener("submit", function(e){ e.preventDefault(); var bad = $$("[required]", f).filter(function(i){ return !i.value.trim(); })[0]; if(bad){ bad.focus(); return; } $(".ok", f).classList.add("on"); f.reset(); });
 });
 $$(".src", root).forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); go("quellen", "src-"+a.getAttribute("data-src")); }); });
}
function selectForm(k){
 $$("#ftabs button").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-f")===k); });
 $$("form.f").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-f")===k); });
}
function openSector(id){
 var s = L.sectors.filter(function(x){ return x.id===id; })[0];
 var old = $("#dossier"); if(old) old.remove();
 var cards = $$("#secGrid .sector"); var idx = 0;
 cards.forEach(function(c,i){ c.style.background=""; if(c.getAttribute("data-sector")===id){ idx=i; c.style.background="var(--surface)"; } });
 var cols = window.innerWidth>980?3:window.innerWidth>620?2:1;
 var after = cards[Math.min(cards.length-1, Math.floor(idx/cols)*cols + cols-1)];
 after.insertAdjacentHTML("afterend", dossier(s));
 wire($("#dossier").parentNode.querySelector("#dossier"));
 $("#dossier").scrollIntoView({behavior:"smooth", block:"nearest"});
}

/* delegated navigation */
document.addEventListener("click", function(e){
 var a = e.target.closest("[data-go]");
 if(a){ e.preventDefault(); var form = a.getAttribute("data-form"); go(a.getAttribute("data-go")); if(form) setTimeout(function(){ selectForm(form); }, 20); return; }
 var lb = e.target.closest("[data-lang]");
 if(lb){ setLang(lb.getAttribute("data-lang")); $("#langs").classList.remove("open"); return; }
 if(e.target.closest("[data-theme-toggle]")){ toggleTheme(); return; }
 if(!e.target.closest("#langs")) $("#langs").classList.remove("open");
});
$("#langBtn").addEventListener("click", function(e){ e.stopPropagation(); $("#langs").classList.toggle("open"); });
$("#burger").addEventListener("click", function(){ $("#drawer").classList.add("open"); document.body.style.overflow="hidden"; });
$("#dclose").addEventListener("click", closeDrawer);
function closeDrawer(){ $("#drawer").classList.remove("open"); document.body.style.overflow=""; }
document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeDrawer(); $("#langs").classList.remove("open"); } });

function setLang(c){
 if(!C[c]) return; lang = c; L = C[c];
 try{ localStorage.setItem(LK, c); }catch(e){}
 renderChrome(); renderHero(); show(current||"home");
}
function theme(){ try{ var t=localStorage.getItem(TK); if(t) return t; }catch(e){} return matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"; }
function toggleTheme(){ var t = document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"; document.documentElement.setAttribute("data-theme", t); try{ localStorage.setItem(TK,t); }catch(e){} $$("canvas.contours").forEach(function(c){ window.drawContours(c, +c.getAttribute("data-seed")); }); }
document.documentElement.setAttribute("data-theme", theme());

/* top bar becomes solid once the hero is behind us, or on inner pages */
function onScroll(){
 var solid = current!=="home" || window.scrollY > ($("#hero").offsetHeight - window.innerHeight - 40);
 $("#topbar").classList.toggle("solid", solid);
}
window.addEventListener("scroll", onScroll, {passive:true});
window.addEventListener("resize", function(){ $$("canvas.contours").forEach(function(c){ window.drawContours(c, +c.getAttribute("data-seed")); }); });

renderChrome(); renderHero(); route();
})();
