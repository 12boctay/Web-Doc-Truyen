## ADDED Requirements

### Requirement: Follow comic
The system SHALL provide `POST /api/follows/:comicId` (user role required) that creates a follow. SHALL increment comic.followers count.

#### Scenario: Follow a comic
- **WHEN** an authenticated user follows a comic
- **THEN** a Follow document is created and comic.followers increments by 1

#### Scenario: Already following
- **WHEN** a user tries to follow a comic they already follow
- **THEN** the system returns 409 Conflict

### Requirement: Unfollow comic
The system SHALL provide `DELETE /api/follows/:comicId` (user role required). SHALL decrement comic.followers.

#### Scenario: Unfollow
- **WHEN** a user unfollows a comic
- **THEN** the Follow document is deleted and comic.followers decrements

### Requirement: List followed comics
The system SHALL provide `GET /api/follows` (user role required) returning paginated list of followed comics with populated comic data.

#### Scenario: Get follows
- **WHEN** an authenticated user requests their follows
- **THEN** the system returns followed comics with comic title, slug, coverUrl, latestChapter, sorted by follow date desc

### Requirement: Create comment
The system SHALL provide `POST /api/comments` (user role required) accepting comicId, optional chapterId, content, optional parentId for replies.

#### Scenario: Create top-level comment
- **WHEN** a user posts a comment on a comic
- **THEN** the comment is created with status "visible"

#### Scenario: Reply to comment
- **WHEN** a user posts a comment with parentId
- **THEN** the reply is created linked to the parent comment

### Requirement: List comments
The system SHALL provide `GET /api/comments/comic/:comicId` and `GET /api/comments/chapter/:chapterId` returning paginated comments with populated user info (name, avatar). Sorted by newest first.

#### Scenario: Get comic comments
- **WHEN** a GET request is made to `/api/comments/comic/:comicId`
- **THEN** the system returns comments with user name/avatar, like count, reply count

### Requirement: Like/unlike comment
The system SHALL provide `POST /api/comments/:id/like` and `DELETE /api/comments/:id/like` (user role required) for toggling likes.

#### Scenario: Like a comment
- **WHEN** a user likes a comment
- **THEN** the user's ID is added to the comment's likes array

#### Scenario: Unlike
- **WHEN** a user unlikes a comment
- **THEN** the user's ID is removed from likes array

### Requirement: Moderate comment
The system SHALL provide `PUT /api/comments/:id/status` (moderator role required) to change comment status (visible/hidden/deleted).

#### Scenario: Hide comment
- **WHEN** a moderator sets a comment status to "hidden"
- **THEN** the comment no longer appears in public listings but exists in database

### Requirement: Rate comic
The system SHALL provide `POST /api/ratings` (user role required) accepting comicId and score (1-5). Upsert behavior — update if rating exists. SHALL recalculate comic.rating.average and comic.rating.count.

#### Scenario: Rate a comic
- **WHEN** a user rates a comic with score 4
- **THEN** the rating is created/updated and comic.rating is recalculated

#### Scenario: Get own rating
- **WHEN** a GET request is made to `/api/ratings/me/:comicId` by authenticated user
- **THEN** the system returns the user's rating for that comic, or null

### Requirement: Save read history
The system SHALL provide `POST /api/history` (user role required) that upserts reading progress (comicId, chapterId, chapterNumber, scrollPosition).

#### Scenario: Save progress
- **WHEN** a user reads chapter 5 of a comic
- **THEN** the ReadHistory document is upserted with lastReadAt = now

### Requirement: Get read history
The system SHALL provide `GET /api/history` (user role required) returning paginated reading history with populated comic data, sorted by lastReadAt desc.

#### Scenario: Get history
- **WHEN** an authenticated user requests history
- **THEN** the system returns comics with last read chapter info

### Requirement: Rankings
The system SHALL provide ranking endpoints: `GET /api/rankings/daily`, `/weekly`, `/monthly`, `/all-time`, `/top-follow`, `/top-rating`. Each returns top 20 comics. Cached in Redis (TTL 15 min).

#### Scenario: Get daily ranking
- **WHEN** a GET request is made to `/api/rankings/daily`
- **THEN** the system returns top 20 comics sorted by views.daily desc

#### Scenario: Get top follow
- **WHEN** a GET request is made to `/api/rankings/top-follow`
- **THEN** the system returns top 20 comics sorted by followers desc
