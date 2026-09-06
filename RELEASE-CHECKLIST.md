# Crawler Companion — 1 PM Release Checklist

## Before production deploy
- GitHub Browser Regression workflow passes on current `main`.
- Vercel Hobby build-rate limit has cleared.
- Deploy exactly once from current `main` to Ginger Dragon Fire Studios production.

## Tablet verification
- App opens without a blank screen or long-page regression.
- Workspace tabs work: Sheet, Spells, Inventory, Combat, Dice, Campaign, GM.
- Character portrait is visible in full and is not cropped.
- HP and Mana HUD are visible and update correctly.
- Dice tab supports multiple dice and produces a total.
- Damage Resist appears in combat flow.
- Character switch does not lose the active portrait or sheet state.

## Phone verification
- Portrait is visible and uncropped.
- Tabs are usable without forcing one long page.
- HP/Mana HUD is visible.
- Dice roller is usable at phone width.
- No GM-only controls leak into ordinary player views.

## Cloud verification
- Sign in to a cloud account.
- Change a saved crawler field and confirm the crawler appears in `crawler_characters`.
- Save/choose a portrait and confirm the same crawler cloud record contains the portrait payload.
- Refresh and confirm the local character remains intact.
- On a second signed-in device/session, confirm the portrait restores from cloud.
- Campaign leaderboard remains campaign-scoped.

## GM verification
- GM quick tools open only in GM context.
- Push announcement reaches campaign members.
- Push loot box includes icon/sound behavior.
- Campaign isolation prevents GM access to unrelated campaigns.

## Go / No-Go
Ship if: core tabs, portrait, HP/Mana, dice, character persistence, and campaign isolation pass.
Defer non-blocking polish if needed; do not risk a second production build before the session unless a blocking bug is confirmed.
