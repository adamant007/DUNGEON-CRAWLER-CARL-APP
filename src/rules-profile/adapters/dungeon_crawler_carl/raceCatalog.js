/* User-supplied Third-Floor race catalog.
   These entries are custom/homebrew material supplied by the user and are kept
   separate from official Core Rulebook data. */

export const CUSTOM_THIRD_FLOOR_RACES = [
  {
    id: "nigh",
    name: "Nigh",
    race_type: "Custom Race",
    source_stage: "third_floor",
    source: "user_supplied",
    size: { label: "Medium", value: 4 },
    stat_bonuses: { str: 2, int: 2, con: 2, dex: 2, cha: 0 },
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
];

export const CUSTOM_THIRD_FLOOR_RACE_CATALOG = Object.fromEntries(
  CUSTOM_THIRD_FLOOR_RACES.map((entry) => [entry.id, entry])
);

export const THIRD_FLOOR_RACE_COUNTS = {
  custom: CUSTOM_THIRD_FLOOR_RACES.length,
  total: CUSTOM_THIRD_FLOOR_RACES.length,
};
