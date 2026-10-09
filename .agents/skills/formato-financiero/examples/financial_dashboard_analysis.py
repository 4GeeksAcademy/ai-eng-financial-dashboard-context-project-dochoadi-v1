#!/usr/bin/env python3
"""
formato-financiero — Applied Example
=====================================
Demonstrates the 10-rule decision framework on a live React+FastAPI
financial dashboard.  This script mirrors the `financial_review.py`
workflow, but is annotated so contributors can see *how* each rule
is computed and *why* each threshold was chosen.

Usage:
    python examples/financial_dashboard_analysis.py
"""

import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Import from the sibling scripts/ directory.
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from financial_review import (
    load_movements,
    compute_kpis,
    monthly_data,
    R1_profitability,
    R2_revenue_health,
    R3_cost_structure,
    R4_margin_trend,
    R5_cash_flow,
    R6_anomaly_detection,
    R7_segment_performance,
    R8_category_concentration,
    R9_growth_vs_profitability,
    R10_strategic_recommendations,
    API_URL,
)


def main():
    print("=" * 60)
    print("  formato-financiero — Applied Dashboard Analysis")
    print("  Project:  React + FastAPI Financial Dashboard")
    print("  Data:     /api/metrics  (360 mock movements)")
    print("  Rules:    10")
    print("=" * 60)

    # -- 1. Load data -------------------------------------------------------
    # The API returns ~360 movements across 12 months with income/outcome,
    # B2B/B2C, and 5 categories (sales, suppliers, operational, admin, others).
    movements = load_movements()
    print(f"\n  Loaded {len(movements)} movements from {API_URL}\n")

    # -- 2. Compute base aggregates ------------------------------------------
    # kpis:  total_income, total_outcome, profit, profitPercent, cost_ratio
    # monthly:  list of per-month dicts with income, outcome, profit, margin
    kpis = compute_kpis(movements)
    monthly = monthly_data(movements)

    # -- 3. Run the 10 rules ------------------------------------------------
    all_findings: list[str] = []

    # R1 — Profitability & Net Performance
    #   Why:  The single most important metric — is the business making money?
    #   Thresholds:  margin > 15% healthy; 5–15% warning; < 5% critical.
    r1 = R1_profitability(kpis, monthly)
    all_findings.extend(r1)
    print("  R1 ✓  Profitability")

    # R2 — Revenue Health & Growth
    #   Why:  Top-line tells you if the business is expanding or contracting.
    #   Threshold:  3 consecutive declining months → contraction alert.
    r2 = R2_revenue_health(kpis, monthly, movements)
    all_findings.extend(r2)
    print("  R2 ✓  Revenue Health")

    # R3 — Cost Structure & Efficiency
    #   Why:  Understand WHERE money goes (admin, suppliers, ops, others).
    #   Threshold:  admin > 15% of outcome → bloated overhead flag.
    r3 = R3_cost_structure(kpis, monthly, movements)
    all_findings.extend(r3)
    print("  R3 ✓  Cost Structure")

    # R4 — Margin Trend & Trajectory
    #   Why:  Margin volatility > 15 pp MoM signals instability.
    #   Threshold:  swing > 15 pp → warning; negative margin → critical.
    r4 = R4_margin_trend(monthly)
    all_findings.extend(r4)
    print("  R4 ✓  Margin Trend")

    # R5 — Cash Flow & Working Capital
    #   Why:  Even profitable businesses fail if they run out of cash.
    #   Threshold:  any negative month → warning; 3+ → critical.
    r5 = R5_cash_flow(monthly, kpis)
    all_findings.extend(r5)
    print("  R5 ✓  Cash Flow")

    # R6 — Anomaly & Outlier Detection
    #   Why:  Catch data errors, one-off events, or uncontrolled spikes.
    #   Threshold:  > 50 % MoM income/outcome change → flag.
    r6 = R6_anomaly_detection(monthly)
    all_findings.extend(r6)
    print("  R6 ✓  Anomaly Detection")

    # R7 — Segment Performance (B2B vs B2C)
    #   Why:  Different segments have different economics.
    #   Threshold:  B2B margin < 15 % → pricing pressure; B2C > 50 % → attractive.
    r7 = R7_segment_performance(movements)
    all_findings.extend(r7)
    print("  R7 ✓  Segment Performance")

    # R8 — Category Concentration & Dependency
    #   Why:  Over-reliance on one category is a business risk.
    #   Threshold:  single category > 70 % of income → dangerous dependency.
    r8 = R8_category_concentration(movements)
    all_findings.extend(r8)
    print("  R8 ✓  Category Concentration")

    # R9 — Growth vs Profitability Trade-off
    #   Why:  Growing unprofitably destroys value (the "Graham Rule").
    #   Threshold:  revenue up + margin flat/up → healthy; revenue up + margin down → check.
    r9 = R9_growth_vs_profitability(monthly)
    all_findings.extend(r9)
    print("  R9 ✓  Growth vs Profitability")

    # R10 — Strategic Recommendations (synthesis)
    #   Why:  Aggregate all findings into P0–P3 prioritised actions.
    recs = R10_strategic_recommendations(all_findings)
    print("  R10 ✓  Strategic Synthesis\n")

    # -- 4. Summary ---------------------------------------------------------
    criticals = [f for f in all_findings if f.startswith("❌")]
    warnings  = [f for f in all_findings if f.startswith("⚠️")]
    positives = [f for f in all_findings if f.startswith("✅")]

    print("=" * 60)
    print("  Summary")
    print("=" * 60)
    print(f"    ✅ Positives:    {len(positives)}")
    print(f"    ⚠️  Warnings:     {len(warnings)}")
    print(f"    ❌ Critical:     {len(criticals)}")
    print(f"    📊  Data points:  {len(movements)} movements across {len(monthly)} months")
    print(f"    💰  Net Result:   ${kpis['profit']:,.2f} ({kpis['profitPercent']:.1f}% margin)")
    print()
    print("  See also:")
    print("    scripts/quick_pulse.py  — 5-second health check")
    print("    SKILL.md               — full rule definitions")
    print("=" * 60)


if __name__ == "__main__":
    main()