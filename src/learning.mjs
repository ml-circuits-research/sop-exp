/** Learners manipulate the SAME SOP AST executed by the VM.
 * No head/body/requires/effects intermediate rule interpreter exists here.
 * Biases: aligned graph topology for abstraction; bounded binary numeric DAGs
 * for observational synthesis. These are distinct supervision regimes.
 */
import {parse,serialize} from './parser.mjs';
import {key} from './values.mjs';
export function abstractPrograms(sources){
  if(sources.length<2)throw new Error('At least two demonstrated SOP programs required');
  const programs=sources.map((s,i)=>{
    const p=parse(s,`demonstration${i}`),rename=new Map();let id=0;
    if(p.nodes.some(n=>n.command==='text'))throw new Error('Raw-text body abstraction is outside the aligned graph profile');
    for(const n of p.ordered)rename.set(n.id,['input','output'].includes(n.id)?n.id:`wire${id++}`);
    p.nodes=p.ordered.map(n=>({...n,id:rename.get(n.id),tokens:n.tokens.map(t=>t.kind==='value'||t.kind==='handle'?{...t,name:rename.get(t.name)}:t)}));return p;
  });
  const shape=p=>p.nodes.map(n=>[n.id,n.command,n.tokens.map(t=>t.kind==='literal'?'literal':`${t.kind}:${t.name}`)]);
  if(programs.some(p=>key(shape(p))!==key(shape(programs[0]))))throw new Error('Unaligned graph topology; no general graph alignment implemented');
  const base=structuredClone(programs[0]),groups=new Map();
  for(let i=0;i<base.nodes.length;i++)for(let j=0;j<base.nodes[i].tokens.length;j++){
    const ts=programs.map(p=>p.nodes[i].tokens[j]);
    if(ts[0].kind!=='literal')continue;
    if(j%2===0&&ts.some(t=>t.value!==ts[0].value))throw new Error('Argument names may not be abstracted');
    const values=ts.map(t=>t.value);if(values.every(v=>key(v)===key(values[0])))continue;
    const signature=key(values);if(!groups.has(signature))groups.set(signature,{id:`slot${groups.size}`,positions:[]});
    const g=groups.get(signature);g.positions.push([i,j]);base.nodes[i].tokens[j]={kind:'value',name:g.id,raw:`$${g.id}`};
  }
  // New slot producers are ordinary SOP commands, not a '?' metavariable syntax.
  const names=new Set(base.nodes.map(n=>n.id));for(const g of groups.values())if(names.has(g.id))throw new Error('Generated variable collision');
  base.nodes.splice(1,0,...[...groups.values()].map(g=>({id:g.id,command:'logic.variable',tokens:[]})));
  const source=serialize(base);parse(source,'abstracted');
  return {source,slots:groups.size,examples:sources.length,supervision:'aligned executable demonstrations',positions:[...groups.values()]};
}
function sourceOf(expr,inputKeys){
  const lines=['@input input',...inputKeys.map((k,i)=>`@input${i} data.get source $input key ${JSON.stringify(k)}`)],memo=new Map();let next=0;
  function emit(e){if(e.input!==undefined)return `input${e.input}`;const k=key(e);if(memo.has(k))return memo.get(k);const l=emit(e.left),r=emit(e.right),id=`node${next++}`;lines.push(`@${id} ${e.command} left $${l} right $${r}`);memo.set(k,id);return id;}
  const result=emit(expr);lines.push(`@output data.identity value $${result}`);return lines.join('\n')+'\n';
}
export function synthesize(vm,training,validation=[],{operations,maxNodes=3,maxCandidates=20000}={}){
  if(!training.length||!operations?.length)throw new Error('Examples and an explicit operator vocabulary are required');
  const inputs=Object.keys(training[0].input).sort();
  if(training.some(e=>key(Object.keys(e.input).sort())!==key(inputs)||inputs.some(k=>typeof e.input[k]!=='number')||typeof e.output!=='number'))throw new Error('This synthesis profile is binary numeric, not an unrestricted synthesizer');
  for(const op of operations){const r=vm.compile(op);if(r.module?.parameters!=='left right')throw new Error('Synthesis requires two-operand primitives');}
  const target=training.map(e=>e.output),levels=[inputs.map((_,i)=>({expr:{input:i},vector:training.map(e=>e.input[inputs[i]])}))];
  const signatures=new Set(levels[0].map(x=>key(x.vector)));let evaluated=0,validationRejected=0;
  function test(expr){const source=sourceOf(expr,inputs);vm.registerSource('candidate',source);evaluated++;const vector=training.map(e=>vm.run('candidate',e.input).value);return {expr,source,vector};}
  function acceptable(c){if(key(c.vector)!==key(target))return false;vm.registerSource('candidate',c.source??sourceOf(c.expr,inputs));if(validation.some(e=>key(vm.run('candidate',e.input).value)!==key(e.output))){validationRejected++;return false;}return true;}
  for(const c of levels[0])if(acceptable(c))return {status:'found',source:sourceOf(c.expr,inputs),cost:0,evaluated,validationRejected};
  for(let cost=1;cost<=maxNodes;cost++){
    const next=[];
    for(let lc=0;lc<cost;lc++){const rc=cost-1-lc;if(!levels[lc]||!levels[rc])continue;
      for(const left of levels[lc])for(const right of levels[rc])for(const command of operations){
        if(evaluated>=maxCandidates)return {status:'unknown',reason:'candidate budget',evaluated,validationRejected};
        const c=test({command,left:left.expr,right:right.expr});
        if(acceptable(c))return {status:'found',source:c.source,cost,evaluated,validationRejected};
        const sig=key(c.vector);if(!signatures.has(sig)){signatures.add(sig);next.push(c);}
      }
    }
    levels[cost]=next;
  }
  return {status:'unknown',reason:'no program in the explored profile',evaluated,validationRejected};
}
export function validateProgram(vm,source,examples,name='validationCandidate'){
  if(!Array.isArray(examples)||examples.length===0)throw new Error('At least one validation example is required');
  vm.registerSource(name,source);const failures=[];
  for(const [i,e]of examples.entries()){
    let actual;try{actual=vm.run(name,e.input).value;}catch(err){failures.push({i,error:err.message});continue;}
    if(key(actual)!==key(e.output))failures.push({i,expected:e.output,actual});
  }
  return {passed:failures.length===0,cases:examples.length,failures};
}
