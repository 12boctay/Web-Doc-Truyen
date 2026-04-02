## ADDED Requirements

### Requirement: Homepage with latest updates

The homepage SHALL display: truyện mới cập nhật (grid, paginated), truyện hot (sidebar), truyện đề cử (carousel/section). Data fetched via React Query hooks.

#### Scenario: Homepage loads

- **WHEN** user visits `/`
- **THEN** the page shows latest updated comics grid, hot comics sidebar, and recommended section

### Requirement: Comics listing page

The system SHALL provide `/truyen` page with comic grid, filters (country, category, status), sort dropdown, and pagination.

#### Scenario: Filter and sort comics

- **WHEN** user selects country "manhwa" and sort "popular"
- **THEN** the grid updates to show only manhwa comics sorted by total views

#### Scenario: Pagination

- **WHEN** user clicks page 2
- **THEN** the grid loads the next set of comics

### Requirement: Comic detail page

The system SHALL provide `/truyen/[slug]` page showing: cover, title, author, artist, categories (clickable), description, rating (with rate button), follow button, chapter list (sorted by number desc), comments section.

#### Scenario: View comic detail

- **WHEN** user visits `/truyen/one-punch-man`
- **THEN** the page shows full comic info, chapter list, comments, and user-specific state (followed?, my rating)

#### Scenario: Follow comic from detail page

- **WHEN** authenticated user clicks "Follow"
- **THEN** the comic is followed and button changes to "Đang theo dõi"

### Requirement: Category page

The system SHALL provide `/the-loai/[slug]` page that displays comics filtered by category with pagination.

#### Scenario: View category

- **WHEN** user visits `/the-loai/hanh-dong`
- **THEN** the page shows all comics in "Hành động" category

### Requirement: Search page

The system SHALL provide `/tim-kiem` page with search input (autocomplete dropdown), results grid, and pagination.

#### Scenario: Search with autocomplete

- **WHEN** user types "one" in search box
- **THEN** autocomplete dropdown shows matching comic titles
- **WHEN** user presses Enter or clicks search
- **THEN** full search results are displayed in grid

### Requirement: Rankings page

The system SHALL provide `/xep-hang` page with tabs for different ranking types (daily, weekly, monthly, all-time, top follow, top rating).

#### Scenario: Switch ranking tab

- **WHEN** user clicks "Top tuần" tab
- **THEN** the list updates to show weekly ranking

### Requirement: Comic card component

A reusable `ComicCard` component SHALL display: cover image, title, latest chapter, country badge, update time. Clicking navigates to comic detail.

#### Scenario: Hover prefetch

- **WHEN** user hovers over a comic card
- **THEN** the comic detail data is prefetched via React Query

### Requirement: React Query hooks

The system SHALL provide hooks: `useComics(filters)`, `useComic(slug)`, `useComicChapters(slug)`, `useSearch(query)`, `useFollow()`, `useComments(comicId)`, `useRatings(comicId)`, `useRankings(type)`.

#### Scenario: Data fetching with loading state

- **WHEN** a hook is called
- **THEN** it returns { data, isLoading, error } and manages caching automatically
