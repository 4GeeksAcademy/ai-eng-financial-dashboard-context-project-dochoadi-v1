# Verificación: Vite y Next.js

Se revisó `frontend/package.json`.

- **Vite aparece:** sí. Está declarado como dependencia de desarrollo (`"vite": "^8.0.4"`) y se usa en los scripts `dev` (`vite`) y `build` (`tsc -b && vite build`).
- **Next.js aparece:** no. No figura como dependencia ni se usa en los scripts definidos.

**Conclusión:** el frontend usa Vite; no usa Next.js según `frontend/package.json`.
