/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="rows command *";
export default function(a,c){const {rows,command,...params}=a;return rows.map(row=>{c.tick();const args=Object.fromEntries(Object.entries(params).map(([k,v])=>[k,ground([v],row)[0]]));return c.call(command,args);});}
