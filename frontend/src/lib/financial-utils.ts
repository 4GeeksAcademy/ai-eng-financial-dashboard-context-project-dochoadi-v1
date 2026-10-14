import {
  type AnomalyAlert,
  type FinancialMovement,
  type IncomeBreakdown,
  type KPIMetrics,
  type MetricsSummaryItem,
  type MonthlyDataPoint,
  type TopCategoryItem,
} from "./financial-types";

const MOVING_AVERAGE_PERIODS = 3;

function toYearMonthKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthYearLabel(yearMonthKey: string): string {
  const [yearText, monthText] = yearMonthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function computeKPIs(movements: FinancialMovement[]): KPIMetrics {
  const totalIncome = movements
    .filter((m) => m.operation_type === "income")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalOutcome = movements
    .filter((m) => m.operation_type === "outcome")
    .reduce((sum, m) => sum + m.amount, 0);

  const profit = totalIncome - totalOutcome;
  const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  return { totalIncome, totalOutcome, profit, profitPercent };
}

export function computeMonthlyData(
  movements: FinancialMovement[],
): MonthlyDataPoint[] {
  const monthlyMap: Record<string, { income: number; outcome: number }> = {};

  for (const m of movements) {
    const yearMonthKey = toYearMonthKey(new Date(m.create_date));
    if (!monthlyMap[yearMonthKey]) {
      monthlyMap[yearMonthKey] = { income: 0, outcome: 0 };
    }

    if (m.operation_type === "income") {
      monthlyMap[yearMonthKey].income += m.amount;
    } else {
      monthlyMap[yearMonthKey].outcome += m.amount;
    }
  }

  return Object.keys(monthlyMap)
    .sort()
    .map((yearMonthKey) => {
      const { income, outcome } = monthlyMap[yearMonthKey];
      const profit = income - outcome;
      const profitPercent = income > 0 ? (profit / income) * 100 : 0;
      return {
        month: formatMonthYearLabel(yearMonthKey),
        income,
        outcome,
        profitPercent,
      };
    });
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// The group total is the sum of ALL entries, so call categories/top with a
// limit that covers every category (limit=20 > 5 categories).
export function computeIncomeBreakdown(
  entries: readonly TopCategoryItem[],
  topCount = 5,
): IncomeBreakdown {
  const groupTotal = roundTo(
    entries.reduce((sum, entry) => sum + entry.total_amount, 0),
    2,
  );

  const topRows = entries.slice(0, topCount).map((entry) => ({
    category: entry.category,
    totalAmount: entry.total_amount,
    percentageOfGroup:
      groupTotal > 0 ? (entry.total_amount / groupTotal) * 100 : 0,
  }));

  return { groupTotal, topRows };
}

// Moving average of exactly the 3 previous periods present in the summary.
// The first 3 periods are never evaluated; a zero baseline never alerts.
export function computeAnomalyAlerts(
  summary: readonly MetricsSummaryItem[],
  threshold: number,
): AnomalyAlert[] {
  const ordered = [...summary].sort((a, b) => a.period.localeCompare(b.period));
  const alerts: AnomalyAlert[] = [];

  for (let index = MOVING_AVERAGE_PERIODS; index < ordered.length; index++) {
    const previous = ordered.slice(index - MOVING_AVERAGE_PERIODS, index);
    const baseline =
      previous.reduce((sum, item) => sum + item.outcome, 0) /
      MOVING_AVERAGE_PERIODS;
    if (baseline <= 0) {
      continue;
    }

    const current = ordered[index];
    const increaseRatio = (current.outcome - baseline) / baseline;
    if (increaseRatio > threshold) {
      alerts.push({
        period: current.period,
        outcomeTotal: current.outcome,
        baselineAverage: roundTo(baseline, 2),
        increaseRatio: roundTo(increaseRatio, 4),
      });
    }
  }

  return alerts;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
