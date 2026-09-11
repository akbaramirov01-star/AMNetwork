const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const currency=require('../zakat/currency.js');
const quote=(rate=.9,quote='EUR')=>({base:'USD',quote,rate,date:new Date().toISOString().slice(0,10)});
function harness(fetch){
  const elements=new Map();
  const get=id=>{if(!elements.has(id)){const classes=new Set();elements.set(id,{value:'',textContent:'',style:{},disabled:false,handlers:{},children:[],
    classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k)},
    addEventListener(k,v){this.handlers[k]=v},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},
    querySelectorAll(){return []},focus(){},scrollIntoView(){},reportValidity(){return true}})}return elements.get(id)};
  const document={getElementById:get,querySelector:s=>get(s),querySelectorAll:()=>[],body:get('body'),createElement:tag=>({tagName:tag,children:[],textContent:'',appendChild(v){this.children.push(v)}})};
  get('calcCurrency').value='USD';
  const changes=[];const money=currency.init({document,fetch,getLanguage:()=> 'en',onChange:()=>changes.push(true)});
  return {get,document,money,changes,change:async(code)=>{get('calcCurrency').value=code;await get('calcCurrency').handlers.change()}};
}
test('a failed currency switch retains prior amounts and currency; requests contain no amounts',async()=>{
  const calls=[];let fail=false;
  const h=harness(async(url,options)=>{calls.push({url,options});if(fail)throw Error('offline');return {ok:true,json:async()=>quote()}});
  h.get('cash').value='10000';h.get('goldOwned').value='25';
  await h.change('EUR');assert.equal(h.get('cash').value,'9000.00');assert.equal(h.get('goldOwned').value,'25');
  assert.equal(h.money.toUSD(9000),10000);assert.equal(h.money.currency(),'EUR');
  fail=true;await h.change('GBP');assert.equal(h.money.currency(),'EUR');assert.equal(h.get('calcCurrency').value,'EUR');assert.equal(h.get('cash').value,'9000.00');assert.equal(h.get('cash').disabled,false);
  assert.match(h.get('currencyStatus').textContent,/previous currency/);
  assert.deepEqual(calls.map(c=>c.url),['https://api.frankfurter.dev/v2/rate/USD/EUR','https://api.frankfurter.dev/v2/rate/USD/GBP']);
  assert.equal(calls[0].options.body,undefined);assert.equal(calls[0].options.credentials,'omit');
  await h.change('USD');assert.equal(h.get('cash').value,'10000.00');assert.equal(calls.length,2);
});
test('currency switch locks inputs while pending and ignores overlapping requests',async()=>{
  let resolve,count=0;const h=harness(()=>{count++;return new Promise(r=>resolve=r)});
  h.get('cash').value='100';const pending=h.change('EUR');assert.equal(h.get('cash').disabled,true);assert.equal(h.money.valid(),false);
  await h.get('calcCurrency').handlers.change();assert.equal(count,1);
  resolve({ok:true,json:async()=>quote()});await pending;assert.equal(h.get('cash').value,'90.00');assert.equal(h.money.valid(),true);
});
test('rates reject stale, future, wrong-pair, string and nonfinite values',()=>{
  for(const data of [quote(-1),quote('1'),quote(Infinity),quote(1,'GBP'),{...quote(),base:'EUR'},{...quote(),date:'2000-01-01'},{...quote(),date:'2999-01-01'},null])assert.throws(()=>currency.parseRate(data,'EUR'));
  assert.deepEqual(currency.convertedValues(['','100.25'],1,2),['','200.50']);
  assert.throws(()=>currency.convertedValues(['-1'],1,2));assert.throws(()=>currency.convertedValues(['1e308'],1,2));
});
test('the calculator produces the same obligation after currency conversion, retaining grams',async()=>{
  const h=harness(async()=>({ok:true,json:async()=>quote()}));
  for(const id of ['cash','inventory','investments','receivables','debts','rainCrops','irrigCrops','goldOwned','silverOwned','camels','cows','sheep'])h.get(id).value='0';
  h.get('cash').value='10000';h.get('goldOwned').value='10';h.get('goldPrice').value='100';h.get('silverPrice').value='1';h.get('debts').value='500';
  h.get('input[name="nisab"]:checked').value='gold';
  const html=fs.readFileSync(require.resolve('../zakat/index.html'),'utf8');
  const code=html.slice(html.indexOf('function fmtUSD('),html.indexOf('(function init()'));
  const context={document:h.document,money:h.money,AMCurrency:currency,metalPrices:{valid:()=>true},t:k=>k,setTimeout:fn=>fn()};
  vm.createContext(context);vm.runInContext(code,context);context.calculateZakat();
  assert.equal(h.get('verdictAmount').textContent,'$262.50');
  await h.change('EUR');context.calculateZakat();assert.equal(h.get('verdictAmount').textContent,'€236.25');
  assert.match(h.get('nisabUsedVal').textContent,/€7,650.00/);assert.equal(h.get('goldOwned').value,'10');
  assert.match(html.match(/connect-src[^;]+/)[0],/https:\/\/api\.frankfurter\.dev/);
});
test('PDF report only uses text and is refused for hidden or invalid results',()=>{
  const h=harness(()=>{throw Error('No report network requests')});
  assert.equal(currency.report({document:h.document,money:h.money,t:x=>x}),false);
  h.get('resultPanel').classList.add('visible');h.get('verdictText').textContent='<img src=x onerror=alert(1)>';
  assert.equal(currency.report({document:h.document,money:h.money,t:x=>x}),true);
  const children=h.get('printReport').children;
  // The created section is attached to the body; our fake DOM does not index it.
  const report=h.get('body').children[0]||h.get('printReport');
  assert.ok(report.children.some(e=>e.textContent==='<img src=x onerror=alert(1)>'));
});
