# GreatFrontend (Nx + Bun)

A modern full-stack development environment with React frontend and NestJS API, all powered by Bun.

## 🏗️ Architecture

**Monorepo Structure:**

- `apps/client` — React + Vite frontend (port 5173)
- `apps/api` — NestJS backend (port 3000)
- `scripts/` — Utility scripts (cleaner, etc.)

**Technology Stack:**

- **Runtime**: Bun (replaces Node.js)
- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: NestJS + SQLite (bun:sqlite)
- **Monorepo**: Nx for workspace management
- **Database**: SQLite with DATETIME timestamps

## 🚀 Quick Start

### Prerequisites

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Optional: Docker for containerized development
# Install Docker Desktop from https://docker.com
```

### Installation

```bash
# Clone and install dependencies
bun install
```

## 🔄 Development Workflows

### Option 1: Docker Development (Recommended)

**For Active Development (with logs visible):**

```bash
bun dev                 # Start both API + Client with logs
# Press Ctrl+C to stop
```

**For Background Development:**

```bash
bun start               # Start in background (detached)
bun logs                # View logs when needed
bun stop                # Stop all services
```

**Database Setup (Docker):**

```bash
bun migrate             # Run database migrations
bun ingest              # Import sample projects (optional)
```

### Option 2: Local Development (No Docker)

**Start Both Services:**

```bash
bun dev:local           # API (3000) + Client (5173) in parallel
```

**Start Individual Services:**

```bash
bun dev:api             # Just API server (port 3000)
bun dev:client          # Just Client dev server (port 5173)
```

**Database Setup (Local):**

```bash
bun migrate:local       # Run database migrations
bun ingest:local        # Import sample projects (optional)
```

## 📊 When to Use Each Approach

| Scenario               | Recommended Command      | Why                                      |
| ---------------------- | ------------------------ | ---------------------------------------- |
| **Active Development** | `bun dev`                | See logs, easy debugging, Ctrl+C to stop |
| **Background Testing** | `bun start` + `bun logs` | Frees terminal, services persist         |
| **Local Development**  | `bun dev:local`          | No Docker overhead, direct access        |
| **API Only Testing**   | `bun dev:api`            | Backend development focus                |
| **Frontend Only**      | `bun dev:client`         | UI development with mock data            |

## 🏭 Production Builds

### Local Production Build

```bash
bun build:local         # Build both apps for production
bun start:local         # Start production servers locally
```

### Preview Built Client

```bash
bun preview:local       # Preview production client build
```

## 🧹 Maintenance & Cleanup

### Clean Everything & Restart Fresh

```bash
bun run clean           # Nuclear option: clean everything + reinstall
# or
bun run cleaner         # Same as above (alias)
```

**What gets cleaned:**

- All build outputs (`dist/`, `out/`, `build/`)
- Node modules and lock files
- TypeScript build cache (`*.tsbuildinfo`)
- ESLint cache (`.eslintcache`)
- Development database files
- Debug output files
- NX cache

**What happens after cleaning:**

1. Removes all artifacts and dependencies
2. Reinstalls fresh dependencies with `bun install --force`
3. Ready for clean development start

## 🗄️ Database Information

**Location & Setup:**

- SQLite file: `apps/api/data/app.db`
- Docker bind mount: `./data/sqlite` ↔ `/app/apps/api/data`
- Same database used for both local and Docker development

**Schema:**

- Single consolidated migration (`001_init.sql`)
- `project_full` table with DATETIME timestamps
- Proper type alignment with frontend (no conversion needed)

## 🔧 Type System & Architecture

**Consistent Types Throughout Stack:**

- **Project IDs**: `number` (database → API → client)
- **Timestamps**: `DATETIME` in DB → `Date` objects in client
- **No Type Conversion**: Direct alignment, no conversion functions needed
- **TypeScript**: Strict mode enabled with proper type safety

**Development Features:**

- **Hot Reload**: Both API and client support hot reloading
- **Live Preview**: Real-time React component rendering
- **Code Editor**: Monaco editor with TypeScript support
- **Local Storage**: Unsaved edits cached until you click Save
- **Debug Output**: Final HTML captured to `debug/` folder

## 🚨 Troubleshooting

### Port Conflicts

```bash
# If ports 3000 or 5173 are busy:
bun stop                # Stop Docker services
# or kill local processes using those ports
```

### Database Issues

```bash
# Reset database completely:
bun run clean           # Removes database files
bun migrate             # Recreate fresh database
```

### Dependency Issues

```bash
# Fresh install:
bun run clean           # Removes node_modules + reinstalls
```

### Docker Issues

```bash
# Reset Docker environment:
bun stop
docker compose down --volumes
bun start
```

## 📚 Additional Documentation

**App-Specific Details:**

- [`apps/client/README.md`](apps/client/README.md) — Frontend architecture & features
- [`apps/api/README.md`](apps/api/README.md) — Backend API endpoints & database

**Key Files:**

- `package.json` — All available scripts and dependencies
- `nx.json` — Nx workspace configuration
- `docker-compose.yml` — Container orchestration
- `tsconfig.base.json` — TypeScript configuration
- `eslint.config.mjs` — Linting rules

## 🎯 Development Tips

1. **Use `bun dev`** for active development (you'll want to see logs)
2. **Use `bun start`** when you need services running but want your terminal free
3. **Use `bun dev:local`** if you prefer no Docker overhead
4. **Run `bun run clean`** when things get weird (nuclear reset)
5. **Check `bun logs`** if background services aren't working as expected

---

**Happy coding! 🚀**
