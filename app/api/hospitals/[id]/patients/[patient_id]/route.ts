import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { patients } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; patientId: string } }
) {
  try {
    const body = await req.json();
    const updated = await db
      .update(patients)
      .set({
        name: body.name,
        gender: body.gender,
        dob: body.dateOfBirth,
        contact: body.contact,
        location: body.location,
        healthDetails: body.healthCondition,
      })
      .where(and(eq(patients.id, params.patientId), eq(patients.hospitalId, params.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; patientId: string } }
) {
  try {
    const deleted = await db
      .delete(patients)
      .where(and(eq(patients.id, params.patientId), eq(patients.hospitalId, params.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Patient discharged" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to discharge patient" }, { status: 500 });
  }
}
