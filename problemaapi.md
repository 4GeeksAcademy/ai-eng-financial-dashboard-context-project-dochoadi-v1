# Diagnóstico: Error de conexión API (proxy 502)

## 1. Síntoma

El frontend muestra el mensaje de error:

> "No se pudo cargar la información financiera. Revisa la API de backend."

Esto ocurre porque el proxy de Vite en el frontend intenta redirigir las peticiones `/api/*` al backend pero recibe **502 Bad Gateway**.

Log del frontend:

```
[vite] http proxy error: /api/metrics
Error: connect ETIMEDOUT 172.18.0.2:8000
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:2021:16)
```

## 2. Causa raíz

Las reglas de **nftables** de Docker en este Codespace bloquean el tráfico directo entre contenedores que están en el mismo bridge de Docker.

### Árbol de diagnóstico

```
Frontend container (172.18.0.3)
  ├── → backend:8000 (172.18.0.2) → ❌ TIMEOUT (bloqueado por nftables)
  ├── → 172.18.0.1:8000 (gateway/host) → ✅ Conexión exitosa
  ├── → 8.8.8.8:53 → ❌ TIMEOUT (sin acceso a internet)
  ├── → localhost:5173 → ✅ OK
  └── ping 172.18.0.2 → 100% packet loss

Backend container (172.18.0.2)
  ├── → localhost:8000 → ✅ OK
  ├── → 172.18.0.2:8000 → ✅ OK
  └── → sirve peticiones HTTP normalmente → ✅ OK
```

### Regla problemática en nftables

La tabla `ip filter` → chain `DOCKER` tiene esta regla **catch-all DROP** que bloquea cualquier tráfico entre contenedores en el bridge `br-f200c477345e` que no coincida con las reglas ACCEPT explícitas:

```text
chain DOCKER {
    ip daddr 172.18.0.3 iifname != "br-f200c477345e" oifname "br-f200c477345e" tcp dport 5173 accept
    ip daddr 172.18.0.2 iifname != "br-f200c477345e" oifname "br-f200c477345e" tcp dport 8000 accept
    ip daddr 172.18.0.2 iifname != "br-f200c477345e" oifname "br-f200c477345e" tcp dport 5678 accept
    iifname != "br-f200c477345e" oifname "br-f200c477345e" drop   # ← BLOQUEA tráfico entre contenedores
}
```

Las reglas ACCEPT sólo permiten tráfico **entrante desde fuera del bridge** (`iifname != "br-…"`), es decir, desde el host o desde internet. El tráfico **entre contenedores** dentro del mismo bridge tiene `iifname = "br-…"` y `oifname = "br-…"`, por lo que **no coincide** con ninguna regla ACCEPT y cae en el DROP general.

Adicionalmente, la tabla `ip raw` → chain `PREROUTING` hace DROP explícito de paquetes dirigidos a las IPs de los contenedores desde fuera del bridge:

```text
table ip raw {
    chain PREROUTING {
        type filter hook prerouting priority raw; policy accept;
        ip daddr 172.18.0.2 iifname != "br-f200c477345e" drop
        ip daddr 172.18.0.3 iifname != "br-f200c477345e" drop
    }
}
```

Esto es parte de la configuración de Docker para **proteger los contenedores** de tráfico no deseado. Sin embargo, también impide la comunicación entre contenedores en el mismo bridge.

### ¿Por qué no es un error de configuración del proyecto?

El proyecto está correctamente configurado:

- **`docker-compose.yml`**: Ambos servicios están en la misma red Docker por defecto.
- **`vite.config.ts`**: El proxy apunta a `http://backend:8000`, que es el hostname del servicio backend. El DNS interno resuelve correctamente (`backend → 172.18.0.2`).
- **Backend**: Escucha en `0.0.0.0:8000` y responde correctamente.

El problema es **exclusivo del entorno de ejecución** (GitHub Codespaces con Docker configurado de forma restrictiva), no del código del proyecto.

## 3. Opciones de solución

### Opción A (Recomendada para este entorno) — Proxy vía gateway del host

Modificar el `target` del proxy en `vite.config.ts` para que use la IP del gateway (`172.18.0.1`) en lugar del hostname `backend`. Docker expone el puerto 8000 del backend en `0.0.0.0:8000` del host, y el frontend **sí puede** conectar al host.

```diff
// frontend/vite.config.ts
  proxy: {
    "/api": {
-     target: "http://backend:8000",
+     target: "http://172.18.0.1:8000",
      changeOrigin: true,
    },
  },
```

**Ventajas**: Mínimo cambio, no requiere permisos especiales.
**Desventajas**: La IP del gateway puede cambiar entre entornos.

### Opción B — Usar `network_mode: "host"` en docker-compose

```yaml
services:
  frontend:
    network_mode: "host"
    # ...
```

El contenedor frontend usaría la red del host directamente, y podría acceder a `localhost:8000`.

**Ventajas**: Simple, no requiere cambiar IPs.
**Desventajas**: Rompe el aislamiento de red; puede causar conflictos de puertos; en algunos sistemas requiere más configuración.

### Opción C — Modificar reglas de nftables en el host

Agregar una regla ACCEPT explícita para tráfico entre contenedores dentro del bridge:

```bash
# Permitir tráfico entre contenedores en el bridge de la red docker
BRIDGE_IFACE="br-f200c477345e"
sudo nft add rule ip filter DOCKER iifname "$BRIDGE_IFACE" oifname "$BRIDGE_IFACE" accept
```

**Ventajas**: Soluciona la raíz del problema; todos los contenedores pueden comunicarse.
**Desventajas**: Requiere `sudo` (no siempre disponible en Codespaces); el cambio se pierde al reiniciar Docker; es menos seguro porque abre todo el tráfico entre contenedores.

### Opción D — Usar `extra_hosts` en docker-compose

Agregar una entrada en `extra_hosts` del servicio frontend para que resuelva `backend` apuntando a la IP del host (`172.18.0.1`):

```yaml
services:
  frontend:
    extra_hosts:
      - "backend:172.18.0.1"
```

Combinado con dejar el proxy apuntando a `http://backend:8000`, el nombre `backend` resolvería a la IP del host.

**Ventajas**: No requiere cambiar el `vite.config.ts`.
**Desventajas**: La IP del gateway es dinámica y puede variar.

### Opción E — Variable de entorno para la URL base del API

El proyecto ya define `VITE_API_BASE_URL` en `App.tsx`:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
```

Se puede pasar la variable al iniciar el contenedor frontend:

```bash
docker compose run -e VITE_API_BASE_URL=http://172.18.0.1:8000 frontend
```

**Ventajas**: No requiere cambios en configuración; enfoque estándar 12-factor app.
**Desventajas**: El proxy de Vite quedaría inactivo; las peticiones irían directo al backend.

## 4. Configuraciones relevantes del proyecto

### `frontend/vite.config.ts`

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://backend:8000",  // ← Línea problemática en este entorno
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### `frontend/src/App.tsx`

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  // ...
}
```

### `docker-compose.yml`

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
```

## 5. Pasos de verificación

Para verificar el diagnóstico en cualquier momento:

```bash
# 1. Verificar que el backend responde directamente
curl -s http://localhost:8000/health
# → {"status":"ok"}

# 2. Verificar IPs de los contenedores
docker ps -q | xargs -I{} docker inspect {} --format '{{.Name}} → {{range $k,$v := .NetworkSettings.Networks}}{{$v.IPAddress}} {{end}}'

# 3. Probar conectividad desde el frontend al backend
docker compose exec frontend nc -z -v -w 3 backend 8000
# → Operation timed out  (tráfico directo BLOQUEADO)

docker compose exec frontend nc -z -v -w 3 172.18.0.1 8000
# → open  (tráfico vía gateway OK)

# 4. Probar el proxy del frontend (debe dar 502 mientras no se aplique solución)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/api/metrics
# → 502
```

---

*Documentado el 2026-10-09 durante la verificación del proyecto.*