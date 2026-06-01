import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hashPassword, comparePassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both passwords required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });

    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash, tokenVersion: user.tokenVersion + 1 },
    });

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 });
  }
}
