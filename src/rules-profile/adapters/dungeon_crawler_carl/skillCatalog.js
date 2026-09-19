/* Canonical shared Skill catalog — dungeon_crawler_carl.
   Mechanics, identifiers, and concise labels only (no rulebook prose).

   ONE definition per skill; background tables and every other grant source
   reference these ids. Canonical stats per official rulings:
   - Escape Artist = Dexterity (Gig Worker's (Str) entry is a source typo)
   - Performance  = Charisma  (Teacher's (Int) entry is a source typo)
   Check types are pending official data (check_type: null) — never invented.

   Categories: general | attack | damage_effect | weapon | spell
   Damage Effect relationships: attack skills declare allowed_damage_effects;
   damage effects declare linked_attack_skill (both are ranked skills —
   later Race/Class/item effects can raise Damage Effect ranks).
*/

const s = (id, name, stat = null, category = "general", extra = {}) => ({
  id,
  name,
  stat,
  check_type: null,
  category,
  ...extra,
});

export const SKILL_CATALOG = Object.fromEntries(
  [
    // General skills (all grant sources share these definitions)
    s("aiming", "Aiming", "dex"),
    s("ambush", "Ambush", "int"),
    s("animal_handling", "Animal Handling", "cha"),
    s("back_claw", "Back Claw", "str"),
    s("catcher", "Catcher", null),
    s("chopper_pilot", "Chopper Pilot", "dex"),
    s("climbing", "Climbing", "str"),
    s("deception", "Deception", "cha"),
    s("detect_lies", "Detect Lies", "int"),
    s("determine_value", "Determine Value", null),
    s("dodge", "Dodge", null),
    s("dumpster_diving", "Dumpster Diving", "int"),
    s("driving", "Driving", "dex"),
    s("endurance", "Endurance", "con"),
    s("engineering", "Engineering", "int"),
    s("escape_artist", "Escape Artist", "dex"),
    s("fabricate", "Fabricate", "int"),
    s("first_aid", "First Aid", "int"),
    s("good_first_impression", "Good First Impression", "cha"),
    s("hide_in_shadows", "Hide in Shadows", "dex"),
    s("intimidate", "Intimidate", "str"),
    s("investigation", "Investigation", "int"),
    s("jumping", "Jumping", "str"),
    s("light_on_your_feet", "Light on Your Feet", "dex"),
    s("negotiation", "Negotiation", "cha"),
    s("perception", "Perception", "int"),
    s("performance", "Performance", "cha"),
    s("persuasion", "Persuasion", "cha"),
    s("repair", "Repair", "int"),
    s("running", "Running", "dex"),
    s("salvage", "Salvage", "int"),
    s("sleight_of_hand", "Sleight of Hand", "dex"),
    s("stealth", "Stealth", "dex"),
    s("streetwise", "Streetwise", "cha"),
    s("survival", "Survival", "con"),
    s("swimming", "Swimming", "str"),
    s("tactics", "Tactics", "int"),
    s("taunt", "Taunt", "cha"),
    s("throwing", "Throwing", "str"),
    s("tracking", "Tracking", "int"),

    // Attack skills
    /* attack_stat = the TO-HIT stat for the canonical attack row —
       source-verified by the First Floor pregen tables (every human
       pregen's Unarmed Combat attacks with STR; Princess Donut's Slice
       Attack with DEX). The skill CHECK stat (first null above) stays
       exactly as the rulings define it. */
    s("unarmed_combat", "Unarmed Combat", null, "attack", {
      attack_stat: "str",
      /* Baseline damage — source-verified by the First Floor pregen
         tables (Carl: 1d4 + STR Mod, Bludgeoning): stored STRUCTURALLY
         so the live STR Mod is rendered/rolled, never frozen. */
      damage: { dice: "1d4", plus_mod_stat: "str" },
      damage_type: "Bludgeoning",
    }),
    s("slice_attack", "Slice Attack", null, "attack", {
      attack_stat: "dex",
      damage: { dice: "1d4", plus_mod_stat: "str" },
      damage_type: "Slashing",
    }),
    s("pugilism", "Pugilism", "dex", "attack", { allowed_damage_effects: ["iron_punch"] }),
    s("foot_soldier", "Foot Soldier", null, "attack", { allowed_damage_effects: ["smush"] }),
    s("noggin_nocker", "Noggin Nocker", null, "attack", { allowed_damage_effects: ["skullcracker"] }),
    s("wrasslin", "Wrasslin'", null, "attack", { allowed_damage_effects: ["toss"] }),

    // Damage Effect skills — ranked skills linked to their attack skill
    s("iron_punch", "Iron Punch", null, "damage_effect", { linked_attack_skill: "pugilism" }),
    s("smush", "Smush", null, "damage_effect", { linked_attack_skill: "foot_soldier" }),
    s("skullcracker", "Skullcracker", null, "damage_effect", { linked_attack_skill: "noggin_nocker" }),
    s("toss", "Toss", null, "damage_effect", { linked_attack_skill: "wrasslin" }),

    // Weapon skills (stat known only where the supplied tables state it)
    s("club", "Club", null, "weapon"),
    s("improvised_weapons", "Improvised Weapons", null, "weapon"),
    s("warhammer", "Warhammer", null, "weapon"),
    s("axe", "Axe", null, "weapon"),
    s("dagger", "Dagger", "dex", "weapon"),
    s("longsword", "Longsword", null, "weapon"),
    s("rapier", "Rapier", null, "weapon"),
    s("bow", "Bow", null, "weapon"),
    s("crossbow", "Crossbow", null, "weapon"),
    /* display_name is PLAYER-FACING TEXT ONLY — the stored mechanical Skill
       id/name remains Handgun. */
    s("handgun", "Handgun", "dex", "weapon", { display_name: "Handgun — Pistol / Revolver" }),
    s("shotgun", "Shotgun", "dex", "weapon"),
    s("javelin", "Javelin", null, "weapon"),
    s("shuriken", "Shuriken", null, "weapon"),
    s("slingshot", "Slingshot", null, "weapon"),
    s("herding_weapons", "Herding Weapons", null, "weapon"),
    s("lance", "Lance", null, "weapon"),
    s("polearm", "Polearm", null, "weapon"),
    s("quarterstaff", "Quarterstaff", null, "weapon"),

    // Spells
    s("heal", "Heal", null, "spell"),
    s("dirt_clod", "Dirt Clod", null, "spell", { attack_spell: true }),
    s("fire_fingers", "Fire Fingers", null, "spell", { attack_spell: true }),
    s("frost_scar", "Frost Scar", null, "spell", { attack_spell: true }),
    s("mind_tickle", "Mind Tickle", null, "spell", { attack_spell: true }),
    s("shock_treatment", "Shock Treatment", null, "spell", { attack_spell: true }),
    s("soul_collector", "Soul Collector", null, "spell", { attack_spell: true }),
    s("vine_porn", "Vine Porn", null, "spell", { attack_spell: true }),
  ].map((skill) => [skill.id, skill]),
);