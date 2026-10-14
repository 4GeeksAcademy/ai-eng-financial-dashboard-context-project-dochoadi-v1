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
}

export interface MonthlyDataPoint {
  month: string
  income: number
  outcome: number
  profitPercent: number
}

// JSON item of GET /api/metrics/categories/top (TopCategoryItem in the API)
export interface TopCategoryItem {
  category: Category
  operation_type: OperationType
  total_amount: number
}

// JSON item of GET /api/metrics/summary (MetricsSummaryItem in the API)
export interface MetricsSummaryItem {
  period: string
  income: number
  outcome: number
  net: number
}

// Derived in the frontend: the API does not return shares or group totals
export interface CategoryShare {
  category: Category
  totalAmount: number
  percentageOfGroup: number
}

export interface IncomeBreakdown {
  groupTotal: number
  topRows: CategoryShare[]
}

// Derived in the frontend: 3-period moving-average outcome alert
export interface AnomalyAlert {
  period: string
  outcomeTotal: number
  baselineAverage: number
  increaseRatio: number
}
