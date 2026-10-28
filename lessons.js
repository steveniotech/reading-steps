'use strict';
// Teacher-authored practice data. IDs remain stable when wording is edited.
const SELF_CHECK = ['Did I include the most important ideas?', 'Did I explain a reason or process when it mattered?', 'Did I use my own words?', 'Did I leave out small details I do not need?'];
const option = (id, text, feedback) => ({id, text, feedback});
const question = (prompt, options, answerId, evidenceIds, hint, evidenceHint, example) => ({prompt, options, answerId, evidenceIds, hint, evidenceHint, example});
const LESSONS = [
{
 id:'garden-sign',type:'Fiction',title:'A Sign for the Garden',
 sentences:[
 {id:'g1',text:'Maya’s class planted a small garden beside the school, but people kept stepping on the new plants.'},
 {id:'g2',text:'The plants were still tiny, so visitors did not notice them near the path.'},
 {id:'g3',text:'Maya wanted to protect the garden without blocking the path.'},
 {id:'g4',text:'She drew a bright sign that said, “New plants growing here. Please stay on the path.”'},
 {id:'g5',text:'Her teacher helped her place the sign where visitors could see it.'},
 {id:'g6',text:'The next day, Maya watched people read the sign and walk around the garden.'},
 {id:'g7',text:'The little plants now had room to grow.'}],
 keySentence:{sentenceId:'g2',about:'The tiny plants and the visitors.',tells:'Visitors did not notice the plants because the plants were tiny.'},
 whatQuestion:question('What is this mostly about?',[
 option('a','Maya drew a bright sign.','That happens in the text, but it is only one action. Think about the problem and the result, too.'),
 option('b','Maya used a sign to help protect a new garden.','Yes. This connects the garden problem, Maya’s action, and the result.'),
 option('c','Maya moved the garden inside the school.','The text does not say the garden moved. Look back at what Maya did.')],'b',['g1','g4','g6'],'Think about the problem, the action, and what changed.','Find the problem, what the sign said, and how visitors acted.','Maya used a sign to help protect a new garden.'),
 whyQuestion:question('Why did visitors step on the plants?',[
 option('a','The tiny plants were hard to notice.','Yes. The text explains that visitors did not notice the tiny plants.'),
 option('b','They wanted to pick flowers.','The text does not say visitors wanted flowers. Look for the stated reason.'),
 option('c','The teacher told them to.','The teacher helped place a sign. She did not tell people to step on plants.')],'a',['g2'],'Look for the sentence that explains what visitors did not notice.','One sentence gives both the size of the plants and why visitors missed them.','Visitors did not notice the plants because they were tiny.'),
 howQuestion:question('How did Maya help protect the garden?',[
 option('a','She blocked the path with plants.','Maya wanted to keep the path open. Look at her plan.'),
 option('b','She asked everyone to stay inside.','That action is not in the text. Read what the sign asked visitors to do.'),
 option('c','She made a sign, placed it with help, and visitors followed it.','Yes. These actions show how her plan worked.')],'c',['g4','g5','g6'],'Follow Maya’s actions, then look at what visitors did.','Find the sign, its placement, and the visitors’ response.','Maya made a sign. Her teacher helped place it, and visitors stayed on the path.'),
 teacherModel:{what:'I connect the problem in g1 with the action in g4 and the result in g6. The whole story is about protecting the garden with a sign.',why:'I read g2. It directly explains why visitors missed the tiny plants.',how:'I follow g4, g5, and g6: make the sign, place it, then watch visitors follow it.'},
 retellPrompt:'Tell how Maya helped the garden and why it needed help.',frames:'The garden had a problem: ___.\nMaya helped by ___.\nAfter that, ___.',teacherReference:'People stepped on the garden because the plants were hard to see. Maya made a sign with her teacher’s help. Visitors followed it, so the plants had room to grow.',selfCheck:SELF_CHECK
},
{
 id:'book-cart',type:'Fiction',title:'The Wobbly Book Cart',
 sentences:[
 {id:'b1',text:'Eli and Sam were taking a cart of books to their classroom when a wheel began to wobble.'},
 {id:'b2',text:'The cart leaned to one side, and a few books slid toward the edge.'},
 {id:'b3',text:'Eli stopped pushing because he did not want the books to fall.'},
 {id:'b4',text:'Sam asked their teacher for help while Eli held the cart still.'},
 {id:'b5',text:'The teacher brought a sturdy basket, and the children moved the books into it.'},
 {id:'b6',text:'Together, they carried the basket to the classroom and left the cart for repair.'},
 {id:'b7',text:'The class got its books safely, just in time for quiet reading.'}],
 keySentence:{sentenceId:'b3',about:'Eli.',tells:'He stopped pushing to keep the books from falling.'},
 whatQuestion:question('What is this mostly about?',[
 option('a','Two children found a safe way to move books when their cart wobbled.','Yes. This includes the problem, their solution, and the result.'),
 option('b','The children repaired a wheel by themselves.','The cart was left for repair. The children did not repair it.'),
 option('c','A few books slid toward the edge.','That is one detail about the problem. What does the whole story show?')],'a',['b1','b5','b6'],'Connect the cart problem with the way the books reached the room.','Find the cart problem, the new container, and how they finished the trip.','Eli and Sam found a safe way to move books after the cart began to wobble.'),
 whyQuestion:question('Why did Eli stop pushing the cart?',[
 option('a','He wanted to read a book in the hall.','The text does not give that reason. Look at what Eli wanted to prevent.'),
 option('b','He wanted to keep the books from falling.','Yes. The text states his reason directly.'),
 option('c','He had reached the classroom.','They reached the classroom later, after using a basket.')],'b',['b3'],'What did Eli not want to happen?','Find the sentence that tells why Eli stopped.','Eli stopped so the books would not fall.'),
 howQuestion:question('How did the children get the books to the classroom safely?',[
 option('a','They pushed the cart faster.','They stopped using the cart. Faster pushing was not their solution.'),
 option('b','They left all the books in the hall.','The class received the books. Look for the new way to carry them.'),
 option('c','They asked for help, moved the books to a basket, and carried it together.','Yes. That is the order of their solution.')],'c',['b4','b5','b6'],'Look for the actions after Eli stopped pushing.','Find the request for help, the move into the basket, and the trip to class.','Sam asked for help. They put the books in a basket and carried it together.'),
 teacherModel:{what:'I use b1 for the problem and b5–b6 for the solution. This is about getting books to class safely.',why:'In b3, Eli says what he wants to prevent: books falling.',how:'I follow b4–b6 in order. They ask for help, use a basket, and carry it together.'},
 retellPrompt:'Tell about the cart problem and how the children solved it.',frames:'When the cart ___, Eli ___.\nWith their teacher’s help, the children ___.\nIn the end, ___.',teacherReference:'The book cart began to wobble, so Eli stopped to keep the books from falling. Sam got their teacher, and they moved the books into a basket. They carried the books safely to class.',selfCheck:SELF_CHECK
},
{
 id:'paper-tray',type:'Informational Text',title:'A Tray for Reused Paper',
 sentences:[
 {id:'p1',text:'A classroom paper tray can help a class use less new paper.'},
 {id:'p2',text:'Sometimes a sheet has writing on only one side, while the other side is still blank.'},
 {id:'p3',text:'That blank side can be used again instead of taking a new sheet.'},
 {id:'p4',text:'First, check that the paper has a clean, blank side and no private information.'},
 {id:'p5',text:'Next, put it in a tray labeled “Paper to Use Again.”'},
 {id:'p6',text:'When someone needs paper for a sketch or practice work, they can take a sheet from the tray.'},
 {id:'p7',text:'Using the blank sides gives those sheets another job before they are recycled.'}],
 keySentence:{sentenceId:'p3',about:'The blank side of a sheet.',tells:'It can be used again, so someone does not need a new sheet.'},
 whatQuestion:question('What is this mostly about?',[
 option('a','Every sheet of paper must be thrown away.','The text explains how to use some paper again.'),
 option('b','The tray has a label.','The label is a small detail. Think about the tray’s purpose and use.'),
 option('c','A paper tray helps a class reuse blank sides and use less new paper.','Yes. This includes the purpose of the tray and how the class uses it.')],'c',['p1','p3','p6'],'Think about what the tray helps the whole class do.','Find the purpose, why a blank side is useful, and when a sheet is taken.','A classroom tray helps students reuse paper instead of taking new sheets.'),
 whyQuestion:question('Why can some used sheets replace new paper?',[
 option('a','They may still have a blank side to use.','Yes. A blank side can be used instead of a new sheet.'),
 option('b','Writing disappears in the tray.','The text does not say writing disappears.'),
 option('c','The label makes more paper.','A label shows where to put paper. It does not make paper.')],'a',['p2','p3'],'Look for what is still available on some used sheets.','One sentence describes the blank side; the next explains its use.','Some sheets have a blank side that can be used instead of new paper.'),
 howQuestion:question('How does the class use the paper tray?',[
 option('a','Put any paper in, then erase both sides.','The text says to check the paper first. It does not describe erasing.'),
 option('b','Check the paper, put it in the labeled tray, then take a sheet when needed.','Yes. These steps follow the text’s order.'),
 option('c','Take a new sheet, write on both sides, then hide it.','Those are not the steps for using this tray.')],'b',['p4','p5','p6'],'Follow the words “First,” “Next,” and “When.”','Choose the three sentences that give the checking, storing, and taking steps.','Check for a clean blank side and no private information. Put the sheet in the tray, then use it for practice or a sketch.'),
 teacherModel:{what:'I connect p1, p3, and p6. The tray helps students reuse paper for new work.',why:'I use p2 and p3 together. A used sheet may still have a blank side, so it can replace a new sheet.',how:'I follow p4–p6: check the sheet, place it in the tray, and take it for work.'},
 retellPrompt:'Explain why the tray is useful and how to use it.',frames:'The paper tray helps the class ___.\nA used sheet can help because ___.\nTo use the tray, ___.',teacherReference:'A paper tray helps a class use less new paper because some used sheets still have a blank side. Check each sheet, put suitable paper in the tray, and take a sheet when you need it for practice or a sketch.',selfCheck:SELF_CHECK
},
{
 id:'rain-path',type:'Informational Text',title:'Keeping Rain Away from the Door',
 sentences:[
 {id:'r1',text:'A school roof has a gutter along its edge to guide rainwater away from the doorway.'},
 {id:'r2',text:'Without a clear path away, water from the roof could collect near the door and make a puddle.'},
 {id:'r3',text:'When rain lands on the sloping roof, it runs down into the gutter.'},
 {id:'r4',text:'The gutter carries the water along the roof’s edge to a pipe called a downspout.'},
 {id:'r5',text:'The water flows down the pipe and out onto a splash block that points away from the door.'},
 {id:'r6',text:'The splash block guides the water toward a grassy area.'},
 {id:'r7',text:'Together, these parts give rainwater a path away from the entrance.'}],
 keySentence:{sentenceId:'r2',about:'Water from the roof.',tells:'Without a path away, it could collect near the door and make a puddle.'},
 whatQuestion:question('What is this mostly about?',[
 option('a','Rainwater stays on the school roof forever.','The text describes water moving off the roof.'),
 option('b','Parts of a school building guide rainwater away from the door.','Yes. This tells the shared purpose of the parts in the passage.'),
 option('c','A pipe is called a downspout.','That name is one detail. Think about what all the parts do together.')],'b',['r1','r7'],'Think about the job shared by the gutter, pipe, and splash block.','The opening and ending sentences state the shared purpose.','The gutter, downspout, and splash block guide rainwater away from the doorway.'),
 whyQuestion:question('Why does water from this roof need a path away from the door?',[
 option('a','So rain will stop falling.','The parts move water. The text does not say they stop rain.'),
 option('b','So the roof can hold more water.','The passage describes moving water off the roof.'),
 option('c','So it does not collect in a puddle near the door.','Yes. The text describes the puddle that could form without a path away.')],'c',['r2'],'Look for what could happen without a clear path away.','One sentence describes the possible problem near the door.','Without a path away, roof water could collect in a puddle near the door.'),
 howQuestion:question('How does rainwater travel from this roof to the grass?',[
 option('a','It runs into the gutter, through the downspout, and across the splash block.','Yes. The water follows these parts in that order.'),
 option('b','It moves from the grass up the pipe to the roof.','That reverses the direction described in the text.'),
 option('c','It goes through the doorway into the classroom.','The parts guide it away from the doorway, not into the classroom.')],'a',['r3','r4','r5','r6'],'Trace the water from the roof to the grassy area.','Find each part of the path: roof to gutter, gutter to pipe, pipe to block, block to grass.','Rainwater runs from the roof into the gutter, down the downspout, and across the splash block toward grass.'),
 teacherModel:{what:'I read r1 and r7. They state that these parts guide rainwater away from the entrance.',why:'I use r2. It explains that a puddle could form near the door without a path away.',how:'I trace r3–r6 in order: roof, gutter, downspout, splash block, grass.'},
 retellPrompt:'Explain the purpose of this water path and how it works.',frames:'These parts guide rainwater ___.\nThis helps because ___.\nWater travels from ___ to ___.',teacherReference:'The school’s gutter, downspout, and splash block guide rainwater away from the door so it does not collect there. Rain runs off the roof into the gutter, down the pipe, and across the block toward grass.',selfCheck:SELF_CHECK
}
];

// Specific evidence tasks make the authored target set explicit; this is not open-ended grading.
const EVIDENCE_TASKS = {
 'garden-sign': {
  what: 'Find the sentence that states the garden problem, the sentence with the sign’s message, and the sentence showing how visitors responded.',
  why: 'Find the sentence that directly explains why visitors did not notice the plants.',
  how: 'Find the sentence with the sign’s message, the sentence about placing it, and the sentence showing visitors’ response.'
 },
 'book-cart': {
  what: 'Find the sentence introducing the wobbly cart, the sentence about moving books into a basket, and the sentence about carrying it to class.',
  why: 'Find the sentence that directly states Eli’s reason for stopping.',
  how: 'Find the sentence about asking for help, the sentence about moving books into a basket, and the sentence about carrying it to class.'
 },
 'paper-tray': {
  what: 'Find the sentence stating the tray’s purpose, the sentence saying a blank side replaces new paper, and the sentence explaining when a sheet is taken.',
  why: 'Find the sentence describing a sheet with a blank side and the sentence explaining that the blank side can replace a new sheet.',
  how: 'Find the three sentences that explain checking the paper, putting it in the tray, and taking it when needed.'
 },
 'rain-path': {
  what: 'Find the opening sentence and the closing sentence that explain the shared purpose of the water path.',
  why: 'Find the sentence that directly describes the puddle that could form without a path away.',
  how: 'Find the four sentences tracing water from the roof into the gutter, through the pipe, across the block, and toward the grass.'
 }
};
LESSONS.forEach(lesson => ['what','why','how'].forEach(key => {
 lesson[key + 'Question'].evidenceTask = EVIDENCE_TASKS[lesson.id][key];
}));

// Audited against every authored prompt, option and target evidence set.
// These are analysis annotations only; content, correct answers and grading stay unchanged.
const READING_SKILL_VERSION='reading-skills-v2';
const READING_SKILL_AUDIT={
 'garden-sign':{
  what:{focus:'\u628a\u82b1\u56ed\u95ee\u9898、\u544a\u793a\u884c\u52a8\u4e0e\u7ed3\u679c\u8054\u7cfb\u8d77\u6765，\u9009\u62e9\u8986\u76d6\u5168\u6587\u7684\u610f\u601d。',basis:['g1','g4','g6']},
  why:{focus:'\u627e\u51fa\u6e38\u5ba2\u8e29\u5230\u690d\u7269\u7684\u660e\u786e\u539f\u56e0：\u690d\u7269\u5f88\u5c0f、\u4e0d\u6613\u770b\u89c1。',basis:['g2']},
  how:{focus:'\u7406\u89e3\u5236\u4f5c\u544a\u793a、\u8bf7\u4eba\u653e\u7f6e、\u6e38\u5ba2\u7167\u505a\u7684\u884c\u52a8\u8fc7\u7a0b。',basis:['g4','g5','g6']}
 },
 'book-cart':{
  what:{focus:'\u628a\u8f66\u8f6e\u95ee\u9898\u4e0e\u6362\u7bee\u5b50\u8fd0\u4e66\u7684\u89e3\u51b3\u529e\u6cd5\u8054\u7cfb\u8d77\u6765。',basis:['b1','b5','b6']},
  why:{focus:'\u627e\u5230 Eli \u505c\u63a8\u8f66\u7684\u660e\u786e\u539f\u56e0：\u9632\u6b62\u4e66\u6389\u4e0b。',basis:['b3']},
  how:{focus:'\u7406\u89e3\u6c42\u52a9、\u6362\u7bee\u5b50、\u4e00\u8d77\u642c\u8fd0\u7684\u884c\u52a8\u8fc7\u7a0b。',basis:['b4','b5','b6']}
 },
 'paper-tray':{
  what:{focus:'\u9009\u62e9\u6db5\u76d6\u7eb8\u76d8\u7528\u9014\u548c\u91cd\u590d\u4f7f\u7528\u7a7a\u767d\u9762\u7684\u5168\u6587\u610f\u601d。',basis:['p1','p3','p6']},
  why:{focus:'\u8054\u7cfb\u7a7a\u767d\u9762\u4ecd\u53ef\u4f7f\u7528\u4e0e\u66ff\u4ee3\u65b0\u7eb8\u7684\u660e\u786e\u8bf4\u660e。',basis:['p2','p3']},
  how:{focus:'\u7406\u89e3\u68c0\u67e5\u7eb8\u5f20、\u653e\u5165\u7eb8\u76d8、\u9700\u8981\u65f6\u53d6\u7528\u7684\u6b65\u9aa4。',basis:['p4','p5','p6']}
 },
 'rain-path':{
  what:{focus:'\u6982\u62ec\u6392\u6c34\u5404\u90e8\u4ef6\u628a\u96e8\u6c34\u5f15\u79bb\u95e8\u53e3\u7684\u5171\u540c\u7528\u9014。',basis:['r1','r7']},
  why:{focus:'\u8bc6\u522b\u539f\u6587\u660e\u8bf4\u7684\u79ef\u6c34\u98ce\u9669，\u800c\u975e\u63a8\u65ad\u672a\u5199\u660e\u7684\u539f\u56e0。',basis:['r2']},
  how:{focus:'\u6309\u539f\u6587\u8ffd\u8e2a\u5c4b\u9876、\u5929\u6c9f、\u843d\u6c34\u7ba1、\u5bfc\u6c34\u5757\u81f3\u8349\u5730\u7684\u8def\u7ebf。',basis:['r3','r4','r5','r6']}
 }
};
LESSONS.forEach(unit=>{
 unit.contentVersion='reading-2026-10-v1';
 for(const key of ['what','why','how']){
  const q=unit[key+'Question'],audit=READING_SKILL_AUDIT[unit.id][key];
  q.id=unit.id+'.'+key;
  const skill=key==='what'?'main-idea':key==='why'?'explicit-cause':'sequence';
  q.skills=[skill];q.evidenceSkill='text-evidence';
  q.analysis={version:READING_SKILL_VERSION,answer:{kind:'reading-comprehension',skill,focus:audit.focus,basis:audit.basis,limitation:key==='what'?'\u9009\u62e9\u6982\u62ec\u53e5，\u4e0d\u80fd\u8bc4\u4f30\u72ec\u7acb\u7ec4\u7ec7\u6458\u8981；\u6bcf\u7bc7\u4ec5\u4e00\u9053\u4e3b\u65e8\u9898。':key==='why'?'\u539f\u56e0\u5728\u539f\u6587\u4e2d\u660e\u786e\u8bf4\u660e，\u4e0d\u662f\u72ec\u7acb\u7684\u63a8\u7406\u6d4b\u91cf；\u6bcf\u7bc7\u4ec5\u4e00\u9053\u539f\u56e0\u9898。':'\u540c\u65f6\u6d89\u53ca\u660e\u786e\u5185\u5bb9\u4e0e\u987a\u5e8f；\u9009\u9879\u672a\u5355\u72ec\u63a7\u5236\u987a\u5e8f\u53d8\u91cf，\u4e0d\u80fd\u786e\u5b9a\u9519\u56e0。'},evidence:{kind:'reading-comprehension',skill:'text-evidence',focus:'\u6309\u8be5\u9898\u7ed9\u5b9a\u7ebf\u7d22\u5b9a\u4f4d\u76f4\u63a5\u652f\u6301\u53e5：'+audit.basis.join('、')+'。',basis:audit.basis,limitation:'\u4efb\u52a1\u5df2\u7ed9\u660e\u786e\u67e5\u627e\u7ebf\u7d22，\u6309\u56fa\u5b9a\u76ee\u6807\u53e5\u96c6\u5408\u68c0\u67e5；\u4e0d\u4ee3\u8868\u80fd\u81ea\u4e3b\u9009\u62e9\u6240\u6709\u5408\u7406\u8bc1\u636e，\u4e14\u4e0e\u5bf9\u5e94\u7406\u89e3\u9898\u4e0d\u72ec\u7acb。'}};
 }
});
