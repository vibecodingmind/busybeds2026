import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { referralCode: true, fullName: true },
    });

    if (!user?.referralCode) {
      // Generate referral code
      const code = `${user!.fullName.slice(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await db.user.update({ where: { id: session.userId }, data: { referralCode: code } });
      user!.referralCode = code;
    }

    const [referrals, earnings, payouts] = await Promise.all([
      db.referral.findMany({
        where: { referrerId: session.userId },
        orderBy: { createdAt: 'desc' },
      }),
      db.referralEarning.findMany({
        where: { referrerId: session.userId },
        orderBy: { createdAt: 'desc' },
      }),
      db.referralPayout.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    const confirmedEarnings = totalEarnings - pendingEarnings;

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals: referrals.length,
        totalEarnings,
        pendingEarnings,
        confirmedEarnings,
        referrals: referrals.slice(0, 20),
        earnings: earnings.slice(0, 20),
        payouts: payouts.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('Referral dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
