import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Revenue stats
    const [totalRevenue, monthlyRevenue, lastMonthRevenue, totalTransactions, activeSubs, totalUsers, totalHotels, totalCoupons, totalRedemptions] = await Promise.all([
      db.transaction.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { status: 'completed', paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { status: 'completed', paidAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
      db.transaction.count({ where: { status: 'completed' } }),
      db.subscription.count({ where: { status: 'active' } }),
      db.user.count(),
      db.hotel.count(),
      db.coupon.count(),
      db.coupon.count({ where: { status: 'redeemed' } }),
    ]);

    // Revenue by payment method
    const stripeRevenue = await db.transaction.aggregate({ where: { status: 'completed', stripeInvoiceId: { not: null } }, _sum: { amount: true } });
    const paypalRevenue = await db.transaction.aggregate({ where: { status: 'completed', paypalOrderId: { not: null } }, _sum: { amount: true } });
    const pesapalRevenue = await db.transaction.aggregate({ where: { status: 'completed', pesapalRef: { not: null } }, _sum: { amount: true } });

    // Subscription distribution
    const subDistribution = await db.subscription.groupBy({
      by: ['packageId'],
      where: { status: 'active' },
      _count: { id: true },
    });

    // MRR calculation
    const mrr = monthlyRevenue._sum.amount || 0;
    const lastMrr = lastMonthRevenue._sum.amount || 0;
    const mrrGrowth = lastMrr > 0 ? ((mrr - lastMrr) / lastMrr * 100) : 0;

    // Churn rate (cancelled this month / active at start)
    const cancelled = await db.subscription.count({
      where: { status: 'cancelled', createdAt: { gte: startOfMonth } },
    });
    const churnRate = activeSubs > 0 ? (cancelled / activeSubs * 100) : 0;

    // Recent transactions
    const recentTransactions = await db.transaction.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { fullName: true, email: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: mrr,
        mrrGrowth: Math.round(mrrGrowth * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        activeSubscriptions: activeSubs,
        totalUsers,
        totalHotels,
        totalCoupons,
        totalRedemptions,
        totalTransactions,
        revenueByMethod: {
          stripe: stripeRevenue._sum.amount || 0,
          paypal: paypalRevenue._sum.amount || 0,
          pesapal: pesapalRevenue._sum.amount || 0,
        },
        subDistribution: subDistribution.map(s => ({ packageId: s.packageId, count: s._count.id })),
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
