import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatPercent,
  findSignificantMarginChanges,
  computeCategoryBreakdown,
  computeSegmentMetrics,
  computeTrend,
  detectAnomalies,
  computeGrowthComparison,
  getMarginTrendDirection,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";

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
      costToIncomeRatio: (250 / 1500) * 100,
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
      profit: 800,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profit: 300,
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

describe("findSignificantMarginChanges", () => {
  it("returns months where profitPercent changes by >= 10pp", () => {
    const data = [
      { month: "Jan 2024", income: 1000, outcome: 500, profit: 500, profitPercent: 50 },
      { month: "Feb 2024", income: 1000, outcome: 300, profit: 700, profitPercent: 70 },
      { month: "Mar 2024", income: 1000, outcome: 600, profit: 400, profitPercent: 40 },
      { month: "Apr 2024", income: 1000, outcome: 590, profit: 410, profitPercent: 41 },
    ];
    const changes = findSignificantMarginChanges(data, 10);
    expect(changes).toHaveLength(2);
    expect(changes[0]).toEqual({ month: "Feb 2024", change: 20 });
    expect(changes[1]).toEqual({ month: "Mar 2024", change: -30 });
  });

  it("returns empty array when no changes exceed threshold", () => {
    const data = [
      { month: "Jan 2024", income: 1000, outcome: 500, profit: 500, profitPercent: 50 },
      { month: "Feb 2024", income: 1000, outcome: 480, profit: 520, profitPercent: 52 },
    ];
    expect(findSignificantMarginChanges(data, 10)).toEqual([]);
  });

  it("returns empty for single month data", () => {
    expect(findSignificantMarginChanges([], 10)).toEqual([]);
  });
});

describe("computeCategoryBreakdown", () => {
  it("returns sorted income breakdown by category", () => {
    const breakdown = computeCategoryBreakdown(sampleMovements, "income");
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].category).toBe("sales");
    expect(breakdown[0].percentage).toBe(100);
  });

  it("returns sorted outcome breakdown", () => {
    const breakdown = computeCategoryBreakdown(sampleMovements, "outcome");
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].category).toBe("suppliers");
    expect(breakdown[0].total).toBe(250);
  });
});

describe("computeSegmentMetrics", () => {
  it("returns metrics per business type", () => {
    const segments = computeSegmentMetrics(sampleMovements);
    expect(segments).toHaveLength(2);
    const b2b = segments.find((s) => s.businessType === "B2B")!;
    const b2c = segments.find((s) => s.businessType === "B2C")!;
    expect(b2b.totalIncome).toBe(1000);
    expect(b2c.totalIncome).toBe(500);
    expect(b2b.count).toBe(2);
    expect(b2c.count).toBe(1);
  });
});

describe("computeTrend", () => {
  it("returns up when metric grows > 5%", () => {
    const data = [
      { month: "Jan", income: 100, outcome: 50, profit: 50, profitPercent: 50 },
      { month: "Feb", income: 200, outcome: 80, profit: 120, profitPercent: 60 },
    ];
    expect(computeTrend(data, "income").direction).toBe("up");
  });

  it("returns stable when change is within 5%", () => {
    const data = [
      { month: "Jan", income: 100, outcome: 50, profit: 50, profitPercent: 50 },
      { month: "Feb", income: 102, outcome: 50, profit: 52, profitPercent: 51 },
    ];
    expect(computeTrend(data, "income").direction).toBe("stable");
  });
});

describe("detectAnomalies", () => {
  it("detects zero income months", () => {
    const data = [
      { month: "Jan 2024", income: 100, outcome: 50, profit: 50, profitPercent: 50 },
      { month: "Feb 2024", income: 0, outcome: 50, profit: -50, profitPercent: 0 },
    ];
    const alerts = detectAnomalies(data, []);
    expect(alerts.some((a) => a.type === "zero_data")).toBe(true);
  });

  it("returns no alerts for normal data", () => {
    const data = [
      { month: "Jan 2024", income: 100, outcome: 40, profit: 60, profitPercent: 60 },
      { month: "Feb 2024", income: 110, outcome: 44, profit: 66, profitPercent: 60 },
    ];
    expect(detectAnomalies(data, [])).toHaveLength(0);
  });
});

describe("getMarginTrendDirection", () => {
  it("returns stable when margin changes < 3pp", () => {
    const data = [
      { month: "Jan", income: 100, outcome: 50, profit: 50, profitPercent: 50 },
      { month: "Feb", income: 100, outcome: 48, profit: 52, profitPercent: 52 },
    ];
    expect(getMarginTrendDirection(data).direction).toBe("stable");
  });
});

describe("computeGrowthComparison", () => {
  it("returns growth rates between first and second half", () => {
    const data = [
      { month: "Jan", income: 100, outcome: 50, profit: 50, profitPercent: 50 },
      { month: "Feb", income: 200, outcome: 80, profit: 120, profitPercent: 60 },
      { month: "Mar", income: 300, outcome: 100, profit: 200, profitPercent: 67 },
      { month: "Apr", income: 400, outcome: 150, profit: 250, profitPercent: 63 },
    ];
    const growth = computeGrowthComparison(data);
    expect(growth).not.toBeNull();
    expect(growth!.incomeGrowth).toBeCloseTo(133.3, 0);
  });

  it("returns null for single entry", () => {
    expect(computeGrowthComparison([])).toBeNull();
  });
});
