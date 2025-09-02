# API (NestJS + Bun + SQLite)

- Dev: `bunx nx serve api` (port 3000)
- Build: `bunx nx build api`
- Start: `bunx nx start api`

## Database

**SQLite Setup:**

- File: `apps/api/data/app.db`
- Schema: Consolidated single migration with DATETIME columns
- Run migrations: `bunx nx run api:migrate`
- Ingest existing file projects: `bunx nx run api:ingest`

**Schema Details:**

- `project_full` table with DATETIME timestamps (not TEXT)
- Proper type alignment with client (Date objects)
- Clean consolidated migration structure

## API Endpoints

**Projects:**

- `GET /api/projects/list` — list project metas (returns Date objects)
- `GET /api/projects/:id` — get full project (returns Date objects)
- `POST /api/projects/create` — create project
- `PUT /api/projects/:id` — update project (name/description/tsxContent/cssContent)
- `DELETE /api/projects/:id` — delete project

**Files:**

- `POST /api/files/read` — read file content
- `POST /api/files/write` — write file content (for debug output)

**Type System:**

- All endpoints return proper Date objects for timestamps
- Project IDs are numbers throughout
- No type conversion needed between API and client

## Implementation Notes

- **Runtime**: Uses `bun:sqlite` for database operations
- **File System**: Bun's file system APIs (not Node.js `fs`)
- **Type Safety**: Full TypeScript with proper Date/number types
- **Migrations**: Single consolidated migration file for clean setup
- **Architecture**: NestJS with proper dependency injection and modules

## Development

- Hot reload with `bunx nx serve api`
- Clean database reset available via root `bun run clean` script
- Proper error handling and logging throughout
