import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { hospitals, beds } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import { persistentACOService } from "@/lib/aco/persistentACOService";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!; // Make sure you have this in env

async function getUserFromAuthHeader(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return null;
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as { id: string; role: string; email: string }; // Adjust based on your JWT payload
    } catch {
        return null;
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!["admin", "staff"].includes(user.role))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { patientPriority, wardType } = await req.json();
        if (!patientPriority || !wardType) {
            return NextResponse.json(
                { error: "Missing required fields: patientPriority, wardType" },
                { status: 400 }
            );
        }

        const hospital = await db.query.hospitals.findFirst({
            where: eq(hospitals.id, params.id),
        });
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });

        const bedId = await persistentACOService.selectBed({
            hospitalId: params.id,
            wardType,
            priority: patientPriority,
        });
        if (!bedId) return NextResponse.json({ error: "No available bed" }, { status: 409 });

        await db.update(beds).set({ status: "occupied" }).where(eq(beds.id, bedId));
        await db
            .update(hospitals)
            .set({ availableBeds: hospital.availableBeds - 1 })
            .where(eq(hospitals.id, params.id));

        await persistentACOService.reinforce({
            hospitalId: params.id,
            bedId,
            success: true,
        });

        return NextResponse.json({
            message: "Patient admitted successfully",
            assignedBed: bedId,
        });
    } catch (err) {
        console.error("Admit route error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
