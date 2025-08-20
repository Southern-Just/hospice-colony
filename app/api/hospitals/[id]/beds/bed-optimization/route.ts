import { NextResponse } from "next/server";
import { optimizeBedArrangement } from "@/controller/bedOptimization.controller";
import { validateBeds } from "@/middleware/bedOptimization.middleware";
import { db } from "@/lib/database/db";
import { beds } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch beds from DB
    const hospitalBeds = await db
      .select()
      .from(beds)
      .where(eq(beds.hospitalId, params.id));

    if (!validateBeds(hospitalBeds)) {
      return NextResponse.json(
        { error: "Invalid beds payload" },
        { status: 400 }
      );
    }

    const optimized = optimizeBedArrangement(hospitalBeds);

    // Update positions in DB (optional)
    for (const bed of optimized) {
      await db
        .update(beds)
        .set({ position: bed.position })
        .where(eq(beds.id, bed.id));
    }

    return NextResponse.json(optimized);
  } catch (error) {
    console.error("Bed optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize beds" },
      { status: 500 }
    );
  }
}
