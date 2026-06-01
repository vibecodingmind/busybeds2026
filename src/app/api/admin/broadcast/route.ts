import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { title, body: notifBody, link, segment } = body;
    if (!title || !notifBody) return NextResponse.json({ success: false, error: 'Title and body required' }, { status: 400 });

    let users = await db.user.findMany({ where: { isBanned: false }, select: { id: true } });
    if (segment === 'subscribers') {
      const subUsers = await db.subscription.findMany({ where: { status: 'active' }, select: { userId: true } });
      const subIds = new Set(subUsers.map(s => s.userId));
      users = users.filter(u => subIds.has(u.id));
    }

    const notifications = users.map(u => ({ userId: u.id, type: 'broadcast', title, body: notifBody, link: link || null }));
    await db.notification.createMany({ data: notifications });

    return NextResponse.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to broadcast' }, { status: 500 }); }
}
