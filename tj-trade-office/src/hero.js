/* ===== Hero: one scroll controller for the chapters and the picture =====
   With filmed frames (MEDIA.hero) the flight over the Pamirs is scrubbed by
   scroll on a 2D canvas, cross-fading between neighbouring frames so the
   motion stays fluid. Without them, the WebGL terrain (terrain.js) takes over. */
(function(){
  "use strict";
  /* film grain: one small random tile, animated in CSS over the footage */
  try{
    var g = document.createElement("canvas"); g.width = g.height = 160;
    var gx = g.getContext("2d"), d = gx.createImageData(160,160);
    for(var k=0;k<d.data.length;k+=4){ var v = Math.random()*255|0; d.data[k]=d.data[k+1]=d.data[k+2]=v; d.data[k+3]=255; }
    gx.putImageData(d,0,0);
    document.documentElement.style.setProperty("--noise", "url(" + g.toDataURL("image/png") + ")");
  }catch(e){}
  var hero = document.querySelector(".hero");
  if(!hero) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var chapters = [].slice.call(document.querySelectorAll(".chapter"));
  var meter = document.querySelector(".hero-meter .track i");
  var M = (window.MEDIA || {}).hero;

  function progress(){
    var r = hero.getBoundingClientRect();
    var span = hero.offsetHeight - window.innerHeight;
    return Math.max(0, Math.min(1, -r.top / span));
  }
  function band(p, a, b, c, d){
    if(p <= a || p >= d) return 0;
    if(p < b) return (p-a)/(b-a);
    if(p <= c) return 1;
    return 1 - (p-c)/(d-c);
  }

  /* ---------- filmed frames ---------- */
  var film = null;
  if(M && M.n){
    document.documentElement.classList.add("has-film");
    var canvas = document.getElementById("film");
    var ctx = canvas.getContext("2d", {alpha:false});
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    /* portrait screens get the native-resolution vertical crops, everything else the full 1920 frames */
    var set = (window.innerHeight > window.innerWidth * 1.1) && M.sm ? M.sm : M.lg;
    var N = M.n, imgs = new Array(N), ok = new Array(N);
    var pad = function(i){ return ("00"+i).slice(-3); };
    var load = function(i){
      if(imgs[i]) return;
      var im = new Image(); im.decoding = "async";
      im.onload = function(){ ok[i] = true; if(i === 0) dirty = true; };
      im.src = set + pad(i) + M.ext; imgs[i] = im;
    };
    /* first frame, then a coarse pass so early scrubbing already moves, then the rest */
    load(0);
    var order = [];
    [16, 8, 4, 2, 1].forEach(function(step){ for(var i=0;i<N;i+=step) if(order.indexOf(i)<0) order.push(i); });
    var q = 0;
    (function pump(){ for(var k=0;k<6 && q<order.length;k++) load(order[q++]); if(q<order.length) setTimeout(pump, 60); })();

    var W = 0, H = 0, dpr = 1, dirty = true;
    var resize = function(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      dirty = true;
    };
    window.addEventListener("resize", resize); resize();

    var nearest = function(i){ /* closest frame that has arrived */
      for(var d=0; d<N; d++){ if(ok[i-d]) return i-d; if(ok[i+d]) return i+d; }
      return -1;
    };
    var draw = function(im, alpha, scale){
      var iw = im.naturalWidth, ih = im.naturalHeight;
      var s = Math.max(canvas.width/iw, canvas.height/ih) * scale;
      var dw = iw*s, dh = ih*s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, (canvas.width-dw)/2, (canvas.height-dh)*0.42, dw, dh);
    };
    var lastKey = "";
    film = function(p){
      var f = p*(N-1), i0 = Math.floor(f), t = f - i0;
      var a = nearest(i0), b = ok[i0+1] ? i0+1 : -1;
      if(a < 0) return;
      var scale = 1; /* no extra zoom: every upscale costs sharpness */
      var key = a+"|"+b+"|"+t.toFixed(3)+"|"+canvas.width+"|"+scale.toFixed(4);
      if(key === lastKey && !dirty) return;
      lastKey = key; dirty = false;
      draw(imgs[a], 1, scale);
      if(b > 0 && a === i0 && t > 0.01) draw(imgs[b], t, scale);
      ctx.globalAlpha = 1;
    };
  }

  var smoothP = 0, last = performance.now(), visible = true;
  new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, {threshold:0}).observe(hero);

  function frame(now){
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now-last)/1000); last = now;
    var p = progress();
    smoothP += (p - smoothP) * (reduce ? 1 : (1 - Math.exp(-dt*6)));
    if(Math.abs(p-smoothP) < 0.0004) smoothP = p;

    var c = [
      p < 0.22 ? 1 : Math.max(0, 1-(p-0.22)/0.08),
      band(p, 0.30, 0.38, 0.56, 0.64),
      p < 0.70 ? 0 : Math.min(1, (p-0.70)/0.08)
    ];
    for(var i=0;i<chapters.length;i++){
      chapters[i].style.opacity = c[i];
      chapters[i].style.transform = "translateY(" + ((1-c[i])*14).toFixed(1) + "px)";
      chapters[i].style.pointerEvents = c[i] > 0.6 ? "auto" : "none";
      chapters[i].classList.toggle("on", c[i] > 0.35);
    }
    if(meter) meter.style.width = (p*100).toFixed(1) + "%";
    if(!visible) return;
    if(film) film(smoothP);
    else if(window.HERO_SCENE) window.HERO_SCENE(smoothP, now, dt);
  }
  requestAnimationFrame(frame);
})();
