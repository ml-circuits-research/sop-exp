/** TEST-ONLY imperative oracle. It does not import or execute the SOP interpreter
 * or learned rules. Never imported by learning, prediction or routing modules.
 * The contract is the well-typed, fully observable world used by this benchmark.
 */
export function independentTransition(before, event) {
  const [action, a, b, c] = event;
  const state = new Map(before.map(f => [JSON.stringify(f), [...f]]));
  const insert = f => state.set(JSON.stringify(f), f);
  const erase = f => state.delete(JSON.stringify(f));
  const colocated = (x, y) => {
    const places = new Set(before.filter(f => f[0] === 'at' && f[1] === x).map(f => f[2]));
    return before.some(f => f[0] === 'at' && f[1] === y && places.has(f[2]));
  };
  switch (action) {
    case 'travel': {
      const moved = new Set([a, ...before.filter(f => f[0] === 'holds' && f[1] === a).map(f => f[2])]);
      for (const f of before) if (f[0] === 'at' && moved.has(f[1])) erase(f);
      for (const entity of moved) insert(['at', entity, b]);
      break;
    }
    case 'take':
      if (colocated(a, b) && !before.some(f => f[0] === 'holds' && f[2] === b)) insert(['holds', a, b]);
      break;
    case 'drop': erase(['holds', a, b]); break;
    case 'give':
      if (a !== b && state.has(JSON.stringify(['holds', a, c])) && colocated(a, b)) {
        erase(['holds', a, c]); insert(['holds', b, c]);
      }
      break;
    default: throw new Error(`Unsupported test-world action: ${action}`);
  }
  return [...state.values()];
}
