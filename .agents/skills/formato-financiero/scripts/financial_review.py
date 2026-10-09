#!/usr/bin/env python3
"""
formato-financiero — Full Financial Review

Applies all 10 financial analysis rules to dashboard data.
Fetches from the running API by default, or accepts a JSON file.

Usage:
    python scripts/financial_review.py                          # Fetch from API
    python scripts/financial_review.py --input data.json        # From file
    python scripts/financial_review.py --help                   # Show usage
"""

import json
import math
import sys
import urllib.request
import urllib.error
from collections import defaultdict
from datetime import datetime
from typing import Any

API_URL = "http://localhost:8000/api/metrics"


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def fetch_movements(api_url: str = API_URL) -> list[dict[str, Any]]:
    """Fetch financial movements from the running API."""
    try:
        with urllib.request.urlopen(api_url, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"❌ Failed to fetch from API: {e}", file=sys.stderr)
        sys.exit(1)


def load_movements(filepath: str | None = None) -> list[dict[str, Any]]:
    """Load movements from API or file."""
    if filepath:
        with open(filepath) as f:
            return json.load(f)
    return fetch_movements()


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

def compute_kpis(movements: list[dict[str, Any]]) -> dict[str, float]:
    total_income = sum(m["amount"] for m in movements if m["operation_type"] == "income")
    total_outcome = sum(m["amount"] for m in movements if m["operation_type"] == "outcome")
    profit = total_income - total_outcome
    profit_pct = (profit / total_income * 100) if total_income > 0 else 0.0
    return {
        "totalIncome": round(total_income, 2),
        "totalOutcome": round(total_outcome, 2),
        "profit": round(profit, 2),
        "profitPercent": round(profit_pct, 2),
    }


def monthly_data(movements: list[dict[str, Any]]) -> list[dict[str, Any]]:
    monthly: dict[str, dict[str, float]] = {}
    for m in movements:
        dt = datetime.fromisoformat(m["create_date"])
        key = f"{dt.year}-{dt.month:02d}"
        if key not in monthly:
            monthly[key] = {"income": 0.0, "outcome": 0.0}
        if m["operation_type"] == "income":
            monthly[key]["income"] += m["amount"]
        else:
            monthly[key]["outcome"] += m["amount"]

    result = []
    for key in sorted(monthly):
        v = monthly[key]
        profit = v["income"] - v["outcome"]
        profit_pct = (profit / v["income"] * 100) if v["income"] > 0 else 0.0
        year, month = key.split("-")
        label = datetime(int(year), int(month), 1).strftime("%b %Y")
        result.append({
            "month": label,
            "monthKey": key,
            "income": round(v["income"], 2),
            "outcome": round(v["outcome"], 2),
            "profit": round(profit, 2),
            "profitPercent": round(profit_pct, 2),
        })
    return result


def categorize_movements(movements: list[dict[str, Any]]) -> dict[str, dict[str, float]]:
    cats: dict[str, dict[str, float]] = defaultdict(lambda: {"income": 0.0, "outcome": 0.0})
    for m in movements:
        cat = m["category"]
        if m["operation_type"] == "income":
            cats[cat]["income"] += m["amount"]
        else:
            cats[cat]["outcome"] += m["amount"]
    return dict(cats)


def segment_by_business_type(movements: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    segs: dict[str, list[dict[str, Any]]] = {"B2B": [], "B2C": []}
    for m in movements:
        bt = m.get("business_type", "B2C")
        segs[bt].append(m)
    return segs


# ---------------------------------------------------------------------------
# Rule implementations
# ---------------------------------------------------------------------------

def R1_profitability(kpis: dict[str, float], monthly: list[dict[str, Any]]) -> list[str]:
    """Profitability & Net Performance"""
    findings: list[str] = []
    margin = kpis["profitPercent"]
    profit = kpis["profit"]

    if profit < 0:
        findings.append(f"❌ CRITICAL: Net profit is NEGATIVE (${profit:,.2f}). The business is burning cash.")
    elif margin < 5:
        findings.append(f"❌ CRITICAL: Profit margin is {margin:.1f}% — below 5% threshold. High risk.")
    elif margin < 10:
        findings.append(f"⚠️ WARNING: Profit margin is {margin:.1f}% (below 10%). Margin is thin.")
    else:
        findings.append(f"✅ Profit margin is {margin:.1f}% — within healthy range.")

    # Check consecutive declining months
    declining = 0
    for i in range(1, len(monthly)):
        if monthly[i]["profitPercent"] < monthly[i - 1]["profitPercent"]:
            declining += 1
        else:
            declining = 0
    if declining >= 3:
        findings.append(f"❌ Profit margin has declined for {declining} consecutive months — structural deterioration.")
    elif declining >= 2:
        findings.append(f"⚠️ Profit margin declined for {declining} consecutive months. Monitor closely.")

    findings.append(f"  • Net Profit: ${profit:,.2f}  |  Margin: {margin:.1f}%")
    findings.append(f"  • Total Income: ${kpis['totalIncome']:,.2f}  |  Total Outcome: ${kpis['totalOutcome']:,.2f}")
    return findings


def R2_revenue_health(kpis: dict[str, float], monthly: list[dict[str, Any]], movements: list[dict[str, Any]]) -> list[str]:
    """Revenue Health & Growth"""
    findings: list[str] = []
    income_values = [m["income"] for m in monthly]
    total_income = kpis["totalIncome"]

    # Revenue trend
    if len(income_values) >= 3:
        recent = income_values[-3:]
        if all(recent[i] < recent[i - 1] for i in range(1, len(recent))):
            findings.append("❌ Revenue declining for 3+ consecutive months — contraction in progress.")
        elif sum(income_values[-3:]) / 3 < sum(income_values[:3]) / 3:
            findings.append("⚠️ Revenue trend is downward over the full period.")

    # Revenue concentration
    for m in monthly:
        if m["income"] > 0 and (m["income"] / total_income) > 0.40:
            findings.append(f"⚠️ Revenue concentration risk: {m['month']} represents {m['income'] / total_income * 100:.0f}% of total income.")

    # Business type split
    segs = segment_by_business_type(movements)
    for bt, seg in segs.items():
        if not seg:
            findings.append(f"❌ No movements from {bt} segment — missing revenue stream.")

    # Growth rate
    if len(income_values) >= 2:
        first_half = sum(income_values[:len(income_values)//2])
        second_half = sum(income_values[len(income_values)//2:])
        if first_half > 0:
            growth = ((second_half - first_half) / first_half) * 100
            if growth > 10:
                findings.append(f"✅ Revenue growing at {growth:.1f}% H1→H2 — positive momentum.")
            elif growth < -10:
                findings.append(f"❌ Revenue declined {growth:.1f}% H1→H2 — significant contraction.")
            else:
                findings.append(f"📊 Revenue relatively flat ({growth:.1f}% H1→H2).")

    findings.append(f"  • Total Revenue: ${total_income:,.2f}  |  Monthly avg: ${(total_income / len(monthly)):,.2f}")
    return findings


def R3_cost_structure(kpis: dict[str, float], monthly: list[dict[str, Any]], movements: list[dict[str, Any]]) -> list[str]:
    """Cost Structure & Efficiency"""
    findings: list[str] = []
    total_income = kpis["totalIncome"]
    total_outcome = kpis["totalOutcome"]

    cost_ratio = (total_outcome / total_income * 100) if total_income > 0 else 0

    if cost_ratio > 100:
        findings.append(f"❌ Cost-to-income ratio is {cost_ratio:.1f}% — operating at a loss.")
    elif cost_ratio > 85:
        findings.append(f"❌ Cost-to-income ratio is {cost_ratio:.1f}% — cost-heavy structure.")
    elif cost_ratio > 70:
        findings.append(f"⚠️ Cost-to-income ratio is {cost_ratio:.1f}% — moderate efficiency.")
    else:
        findings.append(f"✅ Cost-to-income ratio is {cost_ratio:.1f}% — efficient structure.")

    # Category analysis
    cats = categorize_movements(movements)
    outcome_total = sum(v["outcome"] for v in cats.values()) or 1
    for cat, amounts in sorted(cats.items(), key=lambda x: x[1]["outcome"], reverse=True):
        pct = (amounts["outcome"] / outcome_total) * 100
        if cat == "administrative" and pct > 15:
            findings.append(f"❌ Administrative costs are {pct:.1f}% of outcome (>15% — overhead is bloated).")
        elif amounts["outcome"] > 0:
            findings.append(f"  • {cat}: ${amounts['outcome']:,.2f} ({pct:.1f}% of outcome)")

    # Volatility check
    outcome_values = [m["outcome"] for m in monthly]
    if outcome_values:
        avg_outcome = sum(outcome_values) / len(outcome_values)
        max_outcome = max(outcome_values)
        if avg_outcome > 0 and max_outcome / avg_outcome > 1.5:
            findings.append(f"⚠️ High outcome volatility: max month ${max_outcome:,.2f} vs avg ${avg_outcome:,.2f}.")

    findings.append(f"  • Cost-to-Income Ratio: {cost_ratio:.1f}%  |  Total Outcome: ${total_outcome:,.2f}")
    return findings


def R4_margin_trend(monthly: list[dict[str, Any]]) -> list[str]:
    """Margin Trend & Trajectory"""
    findings: list[str] = []
    margins = [m["profitPercent"] for m in monthly]

    if len(margins) < 2:
        findings.append("⚠️ Insufficient data for trend analysis.")
        return findings

    # Trend direction
    increasing = sum(1 for i in range(1, len(margins)) if margins[i] > margins[i - 1])
    decreasing = sum(1 for i in range(1, len(margins)) if margins[i] < margins[i - 1])

    if decreasing >= 3 and decreasing > increasing:
        findings.append("❌ Margin is in a net declining trend — profitability is eroding.")
    elif increasing >= 3 and increasing > decreasing:
        findings.append("✅ Margin is in a net improving trend — positive trajectory.")
    else:
        findings.append("📊 Margin is relatively stable — no strong directional trend.")

    # Inflection points
    for i in range(1, len(margins)):
        change = abs(margins[i] - margins[i - 1])
        if change > 10:
            direction = "increased" if margins[i] > margins[i - 1] else "decreased"
            findings.append(f"⚠️ Significant margin change in {monthly[i]['month']}: {direction} by {change:.1f} pp")

    # Negative margin months
    neg_months = [m["month"] for m in monthly if m["profitPercent"] < 0]
    if neg_months:
        findings.append(f"❌ Negative margin months: {', '.join(neg_months)}")

    findings.append(f"  • Margin range: {min(margins):.1f}% to {max(margins):.1f}%  |  Avg: {sum(margins)/len(margins):.1f}%")
    return findings


def R5_cash_flow(monthly: list[dict[str, Any]], kpis: dict[str, float]) -> list[str]:
    """Cash Flow & Working Capital"""
    findings: list[str] = []
    profits = [m["profit"] for m in monthly]

    neg_months = [(m["month"], m["profit"]) for m in monthly if m["profit"] < 0]
    if neg_months:
        months_str = ", ".join(f"{m} (${p:,.2f})" for m, p in neg_months)
        findings.append(f"❌ Negative cash flow months: {months_str}")

    cumulative = kpis["profit"]
    if cumulative < 0:
        findings.append(f"❌ Cumulative profit is NEGATIVE (${cumulative:,.2f}) — unsustainable.")
    else:
        findings.append(f"✅ Cumulative profit is POSITIVE (${cumulative:,.2f}) — cash generating.")

    # Seasonality: first 6 months vs last 6 months
    if len(profits) >= 6:
        first_half = sum(profits[:len(profits)//2])
        second_half = sum(profits[len(profits)//2:])
        if first_half > 0 and second_half / first_half > 1.2:
            findings.append("✅ Cash generation improved in later months — positive momentum.")
        elif first_half > 0 and second_half / first_half < 0.8:
            findings.append("⚠️ Cash generation declining in later months — front-loaded.")
        elif first_half < 0 and second_half > 0:
            findings.append("✅ Cash flow turned positive in later months — recovery trajectory.")

    findings.append(f"  • Best month: ${max(profits):,.2f}  |  Worst month: ${min(profits):,.2f}")
    return findings


def R6_anomaly_detection(monthly: list[dict[str, Any]]) -> list[str]:
    """Anomaly & Outlier Detection"""
    findings: list[str] = []

    incomes = [m["income"] for m in monthly]
    outcomes = [m["outcome"] for m in monthly]
    margins = [m["profitPercent"] for m in monthly]

    # Income spikes
    for i in range(1, len(incomes)):
        if incomes[i - 1] > 0:
            change = ((incomes[i] - incomes[i - 1]) / incomes[i - 1]) * 100
            if change > 100:
                findings.append(f"❌ Income spike >100% MoM in {monthly[i]['month']} ({change:.0f}%) — investigate.")
            elif change > 50:
                findings.append(f"⚠️ Significant income increase in {monthly[i]['month']} ({change:.0f}% MoM).")

    # Outcome spikes
    for i in range(1, len(outcomes)):
        if outcomes[i - 1] > 0:
            change = ((outcomes[i] - outcomes[i - 1]) / outcomes[i - 1]) * 100
            if change > 50:
                findings.append(f"❌ Outcome spike >50% MoM in {monthly[i]['month']} ({change:.0f}%) — investigate costs.")
            elif change > 30:
                findings.append(f"⚠️ Significant outcome increase in {monthly[i]['month']} ({change:.0f}% MoM).")

    # Zero-data check
    for m in monthly:
        if m["income"] == 0 and m["outcome"] == 0:
            findings.append(f"❓ {m['month']}: No income AND no outcome — data gap.")
        elif m["income"] == 0:
            findings.append(f"⚠️ {m['month']}: Zero income recorded — investigate.")
        elif m["outcome"] == 0:
            findings.append(f"⚠️ {m['month']}: Zero outcome recorded — data integrity check needed.")

    # Margin outliers (simple: check if >2x std from mean)
    if len(margins) >= 3:
        mean = sum(margins) / len(margins)
        variance = sum((m - mean) ** 2 for m in margins) / len(margins)
        std = math.sqrt(variance)
        for i, m in enumerate(monthly):
            if std > 0 and abs(margins[i] - mean) > 2 * std:
                findings.append(f"❓ Margin outlier in {m['month']}: {margins[i]:.1f}% (>2σ from mean {mean:.1f}%)")

    return findings or ["✅ No significant anomalies detected."]


def R7_segment_performance(movements: list[dict[str, Any]]) -> list[str]:
    """Segment Performance (B2B vs B2C)"""
    findings: list[str] = []
    segs = segment_by_business_type(movements)

    for bt, seg in segs.items():
        if not seg:
            findings.append(f"❌ {bt} segment has ZERO movements — strategic gap.")
            continue
        kpis = compute_kpis(seg)
        findings.append(f"  • {bt}: ${kpis['totalIncome']:,.2f} income, ${kpis['totalOutcome']:,.2f} outcome, margin {kpis['profitPercent']:.1f}%")

    total = len(movements)
    if total > 0:
        b2b_pct = len(segs["B2B"]) / total * 100
        b2c_pct = len(segs["B2C"]) / total * 100
        if b2b_pct > 80 or b2c_pct > 80:
            dominant = "B2B" if b2b_pct > 80 else "B2C"
            findings.append(f"❌ Extreme segment concentration: {dominant} represents {max(b2b_pct, b2c_pct):.0f}% of movements.")
        findings.append(f"  • Segment split: B2B {b2b_pct:.0f}% / B2C {b2c_pct:.0f}%")

    return findings


def R8_category_concentration(movements: list[dict[str, Any]]) -> list[str]:
    """Category Concentration & Dependency"""
    findings: list[str] = []
    cats = categorize_movements(movements)

    outcome_total = sum(v["outcome"] for v in cats.values()) or 1
    income_total = sum(v["income"] for v in cats.values()) or 1

    # Income concentration
    for cat, amounts in sorted(cats.items(), key=lambda x: x[1]["income"], reverse=True):
        if amounts["income"] > 0:
            pct = (amounts["income"] / income_total) * 100
            findings.append(f"  • Income — {cat}: ${amounts['income']:,.2f} ({pct:.1f}%)")

    # Outcome concentration
    for cat, amounts in sorted(cats.items(), key=lambda x: x[1]["outcome"], reverse=True):
        if amounts["outcome"] > 0:
            pct = (amounts["outcome"] / outcome_total) * 100
            if pct > 60:
                findings.append(f"❌ {cat} represents {pct:.1f}% of outcome (>60% — extreme dependency).")
            elif pct > 40:
                findings.append(f"⚠️ {cat} represents {pct:.1f}% of outcome (>40% — high concentration).")

    # "Others" check
    others_outcome = cats.get("others", {}).get("outcome", 0)
    others_pct = (others_outcome / outcome_total) * 100 if outcome_total > 0 else 0
    if others_pct > 20:
        findings.append(f"❌ 'Others' category is {others_pct:.1f}% of outcome — poor data categorization.")

    return findings


def R9_growth_vs_profitability(monthly: list[dict[str, Any]]) -> list[str]:
    """Growth vs Profitability Trade-off"""
    findings: list[str] = []

    if len(monthly) < 2:
        findings.append("⚠️ Insufficient data for growth vs profitability analysis.")
        return findings

    incomes = [m["income"] for m in monthly]
    profits = [m["profit"] for m in monthly]
    margins = [m["profitPercent"] for m in monthly]

    total_income_growth = ((incomes[-1] - incomes[0]) / incomes[0] * 100) if incomes[0] > 0 else 0
    total_profit_growth = ((profits[-1] - profits[0]) / profits[0] * 100) if profits[0] > 0 else 0 if profits[0] == 0 else None

    if total_profit_growth is not None and total_income_growth > 10 and total_profit_growth < 0:
        findings.append(f"❌ Revenue up {total_income_growth:.0f}% but profit DOWN — value-destructive growth.")
    elif total_profit_growth is not None and total_income_growth > 0 and total_profit_growth / total_income_growth < 0.3:
        findings.append(f"⚠️ Profit growth ({total_profit_growth:.0f}%) significantly lags revenue growth ({total_income_growth:.0f}%).")
    elif total_profit_growth is not None and total_profit_growth > total_income_growth:
        findings.append(f"✅ Profit growing faster than revenue — operating leverage improving.")

    # Margin trend vs revenue
    if len(margins) >= 4:
        first_avg = sum(margins[:2]) / 2
        last_avg = sum(margins[-2:]) / 2
        if last_avg < first_avg * 0.8:
            findings.append(f"⚠️ Margin compressing ({first_avg:.1f}% → {last_avg:.1f}%) as revenue scales — possible diseconomies of scale.")

    return findings


def R10_strategic_recommendations(findings_summary: list[str]) -> list[str]:
    """Forward-Looking & Strategic Recommendations"""
    recs: list[str] = []
    criticals = [f for f in findings_summary if f.startswith("❌")]
    warnings = [f for f in findings_summary if f.startswith("⚠️")]

    if criticals:
        recs.append(f"\n🎯 **Critical Issues ({len(criticals)}) — Address Immediately:**")
        for i, c in enumerate(criticals[:5], 1):
            recs.append(f"  {i}. {c.replace('❌ ', '').replace('CRITICAL: ', '')}")
        recs.append("")

    if warnings:
        recs.append(f"\n⚡ **Warnings ({len(warnings)}) — Monitor Closely:**")
        for i, w in enumerate(warnings[:5], 1):
            recs.append(f"  {i}. {w.replace('⚠️ ', '')}")
        recs.append("")

    # Strategic recommendations based on what we found
    recs.append("\n📋 **Recommended Actions (Prioritized):**")

    has_critical = any("negative" in f.lower() or "loss" in f.lower() or "burning" in f.lower() for f in criticals)
    has_margin_issue = any("margin" in f.lower() for f in criticals + warnings)
    has_growth_issue = any("revenue" in f.lower() and ("declin" in f.lower() or "contraction" in f.lower()) for f in criticals + warnings)

    if has_critical:
        recs.append("  P0 — Survival: Stop cash burn immediately. Review all discretionary spending.")
    if has_margin_issue:
        recs.append("  P1 — Cost restructuring: Reduce overhead, renegotiate suppliers, optimize pricing.")
    if has_growth_issue:
        recs.append("  P1 — Revenue recovery: Investigate root cause of decline, launch growth initiatives.")
    recs.append("  P2 — Diversification: Reduce category/segment concentration risk.")
    recs.append("  P3 — Monitoring: Implement monthly financial reviews with trend tracking.")

    return recs


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Full Financial Review — applies all 10 rules")
    parser.add_argument("--input", "-i", help="JSON file with movements array (fetches from API if omitted)")
    parser.add_argument("--api", default=API_URL, help=f"API URL (default: {API_URL})")
    args = parser.parse_args()

    if args.api != API_URL:
        movements = fetch_movements(args.api)
    else:
        movements = load_movements(args.input)

    print(f"📊 Financial Movement Records Loaded: {len(movements)}")
    print(f"=" * 65)

    # Compute base data
    kpis = compute_kpis(movements)
    monthly = monthly_data(movements)

    # Run all rules
    all_findings: list[str] = []

    sections = [
        ("R1 — Profitability & Net Performance", R1_profitability(kpis, monthly)),
        ("R2 — Revenue Health & Growth", R2_revenue_health(kpis, monthly, movements)),
        ("R3 — Cost Structure & Efficiency", R3_cost_structure(kpis, monthly, movements)),
        ("R4 — Margin Trend & Trajectory", R4_margin_trend(monthly)),
        ("R5 — Cash Flow & Working Capital", R5_cash_flow(monthly, kpis)),
        ("R6 — Anomaly & Outlier Detection", R6_anomaly_detection(monthly)),
        ("R7 — Segment Performance (B2B vs B2C)", R7_segment_performance(movements)),
        ("R8 — Category Concentration & Dependency", R8_category_concentration(movements)),
        ("R9 — Growth vs Profitability Trade-off", R9_growth_vs_profitability(monthly)),
    ]

    for title, findings in sections:
        print(f"\n{'─' * 65}")
        print(f"  {title}")
        print(f"{'─' * 65}")
        for f in findings:
            print(f"  {f}")
        all_findings.extend(findings)

    # R10 — Strategic recommendations
    print(f"\n{'═' * 65}")
    print(f"  R10 — Forward-Looking & Strategic Recommendations")
    print(f"{'═' * 65}")
    recs = R10_strategic_recommendations(all_findings)
    for r in recs:
        print(r)

    print(f"\n{'═' * 65}")
    print(f"  Executive Summary")
    print(f"{'═' * 65}")

    criticals = [f for f in all_findings if f.startswith("❌")]
    warnings = [f for f in all_findings if f.startswith("⚠️")]
    positives = [f for f in all_findings if f.startswith("✅")]

    print(f"  ✅ Positives:    {len(positives)}")
    print(f"  ⚠️ Warnings:     {len(warnings)}")
    print(f"  ❌ Critical:     {len(criticals)}")
    print(f"  📊 Data points:  {len(movements)} movements across {len(monthly)} months")
    print(f"  💰 Net Result:   ${kpis['profit']:,.2f} ({kpis['profitPercent']:.1f}% margin)")
    print(f"{'═' * 65}")


if __name__ == "__main__":
    main()