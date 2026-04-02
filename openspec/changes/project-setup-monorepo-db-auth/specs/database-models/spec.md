## ADDED Requirements

### Requirement: User model

The system SHALL define a User model with fields: email (unique), password (bcrypt hash), name, slug (unique), avatar, role (enum: guest/user/moderator/admin/superadmin), status (enum: active/banned/suspended), bannedUntil, bannedReason, totalDonated, donorBadge, lastLogin, timestamps.

#### Scenario: Creating a new user

- **WHEN** a user is created with valid email and password
- **THEN** password is hashed with bcrypt (salt rounds 12), slug is auto-generated from name, role defaults to "user", status defaults to "active"

#### Scenario: Duplicate email

- **WHEN** a user is created with an email that already exists
- **THEN** MongoDB throws a unique constraint error

#### Scenario: Password not returned in queries

- **WHEN** a User document is queried
- **THEN** the password field is excluded by default (select: false)

### Requirement: Comic model

The system SHALL define a Comic model with fields: title, slug (unique), otherNames, description, coverUrl, author, artist, categories (ref Category), country (enum: manga/manhua/manhwa/comic), status (enum: ongoing/completed/dropped), totalChapters, latestChapter (embedded), views (embedded: total/daily/weekly/monthly), rating (embedded: average/count), followers, sourceUrl, isActive, timestamps. Indexes: slug, categories, country, views.daily desc, views.weekly desc, updatedAt desc, text index on title + otherNames.

#### Scenario: Creating a comic

- **WHEN** a comic is created with title "One Punch Man"
- **THEN** slug is auto-generated as "one-punch-man", isActive defaults to true, views and rating initialize to 0

#### Scenario: Text search

- **WHEN** searching comics with text query "punch"
- **THEN** MongoDB text index matches comics with "punch" in title or otherNames

### Requirement: Chapter model

The system SHALL define a Chapter model with fields: comicId (ref Comic), number, title, slug, pages (array of embedded: pageNumber/imageUrl/width/height), views, sourceUrl, createdAt. Indexes: (comicId + number desc), (comicId + slug).

#### Scenario: Creating a chapter

- **WHEN** a chapter is created for a comic
- **THEN** the chapter is associated with comicId and pages array stores image URLs

### Requirement: Category model

The system SHALL define a Category model with fields: name, slug (unique), description, comicCount, createdAt.

#### Scenario: Creating a category

- **WHEN** a category "Hành động" is created
- **THEN** slug is generated as "hanh-dong", comicCount defaults to 0

### Requirement: Follow model

The system SHALL define a Follow model with fields: userId (ref User), comicId (ref Comic), lastReadChapter, notifyEnabled, createdAt. Unique compound index on (userId + comicId).

#### Scenario: Following a comic

- **WHEN** a user follows a comic
- **THEN** a Follow document is created with notifyEnabled defaulting to true

#### Scenario: Duplicate follow

- **WHEN** a user tries to follow a comic they already follow
- **THEN** unique compound index prevents duplicate

### Requirement: Comment model

The system SHALL define a Comment model with fields: userId (ref User), comicId (ref Comic), chapterId (ref Chapter, optional), content, parentId (ref Comment, for replies), likes (array of User refs), status (enum: visible/hidden/deleted), timestamps. Indexes: (comicId + createdAt desc), chapterId.

#### Scenario: Creating a reply

- **WHEN** a comment is created with parentId referencing another comment
- **THEN** it is stored as a reply to that parent comment

### Requirement: Notification model

The system SHALL define a Notification model with fields: userId (ref User), type (enum: new_chapter/reply_comment/system/chat/donation_thanks), title, message, data (embedded: comicId/chapterId/commentId/chatRoomId/paymentId), read (boolean), createdAt. Index: (userId + read + createdAt desc).

#### Scenario: Creating a notification

- **WHEN** a notification is created for a user
- **THEN** read defaults to false

### Requirement: ReadHistory model

The system SHALL define a ReadHistory model with fields: userId (ref User), comicId (ref Comic), chapterId (ref Chapter), chapterNumber, scrollPosition, lastReadAt. Indexes: (userId + lastReadAt desc), unique compound (userId + comicId).

#### Scenario: Updating reading progress

- **WHEN** a user reads a new chapter of a comic they previously read
- **THEN** the existing ReadHistory document is updated (upsert on userId + comicId)

### Requirement: ChatRoom and ChatMessage models

The system SHALL define ChatRoom (type, participants, lastMessage, status, timestamps) and ChatMessage (roomId, senderId, content, type, imageUrl, read, createdAt) models with proper indexes.

#### Scenario: Creating a chat room

- **WHEN** a user initiates a chat with admin
- **THEN** a ChatRoom is created with type "admin_user" and both participants

### Requirement: Payment and DonationGoal models

The system SHALL define Payment (userId, amount, currency, method, transactionId, status, message, displayName, isAnonymous, metadata, completedAt, timestamps) and DonationGoal (title, description, targetAmount, currentAmount, dates, isActive, timestamps) models.

#### Scenario: Creating a payment

- **WHEN** a donation payment is created
- **THEN** status defaults to "pending"

### Requirement: CrawlSource model

The system SHALL define a CrawlSource model with fields: name, baseUrl, selectors (embedded CSS selectors), headers, schedule (cron), isActive, lastCrawlAt, lastError, stats (embedded), timestamps.

#### Scenario: Creating a crawl source

- **WHEN** a new crawl source "TruyenQQ" is added
- **THEN** isActive defaults to true, stats initialize to 0

### Requirement: Rating model

The system SHALL define a Rating model with fields: userId (ref User), comicId (ref Comic), score (1-5), timestamps. Unique compound index on (userId + comicId).

#### Scenario: Rating a comic

- **WHEN** a user rates a comic with score 4
- **THEN** the rating is created or updated (upsert on userId + comicId)

#### Scenario: Invalid score

- **WHEN** a user tries to rate with score 0 or 6
- **THEN** Mongoose validation rejects the value
