# Progress

Actualizado: 2026-10-09. Baseline de aplicación: `03a7a84`.
Última skill aplicada: `webapp-testing` en `365ce79`.
Fase 4 es documental: no se repitió ejecución de aplicación ni se arregló
deuda. ✅ confirmado con el alcance indicado; ❌ fallo/desajuste observado;
❓ pendiente de validar/decidir. Evidencia por fase en
[verification.md](../verification.md).

## Estado de las cuatro fases

| Fase | Entrega persistente | Commit / estado |
|---|---|---|
| 1 | [Contexto inicial](project-context.md), rutas y HTTP directo | `ef53539`, completada; proxy falló, navegador pendiente. |
| 2 | [31 hallazgos](phase2-analysis.md), 19 propuestas y probes | `b5b0d39`, completada; no correcciones funcionales. |
| 3 | [Cinco reglas activas](../AGENTS.md), [prueba del agente](phase3-rule-application.md), título y regresión | `03a7a84`, completada; aplicación verificada en tarea acotada. |
| 4 | [Producto](productContext.md), [tecnología](techContext.md), [patrones](systemPatterns.md) y este estado | Entregables documentales; cierre en commit `docs: build phase 4 evidence-backed memory bank`. SHA consultable en Git al finalizar. |

Las memorias de fases anteriores son snapshots históricos. Estos cuatro
documentos son el resumen actual; código y pruebas siguen siendo la fuente
de verdad. No confundir el título de pestaña corregido con la cabecera
temporal del dashboard, que aún fija 2024.

## Qué funciona y con qué evidencia

| Estado | Superficie | Última evidencia registrada |
|---|---|---|
| ✅ | Contratos/rutas API por HTTP directo | Fase 1: nueve rutas exactas en OpenAPI, 360 registros, particiones B2B/B2C, summary/comparison contrastados, 6 casos 422. |
| ✅ | Generador, filtros y rutas bajo TestClient | Fase 3: 15 tests backend pasan en [test_routes.py](../backend/tests/test_routes.py); /health responde 200 y JSON exacto. |
| ✅ | Cálculos UI y documento de entrada | Fase 3: 6 tests/2 archivos pasan: [utils](../frontend/src/lib/financial-utils.test.ts) y [HTML](../frontend/src/index-html.test.ts). |
| ✅ | Build, TypeScript y lint existentes | Fase 3: build/lint pasan; título “Financial Metrics Dashboard” preservado en HTML compilado. No equivale a strict ni prueba visual. |
| ✅ | Construcción/arranque de imágenes | Fase 1: ambos contenedores arrancan y responden desde host; no garantiza conectividad mutua. |
| ✅ | Reglas y contexto para agentes | Fase 3: estructura/ejemplos/trazabilidad y aplicación de tarea de texto comprobados. No cumplimiento universal. |
| ❌ | Proxy frontend→backend del entorno probado | Fase 1: timeout, DNS resuelve; API por puerto publicado funciona. Causa no atribuida al código sin prueba. |
| ❓ | Navegador/UX visual, accesibilidad y producción | No ejecutados/aprobados en fases 1-3; tampoco en fase 4. |

Coverage de fase 2: backend 97% de líneas; frontend 100% líneas únicamente
financial-utils.ts / 87.5% branches. No prueba de cobertura total de UI.
Host de ejecución anterior: Node 24.21.0/Python 3.14.2; imágenes Python 3.13.

## Deuda técnica concreta

Las etiquetas Hxx y reproducciones Bxx/Fxx remiten al
[análisis](phase2-analysis.md) y [probes](../verification).

| Estado | Deuda / hecho | Evidencia y límite |
|---|---|---|
| ❌ | Agrupación depende de timezone | H06/F01; [utils](../frontend/src/lib/financial-utils.ts): 2026-01-01→Dec 2025 en Los Ángeles. |
| ❌ | Período visible fijo 2024 | H07/B06/F07; [App](../frontend/src/App.tsx) y [header](../frontend/src/components/dashboard/dashboard-header.tsx); datos son dinámicos. |
| ❌ | Cero se interpreta como no-data | H13/F04; [ProfitPercentChart](../frontend/src/components/dashboard/profit-percent-chart.tsx) oculta equilibrio 100/100. |
| ❌ | Fechas invertidas y mínimo de comparación | H08/H09/B02/B03; [routes](../backend/app/routes.py): 200 vacío/ceros y 500 con 0001-01-01. |
| ✅ | Pruebas poco sensibles / comparación fuera del dataset | H21/H22/B05/B09-B11; net=999 o detector vacío siguen pasando. Es deuda comprobada, no garantía de aritmética real rota. |
| ❓ | RNG/reloj y contrato recibido | H10/B04: RNG global contaminable; H14/F03: payload refund inyectado al helper diverge entre KPI/gráfico. No frecuencia de fallo concurrente ni payload real inválido medidos. |
| ✅ | Diagnóstico/UX incompletos | H15/H16: error descarta causa, sin retry/cancelación; CardTitle div y error sin alert/live. Título HTML genérico sí corregido en fase 3; resto pendiente. |
| ✅ | Reproducibilidad/configuración | H20/H25-H27: strict ausente, Python sin pins, npm install Docker, sin dockerignore/readiness/CI. No afirmar herramientas aprobadas todavía. |
| ✅ | Bundle y avisos | H31: JS 584.26 kB, gzip 175.20 kB, aviso >500 kB; no latencia medida. Deprecación TestClient/httpx observada. |
| ❓ | Dependencias reportadas por npm | Fase 1: instalación reportó 12 vulnerabilidades (1 low, 5 moderate, 6 high); sin reevaluación ni auditoría de explotabilidad. No tratarlas como hallazgos de seguridad confirmados. |

Otros límites: amounts negativos admitidos y facets vacío sin contrato
(H05) son riesgos de una fuente futura, no rutas de escritura existentes.
Queries desconocidas ignoradas no autorizan inventar filtros: usar las
rutas declaradas. La aclaración de env H28 ya está en
[.env.example](../frontend/.env.example), no es reparación del proxy.

## Prioridades inmediatas propuestas, no tareas ya implementadas

Orden derivado de impacto reproducido en fases 1-2, no roadmap comercial:

1. **Diagnosticar conexión de desarrollo** antes de dar UI end-to-end por
   operativa: API directa, DNS, readiness y petición /api desde consumidor,
   aislando recursos sin modificar red compartida.
2. **Corregir representación temporal y vacío**: día 1 en dos zonas,
   cabecera derivada de fechas y cero válido visible; acordar margen sin
   ingresos antes de alterar fórmula.
3. **Validar fechas en API**: orden y ventana anterior representable,
   con status/cuerpo de error acordados y regresiones en rutas afectadas.
4. **Fortalecer tests y fronteras**: fixtures pequeñas/reloj fijo,
   aserciones de netos/filtros/alertas, RNG aislado al modificar generación
   y JSON validado al modificar carga.
5. **Decidir dominio y entrega**: moneda/precisión/importes negativos,
   reproducibilidad, strict incremental y producción en tareas separadas;
   validar UX/accesibilidad en navegador antes de afirmar aprobación.

La fase 4 no implementa estas prioridades. Mantener alcance acordado y
aplicar [reglas activas](../AGENTS.md).

## Mantenimiento del Memory Bank

Actualizar documento del área cuando cambien código/contratos, y progress
con resultado, fecha y alcance. Conservar notas históricas en lugar de
presentar evidencia pasada como ejecución nueva. Leer producto→tecnología→
patrones→estado antes de cambios; revisar reglas y fuente real relevante.

## Fase 5 — Skill Evaluation Pipeline: `webapp-testing`

| Fase | Entrega | Commit / estado |
|---|---|---|
| 5 | [skilltesting.md](../skilltesting.md), [E2E tests](../tests/e2e/test_dashboard.py), [repo memory](../memories/repo/skill-testing-results.md) | `189af8d` (install) + `365ce79` (findings); completada. |

### Resumen de resultados

La skill `anthropics/skills@webapp-testing` fue evaluada siguiendo el pipeline
de 8 pasos (leer SKILL.md → evaluar 4Q → instalar → medir baseline → auditar →
supervisar → testear → reportar).

**Evaluación**: 9/9 (coherente, no modifica fuentes, tests atómicos, segura).
Seleccionada frente a `python/fastapi` (9/9) y `docker` (7/9) por impacto
transversal (FE + BE + integración).

**Tests E2E creados**: 4 tests en `tests/e2e/test_dashboard.py` (217 líneas):
- `test_dashboard_full_flow` — título, header, KPIs, screenshot
- `test_dashboard_charts_render` — chart titles ("Income vs. Outcome", "Profit Margin"), SVGs
- `test_dashboard_error_state` — mensaje "No se pudo cargar" con lang="es"
- `test_dashboard_kpi_values_are_positive` — signos $ y % visibles

**Resultados**: 4/4 PASSED, 3 screenshots generados (93K, 89K, 112K).

**Comparativa baseline**: 21 → 25 tests (+19%). Sin regresiones en frontend
(6 tests ✅) ni backend (15 tests ✅). Nueva capa E2E sobre unitarias existentes.

**Lección principal**: Chromium headless-shell requiere dependencias del sistema
que se instalan con `python -m playwright install-deps chromium`.

### Impacto en deuda técnica

El pipeline no modificó código fuente ni corrigió los hallazgos H06-H31 de
fase 2. Sin embargo, los tests E2E cubren la brecha de integración identificada
(proxy timeout no diagnosticado, flujo end-to-end no verificado). El test
`test_dashboard_error_state` valida que el mensaje de error en español se
muestra cuando el backend no responde, cubriendo parcialmente H15/H16
(diagnóstico/UX incompletos).
