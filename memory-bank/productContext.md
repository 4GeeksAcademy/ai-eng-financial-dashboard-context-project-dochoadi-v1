# Product Context

Actualizado: 2026-10-04. Baseline contrastado: `03a7a84`.
Este documento describe el producto implementado, no una visión comercial
inventada. Estado de ejecución y pendientes en [progress.md](progress.md).

## Visión respaldada por el repositorio

Presentar una vista ejecutiva de ingresos, gastos y rentabilidad mediante
un dashboard de demostración. El [README](../README.md) lo denomina
“Financial metrics dashboard”; la [cabecera](../frontend/src/components/dashboard/dashboard-header.tsx)
usa “Financial Overview” y “Executive metrics dashboard”.
El título de pestaña actual es “Financial Metrics Dashboard” en
[index.html](../frontend/index.html), cambiado y probado en fase 3.

No hay evidencia de clientes reales, objetivos comerciales cuantificados,
roles de usuario, requisitos contables regulatorios o una integración
bancaria. No inferirlos a partir de la palabra “financial”.

## Funcionalidad real de la pantalla

[App.tsx](../frontend/src/App.tsx) compone una sola pantalla:

| Elemento | Comportamiento implementado | Evidencia |
|---|---|---|
| Cuatro KPIs | Total Income, Total Outcome, Profit y Profit Margin. | [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx) |
| Ingresos frente a gastos | Series mensuales con leyenda y tooltip de importes. | [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) |
| Margen mensual | Serie porcentual y referencia de cero. | [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx) |
| Carga | Skeletons mientras llega la petición. | [kpi-card.tsx](../frontend/src/components/dashboard/kpi-card.tsx), componentes de gráficos |
| Error | Mensaje en español; no fallback de datos ni botón de reintento. | [App.tsx](../frontend/src/App.tsx) |
| Presentación | Tema dark forzado, grids responsive definidos; texto principalmente inglés. | [App.tsx](../frontend/src/App.tsx), [CSS](../frontend/src/index.css) |

La existencia de clases responsive no equivale a prueba visual de tamaños
de pantalla. La API ofrece capacidades adicionales, pero la UI no tiene
controles de fechas, categorías o B2B/B2C ni pantallas de alertas/comparación.

## Datos y significado de los indicadores

- [routes.py](../backend/app/routes.py) genera 360 movimientos sintéticos
  por petición de métricas: 30 por mes, días 1-28, con seed=42.
- Son los doce meses anteriores al mes del reloj del servidor, no un año
  natural fijo. No son transacciones reales ni un dataset persistido.
- Cada movimiento contiene fecha, importe, `income/outcome`, categoría
  y `B2B/B2C`; no contiene divisa, identificador de cuenta o usuario.
- [financial-utils.ts](../frontend/src/lib/financial-utils.ts) calcula
  ingresos y gastos por suma; beneficio=ingresos-gastos; margen=beneficio /
  ingresos × 100, o 0 si no hay ingresos.
- UI formatea `en-US`, USD sin decimales y porcentaje con un decimal. USD
  es formato de presentación, no divisa de negocio confirmada por la API.
- La agrupación mensual omite meses sin movimientos; el orden usa año-mes.

El [fixture mock de 2024](../frontend/src/lib/mock-data.ts) no se importa
en el flujo de App y no sustituye al backend si falla.

## Capacidades exclusivas de API y límites de producto

[Router real](../backend/app/routes.py): listado general y B2B/B2C,
facets, summary día/semana/mes, top categorías, comparación del neto con
período anterior de igual duración y alertas de aumento de gastos.
Inventario y contratos en [systemPatterns.md](systemPatterns.md).

No están implementados login, creación/edición/borrado de movimientos,
importación, exportación, base de datos ni navegación multipágina.
La cabecera todavía fija “2024 - Full Year” aunque las fechas de API son
dinámicas. El gráfico de margen confunde valores válidos cero con ausencia
de datos; ambas limitaciones están reproducidas en
[análisis de fase 2](phase2-analysis.md), H07/H13.

## Funcionalidad ampliada (post-auditoría formato-financiero)

En octubre 2026 se aplicó la skill `formato-financiero` (R1–R10) al dashboard,
añadiendo 6 nuevos componentes y extendiendo los existentes. Estado post-corrección:

| Elemento nuevo | Regla origen | Comportamiento |
|----------------|-------------|----------------|
| **Cost-to-Income ratio** | R3 | Quinto KPI en `kpi-row.tsx`, con color dinámico según salud (<70% verde, 70-85% amarillo, >85% rojo) |
| **HealthStatus badge** | R1 | Indicador visual en KPI cards: "Healthy", "Warning", "Critical" con colores |
| **TrendBadge** | R1, R2, R4, R9 | Badge con TrendingUp/Down/Minus según dirección de cada KPI |
| **CategoryBreakdown** | R3, R8 | Barras de progreso por categoría income/outcome con badge "HIGH" si >70% o >60% |
| **SegmentComparison** | R7 | Tarjetas B2B/B2C con income/outcome/profit/margin y badge de concentración |
| **AlertsPanel** | R6, R10 | Lista priorizada de alertas P0–P3 con iconos y colores |
| **MonthlyProfitChart** | R5 | BarChart profit mensual con ReferenceLine en 0 (breakeven) |
| **GrowthComparison** | R9 | Comparativa tasas crecimiento income/outcome/profit con TrendBadge |
| **IncomeOutcomeChart** (ampliado) | R3, R8 | Indicador volatilidad (CV), advertencia concentración >40%, ReferenceLine promedio outcome |
| **ProfitPercentChart** (ampliado) | R4 | Custom dots rojos/verdes para cambios de margen ≥10pp |

**KPIs actuales (5)**: Total Income, Total Outcome, Profit, Profit Margin, Cost-to-Income Ratio.
**Estados adicionales en App.tsx (6)**: categoryBreakdown, segmentMetrics, trendInfo, anomalies,
growthComparison, alerts — cada uno con su propio fetch, loading y error.
**Secciones del dashboard (7)**: KPI row, Income vs Outcome chart, Profit Margin chart,
Monthly Profit chart, Category Breakdown, Segment Comparison, Alerts Panel + Growth Comparison.

**Incumplimientos no corregidos (3/33)**: Filtro de fechas (requiere API), tabla alertas umbral
(requiere API), concentración >40% mes (no aplica en datos mock). Ver `progress.md`.

## Decisiones abiertas

Confirmar moneda y precisión contable, tratamiento del margen sin ingresos
y propósito de una futura fuente de datos real antes de cambiar el dominio.
Son decisiones pendientes, no funcionalidades aprobadas.
Para contribuir, aplicar [reglas activas](../AGENTS.md); no interpretar la
documentación de deuda como permiso para arreglos fuera del alcance.
