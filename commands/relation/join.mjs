/** Generic native primitive. No domain event or language-construction dispatch. */
import {key,seq,resolve,unify,ground,unique,delta,applyPatch,BudgetExceeded,UnknownCoverage} from "../../src/values.mjs";
export const parameters="rows facts name arg*";
export default function(a,c){const out=[],pattern=seq(a),facts=a.facts.filter(f=>f[0]===a.name);for(const row of a.rows)for(const f of facts){c.tick();const b=unify(pattern,f,row.bindings);if(b)out.push({bindings:b,support:[...row.support,key(f)]});}return out;}
