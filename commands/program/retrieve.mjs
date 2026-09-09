import {SourceIndex}from'../../src/retrieval.mjs';
export const parameters='names terms';
export default (a,c)=>new SourceIndex(c.runtime,a.names).retrieve(a.terms);
