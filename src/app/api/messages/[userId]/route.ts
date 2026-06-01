import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const otherUserId = userId;

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    await db.message.updateMany({
      where: { senderId: otherUserId, receiverId: session.userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}
