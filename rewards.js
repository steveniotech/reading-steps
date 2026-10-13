'use strict';
// Local presentation metadata. Passage content, answers, and sentence IDs stay in lessons.js.
const PRACTICE_BADGES = {
 'garden-sign': {name:'Garden Care',icon:'<path d="M32 49V29M32 35C17 35 15 23 15 19c12 0 17 6 17 16Zm0-7c0-12 10-17 19-17 0 12-7 18-19 17ZM21 49h22"/>'},
 'book-cart': {name:'Book Journey',icon:'<path d="M10 17c9-3 16-1 22 3 6-4 13-6 22-3v31c-9-3-16-1-22 3-6-4-13-6-22-3ZM32 20v31"/>'},
 'paper-tray': {name:'Paper Second Chance',icon:'<path d="M20 10h18l9 9v25H20ZM38 10v10h9M11 40v13h42V40M26 29h14M26 35h10"/>'},
 'rain-path': {name:'Rainwater Trail',icon:'<path d="M32 9C26 20 18 28 18 37a14 14 0 0 0 28 0c0-9-8-17-14-28ZM24 37c0 5 3 8 8 8"/>'}
};
// Keep ordinary evidence hints useful without giving away the exact sentence numbers.
const SAFE_EVIDENCE_HINTS = {'rain-path': {what:[
 'Look for sentences that explain the purpose of the water path.',
 'Find sentences about what these parts do together.'
]}};
// The key-sentence explanation gives the Why answer. For three passages it also
// identifies the entire one-sentence evidence answer; the paper passage needs two sentences.
const CLOSE_DISCLOSURES = {
 'garden-sign':['answer','evidence'], 'book-cart':['answer','evidence'],
 'paper-tray':['answer'], 'rain-path':['answer','evidence']
};
// One viewport-top overlay, one timer, no delayed score/state mutations.
// Clip out reading/task content even when it scrolls behind the fixed overlay.
function celebrationClip(bounds, protectedRects){
 const width=bounds.width,height=bounds.height;
 const blocked=protectedRects.map(rect=>({left:Math.max(0,rect.left-bounds.left-4),right:Math.min(width,rect.right-bounds.left+4),top:Math.max(0,rect.top-bounds.top-4),bottom:Math.min(height,rect.bottom-bounds.top+4)})).filter(rect=>rect.left<rect.right&&rect.top<rect.bottom);
 const xs=[...new Set([0,width,...blocked.flatMap(rect=>[rect.left,rect.right])])].sort((a,b)=>a-b);
 const ys=[...new Set([0,height,...blocked.flatMap(rect=>[rect.top,rect.bottom])])].sort((a,b)=>a-b);
 let path='';
 for(let x=0;x<xs.length-1;x++)for(let y=0;y<ys.length-1;y++){
  const left=xs[x],right=xs[x+1],top=ys[y],bottom=ys[y+1];
  if(!blocked.some(rect=>left<rect.right&&right>rect.left&&top<rect.bottom&&bottom>rect.top))path+=`M${left} ${top}H${right}V${bottom}H${left}Z`;
 }
 return path?`path("${path}")`:'polygon(0 0,0 0,0 0)';
}
function createCelebrationController(element, preference, surfaces=null){
 let timer=null, generation=0;
 function protectContent(){
  if(!surfaces)return;
  const rects=Array.from(surfaces.document.querySelectorAll('#task h2, #task .progress, #task fieldset, #task p, #task label, #task textarea, #task button, #passage, #passage-title, .read-controls')).map(node=>node.getBoundingClientRect());
  element.style.clipPath=celebrationClip(element.getBoundingClientRect(),rects);
 }
 function stop(){
  generation++;if(timer!==null)clearTimeout(timer);timer=null;element.onanimationend=null;element.innerHTML='';element.style.clipPath='';
  if(surfaces){surfaces.window.removeEventListener('scroll',protectContent,true);surfaces.window.removeEventListener('resize',protectContent);}
 }
 function play(){
  stop();if(preference.matches)return;
  const token=generation;
  protectContent();
  if(surfaces){surfaces.window.addEventListener('scroll',protectContent,true);surfaces.window.addEventListener('resize',protectContent);}
  element.innerHTML=Array.from({length:24},(_,index)=>`<span class="confetti-piece confetti-color-${index%4}" style="--x:${12+(index%12)*17}px;--y:${4+Math.floor(index/12)*16}px;--turn:${index%2?120:-120}deg"></span>`).join('');
  function finish(){if(token!==generation)return;stop();}
  element.onanimationend=finish;
  timer=setTimeout(finish,2100);
 }
 preference.addEventListener('change',()=>{if(preference.matches)stop();});
 return {play,stop};
}

// Created/unlocked only by the explicit Sound button. No files, storage, or input devices.
function createRewardSoundController(button, audioWindow){
 let enabled=false, context=null, generation=0;
 const voices=new Set();
 const ignore=result=>{if(result&&typeof result.catch==='function')result.catch(()=>{});};
 function update(){button.textContent=enabled?'Sound: On':'Sound: Off';button.setAttribute('aria-pressed',String(enabled));}
 function release(voice){
  voices.delete(voice);voice.oscillator.onended=null;
  try{voice.oscillator.disconnect();}catch{}
  try{voice.gain.disconnect();}catch{}
 }
 function stop(){
  generation++;
  for(const voice of [...voices]){try{voice.oscillator.stop();}catch{}release(voice);}
 }
 function reset(){
  enabled=false;stop();const previous=context;context=null;
  if(previous)try{ignore(previous.close());}catch{}
  update();
 }
 function unlock(){
  try{
   const AudioContext=audioWindow.AudioContext||audioWindow.webkitAudioContext;
   if(!AudioContext)return;
   context=new AudioContext();
   if(context.state==='suspended')ignore(context.resume());
  }catch{context=null;}
 }
 button.onclick=()=>{if(enabled){reset();return;}enabled=true;update();unlock();};
 function play(kind){
  if(!enabled||!context)return;
  stop();const token=generation,activeContext=context;
  function synthesize(){
   if(!enabled||token!==generation||context!==activeContext||activeContext.state!=='running')return;
   try{
    const notes=kind==='badge'?[523.25,659.25,783.99]:[659.25,783.99];
    const spacing=kind==='badge'?0.16:0.09,duration=kind==='badge'?0.26:0.20;
    const start=activeContext.currentTime;
    notes.forEach((frequency,index)=>{
     const oscillator=activeContext.createOscillator();
     let gain;
     try{gain=activeContext.createGain();}catch{try{oscillator.disconnect();}catch{}throw new Error('Audio unavailable');}
     const voice={oscillator,gain};
     voices.add(voice);
     voice.oscillator.type='sine';voice.oscillator.frequency.setValueAtTime(frequency,start);
     const at=start+index*spacing;
     voice.gain.gain.setValueAtTime(0,at);
     voice.gain.gain.linearRampToValueAtTime(0.035,at+0.025);
     voice.gain.gain.linearRampToValueAtTime(0,at+duration);
     voice.oscillator.connect(voice.gain);voice.gain.connect(activeContext.destination);
     voice.oscillator.onended=()=>release(voice);
     voice.oscillator.start(at);voice.oscillator.stop(at+duration);
    });
   }catch{stop();}
  }
  try{
   if(activeContext.state==='suspended'){
    const resumed=activeContext.resume();
    if(resumed&&typeof resumed.then==='function')ignore(resumed.then(synthesize));
   }else synthesize();
  }catch{stop();}
 }
 update();return {play,reset,get enabled(){return enabled;}};
}
