'use strict';
// Executes real event handlers against a small DOM substitute, not a browser.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
class Element {
 constructor(){this.value='';this.hidden=false;this.disabled=false;this.style={};this.textContent='';this.nodes=[];this.dataset={};this.open=false;}
 set innerHTML(html){
  this.html=html;this.nodes=[];
  for(const match of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/g)){
   const attrs=match[2],node=new Element(),attr=name=>attrs.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"'))?.[1];
   node.id=attr('id');node.value=attr('value')||'';node.name=attr('name');node.className=attr('class')||'';
   node.checked=/\bchecked\b/.test(attrs);node.disabled=/\bdisabled\b/.test(attrs);node.hidden=/\bhidden\b/.test(attrs);
   for(const name of ['stage','check','selection'])if(attr('data-'+name)!==undefined)node.dataset[name]=attr('data-'+name);
   if(node.id)elements.set(node.id,node);
   this.nodes.push({tag:match[1],node});
  }
 }
 get innerHTML(){return this.html||'';}
 querySelectorAll(selector){const name=selector.match(/^\[name="([^"]+)"\]$/)?.[1],data=selector.match(/^\[data-([^\]]+)\]$/)?.[1];return this.nodes.filter(({tag,node})=>name?node.name===name:data?node.dataset[data]!==undefined:tag===selector).map(x=>x.node);}
 setAttribute(name,value){this[name]=value;}focus(){this.focused=true;}scrollIntoView(){this.scrolled=true;}
}
const document={getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id);}};
let confirmations=[],confirmationResult=true;
const media={matches:false,addEventListener(name,callback){this.callback=callback;}};
const motion={matches:false,addEventListener(name,callback){this.callback=callback;}};
let timerSerial=0;const timers=new Map(),timerCallbacks=new Map();
const setTimeoutFake=callback=>{const id=++timerSerial;timers.set(id,callback);timerCallbacks.set(id,callback);return id;};
const clearTimeoutFake=id=>timers.delete(id);
const flushTimers=()=>{for(const callback of [...timers.values()])callback();};
const context=vm.createContext({document,setTimeout:setTimeoutFake,clearTimeout:clearTimeoutFake,window:{matchMedia:query=>query.includes('reduced-motion')?motion:media},confirm:message=>{confirmations.push(message);return confirmationResult;}});
vm.runInContext(fs.readFileSync('lessons.js','utf8')+'\n'+fs.readFileSync('rewards.js','utf8')+'\n'+fs.readFileSync('app.js','utf8'),context);
const run=code=>vm.runInContext(code,context),el=id=>document.getElementById(id);
const click=id=>{const node=el(id);assert.equal(node.disabled,false,`${id} must be enabled`);assert.equal(typeof node.onclick,'function',`${id} handler exists`);node.onclick();};
const phase=()=>run('current().phase');
const go=(key,screen='answer')=>run(`show(FLOW.findIndex(item=>item.key===${JSON.stringify(key)}&&item.phase===${JSON.stringify(screen)}));`);
const selectAnswer=id=>{const input=el('task').querySelectorAll('[name="answer"]').find(input=>input.value===id);assert.ok(input);input.onchange();};
const selectEvidence=(id,checked=true)=>{const input=el('passage').querySelectorAll('[name="evidence"]').find(input=>input.value===id);assert.ok(input);input.checked=checked;input.onchange();};
const changeMode=value=>{el('mode').value=value;el('mode').onchange();};
const changeLesson=id=>{el('lesson').value=id;el('lesson').onchange();};
const assertCard=()=>{
 assert.equal(el('task').querySelectorAll('button').filter(button=>button.className==='primary').length,1,'one primary action');
 assert.ok(!(el('task').querySelectorAll('[name="answer"]').length&&el('task').querySelectorAll('textarea').length),'no choices with free input');
 assert.equal(el('task').querySelectorAll('[name="evidence"]').length,0,'no passage duplicated as evidence options on right');
 assert.ok(!/\b[gbpr]\d+\b/.test(el('task').innerHTML),'internal sentence IDs not visible in task');
};
assert.equal(run('mode'),'guided');assert.equal(phase(),'read');assert.equal(run('TOTAL_TASKS'),9);assertCard();
click('primary');assert.equal(phase(),'answer');assert.equal(run('current().key'),'what');assert.ok(!el('task').innerHTML.includes('A Hint for This Task'));assert.equal(el('passage').querySelectorAll('[name="evidence"]').length,0);
click('primary');assert.match(el('inline-message').textContent,/Choose an answer/);assert.equal(phase(),'answer');assert.equal(run('state.what.attempted'),false);
selectAnswer('a');click('primary');assert.equal(phase(),'answer-feedback');assert.equal(run('current().task'),2);assert.equal(el('task').querySelectorAll('[name="answer"]').length,0);assert.match(el('task').innerHTML,/only one action/);assert.ok(!el('task').innerHTML.includes('Maya used a sign to help protect a new garden.'));assert.equal(run('state.what.correct'),false);
click('primary');assert.equal(phase(),'answer');assert.equal(run('state.what.choice'),'a');selectAnswer('b');click('primary');assert.equal(phase(),'answer-feedback');assert.equal(run('state.what.correct'),true);click('primary');assert.equal(phase(),'evidence');assert.equal(run('current().task'),3);assert.equal(el('passage').querySelectorAll('[name="evidence"]').length,7);assert.match(el('task').innerHTML,/Choose 3 sentences/);assert.match(el('task').innerHTML,/Maya used a sign/);
click('primary');assert.match(el('inline-message').textContent,/Choose a sentence/);assert.equal(phase(),'evidence');
selectEvidence('g2');click('primary');assert.equal(phase(),'evidence-feedback');assert.match(el('task').innerHTML,/do not directly support/);assert.match(el('task').innerHTML,/still missing/);assert.equal(el('passage').querySelectorAll('[name="evidence"]').length,0);click('primary');assert.equal(phase(),'evidence');selectEvidence('g2',false);selectEvidence('g1');click('primary');assert.match(el('task').innerHTML,/still missing/);assert.ok(!el('task').innerHTML.includes('do not directly support'));click('primary');
click('view');assert.equal(run('single'),true);assert.equal(el('passage').querySelectorAll('[name="evidence"]')[0].value,'g1');assert.equal(el('passage').querySelectorAll('[name="evidence"]')[0].checked,true);click('next-sentence');assert.equal(el('position').textContent,'Sentence 2 of 7');click('next-sentence');click('next-sentence');selectEvidence('g4');click('next-sentence');click('next-sentence');selectEvidence('g6');assert.equal(el('evidence-selection').textContent,'Selected sentences: 1, 4, 6.');click('view');assert.equal(el('passage').querySelectorAll('[name="evidence"]').filter(input=>input.checked).length,3);assert.equal(run('sentenceNumber("g4")'),4);
click('primary');assert.equal(phase(),'evidence-feedback');assert.equal(run('status("what")'),'Completed independently');click('primary');assert.equal(run('current().key'),'why');assert.equal(phase(),'answer');click('back');assert.equal(phase(),'evidence-feedback');click('back');assert.equal(phase(),'evidence');assert.equal(run('state.what.selected.length'),3);
// Progressive help is separate from choices; examples preserve an assisted history.
go('what');click('hint');assert.equal(run('helpLevel'),1);assert.equal(el('task').querySelectorAll('[name="answer"]').length,0);assert.ok(!el('task').innerHTML.includes('Show an Example'));click('more-help');click('example');assert.equal(run('status("what")'),'Example viewed · With help');assert.match(el('task').innerHTML,/One Example/);click('primary');assert.equal(phase(),'answer');assert.equal(run('helpLevel'),0);
click('hint');click('words');el('own-words').oninput({target:{value:'Maya helped the plants.'}});click('primary');assert.equal(run('state.what.text'),'Maya helped the plants.');click('back');click('primary');assert.equal(run('state.what.text'),'Maya helped the plants.');
changeMode('independent');assert.equal(phase(),'answer');assert.equal(run('helpLevel'),0);assert.equal(run('status("what")'),'Example viewed · With help');assert.ok(!el('task').innerHTML.includes('One Example'));click('hint');assert.match(el('task').innerHTML,/Think about the problem/);click('primary');
changeMode('teacher');assert.match(el('task').innerHTML,/Teacher demonstration/);assert.equal(el('task').querySelectorAll('[name="answer"]').length,0);click('primary');assert.equal(phase(),'answer-feedback');assert.ok(!/\bg\d+\b/.test(el('task').innerHTML));click('primary');assert.equal(phase(),'evidence');assert.equal(el('passage').querySelectorAll('[name="evidence"]').length,0);click('primary');click('primary');assert.equal(run('current().key'),'why');changeMode('guided');assert.equal(phase(),'answer');assert.equal(run('state.what.choice'),'');assert.equal(run('state.what.selected.length'),0);assert.equal(run('state.what.text'),'Maya helped the plants.');assert.equal(run('status("what")'),'Not checked');assert.equal(run('helpLevel'),0);
// Skipping is a teacher action and never writes correct flags.
go('what');click('skip');assert.equal(phase(),'evidence');assert.equal(run('state.what.correct'),false);assert.match(run('status("what")'),/Skipped/);click('skip');assert.equal(run('current().key'),'why');assert.equal(phase(),'answer');assert.equal(run('state.what.evidenceCorrect'),false);
// Evidence help can show numbers only after an attempt.
go('why');selectAnswer('a');click('primary');click('primary');selectEvidence('g1');click('primary');click('hint');click('more-help');click('example');assert.match(el('task').innerHTML,/Supporting sentences: 2/);assert.equal(run('state.why.evidenceExample'),true);click('primary');click('primary');selectEvidence('g1',false);selectEvidence('g2');click('primary');assert.match(run('status("why")'),/With help/);
// Teacher reference is hidden by default and viewing it records help.
assert.equal(el('teacher-reference').open,false);el('teacher-reference').open=true;el('teacher-reference').ontoggle();assert.equal(run('state.how.example'),true);changeMode('independent');assert.equal(el('teacher-reference').open,false);
run('show(FLOW.findIndex(item=>item.phase==="retell"));');el('retell').oninput({target:{value:'The sign helped the garden.'}});assert.equal(el('task').querySelectorAll('[data-check]').length,0);assert.ok(!el('task').innerHTML.includes('Teacher Reference'));click('hint');click('frames');assert.match(el('task').innerHTML,/The garden had a problem/);click('primary');click('hint');click('aloud');assert.match(el('task').innerHTML,/speak instead of writing/);click('primary');assert.equal(phase(),'self-check');click('back');click('primary');assert.equal(phase(),'self-check');assert.equal(el('task').querySelectorAll('textarea').length,0);const check=el('task').querySelectorAll('[data-check]')[0];check.checked=true;check.onchange();click('back');assert.equal(run('state.retell'),'The sign helped the garden.');click('primary');assert.equal(run('state.checks.length'),1);click('primary');assert.equal(phase(),'complete');assert.match(el('task').innerHTML,/does not mean every answer/);click('primary');assert.equal(phase(),'retell');
// Navigation, passage access, and settings preserve answers.
click('open-passage');assert.equal(el('reading-panel').open,true);assert.equal(el('passage-title').focused,true);assert.equal(phase(),'retell');click('return-task');assert.equal(el('task-title').focused,true);media.matches=true;media.callback();assert.equal(el('reading-panel').open,false);click('open-passage');assert.equal(el('reading-panel').open,true);media.matches=false;media.callback();assert.equal(el('reading-panel').open,true);
el('size').value='28';el('size').onchange();assert.equal(el('passage').style.fontSize,'28px');
confirmationResult=false;changeLesson('book-cart');assert.equal(run('lesson.id'),'garden-sign');assert.equal(el('lesson').value,'garden-sign');assert.equal(run('state.retell'),'The sign helped the garden.');confirmationResult=true;changeLesson('book-cart');assert.equal(run('lesson.id'),'book-cart');assert.equal(run('state.retell'),'');assert.equal(phase(),'read');assert.equal(run('helpLevel'),0);
run('state.retell="Keep this.";');confirmationResult=false;click('clear');assert.equal(run('state.retell'),'Keep this.');confirmationResult=true;click('clear');assert.equal(run('state.retell'),'');assert.equal(phase(),'read');assert.equal(run('single'),false);
// All lesson screens and modes render one primary action; ID mapping stays local.
for(const id of ['garden-sign','book-cart','paper-tray','rain-path']){
 changeLesson(id);
 for(const teachingMode of ['guided','independent','teacher']){
  changeMode(teachingMode);
  for(let index=0;index<run('FLOW.length');index++){run(`show(${index});`);assertCard();}
 }
 assert.equal(run('sentenceNumber(lesson.sentences[6].id)'),7);
 assert.ok(!/\b[gbpr]\d+\b/.test(el('passage').innerHTML));
}
// Execute the full normal route for every passage, not just render each screen.
for(const id of ['garden-sign','book-cart','paper-tray','rain-path']){
 changeLesson(id);changeMode('guided');click('clear');
 click('primary');
 for(const key of ['what','why','how']){
  assert.equal(run('current().key'),key);assert.equal(phase(),'answer');
  const answer=run(`getQuestion('${key}').answerId`);
  selectAnswer(answer);click('primary');assert.equal(phase(),'answer-feedback');
  click('primary');assert.equal(phase(),'evidence');
  click('hint');assert.equal(el('passage').querySelectorAll('[name="evidence"]').length,0,'help screen disables selection');click('primary');
  for(const id of run(`getQuestion('${key}').evidenceIds`))selectEvidence(id);
  click('primary');assert.equal(phase(),'evidence-feedback');assert.equal(run(`status('${key}')`),'Completed independently');
  click('primary');
 }
 assert.equal(phase(),'retell');el('retell').oninput({target:{value:'My own retelling.'}});click('primary');assert.equal(phase(),'self-check');click('primary');assert.equal(phase(),'complete');assert.equal(run('current().task'),9);
}
// All tasks may be skipped by the teacher without creating correct results.
click('clear');
while(phase()!=='complete')click('skip');
for(const key of ['what','why','how']){assert.equal(run(`state.${key}.correct`),false);assert.equal(run(`state.${key}.evidenceCorrect`),false);assert.match(run(`status('${key}')`),/Skipped/);}
click('clear');go('what');click('hint');click('more-help');assert.equal(el('example').disabled,true,'examples require an attempt');click('primary');
assert.ok(confirmations.length>=4);
// Reward regressions: all checks use the existing event handlers, never awardTask directly.
const points=()=>run('state.points');
function newPractice(id='garden-sign'){
 confirmationResult=true;motion.matches=false;motion.callback();changeLesson(id);changeMode('guided');click('clear');
 assert.equal(points(),0);assert.equal(run('state.badgeEarned'),false);assert.equal(timers.size,0);
}
function correctAnswer(key){go(key);selectAnswer(run(`getQuestion('${key}').answerId`));click('primary');}
function correctEvidence(key){go(key,'evidence');for(const id of run(`getQuestion('${key}').evidenceIds`))selectEvidence(id);click('primary');}
function exampleForCurrent(){click('hint');click('more-help');click('example');click('primary');}
function retellWriting(text='My own words.'){
 run('show(FLOW.findIndex(screen=>screen.phase==="retell"));');
 el('retell').oninput({target:{value:text}});click('primary');
}
function skipUnderstanding(){go('what');for(let index=0;index<6;index++)click('skip');assert.equal(phase(),'retell');}
newPractice();go('what');selectAnswer('b');assert.equal(points(),0,'selection alone earns nothing');click('primary');assert.equal(points(),10);assert.equal(timerSerial>0,true);assert.equal(timers.size,1);assert.match(el('task').innerHTML,/Nice work! \+10 points/);assert.match(el('task').innerHTML,/connects the garden problem/);assert.equal(el('practice-points').textContent,'Practice Points: 10');
const firstAwardTimer=timerSerial;click('back');click('primary');assert.equal(points(),10);assert.equal(timerSerial,firstAwardTimer,'repeated correct checks do not create confetti');assert.ok(!el('task').innerHTML.includes('+10 points'),'revisited feedback does not claim another award');
correctEvidence('what');assert.equal(points(),20);const evidenceTimer=timerSerial;click('back');click('primary');assert.equal(points(),20);assert.equal(timerSerial,evidenceTimer);assert.equal(timers.size,1,'rapid awards use a single animation/timer slot');
go('what');selectAnswer('a');click('primary');assert.equal(points(),20,'wrong answers do not subtract points');click('primary');selectAnswer('b');click('primary');assert.equal(points(),20,'reselecting an earned task never earns again');
exampleForCurrent();assert.equal(points(),20,'later example does not remove earned points');correctAnswer('what');assert.equal(points(),20);assert.equal(timerSerial,evidenceTimer);
flushTimers();assert.equal(timers.size,0);assert.equal(el('celebration').innerHTML,'');
newPractice();go('why');selectAnswer('b');click('primary');assert.equal(points(),0);click('primary');click('hint');click('primary');selectAnswer('a');click('primary');assert.equal(points(),10,'ordinary hints and retry allow full reward');
newPractice();go('what');selectAnswer('a');click('primary');exampleForCurrent();assert.equal(run('state.what.rewards.answer.revealed'),true);assert.equal(run('state.what.rewards.evidence.revealed'),false);click('primary');selectAnswer('b');click('primary');assert.equal(points(),0);assert.match(el('task').innerHTML,/You worked through this step. Keep going!/);correctEvidence('what');assert.equal(points(),10,'answer example does not mechanically block evidence points');
newPractice();correctAnswer('what');go('what','evidence');selectEvidence('g2');click('primary');exampleForCurrent();assert.equal(run('state.what.rewards.evidence.revealed'),true);assert.equal(run('state.what.rewards.answer.revealed'),false);click('primary');selectEvidence('g2',false);selectEvidence('g1');selectEvidence('g4');selectEvidence('g6');click('primary');assert.equal(points(),10);assert.match(el('task').innerHTML,/Keep going!/);
newPractice();el('sentence-explanation').open=true;el('sentence-explanation').ontoggle();assert.equal(run('state.why.rewards.answer.revealed'),true);assert.equal(run('state.why.rewards.evidence.revealed'),true,'a combined disclosure blocks both tasks');correctAnswer('why');correctEvidence('why');assert.equal(points(),0);
newPractice('paper-tray');el('sentence-explanation').open=true;el('sentence-explanation').ontoggle();assert.equal(run('state.why.rewards.answer.revealed'),true);assert.equal(run('state.why.rewards.evidence.revealed'),false,'this explanation does not give the complete two-sentence evidence answer');correctAnswer('why');correctEvidence('why');assert.equal(points(),10);
newPractice('rain-path');correctAnswer('what');go('what','evidence');click('hint');assert.equal(run('state.what.rewards.evidence.revealed'),false,'ordinary hints do not reveal the exact evidence pair');click('primary');selectEvidence('r1');selectEvidence('r7');click('primary');assert.equal(points(),20);
// Each passage reaches at most 60; completion needs separate submissions and adds no points.
for(const id of ['garden-sign','book-cart','paper-tray','rain-path']){
 newPractice(id);
 for(const key of ['what','why','how']){correctAnswer(key);correctEvidence(key);}
 assert.equal(points(),60);for(const key of ['what','why','how']){correctAnswer(key);correctEvidence(key);}assert.equal(points(),60);
 flushTimers();const beforeBadge=timerSerial;
 run('show(FLOW.findIndex(screen=>screen.phase==="retell"));');click('primary');assert.equal(phase(),'retell');assert.equal(run('state.retellSubmitted'),false,'blank writing is not submitted');
 el('retell').oninput({target:{value:'   '}});click('primary');assert.equal(phase(),'retell');
 el('retell').oninput({target:{value:'A retelling in my words.'}});assert.equal(run('state.retellSubmitted'),false);click('primary');assert.equal(phase(),'self-check');assert.equal(run('state.retellSubmitted'),true);assert.equal(run('state.badgeEarned'),false);assert.equal(run('state.selfCheckConfirmed'),false);
 click('primary');assert.equal(phase(),'complete');assert.equal(run('state.selfCheckConfirmed'),true);assert.equal(run('state.checks.length'),0,'children do not need to endorse every self-check');assert.equal(run('state.badgeEarned'),true);assert.equal(run('state.completionCelebrated'),true);assert.equal(points(),60,'badge adds no correct-answer points');assert.equal(timerSerial,beforeBadge+1);assert.match(el('task').innerHTML,/You earned a badge!/);assert.ok(el('task').innerHTML.includes(run('PRACTICE_BADGES[lesson.id].name')));
 run('show(FLOW.findIndex(screen=>screen.phase==="complete"));');assert.equal(timerSerial,beforeBadge+1,'returning to completion does not celebrate again');click('back');click('primary');assert.equal(timerSerial,beforeBadge+1);assert.equal(points(),60);assertCard();
}
newPractice();skipUnderstanding();assert.equal(points(),0);assert.equal(run('state.badgeEarned'),false);click('aloud');assert.equal(run('state.retellSubmitted'),false,'opening oral instructions is not submission');click('primary');assert.equal(phase(),'self-check');assert.equal(run('state.retellMethod'),'aloud');assert.equal(run('state.retellSubmitted'),true);assert.equal(run('state.badgeEarned'),false);click('primary');assert.equal(run('state.badgeEarned'),true,'teacher skips plus explicit oral and self-check qualify');assert.equal(points(),0);
newPractice();skipUnderstanding();retellWriting('x');assert.equal(phase(),'self-check');click('primary');assert.equal(run('state.badgeEarned'),true,'nonempty writing is accepted without quality or length grading');assert.equal(points(),0);
newPractice();run('show(FLOW.findIndex(screen=>screen.phase==="complete"));');assert.equal(run('state.badgeEarned'),false);assert.equal(timers.size,0,'direct completion navigation cannot award');
run('show(FLOW.findIndex(screen=>screen.phase==="self-check"));');click('primary');assert.equal(phase(),'self-check');assert.equal(run('state.selfCheckConfirmed'),false);
retellWriting();click('primary');assert.equal(phase(),'complete');assert.equal(run('state.badgeEarned'),false,'retelling alone cannot bypass unresolved comprehension tasks');
newPractice();go('what');selectAnswer('a');click('primary');exampleForCurrent();click('primary');selectAnswer('b');click('primary');for(let index=0;index<6;index++)click('skip');assert.equal(phase(),'retell');retellWriting();click('primary');assert.equal(run('state.badgeEarned'),true,'examples and skips do not prevent the completion badge');assert.equal(points(),0);
newPractice();changeMode('teacher');for(let index=0;index<run('FLOW.length');index++){run(`show(${index});`);if(phase()!=='complete')click('primary');}assert.equal(points(),0);assert.equal(run('state.badgeEarned'),false);assert.equal(run('state.retellSubmitted'),false);assert.equal(timers.size,0);
// Mode cancellation retains progress; accepted resets synchronously match reward records.
newPractice();correctAnswer('what');run('state.what.text="Keep my explanation.";');changeMode('independent');assert.equal(points(),10);assert.equal(run('state.what.rewards.answer.awarded'),true);changeMode('teacher');confirmationResult=false;changeMode('guided');assert.equal(run('mode'),'teacher');assert.equal(el('mode').value,'teacher');assert.equal(points(),10);assert.equal(run('state.what.rewards.answer.awarded'),true);assert.match(confirmations[confirmations.length-1],/points.*badge.*reset/);confirmationResult=true;changeMode('guided');assert.equal(points(),0);assert.equal(run('state.what.rewards.answer.awarded'),false);assert.equal(run('state.what.choice'),'');assert.equal(run('state.what.text'),'Keep my explanation.');assert.equal(run('state.badgeEarned'),false);assert.equal(timers.size,0);
// Reset callbacks cannot remove a new burst or mutate its practice state.
newPractice();correctAnswer('what');const oldCallback=timerCallbacks.get(timerSerial),oldAnimationEnd=el('celebration').onanimationend;click('clear');assert.equal(points(),0);assert.equal(timers.size,0);correctAnswer('why');const newBurst=el('celebration').innerHTML;oldCallback();oldAnimationEnd();assert.equal(points(),10);assert.equal(el('celebration').innerHTML,newBurst);assert.equal(timers.size,1);el('celebration').onanimationend();assert.equal(el('celebration').innerHTML,'');assert.equal(timers.size,0,'animationend clears fallback timer');
correctEvidence('why');const callbackBeforeChange=timerCallbacks.get(timerSerial);confirmationResult=false;changeLesson('book-cart');assert.equal(points(),20);assert.equal(run('lesson.id'),'garden-sign');confirmationResult=true;changeLesson('book-cart');assert.equal(points(),0);assert.equal(run('state.badgeEarned'),false);assert.equal(run('state.retellSubmitted'),false);assert.equal(run('state.selfCheckConfirmed'),false);assert.equal(timers.size,0);callbackBeforeChange();assert.equal(points(),0);assert.equal(el('celebration').innerHTML,'');
// Preference changes are live. Reduced motion retains text/points/badge without a timer.
newPractice();motion.matches=true;motion.callback();const beforeReduced=timerSerial;correctAnswer('what');assert.equal(points(),10);assert.equal(timerSerial,beforeReduced);assert.equal(timers.size,0);assert.match(el('task').innerHTML,/Nice work!/);motion.matches=false;motion.callback();correctEvidence('what');assert.equal(timers.size,1);motion.matches=true;motion.callback();assert.equal(timers.size,0);assert.equal(el('celebration').innerHTML,'');go('why');click('skip');click('skip');click('skip');click('skip');retellWriting();const beforeStaticBadge=timerSerial;click('primary');assert.equal(run('state.badgeEarned'),true);assert.equal(timerSerial,beforeStaticBadge);assert.equal(timers.size,0);assert.match(el('task').innerHTML,/Garden Care/);
// Clearing after a badge clears every reward/completion field, not student preferences.
click('clear');assert.equal(points(),0);for(const key of ['what','why','how'])for(const task of ['answer','evidence']){assert.equal(run(`state.${key}.rewards.${task}.awarded`),false);assert.equal(run(`state.${key}.rewards.${task}.revealed`),false);assert.equal(run(`state.${key}.rewards.${task}.done`),false);}assert.equal(run('state.retellSubmitted'),false);assert.equal(run('state.selfCheckConfirmed'),false);assert.equal(run('state.badgeEarned'),false);assert.equal(run('state.completionCelebrated'),false);
newPractice();go('what');click('hint');click('words');el('own-words').oninput({target:{value:'Any wording is welcome.'}});click('primary');assert.equal(points(),0,'free short answers are never scored');el('close-about').oninput({target:{value:'My own explanation.'}});assert.equal(points(),0);
newPractice();skipUnderstanding();click('aloud');click('primary');assert.equal(run('state.retellMethod'),'aloud');click('back');assert.equal(run('state.retell'),'');click('primary');assert.equal(phase(),'self-check','confirmed oral retelling survives Back without needing written text');assert.equal(run('state.retellMethod'),'aloud');click('primary');assert.equal(run('state.badgeEarned'),true);assert.equal(points(),0);
console.log('All flow and reward state checks passed: six one-time point tasks, disclosure scopes, retries/hints, 60-point cap, written/oral submission, explicit self-check, badges, skips, modes, resets, reduced motion and stale animation callbacks. DOM/timer substitutes only; real browser/assistive-technology validation remains required.');
