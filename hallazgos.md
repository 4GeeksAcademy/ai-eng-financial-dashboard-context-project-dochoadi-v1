# Hallazgos de accesibilidad del portal

**Fecha:** 2026-10-08
**Rama:** `feature/agent-skills`
**Alcance:** auditoría estática del frontend y cambios acotados de accesibilidad. Esta documentación no declara conformidad WCAG ni sustituye pruebas en navegador o con tecnologías de asistencia.

## Resumen

Se identificaron seis puntos para revisar. Tras la valoración de los hallazgos, se aplicaron únicamente los cambios #3–#6. El #1 requiere inspeccionar primero el gráfico renderizado; el #2 sigue pendiente y no se añadió una alerta automática al error.

| # | Hallazgo | Estado actual | Cambio / decisión |
|---:|---|---|---|
| 1 | Alternativa textual para los gráficos | ❓ Pendiente de inspección | No se añadió resumen ni tabla sin inspeccionar antes el árbol accesible de Recharts y determinar qué alternativa hace falta. |
| 2 | Aviso accesible del error asíncrono | ❓ Pendiente | El mensaje visible permanece en un `div` normal; no se agregó `role="alert"` ni región viva. Probar si se anuncia y evitar anuncios duplicados antes de corregirlo. |
| 3 | Títulos de gráficos no semánticos | ✅ Aplicado en código | `CardTitle` ahora renderiza un `<h2>`, lo que permite navegar por encabezados. |
| 4 | Estado de carga no anunciado | ✅ Aplicado en código; ❓ validación manual pendiente | `App.tsx` expone “Loading financial metrics” mediante `<p className="sr-only" role="status">` mientras carga. No se probó todavía con lector de pantalla. |
| 5 | Idioma del error distinto al idioma de página | ✅ Aplicado en código | El contenedor del mensaje en español declara `lang="es"`; el idioma global del documento no se cambió. |
| 6 | Animación del skeleton sin preferencia de movimiento reducido | ✅ Aplicado en código | `frontend/src/index.css` incluye una regla `prefers-reduced-motion: reduce` para desactivar la animación. Falta comprobarlo visualmente con la preferencia activa. |

## Detalle y pruebas manuales pendientes

### 1. Gráficos — alternativa textual (WCAG 1.1)

**Ubicación:** `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`.

La revisión de fuente no permite concluir qué nombres, datos y navegación expone Recharts en el SVG renderizado. Antes de decidir si se necesita una descripción, tabla u otra alternativa, inspeccionar el árbol de accesibilidad del navegador y el comportamiento del gráfico con tecnologías de asistencia. Evitar duplicar contenido innecesariamente.

**Probar:** abrir ambos gráficos en el portal y revisar sus roles, nombres, datos y navegación con el árbol accesible y un lector de pantalla. Registrar qué información no está disponible antes de proponer una alternativa.

### 2. Error de API asíncrono — anuncio (WCAG 4.1.3; gestión de errores)

**Ubicación:** `frontend/src/App.tsx`.

Al fallar la petición, el portal muestra “No se pudo cargar la informacion financiera. Revisa la API de backend.” El cambio de accesibilidad de esta ronda no añadió `role="alert"` ni una región viva para ese error.

**Probar:** detener o hacer fallar la API, observar si un lector de pantalla anuncia el texto una vez, y confirmar que el foco no se mueve de forma inesperada. Si no se anuncia, decidir una región viva adecuada conservando el mensaje visible.

### 3. Encabezados — aplicado

**Ubicación:** `frontend/src/components/ui/card.tsx`.

`CardTitle` ahora produce `<h2>` en vez de `div`. Los títulos de los dos gráficos usan ese componente. La comprobación manual debe confirmar que el orden de encabezados de la página es coherente (título principal y encabezados de gráficos); la comprobación de código no certifica por sí sola el árbol renderizado.

### 4. Carga — aplicado, falta tecnología de asistencia

**Ubicación:** `frontend/src/App.tsx`.

Durante la carga se expone un mensaje breve con `role="status"`, oculto visualmente mediante `sr-only`.

**Probar:** recargar con lector de pantalla y verificar que el estado se anuncia al comenzar, no se repite por cada skeleton y que después se puede navegar por los resultados. Confirmar también que el texto no aparece visualmente.

### 5. Idioma del mensaje de error — aplicado

**Ubicación:** `frontend/src/App.tsx`; documento global en `frontend/index.html`.

El mensaje español está delimitado con `lang="es"`, sin cambiar el `lang` global de la página.

**Probar:** provocar el error y verificar con lector de pantalla que el fragmento se pronuncia usando las reglas de español, sin afectar el resto de la página.

### 6. Movimiento reducido — aplicado, falta comprobación visual

**Ubicación:** `frontend/src/index.css`; skeletons en `frontend/src/components/ui/skeleton.tsx`.

La hoja de estilos contiene una excepción para `prefers-reduced-motion: reduce` que desactiva el pulso.

**Probar:** activar “Reducir movimiento” en el sistema operativo o emular la preferencia en DevTools, recargar durante la carga y confirmar que el skeleton no se anima. Desactivar la preferencia y confirmar que el comportamiento normal se conserva.

## Evidencia de verificación disponible

Las siguientes ejecuciones se realizaron en el contenedor frontend existente (no en la instalación local, donde faltaban dependencias):

| Comprobación | Resultado reportado | Alcance / límite |
|---|---|---|
| Vitest: `npm test` | ✅ 6 pruebas pasan | Regresiones automatizadas existentes; no equivalen a pruebas de lector de pantalla ni navegador. |
| Build: `npm run build` | ✅ Completa | Se mantiene el aviso de bundle JavaScript superior a 500 kB; no se midió rendimiento. |
| Lint: `npm run lint` | ✅ Completa | Comprueba lint, no comportamiento de accesibilidad renderizado. |
| Inspección estática de los cambios | ✅ | Se verificaron en fuente el `<h2>`, `role="status"`, `lang="es"` y la media query de movimiento reducido. |
| Lighthouse/axe, árbol accesible, teclado y lector de pantalla | ❓ No ejecutados | No se declara aprobación visual, WCAG ni compatibilidad completa con tecnologías de asistencia. |

## Alcance que no se afirma

Esta ronda no modificó el contenido de los gráficos (#1) ni el anuncio automático del error (#2). Tampoco validó contraste completo de gráficos/estados, navegación por teclado de Recharts, zoom, responsive, foco, alto contraste o comportamiento real con lector de pantalla. Los hallazgos describen evidencia estática y cambios concretos, no una certificación de conformidad.
