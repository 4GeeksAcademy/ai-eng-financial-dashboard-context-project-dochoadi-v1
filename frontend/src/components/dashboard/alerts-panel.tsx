import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type AnomalyAlert } from '@/lib/financial-types'
import { AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertsPanelProps {
  alerts: AnomalyAlert[]
  loading?: boolean
}

const severityConfig: Record<string, { icon: typeof AlertTriangle; className: string; label: string }> = {
  P0: { icon: AlertCircle, className: 'text-red-500 bg-red-500/10', label: 'Critical' },
  P1: { icon: AlertTriangle, className: 'text-amber-500 bg-amber-500/10', label: 'High' },
  P2: { icon: Info, className: 'text-blue-500 bg-blue-500/10', label: 'Medium' },
  P3: { icon: Info, className: 'text-muted-foreground bg-muted/50', label: 'Low' },
}

export function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-48 mt-1 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[120px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const criticalCount = alerts.filter((a) => a.severity === 'P0' || a.severity === 'P1').length

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Alerts & Risk Register</CardTitle>
          {criticalCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-500">
              {criticalCount} critical
            </span>
          )}
        </div>
        <CardDescription>
          {alerts.length === 0
            ? 'No anomalies detected — all metrics within normal ranges'
            : `${alerts.length} issue${alerts.length !== 1 ? 's' : ''} found, prioritized P0–P3`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <AlertCircle size={16} />
            <span>All clear — no red flags detected</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {alerts.map((alert, idx) => {
              const sev = severityConfig[alert.severity] ?? severityConfig.P3
              const SevIcon = sev.icon
              return (
                <div
                  key={`${alert.month}-${alert.type}-${idx}`}
                  className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
                >
                  <div className={cn('p-1.5 rounded-lg shrink-0', sev.className)}>
                    <SevIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">{alert.severity}</span>
                      <span className="text-xs text-muted-foreground">{alert.month}</span>
                      {alert.type === 'income_spike' && <TrendingUp size={12} className="text-emerald-500" />}
                      {alert.type === 'outcome_spike' && <TrendingDown size={12} className="text-red-500" />}
                    </div>
                    <p className="text-sm mt-0.5">{alert.description}</p>
                    {alert.type === 'outcome_spike' && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Actual: {alert.value.toFixed(0)}% — Threshold: {alert.threshold}%
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}