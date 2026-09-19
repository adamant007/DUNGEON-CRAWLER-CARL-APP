/* Starting combat data — dungeon_crawler_carl.
   Mechanics and concise identifiers only (no rulebook prose). */

/* Baseline attack by crawler type — VERIFIED Core Rulebook rule, granted at
   Rank 3, populates Skills AND Attacks:
   - Human crawlers start with Unarmed Combat — Rank 3
   - Animal crawlers start with Slice Attack — Rank 3
   DCCarl-profile rule only — never a universal Ginger Dragon rule. */
export const BASELINE_ATTACKS = { human: "unarmed_combat", animal: "slice_attack" };
export const BASELINE_ATTACK_RANK = 3;

/* Weapon categories — a weapon chosen as the second combat background Skill
   begins at Rank 3. */
export const WEAPON_CATEGORIES = [
  { id: "bashing", label: "Bashing", weaponIds: ["club", "improvised_weapons", "warhammer"] },
  { id: "edged", label: "Edged", weaponIds: ["axe", "dagger", "longsword", "rapier"] },
  { id: "ranged", label: "Ranged", weaponIds: ["bow", "crossbow", "handgun", "shotgun", "javelin", "shuriken", "slingshot"] },
  { id: "reach", label: "Reach", weaponIds: ["herding_weapons", "lance", "polearm", "quarterstaff"] },
];

/* Custom weapons map a player-chosen display name onto one official weapon
   category's mechanics — no invented mechanics for custom weapons. */
export const CUSTOM_WEAPON_MODEL = {
  displayName: true,
  mechanicalWeaponId: true,
};

/* Verified starting weapon stat blocks — keyed by the canonical weapon Skill
   id (matches WEAPON_CATEGORIES). Short Ginger Dragon summaries, no rulebook
   prose. Damage is stored STRUCTURALLY (dice + which Stat Mod) so consumers
   render the LIVE modifier and recalculate when stats change — never a frozen
   summed number. `limitations` are the player-facing starting-display rules;
   `ai_favor` is the weapon's AI Favor rating where the rules define one. */
export const WEAPON_DETAILS = {
  club: { attack_stat: "str", range: "Melee / 5 ft", damage: { dice: "1d6", plus_mod_stat: "str" }, damage_type: "Bludgeoning", desc: "A simple heavy striking weapon that hits hard up close." },
  improvised_weapons: { attack_stat: "str", range: "Melee / 5 ft", damage: { dice: "1d4", plus_mod_stat: "str" }, damage_type: "Bludgeoning", limitations: ["Object must weigh at least 1 lb and no more than the crawler's STR score in pounds"], desc: "Turn a suitable everyday object into a blunt weapon." },
  warhammer: { attack_stat: "str", range: "Melee / 5 ft", damage: { dice: "1d10", plus_mod_stat: "str" }, damage_type: "Bludgeoning", limitations: ["Requires two hands"], desc: "A heavy two-handed hammer with strong melee damage." },
  axe: { attack_stat: "str", range: "Melee / 5 ft", damage: { dice: "1d6", plus_mod_stat: "str" }, damage_type: "Slashing", desc: "A chopping melee weapon powered by Strength." },
  dagger: { attack_stat: "dex", range: "Melee / 5 ft", damage: { dice: "1d4", plus_mod_stat: "str" }, damage_type: "Piercing", ai_favor: 1, desc: "A fast close-range blade using Dexterity to hit." },
  longsword: { attack_stat: "str", range: "Melee / 5 ft", damage: { dice: "1d8", plus_mod_stat: "str" }, damage_type: "Slashing", desc: "A balanced melee blade with solid slashing damage." },
  rapier: { attack_stat: "dex", range: "Melee / 5 ft", damage: { dice: "1d6", plus_mod_stat: "dex" }, damage_type: "Piercing", desc: "A precise finesse weapon using Dexterity for both accuracy and damage." },
  bow: { attack_stat: "dex", range: "100 ft", damage: { dice: "1d6", plus_mod_stat: "str" }, damage_type: "Piercing", limitations: ["Requires two hands", "Ammunition required"], desc: "A long-range projectile weapon using Dexterity to hit and Strength for damage." },
  crossbow: { attack_stat: "dex", range: "50 ft", damage: { dice: "1d8" }, damage_type: "Piercing", limitations: ["Requires two hands", "Ammunition required", "Cooldown: once per round"], desc: "A powerful ranged weapon with strong damage but slower firing." },
  handgun: { attack_stat: "dex", range: "150 ft", damage: { dice: "1d8" }, damage_type: "Piercing", limitations: ["Ammunition required", "Reload: spend one Action after a Major Fail or worse"], desc: "A long-range firearm using Dexterity to hit." },
  shotgun: { attack_stat: "dex", range: "30 ft", damage: { dice: "1d10" }, damage_type: "Piercing", limitations: ["Requires two hands", "Ammunition required", "Reload: spend one Action after a Major Fail or worse"], desc: "A short-range firearm with heavy piercing damage." },
  javelin: { attack_stat: "dex", range: "40 ft", damage: { dice: "1d8", plus_mod_stat: "str" }, damage_type: "Piercing", desc: "A thrown spear using Dexterity to hit and Strength for damage." },
  shuriken: { attack_stat: "dex", range: "30 ft", damage: { dice: "1d4", plus_mod_stat: "str" }, damage_type: "Piercing", ai_favor: 1, desc: "A small thrown blade that rewards accurate ranged attacks." },
  slingshot: { attack_stat: "dex", range: "30 ft", damage: { dice: "1d2", plus_mod_stat: "str" }, damage_type: "Bludgeoning", ai_favor: 2, limitations: ["Requires two hands"], desc: "A simple ranged weapon with light bludgeoning damage." },
  herding_weapons: { attack_stat: "str", range: "10 ft", damage: { dice: "1d4", plus_mod_stat: "str" }, damage_type: "Bludgeoning", ai_favor: 1, limitations: ["Requires two hands"], desc: "A long-handled herding weapon that can strike from reach." },
  lance: { attack_stat: "str", range: "10 ft", damage: { dice: "1d12", plus_mod_stat: "str" }, damage_type: "Piercing", limitations: ["Must be mounted to use", "Cannot be used with Attack of Opportunity or Zone of Control"], desc: "A devastating mounted reach weapon." },
  polearm: { attack_stat: "str", range: "10 ft", damage: { dice: "1d8", plus_mod_stat: "str" }, damage_type: "Piercing", limitations: ["Requires two hands"], desc: "A two-handed reach weapon for controlling space around you." },
  quarterstaff: { attack_stat: "str", range: "10 ft", damage: { dice: "1d6", plus_mod_stat: "str" }, damage_type: "Bludgeoning", limitations: ["Requires two hands"], desc: "A versatile two-handed staff with extended melee reach." },
};

/* Hand-to-Hand option — each pair is TWO linked canonical skills:
   an Attack Skill plus its Damage Effect Skill (both ranked, upgradable later
   by Race/Class/item effects). The selected Attack Skill begins at Rank 3. */
export const HAND_TO_HAND_PAIRS = [
  { attackSkillId: "pugilism", damageEffectId: "iron_punch" },
  { attackSkillId: "foot_soldier", damageEffectId: "smush" },
  { attackSkillId: "noggin_nocker", damageEffectId: "skullcracker" },
  { attackSkillId: "wrasslin", damageEffectId: "toss" },
];

/* Starting Attack Spell option — instead of a weapon. Requires Enhanced
   Intelligence 4+ once stats are finalized (validated after the stats step;
   on failure the player revises stats or changes combat approach). If taken:
   the spell enters Skills at Rank 3, Attacks, known Spells, the Hotbar, and
   grants 5 Standard Mana Potions. */
export const STARTING_ATTACK_SPELLS = [
  "dirt_clod",
  "fire_fingers",
  "frost_scar",
  "mind_tickle",
  "shock_treatment",
  "soul_collector",
  "vine_porn",
];
export const ATTACK_SPELL_REQUIREMENT = { min_enhanced_int: 4 };
export const ATTACK_SPELL_GRANTS = {
  mana_potions: { item: "Standard Mana Potion", qty: 5 },
  to_skills: true,
  to_attacks: true,
  to_known_spells: true,
  to_hotbar: true,
};

/* Approved STARTING attack spell stat blocks — the three starter Attack
   Spells offered during creation (the full list above remains for later
   progression). Damage is stored STRUCTURALLY (dice + INT-mod flag) so
   consumers render the live formula against the current INT modifier —
   never a hardcoded summed number that goes stale when stats change. */
export const STARTING_SPELL_OPTIONS = ["dirt_clod", "fire_fingers", "frost_scar"];
export const STARTING_SPELL_DETAILS = {
  dirt_clod: { rank: 3, mana_cost: 1, range: "100 ft", damage: { dice: "1d2", plus_int_mod: true }, type: "Bludgeoning", desc: "Launch a magical clump of dirt at a distant target for light bludgeoning damage." },
  fire_fingers: { rank: 3, mana_cost: 3, range: "Melee", damage: { dice: "1d4", plus_int_mod: true }, type: "Fire", desc: "Strike a nearby target with a burst of flame from your hands." },
  frost_scar: { rank: 3, mana_cost: 2, range: "Melee", damage: { dice: "1d4", plus_int_mod: true }, type: "Ice", desc: "Slash a nearby target with freezing magic that deals ice damage." },
};