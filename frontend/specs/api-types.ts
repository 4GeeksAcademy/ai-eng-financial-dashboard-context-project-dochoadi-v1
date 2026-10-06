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
   * Historical baseline average used by the API, represented as a number with no declared range.
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
  // TODO: Add percentage_of_group after the endpoint exposes and verifies it.
}

export interface TopCategoriesResponse extends ReadonlyArray<CategoryEntry> {
  /**
   * Category entry at the given response-array index.
   * @see GET /api/metrics/categories/top
   */
  readonly [index: number]: CategoryEntry
}
