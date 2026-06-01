import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where: any = {};
    if (session.role === 'traveler') {
      where.travelerId = session.userId;
    } else if (['owner', 'manager'].includes(session.role)) {
      const hotelOwner = await db.hotelOwner.findUnique({ where: { userId: session.userId } });
      const hotelManager = await db.hotelManager.findUnique({ where: { userId: session.userId } });
      const hotelId = hotelOwner?.hotelId || hotelManager?.hotelId;
      if (hotelId) where.hotelId = hotelId;
    }

    if (status) where.status = status;

    const stayRequests = await db.stayRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: stayRequests });
  } catch (error) {
    console.error('Stay requests fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stay requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { hotelId, roomTypeId, checkIn, checkOut, guests = 1, notes } = body;

    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights < 1) return NextResponse.json({ success: false, error: 'Invalid date range' }, { status: 400 });

    const stayRequest = await db.stayRequest.create({
      data: {
        travelerId: session.userId,
        hotelId,
        roomTypeId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        guests,
        notes,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, data: stayRequest }, { status: 201 });
  } catch (error) {
    console.error('Stay request create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create stay request' }, { status: 500 });
  }
}
