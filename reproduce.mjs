#!/usr/bin/env node
/** One-command reproduction; any nonzero child exit aborts the run. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {verifyIntegrity} from './tools/integrity.mjs';
const root=import.meta.dirname;
try {
  console.log('Checking source/data/document integrity.');
  verifyIntegrity(root);
  const jobs=[
    {name:'Regression checks (including documented limitations)',args:['--test','tests/runtime.test.mjs','tests/review.test.mjs'],file:'tests.tap'},
    {name:'Experimental measurements',args:['run-all.mjs'],file:'run.log'},
    {name:'Concrete boundary cases',args:['audit.mjs'],file:'audit.log'},
    {name:'Deployment with only runtime and commands',args:['tools/sealed-check.mjs'],file:'sealed.log'},
    {name:'Evidence and integrity checks',args:['verify.mjs'],file:'verify.log'}
  ];
  for(const job of jobs){
    console.log(job.name);
    const r=spawnSync(process.execPath,job.args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,timeout:300000});
    fs.writeFileSync(path.join(root,'results',job.file),(r.stdout??'')+(r.stderr??''));
    if(r.error||r.status!==0)throw new Error(`${job.name} failed; inspect results/${job.file}: ${r.error?.message??r.status}`);
  }
  fs.writeFileSync(path.join(root,'results/reproduction.json'),JSON.stringify({passed:true,node:process.version,platform:process.platform,architecture:process.arch,stages:jobs.map(j=>j.name),note:'The eight documented capability limitations are still present; a successful reproduction does not make them solved.'},null,2)+'\n');
  console.log('Reproduction complete. Results: results/summary.json, results/audit.json and results/verification.json.');
} catch(e) {console.error(e.message);process.exitCode=1;}
