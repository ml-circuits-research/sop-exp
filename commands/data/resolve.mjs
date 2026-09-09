import {unique}from'../../src/values.mjs';
export const parameters='candidates supported';
export default a=>{const candidates=unique(a.candidates),supported=unique(a.supported);if(!candidates.length)return {status:'unknown',candidates};return supported.length===1?{status:'resolved',selected:supported[0],candidates}:{status:'ambiguous',candidates};};
