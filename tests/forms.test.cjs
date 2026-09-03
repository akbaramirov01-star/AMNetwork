// Exercise the actual form handlers with synthetic provider responses.
// No network requests or emails are sent by these tests.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function element(value='') {
  const classes = new Set();
  return {value, checked:true, disabled:false, textContent:'', style:{}, children:[],
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
    appendChild(child){this.children.push(child);},addEventListener(){},
    set innerHTML(_){throw Error('HTML parsing is forbidden for form responses');}
  };
}
function harness(reply, {captcha=true, status=200}={}) {
  const elements = new Map();
  const get = id => {if(!elements.has(id))elements.set(id,element());return elements.get(id);};
  get('a-agree').checked=true;
  get('wl-name').value='Test'; get('wl-email').value='test@example.invalid'; get('wl-role').value='donor';
  const token = captcha ? element('test-token') : null;
  const handlers = {};
  get('wl-form').querySelector=()=>token;
  get('wl-form').addEventListener=(event,handler)=>{handlers[event]=handler;};
  const calls = [], alerts=[];
  const context = {
    document:{getElementById:get,querySelector:s=>s==='.btn-submit'?get('submit-button'):token,
      querySelectorAll:()=>[],createElement:()=>element()},
    FormData:class{append(){}},URLSearchParams,AbortController,setTimeout,clearTimeout,
    currentLang:'en',lang:'en',T:{en:{}},t:key=>key,setLang:()=>{},alert:s=>alerts.push(s),
    fetch:async url=>{calls.push(url);return {ok:status>=200&&status<300,text:async()=>reply};}
  };
  vm.createContext(context);
  return {context,get,calls,alerts,handlers};
}
const applyHtml=fs.readFileSync(path.join(root,'apply/index.html'),'utf8');
const applyCode=applyHtml.slice(applyHtml.indexOf('async function submitApp(){'),applyHtml.indexOf("document.addEventListener('click',e=>"));
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const waitlistCode=home.match(/\/\/ ── Waitlist form ──\s*(\(function\(\)\{[\s\S]*?\}\)\(\);)/)[1];

for(const [label,body,status] of [
  ['invalid JSON','<html>upstream error</html>',200],
  ['HTTP error with success body','{"success":true}',503],
  ['false success','{"success":false}',200],
  ['non-boolean success','{"success":"true"}',200],
  ['null response','null',200]
]) {
  test('application rejects '+label,async()=>{
    const h=harness(body,{status});vm.runInContext(applyCode,h.context);
    await h.context.submitApp();
    assert.equal(h.get('thankyou').classList.contains('show'),false);
    assert.equal(h.get('submit-button').disabled,false);
    assert.equal(h.alerts.length,1);
  });
  test('waitlist rejects '+label,async()=>{
    const h=harness(body,{status});vm.runInContext(waitlistCode,h.context);
    await h.handlers.submit({preventDefault(){}});
    assert.equal(h.get('wl-success').classList.contains('show'),false);
    assert.equal(h.get('wl-btn').disabled,false);
    assert.equal(h.get('wl-err-banner').classList.contains('show'),true);
  });
}
test('application accepts an explicit successful response',async()=>{
  const h=harness('{"success":true}');vm.runInContext(applyCode,h.context);
  await h.context.submitApp();assert.equal(h.get('thankyou').classList.contains('show'),true);
});
test('waitlist accepts an explicit successful response',async()=>{
  const h=harness('{"success":true}');vm.runInContext(waitlistCode,h.context);
  await h.handlers.submit({preventDefault(){}});assert.equal(h.get('wl-success').classList.contains('show'),true);
});
test('missing captcha blocks both submission destinations',async()=>{
  const h=harness('{"success":true}',{captcha:false});vm.runInContext(applyCode,h.context);
  await h.context.submitApp();assert.equal(h.calls.length,0);
  assert.equal(h.get('submit-button').disabled,false);
});
test('provider error markup remains text',async()=>{
  const payload='<img src=x onerror="alert(1)">';
  const h=harness(JSON.stringify({success:false,message:payload}));vm.runInContext(waitlistCode,h.context);
  await h.handlers.submit({preventDefault(){}});
  assert.ok(h.get('wl-err-banner').textContent.includes(payload));
  assert.equal(h.get('wl-err-banner').children.length,1);
  assert.equal(h.get('wl-err-banner').children[0].href,'mailto:contact@amnetwork.io');
});
test('duplicate submissions are ignored while pending',async()=>{
  const h=harness('{"success":true}');vm.runInContext(applyCode,h.context);
  h.get('submit-button').disabled=true;await h.context.submitApp();assert.equal(h.calls.length,0);
  vm.runInContext(waitlistCode,h.context);h.get('wl-btn').disabled=true;
  await h.handlers.submit({preventDefault(){}});assert.equal(h.calls.length,0);
});
