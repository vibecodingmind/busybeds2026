import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const earnings = await db.referralEarning.findMany({
      where: { referrerId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: earnings });
  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch earnings' }, { status: 500 });
  }
}
