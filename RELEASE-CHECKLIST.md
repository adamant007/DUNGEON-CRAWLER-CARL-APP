# Crawler Companion — 1 PM Release Checklist

## Before production deploy
- GitHub Browser Regression workflow passes on current `main`.
- Vercel Hobby build-rate limit has cleared.
- Deploy exactly once from current `main` to Ginger Dragon Studios production.

## Tablet verification
- App opens without a blank screen or long-page regression.
- Workspace tabs work: Sheet, Spells, Inventory, Combat, Dice, Campaign, GM.
- Character portrait is visible in full and is not cropped.
- HP and Mana HUD are visible and update correctly.
- Dice tab supports multiple dice and produces a total.
- Damage Resist appears in combat flow.
- Character switch does not lose the active portrait or sheet state.

## Phone verification
- Installed launcher icon matches the approved Ginger Dragon Studios burgundy-dragon / ginger-mane / teal-d20 emblem.
- Portrait is visible and uncropped.
- Tabs are usable without forcing one long page.
- HP/Mana HUD is visible.
- Dice roller is usable at phone width.
- No GM-only controls leak into ordinary player views.

## Cloud verification
- Create/sign in with email/password on one platform and confirm the same account opens on the other platform.
- Sign in with Google on one platform and confirm the same account opens on the other platform.
- On Android, Google OAuth must return directly into the app/dashboard and persist the Supabase session rather than returning to the login page.
- If email/password and Google use the same email, verify the account-linking safeguard prevents an accidental duplicate account.
- Sign out and sign back in on both Android and web; confirm the same user/account id is restored.
- Confirm the signed-in UI hides Log in/Get Started and shows Enter/account controls immediately after auth state changes.
- Test password reset and session restore without losing account-linked data.
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

## Security hardening
- Review the four exposed SECURITY DEFINER RPCs (guest claim/create, imported-character claim, and GM character update) and verify each has explicit authorization checks before RC1.
- Enable Supabase leaked-password protection before public email/password launch.
- Optimize RLS auth-function calls with init-plan-safe `(select auth.uid())` / equivalent patterns where behavior is unchanged.
- Re-run Supabase security and performance advisors after hardening changes.

## Go / No-Go
Ship if: core tabs, portrait, HP/Mana, dice, character persistence, and campaign isolation pass.
Defer non-blocking polish if needed; do not risk a second production build before the session unless a blocking bug is confirmed.
