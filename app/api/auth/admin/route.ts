import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { eq } from "drizzle-orm";
import { users } from "@/lib/database/schema";
import { db } from "@/lib/database/db";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashed = await hash(password, 10);

  await db.insert(users).values({
    firstName: name,
    lastName: "", 
    email,
    password: hashed,
    role: "admin",
  });

  return NextResponse.json({ success: true, message: "Admin registered" });
}
