import { db } from '@/lib/database/db';
import { hospitals } from '@/lib/database/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { HOSPITAL_SPECIALTIES } from '@/lib/constants';

const HospitalSchema = z.object({
  name: z.string().min(1, "Hospital name is required"),
  location: z.string().min(1, "Location is required"),
  totalBeds: z.number().min(1, "Total beds must be at least 1"),
  availableBeds: z.number().min(0, "Available beds cannot be negative"),
  specialties: z.array(
    z.enum([...HOSPITAL_SPECIALTIES], {
      errorMap: () => ({ message: "Specialty must be a valid hospital specialty" }),
    })
  ),
  phone: z.string().min(1, "Phone number is required"),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Status must be either active or inactive" }),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = HospitalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const inserted = await db
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

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("POST hospital error:", error);
    return NextResponse.json(
      { error: "Failed to add hospital" },
      { status: 500 }
    );
  }
}
