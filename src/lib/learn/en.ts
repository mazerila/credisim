import type { Content } from './types';

export const en: Content = {
  loan: {
    title: 'What is a loan?',
    lead: 'A bank lends you a sum today. You pay it back in monthly instalments, plus a price for the service: the interest.',
    read: 2,
    blocks: [
      { p: 'Every loan comes down to four numbers. Change one and the others move.' },
      {
        terms: [
          { term: 'Capital', def: 'The amount you borrow, for example €200,000.' },
          { term: 'Rate', def: 'The yearly price of the money, for example 3.2 %. It is used to calculate the interest.', link: 'monthly-payment' },
          { term: 'Duration', def: 'How long you take to repay, for example 20 years (240 monthly payments).' },
          { term: 'Monthly payment', def: 'What you pay every month. It repays part of the capital and pays the interest.', link: 'amortization' },
        ],
      },
      { h: 'Longer is cheaper each month, dearer overall' },
      { p: 'Spreading the same loan over more years lowers the monthly payment, but you pay interest for longer. The table below uses a €200,000 loan at 3.2 %.' },
      { example: 'durations' },
      { h: 'What comes on top' },
      { p: 'Interest is not the only cost. Most loans also carry **borrower insurance**, **fees** and, for a home, a **guarantee** and **notary fees**. The [TAEG](#learn/taeg) adds them up into one rate so offers can be compared.' },
      { note: 'Fixed-rate loans are the norm in France: the rate and the monthly payment stay the same until the end.' },
    ],
  },

  'monthly-payment': {
    title: 'How the monthly payment is calculated',
    lead: 'With a fixed rate, every monthly payment is the same. The bank picks the one amount that repays the loan exactly on the last month.',
    read: 3,
    blocks: [
      { p: 'Each month, the bank first charges interest on what you still owe: **remaining capital × yearly rate ÷ 12**. The rest of your payment reduces the capital.' },
      { p: 'The constant payment that makes the balance reach zero after the last month is given by the standard formula:' },
      { note: 'payment = capital × r ÷ (1 − (1 + r)^−n), where r is the yearly rate divided by 12 and n the number of months.' },
      { p: 'For example, €100,000 at 3 % over 20 years gives **€554.60 a month**. Over 240 months you pay €133,104: the €100,000 you borrowed plus about €33,100 of interest.' },
      { h: 'Try it' },
      { example: 'payment' },
      { h: 'What moves the payment most' },
      {
        list: [
          '**Capital:** double it and the payment doubles.',
          '**Duration:** going from 20 to 25 years lowers the payment by about 14 %, but adds about 28 % more interest.',
          '**Rate:** each extra 0.1 point costs roughly €5 a month per €100,000 over 20 years (about €1,200 over the loan).',
        ],
      },
      { p: 'Insurance is usually added on top of this payment. See [borrower insurance](#learn/insurance).' },
    ],
  },

  amortization: {
    title: 'Interest vs capital: the repayment schedule',
    lead: 'Your payment never changes, but what it pays for does. At the start it is mostly interest; at the end, mostly capital.',
    read: 2,
    blocks: [
      { p: 'Interest is calculated on what you still owe. At the beginning you owe a lot, so a big part of the payment is interest. Each month the balance falls a little, so the interest falls and more of the same payment goes to the capital.' },
      { example: 'amortization' },
      { p: 'The **repayment schedule** (tableau d’amortissement) lists every month: the payment, its interest part, its capital part, the insurance and the remaining balance. The bank must give it to you with the offer.' },
      { h: 'Why it matters' },
      {
        list: [
          'After 10 years of a 20-year loan, you have repaid **less than half** of the capital.',
          'Repaying early saves the most interest in the first years.',
          'If you sell, the bank is repaid from the **remaining balance**, not from what you have paid so far.',
        ],
      },
    ],
  },

  'loan-types': {
    title: 'Repayment types and deferral',
    lead: 'Most loans repay the same amount every month, but there are other ways to spread the capital, and you can delay the start.',
    read: 3,
    blocks: [
      { h: 'Three ways to repay the capital' },
      {
        list: [
          '**Constant payments** (échéances constantes): the same payment every month. The norm in France.',
          '**Constant capital** (amortissement constant): the same slice of capital every month, plus the interest. Payments start higher and fall; total interest is lower.',
          '**In fine:** you pay only interest, and repay the whole capital in one go at the end. Used by investors, often backed by savings.',
        ],
      },
      { example: 'loanTypes' },
      { h: 'Deferral (différé)' },
      { p: 'A deferral delays repayment at the start, typically while a new home is being built.' },
      {
        list: [
          '**Partial deferral:** you pay only the interest (and insurance). The capital does not fall yet.',
          '**Total deferral:** you pay nothing (except insurance). The interest is added to what you owe, so the loan costs more.',
        ],
      },
      { p: 'After the deferral, the capital is repaid over the remaining months, so payments are higher than without a deferral. For a new build with a deferral, the maximum duration goes from 25 to 27 years.' },
      { note: 'Try them in the simulator: Detailed mode → Loan → Repayment type and Deferral.' },
    ],
  },

  'variable-rates': {
    title: 'Variable and capped rates',
    lead: 'A variable rate follows a market index. It can fall or rise during the loan; a cap limits how far.',
    read: 3,
    blocks: [
      { p: 'Rate = **index + bank margin**. In France the index is usually the **Euribor 12 months**, and the rate is revised once a year. The margin never changes.' },
      {
        list: [
          '**Variable:** the rate follows the index with no limit.',
          '**Capped (capé):** the rate cannot move more than a set number of points from its starting level (often ±1, ±2 or ±3). Most French variable loans are capped.',
        ],
      },
      { p: 'At each revision the bank recalculates the payment on what is left, keeping the same end date. Some contracts keep the payment and change the duration instead.' },
      { h: 'What the law says' },
      { list: ['The TAEG of a variable loan is calculated as if the starting rate never changed.', 'It must stay under the usury rate for variable loans.'] },
      { note: 'Over 98 % of French home loans are fixed-rate. A variable rate can make sense for a short loan, or if you expect to repay early. Try the scenarios in the simulator: Detailed mode → Loan → Rate type.' },
    ],
  },

  taeg: {
    title: 'What the TAEG includes',
    lead: 'The TAEG (taux annuel effectif global) is the all-in yearly rate. It is the one number to compare between offers.',
    read: 3,
    blocks: [
      { p: 'The **nominal rate** (taux débiteur) only calculates interest. The **TAEG** also counts every cost you must pay to get the loan:' },
      {
        list: [
          'interest',
          'borrower insurance, when the lender requires it',
          'application fee and broker fee',
          'the guarantee (guarantee company, mortgage or lien)',
          'any compulsory account or package fees',
        ],
      },
      { p: 'Notary fees on the purchase are **not** in the TAEG: they are part of the price of the home, not of the credit.' },
      { h: 'How it is calculated' },
      { p: 'The TAEG is the rate at which everything you pay back, month by month, equals the money you actually receive (the loan minus the upfront costs). Since 2016 France uses the EU **actuarial** method, which is why a 3.20 % nominal rate already shows as 3.25 % before any costs.' },
      { example: 'taeg' },
      { note: 'By law, the TAEG must stay below the [usury rate](#learn/usury) for that kind of loan. An offer above it cannot be made.' },
      { p: 'The **TAEA** is the part of the TAEG that comes from insurance alone. It helps compare insurance offers.' },
    ],
  },

  insurance: {
    title: 'Borrower insurance',
    lead: 'It repays the loan if a borrower dies or can no longer work. Banks require it for home loans, and it can cost almost as much as the interest.',
    read: 3,
    blocks: [
      { h: 'Two ways to charge it' },
      {
        list: [
          '**On the initial capital:** the premium is the same every month, from the first to the last. Typical of bank group contracts.',
          '**On the remaining balance:** the premium follows the balance and falls every month. Typical of individual contracts from other insurers.',
        ],
      },
      { p: 'At the same yearly rate, charging on the remaining balance costs a lot less over the life of the loan:' },
      { example: 'insurance' },
      { h: 'Coverage (quotité)' },
      { p: 'Coverage is the share of the loan insured for each borrower. Alone, it must be 100 %. A couple can split 50 % + 50 %, or cover 100 % each (200 % in total), which protects the survivor fully but costs twice as much.' },
      { h: 'You can change insurer at any time' },
      {
        list: [
          'Since the **Lemoine law** (2022) you can switch at any time, with no fees, as long as the new contract offers equivalent cover.',
          'No health questionnaire if your share of the loans is **€200,000 or less** and they end **before your 60th birthday**.',
          'Switching from a bank contract to another insurer often saves thousands of euros.',
        ],
      },
    ],
  },

  guarantee: {
    title: 'The loan guarantee',
    lead: 'It protects the bank if you stop paying. You pay for it once, at the start, and it counts in the TAEG.',
    read: 2,
    blocks: [
      {
        table: {
          head: ['Type', 'How it works', 'Typical cost'],
          rows: [
            ['Guarantee company (caution, e.g. Crédit Logement)', 'A company guarantees the loan. Part of what you pay goes into a mutual fund and is partly refunded at the end.', 'about 0.75 % of the loan + €300, part refunded later'],
            ['Mortgage (hypothèque)', 'Registered by the notary on the property. The bank can have it sold if you default.', 'about 1–2 % of the loan, plus a fee to lift it if you sell early'],
            ['Lender’s lien (PPD)', 'Like a mortgage but only for buying an existing home, and cheaper because it avoids a land-registry tax.', 'about 1 % of the loan'],
          ],
        },
      },
      { p: 'Most home loans in France use a guarantee company. A mortgage is common for large loans or when the guarantee company refuses the file.' },
      { note: 'In Credisim the guarantee is estimated from its type. If your offer gives the exact amount, untick “Estimate automatically” and type it in.' },
    ],
  },

  notary: {
    title: 'Notary fees',
    lead: 'Called “frais de notaire”, they are mostly taxes. The notary collects them for the state and the département when you buy.',
    read: 3,
    blocks: [
      { p: 'They have three parts:' },
      {
        list: [
          '**Transfer taxes** (droits de mutation): the largest part. For an existing home, about 6.3 % of the price in most départements; 0.7 % for a new build.',
          '**The notary’s own fee** (émoluments): set by a regulated sliding scale, about 1 % of the price, plus VAT.',
          '**Disbursements and contribution:** costs the notary pays on your behalf, plus a 0.1 % property-security contribution.',
        ],
      },
      { example: 'notary' },
      { h: 'Existing vs new' },
      { p: 'Expect about **7–8 %** of the price for an existing home and **2–3 %** for a new build.' },
      { h: 'First-time buyers' },
      { p: 'Most départements raised their tax from 4.5 % to 5 % between April 2025 and March 2028. **First-time buyers of their main home are exempt** from that increase, which saves about 0.5 % of the price.' },
      { note: 'Notary fees are part of the project cost, not of the credit cost: they are not in the TAEG. Banks usually expect your down payment to cover them.' },
    ],
  },

  usury: {
    title: 'The usury rate: the legal maximum',
    lead: 'The taux d’usure is the highest TAEG a lender may charge. It protects borrowers from abusive rates.',
    read: 2,
    blocks: [
      { p: 'The Banque de France sets it every quarter for each kind of loan. It is based on the average rates of the previous quarter, plus one third.' },
      { example: 'usury' },
      { p: 'The test uses the **TAEG**, not the nominal rate. A low nominal rate can still break the limit if insurance and fees are expensive, which mostly affects older borrowers or small loans.' },
      { note: 'Credisim checks your TAEG against the right band automatically and shows the quarter the rates come from.' },
    ],
  },

  'debt-ratio': {
    title: 'The 35 % rule and the 25-year limit',
    lead: 'French banks must follow two rules from the HCSF, the financial stability authority, for home loans.',
    read: 2,
    blocks: [
      {
        list: [
          '**Debt ratio ≤ 35 %:** all your monthly loan payments, insurance included, must stay at or below 35 % of your net monthly income.',
          '**Duration ≤ 25 years:** 27 years for a new build when payments start after the works (deferral).',
        ],
      },
      { example: 'debt' },
      { p: 'Banks can go beyond these limits for up to 20 % of their new loans each quarter, mostly for main homes and first-time buyers. So a file above 35 % is not impossible, but it needs to be strong: high income left after payments, savings, a stable job.' },
      { h: 'How to lower your ratio' },
      { list: ['Borrow over a longer period (up to 25 years).', 'Put in a bigger down payment.', 'Pay off small loans before applying.', 'Choose cheaper insurance.'] },
    ],
  },

  'consumer-credit': {
    title: 'Consumer credit and your rights',
    lead: 'Personal, car and works loans follow consumer-credit law, with its own protections.',
    read: 2,
    blocks: [
      {
        list: [
          '**14 days to change your mind** after signing a consumer loan, without giving a reason.',
          '**Usury bands by amount:** up to €3,000, €3,000–6,000 and above €6,000. Smaller loans may legally cost more.',
          '**Works loans above €75,000** follow home-loan rules instead.',
          'The lender must give you a standard information sheet (SECCI) and check that you can repay.',
        ],
      },
      { h: 'Home loans' },
      { list: ['The offer stays valid for at least **30 days**.', 'You must wait **10 days** after receiving it before accepting (you can sign from day 11).', 'The purchase contract usually includes a condition: if you don’t get the loan, you can walk away.'] },
      { note: 'From 20 November 2026 (EU directive CCD2), mini-loans under €200 and buy-now-pay-later offers are covered too, with a TAEG shown.' },
    ],
  },

  ptz: {
    title: 'The PTZ: interest-free loan',
    lead: 'The prêt à taux zéro helps first-time buyers finance their main home. You pay no interest and no fees on it.',
    read: 3,
    blocks: [
      {
        list: [
          'For people who have **not owned their main home in the last 2 years**.',
          'Income-tested: ceilings depend on the zone (A bis, A, B1, B2, C) and household size.',
          'Available until **31 December 2027**.',
          'It finances only part of the purchase (10–50 % depending on income and the type of home); you need a main loan too.',
        ],
      },
      { h: 'Repayment depends on your income band' },
      { example: 'ptz' },
      { p: 'During the deferral you repay nothing on the PTZ, which keeps your total monthly payment low at the start. Banks then often “smooth” the main loan so the total stays constant.' },
      { note: 'Add a PTZ in the simulator: Detailed mode → Included in the simulation → Interest-free loan (PTZ). Credisim checks your band, estimates the amount and can smooth your payments.' },
    ],
  },

  'check-offer': {
    title: 'How to check a loan offer',
    lead: 'A bank offer is full of numbers. A few simple checks tell you whether they hang together.',
    read: 3,
    blocks: [
      { p: 'Look for these figures on the offer (in France, the FISE sheet and the offer itself):' },
      {
        list: [
          'amount, nominal rate and duration',
          'monthly payment **without** insurance, and the insurance per month',
          'application fee, broker fee and guarantee',
          'the **TAEG** and the **total cost of credit**',
        ],
      },
      { h: 'What to check' },
      {
        steps: [
          '**The payment matches the rate:** the amount, rate and duration give exactly one payment. A gap of more than a euro or two means a mistake, or a different rate.',
          '**The TAEG is plausible:** with the fees, guarantee and insurance, you can recompute it. A slightly higher TAEG is normal if the offer includes costs you did not enter (account fees, valuation).',
          '**The TAEG is under the usury rate** for this kind of loan.',
          '**The total cost adds up:** all payments and insurance, minus the amount borrowed, plus fees and guarantee.',
        ],
      },
      { note: 'The “Check my offer” tool does all of this for you: [Tools → Check my offer](#tools/check-offer).' },
      { p: 'You have 10 days to think before accepting a home-loan offer. Use them to compare, and to negotiate the insurance and fees.' },
    ],
  },

  'early-repayment': {
    title: 'Repaying early',
    lead: 'You can repay all or part of your loan before the end. It saves interest, but a penalty may apply.',
    read: 3,
    blocks: [
      { h: 'The penalty (IRA)' },
      { p: 'For a home loan, the bank may charge early-repayment fees (indemnités de remboursement anticipé). The law caps them at the **lower** of:' },
      { list: ['**6 months of interest** on the amount you repay, at the loan’s rate', '**3 % of the capital still owed** before the repayment'] },
      { p: 'No penalty is due when you sell after a job move, in case of death, or when the contract waives it (many do). Consumer loans have their own, smaller cap.' },
      { h: 'Shorter loan or lower payment?' },
      {
        list: [
          '**Keep the same payment:** the loan ends sooner. This saves the most interest.',
          '**Keep the same end date:** the payment falls. Useful if your budget is tight.',
        ],
      },
      { p: 'Repaying early saves the most in the first years, when most of each payment is interest.' },
      { note: 'Work it out with your own numbers: [Tools → Early repayment](#tools/early-repayment).' },
    ],
  },

  'renegotiation': {
    title: 'Renegotiating or transferring your loan',
    lead: 'If rates have fallen since you borrowed, a lower rate can save thousands, as long as the costs don’t eat the saving.',
    read: 3,
    blocks: [
      { list: ['**Renegotiation:** your own bank lowers the rate. Usually a small fee, no new guarantee.', '**Buy-out (rachat):** another bank repays your loan and gives you a new one. You pay the early-repayment penalty, new fees and a new guarantee.'] },
      { h: 'When is it worth it?' },
      { p: 'A common rule of thumb: when the rate gap is at least **0.7 to 1 point**, the remaining capital is large, and you are in the **first half** of the loan. Later, most of your payments are capital and a lower rate saves little.' },
      { h: 'The costs to count' },
      { list: ['early-repayment penalty (capped at 6 months of interest or 3 %)', 'application and broker fees', 'new guarantee', 'possibly a new insurance'] },
      { p: 'The key figure is the **break-even month**: when the monthly savings have paid back the costs.' },
      { note: 'Compare your current loan with an offer: [Tools → Renegotiate or transfer](#tools/renegotiation).' },
    ],
  },

  revolving: {
    title: 'Revolving credit and paying in instalments',
    lead: 'Two easy ways to buy now and pay later, often the most expensive credits there are.',
    read: 3,
    blocks: [
      { h: 'Revolving credit (crédit renouvelable)' },
      { p: 'A reserve of money you can use again as you repay it, often linked to a store card. Rates are high, close to the legal maximum for small amounts.' },
      {
        list: [
          'Each payment must repay at least **1/36** of what you used (up to €3,000) or **1/60** (above), so it is repaid within 3 or 5 years.',
          'For a purchase over €1,000 in a shop, the seller must also offer a classic personal loan.',
          'The contract is renewed every year; you can end it at any time.',
        ],
      },
      { h: 'Pay in 3 or 4 instalments' },
      { p: 'Free when there are no fees. With fees, even small ones, the TAEG can be very high because the money is borrowed for only a few weeks. From 20 November 2026 (directive CCD2) these offers must show a TAEG.' },
      { note: 'See the real cost: [Tools → Revolving credit](#tools/revolving) and [Tools → Pay in 3 or 4 instalments](#tools/bnpl).' },
    ],
  },

  'car-leasing': {
    title: 'Car leasing: LOA, LLD or a loan?',
    lead: 'Leasing gives you a new car for a monthly rent. Whether it beats a loan depends on what you do at the end.',
    read: 3,
    blocks: [
      {
        list: [
          '**LOA** (location avec option d’achat): you rent the car and can buy it at the end for the option price. It follows consumer-credit rules (information sheet, 14 days to change your mind).',
          '**LLD** (location longue durée): you rent and give it back. Maintenance is often included.',
          '**Car loan:** you own the car from day one and can sell it whenever you want.',
        ],
      },
      { h: 'Compare the net cost' },
      { p: 'Add up everything you pay, then subtract what the car is worth at the end if it is yours. Leases also come with a mileage limit and charges for wear when you return the car.' },
      { note: 'Compare with your own figures: [Tools → Car: lease or loan](#tools/car-lease).' },
    ],
  },

  'debt-consolidation': {
    title: 'Debt consolidation',
    lead: 'Grouping several loans into one lowers the monthly payment, but usually raises the total cost.',
    read: 2,
    blocks: [
      { p: 'A bank or a specialist repays your current loans and gives you a single new one, usually over a longer period. Useful when the payments no longer fit your budget.' },
      {
        list: [
          'The monthly payment falls because the duration is longer: the total interest paid usually goes up.',
          'Count the costs: application fee, early-repayment fees on the old loans, a guarantee if a home loan is included.',
          'An intermediary may not take any fee before the new loan is actually paid out.',
        ],
      },
      { note: 'Try it: [Tools → Debt consolidation](#tools/consolidation).' },
    ],
  },

  'bridge-loan': {
    title: 'Bridge loans: buy before you sell',
    lead: 'A bridge loan (prêt relais) advances part of the value of the home you are selling, so you can buy the next one first.',
    read: 3,
    blocks: [
      {
        list: [
          'The bank advances **60 to 80 %** of the estimated value, minus what you still owe on that home.',
          'It lasts **12 to 24 months**. You repay it in one go when you sell.',
          'Interest is paid every month (partial deferral) or all at the sale (total deferral, more expensive).',
          'It is usually combined with a normal loan for the rest of the new purchase.',
        ],
      },
      { h: 'The risk' },
      { p: 'If the sale takes longer or the price is lower than expected, you still have to repay the full amount. Be realistic about the value, and keep a margin.' },
      { note: 'Estimate yours: [Tools → Bridge loan](#tools/bridge-loan).' },
    ],
  },

  'rental-investment': {
    title: 'Rental investment, and rent or buy',
    lead: 'Buying to let is judged on yield and monthly cash flow. Buying your own home, on how long you stay.',
    read: 4,
    blocks: [
      { h: 'Yields' },
      {
        list: [
          '**Gross yield** = yearly rent ÷ price.',
          '**Net yield** = (rent actually collected − charges, property tax, management, insurance) ÷ total cost including notary fees and works.',
          '**Cash flow** = net rent per month − loan payment − insurance. Negative means you add money every month.',
        ],
      },
      { h: 'Tax: unfurnished or furnished (LMNP)' },
      {
        list: [
          '**Unfurnished, micro-foncier:** 70 % of the rent is taxed (up to €15,000 of rent a year), at your marginal rate + 17.2 % social charges.',
          '**Unfurnished, real regime:** actual costs and interest are deducted. A loss from costs other than interest lowers your other income, up to €10,700 a year; the rest is carried forward for 10 years.',
          '**Furnished (LMNP), micro-BIC:** 50 % of the rent is taxed, with 18.6 % social charges since 2025 income.',
          '**Furnished (LMNP), real regime:** the building (not the land) and the furniture are also depreciated. This often cancels the tax for 10 years or more, but since 2025 the depreciation is added back to the capital gain when you sell.',
        ],
      },
      { p: 'The regime often changes the result more than the rate of the loan. The advanced mode of the tool computes all four side by side.' },
      { h: 'The money you tie up' },
      { p: 'Your down payment, the furniture and every monthly top-up could earn interest elsewhere. The advanced mode compares the investment with the same money in a placement at the rate you choose, resale included, and gives the **return on your money** (the yearly rate at which the investment and its resale pay back what you put in).' },
      { h: 'Rent or buy your home?' },
      { p: 'Buying costs a lot at the start (notary fees, interest). It pays off when you stay long enough for the home’s value and the capital repaid to outweigh those costs. Renting and investing the difference can win over short periods or when prices stall.' },
      { note: 'Try both: [Tools → Rental investment](#tools/rental) and [Tools → Rent or buy?](#tools/rent-vs-buy).' },
    ],
  },

  calculator: {
    title: 'How this calculator works',
    lead: 'What Credisim calculates, the assumptions it makes, and where its data comes from.',
    read: 3,
    blocks: [
      { h: 'What it calculates' },
      {
        list: [
          'The monthly payment of a **fixed-rate** loan with constant payments, and the full schedule, rounded to the cent like a bank statement.',
          'Insurance on the initial capital or on the remaining balance.',
          'The **TAEG** with the EU actuarial method, and how much of it comes from interest, insurance and fees.',
          'The amount to borrow: price + notary fees + works + fees + guarantee − down payment.',
          'The legal checks: usury rate, 35 % debt ratio, 25-year duration.',
          'Your borrowing capacity at 35 % of your income.',
        ],
      },
      { h: 'Assumptions and limits' },
      {
        list: [
          'Notary fees follow the 2026 regulated scale and transfer-tax rates, with flat disbursements of about €1,200. Your notary’s figure may differ slightly.',
          'The guarantee is an estimate (guarantee company about 0.75 % + €300; mortgage about 1.5 %; lien about 1 %). The partial refund at the end of a guarantee-company loan is not deducted.',
          'Fees are financed inside a home loan and paid upfront for consumer loans.',
          'Borrowing capacity counts insurance at its first-month level, which errs on the safe side.',
          'The PTZ follows the 2025–2027 rules (bands, shares, cost ceilings); the operation cost used is price + works. Its final amount is set by the bank.',
          'Variable and capped rates: the index follows your chosen scenario over two years, then stays; the payment is recalculated each year at the same end date.',
          'Not yet included: other assisted loans (Action Logement, employer loans), and country rules outside France.',
        ],
      },
      { h: 'Data and sources' },
      {
        list: [
          'Usury rates: Banque de France, updated every quarter. The quarter in use is shown under the TAEG.',
          'Lending rules: HCSF, confirmed in March 2026.',
          'Notary scale and transfer taxes: regulated rates for 2026.',
        ],
      },
      { h: 'Privacy' },
      { p: 'Everything runs in your browser. Nothing you type is sent to a server. A share link carries the simulation inside the link itself.' },
      { note: 'Credisim gives estimates for information only. Only the lender’s offer is binding.' },
    ],
  },

  glossary: {
    title: 'Glossary',
    lead: 'The words you will meet in a loan offer, in plain English, with the French term.',
    read: 4,
    blocks: [
      {
        terms: [
          { term: 'Amortization (amortissement)', def: 'Repaying the capital little by little with each payment.', link: 'amortization' },
          { term: 'Borrowing capacity (capacité d’emprunt)', def: 'The largest loan you can get while keeping payments at 35 % of your income.', link: 'debt-ratio' },
          { term: 'Broker (courtier)', def: 'An intermediary who compares banks for you, usually for a fee.' },
          { term: 'Coverage (quotité)', def: 'Share of the loan insured for each borrower.', link: 'insurance' },
          { term: 'Credit cost (coût du crédit)', def: 'Everything you pay on top of the capital: interest, insurance, fees, guarantee.', link: 'taeg' },
          { term: 'Debt ratio (taux d’endettement)', def: 'Monthly loan payments divided by net monthly income.', link: 'debt-ratio' },
          { term: 'Deferral (différé)', def: 'A period at the start when you repay no capital (partial) or nothing at all (total).' },
          { term: 'Down payment (apport)', def: 'Your own money put into the purchase. It usually covers at least the notary fees.' },
          { term: 'Early repayment penalty (IRA)', def: 'Fee for repaying a home loan early, capped at 6 months of interest or 3 % of the remaining capital, whichever is lower.' },
          { term: 'First-time buyer (primo-accédant)', def: 'Someone who has not owned their main home recently. Matters for the PTZ and notary fees.', link: 'ptz' },
          { term: 'Guarantee (garantie, caution)', def: 'Protection for the lender if you stop paying.', link: 'guarantee' },
          { term: 'Insurance delegation (délégation d’assurance)', def: 'Choosing an insurer other than the bank’s group contract.', link: 'insurance' },
          { term: 'Monthly payment (mensualité)', def: 'The amount paid each month.', link: 'monthly-payment' },
          { term: 'Nominal rate (taux nominal, taux débiteur)', def: 'The rate used to calculate the interest only.', link: 'monthly-payment' },
          { term: 'Notary fees (frais de notaire)', def: 'Mostly taxes paid when buying a property.', link: 'notary' },
          { term: 'PTZ (prêt à taux zéro)', def: 'Interest-free state-backed loan for first-time buyers.', link: 'ptz' },
          { term: 'Reflection period (délai de réflexion)', def: '10 days you must wait before accepting a home-loan offer.', link: 'consumer-credit' },
          { term: 'Remaining balance (capital restant dû)', def: 'The capital you still owe at a given date.', link: 'amortization' },
          { term: 'Repayment schedule (tableau d’amortissement)', def: 'Month-by-month table of payments, interest, capital and balance.', link: 'amortization' },
          { term: 'TAEA', def: 'The part of the TAEG that comes from insurance.', link: 'taeg' },
          { term: 'TAEG', def: 'All-in yearly rate: interest, insurance, fees and guarantee.', link: 'taeg' },
          { term: 'Usury rate (taux d’usure)', def: 'The legal maximum TAEG, set every quarter.', link: 'usury' },
        ],
      },
    ],
  },
};
