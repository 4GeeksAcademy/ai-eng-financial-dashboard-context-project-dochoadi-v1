# Contexto del proyecto - Fase 1

Baseline inspeccionado: `954f812`. Verificación: 2026-10-04.
Alcance: describir el sistema heredado y contrastarlo con código y ejecución;
no implementar funcionalidades ni definir las fases 2-4.
Resultados de ejecución: [verification.md](../verification.md).

Leyenda: ✅ confirmado; ❌ desajuste o fallo observado; ❓ pendiente de verificar.
Una confirmación por lectura no implica una prueba visual en navegador.

## 1. Qué hace

Es una demo de métricas financieras, no un sistema contable conectado a datos
reales. Muestra ingresos, gastos (`outcome`), beneficio neto y margen de
beneficio, más dos gráficos mensuales: ingresos/gastos y margen.

- Frontend: React 19 + TypeScript, Vite 8, Tailwind CSS 4 y Recharts 3.
- Backend: FastAPI + Pydantic, servido por Uvicorn.
- Datos: 360 movimientos sintéticos, 30 por mes, generados en cada petición
  con semilla `42`; no hay base de datos ni persistencia.
- Fechas: los doce meses anteriores al mes actual, no un año natural fijo.
  Los días generados están entre 1 y 28. La semilla estabiliza los valores,
  pero las fechas dependen de `date.today()` en el servidor.
- No hay autenticación, escrituras de movimientos, servicios externos ni
  navegación multipágina implementados.

Fuentes: [dependencias frontend](../frontend/package.json),
[dependencias backend](../backend/requirements.txt),
[generador y contratos](../backend/app/routes.py).

## 2. Estructura y entry points

| Superficie | Entrada real | Responsabilidad |
|---|---|---|
| Orquestación | [docker-compose.yml](../docker-compose.yml) | Dos servicios, `frontend` y `backend`; puertos y volúmenes de desarrollo. |
| Frontend Docker | [frontend/Dockerfile](../frontend/Dockerfile) | Node 24 Alpine; `npm run dev -- --host 0.0.0.0 --port 5173`. |
| Documento HTML | [frontend/index.html](../frontend/index.html) | Contenedor `#root` y carga de `/src/main.tsx`. |
| React | [main.tsx](../frontend/src/main.tsx) | `createRoot`, `StrictMode`, CSS global y `App`. |
| Pantalla y petición | [App.tsx](../frontend/src/App.tsx) | `fetchFinancialData`, estados de carga/error y composición del dashboard. |
| Cálculos UI | [financial-utils.ts](../frontend/src/lib/financial-utils.ts) | KPIs, agregación por año-mes y formato de importes/porcentajes. |
| Tipos UI | [financial-types.ts](../frontend/src/lib/financial-types.ts) | Contrato TypeScript de movimientos y datos derivados. |
| Componentes UX | [dashboard/](../frontend/src/components/dashboard/) | Cabecera, cuatro KPIs, dos gráficos, skeletons y estados vacíos. |
| Backend Docker | [backend/Dockerfile](../backend/Dockerfile) | Python 3.13; debugpy en 5678 y Uvicorn `app.main:app` en 8000, con recarga. |
| FastAPI | [main.py](../backend/app/main.py) | Crea `app`, configura CORS e incorpora el router sin prefijo adicional. |
| API y lógica | [routes.py](../backend/app/routes.py) | Modelos, generación, filtros, agregaciones y las nueve rutas propias. |
| Tests backend | [test_routes.py](../backend/tests/test_routes.py) | 15 pruebas del generador, filtros y endpoints con `TestClient`. |
| Tests frontend | [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) | 5 pruebas de cálculos, orden mensual y formatos; no pruebas de componentes. |

Las ubicaciones previstas por [AGENTS.md](../AGENTS.md), `.agents/rules` y
`.agents/skills`, no existían en el baseline. Tampoco existía `memory-bank`;
este documento inicia el contexto persistente, sin inventar reglas o skills.

## 3. Cómo se conecta

```text
Navegador: http://localhost:5173/
  -> index.html -> main.tsx -> App.tsx
  -> GET /api/metrics
  -> proxy del servidor Vite: http://backend:8000/api/metrics
  -> app.main:app -> router -> generate_mock_movements(seed=42)
  -> filtros -> lista JSON ordenada
  -> computeKPIs / computeMonthlyData
  -> KPIRow / IncomeOutcomeChart / ProfitPercentChart
```

✅ Este recorrido está definido en
[App.tsx](../frontend/src/App.tsx),
[vite.config.ts](../frontend/vite.config.ts) y
[routes.py](../backend/app/routes.py).
❌ En este entorno, el salto entre contenedores agotó el tiempo de espera:
`backend` resolvió por DNS, pero `http://backend:8000/health` no respondió desde
el frontend. Ambos servicios respondieron desde el host por sus puertos
publicados. ❓ Causa de conectividad pendiente; no se ha demostrado que sea un
defecto del código o de Compose.

Con `VITE_API_BASE_URL`, el navegador llama directamente a
`<base>/api/metrics`, sin pasar por el proxy. La base es un origen accesible
desde el navegador, sin `/api` y sin barra final; `backend` es un nombre
interno de Docker, no una URL pública. La variable de Vite se aplica al
arrancar desarrollo o al compilar; no es una configuración dinámica del
bundle publicado.

El backend permite todos los orígenes, métodos y cabeceras, y habilita
credenciales en [main.py](../backend/app/main.py). Eso no implementa login.
La configuración actual es de desarrollo, no un despliegue de producción.

### Cálculos y UX actuales

- La UI solo consume `/api/metrics`, sin filtros. No utiliza las agregaciones
  del backend ni muestra controles B2B/B2C, categorías, comparación o alertas.
- Beneficio = ingresos - gastos. Margen = beneficio / ingresos × 100; si no
  hay ingresos, el margen es `0`.
- La agrupación UI ordena por año-mes; no rellena meses sin movimientos.
- La UI formatea en `en-US` y USD sin decimales; la API no incluye un campo
  de moneda. USD es una decisión de presentación, no una divisa validada.
- Hay skeletons durante la carga, un mensaje en español si falla la petición,
  KPIs sin valor y gráficos vacíos tras el error. No hay botón de reintento.
  No se usan datos mock como fallback.
- [mock-data.ts](../frontend/src/lib/mock-data.ts) contiene un dataset fijo
  de 2024, pero no se importa en el flujo del dashboard.
- `StrictMode` puede repetir efectos en desarrollo; no hay polling.

## 4. Rutas clave y contrato

Todas las rutas propias son `GET` y están en
[routes.py](../backend/app/routes.py). `F` significa filtros opcionales
`start_date`, `end_date`, `category`, `operation_type`.
Las fechas ISO (`YYYY-MM-DD`) tienen límites inclusivos.

| Ruta | Parámetros query | Respuesta / uso real |
|---|---|---|
| `/health` | Ninguno | `{"status":"ok"}`; liveness, no prueba dependencias. |
| `/api/metrics` | `F` | Lista `FinancialMovement`; única ruta consumida por la UI. |
| `/api/metrics/b2b` | `F` | Misma lista, solo `business_type=B2B`. |
| `/api/metrics/b2c` | `F` | Misma lista, solo `business_type=B2C`. |
| `/api/metrics/facets` | Ninguno | `operation_types`, `business_types`, `categories`, `min_date`, `max_date` del dataset completo. |
| `/api/metrics/summary` | `F`, `business_type`, `group_by=month` (`day/week/month`) | Lista `{period, income, outcome, net}` ordenada. Semanas ISO `YYYY-Www`. |
| `/api/metrics/categories/top` | Fechas, `business_type`, `operation_type=outcome`, `limit=5` (1-20) | Lista `{category, operation_type, total_amount}`, ordenada por importe descendente. |
| `/api/metrics/comparison` | `start_date` y `end_date` obligatorios; `business_type` opcional | `{current_period, previous_period, delta_abs, delta_pct}`; compara netos con el intervalo inmediatamente anterior de igual duración inclusiva. |
| `/api/metrics/alerts` | Fechas, `business_type`, `group_by=month`, `threshold=0.3` (>=0) | Lista `{period, outcome_total, baseline_average, increase_ratio}`; gastos que superan la media de períodos anteriores por una proporción estrictamente mayor al umbral. |

`FinancialMovement` contiene exactamente:
`create_date` (fecha), `amount` (número), `operation_type` (`income/outcome`),
`category` (`suppliers/sales/operational/administrative/others`),
`business_type` (`B2B/B2C`).

`comparison.delta_pct` es un porcentaje con denominador `abs(previous_net)`;
es `null` si el neto previo es cero. `alerts.increase_ratio` es una proporción,
no un porcentaje: `0.3` representa un aumento del 30%.

FastAPI también publica `/docs`, `/redoc` y `/openapi.json`.
✅ Se comprobó el inventario exacto contra OpenAPI y las nueve rutas por HTTP.
Los valores enum, fechas mal formadas, límites y parámetros requeridos se
validan con HTTP 422. ❌ No hay validación de `start_date <= end_date`;
un rango invertido en `/api/metrics` devuelve HTTP 200 y `[]`.
`/api/metrics` no declara un filtro `business_type`: usar las rutas B2B/B2C.

## 5. Cómo se ejecuta

### Docker Compose (camino definido por el repositorio)

Requiere Docker y Compose, con los puertos disponibles:

```bash
docker compose up --build
```

- UI: <http://localhost:5173>
- API: <http://localhost:8000>
- Swagger: <http://localhost:8000/docs>
- Debugger backend: puerto 5678.

Los volúmenes montan código en `/app` y preservan los `node_modules` del
contenedor. `depends_on` ordena el arranque, pero no espera a que la API esté
lista: no se declaran healthchecks. La recarga de Vite/Uvicorn está habilitada.
✅ Las imágenes se construyeron y ambos servicios arrancaron.
❌ La comunicación por el proxy no quedó validada en este entorno.

### Sin Docker (evita depender del hostname interno `backend`)

Usar Node 24 y Python 3.13 para alinearse con las imágenes. En una terminal:

```bash
cd backend
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
npm ci
VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --port 5173
```

Para persistir la base, copiar
[frontend/.env.example](../frontend/.env.example) a `frontend/.env`.
Sin override, el proxy sigue apuntando a `backend:8000`, no a `localhost`.
En Codespaces o acceso remoto, la base debe ser la URL del backend accesible
desde el navegador; `localhost` se refiere a la máquina del navegador.

`npm run build` genera `frontend/dist`; `npm run preview` permite inspeccionar
ese build. El proxy de `server` no constituye infraestructura de producción:
para publicar, configurar el origen API al compilar o un reverse proxy `/api`.
❓ No hay despliegue de producción validado en esta fase.

## 6. Checklist para validación del propietario

| Estado | Afirmación contrastada | Evidencia / acción pendiente |
|---|---|---|
| ✅ | Hay dos servicios, una pantalla y nueve rutas API propias. | Compose, entradas React/FastAPI y OpenAPI real. |
| ✅ | Los datos son sintéticos, no una integración financiera. | Generador; respuesta HTTP de 360 movimientos. |
| ✅ | La UI agrega movimientos en cliente. | `App` y utilidades; 5 tests frontend. |
| ✅ | Contratos backend y filtros básicos funcionan. | 15 tests y comprobación HTTP directa adicional. |
| ❌ | La cabecera representa el período servido. | `App` fija `2024 - Full Year`; HTTP devolvió 2025-10-02 a 2026-09-28. Corregir el período en una fase funcional. |
| ❌ | Todo margen cero significa ausencia de datos. | `ProfitPercentChart` usa `some(profitPercent !== 0)`; puede ocultar meses válidos en equilibrio. |
| ❌ | El proxy Compose funciona en el entorno verificado. | Timeout entre contenedores, con DNS correcto y API accesible por puerto publicado. Diagnosticar antes de darlo por operativo. |
| ❌ | Las fechas invertidas se rechazan. | HTTP 200 y lista vacía; decidir y probar el contrato en una fase funcional. |
| ❓ | UX visual, responsive, accesibilidad y error en navegador. | Hay estados definidos en componentes, pero no se hizo prueba de navegador. |
| ❓ | USD es la divisa de negocio requerida. | Solo existe formateo UI; confirmar con el propietario. |
| ❓ | Producción y datos reales están preparados. | No hay configuración ni integración verificadas para ello. |

Para validar manualmente: abrir la UI y Swagger; consultar primero
`/api/metrics/facets` y elegir fechas dentro de `min_date/max_date`; comprobar
la lista general, las particiones B2B/B2C, agregaciones y errores 422.
La evidencia de esta fase no equivale a aprobación visual del propietario.
