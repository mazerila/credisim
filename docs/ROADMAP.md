# Roadmap & architecture

## Positioning
**A neutral, free, multilingual credit simulator that shows the true cost of a loan, all in one view, with no sign-up and no sales call.**
Audience: first-time buyers in France, expats/cross-border workers (English), people comparing or checking a bank offer.

## Phases

Each phase ends with a **review gate**: the phase is demoed, the owner confirms, and only then does the next phase start.

### Phase 0 — Prototype ✅ (`docs/planning/prototype/index.html`)
Single HTML file: project budget, loan, insurance (initial vs remaining capital), fees, guarantee, TAEG, usury + HCSF checks, 3 charts, schedule, duration comparison, EN/FR, share link.

### Phase 1 — Foundation & MVP ✅ confirmed 2026-09-23
- Project scaffold (Vite + Svelte + TypeScript), Firebase Hosting config
- Engine as tested pure TypeScript (A1–A3, B1, B3–B9, C1–C2)
- **Credit type selector** (K1): mortgage, personal loan, car loan, works loan; each type sets its own defaults, visible fields and usury band
- **Optional components** (K2): turn on/off borrower insurance, guarantee, application fee, broker fee, notary fees, works, other loans; everything recalculates without them
- Quick / Expert modes, ⓘ tooltips (G1, G2, G5)
- Charts F1–F4, compare 2 scenarios (F5)
- EN/FR with detection (H1–H3), share link (I1)
- Versioned regulatory data (J3), disclaimer

### Phase 2 — "How it works" (Learn) ✅ confirmed 2026-09-23
- **Short, simple explainers** (L1–L4), EN/FR: what a loan is, how the monthly payment is calculated, interest vs capital (amortization), what the TAEG includes, insurance, guarantee, notary fees, usury rate, 35 % rule, PTZ basics
- "How this calculator works": what it computes, the assumptions, the limits, data sources and dates
- Small live examples inside the explainers (e.g. "€100k at 3 % for 20 years")
- ⓘ tooltips link to the matching explainer; glossary page
- Later phases add an explainer for each new feature
- Also delivered in this phase: lighter dark theme with visible card edges; home-loan "amount only" mode

### Phase 3 — France advanced ✅ confirmed 2026-09-23
- **PTZ as an optional component** + multi-loan package with lissage (A10, B10)
- Deferral, linear, in-fine (A4, A5)
- Early repayment, renegotiation, Lemoine switch, **check my offer** (B12–B15)
- Per-borrower insurance (B2), reste à vivre (C3)
- 4 scenarios, sensitivity grid (F5, F6), PDF / CSV export, saved scenarios (I2–I4)
- Delivered as: simulator options (repayment type, deferral, 2 borrowers, PTZ with band check and smoothing, money left), a **Tools** section (early repayment, renegotiation, insurance switch, check my offer), print/PDF report, CSV export, saved simulations, and 4 new explainers

### Phase 4 — More credit types ✅ confirmed 2026-09-24
- Revolving credit, LOA/LLD vs loan, BNPL real cost, debt consolidation (D2–D5)
- Bridge loan, rental investment (B11, B16), rent vs buy (C4)
- Variable / capped rates + Euribor stress (A7, A8)
- Delivered as: rate type Fixed / Variable / Capped in the home-loan simulator (index + margin, cap, index scenario, yearly revision, worst case); 7 new tools grouped as Other credits (revolving, pay in 3×/4×, car lease vs loan, debt consolidation) and Property projects (bridge loan, rental investment, rent or buy); 6 new explainers

### Phase 5 — Europe & reach ✅ built, awaiting review
- Country presets BE, DE, ES, IT, NL (E1): typical rate, purchase taxes by region, notary, local guarantee, debt guideline; country detected from `?country`, time zone or language
- Interface in German, Spanish and Italian (H4), with a language menu; explainers stay in English/French for now
- Embeddable widget at `/embed` with a one-line loader (`embed.js`) — see [EMBED.md](EMBED.md) (I5)
- Analytics: PostHog, cookieless (J5)
- Moved to the next step: SEO landing pages and AI-search optimisation; optional account (I6) stays open

### Rental investment, advanced mode ✅ built 2026-09-24 (requested after Phase 5)
- Four French tax regimes side by side: unfurnished micro-foncier / real, furnished (LMNP) micro-BIC / real, with deficits, depreciation and 2026 social charges
- Resale with capital-gains tax (holding-period allowances; LMNP depreciation added back since 2025)
- Money tied up compared with a placement: return on your money (IRR) and gain vs. placement
- User-added one-off and recurring costs

### Next
1. **SEO and AI-search optimisation:** prerendered landing pages per language and calculator, meta / Open Graph / JSON-LD, hreflang, sitemap, robots.txt, llms.txt, Core Web Vitals and code splitting
2. Small corrections from the owner's review
3. Later: optional account (I6), Dutch interface, explainers in DE/ES/IT

## Suggested stack

| Layer | Choice | Why |
|---|---|---|
| Engine | TypeScript, pure functions, no deps | Testable, reusable in UI, workers and a future API |
| Tests | Vitest + golden files (reference schedules) | Numbers must be right to the cent |
| UI | Svelte 5 + Vite (static SPA); prerendered SEO pages planned next | Fast, small bundle, simple Firebase deploy |
| Charts | Custom SVG Svelte components | No dependency, theme-aware, full control; table fallback for accessibility |
| i18n | TypeScript dictionaries `en.ts` `fr.ts` `de.ts` `es.ts` `it.ts` (typed against English), `t(key, vars)` like Suncast | Missing keys fail the type check |
| Hosting | Firebase Hosting, site `creditsimulator` (https://creditsimulator.web.app) | Deployed by GitHub Actions on every push to `main`; PR previews |
| Data | `data/<country>/*.json` with `validFrom`, `validTo`, `source` | Quarterly usury refresh without code change |
| PDF | Client-side (jsPDF / print stylesheet) | Keeps data in the browser |
| Analytics | PostHog EU, cookieless (shared "armo products" project) | Same as Suncast and Mont Valier; no consent banner needed |

## Repo layout
A single Vite app for now; the engine is kept dependency-free in `src/lib/engine/` so it can move to its own package (`packages/engine`) when a second consumer appears (API, widget).
```
credisim/
  src/
    lib/engine/           # loan math, TAEG, schedules, rules (+ tests)
    lib/data/fr/          # versioned regulatory data (usury, HCSF, notary, guarantee, PTZ, rental tax)
    lib/data/eu/          # country presets (BE, DE, ES, IT, NL)
    lib/i18n/             # en, fr, de, es, it, t(), formatting, language detection
    lib/learn/            # "How it works" articles (en, fr)
    lib/share.ts          # share-link encoding (+ tests)
    components/           # Svelte UI; ui/ = controls, tools/, learn/
    Embed.svelte          # embeddable widget (/embed)
  packages/shortlink/     # reusable short-link module (Firestore)
  public/                 # static files copied as-is, incl. embed.js (widget loader)
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
