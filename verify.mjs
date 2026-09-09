#!/usr/bin/env node
/** Checks stored evidence and distribution integrity. Recompute with reproduce.mjs. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRuntime,walk,hash} from './src/runtime.mjs';
import {sameFacts,key} from './src/values.mjs';
import {independentTransition} from './experiments/support/oracle.mjs';
import {verifyIntegrity} from './tools/integrity.mjs';
const root=import.meta.dirname,read=n=>JSON.parse(fs.readFileSync(path.join(root,'results',n),'utf8'));
const checks=[],s=read('summary.json');
function check(name,fn){fn();checks.push(name);}
function complete(r,n){assert.equal(r.cases,n);assert.equal(r.correct,n);}
check('distribution source/data/docs manifest',()=>verifyIntegrity(root));
check('supplied transition programs: stored observations and independent evaluator',()=>{
 const rows=read('transition-records.json');assert.equal(rows.length,4800);
 const fixtures=new Map();for(const seed of [101,202,303,404,505])for(const line of fs.readFileSync(path.join(root,'data',`transitions${seed}.jsonl`),'utf8').trim().split('\n')){const r=JSON.parse(line);fixtures.set(seed+':'+r.id,r);}
 for(const r of rows){const fixture=fixtures.get(r.model+':'+r.id);assert(fixture);assert(sameFacts(r.before,fixture.before));assert.equal(key(r.event),key(fixture.event));assert(sameFacts(r.expected,fixture.after));assert(sameFacts(r.actual,r.expected));assert(sameFacts(r.actual,independentTransition(r.before,r.event)));assert(r.correct&&r.oracle);}
 complete(s.transitions,4800);assert.equal(s.transitions.expectedMismatch+s.transitions.oracleMismatch,0);
});
check('finite-world exhaustiveness is limited to one bundle and 7168 unique cases',()=>{
 const rows=read('exhaustive-records.json');assert.equal(rows.length,7168);assert.equal(new Set(rows.map(r=>key([r.before.map(key).sort(),r.event]))).size,7168);
 for(const r of rows){assert(sameFacts(r.actual,independentTransition(r.before,r.event)));assert(sameFacts(r.actual,r.expected));assert(r.correct);}
 complete(s.transitions.exhaustive,7168);assert.equal(s.transitions.exhaustiveBundles,1);
});
check('aligned SOP abstraction: positive, role-perturbed and unbound cases remain separate',()=>{
 const rows=read('completion-records.json'),wrong=read('wrong-role-records.json');assert.equal(rows.length,1000);assert.equal(wrong.length,400);
 assert(rows.every(r=>r.correct&&key(r.actual)===key(r.expected)));assert(wrong.every(r=>r.correct&&r.actual.length===0));
 complete(s.graphAbstraction,1000);complete(s.graphAbstraction.wrongRoles,400);assert.equal(s.graphAbstraction.unboundAbstentions,50);assert.equal(s.graphAbstraction.episodicExactMatches,0);
});
check('numeric synthesis: 9 runs, selection data are disjoint from final test within each run',()=>{
 const rows=read('numeric-records.json');assert.equal(rows.length,9);let total=0;
 const targets=[(a,b)=>2*a+b,(a,b)=>a*b+a,(a,b)=>(a+b)*(a+b)];
 for(const r of rows){assert.equal(r.training.length,12);assert.equal(r.validation.length,8);assert.equal(r.tests.length,200);assert.equal(new Set([...r.training,...r.validation,...r.tests].map(e=>key(e.input))).size,220);for(const e of r.tests){assert(e.correct);assert.equal(e.actual,targets[r.task](e.input.a,e.input.b));assert.equal(e.output,e.actual);total++;}}
 complete(s.observationSynthesis,total);assert.equal(total,1800);assert(s.observationSynthesis.runs.every(r=>r.disjointInputs&&r.status==='found'));assert.equal(s.observationSynthesis.insufficientVocabularyOrDepth,'unknown');
});
check('controlled patterns and three-action pipeline, not general language comprehension',()=>{
 const rows=read('language-records.json');assert.equal(rows.length,1200);assert.equal(new Set(rows.map(r=>r.input)).size,1200);assert(rows.every(r=>r.correct&&key(r.actual)===key(r.expected)));
 const pipeline=read('pipeline-records.json');assert.equal(pipeline.length,300);assert(pipeline.every(r=>r.correct&&sameFacts(r.actual,independentTransition(r.before,r.event))));
 complete(s.language,1200);complete(s.language.endToEnd,300);assert.equal(s.language.unsupportedRejected,300);
});
check('delta verbalization, not a document-summary benchmark',()=>{
 const rows=read('summary-records.json');assert.equal(rows.length,500);assert(rows.every(r=>r.correct&&sameFacts(r.decoded.added,r.expected.added)&&sameFacts(r.decoded.removed,r.expected.removed)));
 complete(s.summarization,500);assert.equal(s.summarization.unsupportedFactStatus,'unknown');
});
check('two-reading policy and one recursive-relation family',()=>{
 const rows=read('ambiguity-records.json');assert.equal(rows.length,400);assert(rows.every(r=>r.correct&&(r.expected==='ambiguous'?r.actual.status==='ambiguous'&&r.actual.candidates.length===2:r.actual.status==='resolved'&&r.actual.selected[1]===r.expected)));
 complete(s.ambiguity,400);complete(s.composition,14);assert.equal(s.composition.derivedFacts,820);assert(s.composition.cycleTerminates);assert.equal(s.composition.truncationStatus,'unknown');
});
check('source activation is a regression gate, not automatic concept-drift learning',()=>{assert.equal(s.versions.acceptedPhases,3);assert(s.versions.rejectedConflictingRevision&&s.versions.activeVersionPreserved);assert.equal(s.versions.replayValue,10);});
check('native implementation stays unchanged during the lexical and predicate-renaming tests',()=>{
 const files=walk(path.join(root,'src')).concat(walk(path.join(root,'commands')).filter(f=>f.endsWith('.mjs'))).sort();const current=hash(files.map(f=>fs.readFileSync(f)).join('\n'));assert.equal(current,s.frozenKernel.beforeHash);assert.equal(current,s.frozenKernel.afterHash);complete(s.frozenKernel.extension,100);complete(s.frozenKernel.opaqueVocabulary,100);
});
check('three concrete wrong-program mutations are detected',()=>{assert.equal(s.mutations.killed,3);assert.equal(s.mutations.total,3);assert(s.mutations.mutants.every(r=>r.differences>0&&r.killed));});
check('coverage, unbound values and unsupported events are not boolean false',()=>{assert.equal(s.epistemicBoundaries.missingCoverage,'unknown');assert.equal(s.epistemicBoundaries.staleCoverage,'unknown');assert.equal(s.epistemicBoundaries.unsupportedEvent,'unknown');});
check('observed failures remain explicit, not included as successful capability tests',()=>{
 const a=read('audit.json'),find=id=>a.limitations.find(r=>r.id===id);
 assert.equal(a.limitations.length,8);assert(a.limitations.every(r=>r.capabilityMet===false));
 assert.equal(find('pronoun-is-a-literal').actual.value.event[1],'She');assert.equal(find('synthesis-pruning-can-miss-a-solution').actual.status,'unknown');assert.deepEqual(find('synthesis-pruning-can-miss-a-solution').witnessResults,[25,25]);assert.equal(find('dependencies-not-pinned').first,1);assert.equal(find('dependencies-not-pinned').replay,2);
 assert(a.guards.find(r=>r.id==='empty-validation-rejected').emptyRejected);
});
const vm=await createRuntime();
check('every active source parses and its direct static calls resolve',()=>{let sop=0,native=0;for(const name of vm.registry.keys()){const r=vm.compile(name);if(r.kind==='sop'){sop++;for(const n of r.ast.nodes)assert(vm.registry.has(n.command));}else native++;}assert.equal(sop,s.inventory.sopFiles);assert.equal(native,s.inventory.nativeCommands);});
check('68 regression checks are distinguished from prediction accuracy',()=>{const text=fs.readFileSync(path.join(root,'results/tests.tap'),'utf8');assert.match(text,/# tests 68\b/);assert.match(text,/# pass 68\b/);assert.match(text,/# fail 0\b/);});
check('two deployment smoke cases execute with only src and commands',()=>{const r=read('sealed.json');assert(r.passed);assert.equal(r.positive,1);assert.equal(r.unsupported,1);});
const result={passed:true,checks,mode:'saved evidence cross-checks plus current immutable files; not a substitute for reproduce.mjs'};
fs.writeFileSync(path.join(root,'results/verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
