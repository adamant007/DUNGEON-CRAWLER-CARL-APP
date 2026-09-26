/* Canonical spell serialization for wizard-created crawlers.

   ONE canonical Character record — the wizard never keeps a separate spell
   store. Known spell ids (draft.startingSpells) serialize into the
   Character's canonical `spells` rows (the characterStorage SPELL row shape:
   { name, cost, type, notes }), and the Hotlist holds the SAME spells by
   name — Hotlist placement REFERENCES a known spell; removing a Hotlist slot
   never removes spell knowledge. Known spells and Hotlist placement are
   separate concepts by construction.

   Every value resolves from the ACTIVE RULES PROFILE at serialization time.
   Damage text keeps the structural "+ INT Mod" formula — the current INT
   modifier is never frozen into permanent spell data. */

export const canonicalSpellsFromDraft = (profile, draft) => {
  const ids = Array.isArray(draft?.startingSpells) ? draft.startingSpells : [];
  const catalog = profile?.skills?.catalog ?? {};
  const heal = profile?.spells?.starting_spell ?? null;
  const details =
    profile?.creation_flow?.steps
      ?.find((s) => s.id === "combat_approach")
      ?.options?.find((o) => o.id === "attack_spell")?.spell_details ?? {};
  const rows = [];
  for (const id of ids) {
    const name = catalog[id]?.name ?? id;
    if (heal && id === heal.id) {
      rows.push({
        name,
        cost: String(heal.mana_cost ?? ""),
        type: "Heal",
        notes: [
          heal.desc ?? "",
          `Rank ${heal.rank}${heal.rank_is_max ? " (MAX)" : ""}`,
          heal.range,
          `Heals ${heal.heals_slots} Health Bar slots`,
          heal.interrupt ? "Interrupt" : "",
        ].filter(Boolean).join(" · "),
      });
      continue;
    }
    const det = details[id];
    if (!det) continue; // unknown id — never invent a spell row
    rows.push({
      name,
      cost: String(det.mana_cost ?? ""),
      type: det.type ?? "",
      notes: [
        det.desc ?? "",
        `Rank ${det.rank ?? 3}`,
        `Range ${det.range ?? ""}`,
        `Damage ${det.damage?.dice ?? ""}${det.damage?.plus_int_mod ? " + INT Mod" : ""}`,
      ].filter(Boolean).join(" · "),
    });
  }
  return rows;
};

/* Intended starting Hotlist — profile-sized (10) slots holding the NAMES of
   the same canonical known spells, from the front. */
export const canonicalHotbarFromDraft = (profile, draft) => {
  const catalog = profile?.skills?.catalog ?? {};
  const ids = Array.isArray(draft?.startingHotlist) ? draft.startingHotlist : [];
  const slots = Array.from({ length: profile?.spells?.hotbar?.slots ?? 10 }, () => "");
  ids.slice(0, slots.length).forEach((id, i) => {
    slots[i] = catalog[id]?.name ?? id;
  });
  return slots;
};