/* Rulebook ↔ Rules Profile connection helpers (Rulebook System Step 1).

   Architecture: RULEBOOK DOCUMENT(S) → private processing (future) →
   ONE Rules Profile → Creator / Sheet / Skills / Spells / Gear. A Rulebook
   is a PRIVATE source document owned by the user — it is never the profile
   itself, and one profile may eventually reference multiple rulebooks via
   their rules_profile_id back-references.

   Today the only resolvable profiles are BUILTIN adapters, referenced from
   a Rulebook as "builtin:<system_key>". Uploaded / homebrew profile records
   arrive with the future processing stage — until then a Rulebook with no
   resolvable connection is NEVER selectable for character creation and
   never silently falls back to another system (e.g. DCCarl). */

export const BUILTIN_REF_PREFIX = "builtin:";

/* Reference from a Rulebook record to a registered builtin adapter. */
export const profileRefForBuiltin = (systemKey) => `${BUILTIN_REF_PREFIX}${systemKey}`;

export const DOCUMENT_TYPE_LABELS = {
  core_rulebook: "Core Rulebook",
  player_guide: "Player Guide",
  gm_guide: "GM Guide",
  expansion: "Expansion",
  bestiary: "Bestiary",
  supplement: "Supplement",
  homebrew: "Homebrew",
  other: "Other",
};

/* Resolvable creation connection for a Rulebook: a READY status plus a
   profile reference that resolves against the registered profiles.
   Returns { profile, systemKey, displayName } or null (not selectable —
   the UI shows "Rules Profile not ready" / "Not Connected"). */
export const resolveRulebookProfile = (rulebook, builtins) => {
  const ref = rulebook?.rules_profile_id ?? "";
  if (!ref || rulebook?.status !== "ready") return null;
  if (!ref.startsWith(BUILTIN_REF_PREFIX)) {
    // User-owned profile records (uploaded/homebrew) arrive with the
    // future processing stage — not resolvable yet.
    return null;
  }
  const systemKey = ref.slice(BUILTIN_REF_PREFIX.length);
  const profile = (builtins ?? []).find((p) => p.system_key === systemKey);
  return profile ? { profile, systemKey, displayName: profile.display_name } : null;
};