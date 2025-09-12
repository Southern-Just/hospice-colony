import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { patients } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

// ✅ GET all patients for a given hospital
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = parseInt(params.id);
    if (isNaN(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital ID" }, { status: 400 });
    }

    const hospitalPatients = await db
      .select()
      .from(patients)
      .where(eq(patients.hospitalId, hospitalId));

    return NextResponse.json(hospitalPatients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

// ✅ POST admit a new patient
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = parseInt(params.id);
    if (isNaN(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital ID" }, { status: 400 });
    }

    const body = await req.json();

    const newPatient = await db
      .insert(patients)
      .values({
        hospitalId,
        name: body.name,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        location: body.location,
        contact: body.contact,
        healthCondition: body.healthCondition,
        admissionDate: body.admissionDate || new Date().toISOString(),
        dischargeDate: body.dischargeDate || null,
        nextOfKin: body.nextOfKin,
        idNumber: body.idNumber,
        insuranceProvider: body.insuranceProvider,
        insuranceNumber: body.insuranceNumber,
      })
      .returning();

    return NextResponse.json(newPatient[0]);
  } catch (error) {
    console.error("Error admitting patient:", error);
    return NextResponse.json({ error: "Failed to admit patient" }, { status: 500 });
  }
}

// ✅ PUT update patient details
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = parseInt(params.id);
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const updatedPatient = await db
      .update(patients)
      .set({
        name: body.name,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        location: body.location,
        contact: body.contact,
        healthCondition: body.healthCondition,
        admissionDate: body.admissionDate,
        dischargeDate: body.dischargeDate,
        nextOfKin: body.nextOfKin,
        idNumber: body.idNumber,
        insuranceProvider: body.insuranceProvider,
        insuranceNumber: body.insuranceNumber,
      })
      .where(and(eq(patients.hospitalId, hospitalId), eq(patients.id, body.id)))
      .returning();

    if (!updatedPatient.length) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPatient[0]);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

// ✅ DELETE remove/discharge patient
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = parseInt(params.id);
    const { searchParams } = new URL(req.url);
    const patientId = parseInt(searchParams.get("patientId") || "");

    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const deletedPatient = await db
      .delete(patients)
      .where(and(eq(patients.hospitalId, hospitalId), eq(patients.id, patientId)))
      .returning();

    if (!deletedPatient.length) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Patient deleted", patient: deletedPatient[0] });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
  }
}
