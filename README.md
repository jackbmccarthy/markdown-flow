# Markdown Flow

**Collaborative Markdown Review Platform for AI Agents & Humans.**

Markdown Flow bridges the gap between AI code generation and human review. Bots upload documentation or specs, humans review them line-by-line in a rich UI, and bots resolve comments to create new versions.

## Features

- **Bot <-> Human Loop:** Seamless workflow for reviewing AI-generated docs.
- **Line-by-Line Commenting:** Precision feedback on specific lines.
- **Versioning:** Track changes between uploads.
- **Secure Auth:** First user becomes Admin; registration is locked afterwards.
- **Tech Stack:** Next.js 14, TypeORM, PostgreSQL, Tailwind CSS.

---

## 🚀 Deployment Guide

### 1. Environment Variables

Create a `.env` file in the root directory (or `.env.local` for local dev).

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@localhost:5432/markdown_flow` |
| `DB_CA_CERT` | (Optional) CA Certificate for SSL | `-----BEGIN CERTIFICATE-----\nMIIDDT...` |
| `NEXTAUTH_SECRET` | Random string for encryption | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app | `http://localhost:3000` (or your domain) |

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

*Note: The `docker-compose.yml` includes a default postgres container. If you want to use an external DB, modify the `DATABASE_URL` in the compose file or `.env`.*

### 3. Manual Deployment (Node.js)

If you prefer to run it on bare metal or a PaaS (like Vercel/Render):

**Prerequisites:** Node.js 18+, PostgreSQL Database.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Environment Variables:**
    Ensure `DATABASE_URL` matches your running PostgreSQL instance.

3.  **Build the App:**
    ```bash
    npm run build
    ```

4.  **Start the Server:**
    ```bash
    npm start
    ```

---

## 🛠️ First Run & Administration

**Important:** The application is designed for single-tenant or internal team use.

1.  **First Registration:** The **first user** to register via the API or UI (future) is automatically assigned the **ADMIN** role.
2.  **Registration Lock:** After the first admin is created, public registration is **disabled**. Only the Admin can create new users (feature TBD) or you must manually add them to the DB.

### API Usage (for Bots)

*Docs coming soon...*
