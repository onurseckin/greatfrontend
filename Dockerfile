# Development Dockerfile for Nx Monorepo
FROM oven/bun:latest AS base
WORKDIR /app

# Copy package files and workspace configuration
COPY package.json bun.lock* nx.json tsconfig.base.json ./

# Copy all apps and libs for Nx workspace
COPY apps ./apps
COPY libs ./libs

# Install dependencies
RUN bun install

# Development target for Backend
FROM base AS backend-dev
WORKDIR /app
EXPOSE 3000
# No local database needed - using Neon PostgreSQL
ENV NODE_ENV=development
CMD ["bun", "--hot", "apps/backend/src/main.ts"]

# Development target for Frontend
FROM base AS frontend-dev
WORKDIR /app
EXPOSE 5173
ENV NODE_ENV=development
CMD ["bunx", "vite", "--config", "apps/frontend/vite.config.ts", "--host", "0.0.0.0"]

# Production build target
FROM base AS builder
RUN bunx nx build frontend
RUN bunx nx build backend

# Production Backend
FROM oven/bun:latest AS backend-prod
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/package.json ./package.json
# No local database needed - using Neon PostgreSQL
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["bun", "apps/backend/dist/main.js"]

# Production Frontend
FROM oven/bun:latest AS frontend-prod
WORKDIR /app
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/apps/frontend/server.ts ./apps/frontend/server.ts
ENV NODE_ENV=production PORT=5173
EXPOSE 5173
CMD ["bun", "apps/frontend/server.ts"]


