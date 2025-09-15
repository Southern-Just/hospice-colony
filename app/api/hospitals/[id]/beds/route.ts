import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { beds } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

async function updateHospitalStats(hospitalId: string) {
  const allBeds = await db.select().from(beds).where(eq(beds.hospitalId, hospitalId));
  const totalBeds = allBeds.length;
  const availableBeds = allBeds.filter((b) => b.status === "available").length;

  await db
    .update("hospitals")
    .set({ totalBeds, availableBeds })
    .where(eq("id", hospitalId));
}

// GET /api/hospitals/[id]/beds → list all beds for hospital
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const hospitalBeds = await db
      .select()
      .from(beds)
      .where(eq(beds.hospitalId, id));

    return NextResponse.json(hospitalBeds);
  } catch (error) {
    console.error("GET /beds error:", error);
    return NextResponse.json({ error: "Failed to fetch beds" }, { status: 500 });
  }
}

// POST /api/hospitals/[id]/beds → add new bed(s)
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { ward, status, count = 1 } = body;

    if (!ward) {
      return NextResponse.json({ error: "Ward is required" }, { status: 400 });
    }

    const newBeds = Array.from({ length: count }).map(() => ({
      id: crypto.randomUUID(),
      hospitalId: id,
      ward,
      status: status || "available",
    }));

    await db.insert(beds).values(newBeds);
    await updateHospitalStats(id);

    return NextResponse.json({ message: `${count} bed(s) added` });
  } catch (error) {
    console.error("POST /beds error:", error);
    return NextResponse.json({ error: "Failed to add beds" }, { status: 500 });
  }
}
