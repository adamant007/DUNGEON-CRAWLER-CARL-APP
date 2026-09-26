import { test, expect } from "@playwright/test";
import { dungeonCrawlerCarlProfile } from "../src/rules-profile/adapters/dungeon_crawler_carl/index.js";
import {
  blankBuild,
  buildEntry,
  buildMath,
  focusBuild,
  validateBuild,
} from "../src/components/character/homebrew/homebrewBuildRules.js";
import {
  applyThirdFloorRace,
  applyThirdFloorClass,
} from "../src/components/character/advancement/classAdvancement.js";
import {
  optionEligibility,
} from "../src/components/character/advancement/progression.js";

const baseSheet = () => ({
  name: "Builder Test",
  info: { race: "Human", class: "", level: 9, floor: 3, size: "Medium (4)" },
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
    stats: Object.fromEntries(["str", "int", "con", "dex", "cha"].map((k) => [k, { enhanced: 5, unenhanced: 5, mod: 0 }])),
    skills: [],
    identity: {},
    advancement: { thirdFloor: {} },
    achievements: [],
  },
});

test("guided Race build uses the 25 BP budget and prices Small at 3 BP", async () => {
  const build = blankBuild("race");
  build.name = "Pocket Test";
  build.size = "Small";
  build.statBonuses.dex = 5;
  build.skillBonuses.dodge = 2;
  build.specials.push("darkvision");

  const math = buildMath(build);
  expect(math.base).toBe(25);
  expect(math.sizeCost).toBe(3);
  expect(math.benefitsSpent).toBe(13);
  expect(validateBuild(build).legal).toBeTruthy();
});

test("guided Class build uses the 30 BP budget and max five drawback credit", async () => {
  const build = blankBuild("class");
  build.name = "Red Tape Survivor";
  build.statBonuses.int = 10;
  build.statBonuses.con = 10;
  build.statBonuses.dex = 10;
  expect(buildMath(build).benefitsSpent).toBe(30);
  expect(validateBuild(build).legal).toBeTruthy();

  build.statPenalties.cha = -10;
  expect(buildMath(build).detrimentCredit).toBe(5);
  expect(validateBuild(build).legal).toBeTruthy();

  build.statPenalties.str = -2;
  expect(buildMath(build).rawDetrimentCredit).toBe(6);
  expect(validateBuild(build).legal).toBeFalsy();
});

test("focus helper gives the player a legal starter instead of blank mechanics", async () => {
  const build = focusBuild("class", "brainy");
  build.name = "Very Normal Analyst";
  const validation = validateBuild(build);
  expect(validation.legal).toBeTruthy();
  expect(build.statBonuses.int).toBe(4);
  expect(build.skillBonuses.investigation).toBe(2);
  expect(build.skillBonuses.tactics).toBe(2);
});

test("saved custom Race serializes into the same structure the Floor 3 engine applies", async () => {
  const build = blankBuild("race");
  build.name = "Corridor Goblin";
  build.earth = true;
  build.statBonuses.con = 3;
  build.statBonuses.dex = 2;
  build.skillBonuses.dodge = 2;
  build.rank20.push("dodge");
  build.specials.push("move_5");

  const built = buildEntry(build, dungeonCrawlerCarlProfile.skills.catalog);
  expect(built.ok).toBeTruthy();
  expect(built.entry.source).toBe("user_created");
  expect(optionEligibility(built.entry, baseSheet(), dungeonCrawlerCarlProfile, "race").eligible).toBeTruthy();

  const sheet = applyThirdFloorRace(dungeonCrawlerCarlProfile, baseSheet(), built.entry, 3);
  expect(sheet.info.race).toBe("Corridor Goblin");
  expect(sheet.attrs.con).toBe(8);
  expect(sheet.attrs.dex).toBe(7);
  expect(sheet.defense.move).toBe(25);
  expect(sheet.rulesetData.skillRankCaps.dodge).toBe(20);
});

test("saved custom Class applies its guided mechanics after an Earth Race", async () => {
  const build = blankBuild("class");
  build.name = "Extremely Retired Analyst";
  build.earth = true;
  build.classType = "Rogue";
  build.statBonuses.int = 4;
  build.statBonuses.con = 3;
  build.skillBonuses.investigation = 2;
  build.advantageSkills.push("investigation");
  build.advantageStats.push("int");

  const built = buildEntry(build, dungeonCrawlerCarlProfile.skills.catalog);
  expect(built.ok).toBeTruthy();

  const source = baseSheet();
  source.rulesetData.advancement.thirdFloor = { raceId: "human", raceEarthBased: true };
  expect(optionEligibility(built.entry, source, dungeonCrawlerCarlProfile, "class").eligible).toBeTruthy();

  const sheet = applyThirdFloorClass(dungeonCrawlerCarlProfile, source, built.entry, 3);
  expect(sheet.info.class).toBe("Extremely Retired Analyst");
  expect(sheet.attrs.int).toBe(9);
  expect(sheet.attrs.con).toBe(8);
  expect(sheet.rulesetData.skillCheckAdvantages).toContain("investigation");
  expect(sheet.rulesetData.statSkillCheckAdvantages).toContain("int");
});

test("guided custom Class cannot exceed the normal build budget", async () => {
  const build = blankBuild("class");
  build.name = "Definitely Balanced";
  build.statBonuses.int = 31;
  const result = validateBuild(build);
  expect(result.legal).toBeFalsy();
  expect(result.errors.some((x) => x.includes("over budget"))).toBeTruthy();
});
