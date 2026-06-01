import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const payouts = await db.referralPayout.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch payouts' }, { status: 500 }); }
}
