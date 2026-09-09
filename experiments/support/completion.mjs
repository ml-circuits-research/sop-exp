/** TEST/TEACHER fixtures. These are demonstrations, not an imported learner. */
export const families=[
 {verbs:['pickup','inspect','store'],roles:[[0,1],[0,1],[0,1]]},
 {verbs:['travel','pickup','drop'],roles:[[0,2,3],[0,1],[0,1]]},
 {verbs:['ask','answer','ack'],roles:[[0,1],[1,0],[0,1]]},
 {verbs:['pickup','give','thank'],roles:[[0,2],[0,1,2],[1,0]]},
];
export function trace(f,values){return f.verbs.map((v,i)=>[v,...f.roles[i].map(k=>values[k])]);}
export function demonstration(events){
 const [a,b,target]=events;
 const args=f=>f.map((v,i)=>`arg${i} ${JSON.stringify(v)}`).join(' ');
 return `@input input\n@context data.get source $input key "context"\n@seed bindings.unit\n@first relation.join rows $seed facts $context name "step0" ${args(a)}\n@second relation.join rows $first facts $context name "step1" ${args(b)}\n@output rows.project rows $second name ${JSON.stringify(target[0])} ${args(target.slice(1))}\n`;
}
export const context=events=>events.slice(0,2).map((f,i)=>['step'+i,...f]);
