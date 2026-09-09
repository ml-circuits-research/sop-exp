/** Verify distributed source/data/docs. Never generate a new manifest here. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {walk,hash} from '../src/runtime.mjs';
export function verifyIntegrity(root=path.resolve(import.meta.dirname,'..')) {
  const file=path.join(root,'MANIFEST.sha256');
  const lines=fs.readFileSync(file,'utf8').trim().split('\n');
  const expected=new Set();
  for (const line of lines) {
    const m=line.match(/^([a-f0-9]{64})  (.+)$/);
    assert(m,'Malformed manifest line');
    const [,digest,relative]=m;
    assert(!path.isAbsolute(relative)&&!relative.split('/').includes('..'),'Invalid manifest path');
    assert(!expected.has(relative),'Duplicate manifest entry');expected.add(relative);
    assert.equal(hash(fs.readFileSync(path.join(root,relative))),digest,`Changed distribution file: ${relative}`);
  }
  const actual=walk(root).filter(f=>!f.includes(path.sep+'results'+path.sep)&&!f.endsWith(path.sep+'MANIFEST.sha256')).map(f=>path.relative(root,f).split(path.sep).join('/'));
  assert.deepEqual([...actual].sort(),[...expected].sort(),'Unlisted or missing immutable package file');
  return {passed:true,files:expected.size};
}
