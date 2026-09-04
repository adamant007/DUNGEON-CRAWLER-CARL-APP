# Crawler Companion

Vite + React + TypeScript RPG companion app.

## Deployment
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Notes
- The app is local-first and stores character/campaign data in the browser.
- The GM Rulebook tool lets a user upload their own licensed PDF and searches its selectable text locally.
- The public app does not bundle the copyrighted rulebook.
- Optional OCR/PDF dependencies are loaded only when those tools are used.
