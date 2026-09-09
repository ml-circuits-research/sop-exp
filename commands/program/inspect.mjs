/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="reference";
export default function(a,c){if(!a.reference?.sourceHash)throw new Error("Runtime reference required");return a.reference;}
