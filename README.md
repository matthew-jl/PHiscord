# PHiscord

A feature-rich, real-time communication application inspired by Discord, built as a desktop app using Nextron. Experience seamless text, voice, and video communication with server-based communities and direct messaging.

**Tech Stack:** Next.js (React), Electron (via Nextron), Firebase (Auth, Firestore, Storage, Realtime Database), LiveKit (Real-time Voice/Video), TypeScript, Tailwind CSS, Shadcn/UI.

---

## Key Features

### Core Communication

- **Servers & Channels:** Create or join servers (communities). Organize discussions within servers using distinct text and voice channels.
- **Real-time Text Chat:** Send and receive messages instantly in text channels and direct messages.
- **Real-time Voice/Video Channels:** Join voice channels for persistent group voice chat. Toggle camera for video sharing within the channel. See who's currently speaking.
- **Direct Messaging:** Engage in private one-on-one conversations with friends or other server members (respecting privacy settings).
- **Direct Voice/Video Calls:** Initiate private voice or video calls directly with other users.

### User Experience & Customization

- **User Authentication:** Secure registration and login flow using Firebase Authentication.
- **User Profiles & Presence:** Manage your profile information and see the online status of friends. Set custom statuses to share what you're up to.
- **Friend System:** Add, view (by status: Online, All, Blocked), and remove friends. Block users to prevent unwanted interactions.
- **Rich Media & Interactions:**
  - Send files (images, documents) via drag-and-drop or file selection.
  - Use emojis in messages.
  - Edit and delete your own messages.
  - Mention users (`@username`) to notify them.
  - Clickable links and image previews directly in chat.
  - Message search within channels and DMs.
- **Customization:**
  - Personalize appearance with color themes and adjustable font sizes.
  - Configure privacy settings for direct messages and calls from non-friends.
  - Set custom nicknames per server.

### Server Management

- **Role-Based Access Control:** Servers have Owners, Admins, and Members with distinct permissions for managing the server, channels, and members.
- **Channel Management:** Admins/Owners can create, edit, and delete text and voice channels.
- **Member Management:** View server members categorized by role. Admins/Owners can manage members on their server.

---

## System Design & Architecture

Understanding the underlying structure is key to appreciating the application's complexity and scalability.

- **System Design Diagrams:** Detailed diagrams illustrating the system's architecture and user flows were created using the Satzinger concept during the planning phase. These include:
  - [All Diagrams (Folder)](./diagrams/)
  - [View Use Case Diagram](./diagrams/PHiscord_UseCaseDiagram.png)
  - [Use Case Descriptions (Excel Workbook)](./diagrams/PHiscord_FullUseCaseDescriptions.xlsx)
  - [View Activity Diagrams](./diagrams/PHiscord_ActivityDiagrams.png)
  - [View Sequence Diagram Example](./diagrams/PHiscord_SequenceDiagram_SendFriendRequest.png)
  - [View Class Diagram](./diagrams/PHiscord_ClassDiagram.png)
- **Database Schema:** The application utilizes Firestore as its primary database. The detailed schema outlining collections, documents, and fields can be found here:
  - **[View Firestore Schema](./SCHEMA.md)**

---

## Getting Started

Follow these steps to set up and run the project locally:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/matthew-jl/PHiscord.git
    cd PHiscord
    ```

2.  **Install Dependencies:**
    Using Yarn (recommended):

    ```bash
    yarn install
    ```

    Or using npm:

    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**

    - Navigate into the `renderer` directory:
      ```bash
      cd renderer
      ```
    - Copy the example environment file:
      ```bash
      cp .env.example .env.local
      ```
    - Edit the newly created `renderer/.env.local` file and add your Firebase project configuration keys and any other required variables. Refer to the [Environment Variables](#environment-variables) section below.

4.  **Run the Development Server:**
    ```bash
    yarn dev
    ```
    or
    ```bash
    npm run dev
    ```
    This will start the Next.js development server and launch the Electron application.

---

<a id="environment-variables"></a>

## Environment Variables

You need to configure your local environment variables by copying the example file provided and filling in your specific keys.

1.  Navigate to the `renderer` directory within the project root.
2.  Copy `renderer/.env.example` to `renderer/.env.local`.
3.  Edit `renderer/.env.local` with your configuration:

```plaintext
# .env.local

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET
NEXT_PUBLIC_LIVEKIT_URL=YOUR_LIVEKIT_SERVER_URL
```

_Obtain these keys from your Firebase project console._

---

## B️uilding for Production

To create a production build of the application:

```bash
yarn build
```

or

```bash
npm run build
```

This will generate distributable application files in the `dist/` directory.
