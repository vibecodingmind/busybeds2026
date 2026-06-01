import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let prefs = await db.notificationPreference.findUnique({ where: { userId: session.userId } });
    if (!prefs) {
      prefs = await db.notificationPreference.create({ data: { userId: session.userId } });
    }

    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Notification prefs fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const prefs = await db.notificationPreference.upsert({
      where: { userId: session.userId },
      update: body,
      create: { userId: session.userId, ...body },
    });

    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Notification prefs update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update preferences' }, { status: 500 });
  }
}
