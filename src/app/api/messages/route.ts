import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');

    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: session.userId }, { receiverId: session.userId }],
        ...(hotelId ? { hotelId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const conversationMap = new Map();
    for (const msg of messages) {
      const otherUserId = msg.senderId === session.userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, msg);
      }
    }

    const conversations = Array.from(conversationMap.values());
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { receiverId, content, hotelId, stayRequestId, attachmentUrl } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const message = await db.message.create({
      data: { senderId: session.userId, receiverId, content, hotelId, stayRequestId, attachmentUrl },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
