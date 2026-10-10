
# Eddam Overlay Studio

## Expediente técnico y funcional de desarrollo

| Campo                  | Descripción                                          |
| ---------------------- | ----------------------------------------------------- |
| Motor tecnológico     | EddamCore - System                                    |
| Tipo de aplicación    | Plataforma Cloud de Composición Gráfica y Streaming |
| Versión del documento | 1.0.0                                                 |
| Estado                 | Especificación inicial para desarrollo               |
| Nombre del proyecto    | Eddam Overlay Studio                                  |
| Formato del documento  | Markdown                                              |
| Idioma principal       | Español                                              |

---

# 1. Resumen ejecutivo

Eddam Overlay Studio será una plataforma web de composición gráfica orientada a la creación, personalización, gestión y distribución de overlays para transmisiones en vivo.

El sistema permitirá crear overlays a partir de plantillas prediseñadas, modificar sus elementos visuales, administrar datos en tiempo real y generar URL independientes para integrarlos en plataformas de transmisión compatibles, como OBS Studio y PRISM Live Studio.

La plataforma tendrá dos áreas principales:

- **Studio:** interfaz administrativa desde la cual el usuario crea, personaliza y gestiona sus overlays.
- **Overlay Renderer:** motor de representación gráfica que muestra cada overlay mediante una URL pública o protegida, sin mostrar los controles administrativos.

El sistema se construirá con una arquitectura modular, con React para el frontend, Node.js para el backend y PostgreSQL para la persistencia de datos.

La identidad visual de la aplicación tendrá el azul como color primario, acompañado de colores secundarios complementarios. Se desarrollará un sistema centralizado de temas que permita cambiar la apariencia de la interfaz sin modificar individualmente los componentes.

La plataforma deberá estar preparada para crecer desde una primera versión funcional hasta un sistema de composición gráfica con biblioteca de plantillas, editor visual, control en tiempo real, administración de recursos y múltiples categorías de overlays.

# 2. Identidad del proyecto

## 2.1. Nombre comercial

Eddam Overlay Studio.

## 2.2. Motor tecnológico

EddamCore - System.

EddamCore - System será la denominación de la arquitectura tecnológica que dará soporte a la plataforma.

No se considerará una dependencia externa preexistente: será el nombre interno del sistema tecnológico propio de Eddam Overlay Studio.

## 2.3. Propósito

Proporcionar una herramienta web que permita diseñar gráficos profesionales para transmisiones en vivo sin tener que programar cada overlay individualmente.

## 2.4. Visión

Convertir Eddam Overlay Studio en una plataforma de composición gráfica en la que los usuarios puedan seleccionar una plantilla, personalizarla, conectar sus datos y utilizarla inmediatamente en una transmisión.

## 2.5. Principios de diseño

- Modularidad.
- Reutilización de componentes.
- Personalización visual.
- Actualización en tiempo real.
- Separación entre administración y renderizado.
- Rendimiento durante transmisiones en vivo.
- Seguridad en las URL de los overlays.
- Consistencia visual.
- Escalabilidad progresiva.
- Facilidad de mantenimiento.

# 3. Objetivos generales

## 3.1. Objetivo principal

Desarrollar una plataforma web que permita crear y administrar overlays gráficos personalizados mediante plantillas reutilizables y publicarlos a través de URL compatibles con fuentes de navegador.

## 3.2. Objetivos específicos

- Desarrollar una interfaz administrativa con React.
- Crear una biblioteca de plantillas de overlays.
- Implementar un editor de propiedades visuales.
- Permitir la personalización de textos, colores, tamaños, tipografías, imágenes y posiciones.
- Crear un sistema de temas para la interfaz administrativa.
- Crear un sistema independiente de temas para los overlays.
- Implementar una API mediante Node.js.
- Utilizar PostgreSQL como base de datos principal.
- Sincronizar cambios mediante WebSocket.
- Generar URL independientes para cada overlay.
- Integrar los overlays con OBS Studio y probar compatibilidad con PRISM Live Studio.
- Implementar control de acceso y gestión de permisos.
- Mantener un estado persistente para los partidos y configuraciones.
- Diseñar una arquitectura preparada para futuras categorías deportivas y gráficas.

# 4. Alcance funcional

## 4.1. Funcionalidades incluidas en el MVP

La primera versión funcional deberá incluir:

- Panel principal.
- Gestión básica de proyectos y overlays.
- Biblioteca de plantillas.
- Creación de un overlay desde una plantilla.
- Edición de textos y colores.
- Configuración de tamaños y tipografías.
- Configuración de temas de la aplicación.
- Vista previa del overlay.
- Generación de URL del overlay.
- Renderizador independiente.
- Conexión en tiempo real.
- Persistencia de configuraciones.
- Integración inicial con OBS Studio.
- Autenticación de usuarios.
- Gestión básica de recursos gráficos.

## 4.2. Funcionalidades posteriores

Se reservarán para versiones posteriores:

- Editor visual mediante arrastrar y soltar.
- Animaciones avanzadas.
- Biblioteca pública de plantillas.
- Plantillas creadas por usuarios.
- Equipos, organizaciones y espacios de trabajo.
- Colaboración entre operadores.
- Roles avanzados.
- Integración con APIs deportivas.
- Estadísticas automatizadas.
- Control desde dispositivos móviles.
- Sistema de suscripciones.
- Marketplace de plantillas.
- Historial avanzado y restauración de versiones.
- Distribución escalable de eventos en tiempo real.

# 5. Arquitectura tecnológica

## 5.1. Frontend

### Tecnologías principales

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Zustand.
- React Router.
- Zod.
- Una biblioteca de componentes accesibles, seleccionada durante la implementación.

### Responsabilidades

El frontend será responsable de:

- Mostrar el panel administrativo.
- Gestionar la navegación.
- Mostrar la biblioteca de overlays.
- Proporcionar formularios de configuración.
- Administrar la edición de propiedades.
- Mostrar vistas previas.
- Gestionar la configuración de temas.
- Consumir la API.
- Mantener el estado de la interfaz.
- Mostrar los estados de conexión y sincronización.

El panel administrativo y el renderizador compartirán tipos, esquemas de validación y componentes gráficos reutilizables, pero tendrán entradas y rutas independientes.

## 5.2. Backend

### Tecnologías principales

- Node.js.
- TypeScript.
- Fastify.
- WebSocket.
- Drizzle ORM.
- Zod.

### Responsabilidades

El backend será responsable de:

- Autenticar usuarios.
- Autorizar operaciones.
- Gestionar overlays y plantillas.
- Gestionar partidos y datos asociados.
- Validar las modificaciones.
- Persistir el estado.
- Distribuir actualizaciones en tiempo real.
- Emitir y validar permisos de acceso a los overlays.
- Administrar recursos.
- Gestionar errores y registros.
- Aplicar límites de uso.
- Proporcionar endpoints REST.

## 5.3. Base de datos

**Motor:** PostgreSQL.

PostgreSQL almacenará los datos persistentes de la plataforma.

Se utilizarán tablas relacionales para usuarios, plantillas, overlays, proyectos, partidos y permisos. Los ajustes visuales flexibles podrán almacenarse en columnas JSONB con esquemas validados por la aplicación.

## 5.4. Comunicación en tiempo real

Se utilizará WebSocket para mantener conectados el panel administrativo y los renderizadores.

El flujo básico será:

1. El operador modifica un dato.
2. El frontend envía la acción a la API.
3. El backend verifica permisos y valida los datos.
4. El backend actualiza el estado persistente.
5. El backend publica el nuevo estado.
6. Los renderizadores autorizados reciben la actualización.
7. Los componentes gráficos se actualizan sin recargar la página.

Las operaciones importantes deberán confirmarse antes de considerarse guardadas.

## 5.5. Almacenamiento de recursos

Los recursos gráficos incluirán:

- Logotipos.
- Escudos.
- Fotografías.
- Iconos personalizados.
- Fondos.
- Fuentes tipográficas.
- Recursos de plantillas.

En producción se utilizará almacenamiento compatible con S3 o un servicio equivalente. PostgreSQL conservará los metadatos y las referencias a los archivos.

# 6. Estructura general del proyecto

Se utilizará un monorepo para mantener el código organizado y facilitar la reutilización.

```text
eddam-overlay-studio/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── themes/
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── overlays/
│   │   │   ├── components/
│   │   │   ├── runtime/
│   │   │   ├── themes/
│   │   │   ├── services/
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── websocket/
│       │   ├── middleware/
│       │   ├── plugins/
│       │   ├── config/
│       │   └── server.ts
│       └── package.json
│
├── packages/
│   ├── shared/
│   ├── overlay-engine/
│   ├── design-tokens/
│   ├── database/
│   └── config/
│
├── infra/
│   ├── docker/
│   └── deployment/
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── realtime.md
│   └── themes.md
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example
└── README.md
```
