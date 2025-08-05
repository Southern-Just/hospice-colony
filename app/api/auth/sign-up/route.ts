import { db } from '@/lib/database/db';
import { users, sessions } from '@/lib/database/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password, firstName, lastName } = await req.json();

  const existingUser = await db.query.users.findFirst({
    where: (fields, operators) => operators.eq(fields.email, email),
  });

  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  await db.insert(users).values({
    id: userId,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    isActive: true,
  });

  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  await db.insert(sessions).values({
    id: uuidv4(),
    userId,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return NextResponse.json(
    { message: 'Account created successfully', token },
    {
      status: 200,
      headers: {
        'Set-Cookie': `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
    }
  );
}
