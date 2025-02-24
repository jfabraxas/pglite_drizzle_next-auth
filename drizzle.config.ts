import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pglite',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'file:mydb',
  },
} satisfies Config;
