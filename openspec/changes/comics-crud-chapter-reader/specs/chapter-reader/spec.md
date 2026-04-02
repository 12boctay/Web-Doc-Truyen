## ADDED Requirements

### Requirement: Chapter reader page
The system SHALL provide `/truyen/[slug]/[chap]` page with long-strip vertical scroll reader displaying all chapter images sequentially.

#### Scenario: Open chapter
- **WHEN** user navigates to `/truyen/one-punch-man/chapter-1`
- **THEN** the reader loads and displays all chapter images in vertical scroll layout

### Requirement: Lazy loading images
The chapter reader SHALL lazy-load images using Intersection Observer. Only images within viewport + 3 images ahead SHALL be loaded.

#### Scenario: Scroll through chapter
- **WHEN** user scrolls down the reader
- **THEN** images are loaded as they approach the viewport, with a loading placeholder shown before load

### Requirement: Reader navigation controls
The reader SHALL display overlay controls: previous chapter button, next chapter button, chapter select dropdown, scroll-to-top button, back to comic detail button.

#### Scenario: Navigate to next chapter
- **WHEN** user clicks "Chapter tiếp" or reaches bottom of page
- **THEN** the reader navigates to the next chapter

#### Scenario: Navigate to previous chapter
- **WHEN** user clicks "Chapter trước"
- **THEN** the reader navigates to the previous chapter

#### Scenario: No next chapter
- **WHEN** user is on the latest chapter
- **THEN** the "Chapter tiếp" button is disabled

### Requirement: Reading progress tracking
The reader SHALL automatically save reading progress (chapter number, scroll position) via `POST /api/history` when user reads a chapter (debounced, every 30 seconds).

#### Scenario: Auto-save progress
- **WHEN** user reads a chapter for 30 seconds
- **THEN** the reading progress is saved to the server

### Requirement: Reader Redux slice
A `readerSlice` SHALL manage reader state: current chapter info, reading mode (vertical/horizontal), image fit mode (width/height/original).

#### Scenario: Toggle reading mode
- **WHEN** user switches to horizontal mode
- **THEN** images display one at a time with left/right swipe navigation
