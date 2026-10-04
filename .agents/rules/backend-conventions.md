# Backend conventions

## Nombre

Convenciones de API, dominio y generación del backend. **Activa desde fase 3.**
Origen: R01-R03 y R05-R07 del
[borrador histórico](../../memory-bank/archive/phase2-proposed-rules.md).

## Alcance

[backend/app](../../backend/app), contratos con frontend y pruebas de rutas.
Aplicar a código nuevo o comportamiento que se modifique; no refactorizar
todo el router ni corregir hallazgos ajenos para cumplir la regla.

## Justificación

[routes.py](../../backend/app/routes.py) reúne modelos, generación y nueve
handlers (H01). `business_type` no filtra `/api/metrics` (H03); rangos
invertidos parecen exitosos y `date.min` rompe comparación (H08/H09).
El RNG es global y el reloj depende de hoy (H10); dinero usa float (H11).
Evidencia reproducida en [fase 2](../../memory-bank/phase2-analysis.md).

## Guía específica del proyecto

- Mantener `app.main:app` y `app.include_router(router)` como entradas.
  Añadir rutas en el router existente; extraer responsabilidades solo si
  el cambio lo necesita. Buscar helpers antes de duplicar filtros/cálculos.
- Antes de añadir health-check, comprobar `/health`: ya existe y responde
  `{"status":"ok"}`. Es liveness, no readiness de DB ni prueba del proxy.
  No crear una segunda ruta idéntica sin necesidad explícita.
- Python/JSON usan snake_case. Conservar `income/outcome`, `B2B/B2C`,
  categorías y los cinco campos de `FinancialMovement`. Si cambia contrato,
  actualizar [tipos TS](../../frontend/src/lib/financial-types.ts),
  consumidores, fixtures, OpenAPI y documentación en el mismo cambio.
- En rutas nuevas de dominio usar tipos y `response_model` como las rutas
  actuales. Declarar parámetros admitidos: no asumir que `business_type`
  está soportado por metrics porque sí aparece en summary.
- Al añadir/modificar filtros temporales, compartir validación de orden y
  representabilidad. No ocultar input inválido como `[]`, ceros o un catch
  amplio. Si el contrato de error no está definido, acordarlo antes de
  modificar status/cuerpo; conservar la inclusión de ambas fechas límite.
- Al evolucionar generación determinista, aislar RNG y reloj por llamada
  (por ejemplo `random.Random(seed)` pasado al generador), sin reseeding
  global. Probar aislamiento e intercalación; no cambiar distribución o
  dataset sin dejar la diferencia explícita.
- No migrar float a céntimos/Decimal, aceptar/rechazar importes negativos o
  cambiar USD sin decisión de dominio. Asegurar precondición o contrato
  explícito de dataset vacío si se conecta una fuente real a facets.
- Conservar beneficio=ingresos-gastos, delta respecto a `abs(previous_net)`
  y `delta_pct=None` cuando previo=0. `increase_ratio` es proporción y
  alertas compara estrictamente `>` contra media histórica de períodos
  presentes; no sustituir por `>=` o incluir meses vacíos por accidente.

### Ejemplo del código real

En [routes.py](../../backend/app/routes.py):

```python
@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

El patrón existente de dominio es
`@router.get("/api/metrics", response_model=list[FinancialMovement])`.
Los modelos usan `create_date`, `amount`, `operation_type`, `category` y
`business_type`; ese patrón es evidencia, no permiso para duplicar rutas.

### Comprobación requerida

Probar status y JSON exacto de la ruta afectada con TestClient; filtros y
aritmética con fixtures conocidas si se tocan. Aplicar
[testing-verification](testing-verification.md). Un health 200 no demuestra
que UI/proxy funcionen; registrar por separado esas comprobaciones.
