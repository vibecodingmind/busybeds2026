import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { endpoint, p256dh, auth } = await request.json();
    if (!endpoint) return NextResponse.json({ success: false, error: 'Endpoint required' }, { status: 400 });

    await db.pushSubscription.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, endpoint, p256dh, auth },
      update: { endpoint, p256dh, auth },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await db.pushSubscription.deleteMany({ where: { userId: session.userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
