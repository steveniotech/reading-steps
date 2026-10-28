'use strict';
// Executes actual practice handlers against a DOM/storage substitute. Not browser QA.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
function storage(){const data=new Map();return {data,failRead:false,failWrite:false,getItem(k){if(this.failRead)throw Error('Blocked');return data.get(k)||null;},setItem(k,v){if(this.failWrite)throw Error('Quota');data.set(k,String(v));}};}
function boot({local=storage(),session=storage(),clipboardFailure=false,randomFailure=false}={}){
 let source=fs.readFileSync('test-state.js','utf8').split('const run=code=>')[0];
 source=source.replace('vm.createContext({document,','vm.createContext({localStorage:browserLocal,sessionStorage:browserSession,crypto:browserCrypto,navigator:browserNavigator,google:forbiddenGoogle,document,');
 source=source.replace("fs.readFileSync('app.js','utf8')","fs.readFileSync('reading-records.js','utf8')+'\\n'+fs.readFileSync('practice-completion.js','utf8')+'\\n'+fs.readFileSync('app.js','utf8')");
 source+='\nglobalThis.testPage={context,document,elements};';
 const copied=[],calls={network:0};
 const sandbox={require,console,browserLocal:local,browserSession:session,
  browserCrypto:{getRandomValues(a){if(randomFailure)throw Error('Crypto unavailable');return crypto.randomFillSync(a);}},
  browserNavigator:{clipboard:{async writeText(text){if(clipboardFailure)throw Error('Denied');copied.push(text);}}},
  forbiddenGoogle:new Proxy({}, {get(){calls.network++;throw Error('No cloud interface allowed');}})};
 vm.runInNewContext(source,sandbox);const {context,document}=sandbox.testPage;
 return {run:code=>vm.runInContext(code,context),el:id=>document.getElementById(id),local,session,copied,calls};
}
function complete(p,{mixed=false,finish=true}={}){
 if(mixed)p.run("show(FLOW.findIndex(s=>s.key==='what'&&s.phase==='answer'));state.what.choice=getQuestion('what').options.find(o=>o.id!==getQuestion('what').answerId).id;handlePrimary();");
 p.run("for(const key of keys){show(FLOW.findIndex(s=>s.key===key&&s.phase==='answer'));state[key].choice=getQuestion(key).answerId;handlePrimary();show(FLOW.findIndex(s=>s.key===key&&s.phase==='evidence'));state[key].selected=[...getQuestion(key).evidenceIds];handlePrimary();}show(FLOW.findIndex(s=>s.phase==='retell'));state.retell='FICTIONAL WRITING - NEVER STORED';handlePrimary();"+(finish?'handlePrimary();':''));
}
const POINTER='reading-steps:pages-session:v1',PREFIX='reading-steps:pages-round:';
function frozen(p){const id=p.session.getItem(POINTER);return JSON.parse(p.local.getItem(PREFIX+id+':completion'));}
let groups=0;async function test(name,fn){await fn();groups++;console.log('PASS '+name);}
(async()=>{
 await test('direct practice; first 5/6 then final 6/6; full rule summary and unique RS number; no transport',()=>{
  const p=boot();assert.equal(p.el('practice-workspace').hidden,false);assert.equal(p.el('completion-summary').hidden,true);assert.equal(p.run('current().phase'),'read');complete(p,{mixed:true});
  const f=Object.values(frozen(p).completed)[0],html=p.el('completion-content').innerHTML;
  assert.match(f.submissionId,/^RS-[a-f0-9]{32}$/);assert.equal(f.report.firstCorrect,5);assert.equal(f.report.finalCorrect,6);assert.match(html,/You got 5 of 6 answers right on your first try/);assert.match(html,/You got 6 of 6 answers right by the end/);
  for(const section of ['Your Reading Summary','What You Did Well','What to Practise Next','Try This Next','About This Summary'])assert.ok(html.includes(section));
  assert.ok(!/[\u3400-\u9fff]/.test(html));assert.ok(!html.includes(f.report.attemptId));assert.ok(!html.includes(f.report.rulesVersion));assert.match(html,/after trying again/);
  assert.equal(f.report.rows.length,6);assert.equal(p.el('practice-workspace').hidden,true);assert.equal(p.el('teacher-settings').hidden,true);assert.equal(p.calls.network,0);
  assert.ok(!JSON.stringify([...p.local.data]).includes('FICTIONAL WRITING'));
 });
 await test('copy summary/number separately; unavailable submission is honest; no receipt/proof needed',async()=>{
  const p=boot();complete(p);const id=p.el('completion-id').textContent;
  await p.el('copy-number').onclick();assert.equal(p.copied[0],id);assert.match(p.el('completion-copy-status').textContent,/does not mean your teacher has received/);
  await p.el('copy-summary').onclick();assert.ok(p.copied[1].includes(id));assert.match(p.copied[1],/You got 6 of 6 answers right on your first try/);assert.match(p.copied[1],/What You Did Well/);
  const html=fs.readFileSync('index.html','utf8');assert.ok(!html.includes('cloud-submit'));assert.match(html,/Online submission is not open/);assert.equal(p.calls.network,0);
 });
 await test('refresh restores identical frozen report, ID and completed screen without duplicate record',()=>{
  const local=storage(),session=storage();let p=boot({local,session});complete(p,{mixed:true});const before=JSON.stringify(frozen(p)),id=p.el('completion-id').textContent,html=p.el('completion-content').innerHTML;
  p=boot({local,session});assert.equal(p.el('completion-summary').hidden,false);assert.equal(p.el('completion-id').textContent,id);assert.equal(p.el('completion-content').innerHTML,html);assert.equal(JSON.stringify(frozen(p)),before);assert.equal(p.run('records.list().length'),1);
  p.run("records.append(lesson.id,'hint',{task:'what.answer'});records.restart(lesson.id);records.checkpoint(lesson.id,freshState(),0,'guided');");assert.equal(JSON.stringify(frozen(p)),before);
 });
 await test('practice again resets all answers/summary/copy status and retains old archive; unit is retained',async()=>{
  const p=boot();p.el('lesson').value='paper-tray';p.el('lesson').onchange();complete(p);
  const id=p.el('completion-id').textContent,oldRound=p.session.getItem(POINTER),saved=p.local.getItem(PREFIX+oldRound+':completion');await p.el('copy-number').onclick();
  p.el('practice-again').onclick();assert.notEqual(p.session.getItem(POINTER),oldRound);assert.equal(p.el('completion-id').textContent,'');assert.equal(p.el('completion-summary').hidden,true);assert.equal(p.el('practice-workspace').hidden,false);assert.equal(p.run('lesson.id'),'paper-tray');
  for(const code of ['state.what.choice','state.why.choice','state.how.choice','state.retell'])assert.equal(p.run(code),'');assert.equal(p.run('state.points'),0);assert.equal(p.run('records.current(lesson.id).events.length'),0);assert.equal(p.el('completion-copy-status').textContent,'');assert.equal(p.local.getItem(PREFIX+oldRound+':completion'),saved);
  complete(p);assert.notEqual(p.el('completion-id').textContent,id);assert.equal(p.local.getItem(PREFIX+oldRound+':completion'),saved);
 });
 await test('existing legacy data and old anonymous data are untouched; new tab is isolated',()=>{
  const local=storage();local.setItem('reading-steps:records:v1','DO NOT MODIFY LEGACY');local.setItem('reading-steps:anonymous-current:v1','DO NOT MODIFY PRIOR FLOW');const session=storage(),p=boot({local,session});complete(p);const other=boot({local,session:storage()});assert.equal(other.el('completion-summary').hidden,true);assert.equal(other.run('records.current(lesson.id).events.length'),0);
  assert.equal(local.getItem('reading-steps:records:v1'),'DO NOT MODIFY LEGACY');assert.equal(local.getItem('reading-steps:anonymous-current:v1'),'DO NOT MODIFY PRIOR FLOW');assert.notEqual(other.session.getItem(POINTER),session.getItem(POINTER));
 });
 await test('read/session/quota failures keep usable summary, explicit warning, and prevent unsafe new round',async()=>{
  for(const failure of ['local-read','session-read','local-write','session-write']){
   const local=storage(),session=storage();if(failure==='local-read')local.failRead=true;if(failure==='session-read')session.failRead=true;if(failure==='local-write')local.failWrite=true;if(failure==='session-write')session.failWrite=true;
   const p=boot({local,session});complete(p);assert.equal(p.el('completion-summary').hidden,false);assert.equal(p.el('practice-storage').hidden,false);assert.ok(p.el('practice-storage').textContent.length>20);const id=p.el('completion-id').textContent;
   await p.el('copy-summary').onclick();assert.ok(p.copied[0].includes(id));p.el('practice-again').onclick();assert.equal(p.el('completion-id').textContent,id);assert.equal(p.el('completion-summary').hidden,false);
  }
 });
 await test('mid-completion quota failure keeps frozen in-memory summary and honest warning',()=>{
  const p=boot();p.local.failWrite=true;complete(p);assert.equal(p.el('completion-summary').hidden,false);assert.equal(p.el('practice-storage').hidden,false);assert.ok(p.el('completion-id').textContent.startsWith('RS-'));const id=p.el('completion-id').textContent;p.el('practice-again').onclick();assert.equal(p.el('completion-id').textContent,id);
 });
 await test('corrupt pointer/archive not overwritten; memory practice available with warning',()=>{
  for(const raw of ['invalid-pointer','broken-archive']){const local=storage(),session=storage();if(raw==='invalid-pointer')session.setItem(POINTER,'BROKEN');else{session.setItem(POINTER,'a'.repeat(32));local.setItem(PREFIX+'a'.repeat(32)+':completion','BROKEN JSON');}
   const beforeLocal=JSON.stringify([...local.data]),beforeSession=JSON.stringify([...session.data]),p=boot({local,session});assert.equal(p.el('practice-workspace').hidden,false);complete(p);assert.equal(p.el('practice-storage').hidden,false);assert.equal(JSON.stringify([...local.data]),beforeLocal);assert.equal(JSON.stringify([...session.data]),beforeSession);assert.equal(p.el('completion-summary').hidden,false);
  }
 });
 await test('corrupt structured completion is reported without destroying its archive',()=>{
  const local=storage(),session=storage(),p=boot({local,session});complete(p);const key=PREFIX+session.getItem(POINTER)+':completion',raw=JSON.parse(local.getItem(key));Object.values(raw.completed)[0].report.summary={};local.setItem(key,JSON.stringify(raw));const before=local.getItem(key),q=boot({local,session});assert.equal(q.el('practice-storage').hidden,false);assert.equal(local.getItem(key),before);assert.equal(q.el('practice-workspace').hidden,false);
 });
 await test('clipboard failure offers manual selection; late clipboard completion cannot mix new round',async()=>{
  const p=boot({clipboardFailure:true});complete(p);await p.el('copy-number').onclick();assert.equal(p.el('completion-copy-fallback').hidden,false);assert.equal(p.el('completion-copy-fallback').value,p.el('completion-id').textContent);p.el('practice-again').onclick();assert.equal(p.el('completion-copy-fallback').value,'');assert.equal(p.el('completion-copy-fallback').hidden,true);
  const q=boot();complete(q);const promise=q.el('copy-summary').onclick();q.el('practice-again').onclick();await promise;assert.equal(q.el('completion-copy-status').textContent,'');
 });
 await test('optional existing questions remain before final self-check and enter frozen summary',()=>{
  const p=boot();p.el('lesson').value='paper-tray';p.el('lesson').onchange();complete(p,{finish:false});assert.equal(p.run('supplementEligible()'),true);p.el('supplement-start').onclick();p.el('supplement-read-yes').onclick();p.run('supplementChoice=activeSupplement().answer');p.el('supplement-check').onclick();p.el('supplement-later').onclick();p.run('handlePrimary()');assert.match(p.el('completion-content').innerHTML,/correct answer about the meaning of &quot;blank&quot;/);assert.equal(p.el('completion-summary').hidden,false);
 });
 await test('unavailable secure randomness cannot silently generate an unreliable number',()=>{
  const p=boot({randomFailure:true});complete(p);assert.equal(p.el('completion-summary').hidden,false);assert.equal(p.el('completion-id').textContent,'ID unavailable');assert.equal(p.el('copy-number').disabled,true);assert.equal(p.el('practice-storage').hidden,false);assert.equal(p.local.data.size,0);
 });
 await test('English page/copy share exactly the same summary; no code IDs or unmeasured claims',async()=>{
  const p=boot();complete(p);const f=Object.values(frozen(p).completed)[0];await p.el('copy-summary').onclick();
  const decode=html=>html.replace(/<li>/g,'• ').replace(/<[^>]+>/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  assert.equal(decode(p.el('completion-content').innerHTML),p.copied[0].replace(/\s+/g,' ').trim());
  assert.ok(p.copied[0].includes('No specific difficulty was identified in this practice. Try a new passage to check your understanding.'));
  assert.ok(!/[\u3400-\u9fff]/.test(p.copied[0]));
  for(const value of [f.report.attemptId,f.report.rulesVersion,f.report.contentVersion,f.report.mappingVersion,...f.report.rows.flatMap(row=>[row.questionId,...row.evidenceIds])])assert.ok(!p.copied[0].includes(value),'internal ID hidden: '+value);
  assert.ok(!/eventId|rulesVersion|questionId|independen|prediction|fluency|vocabulary ability/i.test(p.copied[0]));
  const entry=fs.readFileSync('index.html','utf8');for(const label of ['Copy Summary','Copy Practice ID','Practise Again'])assert.ok(entry.includes('>'+label+'</button>'));
 });
 await test('first correct with hint/example is not described as independent or as a retry',()=>{
  for(const kind of ['hint','example']){
   const p=boot();p.run("records.append(lesson.id,'"+kind+"',{task:'what.answer'});");complete(p);const f=Object.values(frozen(p).completed)[0],html=p.el('completion-content').innerHTML;
   assert.equal(f.report.firstCorrect,6);assert.equal(f.report.firstWithoutHelp,5);assert.match(html,/You chose the correct main idea on your first try, with support/);assert.ok(!html.includes('after trying again'));
   assert.match(html,new RegExp(kind==='hint'?'You used 1 on-page hint':'You used 1 example'));assert.ok(!/independen/i.test(html));assert.ok(!html.includes('No specific difficulty was identified'));
  }
 });
 await test('retry and retry-with-hint remain distinct, without diagnosing a difficulty',()=>{
  for(const hint of [false,true]){
   const p=boot();p.run("show(FLOW.findIndex(s=>s.key==='what'&&s.phase==='answer'));state.what.choice=getQuestion('what').options.find(o=>o.id!==getQuestion('what').answerId).id;handlePrimary();");
   if(hint)p.run("records.append(lesson.id,'hint',{task:'what.answer'});");complete(p);
   const f=Object.values(frozen(p).completed)[0],html=p.el('completion-content').innerHTML;assert.equal(f.report.firstCorrect,5);assert.equal(f.report.finalCorrect,6);
   assert.ok(html.includes(hint?'You chose the correct main idea after trying again, with support.':'You chose the correct main idea after trying again.'));
   assert.equal(html.includes('You used 1 on-page hint'),hint);assert.ok(!/independen/i.test(html));
  }
 });
 await test('English presentation leaves old frozen report/number unchanged and does not assess unopened extras',async()=>{
  const local=storage(),session=storage(),p=boot({local,session});p.el('lesson').value='paper-tray';p.el('lesson').onchange();complete(p);
  const before=JSON.stringify(frozen(p)),id=p.el('completion-id').textContent,q=boot({local,session});await q.el('copy-summary').onclick();assert.equal(JSON.stringify(frozen(q)),before);assert.equal(q.el('completion-id').textContent,id);assert.ok(!q.copied[0].includes('extra question'));assert.ok(!/[\u3400-\u9fff]/.test(q.copied[0]));
 });
 await test('all four passages use English task descriptions and known limits on help',()=>{
  for(const unit of ['garden-sign','book-cart','paper-tray','rain-path']){
   const p=boot();p.el('lesson').value=unit;p.el('lesson').onchange();complete(p);const f=Object.values(frozen(p).completed)[0];assert.equal(f.report.firstCorrect,6);assert.equal(f.report.finalCorrect,6);assert.ok(!/[\u3400-\u9fff]/.test(p.el('completion-content').innerHTML));
  }
  const local=storage(),session=storage(),p=boot({local,session});complete(p);const raw=frozen(p);Object.values(raw.completed)[0].report.rows[0].first.withHelp=null;local.setItem(PREFIX+session.getItem(POINTER)+':completion',JSON.stringify(raw));const q=boot({local,session});assert.match(q.el('completion-content').innerHTML,/Help use is not known for some of your answers/);assert.ok(!/independen/i.test(q.el('completion-content').innerHTML));
 });
 await test('observed extra-question retry is described without changing the six-question scores',()=>{
  const p=boot();p.el('lesson').value='paper-tray';p.el('lesson').onchange();complete(p,{finish:false});p.el('supplement-start').onclick();p.el('supplement-read-yes').onclick();p.run('supplementChoice=activeSupplement().options.find(o=>o.id!==activeSupplement().answer).id');p.el('supplement-check').onclick();p.el('supplement-hint').onclick();p.el('supplement-retry').onclick();p.run('supplementChoice=activeSupplement().answer');p.el('supplement-check').onclick();p.el('supplement-later').onclick();p.run('handlePrimary()');
  const f=Object.values(frozen(p).completed)[0],html=p.el('completion-content').innerHTML;assert.equal(f.report.firstCorrect,6);assert.equal(f.report.finalCorrect,6);assert.equal(f.report.required,6);assert.match(html,/in the extra question after trying again, with a hint/);assert.ok(!html.includes('No specific difficulty was identified'));assert.ok(!html.includes('P-V1'));assert.ok(!/independen/i.test(html));
 });
 await test('help outside a scored question is visible without claiming an unmeasured difficulty',()=>{
  const p=boot();p.run("records.append(lesson.id,'hint',{scope:'read'});");complete(p);assert.match(p.el('completion-content').innerHTML,/You opened 1 on-page hint in this practice/);assert.ok(p.el('completion-content').innerHTML.includes('No specific difficulty was identified in this practice. Try a new passage to check your understanding.'));assert.ok(!/independen/i.test(p.el('completion-content').innerHTML));
 });
 console.log(groups+' Pages practice groups passed. DOM/storage/clipboard substitutes only; no real browser or network.');
})().catch(error=>{console.error(error);process.exitCode=1;});
