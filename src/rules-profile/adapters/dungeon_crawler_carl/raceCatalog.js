/* User-supplied Third-Floor race catalog.
   These entries are custom/homebrew material supplied by the user and are kept
   separate from official Core Rulebook data. */

const officialRace = (id, name, earth, size, data = {}) => ({
  id,
  name,
  race_type: earth ? "Earth Race" : "Alien Race",
  source_stage: "third_floor",
  source: "core_rulebook_royal_court_2026",
  earth_race: earth,
  class_access: earth ? ["Earth-based", "Classic"] : ["Alien-compatible", "Classic"],
  size,
  ...data,
});

export const OFFICIAL_THIRD_FLOOR_RACES = [
  officialRace("amazonian", "Amazonian", true, { label: "Medium", value: 4 }, {
    prerequisites: ["Strength- or Dexterity-based Skill Rank 5+"],
    stat_bonuses: { str: 6, dex: 3 },
    skill_rank_bonuses: { bow: 2, endurance: 2, pugilism: 2 },
    damage_resistance_bonus: 2,
    effects: [{ id: "weapon_training_coupon", text: "Each floor, receive one free training at a Weapon Training Guild." }],
  }),
  officialRace("arachnid", "Arachnid", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { dex: 5 },
    skill_rank_bonuses: { web: 3, climbing: 2, perception: 2, performance: 2 },
    effects: [
      { id: "web_half_mana", text: "Web costs half its normal Mana to cast." },
      { id: "climb_move", text: "Innate Climb Move equal to normal Move; no Check unless under duress." },
    ],
  }),
  officialRace("cat", "Cat", true, { label: "Small", value: 2 }, {
    animal: true,
    prerequisites: ["Crawler is already a Cat"],
    stat_bonuses: { dex: 4, con: 2, cha: 1 },
    stat_penalties: { str: -3 },
    skill_rank_bonuses: { cat_like_reflexes: 3, slice_attack: 2 },
    skill_check_advantage: ["cat_like_reflexes"],
    senses: ["Can see in total darkness"],
    vulnerabilities: ["Damage from Dogs and Beasts"],
    effects: [{ id: "nine_lives", text: "Take half damage from the first nine attacks each day." }],
  }),
  officialRace("cat_girl_cat_boy", "Cat Girl/Cat Boy", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { dex: 3, cha: 3 },
    stat_penalties: { con: -2 },
    skill_rank_bonuses: { cat_like_reflexes: 2, good_first_impression: 2, light_on_your_feet: 2, slice_attack: 2 },
    effects: [
      { id: "slice_charisma_damage", text: "Slice Attack may use Charisma Mod for damage instead of Strength Mod." },
      { id: "toxoplasma_g", text: "Once per day, allies gain Rank 5 Catcher for one round when protecting only you; protectors gain 1 AI Favor." },
      { id: "feline_social_disadvantage", text: "Charisma-based Skill Checks against other felines have Disadvantage." },
    ],
  }),
  officialRace("changbi_demon", "Changbi Demon", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { dex: 5, str: 3, con: 3 },
    stat_penalties: { cha: -2 },
    skill_rank_bonuses: { ambush: 3, club: 3 },
    vulnerabilities: ["Holy"],
    effects: [
      { id: "creepy_chains", text: "Use chains with the Club Skill at 10ft range; once per scene change a chain's length by 50%." },
      { id: "acid_touchback", text: "A foe touching you with bare skin takes 1d4 + Floor Acid damage." },
      { id: "no_breathing", text: "You do not need to breathe." },
      { id: "cannot_worship", text: "Cannot worship a deity." },
    ],
  }),
  officialRace("changeling", "Changeling", true, { label: "Large", value: 5 }, {
    stat_bonuses: { cha: 3, int: 2 },
    skill_rank_bonuses: { ambush: 2, deception: 2, escape_artist: 1 },
    conditional_skill_advantage: [{ id: "deception", condition: "No talking is needed." }],
    effects: [
      { id: "impersonation_access", text: "Can gain access tied to an impersonated crawler or Syndicate celebrity while shifted." },
      { id: "changeling_shapeshifting", text: "Touch another Race to add it to a form library; shifting is an Action with an Unopposed Deception Check and grants that Race's non-Stat, non-Skill bonuses." },
      { id: "system_identity_shift", text: "While shifted, World Dungeon identity systems display the assumed Race." },
      { id: "mimic_touch_prohibition", text: "Cannot touch mimic-type creatures." },
    ],
  }),
  officialRace("crocodilian", "Crocodilian", true, { label: "Large", value: 5 }, {
    stat_bonuses: { str: 4, con: 3 },
    skill_rank_bonuses: { pugilism: 2, powerful_strike: 2 },
    damage_resistance_bonus: 3,
    conditional_skill_advantage: [{ id: "intimidate", condition: "Physically menacing someone in person." }],
    effects: [
      { id: "full_meal_buff", text: "After a full meal, gain +1 Buff to all Skill Checks for 1 hour." },
      { id: "fatigued_charisma_disadvantage", text: "While Fatigued, all Charisma-based Checks have Disadvantage." },
    ],
  }),
  officialRace("doppelganger", "Doppelgänger", true, { label: "Unchanged", value: null }, {
    stat_bonuses: { con: 4, str: 3 },
    skill_rank_bonuses: { deception: 1, endurance: 1 },
    damage_resistance_bonus: 2,
    skill_check_advantage: ["escape_artist"],
    effects: [
      { id: "constitution_lifting", text: "May use Constitution instead of Strength to determine maximum lifting weight." },
      { id: "escape_while_held", text: "May make Escape Artist Checks while Held or watched." },
      { id: "incorporate_weapon", text: "Once per scene as an Action, incorporate a held weapon; it deals extra damage equal to Con Mod and cannot be disarmed." },
      { id: "doppelganger_shape_change", text: "As an Action, transform into a comparable-mass shape; mark 1 Health Bar slot per change. Specific imitation requires an Unopposed Deception Check." },
    ],
  }),
  officialRace("dwarf_classic", "Dwarf, Classic", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { con: 4, int: 2 },
    stat_penalties: { cha: -2 },
    skill_rank_bonuses: { endurance: 2 },
    pending_choices: ["Choose two different crafting Skills; each gains +3."],
    group_skill_rank_caps: [{ group: "crafting", cap: 20 }],
    senses: ["Can see in total darkness"],
    effects: [{ id: "elf_fairy_social_disadvantage", text: "Charisma-based Checks against elves or fairies have Disadvantage." }],
  }),
  officialRace("dwarf_fathom", "Dwarf, Fathom", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { con: 3, str: 2 },
    skill_rank_bonuses: { engineering: 3, dumpster_diving: 2, salvage: 2 },
    effects: [
      { id: "earth_check_advantage", text: "d20 Checks involving earth, rocks, or dirt have Advantage." },
      { id: "head_lizard_light", text: "Produce a 15ft Cone of light from a harmless head-lizard." },
    ],
  }),
  officialRace("elf_high", "Elf, High", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { int: 4, dex: 4, cha: 4 },
    skill_rank_bonuses: { intimidate: 2, lore: 1 },
    pending_choices: ["Choose two different Charisma-based Skills that may reach Rank 20."],
    effects: [
      { id: "intimidate_charisma", text: "Intimidate may use Charisma Mod." },
      { id: "natural_mana_regen", text: "Recover Mana at twice normal rate in a natural environment." },
      { id: "evade_d4", text: "Add 1d4 to Evade Checks." },
      { id: "dirty_social_disadvantage", text: "Charisma-based Checks against Dwarves, Rat-Kin, or anyone smelly or dirty have Disadvantage." },
    ],
  }),
  officialRace("elf_city", "Elf, City", true, { label: "Medium", value: 4 }, {
    pending_choices: ["Split +6 as desired among Intelligence, Dexterity, and Charisma."],
    skill_rank_bonuses: { good_first_impression: 3, negotiation: 2, streetwise: 2 },
    effects: [
      { id: "reassign_city_elf_stats", text: "Once per floor during a Long Rest, reassign the Race's Intelligence/Dexterity/Charisma Stat points." },
      { id: "settlement_contact", text: "On first entering a settlement, first Charisma-based Check has Advantage; Amazing Success or better creates a permanent contact." },
    ],
  }),
  officialRace("elf_night", "Elf, Night", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { int: 3, dex: 3 },
    skill_rank_bonuses: { acute_ears: 3, hide_in_shadows: 3 },
    skill_rank_caps: { hide_in_shadows: 20 },
    pending_choices: ["Choose one crafting Skill that may reach Rank 20."],
    senses: ["Can see in total darkness"],
    conditional_skill_advantage: [{ id: "hide_in_shadows", condition: "At night." }],
    effects: [{ id: "shadow_taunt", text: "Once per day, order a living creature's shadow to Taunt at Rank equal to Floor Number with no Stat Mod." }],
  }),
  officialRace("frost_maiden", "Frost Maiden", true, { label: "Petite", value: 3 }, {
    stat_bonuses: { cha: 2, int: 2, dex: 2 },
    skill_rank_bonuses: { persuasion: 2 },
    stat_check_advantage: ["int", "con"],
    effects: [
      { id: "ice_melee", text: "Melee attacks deal +1d4 Ice damage." },
      { id: "manager", text: "Your Game Guide becomes your Manager." },
      { id: "limited_flight", text: "Can fly for up to 1 minute per scene." },
    ],
  }),
  officialRace("human", "Human", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { str: 2, int: 2, con: 2, dex: 2, cha: 2 },
    progression: { ai_favor_per_level: 1 },
    effects: [
      { id: "floor_skill_advancement", text: "At floor end, make one Skill Advancement Check with Advantage if that Skill is Rank 9 or less." },
      { id: "favor_dr", text: "When damaged, spend 1 AI Favor to gain DR equal to Con; repeat while Favor remains." },
      { id: "daily_untrained_utility", text: "Once per day, an untrained non-Passive Utility Skill Check may be rolled as if Rank 2." },
      { id: "floor_debuff_remove", text: "Once per floor, spend an Action to remove one Debuff, including Injuries." },
    ],
  }),
  officialRace("igneous", "Igneous", true, { label: "Large", value: 5 }, {
    stat_bonuses: { con: 6, str: 4 },
    stat_penalties: { int: -2, cha: -2 },
    skill_rank_bonuses: { endurance: 1 },
    damage_resistance_bonus: 3,
    immunities: ["Fire"],
    vulnerabilities: ["Ice"],
    effects: [
      { id: "daily_double_move", text: "Once per day, double Move for 20 seconds." },
      { id: "fire_burst", text: "As an Action, make a Constitution Stat Check; on Success deal 1d8 + Floor Fire damage in a 5ft Burst." },
      { id: "harsh_heat", text: "No Survival Checks needed in harsh heat and can breathe underwater." },
      { id: "burrow", text: "Can burrow." },
      { id: "inventory_health_cost", text: "Lose 1 Health Bar slot each time you access Inventory (not Hotlist)." },
      { id: "conceal_disadvantage", text: "Checks to conceal your presence or nature have Disadvantage." },
    ],
  }),
  officialRace("lajabless", "Lajabless", true, { label: "Medium", value: 4 }, {
    pending_choices: ["Choose two Spells; each gains +2.", "Choose one Weapon Skill; it gains +3."],
    conditional_skill_advantage: [
      { id: "ambush", condition: "Always." },
      { id: "intimidate", condition: "Always." },
    ],
    effects: [
      { id: "day_night_stats", text: "During the day gain +5 Intelligence; during the night gain +5 Strength." },
      { id: "day_spell_cost", text: "During the day, Strength is halved and Spells cost half Mana." },
      { id: "night_spell_cost", text: "During the night, Strength is doubled and Spells cost double Mana." },
    ],
  }),
  officialRace("obsidian_butterfly", "Obsidian Butterfly", true, { label: "Medium", value: 4 }, {
    prerequisites: ["Any Edged Weapon Skill Rank 5+"],
    stat_bonuses: { dex: 3, int: 2 },
    stat_penalties: { con: -4 },
    skill_rank_bonuses: { intimidate: 2, slice_attack: 2 },
    pending_choices: ["Choose one Spell; it gains +2."],
    effects: [
      { id: "spell_wings", text: "Four wings can deliver touch- or melee-range Spells." },
      { id: "charisma_health", text: "May use Charisma Mod instead of Constitution Mod to determine Health Bar." },
      { id: "sixth_floor_wings_or_visage", text: "On entering Floor 6, choose stronger flight wings or Advantage when inspiring fear/respect." },
      { id: "evade_d4", text: "Add 1d4 to Evade Checks." },
    ],
  }),
  officialRace("primal", "Primal", true, { label: "Unchanged", value: null }, {
    stat_penalties: { str: -1, int: -1, con: -1, dex: -1, cha: -1 },
    skill_rank_caps: "all_to_20",
    effects: [{ id: "primal_base_race", text: "First apply the benefits of the crawler's current Race, then apply the Primal modifiers." }],
  }),
  officialRace("rat_hooligan", "Rat Hooligan", true, { label: "Petite", value: 3 }, {
    stat_bonuses: { dex: 2, con: 1 },
    skill_rank_bonuses: { escape_plan: 2, stealth: 2, bite: 1, survival: 1 },
    effects: [
      { id: "hunger_thirst_advantage", text: "Checks to resist hunger and thirst have Advantage." },
      { id: "rat_conversation", text: "Can converse with common house rats for minimal information in buildings." },
      { id: "bite_dex_damage", text: "May add Dexterity Mod to Bite damage instead of Strength Mod." },
    ],
  }),
  officialRace("sasquatch", "Sasquatch", true, { label: "Large", value: 5 }, {
    prerequisites: ["Smush Skill Rank 5+"],
    stat_bonuses: { str: 6, con: 6, dex: 2 },
    stat_penalties: { int: -3, cha: -1 },
    skill_rank_bonuses: { foot_soldier: 3, smush: 3 },
    skill_rank_caps: { smush: 20 },
  }),
  officialRace("tetrakai", "Tetrakai", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { dex: 6 },
    stat_penalties: { cha: -2 },
    skill_rank_bonuses: { pugilism: 2, wrasslin: 2 },
    group_skill_rank_bonuses: [{ group: "edged_weapons", bonus: 1 }],
    effects: [{ id: "four_arms", text: "Hands/Holding Gear can hold four items, or two two-handed weapons." }],
  }),
  officialRace("tigran", "Tigran", true, { label: "Medium", value: 4 }, {
    stat_bonuses: { dex: 3, str: 2 },
    stat_penalties: { cha: -4 },
    skill_rank_bonuses: { ambush: 2, cat_like_reflexes: 2, slice_attack: 2 },
    senses: ["Can see in total darkness"],
    damage_resistance_bonus: 1,
    movement_bonus_ft: 10,
    effects: [
      { id: "surprise_melee_double", text: "Melee attacks during a Surprise Action deal ×2 total damage." },
      { id: "fine_dex_disadvantage", text: "Dexterity-based Skills requiring fine manipulation or motor coordination have Disadvantage." },
    ],
  }),
  officialRace("bune", "Bune", false, { label: "Medium", value: 4 }, {
    prerequisites: ["Popularity 3+"],
    stat_bonuses: { int: 3, dex: 2 },
    stat_penalties: { con: -2 },
    skill_rank_bonuses: { determine_value: 3, fabricate: 3, negotiation: 3 },
    effects: [
      { id: "level_50_wings", text: "At Level 50 gain +2 Dexterity and wings capable of 500ft flight per scene." },
      { id: "combat_crit_popularity", text: "+1 Popularity on each combat Critical Hit." },
    ],
  }),
  officialRace("caprid", "Caprid", false, { label: "Large", value: 5 }, {
    stat_bonuses: { int: 3, cha: 3 },
    stat_penalties: { str: -2 },
    skill_rank_bonuses: { find_crawler: 3, investigation: 3, leadership: 3 },
    skill_rank_caps: { find_crawler: 20, persuasion: 20 },
    effects: [{ id: "charisma_spell_crit_popularity", text: "+1 Popularity on a Critical Hit with a Charisma Skill Check or a Spell Skill Check outside combat." }],
  }),
  officialRace("grulke", "Grulke", false, { label: "Medium", value: 4 }, {
    prerequisites: ["Jumping or Light on Your Feet Skill Rank 5+"],
    stat_bonuses: { dex: 3, str: 2 },
    stat_penalties: { cha: -2 },
    pending_choices: ["Choose Jumping or Light on Your Feet; chosen Skill gains +3.", "Choose one Reach Weapon Skill; it gains +2."],
    skill_rank_bonuses: { zone_of_control: 2 },
    granted_skills: [{
      id: "tongue_lashing",
      name: "Tongue Lashing",
      rank_rule: { kind: "floor_level", initial_rank_at_third_floor: 3 },
      text: "Ranged Dexterity attack, 30ft, 1d8 + Strength Bludgeoning; add 1d8 at Ranks 5, 10, and 15.",
    }],
    effects: [
      { id: "battalion_breastplate", text: "Gain a +2 DR breastplate with the Grulke Battalion crest." },
      { id: "troll_wrasslin", text: "Troll-type enemies have Advantage on Wrasslin' Checks against you and lick you on success." },
      { id: "troll_popularity", text: "+1 Popularity when licked by a troll-type enemy or after an Amazing+ Attack against one." },
      { id: "larger_foe_crit_popularity", text: "+1 Popularity on a Critical Hit against a larger foe." },
    ],
  }),
  officialRace("hobgoblin", "Hobgoblin", false, { label: "Medium", value: 4 }, {
    prerequisites: ["Explosives Handling Skill Rank 5+", "Any Trap-based Skill Rank 5+"],
    stat_bonuses: { dex: 1 },
    stat_penalties: { cha: -5 },
    stat_caps: { cha: 10 },
    skill_rank_bonuses: { regeneration: 1 },
    group_skill_rank_bonuses: [{ group: "trap_and_explosive", bonus: 3 }],
    group_skill_rank_caps: [{ group: "trap_and_explosive", cap: 20 }],
    effects: [
      { id: "sapper_workshops", text: "Free access to Hobgoblin Sapper Workshops." },
      { id: "trap_explosive_advancement", text: "At floor end, one Explosive or Trap-based Skill Advancement Check has Advantage." },
      { id: "trap_kill_popularity", text: "+1 Popularity once per scene when you kill an enemy with a trap or explosive." },
    ],
  }),
  officialRace("pocket_kuma", "Pocket Kuma", false, { label: "Small", value: 2 }, {
    animal: true,
    stat_bonuses: { dex: 5, cha: 5 },
    stat_penalties: { str: -4, con: -4 },
    stat_caps: { str: 10 },
    skill_rank_bonuses: { bite: 2, dodge: 2, slice_attack: 2, ambush: 1 },
    skill_rank_caps: { light_on_your_feet: 20 },
    stat_skill_advantage: ["cha"],
    senses: ["Can see in total darkness"],
    vulnerabilities: ["Bludgeoning"],
    effects: [
      { id: "no_fall_damage", text: "Take no damage from falling." },
      { id: "half_strength_weapon_damage", text: "Deal half damage with Strength-based melee weapons." },
      { id: "surprise_or_evade_popularity", text: "+1 Popularity when acting in a Surprise Round or rolling a Critical Fail on Evade." },
    ],
  }),
  officialRace("pterolykos", "Pterolykos", false, { label: "Medium", value: 4 }, {
    stat_bonuses: { cha: 4, dex: 2 },
    skill_rank_bonuses: { bite: 3, performance: 3, tracking: 3, diplomacy: 1 },
    effects: [
      { id: "limited_flight", text: "Wings allow flight for up to 50 seconds per scene." },
      { id: "emotion_presence_disadvantage", text: "Checks to conceal emotion or presence have Disadvantage." },
      { id: "charisma_crit_popularity", text: "+1 Popularity on a Critical Hit with a Charisma Skill Check." },
    ],
  }),
  officialRace("skyfowl", "Skyfowl", false, { label: "Medium", value: 4 }, {
    stat_bonuses: { dex: 3, cha: 3 },
    stat_penalties: { str: -1, con: -1 },
    skill_rank_bonuses: { slice_attack: 2 },
    group_skill_rank_bonuses: [{ group: "charisma_based", bonus: 2 }],
    conditional_skill_advantage: [{ id: "perception", condition: "Observing something 10+ feet away." }],
    effects: [
      { id: "flight", text: "Can fly for up to 3 minutes per scene; Cleric-based Classes reduce this to 10-second hops." },
      { id: "skill_crit_popularity", text: "+1 Popularity on Critical Hits with Leadership, Perception, Persuasion, or Taunt." },
    ],
  }),
];

export const OFFICIAL_THIRD_FLOOR_RACE_CATALOG = Object.fromEntries(
  OFFICIAL_THIRD_FLOOR_RACES.map((entry) => [entry.id, entry])
);

export const CUSTOM_THIRD_FLOOR_RACES = [
  {
    id: "nigh",
    name: "Nigh",
    race_type: "Custom Race",
    source_stage: "third_floor",
    source: "user_supplied",
    earth_race: true,
    class_access: ["Earth-based"],
    size: { label: "Medium", value: 4 },
    stat_bonuses: { str: 2, int: 2, con: 2, dex: 2, cha: 2 },
    stat_penalties: { cha: -2 },
    skill_rank_bonuses: {
      hide_in_shadows: 3,
      dumpster_diving: 2,
    },
    skill_rank_caps: {
      hide_in_shadows: 20,
      one_crafting_skill_of_choice: 20,
    },
    senses: ["Can see in total darkness"],
    progression: {
      ai_favor_per_level: 1,
    },
    rewards: [
      {
        id: "silver_earth_box",
        text:
          "Gain a Silver Earth Box guaranteed to contain a mostly-useless Earth Hobby Potion that grants 3 ranks in a Skill and access to Earth Classes.",
      },
    ],
  },
  {
    id: "ginger",
    name: "Ginger",
    race_type: "Alien / Earth Race",
    source_stage: "third_floor",
    source: "user_supplied",
    earth_race: true,
    alien_race: true,
    hybrid: true,
    class_access: ["Earth-based", "Alien-based"],
    size: { label: "Medium", value: 4 },
    stat_bonuses: { con: 5, cha: 3 },
    damage_resistance_bonus: 3,
    spell_rank_bonuses: {
      hot_stuff_aura: 1,
      panty_dropper: 1,
      soul_collector: 1,
    },
    spell_rank_caps: {
      hot_stuff_aura: 20,
      panty_dropper: 20,
      soul_collector: 20,
    },
    immunities: ["Electric", "Acid"],
    vulnerabilities: ["Fire", "Ice"],
    effects: [
      {
        id: "soul_collector_popularity",
        text: "+1 Popularity when you roll a Critical Hit on Soul Collector.",
      },
      {
        id: "soul_collector_heal",
        text:
          "Heal 1 Health Bar slot when you damage or kill a creature with Soul Collector, up to 5 Health Bars per combat scene.",
      },
      {
        id: "odontophile_serial_killer_social_penalty",
        text:
          "Disadvantage on Good First Impression, Negotiation, and Persuasion checks toward odontophiles and serial killers; doubled if both apply.",
      },
    ],
  },
  {
    id: "nullian",
    name: "Nullian",
    race_type: "Alien Race",
    source_stage: "third_floor",
    source: "user_supplied",
    earth_race: false,
    alien_race: true,
    size: { label: "Medium", value: 4 },
    stat_bonuses: { int: 5 },
    stat_penalties: { cha: -4 },
    skill_rank_bonuses: { pathfinder: 1 },
    skill_rank_caps: {
      detect_lies: 20,
      detect_trap: 20,
      investigation: 20,
      pathfinder: 20,
      perception: 20,
      streetwise: 20,
    },
    senses: ["Can see in total darkness"],
    effects: [
      {
        id: "intelligence_check_advantage",
        text: "Advantage on all Intelligence Checks.",
      },
      {
        id: "equal_rights_attorney",
        text:
          "Gain access to an Equal Rights Attorney who argues on the crawler's behalf against Syndicate or Showrunner decisions that negatively impact the crawler.",
      },
      {
        id: "floor_advancement_bonus",
        text:
          "At the end of each floor, add 1 to Detect Lies, Investigation, and Streetwise Skill Advancement Checks.",
      },
      {
        id: "syndicate_social_disadvantage",
        text:
          "Disadvantage during social interactions with any Syndicate race, including Good First Impression checks, interviews, and sponsorships.",
      },
    ],
  },
  {
    id: "soother_forsoothed",
    name: "Soother (Forsoothed)",
    aliases: ["Soother", "Forsoothed"],
    race_type: "Alien Race",
    source_stage: "third_floor",
    source: "user_supplied",
    earth_race: false,
    alien_race: true,
    stat_bonuses: { int: 3, cha: 3 },
    stat_penalties: { str: -2 },
    skill_rank_bonuses: {
      detect_lies: 3,
      find_crawler: 3,
      persuasion: 3,
    },
    skill_rank_caps: {
      find_crawler: 20,
      persuasion: 20,
    },
    effects: [
      {
        id: "critical_popularity",
        text:
          "+1 Popularity each time you roll a Critical Hit on a Charisma Skill Check or on a Spell Skill Check outside of combat.",
      },
    ],
  },
  {
    id: "redacted_asset",
    name: "Redacted Asset",
    race_type: "Earth Race",
    source_stage: "third_floor",
    source: "user_supplied",
    earth_race: true,
    class_access: ["Earth-based"],
    size: { label: "Medium", value: 4 },
    build_points: {
      benefits_spent: 26,
      detriment_credit: 1,
      net_spent: 25,
      total: 25,
    },
    build_breakdown: [
      { benefit: "Constitution +4", points: 4 },
      { benefit: "Dexterity +3", points: 3 },
      { benefit: "Intelligence +2", points: 2 },
      { benefit: "Dodge Skill +2", points: 4 },
      { benefit: "Escape Artist Skill +2", points: 4 },
      { benefit: "Endurance Skill +2", points: 4 },
      { benefit: "Can see in total darkness", points: 1 },
      { benefit: "+5 ft Move", points: 3 },
      { benefit: "Dodge may reach Rank 20", points: 1 },
      { detriment: "Charisma -2", points_credit: 1 },
    ],
    description:
      "Congratulations, crawler. Your paperwork has been reviewed, misplaced, reclassified, shredded, reconstructed, and then redacted for reasons nobody is willing to explain. You look human enough until someone checks the records and discovers you officially died in 1987, were born in 2004, and currently owe parking tickets in three countries that do not exist. Redacted Assets are durable, quick, difficult to restrain, and unusually talented at leaving situations before anyone can ask a second question. The Dungeon assures you this is all perfectly normal.",
    stat_bonuses: { con: 4, dex: 3, int: 2 },
    stat_penalties: { cha: -2 },
    skill_rank_bonuses: {
      dodge: 2,
      escape_artist: 2,
      endurance: 2,
    },
    skill_rank_caps: {
      dodge: 20,
    },
    senses: ["Can see in total darkness"],
    movement_bonus_ft: 5,
    effects: [
      {
        id: "move_bonus",
        move_bonus_ft: 5,
        text:
          "+5 ft Move. When someone says, 'Hold on, I just have one question,' you are already halfway down the corridor.",
      },
    ],
    rewards: [
      {
        id: "silver_earth_box",
        text:
          "Gain a Silver Earth Box with a guaranteed Earth Hobby Potion. The label has been blacked out, naturally.",
      },
    ],
  },
];

export const CUSTOM_THIRD_FLOOR_RACE_CATALOG = Object.fromEntries(
  CUSTOM_THIRD_FLOOR_RACES.map((entry) => [entry.id, entry])
);

export const THIRD_FLOOR_RACE_CATALOG = {
  ...OFFICIAL_THIRD_FLOOR_RACE_CATALOG,
  ...CUSTOM_THIRD_FLOOR_RACE_CATALOG,
};

export const THIRD_FLOOR_RACE_COUNTS = {
  official: OFFICIAL_THIRD_FLOOR_RACES.length,
  custom: CUSTOM_THIRD_FLOOR_RACES.length,
  total: OFFICIAL_THIRD_FLOOR_RACES.length + CUSTOM_THIRD_FLOOR_RACES.length,
};
