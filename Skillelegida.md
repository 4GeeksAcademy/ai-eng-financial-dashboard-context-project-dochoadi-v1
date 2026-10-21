# Skill elegida

## 1. Exploración

Búsquedas reales ejecutadas el 2026-10-21 con `npx skills find <topic>`
(CLI `skills@1.7.4`). Se muestran los resultados relevantes para este stack
(React 19 + Vite, FastAPI, Vitest/pytest); el resto (Go, Flutter, Expo,
Swift, marketing, GSAP, Supabase/Convex) no aplica.

### `npx skills find testing`

| Resultado | Installs | ¿Aplica al proyecto? |
|---|---|---|
| `anthropics/skills@webapp-testing` | 183.8K | ✅ **Elegida.** Playwright E2E sobre la app real: cubre el flujo FE+BE+proxy no verificado. |
| `wshobson/agents@e2e-testing-patterns` | 24.2K | ⚠️ Patrones E2E genéricos; sin scripts para levantar servidores como `webapp-testing`. |
| `wshobson/agents@python-testing-patterns` | 36.6K | ⚠️ Solo backend pytest (ya 97% cobertura de líneas). |
| `mattpocock/skills@tdd` | 1.1M | ⚠️ Metodología, no aborda la deuda concreta H21/H22. |
| `vercel-labs/agent-browser@agent-browser` | 1.1M | ❌ Automatización de navegador genérica, no testing del repo. |
| `golang-testing`, `flutter-*`, `limrun-*`, `clerk-testing` | — | ❌ Otro stack. |

### `npx skills find performance`

| Resultado | Installs | ¿Aplica al proyecto? |
|---|---|---|
| `vercel-labs/agent-skills@vercel-react-best-practices` | 823.6K | ✅ Ya aplicada (skill asignada). |
| `addyosmani/web-quality-skills@performance` | 40.5K | ⚠️ Útil para el aviso de bundle >500 kB (H31), pero exige medir antes de optimizar. |
| `cloudflare/skills@web-perf` | 105.8K | ⚠️ Orientada a despliegue en Cloudflare; no hay entorno de producción. |
| `currents-dev/...@playwright-best-practices` | 96.9K | ⚠️ Complemento de `webapp-testing`, no necesario para 4 tests. |
| `vercel-labs/agent-skills@vercel-optimize` | 105.6K | ❌ Específica de despliegues Vercel/Next; frontend es Vite. |
| `supabase-*`, `convex-*`, `golang-*`, `gsap-*`, `write-swift` | — | ❌ Otro stack. |

## 2. Tres candidatas — criterios de selección

Evalúo las tres candidatas con más potencial para este proyecto concreto,
puntuando cada criterio del 1 (peor) al 3 (mejor).

| Candidata | ¿Aplica a mi dashboard? | ¿Fuente confiable? | ¿Puedo verificar el resultado? | **Total** |
|---|---|---|---|---|
| **testing** | ⭐⭐⭐ Tests existentes frágiles (H21/H22), cobertura mejorable, ya hay infraestructura Vitest+pytest lista. | ⭐⭐⭐ Repositorios oficiales + comunidad contrastada. | ⭐⭐⭐ `vitest run --coverage`, `pytest --cov`, diff de aserciones. | **9/9** |
| **python/fastapi** | ⭐⭐⭐ Backend completo. Skills cubrirían generación, filtros, Pydantic, errores HTTP. | ⭐⭐⭐ FastAPI oficial, PyPa, realpython. | ⭐⭐⭐ Pytest pasa, HTTPX contracts, OpenAPI schema. | **9/9** |
| **docker** | ⭐⭐ Docker usado pero skill es estrecho: Dockerfile+Compose. No cubre código de aplicación. | ⭐⭐ Docker oficial, pero hay menos skills consolidados que para testing. | ⭐⭐ Se ve en build/output, pero es binario (build sí/no). | **7/9** |

### Desempate

`testing` y `python/fastapi` empatan a 9. La decisión se inclina por:

### Elegida: **testing**

**Por qué testing y no las otras dos:**

1. **Sobre python/fastapi**: El backend es funcionalmente simple (generador + 9 rutas GET, sin base de datos, sin auth, sin escritura). Una skill de FastAPI aportaría buenas prácticas pero sobre un código que ya es correcto y tiene 97% de cobertura de líneas. El impacto marginal es bajo. En cambio, testing tiene deuda concreta documentada (H21/H22: aserciones poco sensibles, H10: RNG contaminable, H14: divergencia entre rutas de cálculo) y beneficiaría **ambas** capas (frontend y backend) al mismo tiempo.

2. **Sobre docker**: Docker es infraestructura, no lógica de aplicación. Una skill de Docker mejoraría el Dockerfile y compose, pero no tocaría una línea de código de las skill existentes (react-best-practices, accessibility). Testing en cambio **complementa directamente** las dos skills ya instaladas: accessibility audita la UI, react optimiza el rendimiento, testing asegura que ambas sigan funcionando tras cambios.

3. **Impacto transversal**: Una skill de testing serviría tanto para los tests de Vitest (frontend, TypeScript/React) como para los de pytest (backend, Python). Las skills de python/fastapi solo cubren backend; docker solo cubre infraestructura. Testing cubre frontend + backend + integración, que es exactamente donde están los problemas diagnosticados (proxy caído, flujo end-to-end no verificado, aserciones que pasan con datos incorrectos).

---

## 3. Resultado de la Implementación

La skill `anthropics/skills@webapp-testing` fue instalada, evaluada y aplicada
siguiendo el pipeline completo de 8 pasos. Ver [`skilltesting.md`](skilltesting.md)
para el informe detallado.

### Ejecución resumida

| Paso | Estado | Detalle |
|------|--------|---------|
| 1. Leer SKILL.md | ✅ | 3.9 KB, Apache 2.0, patrón "reconnaissance-then-action" |
| 2. Evaluar (4Q) | ✅ | 9/9 — coherente, no modifica fuentes, tests atómicos, segura |
| 3. Instalar | ✅ | Commit `189af8d` (10 files, +805 lines) |
| 4. Medir baseline | ✅ | FE: 6 tests ✅; BE: 15 tests ✅ |
| 5. Auditar | ✅ | 8 archivos revisados, brecha E2E identificada |
| 6. Supervisar (✅/❌/❓) | ✅ | 4 reglas aplicadas, 0 ❌, 0 ❓ |
| 7. Testear y comparar | ✅ | 4 tests E2E creados, **4/4 PASSED** |
| 8. Reportar | ✅ | `skilltesting.md` generado |

### Tests E2E creados

```python
tests/e2e/test_dashboard.py  # 217 líneas, 8105 bytes
```

| Test | Estado | Screenshot |
|------|--------|------------|
| `test_dashboard_full_flow` | ✅ PASSED | `/tmp/e2e_dashboard_full.png` (93 KB) |
| `test_dashboard_charts_render` | ✅ PASSED | `/tmp/e2e_charts_rendered.png` (89 KB) |
| `test_dashboard_error_state` | ✅ PASSED | `/tmp/e2e_error_state.png` (112 KB) |
| `test_dashboard_kpi_values_are_positive` | ✅ PASSED | — |

### Impacto

- **Tests totales**: 21 → **25** (+19%)
- **Capas de testing**: Unit FE + Unit BE → **+ E2E**
- **Regresiones**: 0 (frontend 6/6 ✅, backend 15/15 ✅)
- **Commits**: `189af8d` (install) + `365ce79` (findings)
- **Rama**: `feature/agent-skills` (syncronizada con `origin`)

---

*Documentado el 2026-10-09. Pipeline ejecutado completamente sobre la skill
`anthropics/skills@webapp-testing`.*

---

## 4. Skill interna: `formato-financiero`

**Versión actual (2026-10-21)**: [.skills/formato-financiero/SKILL.md](.skills/formato-financiero/SKILL.md).

La primera versión (`00e9c37`) era un manual genérico de análisis financiero
(10 reglas de analista, scripts Python, benchmarks de industria) y su
aplicación añadió seis componentes nuevos. Tras la revisión del instructor se
retiraron esos componentes (`a8959cd`) y la skill se reescribió (`814c728`)
para cubrir un hueco propio de este repo que las skills de la comunidad no
cubren: **cómo se calculan y formatean las cifras en este dashboard**.

- **Objetivo**: un único cálculo y un único formateador por cifra visible.
- **Entradas**: diff/tarea + `financial-utils.ts`, `financial-types.ts`,
  `routes.py` y hallazgos H06/H11/H13.
- **Salida**: tabla `archivo:línea | regla | estado | acción` + diff mínimo
  + resultado de build/test/lint.
- **Criterios de aceptación**: sin formato inline salvo ejes, texto visible
  idéntico, ningún componente nuevo, build/test/lint en verde.
- **Prueba en tarea real**: la regla F2 detectó `value.toFixed(1)%` en
  `ProfitPercentTooltip`; se sustituyó por `formatPercent(value)`.
