import { test, expect } from "@playwright/test";
import {
  OFFICIAL_THIRD_FLOOR_CLASS_CATALOG,
  THIRD_FLOOR_CLASS_CATALOG,
  THIRD_FLOOR_CLASS_COUNTS,
} from "../src/rules-profile/adapters/dungeon_crawler_carl/classCatalog.js";
import {
  CUSTOM_THIRD_FLOOR_RACE_CATALOG,
  THIRD_FLOOR_RACE_COUNTS,
} from "../src/rules-profile/adapters/dungeon_crawler_carl/raceCatalog.js";

test("third-floor class catalog keeps every imported class entry", async () => {
  expect(THIRD_FLOOR_CLASS_COUNTS.official).toBe(52);
  expect(THIRD_FLOOR_CLASS_COUNTS.custom).toBe(7);
  expect(THIRD_FLOOR_CLASS_COUNTS.total).toBe(59);

  expect(Object.keys(OFFICIAL_THIRD_FLOOR_CLASS_CATALOG)).toHaveLength(52);
  expect(Object.keys(THIRD_FLOOR_CLASS_CATALOG)).toHaveLength(59);

  expect(THIRD_FLOOR_CLASS_CATALOG.boring_ol_arcanist?.name).toBe("Boring Ol’ Arcanist");
  expect(THIRD_FLOOR_CLASS_CATALOG.swashbuckler?.class_types).toEqual(["Bard", "Fighter", "Rogue"]);
  expect(THIRD_FLOOR_CLASS_CATALOG.health_embezzeler?.earth_class).toBe(true);
  expect(
    THIRD_FLOOR_CLASS_CATALOG.health_embezzeler?.passive_skills?.find((s) => s.id === "reallocate")
      ?.target?.range_feet
  ).toBe(30);
});


test("user-supplied third-floor additions remain complete", async () => {
  expect(THIRD_FLOOR_CLASS_CATALOG.storm_lancer?.earth_class).toBe(true);
  expect(THIRD_FLOOR_CLASS_CATALOG.conspirators?.stat_caps?.int).toBe(10);
  expect(THIRD_FLOOR_CLASS_CATALOG.sports_entertainer?.class_types).toEqual(["Barbarian", "Bard"]);
  expect(THIRD_FLOOR_CLASS_CATALOG.carney_promoter?.class_types).toEqual(["Bard", "Rogue"]);
  expect(THIRD_FLOOR_CLASS_CATALOG.ripper_rogue?.skill_rank_bonuses?.stealth).toBe(3);
  expect(THIRD_FLOOR_CLASS_CATALOG.gray_man_field_operative?.build_points).toEqual({ spent: 30, total: 30 });
  expect(THIRD_FLOOR_CLASS_CATALOG.gray_man_field_operative?.stat_bonuses).toEqual({ int: 4, dex: 3, con: 3 });
  expect(THIRD_FLOOR_CLASS_CATALOG.gray_man_field_operative?.skill_rank_caps?.investigation).toBe(20);

  expect(THIRD_FLOOR_RACE_COUNTS.custom).toBe(5);
  expect(Object.keys(CUSTOM_THIRD_FLOOR_RACE_CATALOG)).toHaveLength(5);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.nigh?.size?.value).toBe(4);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.ginger?.hybrid).toBe(true);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.nullian?.stat_bonuses?.int).toBe(5);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.soother_forsoothed?.skill_rank_caps?.persuasion).toBe(20);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.redacted_asset?.earth_race).toBe(true);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.redacted_asset?.build_points).toEqual({
    benefits_spent: 26,
    detriment_credit: 1,
    net_spent: 25,
    total: 25,
  });
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.redacted_asset?.stat_penalties?.cha).toBe(-2);
  expect(CUSTOM_THIRD_FLOOR_RACE_CATALOG.redacted_asset?.movement_bonus_ft).toBe(5);
});
