
# ============================================================
# BIZTRU BACKEND - PRODUCTION TESTING DOCKERFILE
# ============================================================

FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy monorepo
COPY . .

# Install all workspace dependencies
RUN npm install

# Temporary build URL.
# Real database credentials are supplied at container runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

# Generate Prisma client
RUN npm run prisma:generate --workspace=shop-backend

# Build TypeScript and workspace packages

# Build backend dependencies only
RUN npm run build --workspace=@business/domain-models \
    && npm run build --workspace=@business/projectionFamilies \
    && npm run build --workspace=@business/snapshot-engine \
    && npm run build --workspace=@business/event-bus \
    && npm run build --workspace=@business/shared-types \
    && npm run build --workspace=@business/ledger-engine \
    && npm run build --workspace=@business/sync \
    && npm run build --workspace=shop-backend


# ============================================================
# PRODUCTION RUNTIME
# ============================================================

FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Runtime libraries required by Prisma and native dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy built application and dependencies
COPY --from=builder /app /app

# Expose backend API
EXPOSE 5000

# Start backend
CMD ["node", "shop-backend/dist/app/server.js"]
