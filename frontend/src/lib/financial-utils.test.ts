import { describe, expect, it } from "vitest";

import {
  computeAnomalyAlerts,
  computeIncomeBreakdown,
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatPercent,
} from "./financial-utils";
import type {
  FinancialMovement,
  MetricsSummaryItem,
  TopCategoryItem,
} from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
});

describe("computeMonthlyData", () => {
  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});

describe("computeIncomeBreakdown", () => {
  it("computes group total and share from the real B2B response", () => {
    const b2b: TopCategoryItem[] = [
      { category: "sales", operation_type: "income", total_amount: 557903.97 },
      { category: "others", operation_type: "income", total_amount: 57636.75 },
    ];
    const breakdown = computeIncomeBreakdown(b2b);

    expect(breakdown.groupTotal).toBe(615540.72);
    expect(breakdown.topRows.map((row) => row.category)).toEqual([
      "sales",
      "others",
    ]);
    expect(breakdown.topRows[0].totalAmount).toBe(557903.97);
    expect(breakdown.topRows[0].percentageOfGroup).toBeCloseTo(90.6364, 4);
    expect(breakdown.topRows[1].percentageOfGroup).toBeCloseTo(9.3636, 4);
  });

  it("keeps all entries in the total but shows only the top 5", () => {
    const amounts = [600, 500, 400, 300, 150, 50];
    const categories = [
      "sales",
      "others",
      "suppliers",
      "operational",
      "administrative",
      "others",
    ] as const;
    const entries: TopCategoryItem[] = amounts.map((total_amount, index) => ({
      category: categories[index],
      operation_type: "income",
      total_amount,
    }));
    const breakdown = computeIncomeBreakdown(entries);

    expect(breakdown.groupTotal).toBe(2000);
    expect(breakdown.topRows).toHaveLength(5);
    expect(breakdown.topRows.map((row) => row.percentageOfGroup)).toEqual([
      30, 25, 20, 15, 7.5,
    ]);
  });

  it("returns a zero total and no rows for an empty response", () => {
    expect(computeIncomeBreakdown([])).toEqual({ groupTotal: 0, topRows: [] });
  });

  it("returns 0% instead of NaN when the group total is zero", () => {
    const breakdown = computeIncomeBreakdown([
      { category: "sales", operation_type: "income", total_amount: 0 },
    ]);

    expect(breakdown.groupTotal).toBe(0);
    expect(breakdown.topRows[0].percentageOfGroup).toBe(0);
  });
});

function summaryOf(outcomes: number[]): MetricsSummaryItem[] {
  return outcomes.map((outcome, index) => ({
    period: `2025-${String(index + 1).padStart(2, "0")}`,
    income: 0,
    outcome,
    net: -outcome,
  }));
}

describe("computeAnomalyAlerts", () => {
  it("never evaluates the first 3 periods", () => {
    expect(computeAnomalyAlerts(summaryOf([100, 1000, 5000]), 0.3)).toEqual(
      [],
    );
  });

  it("uses only the 3 previous periods, not the whole history", () => {
    // Expanding average for 2025-05 would be (1000+100+100+100)/4 = 325
    // and no alert; the 3-period average is 100, so 200 is a +100% alert.
    const alerts = computeAnomalyAlerts(
      summaryOf([1000, 100, 100, 100, 200]),
      0.3,
    );

    expect(alerts).toEqual([
      {
        period: "2025-05",
        outcomeTotal: 200,
        baselineAverage: 100,
        increaseRatio: 1,
      },
    ]);
  });

  it("rounds the baseline to 2 decimals and the ratio to 4", () => {
    const alerts = computeAnomalyAlerts(summaryOf([100, 100, 101, 150]), 0.3);

    expect(alerts[0].baselineAverage).toBe(100.33);
    expect(alerts[0].increaseRatio).toBe(0.495);
  });

  it("does not alert when the ratio equals the threshold", () => {
    expect(computeAnomalyAlerts(summaryOf([100, 100, 100, 130]), 0.3)).toEqual(
      [],
    );
    expect(computeAnomalyAlerts(summaryOf([100, 100, 100, 131]), 0.3)).toHaveLength(
      1,
    );
  });

  it("does not alert when the baseline is zero", () => {
    expect(computeAnomalyAlerts(summaryOf([0, 0, 0, 500]), 0.3)).toEqual([]);
  });

  it("orders periods before averaging and skips months without data", () => {
    const summary: MetricsSummaryItem[] = [
      { period: "2026-02", income: 0, outcome: 400, net: -400 },
      { period: "2025-11", income: 0, outcome: 100, net: -100 },
      { period: "2025-12", income: 0, outcome: 100, net: -100 },
      { period: "2025-09", income: 0, outcome: 100, net: -100 },
    ];

    expect(computeAnomalyAlerts(summary, 0.3)).toEqual([
      {
        period: "2026-02",
        outcomeTotal: 400,
        baselineAverage: 100,
        increaseRatio: 3,
      },
    ]);
  });
});
