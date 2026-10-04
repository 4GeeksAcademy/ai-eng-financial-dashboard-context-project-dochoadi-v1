# System Patterns

Actualizado: 2026-10-04. Baseline contrastado: `03a7a84`.
Describe patrones **implementados**, no una arquitectura objetivo.
Stack en [techContext.md](techContext.md); funcionalidad en
[productContext.md](productContext.md).

## Arquitectura y puntos de entrada

Dos servicios de desarrollo definidos en [Compose](../docker-compose.yml):
SPA React servida por Vite y API FastAPI. No hay gateway propio, DB,
worker, cola, repositorio de persistencia ni servicios externos en el flujo.

| Entrada / módulo | Responsabilidad real |
|---|---|
| [index.html](../frontend/index.html) → [main.tsx](../frontend/src/main.tsx) | #root, React createRoot/StrictMode, CSS y App. |
| [App.tsx](../frontend/src/App.tsx) | Fetch, estado local de loading/error/métricas y composición de una pantalla. |
| [financial-utils.ts](../frontend/src/lib/financial-utils.ts) | KPIs, agrupación mensual y formateo; no accede a red. |
| [components/dashboard](../frontend/src/components/dashboard) | Presentación de KPIs/gráficos; recibe props derivadas y loading. |
| [components/ui](../frontend/src/components/ui) y [cn](../frontend/src/lib/utils.ts) | Primitives con ComponentProps/data-slot; composición clsx+twMerge. |
| [app.main:app](../backend/app/main.py) | FastAPI, middleware CORS y router sin prefijo añadido. |
| [routes.py](../backend/app/routes.py) | Modelos Pydantic, generación, filtros, agregaciones y nueve handlers. |

No hay capa de servicios separada: las responsabilidades backend están en
el mismo módulo. UI calcula métricas a partir de movimientos aunque la API
ofrece summary; no atribuir al servidor el cálculo que App realiza.

## Flujo configurado de datos

```text
Navegador -> Vite (5173) -> index.html -> main.tsx -> App
  -> fetch /api/metrics
  -> proxy Vite http://backend:8000/api/metrics
  -> app.main:app -> router
  -> generate_mock_movements(seed=42) -> filtros -> orden cronológico
  -> response_model -> JSON FinancialMovement[]
  -> computeKPIs + computeMonthlyData -> estado React
  -> KPIRow + IncomeOutcomeChart + ProfitPercentChart
```

Fuentes: [App](../frontend/src/App.tsx),
[Vite](../frontend/vite.config.ts), [router](../backend/app/routes.py).
Este flujo es configuración de código, **no una prueba end-to-end aprobada**:
timeout de conexión interna observado en fase 1, causa todavía pendiente.

### Dos modos de conexión

1. Sin override, `VITE_API_BASE_URL ?? ""` produce URL relativa `/api/metrics`.
   Vite dev proxy conserva `/api` y apunta a hostname Docker `backend`.
2. Con override, navegador solicita `<origen>/api/metrics` directamente.
   El origen debe ser accesible desde el navegador, sin `/api`/barra final.
   La variable se incorpora en arranque/build, no configura dinámicamente
   un bundle ya publicado. [.env.example](../frontend/.env.example).

`/health` no está bajo `/api` y no se reenvía por ese proxy.
[CORS](../backend/app/main.py) permite orígenes/métodos/cabeceras `*` y
credenciales; eso no implementa autenticación. Producción necesitaría origen
API al compilar o reverse proxy propio, no está validada aquí.

## Contrato y convenciones compartidas

[FinancialMovement Pydantic](../backend/app/routes.py) y
[tipos TypeScript](../frontend/src/lib/financial-types.ts):

```text
create_date: fecha ISO YYYY-MM-DD
amount: número
operation_type: income | outcome
category: suppliers | sales | operational | administrative | others
business_type: B2B | B2C
```

JSON/Python usan snake_case; derivados UI usan camelCase (`totalIncome`,
`profitPercent`). Los enums están duplicados entre capas, no generados.
Pydantic valida/serializa salidas de métricas; el JSON recibido por App
no tiene guarda runtime. Tipado TypeScript no valida una respuesta remota.

## Rutas existentes

Todas son GET y se declaran en [routes.py](../backend/app/routes.py).
`F` = start_date/end_date/category/operation_type opcionales;
fechas de filtrado inclusivas.

| Ruta | Queries relevantes | Salida |
|---|---|---|
| `/health` | Ninguna | `{status: "ok"}`, liveness. |
| `/api/metrics` | F; no declara business_type | Movimientos ordenados; única ruta consumida por UI. |
| `/api/metrics/b2b`, `/api/metrics/b2c` | F | Movimientos del segmento correspondiente. |
| `/api/metrics/facets` | Ninguna | Enums presentes y min_date/max_date del dataset completo. |
| `/api/metrics/summary` | F, business_type, group_by=month (day/week/month) | Lista `{period,income,outcome,net}`. |
| `/api/metrics/categories/top` | Fechas, business_type, operation_type=outcome, limit=5 (1-20) | `{category,operation_type,total_amount}`, orden descendente. |
| `/api/metrics/comparison` | Fechas obligatorias, business_type opcional | `{current_period,previous_period,delta_abs,delta_pct}`. |
| `/api/metrics/alerts` | Fechas, business_type, group_by=month, threshold=0.3 (>=0) | `{period,outcome_total,baseline_average,increase_ratio}`. |

FastAPI también sirve `/docs`, `/redoc`, `/openapi.json`.
Enums/fechas malformadas y límites declarados reciben 422. Queries no
declaradas pueden ignorarse: business_type en metrics no filtra. Orden
invertido de fechas no se valida actualmente.

## Algoritmos y estado

- Generador: random.seed global, reloj date.today, 30 registros por mes y
  orden por fecha. Seed fija no garantiza aislamiento concurrente ni fecha
  fija. No cache ni estado financiero persistido entre solicitudes.
- [Agregación backend](../backend/app/routes.py): día ISO, semana ISO
  YYYY-Www o mes YYYY-MM; sumas/netos redondeados a dos decimales.
- Comparación: netos en período actual y anterior contiguo de igual duración
  inclusiva; porcentaje usa abs(previo), null si previo=0.
- Alertas: gastos vs media de períodos anteriores presentes, baseline>0,
  ratio estrictamente mayor al umbral. Ratio 0.3 equivale a aumento 30%.
- [Agregación UI](../frontend/src/lib/financial-utils.ts): fecha parseada con
  Date y getters locales, importes number, no relleno de meses vacíos.
  El desplazamiento horario en día 1 es un defecto, no patrón a copiar.
- [App](../frontend/src/App.tsx) hace fetch en useEffect inicial; no polling,
  cancelación ni retry. Error genérico descarta la causa; finalmente termina
  loading. No se usan mocks como recuperación.

## Patrones para contribuir, no refactors ya aplicados

Reutilizar helpers y primitives, preservar estilo local/contratos, verificar
consumidores y regresiones. Las [reglas activas](../AGENTS.md) guían cambios
relevantes; no convierten el monolito de routes en una capa de servicios
ni corrigen deuda automáticamente. Estado detallado en [progress](progress.md).
