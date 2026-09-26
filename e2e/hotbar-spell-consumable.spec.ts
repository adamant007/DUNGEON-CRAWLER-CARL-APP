import { test, expect } from "@playwright/test";
import { parseConsumableEffect } from "../src/components/character/consumableEffect.js";
import { knownSpells } from "../src/components/character/spellData.js";
import { resolveHotbarSlot } from "../src/components/character/hotbarActions.js";
import { dungeonCrawlerCarlProfile } from "../src/rules-profile/adapters/dungeon_crawler_carl/index.js";
import { ATTACK_SPELL_GRANTS } from "../src/rules-profile/adapters/dungeon_crawler_carl/combat.js";

test("old Standard Mana Potion rows with blank notes are still executable", async () => {
  expect(parseConsumableEffect("Standard Mana Potion", "")).toEqual({ type: "mana_full" });
  expect(parseConsumableEffect("Mana Potions", "")).toEqual({ type: "mana_full" });
  expect(parseConsumableEffect("Good Mana Refill Potion", "")).toBeNull();
});

test("new starting Mana Potions preserve their canonical effect text", async () => {
  expect(ATTACK_SPELL_GRANTS.mana_potions.qty).toBe(5);
  expect(ATTACK_SPELL_GRANTS.mana_potions.notes).toMatch(/full restore/i);
});

test("hotbar picker eligibility can see a blank-note Standard Mana Potion", async () => {
  const inventory = [{ item: "Standard Mana Potion", qty: 5, notes: "" }];
  expect(parseConsumableEffect(inventory[0].item, inventory[0].notes)).toEqual({ type: "mana_full" });
  const resolved = resolveHotbarSlot("Standard Mana Potion", {
    spells: [],
    rulesetData: {},
    attacks: [],
    inventory,
    profile: dungeonCrawlerCarlProfile,
  });
  expect(resolved?.kind).toBe("consumable");
  expect(resolved?.itemIndex).toBe(0);
});

test("existing wizard spell rows gain description and full mechanics from the active profile", async () => {
  const spells = [{
    name: "Fire Fingers",
    cost: "3",
    type: "Fire",
    notes: "Rank 3 · Range Melee · Damage 1d4 + INT Mod",
  }];
  const known = knownSpells({}, spells, dungeonCrawlerCarlProfile);
  expect(known).toHaveLength(1);
  expect(known[0].description).toMatch(/burst of flame/i);
  expect(known[0].detail).toContain("Rank 3");
  expect(known[0].attack?.damage).toBe("1d4 + INT Mod");

  const resolved = resolveHotbarSlot("Fire Fingers", {
    spells,
    rulesetData: {},
    attacks: [],
    inventory: [],
    profile: dungeonCrawlerCarlProfile,
  });
  expect(resolved?.kind).toBe("spell");
  expect(resolved?.spell?.description).toMatch(/burst of flame/i);
  expect(resolved?.spell?.mana).toBe("3");
});
