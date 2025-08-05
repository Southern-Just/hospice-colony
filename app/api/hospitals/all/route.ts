import { NextResponse } from "next/server";
import { getAllHospitals } from "@/lib/hospitalPartners.server";

type Hospital = {
  specialties: string[] | string | undefined;
  [key: string]: any;
};

export async function GET() {
  try {
    const hospitals = await getAllHospitals();

    const parsed = hospitals.map((hospital: Hospital) => ({
      ...hospital,
      specialties: Array.isArray(hospital.specialties)
        ? hospital.specialties
        : typeof hospital.specialties === "string"
        ? hospital.specialties.split(",").map((s: string) => s.trim())
        : [],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
  }
}
