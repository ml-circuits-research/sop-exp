/** Explicit packaging operation; never run automatically by the verifier. */
import fs from 'node:fs';
import path from 'node:path';
import {walk,hash} from '../src/runtime.mjs';
const root=path.resolve(import.meta.dirname,'..');
const files=walk(root).filter(f=>!f.includes(path.sep+'results'+path.sep)&&!f.endsWith('MANIFEST.sha256'));
const lines=files.map(f=>hash(fs.readFileSync(f))+'  '+path.relative(root,f).split(path.sep).join('/'));
fs.writeFileSync(path.join(root,'MANIFEST.sha256'),lines.join('\n')+'\n');
console.log('Pinned immutable source/data/docs files:',lines.length);
