import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { patients } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await db
      .select()
      .from(patients)
      .where(eq(patients.hospitalId, params.id));

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const newPatient = await db
      .insert(patients)
      .values({
        hospitalId: params.id,
        name: body.name,
        gender: body.gender,
        dob: body.dateOfBirth,
        contact: body.contact,
        location: body.location,
        healthDetails: body.healthCondition,
        admittedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newPatient[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to admit patient" }, { status: 500 });
  }
}
