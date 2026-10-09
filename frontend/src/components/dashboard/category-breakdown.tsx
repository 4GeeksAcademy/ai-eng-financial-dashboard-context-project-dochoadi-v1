import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type CategoryBreakdown } from '@/lib/financial-types'
import { formatCurrency, formatPercent } from '@/lib/financial-utils'

interface CategoryBreakdownProps {
  incomeBreakdown: CategoryBreakdown[]
  outcomeBreakdown: CategoryBreakdown[]
  loading?: boolean
}

const categoryColors: Record<string, string> = {
  sales: 'var(--chart-income)',
  suppliers: 'var(--chart-outcome)',
  operational: '#f59e0b',
  administrative: '#8b5cf6',
  others: '#6b7280',
}

function BreakdownList({ items, total, accent }: { items: CategoryBreakdown[]; total: number; accent: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No data</p>
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.category} className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: categoryColors[item.category] ?? '#6b7280' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize truncate">{item.category}</span>
              <span className="text-sm font-semibold tabular-nums">{formatPercent(item.percentage)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: item.percentage > 70
                    ? (accent === 'income' ? '#ef4444' : '#ef4444')
                    : (categoryColors[item.category] ?? '#6b7280'),
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{formatCurrency(item.total)}</span>
          </div>
          {item.percentage > (accent === 'income' ? 70 : 60) && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-500 whitespace-nowrap">
              HIGH
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function CategoryBreakdown({ incomeBreakdown, outcomeBreakdown, loading }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="h-5 w-44 bg-muted rounded animate-pulse" />
          <div className="h-3 w-56 mt-1 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Category Concentration</CardTitle>
        <CardDescription>Income and outcome breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-[var(--chart-income)] mb-3">Income by Category</h4>
            <BreakdownList items={incomeBreakdown} total={incomeBreakdown.reduce((s, i) => s + i.total, 0)} accent="income" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--chart-outcome)] mb-3">Outcome by Category</h4>
            <BreakdownList items={outcomeBreakdown} total={outcomeBreakdown.reduce((s, i) => s + i.total, 0)} accent="outcome" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}