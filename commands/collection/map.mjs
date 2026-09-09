/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="items command *";
export default function(a,c){const {items,command,...params}=a;return items.map((item,index)=>{c.tick();return c.call(command,{...params,item,index});});}
