# Crawler Companion deployment model

## Canonical live publishing path

**Base44 is the production publishing path for Crawler Companion.**

A commit or merge in GitHub does not mean the live site has been published. The live release is complete only after the current app has been deployed from Base44.

## What each service is for

- **Base44** — publish/deploy the live app.
- **GitHub** — source history, pull requests, code review, and automated regression checks.
- **Supabase** — authentication, database, row-level security, storage, and current backend RPCs.
- **Vercel** — not the canonical production publisher for Crawler Companion.
- **AWS** — migration/scale work may use AWS, but it must not be treated as the live publishing path until that architecture is deliberately switched.

## Release sequence

1. Make and review code/backend changes.
2. Merge the approved source changes.
3. Deploy the app from Base44.
4. Verify the live site manually for the changed workflow.
5. Run the **Browser Regression** workflow manually (workflow_dispatch) to smoke-test the Base44 production site.

The scheduled Browser Regression job also checks the live production site daily. GitHub pushes run the local/current product suite only, because a source push and a Base44 deployment are separate events.

## Current cost rule

Core gameplay must remain functional without an AI API. Prefer deterministic tables, coded rules, and stored lookup data for ordinary play. AI-dependent features should be optional and separately metered if they are introduced.
