# Verificación previa de skills (sin instalar)

Se revisó el contenido `SKILL.md` publicado para:

- [addyosmani/web-quality-skills — accessibility](https://skills.sh/addyosmani/web-quality-skills/accessibility) (fuente del repositorio: `skills/accessibility/SKILL.md`).
- [vercel-labs/agent-skills — vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) (fuente del repositorio: `skills/react-best-practices/SKILL.md`).

**No se instaló ninguna skill ni herramienta.** Esta revisión resume las instrucciones; no es una auditoría de la interfaz ni prueba de seguridad del repositorio completo.

## 1. Reglas que aplicarían

### Accessibility

- Orienta a evaluar accesibilidad con principios POUR y criterios WCAG 2.2: contenido perceptible, interfaz operable, comprensible y robusta.
- Propone un flujo basado en evidencia: auditar una página renderizada, localizar los nodos con problemas, revisar árbol de accesibilidad y flujo con teclado, corregir la fuente y repetir las comprobaciones.
- Incluye pautas para texto alternativo, nombres accesibles de botones con iconos, contraste, no depender solo del color, controles nativos, operación por teclado, foco visible/no oculto, enlaces para saltar contenido, tamaño de objetivos, movimiento reducido, idioma, etiquetas de formularios, errores anunciados y uso correcto de ARIA.
- Pide complementar las comprobaciones automáticas con teclado, lector de pantalla, zoom, alto contraste, movimiento reducido y orden del foco. Advierte correctamente que una puntuación automática no demuestra conformidad WCAG.

### Vercel React Best Practices

- Reúne 70 recomendaciones de rendimiento React/Next.js ordenadas en ocho categorías: evitar esperas en cascada, reducir bundles, rendimiento de servidor, carga de datos en cliente, renders, renderizado, JavaScript y patrones avanzados.
- Algunas sugerencias son paralelizar operaciones independientes, importar módulos de forma directa, diferir cargas pesadas/terceros, evitar renders y cálculos innecesarios, y optimizar listeners, colecciones e iteraciones.
- Está concebida como guía al escribir, revisar o refactorizar React/Next.js. No requiere aplicar todas las reglas automáticamente: cada una debería contrastarse con el flujo y la arquitectura existentes.

## 2. Archivos del proyecto que podría leer o modificar

Los documentos **no enumeran archivos concretos de este proyecto ni autorizan cambios automáticamente**. Según el problema que se investigue, el agente probablemente leería:

- `frontend/src/App.tsx` — carga de datos, estados de error y composición de la página.
- `frontend/src/components/dashboard/` — componentes React y gráficos.
- `frontend/src/components/ui/` — primitives y semántica de controles.
- `frontend/src/index.css` — estilos, contraste, foco y movimiento reducido.
- `frontend/index.html` — idioma y estructura de entrada.
- `frontend/package.json` — dependencias, scripts y build.
- Para rendimiento de cálculos, módulos en `frontend/src/lib/`; para comprobar regresiones, pruebas relevantes bajo `frontend/src/`.

Si se aplicaran correcciones, podría modificar solo los archivos fuente/test relacionados con problemas verificados. No hay motivo derivado de estas skills para editar `backend/`, instalar un framework nuevo o reestructurar toda la app. La guía Vercel también remite a archivos `rules/*.md` del repositorio de la skill; esos archivos no forman parte del proyecto actual y no se descargaron como parte de esta revisión.

## 3. Scripts, comandos y descargas

- El `SKILL.md` de **accessibility** incluye comandos sugeridos para ejecutar una auditoría externa:
  - `npx lighthouse <URL> --only-categories=accessibility`
  - `npm install @axe-core/cli -g` y después `axe <URL>`.
  Son comandos propuestos por la guía, **no ejecutados**. El segundo instala un paquete global y no debe correrse sin decidirlo expresamente.
- También sugiere usar `lighthouse_audit` y `take_snapshot` si está disponible Chrome DevTools MCP, además de pruebas manuales.
- **Vercel React Best Practices** no incluye un script de instalación ni comandos de shell dentro del `SKILL.md` revisado. Explica que para detalles se lean archivos de reglas individuales y cita `AGENTS.md` como documento compilado; no se obtuvieron esos archivos.
- No se descargaron archivos al repositorio ni se ejecutaron auditorías. Se consultó contenido remoto en modo lectura.

## 4. Observaciones: sospechoso o fuera de lugar

- **No encontré instrucciones manifiestamente maliciosas** en los dos `SKILL.md` revisados: no piden secretos, envío de datos, ejecución oculta ni cambios destructivos. Esto no es una auditoría de cada archivo enlazado ni una garantía de seguridad del origen.
- **Desajuste de alcance importante:** el proyecto es React + TypeScript con Vite, no Next.js. Las recomendaciones generales de React pueden ser pertinentes, pero reglas como `next/dynamic`, React Server Components, Server Actions, `React.cache()` de servidor y patrones de rutas/API de Next no aplican directamente a esta SPA y no deben introducirse por inercia.
- Las recomendaciones de rendimiento son una guía amplia. Añadir memoización, librerías o cambiar cargas sin medir el caso real puede aumentar complejidad o no aportar valor. Conviene conservar las reglas locales y verificar el bundle/comportamiento afectado.
- La guía de accesibilidad presenta los niveles A/AA/AAA como objetivos generales («must/should/nice to have»). Eso es una simplificación editorial, no una determinación de obligación legal o contractual para este producto; acordar el objetivo de conformidad según el contexto.
- Los ejemplos usan una URL genérica `https://example.com` y sugieren instalar herramientas globales. Antes de auditar habría que usar una URL local/desplegada autorizada y decidir la instalación; no copiar esos comandos ciegamente.
- `skills.sh` es una página que muestra la skill; la lectura de una página por sí sola no equivale a validar todo el contenido del repositorio de origen. Esta revisión tomó el Markdown fuente para las dos skills indicadas y no inspeccionó dependencias, referencias completas, historial ni procedencia más allá de esas fuentes.

## Conclusión

La skill de accesibilidad parece potencialmente útil para una revisión acotada de la UI. La guía de Vercel tiene algunas prácticas React aprovechables, pero contiene un bloque de recomendaciones Next.js que no corresponde a este stack. Si se consideran para incorporación, conviene revisar y delimitar su aplicación, mantener la auditoría basada en evidencia y no ejecutar instalaciones/comandos sin aprobación.
