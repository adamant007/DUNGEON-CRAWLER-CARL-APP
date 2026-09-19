/* src/rules-profile — the single import point for Ginger Dragon's Rules Profile layer.

   Every feature (Character Creator, Sheet, Skills, Spells, Gear, Hotbar,
   Advancement, GM Tools, Party/Campaign, Dungeon AI) resolves its rules here.
   No feature ever reads a raw rulebook document — only normalized profiles.
*/

import { registerBuiltinProfile } from "./contract";
import { dungeonCrawlerCarlProfile } from "./adapters/dungeon_crawler_carl";

registerBuiltinProfile(dungeonCrawlerCarlProfile);

export {
  defineProfile,
  registerBuiltinProfile,
  listBuiltinProfiles,
  resolveProfile,
  CONTRACT_SCHEMA_VERSION,
  PROFILE_SOURCE_TYPES,
} from "./contract";

export { evaluateFormula, makeThresholdLookup } from "./formula";
export { dungeonCrawlerCarlProfile, SYSTEM_KEY as DUNGEON_CRAWLER_CARL_KEY } from "./adapters/dungeon_crawler_carl";