# Reglas propuestas - Fase 2

**Estado: BORRADOR PARA REVISIÓN.** Este archivo no activa nuevas políticas ni
autoriza corregir defectos, renombrar contratos o instalar herramientas.
Las propuestas se aceptarán/rechazarán expresamente en una fase posterior.
Consultar primero [AGENTS.md](../../AGENTS.md), el
[contexto](../../memory-bank/project-context.md) y el
[análisis con inventario completo](../../memory-bank/phase2-analysis.md).
En esta fase no hay skills locales que cargar.

Cada propuesta incluye un hecho del repositorio y una condición verificable.
`Hxx` identifica el hallazgo del análisis; `Bxx/Fxx`, su probe cuando existe.

## Arquitectura, API y naming

| Regla | Propuesta operativa | Hecho del repo / motivación | Verificación para adoptarla |
|---|---|---|---|
| R01 | Reutilizar helpers de dominio y componentes existentes antes de duplicar. Mantener handlers, cálculos y presentación con responsabilidades claras; extraer módulos cuando una necesidad concreta lo justifique, no como refactor global automático. | [routes.py](../../backend/app/routes.py) concentra modelos/generación/filtros/handlers; [App](../../frontend/src/App.tsx) agrega en cliente; mocks sin uso. H01/H02/H18. | El diff identifica helper reutilizado y prueba la ruta/consumidor afectado; cualquier extracción conserva contratos. |
| R02 | Para cambiar un endpoint, enumerar query params y forma JSON reales, con inputs válidos/invalidos/vacíos. No asumir que un parámetro documentado en otra ruta se aplica aquí; decidir precondiciones antes de admitir datos reales. | [routes.py](../../backend/app/routes.py) no declara business_type en metrics; query ignorada B01, facets vacíos y amount negativo B07/B12. H03/H05. | OpenAPI y tests de respuesta confirman campos, filtros y validación de la ruta modificada; rechazos de queries desconocidas solo con acuerdo explícito. |
| R03 | Preservar snake_case del JSON/Python, camelCase de derivados UI, PascalCase de componentes y kebab-case de archivos UI. Sincronizar modelos Python, tipos TS, fixtures y consumidores ante cambios de enum/campo; no renombrar `outcome` unilateralmente. | [modelos](../../backend/app/routes.py), [tipos TS](../../frontend/src/lib/financial-types.ts) y [kpi-row](../../frontend/src/components/dashboard/kpi-row.tsx) muestran esas convenciones. H04/H19. | Test contractual usa los mismos cinco campos y enums; búsqueda de referencias no deja nombres anteriores accidentalmente. |

## Fechas, dinero y generación

| Regla | Propuesta operativa | Hecho del repo / motivación | Verificación para adoptarla |
|---|---|---|---|
| R04 | Tratar `YYYY-MM-DD` como fecha civil, sin conversión UTC→local que cambie mes. Derivar período visible del dataset/filtro, no de un año fijo. | [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) desplaza enero a diciembre en Los Ángeles F01; [App](../../frontend/src/App.tsx) fija 2024 B06/F07. H06/H07. | La misma fixture del día 1 produce igual mes en UTC/Los Ángeles; cabecera y extremos del dataset concuerdan. |
| R05 | Centralizar validación de orden y representabilidad de fechas en todas las rutas afectadas. Devolver el error acordado por el contrato, nunca ceros/lista vacía para disfrazar input inválido. | [comparison y filtros](../../backend/app/routes.py) aceptan rangos invertidos B02 y date.min causa 500 B03. H08/H09. | Tests incluyen extremos inclusivos, inversión, un día, límite mínimo y ventana anterior no representable; status/cuerpo esperados explícitos. |
| R06 | Declarar moneda, precisión, redondeo y fórmulas antes de cambiar importes. Distinguir ratio de porcentaje y neto de ingresos; no imponer un cambio contable sin decisión. | [utils UI](../../frontend/src/lib/financial-utils.ts) usa floats/USD; [routes](../../backend/app/routes.py) redondea netos, delta_pct puede ser null y alertas usa `>` estricto B08/F02. H05/H11/H12. | Casos pequeños con céntimos, pérdidas, ingresos cero, previo negativo/cero y umbral exacto; reglas de dominio aprobadas y ambas capas consistentes. |
| R07 | Aislar reloj y RNG en generadores que deban ser deterministas. En tests temporales usar fecha fija o dataset controlado; no depender de `today()` ni del estado global de random. | [generate_mock_movements](../../backend/app/routes.py) muta RNG B04; [comparison test](../../backend/tests/test_routes.py) ya compara intervalos vacíos B05. H10/H22. | Dos generaciones independientes no contaminan estado; prueba de intercalación y período con datos conocidos pasan sin depender del día de ejecución. |

## UX, errores y componentes

| Regla | Propuesta operativa | Hecho del repo / motivación | Verificación para adoptarla |
|---|---|---|---|
| R08 | Representar por separado loading, error, vacío y resultado válido cero; decidir margen no definido sin confundirlo con ausencia de movimientos. | [ProfitPercentChart](../../frontend/src/components/dashboard/profit-percent-chart.tsx) renderiza vacío con ingresos=gastos=100 F04. H13. | Pruebas de componente para [], equilibrio, pérdidas, solo gastos y error; cero válido se visualiza y estado vacío queda inequívoco. |
| R09 | Validar el contrato recibido antes de calcular. Conservar causa diagnosticable de errores y mensaje útil para usuario, sin fallback mock ni catch silencioso. Al modificar requests diseñar cancelación/recuperación y probar efectos repetidos. | [App](../../frontend/src/App.tsx) no valida JSON y descarta causa; [helpers](../../frontend/src/lib/financial-utils.ts) discrepan con refund F03; StrictMode en [main](../../frontend/src/main.tsx). H14/H15. | Payload incompatible no genera métricas divergentes; HTTP/red/cálculo se diagnostican explícitamente; limpieza de efecto y recuperación verificadas al introducirlas. |
| R10 | Revisar semántica de headings, idioma y anuncio de estados cuando se modifique UX. CardTitle no equivale a h2; no declarar accesibilidad aprobada solo con atributos o SSR. | [CardTitle](../../frontend/src/components/ui/card.tsx) es div F05; [App](../../frontend/src/App.tsx) carece de alert/live; [HTML](../../frontend/index.html) lang=en/title=frontend. H16. | DOM con jerarquía de títulos, idioma consistente y aviso accesible; validación de teclado/lector y responsive documentada o marcada pendiente. |
| R11 | Reutilizar `cn`, Card, Skeleton y tokens CSS. Mantener props tipadas/data-slot y aliases coordinados; revisar antes de regenerar componentes con shadcn. | [cn](../../frontend/src/lib/utils.ts) resuelve px-6+px-4 F06; [CSS](../../frontend/src/index.css) usa tokens, [components.json](../../frontend/components.json) declara cssVariables=false. H17/H20. | Overrides conservan composición de clases; build/lint pasan; regeneración no elimina tokens ni cambia UX inadvertidamente. |

## Estilo, tipado y testing

| Regla | Propuesta operativa | Hecho del repo / motivación | Verificación para adoptarla |
|---|---|---|---|
| R12 | Mantener estilo local del archivo tocado; sin reformateo global ni formatter nuevo salvo decisión explícita. | [App](../../frontend/src/App.tsx) usa dobles/semicolon y [card](../../frontend/src/components/ui/card.tsx) simples/sin semicolon; [ESLint](../../frontend/eslint.config.js) no unifica formato. H19. | Diff limitado al cambio funcional/documental; lint existente correcto, sin ruido de archivos vecinos. |
| R13 | No confundir build TypeScript con modo strict. Preferir guardas/tipos reales y evitar casts que escondan incertidumbre; proponer strict de manera incremental y explícita. | [tsconfig app](../../frontend/tsconfig.app.json) y [node](../../frontend/tsconfig.node.json) no activan strict; aliases sí coinciden con Vite. H20. | Mostrar config efectiva; build sin nuevas evasiones; si se adopta strict, registrar y resolver errores de esa migración por separado. |
| R14 | Probar el requisito con datos y expectativas concretos: resultados aritméticos, filtros exactos, límites/422 y casos vacíos/negativos. Medir sensibilidad de las aserciones, no solo cobertura. Ejecutar el runner mínimo del área tocada y declarar su alcance. | [tests backend](../../backend/tests/test_routes.py) pasan con helpers rotos B09-B11; [tests UI](../../frontend/src/lib/financial-utils.test.ts) omiten día 1; coverage solo incluye utils. H21-H24. | La prueba falla si se desactiva el filtro o se devuelve cero/[] indebido; fixtures con reloj fijo; informe dice qué archivos/rutas/componentes se verificaron. |
| R15 | No introducir mocks como recuperación de producción, ni borrar assets/fixtures solo por falta de referencias. Nombrar y documentar sus usos de demo/test si se conservan. | [mock-data](../../frontend/src/lib/mock-data.ts) y [hero](../../frontend/src/assets/hero.png) no se consumen; [App](../../frontend/src/App.tsx) muestra un error, no fallback. H18. | Fallo de API sigue visible; referencias/uso revisados antes de eliminar; período del mock no contamina el dataset real. |

## DX, documentación y trabajo de agentes

| Regla | Propuesta operativa | Hecho del repo / motivación | Verificación para adoptarla |
|---|---|---|---|
| R16 | Usar lockfile y runners existentes; no editar lock manualmente ni actualizar paquetes para solucionar avisos ajenos. Proponer npm ci en builds y estrategia Python versionada. Excluir artefactos de Git y contexto Docker por mecanismos distintos. | [lock](../../frontend/package-lock.json) tiene integridad, [Dockerfile](../../frontend/Dockerfile) usa npm install, [requirements](../../backend/requirements.txt) sin pins; no dockerignore, [gitignore](../../.gitignore) no cubre .coverage raíz. H24-H26. | Install reproducible aprobado, manifest/lock alineados, outputs ignorados; usar `COVERAGE_FILE=backend/.coverage`; cambios de dependencias tienen validación propia. |
| R17 | Separar desarrollo Docker, ejecución host/Codespaces y producción. Verificar readiness y petición `/api` desde su consumidor; no tomar un health directo como prueba del proxy ni modificar redes compartidas para ocultar fallos. | [Compose](../../docker-compose.yml) solo espera service_started; [Vite](../../frontend/vite.config.ts) usa backend:8000; [Dockerfile backend](../../backend/Dockerfile) usa debugpy/reload. H27/H28, timeout de fase 1 pendiente. | UI+API+proxy comprobados por separado, VITE_API_BASE_URL alcanzable desde navegador y aplicada al build/arranque; debugger y servidor dev no se publican como producción sin diseño específico. |
| R18 | Antes de actuar, revisar instrucciones/skills/memoria disponibles; distinguir ausencia de regla y regla draft. Documentar hecho→evidencia→propuesta y estados confirmado/fallido/pendiente; mantener README ES/EN y un commit específico por fase, sin inventar verificaciones. | [AGENTS](../../AGENTS.md) exige descubrimiento; [verification](../../verification.md) conserva límites; [README ES](../../README.es.md)/[EN](../../README.md) enlazan contexto; [.env.example](../../frontend/.env.example) aún necesita aclaración Docker. H28-H30. | Enlaces válidos, rastro reproducible, commit acotado; discrepancias/políticas pendientes explícitas y ninguna propuesta presentada como aplicada. |

## Rendimiento

| Regla | Propuesta operativa | Hecho del repo / motivación | Verificación para adoptarla |
|---|---|---|---|
| R19 | Registrar tamaño del build cuando se añadan librerías o superficies UI; distinguir tamaño de tiempos medidos. Investigar splitting/carga diferida solo con evidencia, sin subir umbrales para hacer desaparecer el aviso. | [App](../../frontend/src/App.tsx) importa ambos gráficos; build con [Vite](../../frontend/vite.config.ts) genera JS 584.26 kB (>500 kB), gzip 175.20 kB. H31. | Comparar tamaños antes/después; si se optimiza, medir carga y comprobar skeleton/error/gráficos en navegador, sin declarar mejoría por el mero cambio de límite. |

## Cómo revisar este borrador

Para cada ID, registrar posteriormente **aceptar / ajustar / rechazar**, con
alcance y comprobación. Mantener las convenciones observadas separadas de
las correcciones deseadas. Adoptar R04/R05/R08, por ejemplo, requeriría
cambios y regresiones: esta fase únicamente demuestra por qué se proponen.
