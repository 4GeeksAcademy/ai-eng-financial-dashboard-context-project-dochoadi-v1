# Testing and verification

## Nombre

Pruebas de requisitos y evidencia verificable. **Activa desde fase 3.**
Origen: R07, R14 y R18 del
[borrador histórico](../../memory-bank/archive/phase2-proposed-rules.md).

## Alcance

Pruebas backend/frontend, probes de caracterización, comprobaciones
documentales y rastro de cada fase. Los comandos se ejecutan desde la raíz
salvo que el ejemplo indique `cd`.

## Justificación

[tests backend](../../backend/tests/test_routes.py) pasan con net=999 o
detector vacío (H21); fechas fijas pueden quedar fuera del dataset (H22).
Cobertura frontend incluye solo utils, no App ni componentes (H23).
[Probes de fase 2](../../verification) reproducen esos hechos sin arreglarlos.

## Guía específica del proyecto

- Añadir regresión del requisito cambiado en el runner existente; no
  introducir framework/DOM/browser nuevo para un texto o ruta simple.
  Empezar por selectors/archivos afectados; ampliar por dependencias o fallo.
- Backend: TestClient, snake_case `test_*`, fixture pequeña y resultados
  conocidos. Comprobar status y JSON, no solo claves/no vacío.
- Frontend: Vitest `describe/it/expect` y helpers reales. Para texto HTML
  estático se puede leer el documento con Node fs en un test Vitest;
  comprobar contenido y las entradas que no deben cambiar.
- Tests temporales nuevos: reloj fijo o fixture controlada, día 1 del mes,
  cruce de año y zonas horarias. Test financiero: importes y redondeos
  esperados, cero/pérdidas y comparación con previo negativo/cero.
- Distinguir test de aceptación de probe histórico: los probes de fase 2
  esperan fallos existentes. Si se corrige ese fallo, actualizar la
  caracterización y añadir regresión con expectativa correcta.
- Un PASS de cobertura/mutación no es aprobación funcional: probar que
  aserciones detecten la ruptura concreta. No exigir mutación global para
  todo cambio; basta el contraejemplo pertinente.
- Documentación sin ejecución: verificar enlaces/estructura. No volver a
  compilar toda la app por cada microedición documental.
- No afirmar validación visual/accesibilidad, HTTP real o proxy cuando se
  ejecutó solo SSR/TestClient. Registrar ✅ verificado, ❌ fallido y ❓
  pendiente con comando, resultado y alcance en verification.
- Si el runner del editor no encuentra tests, usar runners del repositorio
  y registrar el motivo. Dependencias se restauran solo si faltan.

### Ejemplo del código real

En [test_routes.py](../../backend/tests/test_routes.py):

```python
response = client.get("/health")
assert response.status_code == 200
assert response.json() == {"status": "ok"}
```

En [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts),
`computeKPIs(sampleMovements)` se contrasta con totals/profit conocidos:
ese es el patrón a ampliar, no únicamente `assert payload`.

### Comandos del proyecto

```bash
backend/.venv/bin/python -m pytest backend/tests/test_routes.py -q
npm --prefix frontend test -- src/lib/financial-utils.test.ts
npm --prefix frontend run build
npm --prefix frontend run lint
COVERAGE_FILE=backend/.coverage backend/.venv/bin/python -m pytest backend/tests/test_routes.py --cov=backend/app --cov-report=term-missing -q
npm --prefix frontend run test:coverage
```

No reclamar 100% de cobertura del frontend: el reporte actual se limita a
`financial-utils.ts`. Usar selector del test nuevo en lugar de utils cuando
ese sea el archivo afectado; los comandos de coverage son opcionales, no un
gate universal para cambios de texto.
