'use strict';
// Run with: node validate.js. No dependencies, network, or storage.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const lessons=vm.runInNewContext(fs.readFileSync('lessons.js','utf8')+'\nLESSONS;');
const unique=(items,label)=>assert.equal(new Set(items).size,items.length,label);
assert.equal(lessons.length,4);unique(lessons.map(l=>l.id),'lesson IDs');
assert.equal(lessons.filter(l=>l.type==='Fiction').length,2);
assert.equal(lessons.filter(l=>l.type==='Informational Text').length,2);
for(const l of lessons){
 for(const key of ['id','type','title','sentences','keySentence','whatQuestion','whyQuestion','howQuestion','teacherModel','retellPrompt','frames','teacherReference','selfCheck'])assert.ok(l[key],`${l.id}: ${key}`);
 const ids=l.sentences.map(s=>s.id);unique(ids,l.id+' sentence IDs');l.sentences.forEach(s=>assert.ok(s.text));assert.ok(ids.includes(l.keySentence.sentenceId));assert.ok(l.keySentence.about&&l.keySentence.tells);
 const count=l.sentences.map(s=>s.text).join(' ').match(/\b[A-Za-z]+(?:[’'-][A-Za-z]+)*\b/g).length;assert.ok(count>=70&&count<=110,`${l.id}: ${count} words`);
 for(const key of ['what','why','how']){const q=l[key+'Question'];assert.ok(q.prompt&&q.hint&&q.evidenceHint&&q.evidenceTask&&q.example);assert.equal(q.options.length,3);unique(q.options.map(o=>o.id),l.id+' '+key+' option IDs');assert.ok(q.options.some(o=>o.id===q.answerId));q.options.forEach(o=>assert.ok(o.text&&o.feedback));unique(q.evidenceIds,l.id+' '+key+' evidence IDs');assert.ok(q.evidenceIds.length>0&&q.evidenceIds.length<ids.length);q.evidenceIds.forEach(id=>assert.ok(ids.includes(id)));assert.ok(l.teacherModel[key]);}
 assert.equal(l.selfCheck.length,4);console.log(`${l.title}: ${count} words; data checks passed`);
}
assert.ok(new Set(lessons.map(l=>l.whatQuestion.answerId)).size>=3);
for(const file of ['index.html','styles.css','lessons.js','rewards.js','app.js']){const contents=fs.readFileSync(file,'utf8');assert.ok(!/[\u3400-\u9fff]/.test(contents),file+' student content is English');assert.ok(!/https?:\/\/|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|navigator\.mediaDevices/.test(contents),file+' no external requests or persistent answer storage');}
const badges=vm.runInNewContext(fs.readFileSync('rewards.js','utf8')+'\nPRACTICE_BADGES;');
for(const lesson of lessons){assert.ok(badges[lesson.id]?.name);assert.ok(badges[lesson.id]?.icon);}
unique(lessons.map(lesson=>badges[lesson.id].name),'badge names');
console.log('All data and static privacy checks passed. These are not browser or teaching-effectiveness tests.');
