# Credisim

**The true cost of your loan, in plain sight.** / *Le vrai coût de votre crédit, en clair.*

Credisim is a neutral, bilingual (English / French) loan simulator for France, and later the rest of Europe. It shows the monthly payment, the **TAEG** (all-in rate) and the full cost of a loan, including borrower insurance, fees, the guarantee and notary costs. It also checks the result against the French legal limits: the usury rate and the HCSF 35 % / 25-year rules.

No sign-up, no sales call, and nothing leaves the browser: every calculation runs client-side.

| Light | Dark |
|---|---|
| ![Credisim in light mode](docs/images/screenshot-light.png) | ![Credisim in dark mode, French](docs/images/screenshot-dark.png) |

## Features

- **Credit types:** home loan (mortgage), personal loan, car loan, home works loan. Each type has its own defaults, fields and legal-maximum band.
- **Optional costs you can switch on or off:** borrower insurance (on the initial amount or the remaining balance, with coverage), guarantee (Crédit Logement-type guarantee, mortgage or lender's lien, estimated or entered by hand), notary fees (2026 regulated scale, département rate, first-time-buyer exemption, or a manual %), works, application fee, broker fee, other loans.
- **Results:**
  - monthly payment and cost of credit
  - TAEG and what it's made of, against the legal maximum for this loan
  - debt ratio and duration checks
  - financing plan and borrowing capacity
  - the same loan at other durations
  - repayment schedule by month or by year
- **Charts:** where the money goes, remaining balance, and what each year of payments covers.
- **Scenario A vs B** comparison, with differences highlighted and both balance curves on one chart.
- **Quick and Detailed modes**, and ⓘ explanations on every term.
- **Share links:** the whole simulation (both scenarios, every field, mode, language) is stored in the URL fragment.
- **English and French**, detected automatically. Light, dark or system theme. Responsive from phone to desktop.

The full list, with priorities, is in [docs/FEATURES.md](docs/FEATURES.md). What comes next is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Getting started

Requires Node.js 20 or later (see `.nvmrc`).

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm test` | Run the engine and share-link tests (Vitest) |
| `npm run check` | Type-check TypeScript and Svelte (svelte-check) |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the production build locally |

## Project structure

```
src/
  lib/engine/        Pure TypeScript calculation engine (no dependencies)
                     annuity & schedule, TAEG (EU actuarial method), usury bands,
                     notary scale, guarantee, borrowing capacity, solvers + tests
  lib/data/fr/       Versioned French regulatory data, each value with its source
  lib/i18n/          en.ts / fr.ts dictionaries, t(), number formatting, language detection
  lib/share.ts       Share-link encoding and validation (+ tests)
  lib/state.svelte.ts  App state: credit type, mode, scenarios, theme
  components/        Svelte 5 UI; components/ui/ holds the controls
  app.css            Design tokens (light and dark)
docs/                Research, features, formulas, roadmap, naming
  planning/          Planning report and the Phase 0 prototype
```

## How the numbers are calculated

- **Monthly payment:** standard fixed-rate formula, with each line rounded to the cent like a bank schedule.
- **TAEG:** EU actuarial method (used in France since 2016). It solves for the rate at which the payments plus insurance equal the amount actually received (loan minus upfront fees and guarantee).
- **Notary fees:** transfer taxes, plus the regulated notary fee with VAT, plus the property-security contribution and disbursements.

Every formula is written out in [docs/CALCULATIONS.md](docs/CALCULATIONS.md), with the sources in [docs/RESEARCH.md](docs/RESEARCH.md).

## Regulatory data

French rates and rules live in `src/lib/data/fr/`:

| File | Contents | Refresh |
|---|---|---|
| `usury.json` | Legal maximum rates (taux d'usure), one entry per quarter | Every quarter: 1 Jan, 1 Apr, 1 Jul, 1 Oct ([Banque de France](https://www.banque-france.fr/fr/statistiques/taux-et-cours)) |
| `rules.json` | HCSF limits, notary scale and transfer taxes, guarantee estimates | When the rules change |

When the latest quarter has expired, the app shows a "rates may be outdated" badge until a new entry is added. **Current data: Q3 2026, valid until 30 Sep 2026.**

## Language detection

The language is chosen in this order: `?lang=en|fr` → the visitor's saved choice → the country from the host (`window.__COUNTRY__`, to be filled from an edge/IP header) → browser language → French time zone → English.

## Deployment

The build is a static site (`dist/`). `firebase.json` is ready for Firebase Hosting: site `credisim`, SPA rewrite, long cache for hashed assets, and tests plus build run before each deploy.

```bash
firebase use --add                 # select the Firebase project
firebase hosting:sites:create credisim
firebase deploy --only hosting
```

GitHub Actions already runs type check, tests and build on every push and pull request (`.github/workflows/ci.yml`). Automatic deployment to Firebase will be added to it.

## Disclaimer

Credisim gives estimates for information only. It is not a loan offer and does not replace the binding offer from a bank.

## License

[MIT](LICENSE)
