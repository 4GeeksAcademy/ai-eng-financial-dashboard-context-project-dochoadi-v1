---
name: formato-financiero
description: Revisa y corrige cómo este dashboard calcula y muestra importes, porcentajes y meses (frontend React/Vite + API FastAPI de este repo). Úsala al tocar KPIs, gráficos, tooltips o helpers de lib/financial-utils.ts. No añade métricas, componentes ni secciones.
---

# formato-financiero (skill interna del repo)

## Objetivo

Que toda cifra visible del dashboard salga de **un único cálculo** y de **un
único formateador** de este repo, con el mismo resultado en KPIs, ejes y
tooltips, sin romper los contratos ni los errores conocidos ya documentados.
Mejora lo que existe: **nunca** crea KPIs, componentes, secciones ni análisis
financieros nuevos.

## Entradas

- La tarea o el diff a revisar (archivos de `frontend/src`).
- Fuentes de verdad de este repo:
  - [financial-utils.ts](../../frontend/src/lib/financial-utils.ts): fórmulas y formateadores.
  - [financial-types.ts](../../frontend/src/lib/financial-types.ts): tipos JSON (snake_case) y derivados (camelCase).
  - [routes.py](../../backend/app/routes.py): redondeo y fórmulas del backend.
  - [phase2-analysis.md](../../memory-bank/phase2-analysis.md): hallazgos H06, H11, H13.

## Reglas de este repo

| # | Regla | Dónde se ve hoy |
|---|---|---|
| F1 | Importes en UI con `formatCurrency` (USD, `en-US`, 0 decimales, formateador cacheado a nivel de módulo). No crear `Intl.NumberFormat` dentro de componentes. | `kpi-row.tsx`, `IncomeOutcomeTooltip` |
| F2 | Porcentajes en UI con `formatPercent` (1 decimal). No `value.toFixed(1)}%` inline. | `kpi-row.tsx`, `ProfitPercentTooltip` (corregido al validar la skill) |
| F3 | Ejes compactos son la única excepción permitida: `$Nk` en Income/Outcome y `N%` entero en Profit Margin. No copiarlos a tooltips ni KPIs. | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` |
| F4 | Fórmulas solo en `financial-utils.ts`: `profit = income - outcome`; `profitPercent = income > 0 ? profit / income * 100 : 0`. No recalcular en componentes. | `computeKPIs`, `computeMonthlyData` |
| F5 | Proporciones del backend no son porcentajes: `increase_ratio` es ratio (0.25 = 25 %), `delta_pct` ya viene ×100 y puede ser `null` cuando el periodo previo es 0. Multiplicar ×100 solo `increase_ratio` y mostrar `—` para `null`. | `routes.py` L229-L236, L330-L332 |
| F6 | Redondeo: el backend redondea importes a 2 decimales, ratios a 4; `computeAnomalyAlerts` replica ese redondeo con `roundTo`. La UI muestra USD sin decimales (H11): no comparar con `===` importes UI vs API. | `roundTo`, `summarize_movements` |
| F7 | Meses: etiqueta `"MMM YYYY"` en `en-US` vía `formatMonthYearLabel`. `new Date("YYYY-MM-DD")` es UTC y los getters son locales: el día 1 puede caer en el mes anterior (H06). Si tocas fechas, prueba día 1 en UTC y `America/Los_Angeles`. | `computeMonthlyData` |
| F8 | Cero ≠ sin datos (H13). `ProfitPercentChart` usa `some(profitPercent !== 0)` y oculta un 0 % válido. No copiar ese patrón; no arreglarlo de paso sin tarea propia. | `profit-percent-chart.tsx` |
| F9 | Valores no cargados se muestran como `'—'` (no `$0`, no `0.0%`). | `kpi-row.tsx` |

## Procedimiento

1. Busca formato inline en el área tocada:
   `grep -rn "toFixed\|Intl\.\|toLocale" frontend/src --include=*.tsx`.
2. Clasifica cada resultado con F1-F9: correcto, excepción F3 o desviación.
3. Corrige solo desviaciones del área de la tarea con el helper existente.
   Si falta un helper, añádelo en `financial-utils.ts` con su test, no en el componente.
4. Si el cambio toca H06/H13 o fórmulas, deténte y regístralo como pendiente
   en `memory-bank/progress.md` salvo que la tarea lo pida explícitamente.
5. Verifica (ver criterios).

## Salida esperada

Tabla breve `archivo:línea | regla | estado (✅/❌/excepción) | acción`, el
diff mínimo de las desviaciones corregidas y el resultado de los comandos de
verificación. Si no hay desviaciones, decirlo sin generar cambios.

## Criterios de aceptación

- [ ] Ningún componente de `components/dashboard` formatea importes o porcentajes
      inline salvo los ejes de F3.
- [ ] El texto visible es idéntico antes y después para el mismo valor
      (p. ej. `15.555 → "15.6%"`, `1234.56 → "$1,235"`).
- [ ] Ningún componente, KPI ni sección nuevos en el diff.
- [ ] `cd frontend && npm run build && npm test && npm run lint` pasan; el
      único aviso admitido es el preexistente de bundle > 500 kB (H31).
- [ ] Commit con mensaje que cita la skill y la regla, p. ej.
      `refactor(format): use formatPercent in tooltip (formato-financiero F2)`.
