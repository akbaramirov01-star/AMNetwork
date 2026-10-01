/* ===== Pamir flight: procedural terrain, scroll-driven =====
   Ridged simplex noise on the GPU, a valley carved along the flight path,
   snow by altitude and slope, gold contour lines, golden-hour light. */
(function(){
  "use strict";
  var canvas = document.getElementById("terrain");
  if(!canvas || !window.THREE){ document.documentElement.classList.add("no-gl"); return; }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = Math.min(window.innerWidth, window.innerHeight) < 700;

  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:!small, alpha:true, powerPreference:"high-performance"});
  }catch(e){ document.documentElement.classList.add("no-gl"); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, small ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.5, 900);

  var SEG = small ? 170 : 320;
  var geo = new THREE.PlaneGeometry(520, 620, SEG, SEG);
  geo.rotateX(-Math.PI/2);

  var noise = [
    "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}",
    "vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}",
    "vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}",
    "float snoise(vec2 v){",
    " const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);",
    " vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);",
    " vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);",
    " vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);",
    " vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));",
    " vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;",
    " vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;",
    " m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);",
    " vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;",
    " return 130.0*dot(m,g);}",
    "float ridged(vec2 p){",
    " float s=0.0,a=0.55,f=1.0,w=1.0;",
    " for(int i=0;i<6;i++){ float n=1.0-abs(snoise(p*f)); n=n*n; s+=n*a*w; w=clamp(n*1.6,0.0,1.0); f*=2.03; a*=0.5; }",
    " return s;}",
    "float terrainH(vec2 xz, float travel){",
    " vec2 q=vec2(xz.x, xz.y-travel)*0.0046;",
    " float h=ridged(q)*112.0 + snoise(q*0.35)*30.0;",
    " float valley=smoothstep(22.0,120.0,abs(xz.x + sin((xz.y-travel)*0.006)*38.0));",
    " h*=mix(0.07,1.0,valley);",
    " return h-26.0;}"
  ].join("\n");

  var uniforms = {
    uTravel:{value:0}, uSun:{value:new THREE.Vector3(-0.55,0.32,-0.77).normalize()},
    uSunCol:{value:new THREE.Color(0xffc98a)}, uFog:{value:new THREE.Color(0x8d7d6a)},
    uSky:{value:new THREE.Color(0x24344c)}, uCam:{value:new THREE.Vector3()},
    uContour:{value:1.0}, uTime:{value:0}
  };

  var mat = new THREE.ShaderMaterial({
    uniforms:uniforms,
    extensions:{derivatives:true},
    vertexShader: noise + [
      "uniform float uTravel; varying vec3 vW; varying float vH;",
      "void main(){ vec3 p=position; float h=terrainH(p.xz,uTravel); p.y=h; vH=h;",
      " vec4 w=modelMatrix*vec4(p,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }"
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 uSun,uSunCol,uFog,uSky,uCam; uniform float uContour,uTime;",
      "varying vec3 vW; varying float vH;",
      "void main(){",
      " vec3 n=normalize(cross(dFdx(vW),dFdy(vW)));",
      " if(n.y<0.0) n=-n;",
      " float slope=1.0-n.y;",
      " vec3 rockLo=vec3(0.16,0.15,0.17), rockHi=vec3(0.36,0.31,0.29), snow=vec3(0.96,0.95,0.93);",
      " float t=clamp((vH+26.0)/150.0,0.0,1.0);",
      " vec3 col=mix(rockLo,rockHi,t);",
      " float snowLine=0.36 + 0.07*sin(vW.x*0.05+vW.z*0.03);",
      " float sn=smoothstep(snowLine,snowLine+0.14,t)*smoothstep(0.92,0.42,slope);",
      " col=mix(col,snow,sn);",
      " float dif=max(dot(n,uSun),0.0);",
      " float amb=0.46+0.34*n.y;",
      " vec3 lit=col*(uSky*1.15*amb + uSunCol*dif*1.45);",
      " float rim=pow(1.0-max(dot(n,normalize(uCam-vW)),0.0),3.0);",
      " lit+=uSunCol*rim*0.08;",
      " float cl=abs(fract(vH/11.0)-0.5)/fwidth(vH/11.0);",
      " float line=1.0-min(cl,1.0);",
      " lit=mix(lit, vec3(0.89,0.76,0.52), line*0.22*uContour*(1.0-sn*0.6));",
      " float d=length(vW-uCam);",
      " float fog=1.0-exp(-pow(d*0.0042,1.6));",
      " float hf=smoothstep(-30.0,60.0,vW.y);",
      " vec3 fogCol=mix(uFog, uSky, hf*0.35);",
      " lit=mix(lit,fogCol,clamp(fog,0.0,1.0));",
      " gl_FragColor=vec4(lit,1.0);",
      "}"
    ].join("\n")
  });

  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -180;
  scene.add(mesh);

  function resize(){
    var w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.fov = w < h ? 68 : 55;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  var hero = document.querySelector(".hero");
  var chapters = [].slice.call(document.querySelectorAll(".chapter"));
  var meter = document.querySelector(".hero-meter .track i");
  var coord = document.querySelector(".hero-coord .alt");
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("pointermove", function(e){
    tmx = (e.clientX/window.innerWidth - 0.5); tmy = (e.clientY/window.innerHeight - 0.5);
  }, {passive:true});

  function progress(){
    if(!hero) return 0;
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

  var dawn = {sun:new THREE.Color(0xffdcb0), fog:new THREE.Color(0x8f9bb0), sky:new THREE.Color(0x52668a)};
  var gold = {sun:new THREE.Color(0xffc47c), fog:new THREE.Color(0xb39272), sky:new THREE.Color(0x5a6688)};
  var dusk = {sun:new THREE.Color(0xff9f62), fog:new THREE.Color(0x8a6468), sky:new THREE.Color(0x3a3f62)};

  var travel = 0, smoothP = 0, last = performance.now(), visible = true;
  var io = new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, {threshold:0});
  io.observe(hero);

  function frame(now){
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now-last)/1000); last = now;
    var p = progress();
    smoothP += (p - smoothP) * (1 - Math.exp(-dt*7));
    if(Math.abs(p-smoothP) < 0.0005) smoothP = p;

    var c = [
      p < 0.22 ? 1 : Math.max(0, 1-(p-0.22)/0.08),
      band(p, 0.30, 0.38, 0.56, 0.64),
      p < 0.70 ? 0 : Math.min(1, (p-0.70)/0.08)
    ];
    for(var i=0;i<chapters.length;i++){
      chapters[i].style.opacity = c[i];
      chapters[i].style.transform = "translateY(" + ((1-c[i])*14).toFixed(1) + "px)";
      chapters[i].style.pointerEvents = c[i] > 0.6 ? "auto" : "none";
    }
    if(meter) meter.style.width = (p*100).toFixed(1) + "%";

    if(!visible) return;
    if(!reduce) travel += dt * 9;
    var tr = travel + smoothP * 520;
    uniforms.uTravel.value = tr;
    uniforms.uTime.value = now/1000;

    var A, B, k;
    if(smoothP < 0.5){ A = dawn; B = gold; k = smoothP/0.5; } else { A = gold; B = dusk; k = (smoothP-0.5)/0.5; }
    uniforms.uSunCol.value.copy(A.sun).lerp(B.sun, k);
    uniforms.uFog.value.copy(A.fog).lerp(B.fog, k);
    uniforms.uSky.value.copy(A.sky).lerp(B.sky, k);
    var sunY = 0.18 + 0.22*Math.sin(Math.PI*Math.min(1,smoothP*1.1));
    uniforms.uSun.value.set(-0.55, sunY, -0.8).normalize();

    mx += (tmx-mx)*0.04; my += (tmy-my)*0.04;
    var camY = 112 - smoothP*34 + Math.sin(now/3200)*1.5;
    camera.position.set(mx*14 + Math.sin(now/5200)*4, camY - my*6, 70);
    camera.lookAt(mx*30, 40 - smoothP*18, -190);
    uniforms.uCam.value.copy(camera.position);
    if(coord) coord.textContent = Math.round(3100 + camY*42) + " m";

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
