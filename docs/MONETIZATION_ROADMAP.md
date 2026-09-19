# Crawler Companion — Product & Monetization Roadmap

> **STATUS: PROPOSED ARCHITECTURE ONLY — DO NOT IMPLEMENT PAYMENTS YET.**
> No Stripe, no checkout, no subscription enforcement, no paywalls, no billing UI,
> no pricing screens. This document exists so new features are built with these
> tiers in mind and can later be assigned to tier entitlements without major rewrites.

## Product thesis

Crawler Companion does not know how to play one RPG. It knows how to read a
**Rules Profile**. The sheet is a renderer; the loaded profile supplies the game.
The monetization model follows that architecture: capacity and advanced
functionality are what we charge for — never basic game-night usability.

## Proposed three-tier subscription structure

### FREE — $0
A genuinely usable version, NOT a crippled demo. This is our adoption and
word-of-mouth engine: a Free user can bring Crawler Companion to a table and
actually use it.

Planned features:
- 1–2 characters
- 1 rules system/profile
- Full basic character-sheet functionality
- HP/resources
- Dice
- Equipment/inventory
- Currency/Vault
- Character saving/loading
- Normal game-session functionality

**Never interrupt an active game session with a paywall for basic sheet
functionality.**

### PLAYER — $2.99/month (or $29.99/year) — PRIMARY paid tier
- More characters
- Multiple rules systems/profiles
- Cloud/device conveniences and synchronization
- Additional customization/convenience features where appropriate

### DRAGON — approximately $5.99/month (or $59.99/year)
Advanced tier for heavy players and GMs.
- Unlimited or substantially higher character capacity
- Unlimited or substantially higher Rules Profile capacity
- AI-assisted Rulebook → Rules Profile generation
- Advanced campaign tools
- Party tools
- GM tools
- Other advanced features developed later

All prices and limits are proposed and may change before launch.

## Product principles (binding for all future feature work)

1. **Charge for capacity, convenience and advanced functionality — NOT basic
   game-night usability.** Never paywall essential actions such as viewing the
   character sheet, changing HP, rolling dice, or other basic actions needed
   during play.
2. **Rules Profiles already created by a user must remain usable.** If a user
   later downgrades/cancels, do not hold their existing characters or
   previously created profiles hostage. Paid tiers may restrict *creation* of
   additional characters/profiles and access to premium *services*, but
   existing user data must remain safely accessible.
3. **AI Rulebook/Profile generation belongs primarily in the Dragon tier**
   because it has real processing cost. Do not design this as annoying
   per-session or per-use microtransactions.
4. **The Free tier is the adoption/word-of-mouth engine.** A Free user should
   be able to bring Crawler Companion to a table and actually use it.
5. **Keep subscription architecture configurable.** Prices, character limits,
   profile limits and individual tier entitlements must eventually come from
   centralized configuration rather than being hard-coded throughout the UI.
   When the engine gets there, tier entitlements should live in one place
   (e.g. a single entitlement config consulted by feature code), so assigning a
   future feature to a tier is a config change, not a rewrite.
6. **Do not implement payments now.** No payment provider, checkout, billing
   UI, subscription enforcement, or paywalls until this document's status line
   changes to "approved for implementation".

## Implementation notes for when this is approved

- Entitlement checks should be read from one centralized config (tiers,
  prices, limits, feature flags) — never scattered constants in components.
- Feature gating belongs at the *action entry points* (e.g. "create character
  beyond limit"), always with a clear upgrade prompt — never mid-session on
  basic sheet interactions.
- Existing-data safety (principle 2) is a hard requirement of any enforcement
  design: downgrade must degrade capacity to *create*, never access to *what
  already exists*.