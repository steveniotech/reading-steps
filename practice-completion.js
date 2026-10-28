/* GitHub Pages completion UI. Local storage only; no upload or email transport. */
(function(root){
 'use strict';
 const POINTER='reading-steps:pages-session:v1';
 const PREFIX='reading-steps:pages-round:';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=value=>JSON.parse(JSON.stringify(value));
 const $=id=>document.getElementById(id);
 let persistent=true,warning='',round,store,practice,ready=false;
 function storageFailure(message){
  persistent=false;
  warning=message||'浏览器未能可靠保存本次练习。请保持页面打开并复制总结及编号；刷新或关闭页面可能无法恢复。旧记录未删除。';
  const el=$('practice-storage');if(el){el.hidden=false;el.textContent=warning;}
 }
 function randomId(){
  try{const bytes=new Uint8Array(16);root.crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
  catch(error){storageFailure('无法生成安全随机编号。本次仍可练习和复制总结，但编号及刷新恢复无法保证。旧记录未删除。');return null;}
 }
 function metaKey(id){return PREFIX+id+':completion';}
 function validRound(value,id){
  const items=value=>Array.isArray(value)&&value.every(item=>item&&typeof item.text==='string');
  const reportValid=(r,key)=>r&&r.attemptId===key&&r.complete===true&&r.summary&&
   ['independent','supported','priorities'].every(k=>items(r.summary[k]))&&
   Array.isArray(r.rows)&&r.rows.every(row=>row&&typeof row.prompt==='string')&&
   Array.isArray(r.skillAnalysis)&&r.skillAnalysis.every(skill=>skill&&items(skill.observations))&&
   Array.isArray(r.recommendations)&&r.recommendations.every(n=>n&&items(n.reason))&&
   Array.isArray(r.limitations)&&(!r.supplemental||Array.isArray(r.supplemental)&&r.supplemental.every(item=>item&&Array.isArray(item.limitations)));
  return value&&value.version===1&&value.id===id&&value.completed&&typeof value.completed==='object'&&!Array.isArray(value.completed)&&Object.entries(value.completed).every(([key,f])=>
   f&&/^RS-[a-f0-9]{32}$/.test(f.submissionId)&&reportValid(f.report,key));
 }
 function freshRound(){return {version:1,id:randomId()||'memory-only',completed:{}};}
 try{
  const pointer=root.sessionStorage.getItem(POINTER);
  if(pointer){
   if(!/^[a-f0-9]{32}$/.test(pointer))throw Error('Invalid session pointer');
   round=JSON.parse(root.localStorage.getItem(metaKey(pointer))||'null');
   if(!validRound(round,pointer))throw Error('Invalid completion archive');
  }else{
   round=freshRound();
   if(persistent){root.localStorage.setItem(metaKey(round.id),JSON.stringify(round));root.sessionStorage.setItem(POINTER,round.id);}
  }
 }catch(error){storageFailure('已有练习无法读取或存储不可用，原数据未覆盖。本次仅在内存中保留，请复制完成总结和编号，不要依赖刷新恢复。');round=freshRound();}
 function persist(owner){
  if(!persistent)return false;
  try{
   const raw=root.localStorage.getItem(metaKey(owner.id));
   if(raw){
    const prior=JSON.parse(raw);if(!validRound(prior,owner.id))throw Error('Archive unreadable');
    // Preserve the first frozen completion if another tab has already saved it.
    owner.completed={...owner.completed,...prior.completed};
   }
   root.localStorage.setItem(metaKey(owner.id),JSON.stringify(owner));return true;
  }catch(error){storageFailure();return false;}
 }
 const originalOpen=ReadingRecords.open;
 function openRound(owner){
  const prefix=PREFIX+owner.id+':';
  const memory=new Map();
  const local={getItem:key=>persistent?root.localStorage.getItem(prefix+key):memory.get(key)||null,
   setItem:(key,value)=>{memory.set(key,value);if(persistent)root.localStorage.setItem(prefix+key,value);}};
  const next=originalOpen(local);
  for(const method of ['append','checkpoint','recordSupplement','restart']){
   const original=next[method];
   next[method]=function(...args){
    const a=next.current(args[0]);
    if(owner.completed[a.id])return method==='checkpoint'||method==='restart'?a:false;
    const result=original.apply(next,args);
    if(!next.status().available)storageFailure();
    // Checkpoint follows the app's completed-state update, so the frozen record
    // and its restored screen agree. No upload is scheduled by any mutation.
    if(method==='checkpoint'&&next===store)render();
    return result;
   };
  }
  return next;
 }
 ReadingRecords.open=function(){store=openRound(round);return store;};
 function currentCompletion(){const a=practice?.currentAttempt();return a&&round.completed[a.id];}
 // English presentation reads the frozen report; it never changes its scores or evidence.
 function summary(f){
  const r=f.report,html=[],text=[];
  const heading=(title,level=3)=>{html.push('<h'+level+'>'+esc(title)+'</h'+level+'>');text.push('\n'+title);};
  const paragraph=value=>{html.push('<p>'+esc(value)+'</p>');text.push(String(value));};
  const list=items=>{html.push('<ul>'+items.map(value=>'<li>'+esc(value)+'</li>').join('')+'</ul>');text.push(...items.map(value=>'• '+value));};
  const tasks={
   'what.answer':{past:'chose the correct main idea',focus:'choosing the main idea'},
   'what.evidence':{past:'found the right sentences to support the main idea',focus:'finding sentences that support the main idea'},
   'why.answer':{past:'found the correct reason in the passage',focus:'finding the reason given in the passage'},
   'why.evidence':{past:'found the right sentences to support the reason',focus:'finding sentences that support the reason'},
   'how.answer':{past:'put the events or steps in the correct order',focus:'following the order of events or steps'},
   'how.evidence':{past:'found the right sentences to show the order',focus:'finding sentences that show the order'}
  };
  const label=row=>tasks[row.task]||{past:'answered this question correctly',focus:'answering a new question'};
  const support=row=>row.support===true||row.first?.withHelp===true||row.retries>0||row.hints>0||row.examples>0||row.skips>0;
  const helpText=row=>{
   const parts=[];
   if(row.hints>0)parts.push(row.hints+' on-page hint'+(row.hints===1?'':'s'));
   if(row.examples>0)parts.push(row.examples+' example'+(row.examples===1?'':'s'));
   return parts.length?' You used '+parts.join(' and ')+' during this task.':'';
  };
  heading('Your Reading Summary',2);
  paragraph('Practice ID: '+(f.submissionId||'unavailable - please keep your summary'));
  paragraph('Passage: '+(LESSONS.find(u=>u.id===r.unit)?.title||'this passage'));
  paragraph('You got '+r.firstCorrect+' of '+r.required+' answers right on your first try.');
  paragraph('You got '+r.finalCorrect+' of '+r.required+' answers right by the end.');
  if(r.totalHints>0)paragraph('You opened '+r.totalHints+' on-page hint'+(r.totalHints===1?'':'s')+' in this practice.');
  heading('What You Did Well');
  const observations=r.rows.filter(row=>row.final?.correct).map(row=>{
   let line;
   if(row.first?.correct){
    line='You '+label(row).past+' on your first try'+(row.first.withHelp===true?', with support.':'.');
    if(row.retries>0)line+=' You also tried this task '+row.retries+' more time'+(row.retries===1?'':'s')+'.';
   }else line='You '+label(row).past+' after trying again'+(row.final.withHelp===true?', with support.':'.');
   line+=helpText(row);
   if(row.skips>0)line+=' You skipped this task at one point.';
   return line;
  });
  if(observations.length)list(observations);else paragraph('You can finish the questions to see what you did well.');
  // Extra questions describe only observed attempts, not unmeasured abilities.
  const extra=[],extraNext=[];let extraSupport=false;
  for(const item of r.supplemental||[]){
   if(item.presented!==true)continue;
   const topic=item.label==='P-V1'?'the meaning of "blank"':'the next step after the gutter';
   const first=item.submissions?.[0];
   if(item.recordReliable!==true){extraNext.push('You opened an extra question, but there is not enough information to describe the result.');continue;}
   if(!first){extraNext.push('You opened an extra question but did not answer it. This is not counted as a wrong answer.');continue;}
   if(item.finalCorrect){
    const last=item.submissions[item.submissions.length-1];
    extra.push('You chose the correct answer about '+topic+' in the extra question '+(first.correct?'on your first try':'after trying again')+((first.correct?first.afterHint:last.afterHint)?', with a hint.':'.'));
    if(!first.correct||item.hintDisplayed===true||item.submissions.length>1){extraSupport=true;extraNext.push('You can practise another extra question about '+topic+' on a new passage.');}
   }else{extraSupport=true;extraNext.push('You have not yet answered the extra question about '+topic+' correctly. You can look back at the passage and try again.');}
  }
  if(extra.length)list(extra);
  heading('What to Practise Next');
  const supported=r.rows.filter(support);
  if(!supported.length&&!extraSupport)paragraph('No specific difficulty was identified in this practice. Try a new passage to check your understanding.');
  else if(supported.length)list(supported.map(row=>'You can practise '+label(row).focus+' on a new passage.'));
  if(extraNext.length)list(extraNext);
  heading('Try This Next');
  const next={
   'main-idea':'You can read a new short passage. Choose the answer that covers the whole passage, then find two sentences that support it.',
   'explicit-cause':'You can find a reason the new passage gives. Finish: "This happened because ..." Then point to the sentence that gives the reason.',
   'sequence':'You can put three events or steps from a new passage in order. Find the sentence for each step.',
   'text-evidence':'You can choose a sentence that directly supports your answer. Explain how it helps. Compare it with a sentence that is only related.'
  };
  const suggestions=r.recommendations.map(rec=>{
   const skill=r.skillAnalysis.find(item=>item.name===rec.skill);
   return next[skill?.id]||'You can try a new passage. Answer before opening a hint, then show which sentences support your answers.';
  });
  list([...new Set(suggestions.length?suggestions:['You can try a new passage. Answer before opening a hint, then show which sentences support your answers.'])]);
  heading('About This Summary');
  paragraph('You can use this summary to look back at this practice. It does not show your overall reading ability. Only on-page help is included, and your retelling was not scored.');
  if(r.rows.some(row=>row.first&&row.first.withHelp===null))paragraph('Help use is not known for some of your answers.');
  return {html:html.join(''),text:text.join('\n')};
 }

 function render(){
  if(!ready)return;
  const a=practice.currentAttempt();let f=round.completed[a.id];
  if(!f){
   const report=ReadingRecords.report(a);
   if(report.complete){
    const id=randomId();f={submissionId:id?'RS-'+id:null,report:clone(report)};
    round.completed[a.id]=f;
    // Without a secure ID the summary remains usable in memory, not a valid archive.
    if(id)persist(round);
    f=round.completed[a.id];
   }
  }
  $('completion-summary').hidden=!f;
  $('practice-workspace').hidden=!!f;
  $('teacher-settings').hidden=!!f;
  $('practice-storage').hidden=!warning;$('practice-storage').textContent=warning;
  if(!f){$('completion-content').innerHTML='';$('completion-id').textContent='';return;}
  $('completion-content').innerHTML=summary(f).html;
  $('completion-id').textContent=f.submissionId||'ID unavailable';
  $('copy-number').disabled=!f.submissionId;
 }
 async function copy(kind){
  const f=currentCompletion();if(!f)return;
  const owner=round,value=kind==='number'?f.submissionId:summary(f).text;if(!value)return;
  try{
   await root.navigator.clipboard.writeText(value);
   if(owner===round)$('completion-copy-status').textContent=kind==='number'?'Practice ID copied. This does not mean your teacher has received your summary.':'Summary and Practice ID copied. You can send them to your teacher.';
  }catch(error){
   if(owner!==round)return;
   const area=$('completion-copy-fallback');area.hidden=false;area.value=value;area.focus();area.select?.();
   $('completion-copy-status').textContent='Automatic copying is not available. Please copy the selected text below.';
  }
 }
 function again(){
  if(!currentCompletion())return;
  if(!persistent){$('completion-copy-status').textContent='Your practice has not been saved reliably. Copy your summary and Practice ID first. A new practice cannot start yet.';return;}
  if(!persist(round))return;
  const next=freshRound();if(!persistent)return;
  try{
   root.localStorage.setItem(metaKey(next.id),JSON.stringify(next));
   root.sessionStorage.setItem(POINTER,next.id);
  }catch(error){storageFailure();return;}
  const unit=practice.currentAttempt().unit;
  round=next;store=openRound(round);
  $('completion-copy-status').textContent='';$('completion-copy-fallback').value='';$('completion-copy-fallback').hidden=true;
  practice.changeRecords(store,unit);render();
 }
 function init(){
  if(ready)return;practice=root.ReadingPractice;
  if(!practice){storageFailure('练习尚未完成加载；请联系老师，旧记录未清除。');return;}
  // Legacy preview/export/delete controls remain inert for existing app hooks.
  // The Pages completion renders from ReadingRecords.report, not reading-report.js.
  for(const id of ['clear','report-preview','download-record','erase-records','record-status'])$(id).hidden=true;
  $('clear').onclick=again;
  $('erase-records').onclick=()=>{};
  $('report-preview').onclick=()=>{render();if(currentCompletion())$('completion-summary').scrollIntoView({block:'start'});};
  $('copy-summary').onclick=()=>copy('summary');$('copy-number').onclick=()=>copy('number');$('practice-again').onclick=again;
  ready=true;render();
 }
 root.ReadingPracticeCompletion={onPracticeReady:init,supplementsBeforeFinish:true};
})(typeof globalThis==='undefined'?window:globalThis);
