# Market & regulatory research

_Research date: 22 September 2026. Figures change — every number below carries its source and must be re-checked before it ships in the app (see "Data that must be refreshed")._

## 1. Existing solutions

### 1.1 France — mortgage brokers (courtiers)

| Tool | What it does well | Where it falls short for us |
|---|---|---|
| **[Meilleurtaux](https://www.meilleurtaux.com/credit-immobilier/simulation-de-pret-immobilier/calcul-des-mensualites.html)** | Slider-based "calculette" (amount €20k–1.5M, duration, rate pre-filled from market, insurance TAEA). Suite of separate tools: debt ratio, borrowing capacity, amortization table, notary fees, TAEG, renegotiation. Weekly rate barometer, price map. Rated most complete cost view in 2026 comparisons. | Each question is a **separate** calculator — no single project view. Results explicitly **exclude the PTZ**. The funnel leads to an advisor/lead form. French only. |
| **[Pretto](https://www.pretto.fr/simulation-pret-immobilier/)** | Best UX of the brokers: 3-minute quick estimate, then detailed simulator. Inputs: price, location, 1–2 borrowers, income, savings, 5–27 years. Outputs: payment, cost, debt ratio, capacity, amortization, cost split. "Finspot" matches the profile against 125 banks. Free financing certificate. Calculators: simulation, capacity, debt ratio, notary, renegotiation, early repayment, PTZ. | Business model is lead generation: the journey steers toward an advisor / application. Comparison limited to adjusting rate, duration and down payment. French only. |
| **[Empruntis](https://www.empruntis.com/financement/comparateur/comparateur-pret-immobilier.php)** | Comparator + branch network. | Similar to Meilleurtaux; comparison is the product, not the calculation. |
| CAFPI, Vousfinancer, Ace Crédit… | Similar broker simulators + PTZ guides ([CAFPI PTZ](https://www.cafpi.fr/credit-immobilier/pret-aide-accession/pret-taux-zero-plus/le-remboursement-du-ptz)). | Same lead-gen pattern. |

### 1.2 France — public / neutral

| Tool | What it does well | Where it falls short |
|---|---|---|
| **[ANIL](https://www.anil.org/outils/outils-de-calcul/)** (national housing information agency) | The reference neutral tools: [loan schedule](https://www.anil.org/outils/outils-de-calcul/echeancier-dun-pret/), [PTZ simulator](https://www.anil.org/outils/outils-de-calcul/votre-pret-a-taux-zero/), [financing diagnosis](https://www.anil.org/outils/outils-de-calcul/diagnostic-de-financement/) (full budget), notary fees, mortgage fees, capital-gains tax, rental yield. Trusted, up to date with regulation. | Dated form-based UX, no charts worth the name, no comparison, no sharing, French only. |
| **[Amortia](https://www.tableau-amortissement.pro/)** (tableau-amortissement.pro) | Clean amortization tables (capital, interest, insurance, balance), exportable, **100 % in-browser, no data leaves the computer**, no sign-up. Also accounting depreciation for companies. | Narrow scope (schedule only). ⚠️ **Uses the name "Amortia"** — see NAMING.md. |
| Single-purpose sites (calculer-ptz.fr, simulation-pret-bancaire.info, un-calcul.fr, [data.gouv PTZ reuse](https://www.data.gouv.fr/reuses/simulateur-ptz-2026-detaille-calcul-du-montant-differe-mensualites-lissees)) | SEO-driven, each solves one question (PTZ, debt ratio…). | Fragmented, ad-heavy, variable accuracy. |

### 1.3 France — banks & consumer credit

| Tool | Notes |
|---|---|
| Bank simulators (Crédit Agricole, BNP Paribas, Société Générale, LCL, Boursorama…) | Show only that bank's product and default insurance (group contract, on initial capital). Good for a baseline, useless for comparison. |
| Consumer-credit lenders (Cetelem, Cofidis, Sofinco, Floa) | Amount + duration → payment + TAEG ("exemple représentatif"). No schedule, no comparison, no LOA/LLD vs loan analysis. |

### 1.4 Europe

| Tool | Country | What it does well |
|---|---|---|
| **[Interhyp](https://www.interhyp.de/baufinanzierungsrechner/)** | 🇩🇪 | Change rate, repayment rate (Tilgung), fixed-rate period (Sollzinsbindung), equity → compare scenarios live. Tilgungsplan, **Sondertilgung** (extra repayments), **Anschlussfinanzierung** (follow-up financing after fixed period), full-repayment calculator. |
| **Dr. Klein, Baufi24** | 🇩🇪 | Similar broker calculators, 500+ banks. |
| **[Hypofriend](https://hypofriend.de/en/german-mortgage-calculator)** | 🇩🇪 (EN) | English-language: location-based transfer tax, commission, LTV-dependent rate estimate, **scenario comparison across fixed-rate periods**, purchase-cost breakdown, rate-impact on residual debt. |
| **[Finanztip Tilgungsrechner](https://www.finanztip.de/tilgungsrechner/)** | 🇩🇪 | Neutral consumer-org calculator. |
| **[mortgagecalculator.net/eur](https://www.mortgagecalculator.net/eur/)**, [EU Investing Hub](https://www.euinvestinghub.com/calculators/mortgage-calculator-european-investors/) | EU generic | Annuity vs linear vs interest-only, overpayments. No country rules (fees, taxes, caps). |

### 1.5 What the market is missing (our opportunity)

1. **One neutral project view.** Brokers split capacity / payment / notary / TAEG / PTZ into separate pages and route to a sales call. ANIL is neutral but dated. Nobody gives a free, modern, all-in-one, no-sign-up simulator.
2. **Transparent TAEG.** Tools show a TAEG number; almost none explain *what's inside it* (interest + insurance + fees + guarantee) or check it live against the **taux d'usure**.
3. **Insurance done right.** Bank group insurance (on initial capital) vs delegation (on remaining capital), per-borrower coverage, and **Lemoine-law switch savings** — rarely modelled side by side.
4. **Multi-loan packages.** Main loan + PTZ (with deferral) + Action Logement + employer loan, with **lissage** (smoothing to a constant total payment). Meilleurtaux excludes PTZ; ANIL computes PTZ but not the package.
5. **Real scenario comparison.** 2–4 scenarios overlaid (duration, rate, insurance, down payment) — common in German tools, rare in French ones.
6. **"Check my bank offer" (vérifier mon offre).** Enter the figures from an actual offer and verify the schedule and TAEG. No mainstream tool does this.
7. **Early repayment & renegotiation** with the legal IRA cap and break-even — exists, but as isolated calculators.
8. **Cross-border.** Nobody offers French, Belgian, German, Spanish rules in one tool — relevant for cross-border workers (Luxembourg, Switzerland, Monaco) and expats.
9. **Language.** French tools are French-only; German tools German-only. Expats in France have no good English tool.
10. **Privacy & shareability.** In-browser calculation + a shareable link / PDF with no account.

## 2. French regulatory facts (as of Sept 2026)

### Usury rates (taux d'usure) — Q3 2026, valid 1 Jul – 30 Sep 2026
Source: [Banque de France](https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q3). **Q4 rates are published around 30 Sept — update on 1 Oct 2026.**

| Category | Usury rate |
|---|---|
| Mortgage, fixed, < 10 years | 4.07 % |
| Mortgage, fixed, 10–20 years | 4.57 % |
| Mortgage, fixed, ≥ 20 years | 5.29 % |
| Mortgage, variable | 5.28 % |
| Bridge loan (prêt relais) | 6.39 % |
| Consumer ≤ €3,000 | 23.53 % |
| Consumer €3,000–6,000 | 15.67 % |
| Consumer > €6,000 | 8.56 % |

The usury test applies to the **TAEG** (all-in rate), not the nominal rate.

### HCSF lending rules
Source: [CPIM](https://www.cpim.fr/hcsf-2026-plafond-endettement/). Confirmed at the HCSF March 2026 meeting.
- Debt ratio ≤ **35 %** of net income, **insurance included**.
- Duration ≤ **25 years** (27 with deferral for new-build/VEFA).
- Banks can exceed for **20 %** of quarterly production; ≥ 70 % of that for main residences, ≥ 30 % for first-time buyers.

### PTZ (zero-rate loan)
Sources: [Pretto](https://www.pretto.fr/pret-immobilier/pret-taux-zero-ptz/plafonds-ptz-2026/), [Hestia](https://www.hestia.fr/blog/evolution-ptz), [calculer-ptz.fr](https://calculer-ptz.fr/tranches-revenus-ptz).
- Extended to **31 Dec 2027**. First-time buyers, main residence, income-tested.
- Zones A bis, A, B1, B2, C. New individual houses eligible in all zones since April 2025; old property with works ≥ 25 % of cost in some zones.
- **4 income tranches**; quotité 20–50 % (flats) / 10–30 % (houses).
- Repayment: T1 10-yr deferral / 25 yrs · T2 8 / 20 · T3 2 / 15 · T4 0 / 10.
- Income ceilings 2026 unchanged from 2025: €28,500 (zone C, 1 person) → €161,700 (zone A, 8+). Full table in Pretto source.
- Exact barème used by the engine (bands per zone, family coefficients, cost ceilings, shares): see `docs/CALCULATIONS.md` § PTZ and `src/lib/data/fr/ptz.json`; sources [stop-loyer.fr](https://www.stop-loyer.fr/baremes-ptz-2026), [calculer-ptz.fr](https://calculer-ptz.fr/tranches-revenus-ptz).

### Notary fees (frais de notaire)
Source: [CPIM DMTO 2026](https://www.cpim.fr/droits-mutation-immobilier-2026/), [Kohen Avocats](https://kohenavocats.fr/2026/05/05/frais-notaire-2026-droits-mutation-primo-accedant-compromis/).
- Old property: ~7–8.5 %. Most départements raised the DMTO to 5 % (1 Apr 2025 – 31 Mar 2028): transfer taxes ≈ **6.32 %**; 11 départements stayed at 5.81 %; Indre 5.09 %.
- **First-time buyers are exempt from the increase** (keep 4.5 % departmental rate).
- New property (VEFA): ~2–3 % (transfer tax 0.715 %).

### Loan guarantees
Source: [Perlib](https://perlib.fr/articles/credit-logement), [Crédit Logement](https://www.creditlogement.fr/particuliers/tarification-classic/).
- Crédit Logement caution ≈ **0.75 % + €300**; commission (kept) + FMG contribution, of which ~60–80 % is refunded at the end. "Initio" formula for 18–36 year-olds defers the commission.
- Mortgage (hypothèque) / PPD: notary + registration costs, ~1–2 % of the loan.

### Borrower insurance
Source: [April](https://www.april.fr/assurance-pret/guide/loi-lemoine), [Finances Claires](https://financesclaires.fr/assurance-emprunteur/loi-lemoine/loi-lemoine-2026/).
- Lemoine law: switch insurer **any time**, no fees.
- No medical questionnaire if share of loans ≤ **€200,000 per borrower** and repaid before **60**.
- Since 1 Sep 2026: total invalidity threshold harmonised at 66 %.
- Savings bank group vs delegation: e.g. €6k–15k on a €220k loan.

### Consumer credit — CCD2
Source: [Kohen Avocats](https://kohenavocats.fr/2026/09/18/credit-consommation-reforme-20-novembre-2026-mini-credit-taeg-recours-contester/), [EXE](https://exe-conseil.fr/blog/ccd2-reforme-credit-consommation-2026).
- From **20 November 2026**: TAEG also applies to mini-loans < €200 and **BNPL**; overdraft minimum fees included in TAEG; standardised mobile-readable SECCI; verified-data solvency checks.
- → A "BNPL / split payment real cost" calculator is timely.

### TAEG method
Since 2016 France uses the EU **actuarial** method (same as the APRC in the EU Consumer Credit and Mortgage Credit Directives): find the periodic rate *i* that equates the net amount lent (loan − upfront fees) with the discounted flows (payments + insurance), then TAEG = (1 + i)^12 − 1.

## 3. Europe — market data
- 12-month Euribor ≈ **2.75–3.05 %** in September 2026 ([euribor-rates.eu](https://www.euribor-rates.eu/fr/taux-euribor-actuels/4/euribor-taux-12-mois/), [ABC Bourse](https://www.abcbourse.com/cotation/EUR12Mp)).
- Average French fixed mortgage rates ≈ 2.5–3.5 % depending on profile ([simulation-pret-bancaire.info](https://www.simulation-pret-bancaire.info/les-meilleurs-simulateurs-de-pret-immobilier-pour-comparer-et-decider/)).

### Country presets (September 2026, `src/lib/data/eu/countries.json`)
Estimates for a simulation, not legal advice. Every figure is stored with its sources in the JSON file.

| Country | Typical fixed rate | Purchase taxes | Notary / registration | Guarantee | Debt guideline |
|---|---|---|---|---|---|
| 🇧🇪 Belgium | 3.35 % | Registration duty by region: Wallonia 3 % (own home, €20k allowance) / 12.5 %, Flanders 2 % / 12 %, Brussels 12.5 % (€200k allowance) | ≈ 1 % + €1,100 | Mortgage deed ≈ 1.6 % + €600 | 40 % (bank practice) |
| 🇩🇪 Germany | 3.9 % | Grunderwerbsteuer 3.5–6.5 % by Land | Notary + land registry ≈ 2 % | Grundschuld ≈ 0.4 % | 40 % (bank practice) |
| 🇪🇸 Spain | 2.97 % | ITP 6–10 % (resale) or VAT + AJD ≈ 10.7–11.5 % (new), by region | Notary, registry, gestoría ≈ €1,800 | Valuation ≈ €400 (bank pays the deed since 2019) | 35 % |
| 🇮🇹 Italy | 2.95 % | Resale: registro 2 % (prima casa) or 9 % of the cadastral value, approximated as 1 % / 4.5 % of the price + €100; new builds: IVA 4 % / 10 % + ≈ €600 | Notary ≈ €3,050 | Ipoteca: substitute tax 0.25 % (prima casa) / 2 % + notary ≈ €2,200 | 33 % |
| 🇳🇱 Netherlands | 4.1 % | Overdrachtsbelasting 2 % (own home), 0 % for starters up to €555k, 8 % otherwise | ≈ €2,600 | NHG 0.4 % up to €470k | 35 % (NIBUD tables in reality) |

Only France has a legal usury rate check and a binding debt-ratio rule (HCSF); elsewhere the debt limit is shown as a guideline.

## 4. Data that must be refreshed

| Data | Frequency | Source |
|---|---|---|
| Taux d'usure | Quarterly (1 Jan/Apr/Jul/Oct) | Banque de France |
| Average market rates (default rate) | Monthly | Banque de France / broker barometers |
| Euribor | Daily/monthly | EMMI / euribor-rates.eu |
| PTZ ceilings, zones | Yearly / by decree | service-public.fr, ANIL |
| DMTO by département | Yearly | DGFiP / notaires.fr |
| Crédit Logement FMG refund rate | Quarterly | Crédit Logement |
| HCSF rules | On HCSF decision | HCSF |

Store these as versioned JSON in the repo (`data/fr/usury-2026-Q3.json` …) with the source URL and "valid from/to" dates, displayed in the UI.
