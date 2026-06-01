import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const status = request.nextUrl.searchParams.get('status');
    const where: Record<string, unknown> = {};
    if (status === 'pending') where.isApproved = false;
    else if (status === 'approved') where.isApproved = true;

    const reviews = await db.review.findMany({
      where,
      include: {
        hotel: { select: { name: true, city: true } },
        user: { select: { fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Admin reviews error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id, isApproved, ownerReply } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof isApproved === 'boolean') data.isApproved = isApproved;
    if (ownerReply !== undefined) { data.ownerReply = ownerReply; data.repliedAt = new Date(); }

    await db.review.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin review update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
