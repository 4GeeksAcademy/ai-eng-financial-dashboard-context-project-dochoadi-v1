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

/**
 * Params of GET /api/metrics/alerts. Documented as the API is today; the UI does
 * NOT call this endpoint (D1: it computes a 3-period moving average from
 * GET /api/metrics/summary instead, see `SummaryParams`).
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum increase ratio that triggers an alert. Valid values are numbers greater
   * than or equal to `0`; the API default is `0.3`.
   * @see GET /api/metrics/alerts
   */
  threshold?: number
  // `group_by` and `business_type` exist in the API but are not part of this type.
}

/**
 * Params of GET /api/metrics/summary as the UI sends them for the anomaly table
 * (D1): only the global date range plus a fixed `group_by=month`. `category`,
 * `operation_type` and `business_type` exist in the API but are never sent.
 * The threshold is NOT sent: it is applied in the frontend.
 */
export interface SummaryParams extends DateRangeFilter {
  /**
   * Aggregation period. The API accepts `day`, `week` or `month` (default
   * `month`); the UI always sends `month`.
   * @see GET /api/metrics/summary
   */
  group_by: 'month'
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

/**
 * Params of GET /api/metrics (verified in backend/app/routes.py on 2026-10-06:
 * `start_date`, `end_date`, `category`, `operation_type`; returns FinancialMovement[]).
 * The dashboard only sends the date range.
 */
export type MetricsParams = DateRangeFilter
