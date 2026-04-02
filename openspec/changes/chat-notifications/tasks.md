## 1. Dependencies & Setup

- [x] 1.1 Install socket.io in backend/server
- [x] 1.2 Install socket.io-client in frontend/web and frontend/admin
- [x] 1.3 Add Socket event types to shared-fe and shared-be (event names, payload interfaces)
- [x] 1.4 Add notification type enums to shared-be (new_chapter, comment_reply, announcement, chat_message)

## 2. Backend Socket.IO Server

- [x] 2.1 Create socket server initialization (attach to HTTP server, configure CORS, namespaces /chat and /notifications)
- [x] 2.2 Create socket auth middleware (validate JWT from handshake.auth.token, attach userId+role to socket)
- [x] 2.3 Integrate socket server startup in index.ts (pass HTTP server to socket init)

## 3. Backend Chat — Models & Services

- [x] 3.1 Review/update ChatRoom model (ensure fields: name, type [global/group/direct], members, createdBy, isActive)
- [x] 3.2 Review/update ChatMessage model (ensure fields: roomId, userId, content, replyTo, status [visible/deleted], createdAt)
- [x] 3.3 Create chat.service.ts (createRoom, getRoom, listUserRooms, listAllRooms, joinRoom, leaveRoom, getOrCreateDirectRoom)
- [x] 3.4 Create message.service.ts (sendMessage, deleteMessage, getHistory with cursor-based pagination)
- [x] 3.5 Seed global chat room (ensure one global room exists on server start)

## 4. Backend Chat — Socket Events

- [x] 4.1 Create chat socket handler (register /chat namespace events)
- [x] 4.2 Implement chat:send event (save message, broadcast to room members)
- [x] 4.3 Implement chat:delete event (ownership + mod check, update status, broadcast)
- [x] 4.4 Implement chat:typing event (broadcast typing indicator to room)
- [x] 4.5 Implement chat:history event (return paginated messages with cursor)
- [x] 4.6 Implement room:join and room:leave socket events
- [x] 4.7 Auto-join global room on connect

## 5. Backend Online Presence

- [x] 5.1 Add Redis online:users set operations (addOnline, removeOnline, getOnlineUsers, isOnline)
- [x] 5.2 Handle connect event — add to Redis, broadcast presence:online
- [x] 5.3 Handle disconnect event — remove from Redis, broadcast presence:offline
- [x] 5.4 Implement presence:list event (return all online user IDs)

## 6. Backend Chat — REST API

- [x] 6.1 Create chat.routes.ts and chat.controller.ts
- [x] 6.2 GET /api/chat/rooms — list user's rooms (+ global)
- [x] 6.3 GET /api/chat/rooms/all — admin list all rooms with member counts
- [x] 6.4 POST /api/chat/rooms — admin/mod create group room
- [x] 6.5 POST /api/chat/rooms/:id/join — user join room
- [x] 6.6 POST /api/chat/rooms/:id/leave — user leave room
- [x] 6.7 DELETE /api/chat/rooms/:id — admin delete room
- [x] 6.8 POST /api/chat/rooms/direct/:userId — create or get direct room
- [x] 6.9 Register chat routes in app.ts

## 7. Backend Notification — Service & Model

- [x] 7.1 Review/update Notification model (ensure fields: userId, type, title, message, data, isRead, createdAt + TTL index 30 days)
- [x] 7.2 Create notification.service.ts (create, createForMany, list with pagination, getUnreadCount, markRead, markAllRead)
- [x] 7.3 Integrate notification creation into webhook.service.ts (new chapter → notify followers)
- [x] 7.4 Integrate notification creation into comment.service.ts (reply → notify parent comment author)

## 8. Backend Notification — Socket & REST

- [x] 8.1 Create notification socket handler (/notifications namespace)
- [x] 8.2 On connect: send all unread notifications to client
- [x] 8.3 Create helper to emit notification in real-time (check Redis online, emit if online)
- [x] 8.4 Create notification.routes.ts and notification.controller.ts
- [x] 8.5 GET /api/notifications — list notifications (paginated)
- [x] 8.6 GET /api/notifications/unread-count — get unread count
- [x] 8.7 PUT /api/notifications/:id/read — mark single as read
- [x] 8.8 PUT /api/notifications/read-all — mark all as read
- [x] 8.9 POST /api/notifications/announce — admin send announcement to all users
- [x] 8.10 Register notification routes in app.ts

## 9. Frontend Socket Client Setup

- [x] 9.1 Create socket client singleton (lib/socket.ts) — connect with JWT token, auto-reconnect
- [x] 9.2 Create useSocket hook — connect on login, disconnect on logout
- [x] 9.3 Create chatSlice in Redux (rooms, activeRoom, messages, onlineUsers, typingUsers)
- [x] 9.4 Create notificationSlice in Redux (notifications list, unreadCount)
- [x] 9.5 Wire socket events to Redux dispatch in useSocket hook

## 10. Frontend Web — Chat Page

- [x] 10.1 Create /chat page layout (sidebar + main + online panel)
- [x] 10.2 Create RoomList component (list rooms, highlight active, unread badge)
- [x] 10.3 Create MessageList component (render messages, auto-scroll, load more on scroll up)
- [x] 10.4 Create MessageInput component (text input, send button, typing indicator emit)
- [x] 10.5 Create MessageBubble component (text, sender name, timestamp, reply preview, delete button)
- [x] 10.6 Create OnlineUsers component (list online users, click to start DM)
- [x] 10.7 Create TypingIndicator component
- [x] 10.8 Add React Query hooks for chat REST endpoints (useRooms, useJoinRoom, useLeaveRoom)

## 11. Frontend Web — Notifications

- [x] 11.1 Create NotificationBell component (bell icon + badge count)
- [x] 11.2 Create NotificationDropdown component (list notifications, click to navigate, mark as read)
- [x] 11.3 Add NotificationBell to Header component
- [x] 11.4 Create React Query hooks (useNotifications, useUnreadCount, useMarkRead, useMarkAllRead)
- [x] 11.5 Handle real-time notification:new event — update Redux + show toast

## 12. Frontend Admin — Chat & Notifications

- [x] 12.1 Create admin /chat page (list all rooms, create room form, delete room, active users count)
- [x] 12.2 Create admin /notifications page (send announcement form with title + message)
- [x] 12.3 Add admin chat and notifications pages to admin sidebar navigation
