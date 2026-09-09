export const key=x=>JSON.stringify(x);
export const seq=(a,prefix='arg')=>Object.keys(a).filter(k=>new RegExp(`^${prefix}\\d+$`).test(k)).sort((a,b)=>+a.slice(prefix.length)-+b.slice(prefix.length)).map(k=>a[k]);
export const slot=x=>!!x&&typeof x==='object'&&x.kind==='slot';
export const resolve=(x,row)=>slot(x)?row.bindings.get(x.id):x;
export function unify(pattern,fact,bindings){
  if(pattern.length!==fact.length-1)return null;
  const b=new Map(bindings);
  for(let i=0;i<pattern.length;i++){const x=pattern[i],v=fact[i+1];if(slot(x)){if(b.has(x.id)&&key(b.get(x.id))!==key(v))return null;b.set(x.id,v);}else if(key(x)!==key(v))return null;}
  return b;
}
export function ground(pattern,row){const a=pattern.map(x=>resolve(x,row));if(a.some(x=>x===undefined))throw new UnknownBinding('Output contains an unbound slot');return a;}
export function unique(facts){return [...new Map(facts.map(f=>[key(f),f])).values()];}
export const sameFacts=(a,b)=>key(unique(a).map(key).sort())===key(unique(b).map(key).sort());
export function delta(before,after){const b=new Set(before.map(key)),a=new Set(after.map(key));return {removed:before.filter(f=>!a.has(key(f))),added:after.filter(f=>!b.has(key(f)))};}
export function applyPatch(before,patch){const facts=new Map(before.map(f=>[key(f),f]));for(const e of patch)if(e.sign==='-')facts.delete(key(e.fact));for(const e of patch)if(e.sign==='+')facts.set(key(e.fact),e.fact);return [...facts.values()];}
export function publicValue(value){if(value instanceof Map)return [...value].map(([k,v])=>[k,publicValue(v)]);if(Array.isArray(value))return value.map(publicValue);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,publicValue(v)]));return value;}
export function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export class BudgetExceeded extends Error{constructor(message){super(message);this.name='BudgetExceeded';}}
export class UnknownCoverage extends Error{constructor(message){super(message);this.name='UnknownCoverage';}}

export class UnknownBinding extends Error{constructor(message){super(message);this.name="UnknownBinding";}}
