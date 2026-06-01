import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    if (!['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { ownerReply } = body;
    if (!ownerReply) return NextResponse.json({ success: false, error: 'Reply text required' }, { status: 400 });

    const review = await db.review.update({
      where: { id: params.id },
      data: { ownerReply, repliedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Review reply error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reply' }, { status: 500 });
  }
}
