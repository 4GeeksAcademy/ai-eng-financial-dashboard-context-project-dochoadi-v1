# Specs del frontend: punto de entrada

Guía para una sesión nueva del agente. Aquí se enlaza, no se copia: los tipos viven en `api-types.ts` y `param-types.ts`, los componentes en `components.md`.

## Orden de lectura

1. [pm-brief.md](./pm-brief.md): pedido original del PM (no editar).
2. [verification.md](./verification.md): qué se verificó contra la API y qué decisiones se tomaron. **Prevalece sobre el brief** donde difieran.
3. [api-types.ts](./api-types.ts) y [param-types.ts](./param-types.ts): contratos de respuesta y de parámetros.
4. [components.md](./components.md): componentes, props, estados y textos exactos de la UI.

## Avisos antes de implementar

Las decisiones `D1`–`D17` de [verification.md](./verification.md) resuelven las dudas de la prueba en frío (fase 4) y **prevalecen sobre el brief**. Las marcadas **PM** esperan confirmación.

- **Sin cambios de backend.** Los tipos de `api-types.ts` reflejan lo que la API devuelve hoy. Lo que falta se calcula en el frontend: total del grupo y porcentaje por categoría (D2). `baseline_average` se muestra tal cual (media histórica acumulada, D1, pendiente PM).
- **Algoritmo de alertas, desarrollo con fixtures y moneda:** D15–D17.
- **`GET /api/metrics` está verificado en el código** (devuelve `FinancialMovement[]` y acepta `start_date`/`end_date`), no ejecutado contra la API en marcha.
- **`AlertsParams`** no incluye `group_by` ni `business_type` a propósito (siempre `month`, sin `business_type`).
- **El umbral de la UI es más estricto que el de la API** (`0.01`–`1.0` frente a `>= 0`).
- `Validation_componets.md` es histórico (validó una versión anterior de `components.md`); no es fuente.

---

## Funcionalidad 1: Filtro de rango de fechas

**Requisito:** [pm-brief.md, Funcionalidad 1](./pm-brief.md). Detalle de UI: [components.md, Funcionalidad 1](./components.md#funcionalidad-1--filtro-de-rango-de-fechas).

**Endpoints**

| Ruta | Uso | Estado |
|---|---|---|
| `GET /api/metrics/facets` | Obtener `min_date` y `max_date` | ✅ verificado |
| `GET /api/metrics` (con `start_date`/`end_date`) | Filtrar KPIs y gráficos del dashboard | ✅ verificado en código (D4) |
| `GET /api/metrics/alerts` y `/categories/top` | También reciben el rango | ✅ verificado |

**Tipos**

- Respuesta: [`FacetsResponse`](./api-types.ts#L7) (`min_date`, `max_date`).
- Parámetros: [`DateRangeFilter`](./param-types.ts#L6), [`MetricsParams`](./param-types.ts#L48).

**Parámetros**

| Parámetro | Obligatorio | Valores válidos y restricciones |
|---|---|---|
| `start_date` | no | `YYYY-MM-DD`, inclusivo. Esperado dentro de `min_date`–`max_date`. |
| `end_date` | no | `YYYY-MM-DD`, inclusivo. Esperado dentro de `min_date`–`max_date`. |

Ambos son independientes. Sin ninguno, se consultan todos los datos. La API no declara más restricciones; las de rango y orden las aplica la UI. Dataset observado: `2025-10-02` a `2026-09-28`.

**Casos límite**

| Caso | Qué debe mostrar la UI |
|---|---|
| Solo una fecha | Se envía solo ese parámetro. Con inicio: `Desde YYYY-MM-DD hasta la última fecha disponible`. Con fin: `Desde la primera fecha disponible hasta YYYY-MM-DD`. |
| Inicio mayor que fin | No se consulta. Error: `La fecha de inicio no puede ser posterior a la fecha de fin.` |
| Rango fuera del disponible | No se consulta. Error: `La fecha debe estar dentro del rango disponible.` |
| Formato distinto de `YYYY-MM-DD` | No se consulta. Error: `Usa el formato YYYY-MM-DD.` |
| Ambos vacíos | `Mostrando todos los datos disponibles`; sin parámetros de fecha. |
| Fallan las facetas | `No se pudo cargar el rango de fechas disponible.`; no se presenta como vacío. |

Siempre que haya facetas se muestra `Rango disponible: min_date – max_date`.

---

## Funcionalidad 2: Tabla de alertas de anomalías

**Requisito:** [pm-brief.md, Funcionalidad 2](./pm-brief.md). Detalle de UI: [components.md, Funcionalidad 2](./components.md#funcionalidad-2--tabla-de-alertas-de-anomalías).

**Endpoint:** `GET /api/metrics/alerts?threshold=<ratio>` ✅ verificado.

**Tipos**

- Respuesta: [`AlertsResponse`](./api-types.ts#L61) y [`AlertEntry`](./api-types.ts#L36) (`period`, `outcome_total`, `baseline_average`, `increase_ratio`).
- Parámetros: [`AlertsParams`](./param-types.ts#L19) (extiende [`DateRangeFilter`](./param-types.ts#L6)).

**Parámetros**

| Parámetro | Obligatorio | Valores válidos y restricciones |
|---|---|---|
| `threshold` | no | API: número `>= 0`, sin máximo, por defecto `0.3`. **UI: `0.01`–`1.0`**, por defecto `0.3`. |
| `start_date`, `end_date` | no | `YYYY-MM-DD`; comparten el rango de la Funcionalidad 1. |
| `group_by` | no | API: `day`, `week`, `month` (por defecto `month`). No está en `AlertsParams`. |
| `business_type` | no | API: `B2B` o `B2C`. No está en `AlertsParams`. |

**Casos límite**

| Caso | Qué debe mostrar la UI |
|---|---|
| Umbral fuera de `0.01`–`1.0` | No se consulta. Input: `El umbral debe estar entre 0,01 y 1,0.` Tabla: `Corrige el umbral para consultar anomalías.` |
| Sin alertas | La tabla no desaparece: 4 columnas y una fila con `No se detectaron anomalías para el umbral X` (ej. `0,3`). |
| Primer período del rango | No tiene períodos anteriores: la API no lo evalúa y no aparece (D1). La UI no filtra ni recalcula. |
| Fallo de la petición | Fila con `No se pudieron cargar las anomalías.`; no se sustituye por lista vacía. |
| Fila con campos ausentes, no numéricos o `period` ≠ `YYYY-MM` | `Se recibieron datos de anomalías inválidos.` |
| Cargando | Cabecera, filas de carga y `Cargando anomalías…`; nunca el mensaje de vacío. |

Formato: `outcome_total` y `baseline_average` con miles y 2 decimales, sin moneda; `increase_ratio` como porcentaje (`1.0201` → `102,01 %`).

---

## Funcionalidad 3: Comparativa B2B vs B2C

**Requisito:** [pm-brief.md, Funcionalidad 3](./pm-brief.md). Detalle de UI: [components.md, Funcionalidad 3](./components.md#funcionalidad-3--comparativa-b2b-frente-a-b2c).

**Endpoints** (ambos ✅ verificados)

- `GET /api/metrics/categories/top?operation_type=income&limit=20&business_type=B2B|B2C`, una llamada por línea de negocio. `limit=20` trae todas las categorías para poder sumar el total del grupo; la UI muestra las 5 primeras (D2).
- `GET /api/metrics/facets`: categorías y líneas de negocio válidas.

**Tipos**

- Respuesta: [`TopCategoriesResponse`](./api-types.ts#L88) y [`CategoryEntry`](./api-types.ts#L69); [`FacetsResponse`](./api-types.ts#L7) (`categories`, `business_types`).
- Parámetros: [`TopCategoriesParams`](./param-types.ts#L28).
- La API **no** devuelve porcentaje ni total del grupo. El frontend los calcula (D2) en [`BusinessIncomeBreakdown`](./api-types.ts#L110) y [`CategoryShareRow`](./api-types.ts#L100), tipos solo de UI.

**Parámetros**

| Parámetro | Obligatorio | Valores válidos y restricciones |
|---|---|---|
| `operation_type` | no | `income` u `outcome` (por defecto `outcome`). Aquí siempre `income`. |
| `limit` | no | Entero `1`–`20` (por defecto `5`). Aquí siempre `20` (D2). |
| `business_type` | no | `B2B` o `B2C`. Aquí uno distinto por panel. |
| `start_date`, `end_date` | no | `YYYY-MM-DD`; mismo rango para ambos paneles y el gráfico. |

**Casos límite**

| Caso | Qué debe mostrar la UI |
|---|---|
| Menos de 5 categorías | Solo las filas devueltas; no se rellenan categorías ficticias. |
| Grupo sin ingresos (top vacío) | El panel conserva columnas y muestra `No hay categorías de ingresos B2B para el rango seleccionado.` (o B2C). Si ambos totales son cero, el gráfico muestra `No hay ingresos B2B ni B2C para comparar en el rango seleccionado.` |
| Rango sin datos | Igual que el caso anterior en ambos paneles: dos mensajes de vacío y el del gráfico. No se muestra como error. |
| Falla un solo panel | Ese panel muestra `No se pudieron cargar las categorías de ingresos B2B.` (o B2C); el otro sigue visible. |
| Falta el total de un grupo | El gráfico no inventa un cero: `La comparativa está incompleta: falta el total de B2B.` (o B2C). |
| Fallo del gráfico | `No se pudo cargar la comparativa de ingresos.` |
| Categoría fuera de facetas, `operation_type` ≠ `income` o `total_amount` no numérico o negativo | `Se recibieron datos de categorías inválidos.` en el panel afectado. |

El gráfico es una serie con dos puntos (`B2B`, `B2C`) con el **total completo** de ingresos de cada grupo, no la suma del top-5.
