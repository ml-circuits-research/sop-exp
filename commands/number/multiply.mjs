/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="left right";
export default function(a,c){if(typeof a.left!=="number"||typeof a.right!=="number")throw new Error("Numbers required");return a.left*a.right;}
