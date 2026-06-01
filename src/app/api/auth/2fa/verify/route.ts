import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyTOTP } from '@/lib/twoFactor';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();
    if (!code || !userId) return NextResponse.json({ success: false, error: 'Code and userId required' }, { status: 400 });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true, id: true, email: true, role: true, tokenVersion: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: '2FA not enabled for this account' }, { status: 400 });
    }

    if (!verifyTOTP(user.twoFactorSecret, code)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    // Issue full session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('busybeds-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
