/* Builtin adapter: dungeon_crawler_carl (internal key is NEVER "dcc" —
   dcc refers to Dungeon Crawl Classics).

   This adapter WRAPS the Crawler assumptions already present in the app so
   current behavior is unchanged; it is the reference implementation of the
   Rules Profile contract. Mechanics and concise labels only (no rulebook prose).
*/

import { defineProfile, CONTRACT_SCHEMA_VERSION } from "../../contract";
import { lit, statMod, statValue, op } from "../../formula";
import { SKILL_CATALOG } from "./skillCatalog";
import { HUMAN_BACKGROUND_CATEGORIES, ANIMAL_BACKGROUND_CATEGORIES } from "./backgrounds";
import {
  BASELINE_ATTACKS,
  BASELINE_ATTACK_RANK,
  WEAPON_CATEGORIES,
  WEAPON_DETAILS,
  CUSTOM_WEAPON_MODEL,
  HAND_TO_HAND_PAIRS,
  STARTING_ATTACK_SPELLS,
  STARTING_SPELL_OPTIONS,
  STARTING_SPELL_DETAILS,
  ATTACK_SPELL_REQUIREMENT,
  ATTACK_SPELL_GRANTS,
} from "./combat";
import { STARTING_GEAR_EXAMPLES, USEFUL_ITEM_EXAMPLES } from "./startingGear";

export const SYSTEM_KEY = "dungeon_crawler_carl";

/* Official Stat Mod table — derived from the ENHANCED stat. Never D&D math. */
export const STAT_MOD_TABLE = [
  { min: 1, max: 2, mod: 1 },
  { min: 3, max: 5, mod: 2 },
  { min: 6, max: 9, mod: 3 },
  { min: 10, max: 19, mod: 4 },
  { min: 20, max: 49, mod: 5 },
  { min: 50, max: 99, mod: 6 },
  { min: 100, max: 149, mod: 7 },
  { min: 150, max: 199, mod: 8 },
  { min: 200, max: 299, mod: 9 },
  { min: 300, max: null, mod: 10 },
];

const STATS = [
  { key: "str", label: "Strength", has_enhanced: true },
  { key: "int", label: "Intelligence", has_enhanced: true },
  { key: "con", label: "Constitution", has_enhanced: true },
  { key: "dex", label: "Dexterity", has_enhanced: true },
  { key: "cha", label: "Charisma", has_enhanced: true },
];

/* Game-wide Size scale (schema accepts the full range for future effects);
   starting animal creation is restricted to 2–4. `example` entries are UI
   guidance explaining physical scale ONLY — they are NOT automatic species
   rules; automatic species-size defaults come solely from the verified
   species_size_defaults mapping. */
const SIZE_SCALE = [
  { value: 1, label: "Tiny", example: "Scatterer / rat-sized" },
  { value: 2, label: "Small", example: "Cat / raccoon-sized" },
  { value: 3, label: "Petite", example: "Dog / boar-sized" },
  { value: 4, label: "Medium", example: "Human / wolf-sized" },
  { value: 5, label: "Large", example: "Horse / mantaur-sized" },
];

/* Legacy sheet skill names with clean official counterparts. Unmatched legacy
   skills (Athletics, Acrobatics, Nature, …) are NEVER dropped — they persist
   as custom skills (source: "legacy"). */
const LEGACY_SKILL_MAP = {
  Stealth: "stealth",
  Investigation: "investigation",
  Perception: "perception",
  Persuasion: "persuasion",
  Deception: "deception",
  Intimidation: "intimidate",
  Performance: "performance",
  Survival: "survival",
};

export const dungeonCrawlerCarlProfile = defineProfile({
  source_type: "builtin",
  system_key: SYSTEM_KEY,
  display_name: "Dungeon Crawler Carl",
  schema_version: CONTRACT_SCHEMA_VERSION,
  profile_version: 1,
  system_version: "",
  processing_version: null, // builtin adapter — no extraction pipeline

  stats: {
    order: STATS.map((d) => d.key),
    definitions: Object.fromEntries(STATS.map((d) => [d.key, d])),
    mod_rule: { kind: "threshold_table", table: STAT_MOD_TABLE, derived_from: "enhanced" },
  },

  skills: {
    catalog: SKILL_CATALOG,
    legacy_skill_map: LEGACY_SKILL_MAP,
    legacy_unmatched_policy: "keep_custom",
  },

  resources: {
    health: {
      id: "health",
      label: "Health",
      max: op("multiply", statMod("con"), lit(10)), // Max Health = Constitution Mod × 10
      bar: { segments: 10 }, // existing Ginger Dragon 10-slot Health Bar
    },
    mana: {
      id: "mana",
      label: "Mana",
      max: statValue("int", "enhanced"), // Max Mana = Enhanced Intelligence STAT VALUE
      bar: { segments: 10 },
    },
  },

  derived: {
    evade: { id: "evade", label: "Evade", formula: statMod("dex"), is_skill: false }, // Base Evade = Dexterity Mod
    move: { id: "move", label: "Move", default: lit(20), unit: "feet" }, // default 20 ft for all crawler types
    step: { id: "step", label: "Step", default: lit(10), unit: "feet" }, // default 10 ft for all crawler types
    damage_resistance: { id: "damage_resistance", label: "Damage Resistance", default: lit(0) }, // starting DR — no gear chosen yet; gear/race/class effects may change it later
    ai_favor: {
      id: "ai_favor",
      label: "AI Favor",
      default_by_crawler_type: { human: 1, animal: 0 }, // animal option consumes the initial Favor
    },
    popularity: { id: "popularity", label: "Popularity", formula: statMod("cha"), stages: ["third_floor"] },
  },

  creation_flow: {
    crawler_types: [
      { id: "human", label: "Human", backgrounds: "human" },
      { id: "animal", label: "Animal / Non-Human", backgrounds: "animal", requires_gm_permission: true, gives_up_initial_favor: true },
    ],
    creation_stages: [
      { id: "starting", label: "Starting / First-Floor Crawler" },
      { id: "third_floor", label: "Third-Floor Crawler", advancement: "third_floor" },
    ],
    basic_identity: {
      fields: [
        { id: "name", label: "Crawler Name", required: true },
        { id: "gender_pronouns", label: "Gender / Pronouns", required: false },
        { id: "crawler_number", label: "Crawler #", required: false, range: { min: 100, max: 13000000 } }, // valid crawler numbers — whole numbers 100 to 13,000,000
        { id: "portrait", label: "Portrait", required: false }, // embedded Portrait Workshop; skippable
      ],
    },
    backgrounds: {
      human: HUMAN_BACKGROUND_CATEGORIES,
      animal: ANIMAL_BACKGROUND_CATEGORIES,
    },
    steps: [
      {
        id: "backgrounds",
        label: "Establish Background",
        pick_one_background_per_category: true,
        skills_per_background: 2,
        method: ["choose", "roll"],
        duplicate_skills_cannot_stack: true,
      },
      {
        id: "combat_approach",
        label: "Choose Combat Approach",
        baseline_attack: BASELINE_ATTACKS,
        baseline_rank: BASELINE_ATTACK_RANK,
        populates: { skills: true, attacks: true },
        /* GINGER DRAGON UX default — NOT a claim that the DCCarl rulebook
           universally forbids animal weapons. Standard physical weapons may
           not be practical for many Animal / Non-Human forms without a
           special ability, suitable anatomy, transformation, or GM ruling,
           so the Wizard fades the Weapon path for the listed crawler types
           until the player ticks the GM override. Modes a future profile may
           set: "allowed" (normal weapon path), "restricted" (faded until GM
           override, if permitted), "forbidden" (never selectable) — the
           Wizard component itself stays generic. */
        animal_weapon_policy: {
          default: "restricted",
          gm_override_allowed: true,
          applies_to: ["animal"],
        },
        options: [
          {
            id: "weapon",
            rank: 3,
            categories: WEAPON_CATEGORIES,
            details: WEAPON_DETAILS, // verified stat blocks keyed by weapon Skill id
            custom_weapon: CUSTOM_WEAPON_MODEL,
          },
          {
            id: "attack_spell",
            rank: 3,
            spells: STARTING_ATTACK_SPELLS,
            starting_options: STARTING_SPELL_OPTIONS, // the three approved at creation
            spell_details: STARTING_SPELL_DETAILS, // stat blocks keyed by spell id
            requirement: ATTACK_SPELL_REQUIREMENT,
            requirement_timing: "validated_after_stats_step",
            grants: ATTACK_SPELL_GRANTS,
          },
          { id: "hand_to_hand", rank: 3, pairs: HAND_TO_HAND_PAIRS },
        ],
      },
      {
        id: "stats",
        label: "Choose Stats",
        enhanced_equals_unenhanced: true,
        methods: [
          { id: "standard_array", values: [2, 3, 4, 5, 6], each_value_once: true },
          { id: "leave_it_to_chance", roll: { die: 6, reroll: [1] }, order: STATS.map((d) => d.key), locked_order: true },
        ],
        validations: [
          {
            id: "attack_spell_intelligence",
            when: "combat_approach == attack_spell",
            min_enhanced_int: ATTACK_SPELL_REQUIREMENT.min_enhanced_int,
            on_failure: "revise_stats_within_method_or_change_combat_approach", // never alter dice silently
          },
        ],
      },
      { id: "evade", label: "Determine Evade", derived: ["evade"], editable: false },
      { id: "health", label: "Health", resource: "health", current_starts_at_max: true },
      {
        id: "mana_spells",
        label: "Mana & Starting Spells",
        resource: "mana",
        current_starts_at_max: true,
        auto_learned_spell: { id: "heal", rank: 1, optional_hotbar: true }, // ADD HEAL TO HOTLIST offered, skippable
      },
      { id: "movement", label: "Move & Step", derived: ["move", "step"] },
      {
        id: "favor_size",
        label: "AI Favor & Size",
        derived: ["ai_favor"],
        size: {
          scale: SIZE_SCALE,
          human: { value: 4, label: "Medium" }, // Human default
          animal: {
            // VERIFIED (Core Rulebook): normal starting Animal crawler Size is
            // 2 through 4. Tiny (1) and Large (5) remain on the full scale for
            // later use but are NOT selectable during standard First-Floor
            // Animal creation.
            options: [2, 3, 4],
            species_required: true,
            species_stored_separately: true,
            /* Verified normal rules Size per recognized species (normalized,
               case-insensitive, whitespace-trimmed key) — the Rules Profile
               value is authoritative. A mapping inside `options` is offered
               as an overridable DEFAULT; a mapping OUTSIDE `options` (e.g.
               horse -> Large (5)) is a KNOWN normal size that is not
               permitted for standard starting creation — the wizard surfaces
               a GM/rules message and leaves Size unresolved, never silently
               substituting another size. */
            species_size_defaults: {
              cat: 2,
              raccoon: 2,
              dog: 3,
              boar: 3,
              chimpanzee: 4,
              wolf: 4,
              horse: 5,
            },
          },
        },
      },
      {
        id: "narrative",
        label: "Past Trauma / Loose End / Regret",
        fields: [{ id: "past_trauma" }, { id: "loose_end" }, { id: "regret" }], // free text; official choose/roll later
      },
      {
        id: "starting_gear",
        label: "Starting Gear",
        grants: { clothing: true, weapon: "if applicable", interesting_item: true, weird_or_personal_items: true },
        /* Choices may require GM approval based on what reasonably makes
           sense — the app enforces no fixed equipment catalog. */
        gm_approval: true,
        /* Skill knowledge and physical possession are separate: a crawler
           may know the weapon Skill yet enter the dungeon unarmed. */
        primary_weapon_possession_optional: true,
        useful_item: { examples: USEFUL_ITEM_EXAMPLES, hotlist_intent_allowed: true },
        weird_stuff: { max_entries_ui: 4 }, // APP UX limit only, not a game-rule claim
        /* The useful item may be a secondary weapon ONLY when the crawler
           already knows a matching weapon Skill from a background — no new
           Skill is granted, no new mechanics are invented. */
        secondary_weapon: { permitted: true, requires_known_skill_category: "weapon" },
        example_loadouts: STARTING_GEAR_EXAMPLES,
      },
      { id: "review", label: "Review & Create" },
    ],
  },

  spells: {
    known_spells: true, // canonical known-spell list, separate from hotbar placement
    /* Heal — every crawler knows it automatically; Hotlist placement is the
       only choice. Rank 1 is its cap (MAX). */
    starting_spell: {
      id: "heal",
      rank: 1,
      rank_is_max: true,
      mana_cost: 2,
      heals_slots: 2, // restores 2 Health Bar slots
      range: "Self Only",
      interrupt: true,
      desc: "Restore 2 Health Bar slots to yourself as an Interrupt.",
      auto_learned: true,
      optional_hotbar: true, // ADD HEAL TO HOTLIST offered, skippable
    },
    starting_attack_spells: STARTING_ATTACK_SPELLS,
    hotbar: { slots: 10 }, // existing Hotbar (placement only)
    sheet_table: { rows: 4 }, // existing sheet Spells table (freely editable display)
  },

  gear: {
    slots: [ // matches the existing Armor/Equipment sheet section exactly
      { id: "head", label: "Head" },
      { id: "chest", label: "Chest" },
      { id: "hands", label: "Hands" },
      { id: "legs", label: "Legs" },
      { id: "feet", label: "Feet" },
      { id: "mainHand", label: "Main Hand" },
      { id: "offHand", label: "Off Hand" },
      { id: "other", label: "Other" },
    ],
    weapons: { categories: WEAPON_CATEGORIES, custom_weapon: CUSTOM_WEAPON_MODEL },
  },

  /* Currency — data-driven, never hard-coded in features. The sheet's
     Money Pouch and Vault render exactly these currencies. `weight` is
     the relative value used to derive the pouch fullness stage from the
     stored amounts, and pouch.capacity is the weighted unit total at
     which the pouch reads Full (beyond it, Overfilled). Future profiles
     define their own currencies (credits, tokens, anything) through this
     same optional section — features render whatever it defines. */
  currency: {
    /* Highest to lowest — the Vault renders exactly this order. All five
       are REAL stored currency fields (editable amounts in the Vault,
       included in the pouch fullness derivation), not decorative labels.
       `weight` is each coin's conversion ratio into the profile's base
       unit (Copper here): 1 Platinum = 1,000 cp = 10 Gold; 1 Electrum =
       50 cp = 0.5 Gold; 1 Gold = 100 cp = 10 Silver; 1 Silver = 10 cp.
       Conversion ratios are PROFILE data — future systems may define
       completely different currencies. */
    currencies: [
      { id: "platinum", label: "Platinum", weight: 1000 },
      { id: "electrum", label: "Electrum", weight: 50 },
      { id: "gold", label: "Gold", weight: 100 },
      { id: "silver", label: "Silver", weight: 10 },
      { id: "copper", label: "Copper", weight: 1 },
    ],
    /* Pouch fullness thresholds — PROFILE data, in normalized base-unit
       (Copper; 100 cp = 1 GP) totals, ascending upper bounds for the
       growing stages. In GP equivalents for this profile:
       0 GP = EMPTY · 1–9.99 GP = A START · 10–49.99 GP = GETTING THERE ·
       50–249.99 GP = HALFWAY · 250–999.99 GP = HEALTHY ·
       1,000–4,999.99 GP = FULL · 5,000+ GP = OVERFILLED.
       `capacity` remains only as the legacy fallback bound for profiles
       that define no thresholds. */
    pouch: {
      capacity: 500000,
      stageThresholds: [999, 4999, 24999, 99999, 499999],
    },
  },

  advancement: {
    stages: {
      starting: { id: "starting" },
      // Third-Floor mechanics (skill rolls, six Tutorial Experiences + loot,
      // 27-point distribution, Favor, Popularity, Race/Class) await Data Block 2.
      third_floor: { id: "third_floor", status: "pending_data_block_2" },
    },
  },
});