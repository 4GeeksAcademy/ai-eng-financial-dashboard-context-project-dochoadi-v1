import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type SegmentMetrics } from '@/lib/financial-types'
import { formatCurrency, formatPercent } from '@/lib/financial-utils'

interface SegmentComparisonProps {
  segments: SegmentMetrics[]
  totalMovements: number
  loading?: boolean
}

export function SegmentComparison({ segments, totalMovements, loading }: SegmentComparisonProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="h-5 w-44 bg-muted rounded animate-pulse" />
          <div className="h-3 w-56 mt-1 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[160px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (segments.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Segment Performance</CardTitle>
          <CardDescription>B2B vs B2C comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No segment data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Segment Performance</CardTitle>
        <CardDescription>B2B vs B2C comparison — {totalMovements} total movements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {segments.map((seg) => {
            const pctOfTotal = totalMovements > 0 ? (seg.count / totalMovements) * 100 : 0
            const isConcentrated = pctOfTotal > 80
            return (
              <div
                key={seg.businessType}
                className="rounded-lg border border-border/60 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{seg.businessType}</span>
                  <span className="text-xs text-muted-foreground">{pctOfTotal.toFixed(0)}% of movements</span>
                </div>
                {isConcentrated && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">
                    HIGH CONCENTRATION
                  </span>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Income</span>
                    <p className="font-semibold tabular-nums">{formatCurrency(seg.totalIncome)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Outcome</span>
                    <p className="font-semibold tabular-nums">{formatCurrency(seg.totalOutcome)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profit</span>
                    <p className="font-semibold tabular-nums">{formatCurrency(seg.profit)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Margin</span>
                    <p className="font-semibold tabular-nums">{formatPercent(seg.profitPercent)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}