# WebĐọcTruyện — System Documentation

> Trang web đọc truyện tranh đa thể loại (Manga, Manhua, Manhwa)
> Lấy cảm hứng từ TruyenQQ

---

## Mục lục

1. [Tech Stack](#1-tech-stack)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Realtime Chat System](#6-realtime-chat-system)
7. [Notification System](#7-notification-system)
8. [Payment & Donation System](#8-payment--donation-system)
9. [Crawler System](#9-crawler-system)
10. [n8n Workflows](#10-n8n-workflows)
11. [Frontend Web](#11-frontend-web)
12. [Frontend Admin](#12-frontend-admin)
13. [Design System](#13-design-system)
14. [Docker Services](#14-docker-services)
15. [Chạy Project](#15-chạy-project)

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (User)** | Next.js, React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, React Query, Lucide Icons |
| **Frontend (Admin)** | Next.js, React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, React Query |
| **UI Components** | @webdoctruyen/ui (Button, Input, Modal, Table, Toast, Pagination) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB (Mongoose ODM) |
| **Cache** | Redis (ioredis) |
| **Image Storage** | Firebase Storage |
| **Realtime** | Socket.IO (namespaces: /chat, /notifications) |
| **Auth** | JWT (Access Token 15min + Refresh Token 7d HttpOnly Cookie) |
| **Automation** | n8n (self-hosted, Docker) |
| **Crawler** | Crawlee + Playwright (separate microservice) |
| **Monorepo** | Turborepo + npm workspaces |
| **Payment** | MoMo, VNPay, ZaloPay, Bank Transfer |

### Frontend State Management

```
Redux Toolkit (persisted)         React Query (TanStack)
├── authSlice (user, token)       ├── comics, chapters
├── uiSlice (theme, sidebar)      ├── comments, ratings
├── readerSlice (chapter, mode)   ├── follows, history
├── chatSlice (rooms, messages)   ├── notifications
└── notificationSlice (unread)    └── payments, donation-goals
```

---

## 2. Monorepo Structure

```
WebĐọcTruyện/
├── backend/
│   ├── server/                  # Express API server (port 5000)
│   │   └── src/
│   │       ├── config/          # env.ts, database.ts, redis.ts, firebase.ts
│   │       ├── controllers/     # 18 controllers
│   │       ├── middlewares/     # auth, role, rateLimiter, validator, upload, webhook
│   │       ├── models/          # 14 Mongoose models
│   │       ├── routes/          # 18 route files
│   │       ├── services/        # 19 service files
│   │       ├── socket/          # index.ts, auth.ts, chat.handler.ts, notification.handler.ts
│   │       ├── utils/           # jwt.ts, helpers.ts
│   │       ├── app.ts           # Express app configuration
│   │       └── index.ts         # Server entry (HTTP + Socket.IO)
│   └── shared/                  # @webdoctruyen/shared-be
│       └── src/
│           ├── types/           # 7 type files (user, comic, chat, payment, etc.)
│           ├── constants/       # roles.ts, enums.ts, categories.ts
│           └── utils/           # slug.ts, validate.ts (Zod schemas)
│
├── frontend/
│   ├── web/                     # Next.js user site (port 3000)
│   │   └── src/
│   │       ├── app/             # 11 pages (App Router)
│   │       ├── components/      # layout, comic, reader, chat, notification, auth
│   │       ├── hooks/           # 13 custom hooks
│   │       ├── store/           # Redux: 5 slices
│   │       ├── lib/             # api.ts, socket.ts, imageProxy.ts, queryClient.ts
│   │       └── styles/          # globals.css (Tailwind + design tokens)
│   ├── admin/                   # Next.js admin panel (port 3001)
│   │   └── src/
│   │       ├── app/             # 15 pages
│   │       ├── components/      # layout (Sidebar, AdminShell), auth (AdminAuthGuard)
│   │       ├── store/           # Redux: auth, ui slices
│   │       └── lib/             # api.ts, queryClient.ts
│   ├── shared/                  # @webdoctruyen/shared-fe (types, constants, utils)
│   └── ui/                      # @webdoctruyen/ui (Button, Input, Modal, Table, Toast, Pagination)
│
├── crawler-service/             # Crawlee + Playwright microservice (port 3002)
│   └── src/
│       ├── core/                # base-crawler.ts, storage.ts
│       ├── sites/               # truyenqq.ts, index.ts (registry)
│       ├── index.ts             # Express API (3 endpoints)
│       ├── crawl-manager.ts
│       └── types.ts
│
├── n8n/                         # n8n workflow configs
├── design-system/               # MASTER.md + page overrides
├── docker-compose.yml           # MongoDB, Redis, n8n, crawler
├── turbo.json                   # Turborepo config
└── package.json                 # Workspace root
```

---

## 3. Database Schema

### 14 Mongoose Models

#### User
```
email (unique), password (bcrypt 12 rounds), name, slug (unique)
avatar, role (guest|user|moderator|admin|superadmin), status (active|banned|suspended)
bannedUntil, bannedReason, totalDonated, donorBadge (none|bronze|silver|gold|diamond)
lastLogin, refreshTokens[], resetPasswordToken, resetPasswordExpires
```

#### Comic
```
title, slug (unique), otherNames[], description, coverUrl
author, artist, categories[] → Category, country (manga|manhua|manhwa|comic)
status (ongoing|completed|dropped), totalChapters
latestChapter { number, title, updatedAt }
views { total, daily, weekly, monthly }, rating { average, count }
followers, sourceUrl, isActive
```

#### Chapter
```
comicId → Comic, number, title, slug
pages [{ pageNumber, imageUrl, width, height }]
views, sourceUrl
```

#### Category
```
name (unique), slug (unique), description, comicCount
```

#### Follow
```
userId → User, comicId → Comic, lastReadChapter, notifyEnabled
```

#### Comment
```
userId → User, comicId → Comic, chapterId → Chapter (optional)
content, parentId → Comment (optional), likes[] (ObjectId)
status (visible|hidden|deleted)
```

#### Rating
```
userId → User, comicId → Comic, score (1-5)
```

#### ReadHistory
```
userId → User, comicId → Comic, chapterId → Chapter
chapterNumber, scrollPosition, lastReadAt
```

#### ChatRoom
```
name, type (global|group|direct), members[] → User
createdBy → User, isActive
```

#### ChatMessage
```
roomId → ChatRoom, userId → User, content
replyTo → ChatMessage (optional), status (visible|deleted)
```

#### Notification
```
userId → User, type (new_chapter|reply_comment|announcement|chat_message|donation_thanks)
title, message, data { comicId, chapterId, commentId, chatRoomId, paymentId }
read (boolean), createdAt (TTL: 30 ngày tự xóa)
```

#### Payment
```
userId → User, amount, currency (VND|USD)
method (momo|vnpay|zalopay|stripe|bank_transfer)
transactionId, status (pending|completed|failed|refunded)
message, displayName, isAnonymous
metadata { gatewayResponse, ipAddress, userAgent }
completedAt
```

#### DonationGoal
```
title, description, targetAmount, currentAmount
startDate, endDate, isActive
```

#### CrawlSource
```
name, baseUrl, selectors (mixed), headers (mixed)
schedule (cron), isActive, lastCrawlAt, lastError
stats { totalCrawled, totalErrors, lastSuccessAt }
```

---

## 4. API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | Public | Đăng ký tài khoản mới |
| POST | /login | Public | Đăng nhập, trả JWT + cookie |
| POST | /refresh | Cookie | Refresh access token |
| POST | /logout | User | Logout, blacklist token |
| POST | /forgot-password | Public | Gửi email reset password |
| POST | /reset-password | Public | Đặt lại mật khẩu |
| GET | /me | User | Thông tin user hiện tại |

### Comics (`/api/comics`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Public | Danh sách truyện (paginated, filter) |
| GET | /hot | Public | Truyện hot |
| GET | /recommended | Public | Truyện đề cử |
| GET | /:slug | Public | Chi tiết truyện |
| GET | /:slug/chapters | Public | Danh sách chapter |
| POST | / | Admin | Tạo truyện |
| PUT | /:id | Admin | Sửa truyện |
| DELETE | /:id | Admin | Xóa truyện |

### Chapters (`/api/chapters`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /:comicSlug/:chapSlug | Public | Đọc chapter |
| POST | / | Admin | Tạo chapter |
| PUT | /:id | Admin | Sửa chapter |
| DELETE | /:id | Admin | Xóa chapter |

### Categories (`/api/categories`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Public | Danh sách thể loại |
| POST | / | Admin | Tạo thể loại |
| PUT | /:id | Admin | Sửa thể loại |
| DELETE | /:id | Admin | Xóa thể loại |

### Search (`/api/search`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Public | Full-text search truyện |

### Upload (`/api/upload`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | / | Admin | Upload file → Firebase Storage |

### Follows (`/api/follows`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /my | User | Truyện đang theo dõi |
| POST | / | User | Theo dõi truyện |
| DELETE | /:id | User | Bỏ theo dõi |

### Comments (`/api/comments`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /comic/:comicId | Public | Comments của truyện |
| GET | /chapter/:chapterId | Public | Comments của chapter |
| POST | / | User | Tạo comment (tự gửi notification nếu reply) |
| PUT | /:id | User | Sửa comment (chỉ chủ) |
| DELETE | /:id | User/Mod | Xóa comment |
| POST | /:id/like | User | Like comment |
| DELETE | /:id/like | User | Unlike comment |

### Ratings (`/api/ratings`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /comic/:comicId | Public | Rating truyện |
| POST | / | User | Đánh giá truyện (1-5) |

### History (`/api/history`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /my | User | Lịch sử đọc |
| POST | / | User | Lưu tiến độ đọc |
| DELETE | /:id | User | Xóa lịch sử |

### Rankings (`/api/rankings`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Public | Xếp hạng (hot, new, followed) |

### Chat (`/api/chat`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /rooms | User | Phòng chat của user |
| GET | /rooms/all | Admin | Tất cả phòng chat |
| POST | /rooms | Mod+ | Tạo phòng group |
| POST | /rooms/direct/:userId | User | Tạo/lấy DM |
| POST | /rooms/:id/join | User | Vào phòng |
| POST | /rooms/:id/leave | User | Rời phòng |
| DELETE | /rooms/:id | Admin | Xóa phòng |

### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | User | Danh sách thông báo (paginated) |
| GET | /unread-count | User | Số thông báo chưa đọc |
| PUT | /read-all | User | Đánh dấu tất cả đã đọc |
| PUT | /:id/read | User | Đánh dấu 1 thông báo đã đọc |
| POST | /announce | Admin | Gửi thông báo tới tất cả user |

### Payments (`/api/payments`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /recent | Public | Donations gần đây |
| GET | /top-donors | Public | Top donors |
| POST | / | User | Tạo donation (min 10,000đ) |
| GET | /my | User | Lịch sử donate cá nhân |
| GET | / | Admin | Tất cả payments |
| GET | /stats | Admin | Thống kê (tổng, hôm nay, giao dịch) |
| PUT | /:id/complete | Admin | Xác nhận payment → cập nhật badge + gửi notification |
| PUT | /:id/fail | Admin | Từ chối payment |

### Donation Goals (`/api/donation-goals`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /active | Public | Goals đang active |
| GET | /:id | Public | Chi tiết goal |
| GET | / | Admin | Tất cả goals |
| POST | / | Admin | Tạo goal |
| PUT | /:id | Admin | Sửa goal |
| DELETE | /:id | Admin | Xóa goal |

### Webhooks (`/api/webhooks`) — Exempt rate limiting
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /crawl-webhook | Secret | Nhận data từ crawler |

### Crawl Sources (`/api/crawl-sources`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Admin | Danh sách crawl sources |
| POST | / | Admin | Tạo crawl source |
| PUT | /:id | Admin | Sửa crawl source |
| DELETE | /:id | Admin | Xóa crawl source |

### n8n (`/api/n8n`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /trigger | Admin | Trigger n8n workflow |

### Utility
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | Public | Health check |
| GET | /api/image-proxy?url= | Public | Proxy ảnh từ hinhhinh.com (bypass hotlink) |

---

## 5. Authentication & Authorization

### JWT Flow
```
Register/Login → Server trả { accessToken, user } + set refreshToken cookie (HttpOnly, 7d)
│
├── accessToken (15 phút) → gắn vào Authorization: Bearer header
├── refreshToken (7 ngày) → HttpOnly cookie, rotate mỗi lần refresh
└── Logout → blacklist accessToken trong Redis (TTL = thời gian còn lại)
```

### 5 Role Levels (Hierarchy)
| Role | Level | Quyền |
|------|-------|-------|
| guest | 0 | Xem truyện public |
| user | 1 | + Comment, follow, rate, history, chat, donate |
| moderator | 2 | + Tạo phòng chat, moderate comments |
| admin | 3 | + CRUD truyện/chapter/category, quản lý payments, gửi thông báo |
| superadmin | 4 | + Quản lý tất cả |

### Middlewares
- `authMiddleware` — Validate Bearer token, check blacklist Redis, attach `req.user`
- `optionalAuth` — Gắn user nếu có token, không bắt buộc
- `requireRole(minRole)` — Check `hasRole(user.role, minRole)` theo hierarchy
- `generalLimiter` — 1000 req/15min (dev), 100 req/15min (prod)
- `authLimiter` — 100 req/15min (dev), 5 req/15min (prod)

### Donor Badge System
| Badge | Threshold | Quyền lợi |
|-------|-----------|-----------|
| Bronze | ≥ 100,000đ | Badge trên profile |
| Silver | ≥ 500,000đ | + Tên màu đặc biệt |
| Gold | ≥ 1,000,000đ | + Khung avatar |
| Diamond | ≥ 2,000,000đ | + Badge trong comment |

Badge tự động cập nhật khi admin xác nhận payment.

---

## 6. Realtime Chat System

### Socket.IO Architecture
```
Express HTTP Server
└── Socket.IO Server
    ├── /chat namespace
    │   ├── Auth middleware (JWT from handshake.auth.token)
    │   ├── Auto-join global room on connect
    │   ├── Redis online:users set (SADD/SREM)
    │   └── Events:
    │       ├── chat:send → save + broadcast to room
    │       ├── chat:delete → ownership/mod check + broadcast
    │       ├── chat:typing → broadcast to room
    │       ├── chat:history → cursor-based pagination (50 msgs)
    │       ├── room:join / room:leave
    │       ├── presence:online / presence:offline (broadcast)
    │       └── presence:list → return online user IDs
    │
    └── /notifications namespace
        ├── Auth middleware (JWT)
        ├── Join user-specific room (user:{userId})
        ├── On connect → send all unread notifications
        └── Events:
            ├── notification:new → real-time push
            └── notification:unread → initial load
```

### Room Types
| Type | Mô tả | Ai tạo |
|------|--------|--------|
| global | 1 phòng duy nhất, mọi người auto-join | System (seed) |
| group | Phòng nhóm | Admin/Moderator |
| direct | Chat 1-1 | User (tự tạo khi DM) |

---

## 7. Notification System

### 5 Loại Notification
| Type | Trigger | Recipient |
|------|---------|-----------|
| `new_chapter` | Crawler/admin thêm chapter mới | Tất cả user follow truyện đó |
| `reply_comment` | User reply comment | Chủ comment gốc |
| `announcement` | Admin gửi thông báo | Tất cả active users |
| `chat_message` | DM khi user offline | User nhận DM |
| `donation_thanks` | Admin xác nhận payment | User donate |

### Flow
```
Event xảy ra → notification.service.create() → save MongoDB
    → Check Redis online:users
    → Nếu online → emitNotificationToUser() via Socket.IO
    → Nếu offline → notification chờ trong DB, gửi khi user connect
```

Auto-cleanup: TTL index 30 ngày trên `createdAt`.

---

## 8. Payment & Donation System

### Flow (Bank Transfer)
```
1. User chọn số tiền + phương thức → POST /api/payments
2. Server tạo Payment (status: pending)
3. User chuyển khoản theo thông tin ngân hàng
4. Admin vào /payments → xác nhận (PUT /:id/complete)
5. Server:
   - Payment.status = completed
   - User.totalDonated += amount
   - User.donorBadge = calculateBadge(totalDonated)
   - Tạo notification donation_thanks
   - Nếu có donationGoalId → DonationGoal.currentAmount += amount
```

### Donation Goals
Admin tạo mục tiêu (vd: "Server tháng 3/2026 - 2,000,000đ"). Public endpoint trả goals active với progress bar.

### Stats (Admin)
- Tổng tiền donate
- Tổng giao dịch completed
- Tiền donate hôm nay

---

## 9. Crawler System

### Architecture: Strategy Pattern
```
crawler-service/ (port 3002)
├── BaseCrawler (abstract)
│   ├── launchBrowser()
│   ├── downloadImage()
│   ├── uploadFirebase()
│   ├── delay(), retry()
│   └── 3 abstract methods
│
└── TruyenQQCrawler extends BaseCrawler
    ├── getComicInfo()     # Cheerio (static HTML)
    ├── getChapterList()   # Cheerio
    └── getChapterImages() # Playwright (lazy-loaded images)
```

### API (3 endpoints)
| Method | Path | Description |
|--------|------|-------------|
| POST | /crawl | Crawl 1 truyện |
| POST | /crawl/all | Crawl tất cả |
| GET | /crawl/status | Trạng thái crawl |

### Anti-bot
- Random delay (1-3s)
- Rotate User-Agent
- Playwright stealth plugin
- New headless mode

### 5 Truyện Target
1. Đại Quản Gia Là Ma Hoàng
2. Ta Trọng Sinh Là Nhân Vật Phản Diện
3. Ta Trùng Sinh Thành Liêu Đột Biến
4. One Punch Man
5. Sakamoto Days

### Image Pipeline
```
TruyenQQ → Playwright render → Extract image URLs → Download
→ Upload Firebase Storage → Store Firebase URL in Chapter.pages[]
→ Frontend dùng /api/image-proxy cho ảnh từ hinhhinh.com (hotlink protection)
```

---

## 10. n8n Workflows

n8n trigger crawler service theo schedule:
```
n8n (schedule cron) → POST crawler-service/crawl/all
                    → Crawler chạy → POST /api/webhooks/crawl-webhook
                    → Backend cập nhật DB + gửi notification followers
```

---

## 11. Frontend Web

### Pages (11 trang)
| URL | Trang | Auth |
|-----|-------|------|
| `/` | Trang chủ (đề cử + mới cập nhật + hot sidebar) | Public |
| `/truyen` | Danh sách truyện (grid, paginated) | Public |
| `/truyen/[slug]` | Chi tiết truyện (info, chapters, comments, ratings) | Public |
| `/truyen/[slug]/[chap]` | Đọc chapter (long-strip vertical, lazy load, auto-save) | Public |
| `/the-loai/[slug]` | Truyện theo thể loại | Public |
| `/tim-kiem` | Tìm kiếm truyện | Public |
| `/xep-hang` | Xếp hạng (hot, new, followed) | Public |
| `/chat` | Chat (rooms + messages + online users) | User |
| `/donate` | Ủng hộ (donation form + goals + recent + top donors) | Public/User |
| `/dang-nhap` | Đăng nhập | Guest |
| `/dang-ky` | Đăng ký | Guest |

### Components
| Folder | Components |
|--------|-----------|
| layout/ | Header (backdrop-blur, Lucide icons, user menu + role badge, mobile nav), Footer (4-col grid) |
| comic/ | ComicCard, ComicGrid, ComicDetail, ChapterList, CommentSection |
| reader/ | ChapterReader (vertical scroll), ImageLoader (lazy), ReaderControls |
| chat/ | RoomList, MessageList, MessageBubble, MessageInput, OnlineUsers, TypingIndicator |
| notification/ | NotificationBell (Lucide Bell + badge), NotificationDropdown (Lucide icons per type) |
| auth/ | AuthGuard (role-based route protection) |

### Hooks (13)
| Hook | Mô tả |
|------|-------|
| useAuth | login, register, logout, checkRole |
| useSocket | Connect Socket.IO on login, wire events → Redux |
| useComics | List, filter, hot, recommended |
| useChapter | Get chapter by slug |
| useComments | CRUD comments, like/unlike |
| useFollow | Follow/unfollow |
| useHistory | Reading history |
| useRatings | Rate comic |
| useRankings | Rankings data |
| useSearch | Search comics |
| useChat | REST: rooms, join, leave, DM |
| useNotifications | List, markRead, markAllRead, unreadCount |
| useDonate | Create payment, recent, top donors, active goals |

### Redux Store (5 slices)
| Slice | Persisted | Key State |
|-------|-----------|-----------|
| auth | Yes | user, accessToken, isAuthenticated |
| ui | Yes | theme, sidebarOpen |
| reader | Yes | readingMode, imageFit, currentChapter |
| chat | No | rooms, activeRoomId, messages, onlineUsers, typingUsers |
| notification | No | notifications[], unreadCount |

---

## 12. Frontend Admin

### Auth Gate
- `/dang-nhap` — Login page, reject user role < moderator
- `AdminAuthGuard` — Wrap tất cả pages, redirect về login nếu chưa auth
- `AdminShell` — Sidebar + content area (không hiện cho login page)
- Sidebar hiển thị user info + role badge + logout ở bottom

### Pages (15 trang)
| URL | Trang |
|-----|-------|
| `/` | Dashboard |
| `/dang-nhap` | Admin login |
| `/comics` | Quản lý truyện (table + CRUD) |
| `/comics/create` | Tạo truyện mới |
| `/comics/[id]/edit` | Sửa truyện |
| `/chapters/[comicId]` | Quản lý chapters |
| `/chapters/upload` | Upload chapter hàng loạt |
| `/categories` | Quản lý thể loại |
| `/comments` | Moderate comments |
| `/chat` | Quản lý phòng chat (list, create, delete) |
| `/notifications` | Gửi thông báo (announcement form) |
| `/payments` | Quản lý donations (stats, filter, confirm/reject) |
| `/donation-goals` | CRUD mục tiêu donate (progress bar) |
| `/crawl-sources` | Quản lý crawler sources |
| `/n8n` | Trigger/monitor n8n workflows |

---

## 13. Design System

### Color Palette
| Role | Hex | Tailwind |
|------|-----|----------|
| Primary | `#1C1917` | `text-primary`, `bg-primary` |
| Secondary | `#44403C` | `text-secondary`, `bg-secondary` |
| Accent/CTA | `#CA8A04` | `text-accent`, `bg-accent` |
| Accent Hover | `#A16207` | `bg-accent-hover` |
| Surface | `#FAFAF9` | `bg-surface` |
| Surface Alt | `#F5F5F4` | `bg-surface-alt` |
| Border | `#E7E5E4` | `border-border` |
| Text | `#0C0A09` | `text-text` |
| Text Muted | `#57534E` | `text-text-muted` |
| Text Faint | `#A8A29E` | `text-text-faint` |

### Typography
- **Heading:** Righteous (Google Fonts)
- **Body:** Poppins (300-700)
- **CSS:** `font-heading` / `font-body` (defined in `@theme` block)

### Icons
- **Library:** Lucide React (`lucide-react`)
- **Size:** h-5 w-5 (nav), h-4 w-4 (inline)
- **Rule:** Không dùng emoji làm icon

### UI Rules
- `cursor-pointer` trên tất cả clickable elements
- Transitions: `duration-200` (150-300ms)
- Focus: `focus-visible:outline-2 outline-accent`
- `prefers-reduced-motion` respected (globals.css)
- Responsive: 375px, 768px, 1024px, 1440px
- Header: `backdrop-blur-lg bg-surface/80`
- Custom scrollbar (6px, rounded)

---

## 14. Docker Services

```yaml
# docker-compose.yml
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongodb_data:/data/db]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  n8n:
    image: n8nio/n8n:latest
    ports: ["5678:5678"]
    volumes: [n8n_data:/home/node/.n8n]

  crawler-service:
    build: ./crawler-service
    ports: ["3002:3002"]
    environment:
      - BACKEND_URL=http://host.docker.internal:5000
      - WEBHOOK_SECRET=crawler-webhook-secret
```

---

## 15. Chạy Project

### Yêu cầu
- Node.js ≥ 20
- Docker Desktop (cho MongoDB + Redis)
- npm

### Khởi động

```bash
# 1. Start database services
docker compose up -d mongodb redis

# 2. Install dependencies (root)
npm install

# 3. Start backend (port 5000)
cd backend/server && npx tsx src/index.ts

# 4. Start frontend web (port 3000)
cd frontend/web && npx next dev -p 3000

# 5. Start frontend admin (port 3001)
cd frontend/admin && npx next dev -p 3001
```

### URLs
| Service | URL |
|---------|-----|
| Frontend Web | http://localhost:3000 |
| Frontend Admin | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |
| n8n | http://localhost:5678 |
| Crawler | http://localhost:3002 |

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.com | admin123 |
| User | testuser@test.com | 123456 |

### Environment Variables (`backend/server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/webdoctruyen
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_STORAGE_BUCKET=...
WEBHOOK_SECRET=crawler-webhook-secret
N8N_URL=http://localhost:5678
CRAWLER_SERVICE_URL=http://localhost:3002
```
