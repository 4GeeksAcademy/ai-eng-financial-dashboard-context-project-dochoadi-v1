# Development environment

## Nombre

DX, dependencias y conexión de servicios. **Activa desde fase 3.**
Origen: R16-R17 del
[borrador histórico](../../memory-bank/archive/phase2-proposed-rules.md).

## Alcance

Dockerfiles/Compose, Vite/env, manifests y ejecución local/Codespaces.
No impone pins Python, dockerignore, healthchecks o producción nuevos sin
una tarea específica; evita confundir el stack actual con esas mejoras.

## Justificación

[Dockerfile frontend](../../frontend/Dockerfile) usa npm install pese al lock;
[requirements](../../backend/requirements.txt) no fija versiones (H25).
No hay dockerignore y `.coverage` raíz no está ignorado (H26).
[Compose](../../docker-compose.yml) no espera health y
[Vite](../../frontend/vite.config.ts) usa hostname Docker (H27/H28).

## Guía específica del proyecto

- Usar Node 24 y Python 3.13 como las imágenes; registrar diferencias del
  host si se verifica en otra versión, no fingir equivalencia.
- Restaurar frontend con `npm ci` y backend con venv e instalación de
  requirements si faltan dependencias. No actualizar manifiestos/lock
  para un cambio de texto/reglas; nunca editar lock a mano.
- En tareas de reproducibilidad, preferir npm ci en builds y acordar
  estrategia de versiones Python. Git ignore no filtra COPY/contexto
  Docker: revisar exclusiones expresamente en tareas de contenedores.
- Usar `COVERAGE_FILE=backend/.coverage` desde raíz; no versionar venv,
  node_modules, build, coverage ni archivos .env reales.
- En Compose, frontend proxy `/api` apunta a `http://backend:8000`.
  `backend` solo es DNS interno; no entregarlo como URL del navegador.
  `/health` no pasa por el proxy `/api`: comprobar API y proxy por separado.
- Sin Docker, configurar VITE_API_BASE_URL con origen backend alcanzable
  desde el navegador, sin `/api` ni barra final. En Codespaces usar URL
  reenviada cuando localhost no sea la máquina del navegador.
- Copiar [env example](../../frontend/.env.example) a `frontend/.env`;
  variables Vite se aplican al arrancar o compilar: reiniciar/recompilar
  tras modificarlas, no afirmar configuración dinámica del bundle.
- `depends_on` actual espera servicio arrancado, no API lista. Diagnosticar
  readiness y conectividad antes de modificar puertos/redes. No cambiar
  redes compartidas ni terminar procesos ajenos para resolver un timeout.
- Stack actual es dev: Vite dev, Uvicorn reload y debugpy en 5678. No
  presentarlo como producción ni habilitar debugger remoto públicamente
  como solución. Producción/reverse proxy requiere diseño y validación propia.
- Si se arranca una prueba, aislar recursos/puertos y verificar respuesta;
  limpiar solo recursos propios. No arrancar stack para validar una regla
  documental o título estático si no aporta evidencia necesaria.

### Ejemplo del código real

En [vite.config.ts](../../frontend/vite.config.ts):

```ts
proxy: {
  "/api": {
    target: "http://backend:8000",
    changeOrigin: true,
  },
},
```

En [App.tsx](../../frontend/src/App.tsx):

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
```

El resultado es `<base>/api/metrics`, no `<base>/metrics`.

### Comprobación requerida

Para cambios de entorno, `docker compose config --quiet` y checks reales
de las superficies afectadas (API directa, proxy y UI si corresponde).
Mantener el timeout histórico como pendiente hasta reproducir/diagnosticar
su causa; un build correcto no lo resuelve.
