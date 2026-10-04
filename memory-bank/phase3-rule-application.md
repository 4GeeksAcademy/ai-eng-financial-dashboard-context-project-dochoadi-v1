# Fase 3 - Activación y prueba de aplicación de reglas

Fecha: 2026-10-04. Baseline: `b5b0d39`, árbol inicialmente limpio.
Fuente: [hallazgos de fase 2](phase2-analysis.md); no existe findings.md.
Las 19 propuestas se agruparon en cinco reglas activas, no en una migración
global de comportamiento. El [borrador](archive/phase2-proposed-rules.md)
queda archivado fuera del directorio activo para evitar instrucciones
simultáneas de “draft” y “activa”.

## Reglas implementadas y trazabilidad

Todos los archivos contienen **Nombre, Alcance, Justificación, Guía
específica del proyecto**, ejemplos reales y comprobación requerida.
[AGENTS.md](../AGENTS.md) sirve de índice de descubrimiento.

| Regla activa | Propuestas de origen | Estado de aplicación |
|---|---|---|
| [backend-conventions.md](../.agents/rules/backend-conventions.md) | R01-R03, R05-R07 | Activa para cambios backend/contratos; no modifica rutas actuales. |
| [frontend-structure.md](../.agents/rules/frontend-structure.md) | R01, R03-R04, R08-R13, R15, R19 | Activa para UI/tipos/fechas/estados y cambios de texto. |
| [testing-verification.md](../.agents/rules/testing-verification.md) | R07, R14, R18 | Activa para regresiones, runners y alcance de evidencia. |
| [development-environment.md](../.agents/rules/development-environment.md) | R16-R17 | Activa para DX/env/dependencias y diagnósticos de conexión. |
| [git-workflow.md](../.agents/rules/git-workflow.md) | R12, R18 | Activa para contexto, cambios acotados y commits por fase. |

R04/R05/R08 se adoptan como guía de cambios relevantes: no se afirma que
las fechas, rangos o margen heredados hayan quedado arreglados. Moneda,
precisión, margen no definido, nuevos contratos de error, pins/strict y
producción siguen requiriendo un alcance/decisión antes de implementación.

## Prueba real con agente

Se ejecutó una tarea independiente de implementación, en modo síncrono,
con esta instrucción explícita:

> Aplica las reglas recién creadas en `.agents/rules`. Ajusta el título de
> pestaña del frontend de `frontend` a `Financial Metrics Dashboard`,
> manteniendo las entradas y el idioma actuales. Añade una regresión
> concreta del requisito y verifica el cambio con los runners existentes.

Alcance autorizado al agente: [index.html](../frontend/index.html) y un test
nuevo bajo frontend/src. Sin dependencias/config/docs, cambios de fórmulas
ni commit/push. El agente declaró lectura de AGENTS, las cinco reglas,
contexto y H16, y registró ausencia de skills locales.

Se eligió texto en lugar de un endpoint duplicado: `/health` ya existe.
La comprobación backend de esta fase prueba el endpoint existente con
TestClient dentro de sus 15 tests; **no** constituye una segunda tarea de
implementación delegada ni una nueva validación HTTP del proxy.

### Evidencia contrastada, no solo autoinforme

| Guía | Evidencia observable | Resultado |
|---|---|---|
| Frontend: diff mínimo y título coherente en inglés | `git diff -- frontend/index.html` muestra una única línea: `<title>Financial Metrics Dashboard</title>`. | ✅ |
| Frontend: preservar entradas/idioma | [index-html.test.ts](../frontend/src/index-html.test.ts) exige título exacto y único, lang=en, favicon, viewport, #root y script main. | ✅ |
| Testing: regresión en runner existente | Agente ejecutó `npm --prefix frontend test -- src/index-html.test.ts`: 1 test; comprobación posterior repitió junto con utils: 6 tests/2 archivos. | ✅ |
| Testing: salida persistente, no solo fuente | `npm --prefix frontend run build` pasó; frontend/dist/index.html contiene el título nuevo, lang/en, favicon, viewport y #root; script compilado es el esperado. | ✅ |
| Estilo/tipado | HTML mantiene formato local; test usa Vitest y APIs tipadas Node disponibles, sin modificar tsconfig ni introducir casts. Build/lint pasan. | ✅ |
| DX: sin instalaciones/cambios de dependencias | package.json/lock, requirements, Docker/Compose/Vite no cambiaron; no servidores de prueba ni instalaciones nuevas. | ✅ |
| Git: no arreglos ajenos, commit único a cargo del agente padre | Solo HTML y test cambiados por el agente; no cambios en App/gráficos/backend ni stage/commit del agente delegado. | ✅ |
| Backend | Regla leída; la tarea de texto no la ejercita como implementación. Tests existentes conservan status 200 y JSON exacto de /health. | ✅ lectura / ❓ implementación no ejercitada |
| Accesibilidad/visual, red y producción | No se ejecutó navegador ni se revisó el timeout de proxy en esta fase. El título está comprobado en archivo y build, no visualmente en pestaña real. | ❓ |

**Conclusión acotada:** el agente siguió la guía aplicable al cambio de texto
y su verificación. No se afirma cumplimiento universal de reglas de dinero,
concurrencia, filtros, cancelación, responsive o producción por esta prueba.
Las reglas no se “aplican automáticamente” por crear Markdown: AGENTS las
descubre, la tarea pide aplicarlas y el diff/tests permiten contrastarlas.

## Ajustes documentales relacionados

- README ES/EN apuntan a reglas activas y al borrador histórico.
- El análisis de fase 2 conserva hallazgos/baseline; solo añade nota de
  archivo y corrige enlace, sin convertir defectos pendientes en resueltos.
- [.env.example](../frontend/.env.example) aclara proxy exclusivo del entorno
  Docker y origen visible al navegador fuera de él; valor vacío sin cambio.
  Se corrige la ambigüedad documental H28, no el timeout ni la configuración.

## Repetición

Desde raíz:

```bash
backend/.venv/bin/python verification/phase3_rules_check.py
npm --prefix frontend test -- src/index-html.test.ts src/lib/financial-utils.test.ts
backend/.venv/bin/python -m pytest backend/tests/test_routes.py -q
npm --prefix frontend run build
npm --prefix frontend run lint
git diff --check
```

[phase3_rules_check.py](../verification/phase3_rules_check.py) comprueba cinco
archivos activos, secciones, ejemplos, referencias Hxx, cobertura de R01-R19,
índice AGENTS, archivo del borrador y enlaces locales. Es un guard estructural:
no certifica semántica de toda la prosa ni anchors o ejecución de snippets.
El test Vitest valida HTML fuente; el HTML compilado se comprueba aparte.

Persistencia: reglas, test y rastro versionados; outputs de build no se
versionan. Commit de fase 3 después de toda la comprobación, sin push.
