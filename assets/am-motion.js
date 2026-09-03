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
  const identityCopy = {
    en: ['AI-assisted assessment','Human verification','Blockchain transparency','AI assessment','Proof'],
    ru: ['Оценка с помощью ИИ','Проверка человеком','Прозрачность блокчейна','Оценка ИИ','Подтверждение'],
    de: ['KI-gestützte Bewertung','Menschliche Prüfung','Blockchain-Transparenz','KI-Bewertung','Nachweis'],
    ar: ['تقييم بمساعدة الذكاء الاصطناعي','تحقق بشري','شفافية البلوكشين','تقييم ذكي','الإثبات'],
    tj: ['Арзёбӣ бо зеҳни сунъӣ','Санҷиш аз ҷониби инсон','Шаффофияти блокчейн','Арзёбии ЗС','Тасдиқ'],
    tr: ['Yapay zekâ destekli değerlendirme','İnsan doğrulaması','Blokzincir şeffaflığı','YZ değerlendirmesi','Kanıt'],
    id: ['Penilaian berbantuan AI','Verifikasi manusia','Transparansi blockchain','Penilaian AI','Bukti'],
    ms: ['Penilaian berbantu AI','Pengesahan manusia','Ketelusan blockchain','Penilaian AI','Bukti'],
    zh: ['AI 辅助评估','人工核验','区块链透明记录','AI 评估','凭证']
  };

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
          this.receipt.style.setProperty('--am-rx', (-this.pointer.y * 1.2) + 'deg');
          this.receipt.style.setProperty('--am-ry', (this.pointer.x * 1.5) + 'deg');
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
      const identity = identityCopy[language()] || identityCopy.en;
      if (this.receipt) this.receipt.dir = language() === 'ar' ? 'rtl' : 'ltr';
      ['assisted','verified','record','assess','proof'].forEach((key,i) => { this.t[key] = identity[i]; });
      document.querySelectorAll('[data-am-foundation]').forEach(el => { el.textContent = this.t[el.dataset.amFoundation]; });
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
      if (this.kind === 'network') this.network(t);
      else if (this.kind === 'thread') this.thread(t, p);
      else this.receiptFrame(t, p);
      this.root.style.setProperty('--am-progress', String(p));
    }
    network(t) {
      const r = Math.min(this.w * .43, this.h * .42), cx = this.w / 2, cy = this.h * .48;
      const rotation = -.36 + Math.sin(t * .12) * .06 + this.pointer.x * .035;
      // A woven torus leaves clear space for the original AM symbol.
      const point = (u, v) => {
        const radius = r * (.75 + .20 * Math.cos(v));
        const x = radius * Math.cos(u), y = radius * Math.sin(u), z = r * .20 * Math.sin(v);
        const yy = y * .77 + z * .63;
        return {x: cx + x * Math.cos(rotation) - yy * Math.sin(rotation), y: cy + x * Math.sin(rotation) + yy * Math.cos(rotation), z};
      };
      for (let i = 0; i < 32; i++) {
        const u = i * Math.PI * 2 / 32 + t * .025;
        const pts = Array.from({length: 49}, (_, j) => point(u + Math.sin(j / 48 * Math.PI * 2) * .13, j / 48 * Math.PI * 2));
        this.path(pts, this.gold, .16 + .11 * (Math.sin(u) + 1), .65);
      }
      for (let j = 0; j < 12; j++) {
        const v = j * Math.PI * 2 / 12;
        const pts = Array.from({length: 129}, (_, i) => point(i / 128 * Math.PI * 2, v));
        this.path(pts, this.gold, .09 + .16 * (Math.sin(v) + 1) / 2, .7);
      }
      const orbit = Array.from({length: 129}, (_, i) => {
        const a = i / 128 * Math.PI * 2;
        return {x: cx + Math.cos(a) * r * 1.09, y: cy + Math.sin(a) * r * .98};
      });
      this.path(orbit, this.gold, .12, .7);
      for (let i = 0; i < 3; i++) {
        const a = t * .12 + i * Math.PI * 2 / 3;
        const p = point(a, Math.PI * .35);
        this.glow(p.x,p.y,14,this.gold,.12);
        this.dot(p.x,p.y,2.2,this.gold,.95);
        this.ring(p.x,p.y,5.5,this.gold,.2);
      }
      this.setStatus(this.t.disclaimer);
    }
    thread(t, p) {
      const y = this.h * .40, xs = [.1,.3,.5,.7,.9].map(v => v * this.w), size = Math.min(24,this.w*.052);
      const stage = clamp(p * 5,0,5), index = Math.min(4,Math.floor(stage));
      for (let k = 0; k < 4; k++) {
        const left = xs[k] + size + 4, right = xs[k+1] - size - 4;
        const pts = Array.from({length:45},(_,n) => {const f=n/44;return{x:left+(right-left)*f,y:y+Math.sin(f*Math.PI*2)*Math.sin(f*Math.PI)*5};});
        this.path(pts,this.gold,.17,.8);
        const progress = clamp(stage-k-.3);
        if (progress > 0) {
          const end = Math.floor(progress*44), head = pts[end];
          this.path(pts.slice(0,end+1),this.gold,.85,1.2);
          if (progress < 1) {this.glow(head.x,head.y,12,this.gold,.15);this.dot(head.x,head.y,2,this.gold);}
        }
      }
      xs.forEach((x,i) => {
        const active=ease((stage-i)*2+.7);
        this.ring(x,y,size,this.gold,.18+active*.45);
        if(i!==2){this.ring(x,y,size*.47,this.gold,.14+active*.5);this.dot(x,y,2.5,this.gold,.2+active*.8);}
        this.steps[i].classList.toggle('is-lit',active>.5);
      });
      this.setStatus(this.t.demo+' · '+(p>=1?this.t.done:[this.t.give,this.t.assess,this.t.review,this.t.chain,this.t.proof][index]));
    }
    receiptFrame(t,p) {
      const progress=ease(p*1.4),check=ease((p-.62)*4);
      this.root.style.setProperty('--am-sheen',(-110+progress*240)+'%');
      this.root.style.setProperty('--am-bars',String(.12+.88*ease((p-.25)*2)));
      this.root.style.setProperty('--am-check',String(.25+.75*check));
      this.root.style.setProperty('--am-check-scale',String(.85+.15*check));
      const text=p>.72?this.t.receiptReady:this.t.forming;
      if(this.proofStatus.textContent!==text)this.proofStatus.textContent=text;
      this.setStatus(p>=1?this.t.ready:this.t.forming);
    }
  }
  document.querySelectorAll('.am-motion[data-am-kind]').forEach(root => new BrandedMotion(root));
})();
