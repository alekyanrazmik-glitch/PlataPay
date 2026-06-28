# ---- Build stage: install deps and build the static site ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source and build the static site into ./out.
# Timeweb serves the app at the domain root, so build with an empty base
# path (base href "/") — the default ('/PlataPay') would 404 every asset
# and break every nav link when served at root.
COPY . .
ENV NEXT_PUBLIC_BASE_PATH=""
RUN node build.mjs

# ---- Runtime stage: slim image with only production deps ----
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server code and the built static site
COPY --from=build /app/out ./out
COPY --from=build /app/server ./server

EXPOSE 3000

# No Docker HEALTHCHECK: Timeweb App Platform runs its own health probe
# (configured to /api/health in the panel). A container-level HEALTHCHECK
# left the container in the "starting" state and made the platform mark
# the deploy as failed before it ever turned "healthy".

CMD ["node", "server/index.js"]
