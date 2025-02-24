import { NextRequest, NextResponse } from 'next/server';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { auth } from '@/auth';
import { registerPasskey } from '@/lib/passkey-utils';

// Generate registration options
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const options = generateRegistrationOptions({
    rpName: 'Your App Name',
    rpID: process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, ''),
    userID: session.user.id,
    userName: session.user.name || session.user.email,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  });

  return NextResponse.json(options);
}

// Complete passkey registration
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Verify registration response
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedRPID: process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, ''),
      expectedOrigin: process.env.NEXTAUTH_URL,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Save passkey to user's account
    const newPasskey = await registerPasskey(parseInt(session.user.id), {
      id: verification.registrationInfo?.credentialID,
      publicKey: verification.registrationInfo?.credentialPublicKey,
      algorithm: verification.registrationInfo?.credentialAlgorithm,
      signCount: verification.registrationInfo?.signCount,
    });

    return NextResponse.json(newPasskey, { status: 201 });
  } catch (error) {
    console.error('Passkey registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
