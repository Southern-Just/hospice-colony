import { NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { beds } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

// GET beds
export async function GET() {
    try {
        const allBeds = await db.select().from(beds);
        return NextResponse.json(allBeds);
    } catch (error) {
        console.error('Error fetching beds:', error);
        return NextResponse.json({ error: 'Failed to fetch beds' }, { status: 500 });
    }
}

// PUT beds (update positions/status)
export async function PUT(req: Request) {
    try {
        const updatedBeds = await req.json();
        if (!Array.isArray(updatedBeds)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        for (const bed of updatedBeds) {
            await db
                .update(beds)
                .set({
                    status: bed.status,
                    ward: bed.ward,
                    positionX: bed.position.x,
                    positionY: bed.position.y,
                })
                .where(eq(beds.id, bed.id));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating beds:', error);
        return NextResponse.json({ error: 'Failed to update beds' }, { status: 500 });
    }
}
