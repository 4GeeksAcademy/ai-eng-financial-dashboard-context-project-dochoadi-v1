import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { MonthlyProfitChart } from "@/components/dashboard/monthly-profit-chart";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { SegmentComparison } from "@/components/dashboard/segment-comparison";
import { GrowthComparisonCard } from "@/components/dashboard/growth-comparison";
import { TrendBadge } from "@/components/dashboard/trend-badge";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
  type CategoryBreakdown as CategoryBreakdownType,
  type SegmentMetrics,
  type AnomalyAlert,
  type GrowthComparison,
} from "@/lib/financial-types";
import {
  computeKPIs,
  computeMonthlyData,
  computeCategoryBreakdown,
  computeSegmentMetrics,
  computeGrowthComparison,
  getMarginTrendDirection,
  detectAnomalies,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdownType[]>([]);
  const [outcomeBreakdown, setOutcomeBreakdown] = useState<CategoryBreakdownType[]>([]);
  const [segments, setSegments] = useState<SegmentMetrics[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [growth, setGrowth] = useState<GrowthComparison | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((data) => {
        setMovements(data);
        setMetrics(computeKPIs(data));
        const monthly = computeMonthlyData(data);
        setMonthlyData(monthly);
        setIncomeBreakdown(computeCategoryBreakdown(data, "income"));
        setOutcomeBreakdown(computeCategoryBreakdown(data, "outcome"));
        setSegments(computeSegmentMetrics(data));
        setAlerts(detectAnomalies(monthly, data));
        setGrowth(computeGrowthComparison(monthly));
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const marginTrend = monthlyData.length > 0 ? getMarginTrendDirection(monthlyData) : null

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {loading ? (
            <p className="sr-only" role="status">
              Loading financial metrics
            </p>
          ) : null}

          {error ? (
            <div
              lang="es"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Margin Trend:</span>
                {marginTrend && !loading ? (
                  <TrendBadge direction={marginTrend.direction} label={marginTrend.label} />
                ) : null}
              </div>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
            </div>
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>

          <section aria-label="Monthly profit">
            <MonthlyProfitChart data={monthlyData} loading={loading} />
          </section>

          <section aria-label="Income and outcome breakdown by category">
            <CategoryBreakdown
              incomeBreakdown={incomeBreakdown}
              outcomeBreakdown={outcomeBreakdown}
              loading={loading}
            />
          </section>

          <section
            aria-label="Segment and growth analysis"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <SegmentComparison
              segments={segments}
              totalMovements={movements.length}
              loading={loading}
            />
            <GrowthComparisonCard growth={growth} loading={loading} />
          </section>

          <section aria-label="Alerts and risk register">
            <AlertsPanel alerts={alerts} loading={loading} />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
