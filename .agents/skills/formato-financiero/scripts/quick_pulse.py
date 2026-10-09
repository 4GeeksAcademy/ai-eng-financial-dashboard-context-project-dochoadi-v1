#!/usr/bin/env python3
"""
formato-financiero — Quick Pulse Check

Fast 5-metric health check for financial dashboards.
Use when you need a rapid assessment without the full 10-rule review.

Usage:
    python scripts/quick_pulse.py
    python scripts/quick_pulse.py --input data.json
"""

import json
import urllib.request

API_URL = "http://localhost:8000/api/metrics"


def fetch():
    try:
        with urllib.request.urlopen(API_URL, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"❌ Error: {e}")
        return []


def analyze(movements):
    total_income = sum(m["amount"] for m in movements if m["operation_type"] == "income")
    total_outcome = sum(m["amount"] for m in movements if m["operation_type"] == "outcome")
    profit = total_income - total_outcome
    margin = (profit / total_income * 100) if total_income > 0 else 0
    cost_ratio = (total_outcome / total_income * 100) if total_income > 0 else 0

    print(f"\n{'=' * 50}")
    print(f"  ⚡ QUICK PULSE — Financial Health Check")
    print(f"{'=' * 50}")
    print(f"  Movements analyzed: {len(movements)}")
    print(f"  Revenue:      ${total_income:>10,.2f}")
    print(f"  Expenses:     ${total_outcome:>10,.2f}")
    print(f"  Net Profit:   ${profit:>10,.2f}")
    print(f"  Profit Margin:  {margin:>8.1f}%")
    print(f"  Cost/Income:    {cost_ratio:>8.1f}%")
    print(f"{'=' * 50}")

    flags = []
    if profit < 0:
        flags.append("❌ CRITICAL: Operating at a LOSS")
    elif margin < 10:
        flags.append("⚠️ Margin below 10%")
    if cost_ratio > 85:
        flags.append("❌ Cost structure heavy (>85%)")
    if cost_ratio > 70:
        flags.append("⚠️ Elevated cost ratio (>70%)")

    print(f"\n  Verdict:")
    if not flags:
        print(f"  ✅ All clear — healthy financial position")
    else:
        for f in flags:
            print(f"  {f}")
    print()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] in ("-i", "--input"):
        with open(sys.argv[2]) as f:
            data = json.load(f)
    else:
        data = fetch()
    analyze(data)