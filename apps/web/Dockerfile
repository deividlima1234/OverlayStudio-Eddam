# ==========================================
# 1. BUILDER STAGE
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar configuración y dependencias
COPY package.json tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts postcss.config.js tailwind.config.js index.html ./

RUN npm install

# Copiar código fuente y assets
COPY src/ ./src/
COPY public/ ./public/

# Variable de entorno de build opcional
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Compilar frontend para producción
RUN npm run build

# ==========================================
# 2. RUNNER STAGE (NGINX ALPINE)
# ==========================================
FROM nginx:alpine AS runner

# Copiar configuración de Nginx con Reverse Proxy y SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
