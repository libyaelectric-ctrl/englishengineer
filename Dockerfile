# ──────────────────────────────────────────────────────
# EngVox Frontend — Multi-stage Docker Build
# Stage 1: Build with Vite
# Stage 2: Serve with nginx
# ──────────────────────────────────────────────────────

# === Stage 1: Build ===
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# === Stage 2: Production ===
FROM nginx:alpine AS production

# Create non-root user first
RUN addgroup -g 1001 -S engvox && \
    adduser -S engvox -u 1001 -G engvox

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Allow non-root user to bind port, write pid, and use cache
RUN mkdir -p /var/run /var/cache/nginx /var/log/nginx && \
    chown -R engvox:engvox /var/run /var/cache/nginx /var/log/nginx /etc/nginx

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R engvox:engvox /usr/share/nginx/html

USER engvox

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
