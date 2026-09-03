const {test} = require('node:test');
const assert = require('node:assert/strict');
const prices = require('../zakat/metal-prices.js');

const now = Date.parse('2026-09-03T10:00:00Z');
const quote = {symbol:'XAU', currency:'USD', price:3110.34768, updatedAt:new Date(now).toISOString()};
test('converts a troy ounce to grams without rounding the quote first', () => {
  assert.equal(prices.parseQuote(quote, 'XAU', now).perGram, 100);
});
for (const [name, patch] of [
  ['wrong metal',{symbol:'XAG'}], ['wrong currency',{currency:'EUR'}],
  ['negative',{price:-2}], ['string price',{price:'3110'}], ['infinite',{price:Infinity}],
  ['missing time',{updatedAt:null}], ['future',{updatedAt:'2030-01-01'}],
  ['stale',{updatedAt:'2026-08-29'}]
]) test('rejects '+name, () => assert.throws(() => prices.parseQuote({...quote,...patch}, 'XAU', now)));

test('accepts a weekend quote and rejects invalid manual values', () => {
  assert.equal(prices.parseQuote({...quote,updatedAt:new Date(now-72*3600000).toISOString()},'XAU',now).perGram,100);
  for (const value of ['', ' ', '0','-1','Infinity','NaN','12usd','1e30']) assert.equal(prices.positive(value),false);
  assert.equal(prices.positive('100.1234'),true);
});

function harness(fetch) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {value:'', textContent:'', validity:'',
      addEventListener(name,fn){this[name]=fn;},setCustomValidity(value){this.validity=value;},reportValidity(){}});
    return elements.get(id);
  };
  let changes=0;
  const widget=prices.init({document:{getElementById:get},fetch,getLanguage:()=> 'ru',onChange:()=>changes++});
  return {get,widget,changes:()=>changes};
}
test('network failure keeps prices blank; manual prices remain usable',async () => {
  const h = harness(async()=>{throw Error('offline');});
  await h.widget.ready;
  assert.equal(h.get('goldPrice').value,'');
  assert.equal(h.widget.valid(),false);
  for (const [id,value] of [['goldPrice','100'],['silverPrice','1']]) {
    h.get(id).value=value;h.get(id).input();
  }
  assert.equal(h.widget.valid(),true);
  assert.match(h.get('goldPriceStatus').textContent,/вручную/);
});
test('late quote does not overwrite a manual price; each metal keeps its source time',async () => {
  let respond;
  const pending = new Promise(resolve=>respond=resolve);
  const h=harness(async url=>{await pending;return {ok:true,json:async()=>({...quote,symbol:url.endsWith('XAG')?'XAG':'XAU',updatedAt:new Date().toISOString()})};});
  h.get('goldPrice').value='120';h.get('goldPrice').input();
  respond();await h.widget.ready;
  assert.equal(h.get('goldPrice').value,'120');
  assert.match(h.get('goldPriceStatus').textContent,/вручную/);
  assert.match(h.get('silverPriceStatus').textContent,/Обновлено:/);
  assert.equal(h.widget.valid(),true);
});
