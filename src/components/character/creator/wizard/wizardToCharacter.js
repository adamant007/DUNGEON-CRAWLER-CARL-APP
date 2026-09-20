import { blankSheet, recordFromSheet } from "@/components/character/characterStorage";
import { makeThresholdLookup } from "@/rules-profile";
import { canonicalAttacksFromDraft } from "./attackPayload";
import { canonicalSpellsFromDraft, canonicalHotbarFromDraft } from "./spellPayload";
import { derivedStatsFromDraft } from "./derivedStats";

/* Step 3B.9 — REVIEW & CREATE serialization: builds the ONE canonical
   Character record from a FULLY VALIDATED wizard draft. The Review hub
   gates this call — it is never invoked with a partial or invalid draft,
   and no placeholder data is invented to satisfy the gate: anything the
   draft does not carry stays blank. Every value comes from the draft or
   the ACTIVE RULES PROFILE, resolved at serialization time. */

const combatStepDef = (profile) =>
  profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach") ?? null;

const chosenBackgroundNames = (profile, draft) => {
  const type = draft?.startingSpecies?.type;
  const names = [];
  for (const cat of profile?.creation_flow?.backgrounds?.[type] ?? []) {
    const sel = (draft?.backgrounds ?? {})[cat.id];
    if (sel?.background) names.push(sel.background);
  }
  return names.join(", ");
};

export function sheetFromWizard(profile, draft) {
  const sheet = blankSheet();
  const catalog = profile?.skills?.catalog ?? {};
  const cs = draft?.coreStats ?? {};
  const modLookup = makeThresholdLookup(profile?.stats?.mod_rule?.table ?? []);
  const derived = derivedStatsFromDraft(profile, draft);
  const sp = draft?.startingSpecies ?? {};
  const sc = draft?.startingCombat ?? {};
  const g = draft?.startingGear ?? {};
  const w = sc.secondOptionType === "weapon" ? sc.weapon : null;

  /* Identity — the details fields the sheet already renders. */
  sheet.name = (draft?.name ?? "").trim();
  sheet.info = {
    ...sheet.info,
    race: (sp.species ?? "").trim() || sp.label || "",
    class: draft?.crawlerClass ?? "", // Not Yet Assigned until a progression milestone
    level: 1,
    floor: 1,
    crawler: String(draft?.crawlerNumber ?? ""),
    size: sp.sizeLabel ?? "",
    background: chosenBackgroundNames(profile, draft),
  };

  /* Enhanced starting stats (Enhanced = Unenhanced at creation); the full
     enhanced/unenhanced/mod triples are preserved in ruleset_data below. */
  for (const key of profile?.stats?.order ?? []) {
    const v = cs[key]?.enhanced;
    if (typeof v === "number") sheet.attrs[key] = v;
  }

  /* Vitals + defense — all from the profile's LIVE derived formulas. */
  if (derived.health.max !== null) {
    sheet.hp = derived.health.current;
    sheet.maxHp = derived.health.max;
  }
  if (derived.mana.max !== null) {
    sheet.mana = derived.mana.current;
    sheet.maxMana = derived.mana.max;
  }
  sheet.defense = {
    ...sheet.defense,
    resist: derived.damageResistance ?? "",
    evade: derived.evade ?? "",
    move: derived.move ?? "",
    step: derived.step ?? "",
    favor: derived.aiFavor ?? "",
  };

  /* Attacks, known spells, Hotlist — the shared wizard serializers. */
  sheet.attacks = canonicalAttacksFromDraft(profile, draft);
  sheet.spells = canonicalSpellsFromDraft(profile, draft);
  const hotbar = canonicalHotbarFromDraft(profile, draft);
  /* Useful-item Hotlist INTENT — appended after the intended spells, always
     inside the profile's slot cap (never exceeds the Hotlist size). */
  const usefulItem = g.usefulItem ?? {};
  if (usefulItem.hotlist && (usefulItem.name ?? "").trim()) {
    const firstEmpty = hotbar.findIndex((slot) => !slot);
    if (firstEmpty !== -1) hotbar[firstEmpty] = usefulItem.name.trim();
  }
  sheet.hotbar = hotbar;

  /* Gear — each equipped slot feeds the Character Sheet's matching
     equipment destination directly (the profile's gear.slots ids ARE the
     canonical sheet gear keys); empty slots stay empty. MAIN HAND is owned
     by the Step 6 weapon when the player brings it — it is never written
     from the free-text slots. Mundane items grant NO Damage Resistance;
     Skill knowledge and physical possession stay separate. */
  const equipped = g.equipped ?? {};
  for (const slot of profile?.gear?.slots ?? []) {
    const v = (equipped[slot.id] ?? "").trim();
    if (v && sheet.gear[slot.id] !== undefined) sheet.gear[slot.id] = v;
  }
  if (w?.rulesSkillId && g.bringPrimaryWeapon !== false) {
    sheet.gear.mainHand =
      (w.displayName ?? "").trim() ||
      catalog[w.rulesSkillId]?.display_name ||
      catalog[w.rulesSkillId]?.name ||
      w.rulesSkillId;
  }

  /* Inventory — the useful item (with its secondary-weapon Skill note),
     every structured carried entry (weird stuff is a tagged entry, not a
     separate pile), and the profile-declared attack-spell grant. One row
     per item — never a duplicate record for the same thing, and never the
     equipped weapon. */
  const inventory = [];
  if ((usefulItem.name ?? "").trim()) {
    inventory.push({
      item: usefulItem.name.trim(),
      qty: 1,
      notes:
        usefulItem.secondaryWeapon && usefulItem.rulesSkillKey
          ? `Secondary weapon — uses ${catalog[usefulItem.rulesSkillKey]?.name ?? usefulItem.rulesSkillKey} Skill`
          : "",
    });
  }
  for (const entry of g.inventory ?? []) {
    const name = String(entry?.name ?? "").trim();
    if (!name) continue;
    inventory.push({
      item: name,
      qty: entry?.quantity ?? 1,
      notes: entry?.category === "weird_stuff" ? "Weird stuff" : "",
    });
  }
  const grants = combatStepDef(profile)?.options?.find((o) => o.id === "attack_spell")?.grants;
  if (sc.secondOptionType === "attack_spell" && sc.attackSpellId && grants?.mana_potions) {
    inventory.push({ item: grants.mana_potions.item, qty: grants.mana_potions.qty, notes: "" });
  }
  sheet.inventory = inventory;

  /* Canonical ranked Skill rows (ruleset_data.skills — the exact shape
     the sheet's Skills panel reads): background skills at their
     category's starting rank, the baseline attack Skill, the second
     combat option, and automatically-known Heal. No new Skill is invented
     here — every id comes from the draft's own selections. */
  const skills = [];
  const pushSkill = (id, rank) => {
    const def = catalog[id];
    if (!def) return; // unknown id — never invent a row
    const mod =
      typeof def.stat === "string" && typeof cs[def.stat]?.enhanced === "number"
        ? modLookup(cs[def.stat].enhanced)
        : null;
    skills.push({
      id: def.id,
      name: def.name,
      rank,
      stat: def.stat ? def.stat.toUpperCase() : "",
      mod,
      check: "",
      description: def.description ?? "",
    });
  };
  for (const cat of profile?.creation_flow?.backgrounds?.[sp.type] ?? []) {
    const sel = (draft?.backgrounds ?? {})[cat.id];
    for (const id of sel?.skills ?? []) pushSkill(id, cat.startingRank ?? 1);
  }
  if (draft?.baselineAttack?.id) pushSkill(draft.baselineAttack.id, draft.baselineAttack.rank ?? 3);
  if (sc.secondOptionType === "weapon" && w?.rulesSkillId) pushSkill(w.rulesSkillId, w.rank ?? 3);
  if (sc.secondOptionType === "hand_to_hand" && sc.handToHand?.attackSkillId) {
    pushSkill(sc.handToHand.attackSkillId, sc.handToHand.rank ?? 3);
  }
  const spellDetails =
    combatStepDef(profile)?.options?.find((o) => o.id === "attack_spell")?.spell_details ?? {};
  if (sc.secondOptionType === "attack_spell" && sc.attackSpellId) {
    pushSkill(sc.attackSpellId, spellDetails[sc.attackSpellId]?.rank ?? 3);
  }
  const healDef = profile?.spells?.starting_spell;
  if (healDef?.id) pushSkill(healDef.id, healDef.rank ?? 1);

  /* Profile association + provenance + preserved creation detail. */
  sheet.profile = {
    ...sheet.profile,
    systemKey: draft?.systemKey ?? profile?.system_key ?? "",
    profileVersion: draft?.profileVersion ?? sheet.profile.profileVersion,
    schemaVersion: draft?.schemaVersion ?? sheet.profile.schemaVersion,
    legacyProfile: false,
  };
  sheet.characterSource = "wizard";
  sheet.sourceTemplateId = "";
  sheet.rulesetData = {
    stats: Object.fromEntries(
      (profile?.stats?.order ?? []).map((k) => [
        k,
        {
          enhanced: cs[k]?.enhanced ?? null,
          unenhanced: cs[k]?.unenhanced ?? null,
          mod: typeof cs[k]?.enhanced === "number" ? modLookup(cs[k].enhanced) : null,
        },
      ])
    ),
    skills,
    identity: {
      pronouns: draft?.pronouns ?? "",
      gender: draft?.gender ?? null,
      healthBarSlotValue: derived.health.valuePerSlot,
      startingSpecies: { ...sp },
      currentRace: draft?.currentRace ?? null,
    },
    storyHooks: {
      pastTrauma: (draft?.storyHooks?.pastTrauma ?? "").trim(),
      looseEnd: (draft?.storyHooks?.looseEnd ?? "").trim(),
      regret: (draft?.storyHooks?.regret ?? "").trim(),
    },
    /* The wizard's own choices preserved for later Review-style detail —
       additive, exactly like pregen-sourced characters preserve their
       template data. */
    creation: {
      backgrounds: draft?.backgrounds ?? {},
      startingCombat: sc,
      startingGear: g,
      healToHotlist: draft?.healToHotlist !== false,
    },
  };

  return sheet;
}

/* Canonical Character record data for a new wizard-sourced character. */
export function recordFromWizard(profile, draft) {
  return recordFromSheet(sheetFromWizard(profile, draft));
}