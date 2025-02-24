import { getDatabase } from '@/db/connection';
import { users, PasskeyCredential } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function registerPasskey(
  userId: number,
  passkeyData: Partial<PasskeyCredential>
): Promise<PasskeyCredential> {
  const db = await getDatabase();

  // Prepare new passkey
  const newPasskey: PasskeyCredential = {
    id: passkeyData.id || randomUUID(),
    publicKey: passkeyData.publicKey || '',
    transports: passkeyData.transports || [],
    created_at: new Date(),
    last_used: new Date(),
  };

  // Fetch current user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update passkeys
  const updatedPasskeys = [...(user.passkeys || []), newPasskey];

  // Update user in database
  await db
    .update(users)
    .set({ passkeys: updatedPasskeys })
    .where(eq(users.id, userId));

  return newPasskey;
}

export async function removePasskey(userId: number, passkeyId: string) {
  const db = await getDatabase();

  // Fetch current user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Filter out the specified passkey
  const updatedPasskeys = (user.passkeys || []).filter(
    (pk) => pk.id !== passkeyId
  );

  // Update user in database
  await db
    .update(users)
    .set({ passkeys: updatedPasskeys })
    .where(eq(users.id, userId));

  return updatedPasskeys;
}

export async function listUserPasskeys(userId: number) {
  const db = await getDatabase();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user?.passkeys || [];
}
