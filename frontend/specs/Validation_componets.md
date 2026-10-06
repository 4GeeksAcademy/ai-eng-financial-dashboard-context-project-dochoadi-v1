# Validación de `components.md`

## Alcance

Este documento valida [components.md](./components.md) como especificación
construible, contrastándola con [api-types.ts](./api-types.ts),
[param-types.ts](./param-types.ts) y las decisiones de
[verification.md](./verification.md).

Estados usados:

- ✅ **Validado:** el requisito está descrito de forma completa y coherente
  con los contratos actuales.
- ❌ **No validado:** falta información o el contrato actual no puede
  representar lo especificado.

## 1. Cada componente tiene nombre, props y tipos de esas props

**Resultado: ✅ Validado.**

### Por qué está validado

Los siete componentes tienen un nombre en PascalCase y una tabla propia de
props con las columnas `nombre`, `tipo`, `obligatoria sí/no` y `descripción`:

- `DashboardDateRangeFilter`: 5 props.
- `AvailableDateRange`: 2 props.
- `AnomalyThresholdControl`: 4 props.
- `AnomalyAlertsTable`: 4 props.
- `BusinessComparisonPage`: 7 props.
- `BusinessTopCategoriesPanel`: 5 props.
- `BusinessIncomeComparisonChart`: 4 props.

Cada fila de esas tablas contiene un nombre y un tipo. No hay componentes
listados sin una sección de props.

### Por qué no está invalidado

No se encontró ningún componente sin nombre, sin tabla de props o con una
prop cuyo tipo estuviera en blanco. No es necesario definir interfaces
`*Props` separadas porque este documento especifica contratos, no
implementación.

## 2. Los tipos de las props existen en `api-types.ts` o `param-types.ts`

**Resultado: ❌ No validado por completo.**

### Qué sí está validado

Los tipos de dominio usados directamente por las props existen:

- En [api-types.ts](./api-types.ts): `FacetsResponse`, `AlertsResponse` y
  `TopCategoriesResponse`.
- En [param-types.ts](./param-types.ts): `DateRangeFilter`, `AlertsParams` y
  `TopCategoriesParams`.

Los accesos como `FacetsResponse['min_date']` y
`FacetsResponse['categories']` derivan de propiedades que sí existen.
`boolean`, `string`, `null`, `void`, las funciones y `NonNullable` son tipos
nativos o construcciones de TypeScript y no necesitan declararse en esos
dos archivos.

### Por qué no está validado

Las props `b2bItems` y `b2cItems` usan `TopCategoriesResponse`, pero su
descripción afirma que de esa respuesta se obtiene el total completo del
grupo. El contrato actual solo contiene una lista de `CategoryEntry`, y cada
entrada tiene `category`, `operation_type` y `total_amount`.

Además, `CategoryEntry` no contiene `percentage_of_group`; el propio archivo
lo deja como pendiente. Por ello el tipo existe por nombre, pero todavía no
puede representar todos los datos que `BusinessTopCategoriesPanel` y
`BusinessIncomeComparisonChart` necesitan.

Para validar este punto completamente hay que extender primero el endpoint
de categorías y después reflejar su forma exacta en
[api-types.ts](./api-types.ts).

## 3. Las tablas de estados no tienen celdas vacías

**Resultado: ✅ Validado.**

### Por qué está validado

Cada una de las tres funcionalidades contiene las cuatro filas exigidas:

- `cargando`
- `vacío`
- `error`
- `dato parcial o inválido`

Son 12 filas en total. Todas tienen rellenas tanto la celda del estado como
la explicación de lo que ve el usuario.

### Por qué no está invalidado

No se encontró ninguna fila sin nombre de estado ni ninguna descripción
vacía. Tampoco falta alguno de los cuatro estados en una funcionalidad.

## 4. El estado vacío de la tabla de anomalías tiene un mensaje concreto

**Resultado: ✅ Validado.**

### Por qué está validado

La especificación indica que la tabla conserva sus cuatro columnas y muestra
una fila de ancho completo con:

> No se detectaron anomalías para el umbral X

`X` se sustituye por el ratio activo, por ejemplo `0.3`. También se aclara
expresamente que la tabla no desaparece.

### Por qué no está invalidado

El estado no usa una indicación genérica como “sin datos”: define el texto
visible, dónde aparece y cómo incorpora el umbral utilizado.

## 5. Está escrito qué pasa con una sola fecha rellena

**Resultado: ✅ Validado.**

### Por qué está validado

Se especifican los dos casos posibles:

- Solo fecha inicial: se envía únicamente `start_date` y se muestra
  `Desde YYYY-MM-DD hasta la última fecha disponible`.
- Solo fecha final: se envía únicamente `end_date` y se muestra
  `Desde la primera fecha disponible hasta YYYY-MM-DD`.

También se explica que ambas fechas son opcionales e independientes, por lo
que no se obliga al usuario a completar la otra.

### Por qué no está invalidado

No se limita a decir que las fechas son opcionales: define los parámetros
enviados y el texto visible para cada filtro abierto.

## 6. Ambos paneles dicen qué muestran cuando su top-5 viene vacío

**Resultado: ✅ Validado.**

### Por qué está validado

Cada panel conserva sus columnas y tiene un mensaje independiente:

- B2B: `No hay categorías de ingresos B2B para el rango seleccionado.`
- B2C: `No hay categorías de ingresos B2C para el rango seleccionado.`

### Por qué no está invalidado

La especificación no trata ambos resultados como un único vacío global ni
oculta el layout. Permite que un panel muestre datos mientras el otro muestra
su estado vacío.

## 7. Se explica de dónde sale cada dato del gráfico comparativo

**Resultado: ✅ Validado como decisión, con implementación bloqueada por el punto 2.**

### Por qué está validado

La especificación define los dos puntos:

- `B2B`: total de todos los ingresos B2B del rango activo.
- `B2C`: total de todos los ingresos B2C del mismo rango.

También define su origen: ambos totales deben ser devueltos por
`/api/metrics/categories/top` después de extender el backend y su contrato.
El frontend no debe calcularlos sumando las filas top-5, porque esa suma
puede excluir categorías.

### Qué todavía no está validado

La API y [api-types.ts](./api-types.ts) aún no incluyen el total completo del
grupo. Por tanto, la procedencia y la regla de cálculo están claras, pero el
contrato requerido todavía no está implementado ni tiene una forma exacta
definida.

## 8. No hay código React ni JSX

**Resultado: ✅ Validado.**

### Por qué está validado

No hay imports de React, referencias a `React.*`, hooks, etiquetas JSX,
fragmentos JSX ni bloques de código TSX/JSX.

Las expresiones como `(value: DateRangeFilter) => void` describen tipos de
callbacks; son contratos TypeScript y no código React ni JSX.

### Por qué no está invalidado

El documento se limita a nombres, props, tipos, estados y decisiones de
interfaz. No contiene implementación de componentes.

## Resultado final

| Validación | Estado | Motivo resumido |
|---|---|---|
| Componentes, props y tipos | ✅ | Los 7 componentes tienen tablas de props completas. |
| Existencia y suficiencia de los tipos | ❌ | `TopCategoriesResponse` existe, pero no representa el total del grupo ni `percentage_of_group`. |
| Tablas de estados completas | ✅ | Las 3 funcionalidades tienen 4 estados sin celdas vacías. |
| Vacío de anomalías explícito | ✅ | Incluye un mensaje concreto con el umbral activo. |
| Una sola fecha rellena | ✅ | Define ambos filtros abiertos y sus textos visibles. |
| Vacío de paneles B2B y B2C | ✅ | Cada panel conserva su estructura y tiene mensaje propio. |
| Origen de datos del gráfico | ✅ con bloqueo | Deben venir de una extensión de API, no de sumar el top-5. |
| Ausencia de React y JSX | ✅ | Solo hay especificación y tipos, sin implementación. |

**Conclusión:** siete comprobaciones están especificadas correctamente. La
validación de tipos no está completa porque el contrato actual de categorías
no puede transportar el total completo de cada grupo ni el porcentaje de
cada categoría. Ese contrato debe definirse y actualizarse antes de construir
la Funcionalidad 3.
