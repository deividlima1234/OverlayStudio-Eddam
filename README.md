# Eddam Overlay Studio 🎬⚽

**Plataforma Cloud de Composición Gráfica y Overlays en Tiempo Real para Streaming**  
*Impulsado por el motor EddamCore - System*

---

## 🌐 Enlaces de Producción (Render Cloud)

- **Panel de Control (Studio):** [https://eddam-studio.onrender.com](https://eddam-studio.onrender.com)
- **API & WebSockets:** [https://eddam-api.onrender.com](https://eddam-api.onrender.com)
- **Documentación Técnica Detallada:** [docs/documentacion_del_proyecto.md](docs/documentacion_del_proyecto.md)

---

## 📺 Overlays Activos y URLs para OBS Studio

| Proyecto | Tipo | Propósito | Enlace de Fuente de Navegador (OBS) |
|---|---|---|---|
| **Torneo Regional 2026 - Marcador** | `scoreboard` | Marcador con goles, cronómetro, repetición y gol animado | `https://eddam-studio.onrender.com/render/torneo-regional` |
| **Liga Pro eSports - Alineaciones** | `lineup` | Formaciones tácticas y alineaciones dinámicas de fútbol | `https://eddam-studio.onrender.com/render/liga-pro` |
| **Publicidad & Auspiciadores** | `publicidad` | Banner publicitario, sello superior, ticker inferior y popup | `https://eddam-studio.onrender.com/render/ad-publicidad` |

> **Recomendación para OBS:** Resolución de **1920x1080** y activar la opción *"Apagar fuente cuando no sea visible"*.

---

## 🚀 Arquitectura y Tecnologías

Monorepo estructurado con **pnpm workspaces**:

- **Frontend (`apps/web`):** React 19, TypeScript, Vite, Tailwind CSS, Zustand, Lucide React.
- **Backend API (`apps/api`):** Node.js, Fastify, `@fastify/websocket`, `@fastify/cors`, Drizzle ORM, PostgreSQL.
- **Renderizador (`apps/renderer`):** Motor de dibujo independiente para fuentes de navegador.
- **Librerías Compartidas (`packages/*`):** `database`, `shared`, `overlay-engine`, `design-tokens`, `config`.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar API Backend (puerto 3000)
pnpm --filter api run dev

# 3. Iniciar Frontend Web (puerto 5173)
pnpm --filter web run dev
```

---

## 📄 Licencia
Privado / Propietario — Eddam Overlay Studio.
