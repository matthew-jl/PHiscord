# PHiscord Firestore Database Schema

## Collections Overview

The database utilizes several top-level collections to organize data:

- `users`: Stores user profile information and relationships.
- `servers`: Stores information about each server (guild).
- `serverMembers`: Maps users to the servers they belong to and their roles/details within that server.
- `serverChannels`: Lists the channels belonging to a specific server.
- `channels`: Stores detailed information about individual server channels.
- `channelMessages`: Stores the message history for each server channel.
- `friendships`: Manages friend requests and connections between users.
- `chats`: Represents direct message conversations between users.
- `chatMessages`: Stores the message history for direct message conversations.
- `blocks`: Records instances where one user has blocked another.
- `notifications`: Stores notifications intended for specific users.

## Collection Details

### `users`

Stores profile information, settings, and relationship mappings for each registered user.

**Document ID**: User's Firebase Authentication UID (`userId`)

**Fields**:

- `username` (String): The user's display name.
- `email` (String): The user's registered email address.
- `imageUrl` (String): URL to the user's profile picture/avatar.
- `isOnline` (Boolean): Indicates if the user is currently marked as online.
- `customStatus` (String): Optional custom status message set by the user.
- `servers` (Map): Maps `serverId` to `true` for each server the user is a member of.
  - Example: `{ "serverABC": true, "serverXYZ": true }`
- `friends` (Map): Maps `userId` to `true` for each user they are friends with.
  - Example: `{ "friendUid456": true }`
- `chats` (Map): Maps `chatId` to `true` for each direct message conversation the user is part of.
  - Example: `{ "chatABC": true }`
- `blocks` (Map): Maps `userId` to `true` for each user this user has blocked.
  - Example: `{ "blockedUid789": true }`
- `privacySettings` (Map): Contains various user privacy preferences.
  - Example: `{ "calls": "allow", "directMessages": "allow" }`
- `fontSizeClass` (String): Class name representing the user's preferred font size setting (e.g., "font-scale-large", "font-scale-small").

### `servers`

Stores information about each server created in the application.

**Document ID**: Auto-generated UUID (`serverId`)

**Fields**:

- `name` (String): The name of the server.
- `imageUrl` (String): URL to the server's icon/image.
- `inviteCode` (String): A uID used for inviting users to the server.

### `serverMembers`

Contains details about the members of each specific server.

**Document ID**: `serverId` (Matches the ID of a document in the `servers` collection)

**Structure**: The document's data is a Map where keys are `userId`s of server members. Each `userId` entry contains:

- `role` (String): The user's role within this specific server (e.g., "owner", "admin", "member").
- `nickname` (String): The user's server-specific nickname (optional).
- `joinedAt` (Timestamp): When the user joined the server.
- Example Document Data:

  ```json
  {
    "userUid123": {
      "role": "owner",
      "nickname": "TheBoss",
      "joinedAt": "July 9, 2024 at 8:01:47 PM UTC+7"
    },
    "userUid456": {
      "role": "member",
      "nickname": "",
      "joinedAt": "July 9, 2024 at 10:26:53 AM UTC+7"
    }
  }
  ```

### `serverChannels`

Lists the channels associated with a specific server.

**Document ID**: `serverId` (Matches the ID of a document in the `servers` collection)

**Structure**: The document's data is a Map where keys are `channelId`s belonging to this server. Each `channelId` entry contains:

- `name` (String): The name of the channel.
- `type` (String): The type of channel (e.g., "text", "voice").
- Example Document Data:

  ```json
  {
    "channelABC": {
      "name": "general",
      "type": "text"
    },
    "channelXYZ": {
      "name": "lounge",
      "type": "voice"
    }
  }
  ```

### `channels`

Stores detailed information about individual server channels.

**Document ID**: Auto-generated UUID (`channelId`) (Should match keys in `serverChannels` map)

**Fields**:

- `name` (String): The name of the channel.
- `server` (String): The `serverId` this channel belongs to (reference to `servers` collection).
- `type` (String): The type of channel (e.g., "text", "voice").
- `lastMessageTimestamp` (Timestamp): Timestamp of the last message sent in the channel (useful for sorting/indication).

### `channelMessages`

Stores message history for a specific server channel.

**Document ID**: `channelId` (Matches the ID of a document in the `channels` collection)

**Structure**: The document contains a single field `messages`, which is an array of objects. Each object includes:

- `userId` (String): The message author.
- `content` (String): The message text.
- `timestamp` (Timestamp): When the message was sent.
- `imageUrl` (String): Optional image URL if the message has an image attachment.
- `fileUrl` (String): Optional file URL if the message has a file attachment.
- `fileSize` (String): Optional file size of the file attachment (e.g., "3.54 KB").
- `isEdited` (Boolean): Optional, indicates if the message has been edited or not.

### `friendships`

Represents friend requests and established friendships.

**Document ID**: Auto-generated UUID (`friendshipId`)

**Fields**:

- `user1` (String): `userId` of one user involved.
- `user2` (String): `userId` of the other user involved.
- `accepted` (Boolean): `false` if it's a pending request, `true` if the friendship is accepted.
- `timestamp` (Timestamp): Timestamp of the request creation or acceptance.

### `chats`

Represents a direct message conversation between two users.

**Document ID**: Auto-generated UUID (`chatId`)

**Fields**:

- `user1` (String): `userId` of one participant.
- `user2` (String): `userId` of the other participant.
- `timestamp` (Timestamp): Timestamp of the last message sent in the chat (useful for sorting chat list).

### `chatMessages`

Stores message history for a specific direct message chat.

**Document ID**: `chatId` (Matches the ID of a document in the `chats` collection)

**Structure**: The document contains a single field `messages`, which is an array of objects. Each object includes:

- `userId` (String): The message author.
- `content` (String): The message text.
- `timestamp` (Timestamp): When the message was sent.
- `imageUrl` (String): Optional image URL if the message has an image attachment.
- `fileUrl` (String): Optional file URL if the message has a file attachment.
- `fileSize` (String): Optional file size of the file attachment (e.g., "3.54 KB").
- `isEdited` (Boolean): Optional, indicates if the message has been edited or not.

### `blocks`

Records instances where one user blocks another, preventing interaction.

**Document ID**: Auto-generated UUID (`blockId`)

**Fields**:

- `blockerUser` (String): `userId` of the user initiating the block.
- `blockedUser` (String): `userId` of the user being blocked.
- `timestamp` (Timestamp): When the block was initiated.

### `notifications`

Stores notifications generated for a specific user.

**Document ID**: `userId` (Matches the ID of a document in the `users` collection)

**Structure**: The document contains a single field `messages`, which is an array of objects. Each object includes:

- `channelId` (String): Relevant channel ID (if applicable).
- `channelName` (String): Channel name (if applicable).
- `content` (String): Notification message or preview.
- `serverId` (String): Relevant server ID (if applicable).
- `serverName` (String): Server name (if applicable).
- `timestamp` (Timestamp): When the notification was generated.
- `username` (String): Username of the sender/actor causing the notification.
