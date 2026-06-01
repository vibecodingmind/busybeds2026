import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { avatarUrl } = body;
    if (!avatarUrl) return NextResponse.json({ success: false, error: 'Avatar URL required' }, { status: 400 });

    const user = await db.user.update({
      where: { id: session.userId },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ success: true, data: { avatar: user.avatar } });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update avatar' }, { status: 500 });
  }
}
