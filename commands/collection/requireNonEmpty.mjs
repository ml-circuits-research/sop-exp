import {UnknownBinding} from '../../src/values.mjs';
export const parameters = 'items';
export default a => {
  if (!Array.isArray(a.items) || a.items.length === 0) {
    throw new UnknownBinding('No candidate is available in the selected library');
  }
  return a.items;
};
