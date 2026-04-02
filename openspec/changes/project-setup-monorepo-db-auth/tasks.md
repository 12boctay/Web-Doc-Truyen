## 1. Root Monorepo Setup

- [x] 1.1 Initialize root `package.json` with Turborepo, workspaces config, and dev scripts
- [x] 1.2 Create `turbo.json` with pipeline config (dev, build, lint)
- [x] 1.3 Create root `tsconfig.json` (base config, strict mode)
- [x] 1.4 Create root ESLint + Prettier configs
- [x] 1.5 Create `.gitignore`, `.env.example` at root
- [x] 1.6 Create `docker-compose.yml` with MongoDB + Redis services and volumes

## 2. Shared Packages

- [x] 2.1 Create `packages/shared` — package.json, tsconfig.json
- [x] 2.2 Add shared TypeScript types: IUser, IComic, IChapter, ICategory, IFollow, IComment, IRating, INotification, IReadHistory, IChatRoom, IChatMessage, IPayment, IDonationGoal, ICrawlSource
- [x] 2.3 Add shared constants: roles hierarchy, category list, comic status/country enums
- [x] 2.4 Add shared utility functions: slugify, formatDate, Zod validation schemas (register, login, etc.)
- [x] 2.5 Create `packages/ui` — package.json, tsconfig.json, Tailwind setup
- [x] 2.6 Implement shared UI components: Button, Input, Modal, Table, Pagination, Toast

## 3. Server App — Config & Database

- [x] 3.1 Create `apps/server` — package.json, tsconfig.json, entry point (index.ts)
- [x] 3.2 Setup Express app with CORS, JSON parser, cookie-parser, helmet
- [x] 3.3 Add `config/database.ts` — MongoDB connection via Mongoose with error handling
- [x] 3.4 Add `config/redis.ts` — Redis connection via ioredis
- [x] 3.5 Add `config/firebase.ts` — Firebase Admin SDK initialization
- [x] 3.6 Add `config/env.ts` — Zod-validated environment variables
- [x] 3.7 Implement all Mongoose models: User, Comic, Chapter, Category, Follow, Comment, Rating, Notification, ReadHistory, ChatRoom, ChatMessage, Payment, DonationGoal, CrawlSource — with schemas, indexes, virtuals, pre-save hooks

## 4. Server App — Auth System

- [x] 4.1 Add `utils/jwt.ts` — signAccessToken, signRefreshToken, verifyToken functions
- [x] 4.2 Add `middlewares/auth.middleware.ts` — JWT verification, Redis blacklist check, attach req.user
- [x] 4.3 Add `middlewares/role.middleware.ts` — role hierarchy check (requireRole factory)
- [x] 4.4 Add `middlewares/rateLimiter.ts` — express-rate-limit with Redis store, general + auth configs
- [x] 4.5 Add `middlewares/validator.ts` — Zod validation middleware factory
- [x] 4.6 Implement `services/auth.service.ts` — register, login, refresh, logout, forgotPassword, resetPassword logic
- [x] 4.7 Implement `controllers/auth.controller.ts` — route handlers calling auth service
- [x] 4.8 Implement `routes/auth.routes.ts` — POST register/login/refresh/logout/forgot-password/reset-password, GET me
- [x] 4.9 Wire up auth routes in main Express app with middleware chain

## 5. Web App Shell

- [x] 5.1 Create `apps/web` — package.json, tsconfig.json, next.config.js, tailwind.config.ts
- [x] 5.2 Setup root layout with HTML structure, fonts, metadata
- [x] 5.3 Create Redux store with authSlice, uiSlice, redux-persist config
- [x] 5.4 Create ReduxProvider and QueryClientProvider wrapper components
- [x] 5.5 Create `lib/api.ts` — Axios instance with auth interceptor (auto token refresh on 401)
- [x] 5.6 Create `lib/queryClient.ts` — React Query config (staleTime, retry, etc.)
- [x] 5.7 Create placeholder layout components: Header, Footer, MobileNav
- [x] 5.8 Create homepage placeholder (`app/page.tsx`)

## 6. Admin App Shell

- [x] 6.1 Create `apps/admin` — package.json, tsconfig.json, next.config.js, tailwind.config.ts
- [x] 6.2 Setup root layout with admin sidebar-based design
- [x] 6.3 Create Redux store with authSlice, uiSlice (same structure as web)
- [x] 6.4 Create providers (Redux, React Query) and `lib/api.ts` with auth interceptor
- [x] 6.5 Create admin dashboard placeholder (`app/page.tsx`)

## 7. Integration & Verification

- [x] 7.1 Verify `turbo dev` starts all 3 apps concurrently
- [x] 7.2 Verify `docker-compose up` starts MongoDB + Redis
- [x] 7.3 Verify server connects to MongoDB and Redis on startup
- [x] 7.4 Verify auth endpoints work: register → login → refresh → me → logout
- [x] 7.5 Verify web and admin apps render with proper providers
