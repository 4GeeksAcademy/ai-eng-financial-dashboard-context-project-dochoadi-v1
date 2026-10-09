# Financial Analysis Reference — Analyst Standards

> Industry-standard benchmarks, formulas, and heuristics used by the
> `formato-financiero` skill.  These values encode 10+ years of
> financial-analysis practice and are the basis for every rule threshold.

## 1. Profitability Thresholds

| Metric              | Healthy    | Warning         | Critical       |
|---------------------|------------|-----------------|----------------|
| Net Profit Margin   | > 15 %     | 5–15 %          | < 5 %          |
| Gross Margin        | > 40 %     | 20–40 %         | < 20 %         |
| EBITDA Margin       | > 20 %     | 10–20 %         | < 10 %         |
| Return on Sales     | > 10 %     | 5–10 %          | < 5 %          |

## 2. Cost Structure Benchmarks

| Category        | Target        | Warning         | Bloated        |
|-----------------|---------------|-----------------|----------------|
| COGS            | < 50 % of rev | 50–65 %         | > 65 %         |
| Sales & Marketing | < 20 %      | 20–30 %         | > 30 %         |
| R&D             | < 15 %        | 15–25 %         | > 25 %         |
| G&A (overhead)  | < 15 %        | 15–20 %         | > 20 %         |
| Suppliers       | < 20 %        | 20–30 %         | > 30 %         |

These are used in **R3 (Cost Structure & Efficiency)**.

## 3. Cash Flow & Liquidity

| Metric               | Healthy    | Warning         | Critical       |
|----------------------|------------|-----------------|----------------|
| Current Ratio        | > 2.0      | 1.0–2.0         | < 1.0          |
| Quick Ratio          | > 1.0      | 0.5–1.0         | < 0.5          |
| Cash Conversion Cycle| < 45 days  | 45–90 days      | > 90 days      |
| Negative Cash Months | 0 / year   | 1–3 / year      | > 3 / year     |

Used in **R5 (Cash Flow & Working Capital)**.

## 4. Revenue Health Signals

- **YoY Growth > 20 %**  →  Healthy scaling.
- **YoY Growth 5–20 %**  →  Moderate / mature market.
- **YoY Growth < 5 %**   →  Stagnation risk.
- **3 consecutive months of decline**  →  **Contraction in progress** (R2).
- **Flat H1→H2 (< 10 % change)**  →  No seasonal growth, possible plateau.

Used in **R2 (Revenue Health & Growth)**.

## 5. Margin Trend Analysis

- **Month-over-month margin swing > 15 pp**  →  Flagged as volatile (R4).
- **3+ consecutive margin declines**  →  Structural deterioration.
- **Margin range > 50 pp in a 12-month window**  →  Unstable business model.
- **Recovering margin after a negative month**  →  Resilience signal.

## 6. Anomaly Detection Heuristics

| Signal                        | Threshold            |
|-------------------------------|----------------------|
| Income MoM increase > 50 %   | Investigate (may be a data error or one-off) |
| Outcome MoM increase > 50 %  | **Critical** — uncontrolled cost spike |
| Category proportion shift > 20 pp | Structural change |
| Zero-amount movements         | Data-quality issue   |

Used in **R6 (Anomaly & Outlier Detection)**.

## 7. Segment Mix (B2B / B2C)

- **B2B margin < 15 %**  →  Possible pricing pressure or high-touch costs.
- **B2C margin > 50 %**  →  Attractive unit economics (if volume is there).
- **Imbalanced mix (> 80 % one segment)**  →  Concentration risk.
- **Both segments profitable**  →  Healthy diversification.

Used in **R7 (Segment Performance)**.

## 8. Category Concentration

- **Single category > 70 % of income**  →  Dangerous dependency.
- **Single category > 50 % of outcome**  →  Supplier / cost concentration risk.
- **"Others" > 15 % of any flow**  →  Poor data classification — clean data.

Used in **R8 (Category Concentration & Dependency)**.

## 9. The "Graham Rule" for Growth vs Profitability

> *"A company should be profitable before it tries to grow fast."*
> — Paul Graham

Apply when:
- Revenue is growing > 20 % YoY **and** margin is declining.
- **Action**: Pause growth spend; optimise unit economics first.
- **If margin is compressing as revenue scales** → diseconomies of scale.

Used in **R9 (Growth vs Profitability Trade-off)**.

## 10. Forward-Looking Synthesis

The P0–P3 priority system:

| Priority | Label     | Criteria                                  |
|----------|-----------|-------------------------------------------|
| **P0**   | Survival  | Cash-negative, margin < 0, or legal risk  |
| **P1**   | Near-term | Revenue decline, cost spikes, concentration |
| **P2**   | Medium    | Diversification, efficiency, monitoring    |
| **P3**   | Ongoing   | Trend tracking, reporting cadence          |

Used in **R10 (Strategic Recommendations)**.

---

*These references are informed by: Graham (2005), Damodaran (2012),
and 10+ years of financial analysis practice.*