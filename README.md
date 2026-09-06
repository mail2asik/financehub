# FinanceHub

FinanceHub is a full-stack web application built using a monorepo architecture. It features a NestJS backend API, a React (Vite) frontend, MySQL database, Redis caching, Mailpit for local email testing, and Nginx as a reverse proxy.

---

## 🛠 Tech Stack

- **Backend:** NestJS, Prisma ORM, Node.js (v20)
- **Frontend:** React, Vite, Tailwind CSS
- **Database & Cache:** MySQL 8.0, Redis 7
- **Mail Server (Dev):** Mailpit
- **Reverse Proxy:** Nginx
- **Containerization:** Docker & Docker Compose

---

## 📁 Project Structure

```text
financehub/
├── apps/
│   ├── api/                   # NestJS Backend Application
│   └── web/                   # React Frontend Application (Vite)
├── docker/
│   └── nginx/
│       ├── development.conf   # Nginx proxy config for Dev (HMR support)
│       └── production.conf    # Nginx proxy config for Production
├── .development.env           # Base development environment variables
├── .development.local.env     # Local developer overrides (Git ignored)
├── .production.env            # Base production environment variables
├── .production.local.env      # Local production overrides/secrets (Git ignored)
├── development.yml            # Docker Compose configuration for Local Development
└── production.yml             # Docker Compose configuration for Production
```

---

## 🌐 Domain Configuration (Local Hosts File)

To access the application using custom local domain names, add the following entry to your host operating system's hosts file (`/etc/hosts` on Linux/macOS or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```text
127.0.0.1 web-financehub.asik.local api-financehub.asik.local
```

---

## ⚙️ Environment Configuration

FinanceHub uses a layered environment setup. Shared defaults live in base `.env` files, while local secrets and environment overrides live in `.local.env` files (which are ignored by Git).

### 1. Development Configuration

Create `.development.env` in the root folder:

```env
PORT=3000

JWT_SECRET=
JWT_REFRESH_SECRET=

DATABASE_URL=
DATABASE_HOST="financehub-mysql"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD=
DATABASE_NAME="financehub"

REDIS_HOST="financehub-redis"
REDIS_PORT=6379
```

Optionally, create `.development.local.env` for custom local overrides:

```env
JWT_SECRET="super-secret-key-change-in-development"
JWT_REFRESH_SECRET="super-refresh-secret-key"

DATABASE_URL="mysql://root:rootpassword@financehub-mysql:3306/financehub"
DATABASE_PASSWORD="rootpassword"
```

### 2. Production Configuration

Create `.production.env` in the root folder:

```env
PORT=3000

JWT_SECRET=
JWT_REFRESH_SECRET=

DATABASE_URL=
DATABASE_HOST="financehub-mysql"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD=
DATABASE_NAME="financehub"

REDIS_HOST="financehub-redis"
REDIS_PORT=6379
```

Create `.production.local.env` for production deployment secrets:

```env
JWT_SECRET="super-secret-key-change-in-production"
JWT_REFRESH_SECRET="super-refresh-secret-key"

DATABASE_URL="mysql://root:rootpassword@financehub-mysql:3306/financehub"
DATABASE_PASSWORD="rootpassword"
```

---

## 🚀 Getting Started

Ensure you have Docker and Docker Compose installed on your machine.

### Option A: Local Development (Hot Reloading / Watch Mode)

This setup runs hot-reloading dev servers inside Docker containers. Changes made to your local code will instantly refresh in the application without requiring native Node.js/npm on your host machine.

**Run Development Containers:**

```bash
docker compose --env-file .development.env -f development.yml up -d
```

**Application URLs:**

- Web Frontend: <http://web-financehub.asik.local>
- API Backend: <http://api-financehub.asik.local>
- Mailpit Web UI (Email Testing): <http://localhost:8025>
- MySQL Database: `localhost:3306`

**View Logs:**

```bash
# View all container logs
docker compose -f development.yml logs -f

# View API container logs only
docker compose -f development.yml logs -f api
```

**Stop Development Services:**

```bash
docker compose --env-file .development.env -f development.yml down
```

### Option B: Production Deployment

This setup builds production-ready Docker images. The React app is compiled into static assets and served by Nginx, while the NestJS backend runs compiled JavaScript.

**Build and Run Production Containers:**

```bash
docker compose --env-file .production.env -f production.yml up --build -d
```

**Stop Production Services:**

```bash
docker compose --env-file .production.env -f production.yml down
```

---

## 🧪 Database Migrations & Tooling

To execute Prisma CLI commands inside the running API development container:

**Run Database Migrations:**

```bash
docker compose --env-file .development.env -f development.yml exec api npx prisma migrate dev
```