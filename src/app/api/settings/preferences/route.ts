import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { language: true, timezone: true, displayCurrency: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const allowed = ['language', 'timezone', 'displayCurrency'];
    const updateData: any = {};
    for (const f of allowed) if (body[f] !== undefined) updateData[f] = body[f];

    await db.user.update({ where: { id: session.userId }, data: updateData });
    return NextResponse.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update preferences' }, { status: 500 });
  }
}
