## ADDED Requirements

### Requirement: Admin comics list page
The admin panel SHALL provide `/comics` page displaying all comics in a table with columns: title, country, status, chapters count, views, updatedAt. Supports search, filter, and pagination.

#### Scenario: View comics table
- **WHEN** admin visits `/comics`
- **THEN** a paginated table of all comics is displayed with action buttons (edit, delete)

### Requirement: Admin create comic page
The admin panel SHALL provide `/comics/create` page with a form for: title, otherNames, description, coverUrl (with upload), author, artist, categories (multi-select), country, status.

#### Scenario: Create comic
- **WHEN** admin fills form and submits
- **THEN** the comic is created via API and admin is redirected to comics list

### Requirement: Admin edit comic page
The admin panel SHALL provide `/comics/[id]/edit` page pre-filled with comic data.

#### Scenario: Edit comic
- **WHEN** admin edits title and submits
- **THEN** the comic is updated and success toast is shown

### Requirement: Admin chapter management
The admin panel SHALL provide `/chapters/[comicId]` page listing all chapters for a comic. Includes "Upload Chapter" button.

#### Scenario: View chapters
- **WHEN** admin visits `/chapters/:comicId`
- **THEN** all chapters are listed with number, title, page count, createdAt

### Requirement: Admin upload chapter page
The admin panel SHALL provide `/chapters/upload` page with form: select comic, chapter number, title, and drag-drop image upload area (multiple files, reorderable).

#### Scenario: Upload chapter with images
- **WHEN** admin selects images, sets chapter number, and submits
- **THEN** images are uploaded to Firebase, chapter is created with page URLs, and admin sees success

### Requirement: Admin category management
The admin panel SHALL provide `/categories` page with inline CRUD — add, edit, delete categories from a table.

#### Scenario: Add category inline
- **WHEN** admin types category name and clicks "Thêm"
- **THEN** category is created and table refreshes

### Requirement: Admin comment moderation
The admin panel SHALL provide `/comments` page listing recent comments with user info, content, comic name. Actions: hide, delete.

#### Scenario: Hide inappropriate comment
- **WHEN** moderator clicks "Ẩn" on a comment
- **THEN** the comment status changes to "hidden" and it disappears from public view
