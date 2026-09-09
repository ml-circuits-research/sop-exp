/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="text";
export default function(a,c){if(typeof a.text!=="string")throw new Error("Text required");return a.text.match(/[\p{L}\p{N}_-]+|[^\s]/gu)??[];}
