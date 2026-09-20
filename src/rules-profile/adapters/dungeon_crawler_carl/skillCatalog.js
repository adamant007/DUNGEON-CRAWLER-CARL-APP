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

const SKILL_DESCRIPTIONS = {
  aiming: "Use with a Ranged Attack: take Disadvantage, add your Aiming Ranks to the Attack Skill Check, and on a hit add bonus damage. Higher Ranks increase that bonus.",
  ambush: "Before combat, make an Intelligence-opposed check as a Mob approaches. On success, gain a surprise Action before combat; an unseen surprise Attack is made with Advantage.",
  animal_handling: "Use Charisma to calm, befriend, or guide animals. On success, the animal is friendly enough not to attack you.",
  back_claw: "Melee Strength attack. Base damage is 1d6 + Strength Slashing, with additional damage and a Blood Trail effect at higher Ranks.",
  catcher: "Passive Interrupt: when an adjacent ally would take damage from a direct attack, you can Step into position and take that damage instead. Higher Ranks grant Damage Resistance and eventually ignore attached Debuffs.",
  chopper_pilot: "Use Dexterity for risky motorcycle maneuvers such as racing, chasing, stunts, or avoiding a crash. Attacks made while piloting are at Disadvantage, and two-handed weapons cannot be used.",
  climbing: "Use Strength for dangerous climbing, racing, rappelling, or similar situations. Make periodic checks during risky climbs; attacking while climbing is at Disadvantage.",
  deception: "Use Charisma to tell a deliberate lie. On success, the target believes you; targets trained in Detect Lies make this harder.",
  detect_lies: "Use Intelligence when you suspect someone is lying. On success, you can tell whether the speaker believes what they are saying is true or false.",
  determine_value: "Passive. Lets you sort your Inventory by item value even though the exact gold value is hidden at low Ranks. Higher Ranks reveal more item-history and value information.",
  dodge: "Passive Evade improvement. Starts with a +1 Evade Buff; higher Ranks improve movement while Evading, defenses against ranged attacks and spells, and eventually let you Evade without spending an Action.",
  dumpster_diving: "Spend time searching a limited area of dungeon clutter. On success, find what you were looking for or another useful or interesting item. Higher Ranks make the search faster and more productive.",
  driving: "Use Dexterity for risky vehicle maneuvers, racing, chasing, or avoiding a wreck. Attacks while driving are at Disadvantage.",
  endurance: "Use Constitution to resist fatigue during long-distance travel, grinding, or other extended strenuous activity. On success, continue without gaining Fatigued.",
  engineering: "Use Intelligence to design and build mundane items involving moving parts, fluids, or chemicals from Misc. Junk. Does not cover vehicles or high-powered engines.",
  escape_artist: "Use Dexterity to escape bonds or the Held condition. Bonds use an Unopposed check; escaping a creature's hold is Strength-opposed.",
  fabricate: "Use Intelligence to craft mundane items from Misc. Junk when they do not require moving parts, fluids, or chemicals.",
  first_aid: "Give basic medical treatment to yourself or another creature. On success, restore 1 Health Bar slot, plus more for higher degrees of success. A patient cannot be treated again until after a rest.",
  good_first_impression: "Use Charisma on a non-hostile NPC or Mob to improve its initial attitude toward you. It does not work on crawlers, Bosses, Elites, or groups.",
  hide_in_shadows: "While still and heavily shadowed or out of sight, use Dexterity to avoid detection. On success, Mobs and crawler HUDs cannot see you until you act on another creature or leave cover.",
  intimidate: "Use Strength to frighten a target. On success, the target gains Staggered; higher Ranks can force retreat and add stronger Debuffs.",
  investigation: "Spend time examining an area or puzzle for clues. On success, learn something useful. It can also be used with Look for Clues more quickly.",
  jumping: "With a running start, use Strength to leap. On success, jump up to Rank + Strength feet horizontally; higher Ranks improve height, distance, and Evade.",
  light_on_your_feet: "Animal-only leaping Skill. With a running start, leap Rank x2 feet with height based on Dexterity; higher Ranks greatly increase distance and can become glide-like.",
  negotiation: "Use Charisma to haggle or reach a compromise. On success, shift a price about 10% in your favor or get the other side to tentatively accept reasonable terms.",
  perception: "Use Intelligence to focus your senses and notice details others might miss. Conditions such as range, clutter, lighting, and timing can change the Difficulty.",
  performance: "Use Charisma to entertain an audience through acting, music, dance, comedy, or another chosen performance type. On success, the audience is entertained.",
  persuasion: "Use Charisma and time to convince someone to follow a reasonable suggestion. Risky, costly, dangerous, or out-of-character requests are harder or may require higher Ranks.",
  repair: "Use Intelligence to repair broken or damaged simple items. Basic repairs take time; higher Ranks allow moving parts, faster repairs, and eventually rebuilding destroyed items.",
  running: "Use Dexterity for races, chases, escapes, and other short bursts of running. Extended endurance running uses Endurance instead.",
  salvage: "Use Intelligence to recover useful raw materials from deconstructed items or failed crafting. It cannot be used on explosive devices.",
  sleight_of_hand: "Use Dexterity to manipulate hand-sized objects without being noticed. You cannot access another character's Inventory or Hotlist.",
  stealth: "Start out of sight and use Dexterity to move or act without being noticed. Success before combat can grant a surprise Action; success outside combat lets you remain unseen while moving.",
  streetwise: "Use Charisma in populated areas to find or spread rumors, navigate criminal networks, locate illicit goods, avoid attention, or understand local power structures.",
  survival: "Use Constitution to endure dangerous or remote environments with limited food and water. On success, you avoid the hazards of the conditions.",
  swimming: "Use Strength when swimming is dangerous or consequential. Repeated checks are required during extended danger, and fatigue can build quickly.",
  tactics: "Once per combat, choose Attack, Damage, or Evade and make an Intelligence Tactics check. On success, you and your whole party gain +1 to checks in that discipline, increasing by +1 for each higher degree of success. Rank 5 can grant Advantage after 5 minutes of observation; Rank 10 improves Call a Play; Rank 15 applies the bonus to all three disciplines.",
  taunt: "Charisma Interrupt within 30 feet. After seeing where enemy attacks are going, make an opposed check; on success, redirect one attack to yourself, with higher success redirecting more.",
  throwing: "Throw objects up to your Strength in pounds out to Strength x10 feet. Use an Unopposed check to hit an area or an Attack Skill Check against Evade to hit a creature.",
  tracking: "Use Intelligence to find and follow tracks. Conditions affect Difficulty, and you normally recheck periodically to keep following the trail.",

  unarmed_combat: "Basic melee Strength attack known by every crawler. Deals 1d4 + Strength Bludgeoning, grants AI Favor 1, and cannot use a hand-to-hand Damage Effect.",
  slice_attack: "Melee Dexterity attack. Deals 1d4 + Strength Slashing and grants AI Favor 1; higher Ranks increase damage.",
  pugilism: "Dexterity-based punching Skill. Deals 1d2 + Strength Bludgeoning and can pair with approved hand-to-hand Damage Effects. Grants AI Favor when you fight without using a Damage Effect.",
  foot_soldier: "Strength-based hand-to-hand attack. Deals 1d4 + Strength Bludgeoning and can use approved Damage Effects such as Smush.",
  noggin_nocker: "Strength-based headbutt-style attack. Deals 1d4 + Constitution Bludgeoning, can use approved Damage Effects, and at low Rank costs you 1 Health Bar slot on a successful hit.",
  wrasslin: "Two-handed Strength attack that deals 1d4 + Strength Bludgeoning. On success the target becomes Held, and you can use approved Damage Effects such as Toss.",
  iron_punch: "Pugilism Damage Effect. Adds 1d2 base damage; higher Ranks add Rank damage and can Stun the target.",
  smush: "Foot Soldier Damage Effect usable on badly wounded targets. Starts at 20% Health Bar or less, once per round, and doubles total damage; higher Ranks raise the threshold and multiplier.",
  skullcracker: "Noggin Nocker Damage Effect. Against a same-size target, adds bonus base damage; higher Ranks add Rank damage and powerful Debuffs.",
  toss: "Wrasslin' Damage Effect. Adds 1d8 + Strength Bludgeoning, ends Held, and throws the target a distance based on Rank. Higher Ranks let you Toss larger foes.",

  club: "Melee Strength weapon. Deals 1d6 + Strength Bludgeoning; higher Ranks add damage and can inflict Woozy or Take Down.",
  improvised_weapons: "Use a suitably heavy object as a melee Strength weapon. Deals 1d4 + Strength Bludgeoning and grants AI Favor; higher Ranks let you throw it and improve damage.",
  warhammer: "Two-handed melee Strength weapon. Deals 1d10 + Strength Bludgeoning; higher Ranks increase damage and can knock targets back.",
  axe: "Melee Strength weapon. Deals 1d6 + Strength Slashing; higher Ranks can grant an extra attack and eventually sever a limb on a very strong success.",
  dagger: "Melee Dexterity weapon. Deals 1d4 + Strength Piercing and grants AI Favor; higher Ranks add armor-piercing, throwing, and back-attack benefits.",
  longsword: "Melee Strength weapon. Deals 1d8 + Strength Slashing; higher Ranks increase damage and eventually grant an Evade Buff.",
  rapier: "Melee Dexterity weapon. Deals 1d6 + Dexterity Piercing; higher Ranks increase damage and grant Evade bonuses.",
  bow: "Two-handed ranged Dexterity weapon with 100-foot range and ammunition requirement. Deals 1d6 + Strength Piercing.",
  crossbow: "Two-handed ranged Dexterity weapon with 50-foot range, ammunition, and once-per-round cooldown. Deals 1d8 Piercing.",
  handgun: "Ranged Dexterity weapon with 150-foot range. Uses ammunition; a Major Fail or worse requires an Action to reload. Deals 1d8 Piercing.",
  shotgun: "Two-handed ranged Dexterity weapon with 30-foot range and ammunition. A Major Fail or worse requires an Action to reload. Deals 1d10 Piercing.",
  javelin: "Ranged Dexterity weapon with 40-foot range. Deals 1d8 + Strength Piercing; higher Ranks add damage and armor-piercing.",
  shuriken: "Ranged Dexterity weapon with 30-foot range. Deals 1d4 + Strength Piercing and grants AI Favor; higher Ranks improve range and can grant extra attacks.",
  slingshot: "Two-handed ranged Dexterity weapon with 30-foot range. Deals 1d2 + Strength Bludgeoning and grants AI Favor 2; higher Ranks improve damage and range.",
  herding_weapons: "Two-handed 10-foot reach Strength weapon. Deals 1d4 + Strength Bludgeoning and grants AI Favor; higher Ranks add forced movement, a sling option, and Take Down.",
  lance: "Mounted-only 10-foot reach Strength weapon. Deals 1d12 + Strength Piercing and cannot be used with Attack of Opportunity or Zone of Control.",
  polearm: "Two-handed 10-foot reach Strength weapon. Deals 1d8 + Strength Piercing; higher Ranks also improve Zone of Control.",
  quarterstaff: "Two-handed 10-foot reach Strength weapon. Deals 1d6 + Strength Bludgeoning; higher Ranks add damage and Evade bonuses.",

  heal: "Self-only Interrupt spell. Costs 2 Mana, restores 2 Health Bar slots, and is capped at Rank 1.",
  dirt_clod: "100-foot Bludgeoning attack spell. Costs 1 Mana, deals 1d2 + Intelligence damage, and grants AI Favor 2.",
  fire_fingers: "Melee Fire attack spell. Costs 3 Mana, deals 1d4 + Intelligence Fire damage, and grants AI Favor 1.",
  frost_scar: "Melee Ice attack spell. Costs 2 Mana, deals 1d4 + Intelligence Ice damage, and grants AI Favor 1; higher Ranks interfere with healing and add Debuffs.",
  mind_tickle: "40-foot Charisma-based Psychic attack spell. Costs 2 Mana, deals 1d2 + Charisma Psychic damage, and grants AI Favor 2.",
  shock_treatment: "30-foot Electric attack spell. Costs 2 Mana, deals 1d2 + Intelligence Electric damage, and grants AI Favor 2; higher Ranks can Stun and greatly boost close-range damage.",
  soul_collector: "50-foot Necrotic attack spell. Costs 4 Mana, deals 1d4 + Intelligence Necrotic damage, and grants AI Favor 1. At higher Ranks, killing blows can build a temporary damage bonus.",
  vine_porn: "20-foot Constitution-based Piercing attack spell. Costs 3 Mana, deals 1d4 + Constitution Piercing damage, and grants AI Favor 1; higher Ranks add armor-piercing and stronger critical damage.",
  explosives_handling: "Use Intelligence to safely handle standard explosives. Higher Ranks identify explosive materials and eventually allow crafting explosives with the proper materials and workstation.",
  goblin_explosives: "Use Intelligence to handle dangerously unstable Goblin explosives. Critical failures are easier to trigger at low Rank; higher Ranks make them safer and eventually allow crafting.",
  improvised_explosive_device: "Use Intelligence to turn explosive material into bombs or traps without a Sapper's Table. Crafting still requires safe Explosives Handling; higher Ranks speed crafting and improve devices.",
  lockpicking: "Use Dexterity to pick locks. Proper tools matter; without them most locks impose Disadvantage. Higher Ranks make attempts quieter, faster, and less tool-dependent.",
  magic_missile: "Force attack spell with line-of-sight range. Costs 5 Mana, deals 1d4 + Intelligence Force damage, and grants AI Favor 1; higher Ranks add damage and flexible Mana options.",
  powerful_strike: "Hand-to-hand Damage Effect for Foot Soldier, Noggin Nocker, or Pugilism. Multiply the base damage dice result by this Skill's Rank before adding modifiers; it has a long cooldown that shrinks at higher Ranks.",
  maul: "Two-handed melee Strength weapon used by the pregen. Deals 1d10 + Strength Bludgeoning.",
  spear: "Two-handed melee Strength reach weapon used by the pregen. Has 10-foot range and deals 1d8 + Strength Piercing.",
};

const s = (id, name, stat = null, category = "general", extra = {}) => ({
  id,
  name,
  stat,
  check_type: null,
  category,
  description: SKILL_DESCRIPTIONS[id] ?? "",
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
    s("driving", "Driving", "dex", "general", { aliases: ["Drive"] }),
    s("endurance", "Endurance", "con"),
    s("engineering", "Engineering", "int"),
    s("escape_artist", "Escape Artist", "dex"),
    s("explosives_handling", "Explosives Handling", "int"),
    s("goblin_explosives", "Goblin Explosives", "int"),
    s("improvised_explosive_device", "Improvised Explosive Device", "int"),
    s("lockpicking", "Lockpicking", "dex"),
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
    s("powerful_strike", "Powerful Strike", null, "damage_effect"),
    s("smush", "Smush", null, "damage_effect", { linked_attack_skill: "foot_soldier" }),
    s("skullcracker", "Skullcracker", null, "damage_effect", { linked_attack_skill: "noggin_nocker" }),
    s("toss", "Toss", null, "damage_effect", { linked_attack_skill: "wrasslin" }),

    // Weapon skills (stat known only where the supplied tables state it)
    s("club", "Club", null, "weapon"),
    s("improvised_weapons", "Improvised Weapons", null, "weapon"),
    s("warhammer", "Warhammer", null, "weapon"),
    s("maul", "Maul", "str", "weapon"),
    s("spear", "Spear", "str", "weapon"),
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
    s("magic_missile", "Magic Missile", null, "spell", { attack_spell: true }),
    s("shock_treatment", "Shock Treatment", null, "spell", { attack_spell: true }),
    s("soul_collector", "Soul Collector", null, "spell", { attack_spell: true }),
    s("vine_porn", "Vine Porn", null, "spell", { attack_spell: true }),
  ].map((skill) => [skill.id, skill]),
);