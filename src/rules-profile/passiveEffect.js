/* Universal Passive / Effect definition — Rules Profile schema v1.

   A Passive/Effect is any persistent or triggered modifier a Rules Profile
   can attach to a character (from gear, race/class abilities, conditions,
   loot, advancement, spells in effect, etc.). Like every Rules Profile
   section it is DECLARATIVE DATA: `value_formula` accepts a formula-spec
   object (see formula.js) or a literal — never executable code. Mechanics
   resolution (triggers, operations, stacking) is a LATER implementation
   step; this module defines and validates the structure only.

   Profiles expose their effects through an optional `effects` section:
     effects: { catalog: { [effect_id]: definition }, resolution: {...} }
   The catalog may be empty ([]) when a system has no verified effect data.
*/

export const PASSIVE_SCHEMA_VERSION = 1;

/* When an effect applies. */
export const PASSIVE_TRIGGERS = [
  "always",
  "on_attack",
  "on_hit",
  "on_damage",
  "on_skill_check",
  "on_spell_cast",
  "on_heal",
  "on_damage_taken",
  "on_resource_change",
  "on_condition",
  "on_turn",
  "custom",
];

/* What the effect acts on. */
export const PASSIVE_TARGETS = [
  "character",
  "attack",
  "damage",
  "stat",
  "skill",
  "spell",
  "resource",
  "defense",
  "movement",
  "healing",
  "equipment",
  "condition",
  "other",
];

/* Filters narrow WHEN/ON WHAT the effect applies. All optional; a missing
   filter means "applies to everything of the trigger kind". */
export const PASSIVE_FILTER_KEYS = [
  "attack_tags",
  "damage_type",
  "weapon_type",
  "skill",
  "spell",
  "stat",
  "target_type",
  "conditions",
  "custom_rule_condition",
];

/* How the effect changes its target. */
export const PASSIVE_OPERATIONS = [
  "add",
  "subtract",
  "multiply",
  "replace",
  "minimum",
  "maximum",
  "grant",
  "suppress",
  "reroll",
  "advantage_disadvantage",
  "custom",
];

/* How the effect becomes active. */
export const PASSIVE_ACTIVATIONS = ["automatic", "optional", "manually_activated"];

/* What happens when the same effect applies more than once. */
export const PASSIVE_STACKING_MODES = [
  "stacks",
  "does_not_stack",
  "highest_only",
  "replace_existing",
  "custom",
];

/* Full field reference — canonical shape of one definition.
   - value_formula: formula-spec object (formula.js) or literal value.
   - confidence / requires_review: provenance flags for uploaded-profile
     data (same conventions as rulebook extraction). */
export const PASSIVE_EFFECT_FIELDS = {
  id: { type: "string", required: true },
  name: { type: "string", required: true },
  effect_type: { type: "string", required: true }, // profile-defined category label
  source_type: { type: "string", required: true }, // e.g. gear | race | class | spell | condition | advancement | loot
  source_id: { type: "string", default: "" }, // id of the granting definition, if any
  trigger: {
    type: "object",
    required: true,
    fields: {
      type: { enum: PASSIVE_TRIGGERS, required: true },
      condition: { type: "string", default: "" }, // free-form trigger condition
      custom_rule: { type: "string", default: "" }, // required when type is "custom"
    },
  },
  targets: { type: "array", items: PASSIVE_TARGETS, required: true },
  filters: { type: "object", optional_keys: PASSIVE_FILTER_KEYS, default: {} },
  operation: {
    type: "object",
    required: true,
    fields: {
      type: { enum: PASSIVE_OPERATIONS, required: true },
      value_formula: { type: "formula-spec | literal", required: true },
      custom_rule: { type: "string", default: "" }, // required when type is "custom"
    },
  },
  activation: { enum: PASSIVE_ACTIVATIONS, default: "automatic" },
  cost: {
    type: "object | null",
    default: null,
    fields: { resource: { type: "string", required: true }, amount: { type: "number", required: true } },
  },
  duration: { type: "string", default: "" }, // e.g. "permanent", "encounter", "3 turns"
  cooldown: { type: "string", default: "" },
  stacking: { enum: PASSIVE_STACKING_MODES, default: "does_not_stack" },
  priority: { type: "number", default: 0 }, // resolution order within equal stacking
  description: { type: "string", default: "" },
  source_reference: { type: "string", default: "" }, // page/section of the source document
  confidence: { type: "string", default: "unverified" }, // verified | inferred | unverified
  requires_review: { type: "boolean", default: true },
};

const inList = (list, value) => list.includes(value);

/* Define and validate one Passive/Effect. Mirrors defineProfile: throws on
   structural violations, freezes and returns the normalized definition. */
export function definePassiveEffect(def) {
  if (!def || typeof def !== "object") {
    throw new Error("passive effect: a definition object is required");
  }
  const {
    id,
    name,
    effect_type,
    source_type,
    source_id = "",
    trigger,
    targets,
    filters = {},
    operation,
    activation = "automatic",
    cost = null,
    duration = "",
    cooldown = "",
    stacking = "does_not_stack",
    priority = 0,
    description = "",
    source_reference = "",
    confidence = "unverified",
    requires_review = true,
  } = def;

  if (!id || typeof id !== "string") throw new Error("passive effect: id is required");
  if (!name || typeof name !== "string") throw new Error(`passive effect "${id}": name is required`);
  if (!effect_type || typeof effect_type !== "string") {
    throw new Error(`passive effect "${id}": effect_type is required`);
  }
  if (!source_type || typeof source_type !== "string") {
    throw new Error(`passive effect "${id}": source_type is required`);
  }

  if (!trigger || !inList(PASSIVE_TRIGGERS, trigger.type)) {
    throw new Error(`passive effect "${id}": trigger.type must be one of PASSIVE_TRIGGERS`);
  }
  if (trigger.type === "custom" && !trigger.custom_rule) {
    throw new Error(`passive effect "${id}": trigger "custom" requires custom_rule`);
  }

  if (!Array.isArray(targets) || targets.length === 0 || !targets.every((t) => inList(PASSIVE_TARGETS, t))) {
    throw new Error(`passive effect "${id}": targets must be a non-empty array of PASSIVE_TARGETS`);
  }

  for (const key of Object.keys(filters)) {
    if (!inList(PASSIVE_FILTER_KEYS, key)) {
      throw new Error(`passive effect "${id}": unknown filter "${key}"`);
    }
  }

  if (!operation || !inList(PASSIVE_OPERATIONS, operation.type)) {
    throw new Error(`passive effect "${id}": operation.type must be one of PASSIVE_OPERATIONS`);
  }
  if (operation.value_formula === undefined || operation.value_formula === null) {
    throw new Error(`passive effect "${id}": operation.value_formula is required`);
  }
  if (operation.type === "custom" && !operation.custom_rule) {
    throw new Error(`passive effect "${id}": operation "custom" requires custom_rule`);
  }

  if (!inList(PASSIVE_ACTIVATIONS, activation)) {
    throw new Error(`passive effect "${id}": invalid activation`);
  }
  if (cost !== null && (!cost.resource || !Number.isFinite(Number(cost.amount)))) {
    throw new Error(`passive effect "${id}": cost requires a resource and a numeric amount`);
  }
  if (!inList(PASSIVE_STACKING_MODES, stacking)) {
    throw new Error(`passive effect "${id}": invalid stacking mode`);
  }

  return Object.freeze({
    id,
    name,
    effect_type,
    source_type,
    source_id,
    trigger: Object.freeze({ condition: "", custom_rule: "", ...trigger }),
    targets: Object.freeze([...targets]),
    filters: Object.freeze({ ...filters }),
    operation: Object.freeze({ custom_rule: "", ...operation }),
    activation,
    cost: cost ? Object.freeze({ ...cost }) : null,
    duration,
    cooldown,
    stacking,
    priority: Number(priority) || 0,
    description,
    source_reference,
    confidence,
    requires_review: Boolean(requires_review),
  });
}