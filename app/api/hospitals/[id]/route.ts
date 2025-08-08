import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { hospitals } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { verifyJwt } from '@/lib/jwt';
import { z } from 'zod';
import { SPECIALTIES } from '@/lib/constants';

// Zod schema for PATCH
const UpdateHospitalSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  phone: z.string().min(1),
  specialties: z.array(z.enum([...SPECIALTIES])),
  totalBeds: z.number().min(1),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await db.select().from(hospitals).where(eq(hospitals.id, params.id));
    if (!result.length) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const hospital = result[0];
    return NextResponse.json({
      ...hospital,
      specialties: Array.isArray(hospital.specialties)
          ? hospital.specialties
          : typeof hospital.specialties === 'string'
              ? hospital.specialties.split(',').map((s: string) => s.trim())
              : [],
    });
  } catch (error) {
    console.error('GET hospital error:', error);
    return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateHospitalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;

    await db
        .update(hospitals)
        .set({
          name: data.name,
          location: data.location,
          phone: data.phone,
          specialties: data.specialties,
          totalBeds: data.totalBeds,
        })
        .where(eq(hospitals.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH hospital error:', error);
    return NextResponse.json({ error: 'Failed to update hospital' }, { status: 500 });
  }
}
