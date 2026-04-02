## Why

Users need real-time communication with admins/moderators and timely notifications about followed comics, comment replies, and announcements. Currently there is no way for users to interact with staff or receive updates without manually checking — leading to poor engagement and delayed support.

## What Changes

- Add real-time chat system (global chat, room chat, direct messages) via Socket.IO
- Add notification system for new chapters, comment replies, announcements, and offline chat messages
- Add Socket.IO server integration into existing Express backend
- Add chat UI pages (web + admin) and notification dropdown in header
- Leverage existing ChatMessage, ChatRoom, Notification MongoDB models
- Add online presence tracking via Redis

## Capabilities

### New Capabilities
- `realtime-chat`: Real-time messaging system with global/room/DM chat types, message CRUD, typing indicators, and online status via Socket.IO
- `notifications`: Push notification system for new chapters (followed comics), comment replies, admin announcements, and offline chat messages with badge count, mark-as-read, and auto-cleanup

### Modified Capabilities
<!-- No existing spec-level requirement changes -->

## Impact

- **Backend**: New Socket.IO server attached to Express, new chat/notification REST endpoints + socket events, Redis for presence/typing state
- **Frontend Web**: New chat page, notification bell dropdown in Header, Socket.IO client integration, new Redux slices
- **Frontend Admin**: Chat management page, send announcements, view active rooms/online users
- **Shared types**: New socket event types and notification type enums in shared-fe/shared-be
- **Dependencies**: socket.io (backend), socket.io-client (frontend) — need to install
