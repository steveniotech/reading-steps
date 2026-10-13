'use strict';
const $ = id => document.getElementById(id);
const names = ['Read', 'What', 'Why', 'How', 'Put It Together'];
const keys = ['what', 'why', 'how'];
// Feedback screens share their preceding task number; they are not extra tasks.
const FLOW = [{stage:0, phase:'read', task:1}];
keys.forEach((key,index) => {
 const task=2+index*2;
 FLOW.push({stage:index+1,key,phase:'answer',task}, {stage:index+1,key,phase:'answer-feedback',task},
  {stage:index+1,key,phase:'evidence',task:task+1}, {stage:index+1,key,phase:'evidence-feedback',task:task+1});
});
const retellTask=FLOW[FLOW.length-1].task+1;
FLOW.push({stage:4,phase:'retell',task:retellTask}, {stage:4,phase:'self-check',task:retellTask+1}, {stage:4,phase:'complete',task:retellTask+1});
const TOTAL_TASKS = FLOW.filter(screen=>!screen.phase.endsWith('feedback')&&screen.phase!=='complete').length;
let lesson=LESSONS[0], mode='guided', position=0, single=false, sentenceIndex=0, helpLevel=0, overlay=null;
const freshReward = () => ({awarded:false,revealed:false,done:false,skipped:false});
const freshQuestion = () => ({rewards:{answer:freshReward(),evidence:freshReward()},choice:'',selected:[],attempted:false,evidenceAttempted:false,correct:false,evidenceCorrect:false,example:false,evidenceExample:false,skipped:false,feedback:'',evidenceFeedback:'',text:''});
const freshState = () => ({what:freshQuestion(),why:freshQuestion(),how:freshQuestion(),points:0,retellSubmitted:false,retellMethod:null,selfCheckConfirmed:false,badgeEarned:false,completionCelebrated:false,retell:'',checks:[],closeAbout:'',closeTells:''});
let state=freshState(), rewardNotice=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const celebrations=createCelebrationController($('celebration'),reducedMotion);
function markRevealed(key,tasks){
 if(mode==='teacher')return;
 tasks.forEach(task=>{state[key].rewards[task].revealed=true;if(task==='answer')state[key].example=true;else state[key].evidenceExample=true;});
}
function awardTask(key,task){
 const reward=state[key].rewards[task];
 if(mode==='teacher')return null;
 reward.done=true;
 if(reward.awarded)return null;
 if(reward.revealed)return {key,task,added:false,text:'You worked through this step. Keep going!'};
 reward.awarded=true;state.points+=10;
 return {key,task,added:true,text:'Nice work! +10 points'};
}
function feedbackReward(key,task){
 if(!rewardNotice||rewardNotice.key!==key||rewardNotice.task!==task)return '';
 return `<span class="reward-message">${e(rewardNotice.text)}${rewardNotice.added?`<span class="sr-only">. Practice Points: ${state.points}.</span>`:''}</span>`;
}
function finishBadge(){
 if(mode==='teacher'||state.badgeEarned||!state.retellSubmitted||!state.selfCheckConfirmed||!keys.every(key=>['answer','evidence'].every(task=>state[key].rewards[task].done)))return false;
 state.badgeEarned=true;return true;
}
function submitRetelling(method){
 state.retellSubmitted=true;state.retellMethod=method;state.selfCheckConfirmed=false;
}
function invalidateRetelling(){state.retellSubmitted=false;state.retellMethod=null;state.selfCheckConfirmed=false;}
function hasResettableProgress(){return state.points||state.retellSubmitted||state.selfCheckConfirmed||state.badgeEarned||keys.some(key=>{const s=state[key];return s.choice||s.selected.length||s.attempted||s.evidenceAttempted||s.example||s.evidenceExample||s.skipped;});}

const e = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const current = () => FLOW[position];
const getQuestion = key => lesson[key+'Question'];
const sentenceNumber = id => lesson.sentences.findIndex(sentence=>sentence.id===id)+1;
const sentenceNumbers = ids => ids.map(sentenceNumber).sort((a,b)=>a-b).join(', ');
const displayIds = text => text.replace(/\b[gbpr]\d+\b/g,id=>`sentence ${sentenceNumber(id)}`);
const shortFeedback = text => (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text]).slice(0,2).join('').trim();
function hasWork(){return state.points||state.retellSubmitted||state.selfCheckConfirmed||state.badgeEarned||state.retell||state.closeAbout||state.closeTells||state.checks.length||keys.some(key=>{const s=state[key];return s.choice||s.selected.length||s.text||s.attempted||s.evidenceAttempted||s.example||s.evidenceExample||s.skipped;});}
function status(key){const s=state[key];if(s.example||s.evidenceExample)return 'Example viewed · With help';if(s.skipped)return 'Skipped · Not completed independently';if(s.correct&&s.evidenceCorrect)return 'Completed independently';if(s.attempted||s.evidenceAttempted||s.choice||s.selected.length)return 'In progress';return 'Not checked';}
function focusTask(){$('task-title').focus();}
function resetHelp(){helpLevel=0;overlay=null;rewardNotice=null;}
function show(next,notice=null){position=Math.max(0,Math.min(FLOW.length-1,next));resetHelp();rewardNotice=notice;renderAll();focusTask();if(notice?.added)celebrations.play();}
function renderSettings(){
 $('steps').innerHTML=names.map((name,stage)=>`<button data-stage="${stage}" ${current().stage===stage?'aria-current="step"':''}>${e(name)}</button>`).join('');
 $('steps').querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>{show(FLOW.findIndex(screen=>screen.stage===Number(button.dataset.stage)));$('teacher-settings').open=false;});
 $('teacher-status').innerHTML=`<ul class="teacher-list">${keys.map(key=>`<li>${key[0].toUpperCase()+key.slice(1)}: ${mode==='teacher'?'Teacher demonstration':e(status(key))}</li>`).join('')}</ul>`;
 $('skip').disabled=current().phase==='complete';
}
function evidenceActive(){return mode!=='teacher'&&current().phase==='evidence'&&!overlay&&helpLevel===0;}
function selectedSummary(){const selected=state[current().key]?.selected||[];$('evidence-selection').textContent=selected.length?`Selected sentences: ${sentenceNumbers(selected)}.`:'No sentences selected yet.';}
function renderPassage(){
 $('kind').textContent=lesson.type;$('passage-title').textContent=lesson.title;
 const active=evidenceActive(),selected=state[current().key]?.selected||[];
 $('passage').innerHTML=(single?[lesson.sentences[sentenceIndex]]:lesson.sentences).map(sentence=>{
  const number=sentenceNumber(sentence.id);
  if(!active)return `<p class="sentence"><span class="sentence-number">${number}${single?' · Current sentence':''}</span>${e(sentence.text)}</p>`;
  const checked=selected.includes(sentence.id);
  return `<label class="sentence-choice"><input type="checkbox" name="evidence" value="${e(sentence.id)}" aria-label="Select sentence ${number}" ${checked?'checked':''}><span><span class="sentence-number">${number}</span>${e(sentence.text)}<span class="selection-label" data-selection="${e(sentence.id)}">${checked?'Selected':'Not selected'}</span></span></label>`;
 }).join('');
 $('passage').querySelectorAll('[name="evidence"]').forEach(input=>input.onchange=()=>{
  const s=state[current().key];s.selected=input.checked?[...new Set([...s.selected,input.value])]:s.selected.filter(id=>id!==input.value);s.evidenceCorrect=false;s.evidenceFeedback='';
  $('passage').querySelectorAll('[data-selection]').forEach(label=>{if(label.dataset.selection===input.value)label.textContent=input.checked?'Selected':'Not selected';});
  selectedSummary();renderSettings();
 });
 $('evidence-selection').hidden=!active;selectedSummary();$('close-reading').hidden=active;
 $('view').textContent=single?'Show Full Passage':'Show One Sentence';$('sentence-controls').hidden=!single;
 $('position').textContent=`Sentence ${sentenceIndex+1} of ${lesson.sentences.length}`;
 $('prev-sentence').disabled=sentenceIndex===0;$('next-sentence').disabled=sentenceIndex===lesson.sentences.length-1;
}
function renderClose(){const k=lesson.keySentence,sentence=lesson.sentences.find(s=>s.id===k.sentenceId);$('close-reading').open=false;$('close-content').innerHTML=`<p>${e(sentence.text)}</p><label>Who or what is this sentence about?<textarea id="close-about">${e(state.closeAbout)}</textarea></label><label>What does this sentence tell us?<textarea id="close-tells">${e(state.closeTells)}</textarea></label><p class="quiet">Your words are not scored.</p><details id="sentence-explanation"><summary>See the Sentence Explanation</summary><p>${e(k.about)}</p><p>${e(k.tells)}</p></details>`;$('close-about').oninput=event=>state.closeAbout=event.target.value;$('close-tells').oninput=event=>state.closeTells=event.target.value;
 $('sentence-explanation').ontoggle=()=>{if($('sentence-explanation').open){markRevealed('why',CLOSE_DISCLOSURES[lesson.id]||['answer']);renderSettings();}};
}
function heading(title){return `<h2 id="task-title" tabindex="-1">${e(title)}</h2>`;}
function primary(label){return `<button id="primary" class="primary">${e(label)}</button>`;}
function helpEntry(){return '<button id="hint" class="subtle help-entry">Need a hint?</button>';}
function contextAnswer(key){const s=state[key],q=getQuestion(key);const text=mode==='teacher'?q.example:s.correct?q.options.find(option=>option.id===s.choice)?.text:'Answer skipped. Look for support for this question.';return text?`<p class="answer-context"><strong>${mode==='teacher'?'Example answer':'Your answer'}</strong>${e(text)}</p>`:'';}
function renderQuestion(){
 const screen=current(),q=getQuestion(screen.key),s=state[screen.key],teacher=mode==='teacher';
 if(screen.phase==='answer'){
  if(teacher)return heading(q.prompt)+`<p class="badge">Teacher demonstration</p><p>${e(q.example)}</p>`+primary('See the Thinking')+helpEntry();
  return heading(q.prompt)+`<fieldset><legend>${mode==='guided'?'Look back at the passage. Choose the best answer.':'Choose the best answer.'}</legend>${q.options.map(option=>`<label class="choice"><input type="radio" name="answer" value="${e(option.id)}" ${s.choice===option.id?'checked':''}><span>${e(option.text)}</span></label>`).join('')}</fieldset><p id="inline-message" class="inline-message" role="status" aria-live="polite"></p>`+primary('Check')+helpEntry();
 }
 if(screen.phase==='answer-feedback'){
  const feedback=teacher?shortFeedback(displayIds(lesson.teacherModel[screen.key])):s.feedback;
  return heading(teacher?'How I Thought About It':s.correct?'That Fits the Text':'Look Back and Try Again')+`<p class="feedback" role="status" aria-live="polite">${e(feedback||'This task was skipped. You can go back and try it.')}${!teacher?feedbackReward(screen.key,'answer'):''}</p>${s.example&&!teacher?'<p class="badge">Example viewed · With help</p>':''}`+primary(teacher||s.correct?'Find Evidence':'Try Again')+helpEntry();
 }
 if(screen.phase==='evidence'){
  if(teacher)return heading('Find Support in the Text')+`<p class="badge">Teacher demonstration</p><p>Look at sentences ${sentenceNumbers(q.evidenceIds)} in the passage.</p>`+contextAnswer(screen.key)+primary('See Why These Help')+helpEntry();
  return heading('What in the text helped you?')+contextAnswer(screen.key)+`<p>${mode==='guided'?'Choose supporting sentences in the passage.':'Select evidence in the passage.'} ${q.evidenceIds.length===1?'Choose one sentence.':`Choose ${q.evidenceIds.length} sentences.`}</p><p id="inline-message" class="inline-message" role="status" aria-live="polite"></p>`+primary('Check Evidence')+helpEntry();
 }
 return heading(teacher?'These Sentences Support the Answer':s.evidenceCorrect?'You Found the Support':'Check Your Evidence')+`<p class="feedback" role="status" aria-live="polite">${e(teacher?q.evidenceHint:s.evidenceFeedback||'This task was skipped. You can go back and try it.')}${!teacher?feedbackReward(screen.key,'evidence'):''}</p>${s.evidenceExample&&!teacher?'<p class="badge">Evidence example viewed · With help</p>':''}`+primary(teacher||s.evidenceCorrect?'Continue':'Try Again')+helpEntry();
}
function renderRetell(){
 const phase=current().phase;
 if(phase==='retell')return heading('Tell the Important Ideas')+'<p>Try 1–3 sentences. Use your own words.</p>'+`<label for="retell">${e(lesson.retellPrompt)}</label><textarea id="retell">${e(state.retell)}</textarea><p id="inline-message" class="inline-message" role="status" aria-live="polite"></p>`+primary(mode==='teacher'||state.retellSubmitted&&state.retellMethod==='aloud'?'Continue':'Submit Retelling')+'<button id="aloud" class="subtle help-entry">Tell It Aloud</button>'+helpEntry();
 if(phase==='self-check')return heading('Check Your Retelling')+`<div class="checklist">${lesson.selfCheck.map((text,index)=>`<label><input type="checkbox" data-check="${index}" ${state.checks.includes(index)?'checked':''}><span>${e(text)}</span></label>`).join('')}</div><p id="inline-message" class="inline-message" role="status" aria-live="polite"></p>`+primary(mode==='teacher'?'Continue':'I checked my retelling')+helpEntry();
 if(state.badgeEarned&&mode!=='teacher'){
  const badge=PRACTICE_BADGES[lesson.id];
  return heading('Practice Complete')+`<div role="status" aria-live="polite"><p>You earned a badge!</p><div class="completion-badge"><svg class="badge-art" aria-hidden="true" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${badge.icon}</svg>${e(badge.name)}</div><p>You finished this practice!</p><p>Practice Points: ${state.points}</p></div>`+primary('Review My Retelling')+helpEntry();
 }
 return heading('Practice Complete')+'<p>You reached the end of this practice. That does not mean every answer was correct or done on your own.</p><p>You can go back to finish any steps you missed.</p>'+primary('Review My Retelling')+helpEntry();
}
function currentHints(){const screen=current();if(screen.key){const q=getQuestion(screen.key);if(screen.phase.startsWith('evidence'))return SAFE_EVIDENCE_HINTS[lesson.id]?.[screen.key]||[q.evidenceHint,q.evidenceTask];return [q.hint,screen.key==='what'?(lesson.type==='Fiction'?'Who or what is the story about? Think about the problem and result.':'What did you learn about the topic? Think about the whole passage.'):'Look for a sentence that explains this answer.'];}if(screen.phase==='read')return ['Read one sentence at a time if that helps.','Look closely at the key sentence in the passage.'];if(screen.phase==='self-check')return ['Use the checklist to think about your retelling. These checks are not a score.'];return ['Keep the main idea and the reason or process that matters.'];}
function renderHelp(){const screen=current(),hints=currentHints();if(overlay==='example'){const q=getQuestion(screen.key),evidence=screen.phase.startsWith('evidence');return heading('One Example')+`<p class="badge">Example viewed · With help</p><p>${e(evidence?`Supporting sentences: ${sentenceNumbers(q.evidenceIds)}.`:q.example)}</p>`+primary('Back to Task');}
 if(overlay==='frames')return heading('Optional Sentence Frames')+`<p class="frames">${e(lesson.frames)}</p>`+primary('Back to Task');
 if(overlay==='aloud')return heading('Tell It Aloud')+'<p>Tell your teacher the important ideas. Explain a reason or process when it matters. You can speak instead of writing.</p>'+primary(mode==='teacher'?'Back to Task':'I told it aloud');
 if(overlay==='words')return heading('Use Your Own Words')+`<label for="own-words">Explain your answer (optional).</label><textarea id="own-words">${e(state[screen.key].text)}</textarea><p class="quiet">Your writing is not scored.</p>`+primary('Back to Task');
 return heading('A Hint for This Task')+`<p class="help-text">${e(hints[Math.min(helpLevel-1,hints.length-1)])}</p>`+primary('Back to Task')+
 (helpLevel<hints.length?'<button id="more-help" class="subtle help-entry">More Help</button>':screen.key?`<button id="example" class="subtle help-entry" ${(screen.phase.startsWith('evidence')?state[screen.key].evidenceAttempted:state[screen.key].attempted)||mode==='teacher'?'':'disabled'}>Show an Example</button>`:'')+
 (screen.phase==='retell'?'<button id="frames" class="subtle help-entry">Optional Sentence Frames</button><button id="aloud" class="subtle help-entry">Tell It Aloud</button>':'')+
 (screen.key&&!screen.phase.startsWith('evidence')?'<button id="words" class="subtle help-entry">Explain in Your Own Words</button>':'');
}
function renderTask(){
 const screen=current(),labels={'answer':'Answer','answer-feedback':'Answer feedback','evidence':'Evidence','evidence-feedback':'Evidence feedback','retell':'Retell','self-check':'Self-check','complete':'Finished','read':'Read'};
 const body=helpLevel||overlay?renderHelp():screen.key?renderQuestion():screen.stage===4?renderRetell():heading('Read at Your Own Pace')+'<p>Read the passage. Then we’ll find the important ideas.</p>'+primary('Continue')+helpEntry();
 $('task').innerHTML=`<p class="progress">${mode==='teacher'?'Teacher Model · ':''}${names[screen.stage]} · Task ${screen.task} of ${TOTAL_TASKS} · ${labels[screen.phase]}</p>`+body;
 $('back').disabled=position===0&&!helpLevel&&!overlay;
 $('primary').onclick=handlePrimary;
 if($('task').querySelectorAll('[name="answer"]').length)$('task').querySelectorAll('[name="answer"]').forEach(input=>input.onchange=()=>{const s=state[screen.key];s.choice=input.value;s.correct=false;s.feedback='';s.evidenceCorrect=false;$('inline-message').textContent='';renderSettings();});
 if(screen.phase==='retell'&&!helpLevel&&!overlay)$('retell').oninput=event=>{state.retell=event.target.value;invalidateRetelling();if(mode!=='teacher')$('primary').textContent='Submit Retelling';};
 if(overlay==='words')$('own-words').oninput=event=>state[screen.key].text=event.target.value;
 if(screen.phase==='self-check'&&!helpLevel&&!overlay)$('task').querySelectorAll('[data-check]').forEach(input=>input.onchange=()=>{const n=Number(input.dataset.check);state.checks=input.checked?[...new Set([...state.checks,n])]:state.checks.filter(x=>x!==n);});
 const bind=(id,callback)=>{const node=Array.from($('task').querySelectorAll('button')).find(button=>button.id===id);if(node)node.onclick=callback;};
 bind('hint',()=>{rewardNotice=null;helpLevel=1;renderAll();focusTask();});
 bind('more-help',()=>{helpLevel++;renderAll();focusTask();});
 bind('example',()=>{markRevealed(screen.key,[screen.phase.startsWith('evidence')?'evidence':'answer']);overlay='example';renderAll();focusTask();});
 ['frames','aloud','words'].forEach(name=>bind(name,()=>{overlay=name;renderAll();focusTask();}));
}
function handlePrimary(){
 if(overlay==='aloud'&&mode!=='teacher'){submitRetelling('aloud');show(FLOW.findIndex(screen=>screen.phase==='self-check'));return;}
 if(helpLevel||overlay){resetHelp();renderAll();focusTask();return;}
 const screen=current(),s=state[screen.key],q=screen.key?getQuestion(screen.key):null;
 if(mode==='teacher'&&screen.key){show(position+1);return;}
 if(screen.phase==='answer'){
  if(!s.choice){$('inline-message').textContent='Choose an answer first.';return;}
  s.attempted=true;s.correct=s.choice===q.answerId;s.feedback=shortFeedback(q.options.find(option=>option.id===s.choice).feedback);show(position+1,s.correct?awardTask(screen.key,'answer'):null);
 }else if(screen.phase==='answer-feedback'){show(position+(s.correct?1:-1));}
 else if(screen.phase==='evidence'){
  if(!s.selected.length){$('inline-message').textContent='Choose a sentence in the passage first.';return;}
  s.evidenceAttempted=true;const unrelated=s.selected.some(id=>!q.evidenceIds.includes(id)),missing=q.evidenceIds.some(id=>!s.selected.includes(id));
  s.evidenceCorrect=!unrelated&&!missing;
  s.evidenceFeedback=s.evidenceCorrect?'These sentences give direct support for this question.':`${unrelated?'Some selected sentences do not directly support this answer. ':''}${missing?'Some supporting sentences are still missing.':''}`.trim();show(position+1,s.evidenceCorrect?awardTask(screen.key,'evidence'):null);
 }else if(screen.phase==='evidence-feedback'){show(position+(s.evidenceCorrect?1:-1));}
 else if(screen.phase==='retell'&&mode!=='teacher'){
  if(state.retellSubmitted&&state.retellMethod==='aloud'){show(position+1);return;}
  if(!state.retell.trim()){$('inline-message').textContent='Write a retelling, or use Tell It Aloud.';return;}
  submitRetelling('writing');show(position+1);
 }else if(screen.phase==='self-check'&&mode!=='teacher'){
  if(!state.retellSubmitted){$('inline-message').textContent='Submit your retelling first, or confirm you told it aloud.';return;}
  state.selfCheckConfirmed=true;const earned=finishBadge();show(position+1);
  if(earned&&!state.completionCelebrated){state.completionCelebrated=true;celebrations.play();}
 }else if(screen.phase==='complete'){show(FLOW.findIndex(item=>item.phase==='retell'));}
 else show(position+1);
}
function renderAll(){$('practice-points').textContent=`Practice Points: ${state.points}`;renderSettings();renderPassage();renderTask();}
function hideReference(){$('teacher-reference').open=false;}
function resetPractice(){celebrations.stop();state=freshState();position=0;single=false;sentenceIndex=0;resetHelp();hideReference();renderClose();renderAll();focusTask();}
$('lesson').innerHTML=LESSONS.map(item=>`<option value="${e(item.id)}">${e(item.title)}</option>`).join('');
$('reference-content').textContent=lesson.teacherReference;
$('lesson').onchange=()=>{if(hasWork()&&!confirm('Change passages and clear this practice? Your answers will be lost.')){$('lesson').value=lesson.id;return;}lesson=LESSONS.find(item=>item.id===$('lesson').value);$('reference-content').textContent=lesson.teacherReference;$('notice').textContent='New passage. Start a fresh practice.';resetPractice();};
$('mode').onchange=()=>{const nextMode=$('mode').value;
 if(nextMode===mode)return;
 if(mode==='teacher'&&nextMode!=='teacher'){
  if(hasResettableProgress()&&!confirm('Start a new practice attempt? Choices, practice points, and the badge will reset. Your writing will stay.')){$('mode').value=mode;return;}
  celebrations.stop();state.points=0;state.badgeEarned=false;state.completionCelebrated=false;invalidateRetelling();
  keys.forEach(key=>{const text=state[key].text;state[key]=freshQuestion();state[key].text=text;});
  position=FLOW.findIndex(screen=>screen.stage===current().stage);
  $('notice').textContent='Start a new attempt. Choices, points, and badges are cleared. Your own writing is still here.';
 }else{$('notice').textContent=nextMode==='teacher'?'Teacher demonstration. These are examples, not independent answers.':'Practice mode changed. Hints and examples are hidden.';if(current().key)position=FLOW.findIndex(screen=>screen.key===current().key&&screen.phase==='answer');}
 celebrations.stop();mode=nextMode;resetHelp();hideReference();renderClose();renderAll();focusTask();
};
$('teacher-reference').ontoggle=()=>{if($('teacher-reference').open&&mode!=='teacher'){keys.forEach(key=>markRevealed(key,['answer']));renderSettings();}};
$('clear').onclick=()=>{if(!confirm('Clear this practice? Your answers will be lost.'))return;$('notice').textContent='Practice cleared.';resetPractice();};
$('skip').onclick=()=>{const screen=current();if(screen.key){if(mode!=='teacher'){const task=screen.phase.startsWith('answer')?'answer':'evidence';state[screen.key].skipped=true;state[screen.key].rewards[task].done=true;state[screen.key].rewards[task].skipped=true;}const phase=screen.phase.startsWith('answer')?'evidence':'answer';const next=FLOW.findIndex((item,index)=>index>position&&item.phase===phase);show(next>=0?next:FLOW.findIndex(item=>item.phase==='retell'));}else if(screen.phase!=='complete')show(position+1);$('teacher-settings').open=false;};
$('back').onclick=()=>{if(helpLevel||overlay){resetHelp();renderAll();focusTask();return;}show(position-1);};
$('view').onclick=()=>{single=!single;renderPassage();};
$('prev-sentence').onclick=()=>{sentenceIndex=Math.max(0,sentenceIndex-1);renderPassage();};
$('next-sentence').onclick=()=>{sentenceIndex=Math.min(lesson.sentences.length-1,sentenceIndex+1);renderPassage();};
$('size').onchange=()=>{$('passage').style.fontSize=$('size').value+'px';};
$('open-passage').onclick=()=>{$('reading-panel').open=true;$('passage-title').focus();$('reading-panel').scrollIntoView({block:'start',behavior:'auto'});};
$('return-task').onclick=()=>{focusTask();$('task').scrollIntoView({block:'start',behavior:'auto'});};
// The desktop passage stays open. On smaller screens students open it as needed.
const narrow=window.matchMedia('(max-width: 800px)');
function setReadingLayout(){ $('reading-panel').open=!narrow.matches; }
narrow.addEventListener('change',setReadingLayout);setReadingLayout();
renderClose();renderAll();
