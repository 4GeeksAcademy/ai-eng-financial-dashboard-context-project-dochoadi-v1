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
