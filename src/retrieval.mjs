/** Replaceable exact structural index over SOP source tokens, not knowledge. */
export class SourceIndex {
 constructor(vm,names){this.postings=new Map();this.names=[...names];this.hashes={};for(const name of names){const r=vm.compile(name);if(r.kind!=='sop')throw new Error('Index expects SOP sources');this.hashes[name]=r.hash;const terms=new Set(r.ast.nodes.flatMap(n=>[n.command,...n.tokens.filter(t=>t.kind==='literal'&&typeof t.value==='string').map(t=>t.value)]));for(const t of terms){if(!this.postings.has(t))this.postings.set(t,new Set());this.postings.get(t).add(name);}}}
 assertFresh(vm){for(const name of this.names)if(vm.compile(name).hash!==this.hashes[name])throw new Error(`Stale source index: ${name}`);return true;}
 retrieve(terms){if(!terms.length)return [...this.names];const sets=terms.map(t=>this.postings.get(t)??new Set()).sort((a,b)=>a.size-b.size);return [...sets[0]].filter(n=>sets.every(s=>s.has(n)));}
}
