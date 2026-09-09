/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="name arg*";
export default function(a,c){if(typeof a.name!=="string")throw new Error("Fact predicate must be text");return [a.name,...seq(a)];}
