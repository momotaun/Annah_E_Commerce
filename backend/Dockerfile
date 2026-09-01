# syntax=docker/dockerfile:1

# ---- deps: install once, reused by the build stage ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile TypeScript and generate the Prisma client ----
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- production: only prod dependencies + compiled output ----
FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=node:node --from=build /app/prisma ./prisma

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Compiles to dist/src/main.js, not dist/main.js — prisma/ lives outside
# src/, so TypeScript's inferred rootDir spans both directories and the
# output preserves the src/ prefix. Matches package.json's start:prod.
CMD ["node", "dist/src/main"]
