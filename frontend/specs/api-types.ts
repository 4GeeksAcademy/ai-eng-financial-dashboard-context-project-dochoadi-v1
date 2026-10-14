import type {
  BusinessType,
  Category,
  OperationType,
} from '../src/lib/financial-types'

export interface FacetsResponse {
  /**
   * Operation types available in the dataset. Valid values are `income` and `outcome`.
   * @see GET /api/metrics/facets
   */
  operation_types: OperationType[]
  /**
   * Business lines available in the dataset. Valid values are `B2B` and `B2C`.
   * @see GET /api/metrics/facets
   */
  business_types: BusinessType[]
  /**
   * Categories available in the dataset. Valid values are `suppliers`, `sales`,
   * `operational`, `administrative`, and `others`.
   * @see GET /api/metrics/facets
   */
  categories: Category[]
  /**
   * Earliest date available in the dataset, formatted as `YYYY-MM-DD`.
   * @see GET /api/metrics/facets
   */
  min_date: string
  /**
   * Latest date available in the dataset, formatted as `YYYY-MM-DD`.
   * @see GET /api/metrics/facets
   */
  max_date: string
}

export interface AlertEntry {
  /**
   * Aggregation period for the alert. Observed monthly values use `YYYY-MM`.
   * @see GET /api/metrics/alerts
   */
  period: string
  /**
   * Total outcome recorded in the period, represented as a number with no declared range.
   * @see GET /api/metrics/alerts
   */
  outcome_total: number
  /**
   * Average outcome of ALL preceding periods inside the filtered range (expanding
   * historical average, as `detect_outcome_alerts` computes it today), rounded to
   * 2 decimals. It is NOT a 3-period moving average, so the UI does not use this
   * endpoint (D1); kept to document the API as it is.
   * @see GET /api/metrics/alerts
   */
  baseline_average: number
  /**
   * Increase over the baseline expressed as a ratio, represented as a number with no declared range.
   * @see GET /api/metrics/alerts
   */
  increase_ratio: number
}

export interface AlertsResponse extends ReadonlyArray<AlertEntry> {
  /**
   * Alert entry at the given response-array index.
   * @see GET /api/metrics/alerts
   */
  readonly [index: number]: AlertEntry
}

export interface CategoryEntry {
  /**
   * Category name. Valid values are `suppliers`, `sales`, `operational`,
   * `administrative`, and `others`.
   * @see GET /api/metrics/categories/top
   */
  category: Category
  /**
   * Operation type aggregated by the entry. Valid values are `income` and `outcome`.
   * @see GET /api/metrics/categories/top
   */
  operation_type: OperationType
  /**
   * Aggregated amount for the category, represented as a number with no declared range.
   * @see GET /api/metrics/categories/top
   */
  total_amount: number
}

export interface TopCategoriesResponse extends ReadonlyArray<CategoryEntry> {
  /**
   * Category entry at the given response-array index.
   * @see GET /api/metrics/categories/top
   */
  readonly [index: number]: CategoryEntry
}

export interface SummaryEntry {
  /**
   * Aggregation period. With `group_by=month` it is `YYYY-MM`; months without
   * movements are absent (not zero). Returned in ascending order.
   * @see GET /api/metrics/summary
   */
  period: string
  /**
   * Total income of the period, rounded to 2 decimals.
   * @see GET /api/metrics/summary
   */
  income: number
  /**
   * Total outcome of the period, rounded to 2 decimals. Input of the
   * 3-period moving average computed in the frontend (D1).
   * @see GET /api/metrics/summary
   */
  outcome: number
  /**
   * `income - outcome`, rounded to 2 decimals.
   * @see GET /api/metrics/summary
   */
  net: number
}

export interface SummaryResponse extends ReadonlyArray<SummaryEntry> {
  /**
   * Summary entry at the given response-array index.
   * @see GET /api/metrics/summary
   */
  readonly [index: number]: SummaryEntry
}

/**
 * UI-only types (not API types), derived in the frontend from the responses
 * above and implemented in `src/lib/financial-utils.ts`:
 * - `IncomeBreakdown` / `CategoryShare`: `computeIncomeBreakdown`, D2.
 * - `AnomalyAlert`: `computeAnomalyAlerts`, 3-period moving average, D1.
 */
export type {
  AnomalyAlert,
  CategoryShare,
  IncomeBreakdown,
} from '../src/lib/financial-types'

/**
 * UI-only wrapper for one asynchronous request (not an API type). Lets a component
 * tell "loading", "failed" and "loaded (possibly empty)" apart per request.
 */
export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }
