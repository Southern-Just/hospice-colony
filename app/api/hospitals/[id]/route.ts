
import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { hospitals } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

// GET /api/hospitals/:id
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const hospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id));

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/hospitals/:id
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db
      .update(hospitals)
      .set(body)
      .where(eq(hospitals.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating hospital:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/hospitals/:id
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await db.delete(hospitals).where(eq(hospitals.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
