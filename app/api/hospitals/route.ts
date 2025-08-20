import { NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { hospitals } from "@/lib/database/schema";
import { HospitalSchema } from "@/lib/validation/hospital.validation";
import { HOSPITAL_STATUS, HOSPITAL_SPECIALTIES } from "@/lib/constants";

// GET all hospitals
export async function GET() {
    try {
        const allHospitals = await db.select().from(hospitals);
        return NextResponse.json(allHospitals);
    } catch (error) {
        console.error("Error fetching hospitals:", error);
        return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
    }
}

// POST create new hospital
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input with Zod
        const parsed = HospitalSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsed.error.format() },
                { status: 400 }
            );
        }

        // Double-check enums at runtime for safety
        if (!HOSPITAL_STATUS.includes(parsed.data.status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        if (!parsed.data.specialties.every(s => HOSPITAL_SPECIALTIES.includes(s))) {
            return NextResponse.json({ error: "Invalid specialty value" }, { status: 400 });
        }

        // Insert into DB
        const newHospital = await db
            .insert(hospitals)
            .values({
                name: parsed.data.name,
                location: parsed.data.location,
                totalBeds: parsed.data.totalBeds,
                availableBeds: parsed.data.availableBeds,
                specialties: parsed.data.specialties,
                phone: parsed.data.phone,
                status: parsed.data.status,
            })
            .returning();

        return NextResponse.json(newHospital[0], { status: 201 });
    } catch (error) {
        console.error("Error creating hospital:", error);
        return NextResponse.json({ error: "Failed to create hospital" }, { status: 500 });
    }
}
