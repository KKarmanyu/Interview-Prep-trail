import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const submissions = sqliteTable('submissions', {
 id: text('id').primaryKey(), role: text('role').notNull(), question: text('question').notNull(),
 createdAt: integer('created_at').notNull(), clientHash: text('client_hash').notNull(),
 name: text('name'), email: text('email'), emailStatus: text('email_status').notNull().default('pending')
});
