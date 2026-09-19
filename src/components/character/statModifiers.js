import { resolveProfile, makeThresholdLookup } from "@/rules-profile";

/* Dungeon Crawler Carl stat modifiers.
   A DCCarl character's modifier comes from its Rules Profile — NEVER the
   D&D formula. The profile's mod rule derives every mod from the
   ENHANCED stat via the official threshold table, so:

   1. The LIVE enhanced stat value on the sheet (attrs) through the
      builtin DCCarl Rules Profile's official threshold table — this is
      the authoritative source, so an edited stat recomputes its mod
      immediately (the same value drives the profile's resource
      formulas, e.g. Max Health = CON Mod × 10).
   2. Otherwise the character's STORED modifier (preserved
      ruleset_data.stats, copied verbatim from its pregen template),
      used exactly as stored. Pregen stored mods match the same official
      table, so unedited characters display identically either way.

   Non-DCCarl characters get null and keep the existing D&D-style display. */

const STAT_KEYS = ["str", "int", "con", "dex", "cha"];

const formatMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

/* Numeric DCCarl mods — raw numbers (never formatted strings) so the
   resource formulas can consume them directly. */
export function dccStatModsNumeric(profile, rulesetData, attrs) {
  if (profile?.systemKey !== "dungeon_crawler_carl") return null;
  const resolved = resolveProfile({ system_key: "dungeon_crawler_carl" });
  if (resolved.status !== "ok") return null;
  const modRule = resolved.profile.stats.mod_rule; // { kind: "threshold_table", derived_from: "enhanced" }
  const lookup = makeThresholdLookup(modRule.table);

  const stats = rulesetData?.stats ?? {};
  const mods = {};
  let any = false;
  for (const key of STAT_KEYS) {
    const enhanced = attrs?.[key];
    let mod = null;
    if (typeof enhanced === "number" && Number.isFinite(enhanced)) {
      mod = lookup(enhanced); // official profile table on the live enhanced stat
    } else {
      const stored = stats?.[key]?.mod;
      if (typeof stored === "number" && Number.isFinite(stored)) mod = stored;
    }
    if (mod !== null) {
      mods[key] = mod;
      any = true;
    }
  }
  return any ? mods : null;
}

/* Displayed mods — the numeric helper, formatted for the sheet chips. */
export function dccStatMods(profile, rulesetData, attrs) {
  const numeric = dccStatModsNumeric(profile, rulesetData, attrs);
  if (!numeric) return null;
  const mods = {};
  for (const [key, mod] of Object.entries(numeric)) mods[key] = formatMod(mod);
  return mods;
}