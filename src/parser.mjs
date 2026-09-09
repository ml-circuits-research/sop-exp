/** SOP declaration parser. It knows boundaries, tokens and $/~ references only.
 * Named-argument interpretation is a runtime profile, not a second rule language.
 */
export const identifier = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const commandName = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;
const refs = s => [...s.matchAll(/(?<!\$)\$([A-Za-z_][A-Za-z0-9_]*)|~([A-Za-z_][A-Za-z0-9_]*)/g)].map(m=>m[1]??m[2]);
export function tokenize(text, label='<body>') {
  const out=[]; let i=0;
  while(i<text.length){
    if(/\s/.test(text[i])){i++;continue;}
    const start=i;
    if(text[i]==='"'){
      i++;let escaped=false;
      while(i<text.length){const c=text[i++];if(c==='"'&&!escaped)break;escaped=c==='\\'&&!escaped;if(c!=='\\')escaped=false;}
      const raw=text.slice(start,i);let value;
      try{value=JSON.parse(raw);}catch{throw new Error(`${label}: invalid quoted literal`);}
      out.push({kind:'literal',value,raw});
    } else {
      while(i<text.length&&!/\s/.test(text[i]))i++;
      const raw=text.slice(start,i);
      if(/^\$[A-Za-z_]\w*$/.test(raw))out.push({kind:'value',name:raw.slice(1),raw});
      else if(/^~[A-Za-z_]\w*$/.test(raw))out.push({kind:'handle',name:raw.slice(1),raw});
      else if(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw))out.push({kind:'literal',value:Number(raw),raw});
      else if(['true','false','null'].includes(raw))out.push({kind:'literal',value:JSON.parse(raw),raw});
      else out.push({kind:'literal',value:raw,raw});
    }
  }
  return out;
}
export function parse(source,name='<memory>'){
  if(typeof source!=='string')throw new TypeError('SOP source must be text');
  const nodes=[];let current=null;let quoted=false,escaped=false;
  for(const [i,line]of source.replace(/\r\n/g,'\n').split('\n').entries()){
    if(!quoted&&/^\s*#/.test(line))continue;
    const match=!quoted&&line.match(/^\s*@([A-Za-z_]\w*)\s+([^\s]+)(?:\s+(.*))?$/);
    if(match){
      if(!commandName.test(match[2]))throw new Error(`${name}:${i+1}: unsupported command expression`);
      current={id:match[1],command:match[2],body:match[3]??'',line:i+1};nodes.push(current);
    } else if(line.trim()){
      if(!current)throw new Error(`${name}:${i+1}: text outside a declaration`);
      current.body+='\n'+line;
    }
    // Newline is not an argument terminator. Quotes cannot hide a new header accidentally.
    const scan=match?(match[3]??''):line;
    for(const c of scan){if(c==='"'&&!escaped)quoted=!quoted;escaped=c==='\\'&&!escaped;if(c!=='\\')escaped=false;}
  }
  if(quoted)throw new Error(`${name}: unclosed quote`);
  const seen=new Set();
  for(const n of nodes){
    if(seen.has(n.id))throw new Error(`${name}: duplicate producer @${n.id}`);seen.add(n.id);
    n.body=n.body.trim();n.tokens=tokenize(n.body,`${name}:${n.line}`);
    n.dependencies=[...new Set(n.tokens.flatMap(t=>t.kind==='value'||t.kind==='handle'?[t.name]:typeof t.value==='string'?refs(t.value):[]))];
  }
  if(!seen.has('input')||!seen.has('output'))throw new Error(`${name}: @input and @output required by the module profile`);
  if(nodes.find(n=>n.id==='input').command!=='input'||nodes.find(n=>n.id==='input').tokens.length)throw new Error(`${name}: @input must use the input command without arguments`);
  for(const n of nodes)for(const d of n.dependencies)if(!seen.has(d))throw new Error(`${name}: unresolved reference ${d}`);
  const ordered=[],done=new Set(),pending=[...nodes];
  while(pending.length){const i=pending.findIndex(n=>n.dependencies.every(d=>done.has(d)));if(i<0)throw new Error(`${name}: cyclic dependencies`);const n=pending.splice(i,1)[0];done.add(n.id);ordered.push(n);}
  return {name,source,nodes,ordered};
}
export function serialize(program){
  const semantic=t=>t.kind==='value'||t.kind==='handle'?[t.kind,t.name]:[t.kind,t.value];
  return program.nodes.map(n=>{
    const unchanged=n.body!==undefined&&JSON.stringify(tokenize(n.body).map(semantic))===JSON.stringify(n.tokens.map(semantic));
    const body=unchanged?n.body:n.tokens.map(t=>t.kind==='value'?`$${t.name}`:t.kind==='handle'?`~${t.name}`:typeof t.value==='string'?JSON.stringify(t.value):String(t.value)).join(' ');
    return `@${n.id} ${n.command}`+(body?'\n'+body:'');
  }).join('\n\n')+'\n';
}
