# ========================================
# Stage 1: Development
# ========================================
FROM node:22-alpine AS development

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start in development mode
CMD ["pnpm", "run", "start:dev"]

# ========================================
# Stage 2: Build
# ========================================
FROM node:22-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# ========================================
# Stage 3: Production
# ========================================
FROM node:22-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY --from=build --chown=nestjs:nodejs /app/package.json /app/pnpm-lock.yaml ./

# Copy node_modules from build stage
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy compiled application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Use non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health/liveness', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "dist/main.js"]
