import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const hotelId = request.nextUrl.searchParams.get('hotelId');
    if (!hotelId) return NextResponse.json({ success: false, error: 'hotelId required' }, { status: 400 });

    const coupons = await db.coupon.findMany({
      where: { hotelId },
      include: { user: { select: { fullName: true } } },
      orderBy: { generatedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 }); }
}
