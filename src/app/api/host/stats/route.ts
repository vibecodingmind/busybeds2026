import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const hotelOwner = await db.hotelOwner.findUnique({ where: { userId: session.userId } });
    const hotelManager = await db.hotelManager.findUnique({ where: { userId: session.userId } });
    const hotelId = hotelOwner?.hotelId || hotelManager?.hotelId;

    if (!hotelId) return NextResponse.json({ success: false, error: 'No hotel assigned' }, { status: 404 });

    const totalCoupons = await db.coupon.count({ where: { hotelId } });
    const activeCoupons = await db.coupon.count({ where: { hotelId, status: 'active' } });
    const totalRedemptions = await db.coupon.count({ where: { hotelId, status: 'redeemed' } });
    const pendingReviews = await db.review.count({ where: { hotelId, isApproved: false } });
    const pendingStayRequests = await db.stayRequest.count({ where: { hotelId, status: 'pending' } });

    return NextResponse.json({
      success: true,
      data: { totalCoupons, activeCoupons, totalRedemptions, pendingReviews, pendingStayRequests, hotelId },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
