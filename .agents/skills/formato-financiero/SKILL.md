---
name: formato-financiero
description: Financial analysis skill for reviewing financial dashboards, charts, and KPIs. Detects trends, anomalies, profitability shifts, cost structure issues, and provides data-driven recommendations based on 10+ years of senior financial analysis experience.
license: Apache 2.0
---

# Financial Analysis & Review Skill (formato-financiero)

A skill for analyzing financial dashboards — reviewing KPIs, charts, and raw data to produce actionable financial intelligence. Use this after a financial dashboard is rendered to extract insights, flag issues, and recommend strategic actions.

> ⚠️ **This skill is read-only**: it analyzes visible data, never modifies the application code or underlying data.

---

## Decision Tree: Choosing Your Analysis Depth

```
User asks to review financial data → What's the scope?
    ├─ "Quick pulse check" → Run: python scripts/quick_pulse.py
    │   Returns: 5-key-metric summary with go/no-go flags
    │
    ├─ "Full financial review" → Run: python scripts/financial_review.py
    │   Returns: Comprehensive 10-rule analysis with recommendations
    │
    └─ "Specific question" (e.g. margins, costs, growth)
        └─ Use the relevant rule below directly
```

---

## The 10 Financial Analysis Rules

Each rule represents a dimension a senior financial analyst would evaluate. Apply all 10 for a complete review, or select specific rules for targeted analysis.

---

### R1 — Profitability & Net Performance

**What to look for**:
- **Gross Profit (Income − Outcome)**: Is it positive? A negative profit means the operation is burning cash.
- **Profit Margin %**: Industry benchmarks vary, but a margin below 10% is thin for most non-retail businesses; above 30% is healthy. Compare against prior periods, not just absolute value.
- **Profit per unit of income**: A declining margin with growing revenue is a red flag (growth without profitability).
- **Return on Revenue (ROR)**: Same as profit margin — every dollar of income should generate a consistent or improving percentage of profit.

**Red flags**:
- ❌ Profit is negative (operating at loss)
- ❌ Profit margin < 5% (critical thin margin)
- ⚠️ Profit margin declining for 3+ consecutive months
- ⚠️ Profit is positive but margin is below risk-free rate (~5%)

**Recommendations**:
- If margin < 10%: Review cost structure, identify non-essential expenses, renegotiate supplier contracts
- If margin declining: Investigate whether costs are growing faster than revenue (cost disease)
- If margin > 30% but revenue stagnant: Consider reinvestment strategy — healthy margins should fund growth

---

### R2 — Revenue Health & Growth

**What to look for**:
- **Revenue trend**: Is total income growing, flat, or declining month-over-month?
- **Revenue consistency**: Uneven revenue spikes might indicate one-off events, not sustainable growth.
- **Revenue concentration**: If income comes overwhelmingly from a single category (e.g. >70% from "sales"), the business has concentration risk.
- **Growth rate**: Month-over-month growth should be contextualized — 10% MoM is exceptional, 2-5% is solid, negative means contraction.
- **B2B vs B2C revenue split**: A healthy business typically has both segments; extreme dependence on one creates vulnerability.

**Red flags**:
- ❌ Revenue declining for 3+ consecutive months
- ❌ A single month has >40% of total revenue (bunching risk)
- ⚠️ Revenue is flat but costs are rising (margin compression)
- ⚠️ No revenue from one business type (B2B or B2C missing)

**Recommendations**:
- If declining: Investigate root cause — market contraction, churn, pricing pressure, or competitive loss
- If concentrated: Build alternate revenue streams; dependency on one category is a strategic risk
- If flat: Recommend growth initiatives — marketing, new segments, upsell existing clients
- If B2B-dependent: B2C provides stability; if B2C-dependent: B2B provides higher-value contracts

---

### R3 — Cost Structure & Efficiency

**What to look for**:
- **Cost-to-income ratio**: Total outcome ÷ total income. Below 70% is efficient, 70-85% is normal, above 85% is cost-heavy, above 100% means cash burn.
- **Category composition**: Which categories consume the most? "Suppliers" and "operational" are typically essential; "administrative" should be lean.
- **Cost volatility**: Are expenses predictable or erratic? High volatility indicates poor budgeting or control.
- **Fixed vs variable behavior**: Look at month-to-month consistency. Stable costs suggest fixed overhead; variable costs should correlate with revenue.

**Red flags**:
- ❌ Cost-to-income ratio > 100% (operating loss)
- ❌ Administrative costs > 15% of total outcome (bloated overhead)
- ⚠️ Any cost category growing faster than revenue
- ⚠️ Outcome spikes in a month with no corresponding income increase

**Recommendations**:
- If ratio > 85%: Implement cost-control program, review all non-essential vendor spend
- If administrative > 15%: Flatten management structure, automate processes, reduce overhead
- If volatile: Build rolling forecast with 3-month averages to smooth planning
- If suppliers dominate (40%+): Evaluate vendor consolidation for volume discounts

---

### R4 — Margin Trend & Trajectory

**What to look for**:
- **Margin trajectory**: Is profit margin improving, stable, or deteriorating over the period?
- **Margin by month**: Monthly profitPercent plotted over time reveals the trend line.
- **Inflection points**: Identify months where margin significantly changed — what caused it?
- **Income vs Outcome growth rates**: Compare the slope of income growth vs outcome growth. If outcome grows faster, margin will compress.
- **Zero or negative margin months**: Even one month of negative margin needs explanation.

**Red flags**:
- ❌ Margin decreasing for 3+ consecutive months (structural deterioration)
- ❌ Margin swung from positive to negative (profitability crisis)
- ⚠️ Margin is flat despite revenue growth (costs growing proportionally — no operating leverage)
- ⚠️ Large single-month margin drop > 10 percentage points

**Recommendations**:
- If deteriorating: Perform variance analysis — identify which cost line is driving the compression
- If volatile: Implement rolling 12-month average margin as the reference metric
- If flat with growing revenue: This is "growth without leverage" — costs should scale slower than revenue
- If improving: Identify what changed and codify it — replicate the successful pattern

---

### R5 — Cash Flow & Working Capital

**What to look for**:
- **Net cash position**: Profit (income − outcome) represents net cash generation in this simplified model.
- **Cash runway**: If profit is negative, how many months until reserves are depleted? (In this system there are no reserves — but the question matters conceptually.)
- **Seasonal patterns**: Does cash flow vary by month? Some months generate surplus, others deficit.
- **Working capital efficiency**: A healthy business generates positive cash each period; consistent negative cash flow is unsustainable.

**Red flags**:
- ❌ Negative profit for any month
- ❌ Cumulative profit over the full period is negative
- ⚠️ Back-loaded income (revenue concentrated in later months) creates cash pressure early
- ⚠️ Large positive profit in early months but declining trend

**Recommendations**:
- If negative months exist: Build a cash reserve target of 3-6 months of average outcome
- If back-loaded: Negotiate better payment terms, invoice earlier, consider progress billing
- If cumulative negative: This is a survival issue — reduce costs or raise prices immediately
- If positive but declining: Reverse the trend before it turns negative

---

### R6 — Anomaly & Outlier Detection

**What to look for**:
- **Income spikes**: Sudden > 50% MoM income increase — is it real growth or a one-off?
- **Outcome spikes**: Sudden > 40% expense increase — investigate immediately.
- **Margin outliers**: Months where margin deviates > 2 standard deviations from the mean.
- **Zero-data months**: Months with no income or no outcome indicate either no activity or a data gap.
- **Category anomalies**: A category that normally has zero spend suddenly showing activity, or vice versa.

**Red flags**:
- ❌ Income spike > 100% MoM without explanation (potential data error or non-recurring event)
- ❌ Outcome spike > 50% MoM (runaway cost, fraud, or accounting error)
- ⚠️ A month with income but zero outcome (data integrity concern)
- ⚠️ Margin change > 15 percentage points MoM

**Recommendations**:
- Flag all anomalies for human review — do not automatically dismiss them
- Compare anomaly months against the same month in prior period if available
- For margin outliers: Recompute the numbers, then trace to the underlying transactions
- If outcome spikes repeat: Build a monitoring rule that alerts when costs exceed 2× rolling average

---

### R7 — Segment Performance (B2B vs B2C)

**What to look for**:
- **Segment mix**: What percentage of movements/volume comes from B2B vs B2C?
- **Segment profitability**: Does one segment have a better margin profile?
- **Segment growth**: Is one segment growing faster? Is it the more profitable one?
- **Segment concentration**: Over-reliance on one segment creates strategic risk.

**Red flags**:
- ❌ A segment is entirely missing (no B2B or no B2C movements)
- ❌ One segment represents > 80% of volume (extreme concentration)
- ⚠️ The growing segment has worse margins than the shrinking one (unprofitable growth)
- ⚠️ B2C is growing but B2B is stagnant (potential market positioning issue)

**Recommendations**:
- If one segment dominates: Actively develop the other for diversification
- If B2B has better margins: Shift focus to B2B acquisition
- If B2C has better margins: Build self-service channels to scale B2C cost-efficiently
- If both segments are present and profitable: Maintain balance — it's a strength

---

### R8 — Category Concentration & Dependency

**What to look for**:
- **Income concentration**: Does income come from a single category? (Typically "sales" is the only income category.)
- **Outcome concentration**: Is outcome spread across categories or concentrated in one?
- **Category dependency**: If "suppliers" > 50% of outcome, the business is supply-chain dependent.
- **Category trends**: Is one category growing as a percentage of total outcome?

**Red flags**:
- ❌ A single outcome category > 60% of total expenses
- ❌ "Others" category is large (> 20%) — indicates poor categorization
- ⚠️ "Operational" + "Suppliers" together > 80% — very rigid cost structure
- ⚠️ "Administrative" growing faster than "Operational" — bureaucratic bloat

**Recommendations**:
- If suppliers dominate: Implement strategic sourcing, negotiate annual contracts, consider vertical integration
- If others is large: Review and reclassify transactions — "others" should be < 10% for good data hygiene
- If operational is high: Investigate process automation opportunities
- If administrative is growing: Set a hiring budget and strict approval for new headcount

---

### R9 — Growth vs Profitability Trade-off

**What to look for**:
- **Is growth profitable?**: Compare revenue growth rate vs profit growth rate.
- **Unit economics**: Are margins compressing as volume grows? (Indicates diseconomies of scale.)
- **Growth efficiency**: Calculate incremental profit per incremental dollar of revenue.
- **Stage assessment**: Is the business in growth stage (investing for market share) or maturity (maximizing profit)?

**Red flags**:
- ❌ Revenue up, profit down (value-destructive growth)
- ❌ Growth rate > 3× profit rate consistently
- ⚠️ High growth, low margin — typical "growth at all costs" trap
- ⚠️ No growth, stable margin — missed market opportunity

**Recommendations**:
- If growth isn't profitable: Pause expansion, fix unit economics first
- If profitable growth exists: Determine optimal reinvestment ratio (typically 30-50% of profit)
- If mature with stable margins: Focus on operational efficiency to expand margin
- If growth is expensive: Identify the marginal cost of new revenue and set a ceiling

---

### R10 — Forward-Looking & Strategic Recommendations

**What to look for**:
- **Trajectory projection**: Based on current trend lines, where will the business be in 3, 6, 12 months?
- **Seasonal patterns**: Are there recurring monthly patterns? (In synthetic data, patterns may be random.)
- **Risk inventory**: Compile all red flags from R1-R9 into a prioritized risk list.
- **No-regrets moves**: Actions that improve the business regardless of strategy (e.g., reducing administrative waste, improving cash management).

**Strategic questions to answer**:
1. Is this business investable? (Growing, profitable, efficient → yes)
2. What is the single biggest financial risk? (Address this first)
3. What is the most impactful financial lever? (Revenue growth, cost reduction, or margin improvement)
4. Is the business model viable long-term? (Based on trends, not a single period)

**Recommendations template**:

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| P0 | Critical fix (survival) | ⭐⭐⭐ | Varies |
| P1 | High-impact improvement | ⭐⭐⭐ | Medium |
| P2 | Strategic growth initiative | ⭐⭐ | High |
| P3 | Monitoring & governance | ⭐ | Low |

---

## Reference Files

- **scripts/financial_review.py** — Full analysis script that applies all 10 rules to a data set
- **scripts/quick_pulse.py** — Lightweight 5-metric check for rapid assessment
- **examples/** — Example outputs and use cases

## Always Include in a Financial Analysis

1. **Executive Summary** (3-5 bullets of key findings)
2. **Data Quality Note** (any issues with the data itself)
3. **Rule-by-Rule Analysis** (apply relevant rules)
4. **Risk Register** (prioritized red flags)
5. **Action Recommendations** (specific, ordered by impact)
6. **Forward View** (what to watch next period)