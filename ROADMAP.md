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

## Release sequencing

1. Finish current regression stabilization and tablet/mobile navigation fixes.
2. Stable crawler identity and cross-device character/portrait restore.
3. Teams data model + campaign leaderboard integration.
4. Dungeon Factions data model + GM/player visibility.
5. Media personalities + Shows + Interview Invitation event flow.
6. Connect reputation, fame, rewards and team/faction/media events.
7. Security/RLS and multi-campaign isolation regression tests before production release.
