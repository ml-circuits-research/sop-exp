/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="source key";
export default function(a,c){if(a.source==null||!Object.hasOwn(a.source,a.key))throw new Error(`Missing field ${a.key}`);return a.source[a.key];}
