/* Normalized Rules Profile contract — Ginger Dragon universal ruleset architecture.
   Contract schema v1.

   A Rules Profile is the normalized rules source consumed by every feature
   (Character Creator, Sheet, Skills, Spells, Gear, Hotbar, Advancement,
   GM Tools, Party/Campaign, Dungeon AI). Profiles are declarative data:
   formulas are formula-spec objects evaluated by src/rules-profile/formula.js —
   never executable user-supplied code.

   Source types:
   - builtin:  code-module adapter, keyed by system_key, available to all users
   - licensed: platform-owned read-only profile (same read path as builtin)
   - uploaded: user-owned profile produced from a privately uploaded rulebook
   - homebrew: user-owned profile (may exist with no source document)

   Raw source documents (PDFs) live in a separate Rulebook storage layer with
   owner-only access and are NEVER resolvable through this contract.
*/

export const CONTRACT_SCHEMA_VERSION = 1;

export const PROFILE_SOURCE_TYPES = ["builtin", "licensed", "uploaded", "homebrew"];

/* Sections every profile must provide. Profiles may add sections, never omit
   required ones. Section contents are system-defined (stats, skills, etc. can
   differ per game) — the contract guarantees presence and typing only. */
const REQUIRED_SECTIONS = ["stats", "skills", "resources", "derived", "creation_flow", "spells", "gear", "advancement"];

const builtinRegistry = new Map();

export function defineProfile(definition) {
  if (!definition || typeof definition !== "object") {
    throw new Error("rules profile: a definition object is required");
  }
  const {
    source_type,
    system_key,
    display_name,
    schema_version = CONTRACT_SCHEMA_VERSION,
    profile_version = 1,
    system_version = "",
    processing_version = null,
    ...sections
  } = definition;

  if (!PROFILE_SOURCE_TYPES.includes(source_type)) {
    throw new Error(`rules profile: invalid source_type "${source_type}"`);
  }
  if (!system_key || typeof system_key !== "string") {
    throw new Error("rules profile: system_key is required");
  }
  if (!display_name || typeof display_name !== "string") {
    throw new Error(`rules profile "${system_key}": display_name is required`);
  }
  if (!Number.isFinite(schema_version) || !Number.isFinite(profile_version)) {
    throw new Error(`rules profile "${system_key}": schema_version and profile_version must be numbers`);
  }
  for (const section of REQUIRED_SECTIONS) {
    if (!sections[section] || typeof sections[section] !== "object") {
      throw new Error(`rules profile "${system_key}": missing required section "${section}"`);
    }
  }

  return Object.freeze({
    source_type,
    system_key,
    display_name,
    schema_version,
    profile_version,
    system_version,
    processing_version,
    ...sections,
  });
}

export function registerBuiltinProfile(profile) {
  if (!profile || !profile.system_key) {
    throw new Error("registerBuiltinProfile: a defined profile with system_key is required");
  }
  if (builtinRegistry.has(profile.system_key)) {
    throw new Error(`registerBuiltinProfile: duplicate system_key "${profile.system_key}"`);
  }
  builtinRegistry.set(profile.system_key, profile);
}

export function listBuiltinProfiles() {
  return [...builtinRegistry.values()];
}

/* Resolution order (approved architecture):
   1. rules_profile_id  -> a user-owned profile record (uploaded/homebrew)
   2. system_key        -> a builtin or licensed profile
   3. neither           -> explicit recovery state.

   There is NO silent fallback to any default profile. Legacy characters are
   migrated to dungeon_crawler_carl by a one-time migration rule at the
   Character layer (Step 2), not by this resolver. */
export function resolveProfile({ system_key = "", rules_profile_id = "" } = {}) {
  if (rules_profile_id) {
    // User-owned profile records (uploaded/homebrew) are not stored yet —
    // a later implementation step introduces the RulesProfile entity.
    return { status: "unavailable", reason: "user_profile_records_not_implemented", rules_profile_id };
  }
  if (system_key) {
    const profile = builtinRegistry.get(system_key);
    return profile
      ? { status: "ok", profile }
      : { status: "not_found", reason: "unknown_system_key", system_key };
  }
  return { status: "missing", reason: "no_profile_reference" };
}