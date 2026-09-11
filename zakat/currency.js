/* Only currency codes are sent for rate requests. Asset amounts and reports stay on this device. */
const AMCurrency = (() => {
  const MONEY_IDS = ['cash','inventory','investments','receivables','debts','rainCrops','irrigCrops'];
  const CURRENCIES = ['USD','EUR','GBP','TJS','RUB','TRY','IDR','MYR','AED','SAR','CNY'];
  const MAX_AGE = 7 * 86400000;
  const copy = {
    en:['Calculation currency','Amounts are converted when you change currency. Metal quotes remain in USD per gram.','Loading exchange rate…','Rate unavailable. The previous currency and amounts have been kept.','Reference exchange rate','No currency conversion','Print / Save PDF','Zakat calculation report','Calculated on','Input values','Sources and rates','Choose “Save as PDF” in the print dialog.','Refresh rate'],
    ru:['Валюта расчёта','При смене валюты суммы пересчитываются. Котировки металлов остаются в USD за грамм.','Загружаем курс…','Курс недоступен. Прежняя валюта и суммы сохранены.','Справочный валютный курс','Без конвертации валюты','Печать / Сохранить PDF','Отчёт о расчёте закята','Дата расчёта','Введённые значения','Источники и курсы','Выберите «Сохранить как PDF» в окне печати.','Обновить курс'],
    de:['Berechnungswährung','Beträge werden beim Währungswechsel umgerechnet. Metallkurse bleiben in USD pro Gramm.','Wechselkurs wird geladen…','Kurs nicht verfügbar. Bisherige Währung und Beträge bleiben erhalten.','Referenzwechselkurs','Keine Währungsumrechnung','Drucken / PDF speichern','Zakat-Berechnung','Berechnet am','Eingaben','Quellen und Kurse','Im Druckdialog „Als PDF speichern“ auswählen.','Kurs aktualisieren'],
    ar:['عملة الحساب','تُحوّل المبالغ عند تغيير العملة. تبقى أسعار المعادن بالدولار لكل غرام.','جارٍ تحميل سعر الصرف…','السعر غير متاح. حُفظت العملة والمبالغ السابقة.','سعر صرف استرشادي','دون تحويل عملة','طباعة / حفظ PDF','تقرير حساب الزكاة','تاريخ الحساب','القيم المدخلة','المصادر والأسعار','اختر «حفظ بصيغة PDF» في نافذة الطباعة.','تحديث السعر'],
    tj:['Асъори ҳисоб','Ҳангоми иваз кардани асъор маблағҳо табдил меёбанд. Нархи металлҳо USD барои грамм мемонад.','Қурб бор шуда истодааст…','Қурб дастрас нест. Асъор ва маблағҳои пешина нигоҳ дошта шуданд.','Қурби маълумотӣ','Бе табдили асъор','Чоп / Захираи PDF','Ҳисоботи закот','Санаи ҳисоб','Қиматҳои воридшуда','Манбаъҳо ва қурбҳо','Дар равзанаи чоп «Захира ҳамчун PDF»-ро интихоб кунед.','Навсозии қурб'],
    id:['Mata uang perhitungan','Jumlah dikonversi saat mata uang berubah. Harga logam tetap dalam USD per gram.','Memuat kurs…','Kurs tidak tersedia. Mata uang dan jumlah sebelumnya dipertahankan.','Kurs referensi','Tanpa konversi mata uang','Cetak / Simpan PDF','Laporan perhitungan zakat','Dihitung pada','Nilai masukan','Sumber dan kurs','Pilih “Simpan sebagai PDF” pada dialog cetak.','Perbarui kurs'],
    tr:['Hesaplama para birimi','Para birimi değişince tutarlar dönüştürülür. Metal fiyatları gram başına USD olarak kalır.','Kur yükleniyor…','Kur alınamadı. Önceki para birimi ve tutarlar korundu.','Referans döviz kuru','Döviz dönüşümü yok','Yazdır / PDF kaydet','Zekât hesaplama raporu','Hesaplama tarihi','Girilen değerler','Kaynaklar ve kurlar','Yazdırma penceresinde “PDF olarak kaydet” seçin.','Kuru yenile'],
    zh:['计算货币','更换货币时金额将自动换算。金属报价仍以美元/克表示。','正在加载汇率…','汇率不可用，已保留原来的货币和金额。','参考汇率','无货币转换','打印 / 保存 PDF','天课计算报告','计算日期','输入值','来源与汇率','请在打印窗口选择“另存为 PDF”。','刷新汇率'],
    ms:['Mata wang pengiraan','Jumlah ditukar apabila mata wang berubah. Harga logam kekal dalam USD setiap gram.','Memuatkan kadar…','Kadar tidak tersedia. Mata wang dan jumlah terdahulu dikekalkan.','Kadar pertukaran rujukan','Tiada pertukaran mata wang','Cetak / Simpan PDF','Laporan pengiraan zakat','Dikira pada','Nilai input','Sumber dan kadar','Pilih “Simpan sebagai PDF” dalam dialog cetak.','Kemas kini kadar']
  };
  function parseRate(data, currency, now=Date.now()) {
    const date=Date.parse(data?.date);
    if (data?.base!=='USD'||data?.quote!==currency||typeof data.rate!=='number'||!Number.isFinite(data.rate)||data.rate<=0||data.rate>1e9||!Number.isFinite(date)||date>now+86400000||now-date>MAX_AGE) throw Error('invalid rate');
    return {rate:data.rate,date:data.date};
  }
  function convertedValues(values, oldRate, newRate) {
    return values.map(value => {
      if(value==='')return '';
      const n=Number(value);
      if(!Number.isFinite(n)||n<0)throw Error('invalid amount');
      const converted=n/oldRate*newRate;
      if(!Number.isFinite(converted)||converted>1e15)throw Error('amount too large');
      return converted.toFixed(2);
    });
  }
  function init({document,fetch,getLanguage,onChange}) {
    let currency='USD', rate=1, date=null, loading=false, failed=false;
    const select=document.getElementById('calcCurrency');
    const inputs=MONEY_IDS.map(id=>document.getElementById(id));
    const strings=()=>copy[getLanguage()]||copy.en;
    const locale=()=>getLanguage()==='tj'?'tg':getLanguage();
    function info(){return currency==='USD'?strings()[5]:`${strings()[4]} · Frankfurter · ${date} · 1 USD = ${rate} ${currency}`;}
    function render(){
      document.getElementById('currencyLabel').textContent=strings()[0];
      document.getElementById('currencyHint').textContent=strings()[1];
      document.getElementById('currencyStatus').textContent=loading?strings()[2]:(failed?strings()[3]+' ':'')+info();
      document.getElementById('printCalculation').textContent=strings()[6];
      document.getElementById('printHint').textContent=strings()[11];
      document.getElementById('refreshCurrency').textContent=strings()[12];
      document.querySelectorAll('[data-t="amount_unit"]').forEach(el=>el.textContent=currency);
      select.disabled=loading;
      document.getElementById('refreshCurrency').disabled=loading||currency==='USD';
      document.querySelector('.calc-btn').disabled=loading;
      inputs.forEach(input=>input.disabled=loading);
    }
    async function change(){
      if(loading)return;
      const wanted=select.value;
      if(!CURRENCIES.includes(wanted))return;
      loading=true;failed=false;render();onChange();
      const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),8000);
      try{
        let quote={rate:1,date:null};
        if(wanted!=='USD'){
          const response=await fetch('https://api.frankfurter.dev/v2/rate/USD/'+wanted,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
          if(!response.ok)throw Error('unavailable');
          quote=parseRate(await response.json(),wanted);
        }
        const values=wanted===currency?inputs.map(i=>i.value):convertedValues(inputs.map(i=>i.value),rate,quote.rate);
        values.forEach((value,i)=>inputs[i].value=value);
        currency=wanted;rate=quote.rate;date=quote.date;
      }catch(_){failed=true;select.value=currency;}
      finally{clearTimeout(timer);loading=false;render();onChange();}
    }
    select.addEventListener('change',change);
    document.getElementById('refreshCurrency').addEventListener('click',change);
    render();
    return {render,info,strings,valid:()=>{
      const valid=!loading&&(currency==='USD'||Boolean(date&&Date.now()-Date.parse(date)<=MAX_AGE));
      if(!valid&&!loading){failed=true;render();}
      return valid;
    },
      toUSD:n=>n/rate,format:n=>new Intl.NumberFormat(locale(),{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(n*rate),currency:()=>currency};
  }
  function report({document,money,t,now=new Date()}) {
    const panel=document.getElementById('resultPanel');
    if(!panel.classList.contains('visible')||!money.valid())return false;
    let report=document.getElementById('printReport');
    if(!report){report=document.createElement('section');report.id='printReport';report.hidden=true;document.body.appendChild(report);}
    report.replaceChildren();
    const add=(tag,text,parent=report)=>{const el=document.createElement(tag);el.textContent=text;parent.appendChild(el);return el;};
    const c=money.strings();
    add('p','AM NETWORK · amnetwork.io');add('h1',c[7]);add('p',c[8]+': '+now.toLocaleString());
    add('h2',document.getElementById('verdictText').textContent);
    if(document.getElementById('verdictAmount').style.display!=='none')add('p',document.getElementById('verdictAmount').textContent);
    add('p',t('nisab_used_lbl')+' '+document.getElementById('nisabUsedVal').textContent);
    add('h2',t('breakdown_title'));
    const table=add('table','');
    panel.querySelectorAll('#breakdownTable tr').forEach(row=>{const tr=add('tr','',table);row.querySelectorAll('td').forEach(cell=>add('td',cell.textContent,tr));});
    for(const id of ['agriResult','livestockResult']){const el=document.getElementById(id);if(el.style.display!=='none')add('p',el.textContent.trim());}
    add('h2',c[9]);
    for(const id of [...MONEY_IDS,'goldOwned','silverOwned','camels','cows','sheep']){
      const input=document.getElementById(id), label=document.querySelector('label[for="'+id+'"]');
      if(input&&label){const unit=MONEY_IDS.includes(id)?money.currency():id.endsWith('Owned')?t('grams_unit'):t('head_unit');add('p',label.textContent+': '+(input.value||'0')+' '+unit);}
    }
    add('h2',c[10]);add('p',money.info());
    if(money.currency()!=='USD')add('p','https://api.frankfurter.dev/v2/rate/USD/'+money.currency());
    for(const metal of ['gold','silver']){
      add('p',document.querySelector('label[for="'+metal+'Price"]').textContent+': '+document.getElementById(metal+'Price').value);
      add('p',document.getElementById(metal+'PriceStatus').textContent);
    }
    add('p','Gold API · https://gold-api.com/ · USD / troy oz ÷ 31.1034768 = USD/g');
    add('p',t('disclaimer_body'));add('p',t('footer_note'));
    return true;
  }
  return {init,report,parseRate,convertedValues,MONEY_IDS,CURRENCIES};
})();
if(typeof module!=='undefined')module.exports=AMCurrency;
