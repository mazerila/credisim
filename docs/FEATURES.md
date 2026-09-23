# Feature list

Priority: **P0** = MVP · **P1** = v1 · **P2** = v2 / later. ✅ = delivered (as of Phase 4).
"Gap" = something the reviewed tools don't offer, or offer poorly (see RESEARCH.md §1.5).

## A. Loan engine (any country)

| # | Feature | Pri | Gap |
|---|---|---|---|
| A1 | Fixed-payment (annuity) loan: monthly payment, schedule | P0 ✅ | |
| A2 | 4-way solver: any 3 of amount / rate / duration / payment → the 4th | P0 ✅ | |
| A3 | Monthly & annual amortization table (capital, interest, insurance, balance) | P0 ✅ | |
| A4 | Deferral: partial (interest only) and total (capitalised) | P1 ✅ | |
| A5 | Linear (constant capital) and in-fine (interest-only + bullet) loans | P1 ✅ | |
| A6 | Stepped / modulable payments (paliers) | P2 | |
| A7 | Variable rate: Euribor + margin, custom rate path, **stress test** (+1/+2/+3 pts) | P2 ✅ | ✓ |
| A8 | Capped variable rate (cap ±1 / ±2) | P2 ✅ | |
| A9 | Payment frequency: monthly, quarterly, semi-annual, annual | P2 | |
| A10 | Multi-loan package: main + PTZ + Action Logement + employer loan, **lissage** to a constant total | P1 ✅ | ✓ |

## B. France — mortgage specifics

| # | Feature | Pri | Gap |
|---|---|---|---|
| B1 | Borrower insurance on **initial capital** (bank group) or **remaining capital** (delegation) | P0 ✅ | ✓ |
| B2 | Insurance per borrower with coverage % (e.g. 100 % + 100 %, 50 % + 50 %) | P1 ✅ | ✓ |
| B3 | Fees: application (frais de dossier), broker (courtage), account fees, valuation | P0 ✅ | |
| B4 | Guarantee: Crédit Logement caution (commission + FMG, refund at end), hypothèque, PPD | P0 ✅ | |
| B5 | **TAEG** (actuarial, EU method) + **TAEA** (insurance share) | P0 ✅ | |
| B6 | **TAEG breakdown**: what adds how many points (interest, insurance, fees, guarantee) | P0 ✅ | ✓ |
| B7 | **Usury check** vs current taux d'usure, with the quarter shown | P0 ✅ | ✓ |
| B8 | **HCSF check**: debt ratio ≤ 35 % (insurance incl.), duration ≤ 25 y | P0 ✅ | |
| B9 | Notary fees: old vs new, département DMTO, first-time-buyer exemption | P0 ✅ | |
| B10 | PTZ: eligibility (zone, household, income tranche), amount, deferral, schedule | P1 ✅ | |
| B11 | Bridge loan (prêt relais): sale price, % financed, interest-only / deferred | P2 ✅ | |
| B12 | Early repayment: IRA = min(6 months interest, 3 % of balance); shorter term vs lower payment | P1 ✅ | |
| B13 | Renegotiation / buy-out: new rate + fees → savings & break-even month | P1 ✅ | |
| B14 | **Lemoine switch**: current vs new insurance → remaining savings | P1 ✅ | ✓ |
| B15 | **Check my offer**: type in a bank offer, verify payment, schedule, TAEG | P1 ✅ | ✓ |
| B16 | Rental investment: rent, charges, yield, cash-flow, LMNP basics | P2 ✅ | |

## C. Project budget & affordability

| # | Feature | Pri | Gap |
|---|---|---|---|
| C1 | Project budget: price + works + notary + guarantee + fees − down payment = loan needed | P0 ✅ | ✓ (as one view) |
| C2 | Borrowing capacity from income, existing loans, 35 % rule | P0 ✅ | |
| C3 | "Reste à vivre" (money left per month) with household size | P1 ✅ | |
| C4 | Rent vs buy over N years (incl. resale, price growth, opportunity cost) | P2 ✅ | |
| C5 | Down-payment optimiser: what apport minimises total cost / hits 35 % | P2 | ✓ |

## D. Consumer credit

| # | Feature | Pri | Gap |
|---|---|---|---|
| D1 | Personal / car / works loan: payment, TAEG, usury check (consumer bands) | P0 ✅ | |
| D2 | LOA / LLD vs car loan comparison | P2 ✅ | ✓ |
| D3 | Revolving credit real cost | P2 ✅ | |
| D4 | **BNPL / split-payment real cost** (TAEG applies from 20 Nov 2026 under CCD2) | P2 ✅ | ✓ |
| D5 | Debt consolidation (rachat de crédits) | P2 ✅ | |

## E. Europe

| # | Feature | Pri | Gap |
|---|---|---|---|
| E1 | Country presets (default fees, guarantee, purchase taxes, lending rules) | P2 | ✓ |
| E2 | 🇧🇪 registration duties, variable caps (1/1/1…) | P2 | |
| E3 | 🇩🇪 Tilgung %, Sollzinsbindung, Sondertilgung, Anschlussfinanzierung | P2 | |
| E4 | 🇪🇸 🇮🇹 🇵🇹 Euribor-indexed loans | P2 | |
| E5 | 🇳🇱 annuity vs linear, interest deduction | P2 | |
| E6 | Locale-aware currency/number formats; CHF for cross-border workers | P2 | |

## F. Visualisation

| # | Feature | Pri |
|---|---|---|
| F1 | Stacked annual bars: capital / interest / insurance | P0 ✅ |
| F2 | Remaining-balance curve | P0 ✅ |
| F3 | Total-cost donut (interest, insurance, fees, guarantee, notary) | P0 ✅ |
| F4 | Live sliders (rate, duration, down payment) → everything re-renders | P0 ✅ |
| F5 | Scenario compare (2 in MVP, up to 4 later) with overlaid curves + diff table | P0 (2) / P1 (4) ✅ |
| F6 | Sensitivity grid: rate × duration → payment, coloured by 35 % / usury | P1 ✅ |
| F7 | Timeline: deferral end, early repayments, rate resets | P2 |

## G. UX

| # | Feature | Pri |
|---|---|---|
| G1 | Quick mode (3 fields) and Expert mode | P0 ✅ |
| G2 | ⓘ explanation on every term (TAEG, différé, IRA, FMG…) in both languages | P0 ✅ |
| G3 | Presets: first-time buyer, rental investment, car, renegotiation | P1 |
| G4 | Guided step-by-step flow | P1 |
| G5 | Mobile-first responsive layout, dark mode | P0 ✅ |
| G6 | Accessibility: keyboard, screen-reader tables for every chart | P1 |

## H. Language

| # | Feature | Pri |
|---|---|---|
| H1 | English + French at launch | P0 ✅ |
| H2 | Detection: `?lang=` → saved choice → IP country (CDN header) → browser → `en` | P0 ✅ |
| H3 | Currency/number format follows the country, not the UI language | P0 ✅ |
| H4 | ES / DE / IT / NL | P2 |

## I. Save, share, export

| # | Feature | Pri |
|---|---|---|
| I1 | Shareable link: all inputs encoded in the URL | P0 ✅ |
| I2 | Scenarios saved in the browser | P1 ✅ |
| I3 | PDF report (summary + charts + schedule) | P1 ✅ |
| I4 | CSV / Excel schedule export | P1 ✅ |
| I5 | Embeddable widget (`?embed=1`) for agents/blogs | P2 |
| I6 | Optional account & sync | P2 |

## K. Credit type & optional components

| # | Feature | Pri | Gap |
|---|---|---|---|
| K1 | Credit type selector: mortgage, personal, car, works (later: revolving, LOA/LLD, bridge, BNPL); each type sets defaults, visible fields, usury band | P0 ✅ | ✓ |
| K2 | Toggle each component on/off: insurance, guarantee, application fee, broker fee, notary fees, works, other loans (PTZ in Phase 3) | P0 ✅ | ✓ |
| K3 | "Included in TAEG" hint next to each component | P1 | ✓ |
| K4 | Home loan "amount only" mode: quick estimate from the loan amount, without price, down payment or notary fees | P0 ✅ | |
| K5 | Manual override for estimated costs (notary %, guarantee amount) | P0 ✅ | ✓ |

## L. Learn — how it works

| # | Feature | Pri |
|---|---|---|
| L1 | Short, simple explainers (EN/FR): loan, monthly payment, amortization, TAEG, insurance, guarantee, notary, usury, 35 % rule, consumer rights, PTZ | P1 ✅ |
| L2 | "How this calculator works": formulas in plain words, assumptions, limits, data dates | P1 ✅ |
| L3 | Live mini-examples inside explainers | P1 ✅ |
| L4 | ⓘ tooltips link to explainers; glossary page | P1 ✅ |

## J. Trust & platform

| # | Feature | Pri |
|---|---|---|
| J1 | All calculations in the browser; no personal data sent | P0 ✅ |
| J2 | Engine unit-tested against reference cases (ANIL schedule, real offers, BdF TAEG examples) | P0 ✅ |
| J3 | Versioned regulatory data with "valid from/to" + source link shown in the UI | P0 ✅ |
| J4 | Disclaimer: estimate, not an offer | P0 ✅ |
| J5 | Cookieless analytics: PostHog EU (shared with Suncast and Mont Valier), no banner, no simulation figures sent | P0 ✅ |
| J6 | Quarterly data-refresh checklist / reminder | P1 |
