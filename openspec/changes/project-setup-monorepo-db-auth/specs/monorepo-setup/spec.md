## ADDED Requirements

### Requirement: Turborepo workspace structure
The system SHALL use Turborepo to manage a monorepo with 3 apps (`web`, `admin`, `server`) and 2 packages (`shared`, `ui`). All apps and packages SHALL use TypeScript.

#### Scenario: Running dev environment
- **WHEN** developer runs `turbo dev` from root
- **THEN** all 3 apps start concurrently: web (:3000), admin (:3001), server (:5000)

#### Scenario: Building all apps
- **WHEN** developer runs `turbo build` from root
- **THEN** packages build first, then apps build in parallel, with Turborepo caching

### Requirement: Shared TypeScript configuration
The system SHALL have a base `tsconfig.json` at root that all apps and packages extend. Each app SHALL have its own `tsconfig.json` extending the base with app-specific settings.

#### Scenario: TypeScript compilation
- **WHEN** any app or package is compiled
- **THEN** it uses strict mode, path aliases resolve correctly, and shared types are accessible

### Requirement: Shared ESLint and Prettier configuration
The system SHALL have shared ESLint and Prettier configs at root level. All apps and packages SHALL extend these configs.

#### Scenario: Linting codebase
- **WHEN** developer runs `turbo lint` from root
- **THEN** all apps and packages are linted with consistent rules

### Requirement: Docker Compose for dev services
The system SHALL provide a `docker-compose.yml` at root that runs MongoDB (port 27017) and Redis (port 6379) for local development.

#### Scenario: Starting dev services
- **WHEN** developer runs `docker-compose up -d`
- **THEN** MongoDB and Redis containers start and are accessible from apps/server

#### Scenario: Data persistence
- **WHEN** containers are restarted
- **THEN** MongoDB data is persisted via Docker volume

### Requirement: Environment variable management
The system SHALL have `.env.example` files documenting all required environment variables. `.env` files SHALL be gitignored. Server app SHALL validate env vars at startup using Zod.

#### Scenario: Missing required env var
- **WHEN** server starts without a required environment variable (e.g., `MONGODB_URI`)
- **THEN** server fails immediately with a clear error message listing missing variables

#### Scenario: Example env file
- **WHEN** developer clones the repository
- **THEN** `.env.example` contains all required variables with placeholder values and descriptions

### Requirement: Package dependency boundaries
Apps SHALL depend on packages. Packages SHALL NOT depend on apps. `packages/shared` SHALL have no React dependency. `packages/ui` MAY depend on `packages/shared`.

#### Scenario: Importing shared types in server
- **WHEN** server app imports from `@webdoctruyen/shared`
- **THEN** types, constants, and utilities are available without React dependency

#### Scenario: Importing UI components in web app
- **WHEN** web app imports from `@webdoctruyen/ui`
- **THEN** shared React components are available with proper TypeScript types
