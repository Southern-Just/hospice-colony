import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { beds } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

async function updateHospitalStats(hospitalId: string) {
  const allBeds = await db.select().from(beds).where(eq(beds.hospitalId, hospitalId));
  const totalBeds = allBeds.length;
  const availableBeds = allBeds.filter((b) => b.status === "available").length;

  await db
    .update("hospitals")
    .set({ totalBeds, availableBeds })
    .where(eq("id", hospitalId));
}

// PUT /api/hospitals/[id]/beds/[bedId] → update bed status
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; bedId: string }> }
) {
  const { id, bedId } = await context.params;

  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await db.update(beds).set({ status }).where(eq(beds.id, bedId));
    await updateHospitalStats(id);

    return NextResponse.json({ message: "Bed updated" });
  } catch (error) {
    console.error("PUT /beds error:", error);
    return NextResponse.json({ error: "Failed to update bed" }, { status: 500 });
  }
}

// DELETE /api/hospitals/[id]/beds/[bedId] → delete a bed
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; bedId: string }> }
) {
  const { id, bedId } = await context.params;

  try {
    await db.delete(beds).where(and(eq(beds.id, bedId), eq(beds.hospitalId, id)));
    await updateHospitalStats(id);

    return NextResponse.json({ message: "Bed deleted" });
  } catch (error) {
    console.error("DELETE /beds error:", error);
    return NextResponse.json({ error: "Failed to delete bed" }, { status: 500 });
  }
}
