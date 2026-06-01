import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { setupTOTP, generateBackupCodes } from '@/lib/twoFactor';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { twoFactorEnabled: true, email: true },
    });

    if (user?.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: '2FA is already enabled' }, { status: 400 });
    }

    const { secret, otpauthUrl } = setupTOTP(user!.email);
    const backupCodes = generateBackupCodes();

    // Store secret temporarily (not enabled yet)
    await db.user.update({
      where: { id: session.userId },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({
      success: true,
      data: { secret, otpauthUrl, backupCodes },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
