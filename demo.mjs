#!/usr/bin/env node
/** Runnable examples used in the guide. No training or test oracle is required. */
import {createRuntime} from './src/runtime.mjs';
const vm=await createRuntime();
const closed=facts=>({predicates:['at','holds'],snapshot:JSON.stringify(facts.map(JSON.stringify).sort())});
function show(title,result){console.log(`\n${title}\n${JSON.stringify(result,null,2)}`);}
let before=[['at','Alice','lab'],['at','book','lab']];
for(const text of ['Alice picked up book.','Alice travelled to office.','Alice put down book.']) {
  const r=vm.attempt('tasks.respond',{text,before,coverage:closed(before)});
  show(text,r.status==='complete'?r.value:r);
  if(r.status==='complete')before=r.value.after;
}
show('Continuare pe evenimente structurate',vm.attempt('generated.completion.family0',{context:[['step0','pickup','Ana','manual'],['step1','inspect','Ana','manual']]}));
show('Program numeric deja sintetizat: 2*a+b pentru a=4, b=3',vm.run('generated.numeric.seed17task0',{a:4,b:3}));
const initial=[['at','Alice','lab'],['at','book','lab']];
show('Negare nesuportată',vm.attempt('tasks.respond',{text:'Alice did not take book.',before:initial,coverage:closed(initial)}));
show('LIMITĂ: She rămâne identificator, nu este rezolvat ca Alice',vm.attempt('tasks.respond',{text:'She picked up book.',before:initial,coverage:closed(initial)}));
