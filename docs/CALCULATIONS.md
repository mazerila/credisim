# Calculation reference

All amounts in euros, rates as decimals. `n` = number of monthly payments, `r` = nominal annual rate / 12.

## Fixed-payment (annuity) loan
```
payment = C · r / (1 − (1 + r)^−n)          (r > 0)
payment = C / n                              (r = 0, e.g. PTZ)
```
Each month: `interest = balance · r`, `capital = payment − interest`, `balance −= capital`.
Round each line to the cent the way banks do; put the rounding remainder on the last payment.

## Deferral (différé)
- **Partial**: during `d` months pay `balance · r` (+ insurance); then annuity on `C` over `n − d`.
- **Total**: interest is capitalised: `C' = C · (1 + r)^d`; then annuity on `C'` over `n − d`.

## Borrower insurance
- On **initial capital**: `ins = C · rate / 12` every month (constant).
- On **remaining capital**: `ins_k = balance_{k−1} · rate / 12` (declining).
- Per borrower: sum over borrowers of `coverage_i · …`.
- **TAEA** = TAEG(with insurance) − TAEG(without insurance).

## TAEG (EU actuarial method)
Find monthly rate `i` such that
```
C − upfront_fees = Σ_{k=1..n} (payment_k + insurance_k) / (1 + i)^k
```
where `upfront_fees` = application fee + broker fee + guarantee (+ mandatory account fees, discounted if recurring).
Solve with Newton–Raphson (start at `r`), fallback to bisection. Then
```
TAEG = (1 + i)^12 − 1
```
Unit-test against published examples (Banque de France / lender "exemple représentatif").

## Guarantee — Crédit Logement (approximation)
`cost ≈ 0.75 % · C + 300 €`; FMG share refunded at end ≈ 60–80 % of the FMG part (rate changes quarterly). Show "net cost after refund".

## Notary fees (old property, approximation)
`DMTO (≈ 6.32 %, 5.81 % in some départements, 5.81 % for first-time buyers)` + notary emoluments (regulated sliding scale ≈ 0.8–1 %) + disbursements (~€1,200). New: transfer tax 0.715 % + emoluments ≈ 2–3 % total.
MVP uses a % preset (7.5 % old / 2.5 % new) that the user can override; v1 implements the real scale.

## Debt ratio (HCSF)
```
ratio = (payment + insurance + other monthly loan payments) / net monthly income
```
Warning above 35 %. Duration warning above 25 years (27 new-build with deferral).

## Usury check
Pick the band from the loan type and duration, compare **TAEG** ≤ usury rate.

## Early repayment
```
IRA = min(6 · monthly interest at current rate on the repaid amount, 3 % · balance before repayment)
```
Then recompute: keep payment → shorter term, or keep term → lower payment.

## Borrowing capacity
```
max_payment = 0.35 · income − other_loans
C_max = max_payment_without_insurance · (1 − (1 + r)^−n) / r
```
With insurance on initial capital: `payment_total = C · (r/(1−(1+r)^−n) + ins_rate/12)` → solve for C directly.

## Linear and in-fine loans
- **Linear** (amortissement constant): capital each month = C / n; payment = C/n + balance · r (falls every month). Total interest = C · r · (n + 1) / 2.
- **In fine**: payment = C · r every month; the whole capital is repaid with the last payment.

## PTZ (2025–2027 rules, `src/lib/data/fr/ptz.json`)
1. Income used = max(tax income N-2, operation cost / 9); divide by the family coefficient (1, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3 for 1…8+ people).
2. Band = first threshold not exceeded (per zone, per unit of coefficient):

| Zone | T1 | T2 | T3 | T4 (ceiling) |
|---|---|---|---|---|
| A bis / A | 25,000 | 31,000 | 37,000 | 49,000 |
| B1 | 21,500 | 26,000 | 30,000 | 34,500 |
| B2 | 18,000 | 22,500 | 27,000 | 31,500 |
| C | 15,000 | 19,500 | 24,000 | 28,500 |

3. Cost ceiling = zone base (A 150k, B1 135k, B2 110k, C 100k) × min(coefficient, 2.4).
4. Amount = min(cost, ceiling) × share: new flat / old with works 50 / 40 / 40 / 20 %, new house 30 / 20 / 20 / 10 %. Old homes with works: zones B2 and C only. Operation cost used by Credisim: price + works.
5. The PTZ can't exceed the other loans: capped at half the total borrowed.
6. Repayment: T1 10-yr deferral / 25 yrs total, T2 8 / 20, T3 2 / 15, T4 0 / 10; 0 %, constant capital after the deferral.

## Smoothing (lissage) with a PTZ
Choose one total T so that main-loan payment + PTZ payment = T every month, and the main loan is exactly repaid:
```
T = (C + Σ_k ptz_k · v^k) / Σ_k v^k,   v = 1 / (1 + r),  k = 1..n (main loan months)
main payment_k = T − ptz_k
```
Not applied when the main loan has a deferral or non-constant payments, or if a month would need a negative main payment.

## Debt ratio with varying payments
The debt ratio uses the **highest** regular monthly outgoing (payment + insurance), not the first one.

## HCSF duration
25 years; 27 for a new build with a deferral (limit = 300 + min(deferral, 24) months).

## Renegotiation
Penalty = min(6 months of interest on the balance at the current rate, 3 % of the balance). New principal = balance (+ penalty + fees + guarantee if financed). Saving = (current payment + insurance) × remaining months − ((new payment + insurance) × new months + upfront costs). Break-even: first month where the cumulated monthly difference covers the upfront costs.

## Check an offer
Payment expected from (amount, rate, months) within €1; rate implied by the stated payment (bisection) within 0.02 pt; TAEG recomputed from the stated payment, insurance, fees and guarantee within 0.05 pt (a higher stated TAEG up to 0.3 pt is only a warning: hidden costs); usury band check; total cost within max(€50, 0.5 %).

## Variable and capped rates
Rate in year y = index_y + margin, with index_y = index + shift × min(y, 2) / 2 (shift from the scenario: −1, 0, +1, +2, +3 points). Capped: clamp to [initial − cap, initial + cap]. At each yearly change the payment is recalculated on the remaining balance and months (same end date). The TAEG and the usury check use the initial rate as if it never changed (EU rule), against the "variable" usury band.

## Revolving credit
Minimum payment = interest + drawn / 36 (≤ €3,000) or drawn / 60 (above) (loi Lagarde). The schedule repays at least that much capital each month; the TAEG is the actuarial rate of those flows.

## Pay in instalments (BNPL)
n equal instalments, the first on the day of purchase with the fees. Credit = price − first instalment; TAEG = actuarial rate that equates (credit − fees) with the n − 1 later instalments.

## Car lease vs loan
Lease total = first payment + rent × months (+ option if you buy). Loan total = first payment + annuity(price − first payment). Net cost = total − value of the car at the end if you own it. Implied lease rate: actuarial rate of the rents plus the option, against price − first payment.

## Debt consolidation
Months left per loan = monthsFromPayment(balance, rate, payment). Before: Σ payment × months left. After: annuity(Σ balances + fees, new rate, new months) × new months.

## Bridge loan
Amount = value × share − capital still owed. Partial deferral: amount × r monthly, amount repaid at the sale. Total deferral: amount × (1 + r)^months repaid at the sale. Also shows what is left from the sale, and the same at a price 10 % lower. Usury band: bridge loans.

## Rental investment (before income tax)
Gross yield = rent × 12 / price. Net rent = rent × (12 − empty months) − charges × 12 − property tax − management % × rents − landlord insurance. Net yield = net rent / (price + notary + works). Cash flow = net rent / 12 − payment − insurance.

## Rent or buy
Both start with the same cash (the down payment). Each month the renter's savings grow at the savings return and receive (buyer's outgoings − rent), where the buyer pays the loan, insurance and owner costs. Buyer's net worth = value × (1 + growth)^years × (1 − selling costs) − capital still owed. Rents and owner costs grow at the rent-growth rate.
