
import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { beds } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

// GET /api/hospitals/:id/beds
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const hospitalBeds = await db
      .select()
      .from(beds)
      .where(eq(beds.hospitalId, id));

    return NextResponse.json(hospitalBeds);
  } catch (error) {
    console.error("Error fetching hospital beds:)", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

