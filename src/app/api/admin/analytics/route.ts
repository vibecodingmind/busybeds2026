import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const totalUsers = await db.user.count();
    const activeSubscriptions = await db.subscription.count({ where: { status: 'active' } });
    const totalHotels = await db.hotel.count({ where: { status: 'active' } });
    const totalCoupons = await db.coupon.count();
    const totalRedemptions = await db.coupon.count({ where: { status: 'redeemed' } });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const recentTransactions = await db.transaction.findMany({ where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } } });
    const monthlyRevenue = recentTransactions.reduce((sum, t) => sum + t.amount, 0);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const usersToday = await db.user.count({ where: { createdAt: { gte: today } } });
    const couponsToday = await db.coupon.count({ where: { generatedAt: { gte: today } } });
    const redemptionsToday = await db.coupon.count({ where: { redeemedAt: { gte: today } } });

    return NextResponse.json({
      success: true,
      data: { totalUsers, activeSubscriptions, totalHotels, totalCoupons, totalRedemptions, monthlyRevenue, usersToday, couponsToday, redemptionsToday },
    });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 }); }
}
