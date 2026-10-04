# Frontend structure

## Nombre

Estructura, contratos y UX del frontend. **Activa desde fase 3.**
Origen: R01, R03-R04, R08-R13, R15 y R19 del
[borrador histórico](../../memory-bank/archive/phase2-proposed-rules.md).

## Alcance

[frontend/src](../../frontend/src), [index.html](../../frontend/index.html),
aliases/configuración UI y textos visibles, incluido el título de pestaña.
Aplicar al área modificada; un cambio de texto no autoriza reescribir fetch,
fórmulas, estilos, idioma global o infraestructura.

## Justificación

[App](../../frontend/src/App.tsx) compone una pantalla y consume metrics
(H02). [cn](../../frontend/src/lib/utils.ts) resuelve clases y CSS centraliza
tokens (H17). Hay estilo local mixto (H19), fechas desplazadas por timezone
(H06), cero tratado como vacío (H13), JSON sin guarda (H14) y título HTML
genérico (H16). [Análisis](../../memory-bank/phase2-analysis.md).

## Guía específica del proyecto

- Conservar `index.html -> main.tsx -> App`; no añadir router/páginas o
  cliente API global si un ajuste localizado basta.
- Componentes PascalCase en archivos kebab-case de `components/dashboard`;
  primitives en `components/ui`, fórmulas en `lib/financial-utils.ts` y
  contratos en `lib/financial-types.ts`. Reutilizar antes de duplicar.
- Usar `@/` para imports internos como los componentes actuales. Mantener
  aliases coordinados en TS, Vite y components.json si se modifican.
  Separar tipos JSON snake_case de métricas derivadas camelCase.
- Reutilizar Card, Skeleton, `cn` y tokens CSS; preservar ComponentProps y
  data-slot. No regenerar shadcn sin revisar que `cssVariables=false` no
  sobrescriba los tokens manuales.
- Mantener comillas/semicolons locales del archivo; no imponer formato
  global. No añadir `any`/casts para ocultar contratos. TypeScript actual
  no es strict: una migración de strict requiere alcance propio.
- Texto: conservar idioma del área; UI/HTML son principalmente inglés,
  el error actual está en español. Para cambiar title, editar únicamente
  `<title>`: mantener `#root`, `/src/main.tsx`, favicon, viewport y lang.
  No añadir año fijo ni afirmar datos reales en un título de la demo.
- En cambios de fechas, tratar ISO date-only sin UTC→local que cambie mes;
  probar día 1 en UTC y Los Ángeles. Derivar período de datos/filtros, no
  de `2024` hardcodeado. No arreglarlo como efecto secundario de otro texto.
- Al tocar gráficos/estados, separar loading, error, vacío y cero válido;
  decidir margen sin ingresos antes de cambiar fórmula. No usar valores
  cero para detectar ausencia de movimientos.
- Al modificar la carga/API, validar JSON antes de cálculos, conservar
  causa diagnosticable y mensaje útil, probar limpieza de efectos con
  StrictMode y recuperación. No sustituir error con mock silencioso.
- Revisar headings/idioma/anuncio de estados al tocar sus componentes.
  CardTitle es div, no h2; SSR no certifica teclado/lector/contraste.
  Un cambio del título no exige rediseñar CardTitle ni los gráficos.
- No eliminar mocks/assets sin comprobar uso ni usar fixture 2024 como
  fuente actual. Para nuevas librerías/superficies registrar tamaño del
  build y medir antes de optimizar; no subir el límite del aviso >500 kB.

### Ejemplos del código real

En [kpi-row.tsx](../../frontend/src/components/dashboard/kpi-row.tsx):

```tsx
import { formatCurrency, formatPercent } from '@/lib/financial-utils'
```

En [utils.ts](../../frontend/src/lib/utils.ts):

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

En [index.html](../../frontend/index.html), conservar
`<div id="root"></div>` y
`<script type="module" src="/src/main.tsx"></script>` al ajustar el título.

### Comprobación requerida

Para texto, aserción del texto exacto y preservación de entradas en el
documento/componente real; para comportamiento, regresión correspondiente.
Usar Vitest y build/lint existentes según
[testing-verification](testing-verification.md). Revisar también el título
del HTML compilado cuando se cambie el documento de entrada.
