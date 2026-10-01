/* ===== Adras / abrbandi ornament =====
   Tajik ikat silk (адрас, атлас) is dyed thread by thread before weaving,
   so its lozenges have stepped, slightly bleeding edges. We build the motif
   from horizontal bars with a small alternating offset to imitate that bleed. */
function ikatUnit(W, H, cols){
  var rows = Math.round(H/2), c = W/2, out = [];
  var half = rows/2;
  for(var i=0;i<rows;i++){
    var t = 1 - Math.abs((i+0.5) - half)/half;           /* 0 at tips, 1 at waist */
    var bleed = (i%2 ? 1 : -1) * W*0.012;
    var y = i*2, x;
    var wo = t*W*0.46, wi = Math.max(0, t*W*0.46 - W*0.10), wc = Math.max(0, t*W*0.46 - W*0.22);
    if(wi <= 0){ out.push(rect(c-wo+bleed, y, wo*2, cols[0])); }
    else{
      out.push(rect(c-wo+bleed, y, wo-wi, cols[0]));
      out.push(rect(c+wi+bleed, y, wo-wi, cols[0]));
      if(wc > 0){ out.push(rect(c-wc+bleed*1.6, y, wc*2, cols[1])); }
      var wk = Math.max(0, t*W*0.46 - W*0.33);
      if(wk > 0){ out.push(rect(c-wk-bleed, y, wk*2, cols[2])); }
    }
  }
  /* half-lozenges at the tile edges so tiles interlock */
  for(var j=0;j<rows;j++){
    var tt = Math.abs((j+0.5) - half)/half, ww = tt*W*0.16;
    if(ww>0.5){ out.push(rect(0, j*2, ww, cols[0])); out.push(rect(W-ww, j*2, ww, cols[0])); }
  }
  function rect(x,y,w,f){ return '<rect x="'+x.toFixed(1)+'" y="'+y+'" width="'+Math.max(0,w).toFixed(1)+'" height="2" fill="'+f+'"/>'; }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+out.join("")+'</svg>';
}
function svgURL(s){ return 'url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)+'")'; }
function paintOrnaments(){
  var cs = getComputedStyle(document.documentElement);
  var gold = cs.getPropertyValue("--gold").trim() || "#b8964f";
  var r = document.documentElement.style;
  r.setProperty("--orn-band", svgURL(ikatUnit(28, 14, [gold, "#B8322A", "#1F6B45"])));
  r.setProperty("--orn-band-lg", svgURL(ikatUnit(44, 22, [gold, "#B8322A", "#1F6B45"])));
  r.setProperty("--orn-field", svgURL(ikatUnit(120, 64, [gold, gold, gold])));
}
