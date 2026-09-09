import {UnknownBinding}from'../../src/values.mjs';
export const parameters='items';
export default a=>{if(a.items.length!==1)throw new UnknownBinding(`Expected one candidate; observed ${a.items.length}`);return a.items[0];};
