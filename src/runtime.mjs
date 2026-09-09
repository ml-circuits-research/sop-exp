import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {parse,commandName} from './parser.mjs';
import {BudgetExceeded,UnknownCoverage,UnknownBinding,freeze,publicValue} from './values.mjs';
export const hash=s=>createHash('sha256').update(s).digest('hex');
export function walk(root){return fs.readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{const p=path.join(root,e.name);if(e.isSymbolicLink())throw new Error(`Symlink not permitted: ${p}`);return e.isDirectory()?walk(p):[p];});}
function expand(s,vars){return s.replace(/\$\$|\$([A-Za-z_]\w*)/g,(m,n)=>{if(m==='$$')return '$';const v=vars.get(n)?.value;if(v===undefined)throw new Error(`Undefined interpolation $${n}`);if(v!==null&&typeof v==='object')throw new Error(`Cannot interpolate non-scalar $${n}`);return String(v);});}
function argument(t,vars){if(t.kind==='value')return vars.get(t.name).value;if(t.kind==='handle')return vars.get(t.name).handle;return typeof t.value==='string'?expand(t.value,vars):t.value;}
function named(tokens,vars){if(tokens.length%2)throw new Error('Named argument pairs required by this command; no declaration terminator is used');const out=Object.create(null);for(let i=0;i<tokens.length;i+=2){const k=tokens[i];if(k.kind!=='literal'||typeof k.value!=='string'||!/^\w+$/.test(k.value))throw new Error('Invalid argument name');if(Object.hasOwn(out,k.value))throw new Error(`Duplicate argument ${k.value}`);out[k.value]=argument(tokens[i+1],vars);}return out;}
function validateArguments(module,args){
  if(module.contract==='text')return;
  const fields=(module.parameters??'').split(/\s+/).filter(Boolean);
  for(const f of fields)if(!f.endsWith('?')&&!f.includes('*')&&!Object.hasOwn(args,f))throw new Error(`Missing argument ${f}`);
  for(const k of Object.keys(args))if(!fields.some(f=>f==='*'||f.replace(/\?$/,'')===k||(f==='arg*'&&/^arg\d+$/.test(k))))throw new Error(`Unexpected argument ${k}`);
}
export class Runtime {
  constructor(root){this.root=root;this.registry=new Map();this.invocations=0;}
  registerSource(name,source){if(!commandName.test(name))throw new Error('Invalid command name');if(this.registry.get(name)?.kind==='mjs')throw new Error('Cannot replace a native command with SOP source');const ast=parse(source,name);this.registry.set(name,{kind:'sop',name,source,ast,hash:hash(source)});return name;}
  source(name){const r=this.registry.get(name);if(!r||r.kind!=='sop')throw new Error(`Not a SOP command: ${name}`);if(!r.source)r.source=fs.readFileSync(r.path,'utf8');return r.source;}
  compile(name){const r=this.registry.get(name);if(!r)throw new Error(`Unknown command ${name}`);if(r.kind==='sop'&&!r.ast){r.source=this.source(name);r.hash=hash(r.source);r.ast=parse(r.source,name);}return r;}
  invoke(name,args,session,parent='',depth=0){
    if(depth>session.maxDepth)throw new BudgetExceeded('Call-depth budget exhausted');
    const r=this.compile(name);session.tick();
    if(r.kind==='mjs'){validateArguments(r.module,args);return r.module.default(args,{runtime:this,session,scope:parent,frame:args,call:(n,a)=>this.invoke(n,a,session,parent,depth+1),tick:session.tick});}
    const scope=`${parent}/${name}#${++this.invocations}`;
    const vars=new Map();
    for(const n of r.ast.ordered){
      session.tick();const target=this.compile(n.command);
      const params=target.kind==='mjs'&&target.module.contract==='text'?{text:expand(n.body,vars)}:named(n.tokens,vars);
      let result;
      if(n.command==='input')result=args;
      else if(target.kind==='mjs'){validateArguments(target.module,params);result=target.module.default(params,{runtime:this,session,scope:`${scope}@${n.id}`,frame:args,node:n,call:(x,a)=>this.invoke(x,a,session,scope,depth+1),tick:session.tick});}
      else result=this.invoke(n.command,params,session,scope,depth+1);
      const meta=freeze({id:`${scope}@${n.id}`,command:n.command,module:name,sourceHash:r.hash,epoch:session.epoch,status:'complete',dependencies:n.dependencies.map(d=>vars.get(d).handle.id)});
      const handle=freeze({...meta,value:freeze(publicValue(result))});
      vars.set(n.id,{value:result,handle});
      if(session.trace)session.records.push(meta);
    }
    return vars.get('output').value;
  }
  run(name,args={},options={}){
    const session={remaining:options.budget??2000000,maxDepth:options.maxDepth??64,epoch:options.epoch??'session',trace:options.trace??false,records:[]};
    session.tick=(n=1)=>{session.remaining-=n;if(session.remaining<0)throw new BudgetExceeded('Work budget exhausted');};
    const value=this.invoke(name,args,session);
    return {value,steps:(options.budget??2000000)-session.remaining,trace:session.records};
  }
  attempt(name,args={},options={}){try{return {status:'complete',...this.run(name,args,options)};}catch(e){if(e instanceof BudgetExceeded||e instanceof UnknownCoverage||e instanceof UnknownBinding)return {status:'unknown',reason:e.message};throw e;}}
}
export async function createRuntime(root=new URL('../commands/',import.meta.url)){
  root=root instanceof URL?new URL(root):path.resolve(root);const base=root instanceof URL?decodeURIComponent(root.pathname):root;
  const vm=new Runtime(base);
  for(const f of walk(base)){
    if(!/\.(sop|mjs)$/.test(f))continue;
    const name=path.relative(base,f).replace(/\.(sop|mjs)$/,'').split(path.sep).join('.');
    if(!commandName.test(name))throw new Error(`Invalid file-derived command: ${name}`);
    if(vm.registry.has(name))throw new Error(`Ambiguous .sop/.mjs command: ${name}`);
    const kind=f.endsWith('.mjs')?'mjs':'sop';
    vm.registry.set(name,kind==='mjs'?{kind,name,path:f,module:await import(pathToFileURL(f)),hash:hash(fs.readFileSync(f))}:{kind,name,path:f});
  }
  return vm;
}
