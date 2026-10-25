# ==========================================
# 1. BUILDER STAGE
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@12.10.1

# Copiar archivos de dependencias
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/renderer/package.json ./apps/renderer/
COPY packages/ ./packages/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente del frontend
COPY apps/web/ ./apps/web/

# Variable de entorno de build opcional (por defecto vacía para usar Nginx proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Compilar producción con Vite
RUN pnpm --filter web build

# ==========================================
# 2. RUNNER STAGE (NGINX ALPINE ~15MB)
# ==========================================
FROM nginx:alpine AS runner

# Copiar configuración personalizada con soporte SPA y Reverse Proxy
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos compilados
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
