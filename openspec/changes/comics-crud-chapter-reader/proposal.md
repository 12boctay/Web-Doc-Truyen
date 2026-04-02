## Why

Proposal 1 đã thiết lập foundation (monorepo, DB models, auth). Bây giờ cần tính năng cốt lõi của trang đọc truyện: quản lý truyện/chapter (admin), hiển thị danh sách truyện, chi tiết truyện, và đọc chapter (user). Không có tính năng này thì site không có nội dung để hiển thị.

## What Changes

### Backend (apps/server)
- **Comics API**: CRUD endpoints cho comics — list (paginate, filter, sort), detail by slug, hot, recommended, create/update/delete (admin)
- **Chapters API**: CRUD endpoints — read chapter by slug, create/update/delete (admin), upload chapter images
- **Categories API**: CRUD endpoints — list all, create/update/delete (admin)
- **Search API**: Full-text search với autocomplete suggestions
- **Follow API**: Follow/unfollow truyện, danh sách truyện đang follow
- **Comments API**: CRUD comments, like/unlike, moderate (mod+)
- **Ratings API**: Rate comic (1-5), get ratings
- **Read History API**: Save/get reading progress
- **Rankings API**: Top daily/weekly/monthly/all-time, top follow, top rating
- **Redis caching**: Cache comic lists, detail, rankings cho performance
- **Image upload**: Firebase Storage upload cho comic covers và chapter pages

### Frontend — Web (apps/web)
- **Trang chủ**: Truyện mới cập nhật, truyện hot, truyện đề cử
- **Danh sách truyện** (`/truyen`): Grid view, filter theo country/category/status, sort, pagination
- **Chi tiết truyện** (`/truyen/[slug]`): Cover, info, chapter list, comments, rating, follow button
- **Đọc chapter** (`/truyen/[slug]/[chap]`): Image viewer, prev/next navigation, reader controls
- **Thể loại** (`/the-loai/[slug]`): Filter truyện theo thể loại
- **Tìm kiếm** (`/tim-kiem`): Search với autocomplete
- **Xếp hạng** (`/xep-hang`): Bảng xếp hạng theo nhiều tiêu chí
- **React Query hooks**: useComics, useChapter, useSearch, useFollow, useComments, useRatings

### Frontend — Admin (apps/admin)
- **Comics management**: List, create, edit, delete comics
- **Chapter management**: List chapters per comic, upload chapter images
- **Category management**: CRUD categories
- **Comment moderation**: View/hide/delete comments

## Capabilities

### New Capabilities
- `comics-api`: Backend CRUD cho comics — list, filter, sort, pagination, detail, hot, recommended, Redis cache
- `chapters-api`: Backend CRUD cho chapters — read pages, upload images to Firebase, manage chapter lifecycle
- `categories-api`: Backend CRUD cho categories
- `search-api`: Full-text search truyện với MongoDB text index, autocomplete suggestions
- `interactions-api`: Follow, comments (CRUD + like + moderate), ratings, read history, rankings
- `comic-pages`: Frontend pages — trang chủ, danh sách, chi tiết, thể loại, tìm kiếm, xếp hạng (web app)
- `chapter-reader`: Frontend chapter reader — image viewer, navigation, reader controls, reading progress
- `admin-comics`: Admin panel — comics/chapter/category CRUD UI, comment moderation

### Modified Capabilities
_(none)_

## Impact

- **Backend**: ~20 new API endpoints, 10+ service/controller/route files
- **Frontend web**: ~15 new pages/components, 6+ React Query hooks
- **Frontend admin**: ~8 new pages for content management
- **Dependencies**: May add `multer` for file uploads if not present
- **Redis**: Cache layer for hot data (comic lists, rankings)
- **Firebase Storage**: Active usage for comic covers + chapter page images
