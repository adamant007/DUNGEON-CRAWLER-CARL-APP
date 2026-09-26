import { test, expect } from "@playwright/test";
import { dungeonCrawlerCarlProfile } from "../src/rules-profile/adapters/dungeon_crawler_carl/index.js";
import { THIRD_FLOOR_RACE_CATALOG } from "../src/rules-profile/adapters/dungeon_crawler_carl/raceCatalog.js";
import { THIRD_FLOOR_CLASS_CATALOG } from "../src/rules-profile/adapters/dungeon_crawler_carl/classCatalog.js";
import {
  allocateStatPoints,
  descendFloor,
  eligibleCatalog,
  initializeThirdFloorStatPool,
  levelUpCharacter,
  optionEligibility,
  progressionState,
} from "../src/components/character/advancement/progression.js";

const sheet = ({ level = 9, floor = 2 } = {}) => ({
  name: "Progression Test",
  info: { race: "Human", class: "", level, floor, size: "Medium (4)" },
  attrs: { str: 5, int: 5, con: 5, dex: 5, cha: 5 },
  hp: 20,
  maxHp: 20,
  mana: 5,
  maxMana: 5,
  defense: { resist: "", evade: "", move: 20, step: 10, favor: 1 },
  attacks: [],
  spells: [],
  inventory: [],
  hotbar: [],
  rulesetData: {
    stats: Object.fromEntries(
      ["str", "int", "con", "dex", "cha"].map((k) => [
        k,
        { enhanced: 5, unenhanced: 5, mod: 0 },
      ])
    ),
    skills: [],
    identity: {
      popularity: 0,
      gender: "Male",
      startingSpecies: { species: "Human", label: "Human" },
    },
    advancement: {},
    achievements: [],
  },
});

test("entering Floor 3 creates the correct accumulated Tutorial-floor Stat pool", async () => {
  const s = initializeThirdFloorStatPool(sheet({ level: 9, floor: 3 }));
  expect(progressionState(s).statPointsAvailable).toBe(24);
  expect(progressionState(s).statPointsEarned).toBe(24);

  const second = initializeThirdFloorStatPool(s);
  expect(progressionState(second).statPointsAvailable).toBe(24);
});

test("Stat allocation permanently raises Enhanced and Unenhanced Stats", async () => {
  let s = initializeThirdFloorStatPool(sheet({ level: 9, floor: 3 }));
  const result = allocateStatPoints(dungeonCrawlerCarlProfile, s, {
    str: 4,
    int: 5,
    con: 7,
    dex: 5,
    cha: 3,
  });
  expect(result.ok).toBeTruthy();
  s = result.sheet;
  expect(progressionState(s).statPointsAvailable).toBe(0);
  expect(s.attrs).toEqual({ str: 9, int: 10, con: 12, dex: 10, cha: 8 });
  expect(s.rulesetData.stats.con.enhanced).toBe(12);
  expect(s.rulesetData.stats.con.unenhanced).toBe(12);
});

test("Level Up on Floor 3 adds one Level and three banked Stat points", async () => {
  let s = initializeThirdFloorStatPool(sheet({ level: 9, floor: 3 }));
  s = allocateStatPoints(dungeonCrawlerCarlProfile, s, { str: 24 }).sheet;
  const result = levelUpCharacter(s);
  expect(result.sheet.info.level).toBe(10);
  expect(result.statPointsGained).toBe(3);
  expect(progressionState(result.sheet).statPointsAvailable).toBe(3);
});

test("Level Up on Tutorial floors records Level but defers Stat points until Floor 3", async () => {
  const result = levelUpCharacter(sheet({ level: 8, floor: 2 }));
  expect(result.sheet.info.level).toBe(9);
  expect(result.statPointsGained).toBe(0);
  expect(progressionState(result.sheet).statPointsAvailable).toBe(0);

  const descended = descendFloor(dungeonCrawlerCarlProfile, result.sheet, () => 0.99);
  expect(descended.to).toBe(3);
  expect(progressionState(descended.sheet).statPointsAvailable).toBe(24);
});

test("floor descent resolves marked Rank-5+ Skill Advancement checks", async () => {
  const s = sheet({ level: 9, floor: 3 });
  s.rulesetData.skills = [
    { id: "dodge", name: "Dodge", rank: 5, advancement_mark: true },
    { id: "stealth", name: "Stealth", rank: 4, advancement_mark: true },
  ];
  const result = descendFloor(dungeonCrawlerCarlProfile, s, () => 0.99);
  expect(result.to).toBe(4);
  expect(result.rolls).toHaveLength(1);
  expect(result.rolls[0].name).toBe("Dodge");
  expect(result.rolls[0].success).toBeTruthy();
  expect(result.sheet.rulesetData.skills.find((x) => x.id === "dodge")?.rank).toBe(6);
  expect(result.sheet.rulesetData.skills.find((x) => x.id === "dodge")?.advancement_mark).toBe(false);
  expect(result.sheet.rulesetData.skills.find((x) => x.id === "stealth")?.advancement_mark).toBe(true);
});

test("Race eligibility checks live Skill Rank prerequisites", async () => {
  const s = sheet({ level: 9, floor: 3 });
  s.rulesetData.skills = [{ id: "dodge", name: "Dodge", rank: 5, stat: "DEX" }];
  expect(optionEligibility(THIRD_FLOOR_RACE_CATALOG.amazonian, s, dungeonCrawlerCarlProfile, "race").eligible).toBeTruthy();
  expect(optionEligibility(THIRD_FLOOR_RACE_CATALOG.sasquatch, s, dungeonCrawlerCarlProfile, "race").eligible).toBeFalsy();
});

test("Class eligibility checks Popularity, Achievement, and Earth compatibility", async () => {
  const s = sheet({ level: 9, floor: 3 });
  s.rulesetData.advancement.thirdFloor = { raceId: "human", raceEarthBased: true };
  s.rulesetData.identity.popularity = 3;

  const former = THIRD_FLOOR_CLASS_CATALOG.former_child_actor;
  expect(optionEligibility(former, s, dungeonCrawlerCarlProfile, "class").eligible).toBeFalsy();

  s.rulesetData.achievements = ["Cut!"];
  expect(optionEligibility(former, s, dungeonCrawlerCarlProfile, "class").eligible).toBeTruthy();

  s.rulesetData.advancement.thirdFloor.raceEarthBased = false;
  expect(optionEligibility(THIRD_FLOOR_CLASS_CATALOG.gray_man_field_operative, s, dungeonCrawlerCarlProfile, "class").eligible).toBeFalsy();
});

test("eligible catalogs exclude options the crawler cannot legally select", async () => {
  const s = sheet({ level: 9, floor: 3 });
  const races = eligibleCatalog(THIRD_FLOOR_RACE_CATALOG, s, dungeonCrawlerCarlProfile, "race");
  expect(races.sasquatch).toBeUndefined();
  expect(races.human).toBeDefined();
});
