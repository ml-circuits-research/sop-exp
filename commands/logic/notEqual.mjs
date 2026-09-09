/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="rows left right";
export default function(a,c){return a.rows.filter(row=>{c.tick();const l=resolve(a.left,row),r=resolve(a.right,row);if(l===undefined||r===undefined)throw new Error("Unbound comparison");return key(l)!==key(r);});}
