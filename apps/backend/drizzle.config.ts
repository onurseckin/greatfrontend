import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/database/database.service.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
