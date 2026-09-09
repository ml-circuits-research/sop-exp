/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="rows name arg*";
export default function(a,c){return a.rows.map(row=>{c.tick();return [a.name,...ground(seq(a),row)];});}
