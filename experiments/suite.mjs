import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {performance}from'node:perf_hooks';
import {createRuntime,walk,hash}from'../src/runtime.mjs';
import {parse,serialize}from'../src/parser.mjs';
import {key,sameFacts,applyPatch,delta}from'../src/values.mjs';
import {abstractPrograms,synthesize}from'../src/learning.mjs';
import {SourceIndex}from'../src/retrieval.mjs';
import {Versions}from'../src/versions.mjs';
import {independentTransition}from'./support/oracle.mjs';
import {coverage,readLines,rng,json}from'./support/util.mjs';
import {families,trace,demonstration,context}from'./support/completion.mjs';
const ROOT=path.resolve(import.meta.dirname,'..');
const p=(...x)=>path.join(ROOT,...x);
const generate=(name,source)=>{const file=p('commands',...name.split('.'))+'.sop';fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,source);};
function record(rows){return {cases:rows.length,correct:rows.filter(x=>x.correct).length};}
function allWorlds(){const out=[];const people=['EP0','EP1'],items=['EO0','EO1','EO2'],places=['EL0','EL1'];for(let mask=0;mask<4;mask++)for(let configuration=0;configuration<64;configuration++){const before=people.map((v,i)=>['at',v,places[(mask>>i)&1]]);let c=configuration;for(const item of items){const option=c%4;c=Math.floor(c/4);if(option<2)before.push(['at',item,places[option]]);else before.push(['holds',people[option-2],item],['at',item,places[(mask>>(option-2))&1]]);}for(const a of people){for(const l of places)out.push({before,event:['travel',a,l]});for(const o of items){out.push({before,event:['take',a,o]},{before,event:['drop',a,o]});for(const b of people)out.push({before,event:['give',a,b,o]});}}}return out;}
function prediction(vm,idx,ep){const frame={...ep,coverage:coverage(ep.before)};const effects=idx.retrieve([ep.event[0]]).flatMap(n=>vm.run(n,frame).value);return applyPatch(ep.before,effects);}
export async function runSuite(){
 const vm=await createRuntime(),results={schema:'sop-research-evidence',node:process.version,platform:`${process.platform}/${process.arch}`,scope:'restricted SOP execution profile; no external LLM or network'};
 let start=performance.now();
 // 01. Execute supplied transition programs; compare with stored observations and a separate oracle.
 const transitionRows=[];let expectedMismatch=0,oracleMismatch=0;
 for(const seed of [101,202,303,404,505]){
  const names=[...vm.registry.keys()].filter(n=>n.startsWith(`knowledge.transitions.model${seed}.`)),idx=new SourceIndex(vm,names);
  for(const ep of readLines(p('data',`transitions${seed}.jsonl`))){
   const after=prediction(vm,idx,ep),correct=sameFacts(after,ep.after),oracle=sameFacts(after,independentTransition(ep.before,ep.event));
   if(!correct)expectedMismatch++;if(!oracle)oracleMismatch++;
   transitionRows.push({id:ep.id,model:seed,before:ep.before,event:ep.event,expected:ep.after,actual:after,correct,oracle});
  }
 }
 json(p('results','transition-records.json'),transitionRows);
 const idx=new SourceIndex(vm,[...vm.registry.keys()].filter(n=>n.startsWith('knowledge.transitions.model101.')));
 const exhaustive=allWorlds().map((ep,i)=>{const actual=prediction(vm,idx,ep),expected=independentTransition(ep.before,ep.event);return {i,...ep,expected,actual,correct:sameFacts(actual,expected)};});
 json(p('results','exhaustive-records.json'),exhaustive);
 results.transitions={...record(transitionRows),bundles:5,suppliedSources:40,expectedMismatch,oracleMismatch,exhaustive:record(exhaustive),exhaustiveBundles:1,seconds:(performance.now()-start)/1000,scope:'fixed supplied SOP programs; no training of transition rules is performed by this suite'};
 console.log('transitions',results.transitions);
 // 02. New learning uses aligned SOP demonstrations. Four structural families.
 const completions=[],wrongRoles=[];const learned=[];let episodicExactMatches=0;
 for(const [fi,f]of families.entries()){
  const sources=[0,1,2].map(i=>demonstration(trace(f,[`T${i}P`,`T${i}Q`,`T${i}O`,`T${i}L`])));
  const episodeKeys=new Set([0,1,2].map(i=>key(context(trace(f,[`T${i}P`,`T${i}Q`,`T${i}O`,`T${i}L`])))));
  const fit=abstractPrograms(sources),name=`generated.completion.family${fi}`;vm.registerSource(name,fit.source);generate(name,fit.source);learned.push({name,slots:fit.slots,demonstrations:3});
  for(let i=0;i<250;i++){const tr=trace(f,[`U${i}P`,`U${i}Q`,`U${i}O`,`U${i}L`]),actual=vm.run(name,{context:context(tr)}).value;if(episodeKeys.has(key(context(tr))))episodicExactMatches++;completions.push({family:fi,i,input:{context:context(tr)},expected:[tr[2]],actual,correct:key(actual)===key([tr[2]])});
   if(i<100){const bad=context(tr);bad[1][2]='UNMATCHED'+i;const actual=vm.run(name,{context:bad}).value;wrongRoles.push({family:fi,i,input:{context:bad},expected:[],actual,correct:actual.length===0});}
  }
 }
 const undecidable=[0,1,2].map(i=>demonstration([['pickup',`A${i}`,`X${i}`],['give',`A${i}`,`B${i}`,`X${i}`],['travel',`B${i}`,`L${i}`,`M${i}`]]));
 const ufit=abstractPrograms(undecidable);vm.registerSource('generated.completion.unbound',ufit.source);generate('generated.completion.unbound',ufit.source);
 const unbound=Array.from({length:50},(_,i)=>vm.attempt('generated.completion.unbound',{context:context([['pickup',`Z${i}`,`X${i}`],['give',`Z${i}`,`Y${i}`,`X${i}`]])}).status==='unknown');
 results.graphAbstraction={...record(completions),learned,wrongRoles:record(wrongRoles),unboundCases:unbound.length,unboundAbstentions:unbound.filter(Boolean).length,episodicExactMatches,supervision:'12 aligned executable SOP demonstrations; not induction of transitions from raw text'};
 json(p('results','completion-records.json'),completions);
 json(p('results','wrong-role-records.json'),wrongRoles);
 console.log('graph abstraction',results.graphAbstraction.cases);
 // 03. Observation-only synthesis in the binary numeric profile. Test oracle outside learner.
 const fns=[(a,b)=>2*a+b,(a,b)=>a*b+a,(a,b)=>(a+b)*(a+b)];const synths=[],numericRecords=[];
 for(const seed of [17,29,41])for(const [task,fn]of fns.entries()){
  const random=rng(seed*100+task),pool=[];
  for(let a=-8;a<=8;a++)for(let b=-9;b<=9;b++)pool.push({input:{a,b},output:fn(a,b)});
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const training=pool.slice(0,12),validation=pool.slice(12,20),tests=pool.slice(20,220);
  const fit=vm.run('learning.numeric',{training,validation}).value;
  if(fit.status!=='found'){synths.push({seed,task,status:fit.status,correct:0,cases:200});continue;}
  const name=`generated.numeric.seed${seed}task${task}`;vm.registerSource(name,fit.source);generate(name,fit.source);
  let correct=0;const tested=[];for(const e of tests){const actual=vm.run(name,e.input).value,isCorrect=actual===e.output;if(isCorrect)correct++;tested.push({...e,actual,correct:isCorrect});}numericRecords.push({seed,task,training,validation,source:fit.source,tests:tested});
  synths.push({seed,task,cases:tests.length,correct,training:training.length,validation:validation.length,disjointInputs:new Set([...training,...validation,...tests].map(e=>key(e.input))).size===220,cost:fit.cost,candidates:fit.evaluated,validationRejected:fit.validationRejected,status:fit.status});
 }
 const tooSmall=synthesize(vm,[{input:{a:2,b:3},output:7},{input:{a:5,b:-1},output:9},{input:{a:-3,b:7},output:1}],[],{operations:['number.add','number.multiply','number.subtract'],maxNodes:1});
 results.observationSynthesis={runs:synths,cases:synths.reduce((s,r)=>s+r.cases,0),correct:synths.reduce((s,r)=>s+r.correct,0),insufficientVocabularyOrDepth:tooSmall.status,scope:'binary numeric operations; a sanity test of graph synthesis, not evidence of language acquisition'};
 console.log('synthesis',results.observationSynthesis.correct);
 json(p('results','numeric-records.json'),numericRecords);
 // 04. Unique controlled-language sentences and end-to-end state transitions.
 const grammar=JSON.parse(fs.readFileSync(p('data','language-fixtures.json'))),cnl=[];
 for(const [name,tokens,verb,roles]of grammar)for(let i=0;i<100;i++){
  const env={p:`Alice${i}`,q:`Bob${i}`,o:`book${i}`,l:`lab${i}`};const text=tokens.map(t=>env[t]??t).join(' ').replace(/ \.$/,'.'),target=[verb,...roles.map(k=>env[k])];
  const actual=vm.run('language.parse',{text}).value;cnl.push({name,i,input:text,expected:[target],actual,correct:key(actual)===key([target])});
 }
 const unknown=['Alice did not take book.','Alice might take book.','Who took book?','The book was taken by Alice.','Alice took book and Bob left.','Alice grabbed book.'];
 const unsupported=[];for(let i=0;i<50;i++)for(const text of unknown)unsupported.push(vm.run('language.parse',{text:text.replaceAll('Alice','Alice'+i)}).value.length===0);
 const pipeline=[];
 for(let i=0;i<100;i++){let before=[['at',`A${i}`,'lab'],['at',`O${i}`,'lab']];for(const [text,event]of [[`A${i} picked up O${i}.`,['take',`A${i}`,`O${i}`]],[`A${i} travelled to office.`,['travel',`A${i}`,'office']],[`A${i} put down O${i}.`,['drop',`A${i}`,`O${i}`]]]){
  const r=vm.run('tasks.respond',{text,before,coverage:coverage(before)}).value;const gold=independentTransition(before,event);pipeline.push({i,text,before,event,expected:gold,actual:r.after,outputText:r.text,correct:sameFacts(r.after,gold)});before=r.after;
 }}
 results.language={...record(cnl),distinctSentences:cnl.length,constructions:grammar.length,unsupportedCases:unsupported.length,unsupportedRejected:unsupported.filter(Boolean).length,endToEnd:record(pipeline),scope:'hand-authored whole-sentence token matching; no learned parser'};
 json(p('results','language-records.json'),cnl);json(p('results','pipeline-records.json'),pipeline);
 // 05. Relational composition through ordinary SOP invocations and generic fixed point.
 const facts=Array.from({length:40},(_,i)=>['parent','p'+i,'p'+(i+1)]);const closure=vm.run('tasks.ancestors',{facts},{budget:5000000}).value;
 const proofs=[];for(const d of [1,2,4,8,16,32,40]){proofs.push({distance:d,correct:closure.facts.some(f=>key(f)===key(['ancestor','p0','p'+d]))});proofs.push({distance:-d,correct:!closure.facts.some(f=>key(f)===key(['ancestor','p'+d,'p0']))});}
 const cyclic=vm.run('tasks.ancestors',{facts:[['parent','a','b'],['parent','b','a']]}).value;
 const truncated=vm.attempt('tasks.ancestors',{facts},{budget:10});
 results.composition={...record(proofs),chainLength:40,derivedFacts:closure.facts.length-facts.length,rounds:closure.rounds,cycleTerminates:cyclic.status==='complete',truncationStatus:truncated.status,scope:'one hand-authored recursive relation family; no large retrieval workload'};
 // 06. Independent round-trip checker; not used by the deployed summarizer.
 function parseSummary(text){const added=[],removed=[];for(const s of text.split('.').map(s=>s.trim()).filter(Boolean)){let m;if(m=s.match(/^(\w+) is now at (\w+)$/))added.push(['at',m[1],m[2]]);else if(m=s.match(/^(\w+) is no longer at (\w+)$/))removed.push(['at',m[1],m[2]]);else if(m=s.match(/^(\w+) now holds (\w+)$/))added.push(['holds',m[1],m[2]]);else if(m=s.match(/^(\w+) no longer holds (\w+)$/))removed.push(['holds',m[1],m[2]]);else throw new Error('Unknown generated clause: '+s);}return {added,removed};}
 const summaries=[];for(let i=0;i<500;i++){const before=[['at','P'+i,'A'],['at','O'+i,'A'],['holds','P'+i,'O'+i]],after=[['at','P'+i,'B'],['at','O'+i,'B']];const text=vm.run('tasks.summarize',{before,after}).value,a=parseSummary(text),b=delta(before,after);summaries.push({i,before,after,text,decoded:a,expected:b,correct:sameFacts(a.added,b.added)&&sameFacts(a.removed,b.removed)});}
 results.summarization={...record(summaries),unsupportedFactStatus:vm.attempt('tasks.summarize',{before:[],after:[['unknownRelation','A','B']]}).status,scope:'complete delta realization over two relations; not document abstraction'};
 json(p('results','summary-records.json'),summaries);
 // 07. Preserve multiple readings; contextual support is an explicit hand-authored policy.
 const ambiguity=[];for(let i=0;i<400;i++){const a='A'+i,b='B'+i,t='T'+i,kind=i%4;const facts=kind===0?[['uses',a,t]]:kind===1?[['has',b,t]]:kind===2?[]:[['uses',a,t],['has',b,t]];const result=vm.run('tasks.ambiguity',{text:`${a} saw ${b} with the ${t}.`,facts}).value;ambiguity.push({i,input:{text:`${a} saw ${b} with the ${t}.`,facts},expected:kind<2?(kind===0?'instrument':'modifier'):'ambiguous',actual:result,correct:kind<2?result.status==='resolved'&&result.selected[1]===(kind===0?'instrument':'modifier'):result.status==='ambiguous'&&result.candidates.length===2});}
 results.ambiguity={...record(ambiguity),scope:'two supplied readings and a support-selection policy, not general disambiguation'};
 json(p('results','ambiguity-records.json'),ambiguity);
 // 08. Revision gating and replay. Validation is evidence, not universal proof.
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sop-versions-')),versions=new Versions(folder),phase=[];
 const simple=k=>`@input input\n@a data.get source $input key "a"\n@output number.add left $a right ${k}\n`;
 for(let k=1;k<=3;k++){const tests=[1,2,3].map(a=>({input:{a},output:a+k}));phase.push(versions.propose(vm,'memory.phase'+k,simple(k),tests));}
 const original=versions.active['memory.phase1'];const bad=versions.propose(vm,'memory.phase1',simple(7),[1,2,3].map(a=>({input:{a},output:a+1})));
 const preserved=versions.active['memory.phase1']===original;const replay=new Versions(folder);replay.load(vm,'memory.phase1',original);
 results.versions={acceptedPhases:phase.filter(r=>r.accepted).length,rejectedConflictingRevision:!bad.accepted,activeVersionPreserved:preserved,replayValue:vm.run('memory.phase1',{a:9}).value,scope:'regression-gated, single-process metadata activation; no automatic drift adaptation'};
 fs.rmSync(folder,{recursive:true,force:true});
 // 09. Kernel frozen under a new lexical construction and opaque vocabulary.
 const nativeHash=()=>hash(walk(p('src')).concat(walk(p('commands')).filter(f=>f.endsWith('.mjs'))).sort().map(f=>fs.readFileSync(f)).join('\n'));
 const beforeHash=nativeHash();const extra=vm.source('language.grammar.take1').replace('"picked"','"grabbed"').replace('arg2 "up" ','').replace('arg3 $o arg4 "."','arg2 $o arg3 "."');
 vm.registerSource('language.grammar.extension',extra);generate('language.grammar.extension',extra);
 let extensionCorrect=0;for(let i=0;i<100;i++)if(key(vm.run('language.grammar.extension',{text:`P${i} grabbed O${i}.`}).value)===key([['take','P'+i,'O'+i]]))extensionCorrect++;
 const renamedNames=[];for(const n of idx.names){const ast=parse(vm.source(n));for(const node of ast.nodes)for(const t of node.tokens)if(t.kind==='literal'&&typeof t.value==='string')for(const [a,b]of [['at','R17'],['holds','R22'],['travel','E7'],['take','E3'],['drop','E8'],['give','E9']])if(t.value===a)t.value=b;const name=n.replace('knowledge.transitions.model101','opaque');vm.registerSource(name,serialize(ast));renamedNames.push(name);}
 const rename=f=>f.map((v,i)=>i? v:({at:'R17',holds:'R22',travel:'E7',take:'E3',drop:'E8',give:'E9'}[v]??v));const ri=new SourceIndex(vm,renamedNames);let opaqueCorrect=0;
 for(const ep of readLines(p('data','transitions101.jsonl')).slice(0,100)){const before=ep.before.map(rename),event=rename(ep.event),frame={before,event,coverage:coverage(before,['R17','R22'])};const patch=ri.retrieve([event[0]]).flatMap(n=>vm.run(n,frame).value);if(sameFacts(applyPatch(before,patch),ep.after.map(rename)))opaqueCorrect++;}
 results.frozenKernel={beforeHash,afterHash:nativeHash(),unchanged:beforeHash===nativeHash(),extension:{cases:100,correct:extensionCorrect},opaqueVocabulary:{cases:100,correct:opaqueCorrect},scope:'extension uses a new SOP file; no runtime/native changes'};
 // 10. Causal checks: semantically broken SOP sources must fail held-out observations.
 const mutationResults=[];const episodes=readLines(p('data','transitions101.jsonl'));
 const take=idx.names.find(n=>n.includes('.take.')),takeAst=parse(vm.source(take));
 for(const [label,target]of [['remove-absence','relation.absent'],['remove-first-state-join','relation.join']]){
  const ast=structuredClone(takeAst);const node=ast.nodes.find(n=>n.command===target&&(target!=='relation.join'||n.tokens.some(t=>t.kind==='value'&&t.name==='state')));if(!node)continue;
  const rowsAt=node.tokens.findIndex(t=>t.kind==='literal'&&t.value==='rows'),source=node.tokens[rowsAt+1];node.command='data.identity';node.tokens=[{kind:'literal',value:'value'},source];vm.registerSource(take,serialize(ast));
  let differences=0;for(const ep of episodes.filter(e=>e.event[0]==='take'))try{if(!sameFacts(prediction(vm,idx,ep),ep.after))differences++;}catch{differences++;}
  mutationResults.push({label,differences,killed:differences>0});vm.registerSource(take,serialize(takeAst));
 }
 const say=vm.source('language.say.atAdded');vm.registerSource('language.say.atAdded',say.replace('is now at','is no longer at'));const wrong=vm.run('tasks.summarize',{before:[],after:[['at','A','B']]}).value;mutationResults.push({label:'reverse-summary-polarity',differences:parseSummary(wrong).added.length===0?1:0,killed:parseSummary(wrong).added.length===0});vm.registerSource('language.say.atAdded',say);
 results.mutations={mutants:mutationResults,killed:mutationResults.filter(x=>x.killed).length,total:mutationResults.length};
 // Positive, stale and missing coverage are separate from unsupported events.
 const ep={before:[['at','A','L'],['at','O','L']],event:['take','A','O']};
 const missing=vm.attempt(take,ep),stale=vm.attempt(take,{...ep,coverage:coverage([])}),closed=vm.attempt(take,{...ep,coverage:coverage(ep.before)});
 results.epistemicBoundaries={missingCoverage:missing.status,staleCoverage:stale.status,completeCoverage:closed.status,unsupportedEvent:vm.attempt('tasks.advance',{before:ep.before,event:['teleport','A','B'],coverage:coverage(ep.before)}).status};
 // Inventory is about implementation size, not an intelligence measure.
 const all=walk(p('commands'));results.inventory={sopFiles:all.filter(f=>f.endsWith('.sop')).length,nativeCommands:all.filter(f=>f.endsWith('.mjs')).length,hostSourceLines:walk(p('src')).concat(all.filter(f=>f.endsWith('.mjs'))).reduce((s,f)=>s+fs.readFileSync(f,'utf8').split('\n').length,0)};
 results.totalSeconds=(performance.now()-start)/1000;
 json(p('results','summary.json'),results);
 return results;
}
