/* Local, illustrative motion only. No wallet, payment, analytics, or API calls. */
(() => {
  'use strict';
  const keys = ['network','thread','receipt','demo','signature','play','pause','resume','repeat','done','still','forming','ready','sample','purpose','family','receiptLabel','receiptReady','give','review','chain','receive','disclaimer'];
  const words = {
    en: ['Network of trust','The path of giving','Proof of giving','Concept · Demo','AM Network · Every connection has a purpose.','Play animation','Pause','Continue','Replay','Complete','Static preview','Creating demo receipt','Demo receipt ready','Illustrative amount','Purpose','Family support','Receipt','Demo ready','Give','Review','Blockchain','Receive','Demo · No real transactions'],
    ru: ['Сеть доверия','Путь пожертвования','Подтверждение помощи','Концепция · Демо','AM Network · У каждой связи есть смысл.','Включить анимацию','Пауза','Продолжить','Повторить','Завершено','Без движения','Формирование квитанции','Демо-квитанция готова','Демонстрационная сумма','Назначение','Помощь семье','Квитанция','Демо готово','Пожертвование','Проверка','Блокчейн','Получение','Демо · Без реальных переводов'],
    de: ['Netzwerk des Vertrauens','Der Weg Ihrer Spende','Nachweis der Hilfe','Konzept · Demo','AM Network · Jede Verbindung hat einen Sinn.','Animation starten','Pause','Fortsetzen','Wiederholen','Abgeschlossen','Statische Vorschau','Demobeleg wird erstellt','Demobeleg fertig','Beispielbetrag','Zweck','Familienhilfe','Beleg','Demo fertig','Spende','Prüfung','Blockchain','Empfang','Demo · Keine echten Transfers'],
    ar: ['شبكة الثقة','مسار العطاء','إثبات المساعدة','تصور · عرض تجريبي','AM Network · لكل صلة غاية.','تشغيل الحركة','إيقاف مؤقت','متابعة','إعادة','اكتمل','معاينة ثابتة','إنشاء إيصال تجريبي','الإيصال التجريبي جاهز','مبلغ توضيحي','الغرض','مساعدة أسرة','الإيصال','العرض جاهز','العطاء','التحقق','بلوكشين','الاستلام','عرض تجريبي · لا تحويلات حقيقية'],
    tj: ['Шабакаи эътимод','Роҳи хайр','Тасдиқи кӯмак','Тарҳ · Намоиш','AM Network · Ҳар пайванд маъно дорад.','Оғози аниматсия','Таваққуф','Идома','Такрор','Анҷом ёфт','Намоиши беҳаракат','Сохтани расиди намунавӣ','Расиди намунавӣ омода аст','Маблағи намунавӣ','Ҳадаф','Кӯмак ба оила','Расид','Намуна омода','Эҳсон','Санҷиш','Блокчейн','Гирифтан','Намоиш · Бе интиқоли воқеӣ'],
    tr: ['Güven ağı','Bağışın yolculuğu','Yardımın kanıtı','Konsept · Demo','AM Network · Her bağın bir amacı var.','Animasyonu başlat','Duraklat','Devam et','Tekrarla','Tamamlandı','Sabit önizleme','Demo makbuz oluşturuluyor','Demo makbuz hazır','Örnek tutar','Amaç','Aileye destek','Makbuz','Demo hazır','Bağış','İnceleme','Blokzincir','Teslim','Demo · Gerçek transfer yok'],
    id: ['Jaringan kepercayaan','Perjalanan donasi','Bukti bantuan','Konsep · Demo','AM Network · Setiap hubungan memiliki tujuan.','Putar animasi','Jeda','Lanjutkan','Ulangi','Selesai','Pratinjau statis','Membuat tanda terima demo','Tanda terima demo siap','Jumlah ilustrasi','Tujuan','Bantuan keluarga','Tanda terima','Demo siap','Donasi','Tinjauan','Blockchain','Penerimaan','Demo · Tanpa transfer nyata'],
    ms: ['Rangkaian kepercayaan','Perjalanan sumbangan','Bukti bantuan','Konsep · Demo','AM Network · Setiap hubungan mempunyai tujuan.','Mainkan animasi','Jeda','Teruskan','Ulang','Selesai','Pratonton statik','Membina resit demo','Resit demo sedia','Amaun contoh','Tujuan','Bantuan keluarga','Resit','Demo sedia','Sumbangan','Semakan','Blockchain','Penerimaan','Demo · Tiada pemindahan sebenar'],
    zh: ['信任网络','善款之路','援助凭证','概念 · 演示','AM Network · 每一份连接都有意义。','播放动画','暂停','继续','重播','已完成','静态预览','正在生成演示收据','演示收据已生成','示例金额','用途','家庭援助','收据','演示就绪','捐赠','审核','区块链','接收','演示 · 无真实转账']
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
  const language = () => { const l = document.documentElement.lang; return l === 'tg' ? 'tj' : l; };
  const translations = () => Object.fromEntries(keys.map((k, i) => [k, (words[language()] || words.en)[i]]));
  const cloud = Array.from({length: 92}, (_, i) => {
    const y = 1 - 2 * (i + .5) / 92, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
    return {x: Math.cos(a) * r, y, z: Math.sin(a) * r};
  });
  const edges = [];
  for (let i = 0; i < cloud.length; i++) for (let j = i + 1; j < cloud.length; j++) {
    const a = cloud[i], b = cloud[j];
    if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < .44) edges.push([i, j]);
  }

  class BrandedMotion {
    constructor(root) {
      this.root = root;
      this.kind = root.dataset.amKind;
      this.scene = root.querySelector('.am-motion-scene');
      this.canvas = root.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return; // Static labels and the official logo remain usable.
      this.status = root.querySelector('[data-am-status]');
      this.pause = root.querySelector('[data-am-pause]');
      this.replay = root.querySelector('[data-am-replay]');
      this.receipt = root.querySelector('.am-receipt');
      this.proofStatus = root.querySelector('[data-am-proof-status]');
      this.steps = Array.from(root.querySelectorAll('.am-motion-steps li'));
      this.elapsed = 0;
      this.duration = 12000;
      this.raf = 0;
      this.last = null;
      this.inView = false;
      this.optIn = false;
      this.running = !reduced.matches;
      this.pointer = {x: 0, y: 0};
      this.w = 0;
      this.h = 0;
      this.t = translations();
      this.tick = this.tick.bind(this);
      root.querySelector('.am-motion-controls').hidden = false;
      const bars = root.querySelector('.am-receipt-bars');
      if (bars) for (let i = 0; i < 34; i++) {
        const bar = document.createElement('span');
        bar.style.height = (6 + ((i * 13) % 11)) + 'px';
        bars.appendChild(bar);
      }
      this.pause.addEventListener('click', () => {
        this.running = !this.running;
        this.updateControls();
        this.schedule();
      });
      this.replay.addEventListener('click', () => {
        this.optIn = true; // Explicit play also works with reduced motion enabled.
        this.reset();
      });
      this.scene.addEventListener('pointermove', e => {
        if (this.isReduced() || e.pointerType === 'touch') return;
        const rect = this.scene.getBoundingClientRect();
        this.pointer = {x: clamp((e.clientX - rect.left) / rect.width) * 2 - 1, y: clamp((e.clientY - rect.top) / rect.height) * 2 - 1};
        if (this.receipt) {
          this.receipt.style.setProperty('--am-rx', (-this.pointer.y * 4) + 'deg');
          this.receipt.style.setProperty('--am-ry', (this.pointer.x * 6) + 'deg');
        }
        if (!this.running) this.draw();
      });
      this.scene.addEventListener('pointerleave', () => {
        this.pointer = {x: 0, y: 0};
        if (this.receipt) {
          this.receipt.style.setProperty('--am-rx', '0deg');
          this.receipt.style.setProperty('--am-ry', '0deg');
        }
        if (!this.running) this.draw();
      });
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.scene);
      this.visibilityObserver = new IntersectionObserver(entries => {
        this.inView = entries[0].isIntersecting;
        this.schedule();
      }, {threshold: .15});
      this.visibilityObserver.observe(root);
      document.addEventListener('visibilitychange', () => this.schedule());
      reduced.addEventListener('change', () => { this.optIn = false; this.reset(); });
      this.attributeObserver = new MutationObserver(() => this.refresh());
      this.attributeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['lang','data-theme']});
      this.refresh();
      this.resize();
    }

    isReduced() { return reduced.matches && !this.optIn; }
    refresh() {
      this.t = translations();
      this.root.querySelectorAll('[data-am-copy]').forEach(el => { el.textContent = this.t[el.dataset.amCopy] || ''; });
      const style = getComputedStyle(this.root);
      this.gold = style.getPropertyValue('--gold').trim() || '#C9A84C';
      this.line = style.getPropertyValue('--border').trim() || 'rgba(201,168,76,.15)';
      this.mint = document.documentElement.dataset.theme === 'light' ? '#287653' : '#8ad4b0';
      this.updateControls();
      this.draw();
    }
    updateControls() {
      const complete = this.elapsed >= this.duration;
      this.pause.disabled = this.isReduced() || complete;
      this.pause.textContent = this.isReduced() ? this.t.still : complete ? this.t.done : this.running ? this.t.pause : this.t.resume;
      this.replay.textContent = this.isReduced() ? this.t.play : this.t.repeat;
    }
    reset() {
      this.elapsed = 0;
      this.running = !this.isReduced();
      this.updateControls();
      this.draw();
      this.schedule();
    }
    schedule() {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.last = null;
      if (this.running && this.inView && !document.hidden && !this.isReduced() && this.elapsed < this.duration) this.raf = requestAnimationFrame(this.tick);
    }
    tick(now) {
      this.raf = 0;
      if (!this.root.isConnected) return;
      if (!this.running || !this.inView || document.hidden || this.isReduced()) { this.last = null; return; }
      if (this.last !== null) this.elapsed = Math.min(this.duration, this.elapsed + Math.min(now - this.last, 100));
      this.last = now;
      this.draw();
      if (this.elapsed < this.duration) this.raf = requestAnimationFrame(this.tick);
      else { this.running = false; this.last = null; this.updateControls(); }
    }
    resize() {
      const box = this.scene.getBoundingClientRect();
      this.w = box.width; this.h = box.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.w * scale);
      this.canvas.height = Math.round(this.h * scale);
      this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
      this.draw();
    }
    setStatus(text) { if (this.status.textContent !== text) this.status.textContent = text; }
    path(points, color, alpha = 1, width = 1, close = false) {
      if (!points.length) return;
      const c = this.ctx; c.save(); c.globalAlpha = alpha; c.strokeStyle = color; c.lineWidth = width; c.beginPath();
      points.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
      if (close) c.closePath(); c.stroke(); c.restore();
    }
    dot(x, y, radius, color, alpha = 1) {
      const c = this.ctx; c.save(); c.globalAlpha = alpha; c.fillStyle = color; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill(); c.restore();
    }
    ring(x, y, radius, color, alpha = 1) {
      const c = this.ctx; c.save(); c.globalAlpha = alpha; c.strokeStyle = color; c.lineWidth = 1; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.stroke(); c.restore();
    }
    glow(x, y, radius, color, alpha) {
      const c = this.ctx; c.save(); c.globalAlpha = alpha;
      const g = c.createRadialGradient(x, y, 0, x, y, radius); g.addColorStop(0, color); g.addColorStop(1, 'transparent');
      c.fillStyle = g; c.fillRect(x - radius, y - radius, radius * 2, radius * 2); c.restore();
    }
    draw() {
      if (!this.w || !this.h || !this.gold) return;
      const p = this.isReduced() ? 1 : clamp(this.elapsed / this.duration), t = this.isReduced() ? 8 : this.elapsed / 1000;
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.glow(this.w / 2, this.h * .45, Math.min(this.w * .45, 220), this.gold, .045);
      for (let i = 0; i < 30; i++) this.dot((i * 127.7) % this.w, (i * 61.1) % this.h, .65, this.gold, .08 + (Math.sin(t * .4 + i) + 1) * .04);
      if (this.kind === 'network') this.network(t);
      else if (this.kind === 'thread') this.thread(t, p);
      else this.receiptFrame(t, p);
      this.root.style.setProperty('--am-progress', String(p));
    }
    network(t) {
      const radius = Math.min(this.w * .37, this.h * .41), cx = this.w / 2, cy = this.h * .46;
      const angle = t * .15 + this.pointer.x * .22, tilt = .2 + this.pointer.y * .14, unfold = ease(t / 2.8);
      const projected = cloud.map((v, i) => {
        const x = v.x * Math.cos(angle) + v.z * Math.sin(angle), z = -v.x * Math.sin(angle) + v.z * Math.cos(angle);
        const y = v.y * Math.cos(tilt) - z * Math.sin(tilt), zz = v.y * Math.sin(tilt) + z * Math.cos(tilt), k = 3.6 / (3.6 - zz * .3);
        const a = i * Math.PI * 2 / cloud.length, petal = .76 + .2 * Math.cos(8 * a);
        return {x: cx + ((1 - unfold) * Math.cos(a) * petal + unfold * x * k) * radius, y: cy + ((1 - unfold) * Math.sin(a) * petal + unfold * y * k) * radius, z: zz};
      });
      this.ring(cx, cy, radius * 1.12, this.gold, .1);
      this.ring(cx, cy, radius * 1.2, this.gold, .045);
      edges.forEach(([i, j], index) => {
        const a = projected[i], b = projected[j];
        this.path([a, b], this.gold, .06 + ((a.z + b.z + 2) / 4) * .2, .8);
        if (index % 23 === 0) {
          const f = (t * .33 + index * .17) % 1, x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
          this.dot(x, y, 1.8, this.mint, .85); this.glow(x, y, 10, this.mint, .12);
        }
      });
      projected.forEach((v, i) => {
        const front = (v.z + 1) / 2;
        this.dot(v.x, v.y, 1 + front * 1.6, i % 11 === 0 ? this.mint : this.gold, .2 + front * .7);
        if (i % 17 === 0 && v.z > 0) this.ring(v.x, v.y, 5 + Math.sin(t + i) * 2, this.mint, .23);
      });
      this.setStatus(this.t.disclaimer);
    }
    cube(x, y, s, active, t, i) {
      y += this.isReduced() || i === 2 ? 0 : Math.sin(t * 1.5 + i) * 2.5;
      const a = {x,y:y-s}, b = {x:x+s*.88,y:y-s*.5}, c = {x:x+s*.88,y:y+s*.55}, d = {x,y:y+s}, e = {x:x-s*.88,y:y+s*.55}, f = {x:x-s*.88,y:y-s*.5}, mid = {x,y};
      this.path([a,b,c,d,e,f], this.gold, .2 + active * .65, 1, true);
      this.path([f,mid,b], this.gold, .15 + active * .5); this.path([mid,d], this.gold, .15 + active * .5);
      if (active > .01) { this.glow(x,y,s*2.3,this.gold,active*.12); if (i !== 2) this.dot(x,y,2.5,this.gold,active); }
    }
    thread(t, p) {
      const y = this.h * .44, xs = [.14,.38,.62,.86].map(v => v * this.w), size = Math.min(31,this.w*.065);
      const stage = clamp(p * 4,0,4), index = Math.min(3,Math.floor(stage));
      for (let k = 0; k < 3; k++) {
        const left = xs[k] + size * .95, right = xs[k+1] - size * .95;
        for (let strand = 0; strand < 3; strand++) {
          const vertices = Array.from({length:46},(_,n) => {const f=n/45;return{x:left+(right-left)*f,y:y+Math.sin(f*Math.PI*2+strand*Math.PI*.65)*Math.sin(f*Math.PI)*8};});
          this.path(vertices,this.gold,.13);
          const progress = clamp(stage-k-.1);
          if (progress > 0) {
            const end = Math.floor(progress*45), head = vertices[end]; this.path(vertices.slice(0,end+1),this.gold,.65,1.3);
            if (stage < k+1.1) {this.glow(head.x,head.y,18,this.gold,.2);this.dot(head.x,head.y,2.1,this.gold);}
          }
        }
      }
      xs.forEach((x,i) => {const active=ease((stage-i)*3+.7);this.cube(x,y,size,active,t,i);this.steps[i].classList.toggle('is-lit',active>.5);});
      this.setStatus(this.t.demo+' · '+(p>=1?this.t.done:[this.t.give,this.t.review,this.t.chain,this.t.receive][index]));
    }
    receiptFrame(t,p) {
      const progress=ease(p*1.4),check=ease((p-.62)*4),r=Math.min(this.w*.43,185),c=this.ctx;
      this.root.style.setProperty('--am-sheen',(-110+progress*240)+'%');
      this.root.style.setProperty('--am-bars',String(.12+.88*ease((p-.25)*2)));
      this.root.style.setProperty('--am-check',String(.25+.75*check));
      this.root.style.setProperty('--am-check-scale',String(.85+.15*check));
      c.save();c.strokeStyle=this.gold;c.globalAlpha=.14;c.translate(this.w/2,this.h*.52);c.rotate(-.25);c.beginPath();c.ellipse(0,0,r,r*.62,0,0,Math.PI*2);c.stroke();c.restore();
      for(let i=0;i<5;i++){const a=t*.3+i*Math.PI*.4,x=this.w/2+Math.cos(a)*r,y=this.h*.52+Math.sin(a)*r*.7;this.dot(x,y,2,this.gold,.7);this.glow(x,y,13,this.gold,.12);}
      const text=p>.72?this.t.receiptReady:this.t.forming;
      if(this.proofStatus.textContent!==text)this.proofStatus.textContent=text;
      this.setStatus(p>=1?this.t.ready:this.t.forming);
    }
  }
  document.querySelectorAll('.am-motion[data-am-kind]').forEach(root => new BrandedMotion(root));
})();
