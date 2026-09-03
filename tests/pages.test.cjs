const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
for(const name of ['index.html','apply/index.html','ai_scoring/index.html','zakat/index.html','privacy/index.html']) {
  test('inline JavaScript parses: '+name,()=>{
    const html=fs.readFileSync(path.join(root,name),'utf8');
    for (const [,attributes,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/application\/ld\+json/.test(attributes) || !body.trim())continue;
      assert.doesNotThrow(()=>new vm.Script(body,{filename:name}));
    }
  });
}
test('public scoring result computes locally without a profile upload path',async()=>{
  const html=fs.readFileSync(path.join(root,'ai_scoring/index.html'),'utf8');
  assert.ok(!html.includes('fetchApiScore'));
  assert.ok(!html.includes('profileToApiPayload'));
  const start=html.indexOf('async function showResult()');
  const end=html.indexOf("  const colors=",start);
  const calls=[];
  const context={getProfile:()=>({income:123,medical:'private'}),
    calcScore:p=>{calls.push(p.income);return {final:42};},
    fetch:()=>{throw Error('No questionnaire upload allowed');}};
  vm.createContext(context);
  vm.runInContext(html.slice(start,end)+'return r;}',context);
  assert.equal((await context.showResult()).final,42);
  assert.deepEqual(calls,[123]);
});
