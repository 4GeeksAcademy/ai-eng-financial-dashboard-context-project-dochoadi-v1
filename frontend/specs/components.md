# Especificación de componentes

Las decisiones `D1`–`D17` están en la tabla "Decisiones de la prueba en frío" de [verification.md](./verification.md). Los componentes de este documento son **presentacionales** (D13): reciben datos y callbacks; el fetch y el estado viven en contenedores.

## Estructura de la aplicación

- `App` mantiene el estado global `DateRangeFilter` aplicado (D3), el hash de navegación (D5) y la pestaña activa.
- Cabecera: el `DashboardHeader` existente, sin modificarlo, y justo debajo una fila propia con dos pestañas `Dashboard` y `Comparativa B2B vs B2C`. Hash desconocido o vacío ⇒ pestaña Dashboard. El botón Atrás funciona escuchando `hashchange`.
- Contenedores (D13): `DashboardPage` (hook de métricas y alertas) y `BusinessComparisonContainer` (hook `useBusinessComparison`: dos peticiones, cancelación de obsoletas, derivación de totales) viven bajo `App`. `BusinessComparisonPage` es presentacional.
- Cabecera: `App` pasa a `DashboardHeader` el `period` derivado del filtro, sin modificar el componente: sin filtro `{min_date} – {max_date}` (o el texto actual si no hay facetas); con filtro `{start_date ?? min_date} – {end_date ?? max_date}`.
- Pestaña **Dashboard** (orden vertical): `DashboardDateRangeFilter` → KPIs actuales → gráficos actuales → `AnomalyThresholdControl` → `AnomalyAlertsTable`.
- Pestaña **Comparativa**: `DashboardDateRangeFilter` (misma instancia lógica de filtro, mismo valor) → `BusinessComparisonPage`.
- El filtro (D4) se aplica a `GET /api/metrics` (KPIs y los dos gráficos existentes), a `alerts` y a `categories/top`. Las facetas se piden una vez y nunca se filtran.
- Una fecha inválida nunca reemplaza el filtro aplicado: las consultas siguen usando el último valor válido y el mensaje de error se muestra junto a los inputs.

## Formato común (D10)

- Número: `Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' })` → `1.132.097,38`. Sin símbolo de moneda.
- Porcentaje de `increase_ratio`: ratio × 100 con el formato anterior y ` %` → `1.0201` ⇒ `102,01 %`. `percentage_of_group` ya está en 0–100 ⇒ `45,50 %`.
- Umbral dentro de mensajes: formato `es-ES` sin forzar decimales (`0,3`, `1`). A la API se envía con punto.
- Período de alertas: `YYYY-MM` literal, sin pasar por `Date`.

## Zona existente del dashboard con filtro (D4)

Los KPIs y los dos gráficos actuales se alimentan de `GET /api/metrics` con el filtro aplicado. Contrato del contenedor `DashboardPage` (sin cambiar las props de los componentes existentes, que ya aceptan `loading`):

| estado | qué ve el usuario |
|---|---|
| cargando | `loading=true` en `KPIRow` y los dos gráficos (sus esqueletos actuales); los datos previos no se conservan. |
| error | El banner de error existente con `No se pudo actualizar el dashboard para el rango seleccionado.` si había filtro y `No se pudo cargar la informacion financiera. Revisa la API de backend.` (texto actual) si no; KPIs y gráficos vacíos. |
| vacío (0 movimientos en el rango) | Los gráficos se sustituyen por `No hay movimientos para el rango seleccionado.`; los KPIs muestran sus valores en cero con el formato existente (`formatCurrency`, p. ej. `$0`, y `0%`). Comprobar con test que `computeKPIs`/`computeMonthlyData` no devuelven `NaN` con lista vacía. |

## Funcionalidad 1 — Filtro de rango de fechas

### 1. Propósito

Permitir que el usuario limite todos los datos del dashboard y de la comparativa mediante un rango inclusivo, completo o abierto por uno de sus extremos.

### 2. Componentes

- `DashboardDateRangeFilter` (contiene los dos inputs, los textos de estado y a `AvailableDateRange`)
- `AvailableDateRange`

### 3. Props de cada componente

#### `DashboardDateRangeFilter`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `value` | `DateRangeFilter` | sí | Filtro aplicado; puede omitir una fecha o ambas. Es la fuente de los valores mostrados en los inputs. |
| `facets` | `FacetsResponse \| null` | sí | `null` mientras se cargan o si fallaron. Limita (`min`/`max` de los inputs) y contextualiza. |
| `onChange` | `(value: DateRangeFilter) => void` | sí | Se llama solo con un conjunto válido (D7, D8), con fechas `YYYY-MM-DD` y sin claves para las fechas vacías. |
| `loading` | `boolean` | sí | `true` mientras se piden facetas. |
| `applying` | `boolean` | sí | `true` mientras hay datos dependientes del filtro en carga: en Dashboard, métricas y alertas; en Comparativa, las dos consultas B2B/B2C. |
| `facetsError` | `string \| null` | sí | Error de facetas (inputs deshabilitados, D9). |
| `applyError` | `string \| null` | sí | Error al actualizar los datos filtrados. En Dashboard lo fija `DashboardPage`; en Comparativa, `BusinessComparisonContainer` (`No se pudo actualizar la comparativa para el rango seleccionado.` si fallan ambas consultas). |

Dos inputs `type="date"` con etiquetas `Fecha de inicio` y `Fecha de fin`. El borrado de un input (cadena vacía) es "fecha ausente". Los errores de validación son locales al componente (no son props).

#### `AvailableDateRange`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `minDate` | `FacetsResponse['min_date']` | sí | Primera fecha disponible, `YYYY-MM-DD`. |
| `maxDate` | `FacetsResponse['max_date']` | sí | Última fecha disponible, `YYYY-MM-DD`. |

Texto exacto: `Rango disponible: {minDate} – {maxDate}`. Se muestra siempre que haya facetas utilizables (D9).

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Inputs visibles y deshabilitados, y `Cargando rango disponible…` (mientras `loading`). Cuando `applying`, los inputs siguen **habilitados** (D7: gana la última petición) y aparece `Actualizando dashboard…`. |
| vacío | Si ambos inputs están vacíos: `Mostrando todos los datos disponibles` y las consultas se hacen sin `start_date` ni `end_date`. Si las facetas son inutilizables (D9): `No hay fechas disponibles en el dataset`, inputs deshabilitados y sin filtro. |
| error | Facetas fallidas: `No se pudo cargar el rango de fechas disponible.` con inputs deshabilitados; el dashboard sigue cargando sin filtro. Consulta filtrada fallida: `No se pudo actualizar el dashboard para el rango seleccionado.`. Ambos mensajes junto a los inputs; nunca se muestran como resultado vacío. |
| dato parcial o inválido | Solo inicio: se envía solo `start_date` y se ve `Desde {start} hasta la última fecha disponible`. Solo fin: solo `end_date` y `Desde la primera fecha disponible hasta {end}`. Ambas fechas: `Del {start} al {end}`. Inválido (no se consulta): fuera de `min_date`–`max_date` → `La fecha debe estar dentro del rango disponible.`; inicio > fin → `La fecha de inicio no puede ser posterior a la fecha de fin.` Con `aria-invalid` en el input que está fuera de rango, o en **ambos** para el error de orden. |

### 5. Decisiones aplicadas

D3, D4, D7, D8, D9, D14. `start_date`/`end_date` son opcionales e independientes. Con `type="date"` el navegador solo entrega `YYYY-MM-DD` o `""`; un valor a medias llega como vacío y se trata como fecha ausente (aceptado). El mensaje `Usa el formato YYYY-MM-DD.` **no se muestra en la UI**; la función pura de validación sí lo devuelve para valores programáticos y se prueba con test unitario. Orden de comprobaciones: formato, rango, orden; se muestra solo la primera que falle.

## Funcionalidad 2 — Tabla de alertas de anomalías

### 1. Propósito

Mostrar los períodos mensuales cuyo gasto supera, en más del umbral, la media de los tres períodos anteriores.

### 2. Componentes

- `AnomalyThresholdControl`
- `AnomalyAlertsTable`

### 3. Props de cada componente

#### `AnomalyThresholdControl`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `threshold` | `number` | sí | Umbral aplicado (inicial `0.3`). Valor inicial del input; el input guarda internamente el texto escrito aún sin aplicar (no controlado por el padre). |
| `onChange` | `(threshold: number) => void` | sí | Solo con un valor válido `0.01 ≤ x ≤ 1.0`, 300 ms después de la última edición (D7). |
| `onInvalidChange` | `(invalid: boolean) => void` | sí | Se llama cada vez que cambia la validez del texto escrito (`true` al volverse inválido, `false` al volver a ser válido). El contenedor lo pasa a `AnomalyAlertsTable.thresholdInvalid`. |

`<input type="number" min="0.01" max="1" step="0.01">` con etiqueta `Umbral de alerta`. Un campo vacío, no numérico o fuera de rango no llama a `onChange`: muestra `El umbral debe estar entre 0,01 y 1,0.` (`aria-invalid`). Mientras es inválido, el umbral aplicado (y la consulta) no cambian.

#### `AnomalyAlertsTable`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `alerts` | `RequestState<AlertsResponse>` | sí | Resultado de la consulta con el umbral y el rango aplicados. |
| `threshold` | `number` | sí | Umbral aplicado; se usa en el texto de estado vacío. |
| `thresholdInvalid` | `boolean` | sí | `true` mientras el input contiene un valor inválido. |

Las cuatro columnas (cabeceras exactas: `Período`, `Outcome registrado`, `Media de los 3 períodos anteriores`, `Incremento porcentual`):

| columna | tipo de dato | formato |
|---|---|---|
| Período | `AlertEntry['period']` | `YYYY-MM` literal. |
| Outcome registrado | `AlertEntry['outcome_total']` | Número común (D10). |
| Media de los 3 períodos anteriores | `AlertEntry['baseline_average']` | Número común. |
| Incremento porcentual | `AlertEntry['increase_ratio']` | Porcentaje común. |

La tabla se monta bajo los gráficos existentes, tiene `<caption>` `Alertas de anomalías de gasto` y ordena por `period` ascendente (el orden del backend).

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Cabecera de las cuatro columnas, filas de carga y `Cargando anomalías…`; nunca el mensaje de vacío. |
| vacío | Cuatro columnas y una fila de ancho completo `No se detectaron anomalías para el umbral {threshold}` (ej. `0,3`). Con un filtro de fechas activo se añade ` Los 3 primeros períodos del rango no se evalúan.` (D15). La tabla no desaparece. |
| error | Cuatro columnas y una fila de ancho completo `No se pudieron cargar las anomalías.`. |
| dato parcial o inválido | Todo o nada (D11): si alguna fila tiene campos ausentes, no numéricos o `period` ≠ `^\d{4}-(0[1-9]\|1[0-2])$`, solo se ve `Se recibieron datos de anomalías inválidos.` en la fila de ancho completo. Con `thresholdInvalid`: no se consulta y la fila muestra `Corrige el umbral para consultar anomalías.`; prevalece sobre cualquier otro estado. |

### 5. Decisiones aplicadas

D1 (media de exactamente 3 períodos, `>` estricto; los 3 primeros períodos nunca alertan; la UI no filtra ni recalcula), D3 (la consulta usa el filtro global), D7, D10, D11.

La UI no envía `group_by` ni `business_type`. Hasta que el backend aplique D1 el significado de `baseline_average` no coincide con la cabecera: el **frontend no debe publicarse** antes del cambio de backend.

## Funcionalidad 3 — Comparativa B2B frente a B2C

### 1. Propósito

Comparar en una vista las cinco principales categorías de ingresos y el total de ingresos de las líneas B2B y B2C para el rango seleccionado.

### 2. Componentes

- `BusinessComparisonPage`
- `BusinessTopCategoriesPanel`
- `BusinessIncomeComparisonChart`

Pestaña `Comparativa B2B vs B2C` (D5). Debajo del filtro de fechas compartido, `BusinessComparisonPage` coloca los dos `BusinessTopCategoriesPanel` en paralelo con la misma jerarquía (B2B izquierda, B2C derecha en pantallas anchas; apilados en ese orden en pantallas estrechas) y el gráfico único a todo el ancho debajo.

### 3. Props de cada componente

#### `BusinessComparisonPage`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `facets` | `FacetsResponse \| null` | sí | Para validar categorías (D6). Si es `null`, no se valida contra facetas y no se produce el estado inválido por categoría desconocida. |
| `b2b` | `RequestState<TopCategoriesResponse>` | sí | `categories/top` con `business_type: 'B2B'`, `operation_type: 'income'`, `limit: 5` y el filtro global. |
| `b2c` | `RequestState<TopCategoriesResponse>` | sí | Igual para `B2C`. |

El filtro de fechas lo pinta `App` (compartido, D3); esta página solo recibe los datos ya filtrados. Las dos peticiones son independientes y no se esperan entre sí. Con un cambio de rango, ambos estados vuelven a `loading` y se cancelan las peticiones obsoletas (D7).

#### `BusinessTopCategoriesPanel`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `businessType` | `NonNullable<TopCategoriesParams['business_type']>` | sí | `B2B` o `B2C`. |
| `state` | `RequestState<TopCategoriesResponse>` | sí | Estado de su consulta. |
| `validCategories` | `FacetsResponse['categories'] \| null` | sí | Lista global de facetas para validar (D6). |

Cabeceras exactas: `Categoría`, `Total de ingresos`, `% del total del grupo`. Cada fila: `category`, `total_amount` (formato común) y `percentage_of_group` (porcentaje común). Máximo 5 filas, orden del backend (`total_amount` descendente), sin filas de relleno.

#### `BusinessIncomeComparisonChart`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `b2bTotal` | `RequestState<number>` | sí | `group_total` B2B, o `0` si el top vino vacío; `error` si su petición falló; `loading` si está en curso. |
| `b2cTotal` | `RequestState<number>` | sí | Igual para B2C. |

El contenedor deriva `b2bTotal`/`b2cTotal` de `b2b` y `b2c` (D2): array vacío ⇒ `success` con `0`; array con datos ⇒ `group_total` de la primera entrada. Gráfico de barras (D12), una serie, dos barras `B2B` y `B2C`; eje Y con el formato común pero con `maximumFractionDigits: 0`; tooltip con el total en formato común (una barra a `0` muestra `0,00`). Muestra el total completo del grupo, no la suma del top-5.

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Layout completo: dos paneles con filas de carga independientes y debajo `Cargando comparativa de ingresos…`. |
| vacío | Top B2B vacío: el panel conserva columnas y muestra `No hay categorías de ingresos B2B para el rango seleccionado.`; análogo para B2C. Si ambos totales son `0`: el gráfico muestra `No hay ingresos B2B ni B2C para comparar en el rango seleccionado.` (sin barras). |
| error | Panel fallido: `No se pudieron cargar las categorías de ingresos B2B.` (o B2C) sin afectar al otro panel. Gráfico, si ambos totales son `error`: `No se pudo cargar la comparativa de ingresos.` |
| dato parcial o inválido | Prioridad de estados del gráfico: (1) algún total `loading` ⇒ `Cargando comparativa de ingresos…`; (2) ambos `error` ⇒ `No se pudo cargar la comparativa de ingresos.`; (3) uno `error` ⇒ mensaje incompleto; (4) ambos `0` ⇒ vacío; (5) barras. Si un total es `error` y el otro `success`: el gráfico no dibuja barras y muestra `La comparativa está incompleta: falta el total de B2B.` (o B2C); nunca un cero inventado. Un `0` real (top vacío) sí se dibuja si el otro total es mayor que 0. Panel con categoría fuera de `validCategories` (si no es `null`), `operation_type` ≠ `income`, `percentage_of_group` fuera de `0`–`100` o `total_amount`/`group_total` no numérico: solo `Se recibieron datos de categorías inválidos.` en ese panel (D11); su total en el gráfico pasa a `error`. |

### 5. Decisiones aplicadas

D2 (prerrequisito: extender `categories/top` con `percentage_of_group` y `group_total` y reflejarlo en `api-types.ts` ✅ hecho en el tipo, ❌ pendiente en backend), D3, D5, D6 (las categorías de cada grupo salen de la respuesta; las facetas solo validan), D10, D11, D12.
