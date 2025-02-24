import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/db/connection';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod'; // For validation

// Input validation schema
const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

// GET all users
export async function GET() {
  try {
    const db = await getDatabase();
    const allUsers = await db.select().from(users);

    return NextResponse.json(allUsers, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST new user
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Validate input
    const validatedData = UserSchema.parse(body);

    const newUser = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Validate input with optional fields for update
    const UpdateSchema = z.object({
      id: z.number().int().positive(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    });

    const validatedData = UpdateSchema.parse(body);

    const updatedUser = await db
      .update(users)
      .set({
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
      })
      .where(eq(users.id, validatedData.id))
      .returning();

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Validate input
    const DeleteSchema = z.object({
      id: z.number().int().positive(),
    });

    const validatedData = DeleteSchema.parse(body);

    await db.delete(users).where(eq(users.id, validatedData.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}

// Centralized error handling
function handleError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: 'Unknown Error' }, { status: 500 });
}
