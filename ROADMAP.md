# Crawler Companion Roadmap

## Core multiplayer world systems

### Teams
Player-created or GM-managed crawler groups that exist only inside their campaign.

- Team name, emblem, description and roster
- Campaign-scoped membership and permissions
- Team score, rank, achievements and statistics
- Leaderboard views for individual Crawlers and Teams
- GM awards and events can target one crawler, one team or the whole campaign
- Team loot/rewards
- Team history and accomplishments
- Future rivalry, title and seasonal-standing support

### Dungeon Factions
Campaign-world organizations controlled by the GM. These are separate from player Teams.

- Name, original emblem/art, public description and GM-only notes
- Leader and notable members
- Floor/territory/location
- Resources, goals and current activity
- Relationship states such as Friendly, Neutral, Hostile, Allied and Rival
- Allies and enemies
- Crawler/team reputation with each faction
- Discovered information separated from GM secrets
- Faction encounters, offers, threats and announcements

### Media & Celebrity System
Original campaign personalities and entertainment/interview programs controlled by the GM.

- Celebrity/host profile, portrait, personality and public reputation
- Show/program name and description
- Audience/reach/fame value
- Attitude toward individual crawlers and teams
- Guest and episode history
- GM-triggered Interview Invitation events
- Public statements, sponsorship offers and rival challenges
- Interviews/events may award fame, score, reputation or rewards
- Media activity can react to crawler achievements and campaign events

### Connected campaign loop
Crawler achievement -> Team standing -> Faction reaction/reputation -> Media attention -> Interview/event -> Fame/reward/score -> Campaign leaderboard.

All data must remain campaign-scoped and protected by server-side authorization/RLS. Player-visible information must never expose GM-only faction/media notes. Default shipped names, lore, descriptions, artwork and personalities must be original rather than copied from licensed fictional properties. GMs may enter their own private campaign content.

## RC1 account continuity

Before RC1, Android and web must use the same authentication backend and the same user/account records.

- Email/password login must open the same account on Android and web.
- Google sign-in must open the same account on Android and web.
- A user's characters, campaigns, settings, entitlements/purchases, and other account-scoped data must follow the account across devices.
- Protect against duplicate accounts when the same email is used with more than one sign-in method.
- Add a safe account-linking flow for email/password + Google when they represent the same person.
- Never silently merge accounts with conflicting identities; require explicit confirmation.
- Test sign-in, sign-out, password reset, session restore, and device switching on both Android and web.
- Authentication state must update the UI immediately: signed-out users see Log in/Get Started; signed-in users see Enter/account controls.
- Keep all authorization and campaign access enforced server-side/RLS, not by UI state alone.
- Google OAuth provider is configured and Supabase has confirmed a successful Google OAuth login; remaining Android work is session handoff/return-to-app verification.
- Imported legacy characters must be claimed only after the authenticated session is established; verify restored characters before RC1 sign-off.
- Keep the Android/PWA launcher icon synchronized with the approved Ginger Dragon Studios burgundy-dragon / ginger-mane / teal-d20 emblem.

## Release sequencing

1. Finish current regression stabilization and tablet/mobile navigation fixes.
2. Complete RC1 cross-platform account continuity and account-linking safeguards.
3. Stable crawler identity and cross-device character/portrait restore.
4. Teams data model + campaign leaderboard integration.
5. Dungeon Factions data model + GM/player visibility.
6. Media personalities + Shows + Interview Invitation event flow.
7. Connect reputation, fame, rewards and team/faction/media events.
8. Security/RLS and multi-campaign isolation regression tests before production release.
