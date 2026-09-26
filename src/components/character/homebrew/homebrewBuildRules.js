export const STAT_KEYS = ["str", "int", "con", "dex", "cha"];
export const STAT_LABELS = {
  str: "Strength",
  int: "Intelligence",
  con: "Constitution",
  dex: "Dexterity",
  cha: "Charisma",
};

export const BASE_BUILD_POINTS = { race: 25, class: 30 };
export const MAX_DETRIMENT_CREDIT = 5;

export const BUILD_FOCUSES = [
  { id: "tough", name: "Tough Survivor", note: "Constitution, Endurance, and staying power." },
  { id: "sneaky", name: "Sneaky Operator", note: "Dexterity, Stealth, and getting out clean." },
  { id: "brainy", name: "Brainy Specialist", note: "Intelligence, Investigation, and Tactics." },
  { id: "mobile", name: "Mobile Skirmisher", note: "Dexterity, Dodge, Escape Artist, and movement." },
  { id: "face", name: "Face", note: "Charisma, Persuasion, Negotiation, and social leverage." },
  { id: "custom", name: "Start Blank", note: "Choose every mechanic yourself." },
];

export const SPECIAL_BENEFITS = [
  { id: "darkvision", label: "See in total darkness", cost: 1, kinds: ["race", "class"] },
  { id: "water_breathing", label: "Breathe underwater", cost: 2, kinds: ["race", "class"] },
  { id: "burrow", label: "Burrow", cost: 2, kinds: ["race", "class"] },
  { id: "move_5", label: "+5 ft Move", cost: 3, kinds: ["race", "class"] },
  { id: "limited_flight", label: "Limited flight", cost: 3, kinds: ["race", "class"] },
  { id: "poison_immunity", label: "Immunity to Poison", cost: 4, kinds: ["race", "class"] },
  { id: "full_flight", label: "Flight with no limitations", cost: 6, kinds: ["race", "class"] },
];

export const FIXED_DETRIMENTS = [
  { id: "social_disadvantage", label: "Disadvantage in all social situations", credit: 2, kinds: ["race", "class"] },
  { id: "limited_weapons", label: "Limited choice of weapons", credit: 2, kinds: ["class"] },
  { id: "no_passive_spells", label: "Cannot cast Passive Spells", credit: 2, kinds: ["class"] },
  { id: "must_worship", label: "Must worship a deity", credit: 1, kinds: ["class"] },
  { id: "cannot_worship", label: "Cannot worship a deity", credit: 1, kinds: ["class"] },
];

export const COMMON_DAMAGE = ["Fire", "Bludgeoning", "Piercing", "Slashing"];
export const UNCOMMON_DAMAGE = ["Force", "Psychic", "Necrotic"];

const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const slug = (v) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "homebrew";

export function blankBuild(kind = "race") {
  return {
    kind,
    name: "",
    description: "",
    earth: true,
    classType: "Rogue",
    size: "Medium",
    statBonuses: Object.fromEntries(STAT_KEYS.map((k) => [k, 0])),
    statPenalties: Object.fromEntries(STAT_KEYS.map((k) => [k, 0])),
    skillBonuses: {},
    rank20: [],
    advantageSkills: [],
    advantageStats: [],
    specials: [],
    drBonus: 0,
    commonResistance: "",
    uncommonResistance: "",
    commonVulnerability: "",
    uncommonVulnerability: "",
    statCap10: "",
    detriments: [],
  };
}

export function focusBuild(kind, focusId) {
  const b = blankBuild(kind);
  const setSkill = (id, rank) => { b.skillBonuses[id] = rank; };
  if (focusId === "tough") {
    b.statBonuses.con = 4;
    b.statBonuses.dex = 2;
    setSkill("endurance", 2);
    setSkill("dodge", 1);
  } else if (focusId === "sneaky") {
    b.statBonuses.dex = 4;
    b.statBonuses.int = 2;
    setSkill("stealth", 2);
    setSkill("escape_artist", 1);
  } else if (focusId === "brainy") {
    b.statBonuses.int = 4;
    b.statBonuses.con = 2;
    setSkill("investigation", 2);
    setSkill("tactics", 2);
  } else if (focusId === "mobile") {
    b.statBonuses.dex = 4;
    b.statBonuses.con = 2;
    setSkill("dodge", 2);
    setSkill("escape_artist", 2);
  } else if (focusId === "face") {
    b.statBonuses.cha = 4;
    b.statBonuses.int = 2;
    setSkill("persuasion", 2);
    setSkill("negotiation", 2);
  }
  return b;
}

export function buildMath(build) {
  const kind = build?.kind === "class" ? "class" : "race";
  const base = BASE_BUILD_POINTS[kind];

  const statCost = STAT_KEYS.reduce((sum, key) => sum + Math.max(0, n(build?.statBonuses?.[key])), 0);
  const skillCost = Object.values(build?.skillBonuses ?? {}).reduce((sum, rank) => sum + Math.max(0, n(rank)) * 2, 0);
  const rank20Cost = [...new Set(build?.rank20 ?? [])].length;
  const advantageSkillCost = [...new Set(build?.advantageSkills ?? [])].length * 3;
  const advantageStatCost = [...new Set(build?.advantageStats ?? [])].length * 6;
  const specialCost = (build?.specials ?? []).reduce((sum, id) => {
    const row = SPECIAL_BENEFITS.find((x) => x.id === id && x.kinds.includes(kind));
    return sum + (row?.cost ?? 0);
  }, 0);
  const drCost = Math.max(0, Math.min(3, n(build?.drBonus))) * 2;
  const commonResistanceCost = build?.commonResistance ? 4 : 0;
  const uncommonResistanceCost = build?.uncommonResistance ? 2 : 0;

  const benefitsSpent =
    statCost +
    skillCost +
    rank20Cost +
    advantageSkillCost +
    advantageStatCost +
    specialCost +
    drCost +
    commonResistanceCost +
    uncommonResistanceCost;

  const statPenaltyTotal = STAT_KEYS.reduce((sum, key) => sum + Math.abs(Math.min(0, n(build?.statPenalties?.[key]))), 0);
  const statPenaltyCredit = Math.floor(statPenaltyTotal / 2);
  const fixedCredit = (build?.detriments ?? []).reduce((sum, id) => {
    const row = FIXED_DETRIMENTS.find((x) => x.id === id && x.kinds.includes(kind));
    return sum + (row?.credit ?? 0);
  }, 0);
  const vulnerabilityCredit = (build?.commonVulnerability ? 3 : 0) + (build?.uncommonVulnerability ? 1 : 0);
  const statCapCredit = build?.statCap10 ? 3 : 0;
  const rawDetrimentCredit = statPenaltyCredit + fixedCredit + vulnerabilityCredit + statCapCredit;
  const detrimentCredit = Math.min(MAX_DETRIMENT_CREDIT, rawDetrimentCredit);
  const available = base + detrimentCredit;
  const remaining = available - benefitsSpent;

  return {
    base,
    statCost,
    skillCost,
    benefitsSpent,
    statPenaltyCredit,
    fixedCredit,
    rawDetrimentCredit,
    detrimentCredit,
    available,
    remaining,
    legal: benefitsSpent > 0 && benefitsSpent <= available && rawDetrimentCredit <= MAX_DETRIMENT_CREDIT,
  };
}

export function validateBuild(build) {
  const math = buildMath(build);
  const errors = [];
  if (!String(build?.name ?? "").trim()) errors.push("Give the Race or Class a name.");
  if (math.benefitsSpent <= 0) errors.push("Choose at least one mechanical benefit.");
  if (math.benefitsSpent > math.available) errors.push(`This build is ${math.benefitsSpent - math.available} BP over budget.`);
  if (math.rawDetrimentCredit > MAX_DETRIMENT_CREDIT) errors.push("Detriments can grant at most 5 extra Build Points.");
  if (n(build?.drBonus) > 3) errors.push("DR Buff from this build is limited to +3.");
  if (build?.detriments?.includes("must_worship") && build?.detriments?.includes("cannot_worship")) {
    errors.push("A Class cannot both require and forbid deity worship.");
  }
  return { legal: errors.length === 0, errors, math };
}

const mechanicsDescription = (build) => {
  const bits = [];
  for (const key of STAT_KEYS) if (n(build?.statBonuses?.[key]) > 0) bits.push(`+${n(build.statBonuses[key])} ${STAT_LABELS[key]}`);
  for (const [id, rank] of Object.entries(build?.skillBonuses ?? {})) if (n(rank) > 0) bits.push(`+${n(rank)} ${id.replace(/_/g, " ")}`);
  return bits.slice(0, 5).join(", ");
};

export function buildEntry(build, skillCatalog = {}) {
  const check = validateBuild(build);
  if (!check.legal) return { ok: false, errors: check.errors, math: check.math };

  const kind = build.kind === "class" ? "class" : "race";
  const id = `user_${kind}_${slug(build.name)}_${Date.now().toString(36)}`;
  const statBonuses = Object.fromEntries(
    STAT_KEYS.filter((key) => n(build.statBonuses?.[key]) > 0).map((key) => [key, n(build.statBonuses[key])])
  );
  const statPenalties = Object.fromEntries(
    STAT_KEYS.filter((key) => n(build.statPenalties?.[key]) < 0).map((key) => [key, n(build.statPenalties[key])])
  );
  const skillRankBonuses = Object.fromEntries(
    Object.entries(build.skillBonuses ?? {}).filter(([, rank]) => n(rank) > 0).map(([id2, rank]) => [id2, n(rank)])
  );
  const skillRankCaps = Object.fromEntries([...new Set(build.rank20 ?? [])].map((id2) => [id2, 20]));
  const effects = [];
  const restrictions = [];
  const senses = [];
  let movement_bonus_ft = 0;

  if (build.specials?.includes("darkvision")) senses.push("Can see in total darkness");
  if (build.specials?.includes("water_breathing")) effects.push({ id: "water_breathing", text: "Can breathe underwater." });
  if (build.specials?.includes("burrow")) effects.push({ id: "burrow", text: "Can burrow." });
  if (build.specials?.includes("move_5")) movement_bonus_ft += 5;
  if (build.specials?.includes("limited_flight")) effects.push({ id: "limited_flight", text: "Can fly with limitations set by the GM." });
  if (build.specials?.includes("full_flight")) effects.push({ id: "full_flight", text: "Can fly with no limitations." });

  for (const id2 of build.detriments ?? []) {
    const row = FIXED_DETRIMENTS.find((x) => x.id === id2);
    if (row) restrictions.push(row.label);
  }

  const commonV = build.commonVulnerability ? [build.commonVulnerability] : [];
  const uncommonV = build.uncommonVulnerability ? [build.uncommonVulnerability] : [];
  const statCaps = build.statCap10 ? { [build.statCap10]: 10 } : {};
  const immunities = build.specials?.includes("poison_immunity") ? ["Poison"] : [];
  const resistances = [build.commonResistance, build.uncommonResistance].filter(Boolean);

  const common = {
    id,
    name: String(build.name).trim(),
    source_stage: "third_floor",
    source: "user_created",
    user_created: true,
    description:
      String(build.description ?? "").trim() ||
      `A custom ${kind} built in Ginger Dragon. ${mechanicsDescription(build)}.`,
    stat_bonuses: statBonuses,
    stat_penalties: statPenalties,
    skill_rank_bonuses: skillRankBonuses,
    skill_rank_caps: skillRankCaps,
    skill_check_advantage: [...new Set(build.advantageSkills ?? [])],
    stat_skill_advantage: [...new Set(build.advantageStats ?? [])],
    senses,
    movement_bonus_ft: movement_bonus_ft || undefined,
    damage_resistance_bonus: n(build.drBonus) || undefined,
    resistances,
    immunities,
    vulnerabilities: [...commonV, ...uncommonV],
    stat_caps: statCaps,
    effects,
    restrictions,
    build_points: {
      base: check.math.base,
      benefits_spent: check.math.benefitsSpent,
      detriment_credit: check.math.detrimentCredit,
      available: check.math.available,
      remaining: check.math.remaining,
    },
    build_breakdown: {
      stat_bonuses: statBonuses,
      skill_bonuses: Object.fromEntries(
        Object.entries(skillRankBonuses).map(([id2, rank]) => [skillCatalog[id2]?.name ?? id2, rank])
      ),
    },
  };

  if (kind === "race") {
    return {
      ok: true,
      entry: {
        ...common,
        race_type: build.earth ? "Earth Race" : "Alien Race",
        earth_race: !!build.earth,
        alien_race: !build.earth,
        class_access: build.earth ? ["Earth-based", "Classic"] : ["Alien-compatible", "Classic"],
        size: build.size === "Small" ? { label: "Small", value: 2 } : { label: "Medium", value: 4 },
        rewards: build.earth
          ? [{ id: "silver_earth_box", text: "Gain a Silver Earth Box with a guaranteed Earth Hobby Potion." }]
          : [],
      },
      math: check.math,
    };
  }

  return {
    ok: true,
    entry: {
      ...common,
      class_type: build.earth ? "Earth Class" : `${build.classType || "Custom"} Class`,
      class_types: [build.classType || "Custom"],
      earth_class: !!build.earth,
      rewards: build.earth
        ? [{ id: "silver_earth_box", text: "Gain a Silver Earth Box with a guaranteed Earth Hobby Potion." }]
        : [],
    },
    math: check.math,
  };
}
