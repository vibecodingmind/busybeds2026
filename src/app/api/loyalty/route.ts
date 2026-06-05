import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let loyalty = await db.loyaltyPoints.findUnique({ where: { userId: session.userId } });
    if (!loyalty) {
      loyalty = await db.loyaltyPoints.create({ data: { userId: session.userId } });
    }

    const transactions = await db.pointTransaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: { points: loyalty.points, lifetime: loyalty.lifetime, transactions } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch loyalty data' }, { status: 500 });
  }
}
