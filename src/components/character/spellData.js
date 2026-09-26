/* Shared spell-data helpers. Rank, Mana cost, and heal effects parse
   from the character's preserved ruleset text; companion attack/skill
   entries are matched by name. Nothing is invented — values are either
   in the preserved data or absent. */

const RANK_RE = /Rank\s+(\d+)/i;
const MANA_RE = /Mana Cost\s+(\d+)/i;
const HEAL_RE = /heals?\s+(\d+)\s+Health Bar slots?/i;

export const parseRank = (detail) => detail?.match(RANK_RE)?.[1] ?? "";
export const parseMana = (detail) => detail?.match(MANA_RE)?.[1] ?? "";
export const parseHealSlots = (detail) => {
  const m = detail?.match(HEAL_RE);
  return m ? parseInt(m[1], 10) : null;
};

/* Match a spell ("Magic Missile Spell") to its preserved companion data
   ("Magic Missile" attack/skill — pregen mapping copies names verbatim). */
const matchByName = (list, name) => {
  const base = String(name ?? "").replace(/\s*Spell$/i, "").trim();
  return (
    (Array.isArray(list) ? list : []).find((x) => {
      const n = x?.name ?? "";
      return n && (n === name || n === base || base.startsWith(n) || n.startsWith(base));
    }) ?? null
  );
};

const DAMAGE_FROM_NOTES_RE = /Damage\s+([^·]+)/i;
const RANGE_FROM_NOTES_RE = /Range\s+([^·]+)/i;

const parseDamageFromNotes = (notes) => {
  const m = String(notes ?? "").match(DAMAGE_FROM_NOTES_RE);
  return m ? m[1] : "";
};
const parseRangeFromNotes = (notes) => {
  const m = String(notes ?? "").match(RANGE_FROM_NOTES_RE);
  return m ? m[1].trim() : "";
};

const profileSpellMeta = (profile, name) => {
  if (!profile || !name) return null;
  const catalog = profile?.skills?.catalog ?? {};
  const target = String(name).toLowerCase();
  const id = Object.keys(catalog).find(
    (key) => String(catalog[key]?.name ?? "").toLowerCase() === target
  );
  if (!id) return null;

  const heal = profile?.spells?.starting_spell ?? null;
  if (heal?.id === id) {
    return {
      id,
      description: heal.desc ?? "",
      rank: heal.rank ?? "",
      mana: heal.mana_cost ?? "",
      range: heal.range ?? "",
      damage: "",
    };
  }

  const details =
    profile?.creation_flow?.steps
      ?.find((step) => step.id === "combat_approach")
      ?.options?.find((option) => option.id === "attack_spell")
      ?.spell_details ?? {};
  const det = details[id];
  if (!det) return null;
  return {
    id,
    description: det.desc ?? "",
    rank: det.rank ?? "",
    mana: det.mana_cost ?? "",
    range: det.range ?? "",
    damage: det.damage?.dice
      ? `${det.damage.dice}${det.damage.plus_int_mod ? " + INT Mod" : ""}`
      : "",
  };
};

const withoutLeadingDescription = (detail, description) => {
  const d = String(detail ?? "").trim();
  const desc = String(description ?? "").trim();
  if (!d || !desc || !d.toLowerCase().startsWith(desc.toLowerCase())) return d;
  return d.slice(desc.length).replace(/^\s*[·—-]\s*/, "").trim();
};

/* Known spells/abilities — traced from BOTH the preserved ruleset hotlist
   (pregen characters) and the canonical spell rows (wizard characters),
   so every known spell gets the same Spell Action Card regardless of how
   the character was created. Pregen hotlist entries are filtered to
   spell-identified items only; canonical spell rows are all known spells
   by construction. The two sources are merged, de-duplicated by name. */
export function knownSpells(rulesetData, spells, profile = null) {
  const result = [];
  const seen = new Set();

  // 1 — pregen hotlist entries (spell-identified only get action cards).
  const hotlist = Array.isArray(rulesetData?.hotlist) ? rulesetData.hotlist : [];
  for (const h of hotlist) {
    const name = h?.name ?? "";
    if (!name) continue;
    if (!/spell/i.test(name) && !/spell/i.test(h?.detail ?? "")) continue;
    const detail = h?.detail ?? "";
    const attack = matchByName(rulesetData?.attacks, name);
    const skill = matchByName(rulesetData?.skills, name);
    const meta = profileSpellMeta(profile, name);
    result.push({
      name,
      rank: parseRank(detail) || String(skill?.rank ?? meta?.rank ?? ""),
      mana: parseMana(detail) || String(meta?.mana ?? ""),
      description: meta?.description ?? "",
      detail: withoutLeadingDescription(detail, meta?.description),
      attack:
        attack ??
        (meta?.damage || meta?.range ? { damage: meta?.damage ?? "", range: meta?.range ?? "" } : null),
      skill,
    });
    seen.add(name.toLowerCase());
  }

  // 2 — canonical spell rows (wizard characters — all are known spells).
  const spellRows = Array.isArray(spells) ? spells : [];
  for (const r of spellRows) {
    const name = r?.name ?? "";
    if (!name || seen.has(name.toLowerCase())) continue;
    const notes = r?.notes ?? "";
    const skill = matchByName(rulesetData?.skills, name);
    const meta = profileSpellMeta(profile, name);
    const damage = parseDamageFromNotes(notes) || meta?.damage || "";
    const range = parseRangeFromNotes(notes) || meta?.range || "";
    result.push({
      name,
      rank: parseRank(notes) || String(skill?.rank ?? meta?.rank ?? ""),
      mana: r?.cost ?? parseMana(notes) ?? String(meta?.mana ?? ""),
      description: meta?.description ?? "",
      detail: withoutLeadingDescription(notes, meta?.description),
      attack: damage || range ? { damage, range } : null,
      skill,
    });
  }

  return result;
}