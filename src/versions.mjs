/** Immutable source versions and regression-gated activation. Single-process
 * research implementation, not a concurrent database or an empirical truth oracle.
 */
import fs from 'node:fs';
import path from 'node:path';
import {hash} from './runtime.mjs';
import {commandName} from './parser.mjs';
import {validateProgram} from './learning.mjs';
export class Versions {
  constructor(root){this.root=root;fs.mkdirSync(root,{recursive:true});const f=path.join(root,'active.json');this.active=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{};}
  propose(vm,name,source,tests){
    if(!commandName.test(name))throw new Error('Invalid versioned command name');
    const check=validateProgram(vm,source,tests);const digest=hash(source),folder=path.join(this.root,'objects');fs.mkdirSync(folder,{recursive:true});
    const record={name,hash:digest,accepted:check.passed,validation:check};
    fs.writeFileSync(path.join(folder,digest+'.sop'),source);fs.writeFileSync(path.join(folder,digest+'.json'),JSON.stringify(record,null,2));
    if(check.passed){this.active={...this.active,[name]:digest};const tmp=path.join(this.root,'active.tmp');fs.writeFileSync(tmp,JSON.stringify(this.active,null,2));fs.renameSync(tmp,path.join(this.root,'active.json'));vm.registerSource(name,source);}
    return record;
  }
  load(vm,name,digest=this.active[name]){if(!digest||!/^[a-f0-9]{64}$/.test(digest))throw new Error('Missing source version');const source=fs.readFileSync(path.join(this.root,'objects',digest+'.sop'),'utf8');if(hash(source)!==digest)throw new Error('Source hash mismatch');vm.registerSource(name,source);return digest;}
}
