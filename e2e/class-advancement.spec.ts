import { test, expect } from "@playwright/test";
import { dungeonCrawlerCarlProfile } from "../src/rules-profile/adapters/dungeon_crawler_carl/index.js";
import {
  THIRD_FLOOR_CLASS_CATALOG,
} from "../src/rules-profile/adapters/dungeon_crawler_carl/classCatalog.js";
import {
  THIRD_FLOOR_RACE_CATALOG,
} from "../src/rules-profile/adapters/dungeon_crawler_carl/raceCatalog.js";
import {
  applyThirdFloorRace,
  applyThirdFloorClass,
  applyCharacterActorFloor,
  characterActorClassOptions,
  classBenefitBullets,
  needsThirdFloorRace,
  needsThirdFloorClass,
} from "../src/components/character/advancement/classAdvancement.js";

const baseSheet = () => ({
  name: "Test Crawler",
  info: { race: "Human", class: "", level: 9, floor: 3 },
  attrs: { str: 5, dex: 5, con: 5, int: 5, cha: 5 },
  hp: 20,
  maxHp: 20,
  mana: 5,
  maxMana: 5,
  defense: { resist: "", evade: "", move: 20, step: 10, favor: 1 },
  attacks: [],
  spells: [],
  hotbar: [],
  gear: {},
  inventory: [],
  currency: {},
  notes: "",
  profile: { systemKey: "dungeon_crawler_carl" },
  rulesetData: {
    stats: Object.fromEntries(
      ["str", "dex", "con", "int", "cha"].map((k) => [k, { enhanced: 5, unenhanced: 5, mod: 2 }])
    ),
    skills: [],
    advancement: {},
    identity: {},
  },
});

test("Health Embezzeler applies once to the canonical sheet", async () => {
  const cls = THIRD_FLOOR_CLASS_CATALOG.health_embezzeler;
  const first = applyThirdFloorClass(dungeonCrawlerCarlProfile, baseSheet(), cls, 3);

  expect(first.info.class).toBe("Health Embezzeler");
  expect(first.attrs.int).toBe(6);
  expect(first.attrs.con).toBe(6);
  expect(first.maxHp).toBe(30);
  expect(first.maxMana).toBe(6);
  expect(first.rulesetData.skills.find((s) => s.id === "drain_life")?.rank).toBe(2);
  expect(first.rulesetData.skills.find((s) => s.id === "draining_shadows")?.rank).toBe(3);
  expect(first.attacks.some((a) => a.name === "Draining Shadows")).toBeTruthy();

  const second = applyThirdFloorClass(dungeonCrawlerCarlProfile, first, cls, 3);
  expect(second.attrs.int).toBe(6);
  expect(second.attrs.con).toBe(6);
});

test("Former Child Actor gets three stable offers and replaces temporary floor benefits", async () => {
  const former = THIRD_FLOOR_CLASS_CATALOG.former_child_actor;
  let sheet = applyThirdFloorClass(dungeonCrawlerCarlProfile, baseSheet(), former, 3);
  expect(sheet.rulesetData.skills.find((s) => s.id === "character_actor")?.rank).toBe(3);

  const offersA = characterActorClassOptions(THIRD_FLOOR_CLASS_CATALOG, 3, "crawler-7", 3);
  const offersB = characterActorClassOptions(THIRD_FLOOR_CLASS_CATALOG, 3, "crawler-7", 3);
  expect(offersA).toHaveLength(3);
  expect(offersA.map((x) => x.id)).toEqual(offersB.map((x) => x.id));

  const storm = THIRD_FLOOR_CLASS_CATALOG.storm_lancer;
  const granted = classBenefitBullets(storm).map((b, index) => ({ ...b, index, roll: 2, granted: true }));
  sheet = applyCharacterActorFloor(dungeonCrawlerCarlProfile, sheet, storm, granted, 3);
  expect(sheet.attrs.str).toBe(7);

  sheet.info.floor = 4;
  const health = THIRD_FLOOR_CLASS_CATALOG.health_embezzeler;
  const missed = classBenefitBullets(health).map((b, index) => ({ ...b, index, roll: 1, granted: false }));
  sheet = applyCharacterActorFloor(dungeonCrawlerCarlProfile, sheet, health, missed, 4);
  expect(sheet.attrs.str).toBe(5);
  expect(sheet.rulesetData.skills.find((s) => s.id === "character_actor")?.rank).toBe(4);
});


test("Gray Man applies its complete 30-point build", async () => {
  const cls = THIRD_FLOOR_CLASS_CATALOG.gray_man_field_operative;
  const sheet = applyThirdFloorClass(dungeonCrawlerCarlProfile, baseSheet(), cls, 3);

  expect(sheet.attrs.int).toBe(9);
  expect(sheet.attrs.dex).toBe(8);
  expect(sheet.attrs.con).toBe(8);
  expect(sheet.rulesetData.skills.find((s) => s.id === "investigation")?.rank).toBe(3);
  expect(sheet.rulesetData.skills.find((s) => s.id === "stealth")?.rank).toBe(2);
  expect(sheet.rulesetData.skills.find((s) => s.id === "tactics")?.rank).toBe(2);
  expect(sheet.rulesetData.skillRankCaps.investigation).toBe(20);
  expect(sheet.rulesetData.skillCheckAdvantages).toContain("investigation");
});


test("Nigh applies +2 all Stats and -2 Charisma for net zero Charisma", async () => {
  const race = THIRD_FLOOR_RACE_CATALOG.nigh;
  const first = applyThirdFloorRace(dungeonCrawlerCarlProfile, baseSheet(), race, 3);

  expect(first.attrs.str).toBe(7);
  expect(first.attrs.int).toBe(7);
  expect(first.attrs.con).toBe(7);
  expect(first.attrs.dex).toBe(7);
  expect(first.attrs.cha).toBe(5);
  expect(first.rulesetData.advancement.thirdFloor.raceId).toBe("nigh");

  const second = applyThirdFloorRace(dungeonCrawlerCarlProfile, first, race, 3);
  expect(second.attrs.str).toBe(7);
  expect(second.attrs.cha).toBe(5);
});

test("Redacted Asset applies before Gray Man and both stack once", async () => {
  let sheet = baseSheet();
  expect(needsThirdFloorRace(sheet)).toBeTruthy();
  expect(needsThirdFloorClass(sheet)).toBeFalsy();

  sheet = applyThirdFloorRace(
    dungeonCrawlerCarlProfile,
    sheet,
    THIRD_FLOOR_RACE_CATALOG.redacted_asset,
    3
  );

  expect(sheet.info.race).toBe("Redacted Asset");
  expect(sheet.info.size).toBe("Medium (4)");
  expect(sheet.attrs.con).toBe(9);
  expect(sheet.attrs.dex).toBe(8);
  expect(sheet.attrs.int).toBe(7);
  expect(sheet.attrs.cha).toBe(3);
  expect(sheet.defense.move).toBe(25);
  expect(sheet.rulesetData.skills.find((s) => s.id === "dodge")?.rank).toBe(2);
  expect(sheet.rulesetData.skills.find((s) => s.id === "escape_artist")?.rank).toBe(2);
  expect(sheet.rulesetData.skills.find((s) => s.id === "endurance")?.rank).toBe(2);
  expect(sheet.rulesetData.skillRankCaps.dodge).toBe(20);
  expect(sheet.rulesetData.senses).toContain("Can see in total darkness");
  expect(needsThirdFloorRace(sheet)).toBeFalsy();
  expect(needsThirdFloorClass(sheet)).toBeTruthy();

  sheet = applyThirdFloorClass(
    dungeonCrawlerCarlProfile,
    sheet,
    THIRD_FLOOR_CLASS_CATALOG.gray_man_field_operative,
    3
  );

  expect(sheet.info.class).toBe("Gray Man Field Operative");
  expect(sheet.attrs.int).toBe(11);
  expect(sheet.attrs.dex).toBe(11);
  expect(sheet.attrs.con).toBe(12);
  expect(sheet.attrs.cha).toBe(3);
  expect(sheet.rulesetData.skills.find((s) => s.id === "investigation")?.rank).toBe(3);
  expect(sheet.rulesetData.skills.find((s) => s.id === "stealth")?.rank).toBe(2);
  expect(sheet.rulesetData.skills.find((s) => s.id === "tactics")?.rank).toBe(2);
});
