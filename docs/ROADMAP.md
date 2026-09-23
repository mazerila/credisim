# Roadmap & architecture

## Positioning
**A neutral, free, bilingual credit simulator that shows the true cost of a loan, all in one view, with no sign-up and no sales call.**
Audience: first-time buyers in France, expats/cross-border workers (English), people comparing or checking a bank offer.

## Phases

Each phase ends with a **review gate**: the phase is demoed, the owner confirms, and only then does the next phase start.

### Phase 0 — Prototype ✅ (`docs/planning/prototype/index.html`)
Single HTML file: project budget, loan, insurance (initial vs remaining capital), fees, guarantee, TAEG, usury + HCSF checks, 3 charts, schedule, duration comparison, EN/FR, share link.

### Phase 1 — Foundation & MVP ✅ built, awaiting review
- Project scaffold (Vite + Svelte + TypeScript), Firebase Hosting config
- Engine as tested pure TypeScript (A1–A3, B1, B3–B9, C1–C2)
- **Credit type selector** (K1): mortgage, personal loan, car loan, works loan; each type sets its own defaults, visible fields and usury band
- **Optional components** (K2): turn on/off borrower insurance, guarantee, application fee, broker fee, notary fees, works, other loans; everything recalculates without them
- Quick / Expert modes, ⓘ tooltips (G1, G2, G5)
- Charts F1–F4, compare 2 scenarios (F5)
- EN/FR with detection (H1–H3), share link (I1)
- Versioned regulatory data (J3), disclaimer

### Phase 2 — "How it works" (Learn)
- **Short, simple explainers** (L1–L4), EN/FR: what a loan is, how the monthly payment is calculated, interest vs capital (amortization), what the TAEG includes, insurance, guarantee, notary fees, usury rate, 35 % rule, PTZ basics
- "How this calculator works": what it computes, the assumptions, the limits, data sources and dates
- Small live examples inside the explainers (e.g. "€100k at 3 % for 20 years")
- ⓘ tooltips link to the matching explainer; glossary page
- Later phases add an explainer for each new feature

### Phase 3 — France advanced
- **PTZ as an optional component** + multi-loan package with lissage (A10, B10)
- Deferral, linear, in-fine (A4, A5)
- Early repayment, renegotiation, Lemoine switch, **check my offer** (B12–B15)
- Per-borrower insurance (B2), reste à vivre (C3)
- 4 scenarios, sensitivity grid (F5, F6), PDF / CSV export, saved scenarios (I2–I4)

### Phase 4 — More credit types
- Revolving credit, LOA/LLD vs loan, BNPL real cost, debt consolidation (D2–D5)
- Bridge loan, rental investment (B11, B16), rent vs buy (C4)
- Variable / capped rates + Euribor stress (A7, A8)

### Phase 5 — Europe & reach
- Country presets BE, DE, ES, IT, PT, NL (E1–E6), more languages (H4)
- SEO landing pages per calculator, embed widget, analytics, optional account (I5, I6, J5)

## Suggested stack

| Layer | Choice | Why |
|---|---|---|
| Engine | TypeScript, pure functions, no deps | Testable, reusable in UI, workers and a future API |
| Tests | Vitest + golden files (reference schedules) | Numbers must be right to the cent |
| UI | Svelte 5 + Vite (static SPA); SEO pages added in Phase 5 | Fast, small bundle, simple Firebase deploy |
| Charts | Custom SVG Svelte components | No dependency, theme-aware, full control; table fallback for accessibility |
| i18n | JSON dictionaries `en.json` / `fr.json`, `t(key, vars)` like Suncast | Proven in Suncast |
| Hosting | Firebase Hosting (Suncast) or Cloudflare Pages | Static; Cloudflare adds free IP-country header |
| Data | `data/<country>/*.json` with `validFrom`, `validTo`, `source` | Quarterly usury refresh without code change |
| PDF | Client-side (jsPDF / print stylesheet) | Keeps data in the browser |
| Analytics | PostHog (cookie-less mode) | Same as Suncast |

## Repo layout
A single Vite app for now; the engine is kept dependency-free in `src/lib/engine/` so it can move to its own package (`packages/engine`) when a second consumer appears (API, widget).
```
credisim/
  src/
    lib/engine/           # loan math, TAEG, schedules, rules (+ tests)
    lib/data/fr/          # versioned regulatory data (usury, HCSF, notary, guarantee)
    lib/i18n/             # en.ts, fr.ts, t(), formatting, language detection
    lib/share.ts          # share-link encoding (+ tests)
    components/           # Svelte UI; ui/ = controls
  public/                 # static files copied as-is
  docs/                   # research, features, calculations, roadmap, naming
    planning/             # planning report + Phase 0 prototype
```

## SEO pages (one engine, many entry points)
`/fr/simulateur-pret-immobilier`, `/fr/calcul-taeg`, `/fr/capacite-emprunt`, `/fr/frais-de-notaire`, `/fr/ptz`, `/fr/remboursement-anticipe`, `/fr/verifier-offre-de-pret`, and English equivalents `/en/france-mortgage-calculator` … Each page opens the same app with a preset.

## Risks
| Risk | Mitigation |
|---|---|
| Wrong numbers → loss of trust | Golden-file tests against real offers; show formulas; "report an error" link |
| Stale regulation (usury quarterly) | Versioned data + validity date in UI + calendar reminder |
| Legal: looking like advice / IOBSP rules | Clear "simulation only" disclaimer, no rate promises, no lead reselling without registration |
| Name conflict | Check INPI / EUIPO before buying domains (see NAMING.md) |
