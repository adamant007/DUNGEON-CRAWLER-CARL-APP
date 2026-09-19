/* Starting gear data — dungeon_crawler_carl.
   Structure for the Starting Gear wizard step: PHYSICAL POSSESSIONS a
   First-Floor crawler enters the dungeon with. Skill knowledge is separate
   from physical gear — nothing here grants or removes Skills. Concise
   Ginger Dragon summaries only (no rulebook prose, no flavor text). */

/* Example loadouts — inspiration ONLY, never required presets. Each entry
   may fill clothing, useful item, and weird stuff; weaponSkillId /
   weaponExample are DISPLAY info about the source example and are NEVER
   applied over the player's Step 6 weapon choice. */
export const STARTING_GEAR_EXAMPLES = [
  {
    id: "athlete",
    label: "Athlete",
    clothing: "Jogging attire",
    usefulItem: "Headphones / music player",
    weirdStuff: ["Unusual personal item"],
    weaponSkillId: "club",
    weaponExample: "Barbell",
  },
  {
    id: "gaming_geek",
    label: "Gaming Geek",
    clothing: "T-shirt, hoodie, jeans",
    usefulItem: "Game book / novel",
    weirdStuff: ["Novelty gaming junk"],
    weaponSkillId: "longsword",
    weaponExample: "Boffer sword",
  },
  {
    id: "militant",
    label: "Militant",
    clothing: "Military fatigues",
    usefulItem: "Snacks",
    weirdStuff: ["Morale patch"],
    weaponSkillId: "handgun",
    weaponExample: "Handgun",
  },
  {
    id: "outdoorsy",
    label: "Outdoorsy",
    clothing: "Climate-appropriate outdoor apparel",
    usefulItem: "Lighter",
    weirdStuff: ["Small outdoor novelty item"],
    weaponSkillId: "bow",
    weaponExample: "Bow",
  },
];

/* Useful-item suggestions — free text with quick-pick chips; suggestions
   only, never a restriction. Ordinary starting items carry no mechanical
   bonuses. */
export const USEFUL_ITEM_EXAMPLES = [
  "Lighter",
  "Headphones",
  "Game book",
  "Snacks",
  "Basic tool",
  "Phone",
  "Small personal item",
];