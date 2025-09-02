# Client (React + Vite + Bun)

- Dev: `bunx nx serve client` (port 5173)
- Build: `bunx nx build client`
- Preview: `bunx nx preview client`

API base: `/api` (proxied to backend in dev via Vite).

## Data Model

**Projects:**

- Loaded from backend (SQLite via API)
- **IDs**: Numbers (no string conversion needed)
- **Timestamps**: Date objects (createdAt, updatedAt)
- **Types**: Fully aligned with API - no conversion functions

**Local Storage:**

- Unsaved edits cached in localStorage (key: `project-<id>`)
- Shown on details page until you click Save
- Uses number IDs consistently

**Type Safety:**

- All types match between client and API
- No manual type conversion required
- Date objects used throughout

## Production Serve

- A small Bun static server lives at `apps/client/server.ts` to serve `dist`

## Development Features

- **Live Rendering**: Real-time preview of React components
- **Code Editor**: Monaco editor with TypeScript/JavaScript support
- **Project Management**: Create, edit, delete projects with proper type safety
- **Preview Buffer**: Captures final rendered HTML output to debug files
