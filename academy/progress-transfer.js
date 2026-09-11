/* Portable learning progress. Imports are bounded, validated and merged locally. */
const AMProgressTransfer = (() => {
  const FORMAT='amnetwork-academy-progress', LIMIT=128*1024;
  const copy={
    en:['Keep your learning progress','Export progress','Import progress','This file contains completed lessons and test results only. Keep it to continue in another browser. Nothing is uploaded.','Merge imported progress','Cancel','The file is invalid or from an unsupported version. Your progress has not changed.','Progress imported. Your existing completed lessons have been kept.','Could not save progress. Check browser storage permissions.','Completed lessons','Passed modules','Review before importing: existing progress will be kept.'],
    ru:['Сохраните прогресс обучения','Экспорт прогресса','Импорт прогресса','В файле только пройденные уроки и результаты тестов. Сохраните его, чтобы продолжить в другом браузере. Файл никуда не отправляется.','Объединить прогресс','Отмена','Файл повреждён или имеет неподдерживаемую версию. Прогресс не изменён.','Прогресс импортирован. Уже пройденные уроки сохранены.','Не удалось сохранить прогресс. Проверьте разрешения хранилища браузера.','Пройденные уроки','Сданные модули','Проверьте перед импортом: существующий прогресс будет сохранён.'],
    de:['Lernfortschritt sichern','Fortschritt exportieren','Fortschritt importieren','Die Datei enthält nur abgeschlossene Lektionen und Testergebnisse. Damit können Sie in einem anderen Browser fortsetzen. Es wird nichts hochgeladen.','Fortschritt zusammenführen','Abbrechen','Ungültige Datei oder nicht unterstützte Version. Ihr Fortschritt bleibt unverändert.','Importiert. Bereits abgeschlossene Lektionen bleiben erhalten.','Speichern fehlgeschlagen. Browserspeicher-Berechtigungen prüfen.','Abgeschlossene Lektionen','Bestandene Module','Vor dem Import prüfen: bestehender Fortschritt bleibt erhalten.'],
    ar:['احفظ تقدّمك الدراسي','تصدير التقدّم','استيراد التقدّم','يحتوي الملف على الدروس المكتملة ونتائج الاختبارات فقط. احتفظ به للمتابعة في متصفح آخر. لا يُرفع أي ملف.','دمج التقدّم','إلغاء','الملف غير صالح أو الإصدار غير مدعوم. لم يتغيّر تقدّمك.','تم الاستيراد مع الاحتفاظ بالدروس المكتملة سابقاً.','تعذّر الحفظ. تحقّق من أذونات تخزين المتصفح.','الدروس المكتملة','الوحدات المجتازة','راجع قبل الاستيراد: سيُحفظ التقدّم الحالي.'],
    tj:['Пешрафти омӯзишро нигоҳ доред','Содироти пешрафт','Воридоти пешрафт','Файл танҳо дарсҳои анҷомшуда ва натиҷаҳои санҷишро дорад. Онро барои идома дар браузери дигар нигоҳ доред. Файл фиристода намешавад.','Якҷоя кардани пешрафт','Бекор','Файл нодуруст ё версия дастгирӣ намешавад. Пешрафт тағйир наёфт.','Пешрафт ворид шуд. Дарсҳои пешина нигоҳ дошта шуданд.','Захира нашуд. Иҷозати хотираи браузерро санҷед.','Дарсҳои анҷомшуда','Модулҳои гузашта','Пеш аз воридот санҷед: пешрафти мавҷуда нигоҳ дошта мешавад.'],
    id:['Simpan kemajuan belajar','Ekspor kemajuan','Impor kemajuan','File hanya berisi pelajaran selesai dan hasil tes. Simpan untuk melanjutkan di browser lain. Tidak ada unggahan.','Gabungkan kemajuan','Batal','File tidak valid atau versinya tidak didukung. Kemajuan tidak berubah.','Berhasil diimpor. Pelajaran yang sudah selesai dipertahankan.','Tidak dapat menyimpan. Periksa izin penyimpanan browser.','Pelajaran selesai','Modul lulus','Tinjau sebelum impor: kemajuan saat ini tetap disimpan.'],
    tr:['Öğrenme ilerlemesini saklayın','İlerlemeyi dışa aktar','İlerlemeyi içe aktar','Dosya yalnızca tamamlanan dersleri ve test sonuçlarını içerir. Başka tarayıcıda devam etmek için saklayın. Hiçbir dosya yüklenmez.','İlerlemeyi birleştir','İptal','Dosya geçersiz veya sürüm desteklenmiyor. İlerleme değişmedi.','İçe aktarıldı. Tamamlanan dersler korundu.','Kaydedilemedi. Tarayıcı depolama izinlerini kontrol edin.','Tamamlanan dersler','Geçilen modüller','İçe aktarmadan önce inceleyin: mevcut ilerleme korunur.'],
    zh:['保存学习进度','导出进度','导入进度','文件仅包含已完成的课程和测试成绩。保存后可在其他浏览器继续学习。文件不会上传。','合并进度','取消','文件无效或版本不受支持，进度未更改。','进度已导入，保留了原有的已完成课程。','无法保存，请检查浏览器存储权限。','已完成课程','已通过模块','导入前请检查：现有进度将被保留。'],
    ms:['Simpan kemajuan pembelajaran','Eksport kemajuan','Import kemajuan','Fail hanya mengandungi pelajaran selesai dan keputusan ujian. Simpan untuk meneruskan dalam pelayar lain. Tiada muat naik.','Gabungkan kemajuan','Batal','Fail tidak sah atau versi tidak disokong. Kemajuan tidak berubah.','Diimport. Pelajaran yang selesai dikekalkan.','Tidak dapat menyimpan. Semak kebenaran storan pelayar.','Pelajaran selesai','Modul lulus','Semak sebelum import: kemajuan sedia ada dikekalkan.']
  };
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  function validate(data,curriculum,now=Date.now()){
    if(!object(data)||data.format!==FORMAT||data.version!==1||!object(data.done)||!object(data.passed))throw Error('invalid backup');
    const known=new Map(curriculum.map(m=>[m.id,new Set(m.lessons.map(l=>l.id))]));
    const done={},passed={};
    for(const [id,lessons] of Object.entries(data.done)){
      if(!known.has(id)||!Array.isArray(lessons)||lessons.length>100||lessons.some(l=>typeof l!=='string'||!known.get(id).has(l)))throw Error('invalid lesson');
      done[id]=[...new Set(lessons)];
    }
    for(const [id,record] of Object.entries(data.passed)){
      if(!known.has(id)||!object(record)||!Number.isFinite(record.score)||record.score<85||record.score>100||typeof record.date!=='string'||!Number.isFinite(Date.parse(record.date))||Date.parse(record.date)>now+300000)throw Error('invalid result');
      passed[id]={score:record.score,date:new Date(record.date).toISOString()};
    }
    return {format:FORMAT,version:1,done,passed};
  }
  function parse(text,curriculum){if(typeof text!=='string'||text.length>LIMIT)throw Error('file too large');return validate(JSON.parse(text),curriculum);}
  function merge(current,incoming){
    const done={},passed={};
    for(const id of new Set([...Object.keys(current.done),...Object.keys(incoming.done)]))done[id]=[...new Set([...(current.done[id]||[]),...(incoming.done[id]||[])])];
    for(const id of new Set([...Object.keys(current.passed),...Object.keys(incoming.passed)])){
      const a=current.passed[id],b=incoming.passed[id];passed[id]=!a?b:!b?a:b.score>a.score?b:a;
    }
    return {format:FORMAT,version:1,done,passed};
  }
  function save(storage,data){
    const keys=['amn_academy_done','amn_academy_passed'],old=keys.map(k=>storage.getItem(k));
    try{storage.setItem(keys[0],JSON.stringify(data.done));storage.setItem(keys[1],JSON.stringify(data.passed));}
    catch(error){keys.forEach((k,i)=>{try{if(old[i]===null)storage.removeItem(k);else storage.setItem(k,old[i]);}catch(_){}});throw error;}
  }
  function init({document,storage,curriculum,getLanguage,onImport}){
    let pending=null,readToken=0;
    const get=id=>document.getElementById(id),c=()=>copy[getLanguage()]||copy.en;
    const current=()=>validate({format:FORMAT,version:1,done:JSON.parse(storage.getItem('amn_academy_done')||'{}'),passed:JSON.parse(storage.getItem('amn_academy_passed')||'{}')},curriculum);
    function render(){
      ['progressTitle','exportProgress','importProgress','progressHint','confirmProgress','cancelProgress'].forEach((id,i)=>get(id).textContent=c()[i]);
      get('progressPreview').hidden=!pending;
      if(pending)get('progressPreviewText').textContent=`${c()[11]} ${c()[9]}: ${Object.values(pending.done).reduce((n,a)=>n+a.length,0)}. ${c()[10]}: ${Object.keys(pending.passed).length}.`;
    }
    get('exportProgress').addEventListener('click',()=>{
      try{const data={...current(),exportedAt:new Date().toISOString()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='AM-Academy-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
      catch(_){get('progressStatus').textContent=c()[8];}
    });
    get('importProgress').addEventListener('click',()=>get('progressFile').click());
    get('progressFile').addEventListener('change',async()=>{
      const token=++readToken,file=get('progressFile').files[0];pending=null;render();get('progressStatus').textContent='';
      if(!file)return;
      try{if(file.size>LIMIT)throw Error('file too large');const text=await file.text();if(token!==readToken)return;pending=parse(text,curriculum);render();get('confirmProgress').focus();}
      catch(_){if(token===readToken)get('progressStatus').textContent=c()[6];}
      finally{if(token===readToken)get('progressFile').value='';}
    });
    get('confirmProgress').addEventListener('click',()=>{
      if(!pending)return;
      try{save(storage,merge(current(),pending));pending=null;render();get('progressStatus').textContent=c()[7];onImport();get('importProgress').focus();}
      catch(_){get('progressStatus').textContent=c()[8];}
    });
    get('cancelProgress').addEventListener('click',()=>{++readToken;pending=null;render();get('importProgress').focus();});
    render();return {render};
  }
  return {validate,parse,merge,save,init,FORMAT,LIMIT};
})();
if(typeof module!=='undefined')module.exports=AMProgressTransfer;
