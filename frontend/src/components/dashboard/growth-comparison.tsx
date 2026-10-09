import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type GrowthComparison } from '@/lib/financial-types'
import { TrendBadge } from '@/components/dashboard/trend-badge'

interface GrowthComparisonProps {
  growth: GrowthComparison | null
  loading?: boolean
}

function growthDirection(value: number): 'up' | 'down' | 'stable' {
  if (value > 5) return 'up'
  if (value < -5) return 'down'
  return 'stable'
}

export function GrowthComparisonCard({ growth, loading }: GrowthComparisonProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="h-5 w-44 bg-muted rounded animate-pulse" />
          <div className="h-3 w-56 mt-1 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[100px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (!growth) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Growth Comparison</CardTitle>
          <CardDescription>Income vs Outcome vs Profit growth rates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Insufficient data for comparison</p>
        </CardContent>
      </Card>
    )
  }

  const rows = [
    { label: 'Income', value: growth.incomeGrowth },
    { label: 'Outcome', value: growth.outcomeGrowth },
    { label: 'Profit', value: growth.profitGrowth },
  ]

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Growth Comparison</CardTitle>
        <CardDescription>{growth.periodLabel} — growth rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm font-medium">{row.label}</span>
              <TrendBadge
                direction={growthDirection(row.value)}
                label={`${row.value >= 0 ? '+' : ''}${row.value.toFixed(1)}%`}
              />
            </div>
          ))}
          {growth.outcomeGrowth > growth.incomeGrowth && (
            <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
              <span>⚠ Outcome growing faster than income — margin compression risk</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}