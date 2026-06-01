import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (user) {
      await db.user.update({ where: { id: session.userId }, data: { tokenVersion: user.tokenVersion + 1 } });
    }

    return NextResponse.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to revoke session' }, { status: 500 });
  }
}
