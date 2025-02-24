import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listUserPasskeys, removePasskey } from '@/lib/passkey-utils';

// List user's passkeys
export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const passkeys = await listUserPasskeys(Number(session.user.id));
    return NextResponse.json(passkeys);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve passkeys' }, 
      { status: 500 }
    );
  }
}

// Remove specific passkey
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { passkeyId: string } }
) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await removePasskey(
      Number(session.user.id), 
      params.passkeyId
    );

    return NextResponse.json({ message: 'Passkey removed' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove passkey' }, 
      { status: 500 }
    );
  }
}