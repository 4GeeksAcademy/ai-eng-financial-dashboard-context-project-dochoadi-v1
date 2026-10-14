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
   * 2 decimals. It is NOT a 3-period moving average; see decision D1 in verification.md.
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

/**
 * UI-only derived row (not an API type). Computed in the frontend from
 * `TopCategoriesResponse` (decision D2): the API does not return any share.
 */
export interface CategoryShareRow extends CategoryEntry {
  /** `total_amount / groupTotal * 100`, scale 0–100; `0` when `groupTotal` is `0`. */
  percentageOfGroup: number
}

/**
 * UI-only derived data for one business line (not an API type). Built from a
 * `categories/top` call with `operation_type=income` and `limit=20` (every
 * category in the dataset, D2).
 */
export interface BusinessIncomeBreakdown {
  /** Sum of `total_amount` of ALL returned entries; `0` for an empty response. */
  groupTotal: number
  /** First 5 entries in API order (`total_amount` descending), with their share. */
  topRows: CategoryShareRow[]
}

/**
 * UI-only wrapper for one asynchronous request (not an API type). Lets a component
 * tell "loading", "failed" and "loaded (possibly empty)" apart per request.
 */
export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }
