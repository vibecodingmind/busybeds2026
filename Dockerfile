# ── BusyBeds Production Dockerfile ──
# Simplified build: no standalone, uses next start directly

# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json bun.lock* package-lock.json* ./
COPY prisma ./prisma/

# Provide a dummy DATABASE_URL for prisma generate during install
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Install dependencies (postinstall runs prisma generate)
RUN npm install --legacy-peer-deps

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Provide a dummy DATABASE_URL for prisma generate during build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx next build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy everything from builder
COPY --from=builder /app ./

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh 2>/dev/null || true

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push --accept-data-loss; npx tsx prisma/seed.ts 2>/dev/null; npx next start -p 3000 -H 0.0.0.0"]
