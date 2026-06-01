import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const transactions = await db.transaction.findMany({ where: { status: 'completed' } });
    const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
    const stripeRevenue = transactions.filter(t => t.stripeChargeId).reduce((s, t) => s + t.amount, 0);
    const pesapalRevenue = transactions.filter(t => t.pesapalRef).reduce((s, t) => s + t.amount, 0);
    const refunds = await db.transaction.count({ where: { status: 'refunded' } });

    const activeSubscriptions = await db.subscription.count({ where: { status: 'active' } });
    const avgSubValue = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

    return NextResponse.json({
      success: true,
      data: { totalRevenue, stripeRevenue, pesapalRevenue, refunds, activeSubscriptions, mrr: avgSubValue * activeSubscriptions },
    });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch revenue' }, { status: 500 }); }
}
