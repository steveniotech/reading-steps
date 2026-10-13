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
// One reserved header slot, one timer, no delayed score/state mutations.
function createCelebrationController(element, preference){
 let timer=null, generation=0;
 function stop(){generation++;if(timer!==null)clearTimeout(timer);timer=null;element.onanimationend=null;element.innerHTML='';}
 function play(){
  stop();if(preference.matches)return;
  const token=generation;
  element.innerHTML=Array.from({length:9},(_,index)=>`<span class="confetti-piece confetti-color-${index%3}" style="--x:${8+index*10}px;--turn:${index%2?24:-24}deg"></span>`).join('');
  function finish(){if(token!==generation)return;stop();}
  element.onanimationend=finish;
  timer=setTimeout(finish,1100);
 }
 preference.addEventListener('change',()=>{if(preference.matches)stop();});
 return {play,stop};
}
