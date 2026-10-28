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
for(const file of ['index.html','styles.css','lessons.js','rewards.js','app.js']){const contents=fs.readFileSync(file,'utf8');if(file!=='index.html')assert.ok(!/[\u3400-\u9fff]/.test(contents),file+' course content is English');assert.ok(!/https?:\/\/|fetch\s*\(|XMLHttpRequest|document\.cookie|navigator\.mediaDevices/.test(contents),file+' no external requests or media capture');}
const badges=vm.runInNewContext(fs.readFileSync('rewards.js','utf8')+'\nPRACTICE_BADGES;');
for(const lesson of lessons){assert.ok(badges[lesson.id]?.name);assert.ok(badges[lesson.id]?.icon);}
unique(lessons.map(lesson=>badges[lesson.id].name),'badge names');
console.log('All data and static privacy checks passed. These are not browser or teaching-effectiveness tests.');

for(const file of ['reading-records.js','practice-completion.js']){const source=fs.readFileSync(file,'utf8');assert.ok(!/https?:\/\/|fetch\s*\(|XMLHttpRequest|navigator\.mediaDevices|sendBeacon|WebSocket/.test(source),file+' local only');}

// Validate the deployable entry's actual dependency closure, not optional local previews.
const entry=fs.readFileSync('index.html','utf8');
const scripts=[...entry.matchAll(/<script defer src="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(scripts,['lessons.js','rewards.js','reading-records.js','practice-completion.js','app.js']);
for(const asset of [...scripts,'styles.css'])assert.ok(fs.existsSync(asset),'missing Pages asset '+asset);
const completion=fs.readFileSync('practice-completion.js','utf8');
assert.ok(!/google\.script|\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|removeItem|\.clear\s*\(/.test(completion),'no upload transport or storage clearing');
assert.ok(!/reading-report\.js|report\.html/.test(entry),'standalone summary has no preview-page dependency');
console.log('Pages dependency closure and offline completion checks passed.');
