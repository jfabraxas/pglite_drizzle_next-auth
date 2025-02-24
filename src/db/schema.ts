import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from 'next-auth/adapters';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    passkeys: jsonb('passkeys').$type<PasskeyCredential[]>().default([]),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('email_idx').on(table.email),
  })
);

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId').notNull(),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    credentials: jsonb('credentials'),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: serial('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => ({
    compoundKey: uniqueIndex('provider_unique_idx').on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => ({
    compoundKey: uniqueIndex('token_identifier_idx').on(
      table.identifier,
      table.token
    ),
  })
);

// Passkey-specific type
export interface PasskeyCredential {
  id: string;
  publicKey: string;
  transports?: string[];
  created_at: Date;
  last_used?: Date;
}

// Types
export type User = typeof users.$inferSelect & {
  passkeys?: PasskeyCredential[];
};
export type NewUser = typeof users.$inferInsert;
