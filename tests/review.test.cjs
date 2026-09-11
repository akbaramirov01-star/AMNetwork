const {test}=require('node:test');const assert=require('node:assert/strict');const review=require('../apply/review.js');
test('application validation returns to the invalid step and does not skip required consent',()=>{
  const steps=[],reported=[];
  const document={querySelectorAll:s=>s.startsWith('#step-4')?[{id:'consent',checkValidity:()=>false,reportValidity:()=>reported.push(true)}]:[{id:'valid',checkValidity:()=>true}]};
  assert.equal(review.validate(document,n=>steps.push(n)),false);assert.deepEqual(steps,[4]);assert.deepEqual(reported,[true]);
  assert.equal(review.validate({querySelectorAll:()=>[{id:'valid',checkValidity:()=>true}]},()=>{}),true);
});
test('review renders entered markup as text, edits the right step and encodes only the reference in email',()=>{
  const element=tag=>({tagName:tag,children:[],textContent:'',handlers:{},appendChild(el){this.children.push(el)},replaceChildren(){this.children=[]},setAttribute(){},addEventListener(k,v){this.handlers[k]=v},set innerHTML(_){throw Error('Unsafe HTML')}});
  const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,element('div'));return nodes.get(id)};
  get('ref-num').textContent='AM-123 & test';
  const input={id:'a-desc',value:'<img src=x onerror=alert(1)>',type:'text',tagName:'TEXTAREA',focus(){}};
  const field={querySelector:()=>({textContent:'Description'}),querySelectorAll:()=>[input],closest:()=>null};
  for(let i=1;i<=4;i++){get('step-'+i).querySelector=s=>s==='.step-title'?{textContent:'Step '+i}:input;get('step-'+i).querySelectorAll=()=>[field]}
  const steps=[];review.init({document:{getElementById:get,createElement:element},getLanguage:()=> 'en',goStep:n=>steps.push(n)});
  const section=get('reviewSummary').children[2];assert.equal(section.children[1].children[1].textContent,input.value);
  section.children[0].children[1].handlers.click();assert.deepEqual(steps,[2]);assert.equal(get('applicationContact').href,'mailto:contact@amnetwork.io?subject=AM%20Network%20application%20AM-123%20%26%20test');
});
