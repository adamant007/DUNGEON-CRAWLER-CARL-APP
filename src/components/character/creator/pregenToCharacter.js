import { blankSheet, recordFromSheet } from "@/components/character/characterStorage";
import { consumableRow } from "@/components/character/consumableEffect";
import { SKILL_CATALOG } from "@/rules-profile/adapters/dungeon_crawler_carl/skillCatalog";

/* Step 3A.4 — copies a verified FIRST FLOOR pregen TEMPLATE into the
   canonical Character record shape.

   The template is immutable master data: this module only READS it and
   never mutates or shares it. Every player receives their OWN independent
   Character record. Verified template values are copied exactly — no
   rerolls, no recalculation, no leveling, no invented values. */

/* Original template gear slots -> existing Armor/Equipment sheet slots.
   The original slot/item pairs are preserved verbatim in ruleset_data. */
const GEAR_SLOT_MAP = {
  Head: "head",
  Torso: "chest",
  Legs: "legs",
  Feet: "feet",
  "Hands/Holding": "mainHand",
  Accessory: "other",
};

const SKILL_BY_NAME = Object.fromEntries(
  Object.values(SKILL_CATALOG).flatMap((def) => [
    [def.name, def],
    ...(def.display_name ? [[def.display_name, def]] : []),
    ...((def.aliases ?? []).map((alias) => [alias, def])),
  ])
);

const enrichSkill = (skill) => {
  const def = (skill?.id && SKILL_CATALOG[skill.id]) || SKILL_BY_NAME[skill?.name] || null;
  if (!def) return skill;
  return {
    ...skill,
    id: skill.id ?? def.id,
    description: skill.description ?? def.description ?? "",
    ai_favor: skill.ai_favor ?? def.ai_favor ?? null,
  };
};

const attackNotes = (a) =>
  [a.range ? `Range ${a.range}` : null, a.notes]
    .filter(Boolean)
    .join("; ");

/* Template attack -> existing Attacks sheet row. Rank, attack stat,
   damage stat, and passive-effect details have no canonical column, so
   the complete original attack list is also preserved in ruleset_data. */
const attackRow = (a) => ({
  name: a.name ?? "",
  bonus: a.toHit ?? "",
  damage: a.damage ?? "",
  type: a.type ?? a.damageType ?? "",
  notes: attackNotes(a),
});

export function sheetFromPregen(template) {
  const sheet = blankSheet();
  const id = template.identity;
  const d = template.derived;

  sheet.name = id.name;
  sheet.info = {
    race: id.race,
    class: id.className,
    level: id.level,
    floor: template.floor,
    crawler: String(id.crawlerNumber),
    size: id.size,
    alignment: "",
    background: "",
    title: "",
  };

  /* The sheet's stat boxes carry the ENHANCED stat values; the complete
     enhanced/unenhanced/mod triples are preserved in ruleset_data. */
  sheet.attrs = {
    str: template.stats.str.enhanced,
    int: template.stats.int.enhanced,
    con: template.stats.con.enhanced,
    dex: template.stats.dex.enhanced,
    cha: template.stats.cha.enhanced,
  };

  /* Starting values exactly as printed on the template. */
  sheet.hp = d.health;
  sheet.maxHp = d.health;
  sheet.mana = d.currentMana;
  sheet.maxMana = d.maxMana;

  sheet.defense = {
    resist: d.damageResistance,
    evade: d.evade,
    move: d.move,
    step: d.step,
    favor: id.aiFavor,
  };

  sheet.attacks = template.attacks.map(attackRow);
  sheet.hotbar = template.hotlist.map((h) => `${h.name} — ${h.detail}`);

  const gear = {};
  for (const g of template.gear) {
    const slot = GEAR_SLOT_MAP[g.slot];
    if (slot) gear[slot] = g.item;
  }
  sheet.gear = gear;

  sheet.inventory = template.inventory.map((i) => ({
    item: i.item,
    qty: i.qty,
    notes: "",
  }));

  /* Hotlist consumables are ALSO canonical Inventory items — a Hotbar slot
     is a REFERENCE to that same item and its ONE shared quantity. Spells
     stay spell actions (the knownSpells path) and never become inventory
     rows. The entry's stored effect text (e.g. "heal 5 Health Bar slots")
     becomes the item's canonical notes — the effect definition consumed at
     use time, so the pipeline stays generic for future consumables. */
  for (const h of template.hotlist ?? []) {
    const isSpell = /spell/i.test(h?.name ?? "") || /spell/i.test(h?.detail ?? "");
    if (isSpell || !(h?.name ?? "").trim()) continue;
    const row = consumableRow(h.name, h.detail);
    if (!row.item) continue;
    sheet.inventory.push(row);
  }

  /* Rules Profile association — the existing builtin Dungeon Crawler Carl
     profile, resolved by system_key (no new profile is created). */
  sheet.profile = {
    systemKey: template.systemKey,
    rulesProfileId: "",
    profileVersion: 1,
    schemaVersion: 1,
    legacyProfile: false,
  };

  /* Pregen provenance + verified details that have no dedicated canonical
     field. Nothing from the template is silently discarded. */
  sheet.characterSource = "pregen";
  sheet.sourceTemplateId = template.id;
  sheet.rulesetData = {
    stats: template.stats,
    skills: (template.skills ?? []).map(enrichSkill),
    attacks: template.attacks,
    hotlist: template.hotlist,
    gear: template.gear,
    inventory: template.inventory,
    storyHooks: template.storyHooks,
    identity: {
      pronouns: id.pronouns,
      popularity: id.popularity,
      healthBarSlotValue: d.healthBarSlotValue,
      ...(d.evadeBaseDex !== undefined ? { evadeBaseDex: d.evadeBaseDex } : {}),
      ...(d.evadeBuff ? { evadeBuff: d.evadeBuff } : {}),
    },
  };

  return sheet;
}

/* Canonical Character record data for a new pregen-sourced character. */
export function recordFromPregen(template) {
  return recordFromSheet(sheetFromPregen(template));
}