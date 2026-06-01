import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const deals = await db.flashDeal.findMany({
      where: { isActive: true, endsAt: { gt: new Date() } },
      include: { hotel: { select: { name: true, city: true, coverImage: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: deals });
  } catch (error) {
    console.error('Flash deals fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch flash deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { hotelId, title, discountPercent, startsAt, endsAt } = body;
    if (!hotelId || !title || !discountPercent || !startsAt || !endsAt) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const deal = await db.flashDeal.create({
      data: { hotelId, title, discountPercent, startsAt: new Date(startsAt), endsAt: new Date(endsAt), createdBy: session.userId },
    });

    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (error) {
    console.error('Flash deal create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create flash deal' }, { status: 500 });
  }
}
