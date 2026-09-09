/** Run deployment without data, experiments, oracle or node_modules. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sop-sealed-'));
try {
  for(const name of ['src','commands'])fs.cpSync(path.join(root,name),path.join(folder,name),{recursive:true});
  fs.writeFileSync(path.join(folder,'check.mjs'),`
import assert from 'node:assert/strict';
import {createRuntime} from './src/runtime.mjs';
const vm=await createRuntime();
const before=[['at','Alice','lab'],['at','book','lab']];
const coverage={predicates:['at','holds'],snapshot:JSON.stringify(before.map(JSON.stringify).sort())};
const r=vm.run('tasks.respond',{text:'Alice picked up book.',before,coverage});
assert(r.value.after.some(f=>JSON.stringify(f)===JSON.stringify(['holds','Alice','book'])));
assert.equal(r.value.text,'Alice now holds book.');
assert.equal(vm.attempt('tasks.respond',{text:'Alice did not take book.',before,coverage}).status,'unknown');
console.log(JSON.stringify({passed:true,positive:1,unsupported:1,knowledgeFiles:[...vm.registry.values()].filter(r=>r.kind==='sop').length}));
`);
  const run=spawnSync(process.execPath,[path.join(folder,'check.mjs')],{cwd:folder,encoding:'utf8',timeout:60000,env:{...process.env,NODE_PATH:''}});
  if(run.status!==0)throw new Error(run.stderr||run.error?.message||'Sealed execution failed');
  const result={...JSON.parse(run.stdout),copiedDirectories:['src','commands'],excluded:['experiments','data','tests','node_modules'],scope:'runtime independence, not a general security isolation claim'};
  fs.writeFileSync(path.join(root,'results/sealed.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{fs.rmSync(folder,{recursive:true,force:true});}
