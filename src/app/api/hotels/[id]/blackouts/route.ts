import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const blackouts = await db.couponBlackout.findMany({ where: { hotelId: id }, orderBy: { startDate: 'asc' } });
    return NextResponse.json({ success: true, data: blackouts });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch blackouts' }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate, reason } = body;
    if (!startDate || !endDate) return NextResponse.json({ success: false, error: 'Dates required' }, { status: 400 });

    const blackout = await db.couponBlackout.create({ data: { hotelId: id, startDate, endDate, reason } });
    return NextResponse.json({ success: true, data: blackout }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to create blackout' }, { status: 500 }); }
}
