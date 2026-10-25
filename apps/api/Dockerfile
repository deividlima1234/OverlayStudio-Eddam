# ==========================================
# 1. BUILDER STAGE
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@12.10.1

# Copiar configuración del monorepo y dependencias
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/renderer/package.json ./apps/renderer/
COPY packages/ ./packages/

# Instalar todas las dependencias para compilar
RUN pnpm install --frozen-lockfile

# Copiar código fuente de la API
COPY apps/api/ ./apps/api/

# Compilar TypeScript
RUN pnpm --filter api build

# ==========================================
# 2. RUNNER STAGE (PRODUCCIÓN LIGERA)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN npm install -g pnpm@12.10.1

# Copiar dependencias de producción
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/renderer/package.json ./apps/renderer/
COPY packages/ ./packages/

RUN pnpm install --prod --frozen-lockfile

# Copiar dist compilado
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/server.js"]
