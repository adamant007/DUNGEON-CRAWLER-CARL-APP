import { test, expect } from "@playwright/test";
import {
  checkUserText,
  validateUserCreatedText,
} from "../src/lib/textSafety.js";
import {
  blankBuild,
  validateBuild,
} from "../src/components/character/homebrew/homebrewBuildRules.js";

test("user text filter blocks direct profanity", async () => {
  expect(checkUserText("fuck").ok).toBeFalsy();
  expect(checkUserText("This is bullshit").ok).toBeFalsy();
});

test("user text filter blocks common obfuscation tricks", async () => {
  expect(checkUserText("f.u.c.k").ok).toBeFalsy();
  expect(checkUserText("f u c k").ok).toBeFalsy();
  expect(checkUserText("sh1t").ok).toBeFalsy();
  expect(checkUserText("fuuuck").ok).toBeFalsy();
});

test("user text filter does not block legitimate words containing shorter sequences", async () => {
  expect(checkUserText("Assassin").ok).toBeTruthy();
  expect(checkUserText("Cockroach").ok).toBeTruthy();
  expect(checkUserText("Classic Rogue").ok).toBeTruthy();
  expect(checkUserText("Dickensian street thief").ok).toBeTruthy();
});

test("name and description are checked separately", async () => {
  expect(validateUserCreatedText({ name: "Clean Name", description: "A clean description." }).ok).toBeTruthy();
  const badName = validateUserCreatedText({ name: "Sh1t Wizard", description: "Clean." });
  expect(badName.ok).toBeFalsy();
  expect(badName.field).toBe("name");

  const badDescription = validateUserCreatedText({ name: "Clean Name", description: "f.u.c.k this dungeon" });
  expect(badDescription.ok).toBeFalsy();
  expect(badDescription.field).toBe("description");
});

test("guided build cannot become legal while blocked text is present", async () => {
  const build = blankBuild("class");
  build.name = "Sh1t Wizard";
  build.statBonuses.int = 5;
  const result = validateBuild(build);
  expect(result.legal).toBeFalsy();
  expect(result.errors.some((x) => x.includes("Ginger Dragon"))).toBeTruthy();
});
