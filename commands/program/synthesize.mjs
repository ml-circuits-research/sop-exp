import {synthesize} from '../../src/learning.mjs';
export const parameters='training validation operations maxNodes maxCandidates';
export default (a,c)=>synthesize(c.runtime,a.training,a.validation,{operations:a.operations,maxNodes:a.maxNodes,maxCandidates:a.maxCandidates});
