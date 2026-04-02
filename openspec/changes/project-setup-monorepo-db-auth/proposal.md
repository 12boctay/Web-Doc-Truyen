## Why

Dự án WebĐọcTruyện chưa có code nào — cần thiết lập foundation trước khi xây các tính năng. Monorepo structure, database models, và authentication là nền tảng mà mọi feature khác (Comics CRUD, Crawler, Chat, Payment) đều phụ thuộc vào.

## What Changes

- **Turborepo monorepo** với 3 apps (`web`, `admin`, `server`) và 2 packages (`shared`, `ui`)
- **Cấu hình chung**: TypeScript, ESLint, Prettier, path aliases, environment variables
- **Docker Compose** cho MongoDB + Redis (dev environment)
- **MongoDB models** (Mongoose): User, Comic, Chapter, Category, Follow, Comment, Rating, ReadHistory, Notification, ChatRoom, ChatMessage, Payment, DonationGoal, CrawlSource — đầy đủ indexes
- **Authentication system**: Register, Login, Refresh Token, Logout, Forgot/Reset Password
- **JWT flow**: Access Token (15min, in-memory) + Refresh Token (7d, HttpOnly cookie)
- **Role-based authorization**: Guest → User → Moderator → Admin → Super Admin
- **Middleware chain**: Rate limiter → Auth middleware → Role middleware
- **Redis integration**: Session/token blacklist, rate limiting
- **Firebase Admin SDK** setup (cho image upload sau này)
- **Next.js app shells** cho `web` (port 3000) và `admin` (port 3001) với basic layout, Tailwind, Redux Toolkit store, React Query provider
- **Shared package**: TypeScript types, constants (roles, categories), utility functions (slug, format, validate)

## Capabilities

### New Capabilities

- `monorepo-setup`: Turborepo configuration, workspace structure, shared configs (TS, ESLint, Prettier), Docker Compose for dev services
- `database-models`: All Mongoose models with schemas, indexes, virtuals, and validation — foundation for entire app
- `auth-system`: JWT-based authentication (register, login, refresh, logout, forgot/reset password), role-based authorization middleware, rate limiting
- `app-shells`: Next.js app shells for web + admin with providers (Redux, React Query, theme), layouts, and Tailwind setup

### Modified Capabilities

_(none — greenfield project)_

## Impact

- **New files**: ~80-100 files across monorepo structure
- **Dependencies**: Next.js, Express, Mongoose, Redis (ioredis), Firebase Admin, bcrypt, jsonwebtoken, Tailwind CSS, Redux Toolkit, TanStack Query, Socket.IO (setup only), Zod (validation)
- **Infrastructure**: Requires Docker for MongoDB + Redis in development
- **APIs created**: `/api/auth/*` (7 endpoints), `/api/users/me`
- **Downstream**: All future proposals (Comics, Crawler, Chat, Payment) build on this foundation
