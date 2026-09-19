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

const DAMAGE_FROM_NOTES_RE = /Damage\s+(\S+)/i;
const RANGE_FROM_NOTES_RE = /Range\s+([^·]+)/i;

const parseDamageFromNotes = (notes) => {
  const m = String(notes ?? "").match(DAMAGE_FROM_NOTES_RE);
  return m ? m[1] : "";
};
const parseRangeFromNotes = (notes) => {
  const m = String(notes ?? "").match(RANGE_FROM_NOTES_RE);
  return m ? m[1].trim() : "";
};

/* Known spells/abilities — traced from BOTH the preserved ruleset hotlist
   (pregen characters) and the canonical spell rows (wizard characters),
   so every known spell gets the same Spell Action Card regardless of how
   the character was created. Pregen hotlist entries are filtered to
   spell-identified items only; canonical spell rows are all known spells
   by construction. The two sources are merged, de-duplicated by name. */
export function knownSpells(rulesetData, spells) {
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
    result.push({
      name,
      rank: parseRank(detail) || String(skill?.rank ?? ""),
      mana: parseMana(detail),
      detail,
      attack,
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
    const damage = parseDamageFromNotes(notes);
    const range = parseRangeFromNotes(notes);
    result.push({
      name,
      rank: parseRank(notes) || String(skill?.rank ?? ""),
      mana: r?.cost ?? parseMana(notes),
      detail: notes,
      attack: damage || range ? { damage, range } : null,
      skill,
    });
  }

  return result;
}