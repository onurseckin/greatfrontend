import { Injectable } from '@nestjs/common';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Schema definition
export const projectFull = pgTable('project_full', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().$type<'tsx' | 'jsx'>(),
  tsxContent: text('tsx_content').notNull(),
  cssContent: text('css_content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProjectFull = typeof projectFull.$inferSelect;
export type NewProjectFull = typeof projectFull.$inferInsert;

const connectionString =
  'postgresql://neondb_owner:npg_g1duNcqJP9WM@ep-ancient-mouse-afgvubpr-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(client, { schema: { projectFull } });

@Injectable()
export class DatabaseService {
  get drizzle() {
    return db;
  }

  get schema() {
    return { projectFull };
  }
}
