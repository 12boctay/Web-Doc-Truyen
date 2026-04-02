## 1. Backend — Comics API

- [x] 1.1 Create `services/comic.service.ts` — list (filter, sort, paginate), getBySlug, getChapters, hot, recommended, create, update, delete
- [x] 1.2 Create `controllers/comic.controller.ts` — route handlers
- [x] 1.3 Create `routes/comic.routes.ts` — GET list/slug/chapters/hot/recommended, POST/PUT/DELETE (admin)
- [x] 1.4 Add Redis caching in comic service — cache list, detail, hot, recommended with TTL + invalidation on write
- [x] 1.5 Wire up comic routes in app.ts

## 2. Backend — Chapters API + Upload

- [x] 2.1 Create `services/chapter.service.ts` — getBySlug (with view increment), create (update comic totals), update, delete
- [x] 2.2 Create `controllers/chapter.controller.ts` — route handlers
- [x] 2.3 Create `routes/chapter.routes.ts` — GET read, POST/PUT/DELETE (admin)
- [x] 2.4 Create `services/upload.service.ts` — upload images to Firebase Storage, return URLs
- [x] 2.5 Create `controllers/upload.controller.ts` + `routes/upload.routes.ts` — POST /upload/images, /upload/avatar with multer
- [x] 2.6 Add `middlewares/upload.middleware.ts` — multer config (memory storage, 5MB limit, image MIME filter)
- [x] 2.7 Wire up chapter + upload routes in app.ts

## 3. Backend — Categories API

- [x] 3.1 Create `services/category.service.ts` — list (cached), create, update, delete (with comic count check)
- [x] 3.2 Create `controllers/category.controller.ts` + `routes/category.routes.ts`
- [x] 3.3 Wire up category routes in app.ts

## 4. Backend — Search API

- [x] 4.1 Create `services/search.service.ts` — fulltext search, autocomplete suggest
- [x] 4.2 Create `controllers/search.controller.ts` + `routes/search.routes.ts`
- [x] 4.3 Wire up search routes in app.ts

## 5. Backend — Interactions (Follow, Comment, Rating, History, Rankings)

- [x] 5.1 Create `services/follow.service.ts` — follow, unfollow, list follows (with comic data)
- [x] 5.2 Create `controllers/follow.controller.ts` + `routes/follow.routes.ts`
- [x] 5.3 Create `services/comment.service.ts` — create, list (paginated, populated), like/unlike, moderate status
- [x] 5.4 Create `controllers/comment.controller.ts` + `routes/comment.routes.ts`
- [x] 5.5 Create `services/rating.service.ts` — upsert rating, recalculate comic average, get own rating
- [x] 5.6 Create `controllers/rating.controller.ts` + `routes/rating.routes.ts`
- [x] 5.7 Create `services/history.service.ts` — upsert read progress, list history
- [x] 5.8 Create `controllers/history.controller.ts` + `routes/history.routes.ts`
- [x] 5.9 Create `services/ranking.service.ts` — daily/weekly/monthly/all-time/top-follow/top-rating (cached)
- [x] 5.10 Create `controllers/ranking.controller.ts` + `routes/ranking.routes.ts`
- [x] 5.11 Wire up all interaction routes in app.ts

## 6. Frontend Web — React Query Hooks

- [x] 6.1 Create `hooks/useComics.ts` — useComics(filters), useComic(slug), useComicChapters(slug), useHotComics, useRecommended
- [x] 6.2 Create `hooks/useChapter.ts` — useChapter(comicSlug, chapSlug)
- [x] 6.3 Create `hooks/useSearch.ts` — useSearch(query), useSuggest(query)
- [x] 6.4 Create `hooks/useFollow.ts` — useFollows(), useFollowMutation(), useUnfollowMutation()
- [x] 6.5 Create `hooks/useComments.ts` — useComments(comicId), useCreateComment(), useLikeComment()
- [x] 6.6 Create `hooks/useRatings.ts` — useComicRating(comicId), useMyRating(comicId), useRateMutation()
- [x] 6.7 Create `hooks/useHistory.ts` — useHistory(), useSaveProgress()
- [x] 6.8 Create `hooks/useRankings.ts` — useRankings(type)

## 7. Frontend Web — Comic Components

- [x] 7.1 Create `components/comic/ComicCard.tsx` — cover, title, latest chapter, country badge, hover prefetch
- [x] 7.2 Create `components/comic/ComicGrid.tsx` — responsive grid of ComicCards
- [x] 7.3 Create `components/comic/ComicDetail.tsx` — full comic info, categories, follow button, rating
- [x] 7.4 Create `components/comic/ChapterList.tsx` — sorted chapter list with links
- [x] 7.5 Create `components/comic/CommentSection.tsx` — comments list, create form, like button, reply

## 8. Frontend Web — Reader Components

- [x] 8.1 Create `store/slices/readerSlice.ts` — reader state (mode, image fit, current chapter)
- [x] 8.2 Create `components/reader/ChapterReader.tsx` — long-strip vertical scroll container
- [x] 8.3 Create `components/reader/ImageLoader.tsx` — lazy-loaded image with Intersection Observer + placeholder
- [x] 8.4 Create `components/reader/ReaderControls.tsx` — overlay controls (prev/next, chapter select, scroll-top)

## 9. Frontend Web — Pages

- [x] 9.1 Update `app/page.tsx` — homepage with latest comics grid, hot sidebar, recommended section
- [x] 9.2 Create `app/truyen/page.tsx` — comics listing with filters, sort, pagination
- [x] 9.3 Create `app/truyen/[slug]/page.tsx` — comic detail page
- [x] 9.4 Create `app/truyen/[slug]/[chap]/page.tsx` — chapter reader page
- [x] 9.5 Create `app/the-loai/[slug]/page.tsx` — category filter page
- [x] 9.6 Create `app/tim-kiem/page.tsx` — search page with autocomplete
- [x] 9.7 Create `app/xep-hang/page.tsx` — rankings page with tabs

## 10. Frontend Admin — Content Management

- [x] 10.1 Create `app/comics/page.tsx` — comics table with search, filter, pagination
- [x] 10.2 Create `app/comics/create/page.tsx` — create comic form with image upload
- [x] 10.3 Create `app/comics/[id]/edit/page.tsx` — edit comic form
- [x] 10.4 Create `app/chapters/[comicId]/page.tsx` — chapters list per comic
- [x] 10.5 Create `app/chapters/upload/page.tsx` — upload chapter with drag-drop images
- [x] 10.6 Create `app/categories/page.tsx` — inline CRUD categories table
- [x] 10.7 Create `app/comments/page.tsx` — comment moderation table

## 11. Integration & Verification

- [x] 11.1 Verify all backend API endpoints return correct responses
- [x] 11.2 Verify Redis caching works for comic list, detail, rankings
- [x] 11.3 Verify frontend pages render with data from API
- [x] 11.4 Verify chapter reader loads images and navigation works
- [x] 11.5 Verify admin CRUD operations for comics, chapters, categories
