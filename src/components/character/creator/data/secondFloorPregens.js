import { FIRST_FLOOR_PREGENS, PREGEN_SYSTEM_KEY } from "./firstFloorPregens";
import { resolveProfile, makeThresholdLookup } from "@/rules-profile";

/* SECOND FLOOR pregenerated character templates — Dungeon Crawler Carl.
   PRIVATE TEST DATA for the authenticated playtest only — same status as
   the First Floor set: NOT a publicly licensed content package.

   The uploaded core rulebook does not print separate Second Floor pregen
   sheets, so these templates ADVANCE the six verified First Floor pregens
   to Level 2 using the book's official Crawler Advancement rules
   (Crawler Advancement, core rulebook p. 169):
     • +3 Stat points per Level — assigned among the five Stats, raising
       BOTH the Enhanced and Unenhanced values
     • Skills do NOT increase on level-up (they only rise through use,
       grinding, training, or magic)
     • Max Health = CON Mod × 10, Max Mana = Enhanced INT stat value,
       Base Evade = DEX Mod (+ any passive Dodge buff) — the same
       canonical Rules Profile formulas the character sheet already uses

   The per-character point allocation below is a build-themed choice that
   players can freely reassign afterwards in Edit Character. Every other
   template value — attacks, skills, gear, inventory, hotlist, story
   hooks — carries over unchanged from the verified First Floor source,
   exactly as the advancement rules dictate. */

const STAT_ORDER = ["str", "int", "con", "dex", "cha"];
const STAT_LABELS = { STR: "str", INT: "int", CON: "con", DEX: "dex", CHA: "cha" };

/* Level 2 — the +3 Stat points each crawler gained on reaching Level 2
   (one Level = one 2-hour session or a Neighborhood Boss kill). */
const ADVANCEMENT = {
  dcc_ff_brandon: { str: 1, con: 1, dex: 1 }, // maul bruiser
  dcc_ff_carl: { str: 1, con: 1, dex: 1 },    // pugilist
  dcc_ff_chris: { int: 1, con: 1, dex: 1 },    // engineer
  dcc_ff_donut: { str: 1, int: 1, cha: 1 },    // Enhanced Growth pattern (+1 STR/INT, +2 CHA per novel level)
  dcc_ff_imani: { str: 1, con: 1, cha: 1 },    // persuader
  dcc_ff_yolanda: { dex: 1, int: 1, con: 1 },  // bow medic
};

/* The official threshold table from the builtin DCCarl Rules Profile —
   the SAME table the sheet uses live, so stored template mods always
   match what the sheet recomputes. */
const resolvedProfile = resolveProfile({ system_key: PREGEN_SYSTEM_KEY });
const modOf = makeThresholdLookup(resolvedProfile.profile.stats.mod_rule.table);
const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

const advanceToSecondFloor = (template) => {
  const points = ADVANCEMENT[template.id] ?? {};

  /* +3 Stat points — Enhanced and Unenhanced rise together; mods
     recompute from the Enhanced value through the official table. */
  const stats = {};
  for (const key of STAT_ORDER) {
    const gain = points[key] ?? 0;
    const base = template.stats[key];
    stats[key] = {
      enhanced: base.enhanced + gain,
      unenhanced: base.unenhanced + gain,
      mod: fmtMod(modOf(base.enhanced + gain)),
    };
  }

  const d = template.derived;
  const oldDexMod = modOf(template.stats.dex.enhanced);
  const newDexMod = modOf(stats.dex.enhanced);
  const dodgeBuff = (d.evade ?? 0) - oldDexMod; // passive Dodge bonus (Donut's +1), if any
  const conMod = modOf(stats.con.enhanced);
  const health = conMod * 10;

  const derived = {
    health,
    healthBarSlotValue: health / 10,
    maxMana: stats.int.enhanced,
    currentMana: stats.int.enhanced,
    evade: newDexMod + dodgeBuff,
    damageResistance: d.damageResistance,
    move: d.move,
    step: d.step,
    ...(d.evadeBaseDex !== undefined ? { evadeBaseDex: newDexMod } : {}),
    ...(d.evadeBuff ? { evadeBuff: d.evadeBuff } : {}),
  };

  /* To-hit = Skill Rank + attack Stat Mod — recomputed through the new
     mods (attacks without a numeric to-hit, e.g. passive Damage
     Effects, are kept verbatim). */
  const attacks = template.attacks.map((a) => {
    const statKey = a.attackStat ? STAT_LABELS[a.attackStat] : null;
    if (!statKey || typeof a.toHit !== "string" || !/^\+?\d+$/.test(a.toHit.replace(/\s/g, ""))) return a;
    const rank = Number(a.rank) || 0;
    return { ...a, toHit: fmtMod(rank + modOf(stats[statKey].enhanced)) };
  });

  /* Stat Mods on the skill list follow the recomputed Enhanced stats. */
  const skills = template.skills.map((s) => {
    const statKey = s.stat ? STAT_LABELS[s.stat] : null;
    if (!statKey) return s;
    return { ...s, mod: fmtMod(modOf(stats[statKey].enhanced)) };
  });

  return {
    ...template, // systemKey, templateType, gear, inventory, hotlist, storyHooks — carried over unchanged
    id: template.id.replace("_ff_", "_sf_"),
    floor: 2,
    identity: { ...template.identity, level: 2 },
    stats,
    derived,
    attacks,
    skills,
  };
};

export const SECOND_FLOOR_PREGENS = FIRST_FLOOR_PREGENS.map(advanceToSecondFloor);