import { drizzle } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

let db: ReturnType<typeof drizzle>;
let client: PGlite;

export async function getDatabase() {
  if (!db) {
    client = new PGlite('file:mydb');

    // Simplified schema creation
    await createTables(client);

    db = drizzle(client, { schema });
  }
  return db;
}

async function createTables(client: PGlite) {
  // Use individual CREATE TABLE statements instead of multiple commands
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      "emailVerified" TIMESTAMP,
      image TEXT,
      passkeys JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS accounts (
      "userId" TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      credentials JSONB,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      UNIQUE(provider, "providerAccountId")
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      "sessionToken" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      expires TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL,
      UNIQUE(identifier, token)
    )`,
  ];

  // Execute each table creation statement separately
  for (const tableQuery of tables) {
    try {
      await client.query(tableQuery);
    } catch (error) {
      console.error(`Error creating table: ${error}`);
    }
  }

  // Optional: Add unique indexes
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique 
    ON users(email)
  `);
}

// Seed function with error handling
export async function seedDatabase(database: ReturnType<typeof drizzle>) {
  try {
    // Check if users table is empty
    const existingUsers = await database.select().from(schema.users);

    if (existingUsers.length === 0) {
      console.log('Seeding database...');

      // Seed initial users
      const seedUsers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: new Date(),
          image: 'https://example.com/john.jpg',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          emailVerified: new Date(),
          image: 'https://example.com/jane.jpg',
        },
      ];

      for (const user of seedUsers) {
        await database.insert(schema.users).values(user);
      }

      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.error('Seeding database error:', error);
  }
}

// Utility function to clear database
export async function clearDatabase() {
  if (!client) {
    throw new Error('Database not initialized');
  }

  const tables = ['users', 'accounts', 'sessions', 'verification_tokens'];

  for (const table of tables) {
    await client.query(`DELETE FROM ${table}`);
  }
}
