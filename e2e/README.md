# Browser test harness

Playwright regression coverage for Crawler Companion.

## What runs without secrets
- Landing page and public links
- Every primary navigation tab
- Dice count bounds and d100 rolling
- Party board / side-by-side switching
- GM loot generation, 20-drop uniqueness, blank count recovery
- Local character persistence across refresh
- Two isolated browser contexts to catch local/session bleed
- Anonymous-access denial checks when a Supabase URL/key is supplied

## Optional real multiplayer test
Set these environment variables to enable the cloud multi-login campaign smoke test:

- `E2E_GM_EMAIL`
- `E2E_GM_PASSWORD`
- `E2E_PLAYER_EMAIL`
- `E2E_PLAYER_PASSWORD`

The test signs into two isolated browser contexts, creates a campaign as the GM account, joins from the player account, and verifies the cloud flow.

## Adversarial campaign-isolation test
For the full four-account isolation suite, also set:

- `E2E_GM2_EMAIL`
- `E2E_GM2_PASSWORD`
- `E2E_PLAYER2_EMAIL`
- `E2E_PLAYER2_PASSWORD`
- `E2E_SUPABASE_URL` and `E2E_SUPABASE_KEY` if the regular Vite Supabase variables are not available in CI

The adversarial suite creates two separate campaigns and crawlers, then proves that an unrelated GM/player cannot read another campaign's crawler, cannot attach that crawler, cannot forge GM loot events, cannot read another campaign's event history or leaderboard, and cannot self-promote to GM.

## Commands
- `npm run test:e2e` — local build + desktop/phone/tablet projects
- `npm run test:e2e:headed` — visible browser locally
- `npm run test:e2e:prod` — run against `https://gingerdragonfire.com`

Failures retain screenshots, video, traces, and an HTML report. GitHub Actions runs a Chromium regression on every push/PR and a production smoke test daily or on manual dispatch.
