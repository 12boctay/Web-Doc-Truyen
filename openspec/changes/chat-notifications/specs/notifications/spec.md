## ADDED Requirements

### Requirement: Notification types
The system SHALL support four notification types: `new_chapter` (followed comic updated), `comment_reply` (someone replied to user's comment), `announcement` (admin broadcast), and `chat_message` (DM received while offline).

#### Scenario: New chapter notification
- **WHEN** a new chapter is added to a comic (via crawler webhook or admin)
- **THEN** a `new_chapter` notification SHALL be created for every user following that comic

#### Scenario: Comment reply notification
- **WHEN** a user posts a comment replying to another user's comment
- **THEN** a `comment_reply` notification SHALL be created for the original comment author

#### Scenario: Admin announcement
- **WHEN** an admin creates an announcement via POST `/api/notifications/announce`
- **THEN** a notification SHALL be created for all active users

#### Scenario: Offline chat message
- **WHEN** a DM is sent to a user who is not currently online
- **THEN** a `chat_message` notification SHALL be created for the offline user

### Requirement: Real-time notification delivery
The system SHALL deliver notifications in real-time via Socket.IO `/notifications` namespace to online users.

#### Scenario: User is online
- **WHEN** a notification is created and the recipient is online (in Redis online set)
- **THEN** the notification SHALL be emitted immediately via Socket.IO

#### Scenario: User is offline then connects
- **WHEN** a user connects to the `/notifications` namespace
- **THEN** all unread notifications SHALL be sent to the client

### Requirement: Unread count badge
The system SHALL provide an unread notification count for the frontend badge.

#### Scenario: Get unread count
- **WHEN** GET `/api/notifications/unread-count` is called by an authenticated user
- **THEN** the system SHALL return the count of unread notifications

#### Scenario: Real-time unread update
- **WHEN** a new notification is delivered via Socket.IO
- **THEN** the `notification:new` event SHALL include the updated unread count

### Requirement: List notifications
The system SHALL provide a paginated list of notifications for the authenticated user.

#### Scenario: List notifications
- **WHEN** GET `/api/notifications` is called with optional `page` and `limit` query params
- **THEN** the system SHALL return notifications sorted by newest first with pagination metadata

### Requirement: Mark as read
The system SHALL allow users to mark notifications as read individually or all at once.

#### Scenario: Mark single notification read
- **WHEN** PUT `/api/notifications/:id/read` is called by the notification owner
- **THEN** the notification's `isRead` field SHALL be set to `true`

#### Scenario: Mark all notifications read
- **WHEN** PUT `/api/notifications/read-all` is called by an authenticated user
- **THEN** all unread notifications for that user SHALL be marked as read

### Requirement: Auto-cleanup old notifications
The system SHALL automatically delete notifications older than 30 days using a MongoDB TTL index.

#### Scenario: Old notification expires
- **WHEN** a notification's `createdAt` is older than 30 days
- **THEN** MongoDB SHALL automatically remove it via TTL index

### Requirement: Notification bell UI
The web frontend Header SHALL display a notification bell icon with unread count badge and a dropdown list.

#### Scenario: Bell shows unread count
- **WHEN** the user has unread notifications
- **THEN** the bell icon SHALL display a red badge with the unread count

#### Scenario: Click bell opens dropdown
- **WHEN** the user clicks the notification bell
- **THEN** a dropdown SHALL appear showing the latest notifications with title, message, and time

#### Scenario: Click notification navigates
- **WHEN** the user clicks a notification in the dropdown
- **THEN** the browser SHALL navigate to the relevant page (e.g., comic chapter, comment) and mark the notification as read

### Requirement: Admin announcement page
The admin frontend SHALL have an interface to send announcements to all users.

#### Scenario: Send announcement
- **WHEN** an admin fills in title and message and clicks send on the admin notifications page
- **THEN** a notification of type `announcement` SHALL be created for all users and delivered in real-time to online users
