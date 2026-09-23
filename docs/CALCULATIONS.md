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

## PTZ
Amount = min(price, operation-cost ceiling(zone, household)) × quotité(tranche, property type).
Repayment by tranche: T1 10 y deferral / 25 y total, T2 8 / 20, T3 2 / 15, T4 0 / 10; 0 % rate, linear capital after deferral.
