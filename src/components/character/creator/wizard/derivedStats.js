/* Profile-driven derived-stat resolution for the Character Creator wizard.

   The wizard NEVER hardcodes DCCarl math: it asks the ACTIVE RULES PROFILE's
   declarative formulas (resources.health.max, resources.mana.max,
   derived.evade.formula, derived.move/step and damage_resistance defaults)
   to evaluate against the CURRENT draft through the shared formula engine.
   Uploaded rulebook and homebrew profiles can define entirely different
   formulas — this module only supplies the draft as evaluation context. */

import { evaluateFormula, makeThresholdLookup } from "@/rules-profile";

const finiteOr = (v) => (Number.isFinite(v) ? v : null);

/* Formula context over the CURRENT Step 3 stats — Enhanced values, with the
   profile's official threshold table supplying stat mods (the same shared
   lookup the Character Sheet and Step 3 use). */
export const draftFormulaContext = (profile, draft) => {
  const coreStats = draft?.coreStats ?? {};
  const modLookup = makeThresholdLookup(profile?.stats?.mod_rule?.table ?? []);
  return {
    stat: (key, which = "enhanced") => coreStats[key]?.[which],
    statMod: (key) => {
      const v = coreStats[key]?.enhanced;
      return typeof v === "number" ? modLookup(v) : undefined;
    },
    value: () => undefined,
  };
};

/* The full Step 5 derived snapshot — computed LIVE from the draft on every
   call, never cached, so BACK edits to Steps 2–3 are always reflected. */
export const derivedStatsFromDraft = (profile, draft) => {
  const ctx = draftFormulaContext(profile, draft);
  const healthMax = finiteOr(evaluateFormula(profile?.resources?.health?.max, ctx));
  const slotCount = profile?.resources?.health?.bar?.segments ?? 10;
  const manaMax = finiteOr(evaluateFormula(profile?.resources?.mana?.max, ctx));
  return {
    health: {
      current: healthMax,
      max: healthMax,
      slotCount,
      valuePerSlot: healthMax !== null ? healthMax / slotCount : null,
      sourceMod: ctx.statMod("con") ?? null,
    },
    mana: {
      current: manaMax,
      max: manaMax,
      sourceValue: ctx.stat("int", "enhanced") ?? null,
    },
    evade: finiteOr(evaluateFormula(profile?.derived?.evade?.formula, ctx)),
    move: finiteOr(evaluateFormula(profile?.derived?.move?.default, ctx)),
    step: finiteOr(evaluateFormula(profile?.derived?.step?.default, ctx)),
    damageResistance: finiteOr(evaluateFormula(profile?.derived?.damage_resistance?.default, ctx)),
    aiFavor: draft?.aiFavor ?? null,
    size: draft?.startingSpecies?.sizeValue ?? null,
    sizeLabel: draft?.startingSpecies?.sizeLabel ?? "",
  };
};