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
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# === Stage 2: Production ===
FROM nginx:alpine AS production

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S engvox && \
    adduser -S engvox -u 1001 -G engvox && \
    chown -R engvox:engvox /usr/share/nginx/html && \
    chown -R engvox:engvox /var/cache/nginx && \
    chown -R engvox:engvox /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R engvox:engvox /var/run/nginx.pid

USER engvox

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
