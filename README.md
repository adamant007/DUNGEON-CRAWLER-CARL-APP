# Crawler Companion — Ginger Dragon Fire Studios

Roadmap build based on the latest multi-app package.

Included in this build:
- Standard editable character sheet and guided character creator.
- Floor/race/class remain editable (including Floor 3 choices).
- Scanner/import from JSON, PDF text, or character-sheet photo OCR.
- Combat, conditions, skills, spells/abilities, inventory, equipment and progression.
- Multi-die roller with history.
- Multi-character local library with active-character switcher.
- Party Board and two-character side-by-side live sheets; phone layout stacks at readable width.
- GM generators and unique-batch loot generation.
- GM → crawler loot-box delivery with rarity reveal, icon animation, optional sound, automatic inventory assignment and event history.
- Supabase authentication, multi-character cloud backup, online campaign creation/joining and realtime campaign events.
- Rulebook assistant for user-supplied licensed PDFs.
- Character backup/restore and print support.
- Real public account counter plus private owner analytics RPC (no fake incrementing counter).
- Ginger Dragon Fire Studios landing page and existing branding retained.

## Local build

```bash
npm install
npm run build
```

## Supabase
Run `supabase-schema.sql` in the Supabase SQL editor, then provide either:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (preferred) or `VITE_SUPABASE_ANON_KEY`

The app remains local-first if cloud features are not used.

## Deployment
This package does not require editing Vercel configuration. Existing GitHub → Vercel deployment can be used after the code is placed in the intended repository.
