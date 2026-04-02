## Context

Proposal 1 đã hoàn thành: monorepo, 14 Mongoose models, JWT auth, app shells. Tất cả models (Comic, Chapter, Category, Follow, Comment, Rating, ReadHistory) đã có schema + indexes. Cần xây dựng API endpoints, services, frontend pages, và UI components cho core reading experience.

## Goals / Non-Goals

**Goals:**
- Full CRUD backend cho comics, chapters, categories
- User interactions: follow, comment, rating, read history, rankings
- Search với MongoDB text index + autocomplete
- Redis caching cho hot data
- Image upload tới Firebase Storage (covers + chapter pages)
- Frontend pages: trang chủ, danh sách, chi tiết, đọc chapter, tìm kiếm, xếp hạng
- Admin UI: quản lý truyện, chapter, thể loại, comment moderation
- Chapter reader: long-strip image viewer, prev/next navigation, reading controls

**Non-Goals:**
- Crawler system (Proposal 3)
- Chat system (Proposal 4)
- Payment / Donation (Proposal 5)
- SEO optimization (sẽ thêm sau)
- PWA / offline reading

## Decisions

### 1. Backend service pattern

**Decision:** Mỗi resource 1 bộ route → controller → service. Controller chỉ parse request + send response, service chứa business logic.

**Why:** Consistent với auth system đã build. Dễ test service riêng biệt.

### 2. Pagination strategy

**Decision:** Cursor-based pagination cho comic lists (dùng `updatedAt` + `_id`), offset-based cho admin tables.

**Alternative considered:** Offset-based everywhere — rejected vì performance kém với large datasets khi sort by updatedAt.

**Implementation:** Trả về `{ data, pagination: { page, limit, total, totalPages } }` cho offset, `{ data, nextCursor }` cho cursor.

**Update:** Giữ offset-based cho tất cả để đơn giản — dataset chưa lớn đủ để cursor-based tạo khác biệt. Chuyển cursor khi cần.

### 3. Redis caching strategy

**Decision:** Cache-aside pattern. Cache keys:
- `comics:list:{hash(filters)}` — TTL 5 min
- `comic:{slug}` — TTL 10 min
- `rankings:{type}` — TTL 15 min
- `categories:all` — TTL 1 hour

Invalidation: Bust cache khi admin create/update/delete. Dùng Redis `DEL` + prefix scan.

**Why:** Simple, predictable. Read-heavy workload phù hợp cache-aside.

### 4. Image upload flow

**Decision:**
1. Admin upload images qua `POST /api/upload/images` (multer → memory buffer)
2. Server upload tới Firebase Storage
3. Return array of URLs
4. Admin dùng URLs khi create/update comic cover hoặc chapter pages

**Why:** Upload trước, lưu URL sau — decouple upload từ entity creation. Multer memory storage tránh temp files.

**Limits:** Max 10 images/request, max 5MB/image.

### 5. Chapter reader architecture

**Decision:** Long-strip vertical scroll reader (like TruyenQQ). Images lazy-loaded với Intersection Observer. Preload 3 images ahead. Reader controls overlay: prev/next chapter, scroll-to-top, chapter select dropdown.

**Why:** Long-strip là chuẩn cho manhwa/manhua. Lazy load cho performance. Preload cho smooth experience.

### 6. Frontend data fetching

**Decision:** React Query hooks cho tất cả API calls. Pattern: `useComics(filters)`, `useComic(slug)`, `useChapter(comicSlug, chapSlug)`. Prefetch on hover cho comic cards.

**Why:** React Query handles caching, refetching, loading states. Prefetch giảm perceived latency.

### 7. Search implementation

**Decision:** MongoDB text index trên `title` + `otherNames` (đã setup trong Proposal 1). Autocomplete dùng regex prefix match (not Atlas Search) — đủ cho dataset nhỏ-trung.

**Why:** No need Atlas Search for ~1000 comics. Text index + regex covers basic needs.

### 8. View counting

**Decision:** Increment views trực tiếp trên MongoDB document. Dùng Redis `INCR` cho daily/weekly/monthly counters, sync về MongoDB qua cron (n8n, Proposal 3). For now, direct increment.

**Why:** Simple. Exact counts not critical. Tránh over-engineering.

### 9. Comment system

**Decision:** Flat comments với optional `parentId` cho replies. Max 2 levels deep (comment → reply). Paginated, sorted by newest first. Like/unlike toggle.

**Why:** Simple UI, sufficient cho manga reader. Nested deeper gây complexity không cần thiết.

## Risks / Trade-offs

- **[Risk] Image upload size** → Mitigation: 5MB limit per image, validate MIME type server-side, resize nếu cần (chưa implement resize ở proposal này)
- **[Risk] Cache invalidation consistency** → Mitigation: Bust on write. Accept stale reads (5-15 min TTL). Admin panel always queries DB directly.
- **[Risk] View count accuracy** → Mitigation: Acceptable for now. No dedup per user/IP yet — sẽ thêm nếu cần.
- **[Trade-off] Offset pagination** → Simple nhưng slow cho deep pages. Dataset hiện tại nhỏ nên OK.
- **[Trade-off] No image optimization** → Upload raw images. CDN/image optimization sẽ thêm sau.
