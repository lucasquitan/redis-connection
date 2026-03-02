# === Build stage ===
FROM node:24-alpine AS builder

WORKDIR /app

# Dependências (dev + prod) para build
COPY package.json package-lock.json* ./
RUN npm install

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# === Runtime (app + redis) ===
FROM node:24-alpine

WORKDIR /app

# Instala Redis server e cliente
RUN apk add --no-cache redis redis-cli

# Copia apenas o necessário
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Variáveis padrão (Render vai sobrepor PORT automaticamente)
ENV NODE_ENV=production
ENV REDIS_URL=redis://127.0.0.1:6379

# Script de entrada: sobe Redis e depois o app
COPY <<'EOF' /app/entrypoint.sh
#!/usr/bin/env sh
set -e

# Inicia Redis em background
redis-server --appendonly yes &

# Espera Redis responder
echo "Aguardando Redis..."
until redis-cli ping >/dev/null 2>&1; do
  sleep 0.5
done
echo "Redis OK."

# Sobe a API
exec node dist/index.js
EOF

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["/app/entrypoint.sh"]