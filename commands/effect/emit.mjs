/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="rows name sign arg*";
export default function(a,c){if(!["+","-"].includes(a.sign))throw new Error("Invalid patch sign");return a.rows.map(row=>({sign:a.sign,fact:[a.name,...ground(seq(a),row)],producer:c.scope,support:row.support}));}
