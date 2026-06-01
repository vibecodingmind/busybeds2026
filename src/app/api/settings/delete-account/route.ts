import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await db.user.update({
      where: { id: session.userId },
      data: { isBanned: true, suspendedReason: 'Account deletion requested' },
    });

    return NextResponse.json({ success: true, message: 'Account marked for deletion' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to request deletion' }, { status: 500 });
  }
}
