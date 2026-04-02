## ADDED Requirements

### Requirement: Read chapter by slugs
The system SHALL provide `GET /api/chapters/:comicSlug/:chapSlug` that returns chapter data including pages array with image URLs. SHALL increment chapter views and comic views.

#### Scenario: Valid chapter
- **WHEN** a GET request is made to `/api/chapters/one-punch-man/chapter-1`
- **THEN** the system returns chapter with pages array (pageNumber, imageUrl, width, height), and increments views

#### Scenario: Invalid chapter
- **WHEN** a GET request is made with non-existent comic or chapter slug
- **THEN** the system returns 404 Not Found

### Requirement: Admin create chapter
The system SHALL provide `POST /api/chapters` (admin role required) that creates a new chapter with pages. SHALL update the parent comic's `totalChapters` and `latestChapter`.

#### Scenario: Create chapter
- **WHEN** an admin sends POST with comicId, number, title, and pages array
- **THEN** the chapter is created, comic.totalChapters increments, comic.latestChapter updates, and returns 201

### Requirement: Admin update chapter
The system SHALL provide `PUT /api/chapters/:id` (admin role required) that updates chapter fields and/or pages.

#### Scenario: Update chapter pages
- **WHEN** an admin sends PUT with updated pages array
- **THEN** the chapter pages are replaced with the new array

### Requirement: Admin delete chapter
The system SHALL provide `DELETE /api/chapters/:id` (admin role required) that deletes a chapter and updates the parent comic's totalChapters.

#### Scenario: Delete chapter
- **WHEN** an admin deletes a chapter
- **THEN** the chapter is removed and comic.totalChapters decrements

### Requirement: Upload chapter images
The system SHALL provide `POST /api/upload/images` (admin role required) accepting multipart form data with up to 10 images (max 5MB each). Images SHALL be uploaded to Firebase Storage and URLs returned.

#### Scenario: Upload multiple images
- **WHEN** an admin uploads 5 images via multipart form
- **THEN** the system uploads all to Firebase Storage and returns array of { url, width, height }

#### Scenario: File too large
- **WHEN** an image exceeds 5MB
- **THEN** the system returns 400 Bad Request

#### Scenario: Invalid file type
- **WHEN** a non-image file is uploaded
- **THEN** the system returns 400 Bad Request with message about allowed types (jpg, png, webp)
