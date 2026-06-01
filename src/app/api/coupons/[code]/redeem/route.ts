import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isCouponExpired, isWithinDateRange } from '@/lib/coupon';
import { awardPoints } from '@/lib/loyalty';
import { createNotification } from '@/lib/notifications';

// POST /api/coupons/[code]/redeem - Redeem a coupon
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find coupon by code
    const coupon = await db.coupon.findUnique({
      where: { code },
      include: {
        hotel: {
          select: { name: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check status is 'active'
    if (coupon.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Coupon is not active', message: `Coupon status is: ${coupon.status}` },
        { status: 400 }
      );
    }

    // Check not expired
    if (isCouponExpired(coupon.expiresAt)) {
      await db.coupon.update({
        where: { id: coupon.id },
        data: { status: 'expired' },
      });
      return NextResponse.json(
        { success: false, error: 'Coupon has expired' },
        { status: 400 }
      );
    }

    // Check within date range (startTime/endTime)
    const now = new Date();
    if (!isWithinDateRange(coupon.startTime ?? undefined, coupon.endTime ?? undefined)) {
      return NextResponse.json(
        { success: false, error: 'Coupon is not valid for this date range', message: `This coupon is valid from ${coupon.startTime ? new Date(coupon.startTime).toLocaleDateString() : 'now'} to ${coupon.endTime ? new Date(coupon.endTime).toLocaleDateString() : 'expiry'}` },
        { status: 400 }
      );
    }

    // Update coupon: status = 'redeemed', redeemedAt = now
    const updatedCoupon = await db.coupon.update({
      where: { id: coupon.id },
      data: {
        status: 'redeemed',
        redeemedAt: now,
      },
      include: {
        hotel: {
          select: { name: true, city: true, country: true },
        },
      },
    });

    // Award +5 loyalty points to user (non-blocking)
    awardPoints(coupon.userId, 5, 'Coupon redeemed').catch(console.error);

    // Create notification for user
    await createNotification({
      userId: coupon.userId,
      type: 'coupon_redeemed',
      title: 'Coupon Redeemed!',
      body: `Your coupon for ${coupon.hotel.name} has been redeemed!`,
      link: '/dashboard/coupons',
    });

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
      message: 'Coupon redeemed successfully',
    });
  } catch (error) {
    console.error('POST /api/coupons/[code]/redeem error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem coupon' },
      { status: 500 }
    );
  }
}
