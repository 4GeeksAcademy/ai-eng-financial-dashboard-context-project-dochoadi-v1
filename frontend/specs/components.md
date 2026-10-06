# Especificación de componentes

## Funcionalidad 1 — Filtro de rango de fechas

### 1. Propósito

Permitir que el usuario limite todos los datos del dashboard principal mediante un rango inclusivo, completo o abierto por uno de sus extremos.

### 2. Componentes

- `DashboardDateRangeFilter`
- `AvailableDateRange`

### 3. Props de cada componente

#### `DashboardDateRangeFilter`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `value` | `DateRangeFilter` | sí | Valor actual del filtro; puede omitir una fecha o ambas. |
| `facets` | `FacetsResponse \| null` | sí | Facetas usadas para limitar y contextualizar los inputs; es `null` mientras no haya una respuesta disponible. |
| `onChange` | `(value: DateRangeFilter) => void` | sí | Comunica un rango válido en formato `YYYY-MM-DD`; el consumidor vuelve a consultar todos los datos visibles del dashboard. |
| `loading` | `boolean` | sí | Indica que se están obteniendo las facetas o aplicando el filtro. |
| `error` | `string \| null` | sí | Mensaje diagnosticable cuando no se pueden obtener las facetas o aplicar el filtro. |

#### `AvailableDateRange`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `minDate` | `FacetsResponse['min_date']` | sí | Primera fecha disponible, en formato `YYYY-MM-DD`. |
| `maxDate` | `FacetsResponse['max_date']` | sí | Última fecha disponible, en formato `YYYY-MM-DD`. |

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Los dos inputs permanecen visibles y deshabilitados, y junto a ellos aparece `Cargando rango disponible…`. Al aplicar un filtro aparece `Actualizando dashboard…` hasta que todos los datos dependientes terminen de cargarse. |
| vacío | Si ambos inputs están vacíos, ve `Mostrando todos los datos disponibles` y el dashboard consulta sin `start_date` ni `end_date`. Si las facetas no contienen un rango utilizable, ve `No hay fechas disponibles en el dataset` y no puede aplicar el filtro. |
| error | Ve `No se pudo cargar el rango de fechas disponible.` si fallan las facetas, o `No se pudo actualizar el dashboard para el rango seleccionado.` si falla la consulta filtrada; el mensaje se muestra cerca de los inputs y no se presenta el fallo como un resultado vacío. |
| dato parcial o inválido | Si solo está rellena la fecha inicial, se envía únicamente `start_date` y ve `Desde YYYY-MM-DD hasta la última fecha disponible`. Si solo está rellena la fecha final, se envía únicamente `end_date` y ve `Desde la primera fecha disponible hasta YYYY-MM-DD`. Si una fecha no respeta `YYYY-MM-DD`, queda fuera de `min_date`–`max_date` o el inicio es posterior al fin, no se realiza la consulta y ve respectivamente `Usa el formato YYYY-MM-DD.`, `La fecha debe estar dentro del rango disponible.` o `La fecha de inicio no puede ser posterior a la fecha de fin.` |

El rango de referencia se muestra siempre que existan facetas con el texto exacto `Rango disponible: min_date – max_date`, sustituyendo ambos nombres por los valores de `FacetsResponse`.

### 5. Decisiones aplicadas (de verification.md)

- `min_date` y `max_date` son campos obligatorios de `FacetsResponse` y se presentan como fechas `YYYY-MM-DD`.
- `start_date` y `end_date` son parámetros opcionales e independientes; por ello una sola fecha rellena produce un filtro abierto y no obliga a completar la otra.
- No existe una decisión adicional en `verification.md` que cambie el contrato de fechas; la validación de formato y orden evita enviar entradas inválidas como si fueran un estado vacío.

## Funcionalidad 2 — Tabla de alertas de anomalías

### 1. Propósito

Mostrar los períodos cuyo gasto supera la media móvil de los tres períodos anteriores según un umbral configurable.

### 2. Componentes

- `AnomalyThresholdControl`
- `AnomalyAlertsTable`

### 3. Props de cada componente

#### `AnomalyThresholdControl`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `params` | `AlertsParams` | sí | Contiene el umbral actual y el rango compartido con la Funcionalidad 1. |
| `onChange` | `(params: AlertsParams) => void` | sí | Comunica parámetros válidos; el umbral inicial es `0.3`. |
| `disabled` | `boolean` | no | Impide cambios mientras se aplica una consulta. |
| `validationError` | `string \| null` | no | Explica por qué el valor no puede enviarse. |

#### `AnomalyAlertsTable`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `alerts` | `AlertsResponse` | sí | Filas devueltas para el umbral y rango activos. |
| `params` | `AlertsParams` | sí | Permite mostrar el umbral y el rango que originaron las filas. |
| `loading` | `boolean` | sí | Indica que se está consultando la lista de alertas. |
| `error` | `string \| null` | sí | Mensaje diagnosticable de la consulta de alertas. |

Las cuatro columnas son:

| columna | tipo de dato | formato de visualización |
|---|---|---|
| Período | `AlertEntry['period']` (`string`) | Valor mensual `YYYY-MM`, sin reinterpretarlo mediante zona horaria. |
| Outcome registrado | `AlertEntry['outcome_total']` (`number`) | Número con separador de miles y dos decimales; no se añade símbolo de moneda porque el contrato no declara divisa. |
| Media de los 3 períodos anteriores | `AlertEntry['baseline_average']` (`number`) | Número con separador de miles y dos decimales. |
| Incremento porcentual | `AlertEntry['increase_ratio']` (`number`) | Ratio convertido a porcentaje con dos decimales; por ejemplo, `1.0201` se muestra como `102,01 %`. |

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Ve el encabezado de las cuatro columnas y filas de carga, junto al texto `Cargando anomalías…`; no ve el mensaje de estado vacío durante la petición. |
| vacío | Ve las cuatro columnas y una fila que ocupa todo el ancho con `No se detectaron anomalías para el umbral X`, donde `X` es el ratio activo, por ejemplo `0.3`. La tabla no desaparece. |
| error | Ve las cuatro columnas y una fila que ocupa todo el ancho con `No se pudieron cargar las anomalías.`; no se sustituye el error por una lista vacía. |
| dato parcial o inválido | Una fila con campos ausentes, no numéricos o con `period` distinto del formato esperado no se presenta como válida: en su lugar la tabla muestra `Se recibieron datos de anomalías inválidos.`. Si `threshold` está fuera de `0.01`–`1.0`, no se realiza la consulta, el input muestra `El umbral debe estar entre 0,01 y 1,0.` y el área de la tabla muestra `Corrige el umbral para consultar anomalías.` |

### 5. Decisiones aplicadas (de verification.md)

- `baseline_average` debe calcularse en el backend como una media móvil de exactamente los tres períodos anteriores.
- Aunque la API verificada admite `threshold >= 0` y no declara máximo, la interfaz aplica el requisito del PM `0.01`–`1.0`; el valor por defecto es `0.3`.
- `period`, `outcome_total`, `baseline_average` e `increase_ratio` son obligatorios en cada `AlertEntry`; el ratio se convierte a porcentaje solo para su presentación.
- `start_date` y `end_date` de `AlertsParams` mantienen la tabla sincronizada con el filtro de la Funcionalidad 1.

## Funcionalidad 3 — Comparativa B2B frente a B2C

### 1. Propósito

Comparar en una sola vista las principales categorías y el total de ingresos de las líneas B2B y B2C para el rango seleccionado.

### 2. Componentes

- `BusinessComparisonPage`
- `BusinessTopCategoriesPanel`
- `BusinessIncomeComparisonChart`

`BusinessComparisonPage` dispone los dos `BusinessTopCategoriesPanel` en paneles paralelos de igual jerarquía: B2B a la izquierda y B2C a la derecha en espacio suficiente, y apilados conservando ese orden en pantallas estrechas; el gráfico único ocupa todo el ancho debajo de ambos.

### 3. Props de cada componente

#### `BusinessComparisonPage`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `params` | `DateRangeFilter` | sí | Rango inclusivo compartido por las consultas B2B y B2C. |
| `onParamsChange` | `(params: DateRangeFilter) => void` | sí | Aplica el rango seleccionado a ambas consultas de categorías y al gráfico comparativo. |
| `facets` | `FacetsResponse` | sí | Proporciona las líneas de negocio, las categorías disponibles y el rango válido. |
| `b2bCategories` | `TopCategoriesResponse` | sí | Top de ingresos solicitado con `business_type: 'B2B'`, `operation_type: 'income'` y `limit: 5`. |
| `b2cCategories` | `TopCategoriesResponse` | sí | Top de ingresos solicitado con `business_type: 'B2C'`, `operation_type: 'income'` y `limit: 5`. |
| `loading` | `boolean` | sí | Indica que una o ambas consultas están en curso. |
| `error` | `string \| null` | sí | Error global de facetas o del rango comparativo. |

#### `BusinessTopCategoriesPanel`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `businessType` | `NonNullable<TopCategoriesParams['business_type']>` | sí | Identifica el panel como `B2B` o `B2C`; nunca se deja sin valor al usar este componente. |
| `items` | `TopCategoriesResponse` | sí | Hasta cinco categorías de ingresos ordenadas por `total_amount` descendente. |
| `availableCategories` | `FacetsResponse['categories']` | sí | Categorías válidas obtenidas de facetas. |
| `loading` | `boolean` | sí | Estado de carga independiente del panel. |
| `error` | `string \| null` | sí | Error independiente de la consulta de esta línea de negocio. |

Cada fila muestra `CategoryEntry['category']`, `CategoryEntry['total_amount']` con separador de miles y dos decimales, y el porcentaje sobre el total del grupo con dos decimales. La decisión de `verification.md` exige extender la respuesta y `CategoryEntry` para tipar ese porcentaje y el total del grupo antes de implementar el componente; no deben calcularse usando solo la suma del top-5, porque esa suma puede excluir categorías del grupo.

#### `BusinessIncomeComparisonChart`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `b2bItems` | `TopCategoriesResponse` | sí | Respuesta B2B extendida de la que se obtiene el total completo del grupo. |
| `b2cItems` | `TopCategoriesResponse` | sí | Respuesta B2C extendida de la que se obtiene el total completo del grupo. |
| `loading` | `boolean` | sí | Indica que todavía no están disponibles ambos totales. |
| `error` | `string \| null` | sí | Error que impide comparar los totales. |

El gráfico muestra una única serie con dos puntos de datos: `B2B`, que representa el total de todos los ingresos B2B del rango activo, y `B2C`, que representa el total de todos los ingresos B2C del mismo rango. No representa el número de categorías ni únicamente la suma visual de las filas top-5.

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Ve el layout completo: dos paneles paralelos con filas de carga independientes y, debajo, el área del gráfico con `Cargando comparativa de ingresos…`. |
| vacío | Si el top-5 B2B está vacío, el panel izquierdo conserva sus columnas y muestra `No hay categorías de ingresos B2B para el rango seleccionado.`. Si el top-5 B2C está vacío, el panel derecho conserva sus columnas y muestra `No hay categorías de ingresos B2C para el rango seleccionado.`. Si ambos totales son cero o no existen datos de ingresos en ninguno de los grupos, el gráfico muestra `No hay ingresos B2B ni B2C para comparar en el rango seleccionado.` |
| error | Cada panel que falle muestra `No se pudieron cargar las categorías de ingresos B2B.` o `No se pudieron cargar las categorías de ingresos B2C.` sin ocultar el otro panel. Si no se dispone de un total fiable para alguno de los grupos, el gráfico muestra `No se pudo cargar la comparativa de ingresos.` |
| dato parcial o inválido | Si solo una lista está disponible, ese panel renderiza sus filas y el otro conserva su mensaje de error o vacío; el gráfico no inventa un valor cero para el grupo ausente y muestra `La comparativa está incompleta: falta el total de B2B.` o `La comparativa está incompleta: falta el total de B2C.`. Una categoría fuera de `FacetsResponse['categories']`, un `operation_type` distinto de `income`, un porcentaje fuera de `0`–`100` o un total no numérico produce `Se recibieron datos de categorías inválidos.` en el panel afectado. |

### 5. Decisiones aplicadas (de verification.md)

- `/api/metrics/categories/top` debe extenderse para devolver el total completo del grupo y el porcentaje de cada categoría sobre ese total.
- El contrato y `CategoryEntry` actuales todavía no incluyen `percentage_of_group`; la extensión del backend y de `api-types.ts` es un prerrequisito explícito, no un dato que el frontend pueda suponer.
- Las consultas usan `operation_type: 'income'`, `limit: 5` y un `business_type` distinto para B2B y B2C, respetando los valores verificados de `TopCategoriesParams`.
- Las categorías válidas se obtienen de `FacetsResponse['categories']`; cada panel puede mostrar menos de cinco filas cuando la API devuelve menos resultados, sin rellenar categorías ficticias.
