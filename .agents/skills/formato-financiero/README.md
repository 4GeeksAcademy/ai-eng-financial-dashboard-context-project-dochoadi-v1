# formato-financiero

> A financial analysis skill that encodes 10+ years of financial analyst
> expertise into a structured, automated review pipeline for any financial
> dashboard that exposes movement-level data.

## Overview

**formato-financiero** is a **skill** — a portable bundle of rules,
scripts, and reference material designed to be installed alongside an
AI coding agent.  When activated, the skill guides the agent to:

1. **Analyse** financial data through 10 pre-defined lenses (profitability,
   revenue health, cost structure, margin trajectory, cash flow, anomalies,
   segment mix, category concentration, growth trade-offs, strategic outlook).
2. **Identify** red flags, warning signs, and positive signals using
   analyst-grade thresholds.
3. **Recommend** concrete, prioritised actions (P0–P3) based on the
   combined rule output.
4. **Produce** a structured Markdown report suitable for an executive
   summary or a board pack.

## Quick Start

```bash
# 1. Quick health check (5 seconds)
python scripts/quick_pulse.py

# 2. Full 10-rule review (~30 seconds)
python scripts/financial_review.py

# 3. Annotated example with commentary
python examples/financial_dashboard_analysis.py
```

## Requirements

- Python 3.10+
- A running API that serves a JSON array of financial movements at
  `/api/metrics` (or any endpoint you configure).

Each movement should have the shape:
```json
{
  "create_date": "2025-10-02",
  "amount": 10178.62,
  "operation_type": "income"|"outcome",
  "category": "sales"|"suppliers"|"operational"|"administrative"|"others",
  "business_type": "B2B"|"B2C"
}
```

## The 10 Rules

| Rule | Focus | Category |
|------|-------|----------|
| R1 | Profitability & Net Performance | Core Health |
| R2 | Revenue Health & Growth | Growth |
| R3 | Cost Structure & Efficiency | Efficiency |
| R4 | Margin Trend & Trajectory | Stability |
| R5 | Cash Flow & Working Capital | Liquidity |
| R6 | Anomaly & Outlier Detection | Risk |
| R7 | Segment Performance (B2B vs B2C) | Mix |
| R8 | Category Concentration & Dependency | Concentration |
| R9 | Growth vs Profitability Trade-off | Strategy |
| R10 | Forward-Looking & Strategic Recommendations | Synthesis |

See `SKILL.md` for the full definition of each rule (objective, analysis
method, red flags, formula, and recommendation).

## Project Structure

```
formato-financiero/
├── SKILL.md                     # Main skill definition (10 rules)
├── README.md                    # This file
├── LICENSE.txt                  # Apache 2.0
├── CONTRIBUTING.md              # How to add rules / fix thresholds
├── scripts/
│   ├── financial_review.py      # Full 10-rule analysis engine
│   └── quick_pulse.py           # 5-second health check
└── examples/
    ├── financial_dashboard_analysis.py  # Annotated applied example
    └── report-sample.md                 # Real output from the live API
```

## Interpreting the Output

Each rule section in the report uses consistent signal markers:

| Marker | Meaning |
|--------|---------|
| ✅ | Positive finding — healthy metric |
| ⚠️  | Warning — monitor closely |
| ❌ | Critical — requires immediate action |
| 📊 | Informational data point |

The **Executive Summary** at the end tallies all signals and gives
a one-line verdict.  The **Recommended Actions** section prioritises
remediation as P0 (survival), P1 (near-term), P2 (medium-term),
P3 (ongoing monitoring).

## License

Apache 2.0 — see `LICENSE.txt`.