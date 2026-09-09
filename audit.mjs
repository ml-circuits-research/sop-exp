#!/usr/bin/env node
/** Observable counterexamples. A reproduced limitation is not a successful prediction. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {createRuntime,hash} from './src/runtime.mjs';
import {synthesize,abstractPrograms} from './src/learning.mjs';
import {Versions} from './src/versions.mjs';
import {coverage} from './experiments/support/util.mjs';
import {demonstration,context} from './experiments/support/completion.mjs';

export async function runAudit() {
  const vm=await createRuntime(), supported=[], limitations=[], guards=[];
  const before=[['at','Alice','lab'],['at','book','lab']];
  const response=text=>vm.attempt('tasks.respond',{text,before,coverage:coverage(before)});
  supported.push({id:'simple-sentence',input:{text:'Alice picked up book.',before},actual:response('Alice picked up book.'),claim:'One supported sentence can update the supplied state and verbalize its delta.'});
  limitations.push({id:'pronoun-is-a-literal',input:{text:'She picked up book.',before},desired:'Resolve She to Alice when the discourse establishes that reference, or explicitly request disambiguation.',actual:response('She picked up book.'),capabilityMet:false,reason:'No discourse or entity resolver is called. She is an ordinary identifier and the state has no fact at(She,...).'});
  limitations.push({id:'punctuation-required',input:{text:'Alice picked up book',before},desired:'Accept the sentence without the final period.',actual:response('Alice picked up book'),capabilityMet:false,reason:'The hand-written whole-sentence pattern includes the final period as a token.'});
  limitations.push({id:'recognition-is-not-execution',input:{text:'Alice inspected book.',before},parsed:vm.run('language.parse',{text:'Alice inspected book.'}).value,desired:'Execute a defined inspection operation.',actual:response('Alice inspected book.'),capabilityMet:false,reason:'inspect has a parsing construction but no transition circuit in the selected library.'});
  limitations.push({id:'extension-not-in-default-parser',input:'Alice grabbed book.',direct:vm.run('language.grammar.extension',{text:'Alice grabbed book.'}).value,defaultParser:vm.run('language.parse',{text:'Alice grabbed book.'}).value,desired:'Enable the construction in the default parser.',capabilityMet:false,reason:'The source exists and is callable, but language.parse has an explicit list that does not include it.'});

  const training=[{input:{a:0,b:0},output:0}];
  const validation=[{input:{a:2,b:3},output:25},{input:{a:1,b:4},output:25}];
  const witness='@input input\n@a data.get source $input key "a"\n@b data.get source $input key "b"\n@s number.add left $a right $b\n@output number.multiply left $s right $s\n';
  vm.registerSource('audit.witness',witness);
  const actual=synthesize(vm,training,validation,{operations:['number.add','number.multiply','number.subtract'],maxNodes:3,maxCandidates:20000});
  limitations.push({id:'synthesis-pruning-can-miss-a-solution',training,validation,actual,witnessSource:witness,witnessResults:validation.map(e=>vm.run('audit.witness',e.input).value),desired:'Find a program satisfying both supplied example sets.',capabilityMet:false,reason:'Intermediate programs are deduplicated using training outputs only. On the all-zero training set their outputs collide; the necessary sum intermediate is dropped. unknown is not a completeness result, even for a representable program.'});

  const sources=['A','B','C'].map(p=>demonstration([['ask',p,p],['answer',p,p],['ack',p,p]]));
  const fit=abstractPrograms(sources);vm.registerSource('audit.coincident',fit.source);
  const c=context([['ask','Alice','Bob'],['answer','Bob','Alice']]);
  limitations.push({id:'coincident-demonstration-roles',demonstrations:sources,input:{context:c},actual:vm.attempt('audit.coincident',{context:c}),desired:[['ack','Alice','Bob']],learnedSlots:fit.slots,capabilityMet:false,reason:'The demonstrations never distinguish asker and respondent. Abstraction groups their identical value columns into one slot. Distinguishing roles requires discriminating demonstrations.'});

  const inconsistent=[['at','Alice','lab'],['at','Alice','office'],['at','book','lab']];
  limitations.push({id:'no-state-invariant-validator',input:{before:inconsistent,event:['take','Alice','book']},actual:vm.attempt('tasks.advance',{before:inconsistent,event:['take','Alice','book'],coverage:coverage(inconsistent)}),desired:'Reject two simultaneous locations for a person under the benchmark world contract.',capabilityMet:false,reason:'The core operates on tuples and does not enforce the test-world invariants on arbitrary caller input.'});

  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sop-review-promote-'));
  try {
    const store=new Versions(folder);
    const candidate='@input input\n@output data.identity value 999\n';
    let emptyRejected=false,reason='';
    try {store.propose(vm,'audit.empty',candidate,[]);} catch(e) {emptyRejected=true;reason=e.message;}
    guards.push({id:'empty-validation-rejected',emptyRejected,reason,active:store.active['audit.empty']??null});
    vm.registerSource('audit.dependency','@input input\n@output data.identity value 1\n');
    const parent='@input input\n@output audit.dependency\n';
    const promoted=store.propose(vm,'audit.parent',parent,[{input:{},output:1}]);
    const first=vm.run('audit.parent').value;
    vm.registerSource('audit.dependency','@input input\n@output data.identity value 2\n');
    store.load(vm,'audit.parent',promoted.hash);
    const replay=vm.run('audit.parent').value;
    limitations.push({id:'dependencies-not-pinned',sourceHash:promoted.hash,hashStillMatches:hash(vm.source('audit.parent'))===promoted.hash,first,replay,desired:'Replay the same result after unrelated dependency changes.',capabilityMet:false,reason:'Only the parent source is addressed by hash. Transitive dependencies and the runtime are not pinned by this activation store.'});
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
  guards.push({id:'negation-not-applied-positively',actual:response('Alice did not take book.')});
  guards.push({id:'unbound-output',actual:vm.attempt('generated.completion.unbound',{context:[['step0','pickup','Alice','book'],['step1','give','Alice','Bob','book']]})});
  guards.push({id:'budget-exhaustion',actual:vm.attempt('tasks.ancestors',{facts:[['parent','a','b']]},{budget:1})});
  return {schema:'sop-review-observations',node:process.version,scope:'Concrete successes, observed limitations and refusal/validation checks. Do not sum these into an accuracy score.',supported,limitations,guards};
}
if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const result=await runAudit();
  fs.writeFileSync(new URL('./results/audit.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({supported:result.supported.length,observedLimitations:result.limitations.length,guards:result.guards.length,results:'results/audit.json'},null,2));
}
