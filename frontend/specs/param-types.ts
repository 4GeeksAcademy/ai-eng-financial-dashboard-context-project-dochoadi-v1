import type {
  BusinessType,
  OperationType,
} from '../src/lib/financial-types'

export interface DateRangeFilter {
  /**
   * Inclusive start date. Optional; when provided, use `YYYY-MM-DD`.
   * @see GET /api/metrics
   */
  start_date?: string
  /**
   * Inclusive end date. Optional; when provided, use `YYYY-MM-DD`.
   * @see GET /api/metrics
   */
  end_date?: string
}

export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum increase ratio that triggers an alert. Valid values are numbers greater
   * than or equal to `0`; the API default is `0.3`.
   * @see GET /api/metrics/alerts
   */
  threshold?: number
}

export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation type to aggregate. Valid values are `income` and `outcome`;
   * the API default is `outcome`.
   * @see GET /api/metrics/categories/top
   */
  operation_type?: OperationType
  /**
   * Maximum number of entries. Valid values are integers from `1` through `20`;
   * the API default is `5`.
   * @see GET /api/metrics/categories/top
   */
  limit?: number
  /**
   * Business line to include. Valid values are `B2B` and `B2C`.
   * @see GET /api/metrics/categories/top
   */
  business_type?: BusinessType
}

export interface MetricsParams extends DateRangeFilter {
  /**
   * Inclusive start date. Optional; when provided, use `YYYY-MM-DD`.
   * @see GET /api/metrics
   */
  start_date?: string
  /**
   * Inclusive end date. Optional; when provided, use `YYYY-MM-DD`.
   * @see GET /api/metrics
   */
  end_date?: string
}
