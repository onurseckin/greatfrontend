# Backend App - Self-Contained Deployment

This backend app is completely self-contained and can be deployed independently.

## Local Development

```bash
# From the backend app directory
cd apps/backend
bun install
bun run dev
```

## Production Build & Start

```bash
# From the backend app directory
cd apps/backend
bun install
bun run build
bun run start
```

## Database Management

All database tools and configuration are included in this app:
```bash
# Generate database migrations
bun run db:generate

# Push schema changes to database
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Deployment Options

### Docker Deployment
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Cloud Platforms (Railway, Fly.io, etc.)
1. Set build command: `bun run build`
2. Set start command: `bun run start`
3. Expose port 3000

### VPS/Server
```bash
# Install dependencies and build
bun install
bun run build

# Start with PM2 or similar
pm2 start "bun dist/main.js" --name backend
```

## Environment Variables

Configure as needed for your deployment:
- `DATABASE_URL`: Database connection string (required)
- `BACKEND_PORT`: Server port (defaults to 3000)
- `PORT`: Alternative server port (fallback if BACKEND_PORT not set)
- `NODE_ENV`: Environment (development/production)

## Dependencies

All dependencies are contained within this app folder:
- `package.json` - All npm dependencies including database tools
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Database configuration
- `src/` - All source code and modules
- Database tools: Drizzle ORM, Drizzle Kit, PostgreSQL client

**Database Dependencies Included:**
- `drizzle-orm`: Database ORM for runtime
- `drizzle-kit`: Database migration and introspection tool
- `postgres`: PostgreSQL client library

No external dependencies outside this folder are required.
