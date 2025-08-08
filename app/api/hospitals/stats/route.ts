import { db } from "@/lib/database/db";
import { hospitals } from "@/lib/database/schema";
import { NextResponse } from "next/server";

type HospitalStatsRecord = {
  totalBeds: number | null;
  availableBeds: number | null;
};

export async function GET() {
  try {
    const allHospitals: HospitalStatsRecord[] = await db.select().from(hospitals);

    const totalBeds = allHospitals.reduce(
        (sum, h) => sum + (h.totalBeds ?? 0),
        0
    );
    const availableBeds = allHospitals.reduce(
        (sum, h) => sum + (h.availableBeds ?? 0),
        0
    );
    const hospitalCount = allHospitals.length;

    return NextResponse.json({
      totalBeds,
      availableBeds,
      hospitalCount,
    });
  } catch (error) {
    console.error("Error fetching hospital stats:", error);
    return NextResponse.json(
        { error: "Failed to fetch hospital stats" },
        { status: 500 }
    );
  }
}
