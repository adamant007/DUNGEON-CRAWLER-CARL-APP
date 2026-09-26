import { test, expect } from "@playwright/test";
import {
  OFFICIAL_THIRD_FLOOR_CLASS_CATALOG,
  THIRD_FLOOR_CLASS_CATALOG,
  THIRD_FLOOR_CLASS_COUNTS,
} from "../src/rules-profile/adapters/dungeon_crawler_carl/classCatalog.js";

test("third-floor class catalog keeps every imported class entry", async () => {
  expect(THIRD_FLOOR_CLASS_COUNTS.official).toBe(52);
  expect(THIRD_FLOOR_CLASS_COUNTS.custom).toBe(1);
  expect(THIRD_FLOOR_CLASS_COUNTS.total).toBe(53);

  expect(Object.keys(OFFICIAL_THIRD_FLOOR_CLASS_CATALOG)).toHaveLength(52);
  expect(Object.keys(THIRD_FLOOR_CLASS_CATALOG)).toHaveLength(53);

  expect(THIRD_FLOOR_CLASS_CATALOG.boring_ol_arcanist?.name).toBe("Boring Ol’ Arcanist");
  expect(THIRD_FLOOR_CLASS_CATALOG.swashbuckler?.class_types).toEqual(["Bard", "Fighter", "Rogue"]);
  expect(THIRD_FLOOR_CLASS_CATALOG.health_embezzeler?.earth_class).toBe(true);
  expect(
    THIRD_FLOOR_CLASS_CATALOG.health_embezzeler?.passive_skills?.find((s) => s.id === "reallocate")
      ?.target?.range_feet
  ).toBe(30);
});
