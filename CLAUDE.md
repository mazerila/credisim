# Credisim: working notes for Claude

Neutral loan simulator (France in detail, presets for BE, DE, ES, IT, NL), live at https://creditsimulator.web.app. Start with `README.md` and `docs/README.md`.

## Commands
- `npm run dev`: local server
- `npm run check`: svelte-check (must show 0 errors)
- `npm test`: Vitest (engine, share, export, analytics, learn, packages/shortlink)
- `npm run build`: production build into `dist/`
- Deploy: automatic on every push to `main` (GitHub Actions); pull requests get a preview URL. Manual fallback: `firebase deploy --only hosting:creditsimulator --project credisimulator`

## How to work
- The owner reviews each roadmap phase before the next one starts (`docs/ROADMAP.md`). Stop after a phase with a summary and a live link.
- After each piece of work: check, test, build, commit, push to `main` (which deploys), then update the docs it touches (README, `docs/FEATURES.md`, `docs/ROADMAP.md`, `docs/CALCULATIONS.md`, `docs/RESEARCH.md`, `docs/ANALYTICS.md` for new events).
- UI: minimal Apple-style, light and dark, responsive. Reuse the tokens in `src/app.css` and the controls in `src/components/ui/`. Check new screens in both themes and at phone width.
- Every user-visible string goes through `t()`. Add each key to all five dictionaries in `src/lib/i18n/` (en, fr, de, es, it); `Dict` is typed from `en.ts`, so a missing key fails the type check. "How it works" articles exist in en and fr only.
- The engine (`src/lib/engine/`) stays pure TypeScript with no dependencies, and every formula has tests. Regulatory figures live in JSON under `src/lib/data/` with their sources, never hard-coded in components.
- Analytics events (PostHog, cookieless) never carry amounts, rates, incomes or typed text.

## Secrets
- Never commit the Firebase web API key. It is in `.env.local` (git-ignored) and the GitHub secret `FIREBASE_WEB_API_KEY`. Don't print keys or tokens in output.

## Recurring data updates
- `src/lib/data/fr/usury.json`: add the new quarter on 1 Jan, 1 Apr, 1 Jul and 1 Oct (Banque de France).
- `src/lib/data/fr/rental-tax.json` and `ptz.json`: after each finance law.
- `src/lib/data/eu/countries.json`: typical rates every few months.

## Commits
End commit messages with:
```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: <session URL>
```
