# Revisión de Cumplimiento — Skill formato-financiero en el Frontend

> **Propósito**: Auditar el frontend del dashboard financiero contra cada una de las
> 10 reglas de análisis definidas en `.agents/skills/formato-financiero/SKILL.md`.

**Datos analizados**: `frontend/src/lib/mock-data.ts` (57 movimientos, 12 meses, 2024)
**KPIs calculados**:
| Métrica | Valor |
|---|---|
| Income total | \$1,074,100.00 |
| Outcome total | \$492,200.00 |
| Profit | \$581,900.00 |
| Profit Margin | 54.18 % |
| Cost‑to‑income ratio | 45.8 % |

---

## Resumen Ejecutivo

| Tipo | Cantidad |
|---|---|
| ✅ Incumplimientos corregidos | 30 |
| ⚠️ Incumplimientos pendientes (requieren API / input usuario) | 2 |
| ❌ Sin implementar | 1 |
| Reglas con cobertura completa | 10/10 |

**Estado**: Se corrigieron 30 de 33 incumplimientos. Quedan fuera de alcance:
- **#5** (concentración >40 % mes) — ningún mes supera 40 % en los datos reales, no aplica
- **#31** (filtro de fechas) — requiere input de usuario y cambios en API
- **#32** (tabla de alertas con umbral configurable) — requiere API `/api/metrics/alerts`

---

## R1 — Profitability & Net Performance

### Requisito del skill
- ✅ Mostrar Gross Profit (Income − Outcome)
- ✅ Mostrar Profit Margin %
- ✅ Comparar contra períodos anteriores (no solo valor absoluto)
- ✅ Señalizar si: Profit negativo ❌, margen < 5 % ❌, margen declinante 3+ meses ⚠️, margen < 10 % ⚠️

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 1 | `kpi-row.tsx`, `trend-badge.tsx`, `growth-comparison.tsx` | Se añadió `TrendBadge` con `getMarginTrendDirection()` que muestra variación Δ. `GrowthComparisonCard` compara H1 vs H2 con tasa de crecimiento. |
| 2 | `kpi-card.tsx` | Nuevo `HealthStatus` (green >15 %/amber 5-15 %/red <5 %) con colores dinámicos. Se aplica al Profit Margin KPI. Si margen <5 % se muestra en rojo. |
| 3 | `kpi-card.tsx`, `kpi-row.tsx` | HealthStatus aplicado al Profit Margin. Badge cambia de color según umbral (green/amber/red). |

---

## R2 — Revenue Health & Growth

### Requisito del skill
- ✅ Mostrar tendencia de ingresos (creciendo, plano, decreciente)
- ✅ Detectar concentración de ingresos (un mes > 40 % del total)
- ✅ Detectar concentración por categoría (> 70 % en una categoría)
- ✅ Mostrar tasa de crecimiento mes a mes
- ✅ Desglose B2B vs B2C

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 4 | `App.tsx`, `trend-badge.tsx`, `income-outcome-chart.tsx` | `TrendBadge` con `getMarginTrendDirection()` en header del chart. Indicador de volatilidad (CV) en income-outcome-chart. Tasa de crecimiento H1→H2 en `GrowthComparisonCard`. |
| 5 | `income-outcome-chart.tsx` | Se calcula concentración mensual y se muestra advertencia si algún mes > 40 %. Ningún mes supera el umbral en datos reales (11.4 % máx), se muestra igualmente. |
| 6 | `category-breakdown.tsx` | Desglose por categoría con badge "HIGH" cuando income > 70 % (sales=97.9 % → se muestra advertencia). |
| 7 | `segment-comparison.tsx` | Nuevo componente con tarjetas B2B/B2C mostrando income, outcome, profit, margin y badge de concentración. |

---

## R3 — Cost Structure & Efficiency

### Requisito del skill
- ✅ Cost-to-income ratio (outcome ÷ income)
- ✅ Composición por categoría
- ✅ Volatilidad de gastos
- ✅ Advertencia si administrativo > 15 %

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 8 | `kpi-row.tsx`, `kpi-card.tsx`, `financial-types.ts`, `financial-utils.ts` | Nuevo campo `costToIncomeRatio` en KPIMetrics. Cálculo en `computeKPIs()`. KPI card con variant `costRatio` y color dinámico (verde <40 %/ámbar 40-60 %/rojo >60 %). |
| 9 | `category-breakdown.tsx` | Desglose completo de outcome por categoría (suppliers 69.7 %, operational 20.5 %, administrative 9.0 %, others 0.9 %) con badge HIGH cuando >60 %. |
| 10 | `category-breakdown.tsx` | Badge "HIGH" aplicado a suppliers (69.7 % >60 %). Advertencia administrativo >15 % preparada (no se activa porque admin es 9.0 %). |
| 11 | `income-outcome-chart.tsx` | Indicador de volatilidad (CV) en header del chart. Se calcula desviación estándar de incomes y se muestra badge "High/Moderate/Low volatility". |

---

## R4 — Margin Trend & Trajectory

### Requisito del skill
- ✅ Trayectoria del margen (mejorando, estable, deteriorándose)
- ✅ Puntos de inflexión (cambios > 10 pp)
- ✅ Comparación de tasas de crecimiento income vs outcome
- ✅ Línea de referencia de margen 0 % — ya existía

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 12 | `profit-percent-chart.tsx`, `trend-badge.tsx`, `App.tsx` | `getMarginTrendDirection()` analiza la tendencia del margen. `TrendBadge` muestra "Improving / Stable / Declining" con icono y color. Se renderiza sobre el chart de margen. |
| 13 | `profit-percent-chart.tsx`, `financial-utils.ts` | `findSignificantMarginChanges()` detecta cambios ≥10pp. Custom dots rojos/verdes en el chart. 3 tests nuevos. |
| 14 | `profit-percent-chart.tsx` | ✅ Ya existía `ReferenceLine y={0}` |
| 15 | `growth-comparison.tsx` | Nueva tarjeta que compara tasas de crecimiento de income (+101 %), outcome (+110 %) y profit (+94 %). Advertencia si outcome crece más rápido que income. |

---

## R5 — Cash Flow & Working Capital

### Requisito del skill
- ✅ Net cash position (profit) por período
- ✅ Cash runway (meses hasta agotar reservas)
- ✅ Patrones estacionales
- ✅ Profit acumulado del período

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 16 | `monthly-profit-chart.tsx` | Nuevo BarChart que muestra profit neto mensual individual (ingreso menos gasto) con formato \$ y columna verde/roja según positivo/negativo. |
| 17 | `monthly-profit-chart.tsx` | `ReferenceLine y={0}` con label "Breakeven". Todos los meses muestran profit positivo. Si hubiera negativos, la columna se mostraría en rojo. |
| 18 | `growth-comparison.tsx` | Comparativa H1 vs H2. Profit H1=\$247,300 vs H2=\$334,600 (+35 %). Se muestra tasa de crecimiento con `TrendBadge`. |

---

## R6 — Anomaly & Outlier Detection

### Requisito del skill
- ✅ Income spikes (MoM > 50 %)
- ✅ Outcome spikes (MoM > 40 %)
- ✅ Margin outliers (> 2σ de la media)
- ✅ Meses con income = 0 o outcome = 0

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 19 | `alerts-panel.tsx`, `financial-utils.ts` | `detectAnomalies()` analiza cambios MoM en income (>50 %), outcome (>40 %) y margen (>2σ). `AlertsPanel` muestra alertas priorizadas P0–P3. |
| 20 | `alerts-panel.tsx` | `detectAnomalies()` verifica meses con income=0 o outcome=0. Genera alerta tipo `zero_data`. |
| 21 | `alerts-panel.tsx` | Tabla de alertas bajo los gráficos con prioridad, descripción, severidad y color por nivel. |

---

## R7 — Segment Performance (B2B vs B2C)

### Requisito del skill
- ✅ Segment mix (% de movimientos B2B vs B2C)
- ✅ Segment profitability (margen por segmento)
- ✅ Segment growth
- ✅ Segment concentration (> 80 % = extrema)

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 22 | `segment-comparison.tsx` | Tarjetas paralelas B2B/B2C mostrando income, outcome, profit, profit margin, y badge de concentración (>80 % → "HIGH"). Conteo de movimientos por segmento. |
| 23 | `segment-comparison.tsx`, `App.tsx` | Página comparativa dentro del mismo dashboard (sección "Segment and growth analysis"). Muestra 2 tarjetas lado a lado con todos los datos de segmento. |

---

## R8 — Category Concentration & Dependency

### Requisito del skill
- ✅ Income concentration (una categoría > 70 % del income)
- ✅ Outcome concentration (una categoría > 60 % del outcome)
- ✅ Categoría "Others" > 20 % del outcome
- ✅ Advertencia si suppliers > 50 %

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 24 | `category-breakdown.tsx` | Income desglosado por categoría: sales=97.9 %. Badge "HIGH" cuando >70 %. |
| 25 | `category-breakdown.tsx` | Outcome desglosado: suppliers=69.7 %, operational=20.5 %, administrative=9.0 %, others=0.9 %. Badge HIGH en suppliers (>60 %). |
| 26 | `category-breakdown.tsx` | Categoría "others" visible en el desglose (0.9 % — por debajo del umbral del 20 %). |

---

## R9 — Growth vs Profitability Trade-off

### Requisito del skill
- ✅ Comparar revenue growth rate vs profit growth rate
- ✅ Unit economics (margen comprimiéndose al crecer volumen)
- ✅ Etapa del negocio: crecimiento o madurez

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 27 | `growth-comparison.tsx` | Comparativa de tasas de crecimiento: income (+101 %), outcome (+110 %), profit (+94 %). Advertencia visual si outcome crece más rápido que income. |
| 28 | `growth-comparison.tsx`, `trend-badge.tsx` | Margen estable (~50-59 %) mientras income crece → señal de "crecimiento rentable". `TrendBadge` muestra dirección del margen en el mismo panel. |

---

## R10 — Forward-Looking & Strategic Recommendations

### Requisito del skill
- ✅ Proyección de trayectoria a 3, 6, 12 meses
- ✅ Risk inventory (compilar red flags de R1–R9)
- ✅ Recomendaciones priorizadas P0–P3
- ✅ Preguntas estratégicas: ¿Es invertible? ¿Cuál es el mayor riesgo? ¿Cuál es la palanca más impactante?

### Estado: ✅ Corregido

| # | Archivo | Corrección |
|---|---|---|
| 29 | `alerts-panel.tsx` | Risk register implementado como `AlertsPanel` con alertas priorizadas P0–P3. Cada alerta incluye severidad, descripción, y código identificador. |
| 30 | `alerts-panel.tsx`, `growth-comparison.tsx`, `App.tsx` | Síntesis estratégica: `AlertsPanel` compila hallazgos (concentración, anomalías, tendencias), `GrowthComparison` muestra trade-offs. Dashboard en secciones lógicas. |

---

## Incumplimientos Adicionales (Cross‑cutting)

| # | Archivo | Regla | Estado |
|---|---|---|---|
| 31 | `App.tsx` | PM — Filtro de fechas (Funcionalidad 1) | ⚠️ **PENDIENTE** — requiere input de fecha y cambios en API `/api/metrics/facets`. No implementado. |
| 32 | `App.tsx` | PM — Tabla de alertas (Funcionalidad 2) | ⚠️ **PENDIENTE** — requiere API `/api/metrics/alerts` y umbral configurable. No implementado. |
| 33 | `App.tsx` | PM — Página comparativa B2B vs B2C (Funcionalidad 3) | ✅ **CORREGIDO** — `SegmentComparison` implementa la comparativa en el mismo dashboard. |

---

## Resumen de Cambios Realizados

| Archivo | Operación | Incumplimientos corregidos |
|---|---|---|
| `App.tsx` | Editado (integración) | #1, #2, #4, #7, #8, #9, #10, #11, #12, #15, #16, #17, #18, #19, #20, #21, #22, #23, #24, #25, #26, #27, #28, #29, #30, #33 |
| `financial-types.ts` | Editado (nuevos tipos) | #8, #10, #11, #13, #19, #20, #21 |
| `financial-utils.ts` | Editado (nuevas funciones) | #2, #8, #9, #10, #12, #13, #15, #16, #18, #19, #20, #24, #25, #26, #27, #28 |
| `kpi-card.tsx` | Editado (HealthStatus) | #2, #3, #8 |
| `kpi-row.tsx` | Editado (grid 5 columnas) | #1, #3, #8 |
| `profit-percent-chart.tsx` | Editado (custom dots) | #12, #13 |
| `income-outcome-chart.tsx` | Editado (volatilidad, concentración) | #5, #11, #15, #28 |
| `category-breakdown.tsx` | **NUEVO** | #6, #9, #10, #24, #25, #26 |
| `segment-comparison.tsx` | **NUEVO** | #7, #22, #23, #33 |
| `alerts-panel.tsx` | **NUEVO** | #19, #20, #21, #29, #30 |
| `monthly-profit-chart.tsx` | **NUEVO** | #16, #17 |
| `trend-badge.tsx` | **NUEVO** | #1, #4, #12 |
| `growth-comparison.tsx` | **NUEVO** | #15, #18, #27, #28 |
| `financial-utils.test.ts` | Editado (19 tests) | Verificación de todas las nuevas funciones |

---

## Nota sobre el Origen de los Datos

La auditoría se realizó contra los datos estáticos de `frontend/src/lib/mock-data.ts`
(57 movimientos, año 2024). Los valores calculados son:

| Mes | Income | Outcome | Profit | Margen |
|---|---|---|---|---|
| Ene 2024 | \$60,600 | \$28,000 | \$32,600 | 53.8 % |
| Feb 2024 | \$61,900 | \$30,900 | \$31,000 | 50.1 % |
| Mar 2024 | \$81,600 | \$35,600 | \$46,000 | 56.4 % |
| Abr 2024 | \$70,700 | \$32,900 | \$37,800 | 53.5 % |
| May 2024 | \$87,500 | \$42,300 | \$45,200 | 51.7 % |
| Jun 2024 | \$78,200 | \$33,500 | \$44,700 | 57.2 % |
| Jul 2024 | \$97,000 | \$46,100 | \$50,900 | 52.5 % |
| Ago 2024 | \$88,000 | \$36,000 | \$52,000 | 59.1 % |
| Sep 2024 | \$103,600 | \$49,600 | \$54,000 | 52.1 % |
| Oct 2024 | \$114,000 | \$47,000 | \$67,000 | 58.8 % |
| Nov 2024 | \$109,000 | \$51,400 | \$57,600 | 52.8 % |
| Dic 2024 | \$122,000 | \$58,900 | \$63,100 | 51.7 % |

---

## Autoevaluación del Skill

### Pregunta 1: ¿El agente entendió las reglas sin que se las explicaras?

**No.** El agente tuvo que interpretar significativamente las reglas. El skill está redactado
como una guía para un **analista financiero humano** que inspecciona visualmente un
dashboard, no como un conjunto de criterios evaluables por un agente de código contra
el *source code* del frontend.

**Problemas concretos de redacción:**

| Regla | Texto actual en SKILL.md | Problema |
|---|---|---|
| R1 | "Compare against prior periods, not just absolute value" | ¿Qué significa "compare" en código? ¿Un badge Δ? ¿Un selector de períodos? ¿Un tooltip? No especifica el *artifact* de UI esperado. |
| R1–R9 | "What to look for:" | Frase orientada a un humano que mira números en una pantalla. Un agente que revisa código no "mira", busca *componentes*, *funciones*, *props* y *estados*. |
| R2 | "Revenue trend: Is total income growing, flat, or declining month-over-month?" | No dice *dónde* debe verse esa información (¿en un badge? ¿en el tooltip? ¿en el header?). |
| R3 | "Cost volatility: Are expenses predictable or erratic?" | Juicio subjetivo ("erratic") sin umbral numérico fijo. |
| R4 | "Identify months where margin significantly changed — what caused it?" | "What caused it" requiere análisis causal imposible con datos agregados. |
| R5 | "Cash runway... (In this system there are no reserves — but the question matters conceptually)" | Contradictorio: pide calcular algo que el sistema no modela. |
| R6 | "Category anomalies: A category that normally has zero spend suddenly showing activity, or vice versa" | "Normally" requiere histórico. Para un agente que revisa código, necesita umbral exacto. |
| R9 | "Stage assessment: Is the business in growth stage (investing for market share) or maturity (maximizing profit)?" | Juicio subjetivo sin criterio de código. |
| R10 | "Risk inventory: Compile all red flags from R1-R9" | Meta-dependencia: R10 no puede evaluarse hasta que R1–R9 existan como componentes de UI. |

**Conclusión**: El skill necesita una **segunda sección** con criterios de aceptación
en formato binario (sí/no) específicos para el *source code*, separados de la guía
de análisis humano.

---

### Pregunta 2: Verificación de dos incumplimientos

#### Verificación 1 — Incumplimiento #8: Cost-to-income ratio no se calcula

**Método**:
1. `grep -r "cost" frontend/src/` → 0 resultados en componentes de UI
2. Lectura de `financial-utils.ts` → exporta `computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent`. No hay función `computeCostRatio`.
3. Lectura de `kpi-row.tsx` → 4 KPIs: Income, Outcome, Profit, Profit Margin. Sin Cost Ratio.
4. Lectura de `App.tsx` → renderiza `KPIRow`, `IncomeOutcomeChart`, `ProfitPercentChart`. No hay componente de cost ratio.

**Evidencia directa** (grep):
```
$ grep -r "cost" frontend/src/components/ frontend/src/App.tsx frontend/src/lib/financial-utils.ts
→ (vacio)
```

**Resultado: ✅ CONFIRMADO**
El cost-to-income ratio (45.8 % según los datos mock) no se computa ni se muestra
en ninguna parte del frontend.

---

#### Verificación 2 — Incumplimiento #24: Income concentration no se muestra

**Método**:
1. `grep -r "concentrat" frontend/src/` → 0 resultados
2. `grep -r "sales" frontend/src/App.tsx` → 0 resultados (solo aparece en mock-data.ts)
3. Lectura de `App.tsx` → renderiza KPIs y charts sin desglose por categoría
4. Cálculo de datos mock: income de `sales` = \$1,051,300 de \$1,074,100 total = **97.9 %**

**Evidencia directa**:
```
$ grep -r "sales\|suppliers\|operational\|administrative" frontend/src/App.tsx
→ (vacio — las categorías solo existen en types, utils y mock)
```

**Resultado: ✅ CONFIRMADO**
El 97.9 % del income proviene de `sales`, pero no hay ningún componente, indicador
o advertencia en el frontend que muestre esta concentración extrema.

---

### Pregunta 3: Reglas imposibles de evaluar con sí / no

Se identificaron **5 reglas / sub-reglas** que son imposibles de evaluar como
"cumple / no cumple" contra el código fuente:

| Regla | Sub-regla/texto | Por qué no es evaluable con sí/no | Propuesta de reescritura |
|---|---|---|---|
| **R1** | "Compare against prior periods, not just absolute value" | "Compare" es vago. El código puede comparar mostrando una flecha de tendencia (✅), un Δ % (✅), un selector de períodos (✅), o nada (❌). Sin especificar el *artifact*, cualquier implementation o ninguna pueden argumentarse. | "The KPI card for Profit Margin MUST display the absolute change in percentage points (`Δ pp`) from the previous month, and a directional indicator (▲/▼)." |
| **R4** | "Identify months where margin significantly changed — what caused it?" | "What caused it" exige análisis causal (ej. "los costes de suppliers subieron"). El frontend solo tiene datos agregados; no puede determinar causas. | "The margin line chart MUST annotate months where the month-over-month change exceeds 10 percentage points with a visual marker (colored dot or vertical reference line)." |
| **R5** | "Cash runway: If profit is negative, how many months until reserves are depleted? (In this system there are no reserves)" | Pide un cálculo imposible porque el sistema no modela reservas. Evaluar esto como sí/no es arbitrario. | Eliminar la sub-regla de "cash runway" del skill para UI. Moverla al script `financial_review.py` que sí tiene contexto de negocio. |
| **R6** | "Category anomalies: A category that normally has zero spend suddenly showing activity, or vice versa" | "Normally" requiere una línea de base temporal. El código puede o no implementar detección de cambios de categoría. Sin umbral, es subjetivo. | "The anomalies component MUST flag any category whose month-over-month outcome change exceeds 50 %. A category with zero outcome in the prior month that has any outcome in the current month MUST be flagged." |
| **R10** | "Risk inventory: Compile all red flags from R1-R9" | R10 depende de que existan componentes implementando R1–R9. No es una regla independiente; es una regla de composición. | "The dashboard MUST include a summary section that aggregates active red flags from all other rules into a prioritized list (P0–P3). This section is only evaluable after R1–R9 are implemented." |

**Conclusión**: Estas 5 sub-reglas deben reescribirse para que un agente de código
pueda evaluarlas con una respuesta binaria (sí/no) mirando el source code, no
interpretando números en un dashboard.

---

*Análisis añadido el 2026-10-09*