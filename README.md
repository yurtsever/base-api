# NestJS Hexagonal Modulith

A production-ready NestJS 11 API template using **Hexagonal Modulith Architecture** (Ports & Adapters). TypeScript strict mode, PostgreSQL 16 via TypeORM, JWT authentication with RBAC.

## Using This Template

**GitHub Template Button** — Click **"Use this template"** on the repository page to create a new repo.

**GitHub CLI:**

```bash
gh repo create my-api --template <owner>/nestjs-hexagonal-modulith --clone
```

**degit (no git history):**

```bash
npx degit <owner>/nestjs-hexagonal-modulith my-api
cd my-api
git init
```

**After cloning**, run the init script to personalize the project:

```bash
chmod +x scripts/init-project.sh
./scripts/init-project.sh
```

The script prompts for project name, database name, API title, and port — then updates all configuration files and removes itself.

## Architecture

This API follows **Hexagonal Architecture** (Ports & Adapters) combined with a **Modulith** approach:

- **Modulith**: Monolithic application organized into autonomous modules (Bounded Contexts)
- **Hexagonal Architecture**: Domain logic at the center, isolated from infrastructure
- **Ports & Adapters**: Clear interfaces between domain and external systems

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP / External Systems                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              Infrastructure Layer (Adapters)                 │
│  Controllers • Database Adapters • External Service Adapters│
└───────────────────┬─────────────────────────────────────────┘
                    │ via Ports (Interfaces)
┌───────────────────▼─────────────────────────────────────────┐
│              Application Layer (Use Cases)                   │
│        Orchestration • Business Workflows • DTOs             │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              Domain Layer (Business Logic)                   │
│     Entities • Value Objects • Domain Services • Ports       │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule

Dependencies flow **inward only**:

- **Domain Layer**: Knows nothing about the outside (framework-agnostic)
- **Application Layer**: Knows only Domain
- **Infrastructure Layer**: Knows Application and Domain, implements Ports

## Project Structure

```
src/
├── shared/                          # Shared Kernel (all modules)
│   ├── infrastructure/              # Shared infrastructure
│   │   ├── config/                  # Configuration & Validation
│   │   ├── http/                    # HTTP (Filters, Interceptors)
│   │   ├── security/                # Security (Guards)
│   │   └── database/                # Database base classes & migrations
│   ├── domain/                      # Shared Domain
│   │   ├── base/                    # Entity, AggregateRoot, ValueObject
│   │   └── exceptions/              # Domain Exceptions
│   └── application/                 # Shared Application
│       ├── decorators/              # API Decorators
│       └── interfaces/              # DTO Interfaces
│
├── modules/                         # Bounded Contexts
│   ├── health/                      # Health checks (liveness/readiness probes)
│   ├── iam/                         # Identity & Access Management (JWT + RBAC)
│   ├── audit/                       # Audit logging
│   └── email/                       # Email service (SMTP + Handlebars templates)
│
├── app.module.ts                    # Root Module
└── main.ts                          # Bootstrap
```

Each module follows three layers:

```
modules/<name>/
├── domain/                          # Domain Layer
│   ├── models/                      # Domain Models
│   ├── ports/                       # Output Ports (Interfaces)
│   └── services/                    # Domain Services
├── application/                     # Application Layer
│   ├── ports/                       # Input Ports (Use Case Interfaces)
│   └── use-cases/                   # Use Case Implementations
├── infrastructure/                  # Infrastructure Layer
│   ├── adapters/                    # Output Adapters (Port Implementations)
│   ├── controllers/                 # Input Adapters (HTTP)
│   └── persistence/                 # Entities & Mappers (TypeORM)
└── <name>.module.ts                 # Module Wiring (DI)
```

## Included Modules

| Module     | Description                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Health** | Kubernetes-ready liveness and readiness probes at `/api/health/*`                                                                                              |
| **IAM**    | JWT authentication (access + refresh tokens in HTTP-only cookies), user CRUD, RBAC with roles/permissions, bcrypt password hashing, expired token cleanup cron |
| **Audit**  | Audit logging for tracking user actions with configurable retention                                                                                            |
| **Email**  | SMTP email service with Handlebars templates                                                                                                                   |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose (recommended)
- PostgreSQL 16 (provided via Docker)

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env

# Start database with Docker
pnpm run docker:dev

# Run migrations
pnpm run migration:run

# Seed IAM data (roles & permissions)
pnpm run seed

# Start development server
pnpm run start:dev
```

The API is then available at:

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs (development only)
- **Health Check**: http://localhost:3000/api/health

### Docker Development

```bash
# Start all services (API + PostgreSQL + pgAdmin)
docker-compose up -d

# Start with pgAdmin
docker-compose --profile tools up -d

# Follow logs
pnpm run docker:logs

# Stop services
pnpm run docker:down
```

## Creating a New Module

### 1. Create Module Structure

```bash
mkdir -p src/modules/<name>/{domain/{models,ports,services},application/{ports,use-cases},infrastructure/{adapters,controllers,persistence/{entities,mappers}}}
```

### 2. Domain Layer

**Domain Model:**

```typescript
// src/modules/<name>/domain/models/user.model.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
  ) {}

  isActive(): boolean {
    // Business logic here
  }
}
```

**Output Port:**

```typescript
// src/modules/<name>/domain/ports/user-repository.port.ts
export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');
```

**Domain Service:**

```typescript
// src/modules/<name>/domain/services/user-domain.service.ts
@Injectable()
export class UserDomainService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BusinessException('User not found');
    }
    return user;
  }
}
```

### 3. Application Layer

**Input Port (Use Case Interface):**

```typescript
// src/modules/<name>/application/ports/get-user.port.ts
export interface GetUserUseCase {
  execute(id: string): Promise<User>;
}

export const GET_USER = Symbol('GET_USER');
```

**Use Case Implementation:**

```typescript
// src/modules/<name>/application/use-cases/get-user.use-case.ts
@Injectable()
export class GetUserUseCaseImpl implements GetUserUseCase {
  constructor(private readonly userService: UserDomainService) {}

  async execute(id: string): Promise<User> {
    return this.userService.getUserById(id);
  }
}
```

### 4. Infrastructure Layer

**Output Adapter (implements Port):**

```typescript
// src/modules/<name>/infrastructure/adapters/typeorm-user.adapter.ts
@Injectable()
export class TypeOrmUserAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: UserEntity): User {
    return new User(entity.id, entity.email, entity.name);
  }
}
```

**Controller (Input Adapter):**

```typescript
// src/modules/<name>/infrastructure/controllers/user.controller.ts
@Controller('users')
export class UserController {
  constructor(
    @Inject(GET_USER)
    private readonly getUser: GetUserUseCase,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getUser.execute(id);
  }
}
```

### 5. Module Wiring

```typescript
// src/modules/<name>/<name>.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    // Domain
    UserDomainService,

    // Adapters
    {
      provide: USER_REPOSITORY_PORT,
      useClass: TypeOrmUserAdapter,
    },

    // Use Cases
    {
      provide: GET_USER,
      useClass: GetUserUseCaseImpl,
    },
  ],
})
export class UserModule {}
```

### 6. Register in AppModule

```typescript
@Module({
  imports: [
    // ... existing imports
    UserModule,
  ],
})
export class AppModule {}
```

## Global Middleware

Configured in `main.ts` and `app.module.ts`:

- **JwtAuthGuard** + **RolesGuard** — registered as global `APP_GUARD`s. All routes require auth by default; use `@Public()` to opt out.
- **HttpExceptionFilter** — standardized error responses with `requestId` tracking.
- **TransformInterceptor** — wraps responses in `{ statusCode, data, timestamp, path }`.
- **TimeoutInterceptor** — 30-second request timeout.
- **ValidationPipe** — whitelist mode with `forbidNonWhitelisted: true`.

## Testing

### Commands

```bash
pnpm run test          # All unit tests
pnpm run test:unit     # Unit tests only (excludes e2e)
pnpm run test:e2e      # E2E tests
pnpm run test:cov      # Coverage report
pnpm run test:watch    # Watch mode

# Run a single test file
npx jest --testPathPattern=<pattern>
```

### Strategy

- **Domain tests** mock only ports.
- **Application tests** mock domain services.
- **Infrastructure tests** mock external libraries / TypeORM repositories.
- Unit tests are co-located with source files as `*.spec.ts`.
- E2E tests live in `test/` as `*.e2e-spec.ts`.
- Test utilities: `test/utils/mock-factories.ts` and `test/utils/test-helpers.ts`.

### Coverage Thresholds

| Metric     | Threshold |
| ---------- | --------- |
| Branches   | 45%       |
| Functions  | 60%       |
| Lines      | 60%       |
| Statements | 60%       |

## Configuration

### Environment Variables

See `.env.example` for all available options:

| Variable         | Description                               | Default                 |
| ---------------- | ----------------------------------------- | ----------------------- |
| `NODE_ENV`       | Environment (development/production/test) | `development`           |
| `PORT`           | Server port                               | `3000`                  |
| `DATABASE_URL`   | PostgreSQL connection string              | —                       |
| `JWT_SECRET`     | JWT signing secret                        | —                       |
| `LOG_LEVEL`      | Log level (debug/info/warn/error)         | `info`                  |
| `CORS_ORIGINS`   | Allowed CORS origins (comma-separated)    | `http://localhost:3000` |
| `RATE_LIMIT_TTL` | Rate limit time window (ms)               | `60000`                 |
| `RATE_LIMIT_MAX` | Max requests per time window              | `10`                    |

Environment is validated at startup via `class-validator`. Namespaced config is accessed via `configService.get('app.port')`, `configService.get('database.url')`, etc.

## Security

- **Helmet**: HTTP security headers (CSP, XSS Protection, Frame Guard)
- **CORS**: Configurable origin whitelist
- **Rate Limiting**: Configurable via `@nestjs/throttler`
- **Input Validation**: Automatic DTO validation with whitelist
- **JWT Auth**: Access + refresh tokens in HTTP-only cookies
- **RBAC**: Role-based access control with granular permissions
- **Request ID Tracking**: Unique ID per request for logging and debugging

## Error Handling

### Standardized Error Response Format

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/resource",
  "method": "POST",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "requestId": "uuid-here"
}
```

## Health Checks

| Endpoint                | Description     | Use Case             |
| ----------------------- | --------------- | -------------------- |
| `/api/health`           | Overall health  | General monitoring   |
| `/api/health/liveness`  | Liveness probe  | Kubernetes liveness  |
| `/api/health/readiness` | Readiness probe | Kubernetes readiness |

## Database Migrations

```bash
# Generate a migration from entity changes
pnpm run migration:generate -- src/shared/infrastructure/database/migrations/MigrationName

# Run pending migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

## API Documentation

Swagger/OpenAPI documentation is available at `/api/docs` in development mode.

Features:

- Interactive API explorer
- Request/Response schemas
- Bearer auth support
- Tags: health, auth, users, audit, email

## Deployment

### Docker Production

```bash
# Build production image
docker build --target production -t my-api:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production my-api:latest
```

The production image includes a health check that polls `/api/health/liveness`.

## Architecture Benefits

1. **Testability** — Each layer is independently testable. Domain logic can be tested without infrastructure dependencies.
2. **Swappability** — Infrastructure components are replaceable. For example, TypeORM to Prisma: only change the adapter, domain stays the same.
3. **Clarity** — Clear responsibilities per layer. The dependency rule enforces clean architecture.
4. **Maintainability** — Changes remain localized. Bounded contexts prevent god objects.
5. **Scalability** — Modules can later be extracted into microservices with minimal refactoring.
6. **Business Focus** — Domain logic is central and protected. Framework changes don't affect the domain.

## Code Style

- **Prettier**: single quotes, trailing commas, 120 char width, 2-space indent
- **ESLint**: TypeScript strict rules with `@typescript-eslint`
- **TypeScript**: strict mode enabled

```bash
pnpm run lint       # ESLint with auto-fix
pnpm run format     # Prettier formatting
```

## License

[MIT](LICENSE)
