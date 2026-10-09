import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type MonthlyDataPoint } from '@/lib/financial-types'
import { ProfitPercentTooltip } from '@/components/dashboard/chart-tooltip'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { findSignificantMarginChanges } from '@/lib/financial-utils'

interface ProfitPercentChartProps {
  data: MonthlyDataPoint[]
  loading?: boolean
}

export function ProfitPercentChart({ data, loading }: ProfitPercentChartProps) {
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

  const hasData = data.some((d) => d.profitPercent !== 0)
  const significantChanges = findSignificantMarginChanges(data, 10)
  const significantMonthSet = new Set(significantChanges.map((c) => c.month))

  const renderDot = (props: Record<string, unknown>) => {
    const { cx, cy, payload } = props as { cx: number; cy: number; payload: MonthlyDataPoint }
    if (significantMonthSet.has(payload.month)) {
      const change = significantChanges.find((c) => c.month === payload.month)
      const isPositive = change ? change.change > 0 : true
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={isPositive ? 'var(--chart-income, #22c55e)' : 'var(--chart-outcome, #ef4444)'}
          stroke="var(--color-background, #000)"
          strokeWidth={2}
        />
      )
    }
    return <circle cx={cx} cy={cy} r={3} fill="var(--chart-profit)" strokeWidth={0} />
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Profit Margin %</CardTitle>
        <CardDescription>Monthly profit as a percentage of total income</CardDescription>
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
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                width={40}
                domain={['auto', 'auto']}
              />
              <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="4 4" />
              <Tooltip content={<ProfitPercentTooltip />} />
              {significantChanges.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="profitPercent"
                  stroke="transparent"
                  strokeWidth={0}
                  dot={renderDot}
                  activeDot={renderDot}
                  legendType="none"
                />
              )}
              <Line
                type="monotone"
                dataKey="profitPercent"
                name="profitPercent"
                stroke="var(--chart-profit)"
                strokeWidth={2}
                dot={significantChanges.length > 0 ? false : { r: 3, fill: 'var(--chart-profit)', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
