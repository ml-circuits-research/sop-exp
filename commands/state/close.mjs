/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="facts commands maxRounds?";
export default function(a,c){let facts=unique(a.facts);const limit=a.maxRounds??64;for(let round=0;round<limit;round++){const derived=a.commands.flatMap(command=>c.call(command,{facts}));const next=unique([...facts,...derived]);if(next.length===facts.length)return {facts:next,rounds:round+1,status:"complete"};facts=next;}throw new BudgetExceeded("Fixed-point round budget exhausted");}
