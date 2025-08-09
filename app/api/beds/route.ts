import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { hospitals } from "@/lib/database/schema";
import { z } from "zod";
import { SPECIALTIES } from "@/lib/constants";

// Zod schema for request body validation
const HospitalSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    totalBeds: z.number().min(1, "Total beds must be at least 1"),
    availableBeds: z.number().min(0, "Available beds must be at least 0"),
    specialties: z.array(z.enum(SPECIALTIES)),
    phone: z.string().min(1, "Phone is required"),
    status: z.enum(["active", "inactive"]),
});

// GET: Fetch all hospitals
export async function GET() {
    try {
        const results = await db.select().from(hospitals);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching hospitals:", error);
        return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
    }
}

// POST: Add a new hospital
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = HospitalSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }

        const data = parsed.data;

        const [newHospital] = await db
            .insert(hospitals)
            .values({
                name: data.name,
                location: data.location,
                totalBeds: data.totalBeds,
                availableBeds: data.availableBeds,
                specialties: data.specialties,
                phone: data.phone,
                status: data.status,
            })
            .returning();

        return NextResponse.json(newHospital);
    } catch (error) {
        console.error("Error adding hospital:", error);
        return NextResponse.json({ error: "Failed to add hospital" }, { status: 500 });
    }
}
