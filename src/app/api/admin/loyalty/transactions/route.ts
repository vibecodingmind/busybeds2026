import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    if (!userId) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });

    const transactions = await db.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 }); }
}
