import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const favorites = await db.favorite.findMany({
      where: { userId: session.userId },
      include: { hotel: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 });
  }
}
