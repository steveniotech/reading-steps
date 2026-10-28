'use strict';
(function(root){
 const KEY='reading-steps:records:v1',CONTENT='reading-2026-10-v1',RULES='reading-report-v2';
 const SUPPLEMENT={id:'rain-path.supplement.next-step.v1',version:'reading-supplements-v1',unit:'rain-path',skill:'相邻过程顺序',prompt:'After the water leaves the gutter, where does it go next?',options:[{id:'A',text:'Into the downspout.'},{id:'B',text:'Onto the splash block.'},{id:'C',text:'Toward the grassy area.'}],answer:'A',hint:'Start at the gutter. Follow only one move forward in the text.',sources:[{id:'r4',text:'The gutter carries the water along the roof’s edge to a pipe called a downspout.'},{id:'r5',text:'The water flows down the pipe and out onto a splash block that points away from the door.'},{id:'r6',text:'The splash block guides the water toward a grassy area.'}]};
 const SUPPLEMENTS=[{id:'paper-tray.supplement.blank.v1',version:'reading-supplements-v1',label:'P-V1',unit:'paper-tray',skill:'语境词义',prompt:'In “the other side is still blank,” what does “blank” mean?',options:[{id:'A',text:'Covered with writing.'},{id:'B',text:'Folded in half.'},{id:'C',text:'Without writing on that side.'}],answer:'C',hint:'Compare the two sides. One has writing. What is different about the other?',sources:[{id:'p2',text:'Sometimes a sheet has writing on only one side, while the other side is still blank.'},{id:'p3',text:'That blank side can be used again instead of taking a new sheet.'}]},{...SUPPLEMENT,label:'R-S1'}];
 const SELECTION_VERSION='reading-supplements-v2';
 const knownSelection=s=>s&&['reading-supplements-v1',SELECTION_VERSION].includes(s.version)&&Array.isArray(s.questionIds);
 function selectedSupplements(a){return knownSelection(a.supplementSelection)?SUPPLEMENTS.filter(q=>a.supplementSelection.questionIds.includes(q.id)):[];}
 const units=['garden-sign','book-cart','paper-tray','rain-path'];
 const tasks=['what.answer','what.evidence','why.answer','why.evidence','how.answer','how.evidence'];
 const skills={'what.answer':'主旨理解','what.evidence':'文本证据','why.answer':'显性原因理解','why.evidence':'文本证据','how.answer':'过程顺序','how.evidence':'文本证据'};
 let catalog={};
 function configure(lessons){catalog={};for(const unit of lessons)if(units.includes(unit.id)&&unit.contentVersion===CONTENT)catalog[unit.id]=unit;}
 const clone=x=>JSON.parse(JSON.stringify(x));
 function uid(){return root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
 function fresh(unit){return {id:uid(),unit,contentVersion:CONTENT,createdAt:new Date().toISOString(),recordingVersion:'reading-events-v2',events:[],snapshot:null,supplementSelection:{version:SELECTION_VERSION,questionIds:SUPPLEMENTS.filter(q=>q.unit===unit).map(q=>q.id)},supplementRecordingVersion:'supplement-events-v1',supplementEvents:[]};}
 function snapshot(state,position,mode){
  const s=clone(state);for(const k of ['retell','closeAbout','closeTells'])delete s[k];
  for(const k of ['what','why','how'])if(s[k])delete s[k].text;
  return {state:s,position,mode};
 }
 function validEvent(e){return e&&typeof e.id==='string'&&['submit','hint','example','skip','retell','selfcheck','resume','invalidate'].includes(e.type)&&(!e.task||tasks.includes(e.task))&&(e.type!=='submit'||(tasks.includes(e.task)&&typeof e.correct==='boolean'&&(typeof e.answer==='string'||Array.isArray(e.answer))));}
 function supplementQuestionReport(a,q){
  const selection=a.supplementSelection;
  const selectionKnown=knownSelection(selection);
  const selected=selectionKnown?selection.questionIds.includes(q.id):null;
  const raw=Array.isArray(a.supplementEvents)?a.supplementEvents:null;
  const schema=a.supplementRecordingVersion==='supplement-events-v1';
  let reliable=!!(selectionKnown&&schema&&raw),presented=null,hintSeen=false,fullPresented=null,endingPresented=null,readFull=null,readEnding=null;
  const events=[],submissions=[],ids=new Set();let presentedBefore=false;
  for(const [index,event] of (raw||[]).entries()){
   if(!event||typeof event.id!=='string'||ids.has(event.id)||!SUPPLEMENTS.some(item=>item.id===event.questionId&&item.version===event.questionVersion)||event.sequence!==index+1){reliable=false;continue;}
   ids.add(event.id);
   if(event.questionId!==q.id)continue;
   if(event.type==='presented'){presented=true;presentedBefore=true;}
   else if(event.type==='hint'){
    if(!submissions.length){reliable=false;continue;}hintSeen=true;
   }else if(event.type==='submit'){
    if(!presentedBefore||!q.options.some(o=>o.id===event.answer)||event.correct!==(event.answer===q.answer)){reliable=false;continue;}
    submissions.push({answer:event.answer,correct:event.correct,eventId:event.id,afterHint:hintSeen,fullTextPresentedAtSubmission:fullPresented,endingPresentedAtSubmission:endingPresented,fullTextReadDeclarationAtSubmission:readFull,endingReadDeclarationAtSubmission:readEnding});
   }else if(event.type==='exposure'){
    if(event.fullTextPresented===true)fullPresented=true;
    if(event.endingPresented===true)endingPresented=true;
   }else if(event.type==='reading-declaration'){
    if(!['yes','not-yet','unknown'].includes(event.value)){reliable=false;continue;}
    readFull=event.value==='yes'?true:event.value==='not-yet'?false:null;readEnding=event.value==='yes'?true:null;
   }else if(event.type!=='defer'){reliable=false;continue;}
   events.push(event);
  }
  if(reliable&&presented===null)presented=false;
  const first=submissions[0]||null,last=submissions.at(-1)||null;
  const state=!reliable?'记录不足':selected!==true||!presented?'未施测':!last?'未作答':'已作答';
  let outcome=state,observation=state==='未施测'?'本次未呈现 '+q.label+'，不进入已作答分母。':state==='未作答'?q.label+' 已呈现，尚无有效提交；不记为答错。':'历史字段或事件记录不足，不能补造首次表现、零次帮助或独立表现。';
  if(reliable&&selected&&last){
   if(!last.correct){outcome='尚未答对';observation='本次这道相邻步骤题最新提交尚未答对。不能确定原因是顺序、部件词义还是题干理解。';}
   else if(first.correct){outcome='首次答对';observation='本次这道相邻步骤题首次答对，首次提交前未记录提示；有证据表明本次能区分天沟之后紧接的步骤与后续位置。';}
   else if(last.afterHint){outcome='查看提示后答对';observation='本次查看提示后答对这道相邻步骤题；是在提示支持后区分紧接步骤与后续位置，不作为首次独立完成。';}
   else{outcome='无提示重试后答对';observation='本次未记录提示，重试后答对这道相邻步骤题；不作为首次独立完成。';}
  }
  if(q.label==='P-V1'&&reliable&&selected&&last){
   observation=outcome==='首次答对'?'本次在这道题中正确理解了 blank 在句中的意思。':outcome==='无提示重试后答对'?'本次在这道语境词义题中，无提示重试后答对。':outcome==='查看提示后答对'?'本次在这道语境词义题中，查看提示后答对。':'本次在这道语境词义题中尚未答对；不能仅凭选项确定困难原因。';
  }
  return {label:q.label,skill:q.skill,questionId:q.id,questionVersion:q.version,selected,presented,state,outcome,observation,firstAnswer:first?.answer||null,firstEventId:first?.eventId||null,finalAnswer:last?.answer||null,finalCorrect:last?.correct??null,submissions,firstSubmissionContext:first?{fullTextPresented:first.fullTextPresentedAtSubmission,endingPresented:first.endingPresentedAtSubmission,fullTextReadDeclaration:first.fullTextReadDeclarationAtSubmission,endingReadDeclaration:first.endingReadDeclarationAtSubmission}:null,events,hintDisplayed:reliable?hintSeen:hintSeen?true:null,hintCount:reliable?events.filter(e=>e.type==='hint').length:null,retries:reliable?Math.max(0,submissions.length-1):null,fullTextPresented:fullPresented,endingPresented,fullTextReadDeclaration:readFull,endingReadDeclaration:readEnding,recordReliable:reliable,limitations:['未记录帮助不等于没有外部帮助。','全文/结局已呈现不证明实际读过；阅读声明只是学生自报。',q.label==='P-V1'?'单题不证明词汇能力强弱或已掌握语境猜词；选项不能确定具体困难原因。':'不能仅凭错误确定是顺序、部件词义还是题干理解问题。','单题结果不构成稳定能力或整体阅读水平结论。'],sources:q.sources};
 }
 function supplementalReport(a){
  const selected=selectedSupplements(a);
  return SUPPLEMENTS.filter(q=>q.unit===a.unit||selected.some(item=>item.id===q.id)).map(q=>supplementQuestionReport(a,q));
 }
 function open(storage){
  let data={version:1,active:{},attempts:[]},message='',available=true,readBlocked=false;
  try{const raw=storage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(parsed.version!==1||!Array.isArray(parsed.attempts))throw Error('unsupported');data=parsed;data.active=data.active||{};data.attempts=data.attempts.filter(a=>a&&units.includes(a.unit)&&typeof a.id==='string').map(a=>({...a,events:Array.isArray(a.events)?a.events.filter(validEvent):[],snapshot:a.contentVersion===CONTENT?a.snapshot:null}));}}
  catch{available=false;readBlocked=true;message='旧记录无法读取，原数据未覆盖。本次仅保存在内存。';}
  function save(){if(readBlocked)return false;try{for(const a of data.attempts)a.report=report(a);storage.setItem(KEY,JSON.stringify(data));available=true;message='已保存在此浏览器';return true;}catch{available=false;message='保存失败：本次仅在内存，请保持页面打开并下载报告。';return false;}}
  function current(unit){let a=data.attempts.find(a=>a.id===data.active[unit]&&a.unit===unit);if(!a){a=fresh(unit);data.attempts.push(a);data.active[unit]=a.id;save();}return a;}
  return {recordSupplement(unit,type,details={},eventId=uid()){
    const a=current(unit),q=details.questionId?SUPPLEMENTS.find(item=>item.id===details.questionId):SUPPLEMENTS.find(item=>item.unit===unit);
    if(!q||!knownSelection(a.supplementSelection)||!a.supplementSelection.questionIds.includes(q.id)||a.supplementRecordingVersion!=='supplement-events-v1'||!Array.isArray(a.supplementEvents))return false;
    if(a.supplementEvents.some(e=>e.id===eventId))return false;
    if(!['presented','submit','hint','reading-declaration','exposure','defer'].includes(type))return false;
    const result=supplementQuestionReport(a,q);
    if(type==='submit'&&(!result.presented||!q.options.some(o=>o.id===details.answer)))return false;
    if(type==='hint'&&!result.submissions.length)return false;
    if(type==='reading-declaration'&&!['yes','not-yet','unknown'].includes(details.value))return false;
    if(type==='exposure'&&(!details.fullTextPresented||result.fullTextPresented)&&(!details.endingPresented||result.endingPresented))return false;
    const event={id:eventId,sequence:a.supplementEvents.length+1,questionId:q.id,questionVersion:q.version,type,time:new Date().toISOString()};
    if(type==='submit'){event.answer=details.answer;event.correct=details.answer===q.answer;}
    if(type==='reading-declaration')event.value=details.value;
    if(type==='exposure'){if(details.fullTextPresented===true)event.fullTextPresented=true;if(details.endingPresented===true)event.endingPresented=true;}
    a.supplementEvents.push(event);save();return true;
   },
   current,lastUnit:()=>data.lastUnit,list:()=>clone(data.attempts),status:()=>({available,message}),save,
   append(unit,type,details={},eventId=uid()){
    const a=current(unit);if(a.events.some(e=>e.id===eventId))return false;
    const previous=a.events.filter(e=>e.type==='submit'&&e.task===details.task).at(-1);
    if(type==='submit'&&details.correct&&previous?.correct&&JSON.stringify(previous.answer)===JSON.stringify(details.answer))return false;
    const event={id:eventId,type,time:new Date().toISOString()};
    if(tasks.includes(details.task))event.task=details.task;
    if(['read','retell','self-check'].includes(details.scope))event.scope=details.scope;
    if(type==='submit'&&event.task){event.answer=Array.isArray(details.answer)?details.answer.filter(x=>typeof x==='string'):String(details.answer||'');event.correct=details.correct===true;}
    if(type==='retell')event.method=details.method==='aloud'?'aloud':'writing';
    a.events.push(event);save();return true;
   },
   checkpoint(unit,state,position,mode){data.lastUnit=unit;current(unit).snapshot=snapshot(state,position,mode);save();},
   restart(unit){const a=fresh(unit);data.attempts.push(a);data.active[unit]=a.id;save();return a;},
   erase(unit){data.attempts=data.attempts.filter(a=>a.unit!==unit);delete data.active[unit];return current(unit);}
  };
 }
 const skillNames={'main-idea':'主旨理解','explicit-cause':'明确原因理解','sequence':'事件／过程顺序','text-evidence':'文本证据定位'};
 const teaching={
  'main-idea':{exercise:'读一篇新的短文，比较一个具体细节和一个覆盖全文的概括句；指出概括句怎样包含问题、行动或共同用途。',teacherQuestion:'哪一句能说清整篇在讲什么，而不只是其中一件事？',check:'换一篇未练过的同类短文，在查看提示前选择主旨，再说明至少两处支持内容；单列首次表现。'},
  'explicit-cause':{exercise:'在新的短文中圈出“发生了什么”和原文明说的原因，用“因为……所以……”连接；不要求猜测没写出的原因。',teacherQuestion:'原文哪一句直接说明了为什么？',check:'用另一篇含明确原因的短文，先自行选择原因，再指出原句；比较是否仍需提示，不能只重复原题。'},
  'sequence':{exercise:'读一段新的三步过程，按原文摆放三张步骤卡，再指出每一步对应的句子。',teacherQuestion:'先发生什么，接下来是什么？原文哪里告诉你？',check:'换一个新过程，先独立选出正确步骤或路径，再查原文；分别记录内容错误与次序错误，现有题目无法独立诊断两者。'},
  'text-evidence':{exercise:'用一篇新的短文和一个明确问题，从候选句中选直接支持答案的句子，并与一个仅相关的句子比较。',teacherQuestion:'这句话怎样直接支持你的答案？有没有只相关、却没有回答问题的句子？',check:'换新短文和同类问题，保持相近线索强度，记录首次选句、遗漏及多选；不要把背熟本题句号当作进步。'}
 };
 function report(a){
  const seen=new Set(),events=(Array.isArray(a.events)?a.events:[]).filter(e=>{if(!validEvent(e)||seen.has(e.id))return false;seen.add(e.id);return true;});
  const unit=catalog[a.unit],compatible=a.contentVersion===CONTENT,known=compatible&&!!unit;
  const coverage=a.recordingVersion==='reading-events-v2';
  let ignored=0;
  const rows=tasks.map(task=>{
   const [key,kind]=task.split('.'),q=unit?.[key+'Question'],annotation=known?q?.analysis?.[kind]:null;
   const related=events.filter(e=>e.task===task),subs=[];let hints=0,examples=0,skips=0,helped=false;
   for(const e of related){
    if(e.type==='hint'){hints++;helped=true;}if(e.type==='example'){examples++;helped=true;}if(e.type==='skip')skips++;
    if(e.type==='submit'){
     // A persisted correctness flag alone is insufficient. Match the actual versioned question.
     let valid=true;
     if(known&&q){
      const answerValid=kind==='answer'?q.options.some(o=>o.id===e.answer):Array.isArray(e.answer)&&e.answer.every(id=>unit.sentences.some(sentence=>sentence.id===id))&&new Set(e.answer).size===e.answer.length;
      const actual=kind==='answer'?e.answer===q.answerId:Array.isArray(e.answer)&&e.answer.length===q.evidenceIds.length&&q.evidenceIds.every(id=>e.answer.includes(id));
      valid=answerValid&&actual===e.correct;
     }
     if(!valid){ignored++;continue;}
     const answerText=q?(kind==='answer'?q.options.find(o=>o.id===e.answer)?.text:Array.isArray(e.answer)?e.answer.join('、'):'未知'):'未核对题目';
     subs.push({...e,answerText,helped:helped?true:coverage?false:null});
    }
   }
   const first=subs[0],last=subs.at(-1),support=subs.length>0&&(subs.some(e=>!e.correct)||hints>0||examples>0||skips>0||subs.length>1);
   const independent=!!annotation&&!!first?.correct&&first.helped===false&&!support;
   return {task,questionId:a.unit+'.'+task,skill:annotation?skillNames[annotation.skill]:'技能映射证据不足',skillId:annotation?.skill||null,prompt:q?(kind==='answer'?q.prompt:q.evidenceTask):'题目版本未确认',focus:annotation?.focus||'暂不足以判断',mappingVersion:q?.analysis?.version||null,limitation:annotation?.limitation||'未取得匹配版本的逐题技能映射。',first:first?{answer:first.answer,answerText:first.answerText,correct:first.correct,withHelp:first.helped,eventId:first.id}:null,final:last?{answer:last.answer,answerText:last.answerText,correct:last.correct,withHelp:last.helped,eventId:last.id}:null,submissions:subs.length,retries:Math.max(0,subs.length-1),hints:coverage||hints?hints:null,examples:coverage||examples?examples:null,skips:coverage||skips?skips:null,support,independent,helpCoverageKnown:coverage,evidenceIds:related.map(e=>e.id)};
  });
  let retell=null,selfcheck=false;
  for(const e of events){if(e.type==='retell'){retell=e.method;selfcheck=false;}if(e.type==='invalidate'){retell=null;selfcheck=false;}if(e.type==='selfcheck'&&retell)selfcheck=true;}
  const complete=known&&rows.every(r=>r.final?.correct)&&!!retell&&selfcheck;
  const skillAnalysis=Object.entries(skillNames).map(([id,name])=>{
   const items=rows.filter(r=>r.skillId===id),submitted=items.filter(r=>r.first),independent=items.filter(r=>r.independent),supported=items.filter(r=>r.support);
   const status=!submitted.length?'尚未作答或证据不足':supported.length?'本次需要支持':independent.length===submitted.length?'本次较独立完成':'尚未作答或证据不足';
   const observations=submitted.map(r=>{
    const count=items.length===1?'在本次这道'+name+'题中':'在本次“'+r.prompt+'”任务中';
    const outcome=r.first.correct?'首次选择“'+r.first.answerText+'”正确':'首次选择“'+r.first.answerText+'”未答对';
    const final=r.retries?'；'+(r.final.correct?'重试后选择“'+r.final.answerText+'”正确':'最新提交仍未答对'):'';
    const help=(r.hints?'；记录了 '+r.hints+' 次提示':'')+(r.examples?'；记录了 '+r.examples+' 次示例暴露':'');
    return {text:count+'，'+outcome+final+help+'。'+(r.independent?'本次较独立完成；未记录帮助不等于确认没有外部帮助。':r.support?'这说明本次任务需要支持，不能据此确定困难原因。':'帮助记录覆盖不明，暂不足以判断独立程度。'),evidence:r.evidenceIds,questionId:r.questionId};
   });
   if(!submitted.length)observations.push({text:'尚无可核对的已提交答案，暂不足以判断；未作答不记作答错。',evidence:[]});
   if(submitted.length<items.length)observations.push({text:'另有 '+(items.length-submitted.length)+' 项未提交，不计为错误。',evidence:[]});
   return {id,name,status,available:items.length,submitted:submitted.length,firstCorrect:submitted.filter(r=>r.first.correct).length,firstWithoutRecordedHelp:independent.length,finalCorrect:submitted.filter(r=>r.final.correct).length,hints:coverage?items.reduce((n,r)=>n+(r.hints||0),0):null,retries:submitted.reduce((n,r)=>n+r.retries,0),examples:coverage?items.reduce((n,r)=>n+(r.examples||0),0):null,observations,next:submitted.length?teaching[id]:null,limitation:items[0]?.limitation||'题目版本或技能映射未核实，暂不足以判断。',evidence:submitted.flatMap(r=>r.evidenceIds),questionIds:submitted.map(r=>r.questionId),supportCount:supported.length};
  });
  const independent=rows.filter(r=>r.independent),supported=rows.filter(r=>r.support&&r.skillId);
  const cite=r=>r.questionId+'（'+r.prompt+'；事件 '+r.evidenceIds.join('、')+'）';
  const strengths=independent.slice(0,2).map(r=>({text:r.focus+' 本次首次提交正确，且没有记录到提示、示例或重试。',evidence:r.evidenceIds,questionId:r.questionId}));
  const practice=supported.map(r=>({text:'本次“'+r.prompt+'”首次选择“'+r.first.answerText+'”'+(r.first.correct?'正确':'未答对')+'；'+(r.hints?'有提示，':'')+(r.examples?'看过示例，':'')+(r.skips?'有跳过记录，':'')+(r.retries?'重试后'+(r.final.correct?'答对':'仍未答对')+'。':'')+'练习重点：'+r.focus+' 错误原因暂不足以判断。',evidence:r.evidenceIds,questionId:r.questionId}));
  const priorities=skillAnalysis.filter(s=>s.supportCount).sort((a,b)=>b.supportCount-a.supportCount).slice(0,2);
  const recommendations=priorities.map(s=>({skill:s.name,reason:s.observations.filter(o=>rows.some(row=>row.questionId===o.questionId&&row.support)),...teaching[s.id],evidence:s.evidence,questionIds:s.questionIds}));
  if(!recommendations.length&&known){const missing=skillAnalysis.find(s=>s.submitted<s.available);if(missing)recommendations.push({skill:missing.name,reason:[{text:'尚未作答，先补充证据，不能称为已知困难。'}],...teaching[missing.id],evidence:[],questionIds:[]});else if(skillAnalysis.some(s=>s.submitted))recommendations.push({skill:'迁移检查',reason:[{text:'本篇未发现明确需要支持的任务；仍不足以确认稳定掌握。'}],exercise:'换一篇未练过的同类短文，保留首次提交并记录帮助。',teacherQuestion:'你的答案可以由哪几句支持？',check:'用新任务比较首次表现，不用原题重复全对证明掌握。',evidence:[],questionIds:[]});}
  const summary={independent:independent.length?independent.slice(0,2).map(r=>({text:r.focus+' 本次较独立完成。依据：'+cite(r),evidence:r.evidenceIds,questionId:r.questionId})):[{text:'暂不足以判断哪些任务较独立完成；需要可核对的首次答案及帮助记录。',evidence:[]}],supported:supported.length?practice.slice(0,2):[{text:known?'本次尚无足够记录指明需要支持的任务；未作答不算答错。':'题目版本或技能映射未确认，暂不足以判断。',evidence:[]}],priorities:recommendations.length?recommendations.map(r=>({text:r.skill+'：'+r.reason.map(o=>o.text).join(' '),evidence:r.evidence})):[{text:'暂不足以判断练习重点；先取得匹配题目版本及有效作答记录。',evidence:[]}]};
  return {supplemental:supplementalReport(a),attemptId:a.id,unit:a.unit,contentVersion:a.contentVersion||'未知',rulesVersion:RULES,mappingVersion:known?'reading-skills-v2':'未确认',recordingVersion:a.recordingVersion||'未知',status:complete?'正式完成报告':'本次练习记录（尚未完成）',complete,rows,summary,skillAnalysis,recommendations,firstCorrect:rows.filter(r=>r.first?.correct).length,firstObserved:rows.filter(r=>r.first).length,firstWithoutHelp:independent.length,finalCorrect:rows.filter(r=>r.final?.correct).length,required:6,totalHints:coverage?events.filter(e=>e.type==='hint').length:null,retellDeclaration:retell,selfCheckConfirmed:selfcheck,strengths:strengths.length?strengths:[{text:'暂不足以判断',evidence:[]}],practice:practice.length?practice:[{text:'暂不足以判断',evidence:[]}],next:recommendations.map(r=>({text:r.exercise,evidence:r.evidence})),limitations:['单题表现只描述本次任务，不等于稳定能力；最终全部正确不等于独立掌握。','错题不能确定困难原因；未记录帮助不等于确认没有外部帮助。','复述只是学生自报，系统未评估复述质量。','自查不是独立掌握的证明；阅读页面操作不作为阅读能力证据。','不推断注意力、学习障碍、阅读年龄、发音、流利度或整体阅读水平。','词汇理解与独立推理没有专门测量，暂不足以判断。',...(!known?['内容版本或逐题映射不可核对，技能分析证据不足。']:[]),...(!coverage?['历史记录缺少当前帮助记录版本；没有提示事件不能补成“0 次”，独立程度暂不足以判断。']:[]),...(ignored?['有 '+ignored+' 条提交与实际题目或正确性记录不一致，已从分析中排除。']:[])]};
 }
 function samples(lessons){
  const unit=lessons[0];
  return ['首次独立完成（虚构）','提示重试后完成（虚构）','尚未完成（虚构）','技能表现混合（虚构）'].map((label,index)=>{
   const a=fresh(unit.id);a.id='demo-'+index;a.label=label;let n=0;
   const add=(type,extra={})=>a.events.push({id:a.id+'-event-'+(++n),type,...extra});
   for(const task of tasks){
    if(index===2&&task!=='what.answer')continue;
    if(index===3&&task.startsWith('how.'))continue;
    const [key,kind]=task.split('.'),q=unit[key+'Question'],answer=kind==='answer'?q.answerId:q.evidenceIds;
    if(index===1||(index===3&&task.startsWith('why.'))){add('submit',{task,answer:kind==='answer'?q.options.find(o=>o.id!==q.answerId).id:[unit.sentences.find(s=>!q.evidenceIds.includes(s.id)).id],correct:false});add('hint',{task});}
    add('submit',{task,answer,correct:true});
   }
   if(index!==2&&index!==3){add('retell',{method:'writing'});add('selfcheck');}
   return a;
  });
 }
 root.ReadingRecords={KEY,CONTENT,RULES,units,tasks,skills,SUPPLEMENT,SUPPLEMENTS,selectedSupplements,supplementalReport,configure,open,report,fresh,samples};
 if(typeof module!=='undefined')module.exports=root.ReadingRecords;
})(typeof globalThis!=='undefined'?globalThis:this);
