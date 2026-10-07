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
   * Average of exactly the 3 preceding periods (target contract, decision D1 in
   * verification.md). TODAY the API returns an expanding historical average instead.
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
  /**
   * TARGET CONTRACT (decision D2, not yet implemented/verified in the API; see
   * verification.md ❌ row). Share of this category over the full group total, in
   * percent, scale 0–100, rounded to 2 decimals. The group is
   * (business_type, operation_type, date range), NOT limited by `limit`.
   * @see GET /api/metrics/categories/top
   */
  percentage_of_group: number
  /**
   * TARGET CONTRACT (decision D2). Total of ALL movements of the group (all
   * categories, ignoring `limit`), repeated in every entry. The response stays a
   * plain array (backward compatible). An empty array means the group total is 0.
   * @see GET /api/metrics/categories/top
   */
  group_total: number
}

export interface TopCategoriesResponse extends ReadonlyArray<CategoryEntry> {
  /**
   * Category entry at the given response-array index.
   * @see GET /api/metrics/categories/top
   */
  readonly [index: number]: CategoryEntry
}

/**
 * UI-only wrapper for one asynchronous request (not an API type). Lets a component
 * tell "loading", "failed" and "loaded (possibly empty)" apart per request.
 */
export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }
