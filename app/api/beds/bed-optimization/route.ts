// app/api/bed-optimization/route.ts
import { optimizeBedArrangement } from "@/controller/bedOptimization.controller";
import { validateBeds } from "@/middleware/bedOptimization.middleware";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const beds = body?.beds ?? body;
        if (!validateBeds(beds)) {
            return NextResponse.json({ error: "Invalid beds payload" }, { status: 400 });
        }

        const optimized = optimizeBedArrangement(beds);

        return NextResponse.json(optimized);
    } catch (error) {
        console.error("Bed optimization error:", error);
        return NextResponse.json({ error: "Failed to optimize beds" }, { status: 500 });
    }
}
