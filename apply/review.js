/* Review is rendered locally; user-entered text is never interpreted as HTML. */
const AMApplyReview = (() => {
  const copy={
    en:['Review your application','Edit','Not provided','What happens next','This registers interest in future assistance. No review date or funding is promised. Keep your reference number; quote it when contacting the team.','Contact the team'],
    ru:['Проверьте заявку','Исправить','Не указано','Что будет дальше','Это регистрация интереса к будущей помощи. Дата рассмотрения и финансирование не обещаны. Сохраните номер заявки и укажите его при обращении к команде.','Связаться с командой'],
    de:['Antrag überprüfen','Bearbeiten','Nicht angegeben','Nächste Schritte','Dies erfasst Ihr Interesse an künftiger Hilfe. Prüfungstermin und Finanzierung sind nicht zugesagt. Bewahren Sie die Referenznummer auf und nennen Sie sie bei Rückfragen.','Team kontaktieren'],
    ar:['راجع طلبك','تعديل','غير مذكور','الخطوة التالية','هذا تسجيل اهتمام بمساعدة مستقبلية. لا يُضمن موعد مراجعة أو تمويل. احتفظ برقم الطلب واذكره عند التواصل مع الفريق.','تواصل مع الفريق'],
    tj:['Дархостро санҷед','Ислоҳ','Нишон дода нашудааст','Қадами навбатӣ','Ин сабти таваҷҷуҳ ба кӯмаки оянда аст. Санаи баррасӣ ва маблағгузорӣ ваъда дода намешавад. Рақами дархостро нигоҳ доред ва ҳангоми тамос бо даста нишон диҳед.','Тамос бо даста'],
    id:['Tinjau permohonan','Ubah','Tidak diisi','Langkah berikutnya','Ini mencatat minat atas bantuan mendatang. Tanggal peninjauan dan pendanaan tidak dijanjikan. Simpan nomor referensi dan sebutkan saat menghubungi tim.','Hubungi tim'],
    tr:['Başvuruyu gözden geçirin','Düzenle','Belirtilmedi','Sonraki adım','Bu, gelecekteki yardıma ilginizi kaydeder. İnceleme tarihi ve finansman vaat edilmez. Referans numaranızı saklayın ve ekiple iletişimde belirtin.','Ekiple iletişim'],
    zh:['检查申请','修改','未填写','下一步','这仅登记对未来援助的意向，不承诺审核日期或资金。请保存申请编号，并在联系团队时提供。','联系团队'],
    ms:['Semak permohonan','Sunting','Tidak diisi','Langkah seterusnya','Ini merekod minat terhadap bantuan akan datang. Tarikh semakan dan pembiayaan tidak dijanjikan. Simpan nombor rujukan dan nyatakannya semasa menghubungi pasukan.','Hubungi pasukan']
  };
  let config;
  function render(){
    if(!config)return;
    const {document,getLanguage,goStep}=config,c=copy[getLanguage()]||copy.en;
    const host=document.getElementById('reviewSummary');host.replaceChildren();
    const add=(tag,text,parent=host)=>{const el=document.createElement(tag);el.textContent=text;parent.appendChild(el);return el;};
    add('h2',c[0]);
    for(let n=1;n<=4;n++){
      const step=document.getElementById('step-'+n),section=add('section','');
      const heading=add('div','',section);heading.className='review-heading';
      add('h3',step.querySelector('.step-title').textContent,heading);
      const edit=add('button',c[1],heading);edit.type='button';edit.setAttribute('aria-label',c[1]+': '+step.querySelector('.step-title').textContent);
      edit.addEventListener('click',()=>{goStep(n);step.querySelector('input:not([aria-hidden="true"]),select,textarea')?.focus({preventScroll:true});});
      const list=add('dl','',section);
      for(const field of step.querySelectorAll('.field')){
        const label=field.querySelector('label'), controls=[...field.querySelectorAll('input,select,textarea')].filter(i=>i.id!=='a-website');
        if(!label||!controls.length)continue;
        if(field.closest('#mosque-detail')&&document.querySelector('input[name="mosque"]:checked')?.value!=='yes')continue;
        let values=controls.filter(i=>!['checkbox','radio'].includes(i.type)||i.checked).map(i=>{
          if(['checkbox','radio'].includes(i.type))return i.closest('label').textContent.trim();
          if(i.tagName==='SELECT')return i.selectedOptions[0]?.textContent||'';
          return i.value.trim();
        }).filter(Boolean);
        add('dt',label.textContent.trim(),list);add('dd',values.join(' · ')||c[2],list);
      }
    }
    document.getElementById('nextStepsTitle').textContent=c[3];document.getElementById('nextStepsText').textContent=c[4];
    const contact=document.getElementById('applicationContact');contact.textContent=c[5];
    const ref=document.getElementById('ref-num').textContent;
    contact.href='mailto:contact@amnetwork.io?subject='+encodeURIComponent('AM Network application '+ref);
  }
  function validate(document,goStep){
    for(let n=1;n<=4;n++)for(const input of document.querySelectorAll('#step-'+n+' input, #step-'+n+' select, #step-'+n+' textarea')){
      if(input.id==='a-website')continue;
      if(!input.checkValidity()){goStep(n);input.reportValidity();return false;}
    }
    return true;
  }
  function init(options){config=options;render();}
  return {init,render,validate};
})();
if(typeof module!=='undefined')module.exports=AMApplyReview;
