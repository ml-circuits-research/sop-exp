import fs from 'node:fs';
import path from 'node:path';
import {createRuntime} from '../src/runtime.mjs';
const root=path.resolve(import.meta.dirname,'..');
const vm=await createRuntime();
const catalog=[];
for(const name of [...vm.registry.keys()].sort()){
 const r=vm.compile(name);
 catalog.push({name,implementation:r.kind,path:path.relative(root,r.path??''),hash:r.hash,parameters:r.kind==='mjs'?r.module.parameters:null,calls:r.kind==='sop'?[...new Set(r.ast.nodes.map(n=>n.command))]:[],input:r.kind==='sop'?'named arguments exposed as $input':undefined});
}
fs.writeFileSync(path.join(root,'results/command-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
const lines=['# Catalogul comenzilor','', 'Generat din fișierele active, nu dintr-o listă de capabilități dorite. „MJS” indică implementare nativă generică; „SOP” indică un program compus. Ambele folosesc același nume de apel derivat din cale. Un `?` în contractul MJS de mai jos marchează un argument opțional în metadatele native; nu este sintaxă de variabilă logică în SOP. `arg*` înseamnă argumente numerotate arg0, arg1 etc.','', '| Comandă | Implementare | Contract / subcomenzi directe |','|---|---|---|'];
for(const r of catalog)lines.push(`| ${r.name} | ${r.implementation.toUpperCase()} | ${r.implementation==='mjs'?r.parameters||'fără argumente':r.calls.join(', ')} |`);
fs.writeFileSync(path.join(root,'docs/COMMANDS.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({commands:catalog.length,sop:catalog.filter(x=>x.implementation==='sop').length,native:catalog.filter(x=>x.implementation==='mjs').length}));
