import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { verifyTOTP } from '@/lib/twoFactor';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { code } = await request.json();
    if (!code) return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: '2FA is not enabled' }, { status: 400 });
    }

    if (!verifyTOTP(user.twoFactorSecret!, code)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    await db.user.update({
      where: { id: session.userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return NextResponse.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
