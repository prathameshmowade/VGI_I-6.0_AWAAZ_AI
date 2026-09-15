# ==============================================================================
# CivicFlow AI-X / Awaaz AI — Production Multi-Stage Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Static Bundle
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Build optimized Vite assets
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Node.js Runtime Gateway
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Add curl for health check probe
RUN apk add --no-cache curl

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source code & initial data
COPY backend/ ./backend/
COPY data/ ./data/

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Ensure persistent directories exist
RUN mkdir -p uploads logs

# Security: run as non-root user
USER node

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Docker healthcheck querying the SRE probe endpoint
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/healthz || exit 1

CMD ["node", "backend/index.js"]
