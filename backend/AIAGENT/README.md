# Telegram Personal AI Assistant (Node.js + Groq + Telethon)

This is a production-ready, self-hosted Personal AI Assistant for Telegram. It connects directly to your **personal Telegram account** (not a bot), reads incoming private messages, and automatically drafts and sends replies using the **Groq API (Llama 3.3 70B)**.

The assistant acts under your identity (Muhammadaziz), uses a warm and professional tone, responds in the user's language (Uzbek, Russian, or English), captures CRM leads into MongoDB, and operates with human-like random typing delays.

---

## 🚀 Key Features

* **Real Personal Userbot**: Connects via Telegram MTProto (Telethon) - reads and writes messages on your personal account's behalf.
* **Smart Groq AI Integration**: Powered by `llama-3.3-70b-versatile` with custom prompt behavior, strict safety bounds (denies sharing passwords, OTPs, cards), and an automatic low-confidence fallback.
* **Context Preservation**: Dynamically retrieves the last 20 messages of the chat history to feed as context into Groq.
* **CRM Lead Capture**: Automatically tracks leads in a MongoDB collection if messages contain matching keywords (`kurs`, `frontend`, `backend`, `flutter`, `narx`, `o'quv markaz`).
* **Human-like Delays**: Sends a `Typing...` indicator for a random interval (5 to 15 seconds) before firing the response.
* **Admin CLI**: Real-time terminal controls: check `status`, `stats`, view active `sessions`, trigger `restart` or session `logout`.
* **Robust Docker Support**: Fully dockerized with multi-stage builds and docker-compose.

---

## 🛠️ Tech Stack & Directory Structure

* **Backend**: Node.js (TypeScript), Express, Mongoose (MongoDB), Winston Logger, Node-Cron, Groq SDK.
* **Telegram Service**: Python 3.11+, Telethon (MTProto), AioHTTP.
* **Database**: MongoDB.

```
/src
  ├── ai/                 # Groq API initialization & system prompt configuration
  ├── config/             # Environment variables parser and validation
  ├── controllers/        # Express REST API controllers
  ├── database/           # MongoDB connection and Repositories (Repository Pattern)
  ├── models/             # Mongoose schemas (Message, Lead)
  ├── services/           # Orchestrators (AIService, CRMService, TelegramService, ProcessManager)
  ├── telegram/           # Python Telethon microservice code and requirements
  ├── utils/              # Winston logging initialization
  └── index.ts            # Application bootstrap & interactive Terminal CLI
```

---

## 📋 Prerequisites

1. **Telegram Credentials**:
   - Visit [my.telegram.org](https://my.telegram.org)
   - Log in and navigate to **API development tools**.
   - Create a new application to obtain your `API_ID` and `API_HASH`.
2. **Groq API Key**:
   - Sign up at [console.groq.com](https://console.groq.com) and generate an API key.
3. **MongoDB**:
   - A local MongoDB instance or MongoDB Atlas URI (if running outside Docker).

---

## 🔧 Local Configuration

1. Clone the repository and navigate to the project directory.
2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in the required variables inside `.env`:
   ```env
   PORT=5000
   API_ID=1234567               # Your Telegram API ID
   API_HASH=abcdef123456...     # Your Telegram API Hash
   PHONE=+998901234567          # Your Telegram Account Phone Number
   GROQ_API_KEY=gsk_...         # Your Groq API Key
   GROQ_MODEL=llama-3.3-70b-versatile
   MONGO_URI=mongodb://127.0.0.1:27017/telegram_assistant
   AUTO_REPLY_CONTACTS=false
   AUTO_REPLY_UNKNOWN=true
   MIN_DELAY=5
   MAX_DELAY=15
   ```

---

## 💻 Local Installation & First Run (Recommended)

To authenticate your Telegram account, you need to execute the first-time login process locally so you can input the verification code sent by Telegram into the console.

### 1. Install Node.js dependencies
```bash
npm install
```

### 2. Install Python dependencies
```bash
pip install -r src/telegram/requirements.txt
```

### 3. Start the application in development mode
```bash
npm run dev
```

During startup:
- The Node.js server will boot and connect to MongoDB.
- The Python Telethon client will launch.
- **First Run Only**: You will see a prompt in the terminal: `Enter code:`. Telegram will send a login code directly to your Telegram app. Enter it and press Enter.
- If you have Two-Factor Authentication (2FA) enabled, it will then prompt `Enter 2FA password:`. Enter it and press Enter.
- Once authenticated, it will save a session file in `./sessions/assistant.session`. Next runs will skip this step and authorize automatically.

---

## 🐳 Running with Docker Compose

Once the `./sessions/assistant.session` file has been created during the local run, you can easily spin up the entire stack using Docker:

```bash
docker-compose up --build -d
```

Docker Compose spins up:
1. `mongodb`: Isolated database container storing messages and CRM leads.
2. `backend`: Express server, AI generator, and CLI backend.
3. `telegram-client`: Headless Telethon service communicating with Telegram and the backend.

*Note: Since the `./sessions` folder is mounted as a shared volume, the Docker containers will automatically reuse the local login session.*

---

## ⌨️ Admin Terminal Commands

When running the project locally (`npm run dev` or `npm start`), you can type commands directly into the terminal window to monitor and manage the assistant:

* `status` - Displays connection state of MongoDB, the Express API, and details of the authorized Telegram account.
* `stats` - Shows the total messages logged, replies sent, total leads captured, and a table of the 5 most recent leads.
* `sessions` - Lists active Telegram session files, their size, and modifications.
* `restart` - Restarts the Python Telegram client (useful to force a reconnection).
* `logout` - Destroys the current session, deletes session files, and shuts down the client to let you authenticate with a different phone number.

---

## 💾 MongoDB Schema Reference

### `messages`
Stores conversation logs to feed context to Groq.
* `messageId` (String, unique): Global message key (`chatId_msgId`) to prevent double replies.
* `chatId` (String): ID of the Telegram conversation.
* `senderId` (String): ID of the sending party.
* `senderName` (String): Name of the sender.
* `text` (String): Message text.
* `direction` (String): `incoming` or `outgoing`.
* `timestamp` (Date): Creation time.

### `leads`
Stores CRM leads captured from key phrase scans.
* `chatId` (String, unique): Unique chat identifier.
* `name` (String): Client's name.
* `username` (String): Telegram handle.
* `keywordsMatched` (Array): Matched terms (`kurs`, `frontend`, etc.).
* `lastMessage` (String): Message that triggered capture.
* `status` (String): `new`, `contacted`, or `converted`.
* `createdAt` / `updatedAt` (Dates).

---

## 🛡️ License

This project is open-source and free to distribute.
