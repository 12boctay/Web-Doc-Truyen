## Context

WebĐọcTruyện has a working backend (Express + MongoDB + Redis) and frontend (Next.js). Auth, comics CRUD, chapters, comments, ratings, follows, and crawler are all implemented. Socket.IO is listed as a dependency but not yet integrated. ChatMessage, ChatRoom, and Notification Mongoose models already exist but have no routes/controllers/services.

## Goals / Non-Goals

**Goals:**

- Real-time bidirectional communication via Socket.IO
- Chat: global room, custom rooms, direct messages between user ↔ admin/mod
- Notifications: new chapter (for followed comics), comment replies, announcements, offline chat
- Online presence tracking
- Persist all messages and notifications in MongoDB
- Admin tools: manage rooms, send announcements, view online users

**Non-Goals:**

- File/image sharing in chat (text only for now)
- Push notifications (browser/mobile) — only in-app via Socket.IO
- End-to-end encryption
- Chat bot / AI integration
- Video/voice calls

## Decisions

### 1. Socket.IO Architecture

**Decision:** Attach Socket.IO to the existing Express HTTP server in `index.ts`.

**Rationale:** Simpler than a separate service. Single process shares auth middleware and DB connections. Socket.IO namespaces separate concerns:

- `/chat` — all chat events
- `/notifications` — notification delivery

**Alternative considered:** Separate microservice → rejected because it adds deployment complexity and requires inter-service communication for auth.

### 2. Authentication on Sockets

**Decision:** Authenticate via JWT token passed in `socket.handshake.auth.token`. Middleware validates the token on connection and attaches `userId` + `role` to the socket.

**Rationale:** Reuses existing JWT auth. No need for session-based auth.

### 3. Chat Room Model

**Decision:** Use existing ChatRoom model. Room types: `global` (one, auto-created), `group` (admin-created), `direct` (1-to-1).

- Global room: everyone auto-joins on connect
- Group rooms: admin/mod creates, users join/leave
- Direct: created on first message between 2 users

### 4. Online Presence

**Decision:** Store online users in Redis SET `online:users` with userId. On connect → SADD, on disconnect → SREM. Broadcast presence changes to `/chat` namespace.

**Rationale:** Redis is fast for set operations, already running. Handles server restart gracefully (set clears).

### 5. Notification Delivery

**Decision:**

- When event occurs (new chapter, comment reply, announcement), create Notification document in MongoDB
- If recipient is online (check Redis), emit via Socket.IO immediately
- If offline, notification waits in DB — delivered on next connect
- Auto-delete notifications older than 30 days via MongoDB TTL index

### 6. Message Pagination

**Decision:** Cursor-based pagination for chat history (using `_id` or `createdAt`). Load latest 50 messages on room join, load more on scroll up.

**Rationale:** Offset-based pagination is unreliable with real-time inserts.

### 7. Frontend State

**Decision:**

- New Redux slices: `chatSlice` (rooms, messages, online users, typing), `notificationSlice` (list, unread count)
- Socket.IO client singleton initialized after login, disconnected on logout
- Socket events dispatch Redux actions

## Risks / Trade-offs

- **[Memory] Single-process Socket.IO** → For scale, would need Redis adapter + multiple instances. Acceptable for current stage. Mitigation: design with Redis adapter compatibility in mind.
- **[Latency] Image proxy + Socket.IO on same server** → Could bottleneck. Mitigation: image proxy is stateless and cacheable.
- **[Data growth] Chat messages accumulate** → Mitigation: TTL index on old messages (optional), pagination prevents loading all at once.
- **[Complexity] Socket + REST coexistence** → Keep REST for CRUD operations (create room, list rooms, admin endpoints). Socket for real-time only (send message, typing, presence).
