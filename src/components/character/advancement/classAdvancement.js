/* Third-Floor class advancement.
   Applies class data to the ONE canonical sheet record. Permanent Third-Floor
   class changes are idempotent; Former Child Actor's Character Actor grants
   are a temporary floor layer that is expired before the next floor's layer. */

const STAT_LABELS = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  cha: "Charisma",
};

const HAND_TO_HAND_IDS = [
  "unarmed_combat",
  "pugilism",
  "foot_soldier",
  "noggin_nocker",
  "wrasslin",
  "iron_punch",
  "powerful_strike",
  "smush",
  "skullcracker",
  "toss",
];

const clone = (value) => JSON.parse(JSON.stringify(value ?? {}));
const cap = (s) => String(s ?? "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
const n = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

const ensureRules = (sheet) => {
  sheet.rulesetData = sheet.rulesetData ?? {};
  sheet.rulesetData.stats = sheet.rulesetData.stats ?? {};
  sheet.rulesetData.skills = Array.isArray(sheet.rulesetData.skills) ? sheet.rulesetData.skills : [];
  sheet.rulesetData.advancement = sheet.rulesetData.advancement ?? {};
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

const refreshSkillMods = (sheet, profile) => {
  const rules = ensureRules(sheet);
  const catalog = profile?.skills?.catalog ?? {};
  rules.skills = rules.skills.map((row) => {
    const def = catalog[row.id] ?? {};
    const stat = String(def.stat ?? row.stat ?? "").toLowerCase();
    const mod = stat && sheet.attrs?.[stat] !== undefined ? statMod(profile, sheet.attrs[stat]) : row.mod ?? null;
    return { ...row, stat: stat ? stat.toUpperCase() : row.stat ?? "", mod };
  });
};

const refreshVitals = (sheet, profile, oldMaxHp = sheet.maxHp, oldMaxMana = sheet.maxMana) => {
  const conMod = statMod(profile, sheet.attrs?.con);
  if (typeof conMod === "number") {
    const nextMax = Math.max(0, conMod * 10);
    const delta = nextMax - n(oldMaxHp);
    sheet.maxHp = nextMax;
    sheet.hp = Math.max(0, Math.min(nextMax, n(sheet.hp) + delta));
    ensureRules(sheet).identity = {
      ...(ensureRules(sheet).identity ?? {}),
      healthBarSlotValue: nextMax / 10,
    };
  }
  if (Number.isFinite(Number(sheet.attrs?.int))) {
    const nextMax = Math.max(0, Number(sheet.attrs.int));
    const delta = nextMax - n(oldMaxMana);
    sheet.maxMana = nextMax;
    sheet.mana = Math.max(0, Math.min(nextMax, n(sheet.mana) + delta));
  }
};

const adjustStat = (sheet, profile, key, delta, log) => {
  if (!STAT_LABELS[key] || !Number.isFinite(Number(delta)) || Number(delta) === 0) return;
  const rules = ensureRules(sheet);
  const d = Number(delta);
  sheet.attrs = { ...(sheet.attrs ?? {}), [key]: n(sheet.attrs?.[key]) + d };
  const prior = rules.stats[key] ?? {};
  rules.stats[key] = {
    ...prior,
    enhanced: n(prior.enhanced, n(sheet.attrs[key]) - d) + d,
    unenhanced:
      prior.unenhanced === null || prior.unenhanced === undefined
        ? prior.unenhanced ?? null
        : n(prior.unenhanced) + d,
    mod: statMod(profile, sheet.attrs[key]),
  };
  if (log) log.stats[key] = (log.stats[key] ?? 0) + d;
};

const attackRowForSkill = (sheet, profile, id, rank, className) => {
  const def = profile?.skills?.catalog?.[id];
  if (!def || !["attack", "weapon"].includes(def.category)) return null;
  const name = def.display_name ?? def.name ?? cap(id);
  const atkStat = String(def.attack_stat ?? def.stat ?? "").toLowerCase();
  const mod = atkStat ? statMod(profile, sheet.attrs?.[atkStat]) : null;
  const bonus = typeof mod === "number" ? `${rank + mod >= 0 ? "+" : ""}${rank + mod}` : "";
  const dmg = def.damage
    ? `${def.damage.dice ?? ""}${def.damage.plus_mod_stat ? ` + ${String(def.damage.plus_mod_stat).toUpperCase()} Mod` : ""}`
    : "";
  return {
    name,
    bonus,
    damage: dmg,
    type: def.damage_type ?? "",
    notes: `Rank ${rank} · Class: ${className}`,
  };
};

const ensureSpellRow = (sheet, def, rank, className, log) => {
  if (!def || def.category !== "spell") return;
  const name = def.display_name ?? def.name;
  sheet.spells = Array.isArray(sheet.spells) ? sheet.spells : [];
  const idx = sheet.spells.findIndex((r) => String(r?.name ?? "").toLowerCase() === String(name).toLowerCase());
  const note = `Rank ${rank} · Class: ${className}`;
  if (idx >= 0) {
    if (log && !(name in log.spellRowsBefore)) log.spellRowsBefore[name] = { ...sheet.spells[idx] };
    sheet.spells[idx] = { ...sheet.spells[idx], notes: [sheet.spells[idx].notes, note].filter(Boolean).join(" · ") };
  } else {
    const blank = sheet.spells.findIndex((r) => !String(r?.name ?? "").trim());
    const row = { name, cost: "", type: "", notes: note };
    if (blank >= 0) sheet.spells[blank] = row;
    else sheet.spells.push(row);
    if (log) log.spellRowsAdded.push(name);
  }
};

const ensureAttackRow = (sheet, profile, id, rank, className, log) => {
  const row = attackRowForSkill(sheet, profile, id, rank, className);
  if (!row) return;
  sheet.attacks = Array.isArray(sheet.attacks) ? sheet.attacks : [];
  const idx = sheet.attacks.findIndex((r) => String(r?.name ?? "").toLowerCase() === String(row.name).toLowerCase());
  if (idx >= 0) {
    if (log && !(row.name in log.attackRowsBefore)) log.attackRowsBefore[row.name] = { ...sheet.attacks[idx] };
    sheet.attacks[idx] = { ...sheet.attacks[idx], ...row };
  } else {
    const blank = sheet.attacks.findIndex((r) => !String(r?.name ?? "").trim());
    if (blank >= 0) sheet.attacks[blank] = row;
    else sheet.attacks.push(row);
    if (log) log.attackRowsAdded.push(row.name);
  }
};

const adjustSkill = (sheet, profile, id, delta, className, log, forcedRank = null) => {
  const rules = ensureRules(sheet);
  const catalog = profile?.skills?.catalog ?? {};
  const def = catalog[id] ?? { id, name: cap(id), stat: null, category: "general", description: "" };
  let idx = rules.skills.findIndex((s) => s.id === id);
  const before = idx >= 0 ? n(rules.skills[idx].rank) : 0;
  const added = idx < 0;
  const nextRank =
    forcedRank === null || forcedRank === undefined
      ? Math.max(0, before + n(delta))
      : Math.max(0, Number(forcedRank));
  const stat = String(def.stat ?? "").toLowerCase();
  const row = {
    ...(idx >= 0 ? rules.skills[idx] : {}),
    id,
    name: def.name ?? cap(id),
    rank: nextRank,
    stat: stat ? stat.toUpperCase() : "",
    mod: stat ? statMod(profile, sheet.attrs?.[stat]) : null,
    check: idx >= 0 ? rules.skills[idx].check ?? "" : "",
    description: def.description ?? "",
    ai_favor: def.ai_favor ?? (idx >= 0 ? rules.skills[idx].ai_favor ?? null : null),
  };
  if (idx >= 0) rules.skills[idx] = row;
  else rules.skills.push(row);

  if (log) {
    const actualDelta = nextRank - before;
    const prior = log.skills[id] ?? { before, delta: 0, added };
    log.skills[id] = { before: prior.before, delta: prior.delta + actualDelta, added: prior.added && added };
  }

  ensureSpellRow(sheet, def, nextRank, className, log);
  ensureAttackRow(sheet, profile, id, nextRank, className, log);
};

const expandSkillKey = (key) => (key === "all_hand_to_hand" ? HAND_TO_HAND_IDS : [key]);

const skillsForGroup = (profile, group) => {
  const catalog = profile?.skills?.catalog ?? {};
  if (group === "charisma_based") {
    return Object.values(catalog).filter((s) => s.stat === "cha").map((s) => s.id);
  }
  if (group === "edged_weapons") {
    return ["axe", "dagger", "longsword", "rapier"].filter((id) => catalog[id]);
  }
  if (group === "trap_and_explosive") {
    return ["explosives_handling", "goblin_explosives", "improvised_explosive_device"]
      .filter((id) => catalog[id]);
  }
  if (group === "crafting") {
    return ["engineering", "fabricate", "repair", "salvage"].filter((id) => catalog[id]);
  }
  return [];
};

const applyGroupSkillBonus = (sheet, profile, group, bonus, sourceName, log) => {
  const rules = ensureRules(sheet);
  rules.groupSkillRankBonuses = { ...(rules.groupSkillRankBonuses ?? {}) };
  rules.groupSkillRankBonuses[group] = n(rules.groupSkillRankBonuses[group]) + n(bonus);
  for (const id of skillsForGroup(profile, group)) {
    adjustSkill(sheet, profile, id, bonus, sourceName, log);
  }
};

const applyGroupSkillCap = (sheet, profile, group, value, log) => {
  const rules = ensureRules(sheet);
  rules.groupSkillRankCaps = { ...(rules.groupSkillRankCaps ?? {}) };
  rules.groupSkillRankCaps[group] = value;
  for (const id of skillsForGroup(profile, group)) setSkillCap(sheet, id, value, log);
};

const addDefenseTag = (sheet, tag, log) => {
  if (!tag) return;
  const pieces = String(sheet.defense?.resist ?? "")
    .split(" • ")
    .map((v) => v.trim())
    .filter(Boolean);
  if (!pieces.includes(tag)) pieces.push(tag);
  sheet.defense = { ...(sheet.defense ?? {}), resist: pieces.join(" • ") };
  if (log && !log.defenseTags.includes(tag)) log.defenseTags.push(tag);
};

const setSkillCap = (sheet, id, value, log) => {
  const rules = ensureRules(sheet);
  rules.skillRankCaps = { ...(rules.skillRankCaps ?? {}) };
  if (log && !(id in log.skillCapsBefore)) log.skillCapsBefore[id] = rules.skillRankCaps[id];
  rules.skillRankCaps[id] = value;
};

const setStatCap = (sheet, id, value, log) => {
  const rules = ensureRules(sheet);
  rules.statCaps = { ...(rules.statCaps ?? {}) };
  if (log && !(id in log.statCapsBefore)) log.statCapsBefore[id] = rules.statCaps[id];
  rules.statCaps[id] = value;
};

const effectText = (effect) => effect?.text || effect?.name || String(effect ?? "");

const makeLog = (floor, classEntry) => ({
  floor,
  classId: classEntry?.id ?? "",
  className: classEntry?.name ?? "",
  stats: {},
  skills: {},
  defenseTags: [],
  spellRowsAdded: [],
  attackRowsAdded: [],
  spellRowsBefore: {},
  attackRowsBefore: {},
  skillCapsBefore: {},
  statCapsBefore: {},
  skillAdvantagesBefore: {},
  movementBefore: null,
  sizeBefore: null,
});

const customBullets = (entry) => {
  const bullets = [];
  for (const [key, delta] of Object.entries(entry?.stat_bonuses ?? {})) {
    bullets.push({ kind: "stat", key, delta, text: `${STAT_LABELS[key] ?? cap(key)} ${Number(delta) >= 0 ? "+" : ""}${delta}` });
  }
  for (const [key, delta] of Object.entries(entry?.stat_penalties ?? {})) {
    bullets.push({ kind: "stat", key, delta, text: `${STAT_LABELS[key] ?? cap(key)} ${Number(delta) >= 0 ? "+" : ""}${delta}` });
  }
  for (const [key, delta] of Object.entries(entry?.skill_rank_bonuses ?? {})) {
    if (key === "all_hand_to_hand") {
      bullets.push({ kind: "multi_skill", ids: HAND_TO_HAND_IDS, delta, text: `All Hand-to-Hand Skills +${delta}` });
    } else {
      bullets.push({ kind: "skill", id: key, delta, text: `${cap(key)} ${Number(delta) >= 0 ? "+" : ""}${delta}` });
    }
  }
  for (const [key, delta] of Object.entries(entry?.spell_rank_bonuses ?? {})) {
    bullets.push({ kind: "skill", id: key, delta, text: `${cap(key)} Spell ${Number(delta) >= 0 ? "+" : ""}${delta}` });
  }
  if (entry?.skill_rank_caps === "all_to_20") {
    bullets.push({ kind: "all_skill_cap", cap: 20, text: "All Skills can be raised to Rank 20" });
  } else {
    for (const [id, value] of Object.entries(entry?.skill_rank_caps ?? {})) {
      bullets.push({ kind: "skill_cap", id, cap: value, text: `${cap(id)} can be raised to Rank ${value}` });
    }
  }
  for (const [id, value] of Object.entries(entry?.stat_caps ?? {})) {
    bullets.push({ kind: "stat_cap", id, cap: value, text: `${STAT_LABELS[id] ?? cap(id)} is capped at ${value}` });
  }
  for (const id of entry?.skill_check_advantage ?? []) {
    bullets.push({ kind: "skill_advantage", id, text: `Advantage on ${cap(id)} Skill Checks` });
  }
  for (const resistance of entry?.resistances ?? []) {
    bullets.push({ kind: "defense", tag: `Resistance: ${resistance}`, text: `Resistance to ${resistance}` });
  }
  for (const immunity of entry?.immunities ?? []) {
    bullets.push({ kind: "defense", tag: `Immune: ${immunity}`, text: `Immunity to ${immunity}` });
  }
  for (const vulnerability of entry?.vulnerabilities ?? []) {
    bullets.push({ kind: "defense", tag: `Vulnerable: ${vulnerability}`, text: `Vulnerability to ${vulnerability}` });
  }
  if (Number.isFinite(Number(entry?.damage_resistance_bonus))) {
    bullets.push({ kind: "defense", tag: `DR +${entry.damage_resistance_bonus}`, text: `DR +${entry.damage_resistance_bonus}` });
  }
  for (const granted of entry?.granted_skills ?? []) {
    bullets.push({ kind: "granted_skill", skill: granted, text: `${granted.name ?? cap(granted.id)} (granted Skill)` });
  }
  for (const passive of entry?.passive_skills ?? []) {
    bullets.push({ kind: "effect", effect: passive, text: effectText(passive) });
  }
  for (const effect of entry?.effects ?? []) {
    if (effect?.immunity) bullets.push({ kind: "defense", tag: `Immune: ${effect.immunity}`, text: effectText(effect) || `Immunity to ${effect.immunity}` });
    else if (Array.isArray(effect?.immunities)) {
      for (const immunity of effect.immunities) bullets.push({ kind: "defense", tag: `Immune: ${immunity}`, text: `Immunity to ${immunity}` });
    } else if (effect?.resistance) bullets.push({ kind: "defense", tag: `Resistance: ${effect.resistance}`, text: effectText(effect) || `Resistance to ${effect.resistance}` });
    else bullets.push({ kind: "effect", effect, text: effectText(effect) });
  }
  for (const restriction of [...(entry?.restrictions ?? []), ...(entry?.weapon_restrictions ?? [])]) {
    bullets.push({ kind: "effect", effect: { text: restriction }, text: restriction });
  }
  return bullets;
};

export function classBenefitBullets(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.benefits)) return entry.benefits.map((text) => ({ kind: "text", text }));
  return customBullets(entry);
}

export function raceBenefitBullets(entry) {
  if (!entry) return [];
  const bullets = customBullets(entry);
  for (const sense of entry.senses ?? []) {
    bullets.push({ kind: "sense", text: sense });
  }
  if (Number.isFinite(Number(entry.movement_bonus_ft))) {
    bullets.push({ kind: "move_bonus", feet: Number(entry.movement_bonus_ft), text: `Move +${entry.movement_bonus_ft} ft` });
  }
  for (const rule of entry.group_skill_rank_bonuses ?? []) {
    bullets.push({
      kind: "group_skill_bonus",
      group: rule.group,
      bonus: rule.bonus,
      text: `${cap(rule.group)} Skills +${rule.bonus}`,
    });
  }
  for (const rule of entry.group_skill_rank_caps ?? []) {
    bullets.push({
      kind: "group_skill_cap",
      group: rule.group,
      cap: rule.cap,
      text: `${cap(rule.group)} Skills may reach Rank ${rule.cap}`,
    });
  }
  for (const id of entry.stat_check_advantage ?? []) {
    bullets.push({ kind: "stat_advantage", id, text: `Advantage on ${STAT_LABELS[id] ?? cap(id)} Stat Checks` });
  }
  for (const id of entry.stat_skill_advantage ?? []) {
    bullets.push({ kind: "stat_skill_advantage", id, text: `Advantage on all ${STAT_LABELS[id] ?? cap(id)}-based Skill Checks` });
  }
  for (const rule of entry.conditional_skill_advantage ?? []) {
    bullets.push({ kind: "conditional_skill_advantage", ...rule, text: `Advantage on ${cap(rule.id)}: ${rule.condition}` });
  }
  for (const reward of entry.rewards ?? []) {
    bullets.push({ kind: "reward", reward, text: reward.text ?? reward.name ?? cap(reward.id) });
  }
  for (const choice of entry.pending_choices ?? []) {
    bullets.push({ kind: "pending_choice", text: choice });
  }
  return bullets;
}

const namesInText = (profile, text) => {
  const lower = String(text).toLowerCase();
  const candidates = [];
  for (const def of Object.values(profile?.skills?.catalog ?? {})) {
    for (const name of [def.name, def.display_name, ...(def.aliases ?? [])].filter(Boolean)) {
      const needle = String(name).toLowerCase();
      if (lower.includes(needle)) candidates.push({ id: def.id, needle });
    }
  }
  candidates.sort((a, b) => b.needle.length - a.needle.length);
  const accepted = [];
  for (const candidate of candidates) {
    if (accepted.some((a) => a.needle.includes(candidate.needle))) continue;
    accepted.push(candidate);
  }
  return [...new Set(accepted.map((c) => c.id))];
};

const applyOfficialText = (sheet, profile, text, className, log) => {
  const raw = String(text ?? "");
  const lower = raw.toLowerCase();
  let applied = false;

  // Explicit Stat +/- values, including grouped "Intelligence, Constitution, and Charisma +3".
  const explicit = [];
  for (const [key, label] of Object.entries(STAT_LABELS)) {
    const m = raw.match(new RegExp(`\\b${label}\\s*([+-]\\d+)`, "i"));
    if (m) explicit.push([key, Number(m[1])]);
  }
  if (explicit.length) {
    explicit.forEach(([key, delta]) => adjustStat(sheet, profile, key, delta, log));
    applied = true;
  } else {
    const tail = raw.match(/([+-]\d+)\s*$/);
    if (tail) {
      const keys = Object.entries(STAT_LABELS)
        .filter(([, label]) => new RegExp(`\\b${label}\\b`, "i").test(raw))
        .map(([key]) => key);
      if (keys.length) {
        keys.forEach((key) => adjustStat(sheet, profile, key, Number(tail[1]), log));
        applied = true;
      }
    }
  }

  const skillIds = namesInText(profile, raw);
  const trailing = raw.match(/([+-]\d+)\s*(?:$|,|;)/);
  if (skillIds.length && trailing && /skill|spell/i.test(raw)) {
    for (const id of skillIds) adjustSkill(sheet, profile, id, Number(trailing[1]), className, log);
    applied = true;
  }

  if (/rank\s*20/i.test(raw) && skillIds.length) {
    for (const id of skillIds) setSkillCap(sheet, id, 20, log);
    applied = true;
  }
  if (/all skills.*rank\s*20/i.test(lower)) {
    setSkillCap(sheet, "*", 20, log);
    applied = true;
  }

  const dr = raw.match(/(?:DR(?:\s+Buff)?\s*\+)(\d+)/i);
  if (dr) {
    addDefenseTag(sheet, `DR +${dr[1]}`, log);
    applied = true;
  }
  const resistance = raw.match(/Resistance to ([A-Za-z -]+?)(?: damage|$)/i);
  if (resistance) {
    addDefenseTag(sheet, `Resistance: ${resistance[1].trim()}`, log);
    applied = true;
  }
  const immunity = raw.match(/Immunity to ([A-Za-z -]+?)(?: damage|$)/i);
  if (immunity) {
    addDefenseTag(sheet, `Immune: ${immunity[1].trim()}`, log);
    applied = true;
  }
  const vulnerable = raw.match(/Vulnerable to ([A-Za-z -]+?)(?: damage|$)/i);
  if (vulnerable) {
    addDefenseTag(sheet, `Vulnerable: ${vulnerable[1].trim()}`, log);
    applied = true;
  }

  return applied;
};

const applyDescriptor = (sheet, profile, descriptor, classEntry, floor, log, effects, pendingChoices) => {
  const className = classEntry?.name ?? "Class";
  switch (descriptor.kind) {
    case "stat":
      adjustStat(sheet, profile, descriptor.key, descriptor.delta, log);
      return;
    case "skill":
      for (const id of expandSkillKey(descriptor.id)) adjustSkill(sheet, profile, id, descriptor.delta, className, log);
      return;
    case "multi_skill":
      for (const id of descriptor.ids ?? []) adjustSkill(sheet, profile, id, descriptor.delta, className, log);
      return;
    case "skill_cap":
      setSkillCap(sheet, descriptor.id, descriptor.cap, log);
      return;
    case "all_skill_cap":
      setSkillCap(sheet, "*", descriptor.cap, log);
      return;
    case "stat_cap":
      setStatCap(sheet, descriptor.id, descriptor.cap, log);
      if (Number(sheet.attrs?.[descriptor.id]) > Number(descriptor.cap)) {
        adjustStat(sheet, profile, descriptor.id, Number(descriptor.cap) - Number(sheet.attrs[descriptor.id]), log);
      }
      return;
    case "defense":
      addDefenseTag(sheet, descriptor.tag, log);
      return;
    case "move_bonus": {
      const current = Number(sheet.defense?.move);
      const base = Number.isFinite(current) && current > 0 ? current : 20;
      if (log && log.movementBefore === null) log.movementBefore = sheet.defense?.move ?? "";
      sheet.defense = { ...(sheet.defense ?? {}), move: base + Number(descriptor.feet || 0) };
      return;
    }
    case "sense": {
      const rules = ensureRules(sheet);
      rules.senses = Array.isArray(rules.senses) ? rules.senses : [];
      if (!rules.senses.includes(descriptor.text)) rules.senses.push(descriptor.text);
      effects.push(descriptor.text);
      return;
    }
    case "reward": {
      const rules = ensureRules(sheet);
      rules.rewards = Array.isArray(rules.rewards) ? rules.rewards : [];
      if (!rules.rewards.some((r) => r?.id === descriptor.reward?.id && r?.source === className)) {
        rules.rewards.push({ ...(descriptor.reward ?? {}), source: className });
      }
      effects.push(descriptor.text);
      return;
    }
    case "group_skill_bonus":
      applyGroupSkillBonus(sheet, profile, descriptor.group, descriptor.bonus, className, log);
      return;
    case "group_skill_cap":
      applyGroupSkillCap(sheet, profile, descriptor.group, descriptor.cap, log);
      return;
    case "stat_advantage": {
      const rules = ensureRules(sheet);
      rules.statCheckAdvantages = Array.isArray(rules.statCheckAdvantages) ? rules.statCheckAdvantages : [];
      if (!rules.statCheckAdvantages.includes(descriptor.id)) rules.statCheckAdvantages.push(descriptor.id);
      effects.push(descriptor.text);
      return;
    }
    case "stat_skill_advantage": {
      const rules = ensureRules(sheet);
      rules.statSkillCheckAdvantages = Array.isArray(rules.statSkillCheckAdvantages) ? rules.statSkillCheckAdvantages : [];
      if (!rules.statSkillCheckAdvantages.includes(descriptor.id)) rules.statSkillCheckAdvantages.push(descriptor.id);
      effects.push(descriptor.text);
      return;
    }
    case "conditional_skill_advantage": {
      const rules = ensureRules(sheet);
      rules.conditionalSkillAdvantages = Array.isArray(rules.conditionalSkillAdvantages) ? rules.conditionalSkillAdvantages : [];
      rules.conditionalSkillAdvantages.push({ id: descriptor.id, condition: descriptor.condition, source: className });
      effects.push(descriptor.text);
      return;
    }
    case "pending_choice":
      pendingChoices.push(descriptor.text);
      return;
    case "skill_advantage": {
      const rules = ensureRules(sheet);
      rules.skillCheckAdvantages = Array.isArray(rules.skillCheckAdvantages) ? rules.skillCheckAdvantages : [];
      if (log && !(descriptor.id in log.skillAdvantagesBefore)) {
        log.skillAdvantagesBefore[descriptor.id] = rules.skillCheckAdvantages.includes(descriptor.id);
      }
      if (!rules.skillCheckAdvantages.includes(descriptor.id)) rules.skillCheckAdvantages.push(descriptor.id);
      return;
    }
    case "granted_skill": {
      const skill = descriptor.skill ?? {};
      const forced =
        skill?.rank_rule?.kind === "floor_level"
          ? Number(floor)
          : Number(skill?.rank_rule?.initial_rank_at_third_floor ?? 0) || null;
      adjustSkill(sheet, profile, skill.id, 0, className, log, forced);
      effects.push(skill.text ?? descriptor.text);
      return;
    }
    case "effect":
      effects.push(effectText(descriptor.effect) || descriptor.text);
      return;
    case "text": {
      const applied = applyOfficialText(sheet, profile, descriptor.text, className, log);
      effects.push(descriptor.text);
      if (!applied && /choice|choose|split \+|one .* skill|two .* skills/i.test(descriptor.text)) {
        pendingChoices.push(descriptor.text);
      }
      return;
    }
    default:
      effects.push(descriptor.text ?? "");
  }
};

const finishClassApplication = (sheet, profile, oldMaxHp, oldMaxMana) => {
  refreshSkillMods(sheet, profile);
  refreshVitals(sheet, profile, oldMaxHp, oldMaxMana);
  refreshSkillMods(sheet, profile);
};

export function applyThirdFloorRace(profile, sourceSheet, raceEntry, floor = 3) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const existing = rules.advancement?.thirdFloor?.raceId;
  if (existing) return sheet;

  const oldMaxHp = sheet.maxHp;
  const oldMaxMana = sheet.maxMana;
  const log = makeLog(floor, raceEntry);
  const effects = [];
  const pendingChoices = [];

  for (const descriptor of raceBenefitBullets(raceEntry)) {
    applyDescriptor(sheet, profile, descriptor, raceEntry, floor, log, effects, pendingChoices);
  }

  const size = raceEntry?.size;
  sheet.info = {
    ...(sheet.info ?? {}),
    race: raceEntry.name,
    floor: Math.max(3, n(sheet.info?.floor, floor)),
    ...(size?.label ? { size: size.value == null ? size.label : `${size.label} (${size.value})` } : {}),
  };

  rules.identity = {
    ...(rules.identity ?? {}),
    currentRace: raceEntry.name,
    thirdFloorRaceId: raceEntry.id,
    raceEarthBased: raceEntry.earth_race === true,
    raceClassAccess: raceEntry.class_access ?? [],
  };

  rules.advancement.thirdFloor = {
    ...(rules.advancement.thirdFloor ?? {}),
    raceId: raceEntry.id,
    raceName: raceEntry.name,
    raceSource: raceEntry.source ?? "",
    raceChosenAtFloor: Number(floor),
    raceEarthBased: raceEntry.earth_race === true,
    raceEffects: effects.filter(Boolean),
    racePendingChoices: [...(raceEntry.pending_choices ?? []), ...pendingChoices].filter((v, i, a) => a.indexOf(v) === i),
    raceApplicationLog: log,
  };

  finishClassApplication(sheet, profile, oldMaxHp, oldMaxMana);
  return sheet;
}

export function applyThirdFloorClass(profile, sourceSheet, classEntry, floor = 3) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const existing = rules.advancement?.thirdFloor?.classId;
  if (existing) return sheet; // idempotent: a permanent class is applied once

  const oldMaxHp = sheet.maxHp;
  const oldMaxMana = sheet.maxMana;
  const log = makeLog(floor, classEntry);
  const effects = [];
  const pendingChoices = [];

  for (const descriptor of classBenefitBullets(classEntry)) {
    applyDescriptor(sheet, profile, descriptor, classEntry, floor, log, effects, pendingChoices);
  }

  sheet.info = { ...(sheet.info ?? {}), class: classEntry.name, floor: Math.max(3, n(sheet.info?.floor, floor)) };
  rules.advancement.thirdFloor = {
    ...(rules.advancement.thirdFloor ?? {}),
    classId: classEntry.id,
    className: classEntry.name,
    classSource: classEntry.source ?? "",
    chosenAtFloor: Number(floor),
    effects: effects.filter(Boolean),
    pendingChoices,
    applicationLog: log,
  };

  finishClassApplication(sheet, profile, oldMaxHp, oldMaxMana);
  return sheet;
}

const hashSeed = (text) => {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const seededRandom = (seedText) => {
  let x = hashSeed(seedText) || 0x9e3779b9;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
};

export function characterActorRank(sheet, floor = null) {
  const f = floor ?? n(sheet?.info?.floor, 3);
  const row = (sheet?.rulesetData?.skills ?? []).find((s) => s.id === "character_actor");
  return Math.max(3, Number(f) || 3, n(row?.rank, 0));
}

export function characterActorClassOptions(catalog, floor, seed, rank = floor) {
  const all = Object.values(catalog ?? {}).filter((entry) => entry?.id && entry.id !== "former_child_actor");
  if (rank >= 15) return all.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const rand = seededRandom(`${seed}:${floor}:character-actor`);
  const pool = [...all];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

export function rollCharacterActorBenefits(classEntry, random = Math.random) {
  return classBenefitBullets(classEntry).map((bullet, index) => {
    const roll = random() < 0.5 ? 1 : 2;
    return { ...bullet, index, roll, granted: roll === 2 };
  });
}

const stripAddedRows = (rows, names) => {
  const lower = new Set((names ?? []).map((v) => String(v).toLowerCase()));
  return (rows ?? []).filter((row) => !lower.has(String(row?.name ?? "").toLowerCase()));
};

export function expireCharacterActorFloor(profile, sourceSheet) {
  const sheet = clone(sourceSheet);
  const rules = ensureRules(sheet);
  const actor = rules.advancement?.characterActor;
  const log = actor?.activeDeltas;
  if (!log) return sheet;

  const oldMaxHp = sheet.maxHp;
  const oldMaxMana = sheet.maxMana;
  for (const [key, delta] of Object.entries(log.stats ?? {})) {
    adjustStat(sheet, profile, key, -Number(delta), null);
  }

  const preserveEarned = Number(actor.rankAtGrant) >= 10;
  for (const [id, change] of Object.entries(log.skills ?? {})) {
    const idx = rules.skills.findIndex((s) => s.id === id);
    if (idx < 0) continue;
    const current = n(rules.skills[idx].rank);
    if (preserveEarned) {
      const rank = Math.max(0, current - n(change.delta));
      if (change.added && rank <= 0) rules.skills.splice(idx, 1);
      else rules.skills[idx] = { ...rules.skills[idx], rank };
    } else if (change.added) {
      rules.skills.splice(idx, 1);
    } else {
      rules.skills[idx] = { ...rules.skills[idx], rank: n(change.before) };
    }
  }

  for (const [id, before] of Object.entries(log.skillCapsBefore ?? {})) {
    rules.skillRankCaps = { ...(rules.skillRankCaps ?? {}) };
    if (before === undefined) delete rules.skillRankCaps[id];
    else rules.skillRankCaps[id] = before;
  }
  for (const [id, before] of Object.entries(log.statCapsBefore ?? {})) {
    rules.statCaps = { ...(rules.statCaps ?? {}) };
    if (before === undefined) delete rules.statCaps[id];
    else rules.statCaps[id] = before;
  }
  rules.skillCheckAdvantages = Array.isArray(rules.skillCheckAdvantages) ? rules.skillCheckAdvantages : [];
  for (const [id, before] of Object.entries(log.skillAdvantagesBefore ?? {})) {
    const has = rules.skillCheckAdvantages.includes(id);
    if (before && !has) rules.skillCheckAdvantages.push(id);
    if (!before && has) rules.skillCheckAdvantages = rules.skillCheckAdvantages.filter((x) => x !== id);
  }

  for (const [name, row] of Object.entries(log.spellRowsBefore ?? {})) {
    const idx = (sheet.spells ?? []).findIndex((r) => String(r?.name ?? "").toLowerCase() === String(name).toLowerCase());
    if (idx >= 0) sheet.spells[idx] = row;
  }
  for (const [name, row] of Object.entries(log.attackRowsBefore ?? {})) {
    const idx = (sheet.attacks ?? []).findIndex((r) => String(r?.name ?? "").toLowerCase() === String(name).toLowerCase());
    if (idx >= 0) sheet.attacks[idx] = row;
  }

  const removeTags = new Set(log.defenseTags ?? []);
  const kept = String(sheet.defense?.resist ?? "")
    .split(" • ")
    .map((v) => v.trim())
    .filter((v) => v && !removeTags.has(v));
  sheet.defense = { ...(sheet.defense ?? {}), resist: kept.join(" • ") };

  if (!preserveEarned) {
    sheet.spells = stripAddedRows(sheet.spells, log.spellRowsAdded);
    sheet.attacks = stripAddedRows(sheet.attacks, log.attackRowsAdded);
  } else {
    const liveIds = new Set(rules.skills.filter((s) => n(s.rank) > 0).map((s) => s.id));
    const catalog = profile?.skills?.catalog ?? {};
    const liveNames = new Set([...liveIds].map((id) => String(catalog[id]?.name ?? cap(id)).toLowerCase()));
    sheet.spells = (sheet.spells ?? []).filter(
      (row) => !log.spellRowsAdded?.includes(row?.name) || liveNames.has(String(row?.name ?? "").toLowerCase())
    );
    sheet.attacks = (sheet.attacks ?? []).filter(
      (row) => !log.attackRowsAdded?.includes(row?.name) || liveNames.has(String(row?.name ?? "").toLowerCase())
    );
  }

  rules.advancement.characterActor = {
    ...actor,
    activeDeltas: null,
    activeEffects: [],
    temporaryClassId: "",
    temporaryClassName: "",
  };
  finishClassApplication(sheet, profile, oldMaxHp, oldMaxMana);
  return sheet;
}

export function applyCharacterActorFloor(profile, sourceSheet, classEntry, rolledBenefits, floor) {
  let sheet = expireCharacterActorFloor(profile, sourceSheet);
  const rules = ensureRules(sheet);
  const oldMaxHp = sheet.maxHp;
  const oldMaxMana = sheet.maxMana;
  const rank = Math.max(3, Number(floor));

  // Character Actor itself rises only by floor descent.
  const existing = rules.skills.find((s) => s.id === "character_actor");
  const currentRank = n(existing?.rank);
  if (currentRank !== rank) adjustSkill(sheet, profile, "character_actor", 0, "Former Child Actor", null, rank);

  const log = makeLog(floor, classEntry);
  const effects = [];
  const pendingChoices = [];
  for (const rolled of rolledBenefits ?? []) {
    if (!rolled?.granted) continue;
    applyDescriptor(sheet, profile, rolled, classEntry, floor, log, effects, pendingChoices);
  }

  rules.advancement.characterActor = {
    ...(rules.advancement.characterActor ?? {}),
    lastFloorApplied: Number(floor),
    rankAtGrant: rank,
    temporaryClassId: classEntry.id,
    temporaryClassName: classEntry.name,
    rolls: (rolledBenefits ?? []).map((b) => ({ index: b.index, text: b.text, roll: b.roll, granted: !!b.granted })),
    activeEffects: effects.filter(Boolean),
    pendingChoices,
    activeDeltas: log,
  };

  finishClassApplication(sheet, profile, oldMaxHp, oldMaxMana);
  return sheet;
}

export function needsThirdFloorRace(sheet) {
  const floor = n(sheet?.info?.floor, 1);
  const existing = sheet?.rulesetData?.advancement?.thirdFloor?.raceId;
  return floor >= 3 && !existing;
}

export function needsThirdFloorClass(sheet) {
  const floor = n(sheet?.info?.floor, 1);
  const third = sheet?.rulesetData?.advancement?.thirdFloor ?? {};
  return floor >= 3 && !!third.raceId && !third.classId && !String(sheet?.info?.class ?? "").trim();
}

export function needsCharacterActorFloor(sheet) {
  const floor = n(sheet?.info?.floor, 1);
  const classId = sheet?.rulesetData?.advancement?.thirdFloor?.classId;
  if (classId !== "former_child_actor" || floor < 3) return false;
  return n(sheet?.rulesetData?.advancement?.characterActor?.lastFloorApplied, 0) < floor;
}
