import NextAuth from 'next-auth';
import Passkey from 'next-auth/providers/passkey';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDatabase } from '@/db/connection';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { seedDatabase } from '@/db/connection';

const adapter = DrizzleAdapter(async () => {
  const db = await getDatabase();
  // Seed database after initialization
  await seedDatabase(db);
  return db;
}, schema);

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter,
  providers: [
    Passkey({
      // Passkey-specific configuration
      name: 'Passkey',

      // Custom verification logic
      async verify({ identifier, verifiedCredentials }) {
        const db = await getDatabase();

        // Find user by email or identifier
        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, identifier),
        });

        if (!user) {
          // Option to create a new user
          return null;
        }

        // Additional custom verification can be added here
        return user;
      },
    }),
    // Conditionally add GitHub provider
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],

  // Enhanced session and user management
  session: {
    strategy: 'database',
  },

  // Callbacks for additional customization
  callbacks: {
    async session({ session, user }) {
      // Attach additional user information
      session.user.id = user.id;
      session.user.passkeys = (user as any).passkeys || [];
      return session;
    },

    // Custom sign-in logic
    async signIn({ user, account }) {
      // Additional sign-in checks can be implemented here
      return true;
    },
  },

  // Custom pages for authentication flow
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/auth/register',
  },
});
