# Fase 4 — Prueba en frío de las specs

Fecha: 2026-10-06. Alcance: `frontend/specs/` (brief, verification, tipos, `components.md`, README).

## Método

Un agente nuevo, sin el contexto de la conversación, hizo de desarrollador: leyó las specs y listó (1) requisitos del PM sin cubrir y (2) preguntas, ambigüedades y contradicciones que le impedirían construir las 3 funcionalidades. Tras cada ronda se corrigieron las specs y se repitió con otro agente. Ninguno implementó código.

| Ronda | Incumplimientos del brief | Bloqueantes | Menores |
|---|---|---|---|
| Inicial (revisión mía, sin agente) | 6 | 5 contradicciones + 18 ambigüedades/preguntas | — |
| 1 (agente solo con `specs/`) | 5 (4 dependían de backend o PM) | 3 | 12 |
| 2 (agente con acceso al código) | 0 (1 desviación consciente: D6) | **0** | 10 |

## Defectos corregidos

- **Contrato de `categories/top`** (antes imposible de tipar): array con `percentage_of_group` (0–100) y `group_total` por entrada (D2); `RequestState<T>` en `api-types.ts`.
- **Alertas:** semántica exacta de D1 y casos límite (D15): meses sin datos, baseline 0, rango que recorta el histórico, `>` estricto, tests mínimos de backend.
- **Contenedores y estado:** quién hace fetch, filtro global compartido, cancelación de peticiones obsoletas (D3, D7, D13).
- **Filtro:** cuándo se aplica, `type="date"`, facetas fallidas/inutilizables, textos con ambas fechas, `aria-invalid` (D7–D9, D14).
- **Zona existente del dashboard** con filtro (estados cargando/error/vacío) y `period` de la cabecera.
- **Umbral:** `onInvalidChange` en `AnomalyThresholdControl`; `threshold` pasa a `number`.
- **Gráfico F3:** prioridad de estados cuando un total carga, falla o es 0; variante de formato del eje Y.
- **Formato** es-ES y moneda (D10, D17); navegación por hash (D5); `GET /api/metrics` verificado en el código; referencias cruzadas y README alineados (D1–D17).

## Resultado final

- **Bloqueantes: 0** en la ronda 2. Las 3 funcionalidades son construibles solo con las specs.
- **Quedan dependencias externas, no dudas de diseño:**
  1. **Backend (en este repo):** D1 y D2 no están implementados; `percentage_of_group` sigue ❌ en `verification.md`. F2 no debe publicarse y F3 no puede integrarse hasta entonces (D16: se desarrolla con fixtures).
  2. **Decisiones marcadas PM sin confirmar:** D5 (pestañas por hash en vez de página/ruta), D6 (categorías por grupo salen de `categories/top`, no de las facetas, desviación del brief) y D17 (moneda).
- **Limitaciones aceptadas:** con filtro, los 3 primeros períodos del rango nunca alertan y un mes parcial en el borde puede dar una alerta engañosa (D15); una fecha a medio escribir en `type="date"` equivale a vacío.

## Qué no se ha comprobado

- Los 10 menores de la ronda 2 se corrigieron o se aceptaron **después** de esa ronda; **no se hizo una ronda 3** para confirmarlo.
- La API en marcha no se consultó: los hechos del backend (`/api/metrics`, algoritmo actual de alertas, facetas globales) se verificaron leyendo `backend/app/routes.py`.
- No se ejecutaron tests ni se escribió código de la aplicación.
- La suposición sobre `computeKPIs`/`computeMonthlyData` con lista vacía (no devuelven `NaN`) queda como test pendiente.
