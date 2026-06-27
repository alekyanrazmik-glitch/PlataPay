# ---- Build stage: install deps and build the static site ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source and build the static site into ./out
COPY . .
RUN node build.mjs

# ---- Runtime stage: slim image with only production deps ----
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# wget is used by the Docker HEALTHCHECK below
RUN apk add --no-cache wget

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server code, the built static site, and the build script
COPY --from=build /app/out ./out
COPY --from=build /app/server ./server

EXPOSE 3000

# Healthcheck hits the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server/index.js"]
