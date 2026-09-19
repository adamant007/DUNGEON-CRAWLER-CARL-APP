/* FIRST FLOOR pregenerated character templates — Dungeon Crawler Carl.
   PRIVATE TEST DATA for the authenticated playtest only. This is NOT a
   publicly licensed content package — do not expose it outside the app.

   These objects are TEMPLATES, not Character records. No canonical
   Character is created or saved from this module; the later Create My
   Character action will COPY one of these templates into the existing
   canonical Character entity. Template data is intentionally separate
   from the Rules Profile architecture.

   FIRST FLOOR ONLY — Second Floor stats, bonuses, equipment, or
   advancement data must never be added here. */

export const PREGEN_SYSTEM_KEY = "dungeon_crawler_carl";
export const PREGEN_TEMPLATE_TYPE = "pregen/private_test";

const stat = (enhanced, unenhanced, mod) => ({ enhanced, unenhanced, mod });

const skill = (name, rank, statLabel, mod, check, note) => ({
  name,
  rank,
  stat: statLabel,
  mod: mod ?? "",
  check,
  ...(note ? { note } : {}),
});

const attack = (a) => ({
  name: a.name,
  rank: a.rank,
  attackStat: a.attackStat ?? null,
  attackStatMod: a.attackStatMod ?? "",
  toHit: a.toHit ?? "",
  damage: a.damage ?? "",
  damageStat: a.damageStat ?? null,
  damageType: a.damageType ?? "",
  range: a.range ?? null,
  notes: a.notes ?? null,
  type: a.type ?? null,
});

const healSpellHotlist = [
  { name: "Heal Spell", detail: "Rank 1 max, Mana Cost 2, heals 2 Health Bar slots" },
  { name: "2 Healing Potions", detail: "heal 5 Health Bar slots" },
];

export const FIRST_FLOOR_PREGENS = [
  {
    id: "dcc_ff_brandon",
    systemKey: PREGEN_SYSTEM_KEY,
    templateType: PREGEN_TEMPLATE_TYPE,
    floor: 1,
    identity: {
      name: "Brandon",
      race: "Human",
      pronouns: "He/Him",
      level: 1,
      crawlerNumber: 12330671,
      className: "Not Yet Assigned",
      size: "Medium (4)",
      aiFavor: 1,
      popularity: 0,
    },
    stats: {
      str: stat(6, 6, "+3"),
      int: stat(2, 2, "+1"),
      con: stat(5, 5, "+2"),
      dex: stat(4, 4, "+2"),
      cha: stat(3, 3, "+2"),
    },
    derived: {
      health: 20,
      healthBarSlotValue: 2,
      maxMana: 2,
      currentMana: 2,
      evade: 2,
      damageResistance: 0,
      move: 20,
      step: 10,
    },
    attacks: [
      attack({
        name: "Maul", rank: 3, attackStat: "STR", attackStatMod: "+3", toHit: "+6",
        damage: "1d10 +3", damageType: "Bludgeoning",
        notes: "Requires two hands to wield",
      }),
      attack({
        name: "Unarmed Combat", rank: 3, attackStat: "STR", attackStatMod: "+3", toHit: "+6",
        damage: "1d4 +3", damageType: "Bludgeoning",
      }),
    ],
    skills: [
      skill("Maul", 3, "STR", "+3", "Evade"),
      skill("Unarmed Combat", 3, "STR", "+3", "Evade"),
      skill("Catcher", 2, null, "", "Passive"),
      skill("Repair", 3, "INT", "+1", "Unopposed"),
      skill("Engineering", 3, "INT", "+1", "Unopposed"),
      skill("Climbing", 1, "STR", "+3", "Unopposed"),
      skill("Drive", 1, "DEX", "+2", "Unopposed"),
      skill("Intimidate", 1, "STR", "+3", "CHA-Opposed"),
      skill("Fabricate", 2, "INT", "+1", "Unopposed"),
      skill("Lockpicking", 1, "DEX", "+2", "Unopposed"),
    ],
    hotlist: healSpellHotlist,
    gear: [
      { slot: "Torso", item: "Work Shirt" },
      { slot: "Hands/Holding", item: "Maul (both hands)" },
      { slot: "Legs", item: "Work Pants" },
      { slot: "Feet", item: "Work Boots" },
    ],
    inventory: [],
    storyHooks: {
      pastTrauma: "I can\u2019t believe I had to defend my brother Chris from our own mother\u2019s disrespect for him",
      looseEnd: "I wanted to finish technical school, but it was hard, and I was broke",
      regret: "I hold onto slights for too long and let them get in the way of telling people how much they mean to me",
    },
  },

  {
    id: "dcc_ff_carl",
    systemKey: PREGEN_SYSTEM_KEY,
    templateType: PREGEN_TEMPLATE_TYPE,
    floor: 1,
    identity: {
      name: "Carl",
      race: "Human",
      pronouns: "He/Him",
      level: 1,
      crawlerNumber: 4122,
      className: "Not Yet Assigned",
      size: "Medium (4)",
      aiFavor: 1,
      popularity: 0,
    },
    stats: {
      str: stat(6, 6, "+3"),
      int: stat(3, 3, "+2"),
      con: stat(5, 5, "+2"),
      dex: stat(5, 5, "+2"),
      cha: stat(4, 4, "+2"),
    },
    derived: {
      health: 20,
      healthBarSlotValue: 2,
      maxMana: 3,
      currentMana: 3,
      evade: 2,
      damageResistance: 1,
      move: 20,
      step: 10,
    },
    attacks: [
      attack({
        name: "Pugilism", rank: 4, attackStat: "DEX", attackStatMod: "+2", toHit: "+6",
        damage: "1d2 +3", damageStat: "STR", damageType: "Bludgeoning",
        notes: "Add Iron Punch or Powerful Strike",
      }),
      attack({
        name: "Unarmed Combat", rank: 3, attackStat: "STR", attackStatMod: "+3", toHit: "+6",
        damage: "1d4 +3", damageType: "Bludgeoning",
        notes: "Does not use Damage Effects",
      }),
      attack({
        name: "Iron Punch", rank: 3, type: "Passive Damage Effect",
        notes: "Add 1d2 damage",
      }),
      attack({
        name: "Powerful Strike", rank: 3, type: "Passive Damage Effect",
        notes: "Multiply base damage dice by Rank in this skill; Cooldown 30 hours",
      }),
    ],
    skills: [
      skill("Pugilism", 4, "DEX", "+2", "Evade"),
      skill("Unarmed Combat", 3, "STR", "+3", "Evade"),
      skill("Iron Punch", 3, null, "", "Passive"),
      skill("Powerful Strike", 3, null, "", "Passive"),
      skill("Explosives Handling", 1, "INT", "+2", "Unopposed"),
      skill("Goblin Explosives", 1, "INT", "+2", "Unopposed"),
      skill("Improvised Explosive Device", 3, "INT", "+2", "Unopposed"),
      skill("Chopper Pilot", 1, "DEX", "+2", "Unopposed"),
      skill("Swimming", 2, "STR", "+3", "Unopposed"),
    ],
    hotlist: healSpellHotlist,
    gear: [
      { slot: "Torso", item: "Leather Jacket — Damage Resistance 1" },
      { slot: "Legs", item: "Boxer Shorts" },
      { slot: "Feet", item: "Beatrice\u2019s Pink Crocs" },
    ],
    inventory: [
      { item: "Half pack of cigarettes", qty: "x1" },
      { item: "Lighter", qty: "x1" },
    ],
    storyHooks: {
      pastTrauma: "My mother and father abandoned me",
      looseEnd: "I feel like I have no home or family",
      regret: "Not breaking up with my toxic, cheating, and manipulative girlfriend before the collapse",
    },
  },

  {
    id: "dcc_ff_chris",
    systemKey: PREGEN_SYSTEM_KEY,
    templateType: PREGEN_TEMPLATE_TYPE,
    floor: 1,
    identity: {
      name: "Chris",
      race: "Human",
      pronouns: "He/Him",
      level: 1,
      crawlerNumber: 324116,
      className: "Not Yet Assigned",
      size: "Medium (4)",
      aiFavor: 1,
      popularity: 0,
    },
    stats: {
      str: stat(4, 4, "+2"),
      int: stat(6, 6, "+3"),
      con: stat(3, 3, "+2"),
      dex: stat(5, 5, "+2"),
      cha: stat(2, 2, "+1"),
    },
    derived: {
      health: 20,
      healthBarSlotValue: 2,
      maxMana: 6,
      currentMana: 6,
      evade: 2,
      damageResistance: 1,
      move: 20,
      step: 10,
    },
    attacks: [
      attack({
        name: "Spear", rank: 3, attackStat: "STR", attackStatMod: "+2", toHit: "+5",
        damage: "1d8 +2", damageType: "Piercing", range: "10 feet",
        notes: "Requires two hands to wield; Reach",
      }),
      attack({
        name: "Unarmed Combat", rank: 3, attackStat: "STR", attackStatMod: "+2", toHit: "+5",
        damage: "1d4 +2", damageType: "Bludgeoning",
      }),
    ],
    skills: [
      skill("Spear", 3, "STR", "+2", "Evade"),
      skill("Unarmed Combat", 3, "STR", "+2", "Evade"),
      skill("Negotiation", 1, "CHA", "+1", "INT-Opposed"),
      skill("Engineering", 3, "INT", "+3", "Unopposed"),
      skill("Repair", 3, "INT", "+3", "Unopposed"),
      skill("Investigation", 1, "INT", "+3", "Unopposed"),
      skill("Perception", 1, "INT", "+3", "Unopposed"),
      skill("Fabricate", 2, "INT", "+3", "Unopposed"),
      skill("Running", 1, "DEX", "+2", "Unopposed"),
      skill("Ambush", 2, "INT", "+3", "INT-Opposed"),
    ],
    hotlist: healSpellHotlist,
    gear: [
      { slot: "Head", item: "Metal Skullcap — Damage Resistance 1" },
      { slot: "Torso", item: "Blue Shirt" },
      { slot: "Hands/Holding", item: "Spear (both hands)" },
      { slot: "Legs", item: "Work Pants" },
      { slot: "Feet", item: "Work Boots" },
    ],
    inventory: [],
    storyHooks: {
      pastTrauma: "My mother treated me like I had a defect because I rarely talked",
      looseEnd: "I wanted to leave Wenatchee, but I hesitated, as I didn\u2019t want to leave Brandon behind",
      regret: "I should have stood up to the teachers at my \u201cspecial\u201d school when they disrespected the students",
    },
  },

  {
    id: "dcc_ff_donut",
    systemKey: PREGEN_SYSTEM_KEY,
    templateType: PREGEN_TEMPLATE_TYPE,
    floor: 1,
    identity: {
      name: "Princess Donut",
      race: "Cat",
      pronouns: "She/Her",
      level: 1,
      crawlerNumber: 4119,
      className: "Not Yet Assigned",
      size: "Small (2)",
      aiFavor: 0,
      popularity: 0,
    },
    stats: {
      str: stat(11, 1, "+4"),
      int: stat(11, 11, "+4"),
      con: stat(2, 1, "+1"),
      dex: stat(8, 8, "+3"),
      cha: stat(25, 5, "+5"),
    },
    derived: {
      health: 10,
      healthBarSlotValue: 1,
      maxMana: 11,
      currentMana: 11,
      evade: 4,
      evadeBaseDex: 3,
      evadeBuff: "Dodge +1",
      damageResistance: 0,
      move: 20,
      step: 10,
    },
    attacks: [
      attack({
        name: "Magic Missile", rank: 1, attackStat: "INT", attackStatMod: "+4", toHit: "+5",
        damage: "1d4 +4", damageType: "Force", range: "Line of Sight",
      }),
      attack({
        name: "Slice Attack", rank: 4, attackStat: "DEX", attackStatMod: "+3", toHit: "+7",
        damage: "1d4 +4", damageStat: "STR", damageType: "Slashing",
      }),
    ],
    skills: [
      skill("Magic Missile", 1, "INT", "+4", "Evade"),
      skill("Slice Attack", 4, "DEX", "+3", "Evade"),
      skill("Light on Your Feet", 3, "DEX", "+3", "Unopposed"),
      skill("Good First Impression", 5, "CHA", "+5", "INT-Opposed"),
      skill("Dodge", 4, null, "", "Passive", "Grants passive +1 Evade"),
    ],
    hotlist: [
      { name: "Heal Spell", detail: "Rank 1 max, Mana Cost 2, heals 2 Health Bar slots" },
      { name: "Magic Missile Spell", detail: "Rank 1, Mana Cost 5" },
      { name: "5 Mana Potions", detail: "Full Restore" },
      { name: "2 Healing Potions", detail: "heal 5 Health Bar slots" },
    ],
    gear: [
      { slot: "Accessory", item: "Cat Collar" },
    ],
    inventory: [],
    storyHooks: {
      pastTrauma: "I now realize I was OWNED like a piece of property, to be traded, discarded, or even bred",
      looseEnd: "I have to wonder if Miss Beatrice really loved me",
      regret: "I was robbed of a purple ribbon at a competition in Iowa",
    },
  },

  {
    id: "dcc_ff_imani",
    systemKey: PREGEN_SYSTEM_KEY,
    templateType: PREGEN_TEMPLATE_TYPE,
    floor: 1,
    identity: {
      name: "Imani",
      race: "Human",
      pronouns: "She/Her",
      level: 1,
      crawlerNumber: 12329440,
      className: "Not Yet Assigned",
      size: "Medium (4)",
      aiFavor: 1,
      popularity: 0,
    },
    stats: {
      str: stat(4, 4, "+2"),
      int: stat(2, 2, "+1"),
      con: stat(5, 5, "+2"),
      dex: stat(3, 3, "+2"),
      cha: stat(6, 6, "+3"),
    },
    derived: {
      health: 20,
      healthBarSlotValue: 2,
      maxMana: 2,
      currentMana: 2,
      evade: 2,
      damageResistance: 0,
      move: 20,
      step: 10,
    },
    attacks: [
      attack({
        name: "Longsword", rank: 3, attackStat: "STR", attackStatMod: "+2", toHit: "+5",
        damage: "1d8 +2", damageType: "Slashing",
      }),
      attack({
        name: "Unarmed Combat", rank: 3, attackStat: "STR", attackStatMod: "+2", toHit: "+5",
        damage: "1d4 +2", damageType: "Bludgeoning",
      }),
    ],
    skills: [
      skill("Longsword", 3, "STR", "+2", "Evade"),
      skill("Unarmed Combat", 3, "STR", "+2", "Evade"),
      skill("Persuasion", 3, "CHA", "+3", "INT-Opposed"),
      skill("Stealth", 1, "DEX", "+2", "INT-Opposed"),
      skill("Deception", 1, "CHA", "+3", "INT-Opposed"),
      skill("Swimming", 1, "STR", "+2", "Unopposed"),
      skill("Streetwise", 2, "CHA", "+3", "Unopposed"),
      skill("First Aid", 3, "INT", "+1", "Unopposed"),
      skill("Perception", 2, "INT", "+1", "Unopposed"),
      skill("Running", 1, "DEX", "+2", "Unopposed"),
    ],
    hotlist: healSpellHotlist,
    gear: [
      { slot: "Torso", item: "Medical Scrubs" },
      { slot: "Hands/Holding", item: "Longsword" },
    ],
    inventory: [],
    storyHooks: {
      pastTrauma: "Someone I loved frequently made excuses for drug abuse, and I didn\u2019t call them out on it",
      looseEnd: "I\u2019m overwhelmed with guilt because I escaped my home and family, but it got worse for those left behind",
      regret: "I should have told Chris that I liked him before this whole shit-show happened",
    },
  },

  {
    id: "dcc_ff_yolanda",
    systemKey: PREGEN_SYSTEM_KEY,
    templateType: PREGEN_TEMPLATE_TYPE,
    floor: 1,
    identity: {
      name: "Yolanda",
      race: "Human",
      pronouns: "She/Her",
      level: 1,
      crawlerNumber: 7450,
      className: "Not Yet Assigned",
      size: "Medium (4)",
      aiFavor: 1,
      popularity: 0,
    },
    stats: {
      str: stat(2, 2, "+1"),
      int: stat(3, 3, "+2"),
      con: stat(5, 5, "+2"),
      dex: stat(6, 6, "+3"),
      cha: stat(4, 4, "+2"),
    },
    derived: {
      health: 20,
      healthBarSlotValue: 2,
      maxMana: 3,
      currentMana: 3,
      evade: 3,
      damageResistance: 0,
      move: 20,
      step: 10,
    },
    attacks: [
      attack({
        name: "Bow", rank: 3, attackStat: "DEX", attackStatMod: "+3", toHit: "+6",
        damage: "1d6 +1", damageStat: "STR", damageType: "Piercing", range: "100 feet",
      }),
      attack({
        name: "Unarmed Combat", rank: 3, attackStat: "STR", attackStatMod: "+1", toHit: "+4",
        damage: "1d4 +1", damageType: "Bludgeoning",
      }),
    ],
    skills: [
      skill("Bow", 3, "DEX", "+3", "Evade"),
      skill("First Aid", 3, "INT", "+2", "Unopposed"),
      skill("Stealth", 2, "DEX", "+2", "INT-Opposed"),
      skill("Perception", 3, "INT", "+2", "Unopposed"),
      skill("Detect Lies", 1, "INT", "+2", "CHA-Opposed"),
      skill("Hide in Shadows", 2, "DEX", "+3", "INT-Opposed"),
      skill("Running", 1, "DEX", "+3", "Unopposed"),
      skill("Climbing", 1, "STR", "+1", "Unopposed"),
      skill("Endurance", 1, "CON", "+2", "Unopposed"),
      skill("Unarmed Combat", 3, "STR", "+1", "Evade"),
    ],
    hotlist: healSpellHotlist,
    gear: [
      { slot: "Torso", item: "Medical Scrubs" },
      { slot: "Hands/Holding", item: "Bow (both hands)" },
      { slot: "Legs", item: "Medical Scrubs" },
      { slot: "Accessory", item: "Quiver with 16 arrows" },
    ],
    inventory: [],
    storyHooks: {
      pastTrauma: "I burned myself out for the good of my family and patients, never letting them suffer if I could push myself just a little further",
      looseEnd: "I don\u2019t know if my son is alive, and I keep myself busy because I think about him during quiet moments",
      // Regret intentionally left blank — not present in the verified First Floor source.
      regret: "",
    },
  },
];