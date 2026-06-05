import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/coupons/[code] - Find coupon by code (for redemption portal)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const coupon = await db.coupon.findUnique({
      where: { code },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            coverImage: true,
            tier: true,
            starRating: true,
            slug: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('GET /api/coupons/[code] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}
