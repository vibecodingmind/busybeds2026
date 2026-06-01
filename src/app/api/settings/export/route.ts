import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.userId } });
    const coupons = await db.coupon.findMany({ where: { userId: session.userId } });
    const reviews = await db.review.findMany({ where: { userId: session.userId } });
    const transactions = await db.transaction.findMany({ where: { userId: session.userId } });
    const favorites = await db.favorite.findMany({ where: { userId: session.userId } });

    return NextResponse.json({
      success: true,
      data: {
        profile: user,
        coupons,
        reviews,
        transactions,
        favorites,
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 });
  }
}
