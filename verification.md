# Rastro de verificación

## Fase 1 - Contexto y mapa del proyecto

- Fecha: 2026-10-04. Baseline: `954f812`, rama `main`, árbol inicialmente limpio.
- Entregable: [contexto, servicios, entradas, rutas y ejecución](memory-bank/project-context.md).
- Cambios: documentación; sin modificaciones de comportamiento ni dependencias.
- Commit dedicado: `docs: document phase 1 project context and verification`.
  Su SHA se consulta en Git; no se incluye en el propio commit.

| Estado | Comprobación | Resultado |
|---|---|---|
| ✅ | Lectura de entradas, componentes, modelos, rutas, Docker y tests | Resumen enlazado al código; sin DB, login ni integración financiera real. |
| ✅ | `backend/.venv/bin/python -m pytest backend/tests/test_routes.py -q` | 15 passed. |
| ✅ | `npm --prefix frontend test` | 5 passed, 1 archivo. |
| ✅ | `npm --prefix frontend run build` | TypeScript y Vite completados. |
| ✅ | `npm --prefix frontend run lint` | Sin errores. |
| ✅ | `docker compose config --quiet` | Configuración válida. |
| ✅ | Compose `up -d --build` con proyecto y puertos aislados | Ambos servicios construidos y en ejecución; HTML frontend y health backend con HTTP 200. |
| ✅ | HTTP directo al backend y OpenAPI | Nueve rutas exactas; 360 registros ordenados y contrato de cinco campos; facets coinciden con extremos. |
| ✅ | Comprobaciones HTTP adicionales | Particiones B2B/B2C exactas, 12 períodos mensuales, netos agregados y comparación recalculados, top ordenado y contratos de alertas. |
| ✅ | Seis peticiones inválidas por HTTP | 422: categoría, fecha, agrupación, límite, umbral y fechas requeridas de comparación. |
| ❌ | Proxy Vite `/api/metrics` y acceso interno a `backend:8000/health` | Timeout; DNS resolvió `172.18.0.2`. API directa y HTML frontend responden. Causa pendiente, no atribuida al código sin evidencia. |
| ❌ | Cabecera temporal y validación del rango | Texto fijo 2024 frente a fechas reales 2025-10-02 / 2026-09-28; rango invertido devuelve 200 y `[]`. |
| ❓ | Navegador, accesibilidad, responsive y producción | No ejecutados; no se declaran aprobados. |

Entorno de tests host: Node 24.21.0, Python 3.14.2. Las imágenes declaradas
usan Node 24 y Python 3.13. Dependencias restauradas con `npm ci` y
`pip install -r backend/requirements.txt` en un venv ignorado por Git después
de fallar por ausencia de Vitest/pytest. El runner de tests del editor no
detectó las pruebas; se usaron los runners del repositorio.

La prueba Docker usó el proyecto `phase1-context-27a0a45a` y publicó solamente
en loopback: 15173 (UI), 18000 (API), 15678 (debugger), mediante un override
temporal fuera del repositorio. No se cambió la configuración versionada.
La verificación HTTP directa comprobó las nueve rutas, `/docs`, `/redoc` y
`/openapi.json`; el proxy falló y no se presenta como prueba end-to-end exitosa.
Al terminar se retiraron contenedores, red, volúmenes e imágenes propios de
esa prueba; `compose ps --all` quedó vacío. Los 35 enlaces Markdown locales
resuelven y `git diff --check` no reportó errores.

Avisos preexistentes observados: deprecación TestClient/httpx, bundle JS
584.26 kB (>500 kB) y reporte de instalación npm de 12 vulnerabilidades
(1 low, 5 moderate, 6 high). No se hizo auditoría de explotabilidad ni se
actualizaron dependencias en esta fase.

### Repetición rápida (desde la raíz)

```bash
backend/.venv/bin/python -m pytest backend/tests/test_routes.py -q
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run lint
docker compose config --quiet
# Con el stack levantado y sus puertos estándar:
curl --fail --max-time 10 http://localhost:8000/health
curl --fail --max-time 10 http://localhost:8000/api/metrics/facets
curl --fail --max-time 10 http://localhost:5173/api/metrics
```

La última petición debe responder JSON, no HTML ni timeout. Para el resto
de rutas y filtros, usar el inventario del [contexto](memory-bank/project-context.md)
y Swagger. Corregidas las ambigüedades documentales de período/dataset,
consumo de endpoints y ubicación de la variable de entorno; los defectos
funcionales y las comprobaciones pendientes quedan explícitos, no resueltos.

## Fase 2 - Hallazgos concretos y reglas propuestas

- Fecha: 2026-10-04. Baseline: `ef53539`; 43 archivos versionados revisados.
- Entregables: [análisis e inventario individual](memory-bank/phase2-analysis.md),
  [19 reglas draft con hechos y verificación (archivo histórico)](memory-bank/archive/phase2-proposed-rules.md).
- Commit dedicado: `docs: record phase 2 findings and proposed rules`.
- Alcance: 31 hallazgos categorizados, no 31 bugs; convenciones y riesgos
  potenciales diferenciados de defectos actuales. Sin cambios de aplicación,
  dependencias ni comportamiento. Probes nuevos reproducen el baseline:
  su éxito no implica que los defectos estén resueltos.

| Estado | Comprobación | Resultado |
|---|---|---|
| ✅ | Inventario baseline | 43/43: texto manual completo; lockfile 306 entradas con integrity y manifest alineado; SVG parseado y PNG 343×361/44 919 bytes. |
| ✅ | [Probe backend](verification/phase2_backend_probe.py) | B01-B12: queries ignoradas, rango invertido, 500 date.min, RNG compartido, reloj fijo, dominio/precondiciones y sensibilidad de tests. |
| ✅ | [Probe frontend](verification/phase2_frontend_probe.mjs) | F01-F03 en UTC/Los Ángeles; F04-F07 con componentes reales en SSR y lectura de App. Sin navegador. |
| ❌ | Fecha civil | `2026-01-01` agrupa Jan 2026 en UTC y Dec 2025 en Los Ángeles. |
| ❌ | Estado vacío del margen | Income=outcome=100 produce “No data available to display”. |
| ❌ | Sensibilidad de pruebas heredadas | Summary acepta net=999/period=wrong; alerts acepta detector siempre vacío; comparison acepta cálculo siempre cero. |
| ✅ | Suite heredada / cobertura | 15 backend + 5 frontend pasan; frontend también pasa en Los Ángeles pese al defecto temporal. Backend 97% líneas; frontend 100% líneas solo de utils / 87.5% branches. |
| ✅ | Build/lint/sintaxis/Compose | Build y lint pasan; probe JS y Python válidos; Compose válido. JS 584.26 kB, gzip 175.20 kB: aviso >500 kB, no medición de latencia. |
| ✅ | Trazabilidad documental | Inventario coincide exactamente con los 43 archivos del baseline; 31 IDs de hallazgo y 19 IDs de regla únicos, todos con evidencia; 192 enlaces locales resuelven. |
| ❓ | Red proxy, navegador, responsive/accesibilidad y seguridad | No reevaluados/aprobados en esta fase; conservar límites de fase 1. |

Repetición dirigida y significado de cada etiqueta:
[comandos del análisis](memory-bank/phase2-analysis.md#reproducción-y-resultados).
Usar `COVERAGE_FILE=backend/.coverage` desde raíz para no crear un artefacto
sin seguimiento: el .coverage raíz creado al medir se retiró al terminar.
Sin instalaciones nuevas. Los patches de prueba se restauran al salir de
cada contexto; no persisten ni modifican código fuente.

## Fase 3 - Reglas activas y prueba de aplicación

- Fecha: 2026-10-04. Baseline: `b5b0d39`; árbol inicialmente limpio.
- Fuente: [phase2-analysis.md](memory-bank/phase2-analysis.md), no findings.md.
- Cinco reglas activas en [.agents/rules](.agents/rules), indexadas en
  [AGENTS.md](AGENTS.md); cuatro secciones requeridas y ejemplos reales
  por archivo, con trazabilidad de las 19 propuestas.
- [Borrador de fase 2](memory-bank/archive/phase2-proposed-rules.md) archivado
  fuera del directorio activo; enlaces históricos conservados.
- [Prueba y matriz de cumplimiento](memory-bank/phase3-rule-application.md).
- Commit dedicado: `docs: activate phase 3 rules and verify agent application`.

Petición al agente: **“Aplica las reglas recién creadas en `.agents/rules`”**,
cambiar título de pestaña a `Financial Metrics Dashboard` y probar entradas
preservadas. Cambió una línea de HTML y añadió un test Vitest, sin modificar
fórmulas, contratos ni dependencias. El agente padre contrastó diff, prueba
y HTML compilado; no se tomó únicamente el autoinforme como evidencia.

| Estado | Comprobación | Resultado |
|---|---|---|
| ✅ | [Validador estructural](verification/phase3_rules_check.py) | Cinco documentos activos con Nombre/Alcance/Justificación/Guía, ejemplos y hechos; R01-R19 cubiertas, índice AGENTS y enlaces locales válidos. |
| ✅ | `npm --prefix frontend test -- src/index-html.test.ts src/lib/financial-utils.test.ts` | 6 passed, 2 archivos; título exacto y único, lang, favicon, viewport, root y script preservados. |
| ✅ | `backend/.venv/bin/python -m pytest backend/tests/test_routes.py -q` | 15 passed; /health existente responde 200 y JSON exacto. No ruta duplicada. |
| ✅ | Build y lint frontend | Pasan; HTML compilado tiene nuevo título y entradas de aplicación preservadas. JS conserva 584.26 kB / gzip 175.20 kB y aviso >500 kB. |
| ✅ | Cumplimiento observado del agente | Lectura de cinco reglas; diff acotado HTML+test; runner existente, sin installs/config/refactor/commit delegado. |
| ✅ | Documentación relacionada | README ES/EN y AGENTS enlazan reglas/evidencia; comentario .env.example aclara Docker/origen navegador sin cambiar su valor. |
| ✅ | Preservación y enlaces | 260 enlaces locales resuelven; título es reemplazo exacto de una línea, cuerpo del borrador archivado idéntico y sin cambios ajenos en fuentes del baseline. `git diff --check` correcto. |
| ❓ | Reglas fuera de tarea de texto | Dinero, fechas, concurrencia, requests y nuevas rutas no ejercitadas como implementación; no afirmar adopción probada para esos comportamientos. |
| ❓ | Visual, accesibilidad, proxy y producción | No comprobados ni corregidos en esta fase; defectos funcionales de fase 2 siguen pendientes. |

No nuevas instalaciones, servidores ni outputs temporales sin seguimiento.
El validador estructural no evalúa semántica de prosa/anchors ni el test de
HTML equivale a una prueba de navegador. Commit se crea tras validar el diff
y la persistencia de los entregables; sin push.
