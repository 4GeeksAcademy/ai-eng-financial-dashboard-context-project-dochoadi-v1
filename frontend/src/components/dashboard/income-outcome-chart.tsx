import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type MonthlyDataPoint } from '@/lib/financial-types'
import { IncomeOutcomeTooltip } from '@/components/dashboard/chart-tooltip'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface IncomeOutcomeChartProps {
  data: MonthlyDataPoint[]
  loading?: boolean
}

export function IncomeOutcomeChart({ data, loading }: IncomeOutcomeChartProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-3 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const hasData = data.some((d) => d.income > 0 || d.outcome > 0)

  // --- Volatility indicator ---
  const incomes = data.filter((d) => d.income > 0).map((d) => d.income)
  const avgIncome = incomes.length ? incomes.reduce((a, b) => a + b, 0) / incomes.length : 0
  const variance =
    incomes.length > 1
      ? Math.sqrt(
          incomes.reduce((sum, v) => sum + (v - avgIncome) ** 2, 0) / incomes.length
        )
      : 0
  const cv = avgIncome > 0 ? variance / avgIncome : 0 // coefficient of variation
  const volatilityLabel =
    cv > 0.5 ? 'High volatility' : cv > 0.25 ? 'Moderate volatility' : 'Low volatility'
  const volatilityColor =
    cv > 0.5 ? 'var(--color-destructive)' : cv > 0.25 ? 'var(--color-warning)' : 'var(--color-success)'

  // --- Concentration callout ---
  const topIncomeMonth = Math.max(...data.map((d) => d.income))
  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const concentrationPct = totalIncome > 0 ? (topIncomeMonth / totalIncome) * 100 : 0
  const hasHighConcentration = concentrationPct > 40

  // --- Average outcome ReferenceLine ---
  const outcomes = data.filter((d) => d.outcome > 0).map((d) => d.outcome)
  const avgOutcome = outcomes.length ? outcomes.reduce((a, b) => a + b, 0) / outcomes.length : 0

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Income vs. Outcome</CardTitle>
          {hasData && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: volatilityColor }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: volatilityColor }} />
              {volatilityLabel}
            </span>
          )}
        </div>
        <CardDescription>
          Monthly revenue and expenditure evolution
          {hasData && hasHighConcentration && (
            <span className="ml-2 text-destructive font-medium">
              ⚠ {concentrationPct.toFixed(0)}% income concentrated in top month
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
            No data available to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip content={<IncomeOutcomeTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground capitalize">{value}</span>
                )}
              />
              <ReferenceLine
                y={avgOutcome}
                stroke="var(--color-success)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="income"
                name="income"
                stroke="var(--chart-income)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--chart-income)', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="outcome"
                name="outcome"
                stroke="var(--chart-outcome)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--chart-outcome)', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
