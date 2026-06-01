import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    if (status) where.status = status;

    const coupons = await db.coupon.findMany({
      where, orderBy: { generatedAt: 'desc' }, skip: (page - 1) * limit, take: limit,
    });
    const total = await db.coupon.count({ where });

    return NextResponse.json({ success: true, data: coupons, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 }); }
}
