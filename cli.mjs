#!/usr/bin/env node
/** Local research CLI. Input JSON is data, never a second circuit authoring language. */
import fs from 'node:fs';
import {createRuntime} from './src/runtime.mjs';
import {publicValue} from './src/values.mjs';
const args=process.argv.slice(2);
const help='Usage: node cli.mjs COMMAND --input FILE.json [--trace] [--budget INTEGER]\n       node cli.mjs --list';
try {
  if(!args.length||args.includes('--help')){console.log(help);}
  else {
    const vm=await createRuntime();
    if(args[0]==='--list')console.log([...vm.registry].map(([name,r])=>`${name}\t${r.kind}`).sort().join('\n'));
    else {
      const command=args.shift(),options={},known=new Set(['--trace','--input','--budget']);let file;
      while(args.length){const a=args.shift();if(!known.has(a))throw new Error('Unknown CLI option: '+a);if(a==='--trace')options.trace=true;else{const v=args.shift();if(!v)throw new Error('Missing option value');if(a==='--input')file=v;else{options.budget=Number(v);if(!Number.isSafeInteger(options.budget)||options.budget<1)throw new Error('Budget must be a positive integer');}}}
      const input=file?JSON.parse(fs.readFileSync(file,'utf8')):{};
      const result=vm.attempt(command,input,options);
      console.log(JSON.stringify(publicValue(result),null,2));
      if(result.status==='unknown')process.exitCode=2;
    }
  }
}catch(error){console.error(error.message);process.exitCode=1;}
