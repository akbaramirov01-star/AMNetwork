const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const transfer=require('../academy/progress-transfer.js');
const curriculum=vm.runInNewContext(fs.readFileSync(require.resolve('../academy/curriculum.js'),'utf8')+';CURRICULUM');
const first=curriculum[0],second=curriculum[1],date='2026-09-01T12:00:00.000Z';
const backup=(done={},passed={})=>({format:transfer.FORMAT,version:1,done,passed});
test('progress JSON round trip uses actual curriculum IDs and merges without losing prior achievements',()=>{
  const current=backup({[first.id]:[first.lessons[0].id]},{[first.id]:{score:100,date}});
  const incoming=transfer.parse(JSON.stringify(backup({[first.id]:[first.lessons[1].id], [second.id]:[second.lessons[0].id]},{[first.id]:{score:85,date}})),curriculum);
  const merged=transfer.merge(current,incoming);assert.deepEqual(merged.done[first.id],[first.lessons[0].id,first.lessons[1].id]);assert.equal(merged.passed[first.id].score,100);
  assert.deepEqual(transfer.parse(JSON.stringify(merged),curriculum),merged);
});
test('invalid progress never accepts unknown lesson IDs, prototype keys, bad scores, dates or file versions',()=>{
  const cases=[{...backup(),version:2},backup({unknown:[]}),backup({[first.id]:['not-a-lesson']}),JSON.parse('{"format":"amnetwork-academy-progress","version":1,"done":{"__proto__":[]},"passed":{}}')];
  for(const score of [84,101,'100',null])cases.push(backup({},{[first.id]:{score,date}}));
  cases.push(backup({},{[first.id]:{score:100,date:'2999-01-01'}}));
  for(const data of cases)assert.throws(()=>transfer.parse(JSON.stringify(data),curriculum));
  assert.throws(()=>transfer.parse('{',curriculum));assert.throws(()=>transfer.parse(' '.repeat(transfer.LIMIT+1),curriculum));assert.equal({}.polluted,undefined);
});
test('failed second storage write rolls back the first',()=>{
  const values=new Map([['amn_academy_done','{}'],['amn_academy_passed','{}']]);let writes=0;
  const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(++writes===2)throw Error('quota');values.set(k,v)},removeItem:k=>values.delete(k)};
  assert.throws(()=>transfer.save(storage,backup({[first.id]:[first.lessons[0].id]})),/quota/);
  assert.equal(values.get('amn_academy_done'),'{}');assert.equal(values.get('amn_academy_passed'),'{}');
});
