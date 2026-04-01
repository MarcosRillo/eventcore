# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20.18-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.33.0
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20.18-alpine AS builder
RUN npm install -g pnpm@10.33.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG INTERNAL_API_URL
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN pnpm run build

# Stage 3: Development runner (hot reload via volume mounts)
FROM node:20.18-alpine AS dev
RUN npm install -g pnpm@10.33.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
ENV NODE_ENV=development NEXT_TELEMETRY_DISABLED=1
CMD ["pnpm", "run", "dev"]

# Stage 4: Production runner (minimal image)
FROM node:20.18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output + static assets (per Next.js docs)
# Note: outputFileTracingRoot resolves to WORKDIR parent, so standalone nests under 'app/'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/app ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
