import { refreshProgressionDerived } from "./classAdvancement";

const STAT_KEYS = ["str", "int", "con", "dex", "cha"];
const STAT_LABELS = {
  str: "Strength",
  int: "Intelligence",
  con: "Constitution",
  dex: "Dexterity",
  cha: "Charisma",
};

const clone = (value) => JSON.parse(JSON.stringify(value ?? {}));
const n = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const ensureRules = (sheet) => {
  sheet.rulesetData = sheet.rulesetData ?? {};
  sheet.rulesetData.stats = sheet.rulesetData.stats ?? {};
  sheet.rulesetData.skills = Array.isArray(sheet.rulesetData.skills) ? sheet.rulesetData.skills : [];
  sheet.rulesetData.identity = sheet.rulesetData.identity ?? {};
  sheet.rulesetData.advancement = sheet.rulesetData.advancement ?? {};
  sheet.rulesetData.advancement.progression = sheet.rulesetData.advancement.progression ?? {};
  return sheet.rulesetData;
};

const statMod = (profile, value) => {
  const v = Number(value);
  if (!Number.isFinite(v)) return null;
  for (const row of profile?.stats?.mod_rule?.table ?? []) {
    const lo = Number(row.min);
    const hi = row.max === null || row.max === undefined ? Infinity : Number(row.max);
    if (v >= lo && v <= hi) return Number(row.mod);
  }
  return null;
};

export const progressionState = (sheet) => {
  const p = sheet?.rulesetData?.advancement?.progression ?? {};
  return {
    statPointsEarned: n(p.statPointsEarned),
    statPointsSpent: n(p.statPointsSpent),
    statPointsAvailable: n(p.statPointsAvailable),
    statsInitializedAtThirdFloor: !!p.statsInitializedAtThirdFloor,
    lastLevelProcessed: n(p.lastLevelProcessed, n(sheet?.info?.level, 1)),
  };
};

export function initializeThirdFloorStatPool(sourceSheet) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const p = rules.advancement.progression;
  if (p.statsInitializedAtThirdFloor) return sheet;

  const existingThird = rules.advancement?.thirdFloor ?? {};
  const alreadyAdvanced = !!(existingThird.raceId || existingThird.classId);
  const level = Math.max(1, n(sheet?.info?.level, 1));
  const tutorialPool = alreadyAdvanced ? 0 : Math.max(0, (level - 1) * 3);

  p.statPointsEarned = n(p.statPointsEarned) + tutorialPool;
  p.statPointsAvailable = n(p.statPointsAvailable) + tutorialPool;
  p.statPointsSpent = n(p.statPointsSpent);
  p.statsInitializedAtThirdFloor = true;
  p.lastLevelProcessed = level;
  p.initialThirdFloorPool = tutorialPool;
  return sheet;
}

export function levelUpCharacter(sourceSheet) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const current = Math.max(1, n(sheet?.info?.level, 1));
  if (current >= 250) return { sheet, gained: 0, statPointsGained: 0, capped: true };

  const next = current + 1;
  sheet.info = { ...(sheet.info ?? {}), level: next };

  let statPointsGained = 0;
  const floor = Math.max(1, n(sheet?.info?.floor, 1));
  if (floor >= 3) {
    const p = rules.advancement.progression;
    if (!p.statsInitializedAtThirdFloor) {
      // Migration-safe bootstrap: characters that already selected Race/Class
      // are not retroactively credited a second pool.
      const initialized = initializeThirdFloorStatPool(sheet);
      Object.assign(sheet, initialized);
    }
    const liveRules = ensureRules(sheet);
    const live = liveRules.advancement.progression;
    live.statPointsEarned = n(live.statPointsEarned) + 3;
    live.statPointsAvailable = n(live.statPointsAvailable) + 3;
    live.lastLevelProcessed = next;
    statPointsGained = 3;
  } else {
    rules.advancement.progression.lastLevelProcessed = next;
  }

  return { sheet, gained: 1, statPointsGained, capped: false };
}

export function allocateStatPoints(profile, sourceSheet, allocation) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const p = rules.advancement.progression;
  const available = n(p.statPointsAvailable);
  const clean = Object.fromEntries(
    STAT_KEYS.map((key) => [key, Math.max(0, Math.floor(n(allocation?.[key])))])
  );
  const spent = Object.values(clean).reduce((a, b) => a + b, 0);

  if (spent <= 0) return { ok: false, reason: "Choose at least one Stat point.", sheet };
  if (spent > available) return { ok: false, reason: "You allocated more Stat points than are available.", sheet };

  const caps = rules.statCaps ?? {};
  for (const key of STAT_KEYS) {
    const add = clean[key];
    if (!add) continue;
    const cap = Number(caps[key]);
    if (Number.isFinite(cap) && n(sheet.attrs?.[key]) + add > cap) {
      return { ok: false, reason: `${STAT_LABELS[key]} is capped at ${cap}.`, sheet };
    }
  }

  const oldMaxHp = sheet.maxHp;
  const oldMaxMana = sheet.maxMana;
  for (const key of STAT_KEYS) {
    const add = clean[key];
    if (!add) continue;
    const before = n(sheet.attrs?.[key]);
    const next = before + add;
    sheet.attrs = { ...(sheet.attrs ?? {}), [key]: next };
    const prior = rules.stats[key] ?? {};
    const priorEnhanced =
      prior.enhanced === null || prior.enhanced === undefined ? before : n(prior.enhanced, before);
    const priorUnenhanced =
      prior.unenhanced === null || prior.unenhanced === undefined ? before : n(prior.unenhanced, before);
    rules.stats[key] = {
      ...prior,
      enhanced: priorEnhanced + add,
      unenhanced: priorUnenhanced + add,
      mod: statMod(profile, next),
    };
  }

  p.statPointsSpent = n(p.statPointsSpent) + spent;
  p.statPointsAvailable = Math.max(0, available - spent);
  p.lastAllocation = clean;
  refreshProgressionDerived(sheet, profile, oldMaxHp, oldMaxMana);
  return { ok: true, spent, sheet };
}

const skillRow = (sheet, id) =>
  (sheet?.rulesetData?.skills ?? []).find((row) => row?.id === id) ?? null;

const skillRank = (sheet, id) => n(skillRow(sheet, id)?.rank);

const catalogSkillId = (profile, text) => {
  const target = norm(text.replace(/\bskill\b/gi, ""));
  const defs = Object.values(profile?.skills?.catalog ?? {});
  let best = null;
  for (const def of defs) {
    const names = [def.id, def.name, def.display_name, ...(def.aliases ?? [])].filter(Boolean);
    for (const name of names) {
      const candidate = norm(name);
      if (!candidate) continue;
      if (target === candidate || target.includes(candidate) || candidate.includes(target)) {
        if (!best || candidate.length > best.len) best = { id: def.id, len: candidate.length };
      }
    }
  }
  return best?.id ?? null;
};

const anySkillByStatAtLeast = (sheet, profile, stats, rank) => {
  const catalog = profile?.skills?.catalog ?? {};
  return (sheet?.rulesetData?.skills ?? []).some((row) => {
    const def = catalog[row.id] ?? {};
    return stats.includes(String(def.stat ?? row.stat ?? "").toLowerCase()) && n(row.rank) >= rank;
  });
};

const groupIds = (profile, group) => {
  const catalog = profile?.skills?.catalog ?? {};
  if (group === "edged") {
    return ["axe", "dagger", "longsword", "rapier"].filter((id) => catalog[id]);
  }
  if (group === "trap") {
    return Object.values(catalog)
      .filter((def) => /trap/.test(norm(def.id + " " + def.name + " " + (def.display_name ?? ""))))
      .map((def) => def.id);
  }
  return [];
};

const achievementNames = (sheet) => {
  const source = sheet?.rulesetData?.achievements ?? [];
  return new Set(
    (Array.isArray(source) ? source : [])
      .map((v) => norm(typeof v === "string" ? v : v?.name ?? v?.id ?? ""))
      .filter(Boolean)
  );
};

const hasAchievement = (sheet, name) => {
  const wanted = norm(name.replace(/\bachievement\b/gi, ""));
  const known = achievementNames(sheet);
  for (const value of known) if (value === wanted || value.includes(wanted) || wanted.includes(value)) return true;
  return false;
};

const identityText = (sheet, key) => {
  const value = sheet?.rulesetData?.identity?.[key];
  if (value && typeof value === "object") return norm(value.label ?? value.name ?? value.value ?? "");
  return norm(value);
};

const currentRaceText = (sheet) =>
  norm(
    [
      sheet?.info?.race,
      sheet?.rulesetData?.identity?.currentRace,
      sheet?.rulesetData?.identity?.startingSpecies?.species,
      sheet?.rulesetData?.identity?.startingSpecies?.label,
    ]
      .filter(Boolean)
      .join(" ")
  );

const hasClub = (sheet, clubName) => {
  const clubs = sheet?.rulesetData?.clubs ?? sheet?.rulesetData?.identity?.clubs ?? [];
  const wanted = norm(clubName);
  return (Array.isArray(clubs) ? clubs : []).some((v) => norm(typeof v === "string" ? v : v?.name ?? v?.id) === wanted);
};

const hasDeity = (sheet) =>
  !!norm(
    sheet?.rulesetData?.identity?.deity ??
      sheet?.rulesetData?.deity ??
      sheet?.rulesetData?.worship?.deity ??
      ""
  );

function prerequisiteResult(prereq, sheet, profile) {
  const raw = String(prereq ?? "").trim();
  const lower = norm(raw);

  let m = raw.match(/^Popularity\s+(\d+)\+$/i);
  if (m) {
    const have = n(sheet?.rulesetData?.identity?.popularity);
    const need = Number(m[1]);
    return { ok: have >= need, reason: `Popularity ${need}+ required (you have ${have}).` };
  }

  if (/achievement$/i.test(raw)) {
    const ok = hasAchievement(sheet, raw);
    return { ok, reason: `${raw} required.` };
  }

  if (/^Female crawler$/i.test(raw)) {
    const gender = identityText(sheet, "gender");
    const ok = /female|woman|girl/.test(gender);
    return { ok, reason: "Female crawler required." };
  }

  if (/Crawler is already a Cat/i.test(raw)) {
    const starting = norm(
      [
        sheet?.rulesetData?.identity?.startingSpecies?.species,
        sheet?.rulesetData?.identity?.startingSpecies?.label,
        sheet?.info?.race,
      ]
        .filter(Boolean)
        .join(" ")
    );
    const ok = /\bcat\b/.test(starting);
    return { ok, reason: "Crawler must already be a Cat." };
  }

  if (/Cat-based Race/i.test(raw)) {
    const race = currentRaceText(sheet);
    const ok = /\bcat\b|cat girl|cat boy|tigran/.test(race);
    return { ok, reason: "A Cat-based Race is required." };
  }

  m = raw.match(/^Strength- or Dexterity-based Skill Rank\s+(\d+)\+$/i);
  if (m) {
    const need = Number(m[1]);
    const ok = anySkillByStatAtLeast(sheet, profile, ["str", "dex"], need);
    return { ok, reason: `A Strength- or Dexterity-based Skill at Rank ${need}+ is required.` };
  }

  m = raw.match(/^Any Edged Weapon Skill Rank\s+(\d+)\+$/i);
  if (m) {
    const need = Number(m[1]);
    const ok = groupIds(profile, "edged").some((id) => skillRank(sheet, id) >= need);
    return { ok, reason: `An Edged Weapon Skill at Rank ${need}+ is required.` };
  }

  m = raw.match(/^Any Trap-based Skill Rank\s+(\d+)\+$/i);
  if (m) {
    const need = Number(m[1]);
    const ok = groupIds(profile, "trap").some((id) => skillRank(sheet, id) >= need);
    return { ok, reason: `A Trap-based Skill at Rank ${need}+ is required.` };
  }

  m = raw.match(/^Jumping or Light on Your Feet Skill Rank\s+(\d+)\+$/i);
  if (m) {
    const need = Number(m[1]);
    const ids = ["jumping", "light_on_your_feet"].filter((id) => profile?.skills?.catalog?.[id]);
    const ok = ids.some((id) => skillRank(sheet, id) >= need);
    return { ok, reason: `Jumping or Light on Your Feet Rank ${need}+ is required.` };
  }

  m = raw.match(/^(.+?) Skill Rank\s+(\d+)\+$/i);
  if (m) {
    const id = catalogSkillId(profile, m[1]);
    const need = Number(m[2]);
    const have = id ? skillRank(sheet, id) : 0;
    return { ok: !!id && have >= need, reason: `${m[1]} Skill Rank ${need}+ required (you have ${have}).` };
  }

  m = raw.match(/^(Strength|Intelligence|Constitution|Dexterity|Charisma)\s+(\d+)\+$/i);
  if (m) {
    const key = Object.entries(STAT_LABELS).find(([, label]) => label.toLowerCase() === m[1].toLowerCase())?.[0];
    const need = Number(m[2]);
    const have = n(sheet?.attrs?.[key]);
    return { ok: have >= need, reason: `${m[1]} ${need}+ required (you have ${have}).` };
  }

  return { ok: false, reason: `GM verification required: ${raw}` };
}

export function optionEligibility(entry, sheet, profile, kind) {
  const reasons = [];
  if (!entry) return { eligible: false, reasons: ["Missing option data."] };

  if (kind === "class" && entry.earth_class === true) {
    const raceEarthBased = sheet?.rulesetData?.advancement?.thirdFloor?.raceEarthBased === true;
    if (!raceEarthBased) reasons.push("Requires an Earth-compatible Race.");
  }

  for (const prereq of entry.prerequisites ?? []) {
    const result = prerequisiteResult(prereq, sheet, profile);
    if (!result.ok) reasons.push(result.reason);
  }

  const restrictionText = [
    ...(entry.restrictions ?? []),
    ...(entry.weapon_restrictions ?? []),
    ...(entry.benefits ?? []),
  ].map(String);

  for (const text of restrictionText) {
    const mustWorship = /must worship a deity/i.test(text);
    if (mustWorship && !hasDeity(sheet)) reasons.push("Must worship a deity.");

    const cannotWorship = /cannot worship a deity/i.test(text);
    if (cannotWorship && hasDeity(sheet)) reasons.push("Unavailable while worshipping a deity.");

    const cannotVanquisher = /cannot choose if you have access to Club Vanquisher/i.test(text);
    if (cannotVanquisher && hasClub(sheet, "Club Vanquisher")) reasons.push("Unavailable with Club Vanquisher access.");

    const cannotDesperado = /cannot choose if you have access to Desperado Club/i.test(text);
    if (cannotDesperado && hasClub(sheet, "Desperado Club")) reasons.push("Unavailable with Desperado Club access.");
  }

  return { eligible: reasons.length === 0, reasons };
}

export function eligibleCatalog(catalog, sheet, profile, kind) {
  return Object.fromEntries(
    Object.entries(catalog ?? {}).filter(([, entry]) => optionEligibility(entry, sheet, profile, kind).eligible)
  );
}

export function floorSkillAdvancement(profile, sourceSheet, random = Math.random) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const caps = rules.skillRankCaps ?? {};
  const rolls = [];

  rules.skills = rules.skills.map((row) => {
    const rank = n(row?.rank);
    if (!row?.advancement_mark || rank < 5) return row;
    const die = 1 + Math.floor(random() * 20);
    const cap = Math.max(15, n(caps[row.id], n(caps["*"], 15)));
    const success = die >= rank && rank < cap;
    const nextRank = success ? rank + 1 : rank;
    rolls.push({ id: row.id, name: row.name, rank, die, success, nextRank, cap });
    return { ...row, rank: nextRank, advancement_mark: false };
  });

  return { sheet, rolls };
}

export function descendFloor(profile, sourceSheet, random = Math.random) {
  const resolved = floorSkillAdvancement(profile, sourceSheet, random);
  let sheet = resolved.sheet;
  const currentFloor = Math.max(1, n(sheet?.info?.floor, 1));
  const nextFloor = currentFloor + 1;
  sheet.info = { ...(sheet.info ?? {}), floor: nextFloor };

  if (nextFloor === 3) sheet = initializeThirdFloorStatPool(sheet);

  const rules = ensureRules(sheet);
  rules.advancement.progression.lastFloorTransition = {
    from: currentFloor,
    to: nextFloor,
    skillAdvancement: resolved.rolls,
  };
  return { sheet, from: currentFloor, to: nextFloor, rolls: resolved.rolls };
}
