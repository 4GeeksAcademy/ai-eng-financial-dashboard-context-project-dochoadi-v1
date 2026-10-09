import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

type HealthStatus = 'healthy' | 'warning' | 'critical'

interface KPICardProps {
  label: string
  value: string
  helperText: string
  icon: LucideIcon
  variant: 'income' | 'outcome' | 'profit' | 'profitPercent' | 'costRatio'
  health?: HealthStatus
  loading?: boolean
}

const variantStyles: Record<KPICardProps['variant'], { badge: string; icon: string }> = {
  income: {
    badge: 'bg-[var(--income-badge)] text-[var(--income-badge-fg)]',
    icon: 'text-[var(--income-badge-fg)]',
  },
  outcome: {
    badge: 'bg-[var(--outcome-badge)] text-[var(--outcome-badge-fg)]',
    icon: 'text-[var(--outcome-badge-fg)]',
  },
  profit: {
    badge: 'bg-[var(--profit-badge)] text-[var(--profit-badge-fg)]',
    icon: 'text-[var(--profit-badge-fg)]',
  },
  profitPercent: {
    badge: 'bg-[var(--profit-badge)] text-[var(--profit-badge-fg)]',
    icon: 'text-[var(--profit-badge-fg)]',
  },
  costRatio: {
    badge: 'bg-[var(--outcome-badge)] text-[var(--outcome-badge-fg)]',
    icon: 'text-[var(--outcome-badge-fg)]',
  },
}

const healthStyles: Record<HealthStatus, { badge: string; icon: string }> = {
  healthy: {
    badge: 'bg-emerald-500/15 text-emerald-500',
    icon: 'text-emerald-500',
  },
  warning: {
    badge: 'bg-amber-500/15 text-amber-500',
    icon: 'text-amber-500',
  },
  critical: {
    badge: 'bg-red-500/15 text-red-500',
    icon: 'text-red-500',
  },
}

export function KPICard({ label, value, helperText, icon: Icon, variant, health, loading }: KPICardProps) {
  const styles = health && healthStyles[health] ? healthStyles[health] : variantStyles[variant]

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-44" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 hover:border-border transition-colors">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-pretty">
            {label}
          </span>
          <span className={cn('p-1.5 rounded-lg', styles.badge)}>
            <Icon size={16} className={styles.icon} />
          </span>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{helperText}</p>
      </CardContent>
    </Card>
  )
}
