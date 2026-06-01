import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const loyaltyData = await db.loyaltyPoints.findMany({
      orderBy: { points: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: loyaltyData });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch loyalty data' }, { status: 500 }); }
}
