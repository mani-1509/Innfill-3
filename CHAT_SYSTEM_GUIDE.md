# Chat System Implementation Guide

## Overview

The chat system provides real-time messaging between clients and freelancers for their orders. Chat rooms are automatically created when a freelancer accepts an order.

## Features

✅ **Automatic Chat Room Creation**: Created when order is accepted
✅ **Real-time Messaging**: Live updates using Supabase Realtime
✅ **File Attachments**: Support for images and documents in chat
✅ **Message History**: Persistent message storage
✅ **Read Receipts**: Track unread messages
✅ **User Presence**: See participant information
✅ **Order Context**: Link between chat and order details

## Architecture

### Database Tables

The chat system uses two main tables (already created in migration `001_initial_schema.sql`):

1. **chat_rooms**
   - `id`: UUID primary key
   - `order_id`: Reference to orders table
   - `participant_1_id`: First participant (client)
   - `participant_2_id`: Second participant (freelancer)
   - `is_active`: Boolean for room status
   - `last_message_at`: Timestamp of last message
   - `created_at`: Room creation timestamp

2. **messages**
   - `id`: UUID primary key
   - `room_id`: Reference to chat_rooms
   - `sender_id`: User who sent the message
   - `content`: Message text
   - `attachments`: Array of file URLs
   - `is_read`: Boolean for read status
   - `created_at`: Message timestamp

### File Structure

```
lib/actions/
  └── chat.ts                 # Server actions for chat operations

components/chat/
  ├── chat-message.tsx        # Individual message component
  ├── chat-input.tsx          # Message input with file upload
  └── chat-room.tsx           # Main chat room component

app/(app)/chat/
  └── [roomId]/
      └── page.tsx            # Chat room page
```

## Server Actions (lib/actions/chat.ts)

### createChatRoom()
Creates a new chat room for an order.
```typescript
const result = await createChatRoom(orderId, clientId, freelancerId);
```

### getChatRoom()
Fetches a chat room by ID with participant details.
```typescript
const result = await getChatRoom(roomId);
```

### getChatRoomByOrderId()
Fetches a chat room for a specific order.
```typescript
const result = await getChatRoomByOrderId(orderId);
```

### getUserChatRooms()
Gets all chat rooms for the current user.
```typescript
const result = await getUserChatRooms();
```

### sendMessage()
Sends a message in a chat room with optional attachments.
```typescript
const result = await sendMessage(roomId, content, attachments);
```

### getMessages()
Retrieves messages for a chat room.
```typescript
const result = await getMessages(roomId, limit);
```

### markMessagesAsRead()
Marks all unread messages in a room as read.
```typescript
const result = await markMessagesAsRead(roomId);
```

### getUnreadMessageCount()
Gets the total unread message count for the current user.
```typescript
const result = await getUnreadMessageCount();
```

## Components

### ChatRoom Component
Main component that handles the entire chat interface.

**Props:**
- `roomId`: ID of the chat room
- `currentUserId`: ID of the current user

**Features:**
- Real-time message updates via Supabase Realtime
- Automatic scroll to bottom on new messages
- Loading state
- Empty state

### ChatMessage Component
Displays individual messages with sender info.

**Props:**
- `message`: Message object
- `isOwn`: Boolean indicating if message is from current user

**Features:**
- Different styling for own vs. other messages
- Avatar display
- Timestamp with relative time
- Image preview for image attachments
- File download links for other attachments

### ChatInput Component
Message input with file upload support.

**Props:**
- `roomId`: ID of the chat room
- `onMessageSent`: Callback after successful message send

**Features:**
- Text input with multiline support
- Enter to send, Shift+Enter for new line
- File attachment with preview
- Upload progress indicator
- Disabled state during sending

## Usage Flow

### 1. Order Acceptance Creates Chat Room
When a freelancer accepts an order, the system automatically:
1. Creates a chat room linked to the order
2. Sets both client and freelancer as participants
3. Returns success to proceed with order

**Implementation in `lib/actions/orders.ts`:**
```typescript
// In acceptOrder function
const { createChatRoom } = await import('./chat')
await createChatRoom(orderId, order.client_id, order.freelancer_id)
```

### 2. Accessing Chat from Order Page
The order detail page displays a "Send Message" button:
- **Before acceptance**: Button is disabled with tooltip
- **After acceptance**: Button links to `/chat/{roomId}`

### 3. Chat Room Page
The dedicated chat page (`/chat/[roomId]`) provides:
- Full message history
- Real-time message updates
- File upload capability
- Order context in sidebar
- Participant information

## Real-time Updates

The chat system uses Supabase Realtime to provide instant message delivery:

```typescript
const channel = supabase
  .channel(`room-${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}`,
  }, async (payload) => {
    // Handle new message
    await fetchMessages();
    if (payload.new.sender_id !== currentUserId) {
      await markMessagesAsRead(roomId);
    }
  })
  .subscribe();
```

## File Attachments

Chat supports file attachments via Supabase Storage:

**Storage Bucket**: `chat-attachments`
- Max size: 50MB per file
- Allowed types: Images, PDFs, documents
- Path structure: `{userId}/{roomId}/{timestamp}-{filename}`

**Upload Function**: `uploadChatAttachment()` from `lib/utils/upload-utils.ts`

## Security

### Access Control
- Users can only access chat rooms they are participants in
- Server actions verify user is participant before allowing operations
- RLS policies on storage bucket restrict file access

### Message Validation
- Content is trimmed before sending
- Empty messages are rejected
- File size and type validation

## User Experience Features

### Visual Indicators
- Different message bubble colors (blue for own, gray for others)
- Timestamps with relative time (e.g., "2 minutes ago")
- Avatar images for participants
- Read/unread status

### Navigation
- "Back to Order" button in chat room
- "View Full Order" button in sidebar
- Direct links between order and chat pages

### Empty States
- "No messages yet" when chat is empty
- Disabled button when chat not yet available
- Loading spinner during fetch operations

## Testing Checklist

- [ ] Chat room created automatically on order acceptance
- [ ] Messages send and appear in real-time
- [ ] File attachments upload successfully
- [ ] Images display inline, files show download links
- [ ] Real-time updates work (test with two browsers)
- [ ] Read receipts mark messages correctly
- [ ] Navigation between order and chat works
- [ ] Access control prevents unauthorized viewing
- [ ] Empty states display correctly
- [ ] Error handling works for failed uploads

## Future Enhancements

### Phase 2 Considerations
1. **Typing Indicators**: Show when other user is typing
2. **Message Reactions**: Emoji reactions to messages
3. **Message Search**: Search within chat history
4. **Voice Messages**: Audio message support
5. **Message Editing**: Edit sent messages
6. **Message Deletion**: Delete messages with confirmation
7. **Notification System**: Push notifications for new messages
8. **Online Status**: Show when participants are online
9. **Message Pagination**: Load older messages on scroll
10. **Rich Text**: Support for formatted text and mentions

## Common Issues and Solutions

### Chat room not appearing after order acceptance
**Solution**: Ensure `acceptOrder` function in `lib/actions/orders.ts` includes chat room creation code.

### Messages not updating in real-time
**Solution**: Check Supabase Realtime is enabled in your project settings.

### File uploads failing
**Solution**: Verify `chat-attachments` bucket exists and RLS policies are configured.

### Unauthorized access errors
**Solution**: Ensure user is logged in and is a participant in the chat room.

## API Reference Summary

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `createChatRoom` | Create new chat room | orderId, participant1Id, participant2Id | ChatRoom object |
| `getChatRoom` | Fetch chat room details | roomId | ChatRoom with participants |
| `getChatRoomByOrderId` | Find chat room for order | orderId | ChatRoom object |
| `getUserChatRooms` | List user's chat rooms | - | Array of ChatRoom |
| `sendMessage` | Send a message | roomId, content, attachments? | Message object |
| `getMessages` | Fetch messages | roomId, limit? | Array of Message |
| `markMessagesAsRead` | Mark messages read | roomId | Success boolean |
| `getUnreadMessageCount` | Count unread messages | - | Number |

## Integration Points

### With Order System
- Chat created on `acceptOrder()`
- Chat link shown in order details
- Order context displayed in chat sidebar

### With File Upload System
- Uses `chat-attachments` storage bucket
- Validates file size (50MB limit)
- Handles multiple file uploads

### With Notification System (Future)
- New message notifications
- @mention notifications
- Unread count in navbar

## Deployment Notes

1. ✅ Database tables already exist (from initial schema migration)
2. ✅ Storage bucket `chat-attachments` already created (from storage migration)
3. ✅ RLS policies configured for chat access control
4. ✅ Realtime enabled for messages table
5. ✅ No additional configuration required

The chat system is **fully functional** and ready for testing!
