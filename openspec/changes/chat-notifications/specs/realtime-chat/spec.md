## ADDED Requirements

### Requirement: Socket.IO server initialization
The system SHALL attach a Socket.IO server to the existing Express HTTP server with `/chat` and `/notifications` namespaces. CORS SHALL allow the same origins as the Express CORS config.

#### Scenario: Server starts with Socket.IO
- **WHEN** the backend server starts
- **THEN** Socket.IO SHALL be available at the same port as Express with `/chat` and `/notifications` namespaces

### Requirement: Socket authentication
The system SHALL authenticate socket connections using JWT tokens passed in `socket.handshake.auth.token`. Invalid or missing tokens SHALL result in connection rejection.

#### Scenario: Valid token connection
- **WHEN** a client connects with a valid JWT token in handshake auth
- **THEN** the connection SHALL be accepted and `userId` and `role` SHALL be attached to the socket

#### Scenario: Invalid token connection
- **WHEN** a client connects with an invalid or expired JWT token
- **THEN** the connection SHALL be rejected with an authentication error

### Requirement: Chat room types
The system SHALL support three room types: `global` (single auto-created room all users join), `group` (admin/mod created, users join/leave), and `direct` (1-to-1 between two users).

#### Scenario: Auto-join global room
- **WHEN** an authenticated user connects to the `/chat` namespace
- **THEN** the user SHALL automatically join the global chat room

#### Scenario: Create group room
- **WHEN** an admin or moderator sends a create-room event with a room name
- **THEN** a new group ChatRoom SHALL be created in MongoDB and the creator SHALL join it

#### Scenario: Start direct message
- **WHEN** a user initiates a DM with another user
- **THEN** a direct ChatRoom SHALL be created (or reused if one exists) with both user IDs as members

### Requirement: Send and receive messages
The system SHALL allow authenticated users to send text messages to any room they are a member of. Messages SHALL be persisted in MongoDB and broadcast to all room members in real-time.

#### Scenario: Send message to room
- **WHEN** a user emits a `chat:send` event with `roomId` and `content`
- **THEN** a ChatMessage SHALL be saved to MongoDB and broadcast to all connected members of that room

#### Scenario: User not in room
- **WHEN** a user tries to send a message to a room they are not a member of
- **THEN** the message SHALL be rejected with an error

### Requirement: Message reply
The system SHALL allow users to reply to a specific message by referencing its ID.

#### Scenario: Reply to message
- **WHEN** a user sends a message with a `replyTo` message ID
- **THEN** the saved message SHALL include the `replyTo` reference and the broadcast SHALL include the referenced message content

### Requirement: Delete message
Users SHALL be able to delete their own messages. Moderators and admins SHALL be able to delete any message.

#### Scenario: Delete own message
- **WHEN** a user emits a `chat:delete` event for their own message
- **THEN** the message status SHALL be set to `deleted` and a delete event SHALL be broadcast to the room

#### Scenario: Mod deletes any message
- **WHEN** a moderator or admin emits a `chat:delete` event for any message
- **THEN** the message SHALL be deleted regardless of ownership

#### Scenario: User deletes other's message
- **WHEN** a regular user tries to delete another user's message
- **THEN** the deletion SHALL be rejected with a permission error

### Requirement: Typing indicator
The system SHALL broadcast typing indicators when users are composing messages.

#### Scenario: User starts typing
- **WHEN** a user emits a `chat:typing` event with `roomId`
- **THEN** all other members in the room SHALL receive a typing indicator with the user's name

### Requirement: Online presence
The system SHALL track online users via Redis and broadcast presence changes.

#### Scenario: User comes online
- **WHEN** a user connects to the `/chat` namespace
- **THEN** their userId SHALL be added to Redis `online:users` set and a `presence:online` event SHALL be broadcast

#### Scenario: User goes offline
- **WHEN** a user disconnects from the `/chat` namespace
- **THEN** their userId SHALL be removed from Redis and a `presence:offline` event SHALL be broadcast

#### Scenario: Get online users
- **WHEN** a client emits a `presence:list` event
- **THEN** the server SHALL return the list of all online user IDs

### Requirement: Chat history with pagination
The system SHALL provide paginated chat history using cursor-based pagination.

#### Scenario: Load initial messages
- **WHEN** a user joins a room
- **THEN** the server SHALL return the latest 50 messages for that room

#### Scenario: Load more messages
- **WHEN** a user emits a `chat:history` event with a `before` cursor (message ID)
- **THEN** the server SHALL return up to 50 messages older than the cursor

### Requirement: Room management REST API
The system SHALL provide REST endpoints for room CRUD operations.

#### Scenario: List rooms
- **WHEN** GET `/api/chat/rooms` is called by an authenticated user
- **THEN** the system SHALL return rooms the user is a member of (plus the global room)

#### Scenario: Admin lists all rooms
- **WHEN** GET `/api/chat/rooms/all` is called by an admin
- **THEN** the system SHALL return all chat rooms with member counts

#### Scenario: Join room
- **WHEN** POST `/api/chat/rooms/:id/join` is called by an authenticated user
- **THEN** the user SHALL be added to the room's members

#### Scenario: Leave room
- **WHEN** POST `/api/chat/rooms/:id/leave` is called by an authenticated user
- **THEN** the user SHALL be removed from the room's members

### Requirement: Chat frontend page
The web frontend SHALL have a `/chat` page with room list sidebar, message area, and input box.

#### Scenario: Open chat page
- **WHEN** a logged-in user navigates to `/chat`
- **THEN** the page SHALL show a list of rooms on the left, messages in the center, and online users on the right

#### Scenario: Switch rooms
- **WHEN** a user clicks a different room in the sidebar
- **THEN** the message area SHALL load that room's history and subscribe to its real-time events

### Requirement: Admin chat management
The admin frontend SHALL have a chat management page to create/delete rooms and view active conversations.

#### Scenario: Admin creates room
- **WHEN** an admin fills in a room name and clicks create on the admin chat page
- **THEN** a new group room SHALL be created

#### Scenario: Admin sends announcement
- **WHEN** an admin sends a message in the global room from admin panel
- **THEN** the message SHALL appear in the global chat for all connected users
