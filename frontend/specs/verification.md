# Verificación

## Mis dudas antes de mirar la API
- Funcionalidad 1: ¿ Que pasaria si no relleno fecha de inicio y fecha fin? ¿Que pasa si el formato de la fecha es distinto al solicitado?
- Funcionalidad 2: ¿ Que pasaria si la table tiene mas o menos tablas que las que se solicitan? ¿ Que pasa si no se llega a mostrar ningun mensaje?
- Funcionalidad 3: ¿ Que pasaria si muestran menos categorias? ¿Que pasa si un grafico no se genera?

## Afirmaciones verificadas
| Afirmación | Fuente | Estado (✅ ❌ ❓) |
|---|---|---|
| `GET /api/metrics/facets` respuesta `operation_types`: array obligatorio de strings; cada elemento admite `income` u `outcome`. Respuesta real: `["income", "outcome"]`. | `openapi.json` (`MetricsFacets`) y `curl http://localhost:8000/api/metrics/facets` (HTTP 200) | ✅ |
| `GET /api/metrics/facets` respuesta `business_types`: array obligatorio de strings; cada elemento admite `B2B` o `B2C`. Respuesta real: `["B2B", "B2C"]`. | `openapi.json` (`MetricsFacets`) y `curl http://localhost:8000/api/metrics/facets` (HTTP 200) | ✅ |
| `GET /api/metrics/facets` respuesta `categories`: array obligatorio de strings; cada elemento admite `suppliers`, `sales`, `operational`, `administrative` u `others`. La respuesta real incluyó los cinco valores. | `openapi.json` (`MetricsFacets`) y `curl http://localhost:8000/api/metrics/facets` (HTTP 200) | ✅ |
| `GET /api/metrics/facets` respuesta `min_date`: string obligatorio con formato `date`; valor real observado: `2025-10-02`. | `openapi.json` (`MetricsFacets`) y `curl http://localhost:8000/api/metrics/facets` (HTTP 200) | ✅ |
| `GET /api/metrics/facets` respuesta `max_date`: string obligatorio con formato `date`; valor real observado: `2026-09-28`. | `openapi.json` (`MetricsFacets`) y `curl http://localhost:8000/api/metrics/facets` (HTTP 200) | ✅ |
| `GET /api/metrics/alerts` parámetro query `threshold`: number opcional, mínimo `0`, sin máximo declarado y valor por defecto `0.3`. | `openapi.json` (`/api/metrics/alerts`, parámetro `threshold`) | ✅ |
| `GET /api/metrics/alerts` parámetro query `group_by`: string opcional; valores válidos `day`, `week` o `month`; valor por defecto `month`. | `openapi.json` (`/api/metrics/alerts`, parámetro `group_by`) | ✅ |
| `GET /api/metrics/alerts` parámetro query `start_date`: string con formato `date` o `null`, opcional; OpenAPI no declara valores adicionales. | `openapi.json` (`/api/metrics/alerts`, parámetro `start_date`) | ✅ |
| `GET /api/metrics/alerts` parámetro query `end_date`: string con formato `date` o `null`, opcional; OpenAPI no declara valores adicionales. | `openapi.json` (`/api/metrics/alerts`, parámetro `end_date`) | ✅ |
| `GET /api/metrics/alerts` parámetro query `business_type`: string `B2B` o `B2C`, o `null`; opcional. | `openapi.json` (`/api/metrics/alerts`, parámetro `business_type`) | ✅ |
| `GET /api/metrics/alerts` respuesta `period`: string obligatorio, sin enum ni patrón declarado; valores reales observados con forma `YYYY-MM`, por ejemplo `2025-12`. | `openapi.json` (`MetricsAlert`) y `curl 'http://localhost:8000/api/metrics/alerts?threshold=0.3'` (HTTP 200) | ✅ |
| `GET /api/metrics/alerts` respuesta `outcome_total`: number obligatorio, sin rango declarado; valor real observado, por ejemplo `103378.98`. | `openapi.json` (`MetricsAlert`) y `curl 'http://localhost:8000/api/metrics/alerts?threshold=0.3'` (HTTP 200) | ✅ |
| `GET /api/metrics/alerts` respuesta `baseline_average`: number obligatorio, sin rango declarado; valor real observado, por ejemplo `51174.1`. | `openapi.json` (`MetricsAlert`) y `curl 'http://localhost:8000/api/metrics/alerts?threshold=0.3'` (HTTP 200) | ✅ |
| `GET /api/metrics/alerts` respuesta `increase_ratio`: number obligatorio, sin rango declarado; valor real observado, por ejemplo `1.0201`. | `openapi.json` (`MetricsAlert`) y `curl 'http://localhost:8000/api/metrics/alerts?threshold=0.3'` (HTTP 200) | ✅ |
| `GET /api/metrics/categories/top` parámetro query `operation_type`: string opcional; valores válidos `income` u `outcome`; valor por defecto `outcome`. | `openapi.json` (`/api/metrics/categories/top`, parámetro `operation_type`) | ✅ |
| `GET /api/metrics/categories/top` parámetro query `limit`: integer opcional entre `1` y `20`, ambos incluidos; valor por defecto `5`. | `openapi.json` (`/api/metrics/categories/top`, parámetro `limit`) | ✅ |
| `GET /api/metrics/categories/top` parámetro query `start_date`: string con formato `date` o `null`, opcional; OpenAPI no declara valores adicionales. | `openapi.json` (`/api/metrics/categories/top`, parámetro `start_date`) | ✅ |
| `GET /api/metrics/categories/top` parámetro query `end_date`: string con formato `date` o `null`, opcional; OpenAPI no declara valores adicionales. | `openapi.json` (`/api/metrics/categories/top`, parámetro `end_date`) | ✅ |
| `GET /api/metrics/categories/top` parámetro query `business_type`: string `B2B` o `B2C`, o `null`; opcional. | `openapi.json` (`/api/metrics/categories/top`, parámetro `business_type`) | ✅ |
| `GET /api/metrics/categories/top` respuesta `category`: string obligatorio; valores válidos `suppliers`, `sales`, `operational`, `administrative` u `others`. La respuesta real incluyó `sales` y `others`. | `openapi.json` (`TopCategoryItem`) y `curl 'http://localhost:8000/api/metrics/categories/top?operation_type=income&limit=5'` (HTTP 200) | ✅ |
| `GET /api/metrics/categories/top` respuesta `operation_type`: string obligatorio; valores válidos `income` u `outcome`. La respuesta real incluyó `income`. | `openapi.json` (`TopCategoryItem`) y `curl 'http://localhost:8000/api/metrics/categories/top?operation_type=income&limit=5'` (HTTP 200) | ✅ |
| `GET /api/metrics/categories/top` respuesta `total_amount`: number obligatorio, sin rango declarado; valores reales observados: `1132097.38` y `126049.49`. | `openapi.json` (`TopCategoryItem`) y `curl 'http://localhost:8000/api/metrics/categories/top?operation_type=income&limit=5'` (HTTP 200) | ✅ |
| **Dato ficticio de prueba:** `GET /api/metrics/categories/top` respuesta `percentage_of_group`: number obligatorio entre `0` y `100`. | No aparece en `openapi.json` (`TopCategoryItem`) ni en la respuesta real consultada con `curl`. | ❌ |

## Decisiones
| Duda | Decisión | Quién la confirma (yo / el PM) |
|---|---|---|
| ¿`baseline_average` debe representar exactamente los 3 períodos anteriores? | Modificar el backend para calcular una ventana móvil de 3 períodos. | yo |
| ¿Cómo obtener el total del grupo y calcular `percentage_of_group`? | Extender `/api/metrics/categories/top` para devolver el total y porcentaje de cada categoría. | yo |
