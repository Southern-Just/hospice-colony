import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { hospitals } from "@/lib/database/schema";
import { z } from "zod";
import { SPECIALTIES } from "@/lib/constants";

type HospitalRecord = {
    id: number;
    name: string;
    location: string;
    totalBeds: number;
    availableBeds: number;
    specialties: string[] | string | null;
    phone: string;
    status: "active" | "inactive";
};

// Zod validation schema
const HospitalSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    totalBeds: z.number().min(1),
    availableBeds: z.number().min(0),
    specialties: z.array(z.enum([...SPECIALTIES])),
    phone: z.string().min(1),
    status: z.enum(["active", "inactive"]),
});

// Helper to ensure specialties are always an array
function normalizeSpecialties(specialties: HospitalRecord["specialties"]): string[] {
    if (Array.isArray(specialties)) return specialties;
    if (typeof specialties === "string") {
        return specialties.split(",").map((s) => s.trim());
    }
    return [];
}

export async function GET() {
    try {
        const results: HospitalRecord[] = await db.select().from(hospitals);
        return NextResponse.json(
            results.map((h) => ({
                ...h,
                specialties: normalizeSpecialties(h.specialties),
            }))
        );
    } catch (error) {
        console.error("Error fetching hospitals:", error);
        return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = HospitalSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
        }

        const data = parsed.data;

        const result = await db
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

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Error adding hospital:", error);
        return NextResponse.json({ error: "Failed to add hospital" }, { status: 500 });
    }
}
