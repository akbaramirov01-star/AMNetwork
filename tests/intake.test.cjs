const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const code = fs.readFileSync(require('node:path').join(__dirname,'../apps_script_apply.gs'),'utf8');

function harness({verified=true,brokenSheet=false,configured=true}={}) {
  const data=new Map([['FORM_KIND','apply'],['WEB3FORMS_CAPTCHA_REQUIRED',String(configured)]]);
  const rows=[];let deliveries=0;
  const props={getProperty:k=>data.get(k)||null,setProperty:(k,v)=>data.set(k,v),
    getProperties:()=>Object.fromEntries(data),deleteProperty:k=>data.delete(k)};
  const sheet={getLastRow:()=>rows.length,appendRow:row=>{if(brokenSheet)throw Error('write');rows.push(row);},
    getRange:()=>({createTextFinder:ref=>({matchEntireCell:()=>({findNext:()=>rows.find(r=>r[1]===ref)})})})};
  const context={PropertiesService:{getScriptProperties:()=>props},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheets:()=>[sheet]}),flush(){}},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},
      computeDigest:(alg,value)=>[...crypto.createHash(alg).update(value).digest()]},
    UrlFetchApp:{fetch:()=>{deliveries++;return{getResponseCode:()=>200,getContentText:()=>JSON.stringify({success:verified})};}},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:value=>({setMimeType:()=>JSON.parse(value)})}};
  vm.createContext(context);vm.runInContext(code,context);
  return {context,rows,props,deliveries:()=>deliveries,repair:()=>{brokenSheet=false;}};
}
function payload(patch={}) {return {kind:'apply',consent:'true',ref:'AM-1234567890abcdef1234',name:'Example',
  email:'example@example.invalid',country:'DE',city:'Test',members:'2',children:'1',income:'0',
  expenses:'200',description:'Test only',lang:'en','h-captcha-response':'synthetic-test-token',...patch};}
function submit(h,p=payload()) {return h.context.doPost({postData:{type:'application/json',contents:JSON.stringify(p)}});}

test('unconfigured endpoint fails closed',()=>{
  const h=harness({configured:false});assert.equal(submit(h).success,false);
  assert.equal(h.rows.length,0);assert.equal(h.deliveries(),0);
});
for (const [name,change] of [
  ['missing captcha',{'h-captcha-response':''}],['honeypot',{website:'bot'}],
  ['no consent',{consent:'false'}],['invalid email',{email:'x'}],['invalid members',{members:'-1'}],
  ['too many children',{children:'3'}],['oversized description',{description:'x'.repeat(5001)}]
]) test('rejects '+name+' before delivery or Sheets',()=>{
  const h=harness();assert.equal(submit(h,payload(change)).success,false);
  assert.equal(h.rows.length,0);assert.equal(h.deliveries(),0);
});
test('failed server verification never reaches Sheets',()=>{
  const h=harness({verified:false});assert.equal(submit(h).success,false);assert.equal(h.rows.length,0);
});
test('duplicate reference and duplicate content produce one row and email',()=>{
  const h=harness();assert.equal(submit(h).success,true);
  assert.equal(submit(h).duplicate,true);
  const result=submit(h,payload({ref:'AM-1234567890abcdef5678'}));
  assert.equal(result.duplicate,true);assert.equal(result.ref,payload().ref);
  assert.equal(h.rows.length,1);assert.equal(h.deliveries(),1);
});
test('reference reuse with changed data is rejected',()=>{
  const h=harness();submit(h);assert.equal(submit(h,payload({description:'changed'})).code,'reference_conflict');
  assert.equal(h.deliveries(),1);
});
test('formula prefixes are stored as literal text',()=>{
  const h=harness();submit(h,payload({name:'=IMPORTXML("https://example.invalid","//a")'}));
  assert.ok(h.rows[0][2].startsWith("'="));
  for(const text of ['=1+1','+1','-1','@SUM(1)','\t=1',' \r=2'])assert.equal(h.context.safeCell_(text),"'"+text);
});
test('write failure is not success; retry does not re-send provider notification',()=>{
  const h=harness({brokenSheet:true});assert.equal(submit(h).success,false);
  assert.equal(h.deliveries(),1);h.repair();assert.equal(submit(h).success,true);
  assert.equal(h.rows.length,1);assert.equal(h.deliveries(),1);
});
test('daily per-email limit survives distinct valid requests',()=>{
  const h=harness();for(let i=0;i<3;i++)assert.equal(submit(h,payload({ref:'AM-1234567890abcdef000'+i,description:'case '+i})).success,true);
  assert.equal(submit(h,payload({ref:'AM-1234567890abcdef0009',description:'fourth'})).code,'rate_limited');
  assert.equal(h.rows.length,3);assert.equal(h.deliveries(),3);
});
test('global verification budget resists rotating email addresses',()=>{
  const h=harness({verified:false});
  for(let i=0;i<30;i++)submit(h,payload({email:'test'+i+'@example.invalid'}));
  assert.equal(submit(h,payload({email:'other@example.invalid'})).code,'rate_limited');
  assert.equal(h.deliveries(),30);assert.equal(h.rows.length,0);
});
