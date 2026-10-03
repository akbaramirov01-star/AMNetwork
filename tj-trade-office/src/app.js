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
 var bp = L.brand.split(" · "); $("#brandB").textContent = bp[0]; $("#brandS").textContent = bp[1] || ""; $(".brand").title = L.brand + " — " + L.brandSub;
 $("#fBrandB").textContent = L.brand; $("#fBrandP").textContent = L.foot.tag;
 $("#nav").innerHTML = NAVMAIN.map(function(r){ return '<a href="#'+r+'" data-go="'+r+'">'+L.nav[r]+'</a>'; }).join("");
 $("#dnav").innerHTML = ["home"].concat(NAVMAIN,["service","dokumente"]).map(function(r,i){ return '<a href="#'+r+'" data-go="'+r+'">'+L.nav[r]+'<small>'+("0"+(i)).slice(-2)+'</small></a>'; }).join("");
 $$(".cta-partner").forEach(function(a){ a.innerHTML = L.nav.service + arrow; });
 $("#langBtn").innerHTML = langFlag(lang) + "<span>" + lang.toUpperCase() + "</span>"; $("#langBtn").setAttribute("aria-label", C[lang].name);
 $("#langList").innerHTML = LANGS.map(function(c){ return '<li><button data-lang="'+c+'" class="'+(c===lang?"on":"")+'">'+langFlag(c)+'<span>'+C[c].name+'</span><small>'+c.toUpperCase()+'</small></button></li>'; }).join("");
 $("#dlangs").innerHTML = LANGS.map(function(c){ return '<button class="chip" data-lang="'+c+'">'+langFlag(c)+c.toUpperCase()+'</button>'; }).join("") + '<button class="chip" data-theme-toggle>'+L.ui.theme+'</button>';
 $("#menuLbl").textContent = L.ui.menu; $("#closeLbl").textContent = L.ui.close;
 $$(".theme").forEach(function(b){ b.setAttribute("aria-label", L.ui.theme); });
 $("#fcols").innerHTML =
  '<div class="fbrand"><b>'+L.brand+'</b><p>'+L.foot.tag+'</p></div>'+
  '<div><h4>'+L.foot.c1+'</h4><ul>'+["tadschikistan","branchen","investieren","export"].map(li).join("")+'</ul></div>'+
  '<div><h4>'+L.foot.c2+'</h4><ul>'+["service","termine","aktuelles","dokumente","quellen"].map(li).join("")+'</ul></div>'+
  '<div><h4>'+L.foot.c3+'</h4><ul>'+li("kontakt")+'<li><a href="#impressum" data-go="impressum">'+L.foot.imp+'</a></li><li><a href="#datenschutz" data-go="datenschutz">'+L.foot.dat+'</a></li></ul></div>';
 $("#fbot").innerHTML = '<span>'+L.foot.rights+'</span><span>'+L.foot.demo+(MD.s?' '+L.foot.ai:'')+'</span>';
 if(window.fitBar) setTimeout(window.fitBar, 0);
 function li(r){ return '<li><a href="#'+r+'" data-go="'+r+'">'+L.nav[r]+'</a></li>'; }
}

/* ------------------------------------------------------------ hero */
/* wrap every word of a heading so it can rise out of its own mask; source links stay untouched */
function splitWords(el){
 if(!el || el.classList.contains("split")) return;
 el.classList.add("split");
 var i = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {acceptNode:function(n){
  return n.parentNode.closest(".src") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }}), nodes = [];
 while(walker.nextNode()) nodes.push(walker.currentNode);
 nodes.forEach(function(n){
  var frag = document.createDocumentFragment();
  n.nodeValue.split(/(\s+)/).forEach(function(part){
   if(!part) return;
   if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
   var w = document.createElement("span"); w.className = "w";
   var s = document.createElement("span"); s.style.setProperty("--i", i++); s.textContent = part;
   w.appendChild(s); frag.appendChild(w);
  });
  n.parentNode.replaceChild(frag, n);
 });
}
function repCard(){
 return '<div class="who"><span class="mono" aria-hidden="true">'+REP.ini[lang]+'</span><span><b>'+REP.n[lang]+'</b><small>'+L.brandSub+'</small></span><a href="'+REP.li+'" target="_blank" rel="noopener" aria-label="LinkedIn — '+esc(REP.n[lang])+'">in'+ext+'</a></div>';
}
function renderHero(){
 var H = L.hero;
 $("#c1").innerHTML = '<div class="in"><h1>'+H.t1+'</h1><p class="sub">'+H.s1+'</p><div class="acts"><a class="cta" href="#investieren" data-go="investieren">'+H.b1+arrow+'</a><a class="cta ghost" href="#export" data-go="export">'+H.b2+'</a></div></div>';
 var srcs=[13,2,3,12];
 $("#c2").innerHTML = '<div class="in"><div class="kick">'+H.k2+'</div><h2>'+H.t2+sref(13)+'</h2><div class="figs-strip">'+H.fv.map(function(v,i){ return '<div><b>'+v+'</b><span>'+H.f[i]+' '+sref(srcs[i])+'</span></div>'; }).join("")+'</div></div>';
 $("#c3").innerHTML = '<div class="in"><div class="box"><div class="kick">'+H.k3+'</div><h2>'+H.t3+'</h2><p class="sub">'+H.s3+'</p><div class="acts"><a class="cta" href="#service" data-go="service">'+H.b3+arrow+'</a><a class="cta ghost" href="#kontakt" data-go="kontakt">'+H.b4+'</a></div></div></div>';
 $$(".chapter h1, .chapter h2").forEach(splitWords);
 $("#altLbl").textContent = L.ui.alt;
}

/* ------------------------------------------------------------ pages */
var MD = window.MEDIA || {};
function sectorCards(limit){
 return L.sectors.slice(0,limit||6).map(function(s){
  var ph = MD.s && MD.s[s.id];
  var top = ph ? '<span class="ph"><img src="'+ph+'" alt="" loading="lazy" decoding="async"><span class="ico">'+ICON[s.id]+'</span></span>' : '<span class="ico">'+ICON[s.id]+'</span>';
  return '<button class="sector rv'+(ph?' has-ph':'')+'" data-sector="'+s.id+'">'+top+'<h3>'+s.n+'</h3><p>'+s.s+'</p><span class="tag">'+s.tag+'<i>→</i></span></button>';
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
 var pic = MD.ph && MD.ph[key];
 return '<header class="phead'+(pic?' has-pic':'')+'">'+(pic?'<div class="pic"><img src="'+pic+'" alt="" decoding="async"></div>':'')+'<div class="field"></div><div class="orn"></div><div class="wrap"><div class="crumb"><a href="#home" data-go="home">'+L.nav.home+'</a> / '+(L.nav[key]||h1)+'</div><h1 class="rv">'+h1+'</h1><p class="lead rv">'+lead+'</p></div></header>';
}

function pageHome(){
 var H = L.home;
 var door = function(k, cls, go){ var d=H[k]; return '<a class="door '+cls+' rv" href="#'+go+'" data-go="'+go+'"><span class="lab"><i class="flag">'+(cls==="de"?FLAG_DE:FLAG_TJ)+'</i>'+d.lab+'</span><h3>'+d.t+'</h3><p>'+d.p+'</p><ul>'+d.li.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul><span class="go"><i>'+arrow+'</i>'+d.go+'</span></a>'; };
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
 var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
 var v = MD.band ? '<video class="vid" muted loop playsinline preload="metadata"'+(reduce?'':' autoplay')+' poster="'+MD.band.poster+'" aria-hidden="true">'+(MD.band.webm?'<source src="'+MD.band.webm+'" type="video/webm">':'')+'<source src="'+MD.band.src+'" type="video/mp4"></video>' : '';
 return '<section class="band'+(v?' has-vid':'')+'">'+v+'<div class="field"></div><div class="orn lg"></div><div class="wrap"><h2 class="rv">'+b.t+'</h2><p class="rv">'+b.p+'</p><div class="acts"><a class="cta" href="#service" data-go="service">'+b.b1+arrow+'</a><a class="cta ghost" href="#kontakt" data-go="kontakt">'+b.b2+'</a></div></div></section>';
}

function pageLand(){
 var D = L.land, G = MD.gen || {}, X = D.ex;
 var img = function(src, cls){ return src ? '<figure class="'+cls+'"><img src="'+src+'" alt="" loading="lazy" decoding="async"></figure>' : ''; };
 var prodImg = {alu:G.alu, ore:MD.s&&MD.s.mining, cotton:G.cotton||(MD.s&&MD.s.textile), fruit:G.fruit1||(MD.s&&MD.s.agri)};
 return phead("tadschikistan", D.h1, D.lead, 2)+
 '<section class="sec flush"><div class="wrap split2"><div><div class="kicker">'+D.ek+'</div><h2 class="h2 rv">'+D.et+'</h2><p class="note rv">'+D.kvn+'</p>'+img(G.econ,'sidepic rv')+'</div><table class="kv rv"><tbody>'+
   D.kv.map(function(r){ return '<tr><td>'+r[0]+' '+sref(r[2])+'</td><td>'+r[1]+'</td></tr>'; }).join("")+
 '</tbody></table></div></section>'+
 '<section class="sec tint"><div class="wrap split2"><div><div class="kicker">'+D.tk+'</div><h2 class="h2 rv">'+D.tt+'</h2><p class="lead rv">'+D.tl+' '+sref(4)+'</p><p class="quote rv">'+D.q+'</p></div><div class="rv" style="padding-top:12px"><div class="bars">'+
   '<div class="barrow de"><div class="bl"><span>'+D.bde+'</span><b>'+D.vde+'</b></div><div class="bt"><i data-w="100"></i></div></div>'+
   '<div class="barrow tj"><div class="bl"><span>'+D.btj+'</span><b>'+D.vtj+'</b></div><div class="bt"><i data-w="6"></i></div></div>'+
 '</div><p class="note">'+D.tn+' '+sref(4)+'</p></div></div></section>'+
 /* what Tajikistan sells to the EU, by HS section (DG Trade, 2025) */
 '<section class="sec"><div class="wrap"><div class="head split"><div><div class="kicker">'+X.k+'</div><h2 class="h2 rv">'+X.t+'</h2></div><p class="lead rv">'+X.l+' '+sref(38)+'</p></div>'+
  '<div class="euimp rv">'+EUIMP.rows.map(function(r){ return '<div class="eurow"><div class="eul"><span>'+X.g[r[0]]+'</span><b>'+r[1]+' '+X.u+' <small>'+String(r[2]).replace(".", lang==="en"?".":",")+' %</small></b></div><div class="bt"><i data-w="'+Math.max(r[2],0.6)+'"></i></div></div>'; }).join("")+
  '<p class="note">'+X.de+' '+sref(4)+'</p></div>'+
  '<div class="head" style="margin-top:clamp(48px,6vw,80px)"><div class="kicker">'+X.pk+'</div><h3 class="h3x rv">'+X.pt+'</h3></div>'+
  '<div class="prods">'+X.p.map(function(p){ var im = prodImg[p.k]; return '<article class="prod rv">'+(im ? '<div class="pi"><img src="'+im+'" alt="" loading="lazy" decoding="async"></div>' : '<div class="pi none"></div>')+'<h4>'+p.t+'</h4><p>'+p.s+'</p></article>'; }).join("")+'</div>'+
 '</div></section>'+
 /* legal basis, with the Constitution: the cover title is set in the page language */
 '<section class="sec tint"><div class="wrap"><div class="head"><div class="kicker">'+D.ak+'</div><h2 class="h2 rv">'+D.at+'</h2></div><div class="'+(G.book ? 'lawgrid' : '')+'">'+
  (G.book ? '<figure class="book rv"><img src="'+G.book+'" alt="" loading="lazy" decoding="async"><figcaption class="cover" aria-hidden="true">'+(G.emblem ? '<img class="emb" src="'+G.emblem+'" alt="">' : '')+'<span class="t">'+D.con.t+'</span><span class="s">'+D.con.s+'</span></figcaption></figure>' : '')+
  '<div class="tl">'+D.treaties.map(function(t){ return '<div class="t rv"><div class="dt">'+t.d+'</div><div><h3>'+t.t+' '+sref(t.s)+'</h3><p>'+t.p+'</p></div></div>'; }).join("")+'</div>'+
 '</div></div></section>'+
 /* GSP: how the preference works, in three steps, with the figures from Art. 7 */
 '<section class="sec"><div class="wrap"><div class="split2"><div><div class="kicker">'+D.gk+'</div><h2 class="h2 rv">'+D.gt+'</h2></div><div><p class="lead rv" style="margin-top:0">'+D.gp+' '+refs(D.gs)+'</p></div></div>'+
  '<ol class="gspsteps">'+D.gsp.steps.map(function(s,i){ return '<li class="rv"><span class="n">'+(i+1)+'</span><h4>'+s.t+'</h4><p>'+s.p+'</p>'+(i===0 ? '<a class="more" href="'+TJTRADE.base+TJTRADE.rex+'?l='+tjLang()+'" target="_blank" rel="noopener">'+L.exp.fx.tjr.rex+' '+ext+'</a> '+sref(40) : '')+'</li>'; }).join("")+'</ol>'+
  '<div class="gspfacts rv">'+D.gsp.f.map(function(f){ return '<div><b>'+f.v+'</b><span>'+f.l+'</span></div>'; }).join("")+'</div>'+
  '<p class="note rv">'+D.gsp.fl+' '+sref(39)+'</p>'+
  '<p class="rv" style="margin-top:22px"><a class="cta" href="#export" data-go="export" data-anchor="a2m">'+D.gsp.go+arrow+'</a></p>'+
 '</div></section>'+
 band();
}

function pageSectors(){
 return phead("branchen", L.sx.h1, L.sx.lead, 3)+
 '<section class="sec flush"><div class="wrap"><div class="sectors" id="secGrid">'+sectorCards()+'</div></div></section>'+band();
}
function dossier(s){
 var ph = MD.s && MD.s[s.id];
 return '<div class="dossier on" id="dossier"><div><p class="big">'+s.big+' '+(s.bs?sref(s.bs):"")+'</p>'+(ph?'<div class="shot"><img src="'+ph+'" alt="" decoding="async"></div>':'')+'</div><div style="display:grid;gap:26px"><div><h4>'+L.sx.need+'</h4><ul>'+s.need.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div><div><h4>'+L.sx.de+'</h4><ul>'+s.de.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div></div></div>';
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
 var M = TJMAP, W = M.w, H = M.h;
 function X(lon){ return M.pad + (lon-M.minLon)*M.c*M.k; }
 function Y(lat){ return M.pad + (M.maxLat-lat)*M.k; }
 var names; try{ names = new Intl.DisplayNames([{tj:"tg",de:"de",ru:"ru",en:"en"}[lang],"en"], {type:"region"}); }catch(e){}
 var cn = function(c){ try{ return names ? names.of(c) : c; }catch(e){ return c; } };
 var g = '<defs><clipPath id="mclip"><rect x="0" y="0" width="'+W+'" height="'+H+'"/></clipPath>'+
  '<pattern id="mhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-opacity=".07" stroke-width="2"/></pattern></defs>';
 g += '<g clip-path="url(#mclip)"><path d="'+M.nb+'" fill="url(#mhatch)" stroke="currentColor" stroke-opacity=".25" stroke-width=".8" stroke-linejoin="round"/>'+
  '<path class="tj" d="'+M.tj+'" stroke-linejoin="round"/></g>';
 [["UZ",67.35,39.2],["KG",72.6,40.55],["AF",70.6,36.62],["CN",75.25,38.2]].forEach(function(n){
  g += '<text class="nb" x="'+X(n[1])+'" y="'+Y(n[2])+'" text-anchor="middle">'+cn(n[0]).toUpperCase()+'</text>'; });
 var CN = {Dushanbe:{de:"Duschanbe",en:"Dushanbe",ru:"Душанбе",tj:"Душанбе"}};
 CITIES.forEach(function(c){ if(!CN[c.n]) return; g += '<g class="city"><rect x="'+(X(c.lon)-4)+'" y="'+(Y(c.lat)-4)+'" width="8" height="8"/><text x="'+(X(c.lon)-10)+'" y="'+(Y(c.lat)+4)+'" text-anchor="end">'+CN[c.n][lang]+'</text></g>'; });
 ZONES.forEach(function(z){
  var nm = L.invest.zones[z.id].n.replace(/^(FWZ|СЭЗ|FEZ|МОИ)\s*/,"");
  g += '<g class="pin" data-zone="'+z.id+'" tabindex="0" role="button" aria-label="'+esc(L.invest.zones[z.id].n)+'"><circle class="halo" cx="'+X(z.lon)+'" cy="'+Y(z.lat)+'" r="14"><animate attributeName="r" values="7;18;7" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="3.2s" repeatCount="indefinite"/></circle><circle class="core" cx="'+X(z.lon)+'" cy="'+Y(z.lat)+'" r="6"/><text x="'+(X(z.lon)+12)+'" y="'+(Y(z.lat)+4)+'">'+nm+'</text></g>';
 });
 host.innerHTML = '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" style="color:var(--ink)" role="img" aria-label="'+esc(L.invest.zcap)+'">'+g+'</svg><div class="cap">'+L.invest.zcap+'</div>';
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
 a2mFinder(E)+
 fruitGallery()+
 exportersSection(E)+
 '<section class="sec tint"><div class="wrap"><div class="head"><div class="kicker">'+E.mk+'</div><h2 class="h2 rv">'+E.mt+'</h2></div><div class="evts">'+eventRows()+'</div></div></section>'+
 band();
}

/* Access2Markets lookup in our own design: the official result opens on the EU portal */
function a2mLang(){ return lang==="de" ? "de" : "en"; }
function a2mFinder(E){
 var F = E.fx, names;
 try{ names = new Intl.DisplayNames([{tj:"tg",de:"de",ru:"ru",en:"en"}[lang],"en"], {type:"region"}); }catch(e){ names = null; }
 var cname = function(c){ try{ return names ? names.of(c) : c; }catch(e){ return c; } };
 var eu = A2M.eu.slice(1).sort(function(a,b){ return cname(a).localeCompare(cname(b)); });
 return '<section class="sec"><div class="wrap split2"><div><div class="kicker">'+E.ak+'</div><h2 class="h2 rv">'+E.at+'</h2><p class="lead rv">'+E.ap+' '+sref(15)+'</p></div>'+
  '<form class="finder rv" id="a2m" novalidate>'+
   '<label><span>'+F.p+'</span><select name="hs">'+A2M.hs.map(function(h){ return '<option value="'+h+'">'+E.hs[h]+' · '+h.slice(0,4)+' '+h.slice(4)+'</option>'; }).join("")+'<option value="*">'+F.other+'</option></select></label>'+
   '<label class="own" hidden><span>'+F.code+'</span><input name="q" autocomplete="off" inputmode="text" maxlength="60"></label>'+
   '<label><span>'+F.d+'</span><select name="to"><option value="DE">'+cname("DE")+'</option>'+eu.map(function(c){ return '<option value="'+c+'">'+cname(c)+'</option>'; }).join("")+'</select></label>'+
   '<div class="route" aria-live="polite">'+langFlag("tj")+'<b>'+cname("TJ")+'</b><span aria-hidden="true">→</span><b class="dest">'+cname("DE")+'</b></div>'+
   '<ol class="legs"><li><span class="k">1 · '+F.tjr.s1+'</span><a class="tjproc" target="_blank" rel="noopener"></a></li>'+
   '<li><span class="k">2 · '+F.tjr.s2+'</span><div class="facts"><button class="cta" type="submit">'+E.ab+' '+ext+'</button></div></li></ol>'+
   '<p class="note">'+F.note+'</p>'+
  '</form></div></section>';
}
function tjLang(){ return (lang==="ru"||lang==="tj") ? "ru" : "en"; }
function tjProc(form){
 var F = L.exp.fx, a = $(".tjproc", form), id = TJTRADE.proc[form.hs.value];
 a.href = TJTRADE.base + (id ? "procedure/"+id : TJTRADE.all) + "?l=" + tjLang();
 a.innerHTML = (id ? TJTRADE.name[id][tjLang()] : F.tjr.all) + ' <small>'+F.tjr.portal+'</small> ' + ext;
}
function a2mGo(form){
 var hs = form.hs.value, to = form.to.value, url;
 if(hs === "*"){
  var q = (form.q.value||"").trim();
  if(!q){ form.q.focus(); return; }
  var digits = q.replace(/[\s.]/g,"");
  url = /^\d{4,10}$/.test(digits)
   ? A2M.base+a2mLang()+"/results?product="+digits+"&origin=TJ&destination="+to
   : A2M.base+a2mLang()+"/search?product="+encodeURIComponent(q)+"&origin=TJ&destination="+to;
 } else url = A2M.base+a2mLang()+"/results?product="+hs+"&origin=TJ&destination="+to;
 window.open(url, "_blank", "noopener");
}

/* photographs of Tajik dried fruit (generated, labelled as such in the footer) */
function fruitGallery(){
 var G = MD.gen || {}, ims = [G.fruit1, G.fruit2, G.fruit3, G.fruit4].filter(Boolean);
 if(!ims.length) return '';
 return '<section class="fruits" aria-hidden="true"><div class="frow">'+ims.map(function(src,i){ return '<figure class="rv'+(i===0?' wide':'')+'"><img src="'+src+'" alt="" loading="lazy" decoding="async"></figure>'; }).join("")+'</div></section>';
}

/* dried-fruit exporters from Sughd, with the source for every claim */
function exportersSection(E){
 var O = E.co;
 var card = function(x){
  var meta = O.city[x.city] + (x.y ? ' · '+O.since+' '+x.y : '');
  var badges = (x.cert ? '<span class="badge gold">'+x.cert+' · '+x.cy+'</span>' : '') + (x.fair ? '<span class="badge">'+O.fair+'</span>' : '');
  var rows = '<div class="kv2"><span>'+O.pr+'</span><b>'+x.pr.map(function(p){ return O.prn[p]; }).join(", ")+'</b></div>'+
   (x.mk ? '<div class="kv2"><span>'+O.mk+'</span><b>'+x.mk.map(function(m){ return O.mkn[m]; }).join(", ")+'</b></div>' : '')+
   (x.cap ? '<div class="kv2"><span>'+O.cap+'</span><b>'+x.cap.replace(">","> ").replace("≤","≤ ")+' '+O.t_y+'</b></div>' : '')+
   (x.std ? '<div class="kv2"><span>'+O.lab.std+'</span><b>'+x.std+' <small>('+O.lab.own+')</small></b></div>' : '')+
   (x.staff ? '<div class="kv2"><span>'+O.lab.staff+'</span><b>'+x.staff+'</b></div>' : '');
  var contact = x.web ? '<div class="excontact"><a href="'+x.web+'" target="_blank" rel="noopener">'+x.web.replace(/^https?:\/\//,"")+' '+ext+'</a>'+
   (x.mail ? '<a href="mailto:'+x.mail+'">'+x.mail+'</a>' : '')+(x.tel ? '<a href="tel:'+x.tel.replace(/\s/g,"")+'">'+x.tel+'</a>' : '')+'</div>' : '';
  return '<article class="exco rv'+(x.feat ? ' feat' : '')+'"><div class="badges">'+badges+'</div><h3>'+x.n+(x.f ? ' <small>'+x.f+'</small>' : '')+'</h3>'+(x.alias ? '<p class="alias">'+x.alias+'</p>' : '')+'<p class="meta">'+meta+'</p>'+(x.feat ? '<div class="excols"><div>'+rows+'</div>'+contact+'</div>' : rows+contact)+'<div class="srcs">'+refs(x.src)+'</div></article>';
 };
 return '<section class="sec tint"><div class="wrap"><div class="head split"><div><div class="kicker">'+O.k+'</div><h2 class="h2 rv">'+O.t+'</h2></div><p class="lead rv">'+O.l+'</p></div>'+
  '<div class="excos">'+EXPORTERS.map(card).join("")+'</div>'+
  '<div class="exfoot rv"><p class="note">'+O.note+'</p><p style="display:flex;gap:12px;flex-wrap:wrap"><a class="cta" href="#service" data-go="service" data-form="partner">'+O.b1+arrow+'</a><a class="cta ghost" href="#service" data-go="service" data-form="exporter">'+O.b2+'</a></p></div>'+
 '</div></section>';
}

function pageEvents(){
 var V = L.events;
 return phead("termine", V.h1, V.lead, 6)+'<section class="sec flush"><div class="wrap"><div class="evts">'+eventRows()+'</div><p class="note rv" style="margin-top:28px">'+V.note+'</p></div></section>'+band();
}
function pageNews(){
 var N = L.news;
 return phead("aktuelles", N.h1, N.lead, 8)+'<section class="sec flush"><div class="wrap"><div class="tabs" id="newsTabs">'+
  ["all","eu","econ"].map(function(k,i){ return '<button data-cat="'+k+'" class="'+(i===0?"on":"")+'">'+N.tabs[k]+'</button>'; }).join("")+
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
  SRC.map(function(s,i){ return s?'<li id="src-'+i+'"><b>['+i+']</b><a href="'+s.u+'" target="_blank" rel="noopener">'+s.t+'</a></li>':""; }).join("")+'</ol>'+(MD.s?'<p class="ainote" style="margin-top:40px;max-width:70ch">'+L.foot.ai+'</p>':'')+'</div></section>';
}
function pageContact(){
 var K = L.contact;
 return phead("kontakt", K.h1, K.lead, 12)+'<section class="sec flush"><div class="wrap"><div class="cgrid"><div class="rv"><h3>'+K.emb+'</h3><p>'+K.embT+'</p></div><div class="rv"><h3>'+K.off+'</h3><p>'+K.offT+'</p></div><div class="rv"><h3>'+K.hrs+'</h3><p>'+K.hrsT+'</p></div></div><p class="note rv">'+K.note+'</p></div></section>';
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
 $$(".band video[autoplay]", root).forEach(function(v){ v.muted = true; var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); });
 $$(".phead h1, .h2.rv, .band h2", root).forEach(splitWords);
 $$(".rv", root).forEach(function(el, i){
  if(!revealer){ el.classList.add("in"); return; }
  var r = el.getBoundingClientRect();
  if(r.top < window.innerHeight*0.98){ setTimeout(function(){ el.classList.add("in"); }, 60 + (i%6)*70); }
  else revealer.observe(el);
 });
 $$(".barrow .bt i, .eurow .bt i", root).forEach(function(b){ setTimeout(function(){ b.style.width = b.getAttribute("data-w")+"%"; }, 300); });
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
 $$("#a2m", root).forEach(function(f){
  var own = $(".own", f);
  f.hs.addEventListener("change", function(){ own.hidden = f.hs.value !== "*"; if(!own.hidden) f.q.focus(); tjProc(f); });
  tjProc(f);
  f.to.addEventListener("change", function(){ $(".route .dest", f).textContent = f.to.selectedOptions[0].text; });
  f.addEventListener("submit", function(e){ e.preventDefault(); a2mGo(f); });
 });
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
 if(a){ e.preventDefault(); var form = a.getAttribute("data-form"); go(a.getAttribute("data-go"), a.getAttribute("data-anchor") || undefined); if(form) setTimeout(function(){ selectForm(form); }, 20); return; }
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
function toggleTheme(){ var t = document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"; document.documentElement.setAttribute("data-theme", t); try{ localStorage.setItem(TK,t); }catch(e){} paintOrnaments(); }
document.documentElement.setAttribute("data-theme", theme());

/* top bar becomes solid once the hero is behind us, or on inner pages */
function onScroll(){
 var solid = current!=="home" || window.scrollY > ($("#hero").offsetHeight - window.innerHeight - 40);
 $("#topbar").classList.toggle("solid", solid);
}
window.addEventListener("scroll", onScroll, {passive:true});
window.fitBar = fitBar;
function fitBar(){
 var tb = $("#topbar"), bar = $(".bar");
 tb.classList.remove("compact");
 if(bar.scrollWidth > bar.clientWidth + 1) tb.classList.add("compact");
}
window.addEventListener("resize", fitBar);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitBar);

$$(".flag-tj").forEach(function(f){ f.innerHTML = FLAG_TJ; });
paintOrnaments(); renderChrome(); renderHero(); route();
})();
