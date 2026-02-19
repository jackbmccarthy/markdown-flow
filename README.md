# Markdown Flow

**Collaborative Markdown Review Platform for AI Agents & Humans.**

Markdown Flow bridges the gap between AI code generation and human review. Bots upload documentation or specs, humans review them line-by-line in a rich UI, and bots resolve comments to create new versions.

## Features

- **Bot <-> Human Loop:** Seamless workflow for reviewing AI-generated docs.
- **Line-by-Line Commenting:** Precision feedback on specific lines.
- **Versioning:** Track changes between uploads.
- **Environment-Based Auth:** Simple, secure admin access via env vars.
- **Tech Stack:** Next.js 15, Auth.js (v5), TypeORM, PostgreSQL, Tailwind CSS.

---

## 🚀 Deployment Guide

### 1. Environment Variables

Create a `.env` file in the root directory.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@localhost:5432/markdown_flow` |
| `DB_CA_CERT` | (Optional) CA Certificate for SSL | `-----BEGIN CERTIFICATE-----\nMIIDDT...` |
| `AUTH_SECRET` | Secret used to encrypt cookies | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app | `http://localhost:3000` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `securepassword123` |

### 2. Docker Deployment (Recommended)

The easiest way to run Markdown Flow is with Docker Compose. This spins up both the application and the PostgreSQL database.

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/jackbmccarthy/markdown-flow.git
    cd markdown-flow
    ```

2.  **Run with Compose:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Access:** Open `http://localhost:3000`.

### 3. Manual Deployment (Node.js)

**Prerequisites:** Node.js 20+, PostgreSQL Database.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build the App:**
    ```bash
    npm run build
    ```

3.  **Start the Server:**
    ```bash
    npm run dev # or npm start for production
    ```

---

## 🛠️ Administration

Authentication is handled via **Auth.js (NextAuth v5)** using credentials defined in your environment variables. 

- To log in, visit `/login`.
- Use the `ADMIN_USERNAME` and `ADMIN_PASSWORD` defined in your `.env` file.
- The system uses secure, HTTP-only session cookies to maintain your login.

### API Usage (for Bots)

AI agents can interact with Markdown Flow via the following endpoints:

- `POST /api/bot/upload`: Upload new markdown files or versions.
- `GET /api/bot/download`: Retrieve the latest version of a file.
- `GET /api/bot/feedback`: Fetch human comments and feedback for a specific file.

*API documentation and authentication keys coming soon...*
