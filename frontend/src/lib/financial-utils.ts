import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
  type Category,
  type CategoryBreakdown,
  type SegmentMetrics,
  type TrendInfo,
  type AnomalyAlert,
  type GrowthComparison,
} from "./financial-types";

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
  const { totalIncome, totalOutcome } = movements.reduce(
    (acc, m) => {
      if (m.operation_type === "income") {
        acc.totalIncome += m.amount;
      } else {
        acc.totalOutcome += m.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalOutcome: 0 },
  );

  const profit = totalIncome - totalOutcome;
  const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
  const costToIncomeRatio = totalIncome > 0 ? (totalOutcome / totalIncome) * 100 : 0;

  return { totalIncome, totalOutcome, profit, profitPercent, costToIncomeRatio };
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
        profit,
        profitPercent,
      };
    });
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export interface MarginChangePoint {
  month: string
  change: number
}

export function findSignificantMarginChanges(
  data: MonthlyDataPoint[],
  thresholdPp: number = 10,
): MarginChangePoint[] {
  const result: MarginChangePoint[] = []
  for (let i = 1; i < data.length; i++) {
    const change = data[i].profitPercent - data[i - 1].profitPercent
    if (Math.abs(change) >= thresholdPp) {
      result.push({ month: data[i].month, change })
    }
  }
  return result
}

// ─── Category breakdown ──────────────────────────────────────────

export function computeCategoryBreakdown(
  movements: FinancialMovement[],
  operationType: 'income' | 'outcome',
): CategoryBreakdown[] {
  const filtered = movements.filter((m) => m.operation_type === operationType)
  const total = filtered.reduce((sum, m) => sum + m.amount, 0)
  const byCategory = filtered.reduce(
    (acc, m) => {
      acc[m.category] = (acc[m.category] ?? 0) + m.amount
      return acc
    },
    {} as Record<Category, number>,
  )
  return (Object.keys(byCategory) as Category[])
    .map((category) => ({
      category,
      operationType,
      total: byCategory[category],
      percentage: total > 0 ? (byCategory[category] / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

// ─── Segment (B2B / B2C) metrics ─────────────────────────────────

export function computeSegmentMetrics(
  movements: FinancialMovement[],
): SegmentMetrics[] {
  const bySegment = movements.reduce(
    (acc, m) => {
      if (!acc[m.business_type]) {
        acc[m.business_type] = { totalIncome: 0, totalOutcome: 0, count: 0 }
      }
      acc[m.business_type].count++
      if (m.operation_type === 'income') {
        acc[m.business_type].totalIncome += m.amount
      } else {
        acc[m.business_type].totalOutcome += m.amount
      }
      return acc
    },
    {} as Record<string, { totalIncome: number; totalOutcome: number; count: number }>,
  )
  return (Object.keys(bySegment) as ('B2B' | 'B2C')[])
    .map((businessType) => {
      const { totalIncome, totalOutcome, count } = bySegment[businessType]
      const profit = totalIncome - totalOutcome
      const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0
      return { businessType, count, totalIncome, totalOutcome, profit, profitPercent }
    })
    .sort((a, b) => b.totalIncome - a.totalIncome)
}

// ─── Trend detection ─────────────────────────────────────────────

export function computeTrend(data: MonthlyDataPoint[], metric: 'income' | 'outcome' | 'profit'): TrendInfo {
  if (data.length < 2) return { direction: 'stable', label: 'Insufficient data', changePercent: 0 }
  const first = data[0][metric]
  const last = data[data.length - 1][metric]
  const changePercent = first > 0 ? ((last - first) / first) * 100 : 0
  if (changePercent > 5) return { direction: 'up', label: `+${changePercent.toFixed(0)}%`, changePercent }
  if (changePercent < -5) return { direction: 'down', label: `${changePercent.toFixed(0)}%`, changePercent }
  return { direction: 'stable', label: `Flat (${changePercent.toFixed(1)}%)`, changePercent }
}

// ─── Anomaly detection ───────────────────────────────────────────

export function detectAnomalies(
  data: MonthlyDataPoint[],
  movements: FinancialMovement[],
): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = []

  for (let i = 1; i < data.length; i++) {
    const curr = data[i]
    const prev = data[i - 1]

    // Income spike MoM > 50%
    if (prev.income > 0) {
      const incomeChange = ((curr.income - prev.income) / prev.income) * 100
      if (incomeChange > 50) {
        alerts.push({
          type: 'income_spike',
          month: curr.month,
          severity: 'P1',
          description: `Income spike: ${incomeChange.toFixed(0)}% MoM`,
          value: incomeChange,
          threshold: 50,
        })
      }
    }

    // Outcome spike MoM > 40%
    if (prev.outcome > 0) {
      const outcomeChange = ((curr.outcome - prev.outcome) / prev.outcome) * 100
      if (outcomeChange > 40) {
        alerts.push({
          type: 'outcome_spike',
          month: curr.month,
          severity: 'P1',
          description: `Outcome spike: ${outcomeChange.toFixed(0)}% MoM`,
          value: outcomeChange,
          threshold: 40,
        })
      }
    }

    // Margin drop > 10pp
    const marginChange = curr.profitPercent - prev.profitPercent
    if (marginChange < -10) {
      alerts.push({
        type: 'margin_drop',
        month: curr.month,
        severity: 'P0',
        description: `Margin dropped ${Math.abs(marginChange).toFixed(1)}pp MoM`,
        value: marginChange,
        threshold: -10,
      })
    }
    if (marginChange > 10) {
      alerts.push({
        type: 'margin_jump',
        month: curr.month,
        severity: 'P2',
        description: `Margin jumped ${marginChange.toFixed(1)}pp MoM`,
        value: marginChange,
        threshold: 10,
      })
    }
  }

  // Zero-data check
  for (const d of data) {
    if (d.income === 0) {
      alerts.push({
        type: 'zero_data',
        month: d.month,
        severity: 'P0',
        description: `Zero income in ${d.month}`,
        value: 0,
        threshold: 0,
      })
    }
    if (d.outcome === 0) {
      alerts.push({
        type: 'zero_data',
        month: d.month,
        severity: 'P1',
        description: `Zero outcome in ${d.month}`,
        value: 0,
        threshold: 0,
      })
    }
  }

  // Category anomalies: category with zero in prior month that has spend now
  const monthlyMovements = movements.reduce(
    (acc, m) => {
      const key = toYearMonthKey(new Date(m.create_date))
      if (!acc[key]) acc[key] = []
      acc[key].push(m)
      return acc
    },
    {} as Record<string, FinancialMovement[]>,
  )

  const sortedMonths = Object.keys(monthlyMovements).sort()

  for (let i = 1; i < sortedMonths.length; i++) {
    const prevKey = sortedMonths[i - 1]
    const currKey = sortedMonths[i]
    const prevCategories = getCategoryTotals(monthlyMovements[prevKey], 'outcome')
    const currCategories = getCategoryTotals(monthlyMovements[currKey], 'outcome')

    for (const cat of Object.keys(currCategories) as Category[]) {
      if ((prevCategories[cat] ?? 0) === 0 && currCategories[cat] > 0) {
        alerts.push({
          type: 'category_change',
          month: formatMonthYearLabel(currKey),
          severity: 'P2',
          description: `New spend in "${cat}": ${formatCurrency(currCategories[cat])}`,
          value: currCategories[cat],
          threshold: 0,
        })
      }
    }
  }

  return alerts.sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2, P3: 3 }
    return order[a.severity] - order[b.severity]
  })
}

function getCategoryTotals(
  movements: FinancialMovement[],
  operationType: 'income' | 'outcome',
): Record<string, number> {
  return movements
    .filter((m) => m.operation_type === operationType)
    .reduce(
      (acc, m) => {
        acc[m.category] = (acc[m.category] ?? 0) + m.amount
        return acc
      },
      {} as Record<string, number>,
    )
}

// ─── Growth comparison (H1 vs H2 or first vs last) ──────────────

export function computeGrowthComparison(data: MonthlyDataPoint[]): GrowthComparison | null {
  if (data.length < 2) return null
  const midpoint = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, midpoint)
  const secondHalf = data.slice(midpoint)

  const sum = (arr: MonthlyDataPoint[], key: 'income' | 'outcome' | 'profit') =>
    arr.reduce((s, d) => s + d[key], 0)

  const incomeFirst = sum(firstHalf, 'income')
  const incomeSecond = sum(secondHalf, 'income')
  const outcomeFirst = sum(firstHalf, 'outcome')
  const outcomeSecond = sum(secondHalf, 'outcome')
  const profitFirst = sum(firstHalf, 'profit')
  const profitSecond = sum(secondHalf, 'profit')

  const incomeGrowth = incomeFirst > 0 ? ((incomeSecond - incomeFirst) / incomeFirst) * 100 : 0
  const outcomeGrowth = outcomeFirst > 0 ? ((outcomeSecond - outcomeFirst) / outcomeFirst) * 100 : 0
  const profitGrowth = profitFirst > 0 ? ((profitSecond - profitFirst) / profitFirst) * 100 : 0

  return {
    incomeGrowth,
    outcomeGrowth,
    profitGrowth,
    periodLabel: `${firstHalf[0]?.month ?? ''} – ${secondHalf[secondHalf.length - 1]?.month ?? ''}`,
  }
}

// ─── Monthly profit trend direction label ────────────────────────

export function getMarginTrendDirection(data: MonthlyDataPoint[]): TrendInfo {
  if (data.length < 2) return { direction: 'stable', label: 'Insufficient data', changePercent: 0 }
  const first = data[0].profitPercent
  const last = data[data.length - 1].profitPercent
  const change = last - first
  if (change > 3) return { direction: 'up', label: `Improving (+${change.toFixed(1)}pp)`, changePercent: change }
  if (change < -3) return { direction: 'down', label: `Deteriorating (${change.toFixed(1)}pp)`, changePercent: change }
  return { direction: 'stable', label: `Stable (${change >= 0 ? '+' : ''}${change.toFixed(1)}pp)`, changePercent: change }
}
