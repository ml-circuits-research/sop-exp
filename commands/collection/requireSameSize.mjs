import {UnknownBinding}from'../../src/values.mjs';
export const parameters='items reference';
export default a=>{if(a.items.length!==a.reference.length)throw new UnknownBinding('Output coverage is incomplete');return a.items;};
