## Context

Dự án WebĐọcTruyện là greenfield — chưa có code nào. Cần thiết lập monorepo foundation bao gồm 3 apps (web, admin, server) và 2 shared packages, cùng toàn bộ database models và authentication system. Tài liệu thiết kế chi tiết đã có trong `webdoctruyen.md`.

Tech stack đã thống nhất: Next.js, Express, MongoDB, Redis, Firebase Storage, Turborepo, JWT auth.

## Goals / Non-Goals

**Goals:**
- Turborepo monorepo chạy được với `turbo dev` — cả 3 apps start đồng thời
- Tất cả Mongoose models với proper indexes, validation, virtual fields
- Auth flow hoàn chỉnh: register → login → refresh → logout → forgot/reset password
- Role-based access control: Guest → User → Moderator → Admin → Super Admin
- Docker Compose cho MongoDB + Redis dev environment
- Next.js app shells (web + admin) với providers, layouts, Tailwind

**Non-Goals:**
- Comics CRUD, Chapter reader UI (Proposal 2)
- Crawler service, n8n integration (Proposal 3)
- Chat system, Socket.IO handlers (Proposal 4)
- Payment/donation system (Proposal 5)
- Production deployment, CI/CD pipeline
- Unit/integration tests (sẽ thêm song song khi implement features)

## Decisions

### 1. Turborepo workspace layout

**Decision:** 3 apps + 2 packages structure theo `webdoctruyen.md`

```
apps/web       — Next.js user site (:3000)
apps/admin     — Next.js admin panel (:3001)
apps/server    — Express API (:5000)
packages/shared — Types, constants, utils
packages/ui    — Shared React components
```

**Why:** Turborepo cho parallel builds, shared dependencies, và caching. 2 Next.js apps riêng biệt cho user vs admin vì khác hoàn toàn về layout, routing, và access control.

**Alternative considered:** Single Next.js app với route groups `(user)` và `(admin)` — rejected vì bundle size lớn, khó phân quyền deploy.

### 2. Database connection strategy

**Decision:** Single MongoDB connection pool qua Mongoose, configured trong `apps/server/src/config/database.ts`. Redis dùng `ioredis`.

**Why:** Mongoose ODM cho schema validation, population, middleware hooks. ioredis cho performance tốt hơn node-redis, hỗ trợ cluster.

### 3. JWT implementation

**Decision:**
- Access Token: 15 min, JWT signed với HS256, stored in-memory (Redux)
- Refresh Token: 7 days, random UUID stored in MongoDB + HttpOnly cookie
- Token rotation: mỗi lần refresh tạo cặp token mới, invalidate token cũ
- Blacklist: Redis SET cho revoked tokens (logout, password change)

**Why:** Short-lived access token giảm risk nếu bị leak. Refresh token rotation + blacklist chống token replay. HttpOnly cookie chống XSS.

**Alternative considered:** Session-based auth — rejected vì không phù hợp với separate frontend apps và mobile support tương lai.

### 4. Password hashing

**Decision:** bcrypt với salt rounds = 12

**Why:** Industry standard, constant-time comparison chống timing attacks. Salt 12 cân bằng giữa security và performance.

### 5. Request validation

**Decision:** Zod cho request body/params validation

**Why:** TypeScript-first, infer types từ schema, tốt hơn Joi/Yup cho TS project. Dùng chung schemas giữa frontend và backend qua `packages/shared`.

### 6. Rate limiting

**Decision:** `express-rate-limit` với Redis store (`rate-limit-redis`)

Config:
- General API: 100 req/15min per IP
- Auth endpoints: 5 req/15min per IP (login, register, forgot-password)
- Refresh: 10 req/15min per IP

**Why:** Redis store cho consistent rate limiting across multiple server instances (nếu scale sau).

### 7. Frontend state management

**Decision:**
- Redux Toolkit: auth state, UI state (theme, sidebar), client-only state
- React Query (TanStack Query): all server data fetching + caching
- redux-persist: persist auth + UI state to localStorage

**Why:** Separation of concerns — Redux cho client state, React Query cho server state. Tránh over-fetching, tận dụng React Query cache + background refetch.

### 8. Shared UI package

**Decision:** `packages/ui` export basic components (Button, Input, Modal, Table, Pagination, Toast) dùng Tailwind. Apps import trực tiếp.

**Why:** DRY — web và admin share common UI elements. Tailwind config extend từ root.

### 9. Environment variables

**Decision:** `.env` files per app, validated bằng Zod schema at startup. `.env.example` committed, `.env` gitignored.

**Why:** Fail fast nếu thiếu config. Type-safe env access.

## Risks / Trade-offs

- **[Risk] Mongoose schema drift vs TypeScript types** → Mitigation: Define types in `packages/shared`, Mongoose schemas reference these types. Use `HydratedDocument<IUser>` pattern.

- **[Risk] JWT secret management** → Mitigation: Load from env, validate at startup. In production, use proper secret management (Docker secrets / cloud KMS).

- **[Risk] Redis dependency for auth** → Mitigation: Token blacklist in Redis with fallback to MongoDB check if Redis is down. Rate limiter fails open (allows request) if Redis unavailable.

- **[Risk] Monorepo complexity** → Mitigation: Turborepo handles build orchestration. Clear dependency boundaries: apps depend on packages, packages don't depend on apps.

- **[Trade-off] Separate admin app vs route group** → Larger initial setup, but better long-term: independent deployment, smaller bundles, cleaner access control.
