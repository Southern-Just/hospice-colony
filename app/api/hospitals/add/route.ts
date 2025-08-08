import { db } from '@/lib/database/db';
import { hospitals } from '@/lib/database/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SPECIALTIES } from '@/lib/constants';

const HospitalSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  totalBeds: z.number().min(1),
  availableBeds: z.number().min(0),
  specialties: z.array(z.enum([...SPECIALTIES])),
  phone: z.string().min(1),
  status: z.enum(['active', 'inactive']),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = HospitalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
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
    console.error('POST hospital error:', error);
    return NextResponse.json({ error: 'Failed to add hospital' }, { status: 500 });
  }
}
