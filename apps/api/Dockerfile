# ==========================================
# 1. BUILDER STAGE
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package.json tsconfig.json ./
RUN npm install

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# ==========================================
# 2. RUNNER STAGE (PRODUCCIÓN LIGERA)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
