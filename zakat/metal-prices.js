/* Public spot quotes only; no calculator answers leave the device. */
const AMMetalPrices = (() => {
  const GRAMS_PER_TROY_OUNCE = 31.1034768;
  const MAX_AGE_MS = 96 * 60 * 60 * 1000; // includes normal market weekends
  const copy = {
    en: ['Loading quote…', 'Gold API · USD/g · Updated: ', 'Manual price · Not verified against the market.', 'Quote unavailable. Enter a current price manually.', 'Quote is over 96 hours old. Enter a current price manually.', 'Enter a valid positive price for both metals.', 'Reference spot prices; market quotes may pause over weekends.'],
    ru: ['Загружаем котировку…', 'Gold API · USD/г · Обновлено: ', 'Цена введена вручную · Рыночный источник не проверен.', 'Котировка недоступна. Введите актуальную цену вручную.', 'Котировка старше 96 часов. Введите актуальную цену вручную.', 'Введите положительную цену для обоих металлов.', 'Справочные биржевые цены; в выходные котировки могут не обновляться.'],
    ar: ['جارٍ تحميل السعر…', 'Gold API · USD/غ · آخر تحديث: ', 'سعر يدوي · لم يُتحقق منه مقابل السوق.', 'السعر غير متاح. أدخل سعراً حديثاً يدوياً.', 'السعر أقدم من 96 ساعة. أدخل سعراً حديثاً يدوياً.', 'أدخل سعراً موجباً صالحاً لكلا المعدنين.', 'أسعار فورية استرشادية؛ قد تتوقف التحديثات في عطلة نهاية الأسبوع.'],
    tj: ['Нарх бор шуда истодааст…', 'Gold API · USD/г · Навсозӣ: ', 'Нархи дастӣ · Бо бозор санҷида нашудааст.', 'Нарх дастрас нест. Нархи ҷориро дастӣ ворид кунед.', 'Нарх аз 96 соат кӯҳнатар аст. Нархи ҷориро дастӣ ворид кунед.', 'Барои ҳар ду металл нархи мусбат ворид кунед.', 'Нархҳои бозорӣ барои маълумот; рӯзҳои истироҳат навсозӣ метавонад қатъ шавад.'],
    id: ['Memuat harga…', 'Gold API · USD/g · Diperbarui: ', 'Harga manual · Belum diverifikasi terhadap pasar.', 'Harga tidak tersedia. Masukkan harga terkini secara manual.', 'Harga lebih dari 96 jam. Masukkan harga terkini secara manual.', 'Masukkan harga positif yang valid untuk kedua logam.', 'Harga spot referensi; pembaruan dapat berhenti selama akhir pekan.'],
    tr: ['Fiyat yükleniyor…', 'Gold API · USD/g · Güncelleme: ', 'Manuel fiyat · Piyasaya göre doğrulanmadı.', 'Fiyat alınamadı. Güncel fiyatı elle girin.', 'Fiyat 96 saatten eski. Güncel fiyatı elle girin.', 'Her iki metal için geçerli bir pozitif fiyat girin.', 'Referans spot fiyatlar; hafta sonları güncellenmeyebilir.'],
    zh: ['正在加载报价…', 'Gold API · USD/克 · 更新时间：', '手动价格 · 未核对市场报价。', '报价不可用。请手动输入当前价格。', '报价已超过96小时。请手动输入当前价格。', '请为两种金属输入有效的正数价格。', '仅供参考的现货价格；周末可能暂停更新。'],
    ms: ['Memuatkan harga…', 'Gold API · USD/g · Dikemas kini: ', 'Harga manual · Belum disahkan dengan pasaran.', 'Harga tidak tersedia. Masukkan harga semasa secara manual.', 'Harga melebihi 96 jam. Masukkan harga semasa secara manual.', 'Masukkan harga positif yang sah untuk kedua-dua logam.', 'Harga spot rujukan; kemas kini mungkin terhenti pada hujung minggu.'],
    de: ['Kurs wird geladen…', 'Gold API · USD/g · Aktualisiert: ', 'Manueller Preis · Nicht mit dem Markt abgeglichen.', 'Kurs nicht verfügbar. Aktuellen Preis manuell eingeben.', 'Kurs älter als 96 Stunden. Aktuellen Preis manuell eingeben.', 'Für beide Metalle einen gültigen positiven Preis eingeben.', 'Unverbindliche Spotpreise; am Wochenende können Aktualisierungen ausbleiben.']
  };
  function parseQuote(data, symbol, now = Date.now()) {
    const timestamp = Date.parse(data?.updatedAt);
    if (data?.symbol !== symbol || (data.currency && data.currency !== 'USD') ||
        typeof data?.price !== 'number' || !Number.isFinite(data.price) || data.price <= 0 ||
        data.price > 1e7 || !Number.isFinite(timestamp) || timestamp > now + 300000) {
      throw new Error('invalid');
    }
    if (now - timestamp > MAX_AGE_MS) throw new Error('stale');
    return {perGram: data.price / GRAMS_PER_TROY_OUNCE, timestamp};
  }
  function positive(value) {
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) && number > 0 && number <= 1e6;
  }
  function init({document, fetch, getLanguage, onChange}) {
    const states = ['gold', 'silver'].map((metal, i) => ({
      metal, symbol: ['XAU', 'XAG'][i], input: document.getElementById(metal + 'Price'),
      status: 'loading', edited: false, timestamp: null
    }));
    const strings = () => copy[getLanguage()] || copy.en;
    function render() {
      const lang = getLanguage();
      const locale = {tj:'tg',zh:'zh-CN',ar:'ar',ru:'ru',en:'en-GB'}[lang] || lang;
      for (const s of states) {
        const msg = s.edited ? strings()[2] : s.status === 'ready'
          ? strings()[1] + new Date(s.timestamp).toLocaleString(locale, {timeZoneName: 'short'})
          : strings()[s.status === 'stale' ? 4 : s.status === 'loading' ? 0 : 3];
        document.getElementById(s.metal + 'PriceStatus').textContent = msg;
      }
      document.getElementById('priceSourceNote').textContent = strings()[6];
    }
    function valid() {
      for (const s of states) {
        if (!s.edited && s.timestamp && Date.now() - s.timestamp > MAX_AGE_MS) {
          s.status = 'stale'; s.input.value = ''; render();
        }
        if (!positive(s.input.value)) {
          s.input.setCustomValidity(strings()[5]);
          s.input.reportValidity();
          return false;
        }
      }
      return true;
    }
    for (const s of states) {
      s.input.addEventListener('input', () => {
        s.edited = true;
        s.input.setCustomValidity('');
        render(); onChange();
      });
    }
    const ready = Promise.all(states.map(async s => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch('https://api.gold-api.com/price/' + s.symbol,
          {signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'});
        if (!response.ok) throw new Error('unavailable');
        const quote = parseQuote(await response.json(), s.symbol);
        // An in-flight response must never overwrite a user's manual input.
        if (!s.edited) {
          s.input.value = quote.perGram.toFixed(4);
          s.input.setCustomValidity('');
          s.timestamp = quote.timestamp;
          s.status = 'ready';
        }
      } catch (error) {
        s.status = error.message === 'stale' ? 'stale' : 'unavailable';
      } finally {
        clearTimeout(timeout); render(); onChange();
      }
    }));
    render();
    return {render, valid, ready};
  }
  return {init, parseQuote, positive, GRAMS_PER_TROY_OUNCE, MAX_AGE_MS};
})();
if (typeof module !== 'undefined') module.exports = AMMetalPrices;
