import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { beds } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

// Basic grid layout optimizer (replace with your ACO later)
const optimizeBeds = (bedsList: any[]) => {
  const cols = 8;
  const spacingX = 70;
  const spacingY = 70;
  const offsetX = 40;
  const offsetY = 40;

  return bedsList.map((bed, index) => {
    const x = offsetX + (index % cols) * spacingX;
    const y = offsetY + Math.floor(index / cols) * spacingY;
    return {
      ...bed,
      position: { x, y },
    };
  });
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = params.id;

    // fetch hospital's beds
    const hospitalBeds = await db
      .select()
      .from(beds)
      .where(eq(beds.hospitalId, hospitalId));

    if (hospitalBeds.length === 0) {
      return NextResponse.json(
        { error: "No beds found for this hospital" },
        { status: 404 }
      );
    }

    // run optimizer
    const optimized = optimizeBeds(hospitalBeds);

    // persist updated positions
    for (const b of optimized) {
      await db
        .update(beds)
        .set({ position: JSON.stringify(b.position) })
        .where(eq(beds.id, b.id));
    }

    return NextResponse.json(optimized);
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize beds" },
      { status: 500 }
    );
  }
}
