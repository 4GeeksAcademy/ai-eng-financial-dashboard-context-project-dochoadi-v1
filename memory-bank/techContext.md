# Tech Context

Actualizado: 2026-10-04. Baseline contrastado: `03a7a84`.
Las versiones frontend indicadas abajo son **rangos declarados**, no una
afirmación de versiones exactas instaladas. Fuentes:
[package.json](../frontend/package.json),
[package-lock.json](../frontend/package-lock.json).

## Stack y dependencias clave

| Capa | Tecnología / declaración | Uso evidenciado |
|---|---|---|
| UI | React/React DOM `^19.2.4`, TypeScript `~6.0.2` | [main.tsx](../frontend/src/main.tsx), componentes TSX |
| Servidor frontend/build | Vite `^8.0.4`, plugin React `^6.0.1` | [vite.config.ts](../frontend/vite.config.ts) |
| Estilos | Tailwind CSS/plugin Vite `^4.2.2` | [index.css](../frontend/src/index.css), tokens light/dark |
| Gráficos | Recharts `^3.8.1` | [componentes dashboard](../frontend/src/components/dashboard) |
| Iconos/clases | lucide-react `^1.8.0`, clsx `^2.1.1`, tailwind-merge `^3.5.0` | [kpi-card](../frontend/src/components/dashboard/kpi-card.tsx), [cn](../frontend/src/lib/utils.ts) |
| Pruebas UI | Vitest/coverage-v8 `^4.1.4` | [scripts](../frontend/package.json), tests colocados en src |
| Lint UI | ESLint `^9.39.4`, typescript-eslint, plugins hooks/refresh | [eslint.config.js](../frontend/eslint.config.js) |
| API | FastAPI, Pydantic (importado; dependencia transitiva de FastAPI) | [main.py](../backend/app/main.py), [routes.py](../backend/app/routes.py) |
| Servidor API/debug | uvicorn[standard], debugpy | [requirements.txt](../backend/requirements.txt), [Dockerfile](../backend/Dockerfile) |
| Pruebas API | pytest, pytest-cov, httpx | [requirements.txt](../backend/requirements.txt), [test_routes.py](../backend/tests/test_routes.py) |

Python requirements no fija versiones ni separa herramientas de test/debug
del runtime. El lockfile frontend es v3; la inspección de fase 2 confirmó
306 entradas, integridad y rangos raíz alineados con package.json.
Ejemplos resueltos en ese lock: React 19.2.5 y Vite 8.0.8, distintos de
los mínimos declarados. No editar lock a mano.

## Base de datos y persistencia

**No hay base de datos configurada.** Compose solo declara frontend/backend;
requirements no incluye driver/ORM y las rutas generan movimientos en
memoria en cada consulta. No hay migraciones ni escritura de movimientos.
Fuentes: [Compose](../docker-compose.yml),
[requirements](../backend/requirements.txt), [generador](../backend/app/routes.py).
Una futura DB no es parte del diseño actual.

## Docker: configuración real de desarrollo

| Servicio | Imagen/arranque | Puertos publicados y volúmenes |
|---|---|---|
| Frontend | [node:24-alpine](../frontend/Dockerfile); npm install; Vite dev en 0.0.0.0 | 5173:5173; código frontend→/app y volumen anónimo /app/node_modules |
| Backend | [python:3.13-slim](../backend/Dockerfile); pip requirements; debugpy y Uvicorn app.main:app con reload | 8000:8000 y 5678:5678; código backend→/app |

[docker-compose.yml](../docker-compose.yml) declara depends_on de frontend a
backend, sin healthcheck/readiness. Ambos Dockerfiles hacen COPY . . y no
hay .dockerignore versionado. Git ignore no excluye el contexto Docker.
No existe despliegue de producción validado: debugpy/reload y Vite dev son
configuración de desarrollo, no infraestructura para publicar la demo.

## Cómo ejecutar

Desde raíz, con Docker/Compose y los puertos libres:

```bash
docker compose up --build
```

UI <http://localhost:5173>, API <http://localhost:8000>,
Swagger <http://localhost:8000/docs>. Se puede detener con Ctrl+C y
`docker compose down`. El proxy entre contenedores dio timeout en fase 1;
el arranque y la API directa sí se verificaron, no el recorrido completo.

Sin Docker, usar Node 24 y Python 3.13 para alinearse con imágenes.
Backend, primera terminal desde raíz:

```bash
cd backend
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend, segunda terminal desde raíz:

```bash
cd frontend
npm ci
VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 5173
```

Para persistir la variable, copiar
[frontend/.env.example](../frontend/.env.example) a frontend/.env.
En Codespaces, usar origen backend accesible desde el navegador (puede ser
URL reenviada del puerto 8000, no localhost). Base sin `/api` ni barra final;
reiniciar Vite o recompilar tras cambios. No colocar secretos en variables
VITE_* expuestas al frontend. Conexión detallada en
[systemPatterns.md](systemPatterns.md).

## Tooling y comprobaciones

- `npm --prefix frontend test`, `run build`, `run lint`, `run test:coverage`;
  build ejecuta `tsc -b && vite build` y genera frontend/dist.
- Backend: `backend/.venv/bin/python -m pytest backend/tests/test_routes.py -q`.
  [conftest](../backend/tests/conftest.py) incorpora backend al sys.path.
- Coverage desde raíz: `COVERAGE_FILE=backend/.coverage` para evitar
  .coverage raíz no ignorado por [.gitignore](../.gitignore).
- [tsconfig app](../frontend/tsconfig.app.json) y
  [node](../frontend/tsconfig.node.json) no habilitan strict; sí noUnused,
  modo bundler y noEmit. Alias @ está coordinado en TS/Vite/components.
- No hay CI, formatter o lint/typecheck Python versionados en el baseline.
  No afirmar gates que el repo no declara.
- Host usado en verificaciones previas: Node 24.21.0/Python 3.14.2;
  no idéntico al Python 3.13 de Docker.

Resultados y advertencias fechados, no una ejecución nueva de fase 4:
[progress.md](progress.md), [verification.md](../verification.md).
