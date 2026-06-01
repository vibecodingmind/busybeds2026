import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const broadcasts = await db.notification.findMany({
      where: { type: 'broadcast' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: broadcasts });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch broadcast history' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: notifBody, link, segment } = body;
    if (!title || !notifBody) return NextResponse.json({ success: false, error: 'Title and body required' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let users: { id: string }[] = [];

    if (segment === 'travelers') {
      users = await db.user.findMany({ where: { isBanned: false, role: 'traveler' }, select: { id: true } });
    } else if (segment === 'owners') {
      users = await db.user.findMany({ where: { isBanned: false, role: 'owner' }, select: { id: true } });
    } else if (segment === 'subscribers') {
      const subUsers = await db.subscription.findMany({ where: { status: 'active' }, select: { userId: true } });
      const subIds = new Set(subUsers.map(s => s.userId));
      const allActive = await db.user.findMany({ where: { isBanned: false }, select: { id: true } });
      users = allActive.filter(u => subIds.has(u.id));
    } else {
      // all users
      users = await db.user.findMany({ where: { isBanned: false }, select: { id: true } });
    }

    const notifications = users.map(u => ({ userId: u.id, type: 'broadcast', title, body: notifBody, link: link || null }));
    await db.notification.createMany({ data: notifications });

    return NextResponse.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to broadcast' }, { status: 500 }); }
}
