/* Third-Floor class catalog — Dungeon Crawler Carl Royal Court Edition.
   This file stores concise mechanics, prerequisites, class-type tags, Earth
   eligibility, and source-page provenance. It intentionally omits long flavor
   prose so the application can display/apply rules without duplicating book text.

   Official entries below come from the Core Rulebook class section (pp. 142–158).
   Custom/user-supplied entries may be merged after them. */

const cls = (name, class_types, source_page, earth_class, benefits, prerequisites = []) => ({
  id: name
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase(),
  name,
  class_types,
  source_stage: "third_floor",
  source: "core_rulebook_royal_court_2026",
  source_page,
  earth_class,
  prerequisites,
  benefits,
});

const official = [
  {
    "name": "Boring Ol’ Arcanist",
    "types": [
      "Arcanist"
    ],
    "page": 142,
    "earth": false,
    "benefits": [
      "Intelligence +3",
      "Dexterity +2",
      "Arcane Skill +5",
      "Salvage Skill +3",
      "One crafting Skill of choice +2",
      "A second crafting Skill of choice +1",
      "Tier 1 Arcanist table",
      "Arcane and one crafting Skill may reach Rank 20"
    ]
  },
  {
    "name": "Alchemist",
    "types": [
      "Arcanist"
    ],
    "page": 142,
    "earth": false,
    "benefits": [
      "Constitution +3",
      "Intelligence +3",
      "Alchemy Skill +5",
      "Infusion Skill +3",
      "Immunity to Poison",
      "Tier 1 Alchemy table",
      "At each floor end, +1 to Alchemy and Infusion Skill Advancement Checks",
      "Alchemy Skill may reach Rank 20"
    ]
  },
  {
    "name": "Douchy Wizard School Wand-Maker",
    "types": [
      "Arcanist"
    ],
    "page": 142,
    "earth": true,
    "benefits": [
      "Intelligence +5",
      "Strength +1",
      "Dexterity +1",
      "Charisma -2",
      "Arcane Skill +5",
      "Lore, Negotiation, and Salvage Skills +2",
      "Tier 1 crafting table of choice",
      "Arcanist Skill may reach Rank 20",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Infernocrafter",
    "types": [
      "Arcanist"
    ],
    "page": 143,
    "earth": false,
    "benefits": [
      "Strength +3",
      "Constitution +3",
      "Dexterity +1",
      "Arcane Skill +5",
      "Smithing Skill +3",
      "Resistance to Fire damage",
      "Tier 1 Arcanist table",
      "Tier 1 Smithing table",
      "Arcane Skill may reach Rank 20"
    ]
  },
  {
    "name": "Prison Tattoo Artist",
    "types": [
      "Arcanist"
    ],
    "page": 143,
    "earth": true,
    "benefits": [
      "Constitution +3",
      "Dexterity +3",
      "Intelligence +2",
      "Tattoo Artistry Skill +5",
      "Calligraphy Skill +3",
      "Dagger Skill +2",
      "Tier 1 Tattoo chair/table",
      "Tattoo Artistry Skill may reach Rank 20",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Boring Ol’ Barbarian",
    "types": [
      "Barbarian"
    ],
    "page": 144,
    "earth": false,
    "benefits": [
      "Strength +6",
      "Constitution +5",
      "Weapon Skill of choice +3",
      "Endurance Skill +2",
      "Intimidate Skill +1",
      "Rage: melee attacks deal +1 damage per lost Health Bar slot",
      "DR Buff +2"
    ]
  },
  {
    "name": "Gladiator",
    "types": [
      "Barbarian",
      "Bard"
    ],
    "page": 144,
    "earth": false,
    "benefits": [
      "Strength +3",
      "Constitution +3",
      "Charisma +3",
      "Weapon Skill of choice +2",
      "Performance and Intimidation Skills +2",
      "Attack of Opportunity Skill +1",
      "Rage: melee attacks deal +1 damage per lost Health Bar slot",
      "DR Buff +1",
      "Once per combat after killing an enemy, Amazing+ Unopposed Performance Check grants +1 Popularity",
      "One Weapon Skill may reach Rank 20"
    ]
  },
  {
    "name": "Harii",
    "types": [
      "Barbarian",
      "Rogue"
    ],
    "page": 144,
    "earth": true,
    "benefits": [
      "Strength +1",
      "Dexterity +1",
      "Intelligence +1",
      "Ambush and Stealth Skills +4",
      "One Weapon Skill of choice +2",
      "Rage: melee attacks deal +1 damage per lost Health Bar slot",
      "DR Buff +1",
      "Can see in total darkness",
      "Access to Desperado Club",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Feral Cat Berserker",
    "types": [
      "Barbarian"
    ],
    "page": 144,
    "earth": true,
    "prerequisites": [
      "Cat-based Race (such as Cat, Cat Girl, or Tigran)"
    ],
    "benefits": [
      "Dexterity +2",
      "Strength +2",
      "Charisma +2",
      "Slice Attack and Unarmed Combat Skills +3",
      "Dodge Skill +2",
      "Ambush Skill +1",
      "Rage: melee attacks deal +1 damage per lost Health Bar slot",
      "DR Buff +1",
      "Can see in total darkness",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Shieldmaiden",
    "types": [
      "Barbarian",
      "Fighter"
    ],
    "page": 144,
    "earth": true,
    "prerequisites": [
      "Female crawler"
    ],
    "benefits": [
      "Strength +3",
      "Dexterity +3",
      "Charisma +3",
      "Intelligence -2",
      "Shield Block Skill +5",
      "One Weapon Skill of choice +2",
      "Rage: melee attacks deal +1 damage per lost Health Bar slot",
      "DR Buff +1",
      "One Weapon Skill may reach Rank 20",
      "Add Strength Mod a second time to melee damage against males",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Boring Ol’ Bard",
    "types": [
      "Bard"
    ],
    "page": 145,
    "earth": false,
    "benefits": [
      "Charisma +3",
      "Performance Skill +3",
      "Weapon Skill of choice +1",
      "Spell of choice +2",
      "Diplomacy Skill +2",
      "Good First Impression and Lore Skills +1",
      "Access to all membership-based clubs",
      "Membership in Dungeon Book of the Floor Club (all Spells)",
      "Free room at all saferooms",
      "May gain access to a Patron",
      "+1 Mana cost for Spells not Favored: Bard"
    ]
  },
  {
    "name": "Artist Alley Mogul",
    "types": [
      "Bard",
      "Merchant"
    ],
    "page": 145,
    "earth": true,
    "benefits": [
      "Dexterity +5",
      "Charisma +5",
      "Dodge, Negotiation, and Pathfinder Skills +2",
      "Shield Spell +2",
      "25% store discount",
      "15% bonus to money earned from sales",
      "10% interest on all coins when descending to next floor",
      "Dodge Skill may reach Rank 20",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Former Child Actor",
    "types": [
      "Bard"
    ],
    "page": 145,
    "earth": true,
    "prerequisites": [
      "Popularity 3+",
      "Cut! achievement"
    ],
    "benefits": [
      "Charisma +10",
      "Character Actor Skill +3; Rank increases only on descent to next floor",
      "Cockroach Skill +2",
      "+1 to Skill Advancement Checks for Charisma-based Skills",
      "Immunity to Poison and all diseases",
      "Manager Benefit",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "NecroBard",
    "types": [
      "Bard",
      "Necromancer"
    ],
    "page": 146,
    "earth": false,
    "benefits": [
      "Intelligence +3",
      "Constitution +3",
      "Charisma +3",
      "Strength -2",
      "Performance Skill +4",
      "Turn Undead and Panty Dropper Spells +3",
      "Access to all membership-based clubs",
      "Free room at all saferooms",
      "+1 Mana cost for Spells that are neither Favored: Bard nor Necrotic"
    ]
  },
  {
    "name": "Poet Laureate",
    "types": [
      "Bard"
    ],
    "page": 146,
    "earth": true,
    "benefits": [
      "Intelligence +3",
      "Charisma +2",
      "Performance Skill +5 with written-word specialty",
      "Earworm (spoken-word poetry), Heal Others, and Shield Spells +2",
      "Access to all membership-based clubs",
      "+1 Mana cost for Spells not Favored: Bard",
      "Performance Skill may reach Rank 20",
      "Must choose a Patron; GM offers at least two options",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Professional Roadie",
    "types": [
      "Bard",
      "Rogue"
    ],
    "page": 146,
    "earth": true,
    "benefits": [
      "Split +8 among Strength, Constitution, and Charisma",
      "Performance Skill +4 with guitar specialty",
      "Negotiation Skill +3",
      "Iron Stomach and Repair Skills +1",
      "Advantage on Checks against Poison or Shit-Faced effects",
      "At combat start may change all damage dealt that combat to Sonic",
      "Advantage on Repair Skill Checks",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Spellbinder",
    "types": [
      "Bard"
    ],
    "page": 147,
    "earth": false,
    "benefits": [
      "Charisma +2",
      "Intelligence +2",
      "Good First Impression, Lore, and Performance Skills +2",
      "Hot Stuff Aura and Panty Dropper Spells +2",
      "Add Charisma Mod a second time on Charisma Skill Checks in potentially hostile situations",
      "Access to Spellbook of the Floor club (Favored: Bard Spells only)",
      "Once per day, draw battlefield attention for 1 round and prevent attacks by party members, Mobs, and minions (not Bosses)"
    ]
  },
  {
    "name": "Boring Ol’ Cleric",
    "types": [
      "Cleric"
    ],
    "page": 148,
    "earth": false,
    "benefits": [
      "Charisma +4",
      "Intelligence +3",
      "Weapon Skill of choice +2",
      "Religion Skill +3",
      "Heal Others, Shield, and Turn Undead Spells +2",
      "Access to Spell Book of the Level club (Favored: Cleric Spells only)",
      "Access to Club Vanquisher",
      "Must worship a deity",
      "Cannot choose a Cleric-type Class if you have access to Desperado Club"
    ]
  },
  {
    "name": "Black Inquisitor General",
    "types": [
      "Cleric",
      "Mage",
      "Paladin"
    ],
    "page": 148,
    "earth": false,
    "benefits": [
      "Strength +3",
      "Intelligence +3",
      "Charisma +1",
      "Constitution -2",
      "Find Trap Skill +3",
      "Weapon Skill of choice +3",
      "Trap Engineer Skill +2",
      "Spell of choice +2",
      "Religion Skill +1",
      "Can see in total darkness",
      "Must worship a deity",
      "Access to all membership-based clubs"
    ]
  },
  {
    "name": "Santero",
    "types": [
      "Cleric"
    ],
    "page": 148,
    "earth": false,
    "benefits": [
      "Strength +3",
      "Charisma +3",
      "Constitution +2",
      "Intelligence -2",
      "Heal Others, Shield, and Soul Collector Spells +2",
      "Weapon Skill of choice +2",
      "Religion Skill +2",
      "Endurance Skill +1",
      "Access to Dungeon Book of the Floor club (Favored: Cleric Spells only)",
      "Access to Club Vanquisher",
      "Must worship a deity",
      "Cannot choose if you have access to Desperado Club"
    ]
  },
  {
    "name": "Boring Ol’ Druid",
    "types": [
      "Druid"
    ],
    "page": 148,
    "earth": false,
    "benefits": [
      "Intelligence +2",
      "Constitution +2",
      "Dexterity +2",
      "Nature’s Breath Spell +3",
      "One Spell of choice +3",
      "A second Spell of choice +2",
      "Survival Skill +2",
      "Mana recovers at twice normal rate in a natural environment",
      "Access to Dungeon Book of the Floor club (Favored: Druid Spells only)"
    ]
  },
  {
    "name": "Herbalist",
    "types": [
      "Arcanist",
      "Druid"
    ],
    "page": 149,
    "earth": false,
    "benefits": [
      "Constitution +2",
      "Intelligence +2",
      "Alchemy, Cooking, First Aid, and Survival Skills +2",
      "Nature’s Breath and Dirt Clod Spells +2",
      "Mana recovers at twice normal rate in a natural environment"
    ]
  },
  {
    "name": "Lifebringer",
    "types": [
      "Druid"
    ],
    "page": 149,
    "earth": false,
    "benefits": [
      "Constitution +2",
      "Intelligence +1",
      "First Aid, Pathfinder, Regeneration, and Survival Skills +2",
      "Nature’s Breath Spell +2",
      "All Spells with Heal keyword +1",
      "Once per day, grant Regeneration at your Skill Rank to all party members within 30 feet for 10 minutes"
    ]
  },
  {
    "name": "Physicker",
    "types": [
      "Druid"
    ],
    "page": 149,
    "earth": false,
    "benefits": [
      "Constitution +3",
      "Intelligence +3",
      "Nature’s Breath and Oakhide Spells +3",
      "Rootfoot and Solsplash Spells +2",
      "Double Mana regeneration when outdoors",
      "Once per day, grant party +1 DR for one scene"
    ]
  },
  {
    "name": "Shepherd",
    "types": [
      "Druid"
    ],
    "page": 150,
    "earth": true,
    "benefits": [
      "Intelligence +2",
      "Charisma +2",
      "Constitution +2",
      "Animal Handling Skill +3",
      "Pathfinder Skill +2",
      "Nature’s Breath and Drain Life Spells +2",
      "Can see twice as far as most creatures",
      "Mana recovers at twice normal rate in a natural environment",
      "May not use melee weapons other than Herding Weapons",
      "Gain a friendly Pet",
      "Pets in your Herd gain +2 DR",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Boring Ol’ Fighter",
    "types": [
      "Fighter"
    ],
    "page": 150,
    "earth": false,
    "benefits": [
      "Strength +2",
      "Constitution +2",
      "Weapon Skill of choice +5",
      "Dodge Skill +3",
      "Choose two: Aiming, Attack of Opportunity, Catcher, Shield Block, or Zone of Control Skills +2",
      "Access to any Weapon Training Guild",
      "Each floor, receive one free Weapon Training Guild training coupon"
    ]
  },
  {
    "name": "Pit Fighter",
    "types": [
      "Fighter"
    ],
    "page": 150,
    "earth": true,
    "benefits": [
      "Dexterity +3",
      "Intelligence +2",
      "Strength +1",
      "Attack of Opportunity and Dirty Fighting Skills +3",
      "Dodge and Improvised Weapons Skills +2",
      "DR Buff +2",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Shotgun Messenger",
    "types": [
      "Fighter"
    ],
    "page": 150,
    "earth": true,
    "benefits": [
      "Strength +2",
      "Constitution +2",
      "Dexterity +2",
      "Charisma -2",
      "One Ranged Weapon Skill +5",
      "Aiming and Intimidate Skills +2",
      "All muscle-powered movement-related Skills +1",
      "Access to any Weapon Training Guild; one free training coupon per floor",
      "Access to Desperado Club",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Straight-to-DVD Action Hero",
    "types": [
      "Fighter"
    ],
    "page": 151,
    "earth": true,
    "benefits": [
      "Strength +3",
      "Constitution +3",
      "Dexterity +3",
      "Charisma +3",
      "Intelligence -2",
      "Unarmed Combat Skill +2",
      "Driving, Running, and Performance Skills +1",
      "Take no damage from falling",
      "DR +1",
      "Manager Benefit",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Sword and Boarder",
    "types": [
      "Fighter"
    ],
    "page": 151,
    "earth": false,
    "benefits": [
      "Strength +2",
      "Constitution +2",
      "Dexterity +2",
      "Intelligence -2",
      "Shield Block Skill +5",
      "Edged Weapon Skill of choice +3",
      "Attack of Opportunity and Catcher Skills +2",
      "Access to Desperado Club"
    ]
  },
  {
    "name": "Monster Truck Driver",
    "types": [
      "Fighter"
    ],
    "page": 152,
    "earth": true,
    "prerequisites": [
      "Driving Skill Rank 5+"
    ],
    "benefits": [
      "Constitution +4",
      "Dexterity +2",
      "Strength -2",
      "Intelligence -2",
      "Gear Head, Driving, and Pathfinder Skills +3",
      "While moving in combat, temporary Health Bar slot bonus equals Constitution Mod times one-tenth of conveyance Move; on foot, must have moved previous round",
      "Floor-ranked charge attack: Dexterity to hit, 1d12 Bludgeoning, 2d10+3 ft Line, then Fatigued; Critical Fail on natural 4 or less; 30-hour cooldown; +1 die at Ranks 5, 10, 15; Rank rises only by floor",
      "Once per combat when losing 2+ Health Bar slots, roll 1d2; on 1 attacker loses 1 Health Bar slot",
      "Resistance to Force damage",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Zulu Warrior",
    "types": [
      "Fighter"
    ],
    "page": 152,
    "earth": true,
    "benefits": [
      "Strength +3",
      "Constitution +3",
      "Dexterity +3",
      "One Melee Weapon Skill +3",
      "Attack of Opportunity, Endurance, and Running Skills +2",
      "DR +1",
      "One Weapon Skill may reach Rank 20",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Boring Ol’ Mage",
    "types": [
      "Mage"
    ],
    "page": 152,
    "earth": false,
    "benefits": [
      "Intelligence +5",
      "Charisma +5",
      "Strength -2",
      "Dexterity -2",
      "One Fire Spell +3",
      "One Force Spell +2",
      "One Sonic Spell +2",
      "Two different Passive Spells +2",
      "Lore Skill +2",
      "Arcane Skill +1",
      "All Dexterity Skills -3, minimum Rank 1 if trained",
      "All Strength Skills -3, minimum Rank 1 if trained"
    ]
  },
  {
    "name": "Blizzardmancer",
    "types": [
      "Mage"
    ],
    "page": 153,
    "earth": false,
    "benefits": [
      "Intelligence +4",
      "Dexterity +3",
      "Strength -2",
      "Ice Blast and Frost Scar Spells +4",
      "Aiming Skill +2",
      "Resistance to Ice damage",
      "May use Aiming Skill for single-target Ice Spells"
    ]
  },
  {
    "name": "Crisper",
    "types": [
      "Mage"
    ],
    "page": 153,
    "earth": false,
    "benefits": [
      "Intelligence +3",
      "Dexterity +2",
      "Constitution -2",
      "Wall of Fire and Fire Fingers Spells +3",
      "Fireball and Wilbur’s Slow-Build Fireblast Spells +2",
      "Lore Skill +2",
      "Resistance to Fire damage",
      "No DR against Ice or water-based damage"
    ]
  },
  {
    "name": "Fire Spiritualist",
    "types": [
      "Bard",
      "Mage"
    ],
    "page": 153,
    "earth": false,
    "benefits": [
      "Intelligence +2",
      "Charisma +2",
      "Holy Aura and Hot Stuff Aura Spells +2",
      "Heal Others and Intimate Touches Spells +2",
      "Heal Others Spell may reach Rank 20",
      "Ethereal Hug: once per day for one scene, party gains +1 DR, Rank 4 Regeneration, +1 to hit on Weapon/Spell Skill Checks, and +1d4 damage",
      "Vulnerable to Ice damage"
    ]
  },
  {
    "name": "Forsaken Aerialist",
    "types": [
      "Mage"
    ],
    "page": 153,
    "earth": false,
    "benefits": [
      "Intelligence +5",
      "Charisma -2",
      "Drain Life and Soul Collector Spells +3",
      "Alchemy, Infusion, and Tactics Skills +1",
      "Double duration of Rank 5 and lower Spells with a duration",
      "Spells can be applied without the target realizing it is under a Spell effect"
    ]
  },
  {
    "name": "Necromancer",
    "types": [
      "Mage",
      "Necromancer"
    ],
    "page": 154,
    "earth": false,
    "benefits": [
      "Intelligence +2",
      "Dexterity +2",
      "Constitution -2",
      "Charisma -2",
      "Soul Collector and Rise, Dead Minion! Spells +4",
      "Drain Life and Second Chance Spells +2",
      "Once per rest, ask a corpse a number of questions equal to Intelligence; it answers truthfully based on what it knew in life",
      "When you kill an undead Mob, heal 1 Health Bar, up to 5 Health Bars per combat"
    ]
  },
  {
    "name": "Boring Ol’ Monk",
    "types": [
      "Monk"
    ],
    "page": 154,
    "earth": false,
    "benefits": [
      "Constitution +3",
      "Dexterity +3",
      "Strength +1",
      "Unarmed Combat Skill +3",
      "Foot Soldier, Iron Punch, Powerful Strike, Pugilism, and Smush Skills +1",
      "Dexterity-based Weapon Skills +1",
      "Unarmed Combat Skill may reach Rank 20"
    ]
  },
  {
    "name": "Elemental Monk",
    "types": [
      "Mage",
      "Monk"
    ],
    "page": 154,
    "earth": false,
    "benefits": [
      "Intelligence +2",
      "Dexterity +2",
      "Unarmed Combat Skill +3",
      "Dirt Clod, Fire Fingers, and Frost Scar Spells +1",
      "All Spells dealing Electric, Fire, or Ice damage +1",
      "Advantage when attacking elemental creatures",
      "Can breathe underwater",
      "Can burrow",
      "Can fly"
    ]
  },
  {
    "name": "Prizefighter",
    "types": [
      "Bard",
      "Monk"
    ],
    "page": 154,
    "earth": true,
    "prerequisites": [
      "Pugilism Skill Rank 5+"
    ],
    "benefits": [
      "Constitution +5",
      "Strength +2",
      "Intelligence -2",
      "Charisma -2",
      "Pugilism and Iron Punch Skills +5",
      "Gain Floor Number gold for every Mob killed with Pugilism or Unarmed Combat",
      "Killing a foe with Pugilism or Unarmed Combat grants +1 Popularity",
      "Pugilism Skill may reach Rank 20",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Spirit Healer",
    "types": [
      "Druid",
      "Monk"
    ],
    "page": 155,
    "earth": true,
    "benefits": [
      "Strength +3",
      "Constitution +3",
      "Dexterity +1",
      "Drain Life Spell +3",
      "Smush Skill +3",
      "Heal Others and Heal Self Spells +2",
      "Single-target healing Skills and Spells heal +1 Health Bar slot",
      "Heal Others Spell may reach Rank 20",
      "Access to Club Vanquisher",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Street Monk",
    "types": [
      "Fighter",
      "Monk"
    ],
    "page": 155,
    "earth": true,
    "benefits": [
      "Dexterity +2",
      "Strength +1",
      "Charisma +1",
      "Dirty Fighting Skill +2",
      "Streetwise and Unarmed Combat Skills +2",
      "Pugilism Skill +1",
      "Dexterity-based Weapon Skills +1",
      "DR Buff +3",
      "Silver Earth Box with guaranteed Earth Hobby Skill Potion"
    ]
  },
  {
    "name": "Boring Ol’ Paladin",
    "types": [
      "Paladin"
    ],
    "page": 155,
    "earth": false,
    "benefits": [
      "Charisma +2",
      "Charisma +1",
      "Protective Shell, Heal Others, and Holy Aura Spells +3",
      "Weapon Skill of choice +3",
      "Choose Catcher or Shield Block Skill +2",
      "Access to Club Vanquisher",
      "Must worship a deity",
      "Cannot choose if you have access to Desperado Club"
    ]
  },
  {
    "name": "Cavalier",
    "types": [
      "Fighter",
      "Paladin"
    ],
    "page": 156,
    "earth": false,
    "benefits": [
      "Strength +2",
      "Constitution +2",
      "Catcher, Riding, and Lance Skills +2",
      "Shield and Smite Spells +2",
      "When protecting someone under your code with Catcher, gain Playing to the Cameras benefit without Disadvantage; counts as once-per-session use",
      "Gain bonded Mount one size larger with Move 40, DR 10 barding, Trample attack, and pet carrier",
      "When you or Mount is attacked, may redirect attack between rider and Mount",
      "Access to Club Vanquisher",
      "Must worship a deity"
    ]
  },
  {
    "name": "Sacred Paladin",
    "types": [
      "Paladin"
    ],
    "page": 156,
    "earth": false,
    "benefits": [
      "Strength +3",
      "Charisma +2",
      "Catcher Skill +2",
      "Weapon Skill of choice +2",
      "Heal Others, Smite, and Turn Undead Spells +2",
      "Access to Dungeon Book of the Floor club (Favored: Cleric or Paladin Spells only)",
      "DR Buff +2",
      "Access to Club Vanquisher",
      "Must worship a deity",
      "Cannot choose if you have access to Desperado Club"
    ]
  },
  {
    "name": "Boring Ol’ Rogue",
    "types": [
      "Rogue"
    ],
    "page": 156,
    "earth": false,
    "benefits": [
      "Intelligence +1",
      "Dexterity +1",
      "Charisma +1",
      "Stealth Skill +3",
      "Dagger, Detect Trap, Dodge, and Lockpicking Skills +2",
      "Ambush Skill +1",
      "Can see in total darkness",
      "Gain Floor Number gold for every Mob killed with a melee weapon",
      "Access to Desperado Club",
      "Cannot choose if you have access to Club Vanquisher"
    ]
  },
  {
    "name": "Bomb Squad Tech",
    "types": [
      "Rogue"
    ],
    "page": 156,
    "earth": true,
    "prerequisites": [
      "Boom! achievement"
    ],
    "benefits": [
      "Dexterity +2",
      "Constitution +1",
      "Intelligence -2",
      "Bomb Surgeon and Find Trap Skills +3",
      "All Explosive-based Skills +2",
      "DR Buff +1",
      "Limb Regeneration: one limb fully regrows in 12 days minus Constitution Mod",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Compensated Anarchist",
    "types": [
      "Monk",
      "Rogue"
    ],
    "page": 157,
    "earth": true,
    "prerequisites": [
      "Popularity 3+",
      "Explosives Handling Skill Rank 5+"
    ],
    "benefits": [
      "Charisma +5",
      "Intelligence +1",
      "Backfire, Escape Plan, and Find Trap Skills +2",
      "Bomb Surgeon, Hide in Shadows, Trap Engineer, and Unarmed Combat Skills +1",
      "Fear Spell +1",
      "No Stat Mod bonus damage with Edged Weapons",
      "+3 Mana cost for damage-dealing Spells",
      "At each floor end, +1 to one trap-related Skill Advancement Check",
      "At each floor end, +1 to one bomb-related Skill Advancement Check",
      "Access to Desperado Club",
      "Access to Naughty Boys Employment Agency",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "High Rise Grifter",
    "types": [
      "Rogue"
    ],
    "page": 157,
    "earth": true,
    "benefits": [
      "Intelligence +1",
      "Charisma +1",
      "Deception and Stealth Skills +4",
      "Dagger and Escape Plan Skills +2",
      "Determine Value and Negotiation Skills +1",
      "Access to Desperado Club",
      "Cannot choose if you have access to Club Vanquisher",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Identity Thief",
    "types": [
      "Rogue"
    ],
    "page": 157,
    "earth": true,
    "benefits": [
      "Charisma +4",
      "Dexterity +3",
      "Deception Skill +5",
      "Dagger Skill +3",
      "Investigation Skill +2",
      "Tier 3 Makeup Table",
      "Access to Desperado Club",
      "Cannot choose if you have access to Club Vanquisher",
      "Silver Earth Box with guaranteed Earth Hobby Potion"
    ]
  },
  {
    "name": "Swashbuckler",
    "types": [
      "Bard",
      "Fighter",
      "Rogue"
    ],
    "page": 158,
    "earth": false,
    "benefits": [
      "Dexterity +3",
      "Charisma +3",
      "Choose Rapier or Longsword Skill +3",
      "Balance and Dodge Skills +2",
      "Performance Skill +1",
      "Light on Your Feet Skill +1",
      "Chosen Rapier or Longsword Skill may reach Rank 20",
      "Advantage on melee attacks from higher position than opponent",
      "Once per combat after killing an enemy, Amazing+ Unopposed Performance Check grants +1 Popularity"
    ]
  }
].map((d) =>
  cls(d.name, d.types, d.page, d.earth, d.benefits, d.prerequisites ?? [])
);

export const OFFICIAL_THIRD_FLOOR_CLASS_CATALOG = Object.fromEntries(
  official.map((entry) => [entry.id, entry])
);

export const CHARACTER_ACTOR_RULE = {
  id: "character_actor",
  starting_rank: 3,
  rank_progression: "increase_by_one_on_floor_descent",
  floor_start_class_choice: {
    random_options: 3,
    rank_15_choose_any_available: true,
    benefit_roll: { die: 2, success_on: [2] },
    duration: "current_floor",
    keep_existing_abilities: true,
  },
  upgrades: {
    5: "Offered Classes increase in rarity and power based on the crawler's Stats and Level.",
    10: "Skill Ranks earned in newly granted Skills persist between floors; the temporary starting Ranks do not.",
    15: "Choose the temporary Class from any available Class instead of a random list of three.",
  },
};

if (OFFICIAL_THIRD_FLOOR_CLASS_CATALOG.former_child_actor) {
  OFFICIAL_THIRD_FLOOR_CLASS_CATALOG.former_child_actor.character_actor = CHARACTER_ACTOR_RULE;
}

/* User-supplied custom/homebrew classes. These are intentionally kept
   separate from the official Core Rulebook catalog above. */
export const CUSTOM_THIRD_FLOOR_CLASSES = [
  {
    id: "health_embezzeler",
    name: "Health Embezzeler",
    class_type: "Earth Class",
    class_types: ["Custom"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: true,
    description:
      "The twisted mix of a vampire fangirl and a corporate criminal: unlike your usual goodie two shoes healer, the Health Embezzeler knows that the best things in life are the things that they don't have to pay for. After all, why spend resources on traditional healing spells when there are perfectly good health points right there just waiting to be... \"reallocated\". Like the insidious parasites you emulated in corporate, you're hard to get rid of. And when the going gets tough, you can justify your stinginess by telling yourself that horrifically draining the lives of your victims was all just to conserve your strength so that you could cast those \"proper\" healing spells when you truly needed them.",
    stat_bonuses: { int: 1, con: 1 },
    skill_rank_bonuses: { drain_life: 2, heal_others: 2, heal_self: 1, cockroach: 1 },
    effects: [
      {
        id: "healing_spell_extra_health_bar",
        trigger: "healing_type_spell",
        target_heals_additional_health_bars: 1,
        text: "When you use a Healing-type Spell, the target heals 1 additional Health Bar.",
      },
      {
        id: "double_mana_regeneration",
        mana_regeneration_multiplier: 2,
        text: "Your Mana regeneration rate is doubled.",
      },
    ],
    granted_skills: [
      {
        id: "draining_shadows",
        name: "Draining Shadows",
        rank_rule: { kind: "floor_level", initial_rank_at_third_floor: 3 },
        attack: {
          range: "melee",
          attack_stat: "int",
          damage: {
            dice: "1d8",
            plus_mod_stat: "int",
            damage_type: "Necrotic",
            extra_d8_at_ranks: [5, 10, 15],
          },
        },
        self_heal: { on_damage: true, health_bars: 1, max_uses_per_combat: 5 },
        text:
          "Manifest shadowy tendrils and make a melee attack using Intelligence for 1d8 + Int Necrotic damage. Add another d8 at Ranks 5, 10, and 15. Rank equals floor level and only increases by floor. On damage, heal 1 of your own Health Bars, up to 5 times per combat.",
      },
    ],
    passive_skills: [
      {
        id: "reallocate",
        name: "Reallocate",
        trigger: "deal_necrotic_damage",
        target: { self_allowed: false, range_feet: 30 },
        heal_health_bars: 1,
        text:
          "Whenever you deal Necrotic damage, heal 1 Health Bar to another creature within 30 feet.",
      },
    ],
  },
  {
    id: "storm_lancer",
    name: "Storm Lancer",
    class_type: "Earth Class",
    class_types: ["Custom"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: true,
    build_points: { spent: 35, total: 35 },
    stat_bonuses: { str: 2, int: -2 },
    skill_rank_bonuses: { lance: 3, pathfinder: 1, stealth: -2 },
    skill_rank_caps: { lance: 20 },
    spell_rank_bonuses: { bang_bro: 1, confusing_fog: 1 },
    resistances: ["Electric"],
    effects: [
      {
        id: "catch_the_storm",
        name: "Catch the Storm",
        grants_flight: true,
        text:
          "You can fly while surrounded by storm-cloud formations that may hug your body or appear as a large beast you ride.",
      },
      {
        id: "ride_the_lightning",
        name: "Ride the Lightning",
        homebrew_effect: true,
        requires: ["catch_the_storm"],
        text:
          "While flying with Catch the Storm, use weapons, skills, abilities, and items as though mounted on a creature one size larger than yourself; flying movement counts as mounted movement.",
      },
      {
        id: "squall",
        name: "Squall",
        homebrew_effect: true,
        requires: ["lance_rank_10", "wielding_lance", "catch_the_storm"],
        text:
          "At Lance Rank 10+, take one free Move action per round if wielding a lance and the entire movement uses Catch the Storm flight.",
      },
      {
        id: "storm_flight_penalties",
        text:
          "While flying with Catch the Storm, you have Disadvantage on Stealth-related checks and on checks that rely on hearing.",
      },
    ],
  },
  {
    id: "conspirators",
    name: "Conspirators",
    class_type: "Custom Class",
    class_types: ["Custom"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: null,
    stat_bonuses: { str: 2, con: 2, dex: 2, cha: 2 },
    stat_caps: { int: 10 },
    skill_rank_bonuses: {
      aliens_and_ufos: 1,
      basic_science: 1,
      engineering: 1,
      lore: 1,
      religion: 1,
      survival: 1,
      character_actor: 1,
    },
    skill_rank_caps: "all_to_20",
    effects: [
      {
        id: "pseudoscience_charisma",
        text:
          "Pseudoscience checks use Charisma instead of Intelligence; Experiments take one-tenth normal time.",
      },
      {
        id: "wake_up_sheeple",
        name: "Wake Up, Sheeple!",
        uses_per_day: 1,
        activation_time: "1 minute",
        text:
          "Rant for one minute about the nature of reality; NPCs who pay attention become Woke NPCs and remain GM-controlled.",
      },
      { id: "psychic_immunity", immunity: "Psychic" },
      {
        id: "intelligence_skill_disadvantage",
        text: "You have Disadvantage on all Intelligence Skill checks.",
      },
    ],
  },
  {
    id: "sports_entertainer",
    name: "Sports Entertainer",
    class_type: "Hybrid Class",
    class_types: ["Barbarian", "Bard"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: null,
    stat_bonuses: { cha: 4, str: 3, con: 2 },
    skill_rank_caps: { wrasslin: 20 },
    skill_rank_bonuses: { all_hand_to_hand: 1 },
    resistances: ["Bludgeoning damage from falling"],
    weapon_restrictions: ["Bludgeoning weapons", "Unarmed Skills"],
    effects: [
      {
        id: "wrasslin_heal",
        text:
          "Heal 1 Health Bar when you damage or kill with Wrasslin' (Choke or Toss), up to 5 times per combat.",
      },
      {
        id: "rage",
        text: "Melee attacks deal +1 damage for each Health Bar slot you have lost.",
      },
      { id: "evade_advantage", text: "Roll Evade Checks with Advantage." },
      { id: "charisma_advantage", text: "Roll all Charisma Skill checks with Advantage." },
    ],
  },
  {
    id: "carney_promoter",
    name: "Carney Promoter",
    class_type: "Hybrid Class",
    class_types: ["Bard", "Rogue"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: null,
    stat_bonuses: { int: 3, cha: 5 },
    effects: [
      { id: "charisma_advantage", text: "Roll with Advantage on all Charisma-based Skill checks." },
      { id: "store_discount", text: "Receive a discount at all Stores." },
      { id: "sales_bonus", text: "Receive a bonus to sales." },
      {
        id: "charisma_advancement_advantage",
        text: "Roll with Advantage on Advancement Checks for Charisma Skills.",
      },
      { id: "poison_disease_immunity", immunities: ["Poison", "Disease"] },
      { id: "psychic_resistance", resistance: "Psychic" },
      { id: "doppelganger_shape_changing", text: "Gain Doppelgänger shape changing." },
    ],
    build_point_notes: {
      intelligence: -3,
      charisma: -5,
      charisma_advantage: -6,
      store_discount: -1,
      sales_bonus: -1,
      charisma_advancement_advantage: -2,
      poison_disease_immunity: -6,
      psychic_resistance: -2,
      doppelganger_shape_changing: -4,
    },
  },
  {
    id: "ripper_rogue",
    name: "Ripper Rogue",
    class_type: "Rogue Class",
    class_types: ["Rogue"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: null,
    stat_bonuses: { dex: 3 },
    skill_rank_bonuses: {
      stealth: 3,
      ambush: 2,
      dagger: 2,
      dodge: 2,
      hide_in_shadows: 2,
    },
    effects: [
      { id: "total_darkness", text: "Can see in total darkness." },
      {
        id: "debuff_damage",
        text: "Attacks against enemies under a Debuff deal an extra Rank Damage Dice.",
      },
    ],
    restrictions: ["Cannot choose this Class if you have access to Club Vanquisher."],
  },
  {
    id: "gray_man_field_operative",
    name: "Gray Man Field Operative",
    class_type: "Earth Class",
    class_types: ["Rogue"],
    source_stage: "third_floor",
    source: "user_supplied",
    earth_class: true,
    build_points: { spent: 30, total: 30 },
    build_breakdown: [
      { benefit: "Intelligence +4", points: 4 },
      { benefit: "Dexterity +3", points: 3 },
      { benefit: "Constitution +3", points: 3 },
      { benefit: "Investigation Skill +3", points: 6 },
      { benefit: "Stealth Skill +2", points: 4 },
      { benefit: "Tactics Skill +2", points: 4 },
      { benefit: "Investigation may reach Rank 20", points: 1 },
      { benefit: "Stealth may reach Rank 20", points: 1 },
      { benefit: "Tactics may reach Rank 20", points: 1 },
      { benefit: "Advantage on Investigation Skill Checks", points: 3 },
    ],
    description:
      "Congratulations, crawler. You have selected the Gray Man Field Operative, the class for people who spent years entering rooms, noticing all the exits, remembering everyone’s shoes, and pretending that was normal. You do not kick in doors. You quietly determine which door is least likely to explode, who lied about the hallway, and why the vending machine has moved six inches since yesterday. Other crawlers call this paranoia. You call it staying alive. The Dungeon calls it deeply irritating.",
    stat_bonuses: { int: 4, dex: 3, con: 3 },
    skill_rank_bonuses: {
      investigation: 3,
      stealth: 2,
      tactics: 2,
    },
    skill_rank_caps: {
      investigation: 20,
      stealth: 20,
      tactics: 20,
    },
    effects: [
      {
        id: "pattern_analysis",
        name: "Pattern Analysis",
        text:
          "Roll with Advantage on Investigation Skill Checks. Apparently staring at something suspicious until everybody else gets uncomfortable is a legitimate professional technique.",
      },
      {
        id: "silver_earth_box",
        name: "Silver Earth Box",
        text:
          "Gain a Silver Earth Box with a guaranteed Earth Hobby Potion. The Dungeon would like to remind you that opening unfamiliar containers is exactly the sort of thing your training should have taught you not to do.",
      },
    ],
  },
];

export const CUSTOM_THIRD_FLOOR_CLASS_CATALOG = Object.fromEntries(
  CUSTOM_THIRD_FLOOR_CLASSES.map((entry) => [entry.id, entry])
);

/* Backward-compatible named export used by existing code/tests. */
export const HEALTH_EMBEZZELER_CLASS = CUSTOM_THIRD_FLOOR_CLASS_CATALOG.health_embezzeler;

export const THIRD_FLOOR_CLASS_CATALOG = {
  ...OFFICIAL_THIRD_FLOOR_CLASS_CATALOG,
  ...CUSTOM_THIRD_FLOOR_CLASS_CATALOG,
};

export const THIRD_FLOOR_CLASS_COUNTS = {
  official: official.length,
  custom: CUSTOM_THIRD_FLOOR_CLASSES.length,
  total: official.length + CUSTOM_THIRD_FLOOR_CLASSES.length,
};
