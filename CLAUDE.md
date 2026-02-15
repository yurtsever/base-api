# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS 11 enterprise API using **Hexagonal Modulith Architecture** (Ports & Adapters). TypeScript strict mode, PostgreSQL 16 via TypeORM, JWT authentication with RBAC. Package manager is **pnpm**.

## Common Commands

```bash
pnpm install                  # Install dependencies
pnpm run build                # Build (nest build)
pnpm run start:dev            # Dev server with hot reload
pnpm run lint                 # ESLint with auto-fix
pnpm run format               # Prettier formatting

# Testing
pnpm run test                 # All unit tests (Jest, rootDir=src, *.spec.ts)
pnpm run test:unit            # Unit tests only (excludes e2e)
pnpm run test:e2e             # E2E tests (test/jest-e2e.json, *.e2e-spec.ts)
pnpm run test:cov             # Coverage report
npx jest --testPathPattern=<pattern>  # Run a single test file

# Database
pnpm run docker:dev           # Start PostgreSQL + pgAdmin via docker-compose
pnpm run docker:down          # Stop and remove containers/volumes
pnpm run migration:generate -- src/shared/infrastructure/database/migrations/MigrationName
pnpm run migration:run        # Run pending migrations
pnpm run migration:revert     # Revert last migration
pnpm run seed                 # Seed IAM data (roles/permissions)
```

## Architecture

### Hexagonal Modulith (Ports & Adapters)

Dependencies flow **inward only**: Infrastructure → Application → Domain.

Each module in `src/modules/` follows three layers:

- **Domain Layer** (`domain/`): Framework-agnostic business logic. Models, value objects, domain services, domain exceptions, and **output port interfaces** (e.g., repository ports). No NestJS imports except `@Injectable`/`@Inject`.
- **Application Layer** (`application/`): Use cases orchestrating domain services. **Input port interfaces** (use case contracts), DTOs with class-validator decorators.
- **Infrastructure Layer** (`infrastructure/`): Adapters implementing ports. Controllers (HTTP input adapters), TypeORM repository adapters (output adapters), guards, strategies, persistence entities with mappers.

### Dependency Injection Wiring

Ports are bound to adapters via **Symbol tokens** in module providers:

```typescript
// Port definition: export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');
// Module wiring:
{ provide: USER_REPOSITORY_PORT, useClass: TypeOrmUserRepositoryAdapter }
{ provide: REGISTER_USE_CASE, useClass: RegisterUseCase }
```

Controllers inject use case ports (not implementations) via `@Inject(SYMBOL)`.

### Key Modules

- **`src/shared/`** — Shared kernel: base entity/aggregate-root/value-object classes, domain exceptions (`BusinessException`, `ValidationException`), HTTP filters/interceptors, config, database module.
- **`src/modules/health/`** — Health checks (liveness/readiness probes at `/api/health/*`).
- **`src/modules/iam/`** — Identity & Access Management: JWT auth (access + refresh tokens in HTTP-only cookies), user CRUD, RBAC with roles/permissions, bcrypt password hashing, expired token cleanup cron task.

### Global Middleware (configured in main.ts)

- `JwtAuthGuard` and `RolesGuard` are registered as **global APP_GUARDs** — all routes require auth by default. Use `@Public()` decorator to opt out.
- `HttpExceptionFilter` — standardized error responses with requestId tracking.
- `TransformInterceptor` — wraps responses in `{ statusCode, data, timestamp, path }`.
- `TimeoutInterceptor` — 30s request timeout.
- `ValidationPipe` — whitelist mode with `forbidNonWhitelisted: true`.

### Entity/Model Separation

TypeORM entities live in `infrastructure/persistence/entities/` and are **distinct from domain models** in `domain/models/`. Mapper classes in `infrastructure/persistence/mappers/` convert between them. The base entity (`shared/infrastructure/database/entities/base.entity.ts`) provides `id`, `createdAt`, `updatedAt`.

### Configuration

Env validated via `src/shared/infrastructure/config/env.validation.ts` using class-validator. Namespaced config loaded from `src/shared/infrastructure/config/configuration.ts` — access via `configService.get('app.port')`, `configService.get('database.url')`, etc. Env files loaded in order: `.env.local`, `.env`.

## API

- Global prefix: `/api`
- Swagger docs (dev only): `/api/docs`
- Health: `/api/health`, `/api/health/liveness`, `/api/health/readiness`

## Testing Patterns

- Unit tests are co-located with source files as `*.spec.ts` (rootDir is `src/`).
- E2E tests live in `test/` as `*.e2e-spec.ts`.
- Test utilities: `test/utils/mock-factories.ts` and `test/utils/test-helpers.ts`.
- Domain tests mock only ports. Application tests mock domain services. Infrastructure tests mock external libraries/TypeORM repos.
- Coverage thresholds: branches 45%, functions/lines/statements 60%.

## Code Style

- Prettier: single quotes, trailing commas, 120 char width, 2-space indent.
- ESLint: `@typescript-eslint/no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings.
- `@typescript-eslint/unbound-method` is disabled in test files.
