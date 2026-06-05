import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });

    const coupon = await db.coupon.findUnique({
      where: { code },
      include: {
        hotel: { select: { name: true, city: true, coverImage: true } },
      },
    });

    if (!coupon) return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        status: coupon.status,
        discountPercent: coupon.discountPercent,
        guestName: coupon.guestName,
        hotelName: coupon.hotel.name,
        hotelCity: coupon.hotel.city,
        hotelImage: coupon.hotel.coverImage,
        expiresAt: coupon.expiresAt,
        redeemedAt: coupon.redeemedAt,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
