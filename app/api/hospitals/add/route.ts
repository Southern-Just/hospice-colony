import { NextRequest, NextResponse } from "next/server";
import { addHospital } from "@/lib/hospitalPartners.server";
import { z } from "zod";
import { NewHospital } from "@/lib/database/schema";

const hospitalSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  totalBeds: z.number().int().nonnegative(),
  availableBeds: z.number().int().nonnegative(),
  specialties: z.array(z.string().min(1)),
  phone: z.string().min(5).max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const formatted = {
      ...body,
      totalBeds: Number(body.totalBeds),
      availableBeds: Number(body.availableBeds),
      specialties: Array.isArray(body.specialties)
        ? body.specialties
        : typeof body.specialties === "string"
        ? body.specialties.split(",").map((s: string) => s.trim())
        : [],
    };

    const parsed = hospitalSchema.safeParse(formatted);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.format() }, { status: 400 });
    }

    const payload: NewHospital = parsed.data;
    await addHospital(payload);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Error adding hospital:", err);
    return NextResponse.json({ error: "Failed to add hospital" }, { status: 500 });
  }
}
