# Frontend App - Self-Contained Deployment

This frontend app is completely self-contained and can be deployed independently.

## Local Development

```bash
# From the frontend app directory
cd apps/frontend
bun install
bun run dev
```

## Production Build

```bash
# From the frontend app directory  
cd apps/frontend
bun install
bun run build
```

## Deployment Options

### Static Hosting (Vercel, Netlify, etc.)
1. Build the app: `bun run build`
2. Deploy the `dist/` folder

### Docker Deployment
```dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Node.js/Bun Server
```bash
# Use the included server.ts
bun run start
```

## Environment Variables

- `FRONTEND_PORT`: Frontend server port (defaults to 5173)
- `BACKEND_PORT`: Backend server port for API proxy (defaults to 3000)
- `VITE_API_PROXY_TARGET`: Backend API URL (defaults to http://localhost:${BACKEND_PORT})

## Dependencies

All dependencies are contained within this app folder:
- `package.json` - All npm dependencies
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `src/` - All source code
- `index.html` - Entry point

No external dependencies outside this folder are required.
