/* Declarative formula evaluator for Rules Profiles.

   Profiles store formulas as plain data (never code). This module evaluates
   those specs against a caller-supplied context:
     ctx.stat(key, which)        -> numeric stat value ("enhanced"|"unenhanced")
     ctx.statMod(key)            -> the stat's mod (per the profile's mod rule)
     ctx.value(id)               -> a derived value or resource by id
   Consumers build the context from their own character state.
*/

export const lit = (value) => ({ kind: "literal", value });
export const statValue = (key, which = "enhanced") => ({ kind: "stat", key, which });
export const statMod = (key) => ({ kind: "stat_mod", key });
export const derive = (id) => ({ kind: "ref", id });
export const op = (operator, ...args) => ({ kind: "op", op: operator, args });

const OPERATIONS = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  max: (a, b) => Math.max(a, b),
  min: (a, b) => Math.min(a, b),
};

export function evaluateFormula(node, ctx) {
  if (!node || typeof node !== "object") return node;
  switch (node.kind) {
    case "literal":
      return node.value;
    case "stat":
      return ctx.stat(node.key, node.which);
    case "stat_mod":
      return ctx.statMod(node.key);
    case "ref":
      return ctx.value(node.id);
    case "op": {
      const fn = OPERATIONS[node.op];
      if (!fn) throw new Error(`formula: unsupported op "${node.op}"`);
      return node.args.map((arg) => evaluateFormula(arg, ctx)).reduce(fn);
    }
    default:
      throw new Error(`formula: unsupported kind "${node.kind}"`);
  }
}

/* Threshold-table lookup (e.g. the Crawler Stat Mod table).
   Rows are { min, max, mod } with max === null meaning unbounded.
   Values below the lowest row clamp to the lowest row's result. */
export function makeThresholdLookup(table, resultKey = "mod") {
  return (value) => {
    const row = table.find((r) => value >= r.min && (r.max === null || value <= r.max));
    return row ? row[resultKey] : table[0][resultKey];
  };
}