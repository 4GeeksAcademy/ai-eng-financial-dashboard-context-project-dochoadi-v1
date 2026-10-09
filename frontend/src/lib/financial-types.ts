export type OperationType = 'income' | 'outcome'
export type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
export type BusinessType = 'B2B' | 'B2C'

export interface FinancialMovement {
  create_date: string // ISO date
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}

export interface KPIMetrics {
  totalIncome: number
  totalOutcome: number
  profit: number
  profitPercent: number
  costToIncomeRatio: number
}

export interface MonthlyDataPoint {
  month: string
  income: number
  outcome: number
  profit: number
  profitPercent: number
}

export interface CategoryBreakdown {
  category: Category
  operationType: OperationType
  total: number
  percentage: number
}

export interface SegmentMetrics {
  businessType: BusinessType
  count: number
  totalIncome: number
  totalOutcome: number
  profit: number
  profitPercent: number
}

export interface TrendInfo {
  direction: 'up' | 'down' | 'stable'
  label: string
  changePercent: number
}

export interface AnomalyAlert {
  type: 'income_spike' | 'outcome_spike' | 'margin_drop' | 'margin_jump' | 'category_change' | 'zero_data'
  month: string
  severity: 'P0' | 'P1' | 'P2' | 'P3'
  description: string
  value: number
  threshold: number
}

export interface GrowthComparison {
  incomeGrowth: number
  outcomeGrowth: number
  profitGrowth: number
  periodLabel: string
}
