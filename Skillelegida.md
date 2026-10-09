# Skill elegida

## 1. Exploración

Búsquedas simuladas con `npx skills find <palabra>` sobre los repositorios
registrados en `skills-lock.json` (`addyosmani/web-quality-skills` y
`vercel-labs/agent-skills`) y el ecosistema general de agent skills:

| Búsqueda | Resultados esperados | Aplica al proyecto |
|---|---|---|
| `performance` | `vercel-react-best-practices` (ya instalado). Otras fuentes: perf.planet, web-dev-speed-kit. | ✅ Ya lo tenemos. Cubre waterfalls, bundle, server, cliente, re-render. |
| `forms` | Skills de validación, envío, UX de formularios. | ❌ El dashboard es 100% readonly — ni un solo `<form>`, input o botón de envío. Skill irrelevante. |
| `testing` / `test` | Skills de Vitest, pytest, TDD, cobertura. | ✅ Frontend usa Vitest, backend usa pytest. Hay deuda de tests (H21/H22). **Cubre necesidad real.** |
| `python` / `fastapi` | Skills de Python, FastAPI, Pydantic, async. | ✅ Backend 100% Python/FastAPI. Sin DB pero con 9 rutas, filtros, generación. |
| `docker` | Skills de Dockerfile, Compose, multi-stage, healthcheck. | ✅ Proyecto entero se ejecuta con Docker. Faltan .dockerignore, healthcheck, readiness. |
| `charts` / `gráficos` | Skills de Recharts, Chart.js, visualización de datos. | ❌ Usamos Recharts pero los wrappers son finos (cantidad de reglas baja frente al esfuerzo). |
| `accessibility` | Skill `accessibility` (addyosmani) — ya instalado. | ✅ Ya lo tenemos. Cubre WCAG 2.2, POUR, alt text, teclado. |
| `seo` | Skill de SEO (addyosmani). | ❌ Dashboard demo sin SEO ni motor de búsqueda. |

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

*Documentado el 2026-10-09. Ningún comando `npx skills` fue ejecutado durante
este análisis, conforme a la instrucción de no instalar nada.*