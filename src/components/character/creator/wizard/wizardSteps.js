/* Wizard step configuration — keyed by system_key, never hardcoded into a
   component. A system that has not defined wizard steps yet surfaces the
   recovery state instead of silently borrowing another system's flow.
   Each step entry carries the shell data; its real mechanics component is
   attached in a later implementation step. */

export const WIZARD_STEPS = {
  dungeon_crawler_carl: [
    { key: "identity", title: "Identity", blurb: "Crawler name, pronouns, crawler number, and portrait will be configured in this step." },
    { key: "race", title: "Race / Species", blurb: "Crawler type, race, and species selection will be configured in this step." },
    { key: "core-stats", title: "Core Stats", blurb: "Stat generation and assignment will be configured in this step." },
    { key: "background", title: "Background & Skills", blurb: "Background selection and starting skills will be configured in this step." },
    { key: "derived", title: "Derived Stats", blurb: "Derived values — health, mana, evade, and movement — will be configured in this step." },
    { key: "abilities", title: "Starting Combat & Spells", blurb: "Second combat option — Weapon, Attack Spell, or Unarmed / Hand-to-Hand — plus the automatic Heal spell and Hotlist placement." },
    { key: "gear", title: "Starting Gear", blurb: "Starting equipment will be configured in this step." },
    { key: "story", title: "Traumas, Loose Ends & Regrets", blurb: "Record the crawler’s past trauma, loose end, and regret for the Character Sheet and GM story hooks." },
    { key: "review", title: "Review & Create", blurb: "A final review of every choice before the Character is created." },
  ],
};

/* Wizard draft — ONE in-memory draft per creation attempt, separate from
   the canonical Character record. Fields are placeholders (null/empty):
   no invented values. Nothing here is persisted until the final
   Review & Create step builds the canonical record through the existing
   creation path. */
export const blankWizardDraft = (selection) => ({
  systemKey: selection?.systemKey ?? "",
  displayName: selection?.displayName ?? "",
  profileVersion: selection?.profile?.profile_version ?? null,
  schemaVersion: selection?.profile?.schema_version ?? null,
  name: "",
  gender: { choice: "", custom: "" }, // optional — the CHARACTER's gender, independent of pronouns
  pronouns: "",
  crawlerNumber: "",
  /* Step 3 — CORE STATS: profile-driven generation. method is the ACTIVE
     PROFILE's stat-method id; each stat is { enhanced, unenhanced } and the
     two are EQUAL at starting creation — no enhancements are applied yet. */
  coreStats: { method: "", str: null, int: null, con: null, dex: null, cha: null },
  /* Step 2 — what the crawler ENTERED the dungeon as. startingSpecies is
     permanent provenance, conceptually distinct from currentRace: a
     future progression event may set currentRace but never rewrites
     startingSpecies. sizeValue/sizeLabel hold the profile-permitted
     starting Size. */
  startingSpecies: { type: "", label: "", species: "", sizeValue: null, sizeLabel: "" },
  currentRace: null, // future progression event only — never set during First Floor creation
  crawlerClass: null, // stays null here — Class: Not Yet Assigned until a progression milestone
  aiFavor: null, // derived from the chosen crawler type (profile-owned default)
  baselineAttack: null, // { id, name, rank } — recorded for the later Background & Skills step
  /* Step 4 — BACKGROUNDS: keyed by the ACTIVE PROFILE's category id. Each
     entry holds the chosen background (profile option name) and exactly two
     selected canonical skill ids — names, ranks, stats, and mods always
     resolve from the profile's catalog, never duplicated in the draft. */
  backgrounds: {},
  level: null,
  floor: null,
  stats: null,
  background: null,
  skills: null,
  /* Step 5 — DERIVED STATS snapshot: computed from the ACTIVE PROFILE's
     formulas against the current draft (derivedStatsFromDraft) — written on
     NEXT for later steps; the step itself always recomputes LIVE, so BACK
     edits to Steps 2–3 never leave stale derived numbers. */
  derived: null,
  /* Step 6 — STARTING COMBAT & SPELLS: the ONE second combat option (weapon,
     attack spell, or hand-to-hand/unarmed) beside the Step 2 baseline attack, Heal (always known;
     Hotlist placement optional), and the intended starting spells / Hotlist
     snapshots written on NEXT. A chosen weapon is only the starting weapon
     CANDIDATE — its physical gear belongs to Step 7, not this draft. */
  /* animalWeaponOverride — the Step 6 GM override for a profile-restricted
     crawler type (Animal / Non-Human): OFF by default. Turning it OFF after
     a weapon was chosen clears that now-invalid choice (StepAbilities)
     without touching stats, the Slice Attack baseline, or spells. */
  startingCombat: { secondOptionType: "", weapon: null, attackSpellId: "", handToHand: null, animalWeaponOverride: false },
  healToHotlist: true, // ADD HEAL TO HOTLIST defaults ON
  startingSpells: null, // [heal, optional attack spell] — written on NEXT
  startingHotlist: null, // intended Hotlist entries — written on NEXT
  /* Story hooks — required creation details that appear on the Character Sheet. */
  storyHooks: { pastTrauma: "", looseEnd: "", regret: "" },
  /* Step 7 — STARTING GEAR: physical possessions only — Skill knowledge
     from Steps 2–6 is never changed here. equipped maps each ACTIVE
     PROFILE gear-slot id to the item worn/carried there (empty string =
     empty slot) — clothing is entered per slot, never one combined string.
     MAIN HAND is owned by the Step 6 weapon while bringPrimaryWeapon is
     on: it is never a free-text slot, and the weapon is never duplicated
     into inventory. inventory is a list of STRUCTURED carried entries
     { id, name, category, quantity } — weird stuff is an inventory entry
     tagged category "weird_stuff", never a separate pile. usefulItem is
     the one interesting/useful item, carried in inventory by default; it
     may double as a secondary weapon ONLY when the draft already knows a
     qualifying weapon Skill from a Step 4 background — no new Skill is
     granted. Its hotlist flag is an INTENT only; actual slot placement
     (within the profile's slot cap) happens at final creation. */
  startingGear: {
    bringPrimaryWeapon: true,
    equipped: {},
    usefulItem: { name: "", hotlist: false, secondaryWeapon: false, rulesSkillKey: "" },
    inventory: [],
  },
});

/* Resolve the wizard steps for a selection. A valid launch needs both a
   registered profile and a step flow for its system key — no silent
   fallback to Dungeon Crawler Carl or any other system. */
export const wizardStepsFor = (selection) => {
  const profile = selection?.profile;
  if (!profile || profile.system_key !== selection?.systemKey) return null;
  return WIZARD_STEPS[selection.systemKey] ?? null;
};

/* Crawler-number bounds live in the ACTIVE PROFILE's creation rules
   (creation_flow.basic_identity) — never a universal wizard rule, so
   future profiles can define completely different identity fields. */
const crawlerNumberRange = (profile) => {
  const fields = profile?.creation_flow?.basic_identity?.fields;
  const field = Array.isArray(fields) ? fields.find((f) => f.id === "crawler_number") : null;
  return field?.range ?? null; // { min, max } when the profile defines crawler numbers
};

/* Crawler numbers already taken by the user's canonical Character
   records (the number is stored in details.crawler). Read-only — numbers
   are never reserved by viewing or abandoning the wizard. */
export const crawlerNumberFromRecord = (rec) => {
  const digits = String(rec?.details?.crawler ?? "").replace(/\D/g, "");
  return digits === "" ? null : parseInt(digits, 10);
};

export const crawlerNumbersFromRecords = (records) => {
  const used = new Set();
  for (const rec of records ?? []) {
    const number = crawlerNumberFromRecord(rec);
    if (number !== null) used.add(number);
  }
  return used;
};

export const crawlerNumberConflict = (records, crawlerNumber, excludeId = null) => {
  const digits = String(crawlerNumber ?? "").replace(/\D/g, "");
  if (digits === "") return null;
  const wanted = parseInt(digits, 10);
  return (
    (records ?? []).find(
      (rec) => rec?.id !== excludeId && crawlerNumberFromRecord(rec) === wanted
    ) ?? null
  );
};

/* ===== Step 2 — RACE / SPECIES (starting identity only, Step 3B.3) =====
   Every value comes from the ACTIVE PROFILE's creation rules: crawler
   types, per-type starting Size, AI Favor defaults, and the baseline
   attack skill. Nothing here is a universal Ginger Dragon rule, and no
   later-floor Race or Class catalog is exposed — those are progression
   events the profile unlocks at a milestone. */

/* The profile's favor_size step config — { scale, <crawlerTypeId>: {…} }. */
const startingSizeConfig = (profile) =>
  profile?.creation_flow?.steps?.find((s) => s.id === "favor_size")?.size ?? null;

/* Baseline attack for a crawler type: canonical skill id from the
   profile's combat_approach step, display name from its skill catalog. */
export const baselineAttackForType = (profile, typeId) => {
  const step = profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach");
  const skillId = step?.baseline_attack?.[typeId];
  if (!skillId) return null;
  return {
    id: skillId,
    name: profile?.skills?.catalog?.[skillId]?.name ?? skillId,
    rank: step?.baseline_rank ?? null,
  };
};

/* Derived starting values for a chosen crawler type — the draft patch the
   step applies. Fixed-Size types (Human) carry their Size automatically;
   option-Size types (Animal / Non-Human) leave it null for the user to
   pick from the profile's permitted starting list. */
export const startingValuesForType = (profile, typeDef) => {
  const conf = startingSizeConfig(profile)?.[typeDef.id] ?? null;
  const fixed = conf && conf.value !== undefined ? conf : null;
  return {
    startingSpecies: {
      type: typeDef.id,
      label: typeDef.label,
      species: fixed ? typeDef.label : "",
      sizeValue: fixed ? fixed.value : null,
      sizeLabel: fixed ? fixed.label : "",
    },
    aiFavor: profile?.derived?.ai_favor?.default_by_crawler_type?.[typeDef.id] ?? null,
    baselineAttack: baselineAttackForType(profile, typeDef.id),
  };
};

/* Species-size suggestion — an overridable DEFAULT, not a lock. The
   mapping lives in the ACTIVE PROFILE's favor_size size config per
   crawler type (normalized lowercase species -> size value); the wizard
   never invents a mapping and never infers a size from the typed text.
   A suggestion is only returned when it is inside the same type's
   permitted starting Size options — a species whose mapped size is NOT
   permitted comes back flagged { notPermitted } so the UI can say so and
   leave the Size unresolved instead of silently forcing another size. */
export const suggestedSizeForSpecies = (profile, typeId, species) => {
  const conf = startingSizeConfig(profile)?.[typeId] ?? null;
  const defaults = conf?.species_size_defaults;
  if (!defaults) return null; // this profile/type derives size another way — no guess
  const key = String(species ?? "").trim().toLowerCase();
  if (!key) return null;
  const value = defaults[key];
  if (value === undefined || value === null) return null; // unrecognized species — leave Size unselected
  if (Array.isArray(conf?.options) && !conf.options.includes(value)) {
    const scale = startingSizeConfig(profile)?.scale ?? [];
    const opt = scale.find((s) => s.value === value);
    return { notPermitted: true, value, label: opt?.label ?? "", speciesKey: key }; // known normal size, not allowed at starting creation
  }
  const scale = startingSizeConfig(profile)?.scale ?? [];
  const opt = scale.find((s) => s.value === value);
  return { value, label: opt?.label ?? "", speciesKey: key };
};

/* GM/rules notice for a recognized species whose verified normal Size falls
   outside the type's permitted starting range — e.g. Horse -> Large (5) vs
   the starting options 2–4. Returns null when the species is unknown or its
   size IS permitted. Used both for the inline step message and by the
   shared validators so the Review hub reports the same GM/rules issue. */
export const outOfRangeSizeNotice = (profile, typeId, species) => {
  const options = startingSizeConfig(profile)?.[typeId]?.options;
  if (!Array.isArray(options) || options.length === 0) return null;
  const suggested = suggestedSizeForSpecies(profile, typeId, species);
  if (!suggested?.notPermitted) return null;
  const display = suggested.speciesKey.charAt(0).toUpperCase() + suggested.speciesKey.slice(1);
  return `${display} is normally ${suggested.label} (${suggested.value}), which is outside the standard starting Animal crawler size range of ${Math.min(...options)}\u2013${Math.max(...options)}. Ask your GM.`;
};

/* ===== Step 6 — profile-driven weapon policy (Animal restriction) =====
   The ACTIVE PROFILE's combat_approach step may declare animal_weapon_policy:
   { default: "allowed" | "restricted" | "forbidden", gm_override_allowed,
     applies_to: [crawlerTypeIds] }. No policy, or a type not listed ->
   "allowed" (the fully normal Weapon path — DCCarl Humans are unaffected).
   "restricted" fades the Weapon card until the player ticks the GM override;
   "forbidden" is never selectable and offers no override. The Wizard never
   hardcodes a type list — future profiles just declare their own policy. */
export const weaponPolicyForType = (profile, typeId) => {
  const step = profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach");
  const policy = step?.animal_weapon_policy;
  if (!policy || !(policy.applies_to ?? ["animal"]).includes(typeId)) {
    return { mode: "allowed", overrideAllowed: false };
  }
  return {
    mode: policy.default ?? "allowed",
    overrideAllowed: policy.gm_override_allowed !== false,
  };
};

/* ===== Shared step validation — ONE validator per step =====
   The SAME validators power BOTH each step's inline messages and the
   Review hub — it never duplicates validation logic.

   stepIssues returns tagged issues:
   - kind "incomplete" = required data missing / blank (no number, only 3
     of 5 stats assigned, a background not chosen, no combat option yet)
   - kind "invalid" = a broken relationship or rule violation (duplicate
     crawler number, duplicate Standard Array value, Attack Spell without
     the INT requirement, secondary weapon without a known Skill)

   GLOBAL BROWSE BEHAVIOR: neither kind ever blocks NEXT on Steps 1–8 —
   players may browse freely with the draft fully preserved. NEITHER kind
   may be used to create the final Character: the Review hub gates
   CREATE CHARACTER until every required issue is complete AND valid.
   Optional fields (pronouns, clothing, useful item, weird stuff, optional
   Hotlist placement) never produce issues. */
export const stepIssues = (stepKey, draft, profile, usedNumbers = null) => {
  const issues = [];
  const add = (key, kind, message) => issues.push({ key, kind, message });

  if (stepKey === "race") {
    const sp = draft.startingSpecies ?? {};
    const typeDef = profile?.creation_flow?.crawler_types?.find((t) => t.id === sp.type);
    if (!typeDef) {
      add("startingSpeciesType", "incomplete", "Choose the crawler type that entered the dungeon.");
      return issues;
    }
    const sizeConf = startingSizeConfig(profile)?.[sp.type] ?? null;
    if (sizeConf?.species_required && !(sp.species ?? "").trim()) {
      add("startingSpeciesName", "incomplete", "Enter the starting species / animal type.");
    }
    /* A recognized species whose normal Size is outside the permitted
       starting range is a GM/rules issue — no silent substitution, and no
       GM override system yet (deliberate). */
    const outOfRange = outOfRangeSizeNotice(profile, sp.type, sp.species);
    if (outOfRange) {
      add("startingSpeciesSize", "invalid", outOfRange);
    } else if (Array.isArray(sizeConf?.options)) {
      if (!sizeConf.options.includes(sp.sizeValue)) {
        add("startingSpeciesSize", "incomplete", "Select a permitted starting Size.");
      }
    } else if (sizeConf && sp.sizeValue !== sizeConf.value) {
      add("startingSpeciesSize", "incomplete", "The starting Size for this crawler type is missing.");
    }
    /* AI Favor is the required derived value. A baseline attack is only
       required when the profile defines one for this crawler type —
       "no starting attack yet" is a complete, valid draft state. */
    if (draft.aiFavor === null || draft.aiFavor === undefined) {
      add("startingSpeciesDerived", "incomplete", "Starting values are incomplete — choose the crawler type again.");
    }
    return issues;
  }

  if (stepKey === "core-stats") {
    const cs = draft.coreStats ?? {};
    const stepDef = profile?.creation_flow?.steps?.find((s) => s.id === "stats");
    const methodDef = (stepDef?.methods ?? []).find((m) => m.id === cs.method);
    if (!methodDef) {
      add("coreStatsMethod", "incomplete", "Choose a stat generation method before continuing.");
      return issues;
    }
    const keys = profile?.stats?.order ?? [];
    const values = keys.map((k) => cs[k]?.enhanced);
    if (Array.isArray(methodDef.values)) {
      /* Standard-array style: every profile value used exactly once. A
         value that cannot be consumed (duplicate) is INVALID; an
         unassigned value or an unused array value is INCOMPLETE. */
      const remaining = [...methodDef.values];
      let duplicate = false;
      let unassigned = false;
      for (const v of values) {
        const i = typeof v === "number" ? remaining.indexOf(v) : -1;
        if (i === -1) {
          if (typeof v === "number") duplicate = true;
          else unassigned = true;
          continue;
        }
        remaining.splice(i, 1);
      }
      if (duplicate) {
        add("coreStatsValues", "invalid", `Each value (${methodDef.values.join(", ")}) may only be used once.`);
      }
      if (unassigned || remaining.length > 0) {
        add("coreStatsValues", "incomplete", `Assign each value (${methodDef.values.join(", ")}) exactly once.`);
      }
    } else if (methodDef.roll) {
      /* Roll style: every stat holds a rolled face the profile keeps. An
         unrolled stat is INCOMPLETE; a kept invalid face is INVALID. */
      const dieSides = methodDef.roll.die ?? 6;
      const reroll = methodDef.roll.reroll ?? [];
      const valid = (v) =>
        Number.isInteger(v) && v >= 1 && v <= dieSides && !reroll.includes(v);
      if (keys.length === 0 || values.some((v) => typeof v !== "number")) {
        add("coreStatsValues", "incomplete", `Roll all stats (1d${dieSides}) before continuing.`);
      } else if (values.some((v) => !valid(v))) {
        add("coreStatsValues", "invalid", `Rolled stats must be kept faces (1d${dieSides}, reroll ${reroll.join(", ")}).`);
      }
    } else {
      add("coreStatsValues", "invalid", "This generation method is not defined by the Rules Profile.");
    }
    /* Starting creation: Enhanced = Unenhanced for every stat. */
    if (!issues.some((i) => i.key === "coreStatsValues") && keys.some((k) => cs[k]?.enhanced !== cs[k]?.unenhanced)) {
      add("coreStatsValues", "invalid", "Starting stats must have Enhanced equal to Unenhanced.");
    }
    return issues;
  }

  if (stepKey === "background") {
    const stepDef = profile?.creation_flow?.steps?.find((s) => s.id === "backgrounds");
    const skillsPer = stepDef?.skills_per_background ?? 2;
    const type = draft.startingSpecies?.type;
    const categories = profile?.creation_flow?.backgrounds?.[type] ?? [];
    const bgs = draft.backgrounds ?? {};
    if (categories.length === 0) {
      add("backgroundsCategories", "incomplete", "Choose a crawler type in Step 2 before selecting backgrounds.");
      return issues;
    }
    const selectedIds = [];
    for (const cat of categories) {
      const sel = bgs[cat.id];
      const bg = cat.options.find((o) => o.name === sel?.background);
      if (!bg) {
        add(`bg_${cat.id}`, "incomplete", `Choose a ${cat.label} background.`);
        continue;
      }
      const skills = sel?.skills ?? [];
      if (skills.length !== skillsPer) {
        add(`bg_${cat.id}`, "incomplete", `Choose exactly ${skillsPer} skills from your ${cat.label} background.`);
        continue;
      }
      if (skills.some((id) => !bg.skillIds.includes(id))) {
        add(`bg_${cat.id}`, "invalid", `Selected skills must come from your ${cat.label} background.`);
        continue;
      }
      selectedIds.push(...skills);
    }
    /* No double-dipping: every background skill unique — 8 unique total. */
    if (stepDef?.duplicate_skills_cannot_stack && selectedIds.length !== new Set(selectedIds).size) {
      add("backgroundsUnique", "invalid", "Each skill may only be selected from one background — 8 unique background skills total.");
    }
    return issues;
  }

  if (stepKey === "abilities") {
    const stepDef = profile?.creation_flow?.steps?.find((s) => s.id === "combat_approach");
    const options = stepDef?.options ?? [];
    const weaponOption = options.find((o) => o.id === "weapon");
    const spellOption = options.find((o) => o.id === "attack_spell");
    const handOption = options.find((o) => o.id === "hand_to_hand");
    const sc = draft.startingCombat ?? {};
    /* Profile weapon policy — a weapon selected while the path is not
       allowed (e.g. the Animal GM override switched OFF) is INVALID. The
       toggle already clears the choice at draft level; this catches any
       stale state. Stats and the Slice Attack baseline are never touched. */
    const policy = weaponPolicyForType(profile, draft?.startingSpecies?.type);
    const weaponAllowed =
      policy.mode === "allowed" ||
      (policy.mode === "restricted" && sc.animalWeaponOverride === true);
    if (sc.secondOptionType === "weapon" && !weaponAllowed) {
      add("combatOption", "invalid", "Choose a valid second combat option.");
      return issues;
    }
    if (sc.secondOptionType === "weapon") {
      const approved = new Set((weaponOption?.categories ?? []).flatMap((c) => c.weaponIds ?? []));
      if (!sc.weapon?.rulesSkillId) {
        add("combatOption", "incomplete", "Choose an approved weapon Skill — custom weapons still need one.");
      } else if (!approved.has(sc.weapon.rulesSkillId)) {
        add("combatOption", "invalid", "Choose an approved weapon Skill — custom weapons still need one.");
      }
    } else if (sc.secondOptionType === "hand_to_hand") {
      const pairs = handOption?.pairs ?? [];
      const chosen = sc.handToHand ?? {};
      const pair = pairs.find((p) => p.attackSkillId === chosen.attackSkillId);
      if (!pair) {
        add("combatOption", "incomplete", "Choose an approved Unarmed / Hand-to-Hand combat Skill.");
      } else if (pair.damageEffectId !== chosen.damageEffectId) {
        add("combatOption", "invalid", "That Hand-to-Hand Skill is not linked to the selected Damage Effect.");
      }
    } else if (sc.secondOptionType === "attack_spell") {
      const intEnh = draft.coreStats?.int?.enhanced;
      const minInt = spellOption?.requirement?.min_enhanced_int ?? 4;
      if (typeof intEnh !== "number" || intEnh < minInt) {
        /* BACK to Step 3 and lowered INT — the previous selection is
           invalid. Never silently alters INT; requires a new valid
           choice. */
        add("combatOption", "invalid", `Attack Spells require Enhanced Intelligence ${minInt} or higher — choose a Weapon or Hand-to-Hand option instead, or go BACK to Step 3.`);
      } else if (!(spellOption?.starting_options ?? []).includes(sc.attackSpellId)) {
        add("combatOption", "incomplete", "Choose one of the approved starting Attack Spells.");
      }
    } else {
      add(
        "combatOption",
        "incomplete",
        weaponAllowed
          ? "Choose your second combat option — a Weapon, Attack Spell, or Unarmed / Hand-to-Hand Skill."
          : "Choose your second combat option — an Attack Spell or Unarmed / Hand-to-Hand Skill."
      );
    }
    return issues;
  }

  if (stepKey === "story") {
    const story = draft.storyHooks ?? {};
    if (!(story.pastTrauma ?? "").trim()) {
      add("pastTrauma", "incomplete", "Describe one past trauma for your crawler.");
    }
    if (!(story.looseEnd ?? "").trim()) {
      add("looseEnd", "incomplete", "Describe one loose end for your crawler.");
    }
    if (!(story.regret ?? "").trim()) {
      add("regret", "incomplete", "Describe one regret for your crawler.");
    }
    return issues;
  }

  if (stepKey === "gear") {
    /* Step 7 is fully optional — every field may stay blank. Only an
       INVALID RELATIONSHIP is flagged: a secondary weapon without a chosen
       known weapon Skill is incomplete, and invalid data is never created
       silently. */
    const item = draft.startingGear?.usefulItem ?? {};
    if (item.secondaryWeapon && !item.rulesSkillKey) {
      add("gearSecondarySkill", "invalid", "Choose which known weapon Skill this item uses, or untick the secondary weapon box.");
    }
    return issues;
  }

  if (stepKey !== "identity") return issues;
  if (!draft.name.trim()) add("name", "incomplete", "Give your crawler a name before continuing.");
  const range = crawlerNumberRange(profile);
  const raw = draft.crawlerNumber;
  if (raw === "" || raw === null || raw === undefined) {
    if (range) add("crawlerNumber", "incomplete", "A crawler number is required — enter one or press Randomize.");
  } else {
    const num = Number(raw);
    if (!Number.isInteger(num) || (range && (num < range.min || num > range.max))) {
      add("crawlerNumber", "invalid", range
        ? `Crawler number must be between ${range.min.toLocaleString("en-US")} and ${range.max.toLocaleString("en-US")}.`
        : "Crawler number must be a whole number.");
    } else if (usedNumbers?.has(num)) {
      add("crawlerNumber", "invalid", "That crawler number is already in use. Choose another or Randomize.");
    }
  }
  return issues;
};

/* Step inline messages — the flat { fieldKey: message } shape the step
   bodies render, derived from the SAME tagged issues. */
export const validateStep = (stepKey, draft, profile, usedNumbers = null) => {
  const errors = {};
  for (const issue of stepIssues(stepKey, draft, profile, usedNumbers)) {
    errors[issue.key] = issue.message;
  }
  return errors;
};

/* Per-step STATUS for the Review hub — "complete" | "incomplete" |
   "invalid" (any invalid issue outweighs incomplete ones). */
export const stepStatus = (stepKey, draft, profile, usedNumbers = null) => {
  const issues = stepIssues(stepKey, draft, profile, usedNumbers);
  if (issues.length === 0) return { status: "complete", issues: [] };
  const invalid = issues.some((i) => i.kind === "invalid");
  return { status: invalid ? "invalid" : "incomplete", issues };
};

/* Full wizard review — every step with its live status and issues,
   recomputed from the CURRENT draft each call (never cached), so a fix
   applied anywhere updates the Review hub immediately. The Review step
   itself carries no issues — it is the hub, not a step to validate. */
export const wizardReview = (steps, draft, profile, usedNumbers = null) =>
  (steps ?? []).map((step, index) => ({
    step,
    index,
    ...stepStatus(step.key, draft, profile, usedNumbers),
  }));