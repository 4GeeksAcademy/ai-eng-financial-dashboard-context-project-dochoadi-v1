import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendBadgeProps {
  direction: 'up' | 'down' | 'stable'
  label: string
  className?: string
}

const config = {
  up: { icon: TrendingUp, className: 'text-emerald-500 bg-emerald-500/10' },
  down: { icon: TrendingDown, className: 'text-red-500 bg-red-500/10' },
  stable: { icon: Minus, className: 'text-muted-foreground bg-muted/50' },
}

export function TrendBadge({ direction, label, className }: TrendBadgeProps) {
  const { icon: Icon, className: colorClass } = config[direction]
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', colorClass, className)}>
      <Icon size={12} />
      {label}
    </span>
  )
}