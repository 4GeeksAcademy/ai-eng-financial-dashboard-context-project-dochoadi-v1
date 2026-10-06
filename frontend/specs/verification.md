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

## Verificado contra el código del repo (2026-10-06, lectura de `backend/app/routes.py` y `frontend/src/App.tsx`; no se ejecutó la API)
| Afirmación | Fuente | Estado |
|---|---|---|
| `GET /api/metrics` acepta `start_date`, `end_date`, `category`, `operation_type` y devuelve `FinancialMovement[]` (movimientos sueltos, no agregados). | `routes.py::get_metrics` | ✅ |
| El dashboard actual hace un único `fetch('/api/metrics')` sin parámetros y calcula KPIs y gráficos en cliente (`computeKPIs`, `computeMonthlyData`). | `App.tsx` | ✅ |
| `detect_outcome_alerts` usa una media histórica acumulada (todos los períodos previos, desde el 2.º período) y alerta con `increase_ratio > threshold` (estricto). | `routes.py::detect_outcome_alerts` | ✅ |
| `FacetsResponse.categories` es global (`sorted` de todas las categorías); no relaciona categoría con línea de negocio. Los ingresos solo usan `sales` y `others` en el mock. | `routes.py::build_metrics_facets`, `_build_movement` | ✅ |
| No hay router en el frontend; gráficos con `recharts`; tests con `vitest`. UI mezcla inglés (cabecera) y español (errores); `formatCurrency` usa USD `en-US`. | `package.json`, `src/components`, `financial-utils.ts` | ✅ |

## Decisiones de la prueba en frío (fase 4)
Las toma el desarrollador para poder construir; las marcadas **PM** requieren su confirmación y no cambian el brief original.

| # | Duda | Decisión | Confirma |
|---|---|---|---|
| D1 | Semántica de `baseline_average` y alertas | Backend: media de exactamente los 3 períodos anteriores del resumen filtrado; los 3 primeros períodos no pueden alertar; alerta si `increase_ratio > threshold` (estricto, como hoy). Siempre `group_by=month`, sin `business_type`. | yo |
| D2 | Contrato de `categories/top` | Sigue siendo un array. Cada entrada añade `percentage_of_group` (0–100, 2 decimales) y `group_total` (total de todo el grupo, ignora `limit`). Array vacío ⇒ total 0. Prerrequisito de backend (con tests) antes de F3. | yo |
| D3 | Filtro global | Un único `DateRangeFilter` en el estado de la aplicación, compartido por dashboard, alertas y comparativa. No va en la URL. Un valor inválido nunca sustituye al último filtro aplicado. | yo |
| D4 | Qué filtra F1 | `GET /api/metrics` con `start_date`/`end_date` (KPIs y 2 gráficos actuales), `alerts` y `categories/top`. Las facetas nunca se filtran. | yo |
| D5 | Navegación F3 | Sin librería de rutas: pestañas `Dashboard` / `Comparativa B2B vs B2C` en la cabecera, sincronizadas con `location.hash` (`#/` y `#/comparativa`). | PM |
| D6 | Categorías "por grupo" desde facetas | Las facetas solo dan la lista global. Las categorías de cada grupo salen de la respuesta de `categories/top`; `facets.categories` solo valida. | PM |
| D7 | Momento de aplicar | Fechas: al cambiar un input, si el conjunto es válido. Umbral: tras 300 ms sin teclear, si es válido. Peticiones obsoletas se cancelan (gana la última). | yo |
| D8 | Validación de fechas | Inputs `type="date"`. Fuera de `min_date`–`max_date` o inicio > fin: se bloquea (decisión firme, no aviso). Un campo vaciado equivale a fecha ausente. | yo |
| D9 | Facetas fallidas o inutilizables | Inputs deshabilitados con el error; el dashboard carga sin filtro. "Inutilizable" = falta `min_date`/`max_date`, no son fechas o `min_date > max_date`. | yo |
| D10 | Formato | Textos nuevos en español. Números con `Intl.NumberFormat('es-ES')` y `useGrouping: 'always'`; umbral en mensajes con coma (`0,3`). Sin símbolo de moneda. Valores enviados a la API con punto. | yo |
| D11 | Filas inválidas | Todo o nada: si una fila no cumple, se muestra solo el mensaje de datos inválidos (alertas y cada panel). | yo |
| D12 | Gráfico F3 | Barras (recharts), una serie, dos barras `B2B` y `B2C`; tooltip con el total en formato D10. | yo |
| D13 | Contenedores | Los componentes de `components.md` son presentacionales. El fetch vive en hooks/contenedores (`DashboardPage`, `BusinessComparisonContainer`) que construyen `RequestState`; `BusinessComparisonPage` es presentacional. | yo |
| D14 | Accesibilidad mínima | `label` en cada input, `aria-invalid` + `aria-describedby` en errores, mensajes de estado en `aria-live="polite"`, tablas con `<caption>` y `th scope`. | yo |
| D15 | Algoritmo de alertas (casos) | Los meses sin movimientos no existen en el resumen y se saltan (no cuentan como 0). Los 3 períodos anteriores son los 3 anteriores **presentes dentro del rango filtrado** (no se miran datos previos a `start_date`; los 3 primeros meses del rango nunca alertan, intencionado). Si `baseline_average == 0` no hay alerta. Un mes parcial en el borde del rango puede dar una alerta engañosa: limitación aceptada. Tests de backend mínimos: <3 períodos ⇒ `[]`; media exacta de 3; salto de mes; baseline 0; igualdad con el umbral no alerta; rango que recorta el histórico. | yo |
| D16 | Desarrollo sin backend listo | F2 y F3 se construyen contra fixtures en los tests (vitest) con la forma D1/D2; la integración real espera a los prerrequisitos de backend. | yo |
| D17 | Moneda | Lo nuevo va sin moneda (D10); el dashboard existente no se toca (sigue con `formatCurrency` USD). Unificar queda fuera de alcance. | PM |
| — | `financial-types.ts` | Comprobado: exporta `OperationType`, `Category` y `BusinessType` (los imports de los `.ts` de specs existen). | ✅ |
