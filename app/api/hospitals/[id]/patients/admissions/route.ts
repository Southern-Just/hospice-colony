import { db } from '@/lib/database/db';
import { patients } from '@/lib/database/schema';
import { NextResponse } from 'next/server';

import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = params.id; 

    const body = await req.json();
    const { name, gender, dateOfBirth } = body;

    if (!name || !gender || !dateOfBirth || !hospitalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPatient = {
      id: uuidv4(),
      hospitalId,
      bedId: body.bedId ?? null,
      name,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      location: body.location ?? null,
      contact: body.contact ?? null,
      idNumber: body.idNumber ?? null,
      healthCondition: body.healthCondition ?? null,
      admissionDate: new Date(),
      dischargeDate: null,
      nextOfKin: body.nextOfKin ?? null,
      insuranceProvider: body.insuranceProvider ?? null,
      insuranceNumber: body.insuranceNumber ?? null,
    };

    await db.insert(patients).values(newPatient);

    return NextResponse.json({ patient: newPatient }, { status: 201 });
  } catch (err: any) {
    console.error('POST /patients error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
