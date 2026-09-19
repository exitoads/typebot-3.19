# ================= INSTALL BUN ===================
ARG BUN_VERSION=1.3.9

FROM oven/bun:${BUN_VERSION}-slim AS bun

FROM node:24-bookworm-slim AS base

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

RUN apt-get update -qq \
    && apt-get install -qq --no-install-recommends \
    build-essential \
    ca-certificates \
    git \
    g++ \
    openssl \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# =============== INSTALL & BUILD =================
# Builds both the builder and viewer Next.js apps into the same image, so one
# build/push covers both services - the entrypoint script picked at deploy
# time (see docker-compose.build.yml) is what decides which one actually
# runs in a given container.

FROM base AS builder
COPY . .
RUN SENTRYCLI_SKIP_DOWNLOAD=1 bun install --no-frozen-lockfile
RUN bunx nx sync
RUN SKIP_ENV_CHECK=true DATABASE_URL=postgresql:// NEXT_PUBLIC_VIEWER_URL=http://localhost bunx nx run-many -t build --projects=builder,viewer
RUN DATABASE_URL=postgresql:// bunx nx db:generate prisma

# ================== RELEASE ======================

FROM base AS release
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/prisma/postgresql ./packages/prisma/postgresql
COPY --from=builder /app/packages/prisma/prisma.config.ts ./packages/prisma/prisma.config.ts

COPY --from=builder --chown=node:node /app/apps/builder/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/builder/.next/static ./apps/builder/.next/static
COPY --from=builder --chown=node:node /app/apps/builder/public ./apps/builder/public

COPY --from=builder --chown=node:node /app/apps/viewer/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/viewer/.next/static ./apps/viewer/.next/static
COPY --from=builder --chown=node:node /app/apps/viewer/public ./apps/viewer/public

COPY scripts/builder-entrypoint.sh scripts/viewer-entrypoint.sh ./
RUN chmod +x ./builder-entrypoint.sh ./viewer-entrypoint.sh
USER node

# No default ENTRYPOINT: this image plays both roles, so the compose/stack
# file must set `entrypoint: ["./builder-entrypoint.sh"]` or
# `["./viewer-entrypoint.sh"]` per service.

EXPOSE 3000
ENV PORT=3000
