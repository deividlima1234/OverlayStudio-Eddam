# Eddam Overlay Studio — Documentación Técnica y Estado del Proyecto

> **Plataforma Cloud de Composición Gráfica y Overlays en Tiempo Real para Streaming**  
> **Motor Tecnológico:** EddamCore - System  
> **Repositorio Oficial:** `git@github.com:deividlima1234/OverlayStudio-Eddam.git`  
> **Versión Actual:** 1.2.0  
> **Fecha de Actualización:** Octubre 2026  

---

## 1. Resumen Ejecutivo y Estado Actual

**Eddam Overlay Studio** es una plataforma web modular diseñada para crear, personalizar, administrar y transmitir gráficos (overlays) en tiempo real para eventos deportivos y transmisiones en vivo (OBS Studio, PRISM Live Studio, vMix).

El proyecto se encuentra desplegado y operativo en la nube mediante **Render**:
- **Frontend Studio & Renderizador:** [https://eddam-studio.onrender.com](https://eddam-studio.onrender.com)
- **Backend API REST & WebSockets:** [https://eddam-api.onrender.com](https://eddam-api.onrender.com)
- **Base de Datos:** PostgreSQL administrado (`eddam_db`).

---

## 2. Arquitectura del Monorepo

El proyecto está organizado como un **monorepo** gestionado con `pnpm workspaces`:

```text
OverlayStudio-Eddam/
├── apps/
│   ├── web/               # Panel Administrativo (Studio), Editor y Renderizador web
│   │   ├── src/
│   │   │   ├── components/# Componentes de overlays (Scoreboard, Lineup, Ad, Ticker, etc.)
│   │   │   ├── pages/     # Dashboard.tsx, Editor.tsx, OverlayRender.tsx
│   │   │   ├── store/     # useOverlayStore.ts (Zustand + WebSocket)
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   ├── api/               # Servidor Backend (Fastify + WebSockets + Drizzle ORM)
│   │   ├── src/
│   │   │   ├── db/        # index.ts, schema.ts
│   │   │   └── server.ts  # Rutas REST, salas WebSocket y CORS
│   │   └── package.json
│   │
│   └── renderer/          # Entorno runtime dedicado para renderizado OBS
│       └── package.json
│
├── packages/
│   ├── database/          # Esquemas Drizzle y migraciones
│   ├── shared/            # Interfaces, tipos TypeScript y utilidades
│   ├── overlay-engine/    # Motor de composición gráfica
│   ├── design-tokens/     # Tokens de diseño y colores
│   └── config/            # Configuraciones base compartidas
│
├── docs/                  # Documentación técnica y expediente
│   ├── expediente.md
│   └── documentacion_del_proyecto.md
│
├── render.yaml            # Infraestructura como código (IaC) para Render
├── pnpm-workspace.yaml    # Configuración de espacios de trabajo pnpm
└── package.json           # Configuración raíz
```

---

## 3. Stack Tecnológico

| Capa | Tecnologías | Descripción |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React | Interfaz reactiva, rápida y ligera |
| **Estado Global** | Zustand | Gestión de estado centralizado para controles y overlays |
| **Tiempo Real** | WebSockets (`ws`, `@fastify/websocket`) | Comunicación bidireccional de baja latencia entre operador y OBS |
| **Backend API** | Node.js (v22+), Fastify | Servidor HTTP de alto rendimiento |
| **Base de Datos** | PostgreSQL, Drizzle ORM | Persistencia relacional de configuraciones JSONB y proyectos |
| **Gestor de Paquetes** | pnpm (v12+) | Instalación eficiente de monorepo |
| **Despliegue** | Render Cloud (`render.yaml`) | Despliegue continuo sincronizado con GitHub |

---

## 4. Proyectos Activos en Producción y Enlaces OBS

Actualmente la base de datos de producción cuenta con 3 proyectos categorizados con sus propósitos y módulos asignados:

| Proyecto | ID / Slug | Tipo | Propósito y Módulos Activos | URL de Fuente de Navegador (OBS) |
|---|---|---|---|---|
| **Torneo Regional 2026 - Marcador** | `torneo-regional` | `scoreboard` | • Marcador de Fútbol en vivo (Goles, Tiempos, Cronómetro)<br>• Animación visual ¡GOOOL!<br>• Placa de Repetición (Replay) | `https://eddam-studio.onrender.com/render/torneo-regional` |
| **Liga Pro eSports - Alineaciones** | `liga-pro` | `lineup` | • Esquema táctico dinámico en cancha (Fútbol 9 / 11)<br>• Lista de jugadores titulares y banca<br>• Placa de Repetición (Replay) | `https://eddam-studio.onrender.com/render/liga-pro` |
| **Publicidad & Auspiciadores** | `ad-publicidad` | `publicidad` | • Banner de publicidad rotativo o estático (AdOverlay)<br>• Sello Auspiciador en esquina superior derecha<br>• Ticker / Cinta continua inferior<br>• Pop-up promocional lateral | `https://eddam-studio.onrender.com/render/ad-publicidad` |

---

## 5. Overlays y Módulos Desarrollados

### 5.1. Marcador Deportivo (`Scoreboard.tsx`)
- Nombres, abreviaturas y logotipos de equipos en alta resolución.
- Personalización en tiempo real de colores primarios y colores de texto por equipo.
- Cronómetro con inicio, pausa, reseteo y ajuste manual de minutos.
- Control de goles con animación automática `¡GOOOL!`.
- Botón de Repetición (Replay) con animación de entrada/salida temporizada.

### 5.2. Alineaciones Tácticas (`Lineup.tsx`)
- Modos de juego: Fútbol 11, Fútbol 9, Fútbol 7 y Fútbol 5.
- Formaciones tácticas preestablecidas (ej. 4-3-3, 4-3-1, 4-4-2).
- Asignación de dorsales y nombres para cada posición en el campo.
- Sección dedicada a jugadores suplentes / banca.

### 5.3. Módulo Publicitario y Auspicios
- **`AdOverlay.tsx`:** Anuncio publicitario con título, subtítulo, descripción y contacto, configurable en modo estático o bucle (`loop`) con tiempos de visibilidad y ocultación.
- **`SponsorOverlay.tsx`:** Sello o logotipo flotante en la esquina superior derecha con control de desplazamiento (Offset X/Y) y escala.
- **`TickerOverlay.tsx`:** Cinta inferior deslizante continua para noticias, agradecimientos o redes sociales.
- **`PopupOverlay.tsx`:** Pop-up promocional lateral con imagen y texto de oferta.

---

## 6. Hitos y Soluciones Implementadas Recientemente

### 6.1. Corrección Crítica de Eliminación y CORS Preflight
- **Problema previo:** El botón "Eliminar" en las tarjetas del Dashboard abría el modal de confirmación pero no eliminaba el proyecto, bloqueando la acción sin dar respuesta al usuario.
- **Causa identificada:** `@fastify/cors` en [`apps/api/src/server.ts`](file:///home/eddam/Proyectos/OverlayStudio-Eddam/apps/api/src/server.ts) solo permitía por defecto `GET, HEAD, POST`. Las peticiones preflight `OPTIONS` para el método `DELETE` eran rechazadas por las políticas de CORS del navegador.
- **Solución implementada:** Se configuró explícitamente la lista completa de métodos autorizados (`GET, POST, PUT, DELETE, PATCH, OPTIONS`) y cabeceras permitidas en el servidor Fastify.

### 6.2. Sistema de Notificaciones Toast y Estados de Carga
- En [`apps/web/src/pages/Dashboard.tsx`](file:///home/eddam/Proyectos/OverlayStudio-Eddam/apps/web/src/pages/Dashboard.tsx):
  - Se agregó el estado `isDeleting` con deshabilitación de botones y texto dinámico (`"Eliminando..."`).
  - Se implementó un componente flotante de **Toast** animado para confirmar éxito o detallar cualquier error de red/servidor.
  - Se aplicaron actualizaciones funcionales (`setProjects(prev => ...)`) para evitar estados desactualizados.

### 6.3. Responsividad Mobile-First Integral
- **Encabezado Adaptable:** Distribución flexible vertical en móviles (`flex-col`) y horizontal en pantallas grandes (`sm:flex-row`), con botón táctil ancho (`w-full sm:w-auto`).
- **Tarjetas Fluidas:** Grid de 1 columna en móviles, 2 en tablets y 3 en desktop, con botones de configuración y eliminación protegidos contra toques accidentales.
- **Modales Adaptables:** Eliminación de anchos fijos rígidos (`w-[550px]`/`w-[400px]`), reemplazados por contenedores responsivos con scroll vertical automático y campos de copiado de URL apilables.
- **Toasts Adaptables:** Anclados en pantalla con márgenes seguros para dispositivos móviles.

### 6.4. Saneamiento y Tipado de Proyectos en Base de Datos
- **Problema:** Debido a un valor estático en versiones anteriores de `Editor.tsx`, todos los proyectos se sobreescribían con el nombre `"Marcador Personalizado"`.
- **Solución:** Se corrigió el guardado en el Editor, se migraron los registros en la base de datos de producción asignando los nombres y tipos correctos (`scoreboard`, `lineup`, `publicidad`), y se simplificó el ID de publicidad a `ad-publicidad`.

---

## 7. Guía de Ejecución y Despliegue

### 7.1. Requisitos Previos
- Node.js versión `>= 20.0.0`
- pnpm versión `>= 10.0.0` (recomendado v12.10.1)
- PostgreSQL (local o remoto)

### 7.2. Variables de Entorno (`.env`)
```env
# Base de Datos
DATABASE_URL=postgres://usuario:password@localhost:5432/eddam_overlay_studio

# Servidor API
PORT=3000
HOST=0.0.0.0

# Frontend
VITE_API_URL=https://eddam-api.onrender.com # o http://localhost:3000 en local
```

### 7.3. Comandos Principales
```bash
# Instalar todas las dependencias del monorepo
pnpm install

# Compilar todos los paquetes
pnpm --filter api run build
pnpm --filter web run build

# Ejecutar el frontend en modo desarrollo
pnpm --filter web run dev

# Ejecutar la API en modo desarrollo con recarga automática
pnpm --filter api run dev
```

### 7.4. Configuración en OBS Studio
1. Añadir una fuente de **Navegador** en OBS Studio.
2. Ingresar la URL correspondiente (ej. `https://eddam-studio.onrender.com/render/torneo-regional`).
3. Ancho: `1920` / Alto: `1080`.
4. Marcar la casilla **"Apagar fuente cuando no sea visible"**.
5. Marcar **"Actualizar el navegador cuando la escena se active"** si se desea sincronización limpia al cambiar de escena.
