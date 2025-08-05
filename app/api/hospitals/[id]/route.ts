import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { hospitals } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hospitalId = params.id;

    const result = await db.select().from(hospitals).where(eq(hospitals.id, hospitalId));

    if (result.length === 0) {
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
    console.error('Error fetching hospital by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 });
  }
}
