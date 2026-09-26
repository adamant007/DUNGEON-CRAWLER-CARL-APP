import { test, expect } from "@playwright/test";
import {
  crawlerNumberConflict,
  crawlerNumbersFromRecords,
  stepIssues,
} from "../src/components/character/creator/wizard/wizardSteps.js";

const profile = {
  creation_flow: {
    basic_identity: {
      fields: [{ id: "crawler_number", range: { min: 1, max: 99999999 } }],
    },
  },
};

const draft = (crawlerNumber) => ({
  name: "Test Crawler",
  crawlerNumber,
  startingSpecies: {},
  coreStats: {},
  startingCombat: {},
  startingGear: {},
  storyHooks: {},
});

test("crawler number normalization treats punctuation and leading zeros as the same number", async () => {
  const used = crawlerNumbersFromRecords([
    { id: "a", details: { crawler: "001" } },
    { id: "b", details: { crawler: "1,234" } },
    { id: "c", details: { crawler: "" } },
  ]);
  expect(used.has(1)).toBeTruthy();
  expect(used.has(1234)).toBeTruthy();
  expect(used.size).toBe(2);
});

test("crawler number conflict detects another character but can exclude the current character", async () => {
  const records = [
    { id: "first", details: { crawler: "1" } },
    { id: "second", details: { crawler: "2" } },
  ];
  expect(crawlerNumberConflict(records, "0001")?.id).toBe("first");
  expect(crawlerNumberConflict(records, "1", "first")).toBeNull();
});

test("identity validation rejects a crawler number already used by this account", async () => {
  const issues = stepIssues("identity", draft(1), profile, new Set([1, 7]));
  expect(issues.some((issue) => issue.key === "crawlerNumber" && issue.kind === "invalid")).toBeTruthy();
  expect(issues.find((issue) => issue.key === "crawlerNumber")?.message).toContain("already in use");
});

test("identity validation allows a different unused crawler number", async () => {
  const issues = stepIssues("identity", draft(2), profile, new Set([1, 7]));
  expect(issues.some((issue) => issue.key === "crawlerNumber")).toBeFalsy();
});
