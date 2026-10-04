# Fase 2 - Hallazgos y convenciones del repositorio

Fecha: 2026-10-04. Baseline: `ef53539` (43 archivos versionados; árbol limpio).
Estado: análisis terminado; reglas **propuestas**, no aprobadas ni aplicadas
al comportamiento. No se introduce una refactorización ni una corrección funcional.

Referencias: [contexto de fase 1](project-context.md),
[reglas propuestas históricas](archive/phase2-proposed-rules.md),
[rastro de verificación](../verification.md).

Nota posterior (fase 3): el borrador se archivó sin convertir el análisis
histórico en una declaración de defectos resueltos. Las reglas activas
están enlazadas en [AGENTS.md](../AGENTS.md).

## Método y límites

- Lectura individual de todos los archivos de texto mantenidos a mano.
  Lockfile generado: parseo de las 306 entradas, comparación de dependencias
  raíz y presencia de integridad. Assets: parseo SVG y metadatos PNG,
  además de búsqueda de referencias; no evaluación visual de la imagen.
- Pruebas existentes, cobertura, TypeScript/Compose efectivos y probes
  reproducibles sobre funciones, rutas y renderizado estático reales.
- ✅ hecho confirmado (no significa que el comportamiento sea correcto);
  ❌ defecto o desajuste reproducido; ❓ riesgo/decisión pendiente.
- Los probes comprueban el baseline, incluidos sus defectos. Un PASS demuestra
  reproducción, **no calidad ni resolución**. Tras corregir un defecto deben
  cambiarse por una regresión con la expectativa correcta.
- No se levantó nuevamente Docker ni se probó navegador en fase 2. El timeout
  de red de fase 1 sigue sin causa atribuida. No se hizo auditoría de seguridad
  ni se considera el reporte de npm prueba de explotabilidad.

## Hallazgos categorizados

Prioridades: P1 = resultado incorrecto/error actual; P2 = riesgo de evolución,
diagnóstico o verificación; P3 = convención/claridad. No son severidades de
seguridad. `Bxx`/`Fxx` son las etiquetas emitidas por los probes versionados.

### Arquitectura y contratos

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H01 | ✅ P2 | [routes.py](../backend/app/routes.py) contiene en un único módulo modelos, generador, filtros, agregaciones y nueve handlers; todos vuelven a generar 360 registros con semilla 42. | No confundir router con capa de almacenamiento. Reutilizar helpers antes de duplicar lógica; extraer por responsabilidad solo cuando el cambio lo necesite. R01. |
| H02 | ✅ P2 | [App](../frontend/src/App.tsx) solo hace fetch de `/api/metrics` y calcula KPIs/meses en cliente; summary/comparison/alerts no tienen consumidor UI. | Añadir una ruta no añade una función visible. Validar el recorrido completo y evitar dos fórmulas incompatibles entre cliente/servidor. R01, R02. |
| H03 | ❌ P2 | `/api/metrics?business_type=B2B` devuelve los mismos 360 registros y ambos segmentos; el parámetro no está declarado. [routes.py](../backend/app/routes.py), B01. | Un contribuidor puede creer que filtró correctamente. Respetar parámetros de cada endpoint; decidir expresamente si se añade el filtro o se rechazan queries desconocidas. R02. |
| H04 | ✅ P3 | Literales Python y uniones TS duplican enums; JSON usa `create_date/operation_type/business_type`, mientras los KPIs usan `totalIncome/profitPercent`. [modelos](../backend/app/routes.py), [tipos](../frontend/src/lib/financial-types.ts), B12. | Convención útil: snake_case en contrato, camelCase en derivados UI; cambiar ambos lados y verificar OpenAPI, no renombrar solo uno. R03. |
| H05 | ❓ P2 | `amount=-1` es aceptado por Pydantic y no tiene mínimo en OpenAPI; `build_metrics_facets([])` lanza IndexError. [routes.py](../backend/app/routes.py), B07/B12. | Riesgos si se introduce importación o dataset vacío; no son rutas de escritura explotadas: hoy no hay escritura y el generador produce datos positivos/no vacíos. Definir dominio y precondiciones al conectar datos reales. R02, R06. |

### Fechas, finanzas y determinismo

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H06 | ❌ P1 | [computeMonthlyData](../frontend/src/lib/financial-utils.ts) combina `new Date("YYYY-MM-DD")` (UTC) con getters locales. `2026-01-01` produce `Jan 2026` en UTC y `Dec 2025` en Los Ángeles. F01. | La misma API puede mostrar meses/años diferentes al usuario. Tratar date-only sin desplazamiento horario y probar primer día del mes en dos zonas. R04. |
| H07 | ❌ P1 | [App](../frontend/src/App.tsx) pasa `2024 - Full Year`; [DashboardHeader](../frontend/src/components/dashboard/dashboard-header.tsx) también tiene default 2024. Con fecha congelada 2026-10-04, datos 2025-10-02 a 2026-09-28. B06/F07. | La cabecera contradice el período de los gráficos. Derivar etiqueta del dataset/filtro, no de fixtures antiguos. R04. |
| H08 | ❌ P1 | Rango `2026-02-01` a `2026-01-01`: metrics y summary dan 200/[]; comparison devuelve cuatro campos con ceros/null. [routes.py](../backend/app/routes.py), B02. | Un input incoherente parece una consulta exitosa sin datos. Validación compartida de orden de fechas con error explícito y tests en todas las rutas. R05. |
| H09 | ❌ P1 | Comparación `0001-01-01` a `0001-01-01` produce HTTP 500 por restar un día a `date.min`. [get_metrics_comparison](../backend/app/routes.py), B03. | Fechas sintácticamente válidas no garantizan aritmética segura del período anterior. Validar intervalo representable, no capturar el fallo como ceros. R05. |
| H10 | ❓ P2 | [generate_mock_movements](../backend/app/routes.py) llama `random.seed` y usa RNG global. Cambia `getstate`; una intercalación forzada con otra generación cambia la salida de seed 42. B04. | Riesgo de contaminación entre llamadas concurrentes y otros consumidores de random. Prueba determinista del mecanismo, no medición de frecuencia de fallos en carga real. Aislar reloj/RNG al evolucionar el generador. R07. |
| H11 | ✅ P2 | [computeKPIs](../frontend/src/lib/financial-utils.ts) suma números binarios: 0.1+0.2 = 0.30000000000000004; backend redondea netos a dos decimales; UI presenta USD sin decimales. F02. | No asumir precisión contable ni igualdad exacta entre motores. Acordar moneda/precisión y probar céntimos; no migrar unidades unilateralmente. R06. |
| H12 | ✅ P3 | [detect_outcome_alerts](../backend/app/routes.py) usa media de períodos anteriores presentes, baseline>0 y `increase_ratio > threshold`; 100→130 no alerta a 0.3, sí a 0.29. B08. Comparison usa neto, `abs(previous_net)` y null si previo=0. | Preservar proporción vs porcentaje, desigualdad estricta y semántica de netos; no suponer comparación de ingresos ni meses vacíos imputados. R06. |

### Frontend, UX y accesibilidad

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H13 | ❌ P1 | [ProfitPercentChart](../frontend/src/components/dashboard/profit-percent-chart.tsx) decide presencia con `some(profitPercent !== 0)`. Con income=outcome=100, el componente real renderiza “No data available to display”. F04. | Cero válido se trata como ausencia; los meses solo de gastos también tienen margen 0 por la fórmula actual. Separar vacío, cero y margen no definido. R08. |
| H14 | ❓ P2 | [fetchFinancialData](../frontend/src/App.tsx) retorna JSON sin guard; con operación `refund`, KPIs descartan 100 pero el cálculo mensual los cuenta como gasto por su `else`. F03. | Un payload incompatible podría producir gráficos y KPIs contradictorios. Es inyección de dato malformado al helper, no respuesta actual del backend Pydantic. Validar frontera antes de derivar datos. R09. |
| H15 | ✅ P2 | [App](../frontend/src/App.tsx) muestra error genérico con `.catch(() => ...)`, perdiendo status/causa; no cancela requests ni tiene retry. [main.tsx](../frontend/src/main.tsx) activa StrictMode. F07 confirma ausencia de cancelación por lectura. | Fallos de red, HTTP y cálculo parecen lo mismo; efectos pueden repetirse en desarrollo. Conservar causa diagnosticable, diseñar limpieza y recuperación al modificar carga. No se afirma fuga de memoria probada. R09. |
| H16 | ✅ P2 | [CardTitle](../frontend/src/components/ui/card.tsx) renderiza div (F05); error de [App](../frontend/src/App.tsx) no tiene role alert/live; secciones sí tienen aria-label. [index.html](../frontend/index.html) fija lang=en y title=frontend, mientras el error es español. | CardTitle no crea jerarquía de headings. Revisar semántica de títulos, anuncio de estados e idioma al tocar UX; no declarar WCAG aprobado por lectura. R10. |
| H17 | ✅ P3 | [cn](../frontend/src/lib/utils.ts) usa clsx+twMerge (F06); [Card/Skeleton](../frontend/src/components/ui/) aceptan ComponentProps y data-slot; [CSS](../frontend/src/index.css) centraliza tokens light/dark. | Convención reutilizable: composición de clases y props, sin copiar primitives ni colores. `App` fuerza dark; no existe selector de tema. R11. |
| H18 | ✅ P3 | [mock-data.ts](../frontend/src/lib/mock-data.ts) tiene 2024 sin imports en el flujo; [hero.png](../frontend/src/assets/hero.png) tampoco tiene referencias; favicon sí está referenciado en HTML. | No usar fixtures/assets sobrantes como fuente de negocio o fallback silencioso; ausencia de uso no autoriza borrado automático. R01, R15. |

### Naming, estilo y tipado

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H19 | ✅ P3 | [dashboard-header](../frontend/src/components/dashboard/dashboard-header.tsx) y [card](../frontend/src/components/ui/card.tsx) usan comillas simples/sin `;`; [App](../frontend/src/App.tsx) y [financial-utils](../frontend/src/lib/financial-utils.ts) usan dobles/con `;`. No hay formatter configurado; ESLint no fija esos estilos. | No inventar un estilo único ni reformatear archivos vecinos. Componentes PascalCase, archivos UI kebab-case y funciones Python snake_case. `outcome` es el enum heredado; no sustituirlo por expense sin migración. R03, R12. |
| H20 | ✅ P2 | [tsconfig.app.json](../frontend/tsconfig.app.json) y [tsconfig.node.json](../frontend/tsconfig.node.json) no activan strict ni heredan base strict; `tsc --showConfig` confirma ausencia, sí noUnused y bundler. Alias @ coincide en TS/Vite/components. | Build exitoso no demuestra strictNullChecks/noImplicitAny. No añadir casts para ocultar contratos; discutir activación incremental de strict y mantener aliases coordinados. R13. |

### Testing y observabilidad de calidad

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H21 | ❌ P2 | En [test_routes.py](../backend/tests/test_routes.py), los tests de summary pasan con period=wrong/net=999; el semanal solo exige payload no vacío; alerts pasa si siempre []; comparison pasa si neto siempre=0. B09-B11, sustitución temporal de helpers reales. | Son demostraciones de insensibilidad a regresiones, no bugs introducidos. Exigir resultados, particiones y contraejemplos que fallen cuando se rompe el requisito. R14. |
| H22 | ❌ P2 | Comparison test fija marzo 2025; con reloj 2026-10-04 ambos períodos quedan fuera del dataset y da ceros/null. [test_routes.py](../backend/tests/test_routes.py), B05. | La intención del test se degrada con el calendario aunque siga verde. Fixtures pequeños y reloj fijo para cálculos temporales. R07, R14. |
| H23 | ✅ P2 | Backend: 15 tests, cobertura 97% de líneas (192 statements, 5 sin cubrir). Frontend: 5 tests, reporte 100% líneas **solo financial-utils.ts**, 87.5% branches; no incluye App/componentes. Suite pasa en Los Ángeles pese a F01: fechas fixture no son día 1. | Cobertura alta no prueba contrato ni UI. Declarar alcance y casos límite; no anunciar 100% del frontend. No hay CI versionada en baseline. R14. |
| H24 | ✅ P2 | [conftest.py](../backend/tests/conftest.py) añade backend a sys.path; pytest se ejecuta sin packaging del proyecto. [package.json](../frontend/package.json) ofrece tests/build/lint/coverage; backend no tiene configuración de lint/typecheck. | Reutilizar runners reales y respetar directorio de ejecución. No suponer gates inexistentes. R14, R16. |

### DX, dependencias y configuración de desarrollo

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H25 | ✅ P2 | [frontend Dockerfile](../frontend/Dockerfile) ejecuta npm install aunque existe lockfile v3; [requirements.txt](../backend/requirements.txt) no fija versiones ni separa pytest/debugpy. Lockfile: 306 entradas con integrity, rangos raíz coinciden con manifest. | No confundir rangos manifest con versiones resueltas: React ^19.2.4 resuelve 19.2.5; Vite ^8.0.4 resuelve 8.0.8. Proponer npm ci en builds y estrategia Python reproducible antes de cambiar dependencias. R16. |
| H26 | ✅ P2 | Ambos Dockerfiles hacen COPY . .; no hay .dockerignore. [gitignore raíz](../.gitignore) ignora backend/.coverage, no .coverage raíz; pytest --cov desde raíz creó este último sin seguimiento. | Git ignore no filtra contexto Docker. Proponer exclusiones de artefactos y ejecutar cobertura con ruta explícita; no subir venv/cache ni borrar archivos ajenos. R16. |
| H27 | ✅ P2 | [Compose](../docker-compose.yml) efectivo usa depends_on=service_started, no healthcheck. [backend Dockerfile](../backend/Dockerfile) expone debugpy en 0.0.0.0:5678, Uvicorn reload; frontend ejecuta Vite dev. | No asumir API lista ni tratar stack dev como producción. Diagnosticar readiness y proxy por separado, sin cambiar red compartida. R17. |
| H28 | ✅ P2 | [vite.config](../frontend/vite.config.ts) apunta a backend:8000; [env example](../frontend/.env.example) dice que basta el proxy en local/Codespaces sin limitarlo a Docker, aunque los README ya aclaran ese requisito. | Desajuste documental pendiente de corregir al aprobar reglas. Diferenciar DNS Docker, localhost del navegador, URL reenviada y variable Vite de build. R17, R18. |

### Documentación y contexto para agentes

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H29 | ✅ P3 | [AGENTS.md](../AGENTS.md) exige revisar rules/skills/memory-bank; en baseline hay memoria de fase 1 pero no .agents. Los README proponen crear/refinar reglas. | Registrar ausencias en vez de inventar políticas o skills. Este commit crea un borrador de reglas, no skills ni normas aprobadas. R18. |
| H30 | ✅ P3 | [verification.md](../verification.md) distingue HTTP directo aprobado, proxy fallido y navegador pendiente; [README español](../README.es.md) y [inglés](../README.md) enlazan el mismo contexto. | Mantener historial y estado de evidencia: no reescribir fase 1 como si la fase 2 hubiese arreglado el proxy. Actualizar docs en ambos idiomas y commit por fase. R18. |

### Rendimiento y entrega de assets

| ID | Estado / prioridad | Hecho concreto y evidencia | Impacto / regla |
|---|---|---|---|
| H31 | ✅ P2 | `npm run build` con [package.json](../frontend/package.json) y [Vite](../frontend/vite.config.ts) produce un único bundle JS de 584.26 kB (175.20 kB gzip) y advierte por superar 500 kB. Los dos gráficos se importan estáticamente en [App](../frontend/src/App.tsx). | Es tamaño medido, no latencia/FCP medidos. Evaluar coste del bundle al añadir dependencias; no silenciar el aviso subiendo el límite ni imponer lazy-loading sin medir impacto de carga y UX. R19. |

## Inventario fichero a fichero (baseline completo)

`L` = lectura completa del texto manual; `G` = inspección estructural de
generado; `M` = metadatos/estructura de asset. La columna final enlaza
hallazgos pertinentes; un fichero sin defecto propio conserva su convención.

| # | Archivo | Método | Resultado / referencias |
|---|---|---|---|
| 1 | [.gitignore](../.gitignore) | L | Entornos y caches ignorados; .coverage raíz no cubierto. H26. |
| 2 | [AGENTS.md](../AGENTS.md) | L | Descubrimiento obligatorio de contexto; ubicaciones ausentes registradas. H29. |
| 3 | [README.es.md](../README.es.md) | L | Ejecución Docker y base navegador; enlaces fase 1. H28/H30. |
| 4 | [README.md](../README.md) | L | Paridad básica con español y limitación de proxy explícita. H30. |
| 5 | [backend/Dockerfile](../backend/Dockerfile) | L | Python 3.13, debugpy/reload, pip sin pins, COPY total. H25-H27. |
| 6 | [backend/app/__init__.py](../backend/app/__init__.py) | L | Marca paquete; sin lógica de inicialización. H24. |
| 7 | [backend/app/main.py](../backend/app/main.py) | L | App/CORS/router; no login. H01/H27. |
| 8 | [backend/app/routes.py](../backend/app/routes.py) | L | Modelos y nueve rutas; riesgos temporales/RNG/precondiciones. H01-H12. |
| 9 | [backend/requirements.txt](../backend/requirements.txt) | L | Seis dependencias sin versiones; runtime y tests mezclados. H25. |
| 10 | [backend/tests/conftest.py](../backend/tests/conftest.py) | L | Ajusta sys.path para tests. H24. |
| 11 | [backend/tests/test_routes.py](../backend/tests/test_routes.py) | L | 15 tests; comprobaciones débiles y fecha fija. H21-H23. |
| 12 | [docker-compose.yml](../docker-compose.yml) | L | Dos servicios, bind mounts, volumen node_modules, puertos y readiness. H27. |
| 13 | [frontend/.env.example](../frontend/.env.example) | L | Variable vacía; comentario ambiguo fuera de Docker. H28. |
| 14 | [frontend/.gitignore](../frontend/.gitignore) | L | Outputs JS y editor ignorados; no reemplaza dockerignore. H26. |
| 15 | [frontend/Dockerfile](../frontend/Dockerfile) | L | Node 24, npm install, Vite dev. H25/H27. |
| 16 | [frontend/components.json](../frontend/components.json) | L | shadcn new-york/tsx, aliases @; cssVariables=false mientras CSS manual usa tokens. No se probó regeneración shadcn. H17/H20. |
| 17 | [frontend/eslint.config.js](../frontend/eslint.config.js) | L | Reglas JS/TS/hooks/refresh para TS/TSX; sin política comillas/formatter. H19/H24. |
| 18 | [frontend/index.html](../frontend/index.html) | L | #root, main, favicon; title frontend/lang en. H16. |
| 19 | [frontend/package-lock.json](../frontend/package-lock.json) | G | 306 entradas; integridad y manifest alineados; no edición manual. H25. |
| 20 | [frontend/package.json](../frontend/package.json) | L | Scripts y stack; CVA declarado sin imports en src (no prueba de paquete eliminable). H24/H25. |
| 21 | [frontend/public/favicon.svg](../frontend/public/favicon.svg) | M | XML válido, 48×46, 96 elementos; enlazado desde HTML. H18. |
| 22 | [frontend/src/App.tsx](../frontend/src/App.tsx) | L | Fetch único, estados, periodo fijo, causa perdida. H02/H07/H14-H16. |
| 23 | [frontend/src/assets/hero.png](../frontend/src/assets/hero.png) | M | PNG RGBA 343×361, 44 919 bytes; sin referencias en src/config. H18. |
| 24 | [dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx) | L | h1 y período por prop con default 2024. H07/H19. |
| 25 | [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) | L | Empty si ningún importe positivo, skeleton, leyenda/tooltip en USD. H11/H17. |
| 26 | [kpi-card.tsx](../frontend/src/components/dashboard/kpi-card.tsx) | L | Variantes tipadas, cn, Skeleton, LucideIcon. H17. |
| 27 | [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx) | L | Cuatro métricas y formato central; null representa no cargado/error. H11/H15. |
| 28 | [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx) | L | Empty por valor cero, tooltip propio/ReferenceLine. H13. |
| 29 | [card.tsx](../frontend/src/components/ui/card.tsx) | L | ComponentProps, data-slot, cn; CardTitle div. H16/H17. |
| 30 | [skeleton.tsx](../frontend/src/components/ui/skeleton.tsx) | L | Primitive cn/animate-pulse sin estado accesible propio. H16/H17. |
| 31 | [frontend/src/index.css](../frontend/src/index.css) | L | Tailwind 4, light/dark, tokens; font Inter con fallback sin fuente importada. H17. |
| 32 | [financial-types.ts](../frontend/src/lib/financial-types.ts) | L | Tipos de contrato/derivados separados; no validación runtime. H04/H14. |
| 33 | [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) | L | Cinco tests; orden cross-year sin primer día de mes. H06/H23. |
| 34 | [financial-utils.ts](../frontend/src/lib/financial-utils.ts) | L | Fórmulas, fecha local, float y USD. H06/H11/H14. |
| 35 | [mock-data.ts](../frontend/src/lib/mock-data.ts) | L | Fixture 2024 no consumido por App. H18. |
| 36 | [utils.ts](../frontend/src/lib/utils.ts) | L | cn=twMerge(clsx); conflictos de clases resueltos. H17. |
| 37 | [frontend/src/main.tsx](../frontend/src/main.tsx) | L | React StrictMode; root assertion válida para HTML actual. H15. |
| 38 | [frontend/tsconfig.app.json](../frontend/tsconfig.app.json) | L | Alias, noUnused, JSX/bundler; strict ausente. H20. |
| 39 | [frontend/tsconfig.json](../frontend/tsconfig.json) | L | Referencias app/node, sin options heredadas. H20. |
| 40 | [frontend/tsconfig.node.json](../frontend/tsconfig.node.json) | L | Config Vite con types node; strict ausente. H20. |
| 41 | [frontend/vite.config.ts](../frontend/vite.config.ts) | L | React/Tailwind plugins, alias, proxy Docker. H20/H28. |
| 42 | [memory-bank/project-context.md](project-context.md) | L | Mapa/contratos/limitaciones históricos; no prueba visual. H30. |
| 43 | [verification.md](../verification.md) | L | Rastro de fase 1; fase 2 se añade sin borrar historial. H30. |

## Reproducción y resultados

Desde la raíz, con las dependencias existentes restauradas:

```bash
backend/.venv/bin/python verification/phase2_backend_probe.py
TZ=UTC node verification/phase2_frontend_probe.mjs
TZ=America/Los_Angeles node verification/phase2_frontend_probe.mjs
TZ=America/Los_Angeles npm --prefix frontend test
COVERAGE_FILE=backend/.coverage backend/.venv/bin/python -m pytest backend/tests/test_routes.py --cov=backend/app --cov-report=term-missing -q
npm --prefix frontend run test:coverage
frontend/node_modules/.bin/tsc --showConfig -p frontend/tsconfig.app.json
docker compose config --format json
```

Los [probes backend](../verification/phase2_backend_probe.py) usan TestClient,
reloj congelado y sustituciones temporales con unittest.mock, sin cambiar
fuentes ni mantener un servidor. Los [probes frontend](../verification/phase2_frontend_probe.mjs)
cargan módulos reales con Vite y renderToStaticMarkup; no necesitan puerto
HTTP ni paquetes nuevos. Se usa Vite porque Node directo no resuelve los
imports sin extensión del modo bundler (primer intento falló; no es defecto
del runtime web). Se desactiva el escaneo de dependencias solo en el probe
para cerrar limpiamente el servidor de módulos.

Resultado: B01-B12 reproducidos; F01-F03 en ambas zonas; F04-F07 en UTC.
La suite heredada sigue pasando 15+5, también con frontend en Los Ángeles.
La mutación de summary comprueba que el test semanal acepta un resultado
independiente del segmento, no que el filtro real esté roto.
Build y lint pasan; el build mantiene el aviso de tamaño H31. No se midieron
métricas de navegador ni rendimiento de carga.

No se retocaron reglas de negocio para pasar probes; no hubo actualización
de dependencias. Los archivos del baseline mantienen sus contenidos salvo
enlaces de navegación en los README y el rastro añadido a verification.

## Decisiones pendientes antes de convertir propuestas en política

1. Fecha/margen: definir tratamiento de ausencia de ingresos y datos vacíos.
2. Dominio financiero: confirmar USD, precisión contable, importes negativos
   y estrategia de redondeo antes de migrar tipos/unidades.
3. API: acordar rechazo de parámetros desconocidos y contrato de fechas
   invertidas/límites representables; no inventar un status sin aprobación.
4. Tooling: aprobar strict incremental, pins Python, dockerignore/readiness y
   gates CI; no añadir frameworks, formatter o infraestructura por inercia.
5. Proxy y accesibilidad: diagnóstico de red y prueba visual siguen pendientes.
   Ninguna regla draft demuestra que estos puntos estén resueltos.
