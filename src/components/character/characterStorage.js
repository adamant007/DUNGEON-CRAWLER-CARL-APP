import { DEFAULT_CUSTOMIZATION } from "./customizeOptions";

/* Character storage — shared shape between the sheet UI state and the
   canonical Character record. recordFromSheet() and sheetFromRecord() are
   exact inverses, so a freshly loaded record serializes back to the same
   JSON it came from (that identity is what the unsaved-changes check and
   the "never overwrite with blanks" guarantee rely on). */

const ATTACK_BLANK = { name: "", bonus: "", damage: "", type: "", notes: "" };
const SPELL_BLANK = { name: "", cost: "", type: "", notes: "" };
const INVENTORY_BLANK = { item: "", qty: "", notes: "" };
const DETAILS_BLANK = { race: "", class: "", level: 1, floor: 1, crawler: "", size: "", alignment: "", background: "", title: "" };
const GEAR_BLANK = { head: "", chest: "", hands: "", legs: "", feet: "", mainHand: "", offHand: "", other: "" };
const ATTRS_BLANK = { str: 10, dex: 10, con: 10, int: 10, cha: 10 };
const DEFENSE_BLANK = { resist: "", evade: "", move: "", step: "", favor: "" };
const SETTINGS_BLANK = { offsetX: 0, offsetY: 0, scale: 1 };

/* Rules Profile reference (additive). New characters are stamped with the
   system the app currently creates (dungeon_crawler_carl); records from
   before profile fields existed are lazily migrated as LEGACY Crawler
   characters on their next save. That is a legacy migration rule only —
   the resolver has no universal fallback, and a non-legacy record with no
   valid profile reference surfaces the recovery state instead. */
const PROFILE_BLANK = {
  systemKey: "dungeon_crawler_carl",
  rulesProfileId: "",
  profileVersion: 1,
  schemaVersion: 1,
  legacyProfile: false,
};

/* Pregen source metadata (additive, Step 3A.4). character_source marks
   how the record was created ("pregen" = copied from a First Floor
   template), source_template_id references the immutable dcc_ff_* master
   template, and ruleset_data preserves verified rules-specific pregen
   details that have no dedicated canonical field. Round-trips exactly
   like every other sheet field. */
const sourceToRecord = (s) => ({
  character_source: s?.characterSource ?? "",
  source_template_id: s?.sourceTemplateId ?? "",
  ruleset_data: s?.rulesetData ?? {},
});

const profileToRecord = (p) => {
  const v = { ...PROFILE_BLANK, ...(p ?? {}) };
  return {
    system_key: v.systemKey ?? "",
    rules_profile_id: v.rulesProfileId ?? "",
    profile_version: v.profileVersion ?? PROFILE_BLANK.profileVersion,
    schema_version: v.schemaVersion ?? PROFILE_BLANK.schemaVersion,
    legacy_profile: v.legacyProfile ?? false,
  };
};

/* Pad short lists up to `count` rows, but PRESERVE longer ones — a
   wizard-created character may carry more than four inventory items
   (useful item + up to four weird things + granted potions), and
   truncation would silently drop owned items. Round-trip identity is
   unchanged: lists map back to the same length they came from. */
const padRows = (rows, count, blank) =>
  Array.isArray(rows) && rows.length > count
    ? rows.map((r) => ({ ...blank, ...(r ?? {}) }))
    : Array.from({ length: count }, (_, i) => ({ ...blank, ...(rows?.[i] ?? {}) }));
const padList = (list, count) => Array.from({ length: count }, (_, i) => list?.[i] ?? "");
const merge = (base, src) => ({ ...base, ...(src ?? {}) });

/* State-shaped blank sheet — the exact defaults the sheet starts with. */
export function blankSheet() {
  return {
    name: "",
    portrait: "",
    portraitSettings: { ...SETTINGS_BLANK },
    customization: { ...DEFAULT_CUSTOMIZATION },
    info: { ...DETAILS_BLANK },
    gear: { ...GEAR_BLANK },
    attrs: { ...ATTRS_BLANK },
    skills: {},
    hp: 10,
    maxHp: 10,
    mana: 8,
    maxMana: 8,
    defense: { ...DEFENSE_BLANK },
    attacks: Array.from({ length: 4 }, () => ({ ...ATTACK_BLANK })),
    spells: Array.from({ length: 4 }, () => ({ ...SPELL_BLANK })),
    hotbar: Array.from({ length: 10 }, () => ""),
    inventory: Array.from({ length: 4 }, () => ({ ...INVENTORY_BLANK })),
    currency: {},
    notes: "",
    draft: false,
    creationStep: "",
    profile: { ...PROFILE_BLANK },
    characterSource: "",
    sourceTemplateId: "",
    rulesetData: {},
  };
}

/* Record-shaped canonical blank — the database shape of a fresh character. */
export function blankCharacter() {
  return recordFromSheet(blankSheet());
}

/* Sheet state -> canonical record. */
export function recordFromSheet(s) {
  return {
    name: s.name ?? "",
    portrait_url: s.portrait ?? "",
    portrait_settings: merge(SETTINGS_BLANK, s.portraitSettings),
    customization: merge({ ...DEFAULT_CUSTOMIZATION }, s.customization),
    details: merge(DETAILS_BLANK, s.info),
    attributes: merge(ATTRS_BLANK, s.attrs),
    skills: { ...(s.skills ?? {}) },
    health: s.hp ?? 10,
    max_health: s.maxHp ?? 10,
    mana: s.mana ?? 8,
    max_mana: s.maxMana ?? 8,
    defense: merge(DEFENSE_BLANK, s.defense),
    equipment: merge(GEAR_BLANK, s.gear),
    attacks: padRows(s.attacks, 4, ATTACK_BLANK),
    spells: padRows(s.spells, 4, SPELL_BLANK),
    hotbar: padList(s.hotbar, 10),
    inventory: padRows(s.inventory, 4, INVENTORY_BLANK),
    currency: { ...(s.currency ?? {}) },
    notes: s.notes ?? "",
    draft: s.draft ?? false,
    creation_step: s.creationStep ?? "",
    ...profileToRecord(s.profile),
    ...sourceToRecord(s),
  };
}

/* Canonical record -> sheet state. Older records missing fields fall back
   to the defaults, never to blank overwrites of good data. */
export function sheetFromRecord(rec) {
  const r = rec ?? {};
  /* Legacy migration rule: a record created before profile fields existed
     (no profile reference and no legacy flag at all) is treated as a legacy
     dungeon_crawler_carl character. Records carrying an explicit
     legacy_profile value were created with the profile fields and never
     get this stamp — a missing profile on those surfaces the recovery
     state at resolution time instead. */
  const legacy = r.legacy_profile === undefined && !r.system_key && !r.rules_profile_id;
  return {
    name: r.name ?? "",
    portrait: r.portrait_url ?? "",
    portraitSettings: merge(SETTINGS_BLANK, r.portrait_settings),
    customization: merge({ ...DEFAULT_CUSTOMIZATION }, r.customization),
    info: merge(DETAILS_BLANK, r.details),
    gear: merge(GEAR_BLANK, r.equipment),
    attrs: merge(ATTRS_BLANK, r.attributes),
    skills: { ...(r.skills ?? {}) },
    hp: r.health ?? 10,
    maxHp: r.max_health ?? 10,
    mana: r.mana ?? 8,
    maxMana: r.max_mana ?? 8,
    defense: merge(DEFENSE_BLANK, r.defense),
    attacks: padRows(r.attacks, 4, ATTACK_BLANK),
    spells: padRows(r.spells, 4, SPELL_BLANK),
    hotbar: padList(r.hotbar, 10),
    inventory: padRows(r.inventory, 4, INVENTORY_BLANK),
    currency: { ...(r.currency ?? {}) },
    notes: r.notes ?? "",
    draft: r.draft ?? false,
    creationStep: r.creation_step ?? "",
    profile: {
      systemKey: r.system_key ?? (legacy ? PROFILE_BLANK.systemKey : ""),
      rulesProfileId: r.rules_profile_id ?? "",
      profileVersion: r.profile_version ?? PROFILE_BLANK.profileVersion,
      schemaVersion: r.schema_version ?? PROFILE_BLANK.schemaVersion,
      legacyProfile: legacy ? true : (r.legacy_profile ?? false),
    },
    characterSource: r.character_source ?? "",
    sourceTemplateId: r.source_template_id ?? "",
    rulesetData: r.ruleset_data ?? {},
  };
}